import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { User, Briefcase, Rocket, Award, MessageCircle } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

const NAV_ITEMS = [
  { id: 'dossier', icon: User, label: 'OPERATOR DOSSIER' },
  { id: 'arsenal', icon: Briefcase, label: 'ARSENAL' },
  { id: 'missions', icon: Rocket, label: 'MISSIONS' },
  { id: 'service-record', icon: Award, label: 'SERVICE RECORD' },
  { id: 'comms', icon: MessageCircle, label: 'COMMS CONSOLE' },
]

export default function VerticalNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeSection, setActiveSection } = useUIStore()
  const [hovered, setHovered] = useState(false)
  const isLanding = location.pathname === '/'

  if (isLanding) return null

  const expanded = hovered
  const navWidth = expanded ? 200 : 72

  const handleNav = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleLogoClick = () => {
    navigate('/')
  }

  return (
    <nav
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: navWidth,
        zIndex: 50,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(0, 230, 122, 0.10)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div
        onClick={handleLogoClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '20px 16px',
          cursor: 'pointer',
          borderBottom: '1px solid rgba(0, 230, 122, 0.08)',
          flexShrink: 0,
        }}
        aria-label="Go to homepage"
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(0, 230, 122, 0.10)',
            border: '1px solid rgba(0, 230, 122, 0.30)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 14, fontWeight: 700, color: '#00e67a' }}>
            GP
          </span>
        </div>
        <span
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 11,
            letterSpacing: '0.15em',
            color: '#00e67a',
            whiteSpace: 'nowrap',
            opacity: expanded ? 1 : 0,
            transition: 'opacity 200ms ease',
          }}
        >
          GHOST PROTOCOL
        </span>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 0', gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id
          const Icon = item.icon
          return (
            <div
              key={item.id}
              onClick={() => handleNav(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '10px 16px',
                margin: '0 8px',
                borderRadius: 6,
                cursor: 'pointer',
                position: 'relative',
                background: isActive ? 'rgba(0, 230, 122, 0.08)' : 'transparent',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(0, 230, 122, 0.04)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isActive ? 'rgba(0, 230, 122, 0.08)' : 'transparent'
              }}
              role="button"
              aria-label={item.label}
            >
              {/* Active indicator */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    borderRadius: '0 2px 2px 0',
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
              <span
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  color: isActive ? '#00e67a' : 'rgba(200, 200, 200, 0.5)',
                  whiteSpace: 'nowrap',
                  opacity: expanded ? 1 : 0,
                  transition: 'opacity 200ms ease',
                }}
              >
                {item.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Status indicator */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(0, 230, 122, 0.06)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#00e67a',
              boxShadow: '0 0 6px rgba(0, 230, 122, 0.6)',
              animation: 'pulse 2s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'rgba(0, 230, 122, 0.7)',
              whiteSpace: 'nowrap',
              opacity: expanded ? 1 : 0,
              transition: 'opacity 200ms ease',
            }}
          >
            {expanded ? 'SYSTEM ONLINE' : 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* Inline keyframes for pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </nav>
  )
}
