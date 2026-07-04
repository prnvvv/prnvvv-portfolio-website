import { useState } from 'react'
import { motion } from 'framer-motion'
import { ALL_PROJECTS } from '../../data/projects'
import type { Project } from '../../data/projects'
import { TerminalCard } from '../TerminalCard'
import { TerminalModal } from '../TerminalModal'

const BENTO_IDS = ['CROPCORE-001', 'PKSTRUCT-009', 'AUTCORE-003', 'DISCAGEAI-005', 'CAREERTRACK-002']

const BENTO_SPANS: Record<string, string> = {
  'CROPCORE-001': 'md:col-span-2 md:row-span-2',
  'PKSTRUCT-009': 'md:col-span-1 md:row-span-2',
  'AUTCORE-003': 'md:col-span-1 md:row-span-1',
  'DISCAGEAI-005': 'md:col-span-1 md:row-span-1',
  'CAREERTRACK-002': 'md:col-span-1 md:row-span-1',
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr items-stretch">
        {bentoProjects.map((project) => {
          const span = BENTO_SPANS[project.id] || ''
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

      <TerminalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
      />
    </>
  )
}
