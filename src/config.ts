import "dotenv/config";
import z from "zod";
import { parseEnv, port } from "znv";
import { API_CONSTANTS } from "grammy";

const createConfigFromEnvironment = (environment: NodeJS.ProcessEnv) => {
  const config = parseEnv(environment, {
    NODE_ENV: z.enum(["development", "production"]),
    LOG_LEVEL: z
      .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
      .default("info"),
    BOT_MODE: {
      schema: z.enum(["polling", "webhook"]),
      defaults: {
        production: "webhook" as const,
        development: "polling" as const,
      },
    },
    BOT_TOKEN: z.string(),
    REDIS_URL: z.string().url().default("redis://localhost:6379"),
    WEBHOOK_URL: z.string().url().default(""),
    BOT_WEBHOOK: z.string().default(""),
    BOT_SERVER_HOST: z.string().default("0.0.0.0"),
    BOT_SERVER_PORT: port().default(80),
    BOT_ALLOWED_UPDATES: z
      .array(z.enum(API_CONSTANTS.ALL_UPDATE_TYPES))
      .default([]),
    BOT_ADMIN_USER_ID: z.coerce.number().finite(),
    BATCH_SIZE: z.coerce.number().positive().default(30),
  });

  if (config.BOT_MODE === "webhook") {
    // validate webhook url in webhook mode
    z.string()
      .url()
      .parse(config.BOT_WEBHOOK, {
        path: ["BOT_WEBHOOK"],
      });
  }

  return {
    ...config,
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",
  };
};

export type Config = ReturnType<typeof createConfigFromEnvironment>;

export const config = createConfigFromEnvironment(process.env);
