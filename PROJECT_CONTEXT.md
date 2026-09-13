# EduSync: Comprehensive Platform Architecture, System Engineering & Developer Reference

> **Document Version:** 3.0.0  
> **Last Updated:** 2026-09-06  
> **Target Audience:** Core Architects, Full-Stack Engineers, AI Research Developers, Academic Administrators  
> **Repository Root:** `c:\Users\APOORV SINGH\OneDrive\Desktop\Edusync`  
> **Status:** Production-Ready · 49/49 Automated Tests Passing · Grade A+ OWASP Hardening · Multi-Cloud Dual-Runtime  

---

## 1. Executive Summary & Vision

**EduSync** is an institutional academic command operating system and intelligent learning acceleration engine designed specifically for higher education and senior secondary science academies (engineering, computer science, physics, chemistry, and mathematics).

Traditional Learning Management Systems (LMS) such as Canvas, Blackboard, or Google Classroom function primarily as administrative repositories—handling static file drops, deadlines, and gradebook tables. They lack real-time cognitive awareness of what transpires during actual lectures and cannot scaffold individualized student comprehension.

EduSync solves this disconnect by unifying:
1. **Institutional Academic Management**: Robust role-based access control (RBAC) across Students, Faculty, and Deans/Registrars, weighted rubric assignment grading, dynamic syllabus timelines, and institutional disaster recovery vault snapshots.
2. **ClassSarthi & VisionNote Synchronization**: Real-time classroom board OCR capture, teacher speech transcription, video-synchronized timeline events, automated student doubt clustering, and formula extraction.
3. **Socratic AI Cognitive Scaffolding**: Multi-modal generative AI grounded strictly in lecture timestamps, teacher quotes, chalkboard equations ($F = ma$, thermodynamics, calculus), and textbook references—refusing to solve homework directly while guiding students through step-by-step first-principles inquiry.
4. **Adaptive Note Personalization**: Dynamic note recrafting tailored to student cognitive learning styles (visual, step-by-step, intuitive, exam-focused) and diagnostic weaknesses identified in post-lecture mastery checkpoints.
5. **Dual-Runtime Cloud Resilience**: Seamless execution across containerized Node.js servers (Render, Docker, Local `tsx`) and zero-configuration serverless functions (Vercel Edge Network).

---

## 2. Tech Stack & Engineering Foundations

### 2.1 Frontend Architecture
- **UI Framework:** React 19 (`react` ^19.0.1, `react-dom` ^19.0.1) with StrictMode and clean component boundaries.
- **Language & Compiler:** TypeScript 5.8 with full strict type checking (`tsc --noEmit`).
- **Build Tool & Bundler:** Vite 6 (`vite` ^6.2.3) with `@vitejs/plugin-react` and lightning-fast HMR.
- **Styling Engine:** Tailwind CSS v4 (`@tailwindcss/vite` ^4.1.14) with minimal, high-contrast, flat dark surfaces (`bg-slate-950`, `bg-slate-900`, `border-slate-800`) and a focused blue accent palette (`#2563eb`).
- **Typography:** Unified single font family—**Plus Jakarta Sans**—with consistent `1.55` body line height and spacious vertical rhythm.
- **Mathematical Typography:** KaTeX (`katex` ^0.16.9) rendering complex inline and block LaTeX equations ($\int, \frac{\partial}{\partial t}, \vec{F}_{net}, \Delta S$).
- **Icons & Motion:** Lucide React (`lucide-react` ^0.546.0), Motion (`motion` ^12.23.24), and Canvas Confetti (`canvas-confetti`).
- **Data Visualization:** Recharts (`recharts` ^3.10.1) for classroom grade distribution curves, diagnostic weak-topic clustering, and student concept mastery radar.

