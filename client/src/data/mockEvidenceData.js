/**
 * CandidateIQ - Profile-Interview Evidence Intelligence Mock Data Store
 * Immutable Resume Records, Immutable Interview Records, Question Transcripts & Analysis Records
 */

export const mockResumeRecords = [
  {
    id: 'RES-001',
    candidateId: 'cand_1',
    version: 'v1',
    createdAt: '2026-08-15T10:00:00Z',
    sourceName: 'Resume_Alex_Johnson_v1.pdf',
    headline: 'Senior Full Stack Engineer',
    claimedSkills: [
      { name: 'React.js', level: 'Advanced', claimedExperience: '4 Years', claimText: 'Architected scalable frontend state management with React hooks and Context API.' },
      { name: 'Node.js', level: 'Advanced', claimedExperience: '4 Years', claimText: 'Engineered high-concurrency microservices and asynchronous Express REST APIs.' },
      { name: 'MongoDB', level: 'Intermediate', claimedExperience: '3 Years', claimText: 'Designed MongoDB document schemas, compound indexes, and aggregation pipelines.' },
      { name: 'System Design', level: 'Advanced', claimedExperience: '3 Years', claimText: 'Designed distributed microservices architecture, API gateways, and Redis caching layers.' },
      { name: 'AWS', level: 'Advanced', claimedExperience: '2 Years', claimText: 'Deployed production microservices to AWS ECS, Lambda, S3, and CloudFront.' },
      { name: 'Leadership', level: 'Strong', claimedExperience: '2 Years', claimText: 'Mentored junior developers, led architecture RFCs, and facilitated agile sprint planning.' }
    ]
  },
  {
    id: 'RES-002',
    candidateId: 'cand_1',
    version: 'v2',
    createdAt: '2026-09-01T14:30:00Z',
    sourceName: 'Resume_Alex_Johnson_v2.pdf',
    headline: 'Senior Full Stack & AI Architect',
    claimedSkills: [
      { name: 'React.js', level: 'Advanced', claimedExperience: '4+ Years', claimText: 'Architected scalable frontend state management with React hooks, Context API, and code-splitting.' },
      { name: 'Node.js', level: 'Advanced', claimedExperience: '4+ Years', claimText: 'Engineered high-concurrency microservices, event loop optimization, and Express REST APIs.' },
      { name: 'MongoDB', level: 'Intermediate', claimedExperience: '3 Years', claimText: 'Designed MongoDB document schemas, compound indexes, and aggregation pipelines.' },
      { name: 'System Design', level: 'Advanced', claimedExperience: '3 Years', claimText: 'Designed distributed microservices architecture, API gateways, and Redis caching layers.' },
      { name: 'AWS', level: 'Advanced', claimedExperience: '2 Years', claimText: 'Deployed production microservices to AWS ECS, Lambda, S3, and CloudFront.' },
      { name: 'Docker & Kubernetes', level: 'Intermediate', claimedExperience: '2 Years', claimText: 'Containerized Node.js services and orchestrated multi-region Kubernetes deployments.' },
      { name: 'Gemini LLM API', level: 'Intermediate', claimedExperience: '1 Year', claimText: 'Integrated generative AI prompts and structured response parsing using Google Gemini SDK.' },
      { name: 'Leadership', level: 'Strong', claimedExperience: '2 Years', claimText: 'Mentored junior developers, led architecture RFCs, and facilitated agile sprint planning.' }
    ]
  },
  {
    id: 'RES-003',
    candidateId: 'cand_1',
    version: 'v3 (Current)',
    createdAt: '2026-09-08T09:15:00Z',
    sourceName: 'Resume_Alex_Johnson_v3_Final.pdf',
    headline: 'Principal Full Stack & Distributed Systems Lead',
    claimedSkills: [
      { name: 'React.js', level: 'Expert', claimedExperience: '5 Years', claimText: 'Architected complex enterprise React applications, micro-frontends, custom hooks, and server components.' },
      { name: 'Node.js', level: 'Expert', claimedExperience: '5 Years', claimText: 'Built event-driven microservices, custom Express middlewares, and high-throughput streaming pipelines.' },
      { name: 'MongoDB & PostgreSQL', level: 'Advanced', claimedExperience: '4 Years', claimText: 'Optimized complex query execution plans, sharded MongoDB clusters, and PostgreSQL indexing.' },
      { name: 'System Architecture', level: 'Expert', claimedExperience: '4 Years', claimText: 'Architected resilient cloud systems, message queues (Kafka/RabbitMQ), and Redis distributed locks.' },
      { name: 'Cloud Infrastructure', level: 'Advanced', claimedExperience: '3 Years', claimText: 'Terraform IaC automation, AWS ECS/EKS clusters, serverless Lambda functions.' }
    ]
  }
];

