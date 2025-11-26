import { Kafka, Producer } from "kafkajs";

export class Singleton {
  private static instance: Singleton | null = null;
  private kafka: Kafka;
  private producer: Producer;
  private connected = false;

  private  constructor() {
    this.kafka = new Kafka({
      clientId: "my-app",
      brokers: ["kafka:9093"],
    });
    this.producer = this.kafka.producer();

  }

  public  static getInstance():Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
  public async  getProducer(){
    if(!this.connected){
      await this.producer.connect()
      this.connected=true;
     this.producer.on("producer.connect",()=>console.log("connected"))
     this.producer.on("producer.disconnect",()=>{
      this.connected=false;
      console.log('Kafka Producer disconnected')
    })
    }
    return this.producer
  }
}
