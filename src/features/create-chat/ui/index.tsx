import { useActionState, useLayoutEffect, useRef } from "react";
import styles from "./CreateChatModel.module.css";
import { useChats } from "@/entities/chat";
import { createChat } from "../api";
import { usePendingChatsStore } from "@/entities/chat/model/usePendingChatsStore";

export interface ICreateChatModalProps {
  onSuccess: (chatId: string) => void;
  onClose: () => void;
}

export function CreateChatModal({ onClose, onSuccess }: ICreateChatModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const chats = useChats();
  const { add } = usePendingChatsStore();

  const [error, action, isPending] = useActionState(
    async (_: string, form: FormData) => {
      const value = parseInt(form.get("phoneNumber") as string);
      if (Number.isNaN(value)) return "Invalid number";
      const result = await createChat(value);
      if ("error" in result) {
        return result.error;
      }

      const chatId = result.payload;
      if (chats.data.findIndex((c) => c.chatId === chatId) === -1) {
        add(chatId);
      }

      onSuccess(chatId);

      return "";
    },
    "",
  );

  useLayoutEffect(() => {
    ref.current?.showModal();
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <dialog
      ref={ref}
      className={styles.modal}
      closedby="any"
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      <form action={action} onClick={(e) => e.stopPropagation()}>
        <div>
          <div>
            <h2 className="header">Find by phone</h2>
          </div>

          <div>
            {/* could be used some form of MaskInput, but while leave as-is */}
            <input
              type="number"
              name="phoneNumber"
              placeholder="1234567890"
              minLength={11}
              maxLength={12}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className={styles.action}>
            <button
              type="submit"
              className="button button--large"
              disabled={isPending}
            >
              Find
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
