import { describe, expect, it } from "vitest";
import { useLocalChatsStore } from "./useLocalChatsStore";
import type { IChat } from "./chat";

const store = () => useLocalChatsStore.getState();

function chat(chatId: string, name = chatId): IChat {
  return { chatId, name, type: "user", phoneNumber: Number(chatId) };
}

describe("useLocalChatsStore", () => {
  it("keeps a chat the browser learned about", () => {
    store().add(chat("79001112233"));

    expect(store().chats).toEqual([
      {
        chatId: "79001112233",
        name: "79001112233",
        type: "user",
        phoneNumber: 79001112233,
      },
    ]);
  });

  it("keeps the newest chat first", () => {
    store().add(chat("79001112233"));
    store().add(chat("79112223344"));

    expect(store().chats.map((known) => known.chatId)).toEqual([
      "79112223344",
      "79001112233",
    ]);
  });

  it("ignores a chat it already knows", () => {
    store().add(chat("79001112233", "First name"));
    store().add(chat("79001112233", "Second name"));

    expect(store().chats).toHaveLength(1);
    expect(store().chats[0].name).toBe("First name");
  });

  it("keeps the name and type a contact reported", () => {
    store().add({
      chatId: "79001112233",
      name: "Alexey",
      type: "group",
      phoneNumber: 79001112233,
    });

    expect(store().chats[0]).toMatchObject({ name: "Alexey", type: "group" });
  });

  it("clears the list", () => {
    store().add(chat("79001112233"));

    store().clear();

    expect(store().chats).toEqual([]);
  });
});
