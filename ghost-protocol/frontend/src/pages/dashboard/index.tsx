import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useUIStore } from '../../store/uiStore'
import { useActiveSection } from '../../hooks/useActiveSection'
import LoadingScreen from '../../components/sections/LoadingScreen/LoadingScreen'
import { TacticalFlickeringGrid } from '../../components/effects/TacticalFlickeringGrid'
import ParticleField from '../../components/effects/ParticleField/ParticleField'
import Footer from '../../components/layout/Footer/Footer'
import { SectionErrorBoundary } from '../../components/SectionErrorBoundary'
import OperatorDossier from '../../components/sections/OperatorDossier/OperatorDossier'
import Education from '../../components/sections/Education/Education'
import Missions from '../../components/sections/Missions/Missions'
import ServiceRecord from '../../components/sections/ServiceRecord/ServiceRecord'
import Certifications from '../../components/sections/Certifications/Certifications'
import Achievements from '../../components/sections/Achievements/Achievements'
import SocialIcons from '../../components/social/SocialIcons'
import ReturnToCommandCenter from '../../components/ui/ReturnToCommandCenter'
import FloatingDock from '../../components/ui/floating-dock'

const SECTION_IDS = ['dossier', 'education', 'missions', 'service-record', 'certifications', 'achievements']

function Dashboard() {
  const { isLoading, setActiveSection } = useUIStore()
  const activeId = useActiveSection(SECTION_IDS)
  const confettiFired = useRef(false)

  useEffect(() => {
    if (!isLoading && !confettiFired.current) {
      confettiFired.current = true
      const timer = setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.7 },
          colors: ['#00e67a', '#5a8a6a', '#00e67a', 'rgba(255,255,255,0.9)'],
        })
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (activeId) setActiveSection(activeId)
  }, [activeId, setActiveSection])

  return (
    <div className="relative min-h-screen bg-[#0a0c0a] overflow-x-hidden">
      <ReturnToCommandCenter />
      <SocialIcons />
      <TacticalFlickeringGrid />
      <ParticleField />
      <FloatingDock />
      <main className="relative z-10" style={{ paddingLeft: '72px' }}>
        <OperatorDossier />
        <Education />
        <Missions />
        <SectionErrorBoundary name="SERVICE-RECORD"><ServiceRecord /></SectionErrorBoundary>
        <Certifications />
        <Achievements />
      </main>
      <Footer />
      <div className="crt-overlay" aria-hidden="true" />
    </div>
  )
}

export default function DashboardPage() {
  const { isLoading } = useUIStore()

  return (
    <>
      <LoadingScreen />
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
