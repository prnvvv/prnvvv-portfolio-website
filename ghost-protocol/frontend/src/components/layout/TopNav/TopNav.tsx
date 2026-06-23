import { motion } from 'framer-motion'
import { useUIStore } from '../../../store/uiStore'
import { NAV_TABS } from '../../../utils/constants'

export default function TopNav() {
  const { activeSection, setActiveSection } = useUIStore()

  const scrollTo = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0a0c0a]/90 backdrop-blur-sm border-b border-[#1a2e1a]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-12 gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 mr-4 shrink-0">
            <span className="blinking-dot" />
            <span
              className="text-[#00ff88] text-xs tracking-[0.25em] font-heading whitespace-nowrap"
              style={{ fontFamily: 'Orbitron' }}
            >
              GHOST PROTOCOL
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollTo(tab.id)}
                className="relative px-3 py-1 text-[10px] font-heading tracking-[0.15em] transition-colors whitespace-nowrap"
                style={{
                  fontFamily: 'Orbitron',
                  color: activeSection === tab.id ? '#00ff88' : '#5a8a6a',
                }}
              >
                {tab.icon} {tab.label}
                {activeSection === tab.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[1px] bg-[#00ff88]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          <MobileNavMenu activeSection={activeSection} onScrollTo={scrollTo} />
        </div>
      </div>
    </nav>
  )
}

function MobileNavMenu({
  activeSection,
  onScrollTo,
}: {
  activeSection: string
  onScrollTo: (id: string) => void
}) {
  const { isNavOpen, toggleNav } = useUIStore()

  return (
    <div className="md:hidden ml-auto">
      <button
        onClick={toggleNav}
        className="text-[#00ff88] text-xs font-heading tracking-[0.15em] px-2 py-1 border border-[#1a2e1a] rounded-sm"
        style={{ fontFamily: 'Orbitron' }}
      >
        {isNavOpen ? '[X] CLOSE' : '[=] MENU'}
      </button>
      {isNavOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-[#0d110d] border-b border-[#1a2e1a] p-2"
        >
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onScrollTo(tab.id)
                toggleNav()
              }}
              className="block w-full text-left px-3 py-2 text-[10px] font-heading tracking-[0.15em] transition-colors"
              style={{
                fontFamily: 'Orbitron',
                color: activeSection === tab.id ? '#00ff88' : '#5a8a6a',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
