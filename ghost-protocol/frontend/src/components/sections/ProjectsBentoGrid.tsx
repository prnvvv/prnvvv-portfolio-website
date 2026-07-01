import { Brain, Cpu, Globe, Database, Shield, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProjects } from '../../services/dataService';
import { MagicBento } from '../effects/MagicBento';

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
  'mission-1': { label: 'PATENT PUBLISHED', color: '#00e67a' },
  'mission-5': { label: 'PATENT FILED', color: '#f59e0b' },
  'mission-6': { label: 'PATENT FILED', color: '#f59e0b' },
  'mission-7': { label: 'PATENT FILED', color: '#f59e0b' },
  'mission-8': { label: 'UNDER REVIEW', color: '#06b6d4' },
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'PATENT PUBLISHED': <Award size={10} strokeWidth={2.5} />,
};

const PROJECT_BENTO_SPANS: Record<string, string> = {
  'mission-1': 'lg:col-span-2',
  'mission-5': 'lg:col-span-2',
  'mission-7': 'lg:col-span-2',
  'mission-8': 'lg:col-span-2',
};

const BENTO_HOVER_CSS = `
  .bento-grid:has(.bento-card:hover) .bento-card:not(:hover) {
    opacity: 0.75;
  }
  .bento-card {
    transition: opacity 0.4s ease;
  }
  .bento-card:hover {
    opacity: 1;
  }
`

export function ProjectsBentoGrid() {
  const allProjects = getProjects();
  const projects = allProjects.slice(0, 8);

  return (
    <>
      <style>{BENTO_HOVER_CSS}</style>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="bento-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {projects.map((project) => {
          const Icon = PROJECT_ICONS[project.id] || Brain;
          const badge = PROJECT_STATUS[project.id];
          const span = PROJECT_BENTO_SPANS[project.id] || '';

          return (
            <MagicBento key={project.id} className={span}>
              <div className={`bento-card bg-black/40 backdrop-blur-md border border-[#00e67a]/20 hover:border-[#00e67a]/40 rounded-lg p-4 h-full flex flex-col group`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="h-8 w-8 flex items-center justify-center text-[#00e67a] shrink-0">
                    <Icon size={16} />
                  </div>
                  {badge && (
                    <span
                      className="flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: `${badge.color}20`, color: badge.color }}
                    >
                      {STATUS_ICONS[badge.label] || (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      )}
                      {badge.label}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-[12px] tracking-[0.15em] text-white uppercase mb-1.5 leading-tight">
                  {project.codename}
                </h3>
                <p className="font-mono text-[12px] text-white/90 leading-relaxed flex-1 line-clamp-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {project.tech.slice(0, span ? 5 : 3).map((t) => (
                    <span key={t} className="text-[9px] font-mono text-[#00e67a]/90 bg-[#00e67a]/8 px-1.5 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                  {project.tech.length > (span ? 5 : 3) && (
                    <span className="text-[9px] font-mono text-white/70">+{project.tech.length - (span ? 5 : 3)}</span>
                  )}
                </div>
              </div>
            </MagicBento>
          );
        })}
      </div>
    </motion.div>
    </>
  );
}
