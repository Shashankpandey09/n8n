import { Router, Response } from "express";
import { ExtendedReq } from "./workflow";
import uuid4 from "uuid4";
import { z } from "zod";
import prisma from "@shashankpandey/prisma";
import Authenticate from "../middleware/Authenticate";
export const WebhookRouter = Router();
const webhookSchema = z.object({
  path: z.string().min(3, "Path must be atleast of 3 char length"),
  secret: z.string().optional(),
  method: z.string().default("POST"),
});
type Para = {
  name: string;
  type: string;
  required: boolean;
};
type Node = {
  id: number;
  type: string;
  parameters: Para[];
  credentials?: Array<{ name: string; required: boolean }>;
};
//webhook creation for a particular workflowId
//external services hitting the webhook which may use diff method which results in the execution of the workflow
WebhookRouter.get(
  "/create/:workflowId",
  Authenticate,
  async (req: ExtendedReq, res: Response) => {
    try {
      const userId = req.userId || 1;
      const workflowId = Number(req.params.workflowId);
      // const parsedData=webhookSchema.safeParse(req.body)
      // if(!parsedData.success){
      //   return
      // }
      const Webhook = await prisma.webhook.findFirst({
        where: {
          workflowId: workflowId,
          workflow: {
            userId: userId,
          },
        },
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
          .json({ message: "Webhook created", webhook: webhook });
      }
      return res
        .status(200)
        .json({ message: "existing Webhook", webhook: Webhook });
    } catch (error: any) {
      throw new Error("Error while creating webhook", error);
    }
  }
);
WebhookRouter.all(
  "/handle/:path",
  Authenticate,
  async (req: ExtendedReq, res: Response) => {
    try {
      const path = req.params.path;
      const payload: any = req.body;
      const webhook = await prisma.webhook.findUnique({
        where: { path: path },
        select: {
          workflowId: true,
          method: true,
          secret: true,
          workflow: {
            select: { enabled: true },
          },
        },
      });
      if (!webhook || !webhook.workflow.enabled) {
        return res
          .status(400)
          .json({
            message: "Webhook does not exist or workflow is not enabled",
          });
      }
      //create an execution with transactional outbox pattern and also make and entry in the execution_taskTable
      await prisma.$transaction(async (ctx) => {
        const Exec = await ctx.execution.create({
          data: {
            workflowId: webhook.workflowId,
            status: "RUNNING",
            input: payload,
          },
          include: {
            workflow: {
              select: {
                nodes: true,
              },
            },
          },
        });
        //extracting the very first node which is supposed to be trigger
        const nodes = (Exec.workflow.nodes as Node[]) || undefined;
        const triggerNode = Array.isArray(nodes)
          ? nodes.find((n) => n.type == "webhook")
          : undefined;
        if (!triggerNode) {
          await ctx.execution.update({
            where: { id: Exec.id },
            data: { status: "FAILED" },
          });
          throw new Error("trigger node not found");
        }
        const nodeID = triggerNode.id;
        await ctx.executionTask.create({
          data: {
            nodeId: nodeID.toString(),
            executionId: Exec.id,
            status: "SUCCESS",
            attempts: 0,
            input:payload,
            output:payload,
            startedAt:new Date(),
            finishedAt:new Date()
          },
        });
        await ctx.outbox.create({
          data: {
            workflowId: Exec.workflowId,
            executionId: Exec.id,
            ExecutionPayload: JSON.stringify(payload),
          },
        });
      });
      res.status(200).json({ message: "Webhook executed" });
    } catch (error: any) {
      console.log(error);
      throw new Error(
        `error while triggering webhook with path ${req.params.path}`,
        error
      );
    }
  }
);

WebhookRouter.all(
  "/handle/test/:path",
  async (req: ExtendedReq, res: Response) => {
    try {
      const pathParam = req.params.path;
      const payload: any = req.body;
      const webhook = await prisma.webhook.findUnique({
        where: { path: pathParam },
        select: {
          workflowId: true,
          workflow: {
            select: {
              enabled: true,
            },
          },
        },
      });
     
      if (!webhook) {
        return res
          .status(400)
          .json({
            message: "Webhook does not exist or workflow is not enabled",
          });
      }

      await prisma.$transaction(async (ctx) => {
        const Exec = await ctx.execution.create({
          data: {
            workflowId: webhook.workflowId,
            status: "RUNNING",
            input: payload,
          },
          include: {
            workflow: {
              select: {
                nodes: true,
              },
            },
          },
        });
        const nodes = Exec.workflow.nodes as unknown as Node[] | undefined;
        const triggerNode = Array.isArray(nodes)
          ? nodes.find((n) => n.type === "webhook")
          : undefined;

        if (!triggerNode) {
          await ctx.execution.update({
            where: { id: Exec.id },
            data: { status: "FAILED" },
          });
          throw new Error("trigger node not found");
        }

        const nodeID = String(triggerNode.id);
        await ctx.executionTask.create({
          data: {
            nodeId: nodeID,
            executionId: Exec.id,
            status: "SUCCESS",
            attempts: 0,
            output: payload,
            startedAt: new Date(),
            finishedAt:new Date()
          },
        });
      });

      return res
        .status(200)
        .json({ message: "Webhook test recorded", payload });
    } catch (error: any) {
      console.error("error in test webhook handler:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);