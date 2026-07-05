import { motion } from 'framer-motion'
import AnimatedSection from '../../animations/AnimatedSection'
import { NumberTicker } from '../../ui/number-ticker'
import { getAchievements } from '../../../services/dataService'
import type { AchievementStats } from '../../../data/achievements'

interface Achievement {
  id: string
  title: string
  subtitle: string
  description: string
  link?: string
  badge: string
  badgeColor: string
}

const LINK_A = 'https://www.linkedin.com/posts/prannavakhanth_vashishthackathon-iiitdmkancheepuram-fintech-ugcPost-7446457431867678720-kTRU/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEZEZMcBwRsKnHgEdxB_PuRESArMim5AhW4'
const LINK_B = 'https://www.linkedin.com/posts/prannavakhanth_we-are-excited-to-announce-that-our-team-activity-7247571240280829952-Xf-5?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEZEZMcBwRsKnHgEdxB_PuRESArMim5AhW4'

const HACKATHON_WINS: Achievement[] = [
  {
    id: 'annamai',
    title: 'AnnamAI x AI-CoE x IIT Ropar Hackathon',
    subtitle: '1st Place · Agricultural AI · 50+ teams',
    description: 'Built an AI-powered solution tackling real-world agricultural challenges. Secured first place among 50+ competing teams. Awarded Rs 5,00,000 National First Prize.',
    badge: '',
    badgeColor: '#00e67a',
    link: LINK_A,
  },
  {
    id: 'hackhub',
    title: "HackHub'25",
    subtitle: 'National Winner · IEEE & GitHub · Smart City',
    description: 'Developed a full-stack prototype addressing smart city infrastructure needs. Awarded top honors for innovation and execution.',
    badge: '',
    badgeColor: '#00e67a',
    link: LINK_A,
  },
  {
    id: 'vashisht',
    title: 'Vashisht 3.0',
    subtitle: '1st Place · FinTech Track · IIITDM Kancheepuram',
    description: 'Created a machine learning pipeline for predictive analytics in healthcare. Won against 80+ teams nationwide.',
    badge: '',
    badgeColor: '#00e67a',
    link: LINK_A,
  },
  {
    id: 'pitchathon',
    title: "Pitchathon'24",
    subtitle: 'Special Recognition · Industry VCs · Market Viability',
    description: 'Presented a scalable tech business model before industry VCs. Earned special recognition for market viability and impact.',
    badge: '',
    badgeColor: '#00e67a',
    link: LINK_B,
  },
]

const SCHOOL_AWARDS: Achievement[] = [
  {
    id: 'school-topper',
    title: 'School Topper',
    subtitle: 'CBSE Science Stream · 486 / 500',
    description: 'Achieved 486/500 in the Science stream, ranking first in the academic year. Consistent top performer across all semesters.',
    badge: '',
    badgeColor: '#00d4ff',
    link: LINK_A,
  },
  {
    id: 'subject-topper',
    title: 'Subject Topper',
    subtitle: 'Chemistry · Computer Science · Physical Education',
    description: 'Secured highest marks in Chemistry, Computer Science, and Physical Education. Demonstrated excellence across diverse disciplines.',
    badge: '',
    badgeColor: '#00d4ff',
    link: LINK_A,
  },
]

const OTHER_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'research-ip',
    title: 'Research IP Portfolio',
    subtitle: '1 Published · 3 Filed · 2 Under Review',
    description: 'Filed 4 patents (1 published) and 2 research papers under review across AI/ML domains. Driving innovation through intellectual property.',
    badge: '',
    badgeColor: '#a78bfa',
    link: LINK_A,
  },
  {
    id: 'tnca',
    title: 'TNCA Cricketer',
    subtitle: 'Tamil Nadu Cricket Association · U-14 & U-16',
    description: 'Selected for Tamil Nadu Cricket Association U-16 and U-14 state teams. Represented district in multiple inter-state tournaments.',
    badge: '',
    badgeColor: '#fb923c',
    link: LINK_A,
  },
]

interface SpotifyBarProps {
  achievement: Achievement
  sectionLabel: string
  delay?: number
}

