import { apiRequest } from "@/shared/api/base";
import type { INotificationResponse } from "../model/notification";

export async function receiveNotifications(): Promise<INotificationResponse[]> {
  return apiRequest<INotificationResponse[]>("receiveNotification");
}
