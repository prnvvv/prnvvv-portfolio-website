/**
 * Client for the portfolio RAG backend (backend/ in this repo).
 * The Groq key lives only on the server; the browser talks to the backend, never to Groq.
 */

const RAW_BASE = (import.meta.env.VITE_CHATBOT_API_URL as string | undefined)?.trim() ?? ''

// In dev we default to the local backend; in production the widget is only shown when a URL is configured.
export const CHATBOT_API_BASE = (RAW_BASE || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')).replace(/\/+$/, '')
export const isChatbotConfigured = CHATBOT_API_BASE !== ''

export const MAX_MESSAGE_LENGTH = 1000
const CHAT_TIMEOUT_MS = 35_000
const HEALTH_TIMEOUT_MS = 6_000

export interface ChatSource {
  category: string
  document: string
  title: string
}

export interface ChatReply {
  answer: string
  sources: ChatSource[]
  sessionId: string
}

export type ChatbotErrorKind = 'network' | 'timeout' | 'rate_limited' | 'unavailable' | 'invalid' | 'aborted'

export class ChatbotApiError extends Error {
  kind: ChatbotErrorKind
  retryAfter?: number
  constructor(kind: ChatbotErrorKind, message: string, retryAfter?: number) {
    super(message)
    this.name = 'ChatbotApiError'
    this.kind = kind
    this.retryAfter = retryAfter
  }
}

const USER_MESSAGES: Record<ChatbotErrorKind, string> = {
  network: "I can't reach the assistant right now. Please check your connection and try again.",
  timeout: 'The assistant took too long to respond. Please try again.',
  rate_limited: "You're sending messages a little too fast. Please wait a moment and try again.",
  unavailable: 'The assistant is temporarily unavailable. Please try again in a moment.',
  invalid: 'That message could not be sent. Please shorten it and try again.',
  aborted: 'Request cancelled.',
}

export function userMessageFor(error: unknown): string {
  return error instanceof ChatbotApiError ? USER_MESSAGES[error.kind] : USER_MESSAGES.unavailable
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function parseSources(raw: unknown): ChatSource[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((s) =>
    isRecord(s) && typeof s.title === 'string' && typeof s.category === 'string'
      ? [{ category: s.category, document: typeof s.document === 'string' ? s.document : '', title: s.title }]
      : [],
  )
}

/** Aborts when either the caller's signal or the timeout fires; reports which one. */
async function request(path: string, init: RequestInit, timeoutMs: number, external?: AbortSignal): Promise<Response> {
  const controller = new AbortController()
  let timedOut = false
  const timer = window.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)
  const onExternalAbort = () => controller.abort()
  external?.addEventListener('abort', onExternalAbort)
  try {
    return await fetch(`${CHATBOT_API_BASE}${path}`, { ...init, signal: controller.signal, credentials: 'omit' })
  } catch {
    if (timedOut) throw new ChatbotApiError('timeout', 'timeout')
    if (external?.aborted) throw new ChatbotApiError('aborted', 'aborted')
    throw new ChatbotApiError('network', 'network')
  } finally {
    window.clearTimeout(timer)
    external?.removeEventListener('abort', onExternalAbort)
  }
}

export async function sendChatMessage(message: string, sessionId: string, signal?: AbortSignal): Promise<ChatReply> {
  const res = await request(
    '/api/chat',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id: sessionId }),
    },
    CHAT_TIMEOUT_MS,
    signal,
  )
  if (res.status === 429) {
    throw new ChatbotApiError('rate_limited', 'rate limited', Number(res.headers.get('retry-after')) || undefined)
  }
  if (res.status === 413 || res.status === 422) throw new ChatbotApiError('invalid', 'invalid')
  if (res.status === 504) throw new ChatbotApiError('timeout', 'timeout')
  if (!res.ok) throw new ChatbotApiError('unavailable', `status ${res.status}`)

  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new ChatbotApiError('unavailable', 'bad json')
  }
  if (!isRecord(data) || data.success !== true || typeof data.answer !== 'string' || !data.answer.trim()) {
    throw new ChatbotApiError('unavailable', 'bad shape')
  }
  return {
    answer: data.answer,
    sources: parseSources(data.sources),
    sessionId: typeof data.session_id === 'string' ? data.session_id : sessionId,
  }
}

export async function fetchHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await request('/api/health', { method: 'GET' }, HEALTH_TIMEOUT_MS, signal)
    if (!res.ok) return false
    const data: unknown = await res.json()
    return isRecord(data) && data.status === 'ok' && data.index_loaded === true
  } catch {
    return false
  }
}
