import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from '../../animations/AnimatedSection'
import { getResearch } from '../../../services/dataService'

const classificationColors: Record<string, string> = {
  'TOP SECRET': 'text-[#ff3344] border-[#ff3344]',
  SECRET: 'text-[#ffcc00] border-[#ffcc00]',
  CONFIDENTIAL: 'text-[#5a8a6a] border-[#5a8a6a]',
  UNCLASSIFIED: 'text-[#f0f0f0] border-[#f0f0f0]',
}

export default function IntelReports() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const intelReports = getResearch()

  return (
    <AnimatedSection id="intel-reports" className="min-h-screen py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header"
        >
          <span>▣</span>
          <span>INTEL REPORTS // BRIEFING FILES</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {intelReports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24, y: 12 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.13,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              style={{ transition: 'box-shadow 0.3s ease' }}
              onHoverStart={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0, 230, 122, 0.08)'
              }}
              onHoverEnd={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              <button
                onClick={() => setExpanded(expanded === report.id ? null : report.id)}
                className="w-full panel-border bg-[#181825]/70 p-4 text-left cursor-pointer hover:border-[#00e67a]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="text-[#f0f0f0] text-xs font-heading tracking-[0.1em] truncate"
                        style={{ fontFamily: 'Orbitron' }}
                      >
                        {report.title}
                      </h3>
                      <span
                        className={`classified-stamp ${classificationColors[report.classification] ?? 'text-[#5a8a6a] border-[#5a8a6a]'}`}
                      >
                        {report.classification}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-body">
                      <span className="text-[#5a8a6a]">{report.category}</span>
                      <span className="text-[#5a8a6a]">{report.date}</span>
                    </div>
                  </div>
                  <span className="text-[#5a8a6a] text-xs font-body shrink-0">
                    {expanded === report.id ? '[-]' : '[+]'}
                  </span>
                </div>

                <AnimatePresence>
                  {expanded === report.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-[#f0f0f0] text-[11px] font-body leading-relaxed mt-3 pt-3 border-t border-[rgba(0,230,122,0.12)]">
                        {report.summary}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {report.highlights.map((h, j) => (
                          <li key={j} className="text-[#5a8a6a] text-[10px] font-body flex gap-2">
                            <span className="text-[#00e67a]">&gt;</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
