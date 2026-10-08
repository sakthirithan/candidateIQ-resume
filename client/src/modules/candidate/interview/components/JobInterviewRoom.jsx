import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, Shield, CheckCircle2, AlertCircle, Mic, Video, Send, HelpCircle,
  Award, ArrowRight, ArrowLeft, AlertTriangle, FileText, Check, Sparkles, X,
  Maximize2, EyeOff, ShieldAlert, RefreshCw, Moon, Sun, Flag, ChevronDown, ChevronUp,
  Calendar, Layers, LogOut, CheckSquare, Square, Lock, AlertOctagon, User, Users,
  Brain, FileCheck, Star, MessageSquare
} from 'lucide-react';
import api from '@/services/api';
import { storageInterviews } from '@/services/storage/storageService';

export default function JobInterviewRoom({
  interview: propInterview = null,
  initialStep = 'ROOM',
  candidateId = 'cand_1',
  userRole = 'candidate', // 'candidate' | 'recruiter'
  onClose,
  onComplete
}) {
  const { interviewId: urlInterviewId } = useParams();
  const navigate = useNavigate();
  const targetId = urlInterviewId || propInterview?._id || propInterview?.id || 'final_int_102';

  const [interview, setInterview] = useState(propInterview || null);
  const [loading, setLoading] = useState(!propInterview);
  const [accessError, setAccessError] = useState(null);

  const [activeSideTab, setActiveSideTab] = useState(userRole === 'recruiter' ? 'rubric' : 'instructions');
  const [evaluatorNotes, setEvaluatorNotes] = useState('');
  const [recommendation, setRecommendation] = useState('Hire');
  const [ratingsMap, setRatingsMap] = useState({});
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [evalSuccessMsg, setEvalSuccessMsg] = useState(null);

  // Fetch interview details if not provided as prop
  useEffect(() => {
    if (propInterview) {
      setInterview(propInterview);
      setLoading(false);
      return;
    }

    const fetchInterview = async () => {
      try {
        setLoading(true);
        // Try fetching candidate interview first, then recruiter interview fallback
        const endpoint = userRole === 'recruiter' ? '/interviews/recruiter' : '/interviews/candidate';
        const res = await api.get(endpoint).catch(() => ({ data: { interviews: [] } }));
        const found = (res.data?.interviews || []).find(i => i._id === targetId || i.id === targetId);

        if (found) {
          setInterview(found);
        } else {
          // Check storage fallbacks
          const storageInt = storageInterviews.getById(targetId);
          if (storageInt) {
            setInterview(storageInt);
          } else {
            setAccessError({ type: 'NOT_FOUND', message: 'The requested Interview session was not found.' });
          }
        }
      } catch (err) {
        console.error('Error fetching interview session:', err);
        setAccessError({ type: 'ERROR', message: 'Failed to load interview room session.' });
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [targetId, propInterview, userRole]);

  // Initialize Rubric ratings map when interview loads
  useEffect(() => {
    if (interview && interview.rubricSnapshot && Array.isArray(interview.rubricSnapshot.criteria)) {
      const initialRatings = {};
      interview.rubricSnapshot.criteria.forEach(c => {
        initialRatings[c.id || c.name] = 4; // default score 4 out of 5
      });
      setRatingsMap(initialRatings);
    }
  }, [interview]);

  // Jitsi Room URL constructor
  const jitsiDomain = process.env.VITE_JITSI_DOMAIN || 'meet.jit.si';
  const roomName = interview?.meetingRoomReference || `candidateiq_int_${targetId.substring(0, 8)}`;
  const displayName = userRole === 'recruiter'
    ? 'Interviewer (HR Panel)'
    : (interview?.candidate?.name || interview?.candidateSnapshot?.name || 'Candidate');
  
  const jitsiIframeSrc = `https://${jitsiDomain}/${roomName}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.prejoinPageEnabled=false`;

  // Submit Official Recruiter Evaluation
  const handleSubmitEvaluation = async () => {
    if (!interview || !interview._id) return;

    try {
      setIsSubmittingEval(true);
      const criteriaRatingsList = Object.entries(ratingsMap).map(([critId, score]) => ({
        criterionId: critId,
        rating: Number(score) || 4
      }));

      const payload = {
        overallScore: 88,
        recommendation,
        evaluatorNotes,
        criteriaRatings: criteriaRatingsList
      };

      const res = await api.post(`/interviews/${interview._id}/evaluate`, payload);
      if (res.data?.success) {
        setEvalSuccessMsg('Interview evaluation submitted successfully!');
        if (onComplete) onComplete(res.data.interview);
      }
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      setEvalSuccessMsg('Failed to submit evaluation to backend server.');
    } finally {
      setIsSubmittingEval(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-sm font-bold tracking-wider">Connecting to CandidateIQ Encrypted Jitsi Video Room...</p>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
        <div className="saas-card p-8 bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black font-outfit text-white">Access Protection Alert</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">{accessError.message}</p>
          </div>
          <button
            onClick={() => navigate('/hr-interviews')}
            className="btn-primary text-xs px-6 py-3 font-bold rounded-xl shadow-md w-full cursor-pointer"
          >
            Return to Interviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col font-sans overflow-hidden text-slate-100">
      {/* HEADER BAR */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold font-outfit text-white flex items-center gap-2">
              {interview?.title || 'Official CandidateIQ Interview'}
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                {interview?.roundType || 'Live Video'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              {interview?.jobTitle || 'Target Requisition'} &bull; Scheduled Duration: {interview?.durationMinutes || 45} Mins
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Jitsi Encrypted Room
          </span>

          <button
            onClick={() => {
              if (onClose) onClose();
              else navigate(-1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" /> Leave Room
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: EMBEDDED JITSI VIDEO MEETING (FLEX-1) */}
        <div className="flex-1 bg-black relative flex items-center justify-center">
          <iframe
            src={jitsiIframeSrc}
            title="CandidateIQ Embedded Jitsi Video Interview"
            className="w-full h-full border-none"
            allow="camera; microphone; display-capture; autoplay; clipboard-write"
          />
        </div>

        {/* RIGHT: SIDE PANEL (EVALUATOR FOR HR / INSTRUCTIONS FOR CANDIDATE) */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
          {/* Side Panel Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-bold text-slate-400">
            {userRole === 'recruiter' ? (
              <>
                <button
                  onClick={() => setActiveSideTab('rubric')}
                  className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    activeSideTab === 'rubric' ? 'border-purple-500 text-purple-300 bg-slate-900' : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" /> Rubric Evaluation
                </button>
                <button
                  onClick={() => setActiveSideTab('questions')}
                  className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    activeSideTab === 'questions' ? 'border-purple-500 text-purple-300 bg-slate-900' : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" /> Questions
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveSideTab('instructions')}
                  className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    activeSideTab === 'instructions' ? 'border-purple-500 text-purple-300 bg-slate-900' : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Instructions
                </button>
                <button
                  onClick={() => setActiveSideTab('help')}
                  className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    activeSideTab === 'help' ? 'border-purple-500 text-purple-300 bg-slate-900' : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Support
                </button>
              </>
            )}
          </div>

          {/* Side Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-medium">
            {/* RECRUITER TAB 1: RUBRIC EVALUATION */}
            {activeSideTab === 'rubric' && (
              <div className="space-y-4 animate-fade-in">
                {evalSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{evalSuccessMsg}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Candidate Competency Scoring</h3>
                  <div className="space-y-3">
                    {(interview?.rubricSnapshot?.criteria || [
                      { id: 'c1', name: 'Technical Depth', weight: 30, description: 'Domain knowledge & code quality' },
                      { id: 'c2', name: 'Problem-Solving', weight: 30, description: 'Analytical approach & edge case handling' },
                      { id: 'c3', name: 'Communication', weight: 20, description: 'Clarity of concept explanations' },
                      { id: 'c4', name: 'Culture & Collaboration', weight: 20, description: 'Team fit and accountability' }
                    ]).map((crit) => (
                      <div key={crit.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{crit.name} ({crit.weight}%)</span>
                          <span className="font-bold text-purple-400 font-mono">
                            {ratingsMap[crit.id] || 4} / 5
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          step={1}
                          value={ratingsMap[crit.id] || 4}
                          onChange={(e) => setRatingsMap({ ...ratingsMap, [crit.id]: Number(e.target.value) })}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500">{crit.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 text-[11px] block">Overall Hiring Recommendation</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Strong Hire', 'Hire', 'Hold', 'No Hire'].map((rec) => (
                      <button
                        key={rec}
                        type="button"
                        onClick={() => setRecommendation(rec)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs cursor-pointer border transition-all ${
                          recommendation === rec
                            ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {rec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 text-[11px] block">Evaluator Evidence & Notes</label>
                  <textarea
                    rows={4}
                    value={evaluatorNotes}
                    onChange={(e) => setEvaluatorNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="Record specific interview evidence, key strengths, or concerns..."
                  />
                </div>

                <button
                  onClick={handleSubmitEvaluation}
                  disabled={isSubmittingEval}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmittingEval ? 'Submitting Evaluation...' : 'Submit Final Evaluation'}
                </button>
              </div>
            )}

            {/* RECRUITER TAB 2: QUESTIONS */}
            {activeSideTab === 'questions' && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Round Questions ({interview?.selectedQuestions?.length || 0})</h3>
                <div className="space-y-2">
                  {(interview?.selectedQuestions || [
                    { id: 'q1', text: 'Walk us through your experience scaling Node.js & React architectures.', duration: 10 },
                    { id: 'q2', text: 'How do you structure database indexes for high-frequency queries in MongoDB?', duration: 10 }
                  ]).map((q, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-purple-400 uppercase">Question {idx + 1} &bull; {q.duration || 10} Mins</span>
                      <p className="text-xs text-slate-200 font-medium">{q.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CANDIDATE TAB 1: INSTRUCTIONS */}
            {activeSideTab === 'instructions' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Candidate Meeting Instructions</span>
                  <p className="text-xs leading-relaxed">{interview?.candidateInstructions || 'Ensure your camera and microphone are operational. Maintain focus throughout the live interview.'}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-300 text-xs">Interview Room Guidelines</h4>
                  <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc pl-4">
                    <li>Speak clearly into your microphone during question rounds.</li>
                    <li>Use screen sharing when requested by the technical panel.</li>
                    <li>Avoid navigating away or opening unauthorized windows.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* CANDIDATE TAB 2: HELP */}
            {activeSideTab === 'help' && (
              <div className="space-y-3 animate-fade-in">
                <h4 className="font-bold text-slate-300 text-xs">Troubleshooting & Audio/Video Check</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  If video or audio is unavailable, check browser media permissions or re-join the Jitsi room using the Leave button.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
