import { getChats } from "@/entities/message";
import { useQuery } from "@tanstack/react-query";
import styles from "./ChatList.module.css";
import { ChatPreview } from "@/entities/chat";

export default function ChatList() {
  const chats = useQuery({
    queryKey: ["api", "chats"],
    queryFn: getChats,
  });

  return (
    <aside className={styles.container}>
      <header>
        <h2 className="title">Chats</h2>
      </header>

      <div>
        {chats.data?.map((chat) => (
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
