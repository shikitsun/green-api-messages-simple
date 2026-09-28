import { apiRequest } from "@/shared/api/base";

export interface ICheckAccountResponse {
  exist: boolean;
  chatId: string;
  fromCache?: boolean;
}

export async function checkAccount(phoneNumber: number) {
  return apiRequest<ICheckAccountResponse>("checkAccount", {
    method: "POST",
    body: JSON.stringify({ phoneNumber }),
  });
}
