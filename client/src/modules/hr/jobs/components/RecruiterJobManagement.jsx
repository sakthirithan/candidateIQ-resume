import React, { useState, useEffect, useCallback, useRef } from 'react';
import recruiterService from '@/services/recruiter/recruiterService';
import { formatExperience, formatSalary } from '@/utils/formatters';
import {
  Briefcase, Plus, Search, Edit2, Trash2, CheckCircle2,
  X, Users, MapPin, DollarSign, AlertTriangle, RefreshCw, Clock,
  ArrowLeft, ChevronRight, Filter, Copy, FileText, Sliders, Check,
  ExternalLink, Building2, ChevronDown, Calendar, Award, Sparkles,
  HelpCircle, Eye, AlertCircle, ArrowUpRight, RotateCcw, Download,
  Layers, Settings, Bookmark, Tag, ShieldCheck, Zap
} from 'lucide-react';

// Built-in Job Templates Definition (Phase 2.3)
const JOB_TEMPLATES = [
  {
    id: 'fullstack_eng',
    title: 'Full Stack Engineer',
    department: 'Engineering',
    employmentType: 'Full-time',
    workArrangement: 'Hybrid',
    seniorityLevel: 'Mid-Senior level',
    location: 'Bangalore, India (Hybrid)',
    education: "Bachelor's Degree in Computer Science or related field",
    description: 'We are seeking an experienced Full Stack Engineer to lead web application development. You will architect robust APIs, design responsive user interfaces, and collaborate with cross-functional AI teams to build scalable candidate profiling tools.',
    responsibilities: '• Design, develop, and maintain web applications using React and Node.js.\n• Build RESTful APIs and integrate MongoDB databases.\n• Optimize web application performance and security.\n• Collaborate with product managers and AI researchers.',
    qualifications: '• 3+ years of experience in JavaScript/TypeScript web development.\n• Proficiency with React, Node.js, Express, and MongoDB.\n• Solid understanding of REST architecture and web security best practices.',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    preferredSkills: ['TypeScript', 'Docker', 'AWS', 'TailwindCSS'],
    expMin: 3,
    expMax: 6,
    expUnit: 'years',
    salMin: 1200000,
    salMax: 2200000,
    salCurrency: 'INR',
    salPeriod: 'year'
  },
  {
    id: 'frontend_dev',
    title: 'Frontend Developer',
    department: 'Engineering',
    employmentType: 'Full-time',
    workArrangement: 'Remote',
    seniorityLevel: 'Mid-Level',
    location: 'Remote',
    education: "Bachelor's Degree in Computer Science or Design",
    description: 'Looking for a passionate Frontend Developer to craft sleek, responsive, and accessible user experiences for our recruitment intelligence platform.',
    responsibilities: '• Build state-of-the-art React frontend components.\n• Ensure cross-browser compatibility and responsive layout performance.\n• Implement accessible web standards (WCAG) and subtle animations.',
    qualifications: '• 2+ years of hands-on frontend web development.\n• Deep mastery of modern HTML5, CSS3, JavaScript, and React.\n• Experience with state management and API integration.',
    requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'TailwindCSS'],
    preferredSkills: ['Next.js', 'Redux', 'TypeScript', 'Figma'],
    expMin: 2,
    expMax: 4,
    expUnit: 'years',
    salMin: 800000,
    salMax: 1500000,
    salCurrency: 'INR',
    salPeriod: 'year'
  },
  {
    id: 'backend_dev',
    title: 'Backend Developer',
    department: 'Engineering',
    employmentType: 'Full-time',
    workArrangement: 'Hybrid',
    seniorityLevel: 'Senior level',
    location: 'Bangalore, India',
    education: "Bachelor's Degree in Computer Science or Software Engineering",
    description: 'Join our core platform engineering team to build scalable microservices, manage databases, and optimize backend query execution.',
    responsibilities: '• Architect high-throughput REST backend services.\n• Design MongoDB aggregations and index optimizations.\n• Integrate third-party LLMs and automated processing pipelines.',
    qualifications: '• 4+ years of backend development experience.\n• Strong background in Node.js, Express, and NoSQL databases.\n• Familiarity with server caching, queuing, and API authentication.',
    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST API', 'JavaScript'],
    preferredSkills: ['Redis', 'Microservices', 'GraphQL', 'Docker'],
    expMin: 4,
    expMax: 8,
    expUnit: 'years',
    salMin: 1500000,
    salMax: 2800000,
    salCurrency: 'INR',
    salPeriod: 'year'
  },
  {
    id: 'data_ai_eng',
    title: 'Data & AI Engineer',
    department: 'AI & Data Science',
    employmentType: 'Full-time',
    workArrangement: 'Hybrid',
    seniorityLevel: 'Senior level',
    location: 'Bangalore / Hybrid',
    education: "Master's or Bachelor's in CS, AI, or Data Science",
    description: 'Drive the next generation of AI candidate evaluation models and semantic resume extraction systems.',
    responsibilities: '• Develop LLM prompt engineering pipelines and evaluations.\n• Optimize candidate skill matching algorithms.\n• Implement secure dataset processing pipelines.',
    qualifications: '• 3+ years in AI engineering, Python, and NLP.\n• Experience with OpenAI/Groq APIs, vector databases, and Python backend services.',
    requiredSkills: ['Python', 'LLMs', 'Prompt Engineering', 'REST API', 'Data Analytics'],
    preferredSkills: ['PyTorch', 'LangChain', 'MongoDB', 'Docker'],
    expMin: 3,
    expMax: 7,
    expUnit: 'years',
    salMin: 1800000,
    salMax: 3200000,
    salCurrency: 'INR',
    salPeriod: 'year'
  }
];

