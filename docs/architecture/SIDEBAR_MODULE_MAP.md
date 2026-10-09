# CandidateIQ — Sidebar to Module Mapping

## Navigation Rule
Every sidebar item maps to **exactly one module and submodule**.

---

## 1. Candidate Role Sidebar Mapping

```text
CANDIDATE SIDEBAR
│
├── Overview Dashboard ──────► Candidate / Dashboard
│                               (CandidateIQDashboard.jsx)
│
├── Job Discovery ───────────► Candidate / Jobs
│                               (JobDiscovery.jsx)
│
├── Tracker ─────────────────► Candidate / Tracker
│                               (JobTrackerView.jsx & ApplicationTracker.jsx)
│
├── Interview ───────────────► Candidate / HR Interviews
│                               (CandidateHRInterviews.jsx)
│
├── My Profile ──────────────► Candidate / Profile
│                               (CandidateIQProfile.jsx & ResumeIntelligence.jsx)
│
└── AI PRACTICE STUDIO
    │
    ├── AI Mock Interview ───► Candidate / AI Mock Interview
    │                           (AIMockInterviewRoom.jsx - Creation, Assessment, Review, Solutions)
    │
    ├── Activities ──────────► Candidate / Activities
    │                           (CandidateActivityHub.jsx & ActivityPracticeRoom.jsx)
    │
    └── My Interview Journey ─► Candidate / Interview Journey
                                (InterviewJourney.jsx)
```

---

## 2. HR / Recruiter Role Sidebar Mapping

```text
RECRUITER SIDEBAR
│
├── Recruiter Dashboard ─────► HR / Dashboard
│                               (RecruiterIQDashboard.jsx)
│
├── Job Requisitions ────────► HR / Jobs
│                               (RecruiterJobManagement.jsx)
│
├── Candidates ──────────────► HR / Candidates
│                               (RecruiterCandidateManagement.jsx)
│
├── Candidate Intelligence ──► HR / Intelligence
│                               (CandidateIntelligenceProfile.jsx)
│
├── Candidate Comparison ────► HR / Comparison
│                               (CandidateIQComparison.jsx)
│
└── AI Recruiter Assistant ──► HR / AI Sourcing
                                (AIRecruitmentAssistantIQ.jsx)
```

---

## 3. System Admin Role Mapping

```text
ADMIN SIDEBAR
│
└── System Governance ───────► Admin / Dashboard
                                (AdminDashboard.jsx)
```
