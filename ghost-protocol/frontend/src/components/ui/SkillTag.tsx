import { motion } from 'framer-motion'

interface SkillTagProps {
  name: string
}

export default function SkillTag({ name }: SkillTagProps) {
  return (
    <motion.span
      className="font-mono cursor-default select-none inline-block"
      style={{
        color: 'var(--text-secondary)',
        background: 'rgba(0, 230, 122, 0.06)',
        border: '1px solid rgba(0, 230, 122, 0.25)',
        fontSize: 'var(--text-sm)',
        padding: '4px 10px',
        letterSpacing: '0.03em',
        lineHeight: 1.3,
      }}
      whileHover={{
        borderColor: 'rgba(0, 230, 122, 0.6)',
        color: 'var(--accent-green)',
        background: 'rgba(0, 230, 122, 0.1)',
      }}
    >
      {name}
    </motion.span>
  )
}
