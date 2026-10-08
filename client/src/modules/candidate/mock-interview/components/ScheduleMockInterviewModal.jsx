import React, { useState, useEffect } from 'react';
import { X, Calendar, Sparkles, AlertCircle, Briefcase, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function ScheduleMockInterviewModal({
  isOpen,
  onClose,
  onSchedule,
  availableJobs = [],
  initialJobData = null
}) {
  const [title, setTitle] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionFormat, setQuestionFormat] = useState('Voice'); // 'MCQ' | 'Voice' | 'Text' | 'Random'
  const [questionCount, setQuestionCount] = useState(10);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [validationError, setValidationError] = useState('');
  const [isLoadedFromPostedJob, setIsLoadedFromPostedJob] = useState(false);

  useEffect(() => {
    if (initialJobData) {
      setTitle(`${initialJobData.targetJobTitle || initialJobData.title || 'Full Stack Engineer'} — Mock Interview`);
      setJobDescription(initialJobData.jobDescriptionSnapshot || initialJobData.description || '');
      setSelectedJobId(initialJobData.jobId || initialJobData.id || '');
      setIsLoadedFromPostedJob(true);
    } else if (availableJobs.length > 0) {
      const j = availableJobs[0];
      setTitle(`${j.title} — Mock Interview`);
      setJobDescription(j.description || `Job Requisition Requirements for ${j.title}`);
      setSelectedJobId(j.id);
      setIsLoadedFromPostedJob(false);
    } else {
      setTitle('Full Stack Developer — MERN Practice');
      setJobDescription('Looking for a Senior Full Stack Engineer proficient in React, Node.js Express, REST API design, and MongoDB performance optimization.');
      setIsLoadedFromPostedJob(false);
    }
  }, [initialJobData, availableJobs, isOpen]);

  if (!isOpen) return null;

  const handleFormatSelect = (fmt) => {
    setQuestionFormat(fmt);
    setValidationError('');
    if (fmt === 'MCQ') setQuestionCount(40);
    else if (fmt === 'Voice') setQuestionCount(10);
    else if (fmt === 'Text') setQuestionCount(15);
    else if (fmt === 'Random') setQuestionCount(17);
  };

  const handleJobSelectChange = (e) => {
    const jId = e.target.value;
    setSelectedJobId(jId);
    const found = availableJobs.find((j) => (j.id || j._id) === jId);
    if (found) {
      setTitle(`${found.title} — Mock Interview`);
      setJobDescription(found.description || `Job Requisition Requirements for ${found.title}`);
      setIsLoadedFromPostedJob(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setValidationError('A Job Description is required to create an AI Mock Interview because CandidateIQ uses role expectations to generate questions.');
      return;
    }

    onSchedule({
      title: title.trim() || 'Custom Mock Interview',
      jobId: selectedJobId || 'job_custom',
      targetJobTitle: title.split('—')[0]?.trim() || 'Full Stack Engineer',
      jobDescriptionSnapshot: jobDescription.trim(),
      questionFormat,
      questionCount,
      difficulty,
      timerMinutes: parseInt(timerMinutes, 10) || 30,
      scheduledDate,
      scheduledTime,
      status: 'Scheduled'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="saas-card bg-white w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200/90 rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-outfit text-slate-950">Create / Schedule AI Mock Interview</h3>
              <p className="text-xs text-slate-500 font-medium">Questions generated strictly from your confirmed <strong>Resume Keywords</strong>.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 font-outfit">Interview Title</label>
              {isLoadedFromPostedJob && (
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  🔒 Read-Only (From Recruiter Job)
                </span>
              )}
            </div>
            <input
              type="text"
              required
              readOnly={isLoadedFromPostedJob}
              placeholder="e.g. Full Stack Developer — MERN Practice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`input-saas w-full text-xs font-semibold ${
                isLoadedFromPostedJob ? 'bg-slate-100 text-slate-700 border-slate-200/80 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 font-outfit">Target Job Requisition</label>
              {isLoadedFromPostedJob && (
                <span className="badge-pill bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                  Loaded from recruiter job
                </span>
              )}
            </div>
            {!isLoadedFromPostedJob && availableJobs.length > 0 && (
              <select
                value={selectedJobId}
                onChange={handleJobSelectChange}
                className="input-saas w-full text-xs font-semibold mb-2"
              >
                {availableJobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title} ({j.department || 'Engineering'})</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 font-outfit">Job Description (Source of Truth)</label>
              <span className="text-[10px] text-indigo-600 font-bold">100% JD Generated</span>
            </div>
            <textarea
              rows={4}
              required
              readOnly={isLoadedFromPostedJob}
              placeholder="Paste or edit the full Job Description..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className={`input-saas w-full text-xs leading-relaxed resize-none ${
                isLoadedFromPostedJob ? 'bg-slate-100 text-slate-700 border-slate-200/80 cursor-not-allowed font-mono' : ''
              }`}
            ></textarea>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 font-outfit">Question Format</label>
              <span className="text-[11px] font-medium text-slate-500">
                Limits: MCQ (40), Voice (10), Text (15), Random (17)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { type: 'MCQ', count: 40, desc: '40 MCQ questions' },
                { type: 'Voice', count: 10, desc: '10 Spoken questions' },
                { type: 'Text', count: 15, desc: '15 Written questions' },
                { type: 'Random', count: 17, desc: '10 MCQ + 2 Voice + 5 Text' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => handleFormatSelect(item.type)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    questionFormat === item.type
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold text-xs text-slate-900">
                    <span>{item.type}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{item.count} Qs</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium leading-tight">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input-saas w-full text-xs font-semibold"
              >
                <option value="Easy">Easy (Foundational)</option>
                <option value="Medium">Medium (Intermediate)</option>
                <option value="Hard">Hard (Senior / Architect)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Duration Timer</label>
              <select
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(e.target.value)}
                className="input-saas w-full text-xs font-semibold"
              >
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Schedule Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="input-saas w-full text-xs font-semibold"
              />
            </div>
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-slate-600 leading-relaxed font-medium">
            This AI mock session parses specified job description expectations into tailored interview scenarios, enabling candidates to evaluate role readiness and practice structured technical responses before actual employer interviews.
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Create Mock Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
