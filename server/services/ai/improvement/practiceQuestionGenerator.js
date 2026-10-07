const aiOrchestrator = require('../../../ai/orchestrator/aiOrchestrator');

/**
 * Generate 2-3 focused practice questions specifically tailored to an Improvement Activity
 */
async function generatePracticeQuestions({ activity, interviewContext }) {
  const { category, skill, title, recommendedFramework, baselineValue, targetValue } = activity;
  const targetRole = interviewContext?.targetRole || 'Software Engineer';
  const skills = interviewContext?.candidateSkills || ['React', 'Node.js', 'System Design'];

  const prompt = `You are CandidateIQ Practice Engine.
Generate 2 targeted interview practice questions specifically designed to help a candidate remediate a detected weakness in their interview performance.

Candidate Context:
- Target Role: ${targetRole}
- Key Skills: ${skills.slice(0, 5).join(', ')}
- Targeted Activity: "${title}" (${category} - ${skill})
- Recommended Framework: ${recommendedFramework}
- Current Baseline: ${baselineValue} | Target Goal: ${targetValue}

Question Generation Requirements:
1. Questions must specifically test the candidate's ability to demonstrate ${recommendedFramework} framework or control ${skill}.
2. For COMMUNICATION / FILLER WORDS: Ask open-ended technical or situational questions that require a 1-2 minute structured explanation.
3. For TECHNICAL / CEET: Ask questions requiring explaining internal mechanisms, practical application, and trade-offs.
4. For BEHAVIORAL / STAR: Ask scenario questions requiring Situation, Task, Action, and Result breakdown.

Return strictly valid JSON format:
{
  "questions": [
    {
      "questionId": "pq_1",
      "questionText": "Question 1 text...",
      "targetSkill": "${skill}",
      "category": "${category}",
      "expectedStructure": "${recommendedFramework}"
    },
    {
      "questionId": "pq_2",
      "questionText": "Question 2 text...",
      "targetSkill": "${skill}",
      "category": "${category}",
      "expectedStructure": "${recommendedFramework}"
    }
  ]
}`;

  try {
    const aiResponse = await aiOrchestrator.executeOperation({
      operation: 'generate_practice_questions',
      prompt
    });

    if (aiResponse && Array.isArray(aiResponse.questions) && aiResponse.questions.length > 0) {
      return aiResponse.questions;
    }
  } catch (error) {
    console.warn('[PRACTICE_QUESTION_GEN] LLM generation failed, fallback to structured templates:', error.message);
  }

  // Robust Fallback Templates
  if (category === 'communication' && skill === 'filler_words') {
    return [
      {
        questionId: 'pq_fw_1',
        questionText: `Walk me through how you design and structure a clean, scalable component architecture in ${skills[0] || 'your primary framework'}. Focus on steady pacing and controlled pauses.`,
        targetSkill: 'filler_words',
        category: 'communication',
        expectedStructure: 'CONTROLLED_PAUSE'
      },
      {
        questionId: 'pq_fw_2',
        questionText: 'Explain how you approach debugging a high-latency production API endpoint. Use deliberate 1-second pauses between key steps.',
        targetSkill: 'filler_words',
        category: 'communication',
        expectedStructure: 'CONTROLLED_PAUSE'
      }
    ];
  }

  if (category === 'communication' && skill === 'answer_clarity') {
    return [
      {
        questionId: 'pq_cl_1',
        questionText: `Explain the concept of asynchronous state management in ${skills[0] || 'modern web applications'} using the Point -> Explanation -> Example framework.`,
        targetSkill: 'answer_clarity',
        category: 'communication',
        expectedStructure: 'PEE'
      },
      {
        questionId: 'pq_cl_2',
        questionText: 'What is your strategy for optimizing database query performance under peak load? Provide a structured Point, Explanation, and Example.',
        targetSkill: 'answer_clarity',
        category: 'communication',
        expectedStructure: 'PEE'
      }
    ];
  }

  if (category === 'technical') {
    return [
      {
        questionId: 'pq_tech_1',
        questionText: `Explain the internal execution mechanism of ${skills[0] || 'memory management/concurrency'}, your real-world usage experience, and the performance trade-offs involved.`,
        targetSkill: 'technical_depth',
        category: 'technical',
        expectedStructure: 'CEET'
      },
      {
        questionId: 'pq_tech_2',
        questionText: 'Compare client-side rendering versus server-side rendering. Detail the exact loading lifecycle, bandwidth trade-offs, and SEO implications.',
        targetSkill: 'technical_depth',
        category: 'technical',
        expectedStructure: 'CEET'
      }
    ];
  }

  // Default STAR Behavioral
  return [
    {
      questionId: 'pq_star_1',
      questionText: 'Tell me about a time you resolved a major technical conflict or architectural disagreement within your team. Structure your response with Situation, Task, Action, and Result.',
      targetSkill: 'star_response',
      category: 'behavioral',
      expectedStructure: 'STAR'
    },
    {
      questionId: 'pq_star_2',
      questionText: 'Describe a situation where a critical production bug occurred right before a deadline. What specific actions did YOU take, and what was the measurable outcome?',
      targetSkill: 'star_response',
      category: 'behavioral',
      expectedStructure: 'STAR'
    }
  ];
}

module.exports = {
  generatePracticeQuestions
};
