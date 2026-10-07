const { z } = require('zod');

/**
 * Zod Schemas for Job Description Intelligence & Matching
 */

const JobDescriptionAnalysisSchema = z.object({
  title: z.string().default('Job Role'),
  company: z.string().default('Company'),
  department: z.string().default('Engineering'),
  seniority: z.string().default('Mid-Level'),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  technicalSkills: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  experienceRequirements: z.object({
    minYears: z.number().default(0),
    maxYears: z.number().default(10),
    description: z.string().default('0-10 Years')
  }).default({ minYears: 0, maxYears: 10, description: '0-10 Years' }),
  educationRequirements: z.array(z.string()).default(['Bachelor Degree']),
  responsibilities: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  interviewTopics: z.array(z.string()).default(['Core Domain Knowledge', 'System Architecture', 'Problem Solving'])
});

const JobMatchSchema = z.object({
  overallMatch: z.number().min(0).max(100).default(75),
  technicalMatch: z.number().min(0).max(100).default(75),
  experienceMatch: z.number().min(0).max(100).default(75),
  educationMatch: z.number().min(0).max(100).default(75),
  projectRelevance: z.number().min(0).max(100).default(75),
  strongMatches: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  requirementGaps: z.array(z.string()).default([]),
  areasRequiringValidation: z.array(z.string()).default([]),
  explanation: z.string().default('Candidate profile evaluates well against job requirements.'),
  recommendation: z.string().default('Recommended for interview evaluation.')
});

const ATSAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100).default(75),
  breakdown: z.object({
    skillMatch: z.number().min(0).max(100).default(75),
    experienceMatch: z.number().min(0).max(100).default(75),
    educationMatch: z.number().min(0).max(100).default(75),
    keywordMatch: z.number().min(0).max(100).default(75),
    projectRelevance: z.number().min(0).max(100).default(75)
  }).default({ skillMatch: 75, experienceMatch: 75, educationMatch: 75, keywordMatch: 75, projectRelevance: 75 }),
  matchedRequirements: z.array(z.string()).default([]),
  missingRequirements: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  explanation: z.string().default('ATS scan complete.')
});

const JobKeywordExtractionSchema = z.object({
  jobId: z.string().optional(),
  keywords: z.array(z.string()).default([])
});

module.exports = {
  JobDescriptionAnalysisSchema,
  JobMatchSchema,
  ATSAnalysisSchema,
  JobKeywordExtractionSchema
};
