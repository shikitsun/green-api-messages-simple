import { MessageItem, useChatStore, type IMessage } from "@/entities/message";
import styles from "./ChatWindow.module.css";
import { SendMessage } from "@/features/send-message/ui/SendMessage";
import { useActionState, useLayoutEffect, useOptimistic, useRef } from "react";
import { sendMessage } from "@/entities/message/api/sendMessage";

const FOLLOW_THRESHOLD = 80;

export default function ChatWindow({ id }: { id: string }) {
  const messages = useChatStore((state) => state.messagesByChat[id]);
  const add = useChatStore((state) => state.addMessage);
  const setDraft = useChatStore((state) => state.setDraft);

  const listRef = useRef<HTMLDivElement>(null);
  const followsLatest = useRef(true);

  const [optimisticMessages, setOptimisticMessages] = useOptimistic(
    messages ?? [],
    (state, message: IMessage) => {
      return [...state, message];
    },
  );

  const [errorMessage, action, isPending] = useActionState(
    async (_: string, formData: FormData) => {
      const text = formData.get("text") as string;
      if (!text.trim()) return "Message is empty";

      const chatId = formData.get("id") as string;
      const trimmedText = text.trim();

      try {
        const message: IMessage = {
          id: `${Math.random() * -1}`,
          isOutgoing: true,
          text: trimmedText,
          timestamp: Date.now() / 1000,
        };
        setOptimisticMessages(message);
        const { idMessage } = await sendMessage(chatId, trimmedText);
        add(chatId, { ...message, id: idMessage });
        setDraft(chatId, "");
      } catch (e) {
        if (e instanceof Error) return e.message;
        return "Unknown error";
      }

      return "";
    },
    "",
  );

  useLayoutEffect(() => {
    const list = listRef.current;

    if (list && followsLatest.current) list.scrollTop = list.scrollHeight;
  }, [optimisticMessages.length]);

  const handleScroll = () => {
    const list = listRef.current;

    if (!list) return;

    followsLatest.current =
      list.scrollHeight - list.scrollTop - list.clientHeight <=
      FOLLOW_THRESHOLD;
  };

  return (
    <div className={styles.container}>
      <div className={styles.list} ref={listRef} onScroll={handleScroll}>
        {/* can add virtual scrolling via tanstack virtual or virtua, but for now keep it simple */}
        {optimisticMessages?.map((message) => (
          <MessageItem key={message.id} {...message} />
        ))}
      </div>

      <div className={styles.send}>
        <SendMessage target={id} action={action} isPending={isPending} />
        {errorMessage && <p className={"error-message"}>{errorMessage}</p>}
      </div>
    </div>
  );
}
