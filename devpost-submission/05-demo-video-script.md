# CandidateIQ — 3-Minute Demo Video Script

## Overview
This script is designed for a **3-minute narration video (180 seconds)** showcasing live functionality of CandidateIQ for the **ForgeHacks Online 2026** Devpost submission.

---

## Timestamped Script & Screen Breakdown

### Segment 1: The Problem (0:00 – 0:20)
* **Screen to Display**: Static question lists vs. rejection emails graphic or clean intro title slide.
* **Exact Narration**:
  > "Preparing for job interviews is tough. Standard interview prep relies on static question lists that ignore your specific resume and target role. Candidates get rejected without ever understanding *why* their answers fell short or *what* to study next."
* **User Action**: Show intro title screen "CandidateIQ — AI-Powered Interview Preparation".
* **Expected Result**: Clearly establishes the core problem.
* **Fallback**: Display slide with bullet points of generic interview prep drawbacks.

---

### Segment 2: Product Introduction (0:20 – 0:40)
* **Screen to Display**: CandidateIQ Landing Page (`/`) transitioning to Candidate Dashboard (`/dashboard`).
* **Exact Narration**:
  > "Meet CandidateIQ—an AI-powered interview preparation platform built to solve this. CandidateIQ creates a continuous feedback loop: **ASSESS, DIAGNOSE, IMPROVE, REASSESS, and TRACK PROGRESS**. It turns your resume and target role into dynamic AI mock interviews and actionable skill development."
* **User Action**: Click "Open Workspace" or sign in as a candidate user.
* **Expected Result**: Candidate Overview Dashboard opens, displaying Candidate Readiness metrics and primary actions.
* **Fallback**: Pre-login to candidate dashboard to prevent login delay.

---

### Segment 3: Resume Intelligence & Candidate Readiness (0:40 – 1:05)
* **Screen to Display**: Candidate Readiness Panel on Dashboard & Resume Intelligence page (`/resume-intelligence`).
* **Exact Narration**:
  > "It starts with your resume. CandidateIQ’s parser extracts technical skills, frameworks, and experience depth, generating a transparent Resume Quality score and skill evidence inventory. The Candidate Readiness panel gives you an instant snapshot of profile completion and verified skill claims."
* **User Action**: Click "Resume Intelligence" from the top panel, demonstrate parsing a PDF resume, and show extracted keywords.
* **Expected Result**: Extracted technical skills list and ATS criteria breakdown display smoothly.
* **Fallback**: Show an already-parsed resume with extracted skills visible.

---

### Segment 4: Target Role & Interview Configuration (1:05 – 1:25)
* **Screen to Display**: Job Discovery / Target Job Requisition details (`/jobs`).
* **Exact Narration**:
  > "Next, select your target job requisition. CandidateIQ matches your extracted resume skills against specific job requirements, highlighting technical overlaps and critical skill gaps before you ever begin your interview."
* **User Action**: Select a target job requisition (e.g., "Senior Full Stack Engineer").
* **Expected Result**: Compatibility breakdown displays matching skills vs. required skills.
* **Fallback**: Use pre-created job requisition in local database.

---

### Segment 5: Live AI Mock Interview Session (1:25 – 1:55)
* **Screen to Display**: AI Mock Interview Room (`/interview`).
* **Exact Narration**:
  > "Now, launch your personalized AI Mock Interview. Rather than canned questions, CandidateIQ dynamically generates role-specific technical questions derived from your resume keywords and job requirements. You can answer via text or speech response."
* **User Action**: Click "Start AI Mock Interview", display generated technical question (e.g. Node.js concurrency/React state), type a response, and click "Submit Answer".
* **Expected Result**: Live response submission records answer and triggers evaluation.
* **Fallback**: Pre-enter sample answer text for smooth recording flow.

---

### Segment 6: Multi-Dimensional Evaluation & Analytics (1:55 – 2:20)
* **Screen to Display**: Interview Evaluation Analytics (`/mock-interview`).
* **Exact Narration**:
  > "Upon completion, CandidateIQ evaluates your performance across 6 competency dimensions: Technical Correctness, Depth, Problem Solving, Communication, Relevance, and Behavioural Alignment. Detailed evidence callouts explain exactly why you scored high or low."
* **User Action**: Scroll through overall scorecard (e.g. 84/100), technical radar chart, and question-by-question breakdown.
* **Expected Result**: Clear visual presentation of objective evaluation metrics.
* **Fallback**: Show completed interview attempt report from history.

---

### Segment 7: Actionable Improvement Activities (2:20 – 2:40)
* **Screen to Display**: Improvement Activities Hub (`/activities`).
* **Exact Narration**:
  > "Here is where creativity meets learning: CandidateIQ automatically converts identified answer weaknesses into targeted **Improvement Activities**. Candidates can practice individual concepts, submit practice answers, and track their skill progress."
* **User Action**: Click "View Activities", select a practice task (e.g., "Practice SQL JOIN & Indexing"), and complete a practice exercise.
* **Expected Result**: Activity status updates to COMPLETED and recalculates progress.
* **Fallback**: Show existing pending and completed activities list.

---

### Segment 8: Interview Journey & Historical Progression (2:40 – 2:55)
* **Screen to Display**: Candidate Journey (`/interview-journey`) and Skill Matrix (`/skills`).
* **Exact Narration**:
  > "Finally, the Interview Journey and Skill Matrix visualize your progress across multiple attempts, proving how targeted practice transforms initial skill gaps into verified technical competencies."
* **User Action**: Click "View Full Journey" and highlight progression steps from initial attempt to reassessment.
* **Expected Result**: Milestone progression checklist displays completed steps.
* **Fallback**: Show historical interview attempt cards.

---

### Segment 9: Closing (2:55 – 3:00)
* **Screen to Display**: CandidateIQ Dashboard Header with project title.
* **Exact Narration**:
  > "CandidateIQ: Turning resumes and target roles into personalized interview mastery. Thank you!"
* **User Action**: Show final logo/dashboard screen with clean call-to-action.
* **Expected Result**: Strong, memorable conclusion.

---

## Video Recording Summary

| Segment | Duration | Focus Area | Key UI Route |
| :--- | :--- | :--- | :--- |
| **Problem** | 20s | Generic interview prep limitations | Title Slide / Graphics |
| **Product Intro** | 20s | CandidateIQ 5-step loop | `/` -> `/dashboard` |
| **Resume Intelligence** | 25s | PDF parsing & readiness | `/resume-intelligence` |
| **Job Selection** | 20s | Target role skill gap match | `/jobs` |
| **Mock Interview** | 30s | Dynamic AI question & response | `/interview` |
| **Evaluation** | 25s | 6-metric objective analytics | `/mock-interview` |
| **Improvement Tasks**| 20s | Targeted practice activities | `/activities` |
| **Journey & Matrix** | 15s | Progress tracking over time | `/interview-journey` |
| **Closing** | 5s | Final pitch & call to action | `/dashboard` |
