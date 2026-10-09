# CandidateIQ — Devpost Project Story

## A. Introduction

**CandidateIQ** is an AI-powered interview preparation and skill diagnostic platform designed to turn generic job preparation into a personalized, feedback-driven learning experience. Instead of relying on static question lists or canned interview advice, CandidateIQ analyzes a candidate’s uploaded resume alongside target job descriptions to dynamically construct role-tailored mock interviews, objectively evaluate responses, diagnose competency gaps, and generate actionable improvement activities. CandidateIQ provides an end-to-end preparation loop: **ASSESS → DIAGNOSE → IMPROVE → REASSESS → TRACK PROGRESS**.

---

## B. Inspiration

Preparing for technical and professional job interviews remains a major hurdle for students, fresh graduates, and career changers:

* **Generic Question Banks**: Most interview preparation platforms offer standard, one-size-fits-all question sets that ignore the candidate's actual projects or target job requirements.
* **Lack of Objective, Detailed Feedback**: Practicing alone or reading sample answers rarely reveals specific weaknesses in technical depth, communication clarity, or problem-solving structure.
* **Disconnect Between Practice and Action**: Candidates who perform poorly in mock interviews often don't know *what* or *how* to practice next to measurably improve.
* **Unclear Readiness Signals**: Candidates struggle to gauge whether their self-declared resume claims hold up under interview evaluation.

CandidateIQ was built to solve these problems by using AI to bridge the gap between resume context, job requisitions, interactive practice, and actionable skill development.

---

## C. What It Does

CandidateIQ delivers an integrated candidate workflow:

1. **Resume Intelligence & Keyword Extraction**: Candidates upload PDF resumes, which are parsed to extract technical skills, frameworks, experience, and project claims, calculating a structured Resume Quality score.
2. **Job Description Alignment**: Candidates can target specific job requisitions. CandidateIQ aligns resume claims against job requirements to identify technical skill matches and gaps.
3. **Personalized AI Mock Interview Generation**: CandidateIQ dynamically constructs customized mock interview sessions derived directly from the candidate's resume keywords and target role requirements. Questions include multiple-choice, text-response, and video call formats.
4. **Multi-Dimensional Response Evaluation**: CandidateIQ evaluates candidate responses across 6 core competency metrics: Technical Correctness, Relevance, Depth, Problem Solving, Communication Clarity, and Behavioural Alignment.
5. **Skill Matrix & Evidence Triangulation**: Evaluates candidate competencies using multi-source evidence (Resume Claims vs. Project Details vs. Mock Interview Scores), classifying skills into transparent states (*Supported*, *Partially Supported*, *Untested*, or *Contradicted*).
6. **Actionable Improvement Activities**: Automatically generates targeted practice tasks based on weaknesses identified during interviews, allowing candidates to practice targeted concepts and re-evaluate their progress.
7. **Interview Journey & Historical Tracking**: Tracks interview scores over time, allowing candidates to monitor improvement across attempts.

---

## D. How We Built It

CandidateIQ is built using a modern full-stack MERN architecture (MongoDB, Express.js, React, Node.js):

* **Frontend UI**: Built with React 18 (Vite), Tailwind CSS, Lucide React Icons, and Recharts for visual data analytics.
* **Backend REST API**: Powered by Node.js and Express.js, implementing modular routes, JWT authentication, and request validation.
* **Database & Persistence**: MongoDB with Mongoose object modeling for storing user profiles, resumes, interview sessions, question evaluation scores, and improvement tasks.
* **PDF Processing**: `pdf-parse` for server-side text extraction from uploaded resume documents.
* **Video Call Integration**: Embedded Jitsi Meet Web SDK for live interactive video interview rooms.
* **Notification System**: Resend API integration for transactional email notifications.

---

## E. AI Implementation & Data Flow

CandidateIQ uses a structured, multi-stage AI workflow:

