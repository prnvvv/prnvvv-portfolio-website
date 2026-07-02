import { Award } from 'lucide-react'
import type { ReactNode } from 'react'

const STATUS_TERMINAL_COLORS: Record<string, string> = {
  'PATENT PUBLISHED': '#00e67a',
  'PATENT FILED': '#f59e0b',
  'UNDER REVIEW': '#60a5fa',
  'DEPLOYED': '#06d6a0',
  'PUBLISHED': '#00e67a',
  'COMPLETED': '#00e67a',
  'ACTIVE': '#60a5fa',
}

interface TerminalCardProps {
  id: string
  title: string
  description: string
  technologies: string[]
  status: string
  year?: string
  award?: string
  className?: string
  truncateDescription?: boolean
  onClick?: () => void
  children?: ReactNode
}

export const TerminalCard = ({
  id,
  title,
  description,
  technologies,
  status,
  year,
  award: awardLabel,
  className = '',
  truncateDescription = true,
  onClick,
  children,
}: TerminalCardProps) => {
  const statusColor = STATUS_TERMINAL_COLORS[status] || '#00e67a'

  return (
    <div
      className={`bg-[#0d0d14] border border-[#00e67a]/20 rounded-lg overflow-hidden h-full
                  shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-[#00e67a]/40
                  transition-all duration-300 flex flex-col cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Terminal Toolbar */}
      <div className="flex items-center h-8 px-3 bg-[#1a1a1a] border-b border-[#00e67a]/10
                      justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] hover:scale-110 transition-transform cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:scale-110 transition-transform cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] hover:scale-110 transition-transform cursor-pointer" />
        </div>
        <span className="text-[10px] font-mono text-white/20 tracking-wider">{id}</span>
        <div className="w-14" />
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-3 md:p-4 bg-black/40 font-mono text-xs md:text-sm overflow-hidden flex flex-col">
        {/* Prompt Line 1: User@host */}
        <div className="flex items-center flex-wrap gap-1">
          <span className="text-[#00e67a] font-bold">┌──</span>
          <span className="text-[#00e67a]">user</span>
          <span className="text-white/30">@</span>
          <span className="text-[#3d9df6]">ghost-protocol</span>
          <span className="text-white/30">:</span>
          <span className="text-[#3d9df6]">~/missions</span>
        </div>

        {/* Prompt Line 2: Status */}
        <div className="flex items-center flex-wrap gap-1 mt-0.5">
          <span className="text-[#00e67a]">└──</span>
          <span className="text-white/30">$</span>
          <span className="text-white/60">cat</span>
          <span className="text-white/30">status</span>
          <span className="text-white/30">&rarr;</span>
          <span className="font-bold" style={{ color: statusColor }}>
            {status}
          </span>
          {year && (
            <>
              <span className="text-white/20">|</span>
              <span className="text-white/30">{year}</span>
            </>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-[#00e67a]/10 my-2" />

        {/* Title */}
        <div className="text-white font-bold text-sm md:text-base mb-1">
          {title}
        </div>

        {/* Description */}
        <div className={`text-white/60 text-xs md:text-sm leading-relaxed flex-1 ${truncateDescription ? 'line-clamp-3' : ''}`}>
          {description}
        </div>

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-[10px] bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white/70"
            >
              {tech}
            </span>
          ))}
          {technologies.length > 4 && (
            <span className="text-[10px] text-white/30">+{technologies.length - 4}</span>
          )}
        </div>

        {/* Award line */}
        {awardLabel && (
          <div className="flex items-center gap-1.5 mt-2">
            <Award size={10} className="text-[#f0a500]" />
            <span className="font-mono text-[9px] text-[#f0a500]">{awardLabel}</span>
          </div>
        )}

        {/* Cursor */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-white/30 text-[10px]">READY</span>
          <span className="block h-3.5 w-[6px] bg-[#00e67a] animate-pulse rounded-sm" />
        </div>

        {children}
      </div>
    </div>
  )
}
