import type { ServiceEntry } from '../types/portfolio'

export const serviceRecord: ServiceEntry[] = [
  {
    id: 'exp-1',
    title: 'AI/ML Intern',
    organization: 'Hexaware Technologies',
    unit: 'AI/ML Division',
    location: 'Chennai, India',
    period: '2026',
    description: 'Building end-to-end AI/ML systems on cloud-integrated architectures. Developing proxy-driven healthcare claims intelligence framework using behavioral anomaly modeling and explainable LLM-based risk reasoning systems.',
    highlights: [
      'Built end-to-end AI/ML systems on cloud-integrated architectures',
      'Developed proxy-driven healthcare claims intelligence framework using behavioral anomaly modeling',
      'Implemented explainable LLM-based risk reasoning systems',
      'Created real-time GenAI workflow solutions including Google Finance tracking agents',
      'Developed HTML-embedded email automation systems',
      'Built lightweight multi-agent pipelines for enterprise task orchestration',
      'Successfully deployed healthcare claims intelligence framework',
    ],
    type: 'work',
    technologies: ['Python', 'TensorFlow', 'LangChain', 'FastAPI', 'Docker', 'Cloud Architecture'],
    current: true,
  },
  {
    id: 'exp-2',
    title: 'Research Intern',
    organization: 'Annam AI, AI CoE, IIT Ropar',
    unit: 'Research Division',
    location: 'India',
    period: '2025',
    description: 'Developed end-to-end ML solutions for agricultural data analysis and prediction. Worked with LLMs for agricultural applications and built supporting systems including data pipelines and 3D models.',
    highlights: [
      'Developed end-to-end ML solutions for agricultural data analysis and prediction',
      'Worked with LLMs for agricultural applications',
      'Built supporting systems including data pipelines and 3D models',
      'Improved model performance through ML optimization',
      'Awarded Rs.5,00,000 for project impact and innovation',
    ],
    type: 'work',
    technologies: ['Python', 'TensorFlow', 'LLMs', 'Data Pipelines', '3D Modeling'],
    current: false,
  },
]
