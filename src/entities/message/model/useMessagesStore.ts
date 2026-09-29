import { create } from "zustand";

export interface IMessage {
  id: string;
  text: string;
  timestamp: number;
  isOutgoing: boolean;
}

interface IChatState {
  messagesByChat: Record<string, IMessage[]>;
  isLoading: boolean;
  error: string | null;

  // Actions
  addMessage: (chatId: string, message: IMessage) => void;
  setMessages: (chatId: string, messages: IMessage[]) => void;
  clearChat: (chatId: string) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useChatStore = create<IChatState>((set) => ({
  messagesByChat: {},
  isLoading: false,
  error: null,

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  addMessage: (chatId, message) =>
    set((state) => {
      const messages = state.messagesByChat[chatId] || [];

      // dedup
      if (messages.findIndex((m) => m.id === message.id) !== -1) return state;

      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: [...messages, message].sort(
            (a, b) => a.timestamp - b.timestamp,
          ),
        },
      };
    }),

  setMessages: (chatId, messages) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: [...messages].sort((a, b) => a.timestamp - b.timestamp),
      },
    })),

  clearChat: (chatId) =>
    set((state) => {
      const newMessagesByChat = { ...state.messagesByChat };
      delete newMessagesByChat[chatId];
      return { messagesByChat: newMessagesByChat };
    }),

  reset: () => {
    set({
      messagesByChat: {},
      isLoading: false,
      error: null,
    });
  },
}));
