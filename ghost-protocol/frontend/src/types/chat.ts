export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ChatState {
  messages: ChatMessage[]
  isProcessing: boolean
  error: string | null
}

export interface CommandPayload {
  message: string
  conversationHistory: ChatMessage[]
}
