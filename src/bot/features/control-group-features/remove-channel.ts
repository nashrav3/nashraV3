/* eslint-disable no-await-in-loop */
import { Composer } from "grammy";
import { Context } from "../../context";
import { logHandle } from "../../helpers/logging";

const composer = new Composer<Context>();
const feature = composer.chatType(["group", "supergroup"]);

feature.command(
  ["r", "rem", "remove"],
  logHandle("handle /rem"),
  async (ctx) => {
    const botId = ctx.me.id;
    const matches = [
      ...ctx.message.text.matchAll(
        /((?:https?:\/\/)?(?:t|telegram).(?:me|dog)\/|@)(?<username>(?!.*?_{2,})[a-z]\w{3,32})|(?<id>-\d{5,})/gi,
      ),
    ];
    const usernames: string[] = [];
    const ids: number[] = [];

    for (const match of matches) {
      if (match.groups?.username) {
        usernames.push(match.groups.username);
      }
      if (match.groups?.id) {
        ids.push(Number(match.groups.id));
      }
    }
    const chatsInList = await ctx.prisma.list.findMany({
      where: {
        botId,
        OR: [
          {
            chatId: {
              in: ids,
            },
          },
          {
            chat: {
              username: {
                in: usernames,
              },
            },
          },
        ],
      },
      include: {
        chat: {
          select: {
            username: true,
            link: true,
            name: true,
          },
        },
      },
    });
    const databaseUsernames = chatsInList
      .map((chat) => chat.chat.username)
      .filter(Boolean);

    const notFoundUsernames = usernames.filter(
      (item) => !databaseUsernames.includes(item),
    );
    const notFoundIdsChats = chatsInList.filter((chat) =>
      ids
        .filter((id) => !chatsInList.map((c) => Number(c.id)).includes(id))
        .includes(chat.id),
    ); // TODO: activate it
    // const { count } = await ctx.prisma.list.deleteMany({
    //   where: {
    //     botId,
    //     OR: [
    //       {
    //         chatId: {
    //           in: ids,
    //         },
    //       },
    //       {
    //         chat: {
    //           username: {
    //             in: usernames,
    //           },
    //         },
    //       },
    //     ],
    //   },
    // });

    const success = databaseUsernames.map((u) => `@${u}`).toString();
    // TODO: notFoundIdsChats not showing in the message fix it
    ctx.reply(
      ctx.t(`remove-channel.stats`, {
        success,
        notFoundUsernames: notFoundUsernames.map((u) => `@${u}`).toString(),
        notFoundIdsChats: notFoundIdsChats
          .map(
            (c) =>
              `${c.id} ${c.chat.name}: ${c.chat.link} ${
                c.chat.username ?? `@${c.chat.username}`
              }`,
          )
          .toString(),
      }),
    );
  },
);
export { composer as removeChannelFeature };
