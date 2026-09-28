export interface IChat {
  chatId: string;
  name: string;
  type: "group" | "user" | "bot";
  phoneNumber: number;
}
