import { useEffect, useRef } from "react";
import { useActiveChatStore, useLocalChatsStore } from "@/entities/chat";
import { useInstanceStore } from "@/entities/instance";
import { useChatStore } from "@/entities/message";
import { queryClient } from "../providers/queryClient";

/**
 * Clear session from API data
 */
export function useSessionTeardown() {
  const idInstance = useInstanceStore((state) => state.idInstance);
  const hadSession = useRef(false);

  useEffect(() => {
    if (idInstance) {
      hadSession.current = true;

      return;
    }

    if (!hadSession.current) return;

    hadSession.current = false;
    queryClient.clear();
    useChatStore.getState().reset();
    useLocalChatsStore.getState().clear();
    useActiveChatStore.setState({ active: null });
  }, [idInstance]);
}
