import {
  type Operator,
  type Skill,
  type ServiceEntry,
} from '../types/portfolio'
import { operatorData, skills } from '../data/operatorData'
import { missions } from '../data/missions'
import { serviceRecord } from '../data/serviceRecord'
import { intelReports } from '../data/intelReports'
import { educationData, type EducationEntry } from '../data/education'
import { leadershipData } from '../data/leadership'
import { certificationsData, type CertificationEntry } from '../data/certifications'
import { awardsData } from '../data/awards'
import { githubReposData } from '../data/github'
import { achievementsData } from '../data/achievements'

// ── Operator Profile ──
export function getProfile(): Operator {
  return operatorData
}

// ── Skills ──
export function getSkillsByCategory(): Record<string, Skill[]> {
  const grouped: Record<string, Skill[]> = {}
  for (const skill of skills) {
    if (!grouped[skill.category]) grouped[skill.category] = []
    grouped[skill.category].push(skill)
  }
  return grouped
}

export function getSkillCategories(): string[] {
  return [...new Set(skills.map((s) => s.category))]
}

// ── Experience ──
export function getExperience(): ServiceEntry[] {
  return serviceRecord
}

// ── Education ──
export function getEducation(): EducationEntry[] {
  return educationData
}

// ── Certifications ──
export function getCertifications(): CertificationEntry[] {
  return certificationsData
}

// ── Achievements ──
export function getAchievements() {
  return achievementsData
}

// ── Stats ──
export interface PortfolioStats {
  yearsActive: number
  totalProjects: number
  activeProjects: number
  completedProjects: number
  hackathonWins: number
  totalAwards: number
  certifications: number
  patentsPublished: number
  patentsFiled: number
  papersUnderReview: number
  skillsCount: number
  githubStars: number
  leadershipRoles: number
}

export function getStats(): PortfolioStats {
  const hackathons = awardsData.filter((a) => a.category === 'Hackathon').length
  const patentsPublished = missions.filter((m) => m.id === 'mission-1').length
  const patentsFiled = missions.filter((m) =>
    ['mission-5', 'mission-6', 'mission-7'].includes(m.id)
  ).length
  const papersUnderReview = intelReports.filter((r) => r.status === 'Under Review').length
  const totalStars = githubReposData.reduce((sum, r) => sum + r.stars, 0)

  return {
    yearsActive: operatorData.yearsActive,
    totalProjects: missions.length,
    activeProjects: missions.filter((m) => m.status === 'ACTIVE').length,
    completedProjects: missions.filter((m) => m.status === 'COMPLETED').length,
    hackathonWins: hackathons,
    totalAwards: awardsData.length,
    certifications: certificationsData.length,
    patentsPublished: 1,
    patentsFiled: 3,
    papersUnderReview,
    skillsCount: skills.length,
    githubStars: totalStars,
    leadershipRoles: leadershipData.length,
  }
}


