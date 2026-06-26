import {
  type Operator,
  type Skill,
  type Mission,
  type ServiceEntry,
  type IntelReport,
} from '../types/portfolio'
import { operatorData, skills } from '../data/operatorData'
import { missions } from '../data/missions'
import { serviceRecord } from '../data/serviceRecord'
import { intelReports } from '../data/intelReports'
import { arsenal } from '../data/arsenal'
import { educationData, type EducationEntry } from '../data/education'
import { leadershipData, type LeadershipEntry } from '../data/leadership'
import { certificationsData, type CertificationEntry } from '../data/certifications'
import { awardsData, type AwardEntry } from '../data/awards'
import { githubReposData, type GitHubRepoEntry } from '../data/github'

export type { EducationEntry, LeadershipEntry, CertificationEntry, AwardEntry, GitHubRepoEntry }

// ── Operator Profile ──
export function getProfile(): Operator {
  return operatorData
}

// ── Skills ──
export function getSkills(): Skill[] {
  return skills
}

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

// ── Projects / Missions ──
export function getProjects(): Mission[] {
  return missions
}

export function getActiveProjects(): Mission[] {
  return missions.filter((m) => m.status === 'ACTIVE')
}

// ── Experience ──
export function getExperience(): ServiceEntry[] {
  return serviceRecord
}

export function getWorkExperience(): ServiceEntry[] {
  return serviceRecord.filter((e) => e.type === 'work')
}

// ── Education ──
export function getEducation(): EducationEntry[] {
  return educationData
}

// ── Leadership ──
export function getLeadership(): LeadershipEntry[] {
  return leadershipData
}

// ── Intel Reports / Research ──
export function getResearch(): IntelReport[] {
  return intelReports
}

// ── Certifications ──
export function getCertifications(): CertificationEntry[] {
  return certificationsData
}

// ── Awards ──
export function getAwards(): AwardEntry[] {
  return awardsData
}

export function getAwardsByCategory(): Record<string, AwardEntry[]> {
  const grouped: Record<string, AwardEntry[]> = {}
  for (const award of awardsData) {
    if (!grouped[award.category]) grouped[award.category] = []
    grouped[award.category].push(award)
  }
  return grouped
}

// ── GitHub Repos ──
export function getGitHubRepos(): GitHubRepoEntry[] {
  return githubReposData
}

export function getFeaturedRepos(): GitHubRepoEntry[] {
  return githubReposData.filter((r) => r.featured)
}

// ── Arsenal ──
export function getArsenal(): Skill[] {
  return arsenal
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

// ── Social Links ──
export interface SocialLink {
  platform: string
  url: string
  icon: string
  label: string
}

export function getSocialLinks(): SocialLink[] {
  const profile = getProfile()
  return [
    { platform: 'github', url: profile.github || 'https://github.com/prannavakanth', icon: '◆', label: 'GitHub' },
    { platform: 'linkedin', url: profile.linkedin || 'https://linkedin.com/in/prannavakanth', icon: '◈', label: 'LinkedIn' },
    { platform: 'email', url: `mailto:${profile.email || 'prannavakanth12@gmail.com'}`, icon: '✉', label: 'Email' },
  ]
}
