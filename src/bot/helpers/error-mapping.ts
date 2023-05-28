export const errorMappings: Record<string, { [key: string]: boolean }> = {
  "Forbidden: user is deactivated": { deactivated: true },
  "Forbidden: bot was blocked by the user": { botBlocked: true },
  "Bad Request: chat not found": { notFound: true },
  "Bad Request: PEER_ID_INVALID": { notFound: true },
  "Forbidden: bot is not a member of the channel chat": {
    notMember: true,
  },
  "Bad Request: need administrator rights in the channel chat": {
    needAdminRights: true,
  },
  "Bad Request: CHAT_WRITE_FORBIDDEN": {
    needAdminRights: true,
  },
  "Forbidden: bot was kicked from the supergroup chat": {
    botKicked: true,
  },
  "Forbidden: bot was kicked from the channel chat": {
    botKicked: true,
  },
};
