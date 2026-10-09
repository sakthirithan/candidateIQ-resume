# CandidateIQ — Architectural & Governance Rules

## 1. Modular Hierarchy & Boundary Control

```text
Domain Role (Candidate / HR / Admin / Shared)
 └── Submodule Domain
      └── Feature Context
           └── Component & Local State
                └── API Client / Service
                     └── Express Controller
                          └── MongoDB Schema
```

---

## 2. Dependency Direction Constraints

1. **Role Modules → Shared Module**: Allowed. `candidate`, `hr`, and `admin` modules can import from `shared`.
2. **Shared Module → Role Modules**: FORBIDDEN. `shared` components must NEVER import directly from `candidate`, `hr`, or `admin`.
3. **Role Module → Role Module**: FORBIDDEN. Candidate components must not import directly from HR or Admin components. Common cross-role logic must be refactored into `shared`.
4. **Backend Controllers → Models & Services**: Controllers delegate AI evaluation and question generation to specialized services in `server/services/ai/`.

---

## 3. UI & Design System Standards

- **Primary SaaS Accent**: Indigo `#606beb` / `indigo-600`
- **Secondary Accents**: Purple `purple-600`, Emerald `emerald-600` (success/scores), Amber `amber-500` (warnings/reviews)
- **Background Theme**: Light SaaS background `#F7F9FC` with clean white cards (`bg-white rounded-3xl border border-slate-200`)
- **Typography**: `Outfit` font for headings (`font-outfit font-black`), `Inter` for body (`font-sans`), `JetBrains Mono` for code/scores (`font-mono`).

---

## 4. Responsible AI & Evaluation Integrity

- **Explainable Evidence**: Every score, strength, weakness, and recommendation must cite specific candidate evidence (`Q2`, `Q5`, `Q7`).
- **No Hardcoded Scores**: No fake numbers in production UI. All scores must compute dynamically from actual candidate attempt responses and voice analytics.
- **Voice Intelligence**: Spoken responses are evaluated using append-only speech recognition, VAD silence tracking, and contextual filler detection (`UM`, `HMM`, `UH`). Accent or personality traits must NEVER be evaluated.
