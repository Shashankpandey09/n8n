import prisma from "@shashankpandey/prisma";
import { validate } from "../utils/validate";
import { structuralTypes } from "../Constants";

type CreateWorkflowResult =
  | { ok: true; workflow: any; runnable: true }
  | {
      ok: true;
      workflow: any;
      runnable: false;
      warnings?: any;
      reason?: string;
    }
  | { ok: false; errors: any[]; message?: string };

export async function createWorkflow(
  userId: number,
  body: any
): Promise<CreateWorkflowResult> {
  try {
    const nodes = Array.isArray(body.nodes) ? body.nodes : [];
    const connections = Array.isArray(body.connections) ? body.connections : [];
    const title = body.title || "untitled Workflow";
    const normalized = validate(nodes, connections);

    const structuralErrors = (normalized.err || []).filter((e: any) =>
      structuralTypes.has(e.type)
    );
    const otherErrors = (normalized.err || []).filter(
      (e: any) => !structuralTypes.has(e.type)
    );
    // If completely empty, create a draft (disabled) and return
    if (
      nodes.length === 0 ||
      (structuralErrors.length == 0 && connections.length == 0)
    ) {
      const workflow = await prisma.workflow.create({
        data: {
          userId,
          title,
          enabled: false,
          nodes,
          connections,
        },
      });

      return { ok: true, workflow, runnable: false };
    }

    // Validate & normalize (your validate returns nodes, connections, err, missingParams, valid)

    // If there are structural errors, do not persist as runnable.
    // Option A: refuse to save at all and return errors so frontend forces user to fix.
    if (structuralErrors.length > 0) {
      return {
        ok: false,
        errors: structuralErrors,
        message: "Structural validation failed",
      };
    }

    // If there are missing required params (warnings), we can still save but keep disabled
    const hasMissingParams =
      Object.keys(normalized.missingParams || {}).length > 0;

    // Determine whether workflow is runnable: true only when no missing params and no other errors
    const runnable =
      !hasMissingParams &&
      otherErrors.length === 0 &&
      normalized.missingCredId.size == 0;

    // Persist the normalized nodes/connections (store as provided by validate, so defaults applied)
    const workflow = await prisma.workflow.create({
      data: {
        userId,
        title,
        enabled: runnable, // enable only if runnable
        nodes: JSON.stringify(normalized.nodes),
        connections: JSON.stringify(normalized.connections),
      },
    });

    if (!runnable) {
      // Return warnings so UI can highlight missing params etc.
      return {
        ok: true,
        workflow,
        runnable: false,
        warnings: {
          missingParams: normalized.missingParams,
          nonBlockingErrors: otherErrors,
          missingCred: [...normalized.missingCredId.entries()],
        },
        reason: hasMissingParams
          ? "missing_required_parameters"
          : "other_nonblocking_issues ",
      };
    }

    // Fully valid & runnable
    return { ok: true, workflow, runnable: true };
  } catch (err: any) {
    // Unexpected server-side error. Return structured failure so caller can decide.
    return {
      ok: false,
      errors: [{ message: err?.message || String(err) }],
      message: "Internal error while creating workflow",
    };
  }
}
