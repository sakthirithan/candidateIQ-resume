const { z } = require('zod');

/**
 * Zod Schemas for Dynamic Multi-Section Resume Intelligence
 */

const ResumeSectionItemSchema = z.object({
  category: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  institution: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  cgpa: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  responsibilities: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  values: z.array(z.string()).default([]),
  url: z.string().optional().nullable()
});

const DynamicResumeSectionSchema = z.object({
  id: z.string().default(`sec_${Date.now()}`),
  sectionType: z.enum([
    'personal_info', 'summary', 'skills', 'experience', 'education', 
    'projects', 'certifications', 'achievements', 'languages', 
    'research', 'publications', 'volunteer', 'leadership', 'custom'
  ]).default('custom'),
  title: z.string().default('Resume Section'),
  selected: z.boolean().default(true),
  confidence: z.number().min(0).max(1).default(0.95),
  content: z.string().optional().nullable(),
  items: z.array(ResumeSectionItemSchema).default([]),
  source: z.object({
    pages: z.array(z.number()).default([1])
  }).default({ pages: [1] })
});

const FullResumeExtractionSchema = z.object({
  candidate: z.object({
    fullName: z.string().default('Candidate Name'),
    email: z.string().default(''),
    phone: z.string().default(''),
    location: z.string().default(''),
    headline: z.string().default('Software Professional')
  }).default({ fullName: 'Candidate Name', email: '', phone: '', location: '', headline: 'Software Professional' }),
  sections: z.array(DynamicResumeSectionSchema).default([]),
  metadata: z.object({
    totalSectionsDetected: z.number().default(0),
    resumeQualityScore: z.number().min(0).max(100).default(80),
    missingCommonFields: z.array(z.string()).default([])
  }).default({ totalSectionsDetected: 0, resumeQualityScore: 80, missingCommonFields: [] })
});

const ResumeKeywordExtractionSchema = z.object({
  candidateId: z.string().optional(),
  resumeId: z.string().optional(),
  keywords: z.array(z.string()).default([])
});

const EvidenceSourceCitationSchema = z.object({
  sourceId: z.string().default('source_0'),
  type: z.enum([
    'resume_text', 'summary', 'skill', 'experience', 'project',
    'education', 'certification', 'achievement', 'job_description'
  ]).default('resume_text'),
  text: z.string().default(''),
  section: z.string().optional().nullable(),
  page: z.number().default(1)
});

const EvidenceClaimSchema = z.object({
  id: z.string().default('claim_0'),
  claim: z.string(),
  evidenceLevel: z.enum(['direct', 'contextual', 'derived', 'unsupported']),
  confidence: z.number().min(0).max(1).default(0.85),
  supportingEvidence: z.array(EvidenceSourceCitationSchema).default([]),
  reasoning: z.string().default(''),
  verificationGap: z.string().optional().nullable()
});

const JobRequirementMatchSchema = z.object({
  requirement: z.string(),
  matchType: z.enum([
    'DIRECT MATCH',
    'CONTEXTUAL MATCH',
    'TRANSFERABLE / RELATED',
    'INSUFFICIENT EVIDENCE',
    'MISSING'
  ]),
  confidence: z.number().min(0).max(1).default(0.8),
  candidateEvidence: z.string().default(''),
  reasoning: z.string().default(''),
  recommendation: z.string().optional().nullable()
});

const ImpactSignalSchema = z.object({
  action: z.string().default(''),
  metric: z.string().default(''),
  outcome: z.string().default(''),
  technicalContext: z.string().default(''),
  evidenceLevel: z.enum(['direct', 'contextual', 'derived', 'unsupported']).default('direct')
});

const EvidenceReasoningOutputSchema = z.object({
  claims: z.array(EvidenceClaimSchema).default([]),
  jobMatch: z.array(JobRequirementMatchSchema).default([]),
  impactSignals: z.array(ImpactSignalSchema).default([]),
  technicalKeywords: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  criticalFixes: z.array(z.string()).default([]),
  categoryTips: z.object({
    ATS: z.array(z.object({ type: z.string(), tip: z.string(), explanation: z.string().optional() })).default([]),
    toneAndStyle: z.array(z.object({ type: z.string(), tip: z.string(), explanation: z.string().optional() })).default([]),
    content: z.array(z.object({ type: z.string(), tip: z.string(), explanation: z.string().optional() })).default([]),
    structure: z.array(z.object({ type: z.string(), tip: z.string(), explanation: z.string().optional() })).default([]),
    skills: z.array(z.object({ type: z.string(), tip: z.string(), explanation: z.string().optional() })).default([])
  }).default({ ATS: [], toneAndStyle: [], content: [], structure: [], skills: [] }),
  explanation: z.string().default('')
});

module.exports = {
  ResumeSectionItemSchema,
  DynamicResumeSectionSchema,
  FullResumeExtractionSchema,
  ResumeKeywordExtractionSchema,
  EvidenceSourceCitationSchema,
  EvidenceClaimSchema,
  JobRequirementMatchSchema,
  ImpactSignalSchema,
  EvidenceReasoningOutputSchema
};


