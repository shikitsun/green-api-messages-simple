import { MessageItem, useChatStore, type IMessage } from "@/entities/message";
import styles from "./ChatWindow.module.css";
import { SendMessage } from "@/features/send-message/ui/SendMessage";
import { useActionState, useOptimistic } from "react";
import { sendMessage } from "@/entities/message/api/sendMessage";

export default function ChatWindow({ id }: { id: string }) {
  const messages = useChatStore((state) => state.messagesByChat[id]);
  const add = useChatStore((state) => state.addMessage);

  const [optimisticMessages, setOptimisticMessages] = useOptimistic(messages);

  const [errorMessage, action, isPending] = useActionState(
    async (_: string, formData: FormData) => {
      try {
        const message: IMessage = {
          id: `${Math.random() * -1}`,
          isOutgoing: true,
          text: formData.get("text") as string,
          timestamp: Date.now() / 1000,
        };
        setOptimisticMessages((prev) => [...prev, message]);
        const { idMessage } = await sendMessage(
          formData.get("id") as string,
          formData.get("text") as string,
        );
        message.id = idMessage;
        add(formData.get("id") as string, message);
      } catch (e) {
        if (e instanceof Error) return e.message;
        return "Unknown error";
      }

      return "";
    },
    "",
  );

  return (
    <div className={styles.container}>
      <div className={styles.list}>
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
