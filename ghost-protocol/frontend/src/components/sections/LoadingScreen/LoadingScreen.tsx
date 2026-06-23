import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../../store/uiStore'
import { LOADING_DURATION } from '../../../utils/constants'

const bootLines = [
  'INITIALIZING GHOST PROTOCOL v1.0.0...',
  'LOADING COMMAND CENTER INTERFACE...',
  'ESTABLISHING SECURE CONNECTION...',
  'VERIFYING OPERATOR CREDENTIALS...',
  'DEPLOYING AI CORE SYSTEMS...',
  'OPERATION READY.',
]

export default function LoadingScreen() {
  const { isLoading, setLoading, setLoadingProgress } = useUIStore()
  const [currentLine, setCurrentLine] = useState(0)
  const [progress, setProgress] = useState(0)
  const completeRef = useRef(false)

  const complete = useCallback(() => {
    if (completeRef.current) return
    completeRef.current = true
    setProgress(100)
    setLoadingProgress(100)
    setTimeout(() => setLoading(false), 400)
  }, [setLoading, setLoadingProgress])

  useEffect(() => {
    const interval = LOADING_DURATION / bootLines.length
    const lineTimer = setInterval(() => {
      setCurrentLine((prev) => {
        if (prev >= bootLines.length - 1) {
          clearInterval(lineTimer)
          return prev
        }
        return prev + 1
      })
    }, interval)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1
        if (next >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return next
      })
    }, LOADING_DURATION / 105)

    return () => {
      clearInterval(lineTimer)
      clearInterval(progressInterval)
    }
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      complete()
    }
  }, [progress, complete])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0c0a]"
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
        <div className="w-full max-w-md px-6">
          <div className="text-center mb-12">
            <h1
              className="text-[#00ff88] text-xl tracking-[0.3em] font-heading mb-2"
              style={{ fontFamily: 'Orbitron' }}
            >
              GHOST PROTOCOL
            </h1>
            <p
              className="text-[#5a8a6a] text-xs tracking-[0.2em] font-body"
            >
              COMMAND CENTER v1.0.0
            </p>
          </div>
          <div className="space-y-2 mb-8 h-32">
            {bootLines.map((line, i) => (
              <motion.p
                key={i}
                className="text-xs font-body"
                style={{
                  color: i < currentLine ? '#5a8a6a' : i === currentLine ? '#00ff88' : '#1a2e1a',
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {i < currentLine ? `[ OK ] ${line}` : i === currentLine ? `[ >> ] ${line}` : `[    ] ${line}`}
              </motion.p>
            ))}
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[#5a8a6a] text-[10px] font-body text-right mt-2">
            {progress}%
          </p>
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
