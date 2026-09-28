import { apiRequest } from "@/shared/api/base";

export interface IDeleteNotificationResponse {
  result: boolean;
  reason: string;
}

export async function deleteNotification(receiptId: number) {
  return apiRequest<IDeleteNotificationResponse>(
    `deleteNotification/${receiptId}`,
  );
}
