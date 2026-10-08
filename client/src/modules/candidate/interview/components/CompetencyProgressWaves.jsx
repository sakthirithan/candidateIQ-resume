import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

export const CANONICAL_COMPETENCIES = [
  { id: 'technical_knowledge', name: 'Technical Knowledge', color: '#4f46e5' },
  { id: 'answer_quality', name: 'Answer Quality & Relevance', color: '#0284c7' },
  { id: 'concept_explanation', name: 'Concept Explanation', color: '#8b5cf6' },
  { id: 'problem_solving', name: 'Problem Solving', color: '#d97706' },
  { id: 'communication', name: 'Communication', color: '#059669' },
  { id: 'fluency_pacing', name: 'Fluency & Pacing', color: '#ec4899' },
  { id: 'answer_structure', name: 'Answer Structure', color: '#10b981' },
  { id: 'conciseness', name: 'Conciseness', color: '#64748b' }
];

// Clean White Tooltip matching CandidateIQ Visual Standard
const CompetencyWaveTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 select-text min-w-[190px] font-sans">
        <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 font-outfit">
          {label || (data.completedAt ? new Date(data.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Attempt')}
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
 * Reusable Competency Progress Waves Component
 * Accepts `data` array of attempt objects with scores for canonical 8 competencies.
 */
function CompetencyProgressWaves({ data = [], onPointClick, title = "Competency Progress Waves", subtitle = "Track individual competency growth trajectories across attempts. Select a section filter to isolate waves." }) {
  const [selectedCompetencyWave, setSelectedCompetencyWave] = useState('all');

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="saas-card p-6 border border-slate-200/80 space-y-4 bg-white">
      {/* Header & Section Wave Selector Pills */}
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

      {/* Recharts Multi-Wave Line Chart */}
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
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
            <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
            <Tooltip content={<CompetencyWaveTooltip />} />
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

export default CompetencyProgressWaves;
