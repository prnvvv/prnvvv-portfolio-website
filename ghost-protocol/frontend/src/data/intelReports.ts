import type { IntelReport } from '../types/portfolio'

export const intelReports: IntelReport[] = [
  {
    id: 'intel-1',
    title: 'RAG Pipeline Performance Analysis',
    category: 'AI/ML Research',
    date: '2026-01-15',
    classification: 'TOP SECRET',
    summary: 'Evaluation of multi-stage retrieval pipeline using ChromaDB with hybrid search, cross-encoder reranking, and Claude Sonnet 4 integration for context-aware portfolio Q&A.',
    highlights: [
      'Hybrid search (dense + sparse) improved recall by 34% over dense-only',
      'Cross-encoder reranking boosted precision from 0.72 to 0.91',
      'End-to-end latency under 2.5s for complex multi-hop queries',
      'Chunk size of 512 tokens with 128-token overlap yielded optimal results',
    ],
  },
  {
    id: 'intel-2',
    title: 'Frontend Performance Optimization',
    category: 'Web Engineering',
    date: '2026-01-10',
    classification: 'SECRET',
    summary: 'Analysis of frontend performance metrics and optimization strategies for the Command Center dashboard, focusing on initial load time, animation performance, and memory management.',
    highlights: [
      'Bundle size reduced to 89KB (gzip) through code splitting and dynamic imports',
      'Framer motion animations maintain 60fps with 60 simultaneous particles',
      'CSS-based CRT effects eliminated GPU compositing layer overhead',
      'Lighthouse performance score: 96/100',
    ],
  },
  {
    id: 'intel-3',
    title: 'Vector Database Benchmarking Report',
    category: 'AI/ML Infrastructure',
    date: '2025-12-20',
    classification: 'TOP SECRET',
    summary: 'Comparative benchmark of ChromaDB, Pinecone, and Qdrant for portfolio RAG use case. Evaluated on query latency, recall accuracy, and resource utilization.',
    highlights: [
      'ChromaDB: 45ms avg query time, 0.89 recall@10',
      'Pinecone: 38ms avg query time, 0.91 recall@10',
      'Qdrant: 42ms avg query time, 0.90 recall@10',
      'ChromaDB selected for zero-cost self-hosting and local data sovereignty',
    ],
  },
  {
    id: 'intel-4',
    title: 'AI Chat System Architecture',
    category: 'Systems Design',
    date: '2025-11-08',
    classification: 'TOP SECRET',
    summary: 'Architecture document for the Command Intelligence chat system, detailing the integration between React frontend, Anthropic API, and RAG pipeline for contextual portfolio interactions.',
    highlights: [
      'Server-sent events (SSE) streaming for real-time token-by-token output',
      'Conversation history managed via Zustand store with 50-message window',
      'RAG context injection window optimized to 3 retrieved chunks per query',
      'Fallback to general knowledge when portfolio context insufficient',
    ],
  },
  {
    id: 'intel-5',
    title: 'Accessibility & Compliance Audit',
    category: 'Quality Assurance',
    date: '2025-10-15',
    classification: 'CONFIDENTIAL',
    summary: 'Initial accessibility audit identifying contrast ratio issues with the military green-on-dark theme and recommendations for WCAG 2.1 AA compliance.',
    highlights: [
      'Color contrast ratio of 4.8:1 for primary text (meets AA for large text only)',
      'Recommended adding aria-labels to all interactive elements',
      'Keyboard navigation flow identified through all 6 sections',
      'Screen reader testing pending for full compliance verification',
    ],
  },
]
