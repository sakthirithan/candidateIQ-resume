const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/candidate_profiling';

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('[Seed] Connected to MongoDB!');

    // Clean existing seed users and associated records
    const seedEmails = [
      'candidate.demo@candidateiq.local',
      'recruiter.demo@candidateiq.local',
      'admin.demo@candidateiq.local',
      'candidate.demo@candidateiq.com',
      'recruiter.demo@candidateiq.com',
      'admin@candidateiq.com'
    ];

    console.log('[Seed] Cleaning up existing demo data...');
    const existingUsers = await User.find({ email: { $in: seedEmails } });
    const userIds = existingUsers.map(u => u._id);

    await Application.deleteMany({ candidate: { $in: userIds } });
    await Interview.deleteMany({ candidate: { $in: userIds } });
    await CandidateProfile.deleteMany({ user: { $in: userIds } });
    await Job.deleteMany({ recruiter: { $in: userIds } });
    await User.deleteMany({ email: { $in: seedEmails } });

    console.log('[Seed] Creating Seed Users...');
    // 1. Candidate User
    const candidateUser = await User.create({
      name: 'Arun Kumar',
      email: 'candidate.demo@candidateiq.local',
      password: 'Password123',
      role: 'candidate',
      paymentStatus: 'paid',
      activated: true
    });

    // 2. Recruiter User
    const recruiterUser = await User.create({
      name: 'Sarah Wilson (Recruiter Demo)',
      email: 'recruiter.demo@candidateiq.local',
      password: 'Password123',
      role: 'hr',
      paymentStatus: 'paid',
      activated: true
    });

    // 3. Admin User
    const adminUser = await User.create({
      name: 'CandidateIQ System Admin',
      email: 'admin.demo@candidateiq.local',
      password: 'Password123',
      role: 'admin',
      paymentStatus: 'paid',
      activated: true
    });

    console.log('[Seed] Creating Controlled Jobs...');
    // Create Job 1: Frontend React Developer
    const job1 = await Job.create({
      title: 'Senior Frontend React Developer',
      department: 'Frontend Engineering',
      description: 'We are seeking a talented Senior React Developer to lead frontend module architecture, state optimization, and AI evaluation user interfaces.',
      requiredSkills: ['React', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind'],
      preferredSkills: ['Redux', 'Vite', 'REST API'],
      experienceLevel: '2-4 Years',
      education: "Bachelor's Degree in Computer Science or Software Engineering",
      location: 'Remote / Hybrid',
      employmentType: 'Full-time',
      status: 'published',
      recruiter: recruiterUser._id,
      recruiterIdString: recruiterUser._id.toString()
    });

    // Create Job 2: Backend Node.js Developer
    const job2 = await Job.create({
      title: 'Backend Node.js & Express Engineer',
      department: 'Platform Engineering',
      description: 'Join our core platform engineering team to build scalable microservices, MongoDB database aggregation pipelines, and AI integration services.',
      requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST API', 'JavaScript'],
      preferredSkills: ['GraphQL', 'Docker', 'Redis'],
      experienceLevel: '3-5 Years',
      education: "Bachelor's Degree in Computer Science or related field",
      location: 'Bangalore, India (Hybrid)',
      employmentType: 'Full-time',
      status: 'published',
      recruiter: recruiterUser._id,
      recruiterIdString: recruiterUser._id.toString()
    });

    console.log('[Seed] Creating Candidate Profile for Arun Kumar...');
    const candidateProfile = await CandidateProfile.create({
      user: candidateUser._id,
      userIdString: candidateUser._id.toString(),
      personalInfo: {
        name: 'Arun Kumar',
        email: 'candidate.demo@candidateiq.local',
        phone: '+91 98765 43210',
        location: 'Chennai, India',
        headline: 'Full Stack Engineer | React & Node.js Developer',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      },
      education: [
        {
          degree: 'B.Tech in Computer Science & Engineering',
          institution: 'Anna University',
          year: '2024',
          cgpa: '8.9'
        }
      ],
      experience: [
        {
          company: 'WebTech Innovations',
          position: 'Full Stack Developer Intern',
          duration: '6 Months',
          description: 'Built scalable React components and Express REST APIs with MongoDB data persistence.'
        }
      ],
      skills: {
        technical: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Express', 'HTML5', 'CSS3', 'TypeScript'],
        soft: ['Problem Solving', 'Structured Communication', 'Teamwork', 'Critical Thinking'],
        frameworks: ['React', 'Express', 'Vite', 'Tailwind'],
        databases: ['MongoDB'],
        tools: ['Git', 'VS Code', 'Postman', 'Docker']
      },
      projects: [
        {
          title: 'CandidateIQ — AI-Driven Recruitment Platform',
          techStack: ['React', 'Node.js', 'Express', 'MongoDB'],
          description: 'Developed automated candidate profiling, resume parser, and interactive mock interview evaluation engine.'
        }
      ],
      certifications: [
        {
          title: 'MongoDB Certified Developer',
          issuer: 'MongoDB University',
          year: '2025'
        }
      ],
      skillAnalysis: {
        totalSkills: 12,
        confidenceScore: 92,
        topSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Express'],
        inferredLevels: {
          React: { score: 94, label: 'Verified Expert', confidence: 'High' },
          'Node.js': { score: 90, label: 'Verified Advanced', confidence: 'High' },
          MongoDB: { score: 88, label: 'Verified Advanced', confidence: 'High' },
          JavaScript: { score: 92, label: 'Verified Expert', confidence: 'High' }
        }
      }
    });

    console.log('[Seed] Creating Job Application for Job 1...');
    const application = await Application.create({
      job: job1._id,
      jobIdString: job1._id.toString(),
      candidate: candidateUser._id,
      candidateIdString: candidateUser._id.toString(),
      candidateProfile: candidateProfile._id,
      status: 'applied',
      matchAnalysis: {
        overallMatch: 92,
        technicalMatch: 94,
        experienceMatch: 88,
        educationMatch: 95,
        strongMatches: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind'],
        missingSkills: ['TypeScript'],
        explanation: 'Strong match for Senior Frontend React Developer role with 94% technical competency.',
        recommendation: 'Highly Recommended for Technical Interview'
      },
      overallScore: 92
    });

    console.log('[Seed] Creating Completed Mock Interview Record...');
    const mockInterview = await Interview.create({
      candidate: candidateUser._id,
      candidateIdString: candidateUser._id.toString(),
      job: job1._id,
      jobIdString: job1._id.toString(),
      jobTitle: job1.title,
      interviewType: 'mixed',
      difficulty: 'Senior',
      status: 'completed',
      questions: [
        {
          questionId: 1,
          category: 'Technical Core',
          questionText: 'Explain React Virtual DOM and how reconciliation optimizes component re-renders.',
          targetSkill: 'React',
          candidateResponse: 'The Virtual DOM is an in-memory representation of real DOM elements. When state changes, React creates a new Virtual DOM tree and diffs it using the Reconciliation algorithm, applying batch minimal updates to real DOM.',
          evaluation: {
            technicalScore: 95,
            communicationScore: 90,
            problemSolvingScore: 92,
            depthScore: 94,
            relevanceScore: 96,
            feedback: 'Exceptional depth of knowledge regarding React fiber reconciliation and diffing performance optimizations.',
            behaviouralEvidence: ['Articulated technical concepts clearly with architectural precision.'],
            keyStrengths: ['Deep React internals knowledge', 'Clear technical explanations'],
            areasForImprovement: ['Mention useMemo / useCallback hooks optimization']
          }
        }
      ],
      overallEvaluation: {
        overallInterviewScore: 93,
        technicalProficiency: 95,
        behaviouralCompetency: 90,
        communicationClarity: 92,
        problemSolvingRating: 94,
        summaryExplanation: 'Outstanding candidate demonstrating master-level frontend engineering principles.',
        topStrengths: ['Mastery of React Virtual DOM', 'Structured problem solving approach'],
        recommendedImprovementAreas: ['Expand backend microservices knowledge']
      }
    });

    console.log('\n======================================================');
    console.log('  CANDIDATEIQ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Candidate Account: candidate.demo@candidateiq.local / Password123');
    console.log('Recruiter Account: recruiter.demo@candidateiq.local / Password123');
    console.log('Admin Account:     admin.demo@candidateiq.local / Password123');
    console.log(`Jobs Created:      ${job1.title} (${job1._id})`);
    console.log(`                   ${job2.title} (${job2._id})`);
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Database Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();
