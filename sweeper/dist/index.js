"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@shashankpandey/prisma"));
const kafkajs_1 = require("kafkajs");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_2 = require("@shashankpandey/prisma/generated/prisma");
dotenv_1.default.config();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const kafka = new kafkajs_1.Kafka({
            clientId: "my-app",
            brokers: ["localhost:9092"],
        });
        const producer = kafka.producer();
        producer.on("producer.connect", () => console.log("producer connected"));
        yield producer.connect();
        while (1) {
            try {
                const workflows = yield prisma_1.default.outbox.findMany({
                    where: { status: { in: ["TESTING", "UNSENT"] } },
                    take: 10,
                });
                if (workflows.length === 0) {
                    yield new Promise((r) => setTimeout(r, 1000));
                    continue;
                }
                //producing it to the kafka queue
                yield producer.send({
                    topic: "quickstart-events",
                    messages: workflows.map((workflow) => ({
                        value: JSON.stringify(workflow),
                    })),
                });
                yield prisma_1.default.outbox.updateMany({
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
                yield new Promise((r) => setTimeout(r, 500));
            }
            catch (error) {
                if (error instanceof prisma_2.Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
                    console.log("Outbox table not found. Waiting for it to be created... Retrying in 1 second.");
                }
                else {
                    console.error("Error processing outbox:", error);
                }
                // backoff a bit longer on failure
                yield new Promise((r) => setTimeout(r, 5000));
            }
        }
    });
}
main().catch((err) => {
    console.log("fatal err", err);
    process.exit(1);
});
