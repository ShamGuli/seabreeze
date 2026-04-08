import { create } from 'zustand';

interface ChatState {
  isChatOpen: boolean;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isChatOpen: false,
  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),
  setChatOpen: (open) => set({ isChatOpen: open }),
}));
