import { Brain, Cpu, Globe, Database, Shield, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProjects } from '../../services/dataService';

const PROJECT_ICONS: Record<string, typeof Brain> = {
  'mission-1': Brain,
  'mission-2': Cpu,
  'mission-3': Target,
  'mission-4': Database,
  'mission-5': Shield,
  'mission-6': Globe,
  'mission-7': Shield,
  'mission-8': Cpu,
};

const PROJECT_STATUS: Record<string, { label: string; color: string }> = {
  'mission-5': { label: 'PATENT FILED', color: '#00e67a' },
  'mission-6': { label: 'PATENT FILED', color: '#00e67a' },
  'mission-7': { label: 'PATENT FILED', color: '#00e67a' },
  'mission-8': { label: 'UNDER REVIEW', color: '#00e67a' },
};

const PROJECT_COLORS: Record<string, string> = {
  'mission-1': 'rgba(0,230,122,0.05)',
  'mission-2': 'rgba(0,230,122,0.04)',
  'mission-3': 'rgba(0,230,122,0.04)',
  'mission-4': 'rgba(0,230,122,0.03)',
  'mission-5': 'rgba(0,230,122,0.04)',
  'mission-6': 'rgba(0,230,122,0.04)',
  'mission-7': 'rgba(0,230,122,0.03)',
  'mission-8': 'rgba(0,230,122,0.04)',
};

export function ProjectsBentoGrid() {
  const allProjects = getProjects();
  const projects = allProjects.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, idx) => {
          const Icon = PROJECT_ICONS[project.id] || Brain;
          const color = PROJECT_COLORS[project.id] || 'rgba(0,230,122,0.03)';
          const badge = PROJECT_STATUS[project.id];

          return (
            <div
              key={project.id}
              className="bg-[rgba(10,8,20,0.75)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,230,122,0.20)] rounded-[4px] transition-all duration-300 p-5 min-h-[220px] h-full flex flex-col group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="h-10 w-10 flex items-center justify-center text-[#00e67a]">
                  <Icon size={20} />
                </div>
                {badge && (
                  <span
                    className="flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded shrink-0"
                    style={{ background: `${badge.color}20`, color: badge.color }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    {badge.label}
                  </span>
                )}
              </div>
              <h3 className="font-display text-[11px] tracking-[0.15em] text-white/90 uppercase mb-2">
                {project.codename}
              </h3>
              <p className="font-mono text-[11px] text-white/50 leading-relaxed flex-1">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.tech.slice(0, 4).map((t) => (
                  <span key={t} className="text-[9px] font-mono text-[#00e67a]/60 bg-[#00e67a]/5 px-1.5 py-0.5 rounded">
                    {t}
                  </span>
                ))}
                {project.tech.length > 4 && (
                  <span className="text-[9px] font-mono text-white/30">+{project.tech.length - 4}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
