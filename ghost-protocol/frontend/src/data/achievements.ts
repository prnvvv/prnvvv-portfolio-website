export interface AchievementStats {
  value: string
  label: string
  sublabel?: string
  icon: string
}

export interface AchievementEntry {
  id: string
  category: string
  title: string
  subtitle: string
  result: string
  resultColor: string
  icon: string
}

export const achievementsData = {
  stats: [
    { value: '3', label: 'HACKATHON WINS', icon: 'Trophy' },
    { value: '4', label: 'RESEARCH IP', sublabel: '1 Published · 3 Filed', icon: 'FileText' },
    { value: '2', label: 'PAPERS UNDER REVIEW', icon: 'BookOpen' },
    { value: '4', label: 'SCHOOL AWARDS', sublabel: 'Topper Titles', icon: 'Star' },
  ],
  entries: [
    {
      id: 'ACH-001',
      category: 'COMBAT',
      title: 'AnnamAI Hackathon',
      subtitle: 'IIT Ropar',
      result: 'WINNER',
      resultColor: '#00e67a',
      icon: 'Trophy',
    },
    {
      id: 'ACH-002',
      category: 'COMBAT',
      title: "HackHub'25",
      subtitle: 'National Hackathon',
      result: 'WINNER',
      resultColor: '#00e67a',
      icon: 'Trophy',
    },
    {
      id: 'ACH-003',
      category: 'COMBAT',
      title: 'Vashisht 3.0',
      subtitle: 'National Hackathon',
      result: 'WINNER',
      resultColor: '#00e67a',
      icon: 'Trophy',
    },
    {
      id: 'ACH-004',
      category: 'RECOGNITION',
      title: "Pitchathon'24",
      subtitle: 'Special Recognition',
      result: 'RECOGNISED',
      resultColor: '#00e67a',
      icon: 'Award',
    },
    {
      id: 'ACH-005',
      category: 'ACADEMIC',
      title: 'School Topper',
      subtitle: 'Science Group — 486/500',
      result: '486 / 500',
      resultColor: '#00e67a',
      icon: 'Star',
    },
    {
      id: 'ACH-006',
      category: 'ACADEMIC',
      title: 'Subject Topper',
      subtitle: 'Chemistry · Computer Science · Physical Education',
      result: '3 SUBJECTS',
      resultColor: '#00e67a',
      icon: 'Star',
    },
    {
      id: 'ACH-007',
      category: 'ATHLETICS',
      title: 'TNCA Cricketer',
      subtitle: 'Under-16 & Under-14 State Selection',
      result: 'STATE LEVEL',
      resultColor: '#00e67a',
      icon: 'Activity',
    },
    {
      id: 'ACH-008',
      category: 'RESEARCH',
      title: 'Research IP Portfolio',
      subtitle: '1 Patent Published · 3 Patents Filed · 2 Papers Under Review',
      result: '6 ITEMS',
      resultColor: '#00e67a',
      icon: 'FileText',
    },
  ],
}
