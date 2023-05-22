import { UserFromGetMe } from "@grammyjs/types";
import { Job, Queue, Worker } from "bullmq";
import { Bot } from "grammy";
import type Redis from "ioredis";
import type { PrismaClientX } from "~/prisma";

export type GreetingData = {
  botInfo: UserFromGetMe;
  chatId: number;
  token: string;
};

const queueName = "greeting";

export function createGreetingQueue({ connection }: { connection: Redis }) {
  return new Queue<GreetingData>(queueName, {
    connection,
    limiter: {
      groupKey: "token",
    },
  });
}

export function createGreetingWorker({
  connection,
  prisma,
  handleError,
}: {
  connection: Redis;
  prisma: PrismaClientX;
  handleError: (job: Job<GreetingData> | undefined, error: Error) => void;
}) {
  return new Worker<GreetingData>(
    queueName,
    async (job) => {
      const jobBot = new Bot(job.data.token, { botInfo: job.data.botInfo });

      await jobBot.api.sendChatAction(job.data.chatId, "typing");
    },
    {
      connection,
      limiter: {
        max: 1,
        duration: 1000,
        groupKey: "token",
      },
    }
  ).on("failed", handleError);
}
