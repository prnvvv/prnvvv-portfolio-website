import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './GhostIcon.css'

export default function GhostIcon() {
  const [hovered, setHovered] = useState(false)
  const [tapped, setTapped] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // The mobile hamburger (FloatingDock) only exists on the dashboard routes.
  const hasHamburger = pathname === '/dashboard' || pathname === '/command-center'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleClick = useCallback(() => {
    if (isMobile) {
      setTapped(true)
      setTimeout(() => setTapped(false), 2000)
    }
    window.scrollTo(0, 0)
    navigate('/')
  }, [isMobile, navigate])

  const showTooltip = hovered || (isMobile && tapped)

  return (
    <div style={{ position: 'fixed', top: 16, left: isMobile && hasHamburger ? 68 : 16, zIndex: 100 }}>
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: isMobile ? 48 : 44,
          height: isMobile ? 48 : 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.40)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 230, 122, 0.20)',
          cursor: 'pointer',
          boxShadow: hovered || tapped ? '0 0 20px rgba(0, 230, 122, 0.25)' : 'none',
          transition: 'box-shadow 200ms ease',
        }}
        aria-label="Return to Command Center"
      >
        <div className="ghost-icon-container">
          <svg
            width="24"
            height="24"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ghost-svg"
          >
            <g className="ghost-body-group">
              <path
                d="M8 28V14C8 7.5 12 4 20 4C28 4 32 7.5 32 14V28L28 25L24 28L20 25L16 28L12 25L8 28Z"
                fill={hovered || tapped ? '#00e67a' : '#e0e0e0'}
                className="ghost-body"
              />
              <ellipse cx="16" cy="15" rx="2.5" ry="3" fill="#0a0c0a" />
              <circle cx="16.8" cy="15" r="1.2" fill="#00d4ff" className="ghost-pupil-left" />
              <ellipse cx="24" cy="15" rx="2.5" ry="3" fill="#0a0c0a" />
              <circle cx="24.8" cy="15" r="1.2" fill="#00d4ff" className="ghost-pupil-right" />
              <path
                d="M8 28V14C8 7.5 12 4 20 4C28 4 32 7.5 32 14V28L28 25L24 28L20 25L16 28L12 25L8 28Z"
                stroke="#00e67a"
                strokeWidth="0.5"
                strokeOpacity="0.3"
                className="ghost-glow"
              />
            </g>
          </svg>
        </div>
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              left: 'calc(100% + 10px)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(8, 12, 9, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 230, 122, 0.15)',
              borderRadius: 6,
              padding: '5px 10px',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'rgba(0, 230, 122, 0.8)',
              pointerEvents: 'none',
              zIndex: 60,
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            RETURN TO COMMAND CENTER
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