function SpotifyAchievementBar({ achievement, sectionLabel, delay = 0 }: SpotifyBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div
        className="spotify-bar-row"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(0, 230, 122, 0.12)',
          transition: 'background 0.25s ease, border-color 0.25s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(0, 230, 122, 0.05)'
          e.currentTarget.style.borderColor = 'rgba(0, 230, 122, 0.25)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.35)'
          e.currentTarget.style.borderColor = 'rgba(0, 230, 122, 0.12)'
        }}
      >
        {achievement.link ? (
          <a
            href={achievement.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '42px', height: '42px', borderRadius: '6px', flexShrink: 0,
              background: 'rgba(0, 230, 122, 0.12)',
              border: '1px solid rgba(0, 230, 122, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', cursor: 'pointer',
              transition: 'all 0.2s ease', fontSize: '16px', color: '#00e67a',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#00e67a'
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0, 230, 122, 0.12)'
              e.currentTarget.style.color = '#00e67a'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            ▶
          </a>
        ) : (
          <div style={{
            width: '42px', height: '42px', borderRadius: '6px', flexShrink: 0,
            background: 'rgba(0, 230, 122, 0.12)', border: '1px solid rgba(0, 230, 122, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: '8px',
              color: 'rgba(0, 230, 122, 0.7)', letterSpacing: '0.08em',
              textAlign: 'center', lineHeight: '1.4', whiteSpace: 'pre',
            }}>
              {sectionLabel}
            </span>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '13px',
            color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {achievement.title}
          </p>
          <p style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '10px',
            color: 'rgba(0, 230, 122, 0.55)', margin: '3px 0 0 0',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            letterSpacing: '0.03em',
          }}>
            {achievement.subtitle}
          </p>
        </div>

        <div className="sound-bars" style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '24px', flexShrink: 0 }}>
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>

        {!achievement.link && (
          <span style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
            letterSpacing: '0.12em', color: achievement.badgeColor,
            background: `${achievement.badgeColor}1a`,
            border: `1px solid ${achievement.badgeColor}4d`,
            borderRadius: '4px', padding: '3px 8px', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {achievement.badge}
          </span>
        )}
      </div>

      <div className="achievement-description" style={{ padding: '8px 16px 12px 70px' }}>
        <p style={{
          fontFamily: 'Share Tech Mono, monospace', fontSize: '11px',
          color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, margin: 0,
        }}>
          {achievement.description}
        </p>
      </div>
    </motion.div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <div style={{ flex: 1, height: '1px', background: 'rgba(0,230,122,0.08)' }} />
      <span style={{
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: '11px', fontWeight: 600, color: 'rgba(0, 230, 122, 0.75)',
        letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(0,230,122,0.08)' }} />
    </div>
  )
}

export default function Achievements() {
  const { stats } = getAchievements()

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={0.15 + i * 0.08} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bg-black/40 backdrop-blur-md border border-[#00e67a]/20 rounded-lg p-4" style={{ marginBottom: '24px' }}>
            <SectionLabel label="Hackathon Wins" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {HACKATHON_WINS.map((a, i) => (
                <SpotifyAchievementBar key={a.id} achievement={a} sectionLabel={'HACK'} delay={i * 0.07} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            <div className="bg-black/40 backdrop-blur-md border border-[#00e67a]/20 rounded-lg p-4">
              <SectionLabel label="School Awards" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {SCHOOL_AWARDS.map((a, i) => (
                  <SpotifyAchievementBar key={a.id} achievement={a} sectionLabel={'SCH\nAWD'} delay={i * 0.07} />
                ))}
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-[#00e67a]/20 rounded-lg p-4">
              <SectionLabel label="Other Academic & Extra Curricular" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {OTHER_ACHIEVEMENTS.map((a, i) => (
                  <SpotifyAchievementBar key={a.id} achievement={a} sectionLabel={'EX\nCUR'} delay={i * 0.07} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

function StatCard({ stat, delay }: { stat: AchievementStats; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <NumberTicker
        value={Number.parseInt(stat.value)}
        startValue={100}
        duration={3}
        className="text-3xl md:text-4xl font-mono font-bold text-[#00e67a]"
      />
      <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/50 mt-1">
        {stat.label}
      </div>
      {stat.sublabel && (
        <div className="text-[8px] font-mono text-white/30 mt-0.5">
          {stat.sublabel}
        </div>
      )}
    </motion.div>
  )
}
