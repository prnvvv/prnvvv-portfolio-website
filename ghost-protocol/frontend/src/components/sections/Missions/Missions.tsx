import { motion } from 'framer-motion'
import { getProjects } from '../../../services/dataService'

const statusConfig: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: 'text-[#00e67a]', label: 'ACTIVE' },
  COMPLETED: { color: 'text-[#5a8a6a]', label: 'COMPLETED' },
  'STANDING BY': { color: 'text-[#ffcc00]', label: 'STANDING BY' },
}

export default function Missions() {
  const missions = getProjects()
  return (
    <section id="missions" className="min-h-screen py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="section-header">
          <span>⌖</span>
          <span>MISSIONS // OPERATIONS LOG</span>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {missions.map((mission, i) => {
            const status = statusConfig[mission.status] ?? {
              color: 'text-[#5a8a6a]',
              label: mission.status,
            }
            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="panel-border bg-[#0d110d] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <h3
                      className="text-[#00e67a] text-sm font-heading tracking-[0.1em]"
                      style={{ fontFamily: 'Orbitron' }}
                    >
                      {mission.codename}
                    </h3>
                    <p className="text-[#c8ffd4] text-xs font-body mt-0.5">{mission.title}</p>
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

                <p className="text-[#c8ffd4] text-[11px] font-body leading-relaxed mb-3">
                  {mission.description}
                </p>

                {mission.outcome && (
                  <p className="text-[#ffcc00] text-[10px] font-body mb-3">
                    OUTCOME: {mission.outcome}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {mission.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[9px] font-body border border-[#1a2e1a] text-[#5a8a6a] rounded-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
