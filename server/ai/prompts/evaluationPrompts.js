/**
 * Response & Unified Evaluation System Prompts
 */

const evaluationPrompts = {
  evaluateTextAnswer: (question, candidateAnswer) => `
Evaluate the candidate's interview response against the target question context.
Question: "${question.question || question.questionText}"
Category: "${question.category || 'technical'}"
Target Skill: "${question.targetSkill || 'General'}"
Candidate Answer: "${candidateAnswer}"

Analyze technical correctness, relevance, completeness, reasoning, clarity, grammar, and vocabulary.

Return ONLY valid JSON:
{
  "score": number (0-100),
  "technicalCorrectness": number (0-100),
  "relevance": number (0-100),
  "completeness": number (0-100),
  "reasoning": number (0-100),
  "clarity": number (0-100),
  "grammar": number (0-100),
  "vocabulary": number (0-100),
  "communicationQuality": number (0-100),
  "feedback": "string",
  "strengths": ["string"],
  "improvements": ["string"]
}
`,

  speechToTextMock: (audioMeta) => `
Process audio metadata and return structured Speech-to-Text transcript envelope.

Return ONLY valid JSON:
{
  "transcript": "string",
  "language": "en",
  "confidence": number (0-1),
  "durationSeconds": number,
  "segments": [
    { "start": number, "end": number, "text": "string" }
  ]
}
`,

  evaluateMockAnswer: (question, candidateAnswer, sourceKeyword) => `
Evaluate the candidate's MOCK INTERVIEW response against the question and its source keyword.

Question: "${question.question || question.questionText}"
Source Keyword: "${sourceKeyword || question.sourceKeyword || 'Core Tech'}"
Category: "${question.category || 'technical'}"
Target Skill: "${question.targetSkill || 'General'}"
Candidate Submitted Answer: "${candidateAnswer}"

CRITICAL RULE:
- Evaluate whether the candidate correctly and clearly answered the question based on technical correctness, relevance, completeness, reasoning, and clarity.
- Do NOT use or reference any recruiter HR evaluation prompts.

Return ONLY valid JSON matching this exact structure:
{
  "operation": "mock_answer_evaluation",
  "status": "success",
  "result": {
    "questionId": "${question.questionId || question.id || 1}",
    "sourceKeyword": "${sourceKeyword || question.sourceKeyword || 'Core Tech'}",
    "score": 82,
    "technicalCorrectness": 85,
    "relevance": 90,
    "completeness": 75,
    "reasoning": 80,
    "clarity": 82,
    "strengths": ["Clear technical explanation of state updates"],
    "improvements": ["Could elaborate on component re-rendering optimization"],
    "feedback": "Solid answer addressing the core concept of React state lifecycle."
  }
}
`,

  evaluateActualAnswerWithHRPrompt: (question, candidateAnswer, job, hrEvaluationPrompt) => `
Evaluate candidate response for an ACTUAL RECRUITER INTERVIEW.

Job Title: "${job?.title || 'Job Position'}"
HR Evaluation Prompt: "${hrEvaluationPrompt || ''}"
Question: "${question.question || question.questionText}"
Candidate Answer: "${candidateAnswer}"

Return ONLY valid JSON matching this structure:
{
  "operation": "actual_answer_evaluation",
  "status": "success",
  "result": {
    "score": 85,
    "technicalCorrectness": 85,
    "hrAlignmentScore": 90,
    "relevance": 88,
    "strengths": ["Demonstrates key criteria requested by HR prompt"],
    "improvements": ["Provide quantitative metrics"],
    "feedback": "Answer satisfies HR criteria and technical depth expectations."
  }
}
`
};

module.exports = evaluationPrompts;
