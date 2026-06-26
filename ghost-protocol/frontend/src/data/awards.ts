export interface AwardEntry {
  id: string
  name: string
  awarding_body: string
  date_received: string
  category: 'Hackathon' | 'Academic' | 'Sports' | 'Leadership' | 'Competition'
  description: string
  project?: string
}

export const awardsData: AwardEntry[] = [
  {
    id: 'award-1',
    name: '1st Place - AnnamAI Hackathon',
    awarding_body: 'IIT Ropar',
    date_received: '2025-01',
    category: 'Hackathon',
    description: 'Won 1st place for AI-driven innovation and research solutions at AnnamAI Hackathon, IIT Ropar.',
    project: 'AI-driven Research Solutions',
  },
  {
    id: 'award-2',
    name: '1st Place - HackHub\'25',
    awarding_body: 'IEEE & GitHub',
    date_received: '2025-01',
    category: 'Hackathon',
    description: 'Won 1st place for developing an AI-based autism screening system at HackHub\'25.',
    project: 'AutCore - AI-driven Autism Screening Tool',
  },
  {
    id: 'award-3',
    name: '1st Place - Vashisht 3.0',
    awarding_body: 'IIITDM Kancheepuram',
    date_received: '2026-01',
    category: 'Hackathon',
    description: 'Won 1st place for building an AI-powered financial intelligence platform at Vashisht 3.0.',
    project: 'KRED - AI-powered Financial Intelligence Platform',
  },
  {
    id: 'award-4',
    name: 'Special Recognition - Pitchathon\'24',
    awarding_body: 'Pitchathon',
    date_received: '2024-01',
    category: 'Competition',
    description: 'Received special recognition for CropCore, an AI-powered smart farming assistant.',
    project: 'CropCore - AI-powered Smart Farming Assistant',
  },
  {
    id: 'award-5',
    name: 'School Topper - Science Group',
    awarding_body: 'P. S. Senior Secondary School',
    date_received: '2023-01',
    category: 'Academic',
    description: 'Science Group topper with a board examination score of 486/500.',
  },
  {
    id: 'award-6',
    name: 'Subject Topper - Chemistry',
    awarding_body: 'P. S. Senior Secondary School',
    date_received: '2023-01',
    category: 'Academic',
    description: 'Secured highest marks in Chemistry.',
  },
  {
    id: 'award-7',
    name: 'Subject Topper - Computer Science',
    awarding_body: 'P. S. Senior Secondary School',
    date_received: '2023-01',
    category: 'Academic',
    description: 'Secured highest marks in Computer Science.',
  },
  {
    id: 'award-8',
    name: 'Subject Topper - Physical Education',
    awarding_body: 'P. S. Senior Secondary School',
    date_received: '2023-01',
    category: 'Academic',
    description: 'Secured highest marks in Physical Education.',
  },
  {
    id: 'award-9',
    name: 'TNCA Under-16 Cricketer',
    awarding_body: 'Tamil Nadu Cricket Association',
    date_received: '2020-01',
    category: 'Sports',
    description: 'Represented Tamil Nadu Cricket Association in competitive cricket tournaments at under-16 level.',
  },
  {
    id: 'award-10',
    name: 'TNCA Under-14 Cricketer',
    awarding_body: 'Tamil Nadu Cricket Association',
    date_received: '2018-01',
    category: 'Sports',
    description: 'Represented Tamil Nadu Cricket Association at the junior state level under-14.',
  },
  {
    id: 'award-11',
    name: 'Best Technical Club Award',
    awarding_body: 'VIT Chennai',
    date_received: '2026-01',
    category: 'Leadership',
    description: 'Guided OSPC to win the Best Technical Club Award at VIT Chennai.',
  },
]
