
import prisma from "@shashankpandey/prisma";
import { Kafka } from "kafkajs";
import { sendTelegram } from "./SendTelegram";
import { sendEmail } from "./sendMail";
import { FetchCred } from "../utils/FetchCreds";
import { getParentNode } from "../utils/getParents";
import { executionHelper } from "../utils/helper";
import { Prisma, TaskStatus } from "@shashankpandey/prisma/generated/prisma";
import { parse_Node_Parameters } from "../utils/parse_Node_Parameters";
import type { Node, connections } from "../utils/types";
import { InputJsonValue } from "@shashankpandey/prisma/generated/prisma/runtime/library";

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9093"],
});
const consumer = kafka.consumer({ groupId: "test-group" });
export const producer = kafka.producer();

export type ExecutorDeps = {
  prisma: typeof prisma;
  executionHelper: typeof executionHelper;
  getParentNode: typeof getParentNode;
  parseNodeParams: typeof parse_Node_Parameters;
  sendTelegram: typeof sendTelegram;
  sendEmail: typeof sendEmail;
  FetchCred: typeof FetchCred;
  producer: typeof producer;
  consumer: typeof consumer;
};
type ExecutionResult = {
  success: boolean;
  status?: TaskStatus | string;
  data?: any;
};



export async function handleExecutionMessage(
  deps: ExecutorDeps,
  ctx: {
    topic: string;
    partition: number;
    message: { value: Buffer | null; offset: string };
  }
) {
  const {
    prisma,
    executionHelper,
    getParentNode,
    parseNodeParams,
    sendTelegram,
    sendEmail,
    FetchCred,
    producer,
    consumer,
  } = deps;

  const { topic, partition, message } = ctx;

  try {
    const raw = message.value?.toString();
    if (!raw) {
      console.warn("empty message, skipping");
      return;
    }

    const payload = JSON.parse(raw);
    if (!payload.workflowId || !payload.executionId) {
      console.warn(
        "message missing workflowId or executionId or payload",
        payload
      );
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(message.offset) + 1).toString(),
        },
      ]);
      return;
    }

    const wf = await prisma.workflow.findUnique({
      where: { id: Number(payload.workflowId) },
      select: { nodes: true, userId: true, connections: true },
    });

    const nodes = wf?.nodes as unknown as Node[] | undefined;

    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      console.warn("no nodes for workflow", payload.workflowId);
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(message.offset) + 1).toString(),
        },
      ]);
      return;
    }

    const targetNodeId = payload.targetNodeId ?? payload.targetId ?? null;

    const prevTaskNodes = await executionHelper.getPreviousExecutionTasks(
      payload.executionId
    );
    const doneNodeIds = new Set(prevTaskNodes.map((p: any) => String(p.nodeId)));

    let nodeToExecute: Node | null = null;

    if (targetNodeId && payload.isTest) {
      nodeToExecute = nodes.find(
        (n) => String(n.id) === String(targetNodeId)
      ) as Node | null;

      if (!nodeToExecute) {
        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (Number(message.offset) + 1).toString(),
          },
        ]);
        return;
      }

      if (doneNodeIds.has(String(nodeToExecute.id))) {
        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (Number(message.offset) + 1).toString(),
          },
        ]);
        return;
      }
    } else {
      const remainingNodes = nodes.filter(
        (n) => !doneNodeIds.has(String(n.id))
      );
      nodeToExecute = remainingNodes.length ? remainingNodes[0] : null;

      if (!nodeToExecute) {
        await prisma.execution.update({
          where: { id: payload.executionId },
          data: { status: "SUCCESS" },
        });
        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (Number(message.offset) + 1).toString(),
          },
        ]);
        return;
      }
    }

    const parentNodeId = getParentNode(
      nodes,
      wf?.connections as unknown as connections[],
      nodeToExecute.id
    );

    const parent_node_Output =
      await executionHelper.getParentNodeOutput(parentNodeId!);

    let task;
    try {
      task = await prisma.executionTask.create({
        data: {
          executionId: payload.executionId,
          nodeId: nodeToExecute.id,
          status: "RUNNING",
          attempts: 1,
          input:
            parent_node_Output === null
              ? Prisma.JsonNull
              : parent_node_Output,
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      });
    } catch (e: any) {
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(message.offset) + 1).toString(),
        },
      ]);
      return;
    }

    let ok:
  ExecutionResult | undefined;

    const parsedParameters = parseNodeParams(
      nodeToExecute.parameters,
      parent_node_Output!
    );

    try {
      switch (nodeToExecute.type) {
        case "discord": {
          const DiscMess = (parsedParameters as any)?.message;
          const WebhookUrl: string = (parsedParameters as any)?.WebhookUrl;

          const embed: any = {
            title: `Workflow: ${payload.workflowId}`,
            fields: [
              {
                name: "Execution ID",
                value: String(payload.executionId),
                inline: true,
              },
              {
                name: "Node ID",
                value: String(nodeToExecute.id),
                inline: true,
              },
              {
                name: "Node Action",
                value: nodeToExecute.action ?? nodeToExecute.type,
                inline: true,
              },
            ],
            timestamp: new Date().toISOString(),
          };

          if (DiscMess) {
            embed.fields.push({
              name: "Fixed discord message",
              value: DiscMess,
              inline: true,
            });
          }

          if (wf?.userId) {
            embed.fields.push({
              name: "User ID",
              value: String(wf.userId),
              inline: true,
            });
          }

          ok = await sendTelegram(WebhookUrl, {
            embeds: [embed],
          });
          break;
        }

        case "smtp": {
          const { to, from, body, subject } = parsedParameters as any;

          const credential = await FetchCred("smtp", wf?.userId!);
          if (credential) {
            ok = await sendEmail(
              to,
              from,
              body,
              wf?.userId!,
              nodeToExecute.action,
              Number(payload.workflowId),
              payload.executionId,
              nodeToExecute.id,
              subject,
              payload.isTest
            );
          }
          break;
        }

        default:
          ok = { success: false };
          break;
      }

      if (ok?.success) {
        await prisma.executionTask.update({
          where: { id: task.id },
          data: {
            status: {
              set: ok?.status ? (ok.status as TaskStatus) : TaskStatus.SUCCESS,
            },
            finishedAt: new Date(),
            output: ok?.data
              ? (ok.data as InputJsonValue)
              : Prisma.JsonNull,
          },
        });

        await producer.send({
          topic: "quickstart-events",
          messages: [{ value: JSON.stringify(payload) }],
        });
      }
    } catch (execErr) {
      await prisma.executionTask.update({
        where: { id: task.id },
        data: {
          status: "FAILED",
          attempts: { increment: 1 },
        },
      });
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(message.offset) + 1).toString(),
        },
      ]);
      return;
    }

    await consumer.commitOffsets([
      {
        topic,
        partition,
        offset: (Number(message.offset) + 1).toString(),
      },
    ]);
  } catch (outerErr) {
    console.error("unexpected handler error:", outerErr);
    await new Promise((r) => setTimeout(r, 2000));
  }
}

export async function Init() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: "quickstart-events", fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: (ctx) =>
      handleExecutionMessage(
        {
          prisma,
          executionHelper,
          getParentNode,
          parseNodeParams: parse_Node_Parameters,
          sendTelegram,
          sendEmail,
          FetchCred,
          producer,
          consumer,
        },
        ctx
      ),
  });
}
