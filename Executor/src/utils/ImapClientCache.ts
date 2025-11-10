import { LRUCache } from "lru-cache";
import { ImapFlow } from "imapflow";

type ImapEntry = { client: ImapFlow };

export const cache = new LRUCache<string, ImapEntry>({
  max: 500,
  ttl: 1000 * 60 * 5,
  disposeAfter: async (value, key) => {
    console.log(`Disposing of IMAP client for key: ${key}`);
    if (value?.client?.usable) {
      try { await value.client.logout(); } catch {}
    }
  },
});

async function createClient(key: string, creds: { EMAIL_USER: string; EMAIL_PASS: string }) {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user: creds.EMAIL_USER, pass: creds.EMAIL_PASS },
    logger: false,
  });
  client.once("error", () => cache.delete(key));
  client.once("close", () => cache.delete(key));
  await client.connect();
  if (!client.usable) {
    try { await client.logout(); } catch {}
    throw new Error("IMAP client unusable after connect");
  }
  cache.set(key, { client });
  return client;
}

export async function getOrCreateImapClient(
  userID: number,
  creds: { EMAIL_USER: string; EMAIL_PASS: string }
): Promise<ImapFlow> {
  const key = `imap:${userID}`;
  const entry = cache.get(key);

  if (entry?.client) {
    try {
      await entry.client.noop();
      console.log(`Reusing active IMAP client for ${key}`);
      return entry.client;
    } catch {
      console.warn(`Cached client for ${key} failed NOOP. Reconnecting`);
      cache.delete(key);
    }
  }

  console.log(`creating new Imap client`);
  try {
    return await createClient(key, creds);
  } catch (err: any) {
    if (err?.authenticationFailed) {
      console.error(`Authentication failed for ${key}`);
    }
    throw err;
  }
}
