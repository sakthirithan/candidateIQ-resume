# CandidateIQ — Final Physical Source Tree Map

*Generated from the actual workspace filesystem post-refactoring.*

## Frontend Domain Modules (`client/src/modules/`)

```text
client/src/modules/
├── admin/
│   ├── dashboard/
│   │   └── components/
│   │       └── AdminManagement.jsx
│   └── index.js
├── candidate/
│   ├── activities/
│   │   └── components/
│   │       ├── ActivityPracticeRoom.jsx
│   │       └── CandidateActivityHub.jsx
│   ├── dashboard/
│   │   └── components/
│   │       ├── CandidateDashboard.jsx
│   │       ├── CandidateIQDashboard.jsx
│   │       └── MatchedRequisitions.jsx
│   ├── interview/
│   │   └── components/
│   │       ├── CandidateHRInterviews.jsx
│   │       ├── ExternalFeedbackModal.jsx
│   │       ├── Frame8LiveHR.jsx
│   │       ├── InterviewComparisonModal.jsx
│   │       ├── InterviewComparisonPage.jsx
│   │       ├── InterviewJourney.jsx
│   │       ├── InterviewResults.jsx
│   │       └── JobInterviewRoom.jsx
│   ├── jobs/
│   │   └── components/
│   │       ├── ApplicationModal.jsx
│   │       ├── ApplicationTracker.jsx
│   │       ├── CustomQuestionBankUploadModal.jsx
│   │       ├── JobDetailsView.jsx
│   │       ├── JobDiscovery.jsx
│   │       ├── JobMatchingView.jsx
│   │       └── JobTrackerView.jsx
│   ├── mock-interview/
│   │   ├── components/
│   │   │   ├── AnswerOption.jsx
│   │   │   ├── AnswerOptions.jsx
│   │   │   ├── AssessmentCompletionDialog.jsx
│   │   │   ├── AssessmentErrorState.jsx
│   │   │   ├── AssessmentFooter.jsx
│   │   │   ├── AssessmentHeader.jsx
│   │   │   ├── AssessmentProgress.jsx
│   │   │   ├── AssessmentSkeleton.jsx
│   │   │   ├── AssessmentTimer.jsx
│   │   │   ├── CandidateScoreCard.jsx
│   │   │   ├── DynamicInterviewReport.jsx
│   │   │   ├── EmptyIntelligenceState.jsx
│   │   │   ├── Frame8AssessmentContainer.jsx
│   │   │   ├── Frame8AssessmentMCQ.jsx
│   │   │   ├── Frame8Completed.jsx
│   │   │   ├── Frame8Header.jsx
│   │   │   ├── Frame8Overview.jsx
│   │   │   ├── Frame8Readiness.jsx
│   │   │   ├── Frame8Review.jsx
│   │   │   ├── Frame8Submitted.jsx
│   │   │   ├── Frame8Technical.jsx
│   │   │   ├── InterviewEvaluationAnalytics.jsx
│   │   │   ├── InterviewImprovementPage.jsx
│   │   │   ├── InterviewReviewDetail.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── QuestionNavigator.jsx
│   │   │   ├── QuestionNavigatorMobile.jsx
│   │   │   └── ScheduleMockInterviewModal.jsx
│   │   └── pages/
│   │       ├── AIMockInterviewRoom.jsx
│   │       ├── MCQAssessmentRoom.jsx
│   │       ├── MCQAssessmentStart.jsx
│   │       └── MockInterviewRoom.jsx
│   ├── profile/
│   │   └── components/
│   │       ├── ATSScoreGauge.jsx
│   │       ├── CandidateIQProfile.jsx
│   │       ├── DynamicProfileRenderer.jsx
│   │       ├── ManualProfileBuilder.jsx
│   │       ├── PdfDocumentViewer.jsx
│   │       ├── ProfileDraftEditor.jsx
│   │       ├── ProfileEvidenceIntelligence.jsx
│   │       ├── ProfileReplacementModal.jsx
│   │       ├── ProfileReviewHub.jsx
│   │       ├── ResumeDetailWorkspace.jsx
│   │       ├── ResumeHistory.jsx
│   │       ├── ResumeIntelligence.jsx
│   │       ├── ResumeParserIQModal.jsx
│   │       ├── ResumeUploader.jsx
│   │       ├── ScoreExplanationModal.jsx
│   │       ├── SkillGapIntelligence.jsx
│   │       ├── SkillIntelligence.jsx
│   │       └── TechnicalSkillIntelligence.jsx
│   └── index.js
├── hr/
│   ├── assistant/
│   │   └── components/
│   │       ├── AIRecruitmentAssistant.jsx
│   │       └── AIRecruitmentAssistantIQ.jsx
│   ├── candidate-intelligence/
│   │   └── components/
│   │       ├── CandidateComparison.jsx
│   │       ├── CandidateIntelligenceProfile.jsx
│   │       └── CandidateIQComparison.jsx
│   ├── candidates/
│   │   └── components/
│   │       └── RecruiterCandidateManagement.jsx
│   ├── dashboard/
│   │   └── components/
│   │       ├── RecruiterDashboard.jsx
│   │       └── RecruiterIQDashboard.jsx
│   ├── jobs/
│   │   └── components/
│   │       └── RecruiterJobManagement.jsx
│   └── index.js
└── shared/
    ├── auth/
    │   └── components/
    │       ├── AuthModal.jsx
    │       ├── ForgotPasswordModal.jsx
    │       ├── LoginModal.jsx
    │       ├── PaymentDemoModal.jsx
    │       └── RegisterModal.jsx
    ├── landing/
    │   └── components/
    │       └── LandingPage.jsx
    ├── layout/
    │   └── components/
    │       ├── ErrorBoundary.jsx
    │       ├── InterviewRoomLayout.jsx
    │       ├── Navbar.jsx
    │       ├── ProfileMenu.jsx
    │       ├── ProtectedRoute.jsx
    │       ├── Sidebar.jsx
    │       └── Topbar.jsx
    ├── navigation/
    │   └── components/
    │       ├── GlobalSearchPalette.jsx
    │       ├── NotificationCenter.jsx
    │       ├── SettingsModal.jsx
    │       └── SettingsPage.jsx
    ├── ui/
    │   └── components/
    │       ├── AIRecommendedActionsCard.jsx
    │       ├── CandidateIntelligenceSummaryCard.jsx
    │       ├── CircularProgressRing.jsx
    │       ├── CompetencyRegisterTable.jsx
    │       ├── ConfirmModal.jsx
    │       ├── DemoModal.jsx
    │       ├── EmptyState.jsx
    │       ├── EvidenceCard.jsx
    │       ├── InterviewTimelineCard.jsx
    │       ├── LoadingState.jsx
    │       ├── ResponsibleAIDisclaimer.jsx
    │       └── RightIntelligencePanel.jsx
    ├── index.js
    └── SHARED_CHANGE_LOG.md
```

