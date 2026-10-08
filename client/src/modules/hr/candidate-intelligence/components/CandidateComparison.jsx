import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { mockCandidateService } from '@/services/mockApi/candidateService';
import { Layers, Sparkles, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';

function CandidateComparison() {
  const [candidates, setCandidates] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      const res = await api.post('/analytics/compare', { candidateIds: ['cand_1', 'cand_2'] });
      setCandidates(res.data.candidates || []);
      setInsights(res.data.comparisonInsights);
    } catch (err) {
      // Fallback to mock candidate service
      const mockList = await mockCandidateService.getCandidates();
      const mapped = mockList.map((c) => ({
        id: c.id,
        name: c.name,
        headline: c.headline,
        technical: c.scores.technical,
        behavioural: c.scores.behavioural,
        jobMatch: c.scores.jobMatch,
        experience: c.scores.experience,
        interview: c.scores.interview,
        overall: c.overallScore,
        strongSkills: c.skills.slice(0, 3).map((s) => s.name)
      }));
      setCandidates(mapped);
      setInsights({
        summary: 'John Doe holds the highest direct job match compatibility (94%), while Alex Johnson offers deep MERN stack & frontend architecture expertise (88/100).',
        highestTechnical: 'John Doe (92/100)',
        highestBehavioural: 'John Doe (81/100)',
        highestJobMatch: 'John Doe (94%)'
      });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-outfit">Multi-Candidate Comparison Matrix</h2>
          <p className="text-xs text-slate-400">Side-by-side metric comparison across technical, behavioural, job match, and interview evaluation dimensions.</p>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix Table */}
      <div className="glass-card p-6 border border-slate-800 space-y-6 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="py-4 px-4 font-bold text-slate-400 uppercase tracking-wider text-left w-48">Metric Dimension</th>
              {candidates.map((cand) => (
                <th key={cand.id} className="py-4 px-4 font-bold text-slate-100 text-center">
                  <div className="space-y-1">
                    <span className="text-sm text-indigo-400 font-outfit block">{cand.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal block">{cand.headline}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-300">Technical Skills Score</td>
              {candidates.map((c) => (
                <td key={c.id} className="py-3 px-4 text-center font-mono font-bold text-indigo-400">{c.technical}/100</td>
              ))}
            </tr>

            <tr>
              <td className="py-3 px-4 font-semibold text-slate-300">Behavioural Analytics</td>
              {candidates.map((c) => (
                <td key={c.id} className="py-3 px-4 text-center font-mono font-bold text-emerald-400">{c.behavioural}/100</td>
              ))}
            </tr>

            <tr>
              <td className="py-3 px-4 font-semibold text-slate-300">Job Compatibility Match</td>
              {candidates.map((c) => (
                <td key={c.id} className="py-3 px-4 text-center font-mono font-bold text-cyan-400">{c.jobMatch}%</td>
              ))}
            </tr>

            <tr>
              <td className="py-3 px-4 font-semibold text-slate-300">Experience Score</td>
              {candidates.map((c) => (
                <td key={c.id} className="py-3 px-4 text-center font-mono font-bold text-amber-400">{c.experience}/100</td>
              ))}
            </tr>

            <tr>
              <td className="py-3 px-4 font-semibold text-slate-300">AI Mock Interview Score</td>
              {candidates.map((c) => (
                <td key={c.id} className="py-3 px-4 text-center font-mono font-bold text-purple-400">{c.interview}/100</td>
              ))}
            </tr>

            <tr className="bg-indigo-500/10 font-bold">
              <td className="py-4 px-4 text-slate-100">Unified Candidate Score</td>
              {candidates.map((c) => (
                <td key={c.id} className="py-4 px-4 text-center font-mono text-base font-extrabold text-indigo-300">
                  {c.overall}/100
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-4 px-4 font-semibold text-slate-300">Verified Strong Skills</td>
              {candidates.map((c) => (
                <td key={c.id} className="py-4 px-4 text-center">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {c.strongSkills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Explainable Differences & Insights */}
      {insights && (
        <div className="glass-card p-6 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 font-outfit flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Explainable Comparative Intelligence Insights
          </h3>
          <p className="text-xs text-slate-300">{insights.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 block font-semibold uppercase">Highest Technical Proficiency</span>
              <span className="text-indigo-400 font-bold mt-1 block">{insights.highestTechnical}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 block font-semibold uppercase">Highest Behavioural Rating</span>
              <span className="text-emerald-400 font-bold mt-1 block">{insights.highestBehavioural}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 block font-semibold uppercase">Highest Direct Job Match</span>
              <span className="text-cyan-400 font-bold mt-1 block">{insights.highestJobMatch}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateComparison;
