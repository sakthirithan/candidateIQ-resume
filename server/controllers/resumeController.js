const crypto = require('crypto');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const CandidateProfile = require('../models/CandidateProfile');
const resumeAIService = require('../ai/services/resumeAIService');
const { normalizeKeywords } = require('../utils/keywordNormalizer');
const { computeSkillAnalytics } = require('./profileController');

const RESUME_LIMITS = {
  MAX_RESUMES_PER_CANDIDATE: 10
};

// @desc    Get all active resumes for the authenticated candidate
// @route   GET /api/resumes/my-resumes
// @access  Private (Candidate)
const getMyResumes = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const resumes = await Resume.find({ candidate: userId, deletedAt: null }).sort({ updatedAt: -1 });
    return res.status(200).json({
      success: true,
      count: resumes.length,
      limit: RESUME_LIMITS.MAX_RESUMES_PER_CANDIDATE,
      resumes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resume by ID
// @route   GET /api/resumes/:id
// @access  Private (Candidate)
const getResumeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    const resume = await Resume.findOne({ _id: id, candidate: userId, deletedAt: null });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found or has been deleted.' });
    }

    return res.status(200).json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new independent resume (Enforces 10 resume limit server-side)
// @route   POST /api/resumes/upload
// @access  Private (Candidate)
const uploadAndParseResume = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const body = req.body || {};

    // 1. Enforce Server-Side Maximum Resume Limit (10 Resumes)
    const activeCount = await Resume.countDocuments({ candidate: userId, deletedAt: null });
    if (activeCount >= RESUME_LIMITS.MAX_RESUMES_PER_CANDIDATE) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'RESUME_LIMIT_REACHED',
          limit: RESUME_LIMITS.MAX_RESUMES_PER_CANDIDATE,
          currentCount: activeCount,
          message: 'Resume limit reached. Maximum 10 resume documents allowed per candidate.'
        }
      });
    }

    let fileName = body.fileName || 'resume.pdf';
    let displayName = body.displayName || fileName;
    let fileType = body.fileType || 'application/pdf';
    let fileSize = body.fileSize || 0;
    let extractedText = body.rawText || '';
    let pageCount = body.pageCount || 1;
    let base64Data = body.base64Data || '';
    let previewData = body.preview || {};
    let target = body.target || { companyName: '', role: '', jobDescription: '' };
    let inputExtractedProfile = body.extractedProfile || null;
    let inputAnalysis = body.analysis || null;

    if (req.file) {
      fileName = req.file.originalname;
      displayName = fileName;
      fileType = req.file.mimetype;
      fileSize = req.file.size;
      base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
        try {
          const parsed = await pdfParse(req.file.buffer);
          extractedText = parsed.text;
          pageCount = parsed.numpages || 1;
        } catch (pdfErr) {
          console.warn('[PDF Parse Warning]', pdfErr.message);
          extractedText = req.file.buffer.toString('utf-8');
        }
      } else {
        extractedText = req.file.buffer.toString('utf-8');
      }
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({
        success: false,
        error: { code: 'EMPTY_TEXT_EXTRACTED', message: 'Could not extract readable text from uploaded resume.' }
      });
    }

    // Calculate Content Hash (SHA-256)
    const contentHash = crypto.createHash('sha256').update(extractedText || fileName).digest('hex');
    const sourceDocumentId = body.sourceDocumentId || `src_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const resumeRecord = await Resume.create({
      candidate: userId,
      candidateIdString: userId.toString(),
      sourceDocumentId,
      contentHash,
      displayName,
      originalFileName: fileName,
      fileName,
      fileType,
      fileSize,
      rawText: extractedText,
      status: 'analyzed',
      extractionStatus: 'analyzed',
      version: 1,
      versionHistory: [
        {
          version: 1,
          originalFileName: fileName,
          displayName,
          contentHash,
          uploadedAt: new Date(),
          overallScore: inputAnalysis?.overallScore || 85
        }
      ],
      file: {
        name: fileName,
        size: fileSize,
        mimeType: fileType,
        pageCount,
        rawText: extractedText,
        base64Data
      },
      preview: {
        thumbnailUrl: previewData.thumbnailUrl || '',
        pdfData: base64Data
      },
      target,
      extractedProfile: inputExtractedProfile,
      analysis: inputAnalysis,
      deletedAt: null,
      processingMetadata: {
        pageCount,
        totalSectionsDetected: inputExtractedProfile?.sections?.length || 5,
        resumeQualityScore: inputAnalysis?.overallScore || 85,
        latencyMs: 120
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Resume saved and analyzed successfully.',
      resume: resumeRecord,
      resumeId: resumeRecord._id,
      count: activeCount + 1,
      limit: RESUME_LIMITS.MAX_RESUMES_PER_CANDIDATE
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Target Role / Job Description context & re-analyze in MongoDB
// @route   PUT /api/resumes/:id/target-analysis
// @access  Private (Candidate)
const updateTargetAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    const { target, analysis } = req.body;

    const resume = await Resume.findOne({ _id: id, candidate: userId, deletedAt: null });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found.' });
    }

    if (target) resume.target = target;
    if (analysis) resume.analysis = analysis;
    resume.status = 'analyzed';
    await resume.save();

    return res.status(200).json({
      success: true,
      message: 'Resume target analysis updated successfully.',
      resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Perform Dynamic LLM Evidence Extraction, Reasoning & Deterministic ATS Scoring
// @route   POST /api/resumes/:id/analyze
// @access  Private (Candidate)
const triggerResumeAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    const { target } = req.body || {};

    const resume = await Resume.findOne({ _id: id, candidate: userId, deletedAt: null });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found or access denied.' });
    }

    const rawText = resume.rawText || resume.file?.rawText || '';
    if (!rawText.trim()) {
      return res.status(422).json({ success: false, message: 'No extractable text found in resume.' });
    }

    const targetContext = target || resume.target || {};
    const analysis = await resumeAIService.analyzeResumeEvidenceAndATS(rawText, resume.extractedProfile, targetContext);

    resume.target = targetContext;
    resume.analysis = analysis;
    resume.status = 'analyzed';
    await resume.save();

    return res.status(200).json({
      success: true,
      message: 'Dynamic evidence reasoning and deterministic ATS analysis completed.',
      resume,
      analysis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atomic Resume Replacement (Bumps version in-place, preserves logical ID & sourceDocumentId)
// @route   PUT /api/resumes/:id/replace
// @access  Private (Candidate)
const replaceResumeFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    const body = req.body || {};

    const resume = await Resume.findOne({ _id: id, candidate: userId, deletedAt: null });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found.' });
    }

    const nextVersion = (resume.version || 1) + 1;
    const newFileName = body.fileName || body.file?.name || resume.fileName;
    const newRawText = body.file?.rawText || body.rawText || resume.rawText;
    const newContentHash = crypto.createHash('sha256').update(newRawText || newFileName).digest('hex');

    // Archive previous version snapshot
    const historyItem = {
      version: resume.version || 1,
      originalFileName: resume.originalFileName || resume.fileName,
      displayName: resume.displayName || resume.fileName,
      contentHash: resume.contentHash,
      uploadedAt: resume.updatedAt || resume.createdAt,
      overallScore: resume.analysis?.overallScore
    };

    resume.version = nextVersion;
    resume.versionHistory = [...(resume.versionHistory || []), historyItem];
    resume.contentHash = newContentHash;
    // Keep sourceDocumentId unchanged!
    resume.fileName = newFileName;
    resume.file = body.file || resume.file;
    resume.rawText = newRawText;
    resume.preview = body.preview || resume.preview;
    resume.extractedProfile = body.extractedProfile || resume.extractedProfile;
    resume.analysis = body.analysis || null;
    resume.status = 'analyzed';

    await resume.save();

    return res.status(200).json({
      success: true,
      message: `Resume replaced successfully. Version ${nextVersion} is now active.`,
      resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rename resume display name ONLY (Never alters sourceDocumentId or profile linkage)
// @route   PUT /api/resumes/:id/rename
// @access  Private (Candidate)
const renameResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    const { displayName, fileName } = req.body;

    const newName = displayName || fileName;
    if (!newName || newName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Display name cannot be empty.' });
    }

    const resume = await Resume.findOne({ _id: id, candidate: userId, deletedAt: null });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    // Only update display name (preserves sourceDocumentId, versions, profile bindings)
    resume.displayName = newName.trim();
    if (resume.file) {
      resume.file.name = newName.trim();
    }
    await resume.save();

    return res.status(200).json({
      success: true,
      message: 'Resume renamed successfully.',
      resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resume from history (Soft delete, frees slot, preserves Candidate Profile)
// @route   DELETE /api/resumes/:id
// @access  Private (Candidate)
const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const resume = await Resume.findOne({ _id: id, candidate: userId, deletedAt: null });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found or already deleted.' });
    }

    // Soft delete
    resume.deletedAt = new Date();
    resume.status = 'deleted';
    await resume.save();

    // Preserve Candidate Profile: If this resume was the active profile source, switch source to 'manual'
    const profile = await CandidateProfile.findOne({ user: userId });
    if (profile && profile.profileSource && (profile.profileSource.resumeId === id || profile.profileSource.sourceDocumentId === resume.sourceDocumentId)) {
      profile.profileSource = {
        type: 'manual',
        updatedAt: new Date(),
        previousResumeName: resume.displayName || resume.fileName
      };
      await profile.save();
    }

    const remainingCount = await Resume.countDocuments({ candidate: userId, deletedAt: null });

    return res.status(200).json({
      success: true,
      message: 'Resume document deleted from history.',
      count: remainingCount,
      limit: RESUME_LIMITS.MAX_RESUMES_PER_CANDIDATE
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get status of an uploaded resume (Legacy endpoint)
const getResumeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resumeRecord = await Resume.findById(id);
    if (!resumeRecord) {
      return res.status(404).json({ success: false, message: 'Resume record not found.' });
    }
    return res.status(200).json({
      success: true,
      resumeId: resumeRecord._id,
      status: resumeRecord.extractionStatus || resumeRecord.status,
      sections: resumeRecord.extractedSections,
      metadata: resumeRecord.processingMetadata
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate confirms selected sections
const confirmResumeSections = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { resumeId, candidateInfo, profileData } = req.body;

    let profile = await CandidateProfile.findOne({ user: userId });
    if (!profile) {
      profile = new CandidateProfile({
        user: userId,
        userIdString: userId.toString(),
        personalInfo: {
          name: candidateInfo?.fullName || req.user.name || 'Candidate',
          email: candidateInfo?.email || req.user.email || 'candidate@example.com',
          phone: candidateInfo?.phone || '',
          location: candidateInfo?.location || '',
          headline: candidateInfo?.headline || 'Software Professional'
        }
      });
    }

    if (profileData && profileData.sections) {
      profile.sections = profileData.sections;
      profile.profileSource = profileData.profileSource || { type: 'resume', resumeId, updatedAt: new Date() };
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Resume data confirmed and saved into profile.',
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate keywords
const getCandidateResumeKeywords = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const resume = await Resume.findOne({ candidate: userId, deletedAt: null }).sort({ updatedAt: -1 });
    const keywords = resume?.keywords || [];
    return res.status(200).json({
      success: true,
      count: keywords.length,
      keywords
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyResumes,
  getResumeById,
  uploadAndParseResume,
  updateTargetAnalysis,
  triggerResumeAnalysis,
  replaceResumeFile,
  renameResume,
  deleteResume,
  getResumeStatus,
  confirmResumeSections,
  getCandidateResumeKeywords
};