export const mockInterviewRecords = [
  {
    id: 'INT-001',
    candidateId: 'cand_1',
    type: 'MOCK',
    title: 'Mock Interview #01 — Frontend & API Fundamentals',
    role: 'Full Stack Developer',
    company: 'CandidateIQ Practice Studio',
    date: '2026-08-20',
    duration: '28 mins',
    totalQuestions: 10,
    resumeSnapshotId: 'RES-001',
    resumeVersionLabel: 'Resume v1 (Resume_Alex_Johnson_v1.pdf)',
    overallScore: 76,
    finalFeedback: 'Good technical understanding of core React & Node.js, but needs more depth in database query tuning and system architecture under high concurrency.',
    strengths: ['React.js State Management', 'REST API Concepts', 'Team Collaboration'],
    improvementAreas: ['MongoDB Aggregations', 'System Design Trade-offs', 'Database Indexing'],
    questions: [
      {
        questionId: 'Q-101',
        category: 'Technical',
        targetSkill: 'React.js',
        question: 'How do you optimize React component re-renders when managing global state with Context or Redux?',
        candidateAnswer: 'I utilize React.memo alongside useMemo and useCallback hooks to maintain stable function references. Additionally, splitting context providers by read/write frequency prevents unnecessary child tree re-renders.',
        relevantResumeInfo: 'Resume v1: "Architected scalable frontend state management with React hooks and Context API."',
        evaluationState: 'WELL_EXPLAINED',
        aiFeedback: 'Your answer connected nicely to the React state management experience in your resume. You clearly explained memoization and context provider isolation.',
        observedLevel: 'Strong',
        evidenceStrength: 'Strong'
      },
      {
        questionId: 'Q-102',
        category: 'Technical',
        targetSkill: 'Node.js',
        question: 'Explain how Node.js handles asynchronous non-blocking I/O operations and the event loop queues.',
        candidateAnswer: 'Node.js uses libuv thread pool for async I/O. Callbacks are pushed to phase queues like timers, poll, and check phase, processed after microtasks like process.nextTick and Promise callbacks.',
        relevantResumeInfo: 'Resume v1: "Engineered high-concurrency microservices and asynchronous Express REST APIs."',
        evaluationState: 'COULD_BE_STRONGER',
        aiFeedback: 'You mentioned libuv and microtasks accurately. Next time, try providing an example of how event loop blocking occurs during heavy CPU computational tasks.',
        observedLevel: 'Moderate',
        evidenceStrength: 'Moderate'
      },
      {
        questionId: 'Q-103',
        category: 'Technical',
        targetSkill: 'MongoDB',
        question: 'How do you diagnose slow queries and optimize aggregation pipelines in MongoDB?',
        candidateAnswer: 'We used explain("executionStats") to check if queries used indexes or COLLSCAN. Adding compound indexes reduced execution time.',
        relevantResumeInfo: 'Resume v1: "Designed MongoDB document schemas, compound indexes, and aggregation pipelines."',
        evaluationState: 'NEEDS_DETAIL',
        aiFeedback: 'You knew the explain plan command, but your resume lists experience with aggregation pipelines. Elaborating on $match filtering and memory limits would strengthen this.',
        observedLevel: 'Weak',
        evidenceStrength: 'Weak'
      },
      {
        questionId: 'Q-104',
        category: 'Behavioural',
        targetSkill: 'Leadership',
        question: 'Describe a situation where you had to resolve a technical disagreement with a team member.',
        candidateAnswer: 'I authored an API versioning RFC, held pair-programming onboarding sessions for junior developers, and conducted blameless post-mortems after production incidents.',
        relevantResumeInfo: 'Resume v1: "Mentored junior developers, led architecture RFCs, and facilitated agile sprint planning."',
        evaluationState: 'WELL_EXPLAINED',
        aiFeedback: 'Great answer! You showed proactive ownership, empathetic pair-programming mentorship, and structured RFC communication.',
        observedLevel: 'Strong',
        evidenceStrength: 'Strong'
      },
      {
        questionId: 'Q-105',
        category: 'Problem Solving',
        targetSkill: 'General Architecture',
        question: 'How do you approach debugging an intermittent memory leak in a Node.js production service?',
        candidateAnswer: 'I take heap snapshots using chrome devtools or node --inspect, compare heap allocation timelines before and after stress runs, and inspect uncleared event listeners.',
        relevantResumeInfo: 'General Problem Solving (Unrelated to a specific resume claim)',
        evaluationState: 'NOT_RELATED',
        aiFeedback: 'This question assessed your general troubleshooting approach rather than a specific resume item. Your memory heap snapshot technique was spot on.',
        observedLevel: 'Strong',
        evidenceStrength: 'Strong'
      }
    ]
  },
  {
    id: 'INT-002',
    candidateId: 'cand_1',
    type: 'MOCK',
    title: 'Mock Interview #02 — MERN Architecture & Scaling',
    role: 'Full Stack Developer',
    company: 'CandidateIQ Practice Studio',
    date: '2026-09-02',
    duration: '35 mins',
    totalQuestions: 12,
    resumeSnapshotId: 'RES-001',
    resumeVersionLabel: 'Resume v1 (Resume_Alex_Johnson_v1.pdf)',
    overallScore: 84,
    finalFeedback: 'Clear improvement in technical explanations and project walk-throughs. Database optimization and caching answers were noticeably stronger than in Mock #01.',
    strengths: ['Database Query Optimization', 'React Hooks Architecture', 'Clear Communication'],
    improvementAreas: ['System Design Edge Cases', 'Distributed Locking'],
    questions: [
      {
        questionId: 'Q-201',
        category: 'Technical',
        targetSkill: 'React.js',
        question: 'How do you prevent memory leaks when managing WebSocket connections in React components?',
        candidateAnswer: 'I manage WebSocket connections inside custom hooks using useEffect cleanup callbacks to properly close socket listeners when components unmount.',
        relevantResumeInfo: 'Resume v1: "Architected scalable frontend state management with React hooks and Context API."',
        evaluationState: 'WELL_EXPLAINED',
        aiFeedback: 'Your answer clearly demonstrated solid understanding of lifecycle cleanup in custom hooks.',
        observedLevel: 'Strong',
        evidenceStrength: 'Strong'
      },
      {
        questionId: 'Q-202',
        category: 'Technical',
        targetSkill: 'MongoDB',
        question: 'Walk me through a production database latency issue you resolved.',
        candidateAnswer: 'A candidate status query was doing full collection scans taking 1.2s. I analyzed execution stats, added a compound index on candidateId and status, and dropped query latency to 45ms.',
        relevantResumeInfo: 'Resume v1: "Designed MongoDB document schemas, compound indexes, and aggregation pipelines."',
        evaluationState: 'WELL_EXPLAINED',
        aiFeedback: 'Excellent! Compared to your previous interview, you provided exact metrics (1.2s to 45ms) that strongly backed your resume claim.',
        observedLevel: 'Strong',
        evidenceStrength: 'Strong'
      },
      {
        questionId: 'Q-203',
        category: 'Technical',
        targetSkill: 'System Design',
        question: 'How do you design a caching strategy to handle high API read volume?',
        candidateAnswer: 'We used Redis as a cache-aside layer with standard TTL eviction. Write-through updates invalidated stale keys immediately.',
        relevantResumeInfo: 'Resume v1: "Designed distributed microservices architecture, API gateways, and Redis caching layers."',
        evaluationState: 'COULD_BE_STRONGER',
        aiFeedback: 'You covered Cache-Aside and TTL evictions well. Next time, touch on cache stampede mitigation (lock buffers).',
        observedLevel: 'Moderate',
        evidenceStrength: 'Moderate'
      }
    ]
  },
  {
    id: 'INT-003',
    candidateId: 'cand_1',
    type: 'MOCK',
    title: 'Mock Interview #03 — AI Integration & Cloud Systems',
    role: 'Software Engineer',
    company: 'CandidateIQ Practice Studio',
    date: '2026-09-05',
    duration: '40 mins',
    totalQuestions: 12,
    resumeSnapshotId: 'RES-002',
    resumeVersionLabel: 'Resume v2 (Resume_Alex_Johnson_v2.pdf)',
    overallScore: 88,
    finalFeedback: 'Impressive demonstration of AI SDK integration and containerized microservices. Very strong technical alignment with updated Resume v2.',
    strengths: ['Generative AI SDK Integration', 'Docker & Microservices', 'API Error Handling'],
    improvementAreas: ['Kubernetes Stateful Sets', 'AWS Cost Optimization'],
    questions: [
      {
        questionId: 'Q-301',
        category: 'Technical',
        targetSkill: 'Gemini LLM API',
        question: 'How do you ensure reliable structured JSON output when calling Generative AI APIs in production?',
        candidateAnswer: 'We enforce JSON schema definitions in prompt instructions and use response schema parameters in Google Gemini SDK, wrapped in a resilient Zod parser with auto-retry on validation failure.',
        relevantResumeInfo: 'Resume v2: "Integrated generative AI prompts and structured response parsing using Google Gemini SDK."',
        evaluationState: 'WELL_EXPLAINED',
        aiFeedback: 'Fantastic answer! You articulated structured Gemini SDK schemas and Zod validation perfectly matching your resume claim.',
        observedLevel: 'Strong',
        evidenceStrength: 'Strong'
      },
      {
        questionId: 'Q-302',
        category: 'Technical',
        targetSkill: 'Docker & Kubernetes',
        question: 'How do you containerize Node.js microservices for multi-stage Docker builds?',
        candidateAnswer: 'We use multi-stage Dockerfiles with lightweight Alpine node images, copying node_modules from a builder stage to keep production image size under 120MB.',
        relevantResumeInfo: 'Resume v2: "Containerized Node.js services and orchestrated multi-region Kubernetes deployments."',
        evaluationState: 'WELL_EXPLAINED',
        aiFeedback: 'Clear explanation of multi-stage Docker builds and small image footprint optimization.',
        observedLevel: 'Strong',
        evidenceStrength: 'Strong'
      }
    ]
  },
  {
    id: 'INT-004',
    candidateId: 'cand_1',
    type: 'FINAL',
    title: 'Final Technical Interview #01 — Enterprise Round',
    role: 'Software Engineer',
    company: 'ABC Technologies',
    date: '2026-09-06',
    duration: '45 mins',
    totalQuestions: 14,
    resumeSnapshotId: 'RES-002',
    resumeVersionLabel: 'Resume v2 (Resume_Alex_Johnson_v2.pdf)',
    overallScore: 86,
    interviewerName: 'Sarah Jenkins (Principal Tech Lead)',
    interviewerRole: 'Lead Systems Architect @ ABC Technologies',
    finalFeedback: 'Strong overall technical round. Alex demonstrated clear architectural understanding of React state patterns and database indexing. Communication was structured and articulate.',
    strengths: ['React & Node.js Depth', 'Empirical Query Tuning', 'Structured Project Explanation'],
    improvementAreas: ['System Design Scalability under 100k RPS', 'Multi-Region DB Replication'],
    questions: [
      {
        questionId: 'Q-401',
        category: 'Technical',
        targetSkill: 'React.js',
        question: 'How do you structure custom hooks and prevent memory leaks in WebSocket real-time applications?',
        candidateAnswer: 'I wrap WebSocket connections inside useEffect with cleanup functions to close sockets on unmount. We maintain connection state in custom hooks with exponential backoff reconnect logic.',
        relevantResumeInfo: 'Resume v2: "Architected scalable frontend state management with React hooks, Context API, and code-splitting."',
        evaluationState: 'WELL_EXPLAINED',
        aiFeedback: 'Flawless explanation of subscription cleanup and resilient socket reconnection strategies.',
        observedLevel: 'Strong',
        evidenceStrength: 'Strong'
      },
      {
        questionId: 'Q-402',
        category: 'Technical',
        targetSkill: 'MongoDB',
        question: 'Walk me through a production database issue you resolved using index strategies.',
        candidateAnswer: 'Our candidate status query was doing full collection scans causing 1.2s API response times. I analyzed MongoDB explain plans, created a compound index on candidateId and status, and reduced query latency down to 45ms.',
        relevantResumeInfo: 'Resume v2: "Designed MongoDB document schemas, compound indexes, and aggregation pipelines."',
        evaluationState: 'WELL_EXPLAINED',
        aiFeedback: 'Provided concrete empirical metrics (1.2s to 45ms) demonstrating real-world database tuning mastery.',
        observedLevel: 'Strong',
        evidenceStrength: 'Strong'
      },
      {
        questionId: 'Q-403',
        category: 'Technical',
        targetSkill: 'Node.js',
        question: 'How do you structure global error handling and stream large JSON payloads in Express?',
        candidateAnswer: 'We use central Express error middleware returning standard RFC 7807 problem details. For large payloads, we stream using Node.js Transform streams instead of buffering into RAM.',
        relevantResumeInfo: 'Resume v2: "Engineered high-concurrency microservices, event loop optimization, and Express REST APIs."',
        evaluationState: 'WELL_EXPLAINED',
        aiFeedback: 'Demonstrated enterprise-level backend API maturity and memory stream controls.',
        observedLevel: 'Strong',
        evidenceStrength: 'Strong'
      },
      {
        questionId: 'Q-404',
        category: 'System Design',
        targetSkill: 'System Design',
        question: 'How would you scale an API gateway to process 100,000 requests per second across multiple cloud regions?',
        candidateAnswer: 'I would use AWS Route53 latency routing with CloudFront CDN for edge caching, NGINX ingress controllers, and Redis Cluster for distributed token-bucket rate limiting.',
        relevantResumeInfo: 'Resume v2: "Designed distributed microservices architecture, API gateways, and Redis caching layers."',
        evaluationState: 'COULD_BE_STRONGER',
        aiFeedback: 'You laid out a strong architecture foundation. Adding detail on circuit breaker patterns (Netflix Hystrix / Resilience4j) would make it bulletproof.',
        observedLevel: 'Moderate',
        evidenceStrength: 'Moderate'
      }
    ]
  },
  {
    id: 'INT-005',
    candidateId: 'cand_1',
    type: 'FINAL',
    title: 'Final Systems & Architecture Round #02',
    role: 'Software Engineer',
    company: 'Acme Corp',
    date: '2026-09-09',
    duration: '50 mins',
    totalQuestions: 15,
    resumeSnapshotId: 'RES-003',
    resumeVersionLabel: 'Resume v3 (Resume_Alex_Johnson_v3_Final.pdf)',
    overallScore: 90,
    interviewerName: 'Marcus Vance (VP of Engineering)',
    interviewerRole: 'VP of Engineering @ Acme Corp',
    finalFeedback: 'Exceptional candidate performance! Alex communicated complex architectural tradeoffs with remarkable clarity and confidence. Fully recommended for Senior Lead title.',
    strengths: ['System Architecture & Resilience', 'High-Throughput Streaming', 'Leadership & Team Guidance'],
    improvementAreas: ['Minor details on Kafka Partition Rebalancing'],
    questions: [
      {
        questionId: 'Q-501',
        category: 'Technical',
        targetSkill: 'System Architecture',
        question: 'Explain how you design event-driven messaging using Kafka to prevent duplicate message processing.',
        candidateAnswer: 'We implement idempotent consumer handlers using Redis unique transactional keys (`SETNX`) alongside database idempotency keys on payload execution.',
        relevantResumeInfo: 'Resume v3: "Architected resilient cloud systems, message queues (Kafka/RabbitMQ), and Redis distributed locks."',
        evaluationState: 'WELL_EXPLAINED',
        aiFeedback: 'Masterful explanation of idempotency patterns in event-driven systems.',
        observedLevel: 'Strong',
        evidenceStrength: 'Strong'
      },
      {
        questionId: 'Q-502',
        category: 'Technical',
        targetSkill: 'React.js',
        question: 'How do micro-frontends communicate state across independently deployed React applications?',
        candidateAnswer: 'We use light custom browser CustomEvent buses for cross-domain decoupling alongside centralized shell window objects for shared auth session tokens.',
        relevantResumeInfo: 'Resume v3: "Architected complex enterprise React applications, micro-frontends, custom hooks, and server components."',
        evaluationState: 'WELL_EXPLAINED',
        aiFeedback: 'Exceptional articulation of micro-frontend isolation and decoupled event buses.',
        observedLevel: 'Strong',
        evidenceStrength: 'Strong'
      }
    ]
  }
];

