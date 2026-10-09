# CandidateIQ — Route to Module Mapping

## Client Routes (`App.jsx`)

| Route Path | Component Owner | Target Submodule | Access Role | Status |
|---|---|---|---|---|
| `/` | `LandingPage` / `CandidateIQDashboard` | Candidate / Dashboard | Public / Candidate | ACTIVE |
| `/dashboard` | `CandidateIQDashboard` | Candidate / Dashboard | Candidate | ACTIVE |
| `/profile` | `CandidateIQProfile` | Candidate / Profile | Candidate | ACTIVE |
| `/resume-intelligence` | `ResumeIntelligence` | Candidate / Profile | Candidate | ACTIVE |
| `/skill-intelligence` | `SkillIntelligence` | Candidate / Profile | Candidate | ACTIVE |
| `/jobs` | `JobDiscovery` | Candidate / Jobs | Candidate | ACTIVE |
| `/job-details` | `JobDetailsView` | Candidate / Jobs | Candidate | ACTIVE |
| `/tracker` | `JobTrackerView` | Candidate / Tracker | Candidate | ACTIVE |
| `/applications` | `ApplicationTracker` | Candidate / Tracker | Candidate | ACTIVE |
| `/mock-interview` | `AIMockInterviewRoom` | Candidate / AI Mock Interview | Candidate | ACTIVE (PRIMARY) |
| `/interview` | `AIMockInterviewRoom` | Candidate / AI Mock Interview | Candidate | ACTIVE |
| `/job-interview/:id` | `JobInterviewRoom` | Candidate / Interview | Candidate | ACTIVE |
| `/hr-interviews` | `CandidateHRInterviews` | Candidate / Interview | Candidate | ACTIVE |
| `/interview-journey` | `InterviewJourney` | Candidate / Interview Journey | Candidate | ACTIVE |
| `/activities` | `CandidateActivityHub` | Candidate / Activities | Candidate | ACTIVE |
| `/recruiter` | `RecruiterIQDashboard` | HR / Dashboard | HR / Recruiter | ACTIVE |
| `/recruiter/jobs` | `RecruiterJobManagement` | HR / Jobs | HR / Recruiter | ACTIVE |
| `/recruiter/candidates` | `RecruiterCandidateManagement` | HR / Candidates | HR / Recruiter | ACTIVE |
| `/recruiter/candidate/:id` | `CandidateIntelligenceProfile` | HR / Intelligence | HR / Recruiter | ACTIVE |
| `/admin` | `AdminDashboard` | Admin / Dashboard | System Admin | ACTIVE |
| `/profile-review` | Redirect (`Navigate to="/mock-interview"`) | Candidate / AI Mock Interview / Review | Candidate | DEPRECATED (REDIRECTED) |
| `/profile-review/:id` | Redirect (`Navigate to="/mock-interview"`) | Candidate / AI Mock Interview / Review | Candidate | DEPRECATED (REDIRECTED) |
