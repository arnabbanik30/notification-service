import client, {
  Connection,
  Channel,
  ChannelModel,
} from "amqplib";

import {
  rmqUser,
  rmqPass,
  rmqhost,
  MAIN_QUEUE,
} from "./config";

import { dummyPoster } from "./dummyPoster";

class RabbitMQConnection {
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) return;
    else this.connected = true;

    try {
      console.log(`⌛️ Connecting to Rabbit-MQ Server`);
      let channelModel: ChannelModel = await client.connect(
        `amqp://${rmqUser}:${rmqPass}@${rmqhost}:5672`
      );

      this.connection = channelModel.connection;

      console.log(`✅ Rabbit MQ Connection is ready`);

      this.channel = await channelModel.createChannel();

      console.log(`🛸 Created RabbitMQ Channel successfully`);

    } catch (error) {
      console.error(error);
      console.error(`Not connected to MQ Server`);
    }
  }

  async createDelayQueues() {
    if (!this.channel) {
      await this.connect();
    }

    const ttls = [1000, 2000, 4000, 8000, 16000];

    for (let i = 0; i < 5; i++) {
      const queueName = `retry_queue_${i + 1}`;
      const ttl = ttls[i];

      await this.channel.assertQueue(queueName, {
        durable: true,
        deadLetterExchange: "",
        deadLetterRoutingKey: MAIN_QUEUE,
        messageTtl: ttl,
      });
    }
  }

  async sendToRetryQueue(queue_no: number, msg: any) {
    const queueName = `retry_queue_${queue_no}`;
    this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), {
      persistent: true,
    });
  }

  getRandomIntInclusive(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); 
  }
  
  async postMsg(url: string, payload: string) {
    let provider = this.getRandomIntInclusive(1, 3);
    let res = await dummyPoster(url, provider, payload);
  
    if (!res){
      for (let i = 0; i < 2 && !res; i++){
        provider++;
        res = await dummyPoster(url, provider % 3, payload); 
      }
    }
    return res;
  }

  async consume(queue: string) {
    await this.createDelayQueues();

    try {
      if (!this.channel) {
        await this.connect();
      }
      if (this.channel) {
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.prefetch(1);
        await this.channel.consume(queue, async (msg) => {
          if (!msg) return;
          let strMsg = msg.content.toString();
          let parsedMsg = JSON.parse(strMsg);

          const {url, payload, attemptCount } = parsedMsg;
         
          const success = await this.postMsg(url, payload);
         
          if (!success){
            if (!attemptCount || attemptCount < 5) {
              // requeue with exponential backoff if the msg is not delivered
              const updatedAttemptCount = !attemptCount? 1 : attemptCount + 1;
              await this.sendToRetryQueue(updatedAttemptCount, {
                url: url,
                payload: payload,
                attemptCount: updatedAttemptCount,
              });
              this.channel.ack(msg);
            }
            else {
              // dead-letter the msg if the delivery fails 5 times.
              this.channel.nack(msg, false, false);
            }
          }
          else {
            this.channel.ack(msg);
          }
        });
      } else {
        console.log("Channel not available");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

const mqConnection = new RabbitMQConnection();

export default mqConnection;
