# CandidateIQ — Component & Module Architecture Map

This document provides a comprehensive categorization of all UI components within `client/src/components/`, organized by functional module, folder location, shared usage, and page flow integration.

---

## 📁 1. Directory Structure & Module Organization

All components are organized into dedicated domain folders corresponding to CandidateIQ's 10 core candidate and recruiter modules:

```
client/src/components/
├── candidate/                  # Candidate Modules (01, 03, 04, 05, 07, 08, 09, 10)
│   ├── index.js                # Re-export barrel for candidate components
│   ├── CandidateIQDashboard.jsx
│   ├── CandidateDashboard.jsx
│   ├── CandidateIQProfile.jsx
│   ├── ResumeIntelligence.jsx
│   ├── ResumeUploader.jsx
│   ├── SkillIntelligence.jsx
│   ├── SkillGapIntelligence.jsx
│   ├── JobDiscovery.jsx
│   ├── JobMatchingView.jsx
│   ├── ApplicationTracker.jsx
│   ├── AIMockInterviewRoom.jsx
│   ├── MockInterviewRoom.jsx
│   └── InterviewResults.jsx
├── recruiter/                  # Recruiter Operations Modules (02, 06, 08, 09)
│   ├── index.js                # Re-export barrel for recruiter components
│   ├── RecruiterIQDashboard.jsx
│   ├── RecruiterDashboard.jsx
│   ├── RecruiterJobManagement.jsx
│   ├── CandidateIntelligenceProfile.jsx
│   ├── CandidateIQComparison.jsx
│   ├── CandidateComparison.jsx
│   ├── AIRecruitmentAssistantIQ.jsx
│   └── AIRecruitmentAssistant.jsx
├── common/                     # Shared Navigation, Topbar, Modals & Settings
│   ├── index.js                # Re-export barrel for common components
│   ├── Sidebar.jsx
│   ├── Topbar.jsx
│   ├── Navbar.jsx
│   ├── NotificationCenter.jsx
│   ├── SettingsPage.jsx
│   ├── SettingsModal.jsx
│   ├── ProfileMenu.jsx
│   ├── ProtectedRoute.jsx
│   └── ResponsibleAIDisclaimer.jsx
├── auth/                       # Authentication & Demo Subscriptions
│   ├── index.js                # Re-export barrel for auth components
│   ├── AuthModal.jsx
│   ├── LoginModal.jsx
│   ├── RegisterModal.jsx
│   └── PaymentDemoModal.jsx
├── demo/                       # Interactive Sandbox Demo
│   └── DemoModal.jsx
├── LandingPage.jsx             # Public SaaS Marketing Landing Page
└── COMPONENTS_MODULE_MAP.md    # Architectural Documentation & Component Matrix
```

---

## 📑 2. Detailed Component Reference Matrix

| Component | File Path | Category / Module | Where It Is Used / Shared | Responsibilities & Page Flow Integration |
| :--- | :--- | :--- | :--- | :--- |
| **LandingPage** | `components/LandingPage.jsx` | Module 01: Landing Page & Public Auth | Main `/landing` view in `App.jsx` | Public SaaS hero, feature showcase, interactive demo launcher, role switch preview, quick login/register triggers. |
| **CandidateIQDashboard** | `components/candidate/CandidateIQDashboard.jsx` | Module 01/03: Candidate Dashboard | `/dashboard` route in `App.jsx` | Candidate portal hub displaying profile strength, resume status, application metrics, quick navigation cards. |
| **CandidateIQProfile** | `components/candidate/CandidateIQProfile.jsx` | Module 03: Candidate Profile Management | `/profile` route in `App.jsx`, topbar link | 9 profile sections (Contact, Summary, Experience, Education, Projects, Certs, Socials, Skills, Preferences) with isolated CRUD modals. |
| **ResumeIntelligence** | `components/candidate/ResumeIntelligence.jsx` | Module 04: Resume Management | `/resume` route in `App.jsx` | Multi-stage resume parser simulation (5MB limit validation, upload dropzone, review screen: Accept/Edit/Reject). |
| **ResumeUploader** | `components/candidate/ResumeUploader.jsx` | Module 04: Resume Upload Helper | Sub-component inside `ResumeIntelligence.jsx` | Drag-and-drop resume upload zone with file type validation. |
| **SkillIntelligence** | `components/candidate/SkillIntelligence.jsx` | Module 05: Skill Intelligence | `/skills` route in `App.jsx` | 9 skill categories, interactive radar chart, confidence calculation, evidence tags, and skill CRUD modals. |
| **SkillGapIntelligence** | `components/candidate/SkillGapIntelligence.jsx` | Module 12: Skill Gap Analysis | `/skill-gaps` route in `App.jsx` | Compares candidate skills against target job requirements, classifying skills into 3 tiers (STRONG, MODERATE, MISSING), providing candidate action workflows, and supporting dynamic reactive sync with Candidate Profile & Job Match. |

