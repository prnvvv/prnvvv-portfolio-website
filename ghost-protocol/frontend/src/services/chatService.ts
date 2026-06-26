const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface ChatResponse {
  response: string
  sources: Array<{
    id: string
    text: string
    metadata?: Record<string, string>
    score?: number
  }>
  confidence: number
  retrieval_method: string
  total_time_ms: number
  citations: string[]
  session_id: string
}

export interface HealthStatus {
  status: string
  version: string
}

export async function sendMessage(
  query: string,
  sessionId?: string | null
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, session_id: sessionId || null }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
    throw new Error(body.detail || `HTTP ${res.status}`)
  }

  return res.json()
}

export async function checkHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error('Backend unreachable')
  return res.json()
}
