import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MagicButton() {
  const navigate = useNavigate()

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    navigate('/dashboard')
  }, [navigate])

  return (
    <button
      onClick={handleClick}
      className="group relative px-8 py-4 border-2 border-[#00e67a] rounded-lg
        transition-all duration-500
        shadow-[0_0_40px_rgba(0,230,122,0.12)] hover:shadow-[0_0_60px_rgba(0,230,122,0.3)]
        flex items-center gap-3 overflow-hidden cursor-pointer
        active:scale-[0.97] active:transition-transform active:duration-100"
      style={{ outline: 'none' }}
    >
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
      <span
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#00e67a]/0 via-[#00e67a]/20 to-[#00e67a]/0
          -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
      />
    </button>
  )
}
