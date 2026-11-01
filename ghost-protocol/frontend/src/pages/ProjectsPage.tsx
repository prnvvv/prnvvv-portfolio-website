import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ALL_PROJECTS } from '../data/projects'
import type { Project } from '../data/projects'
import ParticleField from '../components/effects/ParticleField/ParticleField'
import { TacticalFlickeringGrid } from '../components/effects/TacticalFlickeringGrid'
import { TerminalCard } from '../components/TerminalCard'
import { TerminalModal } from '../components/TerminalModal'
import GhostIcon from '../components/effects/GhostIcon'
import Footer from '../components/layout/Footer/Footer'
import { HoloNumber } from '../components/ui/HoloNumber'

const statsData = [
  { value: ALL_PROJECTS.length, label: 'OPERATIONS' },
  { value: ALL_PROJECTS.filter(p => p.status === 'PATENT PUBLISHED' || p.status === 'PATENT FILED').length, label: 'PATENTS' },
  { value: ALL_PROJECTS.filter(p => p.award).length, label: 'AWARDS' },
  { value: ALL_PROJECTS.filter(p => p.status === 'PUBLISHED').length, label: 'PUBLICATIONS' },
]

const SPAN_MAP: Record<string, string> = {
  'CROPCORE-001': 'md:col-span-3',
  'CAREERTRACK-002': 'md:col-span-3',
  'AUTCORE-003': 'md:col-span-2',
  'KRED-004': 'md:col-span-2',
  'DISCAGEAI-005': 'md:col-span-2',
  'PACDI-006': 'md:col-span-3',
  'DIAGENC-007': 'md:col-span-3',
  'SSLRUL-008': 'md:col-span-2',
  'PKSTRUCT-009': 'md:col-span-2',
  'POLARIS-010': 'md:col-span-2',
  'GIL-011': 'md:col-span-3',
  'CMS-012': 'md:col-span-3',
  'SYNTHETIC-013': 'md:col-span-6',
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0a0c0a] text-white overflow-hidden">
      {/* Fixed background effects — matching base dashboard */}
      <GhostIcon />
      <TacticalFlickeringGrid />
      <ParticleField />

      <div className="relative z-10 flex-1" style={{ paddingLeft: isMobile ? '0px' : '72px' }}>
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6 md:pb-10">
          {/* Header */}
          <div className="flex items-start md:items-center justify-between mb-3 flex-col md:flex-row gap-3">
            <div className="section-header" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
              <span>◆</span>
              <span>ALL MISSIONS</span>
            </div>
            <button
              onClick={() => navigate('/dashboard#missions')}
              className="group inline-flex items-center gap-2 px-5 py-2.5
                bg-black/40 backdrop-blur-md
                border border-[#00e67a]/20 rounded-full
                font-mono text-[11px] uppercase tracking-[0.15em] text-white
                hover:bg-black/60 hover:border-[#00e67a]/50
                transition-all duration-300 ease-in-out
                hover:scale-[0.975]
                cursor-pointer"
            >
              <span className="text-[#00e67a] group-hover:-translate-x-0.5 transition-transform duration-300">&larr;</span>
              <span>RETURN TO MAIN OPERATIONS</span>
            </button>
          </div>

          <hr style={{ border: 'none', height: '1px', background: 'rgba(0,230,122,0.15)', margin: '0 0 8px' }} />

          <p className="font-mono text-[10px] mb-6 tracking-[0.12em] text-white/50 uppercase">
            COMPLETE MISSION DOSSIER // ALL {ALL_PROJECTS.length} OPERATIONS LOGGED
          </p>

          {/* Stats section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6">
            {statsData.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-black/40 backdrop-blur-md border border-[#00e67a]/20 rounded-lg p-3 md:p-4 text-center
                  hover:border-[#00e67a]/40 transition-all duration-300"
              >
                <div className="mb-0.5">
                  <HoloNumber value={stat.value} />
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/50">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bento grid — 6-column layout, spans sum to 6 per row */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-fr items-stretch">
            {ALL_PROJECTS.map((project) => {
              const span = SPAN_MAP[project.id] || 'md:col-span-2'
              return (
                <motion.div
                  key={project.id}
                  className={`${span} h-full`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px 0px' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TerminalCard
                    id={project.id}
                    title={project.title}
                    description={project.fullDescription}
                    technologies={project.technologies}
                    status={project.status}
                    year={project.year}
                    award={project.award}
                    truncateDescription={true}
                    onClick={() => handleProjectClick(project)}
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <TerminalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
      />

      <div className="relative z-10 border-t border-[#00e67a]/10">
        <Footer />
      </div>
      <div className="crt-overlay" aria-hidden="true" />
    </div>
  )
}
