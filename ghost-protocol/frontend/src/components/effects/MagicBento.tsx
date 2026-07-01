import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface MagicBentoProps {
  children: ReactNode
  className?: string
}

export function MagicBento({ children, className = '' }: MagicBentoProps) {
  return (
    <motion.div className={`relative ${className}`}>
      {children}
    </motion.div>
  )
}
