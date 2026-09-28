import type { WebhookBody } from "../model/notification";
import type { IMessage } from "../model/useMessagesStore";

export function transformMessage(
  body: WebhookBody,
  isOutgoing: boolean,
): IMessage {
  return {
    id: body.idMessage,
    text:
      body.messageData.typeMessage === "textMessage"
        ? body.messageData.textMessageData.textMessage
        : "",
    timestamp: body.timestamp,
    isOutgoing: isOutgoing,
  };
}
