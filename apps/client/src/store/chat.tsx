import { ChatMessage } from "@beatsync/shared";
import { create } from "zustand";

interface ChatState {
  messages: ChatMessage[];
  newestId: string;

  // Actions
  setMessages: (
    messages: ChatMessage[],
    isFullSync: boolean,
    newestId: string
  ) => void;
  addMessage: (message: ChatMessage) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  newestId: "",

  setMessages: (messages, isFullSync, newestId) => {
    set((state) => {
      if (isFullSync) {
        // Replace all messages with new ones
        return { messages, newestId };
      } else {
        // Only append messages newer than our current newest ID
        const newMessages = messages.filter((m) => m.id > state.newestId);
        return {
          messages: [...state.messages, ...newMessages],
          newestId: newestId > state.newestId ? newestId : state.newestId,
        };
      }
    });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
      newestId: message.id,
    }));
  },

  reset: () => {
    set({
      messages: [],
      newestId: "",
    });
  },
}));
