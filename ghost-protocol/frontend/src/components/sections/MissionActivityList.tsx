import { AnimatedList } from '@/components/ui/animated-list';
import { getProjects } from '../../services/dataService';

const STATUS_EMOJI: Record<string, string> = {
  COMPLETED: '◆',
  ACTIVE: '◈',
  'STANDING BY': '◇',
};

const MISSION_LABELS: Record<string, string> = {
  'mission-1': 'CropCore — Smart Farming Assistant',
  'mission-2': 'CareerTrack — AI Career Platform',
  'mission-3': 'AutCore — Autism Screening',
  'mission-4': 'KRED — Financial Intelligence',
  'mission-5': 'DiscAgeAI — Spinal Assessment',
  'mission-6': 'PACDI — Greenhouse Optimization',
  'mission-7': 'DIAGENC — Medical Encryption',
  'mission-8': 'SSL-RUL — Predictive Maintenance',
};

function MissionEvent({ event }: { event: { id: string; status: string; timeline: string } }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '9px 14px',
        background: 'rgba(10,8,20,0.6)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '3px',
      }}
    >
      <span style={{ fontSize: '14px' }}>{STATUS_EMOJI[event.status] || '◆'}</span>
      <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '11px', color: 'rgba(200,210,205,0.8)', flex: 1 }}>
        {MISSION_LABELS[event.id] || event.id}
      </span>
      <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '9px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>
        · {event.timeline}
      </span>
    </div>
  );
}

export function MissionActivityList() {
  const missions = getProjects();
  return (
    <div style={{ maxHeight: '360px', overflow: 'hidden', position: 'relative' }}>
      <AnimatedList delay={600} className="flex flex-col gap-2">
        {missions.map((m) => (
          <MissionEvent key={m.id} event={{ id: m.id, status: m.status, timeline: m.timeline }} />
        ))}
      </AnimatedList>
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '60px',
          background: 'linear-gradient(to bottom, transparent, rgba(8,4,18,0.95))',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
