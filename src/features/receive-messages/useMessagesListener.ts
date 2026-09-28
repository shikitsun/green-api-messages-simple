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
    try {
      const response = await receiveNotifications();

      if (response && response.body) {
        const body = response.body;
        const chatId = body.senderData.chatId;
        const newMsg = transformMessage(body, false);
        addMessage(chatId, newMsg);
        await deleteNotification(response.receiptId);
      }
    } catch (error) {
      console.error("Polling error:", error);
    } finally {
      if (isRunning.current) {
        setTimeout(poll, 10000);
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
