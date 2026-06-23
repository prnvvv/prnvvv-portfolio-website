export interface Operator {
  callSign: string
  name: string
  rank: string
  status: 'ACTIVE' | 'STANDBY' | 'MIA'
  specialization: string
  clearanceLevel: string
  yearsActive: number
  location: string
  coordinates: [number, number]
  avatar: string
  bio: string
}

export interface Skill {
  category: string
  name: string
  proficiency: number
  icon?: string
}

export interface Mission {
  id: string
  title: string
  codename: string
  status: 'ACTIVE' | 'COMPLETED' | 'STANDING BY'
  type: string
  timeline: string
  description: string
  tech: string[]
  outcome?: string
  date: string
}

export interface Weapon {
  id: string
  name: string
  type: string
  description: string
  spec: string
  status: 'ACTIVE' | 'RESERVE' | 'DECOMMISSIONED'
  category: string
  icon?: string
  stats: {
    range: string
    accuracy: number
    power: number
    speed: number
  }
}

export interface ServiceEntry {
  id: string
  title: string
  organization: string
  period: string
  description: string
  highlights: string[]
  type: 'work' | 'education' | 'certification'
}

export interface IntelReport {
  id: string
  title: string
  category: string
  date: string
  classification: 'TOP SECRET' | 'SECRET' | 'CONFIDENTIAL' | 'UNCLASSIFIED'
  summary: string
  highlights: string[]
  source?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface NavTab {
  id: string
  label: string
  icon: string
}
