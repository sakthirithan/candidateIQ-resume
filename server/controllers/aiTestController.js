const resumeAIService = require('../ai/services/resumeAIService');
const jobAIService = require('../ai/services/jobAIService');
const interviewAIService = require('../ai/services/interviewAIService');
const evaluationAIService = require('../ai/services/evaluationAIService');
const languageAIService = require('../ai/services/languageAIService');

/**
 * AI Layer Test Controller
 * Exposes internal AI service verification endpoints for manual and programmatic testing.
 */

const testAIOperation = async (req, res, next) => {
  try {
    const { operation, input = {} } = req.body;

    if (!operation) {
      return res.status(400).json({
        success: false,
        message: 'Please specify an "operation" field. Supported operations: resume_extraction, jd_analysis, job_match, ats_analysis, generate_mcq, generate_questions, evaluate_text_answer, speech_to_text, language_analysis, behavioural_signal_analysis, sentiment_analysis, resume_interview_comparison, interview_evaluation.'
      });
    }

    let response = null;

    switch (operation) {
      case 'resume_extraction':
        response = await resumeAIService.extractResumeIntelligence(input.rawText || 'Jane Doe, Software Engineer. Skills: React, Node.js, MongoDB. Email: jane@example.com.');
        break;

      case 'jd_analysis':
        response = await jobAIService.analyzeJobDescription(input.jdText || 'We are looking for a Senior React & Node.js Developer with 3-5 years experience.');
        break;

      case 'job_match':
        response = await jobAIService.matchJob(
          input.candidateProfile || { skills: { technical: ['React', 'Node.js', 'JavaScript'] } },
          input.job || { title: 'Frontend Developer', requiredSkills: ['React', 'JavaScript', 'CSS'] }
        );
        break;

      case 'ats_analysis':
        response = await jobAIService.analyzeATS(
          input.candidateProfile || { skills: { technical: ['React', 'Node.js'] } },
          input.job || { title: 'Fullstack Dev', requiredSkills: ['React', 'Node.js'] }
        );
        break;

      case 'generate_mcq':
        response = await interviewAIService.generateMCQs(input.topic || 'Node.js', input.difficulty || 'medium', input.count || 5);
        break;

      case 'generate_questions':
        response = await interviewAIService.generateQuestions(
          input.candidateProfile || { skills: { technical: ['React', 'Node.js'] } },
          input.job || { title: 'Backend Developer', requiredSkills: ['Node.js', 'Express'] },
          input.count || 5
        );
        break;

      case 'evaluate_text_answer':
        response = await evaluationAIService.evaluateTextAnswer(
          input.question || { question: 'Explain React Virtual DOM', category: 'technical', targetSkill: 'React' },
          input.answer || 'Virtual DOM is an in-memory representation of real DOM elements.'
        );
        break;

      case 'speech_to_text':
        response = await evaluationAIService.processSpeechToText(input.audioMeta || { durationSeconds: 15 });
        break;

      case 'language_analysis':
        response = await languageAIService.analyzeLanguage(input.transcript || 'I engineered a scalable web API using Express and MongoDB.');
        break;

      case 'behavioural_signal_analysis':
        response = await languageAIService.analyzeBehaviouralSignals(input.transcript || 'When the database bottleneck occurred, I diagnosed query execution plans.');
        break;

      case 'sentiment_analysis':
        response = await languageAIService.analyzeSentiment(input.transcript || 'I really enjoyed collaborating with the cross-functional team.');
        break;

      case 'resume_interview_comparison':
        response = await languageAIService.compareResumeWithInterview(
          input.candidateProfile || { name: 'Alex', skills: { technical: ['React', 'MongoDB'] } },
          input.evaluations || [{ technicalScore: 85 }]
        );
        break;

      case 'interview_evaluation':
        response = await evaluationAIService.generateUnifiedEvaluation(input.evaluations || []);
        break;

      default:
        return res.status(400).json({ success: false, message: `Unsupported AI operation: "${operation}".` });
    }

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const runFullAITestSuite = async (req, res, next) => {
  try {
    const results = {};

    results.resume_extraction = await resumeAIService.extractResumeIntelligence('John Smith, Senior Developer, john@example.com. Skills: React, Node.js');
    results.jd_analysis = await jobAIService.analyzeJobDescription('Seeking Senior Fullstack Developer with React and Node.js');
    results.job_match = await jobAIService.matchJob({ skills: { technical: ['React'] } }, { title: 'React Dev', requiredSkills: ['React'] });
    results.ats_analysis = await jobAIService.analyzeATS({ skills: { technical: ['React'] } }, { title: 'React Dev', requiredSkills: ['React'] });
    results.generate_mcq = await interviewAIService.generateMCQs('JavaScript', 'medium', 5);
    results.generate_questions = await interviewAIService.generateQuestions({ skills: { technical: ['React'] } }, { title: 'React Dev', requiredSkills: ['React'] }, 5);
    results.evaluate_text_answer = await evaluationAIService.evaluateTextAnswer({ question: 'What is JSX?' }, 'JSX is a syntax extension for JavaScript used with React.');
    results.speech_to_text = await evaluationAIService.processSpeechToText({ durationSeconds: 10 });
    results.language_analysis = await languageAIService.analyzeLanguage('I designed the backend services with Node.js');
    results.behavioural_signal_analysis = await languageAIService.analyzeBehaviouralSignals('I took ownership of resolving performance degradation');
    results.sentiment_analysis = await languageAIService.analyzeSentiment('I enjoy solving complex architectural challenges');
    results.resume_interview_comparison = await languageAIService.compareResumeWithInterview({ name: 'Candidate' }, []);

    const allSuccessful = Object.values(results).every(r => r.status === 'success');

    return res.status(200).json({
      success: true,
      allOperationsPassed: allSuccessful,
      totalOperationsTested: Object.keys(results).length,
      summary: Object.keys(results).reduce((acc, key) => {
        acc[key] = {
          status: results[key].status,
          provider: results[key].provider,
          latencyMs: results[key].processingTimeMs,
          fallbackUsed: results[key].fallbackUsed
        };
        return acc;
      }, {}),
      fullDetails: results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  testAIOperation,
  runFullAITestSuite
};
