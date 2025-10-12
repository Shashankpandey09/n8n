import { Router, Response } from "express";
import { ExtendedReq } from "./workflow";
import dotenv from "dotenv";
import { encryptObjectWithKeyBase64 } from "../utils/encryptCred";
import prisma from "@shashankpandey/prisma";
import Authenticate from "../middleware/Authenticate";
dotenv.config();
export const CredRouter = Router();

CredRouter.post("/", Authenticate, async (req: ExtendedReq, res: Response) => {
  try {
    const userId = req.userId || 1;
    const { name, credential } = req.body;
    //encrypting creds
    const credBlob = encryptObjectWithKeyBase64(
      process.env.ENCRYPTION_KEY,
      credential
    );
    //creating cred for the platform
    const cred = await prisma.credential.upsert({
     where:{
      ownerId_platform:{
        ownerId:userId,
        platform:name
      }
     },
     update:{
      data:credBlob
     },
     create:{
      ownerId:userId,
      data:credBlob,
      platform:name
     }
    });

    return res.status(200).json({ message: cred, ok: true });
  } catch (error: any) {
    console.log(error)
    throw new Error("error while creating cred " + req.body.type, error);
  }
});
CredRouter.delete(
  "/delete",
  Authenticate,
  async (req: ExtendedReq, res: Response) => {
    try {
      const userId = req.userId;
      const platform = req.query.platform as string;

      if (!userId || !platform) {
        return res.status(400).json({
          message: "Either userId or platform name is missing",
        });
      }

      const result = await prisma.credential.delete({
        where: {
          ownerId_platform:{
             platform: platform,
          ownerId: userId,
          }
        },
      });

      if (!result) {
        return res
          .status(404)
          .json({ message: "No such credential found to delete" });
      }

      return res
        .status(200)
        .json({ message: "Credential deleted successfully" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({
          message: "Internal server error while deleting credential",
          error,
        });
    }
  }
); 
