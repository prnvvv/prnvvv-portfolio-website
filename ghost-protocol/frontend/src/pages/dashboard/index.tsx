import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { useActiveSection } from '../../hooks/useActiveSection'
import LoadingScreen from '../../components/sections/LoadingScreen/LoadingScreen'
import Navigation from '../../components/layout/Navigation'
import ParticleField from '../../components/effects/ParticleField/ParticleField'
import Footer from '../../components/layout/Footer/Footer'
import OperatorDossier from '../../components/sections/OperatorDossier/OperatorDossier'
import Arsenal from '../../components/sections/Arsenal/Arsenal'
import Missions from '../../components/sections/Missions/Missions'
import ServiceRecord from '../../components/sections/ServiceRecord/ServiceRecord'
import IntelReports from '../../components/sections/IntelReports/IntelReports'
import CommsConsole from '../../components/sections/CommsConsole/CommsConsole'
import FloatingChatIcon from '../../components/ai/FloatingChatIcon'
import ChatWindow from '../../components/ai/ChatWindow'

const SECTION_IDS = ['dossier', 'arsenal', 'missions', 'service-record', 'intel-reports', 'comms']

function Dashboard() {
  const { isLoading, setActiveSection } = useUIStore()
  const activeId = useActiveSection(SECTION_IDS)

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (activeId) setActiveSection(activeId)
  }, [activeId, setActiveSection])

  return (
    <div className="relative min-h-screen bg-[#0a0c0a] overflow-x-hidden">
      <ParticleField />
      <Navigation />
      <main className="relative z-10">
        <OperatorDossier />
        <Arsenal />
        <Missions />
        <ServiceRecord />
        <IntelReports />
        <CommsConsole />
      </main>
      <Footer />
      <FloatingChatIcon />
      <ChatWindow />
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
