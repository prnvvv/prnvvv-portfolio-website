import { useState, useEffect, useCallback } from 'react'

interface UseTypingEffectOptions {
  text: string
  speed?: number
  delay?: number
  enabled?: boolean
}

export function useTypingEffect({ text, speed = 30, delay = 0, enabled = true }: UseTypingEffectOptions) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text)
      setIsComplete(true)
      return
    }
    setDisplayedText('')
    setIndex(0)
    setIsComplete(false)
  }, [text, enabled])

  useEffect(() => {
    if (!enabled || index === 0) return
    if (index > text.length) {
      setIsComplete(true)
      return
    }
    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, index))
      setIndex((prev) => prev + 1)
    }, speed)
    return () => clearTimeout(timer)
  }, [index, text, speed, enabled])

  const startDelay = useCallback(() => {
    const timer = setTimeout(() => setIndex(1), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!enabled) return
    return startDelay()
  }, [enabled, startDelay])

  return { displayedText, isComplete }
}
