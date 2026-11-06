import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { MAX_MESSAGE_LENGTH } from '../../services/chatbotApi'

interface Props {
  onSend: (text: string) => void
  disabled: boolean
}

export interface ChatInputHandle {
  focus: () => void
}

const ChatInput = forwardRef<ChatInputHandle, Props>(function ChatInput({ onSend, disabled }, ref) {
  const [value, setValue] = useState('')
  const area = useRef<HTMLTextAreaElement>(null)

  useImperativeHandle(ref, () => ({ focus: () => area.current?.focus() }), [])

  // auto-grow up to ~4 lines
  useLayoutEffect(() => {
    const el = area.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 104)}px`
  }, [value])

  const canSend = !disabled && value.trim().length > 0

  const submit = useCallback(() => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
  }, [value, disabled, onSend])

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form
      className="chatbot-input"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <label htmlFor="chatbot-textarea" className="chatbot-sr-only">
        Ask about Prannavakhanth's portfolio
      </label>
      <textarea
        id="chatbot-textarea"
        ref={area}
        className="chatbot-textarea"
        rows={1}
        value={value}
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder="Ask about his portfolio…"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        enterKeyHint="send"
      />
      <button type="submit" className="chatbot-send" disabled={!canSend} aria-label="Send message">
        <Send size={16} aria-hidden="true" />
      </button>
      {value.length > MAX_MESSAGE_LENGTH * 0.8 && (
        <span className="chatbot-counter" aria-live="polite">
          {value.length}/{MAX_MESSAGE_LENGTH}
        </span>
      )}
    </form>
  )
})

export default ChatInput
