import { Router, Request, Response } from "express";
import Authenticate from "../middleware/Authenticate";
import prisma from "@shashankpandey/prisma";
import { Singleton } from "../utils/singeltonKafka";


const NodeRouter = Router();

NodeRouter.get("/get", Authenticate, async (req: Request, res: Response) => {
  try {
    const { nodeData } = req.query;
    console.log(nodeData)
//node data is nodeId
    if (!nodeData || typeof nodeData !== "string") {
      return res.status(400).json({ error: "NodeId is required" });
    }
  
    const node =await prisma.executionTask.findFirst({
      where:{
        nodeId:nodeData,
        startedAt:{
          lt: new Date()
        }
      },
      select:{
        input:true,
        output:true,
        error:true,
      }
    })
    
     console.log(node)
    return res.status(200).json({
      message: "Node data fetched successfully",
      data: node,
    });
  } catch (error: any) {
    console.error("Error fetching node:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

NodeRouter.post("/testNode", Authenticate, async (req: Request, res: Response) => {
  try {
    const { workflowId, nodeId, ExecutionPayload } = req.body;

    if (!workflowId || !nodeId) {
      return res.status(400).json({ error: "workflowId and nodeId are required" });
    }

    // 1️⃣ Create a new execution for this single-node test
    const execution = await prisma.execution.create({
      data: {
        workflowId,
        status: "RUNNING",
       createdAt: new Date(),
      },
    });

    // 2️⃣ Prepare message for Kafka
    const message = {
      workflowId,
      executionId: execution.id,
      ExecutionPayload: JSON.stringify("Testing"),
      targetNodeId: nodeId,
      isTest: true,
    };

    // 3️⃣ Push to Kafka
    await Singleton.getProducer().send({
      topic: "quickstart-events",
      messages: [{ value: JSON.stringify(message) }],
    });

    // 4️⃣ Respond to client
    return res.status(200).json({
      message: "Single node test started successfully",
      executionId: execution.id,
    });
  } catch (error: any) {
    console.error("Error in /testNode:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
export default NodeRouter;