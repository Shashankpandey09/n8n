import { Router, Request, Response } from "express";
import { createWorkflow } from "../services/createworkflow";
import dotenv from "dotenv";
import Authenticate from "../middleware/Authenticate";
import prisma from "@shashankpandey/prisma";
import { validate } from "../utils/validate";
import { structuralTypes } from "../Constants";
dotenv.config();
export const WorkFlowRouter = Router();

export interface ExtendedReq extends Request {
  userId?: number;
}

WorkFlowRouter.post(
  "/",
  Authenticate,
  async (req: ExtendedReq, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ ok: false, message: "Unauthorized: no userId" });
      }

      const body = req?.body;
      const result = await createWorkflow(userId, body);

      //  service returns structured responses with ok: true/false
      if (result.ok === false) {
        return res.status(400).json(result); // bad request due to validation issues
      }

      // ok: true → workflow created (maybe runnable or draft)
      return res.status(201).json(result);
    } catch (err: any) {
      console.error("Error creating workflow:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Internal server error" });
    }
  }
);
WorkFlowRouter.put(
  "/update/:workflowId",
  Authenticate,
  async (req: ExtendedReq, res: Response) => {
    try {
      // parsing and validate params
      const workflowId = Number(req.params.workflowId);
      if (!Number.isInteger(workflowId) || workflowId <= 0) {
        return res.status(400).json({
          ok: false,
          message: "Invalid workflowId",
        });
      }

      const userId = Number(req.userId);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(401).json({ ok: false, message: "Unauthorized" });
      }

      // ensure body
      if (!req.body || !req.body.workflow) {
        return res
          .status(400)
          .json({ ok: false, message: "workflow payload is required" });
      }

      const { nodes, connections, title } = req.body.workflow;

      // validate workflow payload shape first

      const normalized = validate(nodes, connections);
      if (!normalized) {
        return res.status(400).json({ ok: false, message: "Invalid workflow" });
      }

      // structural errors
      const structuralErr = normalized.err.filter((e: any) =>
        structuralTypes.has(e.type)
      );
      if (structuralErr.length > 0) {
        return res.status(400).json({
          ok: false,
          message: "Structural errors in workflow",
          structuralErrors: structuralErr,
        });
      }

      const existing = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
      });

      if (!existing) {
        return res
          .status(404)
          .json({ ok: false, message: "Workflow not found or not accessible" });
      }

      const WORKFLOW = await prisma.workflow.update({
        where: { id: workflowId },
        data: {
          nodes: normalized.nodes,
          connections: normalized.connections,
          enabled: Boolean(normalized.valid),
          title: title,
        },
      });

      if (!normalized.valid) {
        return res.status(200).json({
          ok: true,
          WORKFLOW,
          runnable: false,
          warnings: {
            missingParams: normalized.missingParams,
            nonBlockingErrors: normalized.err.filter(
              (e) => !structuralTypes.has(e.type)
            ),
            // if missingCredId is a Map -> convert to array of { id, something }
            missingCred: Array.isArray(normalized.missingCredId)
              ? normalized.missingCredId
              : [...(normalized.missingCredId?.entries?.() ?? [])],
          },
          reason:
            Object.keys(normalized.missingParams || {}).length > 0
              ? "missing_required_parameters"
              : "other_nonblocking_issues",
        });
      }

      return res
        .status(200)
        .json({ ok: true, WORKFLOW, runnable: Boolean(normalized.valid) });
    } catch (err) {
      // log real error for debugging
      console.error("Error updating workflow:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Internal server error", error: err });
    }
  }
);

WorkFlowRouter.delete(
  "/delete/:workflowId",
  Authenticate,
  async (req: ExtendedReq, res: Response) => {
    try {
      const workflowId = Number(req.params.workflowId);
      if (!Number.isInteger(workflowId) || workflowId <= 0) {
        return res
          .status(400)
          .json({ ok: false, message: "Invalid workflowId" });
      }

      const userId = Number(req.userId);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(401).json({ ok: false, message: "Unauthorized" });
      }

      // ensure the workflow belongs to the user
      const existing = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
        select: { id: true, title: true },
      });

      if (!existing) {
        return res
          .status(404)
          .json({ ok: false, message: "Workflow not found or not accessible" });
      }
      await prisma.$transaction(async (ctx) => {
        await ctx.workflow.delete({
          where: { id: workflowId },
        });
        await ctx.emailWait.deleteMany({
          where: {
            workflowId: workflowId,
          },
        });
      });

      return res.status(200).json({
        ok: true,
        message: "Successfully deleted",
        title: existing.title,
      });
    } catch (err) {
      console.error("Error deleting workflow:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Internal server error", error: err });
    }
  }
);
//getting all the workflows from the backend
WorkFlowRouter.get(
  "/",
  Authenticate,
  async (req: ExtendedReq, res: Response) => {
    try {
      const userId = req.userId;
      const workflows = await prisma.workflow.findMany({
        where: {
          userId: userId,
        },
      });
      return res.json({ workflows, ok: true });
    } catch (error) {
      console.error("Error Fetching workflow:", error);
      return res
        .status(500)
        .json({ ok: false, message: "Internal server error", error });
    }
  }
);

//getting all the executions
WorkFlowRouter.get(
  "/executions",
  Authenticate,
  async (req: ExtendedReq, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ ok: false, message: "Unauthorized: no userId" });
      }
      const executions = await prisma.execution.findMany({
        where: {
          workflow: { userId: userId },
        },
        select: {
          workflow: { select: { title: true, id: true } },
          status: true,
          tasks: {
            take: 10,
            orderBy: { finishedAt: "desc" },
          },
          id: true,
          createdAt: true,
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });
      return res.json({ ok: true, executions }).status(200);
    } catch (error) {
      console.log("error while fetching executions " + error);
      return res
        .json({ ok: false, error: "error while fetching executions" })
        .status(500);
    }
  }
);
//getting all the execution tasks per workflow mapped to the executionId
WorkFlowRouter.get(
  "/executionTask/:executionId",
  Authenticate,
  async (req: ExtendedReq, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ ok: false, message: "Unauthorized: no userId" });
      }
      const executionId = req.params.executionId;
      const executedNodes = await prisma.executionTask.findMany({
        where: {
          executionId: Number(executionId),
          execution: { workflow: { userId: userId } },
        },
        select: {
          nodeId: true,
          status: true,
          execution: {
            select: {
              status: true,
            },
          },
        },
      });
      return res.json({ executedNodes }).status(200);
    } catch (error) {
      console.log(
        "error while fetching executed nodes status per Execution" + error
      );
      return res.status(500).json({
        error: "error while fetching executed nodes status per Execution",
      });
    }
  }
);
