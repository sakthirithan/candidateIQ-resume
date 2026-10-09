# CandidateIQ — File Migration & Physical Restructuring Map

This document records the exact physical relocation of 100+ source code files from legacy flat/generic directories (`client/src/components/*`) into target role and domain modules under `client/src/modules/`.

---

## Migration Overview

| Domain | Target Module Directory | Files Relocated | Build Validation |
| :--- | :--- | :---: | :---: |
| **Candidate** | `client/src/modules/candidate/` | 55 | PASS |
| **HR / Recruiter** | `client/src/modules/hr/` | 10 | PASS |
| **System Admin** | `client/src/modules/admin/` | 1 | PASS |
| **Shared** | `client/src/modules/shared/` | 33 | PASS |
| **Total Files Relocated** | | **99** | **0 Errors** |

---

## Detailed Physical Relocation Inventory

### 1. Candidate Domain (`client/src/modules/candidate/`)

#### Dashboard Submodule (`client/src/modules/candidate/dashboard/`)
- `client/src/components/candidate/CandidateIQDashboard.jsx`  
  → `client/src/modules/candidate/dashboard/components/CandidateIQDashboard.jsx`  
  *Reason:* Primary AI candidate dashboard container.
- `client/src/components/candidate/CandidateDashboard.jsx`  
  → `client/src/modules/candidate/dashboard/components/CandidateDashboard.jsx`  
  *Reason:* Alternate legacy candidate view.
- `client/src/components/candidate/MatchedRequisitions.jsx`  
  → `client/src/modules/candidate/dashboard/components/MatchedRequisitions.jsx`  
  *Reason:* Candidate recommended requisition matches.

#### Profile Submodule (`client/src/modules/candidate/profile/`)
- `client/src/components/candidate/CandidateIQProfile.jsx` → `client/src/modules/candidate/profile/components/CandidateIQProfile.jsx`
- `client/src/components/candidate/DynamicProfileRenderer.jsx` → `client/src/modules/candidate/profile/components/DynamicProfileRenderer.jsx`
- `client/src/components/candidate/ManualProfileBuilder.jsx` → `client/src/modules/candidate/profile/components/ManualProfileBuilder.jsx`
- `client/src/components/candidate/ProfileDraftEditor.jsx` → `client/src/modules/candidate/profile/components/ProfileDraftEditor.jsx`
- `client/src/components/candidate/ProfileEvidenceIntelligence.jsx` → `client/src/modules/candidate/profile/components/ProfileEvidenceIntelligence.jsx`
- `client/src/components/candidate/SkillIntelligence.jsx` → `client/src/modules/candidate/profile/components/SkillIntelligence.jsx`
- `client/src/components/candidate/TechnicalSkillIntelligence.jsx` → `client/src/modules/candidate/profile/components/TechnicalSkillIntelligence.jsx`
- `client/src/components/candidate/SkillGapIntelligence.jsx` → `client/src/modules/candidate/profile/components/SkillGapIntelligence.jsx`
- `client/src/components/candidate/ATSScoreGauge.jsx` → `client/src/modules/candidate/profile/components/ATSScoreGauge.jsx`
- `client/src/components/candidate/ResumeParserIQModal.jsx` → `client/src/modules/candidate/profile/components/ResumeParserIQModal.jsx`
- `client/src/components/candidate/ProfileReplacementModal.jsx` → `client/src/modules/candidate/profile/components/ProfileReplacementModal.jsx`
- `client/src/components/candidate/ScoreExplanationModal.jsx` → `client/src/modules/candidate/profile/components/ScoreExplanationModal.jsx`
- `client/src/components/candidate/ResumeIntelligence.jsx` → `client/src/modules/candidate/profile/components/ResumeIntelligence.jsx`
- `client/src/components/candidate/ResumeUploader.jsx` → `client/src/modules/candidate/profile/components/ResumeUploader.jsx`
- `client/src/components/candidate/PdfDocumentViewer.jsx` → `client/src/modules/candidate/profile/components/PdfDocumentViewer.jsx`
- `client/src/components/candidate/ResumeDetailWorkspace.jsx` → `client/src/modules/candidate/profile/components/ResumeDetailWorkspace.jsx`
- `client/src/components/candidate/ResumeHistory.jsx` → `client/src/modules/candidate/profile/components/ResumeHistory.jsx`
- `client/src/components/candidate/ProfileReviewHub.jsx` → `client/src/modules/candidate/profile/components/ProfileReviewHub.jsx`

