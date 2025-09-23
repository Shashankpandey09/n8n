import { Kafka } from "kafkajs";
import prisma from "@shashankpandey/prisma";
import { sendTelegram } from "./services/SendTelegram";
import dotenv from "dotenv";
dotenv.config();

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
});
const consumer = kafka.consumer({ groupId: "test-group" });
const producer = kafka.producer();

type Para = { name: string; type: string; required: boolean };
type Node = {
  id: string;
  type: string;
  parameters: Para[];
  credentials?: Array<{ name: string; required: boolean }>;
};

async function Init() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: "workflows", fromBeginning: true });
  console.log("consumer got connected");

  await consumer.run({
    // disabling auto-commit so we only commit after successful processing
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      // Wrap whole handler so exceptions are caught
      try {
        const raw = message.value?.toString();
        if (!raw) {
          console.warn("empty message, skipping");
          return;
        }

        const payload = JSON.parse(raw);
        // basic validations
        if (!payload.workflowId || !payload.executionId) {
          console.warn("message missing workflowId or executionId", payload);
          // commit offset to avoid reprocessing malformed message
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
          where: { id: payload.workflowId },
          select: { nodes: true },
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
        const prevTaskNodes = await prisma.executionTask.findMany({
          where: { executionId: payload.executionId },
          select: { nodeId: true },
        });

        const doneNodeIds = new Set(prevTaskNodes.map((p) => String(p.nodeId)));
        // find first node that is NOT present in prevTaskNodes
        const remainingNodes = nodes.filter((n) => !doneNodeIds.has(n.id));
        const nodeToExecute = remainingNodes.length ? remainingNodes[0] : null;

        if (!nodeToExecute) {
          console.log(
            "no remaining nodes to execute for execution",
            payload.executionId
          );
          // nothing to do; commit and exit
          await consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
          return;
        }

        // Attempt to register the node execution atomically (create task)
        // It's good to make (executionId, nodeId) unique in schema to avoid races.
        let task;
        try {
          task = await prisma.executionTask.create({
            data: {
              executionId: payload.executionId,
              nodeId: nodeToExecute.id,
              status: "RUNNING",
              attempts: 1,
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
        let ok = null;
        // Now actually execute the node action (call handler). Wrap in try/catch.
        try {
          switch (nodeToExecute.type) {
            case "telegram":
              // TODO: implement sendTelegram(nodeToExecute, payload)
              // console.log("would send telegram for node:", nodeToExecute.id);
              const Payload = { message: "hi testing again" };
              ok = await sendTelegram(
                process.env.DISCORD_WEBHOOK!,
                Payload.message
              );
              break;

            case "smtp":
              // TODO: implement sendEmail(nodeToExecute, payload)
              console.log("would send email for node:", nodeToExecute.id);
              ok=true
              break;

            default:
              console.log("unknown node type:", nodeToExecute.type);
              break;
          }

          // mark task success
          if (ok) {
            await prisma.executionTask.update({
              where: { id: task.id },
              data: { status: "SUCCESS", finishedAt: new Date() },
              //i need to push The workflow id and execution id
            });
            await producer.send({
              topic: "workflows",
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
          // don't commit the offset if you want the message reprocessed later,
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

Init().catch((err) => {
  console.error("fatal err", err);
  process.exit(1);
});
