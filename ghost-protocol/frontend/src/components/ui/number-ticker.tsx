import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react"
import { useInView, useMotionValue, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
  duration?: number
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  duration,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "0px" })
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!isInView) return
    const timer = setTimeout(() => setStarted(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [isInView, delay])

  useEffect(() => {
    if (!started || !duration) return

    const from = direction === "down" ? value : startValue
    const to = direction === "down" ? startValue : value
    const diff = to - from
    const startTime = performance.now()

    let rafId: number

    function tick(now: number) {
      const currentEl = ref.current
      if (!currentEl) return

      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration!, 1)
      const current = from + diff * progress

      currentEl.textContent = Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(Number(current.toFixed(decimalPlaces)))

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [started, duration, value, startValue, direction, decimalPlaces])

  const motionValue = useMotionValue(direction === "down" ? value : startValue)
  const springValue = useSpring(motionValue, {
    damping: 10,
    stiffness: 20,
  })

  useEffect(() => {
    if (!started || duration) return
    motionValue.set(direction === "down" ? startValue : value)
  }, [started, duration, motionValue, value, startValue, direction])

  useEffect(() => {
    if (duration) return
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(Number(latest.toFixed(decimalPlaces)))
      }
    })
  }, [springValue, decimalPlaces, duration])

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tracking-wider text-black tabular-nums dark:text-white",
        className
      )}
      {...props}
    >
      {startValue}
    </span>
  )
}
