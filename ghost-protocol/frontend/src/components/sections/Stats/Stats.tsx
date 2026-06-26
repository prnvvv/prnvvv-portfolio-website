import { motion } from 'framer-motion'
import CountUp from '../../animations/CountUp'
import AnimatedSection from '../../animations/AnimatedSection'
import { getStats } from '../../../services/dataService'

export default function Stats() {
  const stats = getStats()

  const statItems = [
    { value: stats.totalProjects, label: 'MISSIONS DEPLOYED' },
    { value: stats.yearsActive, label: 'YEARS ACTIVE', suffix: '+' },
    { value: stats.activeProjects, label: 'ACTIVE OPS' },
    { value: stats.certifications, label: 'CERTIFICATIONS' },
    { value: stats.skillsCount, label: 'SKILLS' },
    { value: stats.patentsPublished + stats.patentsFiled, label: 'PATENTS FILED' },
  ]

  return (
    <AnimatedSection className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div
          className="flex justify-around flex-wrap gap-6 sm:gap-8 py-8 sm:py-12"
          style={{
            borderTop: '1px solid rgba(0, 230, 122, 0.08)',
            borderBottom: '1px solid rgba(0, 230, 122, 0.08)',
          }}
        >
          {statItems.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div
                className="text-[32px] sm:text-[38px] md:text-[42px] font-bold leading-none text-[#00e67a] tabular-nums"
                style={{ fontFamily: 'Orbitron' }}
              >
                <CountUp end={stat.value} duration={2200} suffix={stat.suffix} />
              </div>
              <div className="text-[10px] tracking-[0.2em] text-[#9a9aaa] mt-2 font-mono">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
