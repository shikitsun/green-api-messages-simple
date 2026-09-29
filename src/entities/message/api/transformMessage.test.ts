import { describe, expect, it } from "vitest";
import { transformMessage } from "./transformMessage";
import type { WebhookBody } from "../model/notification";

function createBody(overrides: Partial<WebhookBody> = {}): WebhookBody {
  return {
    typeWebhook: "incomingMessageReceived",
    instanceData: {
      idInstance: 1101000001,
      wid: "1101000001@uc.s",
      typeInstance: "v3",
    },
    timestamp: 1712345678,
    idMessage: "msg-1",
    senderData: {
      chatId: "79001112233",
      chatName: "User1",
      chatType: "user",
      sender: "79001112233",
      senderName: "User1",
      senderType: "user",
      senderContactName: "User1",
      senderPhoneNumber: 79001112233,
    },
    messageData: {
      typeMessage: "textMessage",
      textMessageData: { textMessage: "hey" },
    },
    ...overrides,
  };
}

describe("transformMessage", () => {
  it("maps a text webhook onto a chat message", () => {
    expect(transformMessage(createBody(), false)).toEqual({
      id: "msg-1",
      text: "hey",
      timestamp: 1712345678,
      isOutgoing: false,
    });
  });

  it("keeps the outgoing direction it is called with", () => {
    expect(transformMessage(createBody(), true)?.isOutgoing).toBe(true);
  });

  it("skips message types that have nothing to render", () => {
    const body = createBody({
      messageData: {
        typeMessage: "imageMessage",
        textMessageData: { textMessage: "" },
      },
    });

    expect(transformMessage(body, false)).toBeNull();
  });
});
