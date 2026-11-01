import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../../store/uiStore'

const DURATION = 3000

const LOADER_CSS = `
@keyframes square-animation {
   0% { left: 0; top: 0; }
  10.5% { left: 0; top: 0; }
  12.5% { left: 32px; top: 0; }
  23% { left: 32px; top: 0; }
  25% { left: 64px; top: 0; }
  35.5% { left: 64px; top: 0; }
  37.5% { left: 64px; top: 32px; }
  48% { left: 64px; top: 32px; }
  50% { left: 32px; top: 32px; }
  60.5% { left: 32px; top: 32px; }
  62.5% { left: 32px; top: 64px; }
  73% { left: 32px; top: 64px; }
  75% { left: 0; top: 64px; }
  85.5% { left: 0; top: 64px; }
  87.5% { left: 0; top: 32px; }
  98% { left: 0; top: 32px; }
  100% { left: 0; top: 0; }
}
.loader {
  position: relative;
  width: 96px;
  height: 96px;
  transform: rotate(45deg);
}
.loader-square {
  position: absolute;
  top: 0;
  left: 0;
  width: 28px;
  height: 28px;
  margin: 2px;
  background: rgba(0,230,122,0.6);
  box-shadow: 0 0 6px rgba(0,230,122,0.12);
  animation: square-animation 10s ease-in-out infinite both;
}
`

export default function LoadingScreen() {
  const { isLoading, setLoading, setLoadingProgress } = useUIStore()
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

    const interval = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - startTime) / DURATION) * 100))
      setDisplayProgress(pct)
      setLoadingProgress(pct)
      if (pct >= 100) {
        clearInterval(interval)
        setShowGranted(true)
        setTimeout(complete, 400)
      }
    }, 16)

    return () => clearInterval(interval)
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
          <style>{LOADER_CSS}</style>

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

          {/* Centered loader */}
          <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-7">
            <div className="loader">
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="loader-square" style={{ animationDelay: `${-i * 1.4285714286}s` }} />
              ))}
            </div>

            <div className="text-center">
              {!showGranted ? (
                <motion.p
                  className="font-mono text-[10px] sm:text-xs tracking-[0.25em] text-white/70"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  INITIALIZING...
                </motion.p>
              ) : (
                <motion.p
                  className="font-mono text-xs sm:text-sm tracking-[0.2em] text-[#00e67a]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  ACCESS GRANTED
                </motion.p>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-44 sm:w-48 space-y-1">
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
                <span className="text-[10px] font-mono tracking-[0.15em] text-white/15" style={{ fontFamily: 'var(--font-mono)' }}>
                  SYS::BOOT
                </span>
                <span className="text-[10px] font-mono text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>
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
