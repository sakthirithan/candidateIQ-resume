# CandidateIQ — Complete Project Inventory

## Overview
CandidateIQ is an enterprise-grade AI Candidate Profiling, Resume Intelligence, and Proctored Mock Interview Workspace System.

---

## 1. Role Classification

| Role | Target Persona | Owning Module Directory |
|---|---|---|
| **Candidate** | Job Applicants / Engineers | `client/src/modules/candidate` (`components/candidate`, `components/interview`) |
| **HR / Recruiter** | Recruiters, Hiring Managers, Talent Acquisition | `client/src/modules/hr` (`components/recruiter`) |
| **System Admin** | Platform Admins & System Governance | `client/src/modules/admin` (`components/admin`) |
| **Shared / Common** | All Users | `client/src/modules/shared` (`components/common`) |

---

## 2. Complete Inventory of Pages & Components

### A. Candidate Module Components

| Name | Location | Purpose | Route / View | Status |
|---|---|---|---|---|
| `CandidateIQDashboard` | `client/src/components/candidate/CandidateIQDashboard.jsx` | Main candidate analytics dashboard | `/dashboard`, `/` | ACTIVE |
| `CandidateIQProfile` | `client/src/components/candidate/CandidateIQProfile.jsx` | Candidate profile management & resume upload | `/profile` | ACTIVE |
| `ResumeIntelligence` | `client/src/components/candidate/ResumeIntelligence.jsx` | Resume ATS scoring & skill analysis | `/resume-intelligence` | ACTIVE |
| `ResumeHistory` | `client/src/components/candidate/ResumeHistory.jsx` | Past uploaded resume versioning | Modal / Tab | ACTIVE |
| `SkillIntelligence` | `client/src/components/candidate/SkillIntelligence.jsx` | Skill matrix & competency gap view | `/skill-intelligence` | ACTIVE |
| `JobDiscovery` | `client/src/components/candidate/JobDiscovery.jsx` | Target job search & AI matching | `/jobs` | ACTIVE |
| `JobDetailsView` | `client/src/components/candidate/JobDetailsView.jsx` | Target job detail view & match score | `/job-details` | ACTIVE |
| `JobTrackerView` | `client/src/components/candidate/JobTrackerView.jsx` | Saved job application tracking | `/tracker` | ACTIVE |
| `ApplicationTracker` | `client/src/components/candidate/ApplicationTracker.jsx` | Kanban application stage tracker | `/applications` | ACTIVE |
| `AIMockInterviewRoom` | `client/src/components/interview/AIMockInterviewRoom.jsx` | Main Mock Interview Hub, Assessment Room (MCQ/Text/Voice/Random), ATS Review & Actionable Solutions | `/mock-interview`, `/interview` | ACTIVE (CORE) |
| `JobInterviewRoom` | `client/src/components/interview/JobInterviewRoom.jsx` | Standalone Company Job Interview Assessment | `/job-interview/:id` | ACTIVE |
| `CandidateHRInterviews` | `client/src/components/interview/CandidateHRInterviews.jsx` | Scheduled HR Interview invitations | `/hr-interviews` | ACTIVE |
| `InterviewJourney` | `client/src/components/interview/InterviewJourney.jsx` | Interview roadmap & skill milestones | `/interview-journey` | ACTIVE |
| `CandidateActivityHub` | `client/src/components/candidate/CandidateActivityHub.jsx` | Daily interview practice activities | `/activities` | ACTIVE |
| `ActivityPracticeRoom` | `client/src/components/candidate/ActivityPracticeRoom.jsx` | Quick micro-practice room | Modal / View | ACTIVE |

### B. HR / Recruiter Module Components

