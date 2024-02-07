import { Keyboard } from "grammy";
import { Context } from "../context";

export const startPrivateKeyboard = async (ctx: Context) => {
  return Keyboard.from([
    [
      {
        text: ctx.t("start-private-keyboard.create-post"),
      },
      {
        text: ctx.t("start-private-keyboard.edit-post"),
      },
    ],
    [
      {
        text: ctx.t("start-private-keyboard.change-language"),
      },
      {
        text: ctx.t("start-private-keyboard.instructions"),
      },
    ],
    [
      {
        text: ctx.t("start-private-keyboard.create-your-own-bot"),
      },
    ],
  ]).resized();
};
