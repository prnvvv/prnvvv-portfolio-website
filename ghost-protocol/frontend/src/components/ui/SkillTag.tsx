import { motion } from 'framer-motion'

interface SkillTagProps {
  name: string
}

export default function SkillTag({ name }: SkillTagProps) {
  return (
    <motion.span
      className="px-3 py-1.5 text-xs font-mono cursor-default select-none"
      style={{
        color: '#9a9aaa',
        background: 'rgba(0, 230, 122, 0.03)',
        border: '1px solid rgba(0, 230, 122, 0.2)',
        transition: 'all 0.2s ease',
        display: 'inline-block',
      }}
      whileHover={{
        borderColor: 'rgba(0, 230, 122, 0.5)',
        color: '#f0f0f0',
      }}
    >
      {name}
    </motion.span>
  )
}
