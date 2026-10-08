/**
 * Database-Backed Resume History Service for CandidateIQ
 * Synchronizes versioned resumes, thumbnail previews, and ATS evaluations
 * directly with backend MongoDB REST APIs with local fallback.
 */

import api from '../api';
import { evaluateResumeATS } from '../ats/atsAnalysisEngine';

const STORAGE_KEY = 'candidateiq_resume_history_v2';

export const resumeHistoryService = {
  // Fetch candidate resumes from MongoDB API
  getResumesAsync: async () => {
    try {
      const res = await api.get('/resumes/my-resumes');
      if (res.data && Array.isArray(res.data.resumes) && res.data.resumes.length > 0) {
        const formatted = res.data.resumes.map((r) => ({
          id: r._id || r.id,
          _id: r._id,
          candidateId: r.candidate || 'cand_1',
          file: r.file || { name: r.fileName, size: r.fileSize, mimeType: r.fileType, rawText: r.rawText },
          preview: r.preview || { thumbnailUrl: '' },
          target: r.target || { companyName: '', role: '', jobDescription: '' },
          extractedProfile: r.extractedProfile,
          analysis: r.analysis || evaluateResumeATS(r.file?.rawText || r.rawText || '', r.target || {}),
          version: r.version || 1,
          versionHistory: r.versionHistory || [],
          status: r.status || 'analyzed',
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
        return formatted;
      }
    } catch (err) {
      console.warn('[resumeHistoryService] API fetch note:', err.message);
    }
    return resumeHistoryService.getResumes();
  },

  getResumes: (candidateId = 'cand_1') => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[resumeHistoryService] Storage read error:', e);
    }
    return [];
  },

  getResumeById: (id) => {
    const list = resumeHistoryService.getResumes();
    return list.find((r) => r.id === id || r._id === id) || null;
  },

  getResumeByIdAsync: async (id) => {
    const local = resumeHistoryService.getResumeById(id);
    if (local) return local;

    try {
      const res = await api.get(`/resumes/${id}`);
      if (res.data && res.data.resume) {
        const r = res.data.resume;
        const formatted = {
          id: r._id || r.id,
          _id: r._id,
          candidateId: r.candidate || 'cand_1',
          displayName: r.fileName || r.file?.name,
          file: r.file || { name: r.fileName, size: r.fileSize, mimeType: r.fileType, rawText: r.rawText },
          preview: r.preview || { thumbnailUrl: '' },
          target: r.target || { companyName: '', role: '', jobDescription: '' },
          extractedProfile: r.extractedProfile,
          analysis: r.analysis || evaluateResumeATS(r.file?.rawText || r.rawText || '', r.target || {}),
          version: r.version || 1,
          versionHistory: r.versionHistory || [],
          status: r.status || 'analyzed',
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        };
        await resumeHistoryService.saveResume(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn('[resumeHistoryService] Async fetch note:', err.message);
    }
    return null;
  },

  analyzeResumeAsync: async (resumeId, targetContext = {}) => {
    const record = resumeHistoryService.getResumeById(resumeId);
    try {
      const res = await api.post(`/resumes/${resumeId}/analyze`, { target: targetContext });
      if (res.data && res.data.analysis) {
        const updated = {
          ...(record || {}),
          id: resumeId,
          target: targetContext,
          analysis: res.data.analysis,
          status: 'analyzed',
          updatedAt: new Date().toISOString()
        };
        return resumeHistoryService.saveResume(updated);
      }
    } catch (err) {
      console.warn('[resumeHistoryService] Backend AI analyze note:', err.message);
    }
    // Fallback to local evaluation
    return resumeHistoryService.updateTargetAndReanalyze(resumeId, targetContext);
  },


  saveResume: async (resumeRecord) => {
    const list = resumeHistoryService.getResumes();
    const existingIndex = list.findIndex((r) => r.id === resumeRecord.id || r._id === resumeRecord.id);

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = { ...list[existingIndex], ...resumeRecord, updatedAt: new Date().toISOString() };
    } else {
      updatedList = [resumeRecord, ...list];
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('[resumeHistoryService] Storage write error:', e);
    }

    // Sync to MongoDB backend
    try {
      await api.post('/resumes/upload', {
        fileName: resumeRecord.file?.name,
        fileType: resumeRecord.file?.mimeType,
        fileSize: resumeRecord.file?.size,
        rawText: resumeRecord.file?.rawText,
        pageCount: resumeRecord.file?.pageCount,
        preview: resumeRecord.preview,
        target: resumeRecord.target,
        extractedProfile: resumeRecord.extractedProfile,
        analysis: resumeRecord.analysis
      });
    } catch (apiErr) {
      console.warn('[resumeHistoryService] Backend sync note:', apiErr.message);
    }

    return resumeRecord;
  },

  updateResumeFile: (resumeId, newFile, newRawText, newPageCount, newThumbnailUrl, newExtractedProfile) => {
    const list = resumeHistoryService.getResumes();
    const target = list.find((r) => r.id === resumeId || r._id === resumeId);
    if (!target) return null;

    const nextVersion = (target.version || 1) + 1;
    const historyItem = {
      version: target.version || 1,
      fileName: target.file?.name,
      uploadedAt: target.updatedAt || target.createdAt,
      overallScore: target.analysis?.overallScore
    };

    const newAnalysis = evaluateResumeATS(newRawText, target.target || {});

    const updatedRecord = {
      ...target,
      file: {
        name: newFile.name,
        size: newFile.size,
        mimeType: newFile.type || 'application/pdf',
        pageCount: newPageCount || 1,
        rawText: newRawText
      },
      preview: {
        thumbnailUrl: newThumbnailUrl || target.preview?.thumbnailUrl || ''
      },
      extractedProfile: newExtractedProfile || target.extractedProfile,
      analysis: newAnalysis,
      version: nextVersion,
      versionHistory: [...(target.versionHistory || []), historyItem],
      status: 'analyzed',
      updatedAt: new Date().toISOString()
    };

    // Update MongoDB backend
    try {
      api.put(`/resumes/${target._id || target.id}/replace`, updatedRecord).catch(() => {});
    } catch (e) {}

    return resumeHistoryService.saveResume(updatedRecord);
  },

  updateTargetAndReanalyze: (resumeId, targetContext) => {
    const record = resumeHistoryService.getResumeById(resumeId);
    if (!record) return null;

    const newTarget = {
      companyName: targetContext.companyName || '',
      role: targetContext.role || '',
      jobDescription: targetContext.jobDescription || ''
    };

    const rawText = record.file?.rawText || '';
    const newAnalysis = evaluateResumeATS(rawText, newTarget);

    const updated = {
      ...record,
      target: newTarget,
      analysis: newAnalysis,
      status: 'analyzed',
      updatedAt: new Date().toISOString()
    };

    // Sync to backend
    try {
      api.put(`/resumes/${record._id || record.id}/target-analysis`, {
        target: newTarget,
        analysis: newAnalysis
      }).catch(() => {});
    } catch (e) {}

    return resumeHistoryService.saveResume(updated);
  },

  renameResume: async (resumeId, newDisplayName) => {
    const list = resumeHistoryService.getResumes();
    const target = list.find((r) => r.id === resumeId || r._id === resumeId);
    if (!target || !newDisplayName?.trim()) return null;

    const trimmed = newDisplayName.trim();
    const updated = {
      ...target,
      displayName: trimmed,
      file: {
        ...(target.file || {}),
        name: trimmed
      },
      updatedAt: new Date().toISOString()
    };

    const existingIndex = list.findIndex((r) => r.id === resumeId || r._id === resumeId);
    if (existingIndex >= 0) {
      list[existingIndex] = updated;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.warn('[resumeHistoryService] Rename storage error:', e);
      }
    }

    try {
      await api.put(`/resumes/${target._id || target.id}/rename`, { displayName: trimmed, fileName: trimmed });
    } catch (e) {
      console.warn('[resumeHistoryService] Backend rename note:', e.message);
    }

    return updated;
  },

  deleteResume: (resumeId) => {
    const list = resumeHistoryService.getResumes();
    const target = list.find((r) => r.id === resumeId || r._id === resumeId);
    const filtered = list.filter((r) => r.id !== resumeId && r._id !== resumeId);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('[resumeHistoryService] Storage delete error:', e);
    }

    if (target?._id || target?.id) {
      try {
        api.delete(`/resumes/${target._id || target.id}`).catch(() => {});
      } catch (e) {}
    }

    return true;
  }
};

export default resumeHistoryService;