### 2.2 Backend & API Architecture
- **Web Server:** Node.js Express (`express` ^4.21.2) with robust JSON body parsers (2MB strict payload ceiling).
- **Serverless Integration:** Vercel Serverless Function entrypoint (`api/index.js` bundled via `esbuild`) providing sub-100ms cold starts.
- **AI Ecosystem & LLM SDKs:** `@google/genai` (Gemini 2.5 Flash & Gemini 3.7 Flash) paired with local fallback cognitive engines (`socraticKnowledge.ts` & `knowledgeBase.ts`) ensuring 100% uptime even in offline or air-gapped environments.
- **Cloud Real-time Layer:** Supabase Client (`@supabase/supabase-js` ^2.114.0) with real-time WebSocket replication for incoming camera/device notes and user profiles.
- **Persistence Model:** Dual hybrid storage:
  - `InMemoryDatabase` (`src/server/db.ts`) for sub-millisecond in-memory cache operations.
  - Disk-backed JSON seed repositories (`data/users.json`, `data/lectures.json`, `data/notes.json`, `data/student_progress.json`) automatically synchronized on mutating API actions.

### 2.3 Security & Production Hardening
- **OWASP Top 10 Headers:** Helmet-grade security middleware setting `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, and a strict `Content-Security-Policy`.
- **Recursive Input Sanitization:** Deep object traversal stripping malicious `<script>`, `onerror=`, `<iframe>`, and JavaScript event attributes from all payloads.
- **Prototype Pollution Shield:** Strict rejection/sanitization of `__proto__`, `constructor`, and `prototype` keys before object merging.
- **Tiered Rate Limiting:**
  - *Authentication:* 500 requests/minute (with localhost developer relaxation).
  - *AI Inference Endpoints:* 100 requests/minute.
  - *General REST Endpoints:* 500 requests/minute.
- **Automated Security Self-Audit:** `GET /api/security/audit` executing 14 programmatic security checks with an automated Grade A+ diagnostic pass.

---

## 3. System Architecture & Directory Topology

```
EduSync/
├── api/                                    # Vercel Serverless Function deployment bundle
│   ├── api_src/index.js                    # Serverless routing bridge
│   ├── data/                               # Bundled read-only seed data for Vercel edge
│   └── index.js                            # Monolithic serverless bundle (esbuild compiled)
├── data/                                   # Disk-backed persistent JSON databases
│   ├── lectures.json                       # ClassSarthi synced lectures, transcripts & board captures
│   ├── notes.json                          # Student markdown notes, summaries & quizzes
│   ├── student_progress.json               # Concept mastery radar & quiz score history
│   └── users.json                          # Institutional user directory & credentials
├── public/                                 # Static web assets
│   ├── favicon.ico                         # EduSync favicon
│   └── logo.png                            # Institutional brand mark
├── src/                                    # Application Source Code
│   ├── components/                         # Modular UI Component Layer
│   │   ├── AdminDashboard/                 # Registrar & Dean portal (KPIs, User CRUD, Course setup)
│   │   ├── AIStudyAssistant/               # Multi-modal RAG study chatbot with practice queries
│   │   ├── BoardVisuals/                   # High-res chalkboard OCR gallery with formula zoom
│   │   ├── Common/                         # Shared UI components (ErrorBoundary, Toast, MathRenderer)
│   │   ├── Header.tsx                      # Top bar navigation, course switcher, Dean live view switch
│   │   ├── LecturePage/                    # Video lecture player, transcript grounding & mastery modal
│   │   ├── LoginScreen.tsx                 # Flat, high-contrast landing page with live proof panel
│   │   ├── Personalization/                # 5-step cognitive learning style questionnaire modal
│   │   ├── SmartAITutor/                   # Two-pane Socratic tutor UI with deadline context
│   │   ├── StudentDashboard/               # Student feed, Smart Notes editor, 3D Flashcards & Quizzes
│   │   ├── TeacherDashboard/               # Assignment hub, rubric grader, timeline editor, analytics
│   │   ├── VisionNoteAudit/                # Grade 11-12 Science board review & doubt clustering
│   │   ├── VisionNoteImport/               # Google Classroom / CSV / OCR bulk note import modal
│   │   ├── VisionNoteLectures/             # Lecture studio workspace & board-note synchronization
│   │   └── VisionNoteRealtime/             # Real-time WebSocket note feed from classroom cameras
│   ├── lib/                                # Client Utilities & Domain Helpers
│   │   ├── personaRecraft.ts               # Cognitive persona adaptation heuristics
│   │   ├── quizGenerator.ts                # Deterministic note-to-quiz synthesis engine
│   │   └── supabase.ts                     # Real-time Supabase cloud synchronization client
│   ├── mock/                               # Fallback seed data & demo fixtures
│   │   └── fakeData.ts                     # Comprehensive institutional initial profiles
│   ├── server/                             # Backend Business Logic & Cognitive Services
│   │   ├── classsarthiSeed.ts              # Synced physics, chemistry, maths lecture repository
│   │   ├── conversationalEngine.ts         # Natural language conversational fallback engine
│   │   ├── db.ts                           # InMemory database manager + JSON disk synchronizer
│   │   ├── gemini.ts                       # Multi-modal Gemini AI integration & structured schemas
│   │   ├── knowledgeBase.ts                # Institutional curriculum knowledge base corpus
│   │   ├── security.ts                     # Security headers, sanitizers, rate limiters, RBAC
│   │   ├── socraticKnowledge.ts            # Topic-grounded Socratic guardrails & misconceptions
│   │   ├── supabaseUsers.ts                # Supabase user table synchronization
│   │   ├── supabaseWorker.ts               # Background cloud sync worker daemon
│   │   └── vaultArchive.ts                 # Disaster recovery snapshots & workspace restore
│   ├── App.tsx                             # Master App router, global state store & tab routing
│   ├── index.css                           # Tailwind CSS v4 base typography, variables & reset
│   ├── main.tsx                            # React DOM bootstrap entrypoint
│   └── types.ts                            # Unified TypeScript domain models & interfaces
├── tests/                                  # Automated Feature Validation & Bug Hunter Suite
│   ├── 01_auth_rbac.test.ts                # Authentication, token generation & RBAC tests
│   ├── 02_academic_modules.test.ts         # Subjects, timelines, assignments & rubric tests
│   ├── 03_visionnote_classsarthi.test.ts   # Lecture streaming, OCR board captures & doubt detection
│   ├── 04_smart_notes_mastery.test.ts      # Note AI tools, flashcards, quiz bridge & persona tests
│   ├── 05_socratic_ai_tutor.test.ts        # Socratic guardrails, math KaTeX & context injection
│   ├── 06_security_bug_hunter.test.ts      # OWASP headers, XSS, prototype pollution & vault tests
│   ├── features_catalog.ts                 # Formal registry of all 25 institutional capabilities
│   ├── run_all_tests.ts                    # Master test runner with markdown report generator
│   └── test_helpers.ts                     # Isolated HTTP test server & assertion utilities
├── build-api.cjs                           # Automated serverless build & packaging script
├── package.json                            # Dependencies, npm scripts & engine constraints
├── render.yaml                             # Render container deployment configuration
├── server.ts                               # Unified Express server & Vite development middleware
├── TEST_FEATURE_AND_BUG_REPORT.md          # Generated test report (100% pass record)
├── tsconfig.json                           # TypeScript compiler configuration
├── vercel.json                             # Vercel serverless routing & SPA rewrite configuration
└── vite.config.ts                          # Vite bundler plugins & build configuration
```

---

## 4. Domain Data Models & Schema Reference

All domain models are strongly typed in `src/types.ts`. Below is the complete entity dictionary:

### 4.1 User & Identity (`User`)
Represents students, faculty members, and institutional administrators (Deans/Registrars).

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (`student-1`, `teacher-1`, `admin-1`, or UUID) |
| `name` | `string` | Full legal name of user |
| `email` | `string` | Institutional email address |
| `username` | `string` | Institutional login username |
| `password` | `string` | Protected account password |
| `role` | `'student' \| 'teacher' \| 'admin'` | RBAC authorization role |
| `institutionalId`| `string` | Campus Roll Number / Faculty ID (`BMU-2026-7052`) |
| `department` | `string` | Department affiliation (`Applied Sciences`, `CSE`, `ECE`) |
| `program` | `string` | Degree program (`B.Tech First Year`, `Grade 11 PCM`) |
| `enrolledSubjectIds`| `string[]` | Array of course IDs student is enrolled in |
| `teachingSubjectIds`| `string[]` | Array of course IDs faculty member instructs |
| `gpa` | `number` | Cumulative academic GPA (out of 10.0 or 4.0) |
| `learningProfile`| `LearnerPersona` | Cognitive tuning profile for student AI personalization |

### 4.2 Learner Cognitive Persona (`LearnerPersona`)
Enables adaptive AI scaffolding tailored to student psychology and target goals.

| Field | Type | Description |
| :--- | :--- | :--- |
| `learningStyle` | `'visual' \| 'step_by_step' \| 'intuitive' \| 'exam_prep'` | Preferred explanation structure |
| `pacePreference`| `'slow_thorough' \| 'standard' \| 'rapid_review'` | Speed of problem decomposition |
| `targetGrade` | `'competitive_exam' \| 'academic_mastery' \| 'foundational_pass'` | Rigor level of practice problems |
| `strengths` | `string[]` | Recognized conceptual domains (e.g. `Vectors`, `Calculus`) |
| `areasForImprovement`| `string[]` | Flagged weak concepts (e.g. `Free Body Diagrams`, `Friction`) |
| `questionnaireCompleted`| `boolean` | Flag indicating onboarding questionnaire completion |

### 4.3 Subject Offering (`Subject`)
Represents an institutional course section with syllabus topics and credit weighting.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique course ID (`subj-phy`, `subj-che`, `subj-mat`) |
| `code` | `string` | Short course code (`PHY-101`, `CHE-102`, `MAT-101`) |
| `name` | `string` | Full descriptive title |
| `description` | `string` | Course overview and objectives |
| `teacherId` | `string` | User ID of primary instructor |
| `teacherName` | `string` | Display name of instructor |
| `teacherEmail`| `string` | Contact email of instructor |
| `credits` | `number` | Academic credit weighting (e.g. 4 credits) |
| `department` | `string` | Department offering the subject |
| `syllabusTopics`| `string[]` | Array of curricular unit topics |
| `enrolledCount`| `number` | Total number of enrolled students |

### 4.4 ClassSarthi Lecture & Synchronized Studio (`ClassSarthiLecture`)
Synchronizes classroom video playback, speech transcripts, blackboard captures, and mastery checks.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique lecture ID (`lec-phy-1101`) |
| `subjectId` | `string` | Linked subject ID (`subj-phy`) |
| `title` | `string` | Lecture title (`Newton's Laws & Friction`) |
| `videoUrl` | `string` | Video stream URL or embedded YouTube lecture |
| `duration` | `string` | Full duration formatted string (`48:15`) |
| `transcript` | `LectureTranscriptSegment[]` | Array of timestamped quotes and spoken content |
| `boardCaptures`| `BoardCapture[]` | High-res chalkboard snapshots with KaTeX math |
| `timelineEvents`| `LectureTimelineEvent[]` | Key concept timestamps (`08:42: Normal Force`) |
| `masteryQuiz` | `LectureMasteryQuiz` | 5-question post-lecture diagnostic assessment |
| `doubtsDetected`| `ClassDoubtCluster[]` | Aggregated student confusion points |

