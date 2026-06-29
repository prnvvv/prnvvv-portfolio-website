import { getStats, getProfile } from '../services/dataService'

export interface SignalStat {
  label: string
  value: number
  suffix?: string
}

export function getSignalStats(): SignalStat[] {
  const stats = getStats()
  return [
    { label: 'MISSIONS', value: stats.totalProjects },
    { label: 'ACTIVE OPS', value: stats.activeProjects },
    { label: 'YEARS ACTIVE', value: stats.yearsActive, suffix: '+' },
    { label: 'SKILLS', value: stats.skillsCount },
    { label: 'CERTIFICATIONS', value: stats.certifications },
    { label: 'PATENTS', value: stats.patentsPublished + stats.patentsFiled },
  ]
}

export function getTopSkills(): string[] {
  const profile = getProfile()
  const topSkills = [
    'Python', 'TensorFlow', 'FastAPI', 'React', 'LangChain'
  ]
  return topSkills
}
