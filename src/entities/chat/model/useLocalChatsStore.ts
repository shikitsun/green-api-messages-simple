import { create } from "zustand";
import type { IChat } from "./chat";

interface ILocalChatsState {
  /**
   * Chats this browser knows about before (or independently of) `getChats`:
   * ones the user created by phone number and ones a contact wrote from first.
   */
  chats: IChat[];
  add: (chat: IChat) => void;
  clear: () => void;
}

export const useLocalChatsStore = create<ILocalChatsState>((set) => ({
  chats: [],

  add: (chat) =>
    set((state) => {
      if (state.chats.some((known) => known.chatId === chat.chatId)) return state;

      return { ...state, chats: [chat, ...state.chats] };
    }),

  clear: () => set({ chats: [] }),
}));
