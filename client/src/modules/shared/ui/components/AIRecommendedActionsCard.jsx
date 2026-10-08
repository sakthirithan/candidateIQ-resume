import React from 'react';
import { Sparkles, ArrowRight, Zap, Target, BookOpen } from 'lucide-react';

export default function AIRecommendedActionsCard({
  actions = [],
  onNavigate
}) {
  return (
    <div className="saas-card density-compact">
      <div className="flex items-center justify-between card-header-compact">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold font-outfit text-sm text-slate-900">AI Recommended Actions</h3>
        </div>
        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
          {actions.length} Actionable {actions.length === 1 ? 'Insight' : 'Insights'}
        </span>
      </div>

      {/* Horizontal Action Cards or Onboarding State */}
      {!actions || actions.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Sparkles className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
          <p className="font-medium text-slate-700">No actionable insights yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
            Complete your resume analysis or take an AI mock interview to generate personalized AI recommendations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {actions.map((act) => {
            const IconComp = act.icon || Sparkles;
            return (
              <div
                key={act.id}
                className="p-3 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[9px] font-black tracking-wider text-indigo-600 uppercase">
                      {act.category || 'INSIGHT'}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${act.badgeClass || 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                      {act.priority || 'Recommended'}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {act.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate && onNavigate(act.tabTarget || 'interview')}
                  className="mt-3 w-full py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1 border border-slate-200 hover:border-transparent"
                >
                  <IconComp className="w-3 h-3" />
                  <span>{act.actionText || 'Take Action'}</span>
                  <ArrowRight className="w-3 h-3 ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
