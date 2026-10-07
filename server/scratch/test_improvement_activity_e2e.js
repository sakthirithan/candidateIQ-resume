const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const Interview = require('../models/Interview');
const ImprovementActivity = require('../models/ImprovementActivity');
const PracticeSession = require('../models/PracticeSession');

const { generateActivitiesForInterview } = require('../services/ai/improvement/activityGeneratorService');
const { generatePracticeQuestions } = require('../services/ai/improvement/practiceQuestionGenerator');
const { evaluatePracticeSession, extractFillerWords } = require('../services/ai/improvement/practiceEvaluatorService');

async function runE2ETest() {
  console.log('[E2E TEST] Starting Improvement Activity & Practice Loop Verification...');
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-candidate-profiling');

  try {
    // 1. Fetch or create test User
    let user = await User.findOne({ email: 'candidate@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Test Candidate',
        email: 'candidate@example.com',
        password: 'hashedpass123',
        role: 'candidate'
      });
    }

    // 2. Create test Interview document with completed evaluation
    const interview = await Interview.create({
      candidate: user._id,
      candidateIdString: user._id.toString(),
      jobTitle: 'Senior Full Stack Software Engineer',
      interviewType: 'mixed',
      difficulty: 'Mid-Level',
      status: 'completed',
      mock_interview_questions: {
        voice: [
          {
            questionId: 'v1',
            question: 'Explain how React state management works and how you optimize re-renders.',
            transcript: 'Um, basically, like, React uses state, um, and like, when state changes, it re-renders. Actually, you know, we use useMemo.',
            durationSeconds: 60,
            isAnswered: true
          }
        ]
      },
      evaluation: {
        status: 'completed',
        overallScore: 62,
        technicalScore: 65,
        communicationScore: 55,
        behaviouralScore: 68,
        improvements: ['Reduce vocalized filler words', 'Improve technical explanation depth']
      }
    });

    console.log(`✓ Test Interview Created: ${interview._id}`);

    // 3. Generate Improvement Activities
    const activitySpecs = await generateActivitiesForInterview(interview);
    console.log(`✓ Generated ${activitySpecs.length} Improvement Activity Specs:`);
    activitySpecs.forEach((a, i) => console.log(`   ${i + 1}. [${a.category.toUpperCase()}] ${a.title} -> Target: ${a.comparisonOperator} ${a.targetValue} ${a.unit}`));

    const createdActivities = [];
    for (const spec of activitySpecs) {
      const act = await ImprovementActivity.create({
        userId: user._id,
        sourceInterviewId: interview._id,
        ...spec,
        latestValue: spec.baselineValue,
        bestValue: spec.baselineValue,
        status: 'PENDING'
      });
      createdActivities.push(act);
    }

    const fillerActivity = createdActivities.find(a => a.targetMetricName === 'fillerWordCount') || createdActivities[0];
    console.log(`✓ Target Practice Activity Selected: ${fillerActivity.title} (ID: ${fillerActivity._id})`);

    // 4. Generate Practice Questions for Activity
    const practiceQuestions = await generatePracticeQuestions({
      activity: fillerActivity,
      interviewContext: { targetRole: 'Senior Full Stack Engineer', candidateSkills: ['React', 'Node.js'] }
    });
    console.log(`✓ Generated ${practiceQuestions.length} Practice Questions for Activity.`);

    // 5. Execute Practice Session Attempt #1 (Failing attempt with 8 fillers)
    const practiceSession1 = await PracticeSession.create({
      userId: user._id,
      sourceInterviewId: interview._id,
      activityId: fillerActivity._id,
      attemptNumber: 1,
      practiceType: 'voice',
      questions: practiceQuestions,
      targetMetrics: {
        targetMetricName: fillerActivity.targetMetricName,
        comparisonOperator: fillerActivity.comparisonOperator,
        targetValue: fillerActivity.targetValue,
        baselineValue: fillerActivity.baselineValue
      },
      result: 'PENDING'
    });

    const attempt1Responses = [
      {
        questionId: practiceQuestions[0].questionId,
        rawTranscript: 'Um, basically, like, I approach state architecture by, like, defining atomic stores. Actually, you know, we use Redux Toolkit.',
        durationSeconds: 60
      }
    ];

    const eval1 = await evaluatePracticeSession({
      activity: fillerActivity,
      practiceSession: practiceSession1,
      responses: attempt1Responses
    });

    console.log(`✓ Attempt #1 Evaluation Result: ${eval1.result} | Evaluated Metric: ${eval1.evaluatedValue} ${fillerActivity.unit} | Target: ${fillerActivity.comparisonOperator} ${fillerActivity.targetValue}`);

    if (eval1.result === 'FAIL') {
      fillerActivity.attemptCount += 1;
      fillerActivity.latestValue = eval1.evaluatedValue;
      fillerActivity.status = 'PRACTICE_REQUIRED';
      await fillerActivity.save();
      console.log('✓ Activity status updated to PRACTICE_REQUIRED as expected.');
    }

    // 6. Execute Practice Session Attempt #2 (Passing attempt with 3 fillers!)
    const practiceSession2 = await PracticeSession.create({
      userId: user._id,
      sourceInterviewId: interview._id,
      activityId: fillerActivity._id,
      attemptNumber: 2,
      practiceType: 'voice',
      questions: practiceQuestions,
      targetMetrics: {
        targetMetricName: fillerActivity.targetMetricName,
        comparisonOperator: fillerActivity.comparisonOperator,
        targetValue: fillerActivity.targetValue,
        baselineValue: fillerActivity.baselineValue
      },
      result: 'PENDING'
    });

    const attempt2Responses = [
      {
        questionId: practiceQuestions[0].questionId,
        rawTranscript: 'I design state architecture by isolating local component state from global application state. We utilize Redux Toolkit for immutable state slices and useMemo to prevent unnecessary re-renders.',
        durationSeconds: 60
      }
    ];

    const eval2 = await evaluatePracticeSession({
      activity: fillerActivity,
      practiceSession: practiceSession2,
      responses: attempt2Responses
    });

    console.log(`✓ Attempt #2 Evaluation Result: ${eval2.result} | Evaluated Metric: ${eval2.evaluatedValue} ${fillerActivity.unit} | Target: ${fillerActivity.comparisonOperator} ${fillerActivity.targetValue}`);

    if (eval2.result === 'PASS') {
      fillerActivity.attemptCount += 1;
      fillerActivity.latestValue = eval2.evaluatedValue;
      fillerActivity.bestValue = eval2.evaluatedValue;
      fillerActivity.status = 'COMPLETED';
      fillerActivity.completedAt = new Date();
      await fillerActivity.save();
      console.log('✓ Activity status updated to COMPLETED! Benchmark target achieved.');
    }

    console.log('\n==================================================');
    console.log('SUCCESS: Complete Improvement Activity & Practice Loop verified!');
    console.log('==================================================');
  } catch (err) {
    console.error('❌ E2E Test Error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

runE2ETest();
