import { http, HttpResponse } from "msw";
import { randomWaiting } from "./utils";

const RANDOM_NAMES = ["Alexey", "Maria", "Dmitryi", "Elena", "Ivan", "Olga"];
const RANDOM_NUMBERS = [79001112233, 79112223344, 79223334455, 79334445566];

let mockNotificationQueue: any[] = [];

function getEndpoint(endpoint: string) {
  return `${import.meta.env.VITE_GREEN_API_BASE}/waInstancetest/${endpoint}/:apiTokenInstance`;
}

const MOCK_CHATS = [
  {
    chatId: "79001112233",
    name: "User1",
    type: "user",
    phoneNumber: 79001112233,
  },
  {
    chatId: "79112223344",
    name: "User2",
    type: "user",
    phoneNumber: 79112223344,
  },
  {
    chatId: "79223334455",
    name: "Group1",
    type: "group",
    phoneNumber: 79223334455,
  },
];

function generateRandomMessage() {
  const randomName =
    RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  const randomPhone =
    RANDOM_NUMBERS[Math.floor(Math.random() * RANDOM_NUMBERS.length)];
  const receiptId = Math.floor(Math.random() * 1000000);

  return {
    receiptId: receiptId,
    body: {
      typeWebhook: "incomingMessageReceived",
      timestamp: Date.now(),
      idMessage: `rand-${receiptId}`,
      senderData: {
        chatId: String(randomPhone),
        chatName: randomName,
        chatType: "user",
        sender: String(randomPhone),
        senderName: randomName,
        senderType: "user",
        senderContactName: randomName,
        senderPhoneNumber: randomPhone,
      },
      messageData: {
        typeMessage: "textMessage",
        textMessageData: {
          textMessage: `Random message from ${randomName} (${Date.now() % 100})`,
        },
      },
    },
  };
}

export const chatHandlers = [
  http.post(getEndpoint("checkAccount"), async ({ request }) => {
    const body = await request.json();
    const phoneNumber = (body as { phoneNumber: number }).phoneNumber;
    const isExist = RANDOM_NUMBERS.includes(phoneNumber);
    await randomWaiting(5000);
    return HttpResponse.json({
      exist: isExist,
      chatId: isExist ? String(phoneNumber) : null,
    });
  }),

  http.get(getEndpoint("getChats"), async () => {
    await randomWaiting(10000);
    return HttpResponse.json(MOCK_CHATS);
  }),

  http.get(getEndpoint("receiveNotification"), async ({ request }) => {
    if (mockNotificationQueue.length === 0) {
      return new HttpResponse(null, { status: 204 });
    }

    const nextMsg = mockNotificationQueue[0];
    await randomWaiting(2000);
    return HttpResponse.json(nextMsg);
  }),

  http.delete(
    `${import.meta.env.VITE_GREEN_API_BASE}/waInstancetest/deleteNotification/:apiTokenInstance/:receiptId`,
    async ({ params }) => {
      const rId = Number(params.receiptId);
      const index = mockNotificationQueue.findIndex((m) => m.receiptId === rId);

      if (index !== -1) {
        mockNotificationQueue.splice(index, 1);
        return HttpResponse.json({ status: "ok" });
      }
      await randomWaiting(1000);
      return new HttpResponse(null, { status: 404 });
    },
  ),

  http.post(getEndpoint("sendMessage"), async ({ request }) => {
    const body = (await request.json()) as { chatId: string; message: string };
    mockNotificationQueue.push({
      receiptId: Math.floor(Math.random() * 1000000),
      body: {
        typeWebhook: "incomingMessageReceived",
        timestamp: Date.now(),
        idMessage: `user-${Date.now()}-${Math.random()}`,
        senderData: {
          chatId: String(body.chatId),
          chatName: "Contact",
          chatType: "user",
          sender: String(body.chatId),
          senderName: "You",
          senderType: "user",
          senderContactName: "chatId",
          senderPhoneNumber: body.chatId,
        },
        messageData: {
          typeMessage: "textMessage",
          textMessageData: { textMessage: body.message },
        },
      },
    });
    await randomWaiting(10000);
    return HttpResponse.json({ status: "success" });
  }),

  http.post("**/injectRandomMessages", async ({ request }) => {
    const { count = 5 } = (await request.json()) as { count: number };
    for (let i = 0; i < count; i++) {
      mockNotificationQueue.push(generateRandomMessage());
    }
    return HttpResponse.json({ message: `Added ${count} messages to queue` });
  }),
];
