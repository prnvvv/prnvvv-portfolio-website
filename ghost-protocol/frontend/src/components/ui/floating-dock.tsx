import React, { useCallback, useEffect, useRef } from "react"
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from "motion/react"
import { useLocation } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { cn } from "@/lib/utils"
import { User, GraduationCap, Crosshair, Award, ShieldCheck, Medal, Users, X } from "lucide-react"

const DOCK_ITEMS: FloatingDockItem[] = [
  { id: 'dossier', title: 'OPERATOR DOSSIER', icon: <User size={18} strokeWidth={1.6} /> },
  { id: 'education', title: 'ACADEMY RECORDS', icon: <GraduationCap size={18} strokeWidth={1.6} /> },
  { id: 'missions', title: 'MISSIONS', icon: <Crosshair size={18} strokeWidth={1.6} /> },
  { id: 'service-record', title: 'SERVICE RECORD', icon: <Award size={18} strokeWidth={1.6} /> },
  { id: 'certifications', title: 'CREDENTIALS VAULT', icon: <ShieldCheck size={18} strokeWidth={1.6} /> },
  { id: 'achievements', title: 'COMMENDATIONS', icon: <Medal size={18} strokeWidth={1.6} /> },
  { id: 'leadership', title: 'LEADERSHIP & ROLES', icon: <Users size={18} strokeWidth={1.6} /> },
]

interface FloatingDockItem {
  id: string
  title: string
  icon: React.ReactNode
  href?: string
}

interface FloatingDockProps {
  items?: FloatingDockItem[]
  desktopClassName?: string
  mobileClassName?: string
}

