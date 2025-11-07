import { Kafka, Producer } from "kafkajs";

export class Singleton {
  private static instance: Singleton | null = null;
  private kafka: Kafka;
  private producer: Producer;

  private constructor() {
    this.kafka = new Kafka({
      clientId: "my-app",
      brokers: ["localhost:9092"],
    });
    this.producer = this.kafka.producer();
  }

  public static getProducer(): Producer {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance.producer;
  }
}
