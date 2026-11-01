import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnimatedSection from '../../animations/AnimatedSection'
import { getProfile, getSkillsByCategory } from '../../../services/dataService'
import PipBoyWidget from './PipBoyWidget'
import SkillTag from '../../ui/SkillTag'
import LogoLoop from '../../ui/LogoLoop'
import DecryptText from '../../effects/DecryptText'
import { ROTATING_TITLES } from '../../../data/titles'
import {
  SiPython, SiJava, SiCplusplus, SiSqlite, SiR,
  SiTensorflow, SiPytorch, SiScikitlearn, SiKeras, SiLangchain,
  SiOpencv, SiYolo, SiMediapipe,
  SiFastapi, SiPandas, SiNumpy, SiDocker, SiBeautifulsoup,
  SiHtml5, SiCss3, SiJavascript, SiReact,
  SiTypescript, SiTailwindcss,
  SiMatplotlib, SiSeaborn,
} from '../../ui/tech-icons'

const CATEGORY_GLYPH: Record<string, string> = {
  Languages: '</>',
  'AI & ML': '⚡',
  Frameworks: '[FX]',
  'Databases & Tools': '[DB]',
  'Web & Core Concepts': '◎',
}

const CATEGORY_COLOR: Record<string, string> = {
  Languages: 'rgba(255, 255, 255, 0.25)',
  'AI & ML': 'rgba(255, 255, 255, 0.25)',
  Frameworks: 'rgba(255, 255, 255, 0.25)',
  'Databases & Tools': 'rgba(255, 255, 255, 0.25)',
  'Web & Core Concepts': 'rgba(255, 255, 255, 0.25)',
}

const TECH_LOGOS = [
  { node: <SiPython />, title: 'Python' },
  { node: <SiJava />, title: 'Java' },
  { node: <SiCplusplus />, title: 'C/C++' },
  { node: <SiSqlite />, title: 'SQL' },
  { node: <SiR />, title: 'R' },
  { node: <SiTensorflow />, title: 'TensorFlow' },
  { node: <SiPytorch />, title: 'PyTorch' },
  { node: <SiScikitlearn />, title: 'Scikit-learn' },
  { node: <SiKeras />, title: 'Keras' },
  { node: <SiLangchain />, title: 'LangChain' },
  { node: <SiOpencv />, title: 'OpenCV' },
  { node: <SiYolo />, title: 'YOLO' },
  { node: <SiMediapipe />, title: 'MediaPipe' },
  { node: <SiFastapi />, title: 'FastAPI' },
  { node: <SiPandas />, title: 'Pandas' },
  { node: <SiNumpy />, title: 'NumPy' },
  { node: <SiDocker />, title: 'Docker' },
  { node: <SiBeautifulsoup />, title: 'BeautifulSoup' },
  { node: <SiHtml5 />, title: 'HTML' },
  { node: <SiCss3 />, title: 'CSS' },
  { node: <SiJavascript />, title: 'JavaScript' },
  { node: <SiReact />, title: 'React' },
  { node: <SiTypescript />, title: 'TypeScript' },
  { node: <SiTailwindcss />, title: 'Tailwind CSS' },
  { node: <SiMatplotlib />, title: 'Matplotlib' },
  { node: <SiSeaborn />, title: 'Seaborn' },
]

const TECH_LOGOS_ROW2 = [...TECH_LOGOS].reverse()

