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
      className="relative group px-3 py-1"
      aria-label={`Navigate to ${label}`}
    >
      <span
        className={`relative text-[11px] font-mono uppercase tracking-[0.15em] transition-all duration-300 ${
          isActive
            ? 'text-[#00e67a]'
            : 'text-gray-400 group-hover:text-[#00e67a]'
        }`}
      >
        {icon && <span className="mr-1.5">{icon}</span>}
        {label}
      </span>
      <span
        className={`absolute bottom-0 left-2 right-2 h-[2px] bg-[#00e67a] transition-transform duration-300 origin-left ${
          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
      {isActive && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute -bottom-[1px] left-2 right-2 h-[2px] bg-[#00e67a] shadow-[0_0_6px_rgba(0,230,122,0.5)]"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  )
}
