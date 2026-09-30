import { create } from "zustand";

// Could be used Context as well for demostration purposes
interface ActiveChatState {
  active: string | null;
  set: (chat: string) => void;
  clear: () => void;
}

export const useActiveChatStore = create<ActiveChatState>((set) => ({
  active: null,
  set: (chat) => set({ active: chat }),
  clear: () => set({ active: null }),
}));