---

## 5. Core Feature Modules & Workflows

### 5.1 Three-Tier Role-Based Portals (RBAC)

```
                                    +-----------------------+
                                    |     EduSync Auth      |
                                    |   POST /api/auth/login|
                                    +-----------+-----------+
                                                |
                 +------------------------------+------------------------------+
                 |                              |                              |
                 v                              v                              v
      +--------------------+         +--------------------+         +--------------------+
      |  Student Hub       |         | Faculty Command    |         | Registrar & Dean OS|
      | - Smart Notes      |         | - Rubric Grading   |         | - Institutional KPI|
      | - Socratic AI Tutor|         | - Timeline Editor  |         | - User Provisioning|
      | - 3D Flashcards    |         | - Question Banks   |         | - Course Setup     |
      | - Lecture Studio   |         | - Class Diagnostics|         | - Vault Disaster Rec|
      | - Mastery Quizzes  |         | - Roster Gradebook |         | - Live View Switch |
      +--------------------+         +--------------------+         +--------------------+
```

1. **Student Learning Hub**:
   - Live stream of announcements, assignments, and milestones for enrolled subjects.
   - Markdown note playground with real-time auto-saving, KaTeX math preview, and one-click AI cognitive transformations.
   - 3D interactive flashcard decks with flip animations and hint toggling.
   - Interactive multiple-choice quiz runner with instantaneous feedback, scoring, and confetti celebrations.
