import { useMotionValue, useSpring, useTransform, type MotionStyle } from 'framer-motion'
import { motion } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

interface MagicBentoProps {
  children: ReactNode
  className?: string
  color?: string
  intensity?: number
}

export function MagicBento({ children, className = '', color = '#00e67a', intensity = 8 }: MagicBentoProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 })
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 })

  const rotateX = useTransform(mouseY, [0, 1], [intensity, -intensity])
  const rotateY = useTransform(mouseX, [0, 1], [-intensity, intensity])

  const glareX = useTransform(mouseX, [0, 1], [0, 100])
  const glareY = useTransform(mouseY, [0, 1], [0, 100])

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width)
    y.set((e.clientY - rect.top) / rect.height)
  }

  const handleLeave = () => {
    x.set(0.5)
    y.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
        transformStyle: 'preserve-3d',
      } as MotionStyle}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  )
}
