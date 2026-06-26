import type { IntelReport } from '../types/portfolio'

export const intelReports: IntelReport[] = [
  {
    id: 'intel-1',
    title: 'SSL-RUL: Self-Supervised Predictive Maintenance Framework',
    category: 'Research Paper',
    date: '2026-06-22',
    classification: 'UNCLASSIFIED',
    summary: 'Developed a self-supervised LSTM framework using masked reconstruction learning for predictive maintenance. Achieved 48.6% RMSE improvement on C-MAPSS with reduced labeled data.',
    highlights: [
      'Self-supervised LSTM with masked reconstruction learning',
      '48.6% RMSE improvement on C-MAPSS benchmark',
      'Reduced labeled data requirements significantly',
      'Paper under review at international venue',
    ],
    type: 'Research Paper',
    status: 'Under Review',
  },
]
