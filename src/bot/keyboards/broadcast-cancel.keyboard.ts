import { InlineKeyboard } from "grammy";
import { i18n } from "~/bot/i18n";

export const broadcastCancelKeyboard = async (
  jobId: string,
  languageCode = "en",
) => {
  return InlineKeyboard.from([
    [
      {
        text: i18n.t(languageCode, "broadcast-status-keyboard.cancel"),
        callback_data: `cancel=${jobId}`,
      },
    ],
  ]);
};
