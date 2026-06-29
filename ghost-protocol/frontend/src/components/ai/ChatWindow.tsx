import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../../hooks/useChat'
import { useChatStore } from '../../store/chatStore'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import QuickActions from './QuickActions'

export default function ChatWindow() {
  const { messages, isProcessing, error, isOnline, send, clearMessages, } = useChat()
  const { isOpen, closeChat } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleQuickAction = (query: string) => {
    send(query)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-40 w-[90%] sm:w-[450px] md:w-[500px] lg:w-[550px] h-[500px] md:h-[600px] rounded-xl border border-[#00e67a]/30 bg-black/95 backdrop-blur-2xl shadow-2xl shadow-black/70 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#00e67a]/20 shrink-0">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-[#00e67a]' : 'bg-[#ff3344]'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-[#00e67a]' : 'bg-[#ff3344]'}`} />
              </span>
              <div>
                <span
                  className="text-sm font-heading tracking-[0.1em] text-white"
                >
                  ◈ COMMAND INTELLIGENCE
                </span>
                <span className="text-[10px] font-mono text-[#00e67a]/70 ml-2 tracking-wider">
                  // {isOnline ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearMessages}
                className="text-[9px] text-gray-500 font-mono hover:text-gray-300 transition-colors px-2 py-1"
                aria-label="Clear conversation"
              >
                CLEAR
              </button>
              <button
                onClick={closeChat}
                className="text-gray-400 hover:text-[#00e67a] transition-colors text-lg leading-none px-1"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="text-2xl mb-3 opacity-50">◈</div>
                <p className="text-gray-400 text-xs font-mono mb-2">
                  Welcome, Operator.
                </p>
                <p className="text-gray-500 text-[10px] font-mono max-w-[280px] leading-relaxed">
                  I am the Command Intelligence System. Ask me about the operator's
                  projects, skills, experience, or any portfolio information.
                </p>
              </motion.div>
            )}
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                id={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                sources={msg.sources}
                citations={msg.citations}
              />
            ))}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2"
              >
                <div className="bg-[#00e67a]/10 border border-[#00e67a]/30 px-3 py-2.5 rounded-r-lg rounded-tl-lg text-xs font-mono text-[#00e67a]">
                  <span className="flex items-center gap-1.5">
                    <span className="animate-pulse">DECRYPTING</span>
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="px-4 py-1.5 bg-[#ff3344]/10 border-t border-[#ff3344]/30">
              <p className="text-[#ff3344] text-[9px] font-mono">
                COMMS ERROR: {error}
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <QuickActions onSend={handleQuickAction} disabled={isProcessing} />

          {/* Input */}
          <ChatInput onSend={send} isProcessing={isProcessing} />

          {/* Footer */}
          <div className="px-4 py-1.5 bg-black/40 border-t border-gray-900">
            <p className="text-[8px] text-gray-600 font-mono text-center tracking-wider">
              GHOST PROTOCOL v1.0.0 // SECURE CHANNEL // AI CORE
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
