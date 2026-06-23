import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { intelReports } from '../../../data/intelReports'

const classificationColors: Record<string, string> = {
  'TOP SECRET': 'text-[#ff3344] border-[#ff3344]',
  SECRET: 'text-[#ffcc00] border-[#ffcc00]',
  CONFIDENTIAL: 'text-[#5a8a6a] border-[#5a8a6a]',
  UNCLASSIFIED: 'text-[#c8ffd4] border-[#c8ffd4]',
}

export default function IntelReports() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <section id="intel-reports" className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="section-header">
          <span>▣</span>
          <span>INTEL REPORTS // BRIEFING FILES</span>
        </div>

        <div className="space-y-3">
          {intelReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setExpanded(expanded === report.id ? null : report.id)}
                className="w-full panel-border bg-[#0d110d] p-4 text-left cursor-pointer hover:border-[#00ff88]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="text-[#c8ffd4] text-xs font-heading tracking-[0.1em] truncate"
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
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[#c8ffd4] text-[11px] font-body leading-relaxed mt-3 pt-3 border-t border-[#1a2e1a]">
                        {report.summary}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {report.highlights.map((h, j) => (
                          <li key={j} className="text-[#5a8a6a] text-[10px] font-body flex gap-2">
                            <span className="text-[#00ff88]">&gt;</span>
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
    </section>
  )
}
