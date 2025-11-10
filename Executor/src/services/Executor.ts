import { Kafka } from "kafkajs";
import prisma from "@shashankpandey/prisma";
import { sendTelegram } from "./SendTelegram";
import dotenv from "dotenv";
import { FetchCred } from "../utils/FetchCreds";
import { sendEmail } from "./sendMail";
import type { Node, connections } from "../utils/types";
import { getParentNode } from "../utils/getParents";
import { executionHelper } from "../utils/helper";
import { Prisma, TaskStatus } from "@shashankpandey/prisma/generated/prisma";
import { parse_Node_Parameters } from "../utils/parse_Node_Parameters";
import { InputJsonValue } from "@shashankpandey/prisma/generated/prisma/runtime/library";

dotenv.config();

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
});
const consumer = kafka.consumer({ groupId: "test-group" });
export const producer = kafka.producer();

export async function Init() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: "quickstart-events", fromBeginning: true });
  console.log("consumer got connected");

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const raw = message.value?.toString();
        if (!raw) {
          console.warn("empty message, skipping");
          return;
        }

        const payload = JSON.parse(raw);
        if (
          !payload.workflowId ||
          !payload.executionId 
       
        ) {
          console.warn(
            "message missing workflowId or executionId or payload",
            payload
          );
          // committing offset to avoid reprocessing malformed message
          await consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
          return;
        }

        // loading workflow nodes
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

        // load previous tasks for this execution (so we know which nodes already ran)
        const prevTaskNodes = await executionHelper.getPreviousExecutionTasks(
          payload.executionId
        );
        console.log('previous tasks');
        console.log(prevTaskNodes)

        const doneNodeIds = new Set(prevTaskNodes.map((p) => String(p.nodeId)));

        // Read target node id from top-level message (not from stringified ExecutionPayload)
        const targetNodeId = payload.targetNodeId ?? payload.targetId ?? null;

        // - If targetNodeId is provided -> run that node (even if it's not in remainingNodes for this execution)
        // - Else -> pick the first node that hasn't run yet (full-run)
        let nodeToExecute = null;

        if (targetNodeId&&payload.isTest) {
          nodeToExecute = nodes.find(
            (n) => String(n.id) === String(targetNodeId)
          );
          if (!nodeToExecute) {
            console.warn(
              `targetNodeId ${targetNodeId} not found in workflow ${payload.workflowId} nodes`
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

          // If node already executed in this execution and you don't want to re-run it, skip
          if (doneNodeIds.has(String(nodeToExecute.id))) {
            console.log(
              `target node ${targetNodeId} already executed for execution ${payload.executionId}; skipping`
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
        } else {
          // full-run path: choose first not-yet-done node (topological order assumed in `nodes`)
          const remainingNodes = nodes.filter(
            (n) => !doneNodeIds.has(String(n.id))
          );
          nodeToExecute = remainingNodes.length ? remainingNodes[0] : null;

          if (!nodeToExecute) {
            console.log(
              "no remaining nodes to execute for execution",
              payload.executionId
            );
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

        let task;
        //find the parent node
        const parentNodeId = getParentNode(
          nodes,
          wf?.connections as unknown as connections[],
          nodeToExecute.id
        );
        //parentNode can be null which states this is a single node execution
        //if parent node exists then it's previous execution must have exist so get it from the prevtasks
        const parent_node_Output = executionHelper.getParentNodeOutput(
          parentNodeId!
        );
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
                  startedAt:new Date(),
                  finishedAt:new Date()
            },
          });
        } catch (e: any) {
          // likely a unique constraint violation (another worker already created the task)
          console.warn(
            "could not create executionTask (maybe already exists):",
            e?.message || e
          );
          // commit and skip processing this node
          await consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
          return;
        }
        let ok;

        try {
          //email message
  
          // need to check wether the parameters of node are fixed or {{$Json.Expression}}
          //A function that parse the node parameters and mutates the key value pair on the basis of expression (string or json)
          //This accepts the parent node output object and the node parameters
          const parsedParameters = parse_Node_Parameters(
            nodeToExecute.parameters,
            parent_node_Output!
          );
          console.log(parsedParameters)
          switch (nodeToExecute.type) {
            case "discord":
              //discord message
              const DiscMess = parsedParameters?.message;

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
              ok = await sendTelegram(process.env.DISCORD_WEBHOOK!, {
                embeds: [embed],
              });
              break;

            case "smtp":
              console.log(nodeToExecute.parameters);

              const { to, from, body, subject } = parsedParameters;
              
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
                  subject
                );
              }
              break;

            default:
              console.log("unknown node type:", nodeToExecute.type);
              ok={success:false}
              break;
          }

          // mark task success

          if (ok!.success) {
            console.log(ok)
            await prisma.executionTask.update({
              where: { id: task.id },
              data: {
                status: {
                  set: ok?.status
                    ? (ok.status as TaskStatus)
                    : TaskStatus.SUCCESS,
                },
                finishedAt: new Date(),
                output:ok?.data?ok.data as InputJsonValue:Prisma.JsonNull
              },
              //i need to push The workflow id and execution id
            });
            await producer.send({
              topic: "quickstart-events",
              messages: [{ value: JSON.stringify(payload) }],
            });
          }
        } catch (execErr) {
          console.error("node execution failed:", execErr);
          // mark task failed and allow retries
          await prisma.executionTask.update({
            where: { id: task.id },
            data: {
              status: "FAILED",
              attempts: { increment: 1 },
            },
          });
         
          // but here we commit to avoid blocking pipeline; consider your retry strategy.
          await consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
          return;
        }

        // Success: commit offset so Kafka moves forward
        await consumer.commitOffsets([
          { topic, partition, offset: (Number(message.offset) + 1).toString() },
        ]);
      } catch (outerErr) {
        console.error("unexpected handler error:", outerErr);
        // On catastrophic error, don't commit offset to allow reprocessing (or decide policy)
        // Optionally add a small delay to avoid tight crash loops:
        await new Promise((r) => setTimeout(r, 2000));
      }
    },
  });
}
