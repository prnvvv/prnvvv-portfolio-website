import { useCallback } from 'react'
import { motion } from 'framer-motion'

interface SmoothScrollLinkProps {
  target: string
  label: string
  isActive: boolean
  onClick?: () => void
  offset?: number
  icon?: string
}

export default function SmoothScrollLink({
  target,
  label,
  isActive,
  onClick,
  offset = -80,
  icon,
}: SmoothScrollLinkProps) {
  const handleClick = useCallback(() => {
    const el = document.getElementById(target)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top, behavior: 'smooth' })
    onClick?.()
  }, [target, offset, onClick])

  return (
    <motion.button
      onClick={handleClick}
      className="relative px-3 py-1"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        outline: 'none',
      }}
      animate={{
        color: isActive ? 'var(--accent-green)' : 'var(--text-muted)',
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ color: 'var(--text-primary)' }}
      aria-label={`Navigate to ${label}`}
    >
      <span className="font-mono uppercase tracking-[0.15em]" style={{ fontSize: 'var(--text-sm)' }}>
        {icon && <span className="mr-1.5">{icon}</span>}
        <motion.span
          style={{
            display: 'inline-block',
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: 'var(--accent-green)',
            marginRight: 6,
            verticalAlign: 'middle',
          }}
          animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
        />
        {label}
      </span>
      <motion.span
        style={{
          position: 'absolute',
          bottom: 0,
          left: 8,
          right: 8,
          height: '1px',
          background: 'var(--accent-green)',
          boxShadow: isActive ? '0 0 8px rgba(0, 230, 122, 0.6)' : 'none',
        }}
        animate={{ width: isActive ? '100%' : '0%' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.button>
  )
}
