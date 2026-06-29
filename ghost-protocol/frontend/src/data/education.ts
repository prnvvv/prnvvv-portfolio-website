export interface EducationEntry {
  id: string
  institution: string
  location: string
  degree: string
  period: string
  score: string
  scoreLabel: string
  status: string
  icon: string
}

export const educationData: EducationEntry[] = [
  {
    id: 'EDU-001',
    institution: 'Vellore Institute of Technology',
    location: 'Chennai, Tamil Nadu',
    degree: 'B.Tech — Computer Science & Engineering',
    period: '2023 — 2027',
    score: '9.06 / 10',
    scoreLabel: 'CGPA',
    status: 'ACTIVE',
    icon: 'GraduationCap',
  },
  {
    id: 'EDU-002',
    institution: 'P.S. Senior Secondary School',
    location: 'Chennai, Tamil Nadu',
    degree: 'Class XII — Science Group',
    period: '2023',
    score: '97.2%',
    scoreLabel: 'PERCENTAGE',
    status: 'COMPLETED',
    icon: 'School',
  },
  {
    id: 'EDU-003',
    institution: 'P.S. Senior Secondary School',
    location: 'Chennai, Tamil Nadu',
    degree: 'Class X',
    period: '2021',
    score: '91.8%',
    scoreLabel: 'PERCENTAGE',
    status: 'COMPLETED',
    icon: 'School',
  },
]
