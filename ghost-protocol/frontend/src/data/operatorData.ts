import type { Operator, Skill } from '../types/portfolio'

export const operatorData: Operator = {
  callSign: 'PRNVVV',
  name: 'PRANAV V',
  rank: 'SENIOR SOFTWARE ENGINEER',
  status: 'ACTIVE',
  specialization: 'FULL-STACK / AI SYSTEMS',
  clearanceLevel: 'LEVEL 5 / OMEGA',
  yearsActive: 5,
  location: 'BENGALURU, INDIA',
  coordinates: [12.9716, 77.5946],
  avatar: '',
  bio: 'Full-stack engineer specializing in AI-powered systems, cloud-native architectures, and building high-performance web applications. Expertise spans React ecosystems, Python-based AI/ML pipelines, and distributed systems design.',
}

export const skills: Skill[] = [
  { category: 'Frontend', name: 'React / TypeScript', proficiency: 95 },
  { category: 'Frontend', name: 'Next.js / Vite', proficiency: 90 },
  { category: 'Frontend', name: 'Tailwind CSS / Framer Motion', proficiency: 90 },
  { category: 'Backend', name: 'Python / FastAPI', proficiency: 88 },
  { category: 'Backend', name: 'Node.js / Express', proficiency: 85 },
  { category: 'AI/ML', name: 'RAG Pipelines / LangChain', proficiency: 82 },
  { category: 'AI/ML', name: 'Vector DBs (ChromaDB / Pinecone)', proficiency: 80 },
  { category: 'AI/ML', name: 'LLM Integration (Anthropic / OpenAI)', proficiency: 85 },
  { category: 'Cloud', name: 'AWS / GCP', proficiency: 78 },
  { category: 'Cloud', name: 'Docker / Kubernetes', proficiency: 75 },
  { category: 'Database', name: 'PostgreSQL / Redis', proficiency: 85 },
  { category: 'Database', name: 'MongoDB / Firestore', proficiency: 80 },
  { category: 'Tools', name: 'Git / GitHub Actions / CI/CD', proficiency: 90 },
  { category: 'Tools', name: 'Linux / Terminal Proficiency', proficiency: 88 },
]
