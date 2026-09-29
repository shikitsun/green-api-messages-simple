import { checkAccount } from "@/entities/chat";

export type TCreateChatResult = { error: string } | { payload: string };

export async function createChat(target: number): Promise<TCreateChatResult> {
  try {
    const checkResult = await checkAccount(target);
    if (!checkResult.exist) return { error: "No account for given user" };
    return { payload: checkResult.chatId };
  } catch (e) {
    if (e instanceof Error) return { error: e.message };
  }

  return { error: "Unknown error" };
}
