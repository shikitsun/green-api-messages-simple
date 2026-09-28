import type { IChat } from "../model/chat";
import styles from "./ChatAvatar.module.css";

// Because via API by default we get only name
// Use it for creating image-like avatar
export function ChatAvatar({ name }: Pick<IChat, "name">) {
  return (
    <div className={styles["text-avatar"]} role="figure">
      {[...(name || "")][0]}
    </div>
  );
}
