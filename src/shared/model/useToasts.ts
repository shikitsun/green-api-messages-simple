import { create } from "zustand";

export type TToastKind = "error" | "info";

export interface IToast {
  id: number;
  kind: TToastKind;
  text: string;
}

interface IToastsState {
  toasts: IToast[];
  shownAt: Record<string, number>;
  lastId: number;

  push: (kind: TToastKind, text: string) => void;
  dismiss: (id: number) => void;
  clear: () => void;
}

/** The same text must not pop up over and over - a failing poll runs every 10s. */
const DEDUPE_WINDOW = 5_000;
/** More than a couple of toasts at once and the app becomes unreadable. */
const MAX_TOASTS = 3;

export const useToasts = create<IToastsState>((set, get) => ({
  toasts: [],
  shownAt: {},
  lastId: 0,

  push: (kind, text) => {
    const key = `${kind}:${text}`;
    const shownAt = get().shownAt[key];

    if (shownAt !== undefined && Date.now() - shownAt < DEDUPE_WINDOW) return;

    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: state.lastId + 1, kind, text },
      ].slice(-MAX_TOASTS),
      lastId: state.lastId + 1,
      shownAt: { ...state.shownAt, [key]: Date.now() },
    }));
  },

  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  clear: () => set({ toasts: [], shownAt: {}, lastId: 0 }),
}));
