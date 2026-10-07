const Interview = require('../../../models/Interview');
const MockInterviewWorkspace = require('../../../models/MockInterviewWorkspace');
const ImprovementActivity = require('../../../models/ImprovementActivity');
const CompetencyProfile = require('../../../models/CompetencyProfile');

class AdaptiveInterviewEngine {
  /**
   * Builds complete adaptive context for a candidate workspace from historical attempt evidence.
   */
  static async buildAdaptiveContext({ workspaceId, candidateId }) {
    // 1. Query all previous completed attempts for this workspace chronologically
    const attempts = await Interview.find({
      workspaceId,
      candidate: candidateId,
      status: 'completed'
    }).sort({ createdAt: 1 });

    // 2. Query all improvement activities created for this candidate and workspace attempts
    const attemptIds = attempts.map((a) => a._id);
    const activities = await ImprovementActivity.find({
      userId: candidateId,
      sourceInterviewId: { $in: attemptIds }
    }).sort({ createdAt: -1 });

    // 3. Aggregate previous question coverage (topics, subtopics, question text)
    const previousQuestionCoverage = [];
    attempts.forEach((att) => {
      const qList = att.questions || [];
      qList.forEach((q) => {
        previousQuestionCoverage.push({
          attemptId: att._id,
          questionId: q.questionId || q._id,
          category: q.category || 'voice',
          topic: q.sourceKeyword || q.targetSkill || 'Technical',
          questionText: q.questionText || q.question || '',
          score: q.evaluation?.technicalScore ? q.evaluation.technicalScore * 10 : 70
        });
      });
    });

    return {
      workspaceId,
      attempts,
      attemptCount: attempts.length,
      activities,
      previousQuestionCoverage
    };
  }

