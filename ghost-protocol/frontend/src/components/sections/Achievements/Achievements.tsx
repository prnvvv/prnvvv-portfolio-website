import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Trophy, FileText, BookOpen, Star, Award, Activity } from 'lucide-react'
import AnimatedSection from '../../animations/AnimatedSection'
import { getAchievements } from '../../../services/dataService'
import { NumberTicker } from '../../ui/number-ticker'
import type { AchievementStats, AchievementEntry } from '../../../data/achievements'

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

        {/* Stats — animated number ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 mb-10">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={0.15 + i * 0.08} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {entries.map((entry, i) => (
            <AchievementTweetCard key={entry.id} entry={entry} delay={0.2 + i * 0.06} />
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

function AchievementTweetCard({ entry, delay }: { entry: AchievementEntry; delay: number }) {
  const EntryIcon = ICON_MAP[entry.icon] || Trophy

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-fit w-full flex-col gap-4 overflow-hidden rounded-xl border border-[#00e67a]/15 bg-black/55 backdrop-blur-md p-5 transition-all duration-300 hover:scale-[1.02] hover:border-[#00e67a]/40"
    >
      {/* Header — matches MagicTweet/TweetHeader layout */}
      <div className="flex flex-row items-start justify-between tracking-normal">
        <div className="flex items-center space-x-3">
          <div className="shrink-0 w-12 h-12 rounded-full bg-[#00e67a]/10 border border-[#00e67a]/15 flex items-center justify-center overflow-hidden">
            <EntryIcon size={18} className="text-[#00e67a]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-white/90 font-medium whitespace-nowrap text-sm">
              {entry.category}
            </span>
            <span className="text-white/50 text-sm">
              @{entry.result.toLowerCase().replace(/\s+/g, '')}
            </span>
          </div>
        </div>
        <div className="shrink-0 mt-0.5">
          <span className="sr-only">Achievement</span>
          <svg viewBox="0 0 24 24" className="text-white/30 hover:text-white/50 size-5 transition-all ease-in-out hover:scale-105" fill="currentColor">
            <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z" />
          </svg>
        </div>
      </div>

      {/* Body — matches MagicTweet/TweetBody layout */}
      <div className="text-[15px] leading-relaxed tracking-normal">
        <span className="text-white/90 text-[15px] font-normal">{entry.title}</span>
      </div>
      <div className="-mt-3 text-[15px] leading-relaxed tracking-normal">
        <span className="text-white/50 text-[15px] font-normal">{entry.subtitle}</span>
      </div>

      {/* Description (if present) */}
      {entry.description && (
        <div className="-mt-3 text-[15px] leading-relaxed tracking-normal">
          <span className="text-white/30 text-[15px] font-normal">{entry.description}</span>
        </div>
      )}
    </motion.div>
  )
}

function StatCard({ stat, delay }: { stat: AchievementStats; delay: number }) {
  const finalValue = parseInt(stat.value, 10)

  const startValue = useMemo(() => {
    const min = 20
    const max = 60
    return Math.floor(Math.random() * (max - min + 1)) + min
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <div className="mb-0.5">
        <NumberTicker
          value={finalValue}
          startValue={startValue}
          direction="up"
          delay={0.3}
          className="text-white/90 font-heading text-xl md:text-2xl tracking-wider tabular-nums"
        />
      </div>
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
        {stat.label}
      </div>
      {stat.sublabel && (
        <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/25 mt-0.5">
          {stat.sublabel}
        </div>
      )}
    </motion.div>
  )
}
