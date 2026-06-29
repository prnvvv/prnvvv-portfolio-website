import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Home, User, Target, Award, MessageCircle } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'HOME', action: 'navigate' as const },
  { id: 'dossier', icon: User, label: 'OPERATOR DOSSIER', action: 'scroll' as const },
  { id: 'missions', icon: Target, label: 'MISSIONS', action: 'scroll' as const },
  { id: 'service-record', icon: Award, label: 'SERVICE RECORD', action: 'scroll' as const },
  { id: 'comms', icon: MessageCircle, label: 'COMMS CONSOLE', action: 'scroll' as const },
]

export default function VerticalDock() {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeSection, setActiveSection } = useUIStore()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const isLanding = location.pathname === '/'

  if (isLanding) return null

  const handleNav = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.action === 'navigate') {
      navigate('/')
      return
    }
    setActiveSection(item.id)
    const el = document.getElementById(item.id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        left: 12,
        top: '50%',
        translateY: '-50%',
        zIndex: 50,
        width: 64,
        background: 'rgba(8, 6, 18, 0.88)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        padding: '6px 0',
        boxShadow:
          '0 0 0 1px rgba(0,230,122,0.06), 0 8px 32px rgba(0,0,0,0.7), 0 0 40px rgba(0,230,122,0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* ─── Nav Items ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, padding: '4px 6px' }}>
        {NAV_ITEMS.map((item, idx) => {
          const isActive = activeSection === item.id
          const Icon = item.icon
          const showTooltip = hoveredId === item.id

          return (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* ─── Separator after Home ─── */}
              {idx === 1 && (
                <div
                  style={{
                    height: 1,
                    margin: '4px 10px 6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    flexShrink: 0,
                  }}
                />
              )}

              <div
                onClick={() => handleNav(item)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 52,
                  height: 44,
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: isActive ? 'rgba(0, 230, 122, 0.08)' : 'transparent',
                  transition: 'background 200ms ease',
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(0, 230, 122, 0.04)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = isActive ? 'rgba(0, 230, 122, 0.08)' : 'transparent'
                }}
                role="button"
                aria-label={item.label}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="vd-active-indicator"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      translateY: '-50%',
                      width: 3,
                      height: 18,
                      borderRadius: '0 3px 3px 0',
                      background: '#00e67a',
                      boxShadow: '0 0 8px rgba(0, 230, 122, 0.5)',
                    }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <Icon
                    size={22}
                    strokeWidth={1.6}
                    style={{
                      color: isActive
                        ? '#00e67a'
                        : hoveredId === item.id
                          ? 'rgba(0, 230, 122, 0.8)'
                          : 'rgba(180, 180, 190, 0.45)',
                      transition: 'color 200ms ease',
                    }}
                  />
                </motion.div>

                {/* Tooltip — macOS dock style */}
                {showTooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 'calc(100% + 14px)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(8, 6, 18, 0.95)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(0, 230, 122, 0.15)',
                      borderRadius: 6,
                      padding: '5px 10px',
                      whiteSpace: 'nowrap',
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      color: isActive ? '#00e67a' : 'rgba(200, 200, 200, 0.75)',
                      pointerEvents: 'none',
                      zIndex: 60,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Status Dot ─── */}
      <div
        style={{
          padding: '6px 0 8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          display: 'flex',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setHoveredId('status')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <motion.div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#00e67a',
              boxShadow: '0 0 6px rgba(0, 230, 122, 0.6)',
            }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Status tooltip */}
          {hoveredId === 'status' && (
            <div
              style={{
                position: 'absolute',
                left: 'calc(100% + 14px)',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(8, 6, 18, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 230, 122, 0.15)',
                borderRadius: 6,
                padding: '5px 10px',
                whiteSpace: 'nowrap',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.12em',
                color: 'rgba(0, 230, 122, 0.8)',
                pointerEvents: 'none',
                zIndex: 60,
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              }}
            >
              SYSTEM ONLINE
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
