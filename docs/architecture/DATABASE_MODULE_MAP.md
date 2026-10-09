# CandidateIQ — Database Schema & Model Mapping

## MongoDB Collections & Schemas (`server/models`)

| Model Name | Collection | Key Fields | Owning Module |
|---|---|---|---|
| `MockInterviewWorkspace` | `mockinterviewworkspaces` | `userId`, `resumeId`, `resumeName`, `jobDetails`, `configuration`, `attemptCount`, `latestScore`, `bestScore`, `status`, `isDeleted` | Candidate / Mock Interview |
| `Interview` | `interviews` | `candidate`, `workspaceId`, `jobTitle`, `interviewType`, `difficulty`, `status`, `mock_interview_questions`, `questions`, `evaluation`, `overallEvaluation` | Candidate / Mock Interview & Shared Interview |
| `Resume` | `resumes` | `candidate`, `fileName`, `originalName`, `keywords`, `extractedData`, `atsScore`, `parsedSkills` | Candidate / Profile & Shared Resume |
| `Job` | `jobs` | `title`, `company`, `role`, `description`, `requiredSkills`, `preferredSkills`, `status` | HR / Jobs & Shared |
| `User` | `users` | `name`, `email`, `role` (`candidate`/`recruiter`/`admin`), `summary`, `skills`, `projects`, `experience` | Shared / Auth & Admin |
| `Application` | `applications` | `candidateId`, `jobId`, `stage`, `matchScore`, `appliedAt` | HR / Candidate Management |
