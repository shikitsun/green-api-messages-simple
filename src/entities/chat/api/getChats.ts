import { apiRequest } from "@/shared/api/base";
import { type IChat } from "../model/chat";

export async function getChats() {
  return apiRequest<IChat[]>("getChats");
}
