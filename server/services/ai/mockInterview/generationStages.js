/**
 * Controlled Generation Stage Constants for CandidateIQ AI Mock Interview Pipeline
 */

const GENERATION_STAGES = {
  INITIALIZING: { stage: 'INITIALIZING', progress: 5, message: 'Initializing mock interview engine...' },
  LOADING_RESUME: { stage: 'LOADING_RESUME', progress: 15, message: 'Loading candidate parsed resume...' },
  LOADING_JOB: { stage: 'LOADING_JOB', progress: 25, message: 'Reading selected recruiter job requisition...' },
  ANALYZING_RESUME: { stage: 'ANALYZING_RESUME', progress: 35, message: 'Analyzing candidate technical background...' },
  ANALYZING_JOB: { stage: 'ANALYZING_JOB', progress: 45, message: 'Analyzing job requirements & competencies...' },
  EXTRACTING_TOPICS: { stage: 'EXTRACTING_TOPICS', progress: 55, message: 'Extracting key domain skills and topics...' },
  BUILDING_CONTEXT: { stage: 'BUILDING_CONTEXT', progress: 65, message: 'Building AI generation context...' },
  GENERATING_QUESTIONS: { stage: 'GENERATING_QUESTIONS', progress: 75, message: 'AI is generating personalized questions...' },
  VALIDATING_QUESTIONS: { stage: 'VALIDATING_QUESTIONS', progress: 85, message: 'Validating questions with Zod schema...' },
  PREPARING_ASSESSMENT: { stage: 'PREPARING_ASSESSMENT', progress: 90, message: 'Preparing assessment breakdown...' },
  SAVING_INTERVIEW: { stage: 'SAVING_INTERVIEW', progress: 95, message: 'Saving Mock Interview document...' },
  SAVING_QUESTIONS: { stage: 'SAVING_QUESTIONS', progress: 98, message: 'Persisting questions to MongoDB...' },
  COMPLETED: { stage: 'COMPLETED', progress: 100, message: 'Your mock interview is ready!' },
  FAILED: { stage: 'FAILED', progress: 0, message: 'Generation failed.' }
};

module.exports = {
  GENERATION_STAGES
};
