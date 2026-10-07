const aiOrchestrator = require('../orchestrator/aiOrchestrator');
const resumePrompts = require('../prompts/resumePrompts');
const { FullResumeExtractionSchema, ResumeKeywordExtractionSchema, EvidenceReasoningOutputSchema } = require('../schemas/resumeSchemas');
const fallbackProvider = require('../providers/fallbackProvider');

const ATS_WEIGHTS = {
  format: 0.15,
  keywordCoverage: 0.15,
  skillEvidence: 0.20,
  impact: 0.15,
  structure: 0.10,
  roleFit: 0.20,
  evidenceQuality: 0.05
};

/**
 * Resume AI Service
 * Handles full document parsing, dynamic evidence reasoning, deterministic ATS scoring, and keyword extraction.
 */

class ResumeAIService {
  async extractFullResumeIntelligence(rawText) {
    return aiOrchestrator.executeOperation({
      operation: 'resume_parse',
      prompt: resumePrompts.extractFullResume(rawText),
      schema: FullResumeExtractionSchema,
      fallbackFn: () => fallbackProvider.fallbackResume(rawText),
      metadata: { textLength: rawText ? rawText.length : 0 }
    });
  }

  async extractResumeKeywords(rawText) {
    return aiOrchestrator.executeOperation({
      operation: 'resume_keyword_extraction',
      prompt: resumePrompts.extractResumeKeywords(rawText),
      schema: ResumeKeywordExtractionSchema,
      fallbackFn: () => fallbackProvider.fallbackResumeKeywords(rawText),
      metadata: { textLength: rawText ? rawText.length : 0 }
    });
  }

