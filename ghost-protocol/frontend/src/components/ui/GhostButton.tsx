import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GhostButtonProps {
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
}

export default function GhostButton({ href, onClick, children, className = "" }: GhostButtonProps) {
  const base =
    "group relative rounded-lg border-2 border-[#00e67a] transition-all duration-500 shadow-[0_0_40px_rgba(0,230,122,0.12)] hover:shadow-[0_0_60px_rgba(0,230,122,0.3)] flex items-center overflow-hidden cursor-pointer active:scale-[0.97] active:transition-transform active:duration-100"

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn(base, className)} style={{ outline: "none" }}>
        {children}
        <span className="absolute inset-0 -z-10 bg-gradient-to-r from-[#00e67a]/0 via-[#00e67a]/20 to-[#00e67a]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </a>
    )
  }

  return (
    <button onClick={onClick} className={cn(base, className)} style={{ outline: "none" }}>
      {children}
      <span className="absolute inset-0 -z-10 bg-gradient-to-r from-[#00e67a]/0 via-[#00e67a]/20 to-[#00e67a]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </button>
  )
}
