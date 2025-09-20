import { Router, Request, Response } from "express";
import { createWorkflow } from "../services/createworkflow";
import dotenv from 'dotenv'
dotenv.config()
export const WorkFlowRouter = Router();

export interface ExtendedReq extends Request {
  userId?: number;
}

WorkFlowRouter.post("/", async (req: ExtendedReq, res: Response) => {
  try {
    const userId = req.userId||1;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized: no userId" });
    }

    const body = req.body;
    const result = await createWorkflow(userId, body);

    // If your service returns structured responses with ok: true/false
    if (result.ok === false) {
      return res.status(400).json(result); // bad request due to validation issues
    }

    // ok: true → workflow created (maybe runnable or draft)
    return res.status(201).json(result);
  } catch (err: any) {
    console.error("Error creating workflow:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});
