import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ghost } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ReturnToCommandCenter() {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()

  return (
    <div style={{ position: 'fixed', top: 4, left: 16, zIndex: 100 }}>
      <motion.button
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
          color: hovered ? '#00e67a' : '#ffffff',
          boxShadow: hovered ? '0 0 20px rgba(0, 230, 122, 0.25)' : 'none',
          transition: 'color 200ms ease, box-shadow 200ms ease',
        }}
        aria-label="Return to Command Center"
      >
        <Ghost size={22} strokeWidth={1.5} />
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
