export interface CertificationEntry {
  id: string
  name: string
  issuer: string
  date_earned: string
  skills_validated: string[]
}

export const certificationsData: CertificationEntry[] = [
  {
    id: 'cert-1',
    name: 'Supervised Machine Learning: Regression & Classification',
    issuer: 'Stanford University',
    date_earned: '2025-01',
    skills_validated: ['Supervised Learning', 'Regression', 'Classification', 'ML Algorithms'],
  },
  {
    id: 'cert-2',
    name: 'Advanced Machine Learning Algorithms',
    issuer: 'Stanford University',
    date_earned: '2025-06',
    skills_validated: ['Advanced ML', 'Algorithm Design', 'Model Optimization'],
  },
  {
    id: 'cert-3',
    name: 'Machine Learning with Python',
    issuer: 'IBM',
    date_earned: '2024-12',
    skills_validated: ['Python', 'Scikit-learn', 'ML Implementation'],
  },
  {
    id: 'cert-4',
    name: 'AWS Foundations: Machine Learning Basics',
    issuer: 'Amazon Web Services (AWS)',
    date_earned: '2025-03',
    skills_validated: ['AWS', 'ML Basics', 'Cloud ML'],
  },
  {
    id: 'cert-5',
    name: 'Introduction to Generative AI',
    issuer: 'Google',
    date_earned: '2025-08',
    skills_validated: ['Generative AI', 'LLM', 'AI Fundamentals'],
  },
  {
    id: 'cert-6',
    name: 'Exploring Data Transformation with Google Cloud',
    issuer: 'Google Cloud',
    date_earned: '2025-09',
    skills_validated: ['Data Transformation', 'Google Cloud', 'Data Engineering'],
  },
]
