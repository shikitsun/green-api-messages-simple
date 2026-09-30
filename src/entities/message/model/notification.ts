export interface INotificationResponse {
  receiptId: number;
  body: WebhookBody;
}

export interface WebhookBody {
  typeWebhook: string;
  instanceData: InstanceData;
  timestamp: number;
  idMessage: string;
  senderData: SenderData;
  messageData: MessageData;
  stateInstance?: string;
}

export interface InstanceData {
  idInstance: number;
  wid: string;
  typeInstance: string;
}

export interface SenderData {
  chatId: string;
  chatName: string;
  chatType: string;
  sender: string;
  senderName: string;
  senderType: string;
  senderContactName: string;
  senderPhoneNumber: number;
}

export interface MessageData {
  typeMessage: string;
  textMessageData: TextMessageData;
}

export interface TextMessageData {
  textMessage: string;
}
