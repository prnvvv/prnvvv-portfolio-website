import { useNavigate, useLocation } from 'react-router-dom'
import { Dock, DockIcon } from '@/components/ui/dock'
import { NAV_TABS } from '@/utils/constants'
import { useUIStore } from '@/store/uiStore'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import { motion } from 'framer-motion'

export default function BottomDock() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeSection = useUIStore((s) => s.activeSection)
  const setActiveSection = useUIStore((s) => s.setActiveSection)
  const { scrollToSection } = useSmoothScroll()
  const isLanding = location.pathname === '/'

  if (isLanding) return null

  const handleNav = (id: string) => {
    setActiveSection(id)
    if (window.innerWidth < 1024) {
      scrollToSection(id, -80)
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: 'rgba(8, 12, 9, 0.90)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          boxShadow: '0 0 0 1px rgba(0,230,122,0.08), 0 8px 32px rgba(0,0,0,0.7), 0 0 40px rgba(0,230,122,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <Dock
          direction="middle"
          iconSize={58}
          iconMagnification={74}
          iconDistance={160}
          className="!gap-3 !px-0 !py-0 !bg-transparent !border-none !shadow-none !backdrop-filter-none"
        >
          {NAV_TABS.map((tab) => (
            <DockIcon
              key={tab.id}
              className={activeSection === tab.id ? 'text-[var(--g-green-secondary)]' : 'text-[var(--g-text-dim)]'}
              onClick={() => handleNav(tab.id)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <span className="text-sm leading-none">{tab.icon}</span>
                {activeSection === tab.id && (
                  <motion.div
                    layoutId="dock-active-indicator"
                    style={{ width: 4, height: 4, borderRadius: '50%', background: '#00e67a', boxShadow: '0 0 8px rgba(0,230,122,0.6)' }}
                  />
                )}
              </div>
            </DockIcon>
          ))}
          <div className="w-px h-6 bg-[var(--g-border-dim)] mx-1" />
          <DockIcon
            className="text-[var(--g-text-dim)]"
            onClick={() => navigate('/')}
          >
            <span className="text-xs font-heading tracking-widest">GHOST</span>
          </DockIcon>
        </Dock>
      </div>
    </div>
  )
}
