type ProjectStatus =
  | 'PATENT PUBLISHED'
  | 'PATENT FILED'
  | 'UNDER REVIEW'
  | 'DEPLOYED'
  | 'ACTIVE'
  | 'PUBLISHED'
  | 'COMPLETED'

type ProjectCategory =
  | 'AI/ML'
  | 'RAG/LLM'
  | 'FULL-STACK'
  | 'RESEARCH'
  | 'IoT'
  | 'COMPUTER VISION'
  | 'DATA SCIENCE'
  | 'PACKAGE'

export interface Project {
  id: string
  codename: string
  number: string
  title: string
  shortDescription: string
  fullDescription: string
  status: ProjectStatus
  category: ProjectCategory
  technologies: string[]
  displayTechCount: number
  icon: string
  githubUrl?: string
  liveUrl?: string
  paperUrl?: string
  patentUrl?: string
  award?: string
  achievements?: string[]
  linkedinPosts?: string[]
  featured: boolean
  featuredOrder: number
  year: string
  collaborators?: string
}

const PROJECTS: Project[] = [
  {
    id: 'CROPCORE-001',
    codename: 'CROPCORE',
    number: '001',
    title: 'CropCore — AI Agricultural Intelligence Platform',
    shortDescription:
      'An AI-powered smart farming assistant using ML and computer vision for crop monitoring, weed detection, disease diagnosis, and yield prediction with IoT sensor integration for real-time irrigation optimization.',
    fullDescription:
      'CropCore is an AI-powered smart farming assistant developed during Pitchathon 2024 by Team Cache Me. It equips farmers with technology by offering real-time sensor data (temperature, humidity, moisture, NPK), live market price tracking, AI-powered weed detection (YOLOv8), advanced disease detection (CNN), automated smart irrigation, and a community platform. The solution is designed to boost agricultural productivity and profitability by making modern technology accessible to farmers. The system has been patented under the Indian Patent Office (Application No: 202541067987).',
    status: 'PATENT PUBLISHED',
    category: 'IoT',
    technologies: ['Python', 'TensorFlow', 'OpenCV', 'YOLO', 'Scikit-learn', 'BeautifulSoup', 'Django', 'Node.js', 'React Native', 'ESP32'],
    displayTechCount: 5,
    icon: 'cropcore',
    githubUrl: 'https://github.com/mithilgirish/Crop-Core_Tech',
    liveUrl: 'https://www.youtube.com/watch?v=epArLGBhgOM',
    patentUrl: 'https://www.linkedin.com/posts/prannavakhanth_patentpublished-innovation-agritech-activity-7359997879962267649-hSF4/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEZEZMcBwRsKnHgEdxB_PuRESArMim5AhW4',
    award: "Special Recognition - Pitchathon'24",
    achievements: [
      "Special Recognition - Pitchathon'24",
      "Patent Published - Indian Patent Office (202541067987)"
    ],
    linkedinPosts: [
      "https://www.linkedin.com/posts/prannavakhanth_we-are-excited-to-announce-that-our-team-activity-7247571240280829952-Xf-5?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEZEZMcBwRsKnHgEdxB_PuRESArMim5AhW4"
    ],
    featured: true,
    featuredOrder: 1,
    year: '2024',
  },
  {
    id: 'POLARIS-010',
    codename: 'POLARIS',
    number: '010',
    title: 'POLARIS — Universal Agentic RAG Chatbot',
    shortDescription:
      'A production-grade multimodal RAG agent built with LangGraph and Groq, featuring multi-query retrieval, confidence scoring, context compression, and citation-aware answering across enterprise document corpora.',
    fullDescription:
      'POLARIS is a universal-grade agentic RAG system built on LangGraph orchestration with Groq inference for sub-second response times. Implements multi-query rewriting, semantic chunking, MMR-based retrieval, and structured citation generation. Features a nine-panel Streamlit dashboard with conversational memory, query analytics, and confidence visualization. ChromaDB vector store with hybrid BM25+dense retrieval. Supports PDF, DOCX, URL, and image ingestion via multimodal pipeline.',
    status: 'COMPLETED',
    category: 'RAG/LLM',
    technologies: ['Python', 'LangGraph', 'ChromaDB', 'Groq', 'LangChain', 'Streamlit', 'FastAPI', 'FAISS'],
    displayTechCount: 5,
    icon: 'polaris',
    githubUrl: '',
    award: undefined,
    featured: false,
    featuredOrder: 10,
    year: '2025',
  },
  {
    id: 'KRED-004',
    codename: 'KRED',
    number: '004',
    title: 'KRED — Financial Intelligence Platform',
    shortDescription:
      'An AI-powered financial intelligence platform that analyzes financial behavior, provides long-term spending forecasts, and generates personalized advisory using LangChain agentic workflows.',
    fullDescription:
      'KRED is a full-stack financial intelligence system that ingests transaction history to build behavioral spending profiles, detect anomalies, and generate LLM-powered financial recommendations. Features a real-time dashboard with ML-based credit risk scoring, peer comparison analytics, and agentic advisory workflows via LangChain. Winner of Vashisht National Hackathon 2024. Backend built on FastAPI with PostgreSQL and vector-based memory for persistent user context.',
    status: 'COMPLETED',
    category: 'FULL-STACK',
    technologies: ['Python', 'LangChain', 'FastAPI', 'PostgreSQL', 'React', 'Scikit-learn', 'Pandas'],
    displayTechCount: 4,
    icon: 'kred',
    githubUrl: '',
    award: "Vashisht National Hackathon Winner",
    featured: false,
    featuredOrder: 4,
    year: '2024',
  },
  {
    id: 'AUTCORE-003',
    codename: 'AUTCORE',
    number: '003',
    title: 'AutCore — Multimodal Autism Screening Tool',
    shortDescription:
      'A multimodal AI screening tool for early autism detection using computer vision for gaze tracking and speech analysis, achieving clinical-grade sensitivity on benchmark datasets.',
    fullDescription:
      'AutCore is a non-invasive autism spectrum disorder screening system combining gaze-tracking (MediaPipe), speech prosody analysis, and behavioral pattern recognition into a unified multimodal diagnostic pipeline. Trained on the ADOS-2 aligned dataset, achieving 91.4% sensitivity and 87.2% specificity. Features a clinician-facing dashboard for session recording and longitudinal tracking. Winner of HackHub 2025 national competition. Designed for deployment in resource-constrained clinical settings.',
    status: 'UNDER REVIEW',
    category: 'COMPUTER VISION',
    technologies: ['Python', 'TensorFlow', 'OpenCV', 'MediaPipe', 'LibROSA', 'FastAPI', 'React'],
    displayTechCount: 4,
    icon: 'autcore',
    githubUrl: '',
    award: "HackHub'25 National Winner",
    featured: true,
    featuredOrder: 3,
    year: '2025',
  },
  {
    id: 'GIL-011',
    codename: 'GIL',
    number: '011',
    title: 'GIL — Geometric Information Learner',
    shortDescription:
      'A novel PyPI-published ML Python package combining Fisher Information Geometry, Riemannian manifold tracking, and Information Bottleneck methods for robust tabular data learning.',
    fullDescription:
      'GIL (Geometric Information Learner) is a published Python ML package that applies information geometry principles to tabular learning. Implements Riemannian manifold-aware gradient descent, Fisher information matrix regularization, and Information Bottleneck imputation for missing data. Offers a scikit-learn compatible API for drop-in integration. Includes comprehensive test suite, CI/CD pipeline via GitHub Actions, and pre-commit hooks. Addresses fundamental geometric structure of data distributions that standard Euclidean-space models ignore.',
    status: 'COMPLETED',
    category: 'RESEARCH',
    technologies: ['Python', 'NumPy', 'SciPy', 'Scikit-learn', 'PyPI', 'pytest', 'GitHub Actions'],
    displayTechCount: 4,
    icon: 'gil',
    githubUrl: '',
    award: undefined,
    featured: false,
    featuredOrder: 11,
    year: '2025',
  },
  {
    id: 'SSLRUL-008',
    codename: 'SSLRUL',
    number: '008',
    title: 'SSL-RUL — Self-Supervised Predictive Maintenance',
    shortDescription:
      'A self-supervised LSTM framework using masked reconstruction learning for predictive maintenance, achieving significant improvements on C-MAPSS benchmark datasets with minimal labeled data.',
    fullDescription:
      'SSL-RUL introduces a self-supervised pretraining strategy for Remaining Useful Life (RUL) prediction in industrial machinery. The model uses masked sensor reconstruction as a pretext task, followed by fine-tuning on minimal labeled degradation data. Evaluated on NASA C-MAPSS FD001-FD004 datasets with state-of-the-art RMSE and Score metrics. Currently under review at Results in Engineering (Elsevier). Developed in collaboration with researchers at VIT Chennai CSE department.',
    status: 'UNDER REVIEW',
    category: 'RESEARCH',
    technologies: ['Python', 'PyTorch', 'LSTM', 'Self-Supervised Learning', 'Pandas', 'Matplotlib'],
    displayTechCount: 4,
    icon: 'sslrul',
    githubUrl: '',
    award: undefined,
    featured: false,
    featuredOrder: 8,
    year: '2025',
    collaborators: 'VIT Chennai CSE',
  },
  {
    id: 'DISCAGEAI-005',
    codename: 'DISCAGEAI',
    number: '005',
    title: 'DiscAgeAI — Spinal Degeneration Assessment',
    shortDescription:
      'A multimodal framework combining spinal MRI and biomechanical sensing to assess spinal degeneration and predict age-related spinal conditions with high accuracy.',
    fullDescription:
      'DiscAgeAI combines 3D CNN volumetric analysis of lumbar MRI scans with biomechanical metadata regression to predict intervertebral disc biological age and degeneration grade. Implements a ResNet-SE multi-task architecture with amplitude-aware training, test-time augmentation, and 5-fold ensemble scoring. Features a LangChain/Groq clinical narrative layer that generates structured radiological reports. Patent filed under Indian Patent Office. Dataset: private clinical collaboration with orthopaedic research partners.',
    status: 'PATENT FILED',
    category: 'COMPUTER VISION',
    technologies: ['Python', 'PyTorch', 'OpenCV', 'NumPy', 'Matplotlib', 'LangChain', 'Groq'],
    displayTechCount: 4,
    icon: 'discageai',
    githubUrl: '',
    award: undefined,
    featured: true,
    featuredOrder: 5,
    year: '2025',
  },
  {
    id: 'PACDI-006',
    codename: 'PACDI',
    number: '006',
    title: 'PACDI — Adaptive Greenhouse Intelligence',
    shortDescription:
      'An adaptive greenhouse system with stress-aware climate control and IoT automation using ESP32-S3 for real-time crop optimization and environmental regulation.',
    fullDescription:
      'PACDI (Precision Adaptive Climate and Dosage Intelligence) is an IoT greenhouse management system with ML-driven climate optimization. Deploys stress detection models on ESP32-S3 edge nodes to monitor CO2, humidity, light, and soil conductivity. Integrates LLM-powered agronomic recommendations via MQTT-triggered advisory pipelines. Patent filed. Developed for deployment in controlled agricultural environments with sub-5% deviation from optimal growth parameter ranges.',
    status: 'PATENT FILED',
    category: 'IoT',
    technologies: ['Python', 'TensorFlow', 'ESP32-S3', 'MQTT', 'FastAPI', 'React', 'SQLite'],
    displayTechCount: 4,
    icon: 'pacdi',
    githubUrl: '',
    award: undefined,
    featured: false,
    featuredOrder: 6,
    year: '2024',
  },

  {
    id: 'CAREERTRACK-002',
    codename: 'CAREERTRACK',
    number: '002',
    title: 'CareerTrack — AI Career Intelligence Platform',
    shortDescription:
      'An AI-powered career platform providing resume analysis, mock interviews, and portfolio generation using LangChain LLM workflows and multi-agent orchestration.',
    fullDescription:
      'CareerTrack is a full-stack AI career coaching system that ingests a user\'s resume, GitHub profile, and job description to generate personalized gap analysis, mock interview question banks, and ATS-optimized resume rewrites. Features a LangChain multi-agent orchestration layer for specialized subagents (resume agent, interview agent, portfolio agent). React frontend with FastAPI backend. Designed for students and early-career engineers.',
    status: 'DEPLOYED',
    category: 'RAG/LLM',
    technologies: ['Python', 'LangChain', 'LangGraph', 'React', 'FastAPI', 'ChromaDB', 'OpenAI'],
    displayTechCount: 4,
    icon: 'careertrack',
    githubUrl: '',
    award: undefined,
    featured: true,
    featuredOrder: 2,
    year: '2024',
  },
  {
    id: 'PKSTRUCT-009',
    codename: 'PKSTRUCT',
    number: '009',
    title: 'PKStruct — Python DSA Package (PyPI)',
    shortDescription:
      'A production-grade Python data structures package published on PyPI featuring 20+ reusable implementations with shared protocols, thread-safe variants, and comprehensive test suites.',
    fullDescription:
      'PKStruct is a PyPI-published Python package providing 20+ production-grade data structure implementations including thread-safe linked lists, stacks, queues, trees, heaps, and graphs. Implements shared exception hierarchy, typing protocols, abstract base classes, and validator modules. Full test suite with 95%+ coverage, CI/CD via GitHub Actions, and pre-commit hook integration. Designed as a reference implementation package for competitive programming and production systems.',
    status: 'PUBLISHED',
    category: 'PACKAGE',
    technologies: ['Python', 'PyPI', 'pytest', 'GitHub Actions', 'pre-commit', 'mypy'],
    displayTechCount: 4,
    icon: 'pkstruct',
    githubUrl: '',
    award: undefined,
    featured: true,
    featuredOrder: 9,
    year: '2025',
  },
  {
    id: 'DIAGENC-007',
    codename: 'DIAGENC',
    number: '007',
    title: 'DiagEnc — Medical Image Encryption System',
    shortDescription:
      'A diagnosis-aware encryption system using fracture detection and selective protection of medical images with AES-RSA lossless encryption for HIPAA-compliant storage.',
    fullDescription:
      'DiagEnc is a medical image security system that performs CNN-based fracture detection to identify diagnostically critical regions, then applies selective AES-256 encryption to those regions while maintaining lossless image quality. RSA-2048 handles key exchange. Preserves DICOM metadata integrity. Patent filed. Designed for hospital PACS integration with radiologist workflow in mind. Outperforms uniform encryption schemes in both security and computational overhead.',
    status: 'PATENT FILED',
    category: 'COMPUTER VISION',
    technologies: ['Python', 'PyTorch', 'AES-RSA Encryption', 'Computer Vision', 'DICOM', 'OpenCV'],
    displayTechCount: 4,
    icon: 'diagenc',
    githubUrl: '',
    award: undefined,
    featured: false,
    featuredOrder: 7,
    year: '2024',
  },
  {
    id: 'CMS-012',
    codename: 'CMS',
    number: '012',
    title: 'CMS Price Transparency Platform',
    shortDescription:
      'A full-stack hospital data platform ingesting CMS price transparency files to enable standardized cost comparison across procedures, insurers, and healthcare facilities.',
    fullDescription:
      'The CMS Price Transparency Platform ingests machine-readable hospital price files mandated by the US Centers for Medicare & Medicaid Services (2021 rule) and transforms them into a searchable, filterable analytics interface. Features ETL pipeline handling multi-gigabyte CSV/JSON files, PostgreSQL storage with indexed procedure codes, and a React-based cost comparison dashboard. Enables patients and researchers to compare insurer-negotiated rates across facilities and procedure types.',
    status: 'COMPLETED',
    category: 'FULL-STACK',
    technologies: ['Python', 'PostgreSQL', 'React', 'FastAPI', 'Pandas', 'Docker', 'TypeScript'],
    displayTechCount: 4,
    icon: 'cms',
    githubUrl: '',
    award: undefined,
    featured: false,
    featuredOrder: 12,
    year: '2025',
  },
  {
    id: 'SYNTHETIC-013',
    codename: 'SYNTHETIC',
    number: '013',
    title: 'Synthetic Taphonomic Deformation — Paleontological AI',
    shortDescription:
      'A scientific AI pipeline generating 2D orthographic projections from 3D CT fossil scans to train deep learning models for estimating taphonomic distortion in paleontological specimens.',
    fullDescription:
      'This research pipeline processes 3D CT slice stacks of fossil specimens (8 specimens x 30 projections = 240 images per specimen) via orthographic maximum intensity projection (MIP) and rotational view generation. Outputs are used to train a deep learning Taphonomic Distortion Estimator that predicts morphological deformation caused by sedimentary burial. Implemented with ASCII-safe encoding for cross-platform Windows/Linux compatibility. Collaborative paleontological research project at VIT Chennai.',
    status: 'UNDER REVIEW',
    category: 'RESEARCH',
    technologies: ['Python', 'NumPy', 'SciPy', 'Matplotlib', 'PyTorch', 'SimpleITK', 'VTK'],
    displayTechCount: 4,
    icon: 'synthetic',
    githubUrl: '',
    award: undefined,
    featured: false,
    featuredOrder: 13,
    year: '2025',
    collaborators: 'VIT Chennai Paleontology Lab',
  },
]

export const ALL_PROJECTS = PROJECTS.sort((a, b) => a.featuredOrder - b.featuredOrder)
