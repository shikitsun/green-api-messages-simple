import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getChats } from "../api/getChats";
import { useLocalChatsStore } from "./useLocalChatsStore";
import type { IChat } from "./chat";

export function useChats() {
  const chats = useQuery({
    queryKey: ["api", "chats"],
    queryFn: getChats,
  });

  const localChats = useLocalChatsStore((state) => state.chats);

  const all = useMemo(() => {
    const byId = new Map<string, IChat>();

    // locally known chats first; the API is authoritative for the ones it reports
    for (const chat of [...localChats, ...(chats.data ?? [])]) {
      byId.set(chat.chatId, chat);
    }

    return [...byId.values()];
  }, [chats.data, localChats]);

  return { data: all, isLoading: chats.isLoading && !localChats.length };
}
