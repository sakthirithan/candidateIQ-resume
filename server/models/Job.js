const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true
    },
    department: {
      type: String,
      default: 'Engineering'
    },
    description: {
      type: String,
      required: [true, 'Please add a job description']
    },
    requiredSkills: {
      type: [String],
      required: [true, 'Please add at least one required skill']
    },
    preferredSkills: [String],
    experienceLevel: {
      type: String,
      default: '1-3 Years'
    },
    experience: {
      min: {
        type: Number,
        min: [0, 'Minimum experience must be non-negative'],
        default: 0
      },
      max: {
        type: Number,
        min: [0, 'Maximum experience must be non-negative'],
        default: 0
      },
      unit: {
        type: String,
        enum: ['years', 'months'],
        default: 'years'
      }
    },
    salary: {
      min: {
        type: Number,
        min: [0, 'Minimum salary must be non-negative'],
        default: 0
      },
      max: {
        type: Number,
        min: [0, 'Maximum salary must be non-negative'],
        default: 0
      },
      currency: {
        type: String,
        default: 'INR'
      },
      period: {
        type: String,
        enum: ['year', 'month'],
        default: 'year'
      }
    },
    education: {
      type: String,
      default: "Bachelor's Degree in Computer Science or related field"
    },
    location: {
      type: String,
      default: 'Remote / Hybrid'
    },
    employmentType: {
      type: String,
      default: 'Full-time'
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'closed'],
      default: 'published'
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recruiterIdString: String,
    hrEvaluationPrompt: {
      type: String,
      default: ''
    },
    evaluationConfig: {
      weights: {
        requiredSkills: { type: Number, default: 30 },
        experience: { type: Number, default: 20 },
        projectRelevance: { type: Number, default: 15 },
        technicalCompetency: { type: Number, default: 15 },
        responsibilities: { type: Number, default: 10 },
        education: { type: Number, default: 5 },
        impact: { type: Number, default: 5 }
      },
      prompt: { type: String, default: '' },
      version: { type: Number, default: 1 }
    },
    evaluation: {
      hrPrompt: {
        type: String,
        default: ''
      }
    },
    keywords: {
      type: [String],
      default: []
    },
    closingDate: {
      type: Date,
      default: null
    },
    workArrangement: {
      type: String,
      enum: ['Hybrid', 'Remote', 'On-site'],
      default: 'Hybrid'
    },
    seniorityLevel: {
      type: String,
      default: 'Mid-Senior level'
    },
    responsibilities: {
      type: String,
      default: ''
    },
    qualifications: {
      type: String,
      default: ''
    },
    history: [
      {
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actorName: { type: String, default: 'System' },
        details: { type: String, default: '' }
      }
    ]
  },
  { timestamps: true }
);

// Database Indexes for Efficient Operational Queries
jobSchema.index({ recruiter: 1, status: 1 });
jobSchema.index({ status: 1, closingDate: 1 });
jobSchema.index({ recruiter: 1, createdAt: -1 });
jobSchema.index({ recruiter: 1, department: 1, employmentType: 1 });

module.exports = mongoose.model('Job', jobSchema);

