import { Router, Request, Response } from "express";
import Authenticate from "../middleware/Authenticate";
import prisma from "@shashankpandey/prisma";


const NodeRouter = Router();

NodeRouter.get("/get", Authenticate, async (req: Request, res: Response) => {
  try {
    const { nodeData } = req.query;
//node data is nodeId
    if (!nodeData || typeof nodeData !== "string") {
      return res.status(400).json({ error: "NodeId is required" });
    }
    // Fetch node from DB
    const node =await prisma.executionTask.findFirst({
      where:{
        nodeId:nodeData
      },
      select:{
        input:true,
        output:true,
        error:true,
      }
    })
    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    return res.status(200).json({
      message: "Node data fetched successfully",
      data: node,
    });
  } catch (error: any) {
    console.error("Error fetching node:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default NodeRouter;