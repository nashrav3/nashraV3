import { Middleware } from "grammy";
import { Context } from "~/bot/context";

export const abdoIgnoreOld =
  (threshold = 5 * 60): Middleware<Context> =>
  (ctx, next) => {
    if (
      ctx.msg?.date &&
      new Date().getTime() / 1000 - ctx.msg.date > threshold &&
      !ctx.callbackQuery &&
      !ctx.msg.edit_date
    ) {
      console.log(
        `Ignoring message from user ${ctx.from?.id} at chat ${ctx.chat?.id} (${
          new Date().getTime() / 1000
        }:${ctx.msg.date})`
      );
      return;
    }
    return next();
  };
