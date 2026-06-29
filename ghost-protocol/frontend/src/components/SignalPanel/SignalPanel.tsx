import { useMemo } from 'react'
import { useCountUp } from '../../hooks/useCountUp'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { getSignalStats, type SignalStat } from '../../data/signalStats'

interface SignalPanelProps {
  className?: string
}

function StatItem({ label, value, suffix }: SignalStat) {
  const count = useCountUp({ end: value, duration: 1800, delay: 400 })

  return (
    <div className="stat-item">
      <span className="stat-value">{count}{suffix || ''}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

export default function SignalPanel({ className = '' }: SignalPanelProps) {
  const reduced = usePrefersReducedMotion()
  const stats = useMemo(() => getSignalStats(), [])

  return (
    <div className={`signal-panel ${className}`} role="region" aria-label="Signal statistics panel">
      <div className="signal-header">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-mil-green inline-block blinking-dot" />
          <span className="font-mono text-[10px] text-mil-green uppercase tracking-[0.15em]">
            SIGNAL
          </span>
        </div>
        <span className="font-mono text-[10px] text-mil-text-muted uppercase tracking-[0.15em] opacity-60">
          LIVE FEED
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat, i) =>
          reduced ? (
            <div key={i} className="stat-item">
              <span className="stat-value">{stat.value}{stat.suffix || ''}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ) : (
            <StatItem key={i} {...stat} />
          )
        )}
      </div>
    </div>
  )
}
