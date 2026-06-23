const API_BASE = import.meta.env.VITE_API_BASE ?? ''

interface ChatResponse {
  content: string
  error?: string
}

export async function sendChatMessage(
  message: string,
  conversationHistory: { role: string; content: string }[]
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationHistory }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail ?? `HTTP ${response.status}`)
  }
  return response.json()
}
