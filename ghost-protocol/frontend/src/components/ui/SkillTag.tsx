import { motion } from 'framer-motion'

interface SkillTagProps {
  name: string
  catColor?: string
}

export default function SkillTag({ name, catColor = '#00e67a' }: SkillTagProps) {
  return (
    <motion.span
      className="font-mono cursor-default select-none inline-block"
      style={{
        color: 'rgba(255, 255, 255, 0.75)',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: 'var(--text-xs)',
        padding: '3px 10px',
        letterSpacing: '0.04em',
        lineHeight: 1.3,
        borderRadius: '5px',
      }}
      whileHover={{
        borderColor: catColor + '99',
        color: catColor,
        background: catColor + '14',
      }}
    >
      {name}
    </motion.span>
  )
}
