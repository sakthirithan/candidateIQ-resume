import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { mockAnalyticsService } from '@/services/mockApi/analyticsService';
import { mockJobService } from '@/services/mockApi/jobService';
import { ResponsibleAIDisclaimer } from '@/modules/shared';
import { Users, Briefcase, Award, Plus, Search, Filter, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';

function RecruiterDashboard() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', department: 'Engineering', description: '', requiredSkills: '' });
  const [candidateSearch, setCandidateSearch] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get('/analytics/recruiter-dashboard');
      setStats(statsRes.data.stats);

      const jobsRes = await api.get('/jobs');
      setJobs(jobsRes.data.jobs || []);
    } catch (err) {
      const mockOverview = await mockAnalyticsService.getOverview();
      setStats(mockOverview.overview);
      const mockJobList = await mockJobService.getJobs();
      setJobs(mockJobList);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    const skillsArray = newJob.requiredSkills.split(',').map((s) => s.trim());
    try {
      await api.post('/jobs', {
        ...newJob,
        requiredSkills: skillsArray
      });
    } catch (err) {
      await mockJobService.createJob({
        title: newJob.title,
        department: newJob.department,
        description: newJob.description,
        requiredSkills: skillsArray
      });
    } finally {
      setShowCreateModal(false);
      setNewJob({ title: '', department: 'Engineering', description: '', requiredSkills: '' });
      fetchDashboardData();
    }
  };



  return (
    <div className="space-y-8">
      {/* Top Header & Quick Action */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-outfit">Recruiter Intelligence Dashboard</h2>
          <p className="text-xs text-slate-400">Evaluate candidates, manage job requisitions, and access explainable AI candidate scores.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Post New Job Requisition
        </button>
      </div>

      {/* Overview Analytics Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium uppercase">Total Candidates</span>
          <h3 className="text-2xl font-extrabold font-outfit text-indigo-400 mt-1">{stats?.totalCandidates || 14}</h3>
        </div>

        <div className="glass-card p-4 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium uppercase">Active Jobs</span>
          <h3 className="text-2xl font-extrabold font-outfit text-cyan-400 mt-1">{stats?.activeJobs || 4}</h3>
        </div>

        <div className="glass-card p-4 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium uppercase">Applications</span>
          <h3 className="text-2xl font-extrabold font-outfit text-emerald-400 mt-1">{stats?.totalApplications || 28}</h3>
        </div>

        <div className="glass-card p-4 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium uppercase">Interviews Done</span>
          <h3 className="text-2xl font-extrabold font-outfit text-purple-400 mt-1">{stats?.completedInterviews || 12}</h3>
        </div>

        <div className="glass-card p-4 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium uppercase">Shortlisted</span>
          <h3 className="text-2xl font-extrabold font-outfit text-amber-400 mt-1">{stats?.shortlistedCandidates || 6}</h3>
        </div>
      </div>

      {/* Candidate Search & Active Applications */}
      <div className="glass-card p-6 border border-slate-800 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-slate-100 font-outfit flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Candidate Pipeline & Intelligence Profiles
          </h3>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search candidate or skill..."
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Candidate Intelligence Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">Tech Score</th>
                <th className="py-3 px-4">Behavioural</th>
                <th className="py-3 px-4">Job Match</th>
                <th className="py-3 px-4">Unified Score</th>
                <th className="py-3 px-4">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {[
                { name: 'Alex Johnson', role: 'Full Stack MERN Developer', tech: 88, behav: 76, match: 91, overall: 85, rec: 'Strong Match' },
                { name: 'Priya Sharma', role: 'AI & Data Science Specialist', tech: 94, behav: 89, match: 85, overall: 90, rec: 'Top Candidate' },
                { name: 'David Chen', role: 'Backend Systems Engineer', tech: 82, behav: 91, match: 79, overall: 84, rec: 'Recommended' }
              ]
                .filter(c => c.name.toLowerCase().includes(candidateSearch.toLowerCase()) || c.role.toLowerCase().includes(candidateSearch.toLowerCase()))
                .map((cand, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60 transition-all">
                    <td className="py-3 px-4 font-semibold text-slate-100">{cand.name}</td>
                    <td className="py-3 px-4 text-slate-400">{cand.role}</td>
                    <td className="py-3 px-4 font-mono text-indigo-400">{cand.tech}/100</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{cand.behav}/100</td>
                    <td className="py-3 px-4 font-mono text-cyan-400">{cand.match}%</td>
                    <td className="py-3 px-4 font-bold font-mono text-purple-400">{cand.overall}/100</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                        {cand.rec}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsible AI Compliance Footer */}
      <ResponsibleAIDisclaimer />

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 border border-slate-800 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-bold text-slate-100 font-outfit">Create New Job Requisition</h3>
            
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Job Title</label>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Required Skills (comma separated)</label>
                <input
                  type="text"
                  required
                  value={newJob.requiredSkills}
                  onChange={(e) => setNewJob({ ...newJob, requiredSkills: e.target.value })}
                  placeholder="React, Node.js, TypeScript, MongoDB"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Enter job requirements and role description..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Publish Job Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterDashboard;