| **JobDiscovery** | `components/candidate/JobDiscovery.jsx` | Module 07: Candidate Job Discovery | `/jobs` route in `App.jsx` | Keyword search, 5 multi-field filters, sorting, job detail drawer, deterministic matching score, Apply/Save/Share actions. |
| **JobMatchingView** | `components/candidate/JobMatchingView.jsx` | Module 09: Candidate-Job Matching | Standalone/Sub-view in `App.jsx` | Breakdown of multi-dimensional matching scores (Technical, Skills, Experience, Education, Projects) with evidence callouts. |
| **ApplicationTracker** | `components/candidate/ApplicationTracker.jsx` | Module 08: Application Management | `/applications` route in `App.jsx` | Candidate application status pipeline (`Applied` -> `Under Review` -> `Shortlisted` -> `Interview` -> `Selected` / `Rejected`) & timeline tracker. |
| **AIMockInterviewRoom** | `components/candidate/AIMockInterviewRoom.jsx` | Module 10: AI Mock Interview | `/interview` route in `App.jsx` | Setup (Job, Type, Difficulty), step-by-step interview session state machine, speech voice simulation, answer recording. |
| **InterviewResults** | `components/candidate/InterviewResults.jsx` | Module 10: AI Mock Interview | `/interview-results` route in `App.jsx` | Comprehensive interview scorecard, response evaluation breakdown, confidence scores, and improvement tips. |
| **InterviewEvaluationAnalytics** | `components/candidate/InterviewEvaluationAnalytics.jsx` | Module 11: Interview Evaluation & Analytics | `/interview-evaluation` route in `App.jsx` | Converts Question + Answer responses into structured 6-dimensional evaluations (Technical, Relevance, Depth, Problem Solving, Communication, Behavioural), with question-level analysis and objective non-personality evidence rules. |

| **RecruiterIQDashboard** | `components/recruiter/RecruiterIQDashboard.jsx` | Module 14: Recruiter Intelligence Dashboard | `/recruiter-dashboard` route in `App.jsx` | Recruiter operational command center calculating all metrics dynamically from central mock data (mockCandidates.length, mockJobs.length, mockApplications.length), rendering candidate pipeline funnel (Applied -> Review -> Shortlisted -> Interview -> Selected), and 5 Recharts visualizations. |

| **RecruiterJobManagement** | `components/recruiter/RecruiterJobManagement.jsx` | Module 06: Recruiter Job Management | `/jobs-recruiter` route in `App.jsx` | Recruiter Job CRUD, multi-step Publish flow (`Draft` -> `Review` -> `Publish`), Close flow, status management. |
| **CandidateIntelligenceProfile** | `components/recruiter/CandidateIntelligenceProfile.jsx` | Module 13: Candidate Intelligence Profile | `/candidates-recruiter` route in `App.jsx` | Central single source of candidate intelligence for recruiters, integrating 9 data sources into an overall score (84/100), 6 normalized sub-scores (Technical, Job Match, Interview, Behavioural, Resume, Experience), and 7 detailed intelligence pillars (Strengths, Skill Gaps, Evidence, Interview, Compatibility, Recommendations, Limitations). |
| **RecruiterCandidateManagement** | `components/recruiter/RecruiterCandidateManagement.jsx` | Module 15: Recruiter Candidate Management | `/candidates-recruiter` route in `App.jsx` | Recruiter candidate exploration desk featuring search, 6 multi-field filters (Skill, Experience, Job, Match Score, Interview Score, Status), sorting, pagination, candidate detail cascade tabs (Profile -> Resume -> Skills -> Experience -> Job Match -> Interview -> Skill Gap -> Intelligence), and recruiter actions (Shortlist, Reject, Move to Interview, Archive, Compare). |


