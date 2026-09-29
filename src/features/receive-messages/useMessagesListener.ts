import {
  deleteNotification,
  receiveNotifications,
  transformMessage,
  useChatStore,
} from "@/entities/message";
import { useCallback, useEffect, useRef } from "react";

const POLL_INTERVAL = 10_000;

export function useMessagesListener() {
  const addMessage = useChatStore((state) => state.addMessage);
  const isRunning = useRef(true);
  const exponentialBackoff = useRef(1);

  const poll = useCallback(async () => {
    if (!isRunning.current) return;

    try {
      const response = await receiveNotifications();

      if (response?.body) {
        const body = response.body;
        addMessage(body.senderData.chatId, transformMessage(body, false));

        await deleteNotification(response.receiptId);
        exponentialBackoff.current = 1;
      }
    } catch (error) {
      console.error("Polling error:", error);
      exponentialBackoff.current += Math.E;
    } finally {
      if (isRunning.current) {
        setTimeout(poll, POLL_INTERVAL * exponentialBackoff.current);
      }
    }
  }, [addMessage]);

  useEffect(() => {
    isRunning.current = true;
    poll();

    return () => {
      isRunning.current = false;
    };
  }, [poll]);
}
