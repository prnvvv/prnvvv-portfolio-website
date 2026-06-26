import { motion } from 'framer-motion'
import { useChatStore } from '../../store/chatStore'

export default function FloatingChatIcon() {
  const { isOpen, toggleChat } = useChatStore()

  return (
    <>
      {/* Pulse ring */}
      <motion.div
        className="fixed bottom-20 right-6 md:bottom-22 md:right-8 z-40 pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#00e67a]/20" />
      </motion.div>

      {/* Main button */}
      <motion.button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl shadow-[#00e67a]/30 cursor-pointer border border-[#00e67a]/40 transition-all duration-300 ${
          isOpen
            ? 'bg-[#00e67a] text-black scale-90'
            : 'bg-gradient-to-br from-[#00e67a]/80 to-[#00e67a]/20 text-white hover:scale-110'
        }`}
        whileTap={{ scale: 0.9 }}
        aria-label={isOpen ? 'Close Command Intelligence' : 'Open Command Intelligence'}
      >
        {isOpen ? (
          <span className="text-xl font-bold font-mono">✕</span>
        ) : (
          <span className="text-xl md:text-2xl">◈</span>
        )}
      </motion.button>

      {/* Online badge */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-[72px] right-4 md:bottom-[84px] md:right-6 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full border border-[#00e67a]/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e67a] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00e67a]" />
            </span>
            <span className="text-[9px] font-mono text-[#00e67a]/70 tracking-wider">AI CORE</span>
          </div>
        </motion.div>
      )}
    </>
  )
}
