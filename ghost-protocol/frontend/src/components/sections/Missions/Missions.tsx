import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AnimatedSection from '../../animations/AnimatedSection'
import { ALL_PROJECTS } from '../../../data/projects'
import type { Project } from '../../../data/projects'
import { TerminalCard } from '../../TerminalCard'
import { TerminalModal } from '../../TerminalModal'

const TOP_FIVE_IDS = ['CROPCORE-001', 'CAREERTRACK-002', 'AUTCORE-003', 'KRED-004', 'DISCAGEAI-005']

const TOP_SPANS: Record<string, string> = {
  'CROPCORE-001': 'md:col-span-3',
  'CAREERTRACK-002': 'md:col-span-3',
  'AUTCORE-003': 'md:col-span-2',
  'KRED-004': 'md:col-span-2',
  'DISCAGEAI-005': 'md:col-span-2',
}

const topProjects = ALL_PROJECTS
  .filter(p => TOP_FIVE_IDS.includes(p.id))
  .sort((a, b) => TOP_FIVE_IDS.indexOf(a.id) - TOP_FIVE_IDS.indexOf(b.id))

export default function Missions() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  return (
    <AnimatedSection id="missions" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="section-header"
            style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}
          >
            <span>◆</span>
            <span>TOP MISSIONS</span>
          </motion.div>
          <Link
            to="/missions/all"
            className="group relative inline-flex items-center gap-3 px-6 py-3
              bg-black/40 backdrop-blur-md
              border border-[#00e67a]/20 rounded-full
              font-mono text-xs uppercase tracking-[0.15em] text-white no-underline
              hover:bg-black/60 hover:border-[#00e67a]/40
              transition-all duration-300 ease-in-out
              hover:scale-[0.975]
              shadow-[inset_0_0.125em_0.125em_rgba(0,0,0,0.05)]
              hover:shadow-[0_0.25em_0.125em_-0.125em_rgba(0,0,0,0.2)]"
          >
            <span>VIEW MORE MISSIONS</span>
            <span className="text-[#00e67a] group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
          </Link>
        </div>

        <hr style={{ border: 'none', height: '1px', background: 'rgba(0,230,122,0.2)', marginBottom: '24px' }} />

        {/* Grid — 6-column layout, spans sum to 6 per row (matching ALL MISSIONS) */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-fr items-stretch">
          {topProjects.map((project) => {
            const span = TOP_SPANS[project.id] || 'md:col-span-2'
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

      <TerminalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
      />
    </AnimatedSection>
  )
}
