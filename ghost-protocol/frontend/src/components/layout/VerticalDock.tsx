import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { User, Rocket, Award, MessageCircle } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

const NAV_ITEMS = [
  { id: 'dossier', icon: User, label: 'OPERATOR DOSSIER' },
  { id: 'missions', icon: Rocket, label: 'MISSIONS' },
  { id: 'service-record', icon: Award, label: 'SERVICE RECORD' },
  { id: 'comms', icon: MessageCircle, label: 'COMMS CONSOLE' },
]

export default function VerticalDock() {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeSection, setActiveSection } = useUIStore()
  const [hovered, setHovered] = useState(false)
  const isLanding = location.pathname === '/'

  if (isLanding) return null

  const dockWidth = hovered ? 200 : 72

  const handleNav = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ width: dockWidth }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed',
        left: 12,
        top: '50%',
        translateY: '-50%',
        zIndex: 50,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0, 230, 122, 0.10)',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '6px 0',
        boxShadow: '0 0 0 1px rgba(0,230,122,0.06), 0 8px 32px rgba(0,0,0,0.7), 0 0 40px rgba(0,230,122,0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px 10px',
          margin: '0 0 4px',
          cursor: 'pointer',
          borderBottom: '1px solid rgba(0, 230, 122, 0.08)',
          flexShrink: 0,
        }}
        aria-label="Go to homepage"
      >
        <motion.div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(0, 230, 122, 0.10)',
            border: '1px solid rgba(0, 230, 122, 0.30)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          whileHover={{ scale: 1.08, borderColor: 'rgba(0, 230, 122, 0.6)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 14, fontWeight: 700, color: '#00e67a' }}>
            GP
          </span>
        </motion.div>
        <motion.span
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 11,
            letterSpacing: '0.15em',
            color: '#00e67a',
            whiteSpace: 'nowrap',
          }}
        >
          GHOST PROTOCOL
        </motion.span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 8px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id
          const Icon = item.icon
          return (
            <motion.div
              key={item.id}
              onClick={() => handleNav(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '10px 10px',
                borderRadius: 10,
                cursor: 'pointer',
                position: 'relative',
                background: isActive ? 'rgba(0, 230, 122, 0.08)' : 'transparent',
              }}
              whileHover={{ background: isActive ? 'rgba(0, 230, 122, 0.08)' : 'rgba(0, 230, 122, 0.04)' }}
              transition={{ duration: 0.15 }}
              role="button"
              aria-label={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="vd-active-indicator"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    translateY: '-50%',
                    width: 3,
                    height: 20,
                    borderRadius: '0 3px 3px 0',
                    background: '#00e67a',
                    boxShadow: '0 0 8px rgba(0, 230, 122, 0.5)',
                  }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={1.8}
                style={{
                  color: isActive ? '#00e67a' : 'rgba(200, 200, 200, 0.6)',
                  flexShrink: 0,
                  transition: 'color 200ms ease',
                }}
              />
              {hovered && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: 0.05 }}
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 11,
                    letterSpacing: '0.10em',
                    color: isActive ? '#00e67a' : 'rgba(200, 200, 200, 0.5)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </motion.span>
              )}
            </motion.div>
          )
        })}
      </div>

      <div
        style={{
          padding: '10px 16px 14px',
          borderTop: '1px solid rgba(0, 230, 122, 0.06)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#00e67a',
              boxShadow: '0 0 6px rgba(0, 230, 122, 0.6)',
              flexShrink: 0,
            }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'rgba(0, 230, 122, 0.7)',
              whiteSpace: 'nowrap',
            }}
          >
            {hovered ? 'SYSTEM ONLINE' : 'ACTIVE'}
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}
