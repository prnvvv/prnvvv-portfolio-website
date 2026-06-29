import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface ClearanceBadgeProps {
  level?: string
  label?: string
  className?: string
  charSpeed?: number
  initialDelay?: number
}

export default function ClearanceBadge({
  level = 'LEVEL 5',
  label = 'OMEGA CLEARANCE',
  className = '',
  charSpeed = 40,
  initialDelay = 600,
}: ClearanceBadgeProps) {
  const reduced = usePrefersReducedMotion()
  const [displayed, setDisplayed] = useState(reduced ? label : '')

  useEffect(() => {
    if (reduced) {
      setDisplayed(label)
      return
    }

    let current = ''
    let index = 0
    let timer: ReturnType<typeof setTimeout>

    function type() {
      if (index < label.length) {
        current += label[index]
        setDisplayed(current)
        index++
        timer = setTimeout(type, charSpeed)
      }
    }

    const startTimer = setTimeout(type, initialDelay)
    return () => {
      clearTimeout(startTimer)
      clearTimeout(timer)
    }
  }, [label, charSpeed, initialDelay, reduced])

  return (
    <div
      className={`clearance-badge ${className}`}
      role="status"
      aria-label={label}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="flex-shrink-0">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="7" cy="7" r="2" fill="currentColor" />
      </svg>
      <span className="clearance-badge-text" style={{ display: 'grid' }}>
        <span aria-hidden="true" style={{ gridRow: 1, gridColumn: 1, visibility: 'hidden' }}>{label}</span>
        <span aria-hidden="true" style={{ gridRow: 1, gridColumn: 1, overflow: 'hidden' }}>{displayed}</span>
      </span>
      <span className="level-tag">{level}</span>
    </div>
  )
}