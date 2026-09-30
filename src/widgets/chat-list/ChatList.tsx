import { useMemo, useState } from "react";
import styles from "./ChatList.module.css";
import {
  ChatPreview,
  ChatPreviewSkeleton,
  orderChatsByActivity,
  useActiveChatStore,
  useChats,
} from "@/entities/chat";
import { useChatStore } from "@/entities/message";
import { ButtonIcon } from "@/shared/ui/Button";
import { CreateChatModal } from "@/features/create-chat";

export default function ChatList() {
  const { data: chats, isLoading } = useChats();
  const messagesByChat = useChatStore((state) => state.messagesByChat);
  const [creatingChat, setCreatingChat] = useState(false);
  const { active, set } = useActiveChatStore();

  // the conversation that just received a message moves to the top
  const orderedChats = useMemo(
    () => orderChatsByActivity(chats, messagesByChat),
    [chats, messagesByChat],
  );

  return (
    <aside
      className={styles.container}
      data-chat-open={active ? "true" : undefined}
    >
      <header>
        <h2 className="title">Chats</h2>
        <ButtonIcon
          type="button"
          onClick={() => setCreatingChat(true)}
          aria-label="Find chat"
        >
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
        {isLoading && (
          <>
            <ChatPreviewSkeleton />
            <ChatPreviewSkeleton />
            <ChatPreviewSkeleton />
            <ChatPreviewSkeleton />
            <ChatPreviewSkeleton />
            <ChatPreviewSkeleton />
          </>
        )}

        {orderedChats.map((chat) => (
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
