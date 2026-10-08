import React, { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import { jobService, mockJobService } from '@/services/mockApi/jobService';
import { mockTrackerService } from '@/services/mockApi/trackerService';
import { mockApplicationService } from '@/services/mockApi/applicationService';
import { formatExperience, formatSalary } from '@/utils/formatters';
import ApplicationModal from './ApplicationModal';
import ErrorBoundary from '@/modules/shared/layout/components/ErrorBoundary';
import {
  Briefcase, MapPin, CheckCircle2, ChevronRight, Sparkles, Search, DollarSign,
  Bookmark, BookmarkCheck, Calendar, ArrowRight, Building, Filter, X,
  Clock, Award, Layers, RefreshCw, AlertCircle, Check
} from 'lucide-react';
import { getCurrentUser } from '@/utils/auth';

function JobDiscovery({ onSelectJob }) {
  const [jobs, setJobs] = useState([]);
  const [savedJobsList, setSavedJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [candidateApps, setCandidateApps] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  // Quick Nav Tab: 'recommended' | 'latest' | 'saved' | 'all'
  const [activeQuickTab, setActiveQuickTab] = useState('all');

  // Main Search Bar State
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [activeSearch, setActiveSearch] = useState({ title: '', location: '' });

  // Filters State
  const [filters, setFilters] = useState({
    location: 'All',
    experience: 'All',
    employmentType: 'All',
    workMode: 'All',
    minSalary: 0,
    department: 'All',
    skills: []
  });

  // Mobile Filter Drawer Toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sorting: 'best_match' | 'recent' | 'oldest' | 'salary_high'
  const [sortBy, setSortBy] = useState('best_match');

  useEffect(() => {
    fetchJobsAndState();
  }, []);

  const fetchJobsAndState = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      const candidateId = currentUser?.id || currentUser?._id || 'cand_1';

      // 1. Fetch main jobs list
      let jobList = [];
      try {
        jobList = await jobService.getJobs();
      } catch (e) {
        jobList = await mockJobService.getJobs();
      }
      setJobs(jobList || []);

      // 2. Fetch saved jobs list for candidate
      try {
        const savedRes = await jobService.getSavedJobs();
        setSavedJobsList(savedRes || []);
      } catch (e) {
        setSavedJobsList(jobList.filter(j => j.isSaved) || []);
      }

      // 3. Fetch candidate applications
      const apiAppsRes = await api.get('/jobs/candidate/my-applications').catch(() => null);
      if (apiAppsRes?.data?.applications) {
        setCandidateApps(apiAppsRes.data.applications);
      } else {
        const appList = await mockApplicationService.getApplicationsForCandidate(candidateId);
        setCandidateApps(appList || []);
      }
    } catch (err) {
      console.error('Failed to load jobs data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveSearch({
      title: searchTitle.trim().toLowerCase(),
      location: searchLocation.trim().toLowerCase()
    });
  };

  const handleClearSearch = () => {
    setSearchTitle('');
    setSearchLocation('');
    setActiveSearch({ title: '', location: '' });
  };

  const handleToggleSaveJob = async (e, job) => {
    e.stopPropagation();
    const jobId = job._id || job.id;
    try {
      const res = await jobService.toggleSaveJob(jobId);
      const isSaved = res?.isSaved ?? !job.isSaved;

      // Update state locally
      setJobs((prevJobs) =>
        prevJobs.map((j) => ((j._id || j.id) === jobId ? { ...j, isSaved } : j))
      );

      if (isSaved) {
        setSavedJobsList((prev) => [...prev, { ...job, isSaved: true }]);
        showToast('Job saved to your bookmarks.');
      } else {
        setSavedJobsList((prev) => prev.filter((j) => (j._id || j.id) !== jobId));
        showToast('Job removed from your saved list.');
      }
    } catch (err) {
      console.error('Failed to toggle save job:', err);
      showToast('Could not update saved job. Please try again.');
    }
  };

  const handleOpenApplyModal = (e, job, isApplied) => {
    e.stopPropagation();
    if (isApplied) {
      showToast('You have already applied for this job position.');
      return;
    }
    setSelectedJobForApply(job);
  };

  const handleApplicationSuccess = (createdApp) => {
    showToast('Application submitted successfully! Your recruiter review is now active.');
    fetchJobsAndState();
  };

  // Skill filter toggle helper
  const handleSkillToggle = (skill) => {
    setFilters((prev) => {
      const exists = prev.skills.includes(skill);
      const newSkills = exists
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: newSkills };
    });
  };

  const handleClearAllFilters = () => {
    setFilters({
      location: 'All',
      experience: 'All',
      employmentType: 'All',
      workMode: 'All',
      minSalary: 0,
      department: 'All',
      skills: []
    });
    handleClearSearch();
  };

  // Check active filters count
  const activeFiltersCount = useMemo(() => {
    let cnt = 0;
    if (filters.location !== 'All') cnt++;
    if (filters.experience !== 'All') cnt++;
    if (filters.employmentType !== 'All') cnt++;
    if (filters.workMode !== 'All') cnt++;
    if (filters.minSalary > 0) cnt++;
    if (filters.department !== 'All') cnt++;
    if (filters.skills.length > 0) cnt += filters.skills.length;
    if (activeSearch.title || activeSearch.location) cnt++;
    return cnt;
  }, [filters, activeSearch]);

  // Derived filtered jobs list based on Quick Tabs, Search & Filters
  const filteredJobs = useMemo(() => {
    let sourceJobs = [...jobs];

    // Quick Tab filter
    if (activeQuickTab === 'saved') {
      sourceJobs = sourceJobs.filter((j) => j.isSaved || savedJobsList.some((s) => (s._id || s.id) === (j._id || j.id)));
    } else if (activeQuickTab === 'recommended') {
      sourceJobs = sourceJobs.filter((j) => (j.matchScore || j.matchPercentage || 85) >= 80);
    }

    // Active Search filter
    if (activeSearch.title) {
      sourceJobs = sourceJobs.filter((j) => {
        const title = (j.title || '').toLowerCase();
        const company = (j.company || '').toLowerCase();
        const desc = (j.description || '').toLowerCase();
        const reqSkills = (j.requiredSkills || []).map((s) => s.toLowerCase());
        return (
          title.includes(activeSearch.title) ||
          company.includes(activeSearch.title) ||
          desc.includes(activeSearch.title) ||
          reqSkills.some((s) => s.includes(activeSearch.title))
        );
      });
    }

    if (activeSearch.location) {
      sourceJobs = sourceJobs.filter((j) =>
        (j.location || '').toLowerCase().includes(activeSearch.location)
      );
    }

    // Sidebar Filters
    if (filters.location !== 'All') {
      sourceJobs = sourceJobs.filter((j) =>
        (j.location || '').toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.experience !== 'All') {
      sourceJobs = sourceJobs.filter((j) => {
        const expStr = (j.experienceLevel || '').toLowerCase();
        if (filters.experience === 'fresher') return expStr.includes('0') || expStr.includes('fresher') || expStr.includes('entry');
        if (filters.experience === '1-3') return expStr.includes('1') || expStr.includes('2') || expStr.includes('3');
        if (filters.experience === '3-5') return expStr.includes('3') || expStr.includes('4') || expStr.includes('5');
        if (filters.experience === '5+') return expStr.includes('5') || expStr.includes('6') || expStr.includes('7') || expStr.includes('8') || expStr.includes('senior');
        return true;
      });
    }

    if (filters.employmentType !== 'All') {
      sourceJobs = sourceJobs.filter(
        (j) => (j.employmentType || '').toLowerCase() === filters.employmentType.toLowerCase()
      );
    }

    if (filters.workMode !== 'All') {
      sourceJobs = sourceJobs.filter((j) => {
        const wm = (j.workArrangement || j.workMode || j.location || '').toLowerCase();
        return wm.includes(filters.workMode.toLowerCase());
      });
    }

    if (filters.department !== 'All') {
      sourceJobs = sourceJobs.filter(
        (j) => (j.department || '').toLowerCase() === filters.department.toLowerCase()
      );
    }

    if (filters.skills.length > 0) {
      sourceJobs = sourceJobs.filter((j) => {
        const jSkills = (j.requiredSkills || []).map((s) => s.toLowerCase());
        return filters.skills.every((sk) => jSkills.includes(sk.toLowerCase()));
      });
    }

    if (filters.minSalary > 0) {
      sourceJobs = sourceJobs.filter((j) => {
        if (!j.salary) return true;
        const minVal = typeof j.salary === 'object' ? (j.salary.min || 0) : 0;
        return minVal >= filters.minSalary;
      });
    }

    // Sort Ordering
    sourceJobs.sort((a, b) => {
      if (sortBy === 'best_match') {
        const scoreA = a.matchScore || a.matchPercentage || 85;
        const scoreB = b.matchScore || b.matchPercentage || 85;
        return scoreB - scoreA;
      }
      if (sortBy === 'recent') {
        return new Date(b.createdAt || b.postedDate || '2026-01-01') - new Date(a.createdAt || a.postedDate || '2026-01-01');
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || a.postedDate || '2026-01-01') - new Date(b.createdAt || b.postedDate || '2026-01-01');
      }
      if (sortBy === 'salary_high') {
        const getSal = (j) => (typeof j.salary === 'object' ? (j.salary.max || j.salary.min || 0) : 0);
        return getSal(b) - getSal(a);
      }
      return 0;
    });

    return sourceJobs;
  }, [jobs, savedJobsList, activeQuickTab, activeSearch, filters, sortBy]);

  // Available Filter Option Lists derived from data
  const availableLocations = ['Remote', 'Hybrid', 'On-site', 'Chennai', 'Bangalore', 'San Francisco', 'Austin'];
  const availableSkillsList = ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Python', 'AWS', 'Docker', 'TypeScript'];

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-8 text-[#172033] font-sans antialiased">
      {/* Toast Alert Banner */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-xl animate-fade-in border border-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="ml-3 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Heading & AI Indicator */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#172033]">
                Find your next opportunity
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" /> CandidateIQ AI Match
              </span>
            </div>
            <p className="text-sm text-[#64748B]">
              Discover jobs matched to your skills, experience, and career goals.
            </p>
          </div>
        </div>

        {/* Main Search Bar Row */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white p-3 md:p-4 rounded-2xl border border-[#E2E8F0] shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
        >
          <div className="relative md:col-span-6 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Job title, skills, or company (e.g. Full Stack Engineer, React)..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all placeholder:text-slate-400"
            />
            {searchTitle && (
              <button
                type="button"
                onClick={() => setSearchTitle('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative md:col-span-4 flex items-center">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Location (e.g. Remote, Chennai)..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all placeholder:text-slate-400"
            />
            {searchLocation && (
              <button
                type="button"
                onClick={() => setSearchLocation('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" /> Search
            </button>
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center cursor-pointer"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {[
              { id: 'recommended', label: 'Recommended' },
              { id: 'latest', label: 'Latest' },
              { id: 'saved', label: `Saved (${savedJobsList.length})` },
              { id: 'all', label: `All Jobs (${jobs.length})` }
            ].map((tab) => {
              const isActive = activeQuickTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveQuickTab(tab.id)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'bg-white text-[#64748B] hover:text-[#172033] hover:bg-slate-50 border border-[#E2E8F0]'
                  }`}
                >
                  {tab.id === 'saved' && <Bookmark className="w-3.5 h-3.5 inline" />}
                  {tab.id === 'recommended' && <Sparkles className="w-3.5 h-3.5 inline text-amber-300" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearAllFilters}
              className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear All Filters ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* 2-Column Desktop Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Filter Sidebar (260px sticky on desktop) */}
          <aside
            className={`md:col-span-4 lg:col-span-3 bg-white p-5 rounded-2xl border border-[#E2E8F0] space-y-6 shadow-xs sticky top-20 ${
              showMobileFilters ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-[#172033] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#4F46E5]" /> Filters
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs text-[#4F46E5] font-semibold hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Work Mode / Arrangement */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] block">
                Work Mode
              </label>
              <div className="space-y-1.5 text-xs text-[#172033]">
                {['All', 'Remote', 'Hybrid', 'On-site'].map((wm) => (
                  <label key={wm} className="flex items-center gap-2 cursor-pointer py-1 hover:text-[#4F46E5]">
                    <input
                      type="radio"
                      name="workMode"
                      checked={filters.workMode === wm}
                      onChange={() => setFilters({ ...filters, workMode: wm })}
                      className="accent-[#4F46E5]"
                    />
                    <span>{wm === 'All' ? 'All Modes' : wm}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] block">
                Experience
              </label>
              <div className="space-y-1.5 text-xs text-[#172033]">
                {[
                  { id: 'All', label: 'All Levels' },
                  { id: 'fresher', label: 'Fresher / Entry level' },
                  { id: '1-3', label: '1–3 years' },
                  { id: '3-5', label: '3–5 years' },
                  { id: '5+', label: '5+ years' }
                ].map((exp) => (
                  <label key={exp.id} className="flex items-center gap-2 cursor-pointer py-1 hover:text-[#4F46E5]">
                    <input
                      type="radio"
                      name="experience"
                      checked={filters.experience === exp.id}
                      onChange={() => setFilters({ ...filters, experience: exp.id })}
                      className="accent-[#4F46E5]"
                    />
                    <span>{exp.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Employment Type */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] block">
                Employment Type
              </label>
              <div className="space-y-1.5 text-xs text-[#172033]">
                {['All', 'Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer py-1 hover:text-[#4F46E5]">
                    <input
                      type="radio"
                      name="employmentType"
                      checked={filters.employmentType === type}
                      onChange={() => setFilters({ ...filters, employmentType: type })}
                      className="accent-[#4F46E5]"
                    />
                    <span>{type === 'All' ? 'All Types' : type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] block">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Product Design">Product Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            {/* Skills Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] block">
                Skills
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs text-[#172033]">
                {availableSkillsList.map((skill) => {
                  const isChecked = filters.skills.includes(skill);
                  return (
                    <label key={skill} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-[#4F46E5]">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSkillToggle(skill)}
                        className="rounded border-[#E2E8F0] accent-[#4F46E5]"
                      />
                      <span>{skill}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleClearAllFilters}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Clear all filters
            </button>
          </aside>

          {/* Right Column: Results Area */}
          <main className="md:col-span-8 lg:col-span-9 space-y-4">
            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-[#E2E8F0] text-xs">
                <span className="font-semibold text-[#64748B]">Active Filters:</span>
                {activeSearch.title && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-[#4F46E5] font-medium rounded-lg">
                    Query: "{activeSearch.title}"
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setActiveSearch({ ...activeSearch, title: '' })} />
                  </span>
                )}
                {filters.location !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-[#4F46E5] font-medium rounded-lg">
                    Loc: {filters.location}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, location: 'All' })} />
                  </span>
                )}
                {filters.workMode !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-[#4F46E5] font-medium rounded-lg">
                    Mode: {filters.workMode}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, workMode: 'All' })} />
                  </span>
                )}
                {filters.skills.map((sk) => (
                  <span key={sk} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-[#4F46E5] font-medium rounded-lg">
                    {sk}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => handleSkillToggle(sk)} />
                  </span>
                ))}
              </div>
            )}

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <div>
                <h2 className="text-lg font-semibold text-[#172033]">Jobs for you</h2>
                <p className="text-xs text-[#64748B]">
                  {loading ? 'Searching opportunities...' : `${filteredJobs.length} opportunities found`}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#64748B] font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#172033] focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
                >
                  <option value="best_match">Best Match</option>
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="salary_high">Salary (High to Low)</option>
                </select>
              </div>
            </div>

            {/* Job Listing Cards List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] space-y-4 animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                    <div className="h-12 bg-slate-100 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-[#E2E8F0] space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-[#172033]">No matching jobs found</h3>
                  <p className="text-xs text-[#64748B]">
                    Try adjusting your filters or search keywords to explore more available positions.
                  </p>
                </div>
                <button
                  onClick={handleClearAllFilters}
                  className="px-4 py-2 bg-[#4F46E5] text-white font-semibold text-xs rounded-xl hover:bg-[#4338CA] transition-all cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const jobId = job._id || job.id;
                  const candidateApp = candidateApps.find(
                    (a) =>
                      (a.job && String(a.job._id || a.job) === String(jobId)) ||
                      a.jobId === jobId ||
                      a.jobId === String(jobId)
                  );
                  const isApplied = Boolean(candidateApp || job.isApplied);
                  const appStatus = candidateApp?.status || (isApplied ? 'Applied' : null);
                  const matchScore = job.matchPercentage || job.matchScore || 91;
                  const companyInitials = (job.company || 'CIQ').substring(0, 2).toUpperCase();

                  const expText = formatExperience(job.experience, job.experienceLevel);
                  const salText = formatSalary(job.salary, job.salary);

                  return (
                    <div
                      key={jobId}
                      className="bg-white p-5 md:p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-xs hover:border-[#4F46E5]/40 transition-all group"
                    >
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          {/* Company Logo Fallback */}
                          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {companyInitials}
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="text-lg font-semibold text-[#172033] group-hover:text-[#4F46E5] transition-colors leading-snug">
                              {job.title}
                            </h3>
                            <p className="text-xs font-medium text-[#64748B] flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-slate-400" /> {job.company || 'CandidateIQ Talent Partner'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#4F46E5] border border-indigo-100 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#4F46E5]" /> {matchScore}% Match
                          </span>
                          <button
                            onClick={(e) => handleToggleSaveJob(e, job)}
                            title={job.isSaved ? 'Unsave Job' : 'Save Job'}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              job.isSaved
                                ? 'bg-indigo-50 text-[#4F46E5] border border-indigo-200'
                                : 'bg-slate-50 text-slate-400 hover:text-slate-600 border border-[#E2E8F0]'
                            }`}
                          >
                            {job.isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Metadata Details Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#64748B] border-y border-slate-100 py-2.5">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location || 'Remote'} ({job.workArrangement || 'Hybrid'})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.employmentType || 'Full-time'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {expText || '0–2 years'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-[#059669]">
                          <DollarSign className="w-3.5 h-3.5" /> {salText || 'Competitive'}
                        </span>
                      </div>

                      {/* Description Excerpt */}
                      <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                        {job.description || 'Build scalable application components and intelligent recruiter workflows with modern full-stack web technologies.'}
                      </p>

                      {/* Required Skills Chips */}
                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {job.requiredSkills.slice(0, 5).map((sk) => (
                            <span
                              key={sk}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F8FAFC] text-slate-700 border border-[#E2E8F0]"
                            >
                              {sk}
                            </span>
                          ))}
                          {job.requiredSkills.length > 5 && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-500 border border-[#E2E8F0]">
                              +{job.requiredSkills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons Row */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-[11px] text-[#64748B]">
                          Posted {job.postedDate || 'recently'}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectJob(jobId)}
                            className="px-4 py-2 bg-white hover:bg-slate-50 text-[#172033] font-semibold text-xs rounded-xl border border-[#E2E8F0] transition-all cursor-pointer"
                          >
                            View Details
                          </button>

                          {isApplied ? (
                            <button
                              disabled
                              className="px-4 py-2 bg-emerald-50 text-[#059669] font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 opacity-90"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Applied ({appStatus || 'Under Review'})
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleOpenApplyModal(e, job, false)}
                              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                            >
                              Apply Now <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Application Submission Modal */}
      {selectedJobForApply && (
        <ErrorBoundary title="Application Wizard Error">
          <ApplicationModal
            job={selectedJobForApply}
            isOpen={Boolean(selectedJobForApply)}
            onClose={() => setSelectedJobForApply(null)}
            onSuccess={handleApplicationSuccess}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default JobDiscovery;
