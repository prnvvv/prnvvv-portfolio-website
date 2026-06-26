export interface GitHubRepoEntry {
  id: string
  repo_name: string
  description: string
  language: string
  stars: number
  forks: number
  topics: string[]
  url: string
  featured: boolean
}

export const githubReposData: GitHubRepoEntry[] = [
  {
    id: 'gh-1',
    repo_name: 'cropcore',
    description: 'AI-powered smart farming assistant for crop monitoring, weed detection, disease diagnosis, and yield prediction.',
    language: 'Python',
    stars: 15,
    forks: 3,
    topics: ['AI', 'Computer Vision', 'Agriculture', 'TensorFlow', 'YOLO'],
    url: 'https://github.com/prannavakanth/cropcore',
    featured: true,
  },
  {
    id: 'gh-2',
    repo_name: 'careertrack',
    description: 'AI-powered career platform with resume analysis, mock interviews, and portfolio generation using LangChain.',
    language: 'Python',
    stars: 8,
    forks: 2,
    topics: ['AI', 'LangChain', 'Career', 'LLM', 'FastAPI'],
    url: 'https://github.com/prannavakanth/careertrack',
    featured: true,
  },
  {
    id: 'gh-3',
    repo_name: 'autcore',
    description: 'AI-driven autism screening tool using computer vision and speech analysis.',
    language: 'Python',
    stars: 12,
    forks: 2,
    topics: ['AI', 'Healthcare', 'Computer Vision', 'Speech Analysis', 'MediaPipe'],
    url: 'https://github.com/prannavakanth/autcore',
    featured: true,
  },
  {
    id: 'gh-4',
    repo_name: 'kred',
    description: 'AI-powered financial intelligence platform for financial behavior analysis and spending insights.',
    language: 'Python',
    stars: 10,
    forks: 1,
    topics: ['AI', 'Fintech', 'LangChain', 'FastAPI', 'React'],
    url: 'https://github.com/prannavakanth/kred',
    featured: true,
  },
  {
    id: 'gh-5',
    repo_name: 'discageai',
    description: 'Multimodal spinal degeneration assessment framework combining MRI and biomechanical sensing.',
    language: 'Python',
    stars: 5,
    forks: 1,
    topics: ['AI', 'Healthcare', 'Medical Imaging', 'Multimodal', 'PyTorch'],
    url: 'https://github.com/prannavakanth/discageai',
    featured: false,
  },
  {
    id: 'gh-6',
    repo_name: 'pacdi',
    description: 'Plant-adaptive greenhouse optimization system with stress-aware climate control.',
    language: 'Python',
    stars: 3,
    forks: 0,
    topics: ['IoT', 'Agriculture', 'ESP32', 'Climate Control', 'Sensor Fusion'],
    url: 'https://github.com/prannavakanth/pacdi',
    featured: false,
  },
  {
    id: 'gh-7',
    repo_name: 'ssl-rul',
    description: 'Self-supervised LSTM framework for predictive maintenance using masked reconstruction learning.',
    language: 'Python',
    stars: 4,
    forks: 0,
    topics: ['AI', 'Predictive Maintenance', 'Self-Supervised', 'LSTM', 'PyTorch'],
    url: 'https://github.com/prannavakanth/ssl-rul',
    featured: false,
  },
]
