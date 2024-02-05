import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";
import fastify from "fastify";
import { webhookCallback } from "grammy";
import type { Bot } from "~/bot";
import type { Container } from "~/container";

export const createServer = async (
  {
    getBot,
  }: {
    getBot: (token: string) => Promise<Bot>;
  },
  container: Container,
) => {
  const { logger, _prisma, queues } = container;

  const server = fastify({
    logger,
  });

  server.setErrorHandler(async (error, request, response) => {
    logger.error(error);

    await response.status(500).send({ error: "Oops! Something went wrong." });
  });

  server.post("/:token([0-9]+:[a-zA-Z0-9_-]+)", async (request, response) => {
    const { token } = request.params as { token: string };

    return webhookCallback(await getBot(token), "fastify")(request, response);
  });

  // server.get(`/metrics`, async (req, res) => {
  //   try {
  //     const appMetrics = await register.metrics();
  //     const prismaMetrics = await prisma.$metrics.prometheus();
  //     const metrics = appMetrics + prismaMetrics;

  //     await res.header("Content-Type", register.contentType).send(metrics);
  //   } catch (err) {
  //     await res.status(500).send(err);
  //   }
  // });

  const {
    verifyChat,
    broadcast,
    broadcastFlows,
    listFlow,
    delete: deleteQueue,
  } = queues;

  const serverAdapter = new FastifyAdapter();

  createBullBoard({
    queues: [
      new BullMQAdapter(verifyChat),
      new BullMQAdapter(broadcast),
      new BullMQAdapter(broadcastFlows),
      new BullMQAdapter(listFlow),
      new BullMQAdapter(deleteQueue),
    ],
    serverAdapter,
  });

  serverAdapter.setBasePath("/ui");
  server.register(serverAdapter.registerPlugin(), {
    prefix: "/ui",
    basePath: "/ui",
  });

  return server;
};
