const resumeAIService = require('../ai/services/resumeAIService');
const jobAIService = require('../ai/services/jobAIService');
const interviewAIService = require('../ai/services/interviewAIService');
const evaluationAIService = require('../ai/services/evaluationAIService');
const languageAIService = require('../ai/services/languageAIService');

/**
 * Main CandidateIQ AI Gateway Service
 * Preserves exact existing application signatures while delegating to the centralized AI Architecture.
 */
class AIService {
  /**
   * Parse resume text into structured JSON candidate profile
   */
  async parseResumeText(rawText) {
    const response = await resumeAIService.extractResumeIntelligence(rawText);
    return response.result;
  }

  /**
   * Analyze candidate job match compatibility
   */
  async analyzeJobMatch(candidateProfile, jobDescription) {
    const response = await jobAIService.matchJob(candidateProfile, jobDescription);
    return response.result;
  }

  /**
   * Analyze Job Description into structured context
   */
  async analyzeJobDescription(jdText) {
    const response = await jobAIService.analyzeJobDescription(jdText);
    return response.result;
  }

  /**
   * Run ATS scan on candidate against job requirement
   */
  async analyzeATS(candidateProfile, jobDescription) {
    const response = await jobAIService.analyzeATS(candidateProfile, jobDescription);
    return response.result;
  }

  /**
   * Generate personalized interview questions
   */
  async generateInterviewQuestions(candidateProfile, job, count = 5) {
    const response = await interviewAIService.generateQuestions(candidateProfile, job, count);
    return response.result;
  }

  /**
   * Generate structured MCQs
   */
  async generateMCQs(topic, difficulty = 'medium', count = 5) {
    const response = await interviewAIService.generateMCQs(topic, difficulty, count);
    return response.result;
  }

  /**
   * Evaluate candidate text interview response
   */
  async evaluateInterviewResponse(question, responseText) {
    const response = await evaluationAIService.evaluateTextAnswer(question, responseText);
    return response.result;
  }

  /**
   * Speech-to-Text conversion
   */
  async speechToText(audioMeta) {
    const response = await evaluationAIService.processSpeechToText(audioMeta);
    return response.result;
  }

  /**
   * English communication analysis
   */
  async analyzeLanguage(transcript) {
    const response = await languageAIService.analyzeLanguage(transcript);
    return response.result;
  }

  /**
   * Behavioral signal analysis
   */
  async analyzeBehaviouralSignals(transcript) {
    const response = await languageAIService.analyzeBehaviouralSignals(transcript);
    return response.result;
  }

  /**
   * Sentiment analysis
   */
  async analyzeSentiment(transcript) {
    const response = await languageAIService.analyzeSentiment(transcript);
    return response.result;
  }

  /**
   * Resume vs Interview claim comparison
   */
  async compareResumeWithInterview(profile, evaluations) {
    const response = await languageAIService.compareResumeWithInterview(profile, evaluations);
    return response.result;
  }
}

module.exports = new AIService();