2. **Faculty Command Center**:
   - Comprehensive Assignment Hub allowing instructors to create problem sets with weighted multi-criterion rubrics.
   - Student submission grader with instant AI suggested grades and custom written feedback.
   - Syllabus Timeline Manager for scheduling lectures, milestone exams, and AI-generating curriculum timelines.
   - Question Bank Hub enabling faculty to upload custom exam questions that directly ground student practice quizzes.
   - AI Class Analytics providing grade distribution curves, class averages, and automated weak-topic risk clustering.
3. **Registrar & Dean OS**:
   - Institutional dashboard displaying campus-wide KPIs: total students, faculty count, active courses, and average institutional GPA.
   - User Provisioning suite for registering students and teachers individually or via Google Classroom CSV bulk import.
   - Live Dean Audit Switcher: Deans can instantly simulate student or faculty portal views without logging out.
   - Vault Archive Engine: Point-in-time workspace snapshot backups and one-click disaster recovery restoration.

---

### 5.2 Smart Socratic AI Tutor (`POST /api/tutor`)

The Socratic AI Tutor is engineered with strict pedagogical guardrails that distinguish it from generic chatbot wrappers:

```
Student Prompt: "Can you give me the answer to Problem #3 on Newton's Second Law?"
                                 │
                                 ▼
           +───────────────────────────────────────────+
           | Socratic Pedagogy Guardrail Filter        |
           | Checks: Direct answer request detected?   |
           +─────────────────────┬─────────────────────+
                                 │
                 ┌───────────────┴───────────────┐
                 │ YES                           │ NO
                 ▼                               ▼
+──────────────────────────────────+   +──────────────────────────────────+
| Refusal & Decomposition Response |   | Concept Inquiry Scaffolding      |
| "I cannot solve your homework for|   | Injects current lecture context, |
| you. Instead, let's look at the  |   | board OCR formulas, and asks     |
| forces: What is the normal force |   | targeted guiding questions with  |
| acting on an inclined plane?"    |   | KaTeX formatting.                |
+──────────────────────────────────+   +──────────────────────────────────+
```

