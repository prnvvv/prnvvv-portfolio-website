import { useState } from 'react'
import { motion } from 'framer-motion'
import { ALL_PROJECTS } from '../../data/projects'
import type { Project } from '../../data/projects'
import { TerminalCard } from '../TerminalCard'
import { TerminalModal } from '../TerminalModal'

const BENTO_IDS = ['CROPCORE-001', 'PKSTRUCT-009', 'AUTCORE-003', 'DISCAGEAI-005', 'CAREERTRACK-002']

const BENTO_SPANS: Record<string, string> = {
  'CROPCORE-001': 'lg:col-span-2 lg:row-span-2',
  'PKSTRUCT-009': 'lg:col-span-1 lg:row-span-2',
  'AUTCORE-003': 'lg:col-span-1 lg:row-span-1',
  'DISCAGEAI-005': 'lg:col-span-1 lg:row-span-1',
  'CAREERTRACK-002': 'lg:col-span-1 lg:row-span-1',
}

export function ProjectsBentoGrid() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const bentoProjects = BENTO_IDS.map(id => ALL_PROJECTS.find(p => p.id === id)).filter(Boolean) as Project[]

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
          {bentoProjects.map((project) => {
            const span = BENTO_SPANS[project.id] || ''
            return (
              <div key={project.id} className={`${span} h-full`}>
                <TerminalCard
                  id={project.id}
                  title={project.title}
                  description={project.shortDescription}
                  technologies={project.technologies}
                  status={project.status}
                  year={project.year}
                  award={project.award}
                  truncateDescription
                  onClick={() => handleProjectClick(project)}
                />
              </div>
            )
          })}
        </div>
      </motion.div>

      <TerminalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
      />
    </>
  )
}