export default function RecruiterJobManagement() {
  // View Mode: 'workspace' | 'details'
  const [viewMode, setViewMode] = useState('workspace');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsTab, setDetailsTab] = useState('overview'); // 'overview' | 'description' | 'requirements' | 'applications' | 'settings'

  // Server Data & Loading
  const [jobs, setJobs] = useState([]);
  const [metrics, setMetrics] = useState({
    activeRequisitions: 0,
    needsAttention: 0,
    totalApplications: 0,
    closingSoon: 0,
    totalJobs: 0,
    publishedJobs: 0,
    draftJobs: 0,
    closedJobs: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'closed' | 'attention' | 'closing_soon'
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  const [workArrangementFilter, setWorkArrangementFilter] = useState('all');
  const [seniorityFilter, setSeniorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  // Advanced Filters Collapsible Drawer State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Saved Views State (Phase 1.4)
  const [builtInViews, setBuiltInViews] = useState([]);
  const [customViews, setCustomViews] = useState([]);
  const [selectedViewId, setSelectedViewId] = useState('all_jobs');
  const [saveViewModalOpen, setSaveViewModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  // Table Density & Column Visibility (Phase 1.5)
  const [tableDensity, setTableDensity] = useState('comfortable'); // 'comfortable' | 'compact'
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    job: true,
    location: true,
    employment: true,
    skills: true,
    status: true,
    applications: true,
    updated: true,
    actions: true
  });

  // Selection & Bulk Actions State (Phase 1.6)
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [bulkActionSubmitting, setBulkActionSubmitting] = useState(false);

  // Applicants for selected job details view
  const [jobApplicants, setJobApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Form Modal State (Screen B)
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'edit'
  const [editingJobId, setEditingJobId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [closeConfirmModalOpen, setCloseConfirmModalOpen] = useState(false);

  // Draft Autosave State (Phase 2.1)
  const [autosaveStatus, setAutosaveStatus] = useState('saved'); // 'idle' | 'saving' | 'saved' | 'unsaved' | 'failed'
  const autosaveTimerRef = useRef(null);

  // Form Data State
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote / Hybrid',
    workArrangement: 'Hybrid',
    employmentType: 'Full-time',
    seniorityLevel: 'Mid-Senior level',
    education: "Bachelor's Degree in CS or equivalent",
    status: 'published',
    description: '',
    responsibilities: '',
    qualifications: '',
    closingDate: '',
    hrEvaluationPrompt: '',
    expMin: 2,
    expMax: 5,
    expUnit: 'years',
    salMin: 400000,
    salMax: 800000,
    salCurrency: 'INR',
    salPeriod: 'year'
  });

  // Skills Chip Arrays (Phase 2.5)
  const [reqSkills, setReqSkills] = useState([]);
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [prefSkills, setPrefSkills] = useState([]);
  const [prefSkillInput, setPrefSkillInput] = useState('');

  // Form Errors
  const [formErrors, setFormErrors] = useState({});

  // Templates Modal State (Phase 2.3)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  // Quality Checklist Panel State (Phase 2.4)
  const [showChecklistPanel, setShowChecklistPanel] = useState(true);

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null, // 'publish' | 'close' | 'duplicate' | 'delete' | 'bulk_close' | 'bulk_archive'
    job: null,
    loading: false
  });

  // Row Overflow Menu State
  const [openOverflowId, setOpenOverflowId] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Search Debounce (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Saved Views
  const fetchSavedViews = useCallback(async () => {
    try {
      const res = await recruiterService.getSavedViews();
      if (res.success) {
        setBuiltInViews(res.builtInViews || []);
        setCustomViews(res.customViews || []);
        if (res.preferences?.density) setTableDensity(res.preferences.density);
      }
    } catch (err) {
      console.warn('[RecruiterJobs] Saved views fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchSavedViews();
  }, [fetchSavedViews]);

  // Fetch Jobs Workspace Data from Server
  const fetchJobsData = useCallback(async (overridePage = null) => {
    setLoading(true);
    setError(null);
    try {
      const currentPage = overridePage !== null ? overridePage : pagination.page;
      const params = {
        page: currentPage,
        limit: pagination.limit,
        search: debouncedSearch,
        status: statusFilter,
        department: departmentFilter,
        location: locationFilter,
        employmentType: employmentTypeFilter,
        workArrangement: workArrangementFilter,
        seniority: seniorityFilter,
        sortBy
      };

      const res = await recruiterService.getRecruiterJobs(params);
      if (res.success) {
        setJobs(res.jobs || []);
        if (res.metrics) setMetrics(res.metrics);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('[RecruiterJobs] Error fetching jobs:', err);
      setError('Unable to load job requisitions from database. Please check connection and retry.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, departmentFilter, locationFilter, employmentTypeFilter, workArrangementFilter, seniorityFilter, sortBy, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchJobsData();
  }, [fetchJobsData]);

  // Fetch Single Job Details
  const fetchJobDetails = async (jobId) => {
    setLoadingApplicants(true);
    try {
      const res = await recruiterService.getJobDetails(jobId);
      if (res.success && res.job) {
        setSelectedJob(res.job);
        // Also load applicants
        const appRes = await recruiterService.getJobApplicants(jobId);
        if (appRes.success) {
          setJobApplicants(appRes.applicants || []);
        }
      }
    } catch (err) {
      console.error('[RecruiterJobs] Error loading job details:', err);
      showToast('Failed to load requisition details', 'error');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleOpenDetails = (job) => {
    setSelectedJobId(job._id);
    setSelectedJob(job);
    setDetailsTab('overview');
    setViewMode('details');
    fetchJobDetails(job._id);
  };

  // Skill Chip Normalizer (Phase 2.5)
  const normalizeSkill = (skillStr) => {
    if (!skillStr) return '';
    return skillStr.trim().replace(/\s+/g, ' ');
  };

  const handleAddSkill = (type) => {
    if (type === 'required') {
      const trimmed = normalizeSkill(reqSkillInput);
      if (!trimmed) return;
      // Handle pasted comma list
      const parts = trimmed.split(',').map(s => normalizeSkill(s)).filter(Boolean);
      const newSkills = [...reqSkills];
      parts.forEach(p => {
        if (!newSkills.some(existing => existing.toLowerCase() === p.toLowerCase())) {
          newSkills.push(p);
        }
      });
      setReqSkills(newSkills);
      setReqSkillInput('');
      setHasUnsavedChanges(true);
    } else {
      const trimmed = normalizeSkill(prefSkillInput);
      if (!trimmed) return;
      const parts = trimmed.split(',').map(s => normalizeSkill(s)).filter(Boolean);
      const newSkills = [...prefSkills];
      parts.forEach(p => {
        if (!newSkills.some(existing => existing.toLowerCase() === p.toLowerCase())) {
          newSkills.push(p);
        }
      });
      setPrefSkills(newSkills);
      setPrefSkillInput('');
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveSkill = (type, index) => {
    if (type === 'required') {
      setReqSkills(reqSkills.filter((_, i) => i !== index));
    } else {
      setPrefSkills(prefSkills.filter((_, i) => i !== index));
    }
    setHasUnsavedChanges(true);
  };

  // Open Form Modal (Create or Edit)
  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      department: 'Engineering',
      location: 'Remote / Hybrid',
      workArrangement: 'Hybrid',
      employmentType: 'Full-time',
      seniorityLevel: 'Mid-Senior level',
      education: "Bachelor's Degree in CS or equivalent",
      status: 'draft',
      description: '',
      responsibilities: '',
      qualifications: '',
      closingDate: '',
      hrEvaluationPrompt: '',
      expMin: 2,
      expMax: 5,
      expUnit: 'years',
      salMin: 400000,
      salMax: 800000,
      salCurrency: 'INR',
      salPeriod: 'year'
    });
    setReqSkills(['React', 'Node.js']);
    setPrefSkills(['TypeScript']);
    setFormErrors({});
    setEditingJobId(null);
    setHasUnsavedChanges(false);
    setAutosaveStatus('saved');
    setActiveModal('create');
  };

  const handleOpenEditModal = (job) => {
    const expMin = job.experience?.min !== undefined ? job.experience.min : 1;
    const expMax = job.experience?.max !== undefined ? job.experience.max : 3;
    const salMin = job.salary?.min !== undefined ? job.salary.min : 0;
    const salMax = job.salary?.max !== undefined ? job.salary.max : 0;
    const closingDateStr = job.closingDate ? new Date(job.closingDate).toISOString().split('T')[0] : '';

    setFormData({
      title: job.title || '',
      department: job.department || 'Engineering',
      location: job.location || 'Remote',
      workArrangement: job.workArrangement || 'Hybrid',
      employmentType: job.employmentType || 'Full-time',
      seniorityLevel: job.seniorityLevel || 'Mid-Senior level',
      education: job.education || "Bachelor's Degree",
      status: job.status || 'published',
      description: job.description || '',
      responsibilities: job.responsibilities || '',
      qualifications: job.qualifications || '',
      closingDate: closingDateStr,
      hrEvaluationPrompt: job.hrEvaluationPrompt || job.evaluation?.hrPrompt || '',
      expMin,
      expMax,
      expUnit: job.experience?.unit || 'years',
      salMin,
      salMax,
      salCurrency: job.salary?.currency || 'INR',
      salPeriod: job.salary?.period || 'year'
    });
    setReqSkills(Array.isArray(job.requiredSkills) ? job.requiredSkills : []);
    setPrefSkills(Array.isArray(job.preferredSkills) ? job.preferredSkills : []);
    setEditingJobId(job._id);
    setFormErrors({});
    setHasUnsavedChanges(false);
    setAutosaveStatus('saved');
    setActiveModal('edit');
  };

  // Draft Autosave Implementation (Phase 2.1)
  const triggerAutosave = useCallback(async () => {
    if (activeModal !== 'edit' || !editingJobId || formData.status !== 'draft') return;
    setAutosaveStatus('saving');
    try {
      const payload = {
        title: formData.title,
        department: formData.department,
        description: formData.description,
        requiredSkills: reqSkills,
        preferredSkills: prefSkills,
        location: formData.location,
        workArrangement: formData.workArrangement,
        employmentType: formData.employmentType,
        seniorityLevel: formData.seniorityLevel,
        responsibilities: formData.responsibilities,
        qualifications: formData.qualifications,
        closingDate: formData.closingDate || null,
        experience: { min: Number(formData.expMin), max: Number(formData.expMax), unit: formData.expUnit },
        salary: { min: Number(formData.salMin), max: Number(formData.salMax), currency: formData.salCurrency, period: formData.salPeriod },
        hrEvaluationPrompt: formData.hrEvaluationPrompt
      };
      await recruiterService.autosaveDraft(editingJobId, payload);
      setAutosaveStatus('saved');
    } catch (err) {
      console.warn('[Autosave] Autosave failed:', err);
      setAutosaveStatus('failed');
    }
  }, [activeModal, editingJobId, formData, reqSkills, prefSkills]);

  // Form Field Change Handler with Autosave Debounce
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);

    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }

    if (activeModal === 'edit' && formData.status === 'draft') {
      setAutosaveStatus('unsaved');
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        triggerAutosave();
      }, 800);
    }
  };

  // Apply Pre-built Job Template (Phase 2.3)
  const handleApplyTemplate = (tmpl) => {
    setFormData(prev => ({
      ...prev,
      title: tmpl.title,
      department: tmpl.department,
      employmentType: tmpl.employmentType,
      workArrangement: tmpl.workArrangement,
      seniorityLevel: tmpl.seniorityLevel,
      location: tmpl.location,
      education: tmpl.education,
      description: tmpl.description,
      responsibilities: tmpl.responsibilities,
      qualifications: tmpl.qualifications,
      expMin: tmpl.expMin,
      expMax: tmpl.expMax,
      expUnit: tmpl.expUnit,
      salMin: tmpl.salMin,
      salMax: tmpl.salMax,
      salCurrency: tmpl.salCurrency,
      salPeriod: tmpl.salPeriod
    }));
    setReqSkills(tmpl.requiredSkills);
    setPrefSkills(tmpl.preferredSkills);
    setHasUnsavedChanges(true);
    setShowTemplatesModal(false);
    showToast(`Applied template: "${tmpl.title}"`, 'info');
  };

  // Validate Form
  const validateForm = (targetStatus = 'published') => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Job title is required';
    if (!formData.description.trim()) errors.description = 'Job description is required';
    if (reqSkills.length === 0) errors.requiredSkills = 'At least one required skill is required';

    const minExp = Number(formData.expMin);
    const maxExp = Number(formData.expMax);
    if (isNaN(minExp) || minExp < 0) errors.expMin = 'Minimum experience must be non-negative';
    if (isNaN(maxExp) || maxExp < minExp) errors.expMax = 'Max experience cannot be less than min experience';

    const minSal = Number(formData.salMin);
    const maxSal = Number(formData.salMax);
    if (isNaN(minSal) || minSal < 0) errors.salMin = 'Minimum salary must be non-negative';
    if (isNaN(maxSal) || maxSal < minSal) errors.salMax = 'Max salary cannot be less than min salary';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form (Save Draft or Publish)
  const handleSubmitForm = async (targetStatus) => {
    if (formSubmitting) return;
    if (!validateForm(targetStatus)) return;

    setFormSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        department: formData.department,
        description: formData.description,
        requiredSkills: reqSkills,
        preferredSkills: prefSkills,
        education: formData.education,
        location: formData.location,
        workArrangement: formData.workArrangement,
        employmentType: formData.employmentType,
        seniorityLevel: formData.seniorityLevel,
        responsibilities: formData.responsibilities,
        qualifications: formData.qualifications,
        closingDate: formData.closingDate || null,
        status: targetStatus,
        experience: {
          min: Number(formData.expMin),
          max: Number(formData.expMax),
          unit: formData.expUnit
        },
        salary: {
          min: Number(formData.salMin),
          max: Number(formData.salMax),
          currency: formData.salCurrency,
          period: formData.salPeriod
        },
        hrEvaluationPrompt: formData.hrEvaluationPrompt
      };

      if (activeModal === 'create') {
        const res = await recruiterService.createJob(payload);
        if (res.success) {
          showToast(`Job requisition ${targetStatus === 'draft' ? 'saved as Draft' : 'published'} successfully!`);
          setActiveModal(null);
          setHasUnsavedChanges(false);
          fetchJobsData(1);
        }
      } else if (activeModal === 'edit') {
        const res = await recruiterService.updateJob(editingJobId, payload);
        if (res.success) {
          showToast('Job requisition updated successfully!');
          setActiveModal(null);
          setHasUnsavedChanges(false);
          fetchJobsData();
          if (viewMode === 'details' && selectedJobId === editingJobId) {
            fetchJobDetails(editingJobId);
          }
        }
      }
    } catch (err) {
      console.error('[RecruiterJobs] Error saving form:', err);
      showToast(err.response?.data?.message || 'Error saving job requisition', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Form Close Guard
  const handleAttemptCloseModal = () => {
    if (hasUnsavedChanges) {
      setCloseConfirmModalOpen(true);
    } else {
      setActiveModal(null);
    }
  };

  // Confirmation Action Handler (Publish, Close, Duplicate, Delete, Bulk Actions)
  const handleExecuteConfirmAction = async () => {
    if (!confirmDialog.type || confirmDialog.loading) return;
    setConfirmDialog(prev => ({ ...prev, loading: true }));

    try {
      const { type, job } = confirmDialog;
      if (type === 'publish') {
        const res = await recruiterService.updateJob(job._id, { status: 'published' });
        if (res.success) {
          showToast(`Requisition "${job.title}" published!`);
          fetchJobsData();
          if (viewMode === 'details' && selectedJobId === job._id) fetchJobDetails(job._id);
        }
      } else if (type === 'close') {
        const res = await recruiterService.updateJob(job._id, { status: 'closed' });
        if (res.success) {
          showToast(`Requisition "${job.title}" closed.`);
          fetchJobsData();
          if (viewMode === 'details' && selectedJobId === job._id) fetchJobDetails(job._id);
        }
      } else if (type === 'duplicate') {
        const res = await recruiterService.duplicateJob(job._id);
        if (res.success && res.job) {
          showToast(`Created draft copy: "${res.job.title}"`);
          fetchJobsData(1);
          handleOpenEditModal(res.job);
        }
      } else if (type === 'delete') {
        const res = await recruiterService.deleteJob(job._id);
        if (res.success) {
          showToast('Job requisition deleted.');
          if (viewMode === 'details' && selectedJobId === job._id) {
            setViewMode('workspace');
          }
          fetchJobsData();
        }
      } else if (type === 'bulk_close') {
        const res = await recruiterService.bulkActionJobs('close', selectedJobIds);
        if (res.success) {
          showToast(`Closed ${res.successCount} requisitions.`);
          setSelectedJobIds([]);
          fetchJobsData();
        }
      } else if (type === 'bulk_archive') {
        const res = await recruiterService.bulkActionJobs('archive', selectedJobIds);
        if (res.success) {
          showToast(`Archived ${res.successCount} requisitions.`);
          setSelectedJobIds([]);
          fetchJobsData();
        }
      }
    } catch (err) {
      console.error('[RecruiterJobs] Action error:', err);
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setConfirmDialog({ isOpen: false, type: null, job: null, loading: false });
    }
  };

  // CSV Export Handler (Phase 4.1)
  const handleExportCSV = async (scopedJobIds = null) => {
    try {
      showToast('Generating CSV export...', 'info');
      const params = scopedJobIds ? { jobIds: scopedJobIds.join(',') } : {
        search: debouncedSearch,
        status: statusFilter,
        department: departmentFilter,
        location: locationFilter,
        employmentType: employmentTypeFilter,
        workArrangement: workArrangementFilter,
        seniority: seniorityFilter
      };

      const blob = await recruiterService.exportJobsCSV(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `candidateiq_requisitions_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('CSV export downloaded successfully!');
    } catch (err) {
      console.error('[ExportCSV] Export failed:', err);
      showToast('Failed to export requisitions CSV', 'error');
    }
  };

  // Save View Modal Handler (Phase 1.4)
  const handleSaveCustomViewSubmit = async () => {
    if (!newViewName.trim()) return;
    try {
      const queryParams = {
        search: searchQuery,
        status: statusFilter,
        department: departmentFilter,
        location: locationFilter,
        employmentType: employmentTypeFilter,
        workArrangement: workArrangementFilter,
        seniority: seniorityFilter,
        sortBy
      };
      const res = await recruiterService.saveCustomView({
        name: newViewName.trim(),
        queryParams,
        columnVisibility: visibleColumns
      });
      if (res.success) {
        showToast(`Saved view "${newViewName.trim()}"`);
        setSaveViewModalOpen(false);
        setNewViewName('');
        fetchSavedViews();
      }
    } catch (err) {
      showToast('Failed to save custom view', 'error');
    }
  };

  // Apply Saved View Filter Set
  const handleApplySavedView = (view) => {
    setSelectedViewId(view.id || view._id);
    const q = view.queryParams || {};
    if (q.status) setStatusFilter(q.status);
    if (q.department) setDepartmentFilter(q.department);
    if (q.location) setLocationFilter(q.location);
    if (q.employmentType) setEmploymentTypeFilter(q.employmentType);
    if (q.workArrangement) setWorkArrangementFilter(q.workArrangement);
    if (q.seniority) setSeniorityFilter(q.seniority);
    if (q.search !== undefined) setSearchQuery(q.search);
    if (q.sortBy) setSortBy(q.sortBy);
    if (view.columnVisibility) setVisibleColumns(view.columnVisibility);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Job Description Quality Evaluation (Phase 2.4)
  const calculateDescriptionQuality = () => {
    const checks = [
      { id: 'desc', label: 'Job description present (>120 chars)', passed: (formData.description || '').trim().length >= 120 },
      { id: 'resp', label: 'Responsibilities section specified', passed: (formData.responsibilities || '').trim().length > 20 },
      { id: 'qual', label: 'Qualifications section specified', passed: (formData.qualifications || '').trim().length > 20 },
      { id: 'skills', label: 'At least 1 required skill added', passed: reqSkills.length >= 1 },
      { id: 'exp', label: 'Valid experience range set', passed: Number(formData.expMin) <= Number(formData.expMax) },
      { id: 'pref', label: 'Preferred skills kept separate', passed: prefSkills.length > 0 }
    ];
    const passedCount = checks.filter(c => c.passed).length;
    const percentage = Math.round((passedCount / checks.length) * 100);
    return { checks, passedCount, totalCount: checks.length, percentage };
  };

  const qualityStats = calculateDescriptionQuality();

  // Selected Rows Helpers
  const handleToggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedJobIds(jobs.map(j => j._id));
    } else {
      setSelectedJobIds([]);
    }
  };

  const handleToggleSelectRow = (id) => {
    if (selectedJobIds.includes(id)) {
      setSelectedJobIds(selectedJobIds.filter(item => item !== id));
    } else {
      setSelectedJobIds([...selectedJobIds, id]);
    }
  };

  // Status Badge Colors
  const getStatusBadge = (status, needsAttention) => {
    if (needsAttention) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-600" /> Needs Attention
        </span>
      );
    }
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Draft
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Closed
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 p-4 md:p-7 max-w-[1360px] mx-auto font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          toast.type === 'info' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' :
          'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* VIEW MODE 1: WORKSPACE SCREEN (Screen A) */}
      {viewMode === 'workspace' && (
        <div className="space-y-6">
          
          {/* 4.1 Page Header Card */}
          <div className="bg-white rounded-[14px] border border-slate-200 p-5 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <span>CandidateIQ</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-indigo-600 font-semibold">Jobs</span>
              </div>
              <h1 className="text-2xl font-bold font-outfit text-slate-900 tracking-tight">Job Requisitions</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">Manage openings, hiring requirements and recruitment operations progress.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchJobsData()}
                disabled={loading}
                title="Refresh Workspace Data"
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5146F5] hover:bg-[#4338CA] text-white font-medium text-sm transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Job</span>
              </button>
            </div>
          </div>

          {/* 4.2 Summary Metrics (Phase 1.1 — 4 Consolidated Metrics) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Metric 1: Active Requisitions */}
            <div
              onClick={() => { setStatusFilter('published'); setPagination(prev => ({ ...prev, page: 1 })); }}
              className={`bg-white rounded-[14px] border p-5 shadow-sm transition-all cursor-pointer hover:border-indigo-300 ${statusFilter === 'published' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200'}`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Active Requisitions</span>
                <Briefcase className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold font-outfit text-slate-900">{metrics.activeRequisitions || metrics.publishedJobs || 0}</div>
              <div className="text-[11px] text-slate-500 mt-1">Currently open for candidates</div>
            </div>

            {/* Metric 2: Needs Attention */}
            <div
              onClick={() => { setStatusFilter('attention'); setPagination(prev => ({ ...prev, page: 1 })); }}
              className={`bg-white rounded-[14px] border p-5 shadow-sm transition-all cursor-pointer hover:border-amber-300 ${statusFilter === 'attention' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-200'}`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Needs Attention</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-bold font-outfit text-amber-600">{metrics.needsAttention || 0}</div>
              <div className="text-[11px] text-slate-500 mt-1">Stale &gt;30d, 0 apps, or overdue</div>
            </div>

            {/* Metric 3: Total Applications */}
            <div
              className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Total Applications</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold font-outfit text-slate-900">{metrics.totalApplications || 0}</div>
              <div className="text-[11px] text-slate-500 mt-1">Across all accessible jobs</div>
            </div>

            {/* Metric 4: Closing Soon */}
            <div
              onClick={() => { setStatusFilter('closing_soon'); setPagination(prev => ({ ...prev, page: 1 })); }}
              className={`bg-white rounded-[14px] border p-5 shadow-sm transition-all cursor-pointer hover:border-indigo-300 ${statusFilter === 'closing_soon' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200'}`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Closing Soon</span>
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-3xl font-bold font-outfit text-indigo-600">{metrics.closingSoon || 0}</div>
              <div className="text-[11px] text-slate-500 mt-1">Closing in next 7 days</div>
            </div>
          </div>

          {/* 4.3 Search Toolbar, Saved Views & Advanced Filters */}
          <div className="bg-white rounded-[14px] border border-slate-200 p-4 shadow-sm space-y-3">
            
            {/* Top Toolbar Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              
              {/* Primary Search Input */}
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by job title, requisition ID or skill..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Toolbar Dropdown Controls */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Saved Views Dropdown (Phase 1.4) */}
                <div className="relative">
                  <select
                    value={selectedViewId}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'SAVE_CURRENT') {
                        setSaveViewModalOpen(true);
                      } else {
                        const v = [...builtInViews, ...customViews].find(item => (item.id || item._id) === val);
                        if (v) handleApplySavedView(v);
                      }
                    }}
                    className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none"
                  >
                    <optgroup label="Built-in Views">
                      {builtInViews.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </optgroup>
                    {customViews.length > 0 && (
                      <optgroup label="Custom Saved Views">
                        {customViews.map(v => (
                          <option key={v._id} value={v._id}>{v.name}</option>
                        ))}
                      </optgroup>
                    )}
                    <option value="SAVE_CURRENT">+ Save Current View...</option>
                  </select>
                </div>

                {/* Compact Dropdown Filters */}
                <select
                  value={departmentFilter}
                  onChange={(e) => { setDepartmentFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                  className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                </select>

                <select
                  value={employmentTypeFilter}
                  onChange={(e) => { setEmploymentTypeFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                  className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All Employment</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="newest">Newest Created</option>
                  <option value="oldest">Oldest Created</option>
                  <option value="title">Job Title A–Z</option>
                  <option value="applications">Most Applications</option>
                </select>

                {/* Advanced Filters Drawer Button */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`h-10 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    showAdvancedFilters || workArrangementFilter !== 'all' || seniorityFilter !== 'all'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Advanced</span>
                  {(workArrangementFilter !== 'all' || seniorityFilter !== 'all') && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  )}
                </button>

                {/* Export CSV Utility (Phase 4.1) */}
                <button
                  onClick={() => handleExportCSV()}
                  title="Export Current Filtered Requisitions to CSV"
                  className="h-10 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                {/* Clear Filters Action */}
                {(statusFilter !== 'all' || searchQuery !== '' || departmentFilter !== 'all' || locationFilter !== 'all' || employmentTypeFilter !== 'all' || workArrangementFilter !== 'all' || seniorityFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setSearchQuery('');
                      setDepartmentFilter('all');
                      setLocationFilter('all');
                      setEmploymentTypeFilter('all');
                      setWorkArrangementFilter('all');
                      setSeniorityFilter('all');
                      setSortBy('updated');
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="h-10 px-3 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters Collapsible Panel */}
            {showAdvancedFilters && (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Work Arrangement</label>
                  <select
                    value={workArrangementFilter}
                    onChange={(e) => { setWorkArrangementFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  >
                    <option value="all">All Arrangements</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Seniority Level</label>
                  <select
                    value={seniorityFilter}
                    onChange={(e) => { setSeniorityFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  >
                    <option value="all">All Levels</option>
                    <option value="Junior">Entry / Junior level</option>
                    <option value="Mid-Senior">Mid-Senior level</option>
                    <option value="Senior">Senior / Principal level</option>
                    <option value="Executive">Lead / Director level</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Table Density (Phase 1.5)</label>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setTableDensity('comfortable')}
                      className={`flex-1 py-1 text-xs font-medium rounded ${tableDensity === 'comfortable' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
                    >
                      Comfortable
                    </button>
                    <button
                      onClick={() => setTableDensity('compact')}
                      className={`flex-1 py-1 text-xs font-medium rounded ${tableDensity === 'compact' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
                    >
                      Compact
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4.4 Status Filter Tabs */}
          <div className="border-b border-slate-200 flex items-center gap-6 px-1">
            {[
              { id: 'all', label: 'All Jobs', count: metrics.totalJobs || jobs.length },
              { id: 'published', label: 'Published', count: metrics.publishedJobs || metrics.activeRequisitions || 0 },
              { id: 'draft', label: 'Drafts', count: metrics.draftJobs || 0 },
              { id: 'closed', label: 'Closed', count: metrics.closedJobs || 0 },
              { id: 'attention', label: 'Needs Attention', count: metrics.needsAttention || 0 }
            ].map(tab => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setStatusFilter(tab.id); setPagination(prev => ({ ...prev, page: 1 })); }}
                  className={`py-3 text-sm font-semibold relative transition-colors flex items-center gap-2 ${
                    isActive ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bulk Selection Operations Bar (Phase 1.6) */}
          {selectedJobIds.length > 0 && (
            <div className="bg-indigo-900 text-white rounded-xl p-3 px-5 flex items-center justify-between shadow-md animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="bg-indigo-700 px-2.5 py-1 rounded-lg font-bold">{selectedJobIds.length} Selected</span>
                <span>Perform bulk operations on selected requisitions</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDialog({ isOpen: true, type: 'bulk_close', job: null, loading: false })}
                  className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Close Jobs
                </button>
                <button
                  onClick={() => setConfirmDialog({ isOpen: true, type: 'bulk_archive', job: null, loading: false })}
                  className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Archive Jobs
                </button>
                <button
                  onClick={() => handleExportCSV(selectedJobIds)}
                  className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Selected</span>
                </button>
                <button
                  onClick={() => setSelectedJobIds([])}
                  className="px-3 py-1.5 text-indigo-200 hover:text-white text-xs font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* 4.5 Requisition Table */}
          <div className="bg-white rounded-[14px] border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              // Loading Skeleton State
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : error ? (
              // Error State
              <div className="p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Unable to load requisitions</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
                <button
                  onClick={() => fetchJobsData()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                >
                  Retry
                </button>
              </div>
            ) : jobs.length === 0 ? (
              // Empty State
              <div className="p-12 text-center space-y-3">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">
                  {statusFilter !== 'all' || searchQuery ? 'No matching requisitions' : 'No job requisitions yet'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {statusFilter !== 'all' || searchQuery
                    ? 'Try clearing your search keyword or active filters.'
                    : 'Create your first job requisition to start managing your hiring workflow.'}
                </p>
                {statusFilter !== 'all' || searchQuery ? (
                  <button
                    onClick={() => { setStatusFilter('all'); setSearchQuery(''); fetchJobsData(); }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 rounded-xl bg-[#5146F5] text-white text-xs font-semibold hover:bg-indigo-700"
                  >
                    + Create Job Requisition
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-3 pl-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedJobIds.length === jobs.length && jobs.length > 0}
                          onChange={handleToggleSelectAll}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      {visibleColumns.job && <th className="py-3 px-4">Job Requisition</th>}
                      {visibleColumns.location && <th className="py-3 px-4">Location</th>}
                      {visibleColumns.employment && <th className="py-3 px-4">Employment</th>}
                      {visibleColumns.skills && <th className="py-3 px-4">Required Skills</th>}
                      {visibleColumns.status && <th className="py-3 px-4">Status</th>}
                      {visibleColumns.applications && <th className="py-3 px-4 text-center">Applications</th>}
                      {visibleColumns.updated && <th className="py-3 px-4">Updated</th>}
                      {visibleColumns.actions && <th className="py-3 px-4 text-right pr-6">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map((job) => {
                      const reqSkillsList = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
                      const displaySkills = reqSkillsList.slice(0, 3);
                      const extraSkillsCount = reqSkillsList.length - 3;
                      const isSelected = selectedJobIds.includes(job._id);

                      return (
                        <tr
                          key={job._id}
                          className={`hover:bg-slate-50/80 transition-colors ${tableDensity === 'compact' ? 'h-14' : 'h-20'} ${isSelected ? 'bg-indigo-50/30' : ''}`}
                        >
                          {/* Checkbox */}
                          <td className="p-3 pl-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(job._id)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>

                          {/* Column 1: Job */}
                          {visibleColumns.job && (
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleOpenDetails(job)}
                                className="font-semibold text-sm text-slate-900 hover:text-indigo-600 transition-colors text-left block line-clamp-1"
                              >
                                {job.title}
                              </button>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="font-mono text-slate-400">ID: {job._id.slice(-6).toUpperCase()}</span>
                                <span>•</span>
                                <span>{job.department || 'Engineering'}</span>
                              </div>
                            </td>
                          )}

                          {/* Column 2: Location */}
                          {visibleColumns.location && (
                            <td className="py-3 px-4 text-xs text-slate-600">
                              <div className="font-medium text-slate-800 line-clamp-1">{job.location || 'Remote'}</div>
                              <div className="text-[11px] text-slate-400">{job.workArrangement || 'Hybrid'}</div>
                            </td>
                          )}

                          {/* Column 3: Employment */}
                          {visibleColumns.employment && (
                            <td className="py-3 px-4 text-xs text-slate-600">
                              <div className="font-medium text-slate-800">{job.employmentType || 'Full-time'}</div>
                              <div className="text-[11px] text-slate-400">{job.experienceLevel || '1-3 Years'}</div>
                            </td>
                          )}

                          {/* Column 4: Required Skills */}
                          {visibleColumns.skills && (
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap items-center gap-1 max-w-xs">
                                {displaySkills.map((skill, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium border border-slate-200">
                                    {skill}
                                  </span>
                                ))}
                                {extraSkillsCount > 0 && (
                                  <span className="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[10px] font-semibold border border-slate-200">
                                    +{extraSkillsCount}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}

                          {/* Column 5: Status Badge */}
                          {visibleColumns.status && (
                            <td className="py-3 px-4 whitespace-nowrap">
                              {getStatusBadge(job.status, job.needsAttention)}
                            </td>
                          )}

                          {/* Column 6: Applications */}
                          {visibleColumns.applications && (
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => handleOpenDetails(job)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>{job.applicationCount || job.applicationsCount || 0}</span>
                              </button>
                            </td>
                          )}

                          {/* Column 7: Updated */}
                          {visibleColumns.updated && (
                            <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                              {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                          )}

                          {/* Column 8: Actions Overflow */}
                          {visibleColumns.actions && (
                            <td className="py-3 px-4 text-right pr-6 whitespace-nowrap">
                              <div className="relative inline-block text-left">
                                <button
                                  onClick={() => setOpenOverflowId(openOverflowId === job._id ? null : job._id)}
                                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                                >
                                  <Sliders className="w-4 h-4" />
                                </button>

                                {openOverflowId === job._id && (
                                  <div
                                    onMouseLeave={() => setOpenOverflowId(null)}
                                    className="origin-top-right absolute right-0 mt-1 w-48 rounded-xl bg-white border border-slate-200 shadow-xl z-20 py-1 divide-y divide-slate-100 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                                  >
                                    <div className="py-1">
                                      <button
                                        onClick={() => { setOpenOverflowId(null); handleOpenDetails(job); }}
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>View Details</span>
                                      </button>

                                      <button
                                        onClick={() => { setOpenOverflowId(null); handleOpenEditModal(job); }}
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Edit Requisition</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          setOpenOverflowId(null);
                                          setConfirmDialog({ isOpen: true, type: 'duplicate', job, loading: false });
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Duplicate Draft</span>
                                      </button>
                                    </div>

                                    <div className="py-1">
                                      {job.status === 'draft' && (
                                        <button
                                          onClick={() => {
                                            setOpenOverflowId(null);
                                            setConfirmDialog({ isOpen: true, type: 'publish', job, loading: false });
                                          }}
                                          className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>Publish Job</span>
                                        </button>
                                      )}

                                      {job.status === 'published' && (
                                        <button
                                          onClick={() => {
                                            setOpenOverflowId(null);
                                            setConfirmDialog({ isOpen: true, type: 'close', job, loading: false });
                                          }}
                                          className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                          <span>Close Job</span>
                                        </button>
                                      )}

                                      <button
                                        onClick={() => {
                                          setOpenOverflowId(null);
                                          setConfirmDialog({ isOpen: true, type: 'delete', job, loading: false });
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete Requisition</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4.6 Server Pagination Footer */}
            {!loading && !error && jobs.length > 0 && (
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div>
                  Showing <span className="font-semibold text-slate-800">{(pagination.page - 1) * pagination.limit + 1}</span>–
                  <span className="font-semibold text-slate-800">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-semibold text-slate-800">{pagination.total}</span> requisitions
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <select
                      value={pagination.limit}
                      onChange={(e) => {
                        const newLimit = parseInt(e.target.value, 10);
                        setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-700 disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="px-3 py-1.5 font-semibold text-slate-700">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-700 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: JOB DETAILS SCREEN (Screen C) */}
      {viewMode === 'details' && selectedJob && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Header */}
          <div className="bg-white rounded-[14px] border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewMode('workspace')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Requisitions Workspace</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedJob)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Requisition
                </button>

                {selectedJob.status === 'draft' && (
                  <button
                    onClick={() => setConfirmDialog({ isOpen: true, type: 'publish', job: selectedJob, loading: false })}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Publish Job
                  </button>
                )}

                {selectedJob.status === 'published' && (
                  <button
                    onClick={() => setConfirmDialog({ isOpen: true, type: 'close', job: selectedJob, loading: false })}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                  >
                    Close Job
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold font-outfit text-slate-900">{selectedJob.title}</h1>
                  {getStatusBadge(selectedJob.status, selectedJob.requisitionHealth?.needsAttention)}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">ID: {selectedJob._id}</span>
                  <span>•</span>
                  <span>{selectedJob.department || 'Engineering'}</span>
                  <span>•</span>
                  <span>{selectedJob.location || 'Remote'} ({selectedJob.workArrangement || 'Hybrid'})</span>
                  <span>•</span>
                  <span>{selectedJob.employmentType || 'Full-time'}</span>
                </div>
              </div>

              <div className="text-right text-xs text-slate-500">
                <div>Created: {new Date(selectedJob.createdAt).toLocaleDateString()}</div>
                <div>Updated: {new Date(selectedJob.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 mb-1">Total Applications</div>
              <div className="text-3xl font-bold font-outfit text-indigo-600">{selectedJob.applicationCount || jobApplicants.length || 0}</div>
            </div>

            <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 mb-1">Shortlisted</div>
              <div className="text-3xl font-bold font-outfit text-emerald-600">
                {jobApplicants.filter(a => a.status === 'shortlisted').length}
              </div>
            </div>

            <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 mb-1">Interviews Scheduled</div>
              <div className="text-3xl font-bold font-outfit text-amber-600">
                {jobApplicants.filter(a => a.status === 'interview_scheduled').length}
              </div>
            </div>

            <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 mb-1">Days Open</div>
              <div className="text-3xl font-bold font-outfit text-slate-900">
                {selectedJob.requisitionHealth?.ageDays !== undefined
                  ? selectedJob.requisitionHealth.ageDays
                  : Math.floor((new Date() - new Date(selectedJob.createdAt)) / (1000 * 60 * 60 * 24))}
              </div>
            </div>
          </div>

          {/* Detail Tabs Header */}
          <div className="border-b border-slate-200 flex items-center gap-6 px-1">
            {['overview', 'description', 'requirements', 'applications', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setDetailsTab(tab)}
                className={`py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
                  detailsTab === tab ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {detailsTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (65%) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Requisition Health Panel (Phase 3.1) */}
                {selectedJob.requisitionHealth && (
                  <div className={`rounded-[14px] border p-5 ${
                    selectedJob.requisitionHealth.needsAttention
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className={`w-5 h-5 ${selectedJob.requisitionHealth.needsAttention ? 'text-amber-600' : 'text-emerald-600'}`} />
                      <h3 className="text-sm font-bold text-slate-900">Requisition Operational Health</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80">
                        <div className="text-slate-500">Applications</div>
                        <div className="text-base font-bold text-slate-900">{selectedJob.applicationCount || 0}</div>
                      </div>
                      <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80">
                        <div className="text-slate-500">Days Open</div>
                        <div className="text-base font-bold text-slate-900">{selectedJob.requisitionHealth.ageDays} days</div>
                      </div>
                      <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80">
                        <div className="text-slate-500">Closing Status</div>
                        <div className="text-xs font-bold text-slate-800">
                          {selectedJob.closingDate ? new Date(selectedJob.closingDate).toLocaleDateString() : 'Continuous'}
                        </div>
                      </div>
                      <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80">
                        <div className="text-slate-500">Attention Status</div>
                        <div className={`text-xs font-bold ${selectedJob.requisitionHealth.needsAttention ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {selectedJob.requisitionHealth.needsAttention ? 'Review Required' : 'Healthy'}
                        </div>
                      </div>
                    </div>

                    {selectedJob.requisitionHealth.reasons?.length > 0 && (
                      <div className="mt-3 text-xs text-amber-800 space-y-1 bg-amber-100/60 p-2.5 rounded-lg">
                        {selectedJob.requisitionHealth.reasons.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Job Summary */}
                <div className="bg-white rounded-[14px] border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Job Description Preview</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Key Responsibilities */}
                {selectedJob.responsibilities && (
                  <div className="bg-white rounded-[14px] border border-slate-200 p-6 shadow-sm space-y-3">
                    <h3 className="text-base font-bold text-slate-900">Key Responsibilities</h3>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {selectedJob.responsibilities}
                    </p>
                  </div>
                )}

                {/* Recent Recruitment Activity Timeline (Phase 3.3) */}
                <div className="bg-white rounded-[14px] border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Recruitment Activity History</h3>
                  {selectedJob.history && selectedJob.history.length > 0 ? (
                    <div className="space-y-3 relative border-l-2 border-slate-100 pl-4 ml-2">
                      {selectedJob.history.slice().reverse().map((entry, idx) => (
                        <div key={idx} className="relative text-xs space-y-0.5">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white"></div>
                          <div className="font-semibold text-slate-900">{entry.action}</div>
                          <div className="text-slate-500">By {entry.actorName || 'Recruiter'} • {new Date(entry.timestamp).toLocaleString()}</div>
                          {entry.details && <div className="text-slate-600 italic mt-0.5">{entry.details}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">Initial creation timestamp recorded: {new Date(selectedJob.createdAt).toLocaleString()}</div>
                  )}
                </div>
              </div>

              {/* Right Column (35%) */}
              <div className="space-y-6">
                
                {/* Requirements Summary */}
                <div className="bg-white rounded-[14px] border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Hiring Requirements</h3>
                  
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-1.5">Required Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedJob.requiredSkills || []).map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedJob.preferredSkills?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1.5">Preferred Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJob.preferredSkills.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-md border border-slate-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 space-y-2 text-xs text-slate-600 border-t">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Experience Range:</span>
                      <span className="font-semibold text-slate-800">{selectedJob.experienceLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Education:</span>
                      <span className="font-semibold text-slate-800">{selectedJob.education || "Bachelor's"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Salary Budget:</span>
                      <span className="font-semibold text-slate-800">{formatSalary(selectedJob.salary)}</span>
                    </div>
                  </div>
                </div>

                {/* Related Requisitions (Phase 3.4) */}
                {selectedJob.relatedRequisitions && selectedJob.relatedRequisitions.length > 0 && (
                  <div className="bg-white rounded-[14px] border border-slate-200 p-6 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Related Requisitions</h3>
                    <div className="space-y-2">
                      {selectedJob.relatedRequisitions.map(rel => (
                        <div
                          key={rel._id}
                          onClick={() => handleOpenDetails(rel)}
                          className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200/80 cursor-pointer transition-colors"
                        >
                          <div className="text-xs font-bold text-slate-900 hover:text-indigo-600">{rel.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{rel.department} • {rel.location}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DESCRIPTION */}
          {detailsTab === 'description' && (
            <div className="bg-white rounded-[14px] border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Full Job Description</h3>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{selectedJob.description}</p>
              </div>
              {selectedJob.responsibilities && (
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Key Responsibilities</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{selectedJob.responsibilities}</p>
                </div>
              )}
              {selectedJob.qualifications && (
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Minimum Qualifications</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{selectedJob.qualifications}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REQUIREMENTS & SKILL COVERAGE */}
          {detailsTab === 'requirements' && (
            <div className="bg-white rounded-[14px] border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Skill Coverage Analysis (Phase 3.2) */}
              {selectedJob.skillCoverage && (
                <div className="bg-indigo-50/60 rounded-xl p-5 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-indigo-950">Profile Skill Coverage Analysis</h4>
                      <p className="text-xs text-indigo-700">Required skills represented in applicant candidate profiles</p>
                    </div>
                    <div className="text-2xl font-bold font-outfit text-indigo-600">
                      {selectedJob.skillCoverage.coveragePercentage}%
                    </div>
                  </div>
                  <div className="w-full bg-indigo-200/70 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${selectedJob.skillCoverage.coveragePercentage}%` }}></div>
                  </div>
                  <div className="text-xs text-indigo-800 font-medium">
                    {selectedJob.skillCoverage.coveredSkillsCount} of {selectedJob.skillCoverage.requiredSkillsCount} required skills covered by existing applicant pool.
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Required Core Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedJob.requiredSkills || []).map((s, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CANDIDATE APPLICATIONS INTEGRATION */}
          {detailsTab === 'applications' && (
            <div className="bg-white rounded-[14px] border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-bold text-slate-900">Applications for this Requisition ({jobApplicants.length})</h3>
                <span className="text-xs text-slate-500">Filtered by Requisition ID: {selectedJob._id}</span>
              </div>

              {loadingApplicants ? (
                <div className="py-8 text-center text-xs text-slate-500 animate-pulse">Loading candidate applications...</div>
              ) : jobApplicants.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No candidate applications received for this job posting yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {jobApplicants.map(app => (
                    <div key={app._id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{app.candidate?.name || 'Candidate'}</div>
                        <div className="text-xs text-slate-500">{app.candidate?.email} • Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">{app.status}</span>
                        <span className="text-xs font-bold text-indigo-600">Match: {app.overallScore || 'N/A'}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SETTINGS & HR EVALUATION PROMPT */}
          {detailsTab === 'settings' && (
            <div className="bg-white rounded-[14px] border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">HR Evaluation Prompt</h3>
                <p className="text-xs text-slate-500 mb-3">Recruiter evaluation guidance prompt associated with this role.</p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-line">
                  {selectedJob.hrEvaluationPrompt || selectedJob.evaluation?.hrPrompt || 'No specific HR evaluation prompt specified for this role.'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCREEN B: CREATE & EDIT JOB MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] border border-slate-200 w-full max-w-[880px] max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-outfit text-slate-900">
                    {activeModal === 'create' ? 'Create Job Requisition' : 'Edit Job Requisition'}
                  </h2>
                  {activeModal === 'edit' && formData.status === 'draft' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                      {autosaveStatus === 'saving' && <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />}
                      {autosaveStatus === 'saving' ? 'Autosaving...' : autosaveStatus === 'saved' ? 'Saved just now' : 'Unsaved changes'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Define opening details, hiring requirements and evaluation criteria.</p>
              </div>

              <div className="flex items-center gap-2">
                {activeModal === 'create' && (
                  <button
                    onClick={() => setShowTemplatesModal(true)}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Use Template</span>
                  </button>
                )}

                <button onClick={handleAttemptCloseModal} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Form Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* SECTION 01: Job Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Section 01 — Job Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Job Title <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g. Senior Full Stack Engineer"
                      className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${formErrors.title ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'}`}
                    />
                    {formErrors.title && <span className="text-rose-600 text-[11px] mt-1 block">{formErrors.title}</span>}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Department <span className="text-rose-500">*</span></label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="AI & Data Science">AI & Data Science</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g. Bangalore, India"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Work Arrangement</label>
                    <select
                      value={formData.workArrangement}
                      onChange={(e) => handleInputChange('workArrangement', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Employment Type</label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => handleInputChange('employmentType', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Closing Date (Phase 2.6)</label>
                    <input
                      type="date"
                      value={formData.closingDate}
                      onChange={(e) => handleInputChange('closingDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 02: Experience & Compensation */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <span>Section 02 — Experience & Compensation</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Experience Range (Years)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={formData.expMin}
                        onChange={(e) => handleInputChange('expMin', e.target.value)}
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                      <span>to</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.expMax}
                        onChange={(e) => handleInputChange('expMax', e.target.value)}
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                    {(formErrors.expMin || formErrors.expMax) && (
                      <span className="text-rose-600 text-[11px] mt-1 block">{formErrors.expMin || formErrors.expMax}</span>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Annual Salary Range ({formData.salCurrency})</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={formData.salMin}
                        onChange={(e) => handleInputChange('salMin', e.target.value)}
                        placeholder="Min Salary"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                      <span>to</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.salMax}
                        onChange={(e) => handleInputChange('salMax', e.target.value)}
                        placeholder="Max Salary"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                    {(formErrors.salMin || formErrors.salMax) && (
                      <span className="text-rose-600 text-[11px] mt-1 block">{formErrors.salMin || formErrors.salMax}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 03: Skills & Job Description */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Section 03 — Skills & Job Description</span>
                </h3>

                {/* Required Skills Chip Input */}
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Required Skills <span className="text-rose-500">*</span></label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={reqSkillInput}
                      onChange={(e) => setReqSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill('required'); } }}
                      placeholder="Type skill name or paste comma list and press Enter..."
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill('required')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl text-slate-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {reqSkills.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded-lg text-xs">
                        <span>{skill}</span>
                        <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => handleRemoveSkill('required', idx)} />
                      </span>
                    ))}
                  </div>
                  {formErrors.requiredSkills && <span className="text-rose-600 text-[11px] mt-1 block">{formErrors.requiredSkills}</span>}
                </div>

                {/* Preferred Skills Chip Input */}
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Preferred Skills</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={prefSkillInput}
                      onChange={(e) => setPrefSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill('preferred'); } }}
                      placeholder="Type preferred skill and press Enter..."
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill('preferred')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl text-slate-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {prefSkills.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-lg text-xs">
                        <span>{skill}</span>
                        <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => handleRemoveSkill('preferred', idx)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Job Description <span className="text-rose-500">*</span></label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide overview of the role..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                  {formErrors.description && <span className="text-rose-600 text-[11px] mt-1 block">{formErrors.description}</span>}
                </div>

                {/* Responsibilities */}
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Key Responsibilities</label>
                  <textarea
                    rows={3}
                    value={formData.responsibilities}
                    onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                    placeholder="List core responsibilities..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                {/* Qualifications */}
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Minimum Qualifications</label>
                  <textarea
                    rows={3}
                    value={formData.qualifications}
                    onChange={(e) => handleInputChange('qualifications', e.target.value)}
                    placeholder="List educational & technical qualifications..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                {/* Job Description Quality Checklist Panel (Phase 2.4) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div
                    onClick={() => setShowChecklistPanel(!showChecklistPanel)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-4 h-4 ${qualityStats.percentage === 100 ? 'text-emerald-600' : 'text-indigo-600'}`} />
                      <span className="font-bold text-slate-800 text-xs">Job Description Quality Checklist</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-indigo-700 border">
                        {qualityStats.percentage}% Complete
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showChecklistPanel ? 'rotate-180' : ''}`} />
                  </div>

                  {showChecklistPanel && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                      {qualityStats.checks.map(check => (
                        <div key={check.id} className="flex items-center gap-2">
                          {check.passed ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className={check.passed ? 'text-slate-800' : 'text-slate-500'}>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 04: Candidate Evaluation Configuration */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>Section 04 — Candidate Evaluation & ATS Scoring Configuration</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase font-mono">
                    100% Weight Validated
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Configure evaluation dimension weights and AI instruction guidelines snapshotted for applicant screening against this requisition.
                </p>

                {/* Dimension Weights Grid */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                  <span className="font-bold text-slate-900 block font-outfit uppercase tracking-wider text-[11px]">
                    ATS Evaluation Dimension Weights (Default Total: 100%)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Required Skills</span>
                      <span className="font-bold text-indigo-600 font-mono">30%</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Relevant Exp</span>
                      <span className="font-bold text-indigo-600 font-mono">20%</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Project Scope</span>
                      <span className="font-bold text-indigo-600 font-mono">15%</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Technical Depth</span>
                      <span className="font-bold text-indigo-600 font-mono">15%</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Responsibilities</span>
                      <span className="font-bold text-indigo-600 font-mono">10%</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Education</span>
                      <span className="font-bold text-indigo-600 font-mono">5%</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 col-span-2">
                      <span className="text-slate-500 block">Quantified Impact</span>
                      <span className="font-bold text-indigo-600 font-mono">5%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-900 block font-outfit">AI Evaluation Instructions & Prompt Guidelines</label>
                  <textarea
                    rows={3}
                    value={formData.hrEvaluationPrompt}
                    onChange={(e) => handleInputChange('hrEvaluationPrompt', e.target.value)}
                    placeholder="e.g. Evaluate candidate against required skills, system architecture experience, clean code principles, and quantifiable production scale..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={handleAttemptCloseModal}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmitForm('draft')}
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmitForm('published')}
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-[#5146F5] hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{activeModal === 'create' ? 'Publish Job' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JOB TEMPLATES MODAL (Phase 2.3) */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] border border-slate-200 w-full max-w-[640px] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Select Pre-built Job Requisition Template</span>
              </h3>
              <button onClick={() => setShowTemplatesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {JOB_TEMPLATES.map(tmpl => (
                <div
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-4 border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">{tmpl.title}</h4>
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{tmpl.department}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{tmpl.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {tmpl.requiredSkills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SAVE CUSTOM VIEW MODAL (Phase 1.4) */}
      {saveViewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] border border-slate-200 w-full max-w-[420px] p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Save Custom Job View</h3>
            <p className="text-xs text-slate-500">Save your current search keyword, filters, and sort options as a named reusable view.</p>
            <input
              type="text"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="e.g. Bangalore Engineering Openings"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setSaveViewModalOpen(false)} className="px-4 py-2 text-xs text-slate-600">Cancel</button>
              <button onClick={handleSaveCustomViewSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">Save View</button>
            </div>
          </div>
        </div>
      )}

      {/* UNSAVED CHANGES GUARD MODAL */}
      {closeConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] border border-slate-200 w-full max-w-[420px] p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Discard unsaved changes?</h3>
            <p className="text-xs text-slate-500">You have unsaved changes in this requisition form. Are you sure you want to close?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCloseConfirmModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl">Keep Editing</button>
              <button onClick={() => { setCloseConfirmModalOpen(false); setActiveModal(null); setHasUnsavedChanges(false); }} className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl">Discard & Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] border border-slate-200 w-full max-w-[460px] p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 capitalize">
              {confirmDialog.type === 'publish' && 'Publish Job Requisition'}
              {confirmDialog.type === 'close' && 'Close Job Requisition'}
              {confirmDialog.type === 'duplicate' && 'Duplicate Job Requisition'}
              {confirmDialog.type === 'delete' && 'Delete Job Requisition'}
              {confirmDialog.type === 'bulk_close' && 'Close Selected Requisitions'}
              {confirmDialog.type === 'bulk_archive' && 'Archive Selected Requisitions'}
            </h3>
            
            <p className="text-xs text-slate-600">
              {confirmDialog.type === 'publish' && 'This requisition will become published and accept candidate applications.'}
              {confirmDialog.type === 'close' && 'This requisition will stop accepting new applications. Existing applications will remain available.'}
              {confirmDialog.type === 'duplicate' && 'Create a new draft using this requisition details and evaluation prompt? Candidate applications will NOT be copied.'}
              {confirmDialog.type === 'delete' && 'Are you sure you want to delete this job requisition?'}
              {confirmDialog.type === 'bulk_close' && `Are you sure you want to close ${selectedJobIds.length} selected published job requisitions?`}
              {confirmDialog.type === 'bulk_archive' && `Are you sure you want to archive ${selectedJobIds.length} selected job requisitions?`}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                disabled={confirmDialog.loading}
                onClick={() => setConfirmDialog({ isOpen: false, type: null, job: null, loading: false })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={confirmDialog.loading}
                onClick={handleExecuteConfirmAction}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 ${
                  confirmDialog.type === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {confirmDialog.loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Action</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
