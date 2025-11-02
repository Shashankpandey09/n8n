import { Kafka } from "kafkajs";
import prisma from "@shashankpandey/prisma";
import { sendTelegram } from "./SendTelegram";
import dotenv from "dotenv";
import { FetchCred } from "../utils/FetchCreds";
import { sendEmail } from "./sendMail";
dotenv.config();

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
});
const consumer = kafka.consumer({ groupId: "test-group" });
export const producer = kafka.producer();

type Node = {
  id: string;
  type: string;
  parameters: any;
  credentials?: Array<string>;
  action: string;
};

export async function Init() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: "quickstart-events", fromBeginning: true });
  console.log("consumer got connected");

  await consumer.run({
    // disabling auto-commit so we only commit after successful processing
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      // Wrap whole handler so exceptions are caught
      try {
        const raw = message.value?.toString();
        if (!raw) {
          console.warn("empty message, skipping");
          return;
        }

        const payload = JSON.parse(raw);
        if (
          !payload.workflowId ||
          !payload.executionId ||
          !payload.ExecutionPayload
        ) {
          console.warn(
            "message missing workflowId or executionId or payload",
            payload
          );
          // committing offset to avoid reprocessing malformed message
          await consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
          return;
        }

        // loading workflow nodes
        const wf = await prisma.workflow.findUnique({
          where: { id: payload.workflowId },
          select: { nodes: true, userId: true },
        });

        const nodes = wf?.nodes as unknown as Node[] | undefined;
        if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
          console.warn("no nodes for workflow", payload.workflowId);
          await consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
          return;
        }

        // load previous tasks for this execution (so we know which nodes already ran)
        const prevTaskNodes = await prisma.executionTask.findMany({
          where: { executionId: payload.executionId },
          select: { nodeId: true },
        });

        const doneNodeIds = new Set(prevTaskNodes.map((p) => String(p.nodeId)));
        // find first node that is NOT present in prevTaskNodes
        const remainingNodes = nodes.filter((n) => !doneNodeIds.has(n.id));
        const nodeToExecute = remainingNodes.length ? remainingNodes[0] : null;

        if (!nodeToExecute) {
          console.log(
            "no remaining nodes to execute for execution",
            payload.executionId
          );
          // nothing to do; commit and exit
          await consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
          return;
        }

        // Attempt to register the node execution atomically (create task)
        // It's good to make (executionId, nodeId) unique in schema to avoid races.
        let task;
        try {
          task = await prisma.executionTask.create({
            data: {
              executionId: payload.executionId,
              nodeId: nodeToExecute.id,
              status: "RUNNING",
              attempts: 1,
            },
          });
        } catch (e: any) {
          // likely a unique constraint violation (another worker already created the task)
          console.warn(
            "could not create executionTask (maybe already exists):",
            e?.message || e
          );
          // commit and skip processing this node
          await consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
          return;
        }
        let ok = null;

        try {
          switch (nodeToExecute.type) {
            case "discord":
            
              //email message
              const { message } = JSON.parse(payload.ExecutionPayload);
               //discord message 
              const DiscMess = nodeToExecute.parameters?.message;
            
              const embed: any = {
                title: `Workflow: ${payload.workflowId}`,

                fields: [
         
                  {
                    name: "Execution ID",
                    value: String(payload.executionId),
                    inline: true,
                  },
                  {
                    name: "Node ID",
                    value: String(nodeToExecute.id),
                    inline: true,
                  },
                  {
                    name: "Node Action",
                    value: nodeToExecute.action ?? nodeToExecute.type,
                    inline: true,
                  },
                ],
                timestamp: new Date().toISOString(),
              };
              if (DiscMess){
                embed.fields.push({
                  name:'Fixed discord message',
                  value:DiscMess,
                  inline:true
                })
              }
              if(message){
                embed.fields.push({
                  name:'email Reply',
                  value:`${message.reply} 
                  
                  repliedTo: ${message.repliedTo} `
                })
              }
              if (wf?.userId) {
                embed.fields.push({
                  name: "User ID",
                  value: String(wf.userId),
                  inline: true,
                });
              }
              ok = await sendTelegram(process.env.DISCORD_WEBHOOK!, {
                embeds: [embed],
              });
              break;

            case "smtp":
              console.log(nodeToExecute.parameters);
              const { to, from, body, subject } = nodeToExecute.parameters;
              const credential = await FetchCred("smtp", 1 || wf?.userId!);
              if (credential) {
                ok = await sendEmail(
                  to,
                  from,
                  body,
                  wf?.userId!,
                  nodeToExecute.action,
                  payload.workflowId,
                  payload.executionId,
                  nodeToExecute.id,
                  subject
                );
              }
              break;

            default:
              console.log("unknown node type:", nodeToExecute.type);
              break;
          }

          // mark task success
          if (ok) {
            await prisma.executionTask.update({
              where: { id: task.id },
              data: { status: "SUCCESS", finishedAt: new Date() },
              //i need to push The workflow id and execution id
            });
            await producer.send({
              topic: "workflows",
              messages: [{ value: JSON.stringify(payload) }],
            });
          }
        } catch (execErr) {
          console.error("node execution failed:", execErr);
          // mark task failed and allow retries
          await prisma.executionTask.update({
            where: { id: task.id },
            data: {
              status: "FAILED",
              attempts: { increment: 1 },
            },
          });
          // don't commit the offset if you want the message reprocessed later,
          // but here we commit to avoid blocking pipeline; consider your retry strategy.
          await consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
          return;
        }

        // Success: commit offset so Kafka moves forward
        await consumer.commitOffsets([
          { topic, partition, offset: (Number(message.offset) + 1).toString() },
        ]);
      } catch (outerErr) {
        console.error("unexpected handler error:", outerErr);
        // On catastrophic error, don't commit offset to allow reprocessing (or decide policy)
        // Optionally add a small delay to avoid tight crash loops:
        await new Promise((r) => setTimeout(r, 2000));
      }
    },
  });
}
