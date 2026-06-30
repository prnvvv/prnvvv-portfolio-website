import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import AnimatedSection from '../../animations/AnimatedSection'
import { getProfile, getSkillsByCategory } from '../../../services/dataService'
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
  SiMatplotlib, SiSeaborn,
} from '../../ui/tech-icons'

const CATEGORY_ICONS: Record<string, string> = {
  'Programming Languages': '▶',
  'AI/ML Frameworks': '◆',
  'Computer Vision': '◈',
  'Backend & Web': '▣',
  Frontend: '◉',
  Visualization: '▤',
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
  { node: <SiMatplotlib />, title: 'Matplotlib' },
  { node: <SiSeaborn />, title: 'Seaborn' },
]

const AI_STATUS = [
  { label: 'INFERENCE ENGINE', value: 'ONLINE', color: 'var(--accent-green)' },
  { label: 'MODELS LOADED', value: '5 ACTIVE', color: 'var(--accent-green)' },
  { label: 'UPTIME', value: '99.97%', color: 'var(--accent-green)' },
  { label: 'LATENCY', value: '12ms', color: 'var(--accent-green)' },
]

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
<AnimatedSection id="dossier" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header mb-8"
        >
          <span>◆</span>
          <span>OPERATOR DOSSIER // PRNVVV</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* ─── Profile Card ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="panel-border p-4"
          >
            <div className="flex items-start justify-between mb-3">
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

            <div className="mt-3 pt-3 border-t border-mil-green/12">
              <p className="text-mil-light font-body leading-relaxed" style={{ fontSize: 'var(--text-xs)' }}>{op.bio}</p>
            </div>

            {/* ─── AI CORE Status ─── */}
            <div id="ai-core" className="mt-3 pt-3 border-t border-mil-green/12">
              <h4
                className="font-heading text-mil-green tracking-[0.15em] uppercase mb-2"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)' }}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-mil-green shadow-[0_0_6px_rgba(0,230,122,0.6)] mr-2 animate-pulse" />
                AI CORE STATUS
              </h4>
              <div className="space-y-1.5">
                {AI_STATUS.map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center font-body" style={{ fontSize: 'var(--text-xs)' }}>
                    <span className="text-mil-olive">{stat.label}</span>
                    <span style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─── Skill Inventory Card (spans 2 cols) ─── */}
          <motion.div
            id="skills"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="panel-border p-4 md:col-span-2"
          >
            <div className="flex items-center justify-between mb-3">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div
                  key={category}
                  className="p-2.5"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '6px',
                  }}
                >
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[10px] opacity-70">{CATEGORY_ICONS[category] || '▸'}</span>
                    <h4
                      className="font-heading text-mil-green tracking-[0.12em] uppercase"
                      style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)' }}
                    >
                      {category}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {categorySkills.map((skill) => (
                      <SkillTag key={skill.name} name={skill.name} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ─── Tech Logo Loop ─── */}
            <div className="mt-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-mono text-[#00e67a] uppercase tracking-wider">TECH STACK</span>
                <div className="flex-1 h-px bg-[#00e67a]/20" />
              </div>
              <div
                className="relative w-full overflow-hidden rounded-lg"
                style={{
                  height: '56px',
                }}
              >
                <LogoLoop
                  logos={TECH_LOGOS}
                  speed={90}
                  direction="left"
                  logoHeight={35}
                  gap={42}
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

function InfoRow({ label, value }: { label: string; value: string | ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-mil-olive shrink-0 w-20 sm:w-28">{label}:</span>
      <span className="text-mil-light">{value}</span>
    </div>
  )
}
