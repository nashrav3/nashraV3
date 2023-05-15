import { Job, Queue, Worker } from "bullmq";
import type Redis from "ioredis";
import type { Bot } from "~/bot";
import { i18n } from "~/bot/i18n";
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
  bot,
  prisma,
  handleError,
}: {
  connection: Redis;
  bot: Bot;
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
        await bot.api.sendMessage(
          job.data.chatId,
          i18n.t(user.languageCode || "en", "welcome")
        );
      }
    },
    {
      connection,
    }
  ).on("failed", handleError);
}
