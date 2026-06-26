import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'

interface AnimatedSectionProps {
  children: ReactNode
  id?: string
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
}

const directionOffset = {
  up: { y: 32 },
  down: { y: -32 },
  left: { x: 32 },
  right: { x: -32 },
}

export default function AnimatedSection({
  children,
  id,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.7,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px 0px' })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) controls.start('visible')
  }, [isInView, controls])

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, ...directionOffset[direction] },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </motion.section>
  )
}
