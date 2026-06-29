import { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  isProcessing: boolean
}

const MAX_CHARS = 500

export default function ChatInput({ onSend, isProcessing }: ChatInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isProcessing) {
      inputRef.current?.focus()
    }
  }, [isProcessing])

  const handleSend = () => {
    const msg = input.trim()
    if (!msg || isProcessing) return
    onSend(msg)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center bg-black/50 border border-white/20 rounded px-3 py-2">
          <span className="text-white/40 text-xs font-mono mr-2">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setInput(e.target.value)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="TYPE TRANSMISSION..."
            disabled={isProcessing}
            className="bg-transparent border-none outline-none text-white font-mono flex-1 text-xs placeholder:text-white/40"
            style={{ fontFamily: 'Share Tech Mono' }}
          />
          <span className="text-[9px] text-white/30 font-mono ml-2">
            {input.length}/{MAX_CHARS}
          </span>
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isProcessing}
          className="bg-[#00e67a]/20 border border-[#00e67a]/50 text-[#00e67a] px-4 py-2 rounded text-xs font-mono tracking-wider transition-all duration-200 hover:bg-[#00e67a]/30 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ fontFamily: 'Share Tech Mono' }}
        >
          {isProcessing ? (
            <span className="flex items-center gap-1">
              <span className="animate-pulse">◆</span>
            </span>
          ) : (
            'SEND'
          )}
        </button>
      </div>
    </div>
  )
}
