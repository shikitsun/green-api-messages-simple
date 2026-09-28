import { create } from "zustand";
import type { IChat } from "./chat";

interface ChatsPendingState {
  chats: IChat[];
  add: (data: string) => void;
  clear: () => void;
  remove: (data: string) => void;
}

export const usePendingChatsStore = create<ChatsPendingState>((set) => ({
  chats: [],
  add: (data: string) =>
    set((prev) => ({
      ...prev,
      chats: [
        {
          chatId: data,
          name: data,
          phoneNumber: 0,
          type: "user",
        },
        ...prev.chats,
      ],
    })),
  clear: () => set({ chats: [] }),
  // could be used Map for faster and better work there, but not necessary for 'tech-demo'
  remove: (data: string) =>
    set((prev) => ({
      ...prev,
      chats: prev.chats.filter((chat) => chat.chatId !== data),
    })),
}));
