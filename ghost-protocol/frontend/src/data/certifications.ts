export interface CertificationEntry {
  id: string
  title: string
  issuer: string
  issuerShort: string
  platform: string
  category: string
  color: string
  image?: string
}

export const certificationsData: CertificationEntry[] = [
  {
    id: 'CERT-001',
    title: 'Supervised Machine Learning',
    issuer: 'Stanford University',
    issuerShort: 'STANFORD',
    platform: 'Coursera',
    category: 'ML_CORE',
    color: '#00e67a',
  },
  {
    id: 'CERT-002',
    title: 'Advanced Learning Algorithms',
    issuer: 'Stanford University',
    issuerShort: 'STANFORD',
    platform: 'Coursera',
    category: 'ML_CORE',
    color: '#00e67a',
  },
  {
    id: 'CERT-003',
    title: 'Machine Learning with Python',
    issuer: 'IBM',
    issuerShort: 'IBM',
    platform: 'Coursera',
    category: 'ML_CORE',
    color: '#00e67a',
  },
  {
    id: 'CERT-004',
    title: 'AWS Foundations: ML Basics',
    issuer: 'Amazon Web Services',
    issuerShort: 'AWS',
    platform: 'AWS',
    category: 'CLOUD',
    color: '#00e67a',
  },
  {
    id: 'CERT-005',
    title: 'Introduction to Generative AI',
    issuer: 'Google',
    issuerShort: 'GOOGLE',
    platform: 'Google',
    category: 'GEN_AI',
    color: '#00e67a',
  },
  {
    id: 'CERT-006',
    title: 'Exploring Data Transformation',
    issuer: 'Google Cloud',
    issuerShort: 'GCP',
    platform: 'Google Cloud',
    category: 'CLOUD',
    color: '#00e67a',
  },
]
