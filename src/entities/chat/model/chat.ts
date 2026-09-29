export interface IChat {
  chatId: string;
  name: string;
  type: "group" | "user" | "bot";
  phoneNumber: number;
}

/** Green API reports the chat type as a plain string; anything unusual is a direct chat. */
export function toChatType(value: unknown): IChat["type"] {
  return value === "group" || value === "bot" ? value : "user";
}