| **CandidateIQComparison** | `components/recruiter/CandidateIQComparison.jsx` | Module 16: Candidate Comparison | `/comparison` route in `App.jsx` | Transparent side-by-side candidate comparison matrix flow (Select Candidate A, B, C -> Compare -> 6-metric table: Technical, Behavioural, Job Match, Experience, Interview, Overall -> Explainable evidence comparison cards), consuming the same scoring data as Module 13. |
| **AIRecruitmentAssistantIQ** | `components/recruiter/AIRecruitmentAssistantIQ.jsx` | Module 17: AI Recruitment Assistant | `/assistant` route in `App.jsx` | Mock data-aware recruitment co-pilot interpreting natural language intent across 4 core workflows (Skill Search -> Leaderboards -> Score Explainability -> Pipeline Status), rendering structured candidate evidence cards rather than plain text responses. |
| **AdminManagement** | `components/admin/AdminManagement.jsx` | Module 18: Admin Management | `/admin-dashboard` route in `App.jsx` | System administration desk featuring operational counts (Users, Candidates, Recruiters, Jobs, Applications), user management CRUD suite (Create, Read, Update, Deactivate, Delete), multi-field filters (Role, Status, Registration Date), and system activity audit stream. |
| **NotificationCenter** | `components/common/NotificationCenter.jsx` | Module 19: Notifications & Activity | Global Drawer in `App.jsx`, trigger in `Topbar.jsx` | Supporting module connecting cross-module activity (Application status updated, Interview scheduled, Interview completed, Job recommendation available for Candidates; New application, Candidate completed interview, Candidate shortlisted for Recruiters) with live unread badge, category filter pills, and event simulation. |
| **SettingsPage** | `components/common/SettingsPage.jsx` | Module 20: Shared Settings | `/settings` route in `App.jsx` | Dedicated shared settings module with role-customized tabs for Candidate (Profile, Notifications, Privacy, Account), Recruiter (Company/Profile, Notifications, Preferences, Account), and Admin (System Preferences, Account). |
| **SettingsModal** | `components/common/SettingsModal.jsx` | Module 20: Shared Settings Modal | Global Modal in `App.jsx`, topbar link | Workspace settings popup providing quick account profile edits, security password changes, and notification preferences. |
| **GlobalSearchPalette** | `components/common/GlobalSearchPalette.jsx` | Module 21: Global Search | Global Command Palette in `App.jsx` (Triggered via `Cmd+K` or Topbar input) | Debounced search engine querying Candidates, Job Requisitions, Skill Matrix, and Applications with role-aware grouping and direct navigation. |
| **LoadingState** | `components/common/LoadingState.jsx` | Module 22: Global UI/UX State | Shared across Candidate & Recruiter views | Standardized loading indicators and skeletal UI placeholders (`Loading candidates...`). |
| **EmptyState** | `components/common/EmptyState.jsx` | Module 22: Global UI/UX State | Shared across Candidate & Recruiter views | Standardized empty state card containers with custom icons, guidance messages, and reset CTA actions (`No candidates found`). |
| **ConfirmModal** | `components/common/ConfirmModal.jsx` | Module 22: Global UI/UX State | Shared across Candidate & Recruiter actions | Standardized confirmation modals for critical workspace operations (`Are you sure you want to delete this job?`). |
| **Sidebar** | `components/common/Sidebar.jsx` | Common / Shell | Global App Shell in `App.jsx` | Navigation sidebar with dynamic role switcher (Candidate, Recruiter/HR, Admin) updating active route and workspace context. |
| **Topbar** | `components/common/Topbar.jsx` | Common / Shell | Global App Header in `App.jsx` | Header bar containing active route title, search input, notification bell with dynamic unread badge, workspace role pill, and user profile avatar dropdown. |
| **ProfileMenu** | `components/common/ProfileMenu.jsx` | Common / Shell | Used in `Topbar.jsx` and `LandingPage.jsx` | Dropdown menu offering Quick Profile, Account Settings, Role Switcher, and Logout functionality. |
| **ResponsibleAIDisclaimer** | `components/common/ResponsibleAIDisclaimer.jsx` | Common / AI Governance | Used in Recruiter & Interview components | Compliance disclaimer banner reinforcing AI explainability and unbiased scoring rules. |
| **LoginModal** | `components/auth/LoginModal.jsx` | Auth Module | Global Modal in `App.jsx` & `LandingPage.jsx` | Account login modal with quick demo accounts auto-fill for Candidate and Recruiter roles. |
| **RegisterModal** | `components/auth/RegisterModal.jsx` | Auth Module | Global Modal in `App.jsx` & `LandingPage.jsx` | User registration modal with candidate and HR account creation options. |
| **PaymentDemoModal** | `components/auth/PaymentDemoModal.jsx` | Auth / Demo Subscription | Global Modal in `App.jsx` & Auth flow | Interactive ₹1 HR Demo Subscription activation modal for unlocking recruiter capabilities. |
| **DemoModal** | `components/demo/DemoModal.jsx` | Demo / Sandbox | Global Sandbox Modal in `App.jsx` | Onboarding tour and feature walkthrough modal. |

