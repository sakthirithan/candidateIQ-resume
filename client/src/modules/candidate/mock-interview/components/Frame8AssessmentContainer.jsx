import React, { useState, useEffect, useRef } from 'react';
import Frame8Header from './Frame8Header';
import Frame8Overview from './Frame8Overview';
import Frame8Readiness from './Frame8Readiness';
import Frame8AssessmentMCQ from './Frame8AssessmentMCQ';
import Frame8Review from './Frame8Review';
import Frame8Submitted from './Frame8Submitted';
import Frame8Technical from './Frame8Technical';
import Frame8LiveHR from '../../interview/components/Frame8LiveHR';
import Frame8Completed from './Frame8Completed';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

export default function Frame8AssessmentContainer({
  assessmentTitle = 'CandidateIQ Mock Assessment',
  candidateName = 'SAKTHI M',
  candidateId = '7376242AD284',
  questions = [],
  initialStep = 'overview', // 'overview' | 'readiness' | 'assessment' | 'review' | 'submitted' | 'technical' | 'hr-readiness' | 'live-hr' | 'confirmation' | 'completed'
  durationMinutes = 45,
  initialAnswers = {},
  onSaveAnswer,
  onComplete,
  onBackToDashboard
}) {
  // Active state: 'overview' | 'readiness' | 'assessment' | 'review' | 'submitted' | 'technical' | 'hr-readiness' | 'live-hr' | 'confirmation' | 'completed'
  const [step, setStep] = useState(initialStep);

  // Stepper Round Statuses
  const [round1Status, setRound1Status] = useState('Ready to start'); // 'Ready to start' | 'In progress' | 'Completed'
  const [round2Status, setRound2Status] = useState('Pending');        // 'Pending' | 'Available' | 'In progress' | 'Completed'
  const [round3Status, setRound3Status] = useState('Pending');        // 'Pending' | 'Available' | 'In progress' | 'Completed'
  const [currentRound, setCurrentRound] = useState(1);

  // Assessment Question state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submittedAnswers, setSubmittedAnswers] = useState(initialAnswers || {});
  const [savedTimestampStr, setSavedTimestampStr] = useState('');

  // Countdown timer state (seconds) - Timer starts ONLY when assessment starts
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Anti-cheating / Focus enforcement
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);

  // Default sample question bank if none supplied
  const defaultQuestions = [
    {
      id: 'q_1',
      category: 'Data Structures · Stacks',
      targetSkill: 'Stacks & Queues',
      questionText: 'Which data structure is most suitable for checking balanced parentheses in an expression?',
      contextSnippet: 'Read the expression from left to right. Opening brackets must be matched with the most recently encountered unmatched opening bracket.\nExpression: {[ (a + b) * c ]}',
      type: 'MCQ',
      options: ['A. Queue', 'B. Stack', 'C. Min heap', 'D. Hash table', 'E. Binary search tree']
    },
    {
      id: 'q_2',
      category: 'Algorithms · Binary Search',
      targetSkill: 'Time Complexity',
      questionText: 'What is the worst-case time complexity of searching for an element in a balanced Binary Search Tree (BST) of size N?',
      contextSnippet: 'Assume the tree is perfectly balanced with height log2(N).',
      type: 'MCQ',
      options: ['A. O(1)', 'B. O(log N)', 'C. O(N)', 'D. O(N log N)']
    },
    {
      id: 'q_3',
      category: 'System Design · Caching',
      targetSkill: 'Redis & Distributed Caching',
      questionText: 'Explain how you prevent cache stampede (thundering herd problem) in a high-concurrency Node.js microservice.',
      type: 'TEXT'
    },
    {
      id: 'q_4',
      category: 'Coding · Algorithms',
      targetSkill: 'String Manipulation',
      questionText: 'Implement isBalanced(text) for (), [] and {}. Return true only when every opening bracket has a correctly nested match.',
      type: 'CODING',
      initialCode: 'def isBalanced(text):\n    stack = []\n    # Implement solution\n    return not stack'
    },
    {
      id: 'q_5',
      category: 'Behavioral · Ownership',
      targetSkill: 'STAR Methodology',
      questionText: 'Describe a time you encountered a severe production bug under tight deadlines. What actions did you take and what did you learn?',
      type: 'VOICE'
    }
  ];

  const activeQuestions = questions.length > 0 ? questions : defaultQuestions;

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (isTimerRunning && remainingSeconds > 0) {
      timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto submit when time expires
            handleAutoSubmitOnTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, remainingSeconds]);

  // Hide Sidebar & Topbar Nav bar during active assessment
  useEffect(() => {
    if (step && step !== 'overview') {
      document.body.classList.add('hide-nav-sidebar');
    } else {
      document.body.classList.remove('hide-nav-sidebar');
    }
    return () => {
      document.body.classList.remove('hide-nav-sidebar');
    };
  }, [step]);

  // Tab switch listener (Proctoring focus loss)
  useEffect(() => {
    if (step !== 'assessment') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitchCount((prev) => prev + 1);
        setShowTabSwitchWarning(true);
      }
    };

    const handleBlur = () => {
      setTabSwitchCount((prev) => prev + 1);
      setShowTabSwitchWarning(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [step]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (step === 'assessment') {
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        } else if (e.key === 'ArrowRight' && currentIndex < activeQuestions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, currentIndex, activeQuestions.length]);

  // Handler: Begin Assessment from Readiness screen (Timer starts ONLY here!)
  const handleBeginAssessment = () => {
    setStep('assessment');
    setRound1Status('In progress');
    setCurrentRound(1);
    setIsTimerRunning(true);
  };

  // Handler: Save Answer
  const handleSaveAnswer = (qId, ansData) => {
    const nowStr = new Date().toLocaleTimeString();
    setSavedTimestampStr(nowStr);
    const updated = {
      ...submittedAnswers,
      [qId]: { ...ansData, timestamp: nowStr }
    };
    setSubmittedAnswers(updated);
    if (onSaveAnswer) {
      onSaveAnswer(qId, ansData, updated);
    }
  };

  // Handler: Auto-submit on timer zero
  const handleAutoSubmitOnTimeExpired = () => {
    setIsTimerRunning(false);
    setRound1Status('Completed');
    setRound2Status('Available');
    setStep('submitted');
  };

  // Handler: Submit Round 1 from Review
  const handleSubmitRound1 = () => {
    setIsTimerRunning(false);
    setRound1Status('Completed');
    setRound2Status('Available');
    setStep('submitted');
  };

  // Handler: Submit Technical Round
  const handleSubmitTechnicalRound = () => {
    setRound2Status('Completed');
    setRound3Status('Available');
    setStep('hr-readiness');
    setCurrentRound(2);
  };

  // Handler: End & Submit HR Round
  const handleEndAndSubmitHR = () => {
    setRound3Status('Completed');
    setStep('completed');
    setCurrentRound(3);
    if (onComplete) {
      onComplete(submittedAnswers);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col justify-between">
      {/* Top Frame 8 Header */}
      <Frame8Header
        candidateName={candidateName}
        candidateId={candidateId}
        assessmentTitle={assessmentTitle}
        subtitle="Three-round assessment"
        currentRound={currentRound}
        round1Status={round1Status}
        round2Status={round2Status}
        round3Status={round3Status}
        tabSwitchCount={tabSwitchCount}
      />

      {/* Main State Canvas */}
      <main className="flex-1 w-full pb-12">
        {step === 'overview' && (
          <Frame8Overview
            candidateName={candidateName}
            candidateId={candidateId}
            assessmentTitle={assessmentTitle}
            round1Status={round1Status}
            round2Status={round2Status}
            round3Status={round3Status}
            onStartRound1={() => setStep('readiness')}
            onBackToDashboard={onBackToDashboard}
          />
        )}

        {step === 'readiness' && (
          <Frame8Readiness
            candidateName={candidateName}
            candidateId={candidateId}
            questionCount={activeQuestions.length}
            durationMinutes={durationMinutes}
            onBeginAssessment={handleBeginAssessment}
            onBackToOverview={() => setStep('overview')}
          />
        )}

        {step === 'assessment' && (
          <Frame8AssessmentMCQ
            questions={activeQuestions}
            currentIndex={currentIndex}
            submittedAnswers={submittedAnswers}
            remainingSeconds={remainingSeconds}
            savedTimestampStr={savedTimestampStr}
            onSelectQuestion={(idx) => setCurrentIndex(idx)}
            onSaveAnswer={handleSaveAnswer}
            onPrevious={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            onNext={() => {
              if (currentIndex < activeQuestions.length - 1) {
                setCurrentIndex((prev) => prev + 1);
              } else {
                setStep('review');
              }
            }}
            onGoToReview={() => setStep('review')}
          />
        )}

        {step === 'review' && (
          <Frame8Review
            questions={activeQuestions}
            submittedAnswers={submittedAnswers}
            remainingSeconds={remainingSeconds}
            onSubmitRound1={handleSubmitRound1}
            onReturnToAssessment={() => setStep('assessment')}
            onRevisitQuestion={(idx) => {
              setCurrentIndex(idx);
              setStep('assessment');
            }}
          />
        )}

        {step === 'submitted' && (
          <Frame8Submitted
            candidateName={candidateName}
            candidateId={candidateId}
            answeredCount={Object.keys(submittedAnswers).length}
            totalQuestions={activeQuestions.length}
            unansweredCount={Math.max(0, activeQuestions.length - Object.keys(submittedAnswers).length)}
            onStartTechnicalRound={() => {
              setStep('technical');
              setCurrentRound(2);
              setRound2Status('In progress');
            }}
            onBackToOverview={() => setStep('overview')}
          />
        )}

        {step === 'technical' && (
          <Frame8Technical
            mode="technical"
            candidateName={candidateName}
            candidateId={candidateId}
            onSubmitTechnicalRound={handleSubmitTechnicalRound}
            onBackToOverview={() => setStep('overview')}
          />
        )}

        {step === 'hr-readiness' && (
          <Frame8Technical
            mode="hr-readiness"
            candidateName={candidateName}
            candidateId={candidateId}
            onJoinHRInterview={() => {
              setStep('live-hr');
              setCurrentRound(3);
              setRound3Status('In progress');
            }}
            onBackToOverview={() => setStep('overview')}
          />
        )}

        {step === 'live-hr' && (
          <Frame8LiveHR
            mode="live-hr"
            candidateName={candidateName}
            candidateId={candidateId}
            onEndAndSubmitHR={() => setStep('confirmation')}
            onBackToOverview={() => setStep('overview')}
          />
        )}

        {step === 'confirmation' && (
          <Frame8LiveHR
            mode="confirmation"
            candidateName={candidateName}
            candidateId={candidateId}
            onEndAndSubmitHR={handleEndAndSubmitHR}
            onKeepInterviewing={() => setStep('live-hr')}
            onBackToOverview={() => setStep('overview')}
          />
        )}

        {step === 'completed' && (
          <Frame8Completed
            candidateName={candidateName}
            candidateId={candidateId}
            onReturnToOverview={() => setStep('overview')}
          />
        )}
      </main>

      {/* Tab Switch Anti-Cheating Warning Toast at Top Right */}
      {showTabSwitchWarning && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border-2 border-amber-500 max-w-sm space-y-2.5 animate-bounce font-sans">
          <div className="flex items-center justify-between font-bold text-xs">
            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>PROCTOR WARNING DETECTED</span>
            </div>
            <button
              onClick={() => setShowTabSwitchWarning(false)}
              className="text-slate-400 hover:text-white font-bold text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            Window focus loss or tab navigation was detected during active proctoring.
          </p>
          <div className="p-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-mono font-extrabold flex items-center justify-between">
            <span>Tab Switch Recorded</span>
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[11px]">
              Tab force {tabSwitchCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
