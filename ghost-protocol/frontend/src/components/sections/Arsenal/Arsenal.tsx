import { useState } from 'react'
import { motion } from 'framer-motion'
import AnimatedSection from '../../animations/AnimatedSection'
import { getSkillsByCategory, getSkillCategories } from '../../../services/dataService'

import SkillTag from '../../ui/SkillTag'

const CATEGORY_ICONS: Record<string, string> = {
  'Programming Languages': '▶',
  'AI/ML Frameworks': '◆',
  'Computer Vision': '◈',
  'Backend & Web': '▣',
  Frontend: '◉',
  Visualization: '▤',
  DevOps: '◇',
  Cloud: '▣',
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
    <AnimatedSection id="arsenal" className="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header"
        >
          <span>◆</span>
          <span>SKILLS ARSENAL // TECHNICAL APTITUDE</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          <div className="">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap gap-1.5 mb-4"
            >
              <FilterBtn label="ALL" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
              {categories.map((cat) => (
                <FilterBtn
                  key={cat}
                  label={cat}
                  active={filter === cat}
                  onClick={() => setFilter(cat)}
                />
              ))}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCategories.map((category, idx) => {
                const skills = skillsByCategory[category]
                if (!skills || skills.length === 0) return null

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="panel-border p-3"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs opacity-70">{CATEGORY_ICONS[category] || '▸'}</span>
                      <h3
                        className="font-heading text-mil-green tracking-[0.15em] uppercase truncate"
                        style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)' }}
                      >
                        {category}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <SkillTag key={skill.name} name={skill.name} />
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
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
      className="px-3 py-1 font-heading tracking-[0.15em] border rounded-sm transition-all duration-300"
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-xs)',
        color: active ? 'var(--accent-green)' : 'var(--accent-olive)',
        borderColor: active ? 'var(--accent-green)' : 'var(--border-green-subtle)',
        background: active ? 'rgba(0,230,122,0.05)' : 'transparent',
      }}
    >
      {label}
    </button>
  )
}
