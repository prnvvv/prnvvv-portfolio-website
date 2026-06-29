import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from '../../animations/AnimatedSection'
import { useChatStore } from '../../../store/chatStore'
import { formatTimestamp } from '../../../utils/helpers'

export default function CommsConsole() {
  const { messages, isProcessing, addMessage, setProcessing, setError, error } = useChatStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || isProcessing) return
    setInput('')
    addMessage('user', msg)
    setProcessing(true)
    setError(null)

    try {
      const { processChatMessage } = await import('../../../services/chat')
      const response = await processChatMessage(msg, messages)
      addMessage('assistant', response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transmission failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
<AnimatedSection id="comms" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header mb-8"
        >
          <span>◆</span>
          <span>COMMS CONSOLE // SECURE CHANNEL</span>
        </motion.div>

        <div className="grid md:grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="panel-border bg-mil-darker/70"
          >
            <div className="border-b border-mil-green/12 px-4 py-2 flex items-center gap-2">
              <span className="blinking-dot" />
              <span
                className="text-mil-green font-heading tracking-[0.15em]"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)' }}
              >
                COMMAND INTELLIGENCE // ACTIVE
              </span>
              <span className="text-mil-olive font-body ml-auto" style={{ fontSize: 'var(--text-xs)' }}>
                AI CORE v1.0
              </span>
            </div>

            <div className="min-h-[200px] sm:min-h-[260px] md:min-h-[320px] max-h-[400px] overflow-y-auto p-3 space-y-2">
              <AnimatePresence initial={false}>
                {messages.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-mil-olive font-body py-12" style={{ fontSize: 'var(--text-xs)' }}
                  >
                    [COMMS CHANNEL OPEN. AWAITING TRANSMISSION...]
                  </motion.div>
                )}
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] sm:max-w-[80%] lg:max-w-[70%] px-3 py-2 font-body ${
                        msg.role === 'user'
                          ? 'bg-mil-green/8 text-mil-light'
                          : 'bg-mil-darker/70 border border-mil-green/12 text-mil-green'
                      }`} style={{ fontSize: 'var(--text-xs)' }}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-mil-dim mt-1 text-right" style={{ fontSize: 'var(--text-micro)' }}>
                        {formatTimestamp(msg.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isProcessing && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="bg-mil-darker/70 border border-mil-green/12 px-3 py-2 font-body text-mil-green" style={{ fontSize: 'var(--text-xs)' }}>
                      <span className="animate-pulse">TRANSMITTING...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="px-4 py-2 bg-mil-green/10 border-t border-mil-green/30">
                <p className="text-mil-green font-body" style={{ fontSize: 'var(--text-xs)' }}>
                  COMMS ERROR: {error}
                </p>
              </div>
            )}

            <div className="border-t border-mil-green/12 p-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="TYPE TRANSMISSION..."
                disabled={isProcessing}
                className="mil-input flex-1"
                style={{ fontSize: 'var(--text-xs)' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="mil-button"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                {isProcessing ? '...' : 'SEND'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatedSection>
  )
}
