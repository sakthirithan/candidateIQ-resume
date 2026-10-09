# CandidateIQ — Technical Feature Audit & Verification Matrix

## Audit Overview
This audit matrix details the verified status of all core CandidateIQ features prior to Devpost submission.

---

## Feature Audit Table

| Feature Name | Primary File Paths | API Endpoint | DB Model | AI Integration | Test Performed & Actual Result | Status | Devpost Submission Wording Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **User Auth & Role Management** | `server/controllers/authController.js`<br>`client/src/modules/shared/auth` | `POST /api/auth/register`<br>`POST /api/auth/login` | `User` | N/A | Register & login as candidate & recruiter via JWT auth; verified session persistence. | **1** | Fully implemented candidate & recruiter role authentication. |
| **Candidate Profile CRUD** | `server/controllers/profileController.js`<br>`client/src/modules/candidate/profile` | `GET /api/candidates/profile`<br>`PUT /api/candidates/profile` | `CandidateProfile` | N/A | Saved contact, headline, experience, projects, skills; verified MongoDB persistence. | **1** | Multi-section profile management with skill and project tracking. |
| **Resume PDF Parsing & ATS Analysis** | `server/controllers/resumeController.js`<br>`client/src/modules/candidate/resume-intelligence` | `POST /api/resumes/upload`<br>`GET /api/resumes/my-resume` | `Resume` | Keyword Extraction & Heuristic ATS Scoring | Uploaded test PDF resume; verified `pdf-parse` extracted raw text & keywords with ATS score calculation. | **1** | Automated PDF resume parsing and ATS criteria evaluation. |
| **Target Job Match & Requisitions** | `server/controllers/jobController.js`<br>`client/src/modules/candidate/jobs` | `GET /api/jobs`<br>`GET /api/jobs/:id` | `Job`<br>`Application` | Candidate-to-Job Matching Engine | Applied for job; verified application record created in MongoDB with match score. | **1** | Target job discovery and multi-metric job compatibility matching. |
| **Dynamic AI Mock Interview Generator** | `server/controllers/interviewController.js`<br>`client/src/modules/candidate/interview` | `POST /api/interviews/start`<br>`POST /api/interviews/schedule` | `Interview` | Google Gemini / Groq Llama 3.3 Prompt Orchestrator | Initiated mock session; verified questions generated dynamically from resume keywords & job specs. | **1** | Contextual AI mock interview session generation. |
| **Multi-Dimensional Response Evaluation** | `server/controllers/interviewController.js`<br>`client/src/modules/candidate/mock-interview` | `POST /api/interviews/:id/answer`<br>`POST /api/interviews/:id/complete` | `Interview` | AI Evaluation Engine (`evaluationAIService.js`) | Submitted answer text; verified 6-metric scores (Technical, Depth, Problem Solving, Communication) computed & saved. | **1** | Objective 6-metric AI response scoring and detailed question feedback. |
| **Skill Matrix & Triangulation** | `server/services/candidateIntelligenceService.js`<br>`client/src/modules/candidate/skills` | `GET /api/candidates/me/intelligence` | `CandidateIntelligenceSnapshot` | Triangulation Heuristic Engine | Evaluated skills; verified classification into *Supported*, *Partial*, and *Untested* evidence tiers. | **1** | Evidence-backed Skill Matrix comparing resume claims against interview performance. |
| **Automated Improvement Activities** | `server/controllers/improvementActivityController.js`<br>`client/src/modules/candidate/activities` | `GET /api/activities`<br>`POST /api/improvement-activities/:id/practice/submit` | `ImprovementActivity`<br>`PracticeSession` | Weakness-to-Practice Generator | Completed practice task; verified baseline vs. latest value updated to COMPLETED in MongoDB. | **1** | Automatic conversion of interview evaluation weaknesses into practice activities. |
| **Interview Journey Progression** | `server/services/candidateInterviewJourney.service.js`<br>`client/src/modules/candidate/interview-journey` | `GET /api/interviews/candidate` | `Interview` | N/A | Completed multiple interview attempts; verified progression steps updated. | **1** | Historical attempt tracking and multi-session candidate journey progression. |
| **HR Video Call Interview Scheduling** | `server/controllers/interviewController.js`<br>`client/src/modules/hr/interviews` | `POST /api/interviews/schedule`<br>`GET /api/interviews/recruiter` | `Interview` | Resend Email API + Embedded Jitsi SDK | Created HR video call interview; verified Jitsi room generated & Resend invitation email delivered. | **1** | Official recruiter video interview scheduling with embedded Jitsi video rooms. |

---

## Status Legend
- **Status 1**: Implemented and verified (100% working, data persisted in MongoDB)
- **Status 2**: Implemented but not verified
- **Status 3**: Partially implemented
- **Status 4**: UI-only or dummy data
- **Status 5**: Not implemented
- **Status 6**: Broken or blocked by configuration

---

## Key Verification Takeaways for Devpost
1. **Zero Fake AI Claims**: All displayed evaluation scores and recommendations in CandidateIQ originate from actual AI responses (Google Gemini / Groq Llama 3.3) combined with server-side weighted scoring logic persisted in MongoDB.
2. **End-to-End Persistence**: Resume extractions, mock interviews, answer responses, evaluation scorecards, and practice activities are fully persisted in MongoDB.