| Name | Location | Purpose | Route | Status |
|---|---|---|---|---|
| `RecruiterIQDashboard` | `client/src/components/recruiter/RecruiterIQDashboard.jsx` | Recruiter overview & job performance | `/recruiter` | ACTIVE |
| `RecruiterJobManagement` | `client/src/components/recruiter/RecruiterJobManagement.jsx` | Requisition creation & job listing management | `/recruiter/jobs` | ACTIVE |
| `RecruiterCandidateManagement` | `client/src/components/recruiter/RecruiterCandidateManagement.jsx` | Candidate pipeline & resume match review | `/recruiter/candidates` | ACTIVE |
| `CandidateIntelligenceProfile` | `client/src/components/recruiter/CandidateIntelligenceProfile.jsx` | Deep AI evidence profile per applicant | `/recruiter/candidate/:id` | ACTIVE |
| `CandidateIQComparison` | `client/src/components/recruiter/CandidateIQComparison.jsx` | Side-by-side applicant evaluation | `/recruiter/compare` | ACTIVE |
| `AIRecruitmentAssistantIQ` | `client/src/components/recruiter/AIRecruitmentAssistantIQ.jsx` | AI sourcing assistant & prompt interface | `/recruiter/ai-assistant` | ACTIVE |

### C. System Admin Module Components

| Name | Location | Purpose | Route | Status |
|---|---|---|---|---|
| `AdminDashboard` | `client/src/components/admin/AdminDashboard.jsx` | System health, users, audit & platform settings | `/admin` | ACTIVE |

### D. Shared / Common Components

| Name | Location | Purpose | Consumers | Status |
|---|---|---|---|---|
| `Sidebar` | `client/src/components/common/Sidebar.jsx` | Collapsible role-aware sidebar navigation | Candidate, HR, Admin | ACTIVE |
| `Topbar` | `client/src/components/common/Topbar.jsx` | Header bar with search, notification & profile | Candidate, HR, Admin | ACTIVE |
| `NotificationCenter` | `client/src/components/common/NotificationCenter.jsx` | Real-time notification drawer | All Users | ACTIVE |
| `GlobalSearchPalette` | `client/src/components/common/GlobalSearchPalette.jsx` | Cmd+K global search modal | All Users | ACTIVE |
| `SettingsPage` | `client/src/components/common/SettingsPage.jsx` | Account & preference settings page | All Users | ACTIVE |
| `SettingsModal` | `client/src/components/common/SettingsModal.jsx` | Account settings modal overlay | All Users | ACTIVE |
| `ErrorBoundary` | `client/src/components/common/ErrorBoundary.jsx` | Fallback UI wrapper catching crashes | All Routes | ACTIVE |

---

## 3. Backend APIs & Models

| Route | Controller Method | Database Model | Owning Module |
|---|---|---|---|
| `POST /api/mock-interviews` | `createMockInterviewWorkspace` | `MockInterviewWorkspace` | Candidate / Mock Interview |
| `GET /api/mock-interviews` | `getCandidateMockInterviews` | `MockInterviewWorkspace` | Candidate / Mock Interview |
| `GET /api/mock-interviews/:id` | `getMockInterviewById` | `MockInterviewWorkspace`, `Interview` | Candidate / Mock Interview |
| `POST /api/mock-interviews/:id/start` | `startMockInterview` | `Interview` | Candidate / Mock Interview |
| `PATCH /api/mock-interviews/:id/questions/:qId/answer` | `submitQuestionAnswer` | `Interview` | Candidate / Mock Interview |
| `POST /api/mock-interviews/:id/complete` | `completeMockInterview` | `Interview`, `MockInterviewWorkspace` | Candidate / Mock Interview |
| `POST /api/mock-interviews/:id/evaluate` | `evaluateMockInterviewController` | `Interview` | Candidate / Mock Interview |
| `GET /api/resumes` | `getCandidateResumes` | `Resume` | Candidate / Profile |
| `POST /api/resumes/upload` | `uploadResume` | `Resume` | Candidate / Profile |
| `GET /api/jobs` | `getJobs` | `Job` | Shared / HR |
| `POST /api/jobs` | `createJob` | `Job` | HR / Recruiter |
| `GET /api/recruiter/pipeline` | `getPipeline` | `Application`, `Candidate` | HR / Recruiter |
