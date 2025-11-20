import { Router, Request, Response } from "express";
import Authenticate from "../middleware/Authenticate";
import prisma from "@shashankpandey/prisma";
import { Singleton } from "../utils/singeltonKafka";
import { ExtendedReq } from "./workflow";
import { validate } from "../utils/validate";

const NodeRouter = Router();

NodeRouter.get("/get", Authenticate, async (req: Request, res: Response) => {
  try {
    const { nodeData } = req.query;
    //node data is nodeId
    if (!nodeData || typeof nodeData !== "string") {
      return res.status(400).json({ error: "NodeId is required" });
    }

    const node = await prisma.executionTask.findFirst({
      where: {
        nodeId: nodeData,
      },
      orderBy: {
        finishedAt: "desc",
      },
      select: {
        input: true,
        output: true,
        error: true,
        status: true,
      },
    });

    console.log(node);
    return res.status(200).json({
      message: "Node data fetched successfully",
      data: node,
    });
  } catch (error: any) {
    console.error("Error fetching node:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

NodeRouter.post(
  "/testNode",
  Authenticate,
  async (req: Request, res: Response) => {
    try {
      const { workflowId, nodeId } = req.body;

      if (!workflowId || !nodeId) {
        return res
          .status(400)
          .json({ error: "workflowId and nodeId are required" });
      }
      const testNode = await prisma.workflow.findUnique({
        where: {
          id: Number(workflowId),
        },
        select: {
          nodes: true,
        },
      });
      if (!testNode) {
        return res.status(404).json({
          error: "Workflow does not exist",
        });
      }
      const validationNode = (testNode?.nodes as unknown as any[]).find(
        (c) => String(c.id) === String(nodeId)
      );
   
      const { missingParams, missingCredId, valid } = validate([validationNode]);
     
      if (!valid) {
        return res.status(404).json({
          missingParams,
          missingCredId,
          ok: false,
        });
      }
    
    
      const execution = await prisma.execution.create({
        data: {
          workflowId: Number(workflowId),
          status: "RUNNING",
          createdAt: new Date(),
        },
      });

      const message = {
        workflowId,
        executionId: execution.id,
        ExecutionPayload: JSON.stringify("Testing"),
        targetNodeId: nodeId,
        isTest: true,
      };
      const producer = await Singleton.getInstance().getProducer();
      //  Pushing to kafka to Kafka
      await producer.send({
        topic: "quickstart-events",
        messages: [{ value: JSON.stringify(message) }],
      });

      return res.status(200).json({
        message: "Single node test started successfully",
        executionId: execution.id,
      });
    } catch (error: any) {
      console.error("Error in /testNode:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
NodeRouter.delete(
  "/TestData",
  Authenticate,
  async (req: ExtendedReq, res: Response) => {
    try {
      const { nodeID } = req.query;

      if (!nodeID || typeof nodeID !== "string") {
        return res.status(400).json({ error: "NodeId is required" });
      }
      const newData = await prisma.$transaction(async (ctx) => {
        const execId = await ctx.executionTask.findFirst({
          where: {
            nodeId: nodeID,
          },
          orderBy: {
            startedAt: "desc",
          },
          select: {
            id: true,
          },
        });
        let DeletedNode = await ctx.executionTask.delete({
          where: {
            id: execId?.id,
          },
          select: {
            error: true,
          },
        });
        const deletedDate = {
          ...DeletedNode,
          error: null,
          input: null,
          output: null,
        };
        return deletedDate;
      });
      return res.json({
        message: "Deleted successfully ",
        data: newData,
      });
    } catch (error) {
      return res.json({
        Error: error,
        message: "error while deleting testData",
      });
    }
  }
);
export default NodeRouter;
