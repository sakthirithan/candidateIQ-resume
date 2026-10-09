# CandidateIQ — Shared Component Registry

## Rules for Shared Components
A component belongs to `Shared` (`components/common` / `modules/shared`) ONLY when:
1. It is used by 2 or more independent role domains (`Candidate`, `HR`, `Admin`).
2. Or it is a business-independent UI primitive (`Button`, `Modal`, `DataTable`, `Timer`, `Spinner`).

Business-specific components (e.g. `AIMockInterviewRoom`, `RecruiterJobManagement`) MUST remain in their respective role module directory.

---

## Shared Component Inventory

### 1. `Sidebar` (`client/src/components/common/Sidebar.jsx`)
- **Purpose**: Fixed left-hand navigation bar supporting role-based tab switching and collapsibility.
- **Consumers**: Candidate Module, HR Module, Admin Module.
- **Dependencies**: Lucide icons, `setActiveTab` handler, current tab active state.
- **Critical Rules**: Never hardcode role-specific assumptions inside shared layout styling. Keep navigation links driven by active user role.

### 2. `Topbar` (`client/src/components/common/Topbar.jsx`)
- **Purpose**: Top bar displaying active section title, global search bar trigger, notification center bell icon, theme toggle, user avatar.
- **Consumers**: Candidate Module, HR Module, Admin Module.
- **Dependencies**: `getCurrentUser`, `NotificationCenter`.

### 3. `NotificationCenter` (`client/src/components/common/NotificationCenter.jsx`)
- **Purpose**: Real-time notification drawer showing system alerts, interview invitations, evaluation completion updates.
- **Consumers**: Candidate Module, HR Module, Admin Module.

### 4. `GlobalSearchPalette` (`client/src/components/common/GlobalSearchPalette.jsx`)
- **Purpose**: Cmd+K / Ctrl+K search palette allowing instant navigation across jobs, mock interviews, candidates, and settings.
- **Consumers**: Candidate Module, HR Module, Admin Module.

### 5. `ErrorBoundary` (`client/src/components/common/ErrorBoundary.jsx`)
- **Purpose**: React class error boundary wrapping page components to catch unhandled errors and display clean recovery UI.
- **Consumers**: All Routes in `App.jsx`.

### 6. `SettingsPage` & `SettingsModal` (`client/src/components/common/SettingsPage.jsx`)
- **Purpose**: User preferences, password update, notification toggles, theme settings.
- **Consumers**: All Users.
