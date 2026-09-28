import { useState } from "react";
import styles from "./ChatList.module.css";
import { ChatPreview, useActiveChatStore, useChats } from "@/entities/chat";
import { ButtonIcon } from "@/shared/ui/Button";
import { CreateChatModal } from "@/features/create-chat";

export default function ChatList() {
  const chats = useChats();
  const [creatingChat, setCreatingChat] = useState(false);
  const { active, set } = useActiveChatStore();

  return (
    <aside className={styles.container}>
      <header>
        <h2 className="title">Chats</h2>
        <ButtonIcon type="button" onClick={() => setCreatingChat(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </ButtonIcon>
      </header>

      {creatingChat && (
        <CreateChatModal
          onSuccess={(value) => {
            set(value);
            setCreatingChat(false);
          }}
          onClose={() => setCreatingChat(false)}
        />
      )}

      <div>
        {chats.map((chat) => (
          <ChatPreview
            key={chat.chatId}
            chatId={chat.chatId}
            name={chat.name}
            type={chat.type}
            isActive={active === chat.chatId}
            onSelect={set}
          />
        ))}
      </div>
    </aside>
  );
}
