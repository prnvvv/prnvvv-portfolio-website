import { AnimatedList } from '@/components/ui/animated-list';
import { getArsenal } from '../../services/dataService';
import type { Skill } from '../../types/portfolio';

function getStatus(skill: Skill): 'ACTIVE' | 'PROFICIENT' | 'LEARNING' {
  if (skill.proficiency >= 85) return 'ACTIVE';
  if (skill.proficiency >= 70) return 'PROFICIENT';
  return 'LEARNING';
}

const STATUS_COLORS = {
  ACTIVE: '#00e67a',
  PROFICIENT: 'rgba(255, 255, 255, 0.6)',
  LEARNING: 'rgba(255, 255, 255, 0.4)',
};

const CATEGORY_EMOJI: Record<string, string> = {
  'Programming Languages': '▶',
  'AI/ML Frameworks': '◆',
  'Computer Vision': '◈',
  'Backend & Web': '▶',
  Frontend: '◉',
  Visualization: '▤',
};

function SkillItem({ entry }: { entry: Skill }) {
  const status = getStatus(entry);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        background: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '3px',
        backdropFilter: 'blur(12px)',
        borderLeft: `2px solid ${STATUS_COLORS[status]}`,
      }}
    >
      <span style={{ fontSize: '14px', flexShrink: 0 }}>{CATEGORY_EMOJI[entry.category] || '▸'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.94)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {entry.name}
        </div>
        <div
          style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '9px',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.3)',
            marginTop: '2px',
          }}
        >
          {entry.category}
        </div>
      </div>
      <span
        style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: '8px',
          letterSpacing: '0.15em',
          color: STATUS_COLORS[status],
          padding: '2px 7px',
          border: `1px solid ${STATUS_COLORS[status]}40`,
          borderRadius: '2px',
          flexShrink: 0,
        }}
      >
        {status}
      </span>
    </div>
  );
}

export function ArsenalAnimatedList() {
  const skills = getArsenal();
  return (
    <div style={{ maxHeight: '420px', overflow: 'hidden', position: 'relative' }}>
      <AnimatedList delay={800} className="flex flex-col gap-2">
        {skills.map((entry) => (
          <SkillItem key={entry.name} entry={entry} />
        ))}
      </AnimatedList>
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '80px',
          background: 'linear-gradient(to bottom, transparent, rgba(8,12,9,0.95))',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
