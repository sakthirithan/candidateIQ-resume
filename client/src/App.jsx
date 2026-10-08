import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate, useParams } from 'react-router-dom';
import LandingPage from './modules/shared/landing/components/LandingPage';
import {
  Sidebar, Topbar, NotificationCenter, SettingsPage, SettingsModal, ErrorBoundary, GlobalSearchPalette
} from './modules/shared';
import {
  CandidateIQDashboard, CandidateIQProfile, ResumeIntelligence, ResumeHistory, SkillIntelligence,
  JobDiscovery, JobDetailsView, JobTrackerView, SkillGapIntelligence, ApplicationTracker, ProfileEvidenceIntelligence, ProfileReviewHub, CandidateActivityHub
} from './modules/candidate';

import {
  AIMockInterviewRoom, InterviewResults, InterviewEvaluationAnalytics, InterviewJourney, InterviewComparisonPage, CandidateHRInterviews, JobInterviewRoom, InterviewImprovementPage
} from './modules/candidate';

import {
  RecruiterIQDashboard, RecruiterJobManagement, CandidateIntelligenceProfile,
  RecruiterCandidateManagement, CandidateIQComparison, AIRecruitmentAssistantIQ,
  CreateInterviewPage, RecruiterInterviewsPage
} from './modules/hr';

import { LoginModal, RegisterModal, PaymentDemoModal, ForgotPasswordModal, DemoModal } from './modules/shared';
import { AdminManagement } from './modules/admin';

import { getCurrentUser, logoutUser, initAuthStorage, updateUser } from './utils/auth';
import { mockNotificationService } from './services/mockApi/notificationService';

function InterviewImprovementRouteWrapper() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  return (
    <InterviewImprovementPage
      interviewId={interviewId}
      onBack={() => navigate('/activities')}
      onNavigateToMockInterview={() => navigate('/interview')}
    />
  );
}

