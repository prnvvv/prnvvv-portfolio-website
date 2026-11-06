import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChatbotApiError,
  MAX_MESSAGE_LENGTH,
  fetchHealth,
  sendChatMessage,
  userMessageFor,
  type ChatSource,
} from '../../services/chatbotApi'

export interface ChatMessageData {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
  isError?: boolean
}

export const GREETING =
  "Hey! I'm Prannavakhanth's AI assistant.\n\nCurious about his projects, technical skills, experience, or background? Ask me anything about his portfolio!"

/** The backend answers a bare "hi" with the same canned text as GREETING, which the window already shows on top. */
const GREETING_REPLY = 'Hi there! What would you like to know about his projects, skills, or background?'
const sameText = (a: string, b: string) => a.replace(/\s+/g, ' ').trim() === b.replace(/\s+/g, ' ').trim()

const MAX_MESSAGES = 60

let counter = 0
const nextId = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`

function newSessionId(): string {
  // 8-64 chars of [A-Za-z0-9_-] as required by the backend
  const c = globalThis.crypto
  if (c?.randomUUID) return c.randomUUID()
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
}

/** Conversation state. Lives in memory only: nothing is written to storage or sent anywhere except the chat API. */
export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [loading, setLoading] = useState(false)
  const [failedText, setFailedText] = useState<string | null>(null)
  const sessionId = useRef(newSessionId())
  const inFlight = useRef(false)
  const controller = useRef<AbortController | null>(null)

  useEffect(() => () => controller.current?.abort(), [])

  const send = useCallback(async (raw: string) => {
    const text = raw.trim().slice(0, MAX_MESSAGE_LENGTH)
    if (!text || inFlight.current) return
    inFlight.current = true
    setLoading(true)
    setFailedText(null)
    setMessages((m) => [...m, { id: nextId(), role: 'user' as const, content: text }].slice(-MAX_MESSAGES))

    controller.current = new AbortController()
    try {
      const reply = await sendChatMessage(text, sessionId.current, controller.current.signal)
      sessionId.current = reply.sessionId
      setMessages((m) =>
        [...m, { id: nextId(), role: 'assistant' as const, content: sameText(reply.answer, GREETING) ? GREETING_REPLY : reply.answer, sources: reply.sources }].slice(-MAX_MESSAGES),
      )
    } catch (err) {
      if (err instanceof ChatbotApiError && err.kind === 'aborted') return
      setFailedText(text)
      setMessages((m) =>
        [...m, { id: nextId(), role: 'assistant' as const, content: userMessageFor(err), isError: true }].slice(-MAX_MESSAGES),
      )
    } finally {
      inFlight.current = false
      setLoading(false)
    }
  }, [])

  const retry = useCallback(() => {
    if (!failedText || inFlight.current) return
    // drop the user message + error bubble of the failed attempt, then resend
    setMessages((m) => m.slice(0, -2))
    void send(failedText)
  }, [failedText, send])

  return { messages, loading, failedText, send, retry }
}

export type BackendStatus = 'checking' | 'online' | 'offline'

/** Polls /api/health while the window is open so the header indicator reflects reality. */
export function useBackendStatus(active: boolean): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>('checking')

  useEffect(() => {
    if (!active) return
    let cancelled = false
    const ctrl = new AbortController()
    const check = async () => {
      const ok = await fetchHealth(ctrl.signal)
      if (!cancelled) setStatus(ok ? 'online' : 'offline')
    }
    void check()
    const id = window.setInterval(check, 60_000)
    return () => {
      cancelled = true
      ctrl.abort()
      window.clearInterval(id)
    }
  }, [active])

  return status
}
