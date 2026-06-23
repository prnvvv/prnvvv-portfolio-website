import { sendChatMessage } from './api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export async function processChatMessage(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const conversationHistory = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))
  const result = await sendChatMessage(message, conversationHistory)
  if (result.error) throw new Error(result.error)
  return result.content
}
