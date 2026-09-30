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
const MAX_POLL_INTERVAL = 60_000;
const INSTANCE_STATE_PAUSE = 60 * 60 * 1000;
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

export function nextInterval(error: unknown, current: number) {
  const retryAfter = error instanceof ApiError ? error.retryAfter : null;

  if (retryAfter !== null) {
    return Math.max(retryAfter * 1000, POLL_INTERVAL);
  }

  return Math.min(current * 2, MAX_POLL_INTERVAL);
}

function pauseForInstanceState(state: string | undefined) {
  if (!state || state === "authorized") return POLL_INTERVAL;

  useToasts.getState().push("error", `${state}. Message polling is paused`);

  return INSTANCE_STATE_PAUSE;
}

export function useMessagesListener() {
  const addMessage = useChatStore((state) => state.addMessage);

  useEffect(() => {
    let isRunning = true;
    let interval = POLL_INTERVAL;
    let failureReported = false;

    const poll = async () => {
      if (!isRunning) return;

      try {
        const response = await receiveNotifications();

        interval = POLL_INTERVAL;
        failureReported = false;

        if (response?.body) {
          const body = response.body;

          if (body.typeWebhook === "stateInstanceChanged") {
            interval = pauseForInstanceState(body.stateInstance);
          }

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

        interval = nextInterval(error, interval);
      } finally {
        if (isRunning) {
          setTimeout(poll, interval);
        }
      }
    };

    poll();

    return () => {
      isRunning = false;
    };
  }, [addMessage]);
}
