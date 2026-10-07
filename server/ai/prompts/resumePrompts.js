const resumePrompts = {
  extractFullResume: (rawText) => `Analyze the COMPLETE resume document text provided below.
Extract every section and all candidate information without dropping any content.

You MUST extract a JSON object containing TWO top-level keys:
1. "sections": Array containing ALL detected resume sections (Summary, Skills, Work Experience, Education, Projects, Certifications, Publications, Awards, etc.)
2. "candidate": Candidate contact info object

JSON Structure Example:
{
  "sections": [
    {
      "id": "sec_summary",
      "sectionType": "summary",
      "title": "Professional Summary",
      "selected": true,
      "confidence": 0.98,
      "content": "Full summary narrative...",
      "items": [],
      "source": { "pages": [1] }
    },
    {
      "id": "sec_skills",
      "sectionType": "skills",
      "title": "Technical & Core Skills",
      "selected": true,
      "confidence": 0.98,
      "content": null,
      "items": [
        { "category": "Languages", "values": ["JavaScript", "TypeScript", "Python"] },
        { "category": "Frameworks", "values": ["React.js", "Node.js", "Express.js"] },
        { "category": "Databases", "values": ["MongoDB", "Docker", "Git"] }
      ],
      "source": { "pages": [1] }
    },
    {
      "id": "sec_experience",
      "sectionType": "experience",
      "title": "Work Experience",
      "selected": true,
      "confidence": 0.98,
      "content": null,
      "items": [
        {
          "company": "Company Name",
          "position": "Job Title",
          "duration": "2023 - Present",
          "description": "Overview of duties",
          "responsibilities": ["Key achievement 1", "Key achievement 2"],
          "technologies": ["React", "Node.js"]
        }
      ],
      "source": { "pages": [1] }
    },
    {
      "id": "sec_education",
      "sectionType": "education",
      "title": "Education",
      "selected": true,
      "confidence": 0.98,
      "content": null,
      "items": [
        {
          "institution": "University Name",
          "degree": "Degree Name",
          "year": "2024",
          "cgpa": "Grade / CGPA"
        }
      ],
      "source": { "pages": [1] }
    },
    {
      "id": "sec_projects",
      "sectionType": "projects",
      "title": "Projects",
      "selected": true,
      "confidence": 0.98,
      "content": null,
      "items": [
        {
          "name": "Project Name",
          "description": "Project overview",
          "technologies": ["React", "Express", "MongoDB"],
          "url": "https://github.com/example"
        }
      ],
      "source": { "pages": [1] }
    },
    {
      "id": "sec_certifications",
      "sectionType": "certifications",
      "title": "Certifications",
      "selected": true,
      "confidence": 0.98,
      "content": null,
      "items": [
        {
          "name": "Certification Name",
          "issuer": "Issuing Organization",
          "year": "2023"
        }
      ],
      "source": { "pages": [1] }
    },
    {
      "id": "sec_custom_1",
      "sectionType": "custom",
      "title": "Research & Publications / Custom Section",
      "selected": true,
      "confidence": 0.95,
      "content": "Narrative or details for non-standard sections",
      "items": [],
      "source": { "pages": [1] }
    }
  ],
  "candidate": {
    "fullName": "Candidate Full Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "location": "City, Country",
    "headline": "Professional Title / Headline"
  },
  "metadata": {
    "totalSectionsDetected": 7,
    "resumeQualityScore": 88,
    "missingCommonFields": []
  }
}

CRITICAL RULES:
- You MUST populate the "sections" array with EVERY section found in the resume. Do NOT return an empty "sections" array.
- PROJECT EXTRACTION BOUNDARY RULES:
  * Extract EVERY project as an INDEPENDENT object inside the "projects" section items array.
  * Project 1 must NEVER absorb Project 2 or Project 3. Every project MUST have its own name/title, description, about paragraph, and technologies.
  * STOP project extraction when reaching adjacent sections (Education, Experience, Skills, Certifications, Awards).
- Return ONLY valid JSON matching this structure.

Resume Text:
${rawText}
`,

  extractResumeKeywords: (rawText) => `Analyze the candidate's resume content below.
Extract meaningful technical, architectural, and domain keywords SEMANTICALLY from the COMPLETE content.

SEMANTIC EXTRACTION INSTRUCTIONS:
1. Do NOT limit extraction to explicitly labeled "Skills" sections.
2. Extract keywords from:
   - Profile / Summary Paragraphs
   - Project Titles, Descriptions, and About/Explanation Paragraphs
   - Work Experience & Key Responsibilities
   - Technical Skills, Frameworks, Databases, and Tools
3. Include:
   - Core Technologies (e.g. "React", "Node.js", "MongoDB", "Python", "FastAPI")
   - Technical & Architectural Concepts (e.g. "REST API", "Microservices", "Authentication", "Real-Time Communication", "JWT")
   - Domain Concepts & Capabilities (e.g. "Candidate Profiling", "Resume Parsing", "Sentiment Analysis", "Behavioural Analytics", "AI Evaluation")
4. EXCLUDE generic stop words and filler words (e.g. "the", "and", "developed", "using", "project", "application", "built").
5. Only extract concepts that are supported by the actual resume content.

Return ONLY valid JSON matching this exact structure:
{
  "keywords": [
    "React",
    "Node.js",
    "MongoDB",
    "Candidate Profiling",
    "Resume Parsing",
    "REST API",
    "Microservices"
  ]
}

Candidate Resume Text:
${rawText}
`,

  extractEvidenceAndReasoning: ({ rawText, structuredResume, targetContext }) => `You are an audit-grade evidence-based resume intelligence engine for CandidateIQ.

YOUR MANDATE:
Do NOT assume what the candidate knows or guess skills not demonstrated.
Determine what the resume ACTUALLY demonstrates through multi-tier evidence reasoning.

EVIDENCE LEVEL DEFINITIONS:
1. "direct": Explicitly written in the resume text (e.g. "Built REST APIs in Express.js").
2. "contextual": Not stated as an explicit claim, but strongly supported by adjacent evidence (e.g. Node.js + Express.js in a full-stack web project provides contextual evidence of server-side web development).
3. "derived": Inferred by combining multiple distinct components (e.g. React frontend + Node backend + MongoDB database demonstrates a full-stack database-backed architecture).
4. "unsupported": A claim or requirement that lacks sufficient supporting evidence in the resume (e.g. listing "Express.js" as a standalone keyword does NOT prove REST API design, or a JD requirement for which the candidate has no evidence).

CRITICAL GROUNDING RULES:
- Never fabricate quotes or citations.
- Every claim must reference exact source text snippets from the resume.
- If a target JD is provided, evaluate EVERY job requirement:
  - Classify as: "DIRECT MATCH", "CONTEXTUAL MATCH", "TRANSFERABLE / RELATED", "INSUFFICIENT EVIDENCE", or "MISSING".
  - If JD requires a technology the candidate lacks (e.g. Vue.js) but the candidate has a related technology (e.g. React), classify as "TRANSFERABLE / RELATED", note React as related frontend experience, but explicitly state that proficiency in the required technology is NOT verified.
- Critical fixes must address REAL evidence gaps without telling the candidate to fabricate experience.

TARGET CONTEXT:
Company: ${targetContext?.companyName || 'Not specified'}
Role: ${targetContext?.role || 'General Software Engineering'}
Job Description:
${targetContext?.jobDescription || 'No specific job description provided. Evaluate general technical competencies.'}

STRUCTURED RESUME DATA:
${structuredResume ? JSON.stringify(structuredResume, null, 2) : 'Not available'}

RAW RESUME TEXT:
${rawText}

Return ONLY valid JSON strictly adhering to this schema:
{
  "claims": [
    {
      "id": "claim_1",
      "claim": "Direct/Contextual/Derived statement of capability",
      "evidenceLevel": "direct" | "contextual" | "derived" | "unsupported",
      "confidence": 0.95,
      "supportingEvidence": [
        {
          "sourceId": "src_1",
          "type": "project" | "skill" | "experience" | "summary" | "resume_text",
          "text": "Exact quote from resume",
          "page": 1
        }
      ],
      "reasoning": "Clear explanation of how evidence supports the claim.",
      "verificationGap": null
    }
  ],
  "jobMatch": [
    {
      "requirement": "Job requirement title",
      "matchType": "DIRECT MATCH" | "CONTEXTUAL MATCH" | "TRANSFERABLE / RELATED" | "INSUFFICIENT EVIDENCE" | "MISSING",
      "confidence": 0.88,
      "candidateEvidence": "Supporting evidence summary",
      "reasoning": "Explanation of alignment or transferability",
      "recommendation": "Constructive advice"
    }
  ],
  "impactSignals": [
    {
      "action": "Optimized",
      "metric": "35%",
      "outcome": "page load time",
      "technicalContext": "Frontend performance",
      "evidenceLevel": "direct"
    }
  ],
  "technicalKeywords": ["React", "Node.js", "Express.js", "MongoDB"],
  "softSkills": ["Problem Solving", "Collaboration"],
  "strengths": ["Clear strength 1", "Clear strength 2"],
  "weaknesses": ["Evidence gap 1", "Evidence gap 2"],
  "criticalFixes": ["Constructive fix 1"],
  "categoryTips": {
    "ATS": [{ "type": "good", "tip": "Clean standard format", "explanation": "Easily parsed" }],
    "toneAndStyle": [{ "type": "good", "tip": "Strong action verbs", "explanation": "Conveys technical ownership" }],
    "content": [{ "type": "improve", "tip": "Add quantifiable metrics", "explanation": "Quantified outcomes substantiate scale" }],
    "structure": [{ "type": "good", "tip": "Consistent sections", "explanation": "Improves readability" }],
    "skills": [{ "type": "good", "tip": "Strong technical coverage", "explanation": "Covers core stack" }]
  },
  "explanation": "High-level summary of the candidate's evidence depth and role fit."
}
`
};

module.exports = resumePrompts;


