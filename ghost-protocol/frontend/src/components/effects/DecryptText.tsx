import { useState, useEffect, useCallback } from 'react'

const CHARS = '!<>-_\\/[]{}—=+*^?#________'
const CYCLES_PER_LETTER = 2
const SHUFFLE_TIME = 50

interface DecryptTextProps {
  texts: string[]
  interval?: number
  className?: string
}

export default function DecryptText({ texts, interval = 4000, className = '' }: DecryptTextProps) {
  const [displayText, setDisplayText] = useState(texts[0])

  const decrypt = useCallback(async (target: string) => {
    const targetLen = target.length
    const totalCycles = CYCLES_PER_LETTER * Math.max(targetLen, 1)
    for (let i = 0; i <= totalCycles; i++) {
      const progress = i / totalCycles
      const result: string[] = []
      for (let j = 0; j < targetLen; j++) {
        if (j / targetLen < progress) {
          result.push(target[j])
        } else {
          result.push(CHARS[Math.floor(Math.random() * CHARS.length)])
        }
      }
      setDisplayText(result.join(''))
      await new Promise(r => setTimeout(r, SHUFFLE_TIME))
    }
    setDisplayText(target)
  }, [])

  useEffect(() => {
    if (texts.length <= 1) return
    let idx = 1
    const timer = setInterval(() => {
      const next = texts[idx % texts.length]
      decrypt(next)
      idx++
    }, interval)
    return () => clearInterval(timer)
  }, [texts, interval, decrypt])

  return <span className={className}>{displayText}</span>
}
