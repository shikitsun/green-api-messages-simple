import type { IChat } from "./chat";

interface ITimestamped {
  timestamp: number;
}

/**
 * Messengers order conversations by activity: the chat that just got a message goes to
 * the top. Chats without a single message keep the order they came in with - locally
 * known ones first, then whatever `getChats` returned - so a freshly created chat does
 * not sink to the bottom.
 */
export function orderChatsByActivity(
  chats: IChat[],
  messagesByChat: Record<string, readonly ITimestamped[]>,
): IChat[] {
  const lastMessageAt = (chatId: string) => {
    const messages = messagesByChat[chatId];

    return messages?.length ? messages[messages.length - 1].timestamp : 0;
  };

  return [...chats].sort(
    (a, b) => lastMessageAt(b.chatId) - lastMessageAt(a.chatId),
  );
}
