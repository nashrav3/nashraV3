const shortError: Record<string, string> = {
  "Forbidden: user is deactivated": "user_deactivated",
  "Forbidden: bot was blocked by the user": "bot_blocked_by_user",
  "Bad Request: chat not found": "chat_not_found",
  "Bad Request: USER_IS_BOT": "USER_IS_BOT",
  "Bad Request: PEER_ID_INVALID": "PEER_ID_INVALID",
  "Forbidden: bot is not a member of the channel chat": "bot_not_member",
  "Bad Request: need administrator rights in the channel chat":
    "need_admin_rights",
  "Bad Request: CHAT_WRITE_FORBIDDEN": "CHAT_WRITE_FORBIDDEN",
  "Forbidden: bot was kicked from the supergroup chat": "bot_kicked",
  "Forbidden: bot was kicked from the channel chat": "bot_kicked",
};

export const getShortError = (error: string): string => {
  return shortError[error] || error;
};
