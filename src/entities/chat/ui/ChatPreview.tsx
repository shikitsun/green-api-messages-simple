import type { IChat } from "../model/chat";
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

export function ChatPreviewSkeleton() {
  return (
    <button className={styles.skeleton}>
      <span className={styles["skeleton-avatar"]}></span>
      <span className={styles["skeleton-name"]}></span>
      <span className={styles["skeleton-type"]}></span>
    </button>
  );
}
