import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Square, Play, RefreshCw, CheckCircle, AlertTriangle, ArrowRight,
  ShieldAlert, Clock, Sparkles, Volume2, Award, Zap, BookOpen, Layers, BarChart2, Check
} from 'lucide-react';
import { improvementService } from '@/services/improvementService';

const FRAMEWORK_GUIDES = {
  PEE: {
    title: 'P-E-E Framework Guide',
    steps: [
      { key: 'P', label: 'Point', desc: 'State your core thesis/concept clearly in 1 sentence.' },
      { key: 'E', label: 'Explanation', desc: 'Explain how the underlying technical mechanism functions.' },
      { key: 'E', label: 'Example', desc: 'Illustrate with a practical project application or code example.' }
    ]
  },
  CEET: {
    title: 'C-E-E-T Framework Guide',
    steps: [
      { key: 'C', label: 'Concept', desc: 'Define the technical mechanism.' },
      { key: 'E', label: 'Explanation', desc: 'Detail execution sequence & memory allocation.' },
      { key: 'E', label: 'Example', desc: 'Provide production scenario or code snippet.' },
      { key: 'T', label: 'Trade-off', desc: 'Highlight time/space complexity & scalability trade-offs.' }
    ]
  },
  STAR: {
    title: 'STAR Framework Guide',
    steps: [
      { key: 'S', label: 'Situation', desc: 'Describe the context and technical environment.' },
      { key: 'T', label: 'Task', desc: 'Explain the challenge or objective.' },
      { key: 'A', label: 'Action', desc: 'Detail YOUR specific engineering actions ("I implemented...").' },
      { key: 'R', label: 'Result', desc: 'Quantify the outcome (e.g., "reduced latency by 35%").' }
    ]
  },
  CONTROLLED_PAUSE: {
    title: 'Controlled Pause Technique',
    steps: [
      { key: '1', label: 'Breathe & Think', desc: 'Take a 1-second pause before starting your response.' },
      { key: '2', label: 'Paced Cadence', desc: 'Speak at ~130 WPM with clear punctuation pauses.' },
      { key: '3', label: 'Zero Fillers', desc: 'Silence is better than vocalizing "um", "uh", or "like".' }
    ]
  }
};

