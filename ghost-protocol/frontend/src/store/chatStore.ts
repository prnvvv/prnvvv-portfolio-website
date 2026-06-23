import { create } from 'zustand'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatState {
  messages: ChatMessage[]
  isProcessing: boolean
  error: string | null
  addMessage: (role: 'user' | 'assistant', content: string) => void
  setProcessing: (processing: boolean) => void
  setError: (error: string | null) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isProcessing: false,
  error: null,
  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          role,
          content,
          timestamp: Date.now(),
        },
      ],
    })),
  setProcessing: (processing) => set({ isProcessing: processing }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], error: null }),
}))
