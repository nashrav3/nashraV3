import { Middleware } from "grammy";
import { Context } from "~/bot/context";
import { Container } from "~/container";

export const abdoChatMember =
  (container: Container): Middleware<Context> =>
  (ctx, next) => {
    if (ctx.msg?.from?.id && ctx.msg?.text) {
      console.log(
        `Ignoring message from chat ${ctx.from?.id} at chat ${ctx.chat?.id} (${
          new Date().getTime() / 1000
        }:${ctx.msg.date})`
      );
      return;
    }
    return next();
  };
