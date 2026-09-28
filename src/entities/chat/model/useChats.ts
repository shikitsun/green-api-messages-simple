import { useQuery } from "@tanstack/react-query";
import { getChats } from "../api/getChats";
import { usePendingChatsStore } from "./usePendingChatsStore";
import { useMemo } from "react";

export function useChats() {
  const chats = useQuery({
    queryKey: ["api", "chats"],
    queryFn: getChats,
  });

  const pending = usePendingChatsStore();

  const all = useMemo(() => {
    // don't check chats already exists there or not
    return [...pending.chats, ...(chats.data ?? [])];
  }, [chats.data, pending.chats]);

  return all;
}
