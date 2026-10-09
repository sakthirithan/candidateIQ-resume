# CandidateIQ — Module Tree & Physical Folder Architecture

## Conceptual Architecture

```text
CandidateIQ Repository
│
├── client/ (Frontend — React + Vite + Tailwind CSS)
│   └── src/
│       ├── modules/
│       │   ├── candidate/               ← Candidate Role Domain
│       │   │   ├── dashboard/
│       │   │   ├── profile/
│       │   │   ├── mock-interview/
│       │   │   │   ├── creation/
│       │   │   │   ├── generation/
│       │   │   │   ├── assessment/
│       │   │   │   ├── review/
│       │   │   │   └── solutions/
│       │   │   ├── interview/
│       │   │   ├── activities/
│       │   │   └── interview-journey/
│       │   │
│       │   ├── hr/                      ← HR / Recruiter Role Domain
│       │   │   ├── dashboard/
│       │   │   ├── jobs/
│       │   │   ├── candidates/
│       │   │   ├── applications/
│       │   │   ├── interviews/
│       │   │   └── intelligence/
│       │   │
│       │   ├── admin/                   ← System Admin Domain
│       │   │   ├── dashboard/
│       │   │   ├── users/
│       │   │   ├── configuration/
│       │   │   └── audit/
│       │   │
│       │   └── shared/                  ← Shared Cross-Role Resources
│       │       ├── ui/
│       │       ├── layout/
│       │       ├── navigation/
│       │       ├── auth/
│       │       ├── api/
│       │       ├── utils/
│       │       └── types/
│       │
│       ├── components/                  ← Modular re-exports (backward compatibility)
│       ├── services/                    ← Frontend API Client & Mock Services
│       └── utils/                       ← Shared Auth & Math Utilities
│
└── server/ (Backend — Node.js + Express + MongoDB + AI Evaluator Engine)
    ├── controllers/
    │   ├── mockInterviewController.js
    │   ├── resumeController.js
    │   ├── jobController.js
    │   └── recruiterController.js
    ├── models/
    │   ├── Interview.js
    │   ├── MockInterviewWorkspace.js
    │   ├── Resume.js
    │   ├── Job.js
    │   └── User.js
    ├── services/
    │   ├── ai/
    │   │   ├── mockInterview/
    │   │   │   ├── generateQuestionsService.js
    │   │   │   └── mockInterviewEvaluator.js
    │   │   └── orchestrator/
    │   │       └── aiOrchestrator.js
    │   └── interview/
    │       └── InterviewFinalEvaluator.js
    ├── routes/
    │   ├── mockInterviewRoutes.js
    │   ├── resumeRoutes.js
    │   └── jobRoutes.js
    └── middleware/
```

---

## Detailed Submodule Hierarchy

### 1. Candidate Module (`modules/candidate`)
- **Dashboard (`dashboard/`)**: Overview metrics, application summary, next interview card.
- **Profile & Resume (`profile/`)**: Personal information, resume upload, version history (`ResumeHistory`), ATS analysis (`ResumeIntelligence`).
- **AI Mock Interview (`mock-interview/`)**:
  - `creation/`: Workspace creation form (Job Title, Company, JD, Resume Selection, Mode, Difficulty, Question Count).
  - `generation/`: 5-step dynamic pipeline animation parsing skills, role requirements, and proctoring.
  - `assessment/`: Proctored Frame 8 room with question grid navigation, timer, continuous append-only speech recognition, VAD silence analyzer, live WPM/filler metrics.
  - `review/`: ATS-style performance report with overall score, 8-section score grid, demonstrated strengths, areas needing improvement, voice analytics, and question-by-question accordion.
  - `solutions/`: Actionable Improvement Plan displaying prioritized practice cards, priority score calculation, problem, evidence, impact, solution framework, practice checklist, target criteria, and interactive status buttons.
- **Activities (`activities/`)**: Daily technical micro-practice drills & activities.
- **Interview Journey (`interview-journey/`)**: Roadmap tracking skill readiness milestones over time.

### 2. HR / Recruiter Module (`modules/hr`)
- **Dashboard (`dashboard/`)**: Requisition pipeline, candidate match distributions.
- **Job Management (`jobs/`)**: Job requisition creation, skill keyword definition, JD parsing.
- **Candidate Pipeline (`candidates/`)**: Applicant list, filtering, status stage updates.
- **Candidate Intelligence (`intelligence/`)**: In-depth applicant AI evidence report, technical depth score, resume verification.
- **Candidate Comparison (`comparison/`)**: Side-by-side match evaluation of candidates.

### 3. System Admin Module (`modules/admin`)
- **Admin Dashboard (`dashboard/`)**: System usage stats, active workspaces, platform health, user management.

### 4. Shared Module (`modules/shared`)
- **Navigation (`navigation/`)**: Sidebar navigation, Topbar, Cmd+K Global Search Palette.
- **Layout (`layout/`)**: Container shells, ErrorBoundary wrappers.
- **Notifications (`notifications/`)**: Notification Center drawer.
- **Auth (`auth/`)**: Login, JWT session tokens, role checks.