- **Pedagogical Guardrail**: Refuses to provide direct assignment answers or solve homework problems outright.
- **First-Principles Decomposition**: Breaks complex multi-step problems into fundamental physical, mathematical, or chemical principles.
- **Context Injection**: Automatically injects student subject enrollment, current active unit, upcoming exam dates, and student cognitive learning style.
- **Curriculum Grounding**: References specific textbook chapters (e.g. OpenStax University Physics Vol 1) and recommended YouTube lecture tutorials.

---

### 5.3 ClassSarthi Lecture Studio & Board OCR Visuals

- **Synchronized Video Player**: Timestamp-synchronized playback linking video frames to transcript captions and board notes.
- **Blackboard OCR Visuals**: Automatically extracts classroom chalkboard equations into clear KaTeX formulas ($F_{net} = m \cdot a$, $\vec{N} = m g \cos\theta$).
- **Lecture Mastery Checkpoints**: Post-lecture 5-question quizzes evaluating understood concepts versus misconceptions.
- **Automated Doubt Detection**: Aggregates student confusion points across lectures and clusters them for teacher review in `AIClassAnalytics.tsx`.

---

## 6. Complete API Reference

All API routes accept JSON payloads and return JSON responses. Protected routes require `Authorization: Bearer <token>`.

### 6.1 Authentication & User Management

