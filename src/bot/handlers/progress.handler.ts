import type { UserFromGetMe } from "@grammyjs/types";
import type { Job } from "bullmq";
import { Bot } from "grammy";
import type { BroadcastFlowsData } from "~/queues";
import { progressBar } from "../helpers/progress-bar";
import { getRandomEmojiString } from "../helpers/random-emojis";
import { tokenToBotId } from "../helpers/token-to-id";

export const broadcastFlowProgressHandler = async (
  job: Job<BroadcastFlowsData>,
) => {
  const { chatId, doneCount, totalCount, token, statusMessageId } = job.data;
  const botId = tokenToBotId(token);

  const jobBot = new Bot(token, {
    botInfo: { id: botId } as UserFromGetMe,
  });
  let pb = "";
  pb = progressBar({
    value: doneCount,
    length: 20,
    vmin: 0,
    vmax: totalCount,
    progressive: false,
  });
  const statusMessageText = `Broadcasting to ${totalCount}\n\n${pb}\n\n${getRandomEmojiString()} `;
  jobBot.api
    .editMessageText(chatId, statusMessageId, statusMessageText, {
      parse_mode: "HTML",
    })
    .catch(async (error) => {
      // eslint-disable-next-line no-console
      if (error.error_code === 400) {
        const statusMessage = await jobBot.api.sendMessage(
          chatId,
          statusMessageText,
          {
            parse_mode: "HTML",
          },
        );
        job.updateData({
          ...job.data,
          statusMessageId: statusMessage.message_id,
        });
      } else {
        throw error;
      }
    });
};
