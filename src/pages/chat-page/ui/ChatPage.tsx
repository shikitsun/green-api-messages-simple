import { useMessagesListener } from "@/features/receive-messages/useMessagesListener";
import ChatList from "@/widgets/chat-list/ChatList";
import styles from "./ChatPage.module.css";
import { useActiveChatStore } from "@/entities/chat";
import { lazy, Suspense } from "react";
import { LoadSpinIcon } from "@/shared/ui/LoadSpin";

const chatWindowPromise = import("@/widgets/chat-window/ChatWindow");
const ChatWindow = lazy(() => chatWindowPromise);

export default function Page() {
  useMessagesListener();
  const active = useActiveChatStore((state) => state.active);

  return (
    <div className={styles.container}>
      <ChatList />

      {active && (
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <LoadSpinIcon />
            </div>
          }
        >
          <ChatWindow key={active} id={active} />
        </Suspense>
      )}
    </div>
  );
}
