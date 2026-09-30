import { useMessagesListener } from "@/features/receive-messages/useMessagesListener";
import ChatList from "@/widgets/chat-list/ChatList";
import styles from "./ChatPage.module.css";
import { useActiveChatStore, useChats } from "@/entities/chat";
import { lazy, Suspense } from "react";
import { LoadSpinIcon } from "@/shared/ui/LoadSpin";
import { ButtonIcon } from "@/shared/ui/Button";

const chatWindowPromise = import("@/widgets/chat-window/ChatWindow");
const ChatWindow = lazy(() => chatWindowPromise);

export default function Page() {
  useMessagesListener();
  const active = useActiveChatStore((state) => state.active);
  const closeChat = useActiveChatStore((state) => state.clear);
  const { data: chats } = useChats();

  const title = chats.find((chat) => chat.chatId === active)?.name ?? active;

  return (
    <div className={styles.container}>
      <ChatList />

      {active && (
        <section className={styles.pane}>
          <header className={styles.header}>
            <ButtonIcon
              type="button"
              aria-label="Back to chats"
              onClick={closeChat}
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
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
            </ButtonIcon>

            <h2 className="subheader" title={title ?? undefined}>
              {title}
            </h2>
          </header>

          <div className={styles.body}>
            <Suspense
              fallback={
                <div className={styles.spinner}>
                  <LoadSpinIcon />
                </div>
              }
            >
              <ChatWindow key={active} id={active} />
            </Suspense>
          </div>
        </section>
      )}
    </div>
  );
}
