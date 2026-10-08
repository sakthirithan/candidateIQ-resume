import React, { useState } from 'react';
import { Sparkles, Info, TrendingUp, HelpCircle, ChevronRight, ShieldCheck, Check, AlertCircle, XCircle } from 'lucide-react';
import ScoreExplanationModal from '../../profile/components/ScoreExplanationModal';

export default function CandidateScoreCard({
  title,
  value,
  max = 100,
  confidence,
  dataAvailable = true,
  status,
  icon: Icon,
  accentColor = 'indigo',
  percentileText,
  subtitle,
  criteria = [],
  evidence = {},
  improvementSuggestion,
  lastUpdated,
  formulaVersion,
  hoverType = 'generic'
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const colorStyles = {
    indigo: {
      bgIcon: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      valueText: 'text-indigo-600',
      borderHover: 'hover:border-indigo-300',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    blue: {
      bgIcon: 'bg-blue-50 text-blue-600 border-blue-100',
      valueText: 'text-blue-600',
      borderHover: 'hover:border-blue-300',
      badge: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    purple: {
      bgIcon: 'bg-purple-50 text-purple-600 border-purple-100',
      valueText: 'text-purple-600',
      borderHover: 'hover:border-purple-300',
      badge: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    emerald: {
      bgIcon: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      valueText: 'text-emerald-600',
      borderHover: 'hover:border-emerald-300',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  };

  const style = colorStyles[accentColor] || colorStyles.indigo;

  return (
    <>
      <div
        className={`saas-card p-5 border border-slate-200/90 transition-all duration-200 relative group cursor-pointer ${style.borderHover} hover:shadow-md`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Top Header */}
        <div className="flex justify-between items-start">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            {title}
          </span>
          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${style.bgIcon}`}>
            {Icon ? <Icon className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Main Value */}
        <div className="mt-2">
          {!dataAvailable || status === 'insufficient_data' ? (
            <div>
              <span className="text-sm font-bold text-amber-600 block">Not enough data</span>
              <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">Complete activities to generate score</span>
            </div>
          ) : (
            <h3 className={`text-3xl font-black font-outfit text-slate-950 flex items-baseline gap-1`}>
              {value}
              {max === 100 && hoverType !== 'match' && <span className="text-xs font-semibold text-slate-500">/ 100</span>}
              {hoverType === 'match' && <span className="text-sm font-bold text-emerald-600 ml-1">% Match</span>}
            </h3>
          )}
        </div>

        {/* Subtitle / Percentile / Evidence */}
        <div className="mt-2 flex items-center justify-between text-[11px]">
          {percentileText ? (
            <span className="text-indigo-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {percentileText}
            </span>
          ) : subtitle ? (
            <span className="text-slate-600 font-medium">{subtitle}</span>
          ) : confidence ? (
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> {Math.round(confidence * 100)}% Confidence
            </span>
          ) : null}

          <span className="text-[10px] text-slate-500 font-bold group-hover:text-indigo-600 transition-colors flex items-center gap-0.5">
            How calculated <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* Dynamic Rich Hover Popover */}
        {isHovered && (
          <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in duration-150 text-xs space-y-3 pointer-events-none">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 font-outfit">How this score was calculated</span>
              {confidence && (
                <span className="text-[10px] text-indigo-400 font-mono bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800">
                  {Math.round(confidence * 100)}% Confidence
                </span>
              )}
            </div>

            {/* Render Contextual Hover Explanation depending on hoverType */}
            {hoverType === 'candidate_iq' && criteria.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 block font-medium">Dimension Weights:</span>
                {criteria.map((c, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{c.name || c.label}</span>
                    <span className="font-mono text-indigo-400">
                      {c.dataAvailable ? `${c.value} × ${Math.round(c.weight * 100)}%` : 'No data'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {hoverType === 'resume' && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 block font-medium">Analyzed Criteria:</span>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Structure</span>
                  <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Skills coverage</span>
                  <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Project evidence</span>
                  <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Experience</span>
                </div>
                {improvementSuggestion && (
                  <p className="text-[10px] text-amber-300 pt-1 border-t border-slate-800">
                    💡 Potential improvement: {improvementSuggestion}
                  </p>
                )}
              </div>
            )}

            {hoverType === 'technical' && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 block font-medium">Verified Evidence Hierarchy:</span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Verified skills count</span>
                    <span className="font-mono text-purple-400">{criteria.length || 'Multiple'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Hierarchy level</span>
                    <span className="font-mono text-purple-400">Level 1–5 (Resume to Interview)</span>
                  </div>
                </div>
              </div>
            )}

            {hoverType === 'generic' && criteria.length > 0 && (
              <div className="space-y-1.5">
                {criteria.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{c.label || c.key}</span>
                    <span className="font-mono text-indigo-400">{c.score !== undefined ? `${c.score}%` : (c.value || 'Verified')}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
              <span>Data source: MongoDB Live</span>
              <span>Click for full breakdown →</span>
            </div>
          </div>
        )}
      </div>

      {/* Explanation Modal */}
      <ScoreExplanationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        metricTitle={title}
        value={value}
        max={max}
        confidence={confidence}
        criteria={criteria}
        evidence={evidence}
        lastUpdated={lastUpdated}
        formulaVersion={formulaVersion}
        status={status}
        improvementSuggestion={improvementSuggestion}
      />
    </>
  );
}
