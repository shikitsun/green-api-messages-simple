import { useEffect } from "react";
import { useToasts, type IToast } from "../model/useToasts";
import styles from "./Toaster.module.css";

const AUTO_DISMISS = 5_000;

interface IToastItemProps {
  toast: IToast;
  onDismiss: (id: number) => void;
}

function ToastItem({ toast, onDismiss }: IToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <li
      className={styles.toast}
      data-kind={toast.kind}
      // errors interrupt, information waits its turn
      role={toast.kind === "error" ? "alert" : "status"}
    >
      <span className={styles.text}>{toast.text}</span>
      <button
        type="button"
        className={styles.dismiss}
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
      >
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
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    </li>
  );
}

export function Toaster() {
  const toasts = useToasts((state) => state.toasts);
  const dismiss = useToasts((state) => state.dismiss);

  return (
    <ul className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </ul>
  );
}
