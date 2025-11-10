import prisma from "@shashankpandey/prisma";
import { Kafka } from "kafkajs";
import dotenv from 'dotenv'
import { Prisma } from "@shashankpandey/prisma/generated/prisma";
dotenv.config()
async function main() {
  const kafka = new Kafka({
    clientId: "my-app",
    brokers: ["localhost:9092"],
  });
  const producer = kafka.producer();
  producer.on("producer.connect", () => console.log("producer connected"));
  await producer.connect();
  while (1) {
    try {
      const workflows = await prisma.outbox.findMany({
    where: { status: { in: ["TESTING", "UNSENT"] } },
        take: 10,
      });
      if (workflows.length === 0) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      //producing it to the kafka queue
      await producer.send({
        topic: "quickstart-events",
        messages: workflows.map((workflow) => ({
          value: JSON.stringify(workflow),
        })),
      });
      await prisma.outbox.updateMany({
        where: {
          id: {
            in: workflows.map((w) => w.id),
          },
        },
        data: {
          status: "SENT",
        },
      });
      console.log("sent and updated outbox successfully");
      await new Promise((r) => setTimeout(r, 500));
    } catch (error:any) {
   
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
        console.log("Outbox table not found. Waiting for it to be created... Retrying in 1 second.")
        }
        else{
             console.error("Error processing outbox:", error);
        }
        
      // backoff a bit longer on failure
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}
main().catch((err) => {
  console.log("fatal err", err);
  process.exit(1);
});
