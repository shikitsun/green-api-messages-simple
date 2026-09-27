import { useActionState, useState } from "react";
import styles from "./AuthForm.module.css";
import { useInstanceStore } from "../../../entities/instance/model/useInstanceStore.js";
import { verifyInstanceConnection } from "../../../entities/instance/api/verifyInstance.js";
import type { TInstanceState } from "@/entities/instance/model/model.js";

interface AuthFormProps {
  onSuccess?: () => void;
}

type AuthActionState =
  | {
      state: Extract<TInstanceState, "authorized">;
      idInstance: string;
      apiTokenInstance: string;
    }
  | {
      state: Exclude<TInstanceState, "authorized">;
    }
  | null;

async function authAction(
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const idInstance = formData.get("idInstance") as string;
  const apiTokenInstance = formData.get("apiTokenInstance") as string;

  if (!idInstance || !apiTokenInstance) {
    return {
      state: "notAuthorized",
    };
  }

  try {
    return {
      state: (await verifyInstanceConnection({ idInstance, apiTokenInstance }))
        ?.stateInstance,
      idInstance,
      apiTokenInstance,
    };
  } catch {}

  return null;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [error, setError] = useState<TInstanceState | null>(null);
  const saveCredentials = useInstanceStore((state) => state.setCredentials);
  const [message, dispatch, isPending] = useActionState(authAction, null);

  if (message?.state === "authorized") {
    saveCredentials({
      idInstance: message.idInstance,
      apiTokenInstance: message.apiTokenInstance,
    });
    onSuccess?.();
    return null;
  } else if (message?.state && message?.state !== error) {
    setError(message?.state ?? null);
  }

  return (
    <form action={dispatch} className={styles.form}>
      <h3 className="subheader text-center">Simple Green API Chat</h3>

      <input
        type="text"
        name="id"
        placeholder="idInstance"
        disabled={isPending}
        required
      />
      <input
        type="text"
        name="apiTokenInstance"
        placeholder="apiTokenInstance"
        disabled={isPending}
        required
      />

      {error && <p className="error">{error}</p>}
      <p className="description text-tertiary text-center">
        For more info check{" "}
        <a
          href="https://green-api.com/v3/docs/before-start/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Green API Docs
        </a>
      </p>
      <button
        type="submit"
        className="button button--large"
        disabled={isPending}
      >
        {isPending ? "Verifying..." : "Continue"}
      </button>
    </form>
  );
}
