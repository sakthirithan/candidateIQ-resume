# CandidateIQ — Technical Architecture & System Design

## 1. Executive Architecture Overview

CandidateIQ is designed as a modular, decoupled full-stack Web application using the MERN stack (MongoDB, Express.js, React 18, Node.js). It separates candidate experience UI, service abstractions, backend REST APIs, AI orchestrators, and database persistence.

---

## 2. System Component Diagram (Mermaid)

```mermaid
graph TD
    subgraph Candidate Client (React 18 + Vite)
        UI[Candidate Overview Dashboard]
        ResUI[Resume Intelligence UI]
        IntUI[AI Mock Interview Room]
        EvalUI[Evaluation Analytics & Scorecard]
        ActUI[Improvement Activities Hub]
        SkillUI[Skill Matrix & Evidence Desk]
    end

    subgraph Backend Server (Node.js + Express.js)
        AuthMW[JWT Authentication & Role Middleware]
        
        subgraph Controllers
            ResCtrl[Resume Controller]
            JobCtrl[Job Controller]
            IntCtrl[Interview Controller]
            MockCtrl[Mock Interview Controller]
            ActCtrl[Improvement Activity Controller]
        end

        subgraph AI Integration Orchestrator
            AIOrch[AI Provider Orchestrator]
            Gemini[Google Gemini Provider]
            Groq[Groq Llama 3.3 Provider]
            Fallback[Failover Fallback Engine]
            ZodVal[Zod Output Validator]
        end

        subgraph Core Services
            PDFParse[pdf-parse Resume Text Extractor]
            KWNorm[Keyword Normalizer]
            EvalEngine[Deterministic 6-Metric Evaluator]
            ActGen[Improvement Activity Generator]
        end
    end

    subgraph Database Layer (MongoDB + Mongoose)
        UserDB[(User Collection)]
        ProfileDB[(CandidateProfile Collection)]
        ResumeDB[(Resume Collection)]
        JobDB[(Job Collection)]
        AppDB[(Application Collection)]
        InterviewDB[(Interview Collection)]
        ActivityDB[(ImprovementActivity Collection)]
    end

    %% Flow Connections
    UI --> AuthMW
    ResUI --> ResCtrl
    IntUI --> MockCtrl
    EvalUI --> IntCtrl
    ActUI --> ActCtrl

    ResCtrl --> PDFParse --> KWNorm --> ResumeDB
    MockCtrl --> AIOrch
    IntCtrl --> EvalEngine --> InterviewDB
    ActCtrl --> ActGen --> ActivityDB

    AIOrch --> Gemini
    AIOrch --> Groq
    AIOrch --> Fallback
    AIOrch --> ZodVal

    ResCtrl --> ProfileDB
    JobCtrl --> JobDB
    IntCtrl --> UserDB
```

---

## 3. Layer Breakdown

### A. Frontend Layer (`client/`)
* **Framework**: React 18 initialized with Vite for fast HMR bundling.
* **Styling**: Tailwind CSS with custom SaaS tokens (`.saas-card`, `.btn-ai`, `.input-saas`).
* **Icons & Charts**: `lucide-react` icons and `recharts` for technical radar & score charts.
* **Routing**: `react-router-dom` v6 with role-based layout encapsulation and Error Boundaries.

### B. Backend Layer (`server/`)
* **Runtime & Web Server**: Node.js v18+ and Express.js REST API framework.
* **Security & Auth**: `bcryptjs` password hashing, `jsonwebtoken` (JWT) authentication middleware (`protect`), and role guards (`authorize`).
* **File Uploads**: `multer` for handling PDF resume uploads with 5MB validation limit.
* **Email Service**: Resend API integration (`resend`) for interview invitation delivery.

### C. AI Provider & Orchestration Architecture (`server/ai/`)
CandidateIQ uses a resilient multi-provider AI architecture:
* **Google Gemini Provider** (`geminiProvider.js`): Interfaces with `@google/generative-ai` for Gemini 1.5/2.0 Flash models.
* **Groq Provider** (`groqProvider.js`): Interfaces with `groq-sdk` for ultra-low-latency Llama-3.3-70B model execution.
* **Failover Engine** (`fallbackProvider.js`): Guarantees session continuity by automatically failing over if a primary LLM API experiences rate limits or network issues.
* **Schema Validation**: Uses `zod` schema parsing to guarantee structured JSON outputs from raw LLM responses.

### D. Data Persistence & MongoDB Models (`server/models/`)
* **`User`**: Account identity, credentials, role (`candidate`, `hr`, `admin`).
* **`CandidateProfile`**: Personal info, headline, skills breakdown, experience, education, projects.
* **`Resume`**: Extracted raw text, keywords, file path, parsing status, ATS score breakdown.
* **`Job`**: Title, department, location, required & preferred skills, HR evaluation prompt text.
* **`Application`**: Candidate-to-job link, application status pipeline, submission timestamp.
* **`Interview`**: Category (`actual` vs `mock`), round type, scheduled date, questions, answers, and 6-metric overall evaluation object.
* **`ImprovementActivity`**: Weakness-derived practice task, baseline value, latest value, practice history, completion status.

---

## 4. Key Data Flows

### A. Resume Processing Data Flow
```text
PDF Upload -> Multer Storage -> pdf-parse Text Extraction -> Keyword Normalizer -> Resume DB Record -> Candidate Skill Matrix
```

### B. Mock Interview Generation & Evaluation Data Flow
```text
Candidate Resume Keywords + Target Job Requirements 
   -> AI Orchestrator 
   -> Dynamic Prompt Formulation 
   -> LLM Provider (Gemini / Groq) 
   -> Zod Validation 
   -> Active Interview Session 
   -> Answer Submission 
   -> 6-Metric Scoring Engine 
   -> MongoDB Persistence 
   -> Automated Activity Generation
```

---

## 5. Security & Isolation Boundaries

1. **Authentication Guard**: All private API routes enforce valid JWT bearer token validation.
2. **Candidate Scoping**: All database queries for candidate profile, resumes, interviews, and activities are strictly scoped to `req.user.id`.
3. **Secret Isolation**: All API keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `RESEND_API_KEY`, `JWT_SECRET`) are isolated in `server/.env` and excluded from frontend bundles.
