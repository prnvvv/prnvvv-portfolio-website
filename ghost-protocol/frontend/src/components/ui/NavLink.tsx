import { motion } from 'framer-motion'

interface NavLinkProps {
  icon: string
  label: string
  isActive: boolean
  onClick: () => void
}

export default function NavLink({ icon, label, isActive, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`relative group px-3 py-1.5 transition-colors duration-200 ${
        isActive ? 'bg-mil-green/4' : ''
      }`}
      aria-label={`Navigate to ${label}`}
    >
        <span
          className={`relative font-mono uppercase tracking-[0.15em] transition-all duration-300 ${
            isActive
              ? 'text-mil-green'
              : 'text-white/40 group-hover:text-mil-green'
          }`}
          style={{ fontSize: 'var(--text-sm)' }}
        >
          {icon && <span className="mr-1.5">{icon}</span>}
          {label}
        </span>
        <span
          className={`absolute bottom-0 left-2 right-2 h-[2px] transition-all duration-300 origin-left ${
            isActive
              ? 'scale-x-100 bg-mil-green'
              : 'scale-x-0 bg-transparent group-hover:scale-x-100 group-hover:bg-mil-green/50'
          }`}
        />
        {isActive && (
          <motion.span
            layoutId="nav-indicator"
            className="absolute -bottom-[1px] left-2 right-2 h-[2px]"
            style={{
              background: 'var(--accent-green)',
              boxShadow: '0 0 8px rgba(0,230,122,0.6), 0 0 16px rgba(0,230,122,0.2)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
    </button>
  )
}
