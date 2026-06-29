import { useEffect, useRef, useState } from 'react'

interface UseCountUpOptions {
  end: number
  duration?: number
  delay?: number
  enabled?: boolean
}

export function useCountUp({ end, duration = 1500, delay = 0, enabled = true }: UseCountUpOptions) {
  const [value, setValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!enabled || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = performance.now() + delay

    function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4) }

    function tick(now: number) {
      const elapsed = now - startTime
      if (elapsed < 0) {
        requestAnimationFrame(tick)
        return
      }
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(easeOutQuart(progress) * end))
      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [end, duration, delay, enabled])

  return value
}
