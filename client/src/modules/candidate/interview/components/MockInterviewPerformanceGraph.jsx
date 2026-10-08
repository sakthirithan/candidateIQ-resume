import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import { CANONICAL_COMPETENCIES } from './CompetencyProgressWaves';

// Custom Tooltip specifically tailored for Mock Interview Attempts (Attempt 1, Date, Canonical Competency Scores)
const MockInterviewPerformanceTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formattedDate = data.completedAt
      ? new Date(data.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : null;

    return (
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 select-text min-w-[200px] font-sans">
        <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 font-outfit">
          <div>{data.attemptLabel || `Attempt ${data.attemptNumber || 1}`}</div>
          {formattedDate && (
            <div className="text-[10px] font-normal text-slate-400 font-sans mt-0.5">{formattedDate}</div>
          )}
        </div>
        <div className="space-y-1">
          {payload.map((entry) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4 font-semibold text-[11px]">
              <span style={{ color: entry.color }}>
                {entry.name} :
              </span>
              <span className="font-bold text-slate-900 font-outfit">
                {entry.value !== null && entry.value !== undefined ? entry.value : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Separate Graph Component for Individual AI Mock Interview Performance Review
 * Scope: Repeated attempts of ONE specific Mock Interview
 * X-Axis: Attempt 1, Attempt 2, Attempt 3...
 */
function MockInterviewPerformanceGraph({
  data = [],
  onPointClick,
  title = "Consistency & Performance Graph Across Repeated Attempts",
  subtitle = "Track section-by-section score progression across repeated attempts of this exact Mock Interview."
}) {
  const [selectedCompetencyWave, setSelectedCompetencyWave] = useState('all');

  if (!data || data.length === 0) {
    return (
      <div className="saas-card p-8 text-center space-y-2 bg-white border border-slate-200/80">
        <Activity className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-xs text-slate-500 font-medium">No completed attempts recorded for this mock interview yet.</p>
        <p className="text-[11px] text-slate-400">Complete another attempt to start tracking performance progression.</p>
      </div>
    );
  }

  return (
    <div className="saas-card p-6 border border-slate-200/80 space-y-4 bg-white">
      {/* Header & Section Selector Pills */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" /> {title}
          </h3>
          <p className="text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        {/* Section Wave Selector Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCompetencyWave('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCompetencyWave === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Sections
          </button>
          {CANONICAL_COMPETENCIES.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCompetencyWave(c.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCompetencyWave === c.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Attempt Progression Wave Graph */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload[0]?.payload && onPointClick) {
                onPointClick(e.activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="attemptLabel" stroke="#94a3b8" fontSize={11} />
            <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
            <Tooltip content={<MockInterviewPerformanceTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

            {CANONICAL_COMPETENCIES.map(comp => {
              if (selectedCompetencyWave !== 'all' && selectedCompetencyWave !== comp.id) {
                return null;
              }
              return (
                <Line
                  key={comp.id}
                  connectNulls
                  type="monotone"
                  name={comp.name}
                  dataKey={comp.id}
                  stroke={comp.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, cursor: 'pointer' }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MockInterviewPerformanceGraph;
