import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface HeroNameProps {
  name: string
  className?: string
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&▓▒░█▄▀■□▪▫'

export default function HeroName({ name, className = '' }: HeroNameProps) {
  const reduced = usePrefersReducedMotion()
  const [displayText, setDisplayText] = useState(() =>
    reduced ? name : name.replace(/[a-zA-Z0-9]/g, () => CHARS[Math.floor(Math.random() * CHARS.length)])
  )
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (reduced) return

    let frame = 0
    const totalFrames = 14
    const revealStart = 4
    let timer: ReturnType<typeof setInterval>

    const runAnimation = () => {
      frame = 0
      setDisplayText(
        name.replace(/[a-zA-Z0-9]/g, () => CHARS[Math.floor(Math.random() * CHARS.length)])
      )

      timer = setInterval(() => {
        frame++

        if (frame < revealStart) {
          setDisplayText(
            name.replace(/[a-zA-Z0-9]/g, () => CHARS[Math.floor(Math.random() * CHARS.length)])
          )
        } else if (frame < totalFrames) {
          const progress = (frame - revealStart) / (totalFrames - revealStart)
          const revealCount = Math.floor(progress * name.length)

          setDisplayText(
            name.split('').map((char, i) => {
              if (char === ' ') return ' '
              if (i < revealCount) return char
              return CHARS[Math.floor(Math.random() * CHARS.length)]
            }).join('')
          )
        } else {
          setDisplayText(name)
          clearInterval(timer)
          setTimeout(() => setKey(k => k + 1), 4000)
        }
      }, 65)
    }

    runAnimation()

    return () => clearInterval(timer)
  }, [name, reduced, key])

  if (reduced) {
    return <h1 className={`hero-name ${className}`}>{name}</h1>
  }

  return (
    <h1 className={`hero-name ${className}`} aria-label={name}>
      <span aria-hidden="true" className="hero-name-reserve">{name}</span>
      <span aria-hidden="true" className="hero-name-animated">
        {displayText.split('').map((char, i) => (
          <span key={i} className="hero-name-char">
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </h1>
  )
}