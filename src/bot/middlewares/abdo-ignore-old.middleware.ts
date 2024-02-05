import { Middleware } from "grammy";
import { Context } from "~/bot/context";

export const abdoIgnoreOld =
  (threshold = 5 * 60): Middleware<Context> =>
  (ctx, next) => {
    if (
      ctx.msg?.date &&
      Date.now() / 1000 - ctx.msg.date > threshold &&
      !ctx.callbackQuery &&
      !ctx.msg.edit_date
    ) {
      // Remove the console.log statement
      // console.log(
      //   `Ignoring message from chat ${ctx.from?.id} at chat ${ctx.chat?.id} (${
      //     Date.now() / 1000
      //   }:${ctx.msg.date})`,
      // );
      return;
    }
    return next();
  };
