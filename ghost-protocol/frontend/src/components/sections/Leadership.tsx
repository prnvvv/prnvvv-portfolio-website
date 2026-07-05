import { motion } from 'framer-motion'
import AnimatedSection from '../animations/AnimatedSection'
import { getLeadershipData } from '../../services/dataService'
import type { LeadershipEntry } from '../../data/leadership'

function StatusBadge({ current }: { current: boolean }) {
  return (
    <span style={{
      fontFamily: 'Share Tech Mono, monospace',
      fontSize: '9px',
      letterSpacing: '0.12em',
      color: current ? '#00e67a' : '#f59e0b',
      background: current ? 'rgba(0, 230, 122, 0.1)' : 'rgba(245, 158, 11, 0.1)',
      border: `1px solid ${current ? 'rgba(0, 230, 122, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
      borderRadius: '4px',
      padding: '2px 8px',
      whiteSpace: 'nowrap',
    }}>
      {current ? 'ACTIVE' : 'COMPLETED'}
    </span>
  )
}

function RoleCard({ role, index }: { role: LeadershipEntry; index: number }) {
  const startYear = role.date_started.split('-')[0]
  const endYear = role.date_ended.split('-')[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 230, 122, 0.15)',
        borderRadius: '10px',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: '8px', left: '10px', fontFamily: 'Share Tech Mono, monospace', fontSize: '14px', color: 'rgba(0, 230, 122, 0.15)', lineHeight: 1, pointerEvents: 'none' }}>┌</div>
      <div style={{ position: 'absolute', top: '8px', right: '10px', fontFamily: 'Share Tech Mono, monospace', fontSize: '14px', color: 'rgba(0, 230, 122, 0.15)', lineHeight: 1, pointerEvents: 'none' }}>┐</div>
      <div style={{ position: 'absolute', bottom: '8px', left: '10px', fontFamily: 'Share Tech Mono, monospace', fontSize: '14px', color: 'rgba(0, 230, 122, 0.15)', lineHeight: 1, pointerEvents: 'none' }}>└</div>
      <div style={{ position: 'absolute', bottom: '8px', right: '10px', fontFamily: 'Share Tech Mono, monospace', fontSize: '14px', color: 'rgba(0, 230, 122, 0.15)', lineHeight: 1, pointerEvents: 'none' }}>┘</div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              lineHeight: 1.4,
            }}>
              {role.position}
            </h3>
            <p style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '10px',
              color: 'rgba(0, 230, 122, 0.55)',
              margin: '4px 0 0 0',
              letterSpacing: '0.03em',
            }}>
              {role.organization}
            </p>
          </div>
          <StatusBadge current={role.current} />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '12px',
          marginBottom: '12px',
        }}>
          <span style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '9px',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.08em',
          }}>
            {startYear}
          </span>
          <div style={{
            flex: 1,
            height: '3px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '2px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: role.current ? '60%' : '100%',
              background: role.current ? 'rgba(0, 230, 122, 0.4)' : 'rgba(0, 230, 122, 0.2)',
              borderRadius: '2px',
            }} />
          </div>
          <span style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '9px',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.08em',
          }}>
            {role.current ? 'PRESENT' : endYear}
          </span>
        </div>

        <ul style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {role.responsibilities.map((resp, i) => (
            <li key={i} style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.6,
              paddingLeft: '12px',
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: '6px',
                width: '3px',
                height: '3px',
                background: 'rgba(0, 230, 122, 0.3)',
                borderRadius: '50%',
              }} />
              {resp}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default function Leadership() {
  const roles = getLeadershipData()

  return (
    <AnimatedSection id="leadership" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header mb-8"
        >
          <span>◆</span>
          <span>LEADERSHIP & ROLES</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {roles.map((role, i) => (
            <RoleCard key={role.id} role={role} index={i} />
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
