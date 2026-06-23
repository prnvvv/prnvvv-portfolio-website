import { useState, useEffect, useCallback } from 'react'

interface UseGlitchOptions {
  enabled?: boolean
  interval?: [number, number]
  duration?: number
}

export function useGlitch({ enabled = true, interval = [3000, 8000], duration = 200 }: UseGlitchOptions) {
  const [isGlitching, setIsGlitching] = useState(false)

  const triggerGlitch = useCallback(() => {
    setIsGlitching(true)
    setTimeout(() => setIsGlitching(false), duration)
  }, [duration])

  useEffect(() => {
    if (!enabled) return
    const scheduleNext = () => {
      const [min, max] = interval
      const delay = Math.random() * (max - min) + min
      return setTimeout(() => {
        triggerGlitch()
        scheduleNext()
      }, delay)
    }
    const timer = scheduleNext()
    return () => clearTimeout(timer)
  }, [enabled, interval, triggerGlitch])

  return { isGlitching, triggerGlitch }
}
