import { Router, Response } from "express";
import { ExtendedReq } from "./workflow";
import dotenv from "dotenv";
import { encryptObjectWithKeyBase64 } from "../utils/encryptCred";
import prisma from "@shashankpandey/prisma";
dotenv.config();
export const CredRouter = Router();

CredRouter.post("/", async (req: ExtendedReq, res: Response) => {
  try {
    const userId = req.userId || 1;
    const { name, credential } = req.body;
    //encrypting creds
    const credBlob = encryptObjectWithKeyBase64(
      process.env.ENCRYPTION_KEY,
      credential
    );
    //creating cred for the platform
    const cred = await prisma.credential.create({
      data: {
        ownerId: userId,
        platform: name,
        data: credBlob,
      },
      select: {
        id: true,
        platform: true,
      },
    });

    return res.status(200).json({ message: cred, ok: true });
  } catch (error: any) {
    throw new Error("error while creating cred " + req.body.type, error);
  }
});
