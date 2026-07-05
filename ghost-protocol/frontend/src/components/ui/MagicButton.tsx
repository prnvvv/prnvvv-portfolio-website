import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import GhostButton from './GhostButton'

export default function MagicButton() {
  const navigate = useNavigate()

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    navigate('/dashboard')
  }, [navigate])

  return (
    <GhostButton onClick={handleClick} className="gap-3 px-8 py-4">
      <span
        className="text-[1.08rem] transition-colors duration-500"
        style={{ color: '#ffffff' }}
      >
        {'\u2318'}
      </span>
      <span
        className="font-mono text-[13.45px] uppercase tracking-[0.2em] text-white transition-colors duration-500"
        style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}
      >
        ACCESS COMMAND CENTER
      </span>
      <span
        className="text-[13.45px] group-hover:translate-x-1 transition-all duration-300"
        style={{ color: '#ffffff' }}
      >
        {'\u2192'}
      </span>
    </GhostButton>
  )
}
