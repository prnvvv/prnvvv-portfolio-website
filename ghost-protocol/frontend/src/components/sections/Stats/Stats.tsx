import AnimatedSection from '../../animations/AnimatedSection'
import { StatTileGrid } from '../../motion/StatTile'
import { getStats } from '../../../services/dataService'
import { DottedMap } from '@/components/ui/dotted-map'
import type { StatTileData } from '../../motion/types'

export default function Stats() {
  const stats = getStats()

  const STATS: StatTileData[] = [
    {
      value: stats.totalProjects,
      label: 'MISSIONS DEPLOYED',
      trend: 'up',
      detail: `${stats.totalProjects} production projects shipped across AI/ML, full-stack, and research domains.`,
      subDetail: 'Latest: IIT Ropar RAG pipeline · CropCore patent',
    },
    {
      value: `${stats.yearsActive}+`,
      label: 'YEARS ACTIVE',
      suffix: '+',
      trend: 'stable',
      detail: `${stats.yearsActive}+ years building scalable ML systems and full-stack platforms.`,
      subDetail: 'VIT Chennai → IIT Ropar Research Intern',
    },
    {
      value: stats.activeProjects,
      label: 'ACTIVE OPS',
      trend: 'up',
      detail: 'Currently deployed: AI/ML Research Internship at IIT Ropar.',
      subDetail: 'Status: ACTIVE — Agentic AI systems',
    },
    {
      value: stats.certifications,
      label: 'CERTIFICATIONS',
      trend: 'stable',
      detail: `${stats.certifications} professional certifications across ML, cloud, and data engineering.`,
      subDetail: 'Credentials verified across major industry platforms',
    },
    {
      value: stats.skillsCount,
      label: 'SKILLS',
      trend: 'up',
      detail: `${stats.skillsCount} technical skills across Python, React, LangGraph, FastAPI, and more.`,
      subDetail: 'Domains: ML · Full-Stack · DevOps · Research',
    },
    {
      value: stats.patentsPublished + stats.patentsFiled,
      label: 'PATENTS FILED',
      trend: 'stable',
      detail: `${stats.patentsPublished + stats.patentsFiled} patents filed including CropCore IoT agricultural intelligence platform.`,
      subDetail: 'Status: Active filings · IP secured',
    },
  ]

  return (
    <AnimatedSection className="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="w-full h-full opacity-[0.04]">
          <DottedMap
            width={300}
            height={150}
            mapSamples={800}
            dotColor="var(--g-green-primary)"
            markerColor="var(--g-green-secondary)"
            markers={[
              { lat: 28, lng: 77, label: 'New Delhi', size: 0.6, pulse: true },
              { lat: 13, lng: 80, label: 'Chennai', size: 0.6, pulse: true },
              { lat: 31, lng: 77, label: 'Ropar', size: 0.6, pulse: true },
            ]}
          />
        </div>
      </div>
      <div className="max-w-[1360px] mx-auto relative z-10">
        <div className="border-t border-mil-green/10 border-b border-mil-green/10 py-4">
          <StatTileGrid stats={STATS} />
        </div>
      </div>
    </AnimatedSection>
  )
}
