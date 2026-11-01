import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import AnimatedSection from '../../animations/AnimatedSection'
import { getEducation } from '../../../services/dataService'

export default function Education() {
  const data = getEducation()

  return (
    <AnimatedSection id="education" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1360px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header mb-8"
        >
          <span>◆</span>
          <span>ACADEMY RECORDS</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="bg-black/80 border border-[#00e67a]/20 rounded-lg overflow-hidden font-mono w-full"
            >
              {/* Terminal title bar */}
              <div className="flex justify-between items-center px-3 py-2 border-b border-[#00e67a]/10">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <p className="text-[10px] tracking-wider text-white/30 uppercase">education</p>
              </div>

              {/* Terminal body */}
              <div className="p-4 space-y-1.5">
                <p className="text-xs">
                  <span className="text-white/40">$</span>{' '}
                  <span className="text-[#00e67a]/70">cat</span>{' '}
                  <span className="text-white/50">~/records/{entry.id}</span>
                </p>
                <div className="border-t border-white/10 my-2" />

                <p className="text-white font-semibold text-sm leading-tight">
                  {entry.institution}
                </p>
                <p className="text-[#00e67a]/80 text-xs leading-relaxed">
                  {'< '}{entry.degree}{' />'}
                </p>
                <p className="text-white/50 text-xs">{entry.period}</p>
                <div className="flex items-center gap-1 text-white/40 text-xs">
                  <MapPin size={10} />
                  {entry.location}
                </div>

                <div className="border-t border-white/10 my-2" />

                <div className="flex items-center justify-between">
                  <span className="text-[#00e67a] text-lg font-bold">{entry.score}</span>
                  <span className="text-white/30 text-[10px] tracking-widest uppercase">{entry.scoreLabel}</span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      entry.status === 'ACTIVE'
                        ? 'bg-[#00e67a] animate-pulse'
                        : 'bg-white/20'
                    }`}
                  />
                  <span
                    className={`text-[10px] tracking-wider ${
                      entry.status === 'ACTIVE' ? 'text-[#00e67a]' : 'text-white/30'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>

                <p className="text-xs pt-1">
                  <span className="text-white/40">$</span>{' '}
                  <span className="text-white/20">_</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
