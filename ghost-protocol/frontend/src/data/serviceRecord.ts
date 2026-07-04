import type { ServiceEntry } from '../types/portfolio'

export const serviceRecord: ServiceEntry[] = [
  {
    id: 'exp-1',
    title: 'SWE Intern',
    organization: 'Hexaware Technologies',
    unit: 'AI/ML Division',
    location: 'Chennai, India',
    period: '2026',
    description: 'Delivered 3 enterprise-scale projects across healthcare, fintech, and enterprise AI — including an LLM-powered anomaly detection system for healthcare claims, a full-stack CMS price transparency platform, and a multi-agent enterprise RAG chatbot.',
    highlights: [
      'Health & Insurance Proxy Modelling — Built an LLM-powered anomaly detection system for healthcare claims, reducing settlement delays. Processed 50+ claims with 72.25% accuracy in flagging anomalies.',
      'CMS Price Transparency Platform — Developed a full-stack platform processing 1,000+ hospital datasets, reducing ETL time.',
      'Enterprise Agentic RAG Chatbot — Designed a multi-agent RAG system with 85% faster retrieval and 98% precision. Adopted by 2 internal teams within the company.',
      'Built 10+ reusable AI modules, accelerating feature development by 50% across teams.',
    ],
    type: 'work',
    technologies: ['Python', 'LangChain', 'FastAPI', 'Docker', 'React', 'PostgreSQL'],
    current: true,
  },
  {
    id: 'exp-2',
    title: 'Research Intern',
    organization: 'AnnamAI, AI-CoE, IIT Ropar',
    unit: 'Research Division',
    location: 'India',
    period: '2025',
    description: 'Developed an integrated AI platform for genetic agriculture with 90%+ accuracy in crop disease diagnosis. Integrated genetic data, IoT sensors, and deep learning for real-time decision support. Prototyped a 3D plant digital twin with real-life simulation responses.',
    highlights: [
      'Developed an integrated AI platform for genetic agriculture with 90%+ accuracy in crop disease diagnosis.',
      'Integrated genetic data, IoT sensors, and deep learning for real-time decision support.',
      'Prototyped a 3D plant digital twin with real-life simulation responses.',
      'Enabled real-time analytics for intelligent farming automation, reducing water usage by 20% in pilot deployments.',
      'Awarded ₹5,00,000 for project impact and innovation — top 3% of proposals evaluated that year.',
    ],
    type: 'work',
    technologies: ['Python', 'TensorFlow', 'Deep Learning', 'IoT', '3D Modeling', 'Data Pipelines'],
    current: false,
  },
]
