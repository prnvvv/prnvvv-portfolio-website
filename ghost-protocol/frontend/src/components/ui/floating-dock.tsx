import React, { useRef } from "react"
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from "motion/react"
import { useNavigate, useLocation } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { cn } from "@/lib/utils"
import { User, GraduationCap, Crosshair, Award, ShieldCheck, Medal, MessageCircle } from "lucide-react"

const DOCK_ITEMS: FloatingDockItem[] = [
  { id: 'dossier', title: 'OPERATOR DOSSIER', icon: <User size={18} strokeWidth={1.6} /> },
  { id: 'education', title: 'ACADEMY RECORDS', icon: <GraduationCap size={18} strokeWidth={1.6} /> },
  { id: 'missions', title: 'MISSIONS', icon: <Crosshair size={18} strokeWidth={1.6} /> },
  { id: 'service-record', title: 'SERVICE RECORD', icon: <Award size={18} strokeWidth={1.6} /> },
  { id: 'certifications', title: 'CREDENTIALS VAULT', icon: <ShieldCheck size={18} strokeWidth={1.6} /> },
  { id: 'achievements', title: 'COMMENDATIONS', icon: <Medal size={18} strokeWidth={1.6} /> },
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
  const navigate = useNavigate()
  const location = useLocation()
  const { activeSection, setActiveSection } = useUIStore()
  const isLanding = location.pathname === "/"

  if (isLanding) return null

  const handleNav = (item: FloatingDockItem) => {
    setActiveSection(item.id)
    const el = document.getElementById(item.id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }


  return (
    <>
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

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around px-2 py-2 pb-[max(8px,env(safe-area-inset-bottom,8px))]",
          "bg-[rgba(8,12,9,0.95)] backdrop-blur-[28px] border-t border-[rgba(255,255,255,0.06)]",
          mobileClassName
        )}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item)}
            className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[48px] min-h-[44px] justify-center active:bg-white/5 rounded-lg transition-colors"
            aria-label={item.title}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-[7px] font-mono tracking-widest text-white/40 leading-none">
              {item.title.slice(0, 4)}
            </span>
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
