import { motion } from 'framer-motion'
import AnimatedSection from '../../animations/AnimatedSection'
import { getExperience } from '../../../services/dataService'

const typeColors: Record<string, string> = {
  work: 'text-[#00e67a]',
  education: 'text-[#ffcc00]',
  certification: 'text-[#5a8a6a]',
}

const typeLabels: Record<string, string> = {
  work: 'DEPLOYMENT',
  education: 'TRAINING',
  certification: 'CERTIFICATION',
}

export default function ServiceRecord() {
  const serviceRecord = getExperience()
  return (
    <AnimatedSection id="service-record" className="min-h-screen py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header"
        >
          <span>★</span>
          <span>SERVICE RECORD // DEPLOYMENT HISTORY</span>
        </motion.div>

        <div className="relative">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top' }}
            className="absolute left-[11px] sm:left-[15px] top-0 bottom-0 w-px bg-[#00e67a]/30"
          />

          <div className="space-y-4 sm:space-y-6">
            {serviceRecord.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="relative pl-8 sm:pl-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 + 0.1, duration: 0.3 }}
                  className="absolute left-[6px] sm:left-[10px] top-1.5 w-3 h-3 rounded-full border-2 border-[#00e67a]/50 bg-[#0d0d14] flex items-center justify-center"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00e67a] shadow-[0_0_6px_rgba(0,230,122,0.5)]" />
                </motion.div>

                <div className="panel-border bg-[#181825]/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div>
                      <h3
                        className="text-[#f0f0f0] text-sm font-heading tracking-[0.1em]"
                        style={{ fontFamily: 'Orbitron' }}
                      >
                        {entry.title}
                      </h3>
                      <p className="text-[#5a8a6a] text-[11px] font-body">{entry.organization}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-body ${typeColors[entry.type] ?? 'text-[#5a8a6a]'}`}>
                        {typeLabels[entry.type] ?? entry.type}
                      </span>
                      <span className="text-[#5a8a6a] text-[10px] font-body">{entry.period}</span>
                    </div>
                  </div>

                  <p className="text-[#f0f0f0] text-[11px] font-body leading-relaxed mt-2 mb-2">
                    {entry.description}
                  </p>

                  <ul className="space-y-1">
                    {entry.highlights.map((h, j) => (
                      <li key={j} className="text-[#5a8a6a] text-[10px] font-body flex gap-2">
                        <span className="text-[#00e67a] shrink-0">&gt;</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}
