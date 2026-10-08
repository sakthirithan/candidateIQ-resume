import { mockCandidates } from '../../data/mockCandidates';
import { mockJobs } from '../../data/mockJobs';
import { mockApplications } from '../../data/mockApplications';

/**
 * Module 21: Global Search Mock Service
 * Provides debounced search across Candidates, Jobs, Skills, and Applications.
 */

export const mockGlobalSearchService = {
  search: async (query, userRole = 'candidate') => {
    // Artificial 200ms debounce delay simulation
    await new Promise((r) => setTimeout(r, 200));

    if (!query || query.trim().length === 0) {
      return { candidates: [], jobs: [], skills: [], applications: [] };
    }

    const q = query.toLowerCase().trim();
    const isRecruiter = userRole === 'hr' || userRole === 'recruiter' || userRole === 'admin';

    // 1. Search Candidates (Recruiter / Admin view)
    let candidateResults = [];
    if (isRecruiter) {
      candidateResults = mockCandidates.filter((c) => {
        const nameMatch = c.name?.toLowerCase().includes(q);
        const emailMatch = c.email?.toLowerCase().includes(q);
        const roleMatch = c.targetRole?.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q);
        const skillMatch = c.skills?.some((s) => (s.name || s).toLowerCase().includes(q));
        return nameMatch || emailMatch || roleMatch || skillMatch;
      }).map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: c.targetRole || c.title || 'Candidate Profile',
        badge: `${c.overallScore || c.iqScore || 85}% IQ Score`,
        targetTab: 'candidates-recruiter',
        type: 'Candidate'
      }));
    }

    // 2. Search Jobs (Candidate & Recruiter)
    const jobResults = mockJobs.filter((j) => {
      const titleMatch = j.title?.toLowerCase().includes(q);
      const companyMatch = j.company?.toLowerCase().includes(q);
      const locationMatch = j.location?.toLowerCase().includes(q);
      const skillMatch = j.skills?.some((s) => s.toLowerCase().includes(q));
      return titleMatch || companyMatch || locationMatch || skillMatch;
    }).map((j) => ({
      id: j.id,
      title: j.title,
      subtitle: `${j.company} • ${j.location}`,
      badge: j.status || 'Active',
      targetTab: isRecruiter ? 'jobs-recruiter' : 'jobs',
      type: 'Job'
    }));

    // 3. Search Skills
    const allSkills = [
      'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Python', 'TypeScript',
      'System Design', 'AI & Machine Learning', 'GraphQL', 'Tailwind CSS', 'Docker', 'AWS'
    ];
    const skillResults = allSkills.filter((s) => s.toLowerCase().includes(q)).map((s) => ({
      id: `skill_${s}`,
      title: s,
      subtitle: 'Technical Skill & Gap Matrix',
      badge: 'Skill Matrix',
      targetTab: 'skills',
      type: 'Skill'
    }));

    // 4. Search Applications
    const appResults = mockApplications.filter((a) => {
      const jobMatch = a.jobTitle?.toLowerCase().includes(q);
      const companyMatch = a.company?.toLowerCase().includes(q);
      const candMatch = a.candidateName?.toLowerCase().includes(q);
      const statusMatch = a.status?.toLowerCase().includes(q);
      return jobMatch || companyMatch || candMatch || statusMatch;
    }).map((a) => ({
      id: a.id,
      title: `${a.jobTitle} - ${a.candidateName || 'Application'}`,
      subtitle: `${a.company} • Applied ${a.appliedDate}`,
      badge: a.status,
      targetTab: isRecruiter ? 'candidates-recruiter' : 'applications',
      type: 'Application'
    }));

    return {
      candidates: candidateResults,
      jobs: jobResults,
      skills: skillResults,
      applications: appResults,
      totalCount: candidateResults.length + jobResults.length + skillResults.length + appResults.length
    };
  }
};
