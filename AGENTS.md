# CandidateIQ — AI Agent Engineering Governance Rules

## 1. READ BEFORE WORKING

Before modifying CandidateIQ:

1. Read this file.
2. Read `docs/architecture/MODULE_TREE.md`.
3. Read `docs/architecture/ARCHITECTURE_RULES.md`.
4. Identify the target role (`Candidate`, `HR / Recruiter`, `System Admin`).
5. Identify the target module (`dashboard`, `profile`, `mock-interview`, `interview`, `activities`, `journey`).
6. Identify the target submodule.
7. Inspect existing implementation and dependencies using code search.

Never start editing blindly.

---

## 2. MODULE-FIRST RULE

Every change must belong to:

```text
Role
 └── Module
      └── Submodule
           └── Feature
                └── Component
                     └── Service
                          └── API
                               └── Database
```

Example:
```text
Candidate
 └── AI Mock Interview
      └── Review Workspace
           └── Voice Analysis
                └── Filler Detection Engine
```

Do not modify unrelated modules.

---

## 3. ROLE MODULES

- Candidate functionality: `client/src/modules/candidate/` (or `client/src/components/candidate/` & `interview/`)
- HR / Recruiter functionality: `client/src/modules/hr/` (or `client/src/components/recruiter/`)
- System Admin functionality: `client/src/modules/admin/` (or `client/src/components/admin/`)
- Shared functionality: `client/src/modules/shared/` (or `client/src/components/common/`)
- Backend Services & Domain Controllers: `server/controllers/`, `server/models/`, `server/services/`

---

## 4. SHARED MODULE RULE

Shared modules are high-risk. Before changing anything in `shared/` or `common/`, identify:
- All consumers (Candidate, HR, Admin)
- All routes affected
- All business logic affected
- Existing behavior
- Required new behavior
- Compatibility requirements

A Shared component MUST support both:
```text
Existing valid behavior
+
New required behavior
```
unless the user requirement explicitly removes the old behavior.

---

## 5. DO NOT MOVE BUSINESS LOGIC INTO SHARED

Only move functionality to Shared when it is:
- Genuinely reusable across 2+ independent roles
- Business-independent (e.g. `Modal`, `Button`, `DataTable`, `Timer`)
- Used by multiple modules
- Common infrastructure

Do not move Candidate-specific business logic into Shared merely to reduce folder depth.

---

## 6. SHARED CHANGE LOG

Every modification to a Shared element MUST be recorded in:
`client/src/modules/shared/SHARED_CHANGE_LOG.md`

Record:
```text
Date:
Agent/Developer:
Shared Element:
File:
Change Description:
Reason / Requirement:
Consumers:
Existing Behavior:
New Behavior:
Compatibility & Validation:
```

---

## 7. SHARED LOGIC COMPATIBILITY

Before changing a shared component, ask:
1. Who uses this?
2. Why is it shared?
3. What existing behavior must remain?
4. Can the new behavior be configurable / optional?
5. Would a module-specific wrapper be safer?

If only one module requires the behavior, prefer a module-specific wrapper.

---

## 8. NO BLIND DELETION

Before deleting any component, page, route, API, service, schema, or utility:
- Verify that it is genuinely unused across the entire repository.
- Consider direct imports, dynamic imports, route configs, lazy loading, API abstractions, DB references.

---

## 9. NO DUMMY DATA

Do not introduce production dummy data. Do not hardcode candidate scores, interview results, feedback, ATS results, or candidate metrics unless explicitly requested as dev fixtures. All data must originate from MongoDB & Centralized Mock/API Services.

---

## 10. REQUIREMENT TRACEABILITY

Every major change must have this chain:
```text
Requirement → Module → Implementation → API → Database → UI → Validation
```

---

## 11. NO BROKEN PAGES

Every route must have:
- Loading state
- Success state
- Empty state (where applicable)
- Error state & boundary
- Valid navigation & breadcrumbs
- Valid API handling

Never leave a blank screen.

---

## 12. FINAL VALIDATION

After significant changes, run:
```bash
npm run build (in client/)
```
Verify:
1. Console & build output has 0 errors.
2. Route navigation works smoothly across candidate, HR, and admin flows.
3. No broken links or orphan components.
