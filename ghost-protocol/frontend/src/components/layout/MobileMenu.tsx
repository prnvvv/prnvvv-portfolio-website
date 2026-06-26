import { motion, AnimatePresence } from 'framer-motion'
import { NAV_TABS } from '../../utils/constants'

interface MobileMenuProps {
  isOpen: boolean
  activeSection: string
  onNavigate: (id: string) => void
}

export default function MobileMenu({ isOpen, activeSection, onNavigate }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-[#00e67a]/20 overflow-hidden"
        >
          <div className="py-2">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`w-full text-left py-4 px-6 border-b border-white/5 text-sm font-mono uppercase tracking-wider transition-all duration-200 ${
                  activeSection === tab.id
                    ? 'text-[#00e67a] bg-[#00e67a]/5 border-l-2 border-l-[#00e67a]'
                    : 'text-gray-300 hover:text-[#00e67a] hover:bg-[#00e67a]/5'
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
