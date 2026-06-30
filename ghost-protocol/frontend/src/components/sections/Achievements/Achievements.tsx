import { motion } from 'framer-motion'
import { Trophy, FileText, BookOpen, Star, Award, Activity } from 'lucide-react'
import AnimatedSection from '../../animations/AnimatedSection'
import { getAchievements } from '../../../services/dataService'

const ICON_MAP: Record<string, typeof Trophy> = {
  Trophy,
  FileText,
  BookOpen,
  Star,
  Award,
  Activity,
}

export default function Achievements() {
  const { stats, entries } = getAchievements()

  return (
    <AnimatedSection id="achievements" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header mb-8"
        >
          <span>◆</span>
          <span>COMMENDATIONS</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
          {stats.map((stat, i) => {
            const StatIcon = ICON_MAP[stat.icon] || Trophy
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="bg-black/60 backdrop-blur-md border border-[#00e67a]/20 rounded-lg p-4 flex flex-col items-center text-center"
              >
                <StatIcon size={20} className="text-[#00e67a]/60 mb-1" />
                <span className="text-[#00e67a] font-black text-3xl">{stat.value}</span>
                <span className="text-white/50 text-[10px] font-mono tracking-widest uppercase mt-1">
                  {stat.label}
                </span>
                {stat.sublabel && (
                  <span className="text-white/30 text-[10px] font-mono mt-0.5">{stat.sublabel}</span>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
          {entries.map((entry, i) => {
            const EntryIcon = ICON_MAP[entry.icon] || Trophy
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="bg-black/60 backdrop-blur-md border border-[#00e67a]/20 rounded-lg p-4 relative overflow-hidden hover:border-[#00e67a]/50 hover:bg-black/70 transition-all duration-300 hover:scale-[1.02] border-l-2 border-[#00e67a] h-full flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00e67a]/10 text-[#00e67a] uppercase tracking-wider">
                    {entry.category}
                  </span>
                  <EntryIcon size={16} className="text-[#00e67a] opacity-60" />
                </div>

                <div>
                  <h3 className="text-white font-bold text-base">{entry.title}</h3>
                  <p className="text-white/50 text-sm font-mono mt-0.5">{entry.subtitle}</p>
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <span className="font-mono font-bold text-sm text-[#00e67a]">
                    {entry.result}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#00e67a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-50"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </AnimatedSection>
  )
}
