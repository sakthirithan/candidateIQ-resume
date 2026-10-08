import React from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, AlertCircle, HelpCircle, Layers, Calendar, Database } from 'lucide-react';

export default function ScoreExplanationModal({ isOpen, onClose, metricTitle, value, max = 100, confidence, criteria = [], evidence = {}, lastUpdated, formulaVersion = 'candidate-iq-v2.0', status, improvementSuggestion }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-outfit text-slate-950">{metricTitle} Breakdown</h3>
                <span className="badge-pill badge-ai text-[10px]">{formulaVersion}</span>
              </div>
              <p className="text-xs text-slate-500">Transparent AI calculation logic & verifiable data sources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Score Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-slate-50 to-purple-50/80 border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Calculated Rating</span>
              <div className="text-3xl font-black font-outfit text-slate-950 mt-0.5">
                {status === 'insufficient_data' ? (
                  <span className="text-amber-600 text-lg">Insufficient Data</span>
                ) : (
                  <>
                    {value} <span className="text-sm text-slate-400 font-semibold">/ {max}</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs text-indigo-600 font-bold">
                <ShieldCheck className="w-4 h-4" /> Confidence: {Math.round((confidence || 0) * 100)}%
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Last calculated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Just now'}
              </span>
            </div>
          </div>

          {/* Improvement Suggestion Notice */}
          {improvementSuggestion && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Optimization Recommendation:</span>
                <p className="text-amber-800">{improvementSuggestion}</p>
              </div>
            </div>
          )}

          {/* Scoring Criteria Breakdown */}
          {criteria.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" /> Evaluation Criteria
              </h4>

              <div className="space-y-2">
                {criteria.map((c, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800">{c.label || c.key}</span>
                      {c.evidence && <p className="text-[11px] text-slate-500">{c.evidence}</p>}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-indigo-600">{c.score !== undefined ? `${c.score}%` : (c.value || 'Verified')}</span>
                      {c.weight && <span className="text-[10px] text-slate-400 block">Weight: {Math.round(c.weight * 100)}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mathematical Provenance Footer */}
          <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Database className="w-3.5 h-3.5 text-indigo-600" /> Data Isolation & Auditability
            </div>
            <p>
              CandidateIQ scores are computed dynamically from authenticated candidate records (Resume, Verified Skills, Interview Recordings, and Requisitions). Missing sections are weighted proportionally rather than penalized as fake zeros.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}
