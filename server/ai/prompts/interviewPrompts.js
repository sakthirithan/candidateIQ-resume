/**
 * Interview Question & MCQ Generation System Prompts
 */

const interviewPrompts = {
  generateMCQ: (topic, difficulty = 'medium', count = 5) => `
Generate ${count} Multiple Choice Questions for topic: "${topic}" at difficulty level: "${difficulty}".

Return ONLY a valid JSON object matching this format:
{
  "questions": [
    {
      "questionId": "mcq_1",
      "question": "Question text here",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" },
        { "id": "C", "text": "Option C" },
        { "id": "D", "text": "Option D" }
      ],
      "correctAnswer": "B",
      "explanation": "Explanation text",
      "difficulty": "${difficulty}",
      "category": "${topic}"
    }
  ]
}
`,

  generateQuestions: (candidateProfile, job, count = 5) => `
Generate ${count} dynamic interview questions tailored to candidate profile and target job.
Candidate Profile: ${JSON.stringify(candidateProfile)}
Job Title: ${job.title || 'Software Engineer'}

Return ONLY a valid JSON object matching this format:
{
  "questions": [
    {
      "id": 1,
      "sourceKeyword": "React",
      "category": "technical",
      "question": "Question text here",
      "targetSkill": "Software Engineering",
      "evaluationCriteria": "Demonstrates problem solving and domain depth"
    }
  ]
}
`,

  generateMockQuestionsFromResumeKeywords: (resumeKeywords = [], interviewType = 'mixed', difficulty = 'Mid-Level', count = 5) => `
Generate ${count} mock interview questions derived EXCLUSIVELY from the candidate's confirmed resume keywords.

CRITICAL ARCHITECTURAL RULES:
1. Every generated question MUST be based on a candidate resume keyword from the list below.
2. Every question MUST explicitly specify its "sourceKeyword" field matching one of the provided resume keywords.
3. Do NOT generate questions for skills not listed in the candidate's resume keywords.
4. HR Evaluation Prompts or external Job Descriptions must NEVER influence this question generation.

Candidate Resume Keywords:
${JSON.stringify(resumeKeywords)}

Interview Settings:
- Interview Type: "${interviewType}"
- Difficulty Level: "${difficulty}"
- Count: ${count}

Return ONLY valid JSON matching this structure:
{
  "questions": [
    {
      "id": 1,
      "sourceKeyword": "React",
      "category": "technical",
      "question": "Explain React state management and component re-rendering triggers.",
      "targetSkill": "React",
      "evaluationCriteria": "Evaluates virtual DOM diffing and state lifecycle."
    }
  ]
}
`
};

module.exports = interviewPrompts;
