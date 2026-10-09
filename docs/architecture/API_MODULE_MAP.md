# CandidateIQ — API & Controller Mapping

## Express Backend API Endpoints (`server/routes`)

| HTTP Method | API Endpoint Path | Controller Method | Model / Service Owner | Domain Module |
|---|---|---|---|---|
| `POST` | `/api/mock-interviews` | `createMockInterviewWorkspace` | `MockInterviewWorkspace` | Candidate / Mock Interview |
| `GET` | `/api/mock-interviews` | `getCandidateMockInterviews` | `MockInterviewWorkspace` | Candidate / Mock Interview |
| `GET` | `/api/mock-interviews/:id` | `getMockInterviewById` | `MockInterviewWorkspace`, `Interview` | Candidate / Mock Interview |
| `PATCH` | `/api/mock-interviews/workspaces/:id` | `updateMockInterviewWorkspace` | `MockInterviewWorkspace` | Candidate / Mock Interview |
| `DELETE` | `/api/mock-interviews/workspaces/:id` | `deleteMockInterviewWorkspace` | `MockInterviewWorkspace` | Candidate / Mock Interview |
| `POST` | `/api/mock-interviews/:id/attempts` | `createMockInterviewAttempt` | `Interview`, `generateQuestionsService` | Candidate / Mock Interview |
| `POST` | `/api/mock-interviews/:id/start` | `startMockInterview` | `Interview` | Candidate / Mock Interview |
| `PATCH` | `/api/mock-interviews/:id/questions/:qId/answer` | `submitQuestionAnswer` | `Interview` | Candidate / Mock Interview |
| `POST` | `/api/mock-interviews/:id/complete` | `completeMockInterview` | `Interview`, `mockInterviewEvaluator` | Candidate / Mock Interview |
| `POST` | `/api/mock-interviews/:id/evaluate` | `evaluateMockInterviewController` | `Interview`, `mockInterviewEvaluator` | Candidate / Mock Interview |
| `GET` | `/api/resumes` | `getCandidateResumes` | `Resume` | Candidate / Profile |
| `POST` | `/api/resumes/upload` | `uploadResume` | `Resume` | Candidate / Profile |
| `GET` | `/api/jobs` | `getJobs` | `Job` | Shared / HR Jobs |
| `POST` | `/api/jobs` | `createJob` | `Job` | HR / Recruiter |
| `GET` | `/api/recruiter/pipeline` | `getPipeline` | `Application`, `Candidate` | HR / Recruiter |
| `GET` | `/api/recruiter/candidate/:id` | `getCandidateIntelligence` | `Candidate`, `Interview` | HR / Intelligence |
