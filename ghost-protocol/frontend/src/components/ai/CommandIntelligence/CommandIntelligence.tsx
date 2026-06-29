import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useChatStore } from '../../../store/chatStore'
import { formatTimestamp } from '../../../utils/helpers'

export default function CommandIntelligence() {
  const { messages, isProcessing, addMessage, setProcessing, setError, error } = useChatStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async () => {
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
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel-border bg-[#080c09]"
    >
      <div className="border-b border-[#1a2e1a] px-4 py-2 flex items-center gap-2">
        <span className="blinking-dot" />
        <span
          className="text-[#00e67a] text-[10px] font-heading tracking-[0.15em]"
          style={{ fontFamily: 'Orbitron' }}
        >
          COMMAND INTELLIGENCE // AI CORE
        </span>
        <span className="text-[#5a8a6a] text-[10px] font-body ml-auto">
          {isProcessing ? 'PROCESSING...' : 'STANDBY'}
        </span>
      </div>

      <div className="h-[360px] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-[#5a8a6a] text-xs font-body py-12">
            [AI CORE ONLINE. AWAITING QUERY.]
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 text-xs font-body ${
                msg.role === 'user'
                  ? 'bg-[#1a2e1a] text-white/90'
                  : 'bg-[#0a0c0a] border border-[#1a2e1a] text-[#00e67a]'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className="text-[#5a8a6a] text-[9px] mt-1 text-right">
                {formatTimestamp(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex gap-2">
            <div className="bg-[#0a0c0a] border border-[#1a2e1a] px-3 py-2 text-xs font-body text-[#00e67a]">
              <span className="animate-pulse">PROCESSING...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-[#00e67a]/10 border-t border-[#00e67a]/30">
          <p className="text-[#00e67a] text-[10px] font-body">
            ERROR: {error}
          </p>
        </div>
      )}

      <div className="border-t border-[#1a2e1a] p-3 flex gap-2">
        <div className="mil-input flex-1 flex items-center text-xs">
          <span className="text-[#5a8a6a] mr-2">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ENTER QUERY..."
            disabled={isProcessing}
            className="bg-transparent border-none outline-none text-white/90 font-body flex-1 p-0 text-xs"
            style={{ fontFamily: 'Share Tech Mono' }}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isProcessing}
          className="mil-button text-[10px]"
        >
          TRANSMIT
        </button>
      </div>
    </motion.div>
  )
}