## Backend Microservices & Controllers (`server/`)

```text
server/
├── ai/
│   ├── orchestrator/
│   │   └── aiOrchestrator.js
│   ├── prompts/
│   │   ├── analysisPrompts.js
│   │   ├── evaluationPrompts.js
│   │   ├── interviewEnginePrompts.js
│   │   ├── interviewPrompts.js
│   │   ├── jobPrompts.js
│   │   └── resumePrompts.js
│   ├── providers/
│   │   ├── fallbackProvider.js
│   │   ├── geminiProvider.js
│   │   └── groqProvider.js
│   ├── router/
│   │   └── aiModelRouter.js
│   ├── schemas/
│   │   ├── analysisSchemas.js
│   │   ├── evaluationSchemas.js
│   │   ├── interviewEngineSchemas.js
│   │   ├── interviewSchemas.js
│   │   ├── jobSchemas.js
│   │   └── resumeSchemas.js
│   ├── services/
│   │   ├── evaluationAIService.js
│   │   ├── interviewAIService.js
│   │   ├── jobAIService.js
│   │   ├── languageAIService.js
│   │   └── resumeAIService.js
│   └── utils/
│       ├── aiLogger.js
│       └── jsonParser.js
├── config/
│   ├── candidateIntelligenceConfig.js
│   └── db.js
├── controllers/
│   ├── adminController.js
│   ├── aiTestController.js
│   ├── analyticsController.js
│   ├── authController.js
│   ├── candidateIntelligenceController.js
│   ├── candidateInterviewJourneyController.js
│   ├── candidateSkillsController.js
│   ├── improvementActivityController.js
│   ├── interviewController.js
│   ├── jobController.js
│   ├── mockInterviewController.js
│   ├── profileController.js
│   └── resumeController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── uploadMiddleware.js
├── models/
│   ├── Application.js
│   ├── CandidateIntelligenceSnapshot.js
│   ├── CandidateProfile.js
│   ├── ImprovementActivity.js
│   ├── Interview.js
│   ├── Job.js
│   ├── MockInterviewWorkspace.js
│   ├── PracticeSession.js
│   ├── Resume.js
│   └── User.js
├── routes/
│   ├── adminRoutes.js
│   ├── aiTestRoutes.js
│   ├── analyticsRoutes.js
│   ├── authRoutes.js
│   ├── improvementActivityRoutes.js
│   ├── interviewRoutes.js
│   ├── jobRoutes.js
│   ├── mockInterviewRoutes.js
│   ├── profileRoutes.js
│   └── resumeRoutes.js
├── seed/
│   └── seedDemoData.js
├── services/
│   ├── ai/
│   │   ├── improvement/
│   │   │   ├── activityGeneratorService.js
│   │   │   ├── practiceEvaluatorService.js
│   │   │   └── practiceQuestionGenerator.js
│   │   └── mockInterview/
│   │       ├── generateQuestionsService.js
│   │       ├── generationProgressEmitter.js
│   │       ├── generationStages.js
│   │       ├── mockInterviewEvaluator.js
│   │       └── mockInterviewSchemas.js
│   ├── interview/
│   │   ├── InterviewAnswerEvaluator.js
│   │   ├── InterviewContextBuilder.js
│   │   ├── InterviewFinalEvaluator.js
│   │   └── InterviewQuestionEngine.js
│   ├── aiService.js
│   ├── candidateIntelligenceService.js
│   ├── candidateInterviewJourney.service.js
│   ├── candidateJobIntelligence.service.js
│   └── candidateSkillIntelligence.service.js
├── utils/
│   └── keywordNormalizer.js
├── .env
├── .env.example
├── package-lock.json
├── package.json
├── server.js
├── test_interview_engine.js
├── test_mock_interview_e2e.js
├── test_resume_lifecycle_e2e.js
└── test_suite.js
```
