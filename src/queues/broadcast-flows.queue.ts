import { UserFromGetMe } from "@grammyjs/types";
import { Job, Queue, Worker } from "bullmq";
import { Bot } from "grammy";
import type Redis from "ioredis";
import type { PrismaClientX } from "~/prisma";

export type BroadcastFlowsData = {
  botInfo: UserFromGetMe;
  chatId: number;
  token: string;
};

const queueName = "broadcast-flows";

export function createBroadcastFlowsQueue({
  connection,
}: {
  connection: Redis;
}) {
  return new Queue<BroadcastFlowsData>(queueName, {
    connection,
    limiter: {
      groupKey: "token",
    },
  });
}

export function createBroadcastFlowsWorker({
  connection,
  prisma,
  handleError,
}: {
  connection: Redis;
  prisma: PrismaClientX;
  handleError: (job: Job<BroadcastFlowsData> | undefined, error: Error) => void;
}) {
  return new Worker<BroadcastFlowsData>(
    queueName,
    async (job) => {
      const jobBot = new Bot(job.data.token, { botInfo: job.data.botInfo });
      await jobBot.api.sendMessage(job.data.chatId, "broadcast done");
    },
    {
      connection,
    }
  ).on("failed", handleError);
}
