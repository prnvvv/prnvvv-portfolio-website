import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { arsenal } from '../../../data/arsenal'

export default function Arsenal() {
  const [selected, setSelected] = useState<string | null>(null)

  const categories = [...new Set(arsenal.map((w) => w.category))]
  const [filter, setFilter] = useState<string>('ALL')

  const filtered = filter === 'ALL' ? arsenal : arsenal.filter((w) => w.category === filter)

  return (
    <section id="arsenal" className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="section-header">
          <span>⚔</span>
          <span>ARSENAL // WEAPONS SYSTEMS</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((weapon) => (
              <motion.div
                key={weapon.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelected(selected === weapon.id ? null : weapon.id)}
                className="panel-border bg-[#0d110d] p-4 cursor-pointer hover:border-[#00ff88]/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className="text-[#00ff88] text-xs font-heading tracking-[0.1em]"
                    style={{ fontFamily: 'Orbitron' }}
                  >
                    {weapon.name}
                  </h3>
                  <span
                    className={`text-[10px] font-body ${
                      weapon.status === 'ACTIVE' ? 'text-[#00ff88]' : 'text-[#5a8a6a]'
                    }`}
                  >
                    {weapon.status}
                  </span>
                </div>
                <p className="text-[#5a8a6a] text-[10px] font-body mb-1">{weapon.type}</p>
                <p className="text-[#c8ffd4] text-[11px] font-body">{weapon.spec}</p>

                <AnimatePresence>
                  {selected === weapon.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[#c8ffd4] text-[11px] font-body mt-3 pt-3 border-t border-[#1a2e1a] leading-relaxed">
                        {weapon.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <StatBar label="ACC" value={weapon.stats.accuracy} />
                        <StatBar label="PWR" value={weapon.stats.power} />
                        <StatBar label="SPD" value={weapon.stats.speed} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
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
      className="px-3 py-1 text-[10px] font-heading tracking-[0.15em] border rounded-sm transition-colors"
      style={{
        fontFamily: 'Orbitron',
        color: active ? '#00ff88' : '#5a8a6a',
        borderColor: active ? '#00ff88' : '#1a2e1a',
        background: active ? 'rgba(0,255,136,0.05)' : 'transparent',
      }}
    >
      {label}
    </button>
  )
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-body mb-0.5">
        <span className="text-[#5a8a6a]">{label}</span>
        <span className="text-[#c8ffd4]">{value}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