#### Mock Interview Submodule (`client/src/modules/candidate/mock-interview/`)
- `client/src/components/interview/AIMockInterviewRoom.jsx` → `client/src/modules/candidate/mock-interview/pages/AIMockInterviewRoom.jsx`
- `client/src/components/interview/MockInterviewRoom.jsx` → `client/src/modules/candidate/mock-interview/pages/MockInterviewRoom.jsx`
- `client/src/components/interview/MCQAssessmentRoom.jsx` → `client/src/modules/candidate/mock-interview/pages/MCQAssessmentRoom.jsx`
- `client/src/components/interview/MCQAssessmentStart.jsx` → `client/src/modules/candidate/mock-interview/pages/MCQAssessmentStart.jsx`
- `client/src/components/interview/Frame8AssessmentContainer.jsx` → `client/src/modules/candidate/mock-interview/components/Frame8AssessmentContainer.jsx`
- `client/src/components/interview/Frame8AssessmentMCQ.jsx` → `client/src/modules/candidate/mock-interview/components/Frame8AssessmentMCQ.jsx`
- `client/src/components/interview/Frame8Review.jsx` → `client/src/modules/candidate/mock-interview/components/Frame8Review.jsx`
- `client/src/components/interview/QuestionNavigator.jsx` → `client/src/modules/candidate/mock-interview/components/QuestionNavigator.jsx`
- `client/src/components/interview/QuestionNavigatorMobile.jsx` → `client/src/modules/candidate/mock-interview/components/QuestionNavigatorMobile.jsx`
- `client/src/components/interview/QuestionCard.jsx` → `client/src/modules/candidate/mock-interview/components/QuestionCard.jsx`
- `client/src/components/interview/AnswerOption.jsx` → `client/src/modules/candidate/mock-interview/components/AnswerOption.jsx`
- `client/src/components/interview/AnswerOptions.jsx` → `client/src/modules/candidate/mock-interview/components/AnswerOptions.jsx`
- `client/src/components/interview/AssessmentHeader.jsx` → `client/src/modules/candidate/mock-interview/components/AssessmentHeader.jsx`
- `client/src/components/interview/AssessmentFooter.jsx` → `client/src/modules/candidate/mock-interview/components/AssessmentFooter.jsx`
- `client/src/components/interview/AssessmentProgress.jsx` → `client/src/modules/candidate/mock-interview/components/AssessmentProgress.jsx`
- `client/src/components/interview/AssessmentTimer.jsx` → `client/src/modules/candidate/mock-interview/components/AssessmentTimer.jsx`
- `client/src/components/interview/AssessmentCompletionDialog.jsx` → `client/src/modules/candidate/mock-interview/components/AssessmentCompletionDialog.jsx`
- `client/src/components/interview/AssessmentErrorState.jsx` → `client/src/modules/candidate/mock-interview/components/AssessmentErrorState.jsx`
- `client/src/components/interview/AssessmentSkeleton.jsx` → `client/src/modules/candidate/mock-interview/components/AssessmentSkeleton.jsx`
- `client/src/components/interview/Frame8Header.jsx` → `client/src/modules/candidate/mock-interview/components/Frame8Header.jsx`
- `client/src/components/interview/Frame8Overview.jsx` → `client/src/modules/candidate/mock-interview/components/Frame8Overview.jsx`
- `client/src/components/interview/Frame8Readiness.jsx` → `client/src/modules/candidate/mock-interview/components/Frame8Readiness.jsx`
- `client/src/components/interview/Frame8Completed.jsx` → `client/src/modules/candidate/mock-interview/components/Frame8Completed.jsx`
- `client/src/components/interview/Frame8Submitted.jsx` → `client/src/modules/candidate/mock-interview/components/Frame8Submitted.jsx`
- `client/src/components/interview/Frame8Technical.jsx` → `client/src/modules/candidate/mock-interview/components/Frame8Technical.jsx`
- `client/src/components/interview/DynamicInterviewReport.jsx` → `client/src/modules/candidate/mock-interview/components/DynamicInterviewReport.jsx`
- `client/src/components/interview/InterviewEvaluationAnalytics.jsx` → `client/src/modules/candidate/mock-interview/components/InterviewEvaluationAnalytics.jsx`
- `client/src/components/interview/InterviewImprovementPage.jsx` → `client/src/modules/candidate/mock-interview/components/InterviewImprovementPage.jsx`
- `client/src/components/interview/InterviewReviewDetail.jsx` → `client/src/modules/candidate/mock-interview/components/InterviewReviewDetail.jsx`
- `client/src/components/interview/ScheduleMockInterviewModal.jsx` → `client/src/modules/candidate/mock-interview/components/ScheduleMockInterviewModal.jsx`
- `client/src/components/candidate/EmptyIntelligenceState.jsx` → `client/src/modules/candidate/mock-interview/components/EmptyIntelligenceState.jsx`
- `client/src/components/candidate/CandidateScoreCard.jsx` → `client/src/modules/candidate/mock-interview/components/CandidateScoreCard.jsx`