```text
[Resume PDF / Job Description]
               │
               ▼
[pdf-parse & Text Normalization]
               │
               ▼
[LLM Prompt Orchestrator (Google Gemini / Groq Llama 3.3)]
               │
               ▼
[Zod Schema Validation & JSON Parsing]
               │
               ▼
[Evaluation & Scoring Engine]
               │
               ▼
[MongoDB Persistence (Interviews, Skills, Activities)]
               │
               ▼
[Candidate IQ Dashboard & Feedback UI]
```

### AI Workflow Components
1. **Model Providers**: Integrated with Google Gemini 1.5/2.0 Flash (`@google/generative-ai`) and Groq SDK (`groq-sdk` with Llama-3.3-70B), backed by a resilient fallback execution provider.
2. **Structured Prompt Design**: System prompts enforce strict JSON outputs adhering to predefined schemas, specifying evaluation criteria, technical rubric weights, and constructive feedback rules.
3. **Application Logic & Deterministic Scoring**: While the LLM evaluates response text for technical accuracy and depth, CandidateIQ's backend applies deterministic weighted scoring formulas (e.g., Technical 50% + Behavioural 50%) to ensure fair, reproducible performance metrics.
4. **Human Limitations Guard**: AI outputs are validated server-side. Missing or malformed LLM responses gracefully fall back to structured heuristics rather than crashing or displaying raw errors.

---

## F. Creativity and Innovation

CandidateIQ applies AI creatively to personalize the learning process:

* **Contextual Interview Creation**: Questions are generated specifically from the intersection of a candidate's resume keywords and the target job description—not pulled from a static database.
* **Turn Evaluation into Practice**: Instead of stopping at a score, CandidateIQ translates poor answer performance into personalized **Improvement Activities**, giving candidates immediate practice tasks tailored to their mistakes.
* **Evidence-Based Skill Triangulation**: Differentiates between what a candidate *claims* on a resume vs. what they *demonstrate* in mock interviews, providing realistic skill readiness insights.

---

## G. Challenges We Faced

* **PDF Resume Extraction Consistency**: Raw PDF text streams often vary wildly in formatting. Implementing multi-tier keyword normalization ensured reliable skill extraction regardless of resume template style.
* **Strict LLM Output Structuring**: LLMs occasionally return markdown wrapping around JSON strings. We engineered robust JSON parsers and Zod schemas to guarantee structured data delivery to MongoDB.
* **Multi-Provider Reliability**: Relying on a single LLM API can introduce latency or quota rate limits. We built an orchestrator with automatic provider failover to maintain high uptime during interview sessions.
* **Preventing Fabricated Feedback**: Designing the scoring engine required careful separation between LLM qualitative evaluation and deterministic metric aggregation to avoid hallucinated scores.

---

## H. What We Learned

* **Designing Explainable AI UI**: Users trust AI feedback significantly more when scores are broken down into specific evidence callouts and concrete strengths/weaknesses rather than an arbitrary single score.
* **System Resilience**: Combining LLM capability with fallback application logic is essential for production-grade reliability.
* **Closing the Feedback Loop**: The most effective AI applications don't just evaluate—they actively guide the user on *how to improve*.

---

## I. Real-World Impact

CandidateIQ empowers job seekers, students, and placement candidates to:
* Practice high-stakes technical and behavioral interviews in a risk-free environment.
* Understand exact ATS and skill requirement gaps before applying for target positions.
* Transform interview failures into focused, structured study plans.
* Track tangible competency growth across multiple interview attempts.

---

## J. Future Scope

* **Multimodal Speech & Tone Analysis**: Incorporate real-time audio sentiment and speech clarity evaluation during live video calls.
* **Adaptive Question Tailoring**: Dynamically adjust question difficulty during a live interview based on real-time performance in previous turns.
* **Peer & Mentor Review Integration**: Allow candidates to share evaluation reports with human mentors for hybrid AI + Expert guidance.
