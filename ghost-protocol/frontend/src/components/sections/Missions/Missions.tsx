import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from '../../animations/AnimatedSection'
import { StaggerReveal, StaggerItem } from '../../animations/StaggerReveal'
import { getProjects } from '../../../services/dataService'

const statusConfig: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: 'text-[#00e67a]', label: 'ACTIVE' },
  COMPLETED: { color: 'text-[#5a8a6a]', label: 'COMPLETED' },
  'STANDING BY': { color: 'text-[#ffcc00]', label: 'STANDING BY' },
}

export default function Missions() {
  const missions = getProjects()
  return (
    <AnimatedSection id="missions" className="min-h-screen py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header"
        >
          <span>⌖</span>
          <span>MISSIONS // OPERATIONS LOG</span>
        </motion.div>

        <StaggerReveal className="space-y-4 sm:space-y-6">
          {missions.map((mission) => {
            const status = statusConfig[mission.status] ?? {
              color: 'text-[#5a8a6a]',
              label: mission.status,
            }
            return (
              <MissionCard key={mission.id} mission={mission} status={status} />
            )
          })}
        </StaggerReveal>
      </div>
    </AnimatedSection>
  )
}

function MissionCard({ mission, status }: { mission: any; status: { color: string; label: string } }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <StaggerItem>
      <motion.div
        whileHover={{
          scale: 1.015,
          transition: { duration: 0.25 },
        }}
        className="panel-border bg-[#181825]/70 p-5"
        onHoverStart={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0, 230, 122, 0.08)'
        }}
        onHoverEnd={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'none'
        }}
        style={{ transition: 'box-shadow 0.3s ease' }}
      >
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h3
              className="text-[#00e67a] text-sm font-heading tracking-[0.1em]"
              style={{ fontFamily: 'Orbitron' }}
            >
              {mission.codename}
            </h3>
            <p className="text-[#f0f0f0] text-xs font-body mt-0.5">{mission.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-body ${status.color}`}>
              {status.label}
            </span>
            <span className="text-[#5a8a6a] text-[10px] font-body">
              {mission.timeline}
            </span>
          </div>
        </div>

        <p className="text-[#f0f0f0] text-[11px] font-body leading-relaxed mb-3">
          {mission.description}
        </p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] font-heading tracking-[0.15em] text-[#5a8a6a] hover:text-[#00e67a] transition-colors duration-200 mb-3"
          style={{ fontFamily: 'Orbitron' }}
        >
          {expanded ? '▲ COLLAPSE DOSSIER' : '› EXPAND DOSSIER'}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              {mission.outcome && (
                <p className="text-[#ffcc00] text-[10px] font-body mb-3">
                  OUTCOME: {mission.outcome}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[rgba(0,230,122,0.08)]">
                {mission.tech.map((t: string) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[9px] font-body border border-[rgba(0,230,122,0.12)] text-[#5a8a6a] rounded-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </StaggerItem>
  )
}