export const mockExternalFeedbackRecords = [
  {
    id: 'EXT-FB-001',
    candidateId: 'cand_1',
    relatedInterviewId: 'INT-004',
    fileName: 'Interviewer_Feedback_ABC_Tech_Alex_Johnson.pdf',
    fileSize: '420 KB',
    uploadedAt: '2026-09-07T11:00:00Z',
    interviewerName: 'Sarah Jenkins (Principal Tech Lead)',
    company: 'ABC Technologies',
    overallImpression: 'Strong technical fit for the Senior Software Engineer position.',
    extractedStrengths: [
      'Showed deep practical knowledge of React hooks and state management.',
      'Demonstrated excellent problem solving when explaining the 1.2s to 45ms MongoDB query latency optimization.',
      'Communicated clearly and presented solutions logically.'
    ],
    extractedImprovementAreas: [
      'Needs a bit more depth in high-throughput (100k+ RPS) API gateway resilience and distributed rate limiting.'
    ],
    comparisonSummary: 'Both CandidateIQ AI Analysis and Interviewer Sarah Jenkins agree that project explanations and database tuning were exceptional. Both identified System Design under extreme concurrency as the main area for further practice.'
  }
];

export const mockAnalysisRecords = [
  {
    id: 'ANA-001',
    interviewId: 'INT-001',
    resumeVersionId: 'RES-001',
    analysisVersion: 'Original (RES-001)',
    createdAt: '2026-08-20T11:30:00Z',
    evidenceCoverage: '67% (4 of 6 claims tested)',
    riskLevel: 'Low Risk',
    overallAlignment: '76% Profile-to-Evidence Match',
    claimEvidenceMatrix: [
      {
        skillName: 'React.js',
        resumeClaim: 'Advanced (4 Years) - Architected frontend state with React hooks and Context API',
        observedEvidence: 'Strong - Clear explanation of React.memo, useCallback, and context provider isolation',
        validationState: 'SUPPORTED',
        confidenceScore: 92,
        evidenceSource: 'INT-001 (Question Q-101)',
        questionId: 'Q-101'
      },
      {
        skillName: 'Node.js',
        resumeClaim: 'Advanced (4 Years) - High-concurrency microservices & Express REST APIs',
        observedEvidence: 'Moderate - Understood libuv & microtasks, but missed CPU event loop phase edge cases',
        validationState: 'PARTIALLY_SUPPORTED',
        confidenceScore: 74,
        evidenceSource: 'INT-001 (Question Q-102)',
        questionId: 'Q-102'
      },
      {
        skillName: 'MongoDB',
        resumeClaim: 'Intermediate (3 Years) - Document schemas, compound indexes, aggregation pipelines',
        observedEvidence: 'Weak - Knew basic indexing commands, but could not detail aggregation pipeline memory limits',
        validationState: 'PARTIALLY_SUPPORTED',
        confidenceScore: 58,
        evidenceSource: 'INT-001 (Question Q-103)',
        questionId: 'Q-103'
      },
      {
        skillName: 'Leadership',
        resumeClaim: 'Strong (2 Years) - Mentored developers, led RFCs, and sprint planning',
        observedEvidence: 'Strong - Authored API RFCs, conducted pair-programming, and led blameless post-mortems',
        validationState: 'SUPPORTED',
        confidenceScore: 90,
        evidenceSource: 'INT-001 (Question Q-104)',
        questionId: 'Q-104'
      }
    ]
  }
];