  /**
   * Dynamic LLM Evidence Reasoning & Deterministic ATS Intelligence Pipeline
   */
  async analyzeResumeEvidenceAndATS(rawText = '', structuredResume = null, targetContext = {}) {
    const rawLower = (rawText || '').toLowerCase();
    const safeContext = targetContext || {};
    const { companyName = '', role = '', jobDescription = '' } = safeContext;

    // 1. LLM Contextual Reasoning & Evidence Extraction
    const aiOutput = await aiOrchestrator.executeOperation({
      operation: 'resume_evidence_reasoning',
      prompt: resumePrompts.extractEvidenceAndReasoning({ rawText, structuredResume, targetContext: safeContext }),
      schema: EvidenceReasoningOutputSchema,
      fallbackFn: () => fallbackProvider.fallbackEvidenceReasoning({ rawText, structuredResume, targetContext: safeContext }),
      metadata: {
        textLength: rawText ? rawText.length : 0,
        hasTargetRole: Boolean(role),
        hasJD: Boolean(jobDescription)
      }
    });

    const reasoningResult = aiOutput?.result || aiOutput || {};

    // 2. Deterministic Evidence Citation Validation (Protect against hallucinated quotes)
    const validatedClaims = (reasoningResult.claims || []).map((claim, idx) => {
      const validatedSources = (claim.supportingEvidence || []).map((source, sIdx) => {
        const quoteSnippet = (source.text || '').trim();
        const existsInRaw = quoteSnippet.length > 0 && rawLower.includes(quoteSnippet.toLowerCase().slice(0, 30));
        return {
          sourceId: source.sourceId || `src_${idx}_${sIdx}`,
          type: source.type || 'resume_text',
          text: source.text,
          page: source.page || 1,
          isVerified: existsInRaw
        };
      });

      return {
        id: claim.id || `claim_${idx + 1}`,
        claim: claim.claim,
        level: claim.evidenceLevel, // 'direct' | 'contextual' | 'derived' | 'unsupported'
        evidenceLevel: claim.evidenceLevel,
        confidence: typeof claim.confidence === 'number' ? (claim.confidence >= 0.8 ? 'high' : claim.confidence >= 0.5 ? 'medium' : 'low') : 'high',
        confidenceScore: claim.confidence || 0.85,
        supportingEvidence: validatedSources.map((s) => s.text).filter(Boolean),
        sourceCitations: validatedSources,
        reasoning: claim.reasoning,
        verificationGap: claim.verificationGap || null
      };
    });

    // Count evidence levels
    let directCount = 0;
    let contextualCount = 0;
    let derivedCount = 0;
    let unsupportedCount = 0;

    validatedClaims.forEach((c) => {
      if (c.level === 'direct') directCount++;
      else if (c.level === 'contextual') contextualCount++;
      else if (c.level === 'derived') derivedCount++;
      else if (c.level === 'unsupported') unsupportedCount++;
    });

    // 3. Deterministic Category Metric Calculations
    // A. Format Compatibility
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(rawText);
    const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(rawText);
    const charLength = (rawText || '').length;

    let formatScore = 75;
    if (hasEmail && hasPhone) formatScore += 15;
    if (charLength >= 400 && charLength <= 8000) formatScore += 8;
    formatScore = Math.min(98, Math.max(50, formatScore));

    // B. Impact & Metrics
    const lines = (rawText || '').split('\n').map((l) => l.trim()).filter(Boolean);
    const bulletLines = lines.filter((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l));
    const totalBullets = Math.max(bulletLines.length, 1);
    const quantifiedBullets = bulletLines.filter((l) =>
      /\b(\d+%\s*|\$\d+|\d+\+?\s*(users|clients|requests|ms|million|billion|engineers|x\b))\b/i.test(l)
    );
    const metricRatio = quantifiedBullets.length / totalBullets;
    const actionVerbMatches = rawText.match(/\b(spearheaded|architected|engineered|optimized|developed|implemented|led|orchestrated|designed|built|scaled|delivered|reduced|increased)\b/gi) || [];
    const actionVerbCount = actionVerbMatches.length;

    let impactScore = Math.round(55 + metricRatio * 30 + Math.min(12, actionVerbCount * 2) + ((reasoningResult.impactSignals?.length || 0) * 3));
    impactScore = Math.min(96, Math.max(45, impactScore));

    // C. Skills & Keywords Coverage
    const technicalSkills = reasoningResult.technicalKeywords || [];
    const softSkills = reasoningResult.softSkills || [];
    const jobMatches = reasoningResult.jobMatch || [];

    const matchedJdSkills = jobMatches.filter((m) => m.matchType === 'DIRECT MATCH' || m.matchType === 'CONTEXTUAL MATCH').map((m) => m.requirement);
    const missingJdSkills = jobMatches.filter((m) => m.matchType === 'MISSING' || m.matchType === 'INSUFFICIENT EVIDENCE').map((m) => m.requirement);

    let keywordCoverage = 85;
    if (jobMatches.length > 0) {
      keywordCoverage = Math.round((matchedJdSkills.length / jobMatches.length) * 100);
    }
    let skillScore = Math.round(50 + (technicalSkills.length / 15) * 35 + (keywordCoverage / 100) * 15);
    skillScore = Math.min(98, Math.max(45, skillScore));

    // D. Structure & Brevity
    const detectedSections = [];
    if (/(summary|about|profile)/i.test(rawText)) detectedSections.push('Summary');
    if (/(experience|employment|work)/i.test(rawText)) detectedSections.push('Experience');
    if (/(education|degree|university)/i.test(rawText)) detectedSections.push('Education');
    if (/(skills|technologies)/i.test(rawText)) detectedSections.push('Skills');
    if (/(projects)/i.test(rawText)) detectedSections.push('Projects');
    if (/(certifications|credentials)/i.test(rawText)) detectedSections.push('Certifications');

    let structureScore = 70;
    if (detectedSections.length >= 4) structureScore += 18;
    structureScore = Math.min(96, Math.max(50, structureScore));

    // E. Evidence Quality & Role Fit
    const totalEvidenceItems = Math.max(validatedClaims.length, 1);
    const evidenceQualityScore = Math.min(
      98,
      Math.max(
        45,
        Math.round(
          directCount * 22 +
          contextualCount * 15 +
          derivedCount * 12 -
          unsupportedCount * 8 +
          (metricRatio > 0 ? 10 : 0) +
          (actionVerbCount >= 3 ? 8 : 0)
        )
      )
    );

    let roleFitScore = 80;
    if (jobMatches.length > 0) {
      const directMatches = jobMatches.filter((m) => m.matchType === 'DIRECT MATCH').length;
      const contextualMatches = jobMatches.filter((m) => m.matchType === 'CONTEXTUAL MATCH').length;
      roleFitScore = Math.min(98, Math.max(40, Math.round((directMatches * 25 + contextualMatches * 15) / Math.max(jobMatches.length, 1) * 3.5)));
    }

    // 4. Deterministic Overall ATS Score Calculation (Using configured weights)
    const overallScore = Math.round(
      formatScore * ATS_WEIGHTS.format +
      keywordCoverage * ATS_WEIGHTS.keywordCoverage +
      skillScore * ATS_WEIGHTS.skillEvidence +
      impactScore * ATS_WEIGHTS.impact +
      structureScore * ATS_WEIGHTS.structure +
      roleFitScore * ATS_WEIGHTS.roleFit +
      evidenceQualityScore * ATS_WEIGHTS.evidenceQuality
    );

    // 5. Assembled Structured Analysis
    const evidencePayload = {
      evidenceQualityScore,
      totalEvidenceClaims: validatedClaims.length,
      counts: {
        direct: directCount,
        contextual: contextualCount,
        derived: derivedCount,
        unsupported: unsupportedCount
      },
      breakdown: {
        directPercent: Math.round((directCount / totalEvidenceItems) * 100),
        contextualPercent: Math.round((contextualCount / totalEvidenceItems) * 100),
        derivedPercent: Math.round((derivedCount / totalEvidenceItems) * 100),
        unsupportedPercent: Math.round((unsupportedCount / totalEvidenceItems) * 100)
      },
      items: validatedClaims,
      generatedAt: new Date().toISOString()
    };

    const summary = reasoningResult.explanation ||
      `Resume scored ${overallScore}/100 in overall ATS compatibility${role ? ` for ${role}` : ''}${companyName ? ` at ${companyName}` : ''}. Identified ${technicalSkills.length} technical competencies and ${validatedClaims.length} evidence claims with ${evidenceQualityScore}% evidence depth.`;

    return {
      overallScore,
      format: {
        score: formatScore,
        textExtractability: 96,
        sectionDetection: Math.round((detectedSections.length / 5) * 100),
        standardHeadings: 92,
        formattingCompatibility: formatScore
      },
      keywords: {
        score: skillScore,
        total: technicalSkills.length + softSkills.length,
        matched: matchedJdSkills.length || technicalSkills.length,
        missing: missingJdSkills.length,
        coverage: keywordCoverage,
        technical: technicalSkills,
        softSkills: softSkills,
        missingKeywords: missingJdSkills
      },
      impact: {
        score: impactScore,
        quantifiedBullets: quantifiedBullets.length,
        totalBullets,
        metricUsage: Math.round(metricRatio * 100),
        actionVerbScore: Math.min(95, actionVerbCount * 12 + 50)
      },
      structure: {
        score: structureScore,
        detectedSections,
        pageCount: Math.max(1, Math.round(charLength / 2200)),
        contentDensity: 90
      },
      evidence: evidencePayload,
      jobMatch: {
        score: roleFitScore,
        requirements: jobMatches,
        requiredSkillsMatched: matchedJdSkills,
        requiredSkillsMissing: missingJdSkills,
        preferredSkillsMatched: technicalSkills.slice(0, 3),
        preferredSkillsMissing: missingJdSkills.slice(3)
      },
      summary,
      strengths: reasoningResult.strengths || ['Clear document structure and indexable sections.'],
      weaknesses: reasoningResult.weaknesses || (quantifiedBullets.length === 0 ? ['Several bullets lack quantifiable metrics.'] : []),
      criticalFixes: reasoningResult.criticalFixes || [],
      technicalSkills,
      softSkills,
      missingRecommendedSkills: missingJdSkills,
      tipsByCategory: reasoningResult.categoryTips || { ATS: [], toneAndStyle: [], content: [], structure: [], skills: [] },
      metadata: {
        analysisVersion: 'evidence-v3-deterministic',
        model: 'CandidateIQ-Evidence-Reasoner-v3',
        analyzedAt: new Date().toISOString()
      },
      analyzedAt: new Date().toISOString()
    };
  }

  // Backward compatibility alias
  async extractResumeIntelligence(rawText) {
    return this.extractFullResumeIntelligence(rawText);
  }
}

module.exports = new ResumeAIService();

