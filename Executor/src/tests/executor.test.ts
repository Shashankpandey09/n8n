import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { handleExecutionMessage, type ExecutorDeps } from "../services/Executor";

import { TaskStatus } from "@shashankpandey/prisma/generated/prisma";

const baseCtx = {
  topic: "quickstart-events",
  partition: 0,
  message: {
    value: null as any,
    offset: "0",
  },
};

function makeDeps() {
 
  const deps = mockDeep<ExecutorDeps>();
  return { deps };
}

describe("handleExecutionMessage (executor)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("commits offset when message is missing workflowId/executionId", async () => {
    const { deps } = makeDeps();

    const payload = { foo: "bar" }; 
    const ctx = {
      ...baseCtx,
      message: {
        value: Buffer.from(JSON.stringify(payload)),
        offset: "10",
      },
    };

    await handleExecutionMessage(deps, ctx);

    expect(deps.consumer.commitOffsets).toHaveBeenCalledWith([
      {
        topic: "quickstart-events",
        partition: 0,
        offset: "11",
      },
    ]);


    expect(deps.prisma.workflow.findUnique).not.toHaveBeenCalled();
  });

  it("commits offset when workflow has no nodes", async () => {
    const { deps } = makeDeps();

    deps.prisma.workflow.findUnique.mockResolvedValue({
      nodes: [],
      connections: [],
      userId: 1,
    } as any);

    deps.executionHelper.getPreviousExecutionTasks.mockResolvedValue([]);

    const payload = { workflowId: 1, executionId: 123 };
    const ctx = {
      ...baseCtx,
      message: {
        value: Buffer.from(JSON.stringify(payload)),
        offset: "5",
      },
    };

    await handleExecutionMessage(deps, ctx);

    expect(deps.prisma.workflow.findUnique).toHaveBeenCalled();

    expect(deps.consumer.commitOffsets).toHaveBeenCalledWith([
      {
        topic: "quickstart-events",
        partition: 0,
        offset: "6",
      },
    ]);

    expect(deps.prisma.executionTask.create).not.toHaveBeenCalled();
  });

  it("runs discord node success path and produces next message", async () => {
    const { deps } = makeDeps();

    const nodes = [
      {
        id: "node-1",
        type: "discord",
        action: "SendDiscord",
        parameters: {
          WebhookUrl: "https://discord/webhook",
          message: "hi",
        },
      },
    ];

    deps.prisma.workflow.findUnique.mockResolvedValue({
      nodes,
      connections: [],
      userId: 42,
    } as any);

    deps.executionHelper.getPreviousExecutionTasks.mockResolvedValue([]);
    deps.executionHelper.getParentNodeOutput.mockResolvedValue(null);
    deps.getParentNode.mockReturnValue(undefined);

    deps.parseNodeParams.mockReturnValue({
      WebhookUrl: "https://discord/webhook",
      message: "Hello from unit test",
    });

    deps.prisma.executionTask.create.mockResolvedValue({
      id: "task-1",
      nodeId: "node-1",
    } as any);

    deps.sendTelegram.mockResolvedValue({
      success: true,
      status: TaskStatus.SUCCESS,
      data: { ok: true },
    });

    const payload = { workflowId: 1, executionId: 99 };
    const ctx = {
      ...baseCtx,
      message: {
        value: Buffer.from(JSON.stringify(payload)),
        offset: "3",
      },
    };

    await handleExecutionMessage(deps, ctx);


    expect(deps.prisma.executionTask.create).toHaveBeenCalled();


    expect(deps.sendTelegram).toHaveBeenCalledWith(
      "https://discord/webhook",
      expect.objectContaining({
        embeds: expect.any(Array),
      }),
    );

  
    expect(deps.prisma.executionTask.update).toHaveBeenCalledWith({
      where: { id: "task-1" },
      data: {
        status: {
          set: TaskStatus.SUCCESS,
        },
        finishedAt: expect.any(Date),
        output: { ok: true },
      },
    });

   
    expect(deps.producer.send).toHaveBeenCalledWith({
      topic: "quickstart-events",
      messages: [{ value: JSON.stringify(payload) }],
    });


    expect(deps.consumer.commitOffsets).toHaveBeenCalledWith([
      {
        topic: "quickstart-events",
        partition: 0,
        offset: "4",
      },
    ]);
  });

  it("executes SMTP node (Send&wait) and sets task to PENDING without producing next message", async () => {
    const { deps } = makeDeps();

    const nodes = [
      {
        id: "SMTP1",
        type: "smtp",
        action: "Send&wait",
        parameters: {}, 
      },
    ];

    deps.prisma.workflow.findUnique.mockResolvedValue({
      nodes,
      connections: [],
      userId: 999,
    } as any);

    deps.executionHelper.getPreviousExecutionTasks.mockResolvedValue([]);
    deps.executionHelper.getParentNodeOutput.mockResolvedValue(null);
    deps.getParentNode.mockReturnValue(undefined);

    deps.parseNodeParams.mockReturnValue({
      to: "test@abc.com",
      from: "noreply@xyz.com",
      subject: "Hello",
      body: "<b>Mail</b>",
    });

    deps.FetchCred.mockResolvedValue(true);

  
    deps.sendEmail.mockResolvedValue({
      success: true,
      status: "PENDING",
      data: { ok: true },
    } as any);

  
    deps.prisma.executionTask.create.mockResolvedValue({ id: 1 } as any);

    const payload = { workflowId: 10, executionId: 22 };
    const ctx = {
      ...baseCtx,
      message: {
        value: Buffer.from(JSON.stringify(payload)),
        offset: "1",
      },
    };

    await handleExecutionMessage(deps, ctx);

  
    expect(deps.sendEmail).toHaveBeenCalledWith(
      "test@abc.com",
      "noreply@xyz.com",
      "<b>Mail</b>",
      999,
      "Send&wait",
      10,
      22,
      "SMTP1",
      "Hello",
      undefined,
    );

  
    expect(deps.prisma.executionTask.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: {
          set: "PENDING",
        },
        finishedAt: expect.any(Date),
        output: { ok: true },
      },
    });

   
    expect(deps.producer.send).toHaveBeenCalled();

    expect(deps.consumer.commitOffsets).toHaveBeenCalledWith([
      {
        topic: "quickstart-events",
        partition: 0,
        offset: "2",
      },
    ]);
  });

  it("marks task FAILED when node execution throws", async () => {
    const { deps } = makeDeps();

    const nodes = [
      {
        id: "node-1",
        type: "discord",
        action: "SendDiscord",
        parameters: {},
      },
    ];

    deps.prisma.workflow.findUnique.mockResolvedValue({
      nodes,
      connections: [],
      userId: 10,
    } as any);

    deps.executionHelper.getPreviousExecutionTasks.mockResolvedValue([]);
    deps.executionHelper.getParentNodeOutput.mockResolvedValue(null);
    deps.getParentNode.mockReturnValue(undefined);

    deps.parseNodeParams.mockReturnValue({
      WebhookUrl: "https://discord/webhook",
      message: "Hi",
    });

    deps.prisma.executionTask.create.mockResolvedValue({
      id: "task-xyz",
      nodeId: "node-1",
    } as any);

    deps.sendTelegram.mockRejectedValue(new Error("Discord down"));

    const payload = { workflowId: 2, executionId: 777 };
    const ctx = {
      ...baseCtx,
      message: {
        value: Buffer.from(JSON.stringify(payload)),
        offset: "20",
      },
    };

    await handleExecutionMessage(deps, ctx);

 
    expect(deps.prisma.executionTask.update).toHaveBeenCalledWith({
      where: { id: "task-xyz" },
      data: {
        status: "FAILED",
        attempts: { increment: 1 },
      },
    });

    expect(deps.consumer.commitOffsets).toHaveBeenCalledWith([
      {
        topic: "quickstart-events",
        partition: 0,
        offset: "21",
      },
    ]);
  });
});
