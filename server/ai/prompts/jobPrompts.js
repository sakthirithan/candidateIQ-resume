/**
 * Job Description Intelligence & Matching Prompts
 */

const jobPrompts = {
  analyzeJD: (jobDescriptionText) => `
Analyze the provided Job Description text and extract deep, structured job intelligence.

Return ONLY valid JSON:
{
  "title": "string",
  "company": "string",
  "department": "string",
  "seniority": "Junior" | "Mid-Level" | "Senior" | "Lead",
  "requiredSkills": ["string"],
  "preferredSkills": ["string"],
  "technicalSkills": ["string"],
  "softSkills": ["string"],
  "experienceRequirements": {
    "minYears": number,
    "maxYears": number,
    "description": "string"
  },
  "educationRequirements": ["string"],
  "responsibilities": ["string"],
  "keywords": ["string"],
  "technologies": ["string"],
  "interviewTopics": ["string"]
}

JOB DESCRIPTION TEXT:
"""
${jobDescriptionText}
"""
`,

  matchJob: (candidateProfile, job) => `
Compare candidate profile against job description requirements.
Candidate Profile: ${JSON.stringify(candidateProfile)}
Job Posting: ${JSON.stringify(job)}

Return ONLY valid JSON:
{
  "overallMatch": number (0-100),
  "technicalMatch": number (0-100),
  "experienceMatch": number (0-100),
  "educationMatch": number (0-100),
  "projectRelevance": number (0-100),
  "strongMatches": ["string"],
  "missingSkills": ["string"],
  "requirementGaps": ["string"],
  "areasRequiringValidation": ["string"],
  "explanation": "string",
  "recommendation": "string"
}
`,

  atsAnalysis: (candidateProfile, job) => `
Perform automated applicant tracking system (ATS) scan on candidate profile against target job.
Candidate Profile: ${JSON.stringify(candidateProfile)}
Job Posting: ${JSON.stringify(job)}

Return ONLY valid JSON:
{
  "overallScore": number (0-100),
  "breakdown": {
    "skillMatch": number (0-100),
    "experienceMatch": number (0-100),
    "educationMatch": number (0-100),
    "keywordMatch": number (0-100),
    "projectRelevance": number (0-100)
  },
  "matchedRequirements": ["string"],
  "missingRequirements": ["string"],
  "recommendations": ["string"],
  "explanation": "string"
}
`,

  extractJobKeywords: (jobData) => `
Analyze ALL provided job information:
- Job Title: "${jobData.title}"
- Job Description: "${jobData.description}"
- Required Skills: ${JSON.stringify(jobData.requiredSkills || [])}
- Preferred Skills: ${JSON.stringify(jobData.preferredSkills || [])}
- Experience & Education: "${jobData.experienceLevel || ''} / ${jobData.education || ''}"

Extract meaningful technical, architectural, domain, and implementation keywords SEMANTICALLY from the complete job information:
- Job Title, Description Narrative, About Paragraphs, Required Skills, and Preferred Skills.

Do NOT restrict keyword extraction to explicit requiredSkills/preferredSkills fields only. Extract technical concepts (e.g. "Full Stack Development", "API Development", "Cloud Deployment", "Authentication") as well.

Return ONLY valid JSON matching this exact structure:
{
  "keywords": [
    "React",
    "Node.js",
    "MongoDB",
    "Docker",
    "AWS",
    "REST API"
  ]
}
`
};

module.exports = jobPrompts;