export default function FloatingDock({ items = DOCK_ITEMS, desktopClassName, mobileClassName }: FloatingDockProps) {
  const mouseY = useMotionValue(Infinity)
  const location = useLocation()
  const { activeSection, setActiveSection, isNavOpen, toggleNav } = useUIStore()
  const isLanding = location.pathname === "/"
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && isNavOpen) toggleNav()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isNavOpen, toggleNav])

  useEffect(() => {
    if (!isNavOpen) return
    const sidebar = sidebarRef.current
    if (!sidebar) return
    const firstLink = sidebar.querySelector("button:not(.mobile-close-btn)") as HTMLButtonElement
    setTimeout(() => firstLink?.focus(), 100)
  }, [isNavOpen])

  const handleCloseNav = useCallback(() => {
    toggleNav()
    hamburgerRef.current?.focus()
  }, [toggleNav])

  if (isLanding) return null

  const handleNav = (item: FloatingDockItem) => {
    setActiveSection(item.id)
    const el = document.getElementById(item.id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    if (window.innerWidth < 768) handleCloseNav()
  }

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        ref={hamburgerRef}
        aria-label="Open navigation menu"
        aria-expanded={isNavOpen}
        aria-controls="mobile-navigation"
        onClick={() => { toggleNav(); hamburgerRef.current?.focus() }}
        className="fixed top-3 left-3 z-[101] md:hidden flex items-center justify-center w-11 h-11 rounded-lg bg-black/80 border border-[rgba(0,230,122,0.3)] cursor-pointer"
      >
        <span className="block w-5 h-[1.5px] bg-[#00e67a] rounded-full" />
        <span className="block w-5 h-[1.5px] bg-[#00e67a] rounded-full mt-[5px]" />
        <span className="block w-3.5 h-[1.5px] bg-[#00e67a] rounded-full mt-[5px]" />
      </button>

      {/* Mobile overlay */}
      {isNavOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/70"
          aria-hidden="true"
          onClick={handleCloseNav}
        />
      )}

      {/* Mobile slide-in sidebar */}
      <div
        ref={sidebarRef}
        id="mobile-navigation"
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 md:hidden",
          "w-[240px]",
          "bg-[rgba(8,12,9,0.97)] backdrop-blur-[28px]",
          "border-r border-[rgba(255,255,255,0.06)]",
          "shadow-[4px_0_24px_rgba(0,0,0,0.8)]",
          "transform transition-transform duration-300 ease-out",
          isNavOpen ? "translate-x-0" : "-translate-x-full",
          mobileClassName
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-[rgba(255,255,255,0.06)]">
          <span className="font-mono text-[10px] tracking-[0.25em] text-[#00e67a] uppercase">
            Navigation
          </span>
          <button
            onClick={handleCloseNav}
            className="mobile-close-btn flex items-center justify-center w-8 h-8 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-0.5 p-3 pt-4">
          {items.map((item) => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  "min-h-[44px] w-full text-left",
                  "font-mono text-xs tracking-widest",
                  isActive
                    ? "bg-[rgba(0,230,122,0.1)] text-[#00e67a]"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                  {React.isValidElement(item.icon)
                    ? React.cloneElement(item.icon as React.ReactElement<{ size?: number; strokeWidth?: number }>, {
                        size: 18,
                        strokeWidth: 1.6,
                      })
                    : item.icon}
                </span>
                <span>{item.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        onMouseMove={(e) => mouseY.set(e.clientY)}
        onMouseLeave={() => mouseY.set(Infinity)}
        className={cn(
          "fixed left-3 top-1/2 -translate-y-1/2 z-50",
          "hidden md:flex flex-col items-center gap-1 py-3 px-1.5 rounded-2xl",
          "bg-[rgba(8,12,9,0.88)] backdrop-blur-[28px] saturate-[180%]",
          "border border-[rgba(255,255,255,0.06)]",
          "shadow-[0_0_0_1px_rgba(0,230,122,0.06),0_8px_32px_rgba(0,0,0,0.7),0_0_40px_rgba(0,230,122,0.04),inset_0_1px_0_rgba(255,255,255,0.04)]",
          desktopClassName
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {items.map((item) => {
          const isActive = activeSection === item.id
          return (
            <IconContainer
              key={item.id}
              mouseY={mouseY}
              isActive={isActive}
              onClick={() => handleNav(item)}
              title={item.title}
            >
              <span style={{ color: isActive ? '#00e67a' : 'rgba(255,255,255,0.4)' }}>
                {item.icon}
              </span>
            </IconContainer>
          )
        })}
      </div>

      {/* Mobile bottom dock — simplified, used as quick-access alongside hamburger */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 flex md:hidden items-center justify-around px-2 py-1.5 pb-[max(6px,env(safe-area-inset-bottom,6px))]",
          "bg-[rgba(8,12,9,0.95)] backdrop-blur-[28px] border-t border-[rgba(255,255,255,0.06)]",
          mobileClassName
        )}
        style={{ paddingLeft: '56px' }}
      >
        {items.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => {
              handleNav(item)
            }}
            className="flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-[44px] min-h-[44px] justify-center active:bg-white/5 rounded-lg transition-colors"
            aria-label={item.title}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {item.icon}
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

interface IconContainerProps {
  mouseY: MotionValue
  children: React.ReactNode
  isActive?: boolean
  onClick?: () => void
  title?: string
}

const IconContainer = ({ mouseY, children, isActive, onClick, title }: IconContainerProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = React.useState(false)

  const distanceCalc = useTransform(mouseY, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 }
    return val - bounds.y - bounds.height / 2
  })

  const sizeTransform = useTransform(distanceCalc, [-140, 0, 140], [40, 56, 40])
  const scaleSize = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  return (
    <div className="relative">
      <motion.div
        ref={ref}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: scaleSize,
          height: scaleSize,
          background: isActive ? 'rgba(0, 230, 122, 0.08)' : 'transparent',
        }}
        className="flex items-center justify-center rounded-xl cursor-pointer transition-colors duration-200"
      >
        <div className="w-5 h-5 flex items-center justify-center">{children}</div>
      </motion.div>
      {hovered && title && (
        <div
          style={{
            position: 'absolute',
            left: 'calc(100% + 12px)',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(8, 12, 9, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 230, 122, 0.15)',
            borderRadius: 6,
            padding: '4px 10px',
            whiteSpace: 'nowrap',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.12em',
            color: isActive ? '#00e67a' : 'rgba(255, 255, 255, 0.6)',
            pointerEvents: 'none',
            zIndex: 60,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </div>
      )}
    </div>
  )
}
