import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './GhostIcon.css'

export default function GhostIcon() {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()

  return (
    <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 100 }}>
      <motion.button
        className="ghost-back-btn"
        onClick={() => {
          window.scrollTo(0, 0)
          navigate('/')
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.40)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 230, 122, 0.20)',
          cursor: 'pointer',
          boxShadow: hovered ? '0 0 20px rgba(0, 230, 122, 0.25)' : 'none',
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
              {/* Ghost body */}
              <path
                d="M8 28V14C8 7.5 12 4 20 4C28 4 32 7.5 32 14V28L28 25L24 28L20 25L16 28L12 25L8 28Z"
                fill={hovered ? '#00e67a' : '#e0e0e0'}
                className="ghost-body"
              />
              {/* Left eye */}
              <ellipse cx="16" cy="15" rx="2.5" ry="3" fill="#0a0c0a" />
              {/* Left pupil */}
              <circle cx="16.8" cy="15" r="1.2" fill="#00d4ff" className="ghost-pupil-left" />
              {/* Right eye */}
              <ellipse cx="24" cy="15" rx="2.5" ry="3" fill="#0a0c0a" />
              {/* Right pupil */}
              <circle cx="24.8" cy="15" r="1.2" fill="#00d4ff" className="ghost-pupil-right" />
              {/* Ghost glow */}
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

      {hovered && (
        <div
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
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.12em',
            color: 'rgba(0, 230, 122, 0.8)',
            pointerEvents: 'none',
            zIndex: 60,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          RETURN TO COMMAND CENTER
        </div>
      )}
    </div>
  )
}
