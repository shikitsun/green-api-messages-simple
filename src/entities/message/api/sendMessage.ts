import { apiRequest } from "@/shared/api/base";

interface ISendMessageResponse {
  idMessage: string;
}

export async function sendMessage(chatId: string, message: string) {
  return apiRequest<ISendMessageResponse>("sendMessage", {
    method: "POST",
    body: JSON.stringify({ chatId, message }),
  });
}
