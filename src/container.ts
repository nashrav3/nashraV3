import Redis from "ioredis";
import { config } from "~/config";
import { createLogger } from "~/logger";
import { createPrisma } from "~/prisma";
import {
  createBroadcastFlowsQueue,
  createBroadcastQueue,
  createDeleteQueue,
  createListFlowQueue,
  createVerifyChatQueue,
} from "~/queues";

export const createAppContainer = () => {
  const logger = createLogger(config);
  const prisma = createPrisma(logger);
  const redis = new Redis(config.REDIS_URL, {
    // eslint-disable-next-line unicorn/no-null
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
      listFlow: createListFlowQueue({ connection: redis }),
      delete: createDeleteQueue({ connection: redis }),
    },
  };
};

export type Container = ReturnType<typeof createAppContainer>;
