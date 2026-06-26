export interface LeadershipEntry {
  id: string
  position: string
  organization: string
  location: string
  date_started: string
  date_ended: string
  current: boolean
  responsibilities: string[]
}

export const leadershipData: LeadershipEntry[] = [
  {
    id: 'lead-1',
    position: 'Chairperson',
    organization: 'Open Source Programming Club (OSPC), VIT Chennai',
    location: 'Chennai, India',
    date_started: '2025-01',
    date_ended: '2026-12',
    current: true,
    responsibilities: [
      'Led OSPC as Chairperson, guiding the club to win Best Technical Club Award at VIT Chennai',
      'Organized technical events and workshops',
      'Managed club operations and member engagement',
    ],
  },
  {
    id: 'lead-2',
    position: 'Data Science Lead',
    organization: 'IEEE Robotics and Automation Society, VIT Chennai',
    location: 'Chennai, India',
    date_started: '2026-01',
    date_ended: '2027-12',
    current: true,
    responsibilities: [
      'Leading AI/ML initiatives and mentoring members',
      'Organizing technical workshops on ML and robotics',
    ],
  },
  {
    id: 'lead-3',
    position: 'Member Secretary',
    organization: 'Student Council, VIT Chennai',
    location: 'Chennai, India',
    date_started: '2026-01',
    date_ended: '2027-12',
    current: true,
    responsibilities: [
      'Representing students and coordinating institutional initiatives',
      'Managing student council operations',
    ],
  },
  {
    id: 'lead-4',
    position: 'Sports Secretary',
    organization: 'P. S. Senior Secondary School',
    location: 'Chennai, India',
    date_started: '2022-01',
    date_ended: '2023-12',
    current: false,
    responsibilities: [
      'Led school sports activities',
      'Represented the institution as a cricketer and athlete',
    ],
  },
]
