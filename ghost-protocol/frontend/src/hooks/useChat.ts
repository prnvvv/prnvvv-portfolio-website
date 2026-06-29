import { useCallback, useEffect, useRef } from 'react'
import { useChatStore } from '../store/chatStore'
import { sendMessage, checkHealth } from '../services/chatService'

export function useChat() {
  const {
    messages,
    isProcessing,
    error,
    isOpen,
    isOnline,
    sessionId,
    addMessage,
    setProcessing,
    setError,
    setOnline,
    setSessionId,
    clearMessages,
  } = useChatStore()

  const healthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Check backend health on mount and periodically
  useEffect(() => {
    const check = async () => {
      try {
        await checkHealth()
        setOnline(true)
      } catch {
        setOnline(false)
      }
    }
    check()
    healthIntervalRef.current = setInterval(check, 30000)
    return () => {
      if (healthIntervalRef.current) clearInterval(healthIntervalRef.current)
    }
  }, [setOnline])

  // Send a message to the backend
  const send = useCallback(
    async (text: string) => {
      const msg = text.trim()
      if (!msg || isProcessing) return

      addMessage('user', msg)
      setProcessing(true)
      setError(null)

      try {
        const result = await sendMessage(msg, sessionId)
        setSessionId(result.session_id)
        addMessage('assistant', result.response, {
          sources: result.sources,
          citations: result.citations,
        })
        setOnline(true)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Transmission failed'
        setError(errorMsg)

        // Friendly error messages
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('unreachable')) {
          addMessage(
            'assistant',
            'SIGNAL INTERRUPTED — Cannot reach Command Intelligence Core. Ensure the backend is running at localhost:8000.'
          )
          setOnline(false)
        } else {
          addMessage(
            'assistant',
            `TRANSMISSION ERROR: ${errorMsg}`
          )
        }
      } finally {
        setProcessing(false)
      }
    },
    [isProcessing, sessionId, addMessage, setProcessing, setError, setSessionId, setOnline]
  )

  return {
    messages,
    isProcessing,
    error,
    isOpen,
    isOnline,
    send,
    clearMessages,
    sessionId,
  }
}
