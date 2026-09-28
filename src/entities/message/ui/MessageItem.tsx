import type { IMessage } from "../model/useMessagesStore";
import styles from "./MessageItem.module.css";

interface IMessageItemProps extends IMessage {}

const intlTime = new Intl.DateTimeFormat(undefined, { timeStyle: "short" });
const intl = new Intl.DateTimeFormat(undefined, {
  timeStyle: "medium",
  dateStyle: "medium",
});

export function MessageItem({
  id,
  isOutgoing,
  text,
  timestamp,
}: IMessageItemProps) {
  return (
    <div
      className={styles.message}
      role="listitem"
      data-is-outgoing={isOutgoing || void 0}
    >
      <p>{text}</p>

      <time className="bubble-tag" dateTime={intl.format(timestamp * 1000)}>
        {intlTime.format(timestamp * 1000)}
      </time>
    </div>
  );
}
