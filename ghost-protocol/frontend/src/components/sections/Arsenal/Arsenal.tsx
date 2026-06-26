import { useState } from 'react'
import { motion } from 'framer-motion'
import { getSkillsByCategory, getSkillCategories } from '../../../services/dataService'
import SkillTag from '../../ui/SkillTag'

const CATEGORY_ICONS: Record<string, string> = {
  'Programming Languages': '⚡',
  'AI/ML Frameworks': '🧠',
  'Computer Vision': '📷',
  'Backend & Web': '🖥️',
  Frontend: '🎨',
  Visualization: '📊',
  DevOps: '🔧',
  Cloud: '☁️',
}

export default function Arsenal() {
  const skillsByCategory = getSkillsByCategory()
  const categories = getSkillCategories()
  const [filter, setFilter] = useState<string>('ALL')

  const filteredCategories =
    filter === 'ALL'
      ? categories
      : categories.filter((c) => c === filter)

  return (
    <section id="arsenal" className="min-h-screen py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="section-header">
          <span>⚔</span>
          <span>SKILLS ARSENAL // TECHNICAL APTITUDE</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          <FilterBtn label="ALL" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
          {categories.map((cat) => (
            <FilterBtn
              key={cat}
              label={cat}
              active={filter === cat}
              onClick={() => setFilter(cat)}
            />
          ))}
        </div>

        <div className="space-y-8">
          {filteredCategories.map((category, idx) => {
            const skills = skillsByCategory[category]
            if (!skills || skills.length === 0) return null

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm opacity-70">
                    {CATEGORY_ICONS[category] || '▸'}
                  </span>
                  <h3
                    className="text-xs font-heading text-[#00e67a] tracking-[0.2em] uppercase"
                    style={{ fontFamily: 'Orbitron' }}
                  >
                    {category}
                  </h3>
                  <span className="flex-1 h-px bg-gradient-to-r from-[#00e67a]/30 to-transparent" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <SkillTag key={skill.name} name={skill.name} />
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FilterBtn({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 text-[10px] font-heading tracking-[0.15em] border rounded-sm transition-all duration-300"
      style={{
        fontFamily: 'Orbitron',
        color: active ? '#00e67a' : '#5a8a6a',
        borderColor: active ? '#00e67a' : '#1a2e1a',
        background: active ? 'rgba(0,230,122,0.05)' : 'transparent',
      }}
    >
      {label}
    </button>
  )
}
