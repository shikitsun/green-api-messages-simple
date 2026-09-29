import {
  deleteNotification,
  receiveNotifications,
  transformMessage,
  useChatStore,
} from "@/entities/message";
import { toChatType, useLocalChatsStore } from "@/entities/chat";
import { ApiError } from "@/shared/api/ApiError";
import { useToasts } from "@/shared/model/useToasts";
import { useEffect } from "react";

const POLL_INTERVAL = 10_000;
const CONNECTION_LOST = "Connection to API lost. Retrying…";

interface ISenderData {
  chatId: string;
  chatName: string;
  chatType: string;
  senderPhoneNumber: number;
}

function rememberChat(senderData: ISenderData) {
  useLocalChatsStore.getState().add({
    chatId: senderData.chatId,
    name: senderData.chatName,
    type: toChatType(senderData.chatType),
    phoneNumber: senderData.senderPhoneNumber,
  });
}

export function useMessagesListener() {
  const addMessage = useChatStore((state) => state.addMessage);

  useEffect(() => {
    let isRunning = true;
    let exponentialBackoff = 1;
    let failureReported = false;

    const poll = async () => {
      if (!isRunning) return;

      try {
        const response = await receiveNotifications();

        exponentialBackoff = 1;
        failureReported = false;

        if (response?.body) {
          const body = response.body;

          if (body.typeWebhook === "incomingMessageReceived") {
            const message = transformMessage(body, false);

            if (message) {
              rememberChat(body.senderData);
              addMessage(body.senderData.chatId, message);
            }
          }

          await deleteNotification(response.receiptId);
        }
      } catch (error) {
        console.error("Polling error:", error);

        const isRefusedToken =
          error instanceof ApiError && error.isUnauthorized;

        if (!isRefusedToken && !failureReported) {
          failureReported = true;
          useToasts.getState().push("error", CONNECTION_LOST);
        }

        exponentialBackoff += Math.E;
      } finally {
        if (isRunning) {
          setTimeout(poll, POLL_INTERVAL * exponentialBackoff);
        }
      }
    };

    poll();

    return () => {
      isRunning = false;
    };
  }, [addMessage]);
}
