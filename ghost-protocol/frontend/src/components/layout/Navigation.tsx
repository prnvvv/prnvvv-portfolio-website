import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { NAV_TABS } from '../../utils/constants'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import NavLink from '../ui/NavLink'
import StatusIndicator from '../ui/StatusIndicator'
import MobileMenu from './MobileMenu'

export default function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeSection, setActiveSection, isNavOpen, toggleNav } = useUIStore()
  const { scrollToSection } = useSmoothScroll()
  const [scrolled, setScrolled] = useState(false)
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    setActiveSection(id)
    if (window.innerWidth < 1024) toggleNav()
    scrollToSection(id, -80)
  }

  const handleLogoClick = () => {
    if (isLanding) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  if (isLanding) return null

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-2xl shadow-2xl shadow-black/70'
          : 'bg-black/60 backdrop-blur-2xl'
      } border-b border-[#00e67a]/20`}
    >
      {/* Scanner line animation */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden opacity-60">
        <motion.div
          className="h-full w-40 bg-gradient-to-r from-transparent via-[#00e67a] to-transparent"
          animate={{ x: ['-100vw', '100vw'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="flex items-center justify-between px-4 md:px-10 h-16 md:h-20">
        {/* Logo - Left */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 group cursor-pointer"
          aria-label="Go to homepage"
        >
          <span className="text-[#00e67a] text-lg md:text-xl transition-transform duration-300 group-hover:scale-110">
            ⚔
          </span>
          <span
            className="font-heading text-sm md:text-lg tracking-[0.2em] text-white group-hover:text-[#00e67a] transition-all duration-300"
            style={{ fontFamily: 'Orbitron' }}
          >
            GHOST PROTOCOL
          </span>
          <span className="text-[10px] text-gray-500 font-mono hidden sm:inline transition-opacity duration-300 group-hover:opacity-60">
            v1.0.0
          </span>
        </button>

        {/* Desktop Navigation Links - Center */}
        <div className="hidden lg:flex items-center gap-1 md:gap-4 lg:gap-6">
          {NAV_TABS.map((tab) => (
            <NavLink
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              isActive={activeSection === tab.id}
              onClick={() => scrollTo(tab.id)}
            />
          ))}
        </div>

        {/* Right Section - Status */}
        <div className="flex items-center gap-3 md:gap-4">
          <StatusIndicator />
          <span className="text-[10px] text-gray-500 font-mono hidden md:inline tracking-wider">
            // SECURE
          </span>

          {/* Hamburger Menu Button - Mobile */}
          <button
            onClick={toggleNav}
            className="lg:hidden w-6 h-5 flex flex-col justify-between cursor-pointer relative z-50"
            aria-label={isNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isNavOpen}
          >
            <span
              className={`w-full h-[2px] bg-gray-400 rounded transition-all duration-300 origin-center ${
                isNavOpen ? 'translate-y-[9px] rotate-45 bg-[#00e67a]' : ''
              }`}
            />
            <span
              className={`w-full h-[2px] bg-gray-400 rounded transition-all duration-300 ${
                isNavOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-full h-[2px] bg-gray-400 rounded transition-all duration-300 origin-center ${
                isNavOpen ? '-translate-y-[9px] -rotate-45 bg-[#00e67a]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <MobileMenu
        isOpen={isNavOpen}
        activeSection={activeSection}
        onNavigate={scrollTo}
      />
    </nav>
  )
}
