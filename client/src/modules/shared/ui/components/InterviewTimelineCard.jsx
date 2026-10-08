import React from 'react';
import { Calendar, Clock, CheckCircle, Play, ArrowRight, Video } from 'lucide-react';

export default function InterviewTimelineCard({
  title = "Recent Activity & Performance Timeline",
  activities = [],
  onActionClick
}) {
  return (
    <div className="saas-card density-compact">
      <div className="flex items-center justify-between card-header-compact">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold font-outfit text-sm text-slate-900">{title}</h3>
        </div>
        {onActionClick && (
          <button
            onClick={onActionClick}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
          >
            View Schedule <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Horizontal Timeline Layout */}
      {!activities || activities.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Calendar className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
          <p className="font-medium text-slate-700">No interview activity logged yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Activities will appear as you complete AI mock interviews and practice sessions.</p>
        </div>
      ) : (
        <div className="py-2 overflow-x-auto scrollbar-none">
          <div className="flex items-start min-w-[540px] justify-start gap-6 relative px-2">
            {/* Connecting Line */}
            <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0"></div>

            {activities.map((act, index) => {
              const isCompleted = act.status === 'completed' || act.status === 'COMPLETED';
              const isInProgress = act.status === 'in_progress' || act.status === 'IN_PROGRESS';

              return (
                <div key={act.id || index} className="flex flex-col items-center text-center relative z-10 w-28">
                  {/* Node Dot */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : isInProgress
                        ? 'bg-indigo-600 border-indigo-400 text-white ring-4 ring-indigo-100 animate-pulse'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : isInProgress ? (
                      <Play className="w-3.5 h-3.5 fill-white" />
                    ) : (
                      <Video className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Time Badge */}
                  <span className="text-[10px] font-semibold text-slate-500 mt-2 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {act.time || 'Today'}
                  </span>

                  {/* Activity Label */}
                  <p className="text-[11px] font-bold text-slate-800 leading-tight mt-1 line-clamp-2">
                    {act.title}
                  </p>

                  {/* Status Indicator */}
                  <span
                    className={`text-[9px] font-extrabold uppercase mt-1 px-1.5 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700'
                        : isInProgress
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (act.score !== undefined && act.score !== null ? `Score: ${act.score}%` : 'Done') : isInProgress ? 'Active ●' : 'Scheduled'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
