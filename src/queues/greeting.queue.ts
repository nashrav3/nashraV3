import { Job, Queue, Worker } from "bullmq";
import type Redis from "ioredis";
import type { PrismaClientX } from "~/prisma";

export type GreetingData = {
  chatId: number;
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
      const user = await prisma.user.findUniqueOrThrow({
        where: prisma.user.byTelegramId(job.data.chatId),
        select: {
          languageCode: true,
        },
      });

      if (user) {
        console.log("Greeting", job.data.chatId);
      }
    },
    {
      connection,
    }
  ).on("failed", handleError);
}
