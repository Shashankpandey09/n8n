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

      // If your service returns structured responses with ok: true/false
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
      // parse and validate params
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

      const { nodes, connections } = req.body.workflow;

      // validate workflow payload shape first (use zod/joi if possible)
      // call your validate function
      const normalized = validate(nodes, connections);
      if (!normalized) {
        return res.status(400).json({ ok: false, message: "Invalid workflow" });
      }

      // structural errors -> return 400 early with details
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

      // Verify ownership: find the workflow belonging to this user
      const existing = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
      });

      if (!existing) {
        // either not found or not owned by user
        return res
          .status(404)
          .json({ ok: false, message: "Workflow not found or not accessible" });
      }

      // perform update
      const WORKFLOW = await prisma.workflow.update({
        where: { id: workflowId }, // unique id is ok now that we checked ownership
        data: {
          nodes: normalized.nodes,
          connections: normalized.connections,
          enabled: Boolean(normalized.valid),
        },
      });

      // If invalid (non-runnable) return 400 with warnings
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
        return res.status(400).json({ ok: false, message: "Invalid workflowId" });
      }

      const userId = Number(req.userId);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(401).json({ ok: false, message: "Unauthorized" });
      }

      // ensure the workflow belongs to the user
      const existing = await prisma.workflow.findUnique({
        where: { id: workflowId, userId },
        select: { id: true, title: true },
      });

      if (!existing) {
        return res
          .status(404)
          .json({ ok: false, message: "Workflow not found or not accessible" });
      }

      await prisma.workflow.delete({
        where: { id: workflowId },
      });

      return res
        .status(200)
        .json({ ok: true, message: "Successfully deleted", title: existing.title });
    } catch (err) {
      console.error("Error deleting workflow:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Internal server error", error: err});
    }
  }
);
