const aiOrchestrator = require('../orchestrator/aiOrchestrator');
const analysisPrompts = require('../prompts/analysisPrompts');
const {
  LanguageAnalysisSchema,
  BehaviouralSignalSchema,
  SentimentAnalysisSchema,
  ResumeInterviewComparisonSchema
} = require('../schemas/analysisSchemas');
const fallbackProvider = require('../providers/fallbackProvider');

/**
 * Language Analysis, Behavioral Signals, Sentiment, and Claim Verification AI Service
 */

class LanguageAIService {
  async analyzeLanguage(transcriptText) {
    return aiOrchestrator.executeOperation({
      operation: 'language_analysis',
      prompt: analysisPrompts.languageAnalysis(transcriptText),
      schema: LanguageAnalysisSchema,
      fallbackFn: () => fallbackProvider.fallbackLanguage(transcriptText),
      metadata: { textLength: transcriptText ? transcriptText.length : 0 }
    });
  }

  async analyzeBehaviouralSignals(transcriptText) {
    return aiOrchestrator.executeOperation({
      operation: 'behavioural_signal_analysis',
      prompt: analysisPrompts.behaviouralSignalAnalysis(transcriptText),
      schema: BehaviouralSignalSchema,
      fallbackFn: () => fallbackProvider.fallbackBehavioural(transcriptText),
      metadata: { textLength: transcriptText ? transcriptText.length : 0 }
    });
  }

  async analyzeSentiment(transcriptText) {
    return aiOrchestrator.executeOperation({
      operation: 'sentiment_analysis',
      prompt: analysisPrompts.sentimentAnalysis(transcriptText),
      schema: SentimentAnalysisSchema,
      fallbackFn: () => fallbackProvider.fallbackSentiment(transcriptText),
      metadata: { textLength: transcriptText ? transcriptText.length : 0 }
    });
  }

  async compareResumeWithInterview(resumeProfile, interviewEvaluations) {
    return aiOrchestrator.executeOperation({
      operation: 'resume_interview_comparison',
      prompt: analysisPrompts.resumeInterviewComparison(resumeProfile, interviewEvaluations),
      schema: ResumeInterviewComparisonSchema,
      fallbackFn: () => fallbackProvider.fallbackComparison(resumeProfile, interviewEvaluations),
      metadata: { candidateName: resumeProfile ? resumeProfile.name : 'Candidate' }
    });
  }
}

module.exports = new LanguageAIService();
