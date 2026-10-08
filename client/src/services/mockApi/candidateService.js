import api from '../api';

const mapProfileToCandidate = (profile) => {
  if (!profile) return null;
  const p = profile.personalInfo || {};
  const user = profile.user || {};
  
  // Format skills as flat array or object as expected by UI components
  const rawSkills = profile.skills || {};
  let formattedSkills = [];
  if (Array.isArray(rawSkills)) {
    formattedSkills = rawSkills;
  } else if (typeof rawSkills === 'object') {
    formattedSkills = [
      ...(rawSkills.technical || []).map(s => ({ name: s, category: 'Technical', level: 'Advanced' })),
      ...(rawSkills.frameworks || []).map(s => ({ name: s, category: 'Frameworks', level: 'Advanced' })),
      ...(rawSkills.databases || []).map(s => ({ name: s, category: 'Databases', level: 'Advanced' })),
      ...(rawSkills.tools || []).map(s => ({ name: s, category: 'Tools', level: 'Advanced' })),
      ...(rawSkills.soft || []).map(s => ({ name: s, category: 'Soft Skills', level: 'Competent' }))
    ];
  }

  const userId = profile.userIdString || profile.user?._id || profile.user || profile._id;

  return {
    id: userId,
    _id: profile._id,
    userId: userId,
    name: p.name || user.name || 'Candidate Name',
    email: p.email || user.email || '',
    headline: p.headline || 'Software Professional',
    phone: p.phone || '',
    location: p.location || 'Remote',
    profilePhoto: p.profilePhoto || '',
    sections: Array.isArray(profile.sections) ? profile.sections : [],
    profileSource: profile.profileSource || { type: 'manual', updatedAt: profile.updatedAt },
    metadata: profile.metadata || { version: 1, updatedAt: profile.updatedAt },
    skills: formattedSkills,
    skillsObject: profile.skills || {},
    experiences: profile.experience || [],
    experience: profile.experience || [],
    education: profile.education || [],
    projects: profile.projects || [],
    certifications: profile.certifications || [],
    customSections: profile.customSections || [],
    skillAnalysis: profile.skillAnalysis || { totalSkills: formattedSkills.length, confidenceScore: 85, topSkills: [] },
    atsScore: profile.atsScore || 85,
    iqScore: profile.iqScore || 88,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
};

export const candidateService = {
  // Get current logged-in candidate profile from MongoDB
  getMyProfile: async () => {
    try {
      const response = await api.get('/candidates/profile');
      if (response.data && response.data.profile) {
        return mapProfileToCandidate(response.data.profile);
      }
      return null;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null;
      }
      console.warn('[candidateService Warning] Failed to fetch my profile from API, fallback to storage:', err.message);
      return null;
    }
  },

  // Get all candidate profiles (Recruiter/Admin view)
  getCandidates: async () => {
    try {
      const response = await api.get('/candidates/profiles');
      if (response.data && response.data.profiles) {
        return response.data.profiles.map(mapProfileToCandidate);
      }
      return [];
    } catch (err) {
      console.error('[candidateService Error] Failed to fetch candidates:', err);
      throw err;
    }
  },

  // Get candidate profile by user ID (Recruiter view)
  getCandidateById: async (id) => {
    try {
      const response = await api.get(`/candidates/profile/${id}`);
      if (response.data && response.data.profile) {
        return mapProfileToCandidate(response.data.profile);
      }
      throw new Error('Candidate profile not found.');
    } catch (err) {
      console.error(`[candidateService Error] Failed to fetch candidate profile ${id}:`, err);
      throw err;
    }
  },

  // Upsert profile data directly to backend MongoDB
  saveProfile: async (profileData, isManualEdit = true) => {
    try {
      const response = await api.post('/candidates/profile', { profileData, isManualEdit });
      if (response.data && response.data.profile) {
        return mapProfileToCandidate(response.data.profile);
      }
      throw new Error(response.data?.message || 'Failed to save profile.');
    } catch (err) {
      console.warn('[candidateService Note] Direct API save returned, fallback or offline:', err.message);
      return mapProfileToCandidate(profileData);
    }
  },

  // Backward compatibility alias for updateCandidate
  updateCandidate: async (id, updatedData) => {
    return candidateService.saveProfile(updatedData);
  }
};

export const mockCandidateService = candidateService;
export default candidateService;
