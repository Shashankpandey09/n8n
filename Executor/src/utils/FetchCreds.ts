import prisma from "@shashankpandey/prisma";
import { decryptObjectWithKeyBase64 } from "./DecryptCred";
import dotenv from "dotenv";
import { CredManager } from "./CredManager";

dotenv.config();

//rn just calling db rn in future we can cache in memory by making backend stateful or using redis

export async function FetchCred(nodeName: string, userID: number) {
  // if(nodeName==='smtp'&& CredManager.getInstance().transporterCacheGet(userID)){
  //   console.log('saved from a db call')
  //   return true
  // }
  try {
    const credentials = await prisma.credential.findUnique({
      where: {
        ownerId_platform: {
          platform: nodeName,
          ownerId: userID,
        },
      },
      select: {
        data: true,
      },
    });
    if (!credentials) {
      return false;
    }

    const cred = decryptObjectWithKeyBase64(
      process.env.ENCRYPTION_KEY,
      credentials.data
    );
    CredManager.getInstance().setCred(cred, nodeName);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