  /**
   * Calculates weakness priorities from previous attempt evaluations & multi-attempt consistency.
   */
  static calculateWeaknessPriorities(attempts = [], activities = []) {
    if (attempts.length === 0) return [];

    const latestAttempt = attempts[attempts.length - 1];
    const latestEval = latestAttempt.evaluation || latestAttempt.overallEvaluation || {};
    const weaknesses = [];

    // Analyze section-level scores
    const sectionMap = {
      technical: latestEval.technicalScore ?? latestEval.technicalProficiency ?? 75,
      communication: latestEval.communicationScore ?? latestEval.communicationClarity ?? 75,
      problemSolving: latestEval.reasoningScore ?? latestEval.problemSolvingRating ?? 75,
      behavioural: latestEval.behaviouralScore ?? latestEval.behaviouralCompetency ?? 75,
      voice: latestEval.voiceScore ?? 75,
      mcq: latestEval.mcqScore ?? 75
    };

    Object.entries(sectionMap).forEach(([sectionKey, score]) => {
      if (score < 75) {
        // Calculate recurrence across all attempts
        let recurrenceCount = 0;
        attempts.forEach((att) => {
          const ev = att.evaluation || att.overallEvaluation || {};
          const attScore = ev[`${sectionKey}Score`] ?? ev.technicalScore ?? score;
          if (attScore < 75) recurrenceCount++;
        });

        const severity = score < 55 ? 3 : score < 68 ? 2 : 1;
        const priorityScore = severity * Math.max(1, recurrenceCount) * 10;
        const priority = priorityScore >= 30 ? 'CRITICAL' : priorityScore >= 20 ? 'HIGH' : 'MEDIUM';

        // Check matching activities
        const matchingActivities = activities.filter((act) => act.category === sectionKey || act.skill.toLowerCase().includes(sectionKey));
        const completedActivity = matchingActivities.find((act) => act.status === 'COMPLETED');
        const hasCompletedActivity = Boolean(completedActivity);

        weaknesses.push({
          section: sectionKey,
          score,
          severity: severity === 3 ? 'High' : 'Medium',
          recurrenceCount,
          priorityScore,
          priority,
          hasCompletedActivity,
          completedActivityId: completedActivity?._id || null,
          issueDescription: `${sectionKey.toUpperCase()} performance below baseline target (${score}/100 across ${recurrenceCount} attempt(s))`
        });
      }
    });

    // Sort weaknesses by priorityScore descending
    return weaknesses.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * Calculates uncertain competencies where evidence is insufficient or variable.
   */
  static calculateUncertainCompetencies(attempts = [], jobSkills = []) {
    const skillStats = {};

    // Collect scores per skill/topic across attempts
    attempts.forEach((att) => {
      const questions = att.questions || [];
      questions.forEach((q) => {
        const skill = q.targetSkill || q.sourceKeyword || 'General Technical';
        const score = q.evaluation?.technicalScore ? q.evaluation.technicalScore * 10 : 70;

        if (!skillStats[skill]) {
          skillStats[skill] = [];
        }
        skillStats[skill].push(score);
      });
    });

    const uncertainList = [];

    // Evaluate confidence for skills
    Object.entries(skillStats).forEach(([skill, scores]) => {
      const count = scores.length;
      const mean = scores.reduce((a, b) => a + b, 0) / count;
      
      // Variance calculation
      const variance = count > 1 ? scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count : 15;
      const stdDev = Math.sqrt(variance);

      // Confidence score Formula: f(count, stdDev)
      const confidence = Math.min(100, Math.max(10, Math.round(count * 30 - stdDev * 2)));

      if (count < 2 || confidence < 55) {
        uncertainList.push({
          competency: skill,
          numberOfQuestions: count,
          meanScore: Math.round(mean),
          confidenceScore: confidence,
          state: 'uncertain',
          reason: count < 2 ? 'Insufficient question evidence count (< 2 questions)' : 'High score variance across attempts'
        });
      }
    });

    // Also add JD skills that have zero question evidence
    jobSkills.forEach((jSkill) => {
      if (typeof jSkill === 'string' && !skillStats[jSkill]) {
        uncertainList.push({
          competency: jSkill,
          numberOfQuestions: 0,
          meanScore: 0,
          confidenceScore: 0,
          state: 'uncertain',
          reason: 'JD-required skill not yet tested in previous attempts'
        });
      }
    });

    return uncertainList;
  }

  /**
   * Generates a structured Adaptive Interview Blueprint based on candidate history.
   */
  static async createAdaptiveBlueprint({ workspaceId, candidateId, jobDetails = {}, configuration = {} }) {
    const context = await AdaptiveInterviewEngine.buildAdaptiveContext({ workspaceId, candidateId });
    const { attempts, activities, previousQuestionCoverage } = context;

    // If no previous completed attempts exist, return static non-adaptive blueprint
    if (attempts.length === 0) {
      return {
        isAdaptive: false,
        sourceAttemptIds: [],
        previousAttemptCount: 0,
        targetDifficulty: configuration.difficulty || 'Medium',
        goals: [],
        previousQuestionCoverage: []
      };
    }

    const latestAttempt = attempts[attempts.length - 1];
    const latestScore = latestAttempt.evaluation?.overallScore ?? latestAttempt.overallEvaluation?.overallInterviewScore ?? 75;

    // Determine adaptive difficulty escalation / adjustment
    let targetDifficulty = configuration.difficulty || 'Medium';
    if (latestScore >= 85) {
      targetDifficulty = targetDifficulty === 'Easy' ? 'Medium' : 'Hard';
    } else if (latestScore < 55) {
      targetDifficulty = targetDifficulty === 'Hard' ? 'Medium' : 'Easy';
    }

    const jobSkills = [
      ...(jobDetails.requiredSkills || []),
      ...(jobDetails.preferredSkills || [])
    ];

    const weaknesses = AdaptiveInterviewEngine.calculateWeaknessPriorities(attempts, activities);
    const uncertainties = AdaptiveInterviewEngine.calculateUncertainCompetencies(attempts, jobSkills);

    const totalTarget = configuration.questionCount || 10;
    const goals = [];

    // Goal 1: Re-assess completed activities to verify improvement transfer
    weaknesses.forEach((w) => {
      if (w.hasCompletedActivity && goals.length < totalTarget) {
        goals.push({
          competency: w.section,
          topic: `${w.section} Transfer Verification`,
          objective: `Verify whether candidate improved ${w.section} following completed practice activity`,
          priority: 'CRITICAL',
          questionType: w.section === 'mcq' ? 'mcq' : w.section === 'voice' ? 'voice' : 'text',
          adaptiveReason: `Completed practice activity for ${w.section} (previous score: ${w.score}/100)`
        });
      }
    });

    // Goal 2: Target un-remedied high priority weaknesses
    weaknesses.forEach((w) => {
      if (!w.hasCompletedActivity && goals.length < totalTarget) {
        goals.push({
          competency: w.section,
          topic: `${w.section} Remediation Scenario`,
          objective: `Target persistent weakness in ${w.section}`,
          priority: w.priority,
          questionType: w.section === 'mcq' ? 'mcq' : w.section === 'voice' ? 'voice' : 'text',
          adaptiveReason: `Persistent weakness detected across ${w.recurrenceCount} attempt(s) (score: ${w.score}/100)`
        });
      }
    });

    // Goal 3: Reduce uncertainty for low-confidence competencies
    uncertainties.forEach((u) => {
      if (goals.length < totalTarget) {
        goals.push({
          competency: u.competency,
          topic: `${u.competency} Evidence Collection`,
          objective: `Gather evidence to resolve competency uncertainty for ${u.competency}`,
          priority: 'MEDIUM',
          questionType: 'voice',
          adaptiveReason: `Uncertain competency (${u.reason})`
        });
      }
    });

    return {
      isAdaptive: true,
      sourceAttemptIds: attempts.map((a) => a._id),
      previousAttemptCount: attempts.length,
      targetDifficulty,
      goals,
      targetWeaknesses: weaknesses,
      targetUncertainties: uncertainties,
      activityInterventions: activities.map((a) => ({ id: a._id, title: a.title, status: a.status })),
      previousQuestionCoverage,
      generatedAt: new Date()
    };
  }

  /**
   * Compares adaptive attempt results against previous attempt evidence and updates Competency Profile & Activities.
   */
  static async compareAndVerifyReassessment({ previousAttempt, currentAttempt, candidateId, workspaceId }) {
    if (!previousAttempt || !currentAttempt) return null;

    const prevEval = previousAttempt.evaluation || previousAttempt.overallEvaluation || {};
    const currEval = currentAttempt.evaluation || currentAttempt.overallEvaluation || {};

    const prevScore = prevEval.overallScore ?? prevEval.overallInterviewScore ?? 70;
    const currScore = currEval.overallScore ?? currEval.overallInterviewScore ?? 70;
    const overallDelta = currScore - prevScore;

    const sectionDeltas = {};
    const sectionKeys = ['technical', 'communication', 'problemSolving', 'behavioural', 'voice', 'mcq'];

    sectionKeys.forEach((key) => {
      const pSec = prevEval[`${key}Score`] ?? prevEval.technicalScore ?? 70;
      const cSec = currEval[`${key}Score`] ?? currEval.technicalScore ?? 70;
      const delta = cSec - pSec;
      const isVerified = delta >= 8 && cSec >= 70;

      sectionDeltas[key] = {
        previousScore: pSec,
        currentScore: cSec,
        delta,
        improvementVerified: isVerified,
        status: delta >= 8 ? 'IMPROVED' : delta <= -8 ? 'REGRESSED' : 'STABLE'
      };
    });

    // Verify completed activities
    const activities = await ImprovementActivity.find({
      userId: candidateId,
      sourceInterviewId: previousAttempt._id,
      status: 'COMPLETED'
    });

    const verifiedActivities = [];
    for (const act of activities) {
      const catKey = act.category || 'technical';
      const secMeta = sectionDeltas[catKey] || { delta: overallDelta, currentScore: currScore };

      if (secMeta.delta >= 6 && secMeta.currentScore >= 68) {
        act.improvementVerified = true;
        act.verifiedAttemptId = currentAttempt._id;
        act.verifiedAt = new Date();
        await act.save();

        verifiedActivities.push({
          activityId: act._id,
          title: act.title,
          category: act.category,
          delta: secMeta.delta,
          verified: true
        });
      }
    }

    // Update candidate's persistent CompetencyProfile
    for (const [key, meta] of Object.entries(sectionDeltas)) {
      try {
        const state = meta.currentScore >= 80 ? 'strong' : meta.currentScore >= 70 ? 'competent' : meta.delta >= 8 ? 'improving' : 'weak';
        const trend = meta.delta > 3 ? 'improving' : meta.delta < -3 ? 'declining' : 'stable';

        await CompetencyProfile.findOneAndUpdate(
          { candidateId, workspaceId, competency: key },
          {
            $set: {
              currentScore: meta.currentScore,
              confidenceScore: Math.min(100, (previousAttempt ? 70 : 40) + meta.currentScore * 0.3),
              state,
              trend,
              lastEvaluatedAt: new Date(),
              lastAttemptId: currentAttempt._id
            },
            $inc: { evidenceCount: 1 },
            $push: {
              history: {
                attemptId: currentAttempt._id,
                score: meta.currentScore,
                confidence: 80,
                evaluatedAt: new Date()
              }
            }
          },
          { upsert: true, new: true }
        );
      } catch (cErr) {
        console.warn(`[AdaptiveEngine] Failed to update CompetencyProfile for ${key}:`, cErr);
      }
    }

    return {
      previousAttemptId: previousAttempt._id,
      currentAttemptId: currentAttempt._id,
      overallDelta,
      sectionDeltas,
      verifiedActivities
    };
  }
}

module.exports = AdaptiveInterviewEngine;
