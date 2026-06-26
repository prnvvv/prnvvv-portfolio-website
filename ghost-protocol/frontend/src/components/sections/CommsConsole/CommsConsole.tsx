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
    <AnimatedSection id="comms" className="min-h-screen py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header"
        >
          <span>◈</span>
          <span>COMMS CONSOLE // COMMAND INTELLIGENCE</span>
        </motion.div>

        <div className="grid md:grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="panel-border bg-[#181825]/70"
          >
            <div className="border-b border-[rgba(0,230,122,0.12)] px-4 py-2 flex items-center gap-2">
              <span className="blinking-dot" />
              <span
                className="text-[#00e67a] text-[10px] font-heading tracking-[0.15em]"
                style={{ fontFamily: 'Orbitron' }}
              >
                COMMAND INTELLIGENCE // ACTIVE
              </span>
              <span className="text-[#5a8a6a] text-[10px] font-body ml-auto">
                AI CORE v1.0
              </span>
            </div>

            <div className="h-[300px] sm:h-[400px] md:h-[500px] overflow-y-auto p-4 space-y-3">
              <AnimatePresence initial={false}>
                {messages.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-[#5a8a6a] text-xs font-body py-12"
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
                      className={`max-w-[90%] sm:max-w-[80%] lg:max-w-[70%] px-3 py-2 text-xs font-body ${
                        msg.role === 'user'
                          ? 'bg-[rgba(0,230,122,0.08)] text-[#f0f0f0]'
                          : 'bg-[#181825]/70 border border-[rgba(0,230,122,0.12)] text-[#00e67a]'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[#4a4a5a] text-[9px] mt-1 text-right">
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
                    <div className="bg-[#181825]/70 border border-[rgba(0,230,122,0.12)] px-3 py-2 text-xs font-body text-[#00e67a]">
                      <span className="animate-pulse">TRANSMITTING...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="px-4 py-2 bg-[#ff3344]/10 border-t border-[#ff3344]/30">
                <p className="text-[#ff3344] text-[10px] font-body">
                  COMMS ERROR: {error}
                </p>
              </div>
            )}

            <div className="border-t border-[rgba(0,230,122,0.12)] p-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="TYPE TRANSMISSION..."
                disabled={isProcessing}
                className="mil-input flex-1 text-xs"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="mil-button text-xs"
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
