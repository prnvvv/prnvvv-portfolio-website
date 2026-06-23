import { motion } from 'framer-motion'
import { serviceRecord } from '../../../data/serviceRecord'

const typeColors: Record<string, string> = {
  work: 'text-[#00ff88]',
  education: 'text-[#ffcc00]',
  certification: 'text-[#5a8a6a]',
}

const typeLabels: Record<string, string> = {
  work: 'DEPLOYMENT',
  education: 'TRAINING',
  certification: 'CERTIFICATION',
}

export default function ServiceRecord() {
  return (
    <section id="service-record" className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="section-header">
          <span>★</span>
          <span>SERVICE RECORD // DEPLOYMENT HISTORY</span>
        </div>

        <div className="relative">
          <div className="absolute left-[15px] top-0 bottom-0 w-px bg-[#1a2e1a]" />

          <div className="space-y-6">
            {serviceRecord.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="relative pl-10"
              >
                <div className="absolute left-[10px] top-1.5 w-3 h-3 rounded-full border-2 border-[#1a2e1a] bg-[#0a0c0a] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                </div>

                <div className="panel-border bg-[#0d110d] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div>
                      <h3
                        className="text-[#c8ffd4] text-sm font-heading tracking-[0.1em]"
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

                  <p className="text-[#c8ffd4] text-[11px] font-body leading-relaxed mt-2 mb-2">
                    {entry.description}
                  </p>

                  <ul className="space-y-1">
                    {entry.highlights.map((h, j) => (
                      <li key={j} className="text-[#5a8a6a] text-[10px] font-body flex gap-2">
                        <span className="text-[#00ff88] shrink-0">&gt;</span>
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
    </section>
  )
}
