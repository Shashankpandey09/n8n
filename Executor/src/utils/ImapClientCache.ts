import { LRUCache } from "lru-cache";
import { ImapFlow } from "imapflow";

type ImapEntry = { client: ImapFlow };

export const cache = new LRUCache<string, ImapEntry>({
  max: 200,
  ttl: (1000*60*5-1) ,
  dispose: async (value, key) => {
    console.log(`Disposing of IMAP client for key: ${key}`);
    if (value.client.usable) {
      await value.client.logout();
      cache.delete(key)
    }
  },
});
export async function getOrCreateImapClient(
  userID: number,
  creds: {
    EMAIL_USER: string;
    EMAIL_PASS: string;
  }
) {
  //creating key
  const key = `imap:${userID}`;
  const entry = cache.get(key);
  if (!entry?.client) {
   
    //if no valid client found create a new one
    console.log(`creating new Imap client`);
    const client = new ImapFlow({
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      auth: {
        user: creds.EMAIL_USER,
        pass: creds.EMAIL_PASS, 
      },
      logger:false
    });
    await client.connect()
    if(client.usable){
        cache.set(key,{client})
    }
    return client
  }
   try {
      await entry.client.noop(); //doing health check
      //if the client exist then return
      console.log(`Reusing active IMAP client for ${key}`);
      return entry.client;
    } catch (error) {
      console.warn(
        `Cached client for ${key} failed Noop check. Reconnecting`,
        error
      );
      cache.delete(key);
    }
}
