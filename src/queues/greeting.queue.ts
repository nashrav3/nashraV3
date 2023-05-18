import { Job, Queue, Worker } from "bullmq";
import type Redis from "ioredis";
import { Context } from "~/bot/context";
import type { PrismaClientX } from "~/prisma";

export type GreetingData = {
  ctx: Context;
};

const queueName = "greeting";

export function createGreetingQueue({ connection }: { connection: Redis }) {
  return new Queue<GreetingData>(queueName, {
    connection,
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
      const { ctx } = job.data;
      await ctx.reply("Hello");
    },
    {
      connection,
    }
  ).on("failed", handleError);
}
