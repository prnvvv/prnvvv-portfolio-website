import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import { ALL_PROJECTS } from '../../data/projects'
import type { Project } from '../../data/projects'

const STATUS_COLORS: Record<string, string> = {
  'PATENT PUBLISHED': '#00e67a',
  'PATENT FILED': '#00b4d8',
  'UNDER REVIEW': '#ffd166',
  'DEPLOYED': '#06d6a0',
  'PUBLISHED': '#a8dadc',
  'COMPLETED': 'rgba(0,230,122,0.5)',
  'ACTIVE': '#ffd166',
}

const BENTO_IDS = ['CROPCORE-001', 'PKSTRUCT-009', 'AUTCORE-003', 'DISCAGEAI-005', 'CAREERTRACK-002']

const BENTO_SPANS: Record<string, string> = {
  'CROPCORE-001': 'lg:col-span-2 lg:row-span-2',
  'PKSTRUCT-009': 'lg:col-span-1 lg:row-span-2',
  'AUTCORE-003': 'lg:col-span-1 lg:row-span-1',
  'DISCAGEAI-005': 'lg:col-span-1 lg:row-span-1',
  'CAREERTRACK-002': 'lg:col-span-1 lg:row-span-1',
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#00e67a'
  return (
    <span
      className="flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded shrink-0"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      {status}
    </span>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const badgeColor = STATUS_COLORS[project.status] || '#00e67a'

  return (
    <div
      className="flex flex-col group transition-all duration-300"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 230, 122, 0.15)',
        borderRadius: '12px',
        padding: '24px',
        height: '100%',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-mono text-[11px] tracking-[0.15em] text-[#00e67a] uppercase leading-tight">
          {project.id}
        </h3>
        <StatusBadge status={project.status} />
      </div>
      <h4 className="font-display text-[13px] tracking-[0.1em] text-white font-bold mb-2 leading-tight">
        {project.title}
      </h4>
      <p className="font-mono text-[11px] text-white/80 leading-relaxed flex-1 line-clamp-4 mb-3">
        {project.shortDescription}
      </p>
      <div className="flex flex-wrap gap-2 mt-auto">
        {project.technologies.slice(0, 3).map((t) => (
          <span
            key={t}
            className="text-[9px] font-mono text-white/50 hover:text-[#00e67a] transition-colors duration-200 px-2 py-1 rounded"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {t}
          </span>
        ))}
        {project.technologies.length > 3 && (
          <span className="text-[9px] font-mono text-white/40">+{project.technologies.length - 3}</span>
        )}
      </div>
      {project.award && (
        <div className="mt-3 pt-2 border-t border-[#00e67a]/10 flex items-center gap-1.5">
          <Award size={10} className="text-[#ffd166]" />
          <span className="font-mono text-[9px]" style={{ color: '#ffd166' }}>
            {project.award}
          </span>
        </div>
      )}
    </div>
  )
}

export function ProjectsBentoGrid() {
  const bentoProjects = BENTO_IDS.map(id => ALL_PROJECTS.find(p => p.id === id)).filter(Boolean) as Project[]

  return (
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
            <div key={project.id} className={span}>
              <ProjectCard project={project} />
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
