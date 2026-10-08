export const mockAnalytics = {
  overview: {
    totalCandidates: 142,
    activeJobs: 12,
    totalApplications: 489,
    completedInterviews: 86,
    shortlistedCandidates: 34,
    avgCandidateIQ: 84.5
  },
  hiringFunnel: [
    { stage: 'Applied', count: 489, percentage: 100 },
    { stage: 'AI Screened', count: 312, percentage: 63.8 },
    { stage: 'Shortlisted', count: 124, percentage: 25.3 },
    { stage: 'Interview Room', count: 86, percentage: 17.5 },
    { stage: 'Hired / Offered', count: 28, percentage: 5.7 }
  ],
  skillDistribution: [
    { skill: 'React / Frontend', count: 94 },
    { skill: 'Node.js / Express', count: 88 },
    { skill: 'Python / AI Services', count: 62 },
    { skill: 'MongoDB / SQL', count: 76 },
    { skill: 'DevOps / Docker', count: 45 }
  ],
  systemLogs: [
    { id: 1, type: 'PARSER', text: 'Resume parsed for Alex Johnson (14 skills detected)', timestamp: '10 mins ago' },
    { id: 2, type: 'MATCH', text: 'Alex Johnson matched 92% with Senior MERN Engineer', timestamp: '25 mins ago' },
    { id: 3, type: 'INTERVIEW', text: 'AI Mock Interview completed for John Doe (Score: 90/100)', timestamp: '1 hour ago' }
  ]
};
