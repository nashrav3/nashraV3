import { UserFromGetMe } from "@grammyjs/types";
import { Job, Queue, Worker } from "bullmq";
import { Bot } from "grammy";
import type Redis from "ioredis";
import type { PrismaClientX } from "~/prisma";

export type GreetingData = {
  bot: UserFromGetMe;
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
      const botInfo = job.data.bot;
      const { token } = await prisma.bot.findUniqueOrThrow({
        where: prisma.bot.byBotId(botInfo.id),
        select: { token: true },
      });
      const users = await prisma.botChat.findMany({
        where: { botId: botInfo.id },
      });
      const jobBot = new Bot(token);

      const delay = (ms: number) =>
        // eslint-disable-next-line no-promise-executor-return
        new Promise((resolve) => setTimeout(resolve, ms));
      const sendChatActionWithProgress = async (
        chatId: string,
        action: string,
        index: number
      ) => {
        await jobBot.api.sendChatAction(chatId, "typing");
        const progress = ((index + 1) / users.length) * 100; // Calculate progress percentage
        console.log(`Progress: ${progress.toFixed(2)}%`);
        await delay(500); // Delay for 500ms (2 chat actions per second)
      };

      for (let i = 0; i < users.length; i += 1) {
        const user = users[i];
        // eslint-disable-next-line no-await-in-loop
        await sendChatActionWithProgress(
          user.chatId.toString(),
          "typing",
          i
        ).catch((e) => console.log(e.message));
      }
    },
    {
      connection,
    }
  ).on("failed", handleError);
}
