import type { WebhookBody } from "../model/notification";
import type { IMessage } from "../model/useMessagesStore";

export function transformMessage(
  body: WebhookBody,
  isOutgoing: boolean,
): IMessage | null {
  if (body.messageData.typeMessage !== "textMessage") return null;

  return {
    id: body.idMessage,
    text: body.messageData.textMessageData.textMessage,
    timestamp: body.timestamp,
    isOutgoing: isOutgoing,
  };
}
