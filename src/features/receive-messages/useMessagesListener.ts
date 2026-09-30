import {
  deleteNotification,
  receiveNotifications,
  transformMessage,
  useChatStore,
} from "@/entities/message";
import { toChatType, useLocalChatsStore } from "@/entities/chat";
import {
  ApiError,
  ApiTimeoutError,
  ApiUnreachableError,
} from "@/shared/api/errors";
import { useToasts } from "@/shared/model/useToasts";
import { useEffect } from "react";

const POLL_INTERVAL = 10_000;
const MAX_POLL_INTERVAL = 60_000;
const INSTANCE_STATE_PAUSE = 60 * 60 * 1000;
const CONNECTION_LOST = "Connection to API lost. Retrying.";

type TPollFailure =
  | "unauthorized"
  | "throttled"
  | "unavailable"
  | "timeout"
  | "unreachable"
  | "rejected"
  | "unknown";

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

function classifyFailure(error: unknown): TPollFailure {
  if (error instanceof ApiTimeoutError) return "timeout";
  if (error instanceof ApiUnreachableError) return "unreachable";
  if (!(error instanceof ApiError)) return "unknown";

  if (error.isUnauthorized) return "unauthorized";
  if (error.isThrottled) return "throttled";
  if (error.isUnavailable) return "unavailable";

  return "rejected";
}

function failureText(error: unknown, failure: TPollFailure): string | null {
  switch (failure) {
    case "unauthorized":
      return null;
    case "throttled":
      return "Rate limiting.";
    case "unavailable":
      return `Unavailable (${(error as ApiError).status}). Retrying.`;
    case "timeout":
      return "Did not answer in time. Retrying.";
    case "unreachable":
      return CONNECTION_LOST;
    case "rejected":
      return (error as Error).message || CONNECTION_LOST;
    default:
      return CONNECTION_LOST;
  }
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
    let reportedFailure: string | null = null;

    const poll = async () => {
      if (!isRunning) return;

      try {
        const response = await receiveNotifications();

        interval = POLL_INTERVAL;
        reportedFailure = null;

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

        const text = failureText(error, classifyFailure(error));

        if (text && text !== reportedFailure) {
          reportedFailure = text;
          useToasts.getState().push("error", text);
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
