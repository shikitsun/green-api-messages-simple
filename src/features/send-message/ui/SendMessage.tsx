import { type ComponentProps } from "react";
import styles from "./SendMessage.module.css";
import { useChatStore } from "@/entities/message";
import { ButtonIcon } from "@/shared/ui/Button";
import { LoadSpinIcon } from "@/shared/ui/LoadSpin";

interface ISendMessageProps {
  target: string;
  action: ComponentProps<"form">["action"];
  isPending: boolean;
}

export function SendMessage({ target, action, isPending }: ISendMessageProps) {
  const draft = useChatStore((state) => state.drafts[target] ?? "");
  const setDraft = useChatStore((state) => state.setDraft);

  return (
    <form className={styles.container} action={action}>
      <input type="hidden" name="id" value={target} />
      {/* In UI source prototype were used contenteditable, leave input there */}
      {/* the draft lives in the store, so a session ending does not throw it away */}
      <input
        type="text"
        name="text"
        placeholder="Message..."
        required
        maxLength={4000}
        disabled={isPending}
        value={draft}
        onChange={(event) => setDraft(target, event.target.value)}
      />

      <ButtonIcon type="submit" className="button--ghost" disabled={isPending}>
        {isPending ? (
          <LoadSpinIcon />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        )}
      </ButtonIcon>
    </form>
  );
}