#### `POST /api/auth/login`
Authenticates user credentials and issues a Bearer token.
- **Body:** `{ "identifier": "student.dhruva", "password": "EduSync@260101", "role": "student" }`
- **Response (200):**
  ```json
  {
    "success": true,
    "token": "eyJ1c2VySWQiOiJzdHVkZW50LTEiLCJyb2xlIjoic3R1ZGVudCIsImRhdGUiOjE3MjU1ODAwMDAwMDB9",
    "user": { "id": "student-1", "name": "Student Dhruva", "role": "student", "department": "Applied Sciences" }
  }
  ```

#### `GET /api/auth/public-users`
Retrieves public directory of registered users for quick persona switching.
- **Response (200):** `{ "users": [ ... ] }`

#### `GET /api/auth/me`
Validates active session token and returns the current user profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):** `{ "authenticated": true, "user": { ... } }`

#### `POST /api/auth/switch-user` (or `/api/auth/switch`)
Dean/Admin exclusive endpoint to switch active audit view.
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:** `{ "userId": "student-1" }`
- **Response (200):** `{ "success": true, "token": "<switched_token>", "user": { ... } }`

#### `POST /api/users/bulk-import`
Imports student roster from Google Classroom CSV or SIS export.
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:** `{ "csvText": "Name,Email,Roll\nAarav,aarav@edusync.edu,1101", "targetSubjectIds": ["subj-phy"] }`
- **Response (200):** `{ "success": true, "importedCount": 1, "users": [ ... ] }`

---

### 6.2 Academic Core & Assignments

#### `GET /api/subjects`
Returns course listings filtered by role (enrolled courses for students, taught courses for faculty, all for deans).

#### `POST /api/subjects`
Creates a new course offering (Faculty/Admin only).
- **Body:** `{ "code": "PHY-101", "name": "Classical Mechanics", "credits": 4, "department": "Applied Sciences", "syllabusTopics": ["Kinematics", "Newton's Laws"] }`

#### `POST /api/subjects/:id/enroll`
Enrolls a student into a course.

#### `GET /api/timelines/:subjectId`
Retrieves syllabus timeline items and reference courseware resources.

#### `POST /api/assignments`
Creates a new assignment with weighted rubric criteria.
- **Body:**
  ```json
  {
    "subjectId": "subj-phy",
    "title": "Problem Set 3: Friction & Inclined Planes",
    "description": "Analyze free body diagrams for objects on ramps.",
    "points": 100,
    "dueDate": "2026-09-15",
    "rubric": [
      { "criterion": "Free Body Diagram Accuracy", "maxPoints": 40, "description": "All force vectors labeled correctly" },
      { "criterion": "Mathematical Formulation", "maxPoints": 40, "description": "Step-by-step KaTeX derivation" },
      { "criterion": "Final Calculation & Units", "maxPoints": 20, "description": "Correct numerical answer with SI units" }
    ]
  }
  ```

#### `POST /api/submissions`
Submits student homework responses and attachments.

#### `POST /api/submissions/:id/grade`
Grades student submission against rubric criteria and records feedback.