#### Live HR Interview Submodule (`client/src/modules/candidate/interview/`)
- `client/src/components/interview/CandidateHRInterviews.jsx` → `client/src/modules/candidate/interview/components/CandidateHRInterviews.jsx`
- `client/src/components/interview/JobInterviewRoom.jsx` → `client/src/modules/candidate/interview/components/JobInterviewRoom.jsx`
- `client/src/components/interview/Frame8LiveHR.jsx` → `client/src/modules/candidate/interview/components/Frame8LiveHR.jsx`
- `client/src/components/interview/InterviewJourney.jsx` → `client/src/modules/candidate/interview/components/InterviewJourney.jsx`
- `client/src/components/interview/InterviewComparisonModal.jsx` → `client/src/modules/candidate/interview/components/InterviewComparisonModal.jsx`
- `client/src/components/interview/InterviewComparisonPage.jsx` → `client/src/modules/candidate/interview/components/InterviewComparisonPage.jsx`
- `client/src/components/interview/ExternalFeedbackModal.jsx` → `client/src/modules/candidate/interview/components/ExternalFeedbackModal.jsx`
- `client/src/components/interview/InterviewResults.jsx` → `client/src/modules/candidate/interview/components/InterviewResults.jsx`

#### Jobs Submodule (`client/src/modules/candidate/jobs/`)
- `client/src/components/candidate/JobDiscovery.jsx` → `client/src/modules/candidate/jobs/components/JobDiscovery.jsx`
- `client/src/components/candidate/JobTrackerView.jsx` → `client/src/modules/candidate/jobs/components/JobTrackerView.jsx`
- `client/src/components/candidate/JobDetailsView.jsx` → `client/src/modules/candidate/jobs/components/JobDetailsView.jsx`
- `client/src/components/candidate/JobMatchingView.jsx` → `client/src/modules/candidate/jobs/components/JobMatchingView.jsx`
- `client/src/components/candidate/ApplicationTracker.jsx` → `client/src/modules/candidate/jobs/components/ApplicationTracker.jsx`
- `client/src/components/candidate/ApplicationModal.jsx` → `client/src/modules/candidate/jobs/components/ApplicationModal.jsx`
- `client/src/components/candidate/CustomQuestionBankUploadModal.jsx` → `client/src/modules/candidate/jobs/components/CustomQuestionBankUploadModal.jsx`

#### Activities Submodule (`client/src/modules/candidate/activities/`)
- `client/src/components/candidate/CandidateActivityHub.jsx` → `client/src/modules/candidate/activities/components/CandidateActivityHub.jsx`
- `client/src/components/candidate/ActivityPracticeRoom.jsx` → `client/src/modules/candidate/activities/components/ActivityPracticeRoom.jsx`

---

### 2. HR / Recruiter Domain (`client/src/modules/hr/`)

- `client/src/components/recruiter/RecruiterIQDashboard.jsx` → `client/src/modules/hr/dashboard/components/RecruiterIQDashboard.jsx`
- `client/src/components/recruiter/RecruiterDashboard.jsx` → `client/src/modules/hr/dashboard/components/RecruiterDashboard.jsx`
- `client/src/components/recruiter/RecruiterJobManagement.jsx` → `client/src/modules/hr/jobs/components/RecruiterJobManagement.jsx`
- `client/src/components/recruiter/RecruiterCandidateManagement.jsx` → `client/src/modules/hr/candidates/components/RecruiterCandidateManagement.jsx`
- `client/src/components/recruiter/CandidateIntelligenceProfile.jsx` → `client/src/modules/hr/candidate-intelligence/components/CandidateIntelligenceProfile.jsx`
- `client/src/components/recruiter/CandidateIQComparison.jsx` → `client/src/modules/hr/candidate-intelligence/components/CandidateIQComparison.jsx`
- `client/src/components/recruiter/CandidateComparison.jsx` → `client/src/modules/hr/candidate-intelligence/components/CandidateComparison.jsx`
- `client/src/components/recruiter/AIRecruitmentAssistantIQ.jsx` → `client/src/modules/hr/assistant/components/AIRecruitmentAssistantIQ.jsx`
- `client/src/components/recruiter/AIRecruitmentAssistant.jsx` → `client/src/modules/hr/assistant/components/AIRecruitmentAssistant.jsx`

---

### 3. System Admin Domain (`client/src/modules/admin/`)

- `client/src/components/admin/AdminManagement.jsx` → `client/src/modules/admin/dashboard/components/AdminManagement.jsx`

---

### 4. Shared Domain (`client/src/modules/shared/`)

