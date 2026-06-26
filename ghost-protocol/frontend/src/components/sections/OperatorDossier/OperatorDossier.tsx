import { motion } from 'framer-motion'
import { getProfile, getSkillsByCategory } from '../../../services/dataService'
import { useGlitch } from '../../../hooks/useGlitch'
import SkillTag from '../../ui/SkillTag'

const CATEGORY_ICONS: Record<string, string> = {
  'Programming Languages': '⚡',
  'AI/ML Frameworks': '🧠',
  'Computer Vision': '📷',
  'Backend & Web': '🖥️',
  Frontend: '🎨',
  Visualization: '📊',
}

export default function OperatorDossier() {
  const { isGlitching } = useGlitch({ enabled: true })
  const op = getProfile()
  const skillsByCategory = getSkillsByCategory()

  const statusColor =
    op.status === 'ACTIVE'
      ? 'text-[#00e67a]'
      : op.status === 'STANDBY'
        ? 'text-[#ffcc00]'
        : 'text-[#ff3344]'

  return (
    <section id="dossier" className="min-h-screen py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="section-header">
          <span>◆</span>
          <span>OPERATOR DOSSIER // {op.callSign}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                  className="text-[#00e67a] text-lg font-heading tracking-[0.15em]"
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
                value={op.coordinates ? `${op.coordinates[0]}, ${op.coordinates[1]}` : 'N/A'}
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
              className="text-[#00e67a] text-xs font-heading tracking-[0.2em] mb-4"
              style={{ fontFamily: 'Orbitron' }}
            >
              SKILL INVENTORY
            </h3>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px]">{CATEGORY_ICONS[category] || '▸'}</span>
                    <h4
                      className="text-[9px] font-heading text-[#5a8a6a] tracking-[0.15em] uppercase"
                      style={{ fontFamily: 'Orbitron' }}
                    >
                      {category}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categorySkills.map((skill) => (
                      <SkillTag key={skill.name} name={skill.name} />
                    ))}
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
      <span className="text-[#5a8a6a] shrink-0 w-20 sm:w-28">{label}:</span>
      <span className="text-[#c8ffd4]">{value}</span>
    </div>
  )
}