export default function OperatorDossier() {
  const op = getProfile()
  const skillsByCategory = getSkillsByCategory()

  const statusColor =
    op.status === 'ACTIVE'
      ? 'text-mil-green'
      : op.status === 'STANDBY'
        ? 'text-mil-green'
        : 'text-mil-green'

  const categoryCount = Object.keys(skillsByCategory).length
  const totalSkills = Object.values(skillsByCategory).reduce((sum, arr) => sum + arr.length, 0)

  return (
<AnimatedSection id="dossier" className="pt-3 pb-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1360px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header !mb-2"
        >
          <span>◆</span>
          <span>OPERATOR DOSSIER // PRNVVV</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-stretch">
          {/* ─── Profile Card ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-black/90 backdrop-blur-md border border-[#00e67a]/15 rounded-lg p-[8px]"
          >
            {/* ─── Terminal Title Bar ─── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px',
                padding: '4px 0',
                borderBottom: '1px solid rgba(0, 230, 122, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }} />

              </div>
              <span
                style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: '9px',
                  color: 'rgba(0, 230, 122, 0.2)',
                  userSelect: 'none',
                }}
              >
                — □ ×
              </span>
            </div>

            {/* ─── Command Line ─── */}
            <div style={{ marginBottom: '6px' }}>
              <span
                style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: '10px',
                  color: 'rgba(0, 230, 122, 0.3)',
                  userSelect: 'none',
                }}
              >
                $ cat ~/operator/PRNVVV.json
                <span
                  style={{
                    marginLeft: '4px',
                    animation: 'cursor-blink 1s step-end infinite',
                  }}
                >
                  ▊
                </span>
              </span>
            </div>

            <div className="flex items-start justify-between mb-2">
              <div>
                <h2
                  className="text-mil-green font-heading tracking-[0.12em]"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)' }}
                >
                  {op.callSign}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${statusColor} bg-current`} />
                <span className={`font-body ${statusColor}`} style={{ fontSize: 'var(--text-xs)' }}>{op.status}</span>
              </div>
            </div>

            <div className="space-y-1 font-body" style={{ fontSize: 'var(--text-xs)' }}>
              <InfoRow label="NAME" value={op.name} />
              <InfoRow label="SPECIALIZATION" value={<DecryptText texts={ROTATING_TITLES} interval={4000} />} />
              <InfoRow label="PRIMARY WEAPON" value="Python" />
              <InfoRow label="PHILOSOPHY" value="I like to code, as simple as that" />
              <InfoRow label="LOCATION" value={op.location} />
              <InfoRow
                label="COORDINATES"
                value={op.coordinates ? `${op.coordinates[0]}, ${op.coordinates[1]}` : 'N/A'}
              />
            </div>

            {/* ─── Wisdom ─── */}
            <WisdomSection />
            <PipBoyWidget />
          </motion.div>

          {/* ─── Skill Inventory Card (spans 2 cols) ─── */}
          <motion.div
            id="skills"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="bg-black/90 backdrop-blur-md border border-[#00e67a]/15 rounded-lg p-[8px] md:col-span-2 flex flex-col"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h3
                className="text-mil-green font-heading tracking-[0.18em]"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)' }}
              >
                SKILL INVENTORY
              </h3>
              <span className="text-mil-olive font-body" style={{ fontSize: 'var(--text-micro)' }}>
                {categoryCount} CATEGORIES // {totalSkills} SKILLS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {Object.entries(skillsByCategory).map(([category, categorySkills], catIdx) => {
                const catColor = CATEGORY_COLOR[category] || '#00e67a'
                const glyph = CATEGORY_GLYPH[category] || '▸'
                const colSpan = catIdx === 4 ? '1 / -1' : undefined
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: catIdx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden rounded-lg card-scan"
                    style={{
                      background: `
                        radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px),
                        rgba(0, 0, 0, 0.55)
                      `,
                      backgroundSize: '16px 16px, 100% 100%',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(0, 230, 122, 0.15)',
                      transition: 'border-color 0.3s ease',
                      ['--scan-delay' as string]: `${catIdx * 0.1}s`,
                      gridColumn: colSpan,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 230, 122, 0.35)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 230, 122, 0.15)'
                    }}
                  >
                    {/* Left-edge accent bar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        background: catColor,
                        borderRadius: '8px 0 0 8px',
                        opacity: 0.8,
                      }}
                    />

                    {/* Scan line pseudo-element workaround using a div */}
                    <div
                      className="card-scan-line"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: `linear-gradient(90deg, transparent, ${catColor}, transparent)`,
                        top: 0,
                        animation: 'scan-once 0.8s ease-out forwards',
                        animationDelay: `var(--scan-delay, 0s)`,
                        pointerEvents: 'none',
                        zIndex: 2,
                      }}
                    />

                    <div style={{ padding: '6px 8px', position: 'relative', zIndex: 1 }}>
                      {/* Category header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span
                            style={{
                              fontFamily: "'Share Tech Mono', monospace",
                              fontSize: '10px',
                              color: catColor,
                              marginRight: '8px',
                              opacity: 0.9,
                            }}
                          >
                            {glyph}
                          </span>
                          <h4
                            className="font-heading text-mil-green tracking-[0.12em] uppercase"
                            style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)' }}
                          >
                            {category}
                          </h4>
                        </div>
                        <span
                          style={{
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: '10px',
                            color: 'rgba(255, 255, 255, 0.3)',
                            letterSpacing: '0.1em',
                          }}
                        >
                          {categorySkills.length} OPS
                        </span>
                      </div>

                      {/* Hairline divider */}
                      <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', margin: '4px 0' }} />

                      {/* Skill tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', alignContent: 'flex-start' }}>
                        {categorySkills.map((skill, tagIdx) => (
                          <motion.span
                            key={skill.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.2, delay: 0.1 + tagIdx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <SkillTag name={skill.name} catColor={catColor} />
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* ─── Tech Logo Loop ─── */}
            <div className="flex-1 flex flex-col justify-center min-h-[155px] w-full">
              <div className="flex items-center gap-4 mb-1.5">
                <span className="text-xs font-mono text-[#00e67a] uppercase tracking-wider">TECH STACK</span>
                <div className="flex-1 h-px bg-[#00e67a]/20" />
              </div>
              <div className="relative w-full overflow-hidden rounded-lg py-1 mb-1.5">
                <LogoLoop
                  logos={TECH_LOGOS}
                  speed={90}
                  direction="left"
                  logoHeight={53}
                  gap={28}
                  fadeOut
                  fadeOutColor="#080c09"
                  scaleOnHover
                  pauseOnHover
                />
              </div>
              <div className="relative w-full overflow-hidden rounded-lg py-1">
                <LogoLoop
                  logos={TECH_LOGOS_ROW2}
                  speed={90}
                  direction="right"
                  logoHeight={53}
                  gap={28}
                  fadeOut
                  fadeOutColor="#080c09"
                  scaleOnHover
                  pauseOnHover
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatedSection>
  )
}

const QUOTES = [
  '"Any sufficiently advanced technology is indistinguishable from magic." \u2014 Arthur C. Clarke',
  '"The greatest achievement of technology is not how it changes life, but how it improves it." \u2014 Satya Nadella',
  '"Technology should do the hard work so people can do the things that make them the happiest in life." \u2014 Larry Page',
  '"The art challenges the technology, and the technology inspires the art." \u2014 John Lasseter',
  '"Software is eating the world." \u2014 Steve Jobs',
]

function WisdomSection() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % QUOTES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="mt-1.5 pt-1.5 border-t border-mil-green/12">
      <h4
        className="font-heading text-mil-green tracking-[0.15em] uppercase mb-2"
        style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)' }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-mil-green shadow-[0_0_6px_rgba(0,230,122,0.6)] mr-2 animate-pulse" />
        WISDOM
      </h4>
      <p className="font-mono text-mil-light leading-relaxed min-h-[34px]" style={{ fontSize: 'var(--text-micro)' }}>
        <span
          style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '11px',
            color: 'rgba(0, 230, 122, 0.25)',
            marginRight: '6px',
            userSelect: 'none',
          }}
        >
          #
        </span>
        {QUOTES[index]}
      </p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | ReactNode }) {
  return (
    <div className="flex gap-1.5">
      <span
        style={{
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: '11px',
          color: 'rgba(0, 230, 122, 0.3)',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        &gt;
      </span>
      <span className="text-mil-olive shrink-0 w-20 sm:w-28">{label}:</span>
      <span className="text-mil-light">{value}</span>
    </div>
  )
}
