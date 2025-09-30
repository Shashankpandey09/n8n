// src/ImapListeners.ts
import prisma from "@shashankpandey/prisma";
import { cache, getOrCreateImapClient } from "../utils/ImapClientCache";
import { simpleParser, ParsedMail } from "mailparser";
import { ImapFlow } from "imapflow";
import { Kafka } from "kafkajs";
import { FetchCred } from "../utils/FetchCreds";
import { CredManager } from "../utils/CredManager";

const kafka = new Kafka({ clientId: "Imap", brokers: ["localhost:9092"] });
const producer = kafka.producer();
type uuidType = {
  messageId: string;
  id: number;
};

// This function now correctly identifies replies and ignores other emails.
async function processMailAndResume(
  source: Buffer,
  userId: number,
  messageId: string
) {
  try {
    const parsed: ParsedMail = await simpleParser(source);
    const inReplyTo = parsed.inReplyTo;
    console.log("parsed_TEXT----->", parsed.text);
    console.log("pased HTML------>", parsed.html);

    // If this header doesn't exist, it's not a reply we are looking for.
    if (!inReplyTo) {
      console.log("no inreplyID");
      return; // Gracefully ignore the email.
    }
    console.log("reached");
    // Find the waiting workflow using the In-Reply-To value, scoped by the user.
    const waitEntry = await prisma.emailWait.findFirst({
      where: {
        messageId: messageId,
        userId: userId,
        status: "WAITING",
      },
    });

    // If no match is found, it's a reply to an email we aren't waiting for.
    if (!waitEntry) {
      return; // Gracefully ignore.
    }

    console.log(
      `Matched reply to waiting workflow! Resuming execution ID: ${waitEntry.executionId}`
    );

    // Update the EmailWait status using its unique ID to prevent reprocessing.
    await prisma.emailWait.update({
      where: { id: waitEntry.id },
      data: { status: "REPLIED" },
    });

    const resumePayload = {
      workflowId: waitEntry.workflowId,
      executionId: waitEntry.executionId,
      ExecutionPayload: JSON.stringify({
        message:
          typeof parsed.text === "string" && parsed.text.length > 0
            ? parsed.text
            : "",
      }),
    };

    // Send to Kafka to resume the workflow.
    await producer.send({
      topic: "workflows",
      messages: [{ value: JSON.stringify(resumePayload) }],
    });

    console.log(`✅ Resumed workflow ${waitEntry.workflowId}`);
    return true;
  } catch (error) {
    console.error("Error in processMailAndResume:", error);
  }
}

// This function now correctly loops through all new messages.
async function fetchAndProcessUnseen(client: ImapFlow, userId: number,startup:boolean=false) {
  try {
  await client.mailboxOpen("INBOX", { readOnly: false });
    // const uids = await client.search({ seen: false });
    // if (!uids) return;

    //getting all the message id the user is waiting for
    const waitingEmails = await prisma.emailWait.findMany({
      where: { status: "WAITING", userId },
      select: {
        id: true,
        messageId: true,
        executionId: true,
        workflowId: true,
      },
    });
    //creating a set of message id the user is waiting for
    const WaitingMessageIds = new Set(waitingEmails.map((w) => w.messageId));
    if (WaitingMessageIds.size === 0) {
      console.log(`User ${userId} is not waiting for any replies. Skipping.`);
      return;
    }

    // if the user is waiting for replies then initially fetch the in reply to headers
    const uids = await client.search({
      seen: false,
      since: startup?new Date(Date.now() - 1000*24*3600):new Date(Date.now() - 10000*6)
    });
    //printing uuids
     console.log(uids)
    if (!uids || uids.length === 0) {
     
      console.log("no uuid found");
      return;
    }

    console.log(`Found ${uids.length} unseen messages for user ${userId}.`);
    const messageIdToProcess: uuidType[] = [];
    const uuidsToProcess: number[] = [];
    const UIDs: number[] = [];
    for await (const message of client.fetch(uids, {
      uid: true,
      headers: ["in-reply-to"],
    })) {
      const rawInReplyTo = message.headers?.toString();
      const messageId = rawInReplyTo?.split(":")[1]?.trim();
      const id = Number(message.seq);
      //    const id=cleanMessageId(messageId!)
      if (messageId && WaitingMessageIds.has(messageId) && id) {
        // again checking if this is the message id the user is waiting for
        messageIdToProcess.push({ messageId, id });
        uuidsToProcess.push(id);
        UIDs.push(message.uid);
        console.log(message.uid)
      }
    }
    console.log("uuuuids--->", uuidsToProcess);
    console.log("messageID----->", messageIdToProcess);
    if (uuidsToProcess.length === 0) {
      console.log("No matching unseen replies found among unseen emails.");
      return;
    }
   
    // now fetching source for these uuids
    for await (const msg of client.fetch(uuidsToProcess, { source: true })) {
      console.log(" before reached fetch");
      if (msg.source) {
        console.log("reached fetch");
        const message = messageIdToProcess.find(
          (e) => e.id === Number(msg.seq)
        );
        console.log(message?.id)
        await processMailAndResume(msg.source, userId, message?.messageId!);
      }
    }

    // // Mark all processed messages as seen.
    if (UIDs.length > 0) {
      await client.messageFlagsAdd(UIDs, ["\\Seen"], { uid: true });
      console.log("marked seen");
    }
    console.log("marked seen");
  } catch (error) {
    console.error(`Error fetching unseen mail for user ${userId}:`, error);
  }
}

async function startListening(wait: { userId: number }) {
  const userId = wait.userId;
  if (cache.has(`imap:${userId}`)) {
    return;
  }

  try {
    const ok = await FetchCred("smtp", userId);
    let cred;
    if (ok) {
      cred = CredManager.getInstance().getCred("smtp");
    } else {
      console.warn(`Could not fetch credentials for user ${userId}`);
      return;
    }

    const client = await getOrCreateImapClient(userId, cred);
    if (!client) return;
    await client.mailboxOpen("INBOX");
    
    const existsHandler = async () => {
      console.log(`📬 New mail detected for user ${userId} `);
      await fetchAndProcessUnseen(client, userId);
    };

    client.on("exists", existsHandler);
    console.log(`👂 Started IMAP listener for user ${userId}`);

    // Process any emails that arrived while the service was offline.
    await fetchAndProcessUnseen(client, userId,true);
  } catch (error) {
    console.error(`Failed to start listener for user ${userId}:`, error);
  }
}

export async function InitImap() {
  await producer.connect();
  console.log("📬 Mailroom service starting...");
  while (true) {
    try {
      // Find distinct users who are waiting for an email.
      const waitingUsers = await prisma.emailWait.findMany({
        where: { status: "WAITING" },
        distinct: ["userId"],
        select: { userId: true },
        take: 100,
      });

      if (waitingUsers.length > 0) {
        await Promise.all(waitingUsers.map((u) => startListening(u)));
      }

      // This polling loop is for finding NEW users who need a listener.
      // It will check every 30 seconds.
      await new Promise((r) => setTimeout(r, 30000));
    } catch (error) {
      console.error("Error in InitImap main loop:", error);
      await new Promise((r) => setTimeout(r, 30000)); // Wait before retrying
    }
  }
}
