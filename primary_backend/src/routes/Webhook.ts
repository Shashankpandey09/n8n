import { Router, Response } from "express";
import { ExtendedReq } from "./workflow";
import uuid4 from "uuid4";
import { z } from "zod";
import prisma from "@shashankpandey/prisma";
export const WebhookRouter = Router();
const webhookSchema = z.object({
  path: z.string().min(3, "Path must be atleast of 3 char length"),
  secret: z.string().optional(),
  method: z.string().default("POST"),
});
//webhook creation for a particular workflowId
//external services hitting the webhook which may use diff method which results in the execution of the workflow
WebhookRouter.get(
  "/create/:workflowId",
  async (req: ExtendedReq, res: Response) => {
    try {
      const userId = req.userId || 1;
      const workflowId = Number(req.params.workflowId);
      // const parsedData=webhookSchema.safeParse(req.body)
      // if(!parsedData.success){
      //   return
      // }
      const Webhook = await prisma.webhook.findFirst({
        where: { workflowId: workflowId },
      });
      if (!Webhook) {
        //create a webhook
        const path = uuid4();
        const webhook = await prisma.webhook.create({ 
          data: {
            workflowId: workflowId,
            path: path,
            method: "POST",
          },
        });
        return res
          .status(200)
          .json({ message: "Webhook created", webhook: Webhook });
      }
      return res
        .status(200)
        .json({ message: "existing Webhook", webhook: Webhook });
    } catch (error: any) {
      throw new Error("Error while creating webhook", error);
    }
  }
);
WebhookRouter.post('/handle/:path',async(req:ExtendedReq,res:Response)=>{
try {
   const path=req.params.path
   const webhook=await prisma.webhook.findUnique({
   where:{path:path},
   select:{
        workflowId:true,
        method:true,
        secret:true
    }
   })
   if(!webhook){
  return res.status(400).json({message:'Webhook does not exist'})
   }
   //create an execution with transactional outbox pattern
   
} catch (error:any) {
    throw new Error(`error while triggering webhook with path ${req.params.path}`,error)
}

})
