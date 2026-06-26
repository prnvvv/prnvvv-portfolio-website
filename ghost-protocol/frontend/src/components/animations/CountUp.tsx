import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export default function CountUp({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  className = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!isInView || hasStarted.current) return
    hasStarted.current = true

    const startTime = performance.now()
    const endValue = end

    function easeOutQuart(t: number): number {
      return 1 - Math.pow(1 - t, 4)
    }

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutQuart(progress)
      setCount(Math.floor(easedProgress * endValue))

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setCount(endValue)
      }
    }

    requestAnimationFrame(tick)
  }, [isInView, end, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  )
}
