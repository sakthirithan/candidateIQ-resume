import React from 'react';
import { TRIANGULATION_STATES } from './EvidenceCard';
import { ArrowUpDown, Search, Filter, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function CompetencyRegisterTable({
  competencies = [
    { id: '1', skill: 'React.js', jdReq: 'Required', resumeClaim: 'Strong (3+ Yrs)', interviewScore: 88, evidence: 'Virtual DOM & state batching verified', status: 'SUPPORTED', confidence: 92 },
    { id: '2', skill: 'Node.js', jdReq: 'Required', resumeClaim: 'Advanced', interviewScore: 82, evidence: 'Event loop phases & async handling verified', status: 'SUPPORTED', confidence: 89 },
    { id: '3', skill: 'MongoDB', jdReq: 'Required', resumeClaim: 'Intermediate', interviewScore: 76, evidence: 'Document schemas & index optimization verified', status: 'PARTIALLY_SUPPORTED', confidence: 81 },
    { id: '4', skill: 'Docker & Microservices', jdReq: 'Required', resumeClaim: 'Claimed', interviewScore: 42, evidence: 'Container orchestration details missing', status: 'UNSUPPORTED', confidence: 65 },
    { id: '5', skill: 'Redis Caching', jdReq: 'Preferred', resumeClaim: 'Architectural Owner', interviewScore: 31, evidence: 'Failed basic Redis cluster questions', status: 'CONTRADICTED', confidence: 95 },
    { id: '6', skill: 'AWS Cloud', jdReq: 'Preferred', resumeClaim: 'Declared', interviewScore: 0, evidence: 'Not evaluated in active interview session', status: 'NOT_TESTED', confidence: 0 }
  ],
  onSelectCompetency
}) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');

  const filtered = competencies.filter(c => {
    const matchesSearch = c.skill.toLowerCase().includes(search.toLowerCase()) || c.evidence.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="saas-card overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-bold font-outfit text-sm text-slate-900">Competency Register</h3>
          <p className="text-xs text-slate-500">3-Way Evidence Triangulation (JD vs Resume vs Interview)</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter competencies..."
              className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 w-44"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All States</option>
              <option value="SUPPORTED">Supported</option>
              <option value="PARTIALLY_SUPPORTED">Partial</option>
              <option value="UNSUPPORTED">Unsupported</option>
              <option value="CONTRADICTED">Contradicted</option>
              <option value="NOT_TESTED">Not Tested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Competency Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Skill & Competency</th>
              <th className="py-3 px-4">JD Req</th>
              <th className="py-3 px-4">Resume Claim</th>
              <th className="py-3 px-4">Interview Score</th>
              <th className="py-3 px-4">Verified Evidence</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filtered.map(comp => {
              const config = TRIANGULATION_STATES[comp.status] || TRIANGULATION_STATES.NOT_TESTED;
              const IconComp = config.icon;

              return (
                <tr
                  key={comp.id}
                  onClick={() => onSelectCompetency && onSelectCompetency(comp)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{comp.skill}</span>
                      {comp.status === 'CONTRADICTED' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                          REVIEW REQUIRED
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {comp.jdReq}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {comp.resumeClaim}
                  </td>
                  <td className="py-3 px-4">
                    {comp.status === 'NOT_TESTED' ? (
                      <span className="text-slate-400 font-semibold text-[11px]">N/A</span>
                    ) : (
                      <span className={`font-extrabold text-xs ${comp.interviewScore >= 80 ? 'text-emerald-600' : comp.interviewScore >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {comp.interviewScore}/100
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate" title={comp.evidence}>
                    {comp.evidence}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`badge-pill ${config.badgeClass} inline-flex items-center gap-1`}>
                      <IconComp className="w-3 h-3" />
                      <span>{config.label}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
