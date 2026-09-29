import { create } from "zustand";
import type { IChat } from "./chat";

interface ILocalChatsState {
  chats: IChat[];
  add: (chat: IChat) => void;
  clear: () => void;
}

export const useLocalChatsStore = create<ILocalChatsState>((set) => ({
  chats: [],

  add: (chat) =>
    set((state) => {
      if (state.chats.some((known) => known.chatId === chat.chatId))
        return state;

      return { ...state, chats: [chat, ...state.chats] };
    }),

  clear: () => set({ chats: [] }),
}));
