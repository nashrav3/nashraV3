import { InlineKeyboard } from "grammy";
import { i18n } from "~/bot/i18n";

export const broadcastStatusKeyboard = async (
  jobId: string,
  languageCode = "en",
) => {
  return InlineKeyboard.from([
    [
      {
        text: i18n.t(languageCode, "broadcast-status-keyboard.delete"),
        callback_data: `del=${jobId}`,
      },
      {
        text: i18n.t(languageCode, "broadcast-status-keyboard.resend"),
        callback_data: `resend=${jobId}`,
      },
    ],
  ]);
};
