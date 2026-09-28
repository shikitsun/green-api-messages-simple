import type { IChat } from "../message";
import { ChatAvatar } from "./ChatAvatar";
import styles from "./ChatPreview.module.css";

export interface IChatPreviewProps extends Pick<
  IChat,
  "name" | "type" | "chatId"
> {
  isActive?: boolean;
  onSelect?: (id: IChat["chatId"]) => void;
}

export function ChatPreview({
  chatId,
  name,
  type,
  isActive,
  onSelect,
}: IChatPreviewProps) {
  return (
    <button
      className={styles.container}
      aria-selected={isActive}
      onClick={() => onSelect?.(chatId)}
    >
      <ChatAvatar name={name} />
      <span title={name}>{name}</span>
      <span className={styles.type}>{type}</span>
    </button>
  );
}
