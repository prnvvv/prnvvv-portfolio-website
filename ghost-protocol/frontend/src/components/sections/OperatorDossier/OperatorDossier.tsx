import { motion } from 'framer-motion'
import AnimatedSection from '../../animations/AnimatedSection'
import { getProfile, getSkillsByCategory } from '../../../services/dataService'
import SkillTag from '../../ui/SkillTag'

const CATEGORY_ICONS: Record<string, string> = {
  'Programming Languages': '▶',
  'AI/ML Frameworks': '◆',
  'Computer Vision': '◈',
  'Backend & Web': '▣',
  Frontend: '◉',
  Visualization: '▤',
}

export default function OperatorDossier() {
  const op = getProfile()
  const skillsByCategory = getSkillsByCategory()

  const statusColor =
    op.status === 'ACTIVE'
      ? 'text-mil-green'
      : op.status === 'STANDBY'
        ? 'text-mil-yellow'
        : 'text-mil-red'

  return (
    <AnimatedSection id="dossier" className="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header"
        >
          <span>◆</span>
          <span>OPERATOR DOSSIER // {op.callSign}</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="panel-border p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2
                  className="text-mil-green font-heading tracking-[0.12em]"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)' }}
                >
                  {op.callSign}
                </h2>
                <p className="text-mil-olive font-body mt-0.5" style={{ fontSize: 'var(--text-xs)' }}>{op.rank}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${statusColor} bg-current`} />
                <span className={`font-body ${statusColor}`} style={{ fontSize: 'var(--text-xs)' }}>{op.status}</span>
              </div>
            </div>

            <div className="space-y-1 font-body" style={{ fontSize: 'var(--text-xs)' }}>
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

            <div className="mt-3 pt-3 border-t border-mil-green/12">
              <p className="text-mil-light font-body leading-relaxed" style={{ fontSize: 'var(--text-xs)' }}>{op.bio}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="panel-border p-4"
          >
            <h3
              className="text-mil-green font-heading tracking-[0.18em] mb-3"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-micro)' }}
            >
              SKILL INVENTORY
            </h3>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category}>
                  <div className="flex items-center gap-1 mb-1.5">
                    <span className="text-[10px]">{CATEGORY_ICONS[category] || '▸'}</span>
                    <h4
                      className="font-heading text-mil-olive tracking-[0.12em] uppercase"
                      style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-micro)' }}
                    >
                      {category}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
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
    </AnimatedSection>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-mil-olive shrink-0 w-20 sm:w-28">{label}:</span>
      <span className="text-mil-light">{value}</span>
    </div>
  )
}
