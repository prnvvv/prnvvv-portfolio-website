import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  sources?: Array<{
    id: string
    text: string
    metadata?: Record<string, string>
    score?: number
  }>
  citations?: string[]
}

interface ChatState {
  // Message state
  messages: ChatMessage[]
  isProcessing: boolean
  error: string | null

  // UI state
  isOpen: boolean
  isOnline: boolean
  sessionId: string | null

  // Actions
  addMessage: (role: 'user' | 'assistant', content: string, extras?: Partial<ChatMessage>) => void
  setProcessing: (processing: boolean) => void
  setError: (error: string | null) => void
  clearMessages: () => void
  toggleChat: () => void
  openChat: () => void
  closeChat: () => void
  setOnline: (online: boolean) => void
  setSessionId: (id: string) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isProcessing: false,
  error: null,
  isOpen: false,
  isOnline: false,
  sessionId: null,

  addMessage: (role, content, extras) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          role,
          content,
          timestamp: Date.now(),
          ...extras,
        },
      ],
    })),

  setProcessing: (processing) => set({ isProcessing: processing }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], error: null }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setOnline: (online) => set({ isOnline: online }),
  setSessionId: (id) => set({ sessionId: id }),
}))
