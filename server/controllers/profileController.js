const CandidateProfile = require('../models/CandidateProfile');

// Helper to compute AI skill analytics
const computeSkillAnalytics = (skills = {}) => {
  const tech = Array.isArray(skills.technical) ? skills.technical : (Array.isArray(skills) ? skills : []);
  const frameworks = Array.isArray(skills.frameworks) ? skills.frameworks : [];
  const dbs = Array.isArray(skills.databases) ? skills.databases : [];
  const tools = Array.isArray(skills.tools) ? skills.tools : [];
  const soft = Array.isArray(skills.soft) ? skills.soft : [];

  const allSkills = [...tech, ...frameworks, ...dbs, ...tools];
  const totalSkills = allSkills.length;

  const inferredLevels = {};
  allSkills.forEach((skill, idx) => {
    const skillName = typeof skill === 'string' ? skill : (skill?.name || String(skill));
    const score = Math.max(55, 95 - idx * 5);
    inferredLevels[skillName] = {
      score,
      label: 'AI Estimated',
      confidence: score > 75 ? 'High' : 'Moderate'
    };
  });

  return {
    totalSkills,
    confidenceScore: Math.min(95, 70 + totalSkills * 2),
    topSkills: allSkills.slice(0, 5).map(s => typeof s === 'string' ? s : s?.name || String(s)),
    inferredLevels
  };
};

// @desc    Get current candidate profile
// @route   GET /api/candidates/profile
// @access  Private (Candidate)
const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const profile = await CandidateProfile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please create one.' });
    }

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// Profile Resolution Engine: Preserves candidate overrides over newly extracted data
const resolveCandidateProfile = (existingProfile, inputSections = [], profileOverrides = {}, isManualEdit = false) => {
  const resolvedSections = [];
  const currentOverrides = { ...(existingProfile?.profileOverrides || {}), ...profileOverrides };

  inputSections.forEach((sec) => {
    const secType = sec.type || sec.sectionType;
    const existingSec = (existingProfile?.sections || []).find(s => (s.type || s.sectionType) === secType);
    const existingOverride = currentOverrides[secType];

    if (isManualEdit) {
      // Check if this section was explicitly edited or modified by candidate
      const isSecEdited = sec.editedByCandidate === true || 
                          profileOverrides[secType]?.source === 'candidate' ||
                          !existingSec ||
                          JSON.stringify(sec.data || sec.content || sec.items) !== JSON.stringify(existingSec.data || existingSec.content || existingSec.items);

      if (isSecEdited) {
        currentOverrides[secType] = {
          value: sec.data || sec.content || sec.items,
          source: 'candidate',
          updatedAt: new Date()
        };
        resolvedSections.push({
          ...sec,
          editedByCandidate: true,
          updatedAt: new Date()
        });
      } else {
        resolvedSections.push({
          ...sec,
          editedByCandidate: false
        });
      }
    } else if (existingOverride && existingOverride.source === 'candidate') {
      // Preserve candidate's manually edited value over new extraction
      resolvedSections.push({
        ...sec,
        data: existingOverride.value?.data !== undefined ? existingOverride.value.data : (existingOverride.value || sec.data),
        content: typeof existingOverride.value === 'string' ? existingOverride.value : sec.content,
        editedByCandidate: true,
        source: {
          type: 'candidate_override',
          preservedAt: new Date()
        }
      });
    } else {
      // Use new extraction
      resolvedSections.push({
        ...sec,
        editedByCandidate: false
      });
    }
  });

  return { resolvedSections, updatedOverrides: currentOverrides };
};

