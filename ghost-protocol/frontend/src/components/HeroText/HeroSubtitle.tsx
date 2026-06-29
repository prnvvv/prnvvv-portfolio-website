import { useEffect, useState } from 'react'

interface HeroSubtitleProps {
  lines: string[]
  className?: string
  initialDelay?: number
}

export default function HeroSubtitle({
  lines,
  className = '',
  initialDelay = 800,
}: HeroSubtitleProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), initialDelay)
    return () => clearTimeout(timer)
  }, [initialDelay])

  if (!visible) return <div className={`hero-subtitle-wrap ${className}`} aria-hidden="true" />

  return (
    <div
      className={`hero-subtitle-wrap ${className}`}
      role="text"
      aria-label={lines.join('. ')}
    >
      {lines.map((line, i) => (
        <p key={i} className="hero-subtitle-line">
          {line || '\u00A0'}
        </p>
      ))}
    </div>
  )
}