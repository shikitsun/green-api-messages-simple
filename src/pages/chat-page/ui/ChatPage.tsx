import { useMessagesListener } from "@/features/receive-messages/useMessagesListener";
import ChatList from "@/widgets/chat-list/ChatList";
import styles from "./ChatPage.module.css";
import ChatWindow from "@/widgets/chat-window/ChatWindow";
import { useActiveChatStore } from "@/entities/chat";

export default function Page() {
  useMessagesListener();
  const active = useActiveChatStore((state) => state.active);

  return (
    <div className={styles.container}>
      <ChatList />

      {active && <ChatWindow id={active} />}
    </div>
  );
}
