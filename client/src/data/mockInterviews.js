export const mockInterviews = [
  {
    id: 'int_1',
    candidateId: 'cand_1',
    jobId: 'job_1',
    jobTitle: 'Senior MERN Stack & AI Engineer',
    type: 'Technical & Behavioural',
    completedDate: '2026-09-04',
    overallScore: 83,
    scores: {
      technical: 86,
      relevance: 88,
      depth: 79,
      problemSolving: 82,
      communication: 78,
      behaviouralEvidence: 85
    },
    breakdown: {
      technicalDepth: 79,
      problemSolving: 82,
      communication: 78,
      behaviouralEvidence: 85
    },
    evaluations: [
      {
        questionId: 1,
        question: 'Explain how you optimize React component re-renders when managing global state with Context or Redux.',
        candidateResponse: 'I utilize React.memo alongside useMemo and useCallback hooks to maintain stable function references. Additionally, splitting context providers by read/write frequency prevents unnecessary child tree re-renders.',
        score: 88,
        feedback: 'Demonstrated strong technical understanding of memoization and context splitting.',
        strength: 'Strong technical understanding of React state architecture and reference stability',
        improvement: 'Could elaborate on compiler optimizations and automatic state memoization in React 19.',
        strengths: ['Strong technical understanding', 'Context provider isolation', 'Memoization patterns'],
        improvements: ['Mention server state vs client state decoupling']
      },
      {
        questionId: 2,
        question: 'Describe a situation where an API service experienced high latency under load and how you diagnosed it.',
        candidateResponse: 'We analyzed APM traces using MongoDB explain() queries and uncovered missing compound index coverage on candidate status queries. Adding targeted indices reduced DB response time from 1.2s to 45ms.',
        score: 72,
        feedback: 'Good problem-solving methodology shown, though implementation details could be expanded.',
        strength: 'Empirical root cause diagnosis using query execution statistics',
        improvement: 'Explain implementation details more clearly, specifically caching fallbacks and index creation migration scripts',
        strengths: ['Empirical query analysis', 'Database indexing'],
        improvements: ['Explain implementation details more clearly', 'Detail Redis cache invalidation strategies']
      },
      {
        questionId: 3,
        question: 'How do you coordinate with product managers and junior developers when delivering critical breaking changes to an API?',
        candidateResponse: 'I authored an API migration RFC, established automated deprecation header alerts for consumer teams, and hosted a pair-programming workshop to help junior engineers transition smoothly without downtime.',
        score: 89,
        feedback: 'Exceptional evidence of engineering ownership and cross-team collaboration.',
        strength: 'Proactive API versioning communication and hands-on team enablement',
        improvement: 'Add metric tracking for API adoption rates across client applications.',
        strengths: ['Cross-functional collaboration', 'Clear technical documentation'],
        improvements: ['Quantify SLA compliance stats']
      }
    ],
    behaviouralEvidence: [
      {
        category: 'Evidence of Collaboration',
        details: 'Authored cross-team RFCs, conducted code review pair sessions with junior developers, and coordinated breaking API migrations across departments.'
      },
      {
        category: 'Evidence of Ownership',
        details: 'Initiated APM trace analysis during high-latency production incidents and took responsibility for database index optimizations.'
      },
      {
        category: 'Evidence of Problem Solving',
        details: 'Diagnosed slow candidate status queries using MongoDB explain plans and reduced query execution latency from 1.2s to 45ms.'
      }
    ]
  }
];

