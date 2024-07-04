import { Queues } from "@prisma/client";
import amqp from "amqplib";
import "dotenv/config";

const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost";

declare global {
  var rabbitChannel: amqp.Channel;
}

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
    return channel;
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    throw error;
  }
};

const getRabbitMQChannel = async () => {
  if (!global.rabbitChannel) {
    const channel = await connectRabbitMQ();
    global.rabbitChannel = channel;
  }
  return global.rabbitChannel;
};

export default async function sendMessageToQueue(queue: Queues, message: any) {
  try {
    const channel = await getRabbitMQChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`Message sent to ${queue}:`, message);
  } catch (error) {
    console.error("Failed to send message:", error);
  }
}