function JobDetailsRouteWrapper({ returnTab, navigateTab, selectedJobId, setSelectedJobId }) {
  const { jobId } = useParams();
  const effectiveId = jobId || selectedJobId;

  useEffect(() => {
    if (jobId && jobId !== selectedJobId) {
      setSelectedJobId(jobId);
    }
  }, [jobId, selectedJobId, setSelectedJobId]);

  return (
    <JobDetailsView
      jobId={effectiveId}
      returnTab={returnTab}
      onBack={() => navigateTab(returnTab || 'jobs')}
      onNavigate={navigateTab}
    />
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('job_1');
  const [jobDetailsReturnTab, setJobDetailsReturnTab] = useState('jobs');
  const [targetedSkill, setTargetedSkill] = useState(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pendingHrUser, setPendingHrUser] = useState(null);
  const [interviewReport, setInterviewReport] = useState(null);

  // Sync route URL pathname to activeTab & selectedJobId
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '') {
      setActiveTab('landing');
    } else if (path.startsWith('/jobs/') || path.startsWith('/job-details/')) {
      const parts = path.split('/');
      const idFromPath = parts[parts.length - 1];
      if (idFromPath && idFromPath !== 'job-details' && idFromPath !== 'jobs') {
        setSelectedJobId(idFromPath);
      }
      setActiveTab('job-details');
    } else {
      const tabFromPath = path.substring(1);
      if (tabFromPath === 'applications') {
        setActiveTab('tracker');
      } else if (tabFromPath) {
        setActiveTab(tabFromPath);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    initAuthStorage();
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const userRole = currentUser ? currentUser.role : 'guest';

  const [unreadCount, setUnreadCount] = useState(() => {
    const roleForNotif = userRole === 'hr' ? 'recruiter' : (userRole === 'admin' ? 'recruiter' : 'candidate');
    return mockNotificationService.getUnreadCount(roleForNotif);
  });

  useEffect(() => {
    const roleForNotif = userRole === 'hr' ? 'recruiter' : (userRole === 'admin' ? 'recruiter' : 'candidate');
    setUnreadCount(mockNotificationService.getUnreadCount(roleForNotif));

    const unsubscribe = mockNotificationService.subscribe(() => {
      setUnreadCount(mockNotificationService.getUnreadCount(roleForNotif));
    });
    return () => unsubscribe();
  }, [userRole]);

  const [initialJobForMock, setInitialJobForMock] = useState(null);

  // Tab navigation handler with URL redirect
  const navigateTab = (tab, extraData) => {
    setActiveTab(tab);
    if (tab === 'landing') {
      navigate('/');
    } else if (tab === 'job-details') {
      const targetJobId = extraData || selectedJobId || 'job_1';
      if (extraData) setSelectedJobId(extraData);
      navigate(`/jobs/${targetJobId}`);
    } else if (tab === 'interview' && extraData) {
      setInitialJobForMock(extraData);
      navigate('/interview');
    } else if (tab === 'applications') {
      navigate('/tracker');
    } else {
      navigate(`/${tab}`);
    }
  };

  const handleRoleChange = (newRole) => {
    const updated = updateUser({ role: newRole });
    if (updated) {
      setCurrentUser({ ...updated });
    }
    const nextTab = newRole === 'candidate' ? 'dashboard' : newRole === 'admin' ? 'admin-dashboard' : 'recruiter-dashboard';
    navigateTab(nextTab);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    if (user.role === 'hr') {
      if (user.paymentStatus === 'pending') {
        setPendingHrUser(user);
        setIsPaymentModalOpen(true);
      } else {
        navigateTab('recruiter-dashboard');
      }
    } else if (user.role === 'admin') {
      navigateTab('admin-dashboard');
    } else {
      navigateTab('dashboard');
    }
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    setIsRegisterModalOpen(false);
    navigateTab('dashboard');
  };

  const handleRequireHrPayment = (user) => {
    setPendingHrUser(user);
    setIsRegisterModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (user) => {
    setCurrentUser(user);
    setIsPaymentModalOpen(false);
    navigateTab('recruiter-dashboard');
  };

  const [isAssessmentActive, setIsAssessmentActive] = useState(false);

  useEffect(() => {
    const checkAssessmentClass = () => {
      setIsAssessmentActive(document.body.classList.contains('hide-nav-sidebar'));
    };
    checkAssessmentClass();
    const observer = new MutationObserver(checkAssessmentClass);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigateTab('landing');
  };

  const isStandalonePage =
    activeTab === 'landing' ||
    location.pathname.startsWith('/job-interview') ||
    isAssessmentActive;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex text-slate-900 font-sans antialiased">
      {/* Global Sidebar Shell (Hidden on Landing page and Standalone Test Rooms) */}
      {!isStandalonePage && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={navigateTab}
          userRole={userRole}
          setUserRole={handleRoleChange}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Topbar Header (Hidden on Landing page and Standalone Test Rooms) */}
        {!isStandalonePage && (
          <Topbar
            activeTab={activeTab}
            userRole={userRole}
            onOpenAuth={() => setIsLoginModalOpen(true)}
            onOpenNotifications={() => setIsNotifOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onNavigateToProfile={() => navigateTab('profile')}
            onLogout={handleLogout}
            unreadCount={unreadCount}
          />
        )}

        {/* Dynamic Route View Content */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={
                <LandingPage
                  onGetStarted={() => setIsRegisterModalOpen(true)}
                  onLogin={() => setIsLoginModalOpen(true)}
                  onRegister={() => setIsRegisterModalOpen(true)}
                  onRegisterCandidate={() => setIsRegisterModalOpen(true)}
                  onRegisterRecruiter={() => setIsRegisterModalOpen(true)}
                  onExploreDemo={() => setIsDemoModalOpen(true)}
                  onExploreCandidateDemo={() => setIsDemoModalOpen(true)}
                  onExploreRecruiterDemo={() => setIsDemoModalOpen(true)}
                  onOpenWorkspace={() => {
                    if (currentUser?.role === 'hr') navigateTab('recruiter-dashboard');
                    else if (currentUser?.role === 'admin') navigateTab('admin-dashboard');
                    else navigateTab('dashboard');
                  }}
                  onOpenSettings={() => setIsSettingsModalOpen(true)}
                  onNavigateToProfile={() => navigateTab('profile')}
                  onLogout={handleLogout}
                />
              }
            />

            {/* Candidate Routes */}
            <Route path="/dashboard" element={<CandidateIQDashboard onNavigate={navigateTab} />} />
            <Route path="/profile" element={<CandidateIQProfile />} />
            <Route path="/resume-history" element={<ResumeHistory />} />
            <Route path="/resumes" element={<ResumeHistory />} />
            <Route path="/resume-intelligence" element={<ResumeIntelligence />} />
            <Route path="/skills" element={<SkillIntelligence />} />
            <Route
              path="/jobs"
              element={
                <ErrorBoundary title="Job Discovery Error">
                  <JobDiscovery
                    onSelectJob={(jobId) => {
                      setSelectedJobId(jobId);
                      setJobDetailsReturnTab('jobs');
                      navigateTab('job-details', jobId);
                    }}
                  />
                </ErrorBoundary>
              }
            />
            <Route
              path="/jobs/:jobId"
              element={
                <ErrorBoundary title="Job Details Error">
                  <JobDetailsRouteWrapper
                    returnTab={jobDetailsReturnTab}
                    navigateTab={navigateTab}
                    selectedJobId={selectedJobId}
                    setSelectedJobId={setSelectedJobId}
                  />
                </ErrorBoundary>
              }
            />
            <Route
              path="/job-details/:jobId"
              element={
                <ErrorBoundary title="Job Details Error">
                  <JobDetailsRouteWrapper
                    returnTab={jobDetailsReturnTab}
                    navigateTab={navigateTab}
                    selectedJobId={selectedJobId}
                    setSelectedJobId={setSelectedJobId}
                  />
                </ErrorBoundary>
              }
            />
            <Route
              path="/job-details"
              element={
                <ErrorBoundary title="Job Details Error">
                  <JobDetailsRouteWrapper
                    returnTab={jobDetailsReturnTab}
                    navigateTab={navigateTab}
                    selectedJobId={selectedJobId}
                    setSelectedJobId={setSelectedJobId}
                  />
                </ErrorBoundary>
              }
            />
            <Route
              path="/tracker"
              element={
                <JobTrackerView
                  onNavigateToJobDetails={(jobId) => {
                    setSelectedJobId(jobId);
                    setJobDetailsReturnTab('tracker');
                    navigateTab('job-details', jobId);
                  }}
                  onExploreJobs={() => navigateTab('jobs')}
                />
              }
            />
            <Route
              path="/applications"
              element={
                <JobTrackerView
                  onNavigateToJobDetails={(jobId) => {
                    setSelectedJobId(jobId);
                    setJobDetailsReturnTab('tracker');
                    navigateTab('job-details', jobId);
                  }}
                  onExploreJobs={() => navigateTab('jobs')}
                />
              }
            />
            <Route
              path="/interview-journey"
              element={
                <InterviewJourney
                  onLaunchTargetedInterview={(skillName) => {
                    setTargetedSkill(skillName);
                    navigateTab('interview');
                  }}
                />
              }
            />
            <Route
              path="/profile-review"
              element={<Navigate to="/mock-interview" replace />}
            />
            <Route
              path="/profile-review/compare"
              element={<Navigate to="/mock-interview" replace />}
            />
            <Route
              path="/profile-review/:interviewId"
              element={<Navigate to="/mock-interview" replace />}
            />
            <Route
              path="/ai-mock-interview/profile-review/:interviewId"
              element={<Navigate to="/mock-interview" replace />}
            />
            <Route
              path="/evidence-intelligence"
              element={<Navigate to="/mock-interview" replace />}
            />
            <Route
              path="/candidate/interviews"
              element={<CandidateHRInterviews />}
            />
            <Route
              path="/hr-interviews"
              element={<CandidateHRInterviews />}
            />
            {/* Dedicated Job Interview Standalone Room Routes */}
            <Route
              path="/job-interview/:interviewId/instructions"
              element={
                <ErrorBoundary title="Job Interview Room Error">
                  <JobInterviewRoom mode="instructions" />
                </ErrorBoundary>
              }
            />
            <Route
              path="/job-interview/:interviewId/room"
              element={
                <ErrorBoundary title="Job Interview Room Error">
                  <JobInterviewRoom mode="room" />
                </ErrorBoundary>
              }
            />
            <Route
              path="/job-interview/:interviewId"
              element={
                <ErrorBoundary title="Job Interview Room Error">
                  <JobInterviewRoom mode="instructions" />
                </ErrorBoundary>
              }
            />
            <Route
              path="/interview"
              element={
                <ErrorBoundary title="AI Mock Interview Room Error">
                  <AIMockInterviewRoom
                    targetSkill={targetedSkill}
                    initialJobData={initialJobForMock}
                    onComplete={(report) => {
                      setInterviewReport(report);
                      setTargetedSkill(null);
                      setInitialJobForMock(null);
                    }}
                  />
                </ErrorBoundary>
              }
            />
            <Route
              path="/mock-interview"
              element={
                <ErrorBoundary title="AI Mock Interview Room Error">
                  <AIMockInterviewRoom
                    targetSkill={targetedSkill}
                    initialJobData={initialJobForMock}
                    onComplete={(report) => {
                      setInterviewReport(report);
                      setTargetedSkill(null);
                      setInitialJobForMock(null);
                    }}
                  />
                </ErrorBoundary>
              }
            />
            <Route path="/interview-results" element={<InterviewResults report={interviewReport} />} />
            <Route path="/interview-evaluation" element={<Navigate to="/mock-interview" replace />} />
            <Route path="/interview/:interviewId/improvement" element={<InterviewImprovementRouteWrapper />} />
            <Route path="/interviews/:interviewId/improvement" element={<InterviewImprovementRouteWrapper />} />
            <Route
              path="/activities"
              element={
                <ErrorBoundary title="Activities Engine Error">
                  <CandidateActivityHub onNavigateToInterview={() => navigateTab('interview')} />
                </ErrorBoundary>
              }
            />
            <Route
              path="/activities/:activityId"
              element={
                <ErrorBoundary title="Activities Practice Error">
                  <CandidateActivityHub onNavigateToInterview={() => navigateTab('interview')} />
                </ErrorBoundary>
              }
            />
            <Route path="/skill-gaps" element={<SkillGapIntelligence />} />

            {/* Recruiter Routes */}
            <Route path="/recruiter-dashboard" element={<RecruiterIQDashboard onNavigate={navigateTab} />} />
            <Route path="/jobs-recruiter" element={<RecruiterJobManagement />} />
            <Route
              path="/candidates-recruiter"
              element={
                <ErrorBoundary title="Candidate Management Error">
                  <RecruiterCandidateManagement onNavigate={navigateTab} />
                </ErrorBoundary>
              }
            />
            <Route
              path="/hr-interviews-recruiter"
              element={
                <ErrorBoundary title="Candidate Video Interviews Error">
                  <RecruiterInterviewsPage onNavigate={navigateTab} />
                </ErrorBoundary>
              }
            />
            <Route
              path="/hr/interviews"
              element={
                <ErrorBoundary title="Candidate Video Interviews Error">
                  <RecruiterInterviewsPage onNavigate={navigateTab} />
                </ErrorBoundary>
              }
            />
            <Route
              path="/create-interview-recruiter"
              element={
                <ErrorBoundary title="Create Video Interview Error">
                  <CreateInterviewPage onNavigate={navigateTab} />
                </ErrorBoundary>
              }
            />
            <Route
              path="/hr/interviews/create"
              element={
                <ErrorBoundary title="Create Video Interview Error">
                  <CreateInterviewPage onNavigate={navigateTab} />
                </ErrorBoundary>
              }
            />
            <Route
              path="/candidate-intelligence"
              element={
                <ErrorBoundary title="Candidate Intelligence Profile Error">
                  <CandidateIntelligenceProfile />
                </ErrorBoundary>
              }
            />
            <Route path="/comparison" element={<CandidateIQComparison />} />
            <Route path="/assistant" element={<AIRecruitmentAssistantIQ />} />

            {/* Admin Route */}
            <Route path="/admin-dashboard" element={<AdminManagement />} />

            {/* Settings Route */}
            <Route path="/settings" element={<SettingsPage userRole={userRole} currentUser={currentUser} />} />

            {/* Catch-All Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Interactive Demo Sandbox Modal (No Route Redirect) */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onLaunchFullWorkspace={(role) => {
          setIsDemoModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
        onSwitchToForgotPassword={() => {
          setIsLoginModalOpen(false);
          setIsForgotPasswordModalOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        onRequireHrPayment={handleRequireHrPayment}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        onSwitchToLogin={() => {
          setIsForgotPasswordModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* HR Demo Payment Modal */}
      <PaymentDemoModal
        isOpen={isPaymentModalOpen}
        user={pendingHrUser}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
      />

      {/* Global Notification Drawer */}
      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        userRole={userRole}
      />

      {/* Global Command/Search Palette (Module 21) */}
      <GlobalSearchPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(targetTab) => {
          navigateTab(targetTab);
          setIsSearchOpen(false);
        }}
        userRole={userRole}
      />
    </div>
  );
}

export default App;
