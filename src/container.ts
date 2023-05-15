import Redis from "ioredis";
import { config } from "~/config";
import { createLogger } from "~/logger";
import { createPrisma } from "~/prisma";
import { createGreetingQueue } from "~/queues";

export const createAppContainer = () => {
  const logger = createLogger(config);
  const prisma = createPrisma(logger);
  const redis = new Redis(config.REDIS_URL);

  return {
    config,
    logger,
    prisma,
    redis,
    queues: {
      greeting: createGreetingQueue({
        connection: redis,
      }),
    },
  };
};

export type Container = ReturnType<typeof createAppContainer>;
