import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquare, X } from 'lucide-react'
import { isChatbotConfigured } from '../../services/chatbotApi'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import ChatbotWindow from './ChatbotWindow'
import { useChatbot } from './useChatbot'
import './chatbot.css'

/**
 * Floating assistant, mounted once above the router so it is available on every route and keeps its
 * conversation while visitors navigate. Colours come exclusively from the portfolio's CSS variables,
 * so the Commander / Noir theme switch restyles it automatically.
 */
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const reduced = usePrefersReducedMotion()
  const fab = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const { messages, loading, failedText, send, retry } = useChatbot()

  const close = useCallback(() => setOpen(false), [])

  // return focus to the launcher when the dialog closes
  useEffect(() => {
    if (wasOpen.current && !open) fab.current?.focus()
    wasOpen.current = open
  }, [open])

  if (!isChatbotConfigured) return null

  const dur = reduced ? 0 : 0.22

  return (
    <div className="chatbot-root" data-open={open}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="window"
            className="chatbot-motion"
            initial={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 12, scale: reduced ? 1 : 0.98, transition: { duration: dur * 0.8 } }}
            transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChatbotWindow
              messages={messages}
              loading={loading}
              canRetry={failedText !== null}
              onSend={send}
              onRetry={retry}
              onClose={close}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={fab}
        type="button"
        className="chatbot-fab"
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        aria-expanded={open}
        aria-controls="chatbot-dialog"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={20} aria-hidden="true" /> : <MessageSquare size={20} aria-hidden="true" />}
      </button>
    </div>
  )
}
