import Redis from "ioredis";
import { config } from "~/config";
import { createLogger } from "~/logger";
import { createPrisma } from "~/prisma";
import {
  createBroadcastFlowsQueue,
  createBroadcastQueue,
  createVerifyChatQueue,
} from "~/queues";

export const createAppContainer = () => {
  const logger = createLogger(config);
  const prisma = createPrisma(logger);
  const redis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  return {
    config,
    logger,
    prisma,
    redis,
    queues: {
      verifyChat: createVerifyChatQueue({
        connection: redis,
      }),
      broadcast: createBroadcastQueue({
        connection: redis,
      }),
      broadcastFlows: createBroadcastFlowsQueue({ connection: redis }),
    },
  };
};

export type Container = ReturnType<typeof createAppContainer>;
