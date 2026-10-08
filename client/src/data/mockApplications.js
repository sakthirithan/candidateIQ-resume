export const mockApplications = [
  {
    id: 'app_1',
    jobId: 'job_1',
    jobTitle: 'Senior MERN Stack & AI Engineer',
    company: 'CandidateIQ Enterprise',
    candidateId: 'cand_1',
    candidateName: 'Alex Johnson',
    candidateEmail: 'alex@example.com',
    appliedDate: '2026-09-02',
    status: 'Shortlisted', // 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Offer', 'Rejected'
    matchPercentage: 92,
    iqScore: 88,
    timeline: [
      { step: 'Applied', date: '2026-09-02', done: true },
      { step: 'AI Resume Screened', date: '2026-09-02', done: true },
      { step: 'Shortlisted', date: '2026-09-03', done: true },
      { step: 'AI Mock Interview', date: 'Pending', done: false },
      { step: 'Final Offer Decision', date: 'Pending', done: false }
    ]
  },
  {
    id: 'app_2',
    jobId: 'job_2',
    jobTitle: 'Lead Machine Learning & AI Architect',
    company: 'NeuralCorp Global',
    candidateId: 'cand_1',
    candidateName: 'Alex Johnson',
    candidateEmail: 'alex@example.com',
    appliedDate: '2026-08-30',
    status: 'Interview',
    matchPercentage: 94,
    iqScore: 89,
    interviewDetails: {
      round: 'Technical Architecture Round',
      date: '2026-09-12',
      time: '11:00 AM PST',
      mode: 'Google Meet / CandidateIQ Room'
    },
    timeline: [
      { step: 'Applied', date: '2026-08-30', done: true },
      { step: 'AI Resume Screened', date: '2026-08-30', done: true },
      { step: 'Shortlisted', date: '2026-08-31', done: true },
      { step: 'AI Mock Interview', date: '2026-09-02', done: true },
      { step: 'Final Offer Decision', date: 'Pending', done: false }
    ]
  },
  {
    id: 'app_3',
    jobId: 'job_3',
    jobTitle: 'Principal Frontend UX/UI Engineer',
    company: 'Vanguard SaaS Labs',
    candidateId: 'cand_1',
    candidateName: 'Alex Johnson',
    candidateEmail: 'alex@example.com',
    appliedDate: '2026-08-20',
    status: 'Under Review',
    matchPercentage: 79,
    iqScore: 88,
    timeline: [
      { step: 'Applied', date: '2026-08-20', done: true },
      { step: 'AI Resume Screened', date: '2026-08-21', done: true },
      { step: 'Shortlisted', date: 'Pending', done: false },
      { step: 'AI Mock Interview', date: 'Pending', done: false },
      { step: 'Final Offer Decision', date: 'Pending', done: false }
    ]
  }
];
