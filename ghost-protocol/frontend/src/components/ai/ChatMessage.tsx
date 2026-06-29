import { motion } from 'framer-motion'
import { formatTimestamp } from '../../utils/helpers'

interface ChatMessageProps {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  sources?: Array<{ id: string; text: string; metadata?: Record<string, string>; score?: number }>
  citations?: string[]
}

export default function ChatMessage({ role, content, timestamp, sources, citations }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[90%] sm:max-w-[85%] md:max-w-[80%] px-3.5 py-2.5 text-xs font-body ${
          isUser
            ? 'bg-[#00e67a]/10 border border-[#00e67a]/30 text-white rounded-l-lg rounded-tr-lg'
            : 'bg-[#00e67a]/10 border border-[#00e67a]/30 text-white rounded-r-lg rounded-tl-lg'
        }`}
      >
        <p className="leading-relaxed whitespace-pre-wrap">{content}</p>

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-[9px] text-white/40 font-mono mb-1">SOURCES:</p>
            <div className="flex flex-wrap gap-1">
              {sources.map((s, i) => (
                <span
                  key={s.id || i}
                  className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 font-mono"
                >
                  ▣ {s.metadata?.title || s.metadata?.name || `Source ${i + 1}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Citations */}
        {citations && citations.length > 0 && (
          <div className="mt-1.5">
            <div className="flex flex-wrap gap-1">
              {citations.map((c, i) => (
                <span key={i} className="text-[8px] text-[#00e67a]/60 font-mono">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-white/40 text-[9px] mt-1.5 text-right font-mono">
          {formatTimestamp(timestamp)}
        </p>
      </div>
    </motion.div>
  )
}
