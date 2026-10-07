/**
 * CandidateIQ Intelligence Engine Configuration
 * Configurable scoring weights, proficiency thresholds, evidence hierarchy, and formula versioning.
 */

const SCORING_CONFIG = {
  formulaVersion: 'candidate-iq-v2.0',

  // Candidate IQ Component Weights (Sum = 1.0)
  candidateIQ: {
    resume: 0.20,
    technical: 0.30,
    interview: 0.20,
    behavioural: 0.15,
    assessment: 0.15
  },

  // Skill Evidence Weights (Normalized based on available sources)
  skillEvidenceWeights: {
    resume: 0.10,
    project: 0.15,
    certification: 0.10,
    assessment: 0.25,
    mockInterview: 0.25,
    actualInterview: 0.15
  },

  // Technical Evidence Hierarchy Weights (Higher confidence evidence contributes more)
  technicalHierarchy: {
    level1_resume: 0.15,     // Declared on resume
    level2_projects: 0.20,   // Demonstrated in portfolio/projects
    level3_assessment: 0.25, // Verified in technical assessment
    level4_mock: 0.20,       // Evaluated in mock interview
    level5_actual: 0.20      // Evaluated in recruiter interview
  },

  // Resume Quality Criteria Weights
  resumeCriteria: {
    parsedStatus: { label: 'Resume Parsed', weight: 0.15 },
    skills: { label: 'Technical Skills Density', weight: 0.20 },
    projects: { label: 'Project Evidence', weight: 0.20 },
    experience: { label: 'Work Experience', weight: 0.20 },
    education: { label: 'Education Completeness', weight: 0.10 },
    summary: { label: 'Professional Summary', weight: 0.10 },
    contact: { label: 'Contact Details', weight: 0.05 }
  },

  // Proficiency Level Thresholds
  proficiency: {
    beginner: { min: 0, max: 39, label: 'Beginner' },
    foundational: { min: 40, max: 59, label: 'Foundational' },
    intermediate: { min: 60, max: 74, label: 'Intermediate' },
    advanced: { min: 75, max: 89, label: 'Advanced' },
    expert: { min: 90, max: 100, label: 'Expert' }
  },

  // Skill Name Canonical Normalization Rules
  canonicalSkills: {
    'react': 'React.js',
    'reactjs': 'React.js',
    'react.js': 'React.js',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'express': 'Express.js',
    'expressjs': 'Express.js',
    'express.js': 'Express.js',
    'mongo': 'MongoDB',
    'mongodb': 'MongoDB',
    'py': 'Python',
    'python': 'Python',
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'aws': 'AWS Cloud',
    'docker': 'Docker',
    'k8s': 'Kubernetes',
    'kubernetes': 'Kubernetes',
    'git': 'Git & Version Control',
    'github': 'Git & Version Control'
  },

  // Default Categories for Normalized Skills
  skillCategories: {
    'React.js': 'Frontend',
    'Vue.js': 'Frontend',
    'Angular': 'Frontend',
    'HTML/CSS': 'Frontend',
    'Tailwind CSS': 'Frontend',
    'Node.js': 'Backend',
    'Express.js': 'Backend',
    'Python': 'Programming',
    'JavaScript': 'Programming',
    'TypeScript': 'Programming',
    'Java': 'Programming',
    'C++': 'Programming',
    'MongoDB': 'Database',
    'PostgreSQL': 'Database',
    'MySQL': 'Database',
    'Redis': 'Database',
    'Docker': 'DevOps',
    'Kubernetes': 'DevOps',
    'CI/CD': 'DevOps',
    'AWS Cloud': 'Cloud',
    'GCP': 'Cloud',
    'Azure': 'Cloud',
    'Gemini API': 'AI/ML',
    'PyTorch': 'AI/ML',
    'TensorFlow': 'AI/ML',
    'LLM / AI Integration': 'AI/ML',
    'Git & Version Control': 'Tools',
    'REST APIs': 'Backend',
    'GraphQL': 'Backend',
    'Technical Leadership': 'Soft Skills',
    'Communication': 'Soft Skills',
    'Problem Solving': 'Soft Skills'
  }
};

module.exports = SCORING_CONFIG;
