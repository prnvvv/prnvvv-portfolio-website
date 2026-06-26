export interface EducationEntry {
  id: string
  degree: string
  institution: string
  location: string
  duration: string
  score: string
  highlights: string[]
}

export const educationData: EducationEntry[] = [
  {
    id: 'edu-1',
    degree: 'Bachelor of Technology in Computer Science & Engineering',
    institution: 'Vellore Institute of Technology (VIT)',
    location: 'Chennai',
    duration: '2023-2027',
    score: '9.06/10 CGPA',
    highlights: [
      'Active in technical clubs and hackathons',
      'Research focus on AI/ML and healthcare',
      'Published multiple patents and research papers',
    ],
  },
  {
    id: 'edu-2',
    degree: 'Higher Secondary Education (Class XII)',
    institution: 'P. S. Senior Secondary School',
    location: 'Chennai',
    duration: '2023',
    score: '97.2%',
    highlights: [
      'Science Group Topper - 486/500',
      'Subject Topper in Chemistry, Computer Science, Physical Education',
      'Sports Secretary',
    ],
  },
  {
    id: 'edu-3',
    degree: 'Secondary Education (Class X)',
    institution: 'P. S. Senior Secondary School',
    location: 'Chennai',
    duration: '2021',
    score: '91.8%',
    highlights: [
      'TNCA Under-16 Cricketer',
      'TNCA Under-14 Cricketer',
    ],
  },
]
