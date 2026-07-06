import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TacticalTile } from './TacticalTile';
import type { StatTileData } from './types';

export const StatTile = React.memo(function StatTile({
  data,
  index,
}: {
  data: StatTileData;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });

  const expandContent = (
    <div style={{ padding: '10px 14px 12px' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        letterSpacing: '0.06em',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        marginBottom: '4px',
      }}>
        {data.detail}
      </div>
      {data.subDetail && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-micro)',
          letterSpacing: '0.08em',
          color: 'var(--text-dim)',
        }}>
          {data.subDetail}
        </div>
      )}
    </div>
  );

  return (
    <div ref={ref}>
      <TacticalTile
        variant="stat"
        index={index}
        autoReveal={true}
        autoRevealDelay={1200}
        expandContent={expandContent}
        showRadar={index % 2 === 0}
        accentColor="#00e67a"
        style={{ minWidth: '140px' }}
      >
        <div style={{
          padding: '16px 14px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}>
          <motion.div
            animate={inView ? {
              textShadow: [
                '0 0 10px rgba(0,230,122,0.3)',
                '0 0 20px rgba(0,230,122,0.5)',
                '0 0 10px rgba(0,230,122,0.3)',
              ],
            } : undefined}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.15 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 800,
              color: 'var(--accent-green)',
              letterSpacing: '0.02em',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '0.02em', lineHeight: 1, userSelect: 'none' }}>
              {data.value}{data.suffix || ''}
            </span>
          </motion.div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-micro)',
            letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}>
            {data.label}
          </div>

          {data.trend && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: data.trend === 'up' ? 'var(--accent-green)' : 'rgba(255,255,255,0.2)',
                boxShadow: data.trend === 'up' ? '0 0 6px rgba(0,230,122,0.6)' : 'none',
                marginTop: '2px',
              }}
            />
          )}
        </div>
      </TacticalTile>
    </div>
  );
});

export function StatTileGrid({ stats }: { stats: StatTileData[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
      gap: '10px',
      width: '100%',
    }}>
      {stats.map((stat, i) => (
        <StatTile key={stat.label} data={stat} index={i} />
      ))}
    </div>
  );
}
