import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../../store/uiStore'

const bootLines: [string, string][] = [
  ['    0.000000', 'GHOST Protocol v1.0.0 \u2014 Command Center'],
  ['    0.001234', 'Loading operator profile'],
  ['    0.002345', 'Initializing tactical interface'],
  ['    0.003456', 'Loading AI core modules'],
  ['    0.004567', 'Establishing secure tunnel'],
  ['    0.005678', 'Verifying intelligence database'],
  ['    0.006789', 'Preparing command center'],
]

type LineState = 'pending' | 'typing' | 'done'

const DURATION = 3000

export default function LoadingScreen() {
  const { isLoading, setLoading, setLoadingProgress } = useUIStore()
  const [lineStates, setLineStates] = useState<LineState[]>(() => bootLines.map(() => 'pending'))
  const [typedTexts, setTypedTexts] = useState<string[]>(() => bootLines.map(() => ''))
  const [displayProgress, setDisplayProgress] = useState(0)
  const [showGranted, setShowGranted] = useState(false)
  const completeRef = useRef(false)

  const complete = useCallback(() => {
    if (completeRef.current) return
    completeRef.current = true
    setLoadingProgress(100)
    setLoading(false)
  }, [setLoading, setLoadingProgress])

  useEffect(() => {
    if (!isLoading) return

    const startTime = Date.now()
    const doneRef = { value: false }
    const timers: (number | ReturnType<typeof setTimeout>)[] = []

    const clearAll = () => {
      timers.forEach(t => { clearInterval(t as number); clearTimeout(t as number) })
    }

    timers.push(setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - startTime) / DURATION) * 100))
      setDisplayProgress(pct)
      setLoadingProgress(pct)
    }, 16))

    let lineIdx = 0
    const typeNext = () => {
      if (lineIdx >= bootLines.length) {
        doneRef.value = true
        return
      }
      const idx = lineIdx++
      const line = bootLines[idx][1]
      let pos = 0

      setLineStates(prev => {
        const next = [...prev]
        next[idx] = 'typing'
        return next
      })

      const ti = setInterval(() => {
        pos++
        setTypedTexts(prev => {
          const next = [...prev]
          next[idx] = line.slice(0, pos)
          return next
        })
        if (pos >= line.length) {
          clearInterval(ti)
          setLineStates(prev => {
            const next = [...prev]
            next[idx] = 'done'
            return next
          })
          timers.push(setTimeout(typeNext, 60))
        }
      }, 11)
      timers.push(ti)
    }
    typeNext()

    timers.push(setInterval(() => {
      const elapsed = Date.now() - startTime
      if (elapsed >= DURATION && doneRef.value && !completeRef.current) {
        clearAll()
        setShowGranted(true)
        setTimeout(complete, 400)
      }
    }, 50))

    return clearAll
  }, [isLoading, complete, setLoadingProgress])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: '#080c09' }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
        >
          {/* Green radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 45%, rgba(0,230,122,0.03) 0%, transparent 60%)',
            }}
          />

          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,230,122,0.01) 2px, rgba(0,230,122,0.01) 4px)',
            }}
          />

          {/* Compact boot log */}
          <div className="relative z-10 w-full max-w-sm px-6">
            <div className="space-y-[3px] mb-5 min-h-[170px]">
              {bootLines.map(([ts, msg], i) => {
                const state = lineStates[i]
                return (
                  <motion.div
                    key={i}
                    className="flex font-mono text-[12px] sm:text-[13px] leading-relaxed"
                    style={{ fontFamily: "'Share Tech Mono', 'IBM Plex Mono', monospace" }}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: showGranted
                        ? 0.65
                        : state === 'pending'
                          ? 0.12
                          : state === 'typing'
                            ? 0.7
                            : 0.95,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <span
                      className="shrink-0 mr-[5px]"
                      style={{
                        color: state === 'done' ? 'rgba(0,230,122,0.7)' : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      [{ts}]
                    </span>
                    <span
                      style={{
                        color: showGranted
                          ? 'rgba(255,255,255,0.55)'
                          : state === 'done'
                            ? 'rgba(255,255,255,0.95)'
                            : 'rgba(255,255,255,0.55)',
                      }}
                    >
                      {typedTexts[i]}
                      {state === 'typing' && (
                        <span className="inline-block w-[2px] h-[14px] ml-px align-middle" style={{ background: '#00e67a' }} />
                      )}
                    </span>
                  </motion.div>
                )
              })}

              {/* ACCESS GRANTED */}
              {showGranted && (
                <motion.div
                  className="flex font-mono text-[12px] sm:text-[13px] leading-relaxed"
                  style={{ fontFamily: "'Share Tech Mono', 'IBM Plex Mono', monospace" }}
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span
                    className="shrink-0 mr-[5px]"
                    style={{ color: 'rgba(0,230,122,0.8)' }}
                  >
                    [    0.007890]
                  </span>
                  <span style={{ color: 'rgba(0,230,122,0.95)' }}>
                    ACCESS GRANTED
                  </span>
                </motion.div>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-[1px] bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, rgba(0,230,122,0.2), rgba(0,230,122,0.5))',
                  }}
                  animate={{ width: `${displayProgress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-mono tracking-[0.15em] text-white/15" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  SYS::BOOT
                </span>
                <span className="text-[9px] font-mono text-white/30" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  {displayProgress}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
