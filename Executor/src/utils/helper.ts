
import prisma from "@shashankpandey/prisma";
import { JsonValue } from "@shashankpandey/prisma/generated/prisma/runtime/library";

export type NodeOutput = {
  nodeId: string;
  output: JsonValue | null;
};

export class ExecutionHelper {
  private static instance: ExecutionHelper | null = null;

  private previousNodesOutput: NodeOutput[] | null = null;

  private constructor() {}

  public static getInstance(): ExecutionHelper {
    if (!ExecutionHelper.instance) {
      ExecutionHelper.instance = new ExecutionHelper();
    }
    return ExecutionHelper.instance;
  }

  public async getPreviousExecutionTasks(
    executionId: number
  ): Promise<NodeOutput[]> {
    // if same executionId, return cached data
  
    const rows = await prisma.executionTask.findMany({
      where: { executionId },
      select: { nodeId: true, output: true },
    });
    console.log("rows")
    console.log(rows)
    this.previousNodesOutput = rows.map((r) => ({
      nodeId: String(r.nodeId),
      output: (r.output ?? null) as JsonValue | null,
    }));

    return this.previousNodesOutput;
  }

  public getParentNodeOutput(parentNodeId: string|null): JsonValue | null {
    if (!this.previousNodesOutput) return null;

    const found = this.previousNodesOutput.find(
      (n) => String(n.nodeId) === String(parentNodeId)
    );
    console.log('found')
    console.log(found)
    return found?.output ?? null;
  }

  public clearCache() {
    this.previousNodesOutput = null;
   
  }
}

export const executionHelper = ExecutionHelper.getInstance();
