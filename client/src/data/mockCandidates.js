export const mockCandidates = [
  {
    id: 'cand_1',
    userId: 'usr_1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    headline: 'Senior Full Stack MERN & AI Developer',
    location: 'San Francisco, CA (Remote)',
    phone: '+1 (555) 019-2834',
    overallScore: 88,
    scores: {
      technical: 91,
      behavioural: 78,
      jobMatch: 89,
      experience: 82,
      interview: 86,
      resume: 92
    },
    radarMetrics: [
      { metric: 'Tech Depth', value: 91 },
      { metric: 'Architecture', value: 85 },
      { metric: 'Problem Solving', value: 88 },
      { metric: 'Communication', value: 78 },
      { metric: 'Leadership', value: 75 },
      { metric: 'Code Quality', value: 92 }
    ],
    skills: [
      { name: 'React.js', level: 'Expert', years: 5, category: 'Frontend', confidence: 95 },
      { name: 'Node.js', level: 'Expert', years: 5, category: 'Backend', confidence: 92 },
      { name: 'TypeScript', level: 'Advanced', years: 3, category: 'Frontend', confidence: 88 },
      { name: 'MongoDB', level: 'Advanced', years: 4, category: 'Database', confidence: 85 },
      { name: 'Python / AI', level: 'Intermediate', years: 2, category: 'AI/ML', confidence: 78 },
      { name: 'Docker / CI-CD', level: 'Intermediate', years: 2, category: 'DevOps', confidence: 75 }
    ],
    experiences: [
      {
        id: 'exp_1',
        title: 'Senior MERN Developer',
        company: 'CloudScale Inc.',
        period: '2023 - Present',
        description: 'Architected real-time microservices handling 2M daily requests. Led frontend performance optimization reducing bundle size by 42%.'
      },
      {
        id: 'exp_2',
        title: 'Full Stack Engineer',
        company: 'Apex Software',
        period: '2021 - 2023',
        description: 'Built scalable RESTful APIs with Node.js and MongoDB. Created responsive React dashboards for enterprise client analytics.'
      }
    ],
    education: [
      {
        id: 'edu_1',
        degree: 'B.S. in Computer Science',
        institution: 'University of California, Berkeley',
        year: '2021',
        gpa: '3.8 / 4.0'
      }
    ],
    projects: [
      {
        id: 'proj_1',
        name: 'AI Candidate Intelligence Engine',
        tech: 'React, Node, Gemini API, Tailwind',
        url: 'https://github.com/example/candidate-iq',
        description: 'Multi-tenant applicant tracking system with LLM resume parsing & automated candidate-job scoring.'
      }
    ],
    certifications: [
      { id: 'cert_1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2024' },
      { id: 'cert_2', name: 'Meta Senior Front-End Developer', issuer: 'Meta', year: '2023' }
    ],
    resumeDetails: {
      parsedDate: '2026-09-01',
      filename: 'Alex_Johnson_Resume_2026.pdf',
      completeness: '96%',
      extractedSkillsCount: 14,
      keyStrengths: [
        'Demonstrates deep expertise in modern React component architecture & hooks state patterns.',
        'Proven full-stack API optimization & database indexing track record.',
        'High mock interview response clarity and structured problem formulation.'
      ],
      improvementAreas: [
        'Expand Docker/Kubernetes container orchestration evidence.',
        'Include quantitative load testing metrics in past experience descriptions.'
      ]
    }
  },
  {
    id: 'cand_2',
    userId: 'usr_3',
    name: 'John Doe',
    email: 'john@example.com',
    headline: 'AI Systems Engineer & Full Stack Lead',
    location: 'Austin, TX (Hybrid)',
    phone: '+1 (555) 432-8765',
    overallScore: 89,
    scores: {
      technical: 92,
      behavioural: 81,
      jobMatch: 94,
      experience: 80,
      interview: 90,
      resume: 88
    },
    radarMetrics: [
      { metric: 'Tech Depth', value: 94 },
      { metric: 'Architecture', value: 90 },
      { metric: 'Problem Solving', value: 92 },
      { metric: 'Communication', value: 81 },
      { metric: 'Leadership', value: 79 },
      { metric: 'Code Quality', value: 90 }
    ],
    skills: [
      { name: 'Python', level: 'Expert', years: 6, category: 'AI/ML', confidence: 96 },
      { name: 'React.js', level: 'Advanced', years: 4, category: 'Frontend', confidence: 89 },
      { name: 'TensorFlow', level: 'Advanced', years: 3, category: 'AI/ML', confidence: 85 },
      { name: 'Node.js', level: 'Advanced', years: 4, category: 'Backend', confidence: 87 }
    ],
    experiences: [
      {
        id: 'exp_3',
        title: 'Lead AI Engineer',
        company: 'NeuroTech Labs',
        period: '2022 - Present',
        description: 'Designed LLM RAG pipelines and custom embedding search engine using Vector DBs.'
      }
    ],
    education: [
      { id: 'edu_2', degree: 'M.S. in Artificial Intelligence', institution: 'UT Austin', year: '2022', gpa: '3.9' }
    ],
    projects: [
      { id: 'proj_2', name: 'Neural Code Reviewer', tech: 'Python, PyTorch, FastAPI', url: 'https://github.com/example/neural-code', description: 'Automated syntax & semantic bug detection using fine-tuned LLaMA model.' }
    ],
    certifications: [
      { id: 'cert_3', name: 'Google Professional Machine Learning Engineer', issuer: 'Google Cloud', year: '2023' }
    ],
    resumeDetails: {
      parsedDate: '2026-08-28',
      filename: 'John_Doe_AI_Engineer.pdf',
      completeness: '94%',
      extractedSkillsCount: 16,
      keyStrengths: [
        'Top candidate for AI/ML engineering requisitions.',
        'High natural language reasoning capabilities in mock interview analytics.'
      ],
      improvementAreas: [
        'Enhance client-side state caching strategies in React workflows.'
      ]
    }
  },
  {
    id: 'cand_3',
    userId: 'usr_4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    headline: 'Senior Backend Systems & Cloud Engineer',
    location: 'Seattle, WA (On-site)',
    phone: '+1 (555) 789-0123',
    overallScore: 83,
    scores: {
      technical: 81,
      behavioural: 89,
      jobMatch: 79,
      experience: 84,
      interview: 82,
      resume: 85
    },
    skills: [
      { name: 'Java / Spring', level: 'Expert', years: 6, category: 'Backend', confidence: 94 },
      { name: 'PostgreSQL', level: 'Advanced', years: 5, category: 'Database', confidence: 91 },
      { name: 'Docker', level: 'Expert', years: 4, category: 'DevOps', confidence: 92 },
      { name: 'AWS Cloud', level: 'Advanced', years: 4, category: 'DevOps', confidence: 88 }
    ],
    experiences: [
      {
        id: 'exp_4',
        title: 'Senior Systems Engineer',
        company: 'DataStream Systems',
        period: '2020 - Present',
        description: 'Managed Kubernetes microservice clusters and database failover replication.'
      }
    ],
    education: [
      { id: 'edu_3', degree: 'B.S. in Software Engineering', institution: 'University of Washington', year: '2020', gpa: '3.7' }
    ],
    projects: [
      { id: 'proj_3', name: 'High-Throughput Event Broker', tech: 'Java, Kafka, Docker', url: 'https://github.com/example/event-broker', description: 'Distributed event processing pipeline handling 10k msg/sec.' }
    ],
    certifications: [
      { id: 'cert_4', name: 'CKA Certified Kubernetes Administrator', issuer: 'CNCF', year: '2023' }
    ],
    resumeDetails: {
      parsedDate: '2026-08-15',
      filename: 'Sarah_Wilson_Backend_Resume.pdf',
      completeness: '92%',
      extractedSkillsCount: 15,
      keyStrengths: [
        'Exceptional behavioral evidence & team leadership history.',
        'Extensive enterprise backend & cloud infrastructure experience.'
      ],
      improvementAreas: [
        'Widen frontend React SPA development experience.'
      ]
    }
  }
];
