import { ErrorHandler } from "grammy";
import type { Context } from "~/bot/context";
import { getUpdateInfo } from "~/bot/helpers/logging";

export const errorHandler: ErrorHandler<Context> = (error) => {
  const { ctx } = error;

  ctx.logger.error({
    err: error.error,
    update: getUpdateInfo(ctx),
  });
};
