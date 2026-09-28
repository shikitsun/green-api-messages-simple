import type { IMessage } from "../model/useMessagesStore";

interface IMessageItemProps extends IMessage {}

export function MessageItem({
  id,
  isOutgoing,
  text,
  timestamp,
}: IMessageItemProps) {
  return <div role="listitem">{text}</div>;
}
