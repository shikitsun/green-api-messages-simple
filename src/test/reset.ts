import { useInstanceStore } from "@/entities/instance";
import { useActiveChatStore } from "@/entities/chat/model/useActiveChat";
import { useLocalChatsStore } from "@/entities/chat";
import { useChatStore } from "@/entities/message";
import { useToasts } from "@/shared/model/useToasts";

export function resetStores() {
  useInstanceStore.getState().clearCredentials();
  useLocalChatsStore.getState().clear();
  useActiveChatStore.setState({ active: null });
  useChatStore.getState().reset();
  useChatStore.getState().clearDrafts();
  useToasts.getState().clear();
}
