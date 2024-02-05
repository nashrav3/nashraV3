#!/usr/bin/env tsx
import { RedisAdapter } from "@grammyjs/storage-redis";
import { onShutdown } from "node-graceful-shutdown";
import { Job, Worker } from "bullmq";
import { Bot, createBot } from "~/bot";
import { createAppContainer } from "~/container";
import {
  createBroadcastFlowsWorker,
  createBroadcastWorker,
  createDeleteWorker,
  createListFlowWorker,
  createVerifyChatWorker,
} from "~/queues";
import { createServer } from "~/server";

const container = createAppContainer();

try {
  const { config, logger, prisma, redis } = container;

  const bots = new Map<string, Bot>();
  const server = await createServer(
    {
      getBot: async (token) => {
        if (bots.has(token)) {
          return bots.get(token) as Bot;
        }

        const bot = createBot(token, {
          container,
          sessionStorage: new RedisAdapter({
            instance: redis,
          }),
        });
        await bot.init();

        bots.set(token, bot);

        return bot;
      },
    },
    container,
  );

  const handleWorkerError = (job: Job | undefined, error: Error) => {
    logger.error({
      msg: "job failed",
      job_id: job?.id,
      job_name: job?.name,
      queue: job?.queueName,
      err: error,
    });
  };

  const workers: Worker[] = [];

  //  Graceful shutdown
  onShutdown(async () => {
    logger.info("shutdown");

    await server.close();
    await Promise.all(Object.values(bots).map((bot: Bot) => bot.stop()));
  });

  await prisma.$connect();

  workers.push(
    createVerifyChatWorker({
      connection: redis,
      handleError: handleWorkerError,
      prisma,
      container,
    }),
    createBroadcastWorker({
      connection: redis,
      handleError: handleWorkerError,
      prisma,
      container,
    }),
    createBroadcastFlowsWorker({
      connection: redis,
      handleError: handleWorkerError,
      prisma,
      container,
    }),
    createListFlowWorker({
      connection: redis,
      handleError: handleWorkerError,
      prisma,
      container,
    }),
    createDeleteWorker({
      connection: redis,
      handleError: handleWorkerError,
      prisma,
      container,
    }),
  );

  // update bot owner role
  await prisma.chat.upsert({
    where: prisma.chat.byChatId(config.BOT_ADMIN_USER_ID),
    create: {
      chatId: config.BOT_ADMIN_USER_ID,
      chatType: "private",
      // role: Role.OWNER,
    },
    update: {
      // role: Role.OWNER,
    },
  });

  await server.listen({
    host: config.BOT_SERVER_HOST,
    port: config.BOT_SERVER_PORT,
  });
} catch (error) {
  container.logger.error(error);
  process.exit(1);
}
