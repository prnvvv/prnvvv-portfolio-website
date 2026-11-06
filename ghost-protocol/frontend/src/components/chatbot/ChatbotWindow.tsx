import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Bot, RotateCcw, X } from 'lucide-react'
import ChatInput, { type ChatInputHandle } from './ChatInput'
import ChatMessage from './ChatMessage'
import SuggestedQuestions from './SuggestedQuestions'
import { GREETING, useBackendStatus, type ChatMessageData } from './useChatbot'

interface Props {
  messages: ChatMessageData[]
  loading: boolean
  canRetry: boolean
  onSend: (text: string) => void
  onRetry: () => void
  onClose: () => void
}

const STATUS_LABEL = { checking: 'Connecting…', online: 'Online', offline: 'Offline' } as const

export default function ChatbotWindow({ messages, loading, canRetry, onSend, onRetry, onClose }: Props) {
  const status = useBackendStatus(true)
  const input = useRef<ChatInputHandle>(null)
  const log = useRef<HTMLDivElement>(null)

  useEffect(() => {
    input.current?.focus()
  }, [])

  useEffect(() => {
    const el = log.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, loading])

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
    }
  }

  const showSuggestions = messages.length === 0

  return (
    <section
      id="chatbot-dialog"
      className="chatbot-window"
      role="dialog"
      aria-label="Prannavakhanth AI chat"
      onKeyDown={onKeyDown}
    >
      <header className="chatbot-header">
        <div className="chatbot-avatar" aria-hidden="true">
          <Bot size={18} />
        </div>
        <div className="chatbot-title">
          <h2 className="chatbot-name">Prannavakhanth AI</h2>
          <p className="chatbot-sub">Your guide to my portfolio</p>
        </div>
        <span className={`chatbot-status chatbot-status--${status}`} role="status">
          <span className="chatbot-status__dot" aria-hidden="true" />
          {STATUS_LABEL[status]}
        </span>
        <button type="button" className="chatbot-close" onClick={onClose} aria-label="Close chat">
          <X size={16} aria-hidden="true" />
        </button>
      </header>

      <div ref={log} className="chatbot-log" role="log" aria-live="polite" aria-relevant="additions" tabIndex={0}>
        <ChatMessage message={{ id: 'greeting', role: 'assistant', content: GREETING }} />
        {showSuggestions && <SuggestedQuestions onSelect={onSend} disabled={loading} />}
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {loading && (
          <div className="chatbot-msg chatbot-msg--ai" role="status" aria-label="Assistant is typing">
            <div className="chatbot-bubble chatbot-typing" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        {canRetry && !loading && (
          <button type="button" className="chatbot-retry" onClick={onRetry}>
            <RotateCcw size={12} aria-hidden="true" /> Try again
          </button>
        )}
      </div>

      <ChatInput ref={input} onSend={onSend} disabled={loading} />
      <p className="chatbot-footnote">AI answers are based only on this portfolio and may contain mistakes.</p>
    </section>
  )
}
