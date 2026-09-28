import styles from "./ChatList.module.css";
import { ChatPreview, useChats } from "@/entities/chat";

export default function ChatList() {
  const chats = useChats();

  return (
    <aside className={styles.container}>
      <header>
        <h2 className="title">Chats</h2>
      </header>

      <div>
        {chats.map((chat) => (
          <ChatPreview
            key={chat.chatId}
            chatId={chat.chatId}
            name={chat.name}
            type={chat.type}
          />
        ))}
      </div>
    </aside>
  );
}
