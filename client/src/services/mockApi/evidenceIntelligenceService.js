import { mockResumeRecords, mockInterviewRecords, mockAnalysisRecords, mockExternalFeedbackRecords } from '../../data/mockEvidenceData';

let resumeStore = [...mockResumeRecords];
let interviewStore = [...mockInterviewRecords];
let analysisStore = [...mockAnalysisRecords];
let externalFeedbackStore = [...(mockExternalFeedbackRecords || [])];

export const VALIDATION_STATES = {
  SUPPORTED: { id: 'SUPPORTED', label: 'Supported', color: 'emerald', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  PARTIALLY_SUPPORTED: { id: 'PARTIALLY_SUPPORTED', label: 'Partially Supported', color: 'amber', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  UNSUPPORTED: { id: 'UNSUPPORTED', label: 'Unsupported Claim', color: 'rose', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' },
  NOT_TESTED: { id: 'NOT_TESTED', label: 'Not Tested', color: 'slate', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' },
  CONTRADICTED: { id: 'CONTRADICTED', label: 'Contradicted', color: 'purple', badgeClass: 'bg-purple-50 text-purple-800 border-purple-200' }
};

export const evidenceIntelligenceService = {
  // Get all resume version records for candidate
  getResumeRecords: async (candidateId = 'cand_1') => {
    await new Promise((r) => setTimeout(r, 120));
    return resumeStore.filter((r) => r.candidateId === candidateId || true);
  },

  // Get specific resume snapshot by ID
  getResumeSnapshotById: async (snapshotId) => {
    await new Promise((r) => setTimeout(r, 80));
    return resumeStore.find((r) => r.id === snapshotId) || resumeStore[0];
  },

  // Get active / latest resume version
  getLatestResumeRecord: async (candidateId = 'cand_1') => {
    await new Promise((r) => setTimeout(r, 100));
    const list = resumeStore.filter((r) => r.candidateId === candidateId || true);
    return list[list.length - 1] || list[0];
  },

  // Create a new versioned resume record (e.g. when updating resume or profile)
  createResumeVersion: async (candidateId, newSkillsData, sourceName = 'Manual Profile Update') => {
    await new Promise((r) => setTimeout(r, 200));
    const count = resumeStore.length + 1;
    const newRecord = {
      id: `RES-00${count}`,
      candidateId,
      version: `v${count}`,
      createdAt: new Date().toISOString(),
      sourceName,
      headline: 'Senior Full Stack & AI Architect',
      claimedSkills: newSkillsData
    };
    resumeStore.push(newRecord);
    return newRecord;
  },

  // Get all interview records for candidate (optionally filtered by type: 'MOCK' or 'FINAL')
  getInterviewRecords: async (candidateId = 'cand_1', typeFilter = null) => {
    await new Promise((r) => setTimeout(r, 150));
    let list = [...interviewStore];
    try {
      const { storageMockInterviews } = await import('../storage/storageService');
      const localMocks = storageMockInterviews.getAll().filter(m => m.status === 'Completed' || m.state === 'Completed' || m.status === 'completed');
      localMocks.forEach(m => {
        const mId = m.attemptId || m.id || m.sessionId;
        if (!list.some(existing => existing.id === mId)) {
          list.unshift({
            id: mId,
            attemptId: mId,
            candidateId: m.candidateId || 'cand_1',
            type: 'MOCK',
            title: m.title || `Mock Interview — ${m.targetJobTitle || m.jobTitle}`,
            targetRole: m.targetJobTitle || m.jobTitle,
            jobTitle: m.targetJobTitle || m.jobTitle,
            company: m.company || 'CandidateIQ Enterprise',
            difficulty: m.difficulty || 'Medium',
            overallScore: m.overallScore || 85,
            completedDate: m.finishedAt ? m.finishedAt.split('T')[0] : (m.completedAt ? m.completedAt.split('T')[0] : '2026-09-10'),
            scores: m.scores || {
              technical: 88,
              relevance: 89,
              depth: 82,
              problemSolving: 85,
              communication: 84,
              behaviouralEvidence: 86
            },
            questions: (m.questions || []).map((q, idx) => {
              const ans = (m.answers || []).find(a => a.questionId === q.questionId);
              return {
                questionId: q.questionId || `q_${idx + 1}`,
                category: q.questionType || q.category || 'Technical',
                targetSkill: q.targetSkill || 'Technical Skills',
                questionText: q.questionText || q.question,
                candidateResponse: ans ? (ans.textAnswer || ans.voiceTranscript || ans.selectedOption) : 'No answer submitted',
                detectedConcepts: ['Job Requirements', 'Technical Reasoning', 'STAR Framework'],
                observedLevel: ans ? 'Strong' : 'Needs Work',
                evidenceStrength: ans ? 'Strong' : 'None',
                reasoning: 'Candidate response evaluated strictly against target Job Description requirements and STAR criteria.'
              };
            })
          });
        }
      });
    } catch (e) {
      console.error('Error loading local mock attempts in evidenceIntelligenceService:', e);
    }

    if (typeFilter) {
      list = list.filter((i) => i.type === typeFilter);
    }
    return list;
  },

  // Get specific interview record by ID
  getInterviewRecordById: async (interviewId) => {
    await new Promise((r) => setTimeout(r, 100));
    const allRecords = await evidenceIntelligenceService.getInterviewRecords('cand_1', null);
    const found = allRecords.find((i) => i.id === interviewId || i.attemptId === interviewId || i.sessionId === interviewId);
    if (found) return found;
    return allRecords[0] || interviewStore[0];
  },

  // Compare any two interviews (Mock vs Mock, or Final vs Final) section by section
  compareInterviews: async (interviewId1, interviewId2) => {
    await new Promise((r) => setTimeout(r, 200));
    const int1 = interviewStore.find((i) => i.id === interviewId1) || interviewStore[0];
    const int2 = interviewStore.find((i) => i.id === interviewId2) || interviewStore[1] || interviewStore[0];

    const resume1 = resumeStore.find((r) => r.id === int1.resumeSnapshotId) || resumeStore[0];
    const resume2 = resumeStore.find((r) => r.id === int2.resumeSnapshotId) || resumeStore[0];
    const usedDifferentResumes = int1.resumeSnapshotId !== int2.resumeSnapshotId;
    const scoreDiff = (int2.overallScore || 0) - (int1.overallScore || 0);

    // Filter questions per section concept
    const getQuestionsByCategory = (inv, catKeywords) => {
      return (inv.questions || []).filter((q) =>
        catKeywords.some((k) =>
          (q.category || '').toLowerCase().includes(k) ||
          (q.targetSkill || '').toLowerCase().includes(k) ||
          (q.question || '').toLowerCase().includes(k)
        )
      );
    };

    // 8 Core Comparison Sections
    const sectionDefinitions = [
      {
        key: 'technical',
        title: 'Technical Knowledge',
        catKeywords: ['technical', 'react', 'node', 'mongodb', 'system', 'api'],
        int1Score: Math.round(int1.overallScore * 0.95),
        int2Score: Math.round(int2.overallScore * 1.02),
        int1Feedback: 'Technical explanations were accurate but concise, covering core principles without deep architectural trade-offs.',
        int2Feedback: 'Explanations showed improved architectural depth, detailing code-splitting, index plans, and error boundaries.',
        int1Obs: 'Solid foundational React/Node answers.',
        int2Obs: 'Added concrete production metrics (1.2s to 45ms).',
        decisionState: scoreDiff >= 6 ? 'SIGNIFICANT_IMPROVEMENT' : scoreDiff >= 0 ? 'IMPROVED' : 'CONSISTENT',
        comparisonFeedback: 'Your second interview demonstrated stronger technical depth and clearer reasoning, especially around database indexing and state architecture. Continue refining concise architectural justifications.'
      },
      {
        key: 'problemSolving',
        title: 'Problem Solving & Debugging',
        catKeywords: ['problem', 'solving', 'debugging', 'outage', 'latency', 'heap'],
        int1Score: Math.round(int1.overallScore * 0.9),
        int2Score: Math.round(int2.overallScore * 1.04),
        int1Feedback: 'Identified database query latency using explain plans, though memory leak debugging steps were brief.',
        int2Feedback: 'Presented structured root-cause analysis, highlighting heap allocation snapshots and compound index creation.',
        int1Obs: 'Direct troubleshooting method.',
        int2Obs: 'Structured step-by-step empirical methodology.',
        decisionState: 'IMPROVED',
        comparisonFeedback: 'Your troubleshooting approach became noticeably more structured in the second interview. You clearly explained root-cause isolation before proposing the solution.'
      },
      {
        key: 'projects',
        title: 'Projects & Practical Experience',
        catKeywords: ['project', 'e-commerce', 'recruitment', 'architecture', 'application'],
        int1Score: Math.round(int1.overallScore * 0.92),
        int2Score: Math.round(int2.overallScore * 1.03),
        int1Feedback: 'Described project technologies accurately, focusing primarily on what tools were used in the stack.',
        int2Feedback: 'Articulated why specific tech choices were selected and explained how custom hooks and streaming API endpoints functioned.',
        int1Obs: 'Stack overview presented well.',
        int2Obs: 'Stronger justification for technical choices.',
        decisionState: 'IMPROVED',
        comparisonFeedback: 'You communicated project ownership much better in the second round by explaining why you chose Node.js streams and custom hooks over basic buffering.'
      },
      {
        key: 'communication',
        title: 'Communication & Structuring',
        catKeywords: ['communication', 'behavioural', 'rfcs', 'mentorship', 'leadership'],
        int1Score: Math.round(int1.overallScore * 0.96),
        int2Score: Math.round(int2.overallScore * 1.01),
        int1Feedback: 'Maintained clear, professional articulation with good STAR framework alignment on RFC authoring.',
        int2Feedback: 'Delivered highly structured answers with excellent pacing, clear technical terminology, and confidence.',
        int1Obs: 'Clear and easy to follow.',
        int2Obs: 'Highly articulate with zero filler.',
        decisionState: 'CONSISTENT',
        comparisonFeedback: 'Communication remained consistently strong across both interviews. Your pacing and STAR response structure were articulate and easy for interviewers to follow.'
      },
      {
        key: 'behavioral',
        title: 'Behavioral & Leadership Responses',
        catKeywords: ['behavioural', 'leadership', 'team', 'disagreement', 'rfc', 'pair'],
        int1Score: Math.round(int1.overallScore * 0.98),
        int2Score: Math.round(int2.overallScore * 0.96),
        int1Feedback: 'Highlighted hands-on junior mentorship, pair programming, and blameless post-mortems after production incidents.',
        int2Feedback: 'Covered team collaboration well, though focused slightly more on technical tasks than interpersonal alignment.',
        int1Obs: 'Empathetic leadership evidence.',
        int2Obs: 'Strong technical focus.',
        decisionState: 'SLIGHT_IMPROVEMENT',
        comparisonFeedback: 'Both interviews showed solid team leadership. In upcoming rounds, maintain the strong empathetic mentorship examples you highlighted in your first interview.'
      },
      {
        key: 'roleSpecific',
        title: 'Role-Specific Domain Knowledge',
        catKeywords: ['role', 'mern', 'full stack', 'gemini', 'docker', 'cloud'],
        int1Score: Math.round(int1.overallScore * 0.91),
        int2Score: Math.round(int2.overallScore * 1.05),
        int1Feedback: 'Demonstrated solid grasp of core Full Stack REST endpoints and React hook lifecycles.',
        int2Feedback: 'Expanded into modern Generative AI SDK schema validation (Gemini API) and multi-stage Docker microservices.',
        int1Obs: 'Core Full Stack readiness.',
        int2Obs: 'Advanced AI & microservice domain fit.',
        decisionState: 'SIGNIFICANT_IMPROVEMENT',
        comparisonFeedback: 'Your second interview demonstrated broader role-specific domain coverage, including Generative AI SDK prompt schemas and containerized deployment workflows.'
      },
      {
        key: 'confidence',
        title: 'Confidence & Technical Clarity',
        catKeywords: ['confidence', 'clarity', 'depth', 'architecture'],
        int1Score: Math.round(int1.overallScore * 0.94),
        int2Score: Math.round(int2.overallScore * 1.02),
        int1Feedback: 'Answered questions confidently, though paused briefly on high-concurrency event loop edge cases.',
        int2Feedback: 'Spoke with high technical authority when walking through query latency drops from 1.2s down to 45ms.',
        int1Obs: 'Good baseline confidence.',
        int2Obs: 'High technical authority.',
        decisionState: 'IMPROVED',
        comparisonFeedback: 'You sounded noticeably more confident in your second interview when delivering concrete execution metrics. Quantitative data significantly reinforced your technical authority.'
      },
      {
        key: 'resumeAlignment',
        title: 'Resume & Profile Alignment',
        catKeywords: ['resume', 'claim', 'profile', 'alignment', 'experience'],
        int1Score: Math.round(int1.overallScore * 0.95),
        int2Score: Math.round(int2.overallScore * 1.03),
        int1Feedback: 'Supported React and REST API claims well; MongoDB aggregation claims were partially demonstrated.',
        int2Feedback: 'Strongly validated React hooks, Express streams, and MongoDB compound index claims listed on your profile.',
        int1Obs: '76% profile evidence match.',
        int2Obs: '88% profile evidence match.',
        decisionState: 'SIGNIFICANT_IMPROVEMENT',
        comparisonFeedback: 'Your second interview communicated the experience listed in your profile much more effectively, turning partial claims into fully supported interview evidence.'
      }
    ];

    const sections = sectionDefinitions.map((sec) => {
      const qA = getQuestionsByCategory(int1, sec.catKeywords);
      const qB = getQuestionsByCategory(int2, sec.catKeywords);
      return {
        key: sec.key,
        title: sec.title,
        decisionState: sec.decisionState,
        comparisonFeedback: sec.comparisonFeedback,
        interviewA: {
          score: Math.min(100, sec.int1Score),
          feedback: sec.int1Feedback,
          observations: sec.int1Obs,
          questions: qA.length > 0 ? qA : int1.questions?.slice(0, 2) || []
        },
        interviewB: {
          score: Math.min(100, sec.int2Score),
          feedback: sec.int2Feedback,
          observations: sec.int2Obs,
          questions: qB.length > 0 ? qB : int2.questions?.slice(0, 2) || []
        }
      };
    });

    const strongerInt = (int2.overallScore || 0) >= (int1.overallScore || 0) ? int2 : int1;
    const overallSummary = (int2.overallScore || 0) >= (int1.overallScore || 0)
      ? `${int2.title} demonstrated clear overall progress in technical reasoning, project explanation, and database tuning. Next, focus on sharpening high-throughput system design explanations.`
      : `${int1.title} showed stronger technical depth in architecture questions. Review system scaling trade-offs before your next interview session.`;

    return {
      int1,
      int2,
      resume1,
      resume2,
      usedDifferentResumes,
      scoreDiff,
      sections,
      overallDecision: {
        strongerTitle: strongerInt.title,
        strongerScore: strongerInt.overallScore,
        summary: overallSummary
      }
    };
  },

  // Get progression analysis between practice rounds and final interviews
  getProgressionAnalysis: async (id1, id2) => {
    await new Promise((r) => setTimeout(r, 120));
    return {
      progressionData: [
        { skillName: 'React State Architecture', mockEvidenceState: 'PARTIALLY_SUPPORTED', finalEvidenceState: 'SUPPORTED', trajectory: '🚀 Improved (+25%)' },
        { skillName: 'Node.js Express & Event Loop', mockEvidenceState: 'PARTIALLY_SUPPORTED', finalEvidenceState: 'SUPPORTED', trajectory: '🚀 Improved (+20%)' },
        { skillName: 'System Architecture & Scaling', mockEvidenceState: 'UNSUPPORTED', finalEvidenceState: 'PARTIALLY_SUPPORTED', trajectory: '↗ Slight Progress (+15%)' },
        { skillName: 'MongoDB Aggregations & Indexing', mockEvidenceState: 'PARTIALLY_SUPPORTED', finalEvidenceState: 'SUPPORTED', trajectory: '🚀 Improved (+30%)' }
      ]
    };
  },

  // Upload External Feedback file for an interview
  uploadExternalFeedback: async ({ candidateId = 'cand_1', interviewId, file }) => {
    await new Promise((r) => setTimeout(r, 400));
    const targetInterview = interviewStore.find((i) => i.id === interviewId) || interviewStore[0];

    const newFeedbackRecord = {
      id: `EXT-FB-00${externalFeedbackStore.length + 1}`,
      candidateId,
      relatedInterviewId: targetInterview.id,
      fileName: file ? file.name : 'Uploaded_Feedback_Report.pdf',
      fileSize: file ? `${Math.round(file.size / 1024)} KB` : '350 KB',
      uploadedAt: new Date().toISOString(),
      interviewerName: targetInterview.interviewerName || 'External Hiring Committee',
      company: targetInterview.company || 'Target Employer',
      overallImpression: 'Interviewer feedback successfully extracted and analyzed.',
      extractedStrengths: [
        'Clear demonstration of practical frontend and API engineering experience.',
        'Structured, articulate communication when explaining technical projects.'
      ],
      extractedImprovementAreas: [
        'Consider elaborating further on high-concurrency microservice scaling strategies.'
      ],
      comparisonSummary: `Both CandidateIQ AI Analysis and ${targetInterview.company || 'the interviewer'} recognized strong core technical competency. Focus next on system architecture depth.`
    };

    externalFeedbackStore.unshift(newFeedbackRecord);
    return newFeedbackRecord;
  },

  // Get external feedback for a specific interview
  getExternalFeedbackForInterview: async (interviewId) => {
    await new Promise((r) => setTimeout(r, 100));
    return externalFeedbackStore.find((f) => f.relatedInterviewId === interviewId) || null;
  },

  // Get analysis records for an interview
  getAnalysisRecords: async (interviewId) => {
    await new Promise((r) => setTimeout(r, 120));
    return analysisStore.filter((a) => a.interviewId === interviewId);
  },

  // Calculate Claim-Evidence Matrix between a Resume Record and Interview Record(s)
  calculateClaimEvidenceMatrix: (resumeRecord, interviewRecords = []) => {
    if (!resumeRecord || !resumeRecord.claimedSkills) {
      return [];
    }

    const allQuestions = interviewRecords.flatMap((inv) =>
      (inv.questions || []).map((q) => ({ ...q, interviewId: inv.id, interviewTitle: inv.title, interviewType: inv.type }))
    );

    return resumeRecord.claimedSkills.map((claim) => {
      const matchingQ = allQuestions.filter(
        (q) =>
          (q.targetSkill && claim.name.toLowerCase().includes(q.targetSkill.toLowerCase())) ||
          (q.targetSkill && q.targetSkill.toLowerCase().includes(claim.name.toLowerCase()))
      );

      if (matchingQ.length === 0) {
        return {
          skillName: claim.name,
          resumeClaim: `${claim.level} (${claim.claimedExperience || 'Experience'}) - ${claim.claimText || ''}`,
          observedEvidence: 'No relevant interview evidence collected yet.',
          validationState: 'NOT_TESTED',
          confidenceScore: 0,
          evidenceSource: 'Not Tested in Available Interviews',
          questionId: null,
          matchingQuestions: []
        };
      }

      const strongMatch = matchingQ.find((q) => q.evidenceStrength === 'Strong' || q.observedLevel === 'Strong' || q.evaluationState === 'WELL_EXPLAINED');
      const modMatch = matchingQ.find((q) => q.evidenceStrength === 'Moderate' || q.observedLevel === 'Moderate' || q.evaluationState === 'COULD_BE_STRONGER');
      const weakMatch = matchingQ.find((q) => q.evidenceStrength === 'Weak' || q.observedLevel === 'Weak' || q.evaluationState === 'NEEDS_DETAIL');

      let valState = 'PARTIALLY_SUPPORTED';
      let confScore = 65;
      let primaryQ = matchingQ[0];

      if (strongMatch) {
        valState = 'SUPPORTED';
        confScore = 92;
        primaryQ = strongMatch;
      } else if (weakMatch && !modMatch) {
        valState = 'UNSUPPORTED';
        confScore = 38;
        primaryQ = weakMatch;
      }

      return {
        skillName: claim.name,
        resumeClaim: `${claim.level} (${claim.claimedExperience || 'Experience'}) - ${claim.claimText || ''}`,
        observedEvidence: `${primaryQ.observedLevel || 'Observed'} - ${primaryQ.aiFeedback || primaryQ.candidateAnswer || 'Demonstrated performance'}`,
        validationState: valState,
        confidenceScore: confScore,
        evidenceSource: `${primaryQ.interviewTitle || 'Interview'} (${primaryQ.questionId})`,
        questionId: primaryQ.questionId,
        matchingQuestions: matchingQ
      };
    });
  },

  // Re-Analyze an existing historical interview against a target Resume Version
  reanalyzeInterview: async (interviewId, targetResumeId) => {
    await new Promise((r) => setTimeout(r, 400));
    const interview = interviewStore.find((i) => i.id === interviewId);
    const resume = resumeStore.find((r) => r.id === targetResumeId) || resumeStore[resumeStore.length - 1];

    if (!interview || !resume) {
      throw new Error('Interview or Resume record not found');
    }

    const calculatedMatrix = evidenceIntelligenceService.calculateClaimEvidenceMatrix(resume, [interview]);

    const testedCount = calculatedMatrix.filter((c) => c.validationState !== 'NOT_TESTED').length;
    const totalClaims = calculatedMatrix.length;
    const supportedCount = calculatedMatrix.filter((c) => c.validationState === 'SUPPORTED').length;
    const alignmentPercent = Math.round((supportedCount / Math.max(1, totalClaims)) * 100);

    const newAnalysisRecord = {
      id: `ANA-${Date.now()}`,
      interviewId: interview.id,
      resumeVersionId: resume.id,
      analysisVersion: `Re-analysis (${resume.version})`,
      createdAt: new Date().toISOString(),
      evidenceCoverage: `${Math.round((testedCount / Math.max(1, totalClaims)) * 100)}% (${testedCount} of ${totalClaims} claims tested)`,
      riskLevel: testedCount < totalClaims ? 'High Profile Risk' : 'Low Risk',
      overallAlignment: `${alignmentPercent}% Profile-to-Evidence Match`,
      claimEvidenceMatrix: calculatedMatrix
    };

    analysisStore.unshift(newAnalysisRecord);
    return newAnalysisRecord;
  },

  // Submit new completed interview record
  submitNewInterviewRecord: async (interviewPayload) => {
    await new Promise((r) => setTimeout(r, 300));

    const latestResume = resumeStore[resumeStore.length - 1];
    const newInterviewId = `INT-00${interviewStore.length + 1}`;

    const newInterview = {
      id: newInterviewId,
      candidateId: interviewPayload.candidateId || 'cand_1',
      type: interviewPayload.type || 'MOCK',
      title: interviewPayload.title || `Mock Interview #${interviewStore.length + 1} — Targeted`,
      targetRole: interviewPayload.targetRole || 'Senior Full Stack Developer',
      date: new Date().toISOString().split('T')[0],
      resumeSnapshotId: latestResume.id,
      resumeVersionLabel: `Resume ${latestResume.version}`,
      overallScore: interviewPayload.overallScore || 86,
      questions: interviewPayload.questions || []
    };

    interviewStore.unshift(newInterview);

    const matrix = evidenceIntelligenceService.calculateClaimEvidenceMatrix(latestResume, [newInterview]);
    const testedCount = matrix.filter((c) => c.validationState !== 'NOT_TESTED').length;
    const totalClaims = matrix.length;
    const supportedCount = matrix.filter((c) => c.validationState === 'SUPPORTED').length;
    const alignmentPercent = Math.round((supportedCount / Math.max(1, totalClaims)) * 100);

    const newAnalysis = {
      id: `ANA-${Date.now()}`,
      interviewId: newInterview.id,
      resumeVersionId: latestResume.id,
      analysisVersion: `Analysis (${latestResume.version})`,
      createdAt: new Date().toISOString(),
      evidenceCoverage: `${Math.round((testedCount / Math.max(1, totalClaims)) * 100)}% (${testedCount} of ${totalClaims} claims tested)`,
      riskLevel: testedCount < totalClaims ? 'Moderate Risk' : 'Low Risk',
      overallAlignment: `${alignmentPercent}% Profile-to-Evidence Match`,
      claimEvidenceMatrix: matrix
    };

    analysisStore.unshift(newAnalysis);

    return { interview: newInterview, analysis: newAnalysis };
  }
};

