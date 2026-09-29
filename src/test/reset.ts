import { useInstanceStore } from "@/entities/instance";
import { useActiveChatStore } from "@/entities/chat/model/useActiveChat";
import { usePendingChatsStore } from "@/entities/chat/model/usePendingChatsStore";
import { useChatStore } from "@/entities/message";

export function resetStores() {
  useInstanceStore.getState().clearCredentials();
  usePendingChatsStore.getState().clear();
  useActiveChatStore.setState({ active: null });
  useChatStore.getState().reset();
}
