import { motion } from 'framer-motion'
import AnimatedSection from '../../animations/AnimatedSection'
import { getExperience } from '../../../services/dataService'

const typeColors: Record<string, string> = {
  work: 'text-mil-green',
  education: 'text-mil-green',
  certification: 'text-mil-olive',
}

const typeLabels: Record<string, string> = {
  work: 'DEPLOYMENT',
  education: 'TRAINING',
  certification: 'CERTIFICATION',
}

export default function ServiceRecord() {
  const serviceRecord = getExperience()
  return (
    <AnimatedSection id="service-record" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header mb-8"
        >
          <span>◆</span>
          <span>SERVICE RECORD // DEPLOYMENT HISTORY</span>
        </motion.div>

        <div className="relative">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top' }}
            className="absolute left-[11px] sm:left-[15px] top-0 bottom-0 w-px bg-mil-green/30"
          />

          <div className="space-y-3">
            {serviceRecord.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="relative pl-7 sm:pl-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 + 0.1, duration: 0.25 }}
                  className="absolute left-[5px] sm:left-[7px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-mil-green/50 bg-mil-dark flex items-center justify-center"
                >
                  <div className="w-1 h-1 rounded-full bg-mil-green shadow-[0_0_4px_rgba(0,230,122,0.5)]" />
                </motion.div>

                <div className="panel-border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-1 mb-1">
                    <div>
                      <h3
                        className="text-mil-light font-heading tracking-[0.08em]"
                        style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)' }}
                      >
                        {entry.title}
                      </h3>
                      <p className="text-mil-olive font-body" style={{ fontSize: 'var(--text-xs)' }}>{entry.organization}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`font-body ${typeColors[entry.type] ?? 'text-mil-olive'}`} style={{ fontSize: 'var(--text-xs)' }}>
                        {typeLabels[entry.type] ?? entry.type}
                      </span>
                      <span className="text-mil-olive font-body" style={{ fontSize: 'var(--text-xs)' }}>{entry.period}</span>
                    </div>
                  </div>

                  <p className="text-mil-light font-body leading-relaxed mb-1.5" style={{ fontSize: 'var(--text-xs)' }}>
                    {entry.description}
                  </p>

                  <ul className="space-y-0.5">
                    {entry.highlights.map((h, j) => (
                      <li key={j} className="text-mil-olive font-body flex gap-1.5" style={{ fontSize: 'var(--text-xs)' }}>
                        <span className="text-mil-green shrink-0">&gt;</span>
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
