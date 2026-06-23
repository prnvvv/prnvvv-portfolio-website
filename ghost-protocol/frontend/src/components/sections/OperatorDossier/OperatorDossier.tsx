import { motion } from 'framer-motion'
import { operatorData, skills } from '../../../data/operatorData'
import { useGlitch } from '../../../hooks/useGlitch'

export default function OperatorDossier() {
  const { isGlitching } = useGlitch({ enabled: true })
  const op = operatorData

  const statusColor =
    op.status === 'ACTIVE'
      ? 'text-[#00ff88]'
      : op.status === 'STANDBY'
        ? 'text-[#ffcc00]'
        : 'text-[#ff3344]'

  return (
    <section id="dossier" className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="section-header">
          <span>◆</span>
          <span>OPERATOR DOSSIER // {op.callSign}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className={`panel-border bg-[#0d110d] p-5 ${isGlitching ? 'glitch-active' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2
                  className="text-[#00ff88] text-lg font-heading tracking-[0.15em]"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  {op.callSign}
                </h2>
                <p className="text-[#5a8a6a] text-xs font-body mt-1">{op.rank}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusColor} bg-current`} />
                <span className={`text-[10px] font-body ${statusColor}`}>{op.status}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-body">
              <InfoRow label="NAME" value={op.name} />
              <InfoRow label="SPECIALIZATION" value={op.specialization} />
              <InfoRow label="CLEARANCE" value={op.clearanceLevel} />
              <InfoRow label="YEARS ACTIVE" value={String(op.yearsActive)} />
              <InfoRow label="LOCATION" value={op.location} />
              <InfoRow
                label="COORDINATES"
                value={`${op.coordinates[0]}, ${op.coordinates[1]}`}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-[#1a2e1a]">
              <p className="text-[#c8ffd4] text-xs font-body leading-relaxed">{op.bio}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="panel-border bg-[#0d110d] p-5"
          >
            <h3
              className="text-[#00ff88] text-xs font-heading tracking-[0.2em] mb-4"
              style={{ fontFamily: 'Orbitron' }}
            >
              SKILL MATRIX
            </h3>
            <div className="space-y-3">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#c8ffd4] text-[11px] font-body">{skill.name}</span>
                    <span className="text-[#5a8a6a] text-[10px] font-body">{skill.proficiency}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#5a8a6a] shrink-0 w-28">{label}:</span>
      <span className="text-[#c8ffd4]">{value}</span>
    </div>
  )
}
