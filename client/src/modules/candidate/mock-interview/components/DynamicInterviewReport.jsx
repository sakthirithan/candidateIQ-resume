import React, { useState } from 'react';
import {
  FileText, Download, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Sparkles, ShieldCheck, ArrowLeft, Printer, Award, User, Briefcase, Code, Brain
} from 'lucide-react';

export default function DynamicInterviewReport({ interview, resumeSnapshot, onClose }) {
  const [expandedSections, setExpandedSections] = useState({
    execSummary: true,
    resumeOverview: true,
    resumeVsInterview: true,
    questionReview: true,
    technicalEval: true,
    communication: true,
    claimMatrix: true,
    recommendations: true
  });

  const toggleSection = (sec) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const score = interview?.overallEvaluation?.overallInterviewScore ?? interview?.evaluation?.overallScore ?? interview?.latestScore ?? null;
  const targetJobTitle = interview?.jobDetails?.jobTitle || interview?.targetJobTitle || 'Full Stack Engineer';
  const company = interview?.jobDetails?.company || 'CandidateIQ Enterprise';

  return (
    <div className="bg-white min-h-screen p-6 md:p-10 text-slate-900 font-sans space-y-6 max-w-5xl mx-auto shadow-xl rounded-3xl border border-slate-200 my-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" /> CandidateIQ Assessment Intelligence
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-outfit text-slate-950">
              Mock Interview Performance Report
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Role: {targetJobTitle} &bull; Company: {company}
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Export / Print Report
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl text-center">
          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">Overall Readiness Score</span>
          <span className="text-3xl font-black font-outfit text-indigo-950 mt-1 block">{score !== null ? `${score}/100` : '—'}</span>
        </div>
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-center">
          <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Technical Mastery</span>
          <span className="text-3xl font-black font-outfit text-emerald-950 mt-1 block">{interview?.overallEvaluation?.technicalProficiency ?? interview?.evaluation?.technicalScore ?? '—'}%</span>
        </div>
        <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl text-center">
          <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider block">STAR Behavioral</span>
          <span className="text-3xl font-black font-outfit text-purple-950 mt-1 block">{interview?.overallEvaluation?.behaviouralCompetency ?? interview?.evaluation?.behaviouralScore ?? '—'}%</span>
        </div>
        <div className="p-4 bg-cyan-50/60 border border-cyan-200 rounded-2xl text-center">
          <span className="text-[10px] font-extrabold text-cyan-600 uppercase tracking-wider block">Communication Clarity</span>
          <span className="text-3xl font-black font-outfit text-cyan-950 mt-1 block">{interview?.overallEvaluation?.communicationClarity ?? interview?.evaluation?.communicationScore ?? '—'}%</span>
        </div>
      </div>

      {/* Summary Section */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700">
        <h3 className="font-bold text-slate-900 text-sm font-outfit">AI Assessment Summary</h3>
        <p className="leading-relaxed">
          {interview?.overallEvaluation?.summaryExplanation ||
            'Candidate demonstrated strong technical depth in core architecture questions and provided structured STAR framework evidence during behavioral assessment.'}
        </p>
      </div>
    </div>
  );
}