---

## 🔄 3. Application Workflow & Data Integration Flow

### Candidate Page Flow
```
Landing Page / Register
       ↓
Candidate IQ Dashboard (/dashboard)
       ↓
├── Profile Management (/profile) <── Syncs with mockCandidateService
├── Resume Intelligence (/resume) ──> Extracts Skills to Skill Intelligence
├── Skill Intelligence (/skills)  ──> Provides Candidate Skills to Matching Engine
├── Job Discovery (/jobs) ──────────> Calculates matchingService score vs Candidate Profile
│       ↓ (Apply Action)
├── Application Tracker (/applications) ──> Creates Application (Status: Applied)
└── AI Mock Interview (/interview) ───────> Stores answers in mockInterviewService -> (/interview-results)
```

### Recruiter Page Flow
```
Landing Page / HR Demo Login (₹1 Activated)
       ↓
Recruiter IQ Dashboard (/recruiter-dashboard)
       ↓
├── Job Management (/jobs-recruiter) ────> Create Job -> Review -> Publish (Visible in Job Discovery)
├── Candidate Intelligence (/candidates-recruiter) ──> Review Applicants -> Update Status Pipeline
├── Candidate Comparison (/comparison) ──> Compare Applicants Side-by-Side
├── AI Recruitment Assistant (/assistant) ──> Natural Language Talent Search & Insights
└── Admin Management (/admin-dashboard) ──> User CRUD, Role Management, System Audits
```

---

## 🧪 4. Shared Services & Central Mock Data Layer

All components consume centralized mock data services to ensure zero hardcoded fake UI states and smooth future transition to Express/MongoDB backend:

- **`mockCandidateService.js`**: Central candidate profile data, skills, education, experience, resume history.
- **`mockJobService.js`**: Job postings, job creation, publish/close status, job filters.
- **`mockApplicationService.js`**: Applications connecting Candidate + Job + Recruiter, pipeline state updates.
- **`notificationService.js`**: Cross-module notification dispatching store, live unread counter, role activity streams.
- **`matchingService.js`**: Multi-dimensional deterministic candidate-job matching engine (Technical, Skills, Experience, Education, Projects).
- **`interviewService.js`**: Interview question bank, active session state machine, recorded responses.
- **`analyticsService.js`**: Recruiter metrics, funnel analytics, AI match highlights.
- **`auth.js`**: User authentication state, role switcher logic, local storage persistence.

