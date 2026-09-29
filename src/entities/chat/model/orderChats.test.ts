import { describe, expect, it } from "vitest";
import { orderChatsByActivity } from "./orderChats";
import type { IChat } from "./chat";

const CHATS: IChat[] = [
  { chatId: "79001112233", name: "User1", type: "user", phoneNumber: 79001112233 },
  { chatId: "79112223344", name: "User2", type: "user", phoneNumber: 79112223344 },
  { chatId: "79223334455", name: "Group1", type: "group", phoneNumber: 79223334455 },
];

const history = (timestamps: number[]) =>
  timestamps.map((timestamp, index) => ({ timestamp: timestamp + index }));

const ids = (chats: IChat[]) => chats.map((chat) => chat.chatId);

describe("orderChatsByActivity", () => {
  it("keeps the order it was given when nothing was ever said", () => {
    expect(ids(orderChatsByActivity(CHATS, {}))).toEqual([
      "79001112233",
      "79112223344",
      "79223334455",
    ]);
  });

  it("moves the chat with the newest message to the top", () => {
    const ordered = orderChatsByActivity(CHATS, {
      "79001112233": history([100]),
      "79223334455": history([300]),
    });

    expect(ids(ordered)).toEqual([
      "79223334455",
      "79001112233",
      "79112223344",
    ]);
  });

  it("compares the newest message of a chat, not the oldest", () => {
    const ordered = orderChatsByActivity(CHATS, {
      "79001112233": history([100, 400]),
      "79112223344": history([200]),
    });

    expect(ids(ordered)).toEqual([
      "79001112233",
      "79112223344",
      "79223334455",
    ]);
  });

  it("treats a chat without history as idle", () => {
    const ordered = orderChatsByActivity(CHATS, { "79001112233": [] });

    expect(ids(ordered)).toEqual([
      "79001112233",
      "79112223344",
      "79223334455",
    ]);
  });

  it("does not touch the array it was given", () => {
    const chats = [...CHATS];

    orderChatsByActivity(chats, { "79223334455": history([300]) });

    expect(chats).toEqual(CHATS);
  });
});
