#!/usr/bin/env tsx
import { RedisAdapter } from "@grammyjs/storage-redis";
import { Job, Worker } from "bullmq";
import { Bot, createBot } from "~/bot";
import { createAppContainer } from "~/container";
import {
  createBroadcastFlowsWorker,
  createBroadcastWorker,
  createGreetingWorker,
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
    container
  );

  const handleWorkerError = (job: Job | undefined, err: Error) => {
    logger.error({
      msg: "job failed",
      job_id: job?.id,
      job_name: job?.name,
      queue: job?.queueName,
      err,
    });
  };

  const workers: Worker[] = [];

  // Graceful shutdown
  prisma.$on("beforeExit", async () => {
    logger.info("shutdown");

    await Promise.all(Object.values(bots).map((bot: Bot) => bot.stop()));
    await server.close();
  });

  await prisma.$connect();

  workers.push(
    createGreetingWorker({
      connection: redis,
      handleError: handleWorkerError,
      prisma,
    })
  );

  workers.push(
    createBroadcastWorker({
      connection: redis,
      handleError: handleWorkerError,
      prisma,
      container,
    })
  );

  workers.push(
    createBroadcastFlowsWorker({
      connection: redis,
      handleError: handleWorkerError,
      prisma,
      container,
    })
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
} catch (err) {
  container.logger.error(err);
  process.exit(1);
}