// @desc    Create or Update candidate profile (Preserves Candidate Overrides & Source Linkages)
// @route   POST /api/candidates/profile
// @access  Private (Candidate)
const upsertProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const body = req.body || {};
    const inputProfile = body.profileData || body;

    const existingProfile = await CandidateProfile.findOne({ user: userId });
    const isManualEdit = body.isManualEdit !== false && !body.fromResume;

    const rawSections = Array.isArray(inputProfile.sections) ? inputProfile.sections : (existingProfile?.sections || []);
    const inputOverrides = inputProfile.profileOverrides || {};

    // Run Profile Resolution Engine
    const { resolvedSections, updatedOverrides } = resolveCandidateProfile(
      existingProfile,
      rawSections,
      inputOverrides,
      isManualEdit
    );

    const profileSource = inputProfile.profileSource || existingProfile?.profileSource || { type: 'manual', updatedAt: new Date() };
    const metadata = inputProfile.metadata || existingProfile?.metadata || { version: 1, isComplete: true, updatedAt: new Date() };

    // Extract fields from resolved sections
    let personalInfo = inputProfile.personalInfo || existingProfile?.personalInfo || {};
    let education = inputProfile.education || existingProfile?.education || [];
    let experience = inputProfile.experience || inputProfile.experiences || existingProfile?.experience || [];
    let skills = inputProfile.skills || existingProfile?.skills || { technical: [], soft: [], frameworks: [], databases: [], tools: [] };
    let projects = inputProfile.projects || existingProfile?.projects || [];
    let certifications = inputProfile.certifications || existingProfile?.certifications || [];

    if (resolvedSections.length > 0) {
      const pSec = resolvedSections.find(s => s.type === 'personal_info');
      if (pSec && pSec.data) {
        personalInfo = {
          name: pSec.data.name || personalInfo.name || req.user.name,
          email: pSec.data.email || personalInfo.email || req.user.email,
          phone: pSec.data.phone || personalInfo.phone || '',
          location: pSec.data.location || personalInfo.location || '',
          headline: pSec.data.headline || personalInfo.headline || 'Software Professional',
          profilePhoto: pSec.data.profilePhoto || personalInfo.profilePhoto || ''
        };
      }

      const eSec = resolvedSections.find(s => s.type === 'education');
      if (eSec && eSec.data?.records) {
        education = eSec.data.records;
      }

      const expSec = resolvedSections.find(s => s.type === 'experience');
      if (expSec && expSec.data?.records) {
        experience = expSec.data.records;
      }

      const projSec = resolvedSections.find(s => s.type === 'projects');
      if (projSec && projSec.data?.records) {
        projects = projSec.data.records;
      }

      const certSec = resolvedSections.find(s => s.type === 'certifications');
      if (certSec && certSec.data?.records) {
        certifications = certSec.data.records;
      }

      const skSec = resolvedSections.find(s => s.type === 'skills');
      if (skSec && skSec.data) {
        const all = skSec.data.allSkills || [];
        skills = {
          technical: all,
          soft: ['Problem Solving', 'Communication', 'Collaboration'],
          frameworks: [],
          databases: [],
          tools: []
        };
      }
    }

    if (!personalInfo.name) personalInfo.name = req.user.name || 'Candidate';
    if (!personalInfo.email) personalInfo.email = req.user.email || 'candidate@example.com';

    const skillAnalysis = computeSkillAnalytics(skills);

    const profileData = {
      user: userId,
      userIdString: userId.toString(),
      sections: resolvedSections,
      profileSource,
      profileOverrides: updatedOverrides,
      metadata,
      personalInfo,
      education,
      experience,
      skills,
      projects,
      certifications,
      skillAnalysis
    };

    const profile = await CandidateProfile.findOneAndUpdate(
      { user: userId },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      profile,
      message: 'Candidate profile saved successfully with persistent overrides.'
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get profile by candidate ID (Recruiter view)
// @route   GET /api/candidates/profile/:userId
// @access  Private (Recruiter/Admin)
const getProfileByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const profile = await CandidateProfile.findOne({ $or: [{ user: userId }, { userIdString: userId }] });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found.' });
    }

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all candidate profiles (Recruiter view)
// @route   GET /api/candidates/profiles
// @access  Private (Recruiter/Admin)
const getAllProfiles = async (req, res, next) => {
  try {
    const profiles = await CandidateProfile.find().populate('user', 'name email role');
    return res.status(200).json({ success: true, profiles });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or add a dynamic custom section in candidate profile
// @route   PATCH /api/candidates/profile/sections/:sectionId
// @access  Private (Candidate)
const updateCustomSection = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { sectionId } = req.params;
    const { title, content, items, sectionType } = req.body;

    let profile = await CandidateProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found.' });
    }

    const sectionIndex = (profile.customSections || []).findIndex(sec => sec.sectionId === sectionId);

    if (sectionIndex !== -1) {
      if (title) profile.customSections[sectionIndex].title = title;
      if (content !== undefined) profile.customSections[sectionIndex].content = content;
      if (items !== undefined) profile.customSections[sectionIndex].items = items;
      if (sectionType) profile.customSections[sectionIndex].sectionType = sectionType;
      profile.customSections[sectionIndex].updatedAt = new Date();
    } else {
      profile.customSections.push({
        sectionId: sectionId || `custom_${Date.now()}`,
        sectionType: sectionType || 'custom',
        title: title || 'New Custom Section',
        content: content || '',
        items: items || [],
        updatedAt: new Date()
      });
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Profile custom section updated successfully.',
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a dynamic custom section from candidate profile
// @route   DELETE /api/candidates/profile/sections/:sectionId
// @access  Private (Candidate)
const deleteCustomSection = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { sectionId } = req.params;

    let profile = await CandidateProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found.' });
    }

    profile.customSections = (profile.customSections || []).filter(sec => sec.sectionId !== sectionId);

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Custom section removed from profile.',
      profile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  computeSkillAnalytics,
  resolveCandidateProfile,
  getMyProfile,
  upsertProfile,
  getProfileByUserId,
  getAllProfiles,
  updateCustomSection,
  deleteCustomSection
};
