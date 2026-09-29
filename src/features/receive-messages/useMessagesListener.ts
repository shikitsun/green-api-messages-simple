import {
  deleteNotification,
  receiveNotifications,
  transformMessage,
  useChatStore,
} from "@/entities/message";
import { useCallback, useEffect, useRef } from "react";

export function useMessagesListener() {
  const addMessage = useChatStore((state) => state.addMessage);
  const isRunning = useRef(true);

  const poll = useCallback(async () => {
    let exponentialBackoff = 1;

    try {
      const response = await receiveNotifications();

      if (response && response.body) {
        const body = response.body;
        const chatId = body.senderData.chatId;
        addMessage(chatId, transformMessage(body, false));
        await deleteNotification(response.receiptId);
        // after success - reset
        exponentialBackoff = 1;
      }
    } catch (error) {
      console.error("Polling error:", error);
      exponentialBackoff += Math.E;
    } finally {
      if (isRunning.current) {
        setTimeout(poll, 10000 * exponentialBackoff);
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
