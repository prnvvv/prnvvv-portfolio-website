import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MarqueeProps {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children?: ReactNode
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
}: MarqueeProps) {
  const animName = reverse ? "marquee-reverse" : "marquee"

  return (
    <div
      className={cn(
        "group flex overflow-hidden",
        pauseOnHover && "hover:[&>*]:[animation-play-state:paused]",
        className
      )}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div
        className="flex shrink-0 items-stretch gap-6"
        style={{
          animation: `${animName} var(--duration, 40s) linear infinite`,
        }}
      >
        {children}
      </div>
      <div
        className="flex shrink-0 items-stretch gap-6"
        style={{
          animation: `${animName} var(--duration, 40s) linear infinite`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
