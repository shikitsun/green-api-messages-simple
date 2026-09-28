import { apiRequest } from "@/shared/api/base";
import type { INotificationResponse } from "../model/notification";
import { transformMessage } from "./transformMessage";
import type { IMessage } from "../model/useMessagesStore";

export async function receiveNotifications(): Promise<IMessage | null> {
  const result = await apiRequest<INotificationResponse>("receiveNotification");
  if (result) {
    return transformMessage(result.body, false);
  }

  return null;
}
