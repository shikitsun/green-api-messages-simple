import type { INotificationResponse } from "@/entities/message";

interface INotificationOverrides {
  receiptId?: number;
  typeWebhook?: string;
  chatId?: string;
  text?: string;
  idMessage?: string;
  timestamp?: number;
}

/** A webhook delivery shaped like the one `receiveNotification` hands back. */
export function createNotification({
  receiptId = 42,
  typeWebhook = "incomingMessageReceived",
  chatId = "79001112233",
  text = "hi from the recipient",
  idMessage = "msg-1",
  timestamp = 1712345678,
}: INotificationOverrides = {}): INotificationResponse {
  return {
    receiptId,
    body: {
      typeWebhook,
      instanceData: {
        idInstance: 1101000001,
        wid: "1101000001@c.us",
        typeInstance: "v3",
      },
      timestamp,
      idMessage,
      senderData: {
        chatId,
        chatName: "User1",
        chatType: "user",
        sender: chatId,
        senderName: "User1",
        senderType: "user",
        senderContactName: "User1",
        senderPhoneNumber: Number(chatId),
      },
      messageData: {
        typeMessage: "textMessage",
        textMessageData: { textMessage: text },
      },
    },
  };
}

/** Drops the message payload, the way service webhooks (`stateInstanceChanged`) arrive. */
export function withoutMessagePayload(notification: INotificationResponse) {
  const body = notification.body as Partial<INotificationResponse["body"]>;

  delete body.messageData;
  delete body.senderData;

  return notification;
}
