import { motion } from 'framer-motion'
import { GraduationCap, School, MapPin } from 'lucide-react'
import AnimatedSection from '../../animations/AnimatedSection'
import { getEducation } from '../../../services/dataService'

const ICON_MAP: Record<string, typeof GraduationCap> = {
  GraduationCap,
  School,
}

export default function Education() {
  const data = getEducation()

  return (
    <AnimatedSection id="education" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header mb-8"
        >
          <span>◆</span>
          <span>ACADEMY RECORDS // EDUCATION & TRAINING</span>
        </motion.div>

        <div className="relative pl-10 sm:pl-12">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top' }}
            className="absolute left-[15px] sm:left-[19px] top-1 bottom-0 w-px bg-[#00e67a]/30"
          />

          <div className="space-y-6">
            {data.map((entry, i) => {
              const Icon = ICON_MAP[entry.icon] || GraduationCap

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <div
                    className="absolute -left-[31px] sm:-left-[37px] top-6 w-[10px] h-[10px] rotate-45 bg-[#00e67a]"
                    style={{ boxShadow: '0 0 6px rgba(0,230,122,0.5)' }}
                  />
                  <div className="absolute -left-[25px] sm:-left-[31px] top-[26px] w-[18px] h-px bg-[#00e67a]/40" />

                  <div
                    className="bg-black/60 backdrop-blur-md border border-[#00e67a]/20 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[#00e67a] text-xs font-mono opacity-60">{entry.id}</span>
                      {entry.status === 'ACTIVE' ? (
                        <span className="flex items-center gap-1.5 text-[#00e67a] text-xs font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00e67a] animate-pulse" />
                          {entry.status}
                        </span>
                      ) : (
                        <span className="text-white/30 text-xs font-mono">{entry.status}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      {Icon && <Icon size={20} className="text-[#00e67a]/60 shrink-0" />}
                      <h3 className="text-white font-bold text-lg">{entry.institution}</h3>
                    </div>

                    <p className="text-[#00e67a] font-mono text-sm mb-0.5">
                      {'< '}{entry.degree}{' />'}
                    </p>

                    <p className="text-white/50 text-xs font-mono mb-3">
                      <span>{entry.period}</span>
                      <span className="mx-1.5">·</span>
                      <MapPin size={10} className="inline mr-0.5" />
                      {entry.location}
                    </p>

                    <div className="text-right">
                      <span className="text-[#00e67a] font-bold text-2xl">{entry.score}</span>
                      <div className="text-white/40 text-[10px] tracking-widest uppercase">{entry.scoreLabel}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}
