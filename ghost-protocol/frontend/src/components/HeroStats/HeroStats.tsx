import { useEffect, useState } from 'react'

interface HeroStatsProps {
  className?: string
}

const STATS = [
  { value: 8, label: 'PROJECTS', suffix: '' },
  { value: 3, label: 'WINS', suffix: '' },
  { value: 3, label: 'ACTIVE OPS', suffix: '' },
  { value: 4, label: 'YRS EXP', suffix: '+' },
]

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export default function HeroStats({ className = '' }: HeroStatsProps) {
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0])

  useEffect(() => {
    const duration = 1400
    const startTime = Date.now()
    let rafId: number

    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOut(progress)
      setCounts(STATS.map(s => Math.round(s.value * eased)))
      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className={`hero-stats-row ${className}`} role="region" aria-label="Portfolio statistics">
      {STATS.map((stat, i) => (
        <div key={i} className="hero-stat-block">
          <span className="hero-stat-value">{counts[i]}{stat.suffix}</span>
          <span className="hero-stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