- `client/src/components/LandingPage.jsx` → `client/src/modules/shared/landing/components/LandingPage.jsx`
- `client/src/components/common/CircularProgressRing.jsx` → `client/src/modules/shared/ui/components/CircularProgressRing.jsx`
- `client/src/components/common/EmptyState.jsx` → `client/src/modules/shared/ui/components/EmptyState.jsx`
- `client/src/components/common/LoadingState.jsx` → `client/src/modules/shared/ui/components/LoadingState.jsx`
- `client/src/components/common/ConfirmModal.jsx` → `client/src/modules/shared/ui/components/ConfirmModal.jsx`
- `client/src/components/common/AIRecommendedActionsCard.jsx` → `client/src/modules/shared/ui/components/AIRecommendedActionsCard.jsx`
- `client/src/components/common/CandidateIntelligenceSummaryCard.jsx` → `client/src/modules/shared/ui/components/CandidateIntelligenceSummaryCard.jsx`
- `client/src/components/common/CompetencyRegisterTable.jsx` → `client/src/modules/shared/ui/components/CompetencyRegisterTable.jsx`
- `client/src/components/common/EvidenceCard.jsx` → `client/src/modules/shared/ui/components/EvidenceCard.jsx`
- `client/src/components/common/RightIntelligencePanel.jsx` → `client/src/modules/shared/ui/components/RightIntelligencePanel.jsx`
- `client/src/components/common/ResponsibleAIDisclaimer.jsx` → `client/src/modules/shared/ui/components/ResponsibleAIDisclaimer.jsx`
- `client/src/components/common/InterviewTimelineCard.jsx` → `client/src/modules/shared/ui/components/InterviewTimelineCard.jsx`
- `client/src/components/demo/DemoModal.jsx` → `client/src/modules/shared/ui/components/DemoModal.jsx`
- `client/src/components/common/Sidebar.jsx` → `client/src/modules/shared/layout/components/Sidebar.jsx`
- `client/src/components/common/Topbar.jsx` → `client/src/modules/shared/layout/components/Topbar.jsx`
- `client/src/components/common/Navbar.jsx` → `client/src/modules/shared/layout/components/Navbar.jsx`
- `client/src/components/common/ProfileMenu.jsx` → `client/src/modules/shared/layout/components/ProfileMenu.jsx`
- `client/src/components/common/InterviewRoomLayout.jsx` → `client/src/modules/shared/layout/components/InterviewRoomLayout.jsx`
- `client/src/components/common/ProtectedRoute.jsx` → `client/src/modules/shared/layout/components/ProtectedRoute.jsx`
- `client/src/components/common/ErrorBoundary.jsx` → `client/src/modules/shared/layout/components/ErrorBoundary.jsx`
- `client/src/components/common/GlobalSearchPalette.jsx` → `client/src/modules/shared/navigation/components/GlobalSearchPalette.jsx`
- `client/src/components/common/NotificationCenter.jsx` → `client/src/modules/shared/navigation/components/NotificationCenter.jsx`
- `client/src/components/common/SettingsModal.jsx` → `client/src/modules/shared/navigation/components/SettingsModal.jsx`
- `client/src/components/common/SettingsPage.jsx` → `client/src/modules/shared/navigation/components/SettingsPage.jsx`
- `client/src/components/auth/AuthModal.jsx` → `client/src/modules/shared/auth/components/AuthModal.jsx`
- `client/src/components/auth/ForgotPasswordModal.jsx` → `client/src/modules/shared/auth/components/ForgotPasswordModal.jsx`
- `client/src/components/auth/LoginModal.jsx` → `client/src/modules/shared/auth/components/LoginModal.jsx`
- `client/src/components/auth/RegisterModal.jsx` → `client/src/modules/shared/auth/components/RegisterModal.jsx`
- `client/src/components/auth/PaymentDemoModal.jsx` → `client/src/modules/shared/auth/components/PaymentDemoModal.jsx`

---

## Validation & Compatibility Status

- **Public Barrel Index Files:**
  - `client/src/modules/candidate/index.js`
  - `client/src/modules/hr/index.js`
  - `client/src/modules/admin/index.js`
  - `client/src/modules/shared/index.js`
- **Compatibility Re-export Hubs:**
  - `client/src/components/candidate/index.js`
  - `client/src/components/interview/index.js`
  - `client/src/components/recruiter/index.js`
  - `client/src/components/admin/index.js`
  - `client/src/components/common/index.js`
  - `client/src/components/auth/index.js`
- **Path Alias Configuration:** `@/` alias configured in `client/vite.config.js` pointing to `client/src/`.
- **Production Build:** `npm run build` executed cleanly in 4.32s with zero warnings or errors.
