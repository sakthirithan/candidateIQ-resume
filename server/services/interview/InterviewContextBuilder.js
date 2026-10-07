/**
 * InterviewContextBuilder.js
 * Builds a compact, safe AI context snapshot from MongoDB models (User, Resume, Job)
 * and conversation history without exposing secrets or massive raw documents.
 *
 * Context Isolation Rules:
 * MOCK INTERVIEW:
 *   - Allowed: Candidate Profile, Resume, Projects, Experience, Skills, Education, Certifications, Achievements, Optional Job Description.
 *   - STRICTLY EXCLUDED: Recruiter HR Evaluation Prompt.
 *
 * ACTUAL INTERVIEW:
 *   - Allowed: Candidate Profile, Resume, Projects, Experience, Skills, Job Title, Job Description, Required Skills, Preferred Skills, Job Keywords, Recruiter HR Evaluation Prompt.
 */

class InterviewContextBuilder {
  static buildContext({ candidate, resume, job, interviewType = 'mock', conversation = [] }) {
    const isActual = (interviewType || '').toLowerCase() === 'actual';

    // 1. Candidate Full Profile Context
    const profile = {
      name: candidate?.name || 'Candidate',
      headline: candidate?.headline || candidate?.title || '',
      summary: candidate?.summary || candidate?.bio || '',
      skills: (candidate?.skills || []).map((s) => (typeof s === 'string' ? s : s.name || s.title || String(s))),
      projects: (candidate?.projects || resume?.extractedData?.projects || []).map((p) => ({
        title: p.title || p.name || 'Project',
        description: p.description || p.about || '',
        about: p.about || '',
        technologies: p.technologies || p.tech || []
      })),
      experiences: (candidate?.experiences || candidate?.experience || resume?.extractedData?.experiences || []).map((e) => ({
        title: e.title || e.role || '',
        company: e.company || '',
        description: e.description || '',
        period: e.period || e.duration || ''
      })),
      education: (candidate?.education || resume?.extractedData?.education || []).map((edu) => ({
        degree: edu.degree || '',
        institution: edu.institution || edu.school || '',
        year: edu.year || ''
      })),
      certifications: (candidate?.certifications || resume?.extractedData?.certifications || []).map((c) => (typeof c === 'string' ? c : c.name || String(c))),
      achievements: (candidate?.achievements || resume?.extractedData?.achievements || []).map((a) => (typeof a === 'string' ? a : a.title || String(a)))
    };

    // 2. Job Context Isolation
    let jobContext = null;
    if (job) {
      jobContext = {
        title: job.title || '',
        department: job.department || '',
        description: job.description || job.jobDescription || '',
        requiredSkills: (job.requiredSkills || []).map((s) => (typeof s === 'string' ? s : s.name || String(s))),
        preferredSkills: (job.preferredSkills || []).map((s) => (typeof s === 'string' ? s : s.name || String(s))),
        keywords: job.keywords || []
      };

      // HR Evaluation Prompt is ONLY allowed in ACTUAL interviews
      if (isActual) {
        jobContext.hrEvaluationPrompt = job.hrEvaluationPrompt || undefined;
      }
    }

    // 3. Compact Conversation History (Last 6 turns for optimal token window)
    const recentConversation = (conversation || []).slice(-6).map((turn) => ({
      questionId: turn.questionId,
      questionText: turn.questionText || turn.text,
      candidateResponse: turn.candidateResponse || turn.answer,
      evaluationSummary: turn.evaluation
        ? {
            technicalScore: turn.evaluation.technicalScore,
            relevanceScore: turn.evaluation.relevanceScore,
            clarityScore: turn.evaluation.communicationScore || turn.evaluation.clarityScore
          }
        : null
    }));

    return {
      candidate: profile,
      job: jobContext,
      interviewType: isActual ? 'actual' : 'mock',
      conversation: recentConversation
    };
  }
}

module.exports = InterviewContextBuilder;