---

### 6.3 Smart Notes & AI Cognitive Services

#### `POST /api/tutor`
Engages the Socratic AI Tutor with real-time course and deadline context grounding.
- **Body:** `{ "prompt": "Why is normal force mg cos theta on a ramp?", "subjectId": "subj-phy", "history": [] }`

#### `POST /api/ai/notes/summarize`
Extracts executive summary and key takeaways from markdown notes.

#### `POST /api/ai/notes/flashcards`
Synthesizes interactive Q&A flashcard deck with hints from note text.

#### `POST /api/ai/notes/quiz`
Transforms student notes into a 5-question multiple-choice practice quiz grounded in teacher question banks.

#### `POST /api/ai/persona/recraft-note`
Adapts note explanations according to student cognitive persona (`visual`, `step_by_step`, `intuitive`, `exam_prep`).

#### `POST /api/ai/class-diagnostics`
Generates classroom performance curves, student risk clusters, and actionable intervention plans.

---

### 6.4 Security, Vault & Disaster Recovery

#### `GET /api/security/audit`
Executes automated 14-point OWASP Top 10 security self-test and returns status report.

#### `POST /api/vault/archive-reset`
Creates point-in-time institutional snapshot and resets workspace to clean state.

#### `GET /api/vault/snapshots`
Lists all available disaster recovery snapshots.

#### `POST /api/vault/restore`
Restores institutional database to a selected snapshot state.

---

## 7. Pre-Configured Institutional Test Credentials

The platform is pre-seeded with complete institutional profiles across all three roles:

| Role | Display Name | Username / ID | Default Password | Enrolled / Assigned Courses |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Student Dhruva | `student.dhruva` | `EduSync@260101` | Physics, Calculus, EME, ESS |
| **Student** | Aarav Sharma | `aarav.sharma` | `Student@2026!` | Grade 11 Physics, Chemistry, Maths |
| **Faculty** | Dr. Sanmitra Bhattacharya | `prof.sanmitra` | `Teacher@ESS26` | Environmental & Earth Sciences |
| **Faculty** | Dr. Rajesh Kulkarni | `prof.rajesh` | `Physics@2026!` | Senior Secondary Physics (Grades 11 & 12) |
| **Faculty** | Prof. Vikramaditya Roy | `prof.vikram` | `Maths@2026!` | Higher Mathematics & Calculus |
| **Dean / Admin** | Dr. Maneek Singh | `dean.maneek` | `Dean@EduSync2026!` | Dean of Academic Welfare & Registrar |

---

## 8. Verification, Testing & Deployment Guide

### 8.1 Running Automated Tests
EduSync includes a built-in automated test suite verifying all 25 institutional features across 6 distinct test suites:

```bash
# Execute master test suite
npx tsx tests/run_all_tests.ts
```

**Verification Results:**
- Total Tests: **49 / 49 Passed (100%)**
- TypeScript Compilation: **0 errors (`npm run lint`)**
- Production Bundling: **0 errors (`npm run build`)**
- OWASP Security Self-Test: **Grade A+ (14/14 checks passed)**

### 8.2 Local Development
```bash
# 1. Install dependencies
npm install

# 2. Launch development server with Vite HMR
npm run dev

# 3. Access in browser
# Local URL: http://localhost:3000
```

### 8.3 Production Cloud Deployment

#### A. Standalone Container (Render / Docker)
```bash
# Build Vite client + esbuild server bundle
npm run build

# Start production Node.js server
npm start
```

#### B. Vercel Serverless Functions
Vercel automatically bundles `api/index.js` and routes frontend traffic via `vercel.json`:
- Dynamic Serverless Routing: `/api/*` -> `api/index.js`
- SPA Negative Lookahead Rewrite: `/((?!api/).*)` -> `index.html`

---

*EduSync — Designed & Engineered for Excellence in Higher Education & Applied Sciences.*
