import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import LoadingScreen from '../../components/sections/LoadingScreen/LoadingScreen'
import TopNav from '../../components/layout/TopNav/TopNav'
import ParticleField from '../../components/effects/ParticleField/ParticleField'
import Footer from '../../components/layout/Footer/Footer'
import OperatorDossier from '../../components/sections/OperatorDossier/OperatorDossier'
import Arsenal from '../../components/sections/Arsenal/Arsenal'
import Missions from '../../components/sections/Missions/Missions'
import ServiceRecord from '../../components/sections/ServiceRecord/ServiceRecord'
import IntelReports from '../../components/sections/IntelReports/IntelReports'
import CommsConsole from '../../components/sections/CommsConsole/CommsConsole'

function Dashboard() {
  const { isLoading, activeSection, setActiveSection } = useUIStore()

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'dossier',
        'arsenal',
        'missions',
        'service-record',
        'intel-reports',
        'comms',
      ]
      const scrollPos = window.scrollY + 200
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i])
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setActiveSection])

  return (
    <div className="relative min-h-screen bg-[#0a0c0a]">
      <ParticleField />
      <TopNav />
      <main className="relative z-10">
        <OperatorDossier />
        <Arsenal />
        <Missions />
        <ServiceRecord />
        <IntelReports />
        <CommsConsole />
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
        {!isLoading && <Dashboard key="dashboard" />}
      </AnimatePresence>
    </>
  )
}
