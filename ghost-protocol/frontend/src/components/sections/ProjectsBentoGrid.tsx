import { Brain, Cpu, Globe, Database, Shield, Target } from 'lucide-react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
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

const PROJECT_COLORS: Record<string, string> = {
  'mission-1': 'rgba(0,230,122,0.05)',
  'mission-2': 'rgba(0,196,240,0.04)',
  'mission-3': 'rgba(123,47,255,0.04)',
  'mission-4': 'rgba(0,230,122,0.03)',
  'mission-5': 'rgba(0,196,240,0.04)',
  'mission-6': 'rgba(0,230,122,0.04)',
  'mission-7': 'rgba(255,165,0,0.03)',
  'mission-8': 'rgba(0,230,122,0.04)',
};

export function ProjectsBentoGrid() {
  const allProjects = getProjects();
  const projects = allProjects.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <BentoGrid className="grid-cols-3 gap-3">
        {projects.map((project, idx) => {
          const Icon = PROJECT_ICONS[project.id] || Brain;
          const color = PROJECT_COLORS[project.id] || 'rgba(0,230,122,0.03)';
          const isWide = idx === 0 || idx === 4;

          return (
            <BentoCard
              key={project.id}
              name={project.codename}
              className={`
                ${isWide ? 'col-span-2' : 'col-span-1'}
                bg-[rgba(10,8,20,0.75)]
                backdrop-blur-xl
                border border-[rgba(255,255,255,0.06)]
                hover:border-[rgba(0,230,122,0.20)]
                rounded-[4px]
                transition-all duration-300
                [&_h3]:font-display [&_h3]:text-[11px] [&_h3]:tracking-[0.15em] [&_h3]:text-[#f0f0f0] [&_h3]:uppercase
                [&_p]:font-mono [&_p]:text-[11px] [&_p]:text-[rgba(200,210,205,0.65)] [&_p]:leading-relaxed
                [&_.bento-cta]:font-display [&_.bento-cta]:text-[9px] [&_.bento-cta]:tracking-[0.2em] [&_.bento-cta]:text-[#00e67a] [&_.bento-cta]:uppercase
                [&_svg]:text-[#00e67a]
                group
              `}
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--g-panel-bg)] via-transparent to-transparent" />
              }
              icon={<Icon size={20} />}
              description={project.description}
              href={'#'}
              cta="VIEW BRIEFING"
            />
          );
        })}
      </BentoGrid>
    </motion.div>
  );
}
