/**
 * English Analysis, Behavioral Signals, Sentiment, and Resume/Interview Comparison System Prompts
 */

const analysisPrompts = {
  languageAnalysis: (transcriptText) => `
Analyze the English communication quality of the interview transcript.
Do NOT penalize non-native accent, regional dialect, or cultural pronunciation patterns. Focus purely on grammar structure, vocabulary diversity, fluency continuity, coherence, and clarity.

Return ONLY valid JSON:
{
  "grammarScore": number (0-100),
  "vocabularyScore": number (0-100),
  "fluencyScore": number (0-100),
  "coherenceScore": number (0-100),
  "clarityScore": number (0-100),
  "observations": ["string"]
}

TRANSCRIPT:
"""
${transcriptText}
"""
`,

  behaviouralSignalAnalysis: (transcriptText) => `
Analyze observable behavioural signals in the interview transcript.
Do NOT make psychological or medical diagnoses (e.g., do NOT claim candidate is dishonest, dishonest, unstable, or has a disorder).
Focus strictly on directness, responsiveness, logical structure, problem-solving approach, adaptability demonstrated, and project ownership.

Return ONLY valid JSON:
{
  "directness": number (0-100),
  "responsiveness": number (0-100),
  "logicalStructure": number (0-100),
  "problemSolvingApproach": number (0-100),
  "adaptabilityDemonstrated": number (0-100),
  "projectOwnership": number (0-100),
  "observations": ["string"]
}

TRANSCRIPT:
"""
${transcriptText}
"""
`,

  sentimentAnalysis: (transcriptText) => `
Analyze sentiment and communication confidence in the interview transcript.
This metric is for communication tone context ONLY and must not be used to disqualify candidate.

Return ONLY valid JSON:
{
  "overall": "positive" | "neutral" | "negative",
  "confidence": number (0-1),
  "engagement": "string",
  "observations": ["string"]
}

TRANSCRIPT:
"""
${transcriptText}
"""
`,

  resumeInterviewComparison: (resumeProfile, interviewEvaluations) => `
Compare candidate's resume claims against demonstrated interview performance evidence.
Identify matched claims, technical consistency, and areas requiring further validation.
Do NOT label a candidate dishonest merely because an interview response is weaker than a resume claim; label it "Area requiring further validation".

Resume Profile: ${JSON.stringify(resumeProfile)}
Interview Evaluations: ${JSON.stringify(interviewEvaluations)}

Return ONLY valid JSON:
{
  "matchedClaims": ["string"],
  "areasRequiringFurtherValidation": ["string"],
  "technicalConsistency": number (0-100),
  "experienceConsistency": number (0-100),
  "explanation": "string"
}
`
};

module.exports = analysisPrompts;