export default function ActivityPracticeRoom({ activityId, onBack, onCompleteActivity }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activity, setActivity] = useState(null);
  const [session, setSession] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcripts, setTranscripts] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  // Results State
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('voice');

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    initPracticeRoom();
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activityId]);

  const initPracticeRoom = async () => {
    setLoading(true);
    try {
      const res = await improvementService.startPracticeSession(activityId);
      if (res.success) {
        setActivity(res.activity);
        setSession(res.session);
      }
    } catch (err) {
      console.error('Failed to start practice room:', err);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    try {
      setIsRecording(true);
      setRecordSeconds(0);

      // Speech Recognition setup if supported
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscripts(prev => ({
            ...prev,
            [currentQIndex]: currentTranscript.trim()
          }));
        };

        recognition.onerror = (e) => console.warn('Speech Rec error:', e);
        recognition.start();
        recognitionRef.current = recognition;
      } else {
        setIsSpeechSupported(false);
      }

      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } catch (e) {
      console.error('Audio recording failed:', e);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  };

  const currentQuestion = session?.questions?.[currentQIndex] || {};
  const framework = FRAMEWORK_GUIDES[activity?.recommendedFramework || 'PEE'] || FRAMEWORK_GUIDES.PEE;

  const handleNextOrSubmit = async () => {
    stopRecording();

    if (currentQIndex < (session?.questions?.length || 1) - 1) {
      setCurrentQIndex(prev => prev + 1);
      setRecordSeconds(0);
    } else {
      // Submit Practice Session
      setSubmitting(true);
      try {
        const responses = session.questions.map((q, idx) => ({
          questionId: q.questionId,
          questionText: q.questionText,
          rawTranscript: transcripts[idx] || textAnswers[idx] || 'Spoken practice explanation addressing topic.',
          textAnswer: textAnswers[idx] || transcripts[idx] || '',
          durationSeconds: recordSeconds || 45
        }));

        const evalRes = await improvementService.submitPracticeSession(activityId, session._id, responses);
        if (evalRes.success) {
          setEvaluationResult(evalRes);
        }
      } catch (err) {
        console.error('Failed to submit practice session:', err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-medium animate-pulse">Initializing CandidateIQ Practice Room...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Targeted Improvement Practice • Attempt #{session?.attemptNumber || 1}
            </div>
            <h1 className="text-2xl font-bold">{activity?.title}</h1>
            <p className="text-slate-300 text-sm mt-1">{activity?.solutionDescription}</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
            <div className="text-right">
              <div className="text-xs text-slate-300 uppercase font-medium">Target Benchmark</div>
              <div className="text-lg font-bold text-emerald-400">
                {activity?.comparisonOperator} {activity?.targetValue} {activity?.unit}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      {!evaluationResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Framework Guide & Target Spec */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" /> {framework.title}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                  Recommended
                </span>
              </div>
              <div className="space-y-3">
                {framework.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {step.key}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{step.label}</div>
                      <div className="text-slate-600 text-xs mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600" /> Protected Evaluation Protocol
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Transcripts are generated automatically via Speech-to-Text and remain <strong>Read-Only</strong>. CandidateIQ strictly evaluates spoken speech metrics without manual text editing.
              </p>
            </div>
          </div>

          {/* Center/Right Panel: Interactive Question & Voice Room */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
                <span>Question {currentQIndex + 1} of {session?.questions?.length || 1}</span>
                <span className="text-indigo-600 font-bold">{currentQuestion.category || 'Voice'} Assessment</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900 leading-snug">{currentQuestion.questionText}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                    Target Skill: {currentQuestion.targetSkill}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                    Framework: {currentQuestion.expectedStructure}
                  </span>
                </div>
              </div>

              {/* Voice / Text Toggle Mode */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('voice')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'voice' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                    >
                      <Mic className="w-3.5 h-3.5 inline mr-1" /> Voice Recording
                    </button>
                    <button
                      onClick={() => setActiveTab('transcript')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'transcript' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                    >
                      Protected Transcript
                    </button>
                  </div>
                  {activeTab === 'voice' && (
                    <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-200">
                      <Clock className="w-4 h-4 text-indigo-600" /> {formatTime(recordSeconds)}
                    </div>
                  )}
                </div>

                {activeTab === 'voice' ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4 bg-white rounded-xl border border-slate-200">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 ${
                        isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                    <div className="text-center">
                      <div className="font-semibold text-slate-900 text-sm">
                        {isRecording ? 'Recording Spoken Response...' : 'Click to Start Recording'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {isRecording ? 'Speak clearly. Use deliberate pauses.' : 'Press microphone button to begin.'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase">Automated Speech-to-Text Transcript (Read-Only)</div>
                    <div className="w-full min-h-[120px] p-3 bg-white rounded-xl border border-slate-200 text-slate-800 text-sm font-medium leading-relaxed overflow-y-auto">
                      {transcripts[currentQIndex] || (
                        <span className="text-slate-400 italic">No spoken audio recorded yet for this question.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={onBack}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition"
                >
                  Cancel Practice
                </button>
                <button
                  onClick={handleNextOrSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Evaluating Attempt...
                    </>
                  ) : currentQIndex < (session?.questions?.length || 1) - 1 ? (
                    <>Next Question <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Complete & Verify Attempt <Check className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Evaluation Results Modal View */
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              evaluationResult.result === 'PASS' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {evaluationResult.result === 'PASS' ? <CheckCircle className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              {evaluationResult.result === 'PASS' ? 'Target Benchmark Achieved!' : 'Keep Practicing — Benchmark Pending'}
            </h2>

            <p className="text-slate-600 text-sm max-w-md mx-auto">
              {evaluationResult.evaluation?.remediationGuidance}
            </p>
          </div>

          {/* Metric Comparison Card */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <div>
              <div className="text-xs text-slate-500 uppercase font-medium">Baseline</div>
              <div className="text-xl font-bold text-slate-700">{activity?.baselineValue} {activity?.unit}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase font-medium">Attempt Result</div>
              <div className={`text-xl font-bold ${evaluationResult.result === 'PASS' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {evaluationResult.evaluation?.evaluatedValue} {activity?.unit}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase font-medium">Target Benchmark</div>
              <div className="text-xl font-bold text-indigo-600">{activity?.comparisonOperator} {activity?.targetValue} {activity?.unit}</div>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex items-center justify-center gap-4 pt-4">
            {evaluationResult.result === 'PASS' ? (
              <button
                onClick={onCompleteActivity || onBack}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2"
              >
                Continue to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setEvaluationResult(null);
                  setCurrentQIndex(0);
                  initPracticeRoom();
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Re-Practice Activity
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
