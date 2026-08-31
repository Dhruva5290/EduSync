# EduSync: Comprehensive Project Context & Developer Handoff

> **Document Version:** 1.0.0  
> **Last Codebase Audit:** 2026-08-31  
> **Target Audience:** Core Developers, AI Coding Agents, Open Source Contributors  
> **Repository Root:** `c:/Users/ms/Downloads/edusync`

---

## 1. Project Overview

### 1.1 Purpose
**EduSync** is an institutional academic management and intelligent learning acceleration platform tailored for higher education (engineering, computer science, and applied sciences). It bridges the gap between institutional course management (Google Classroom/Canvas LMS style schedules, assignments, and gradebooks) and personalized AI cognitive scaffolding (Socratic AI Tutor, AI Note Summarizer, Dynamic Quiz Generator, Class Analytics Diagnostics).

### 1.2 Main Features
1. **Three-Tier Role-Based Portal (RBAC)**:
   - **Student Learning Hub**: Subject feed, digitized markdown note-taking playground, AI flashcard decks, interactive quiz modals, assignment submission portal, and upcoming timeline calendar.
   - **Faculty Command Center**: Assignment hub with rubric grading, syllabus & milestone timeline editor with AI generation, student directory roster, and AI-powered class diagnostics.
   - **Registrar & Dean OS**: Institutional metrics, student/faculty registration, course creation with credit weighting, class assignment, and live Dean Audit Switcher for auditing student and teacher views.
2. **Smart Socratic AI Tutor (`/api/tutor`)**:
   - Two-pane interactive study assistant with live context injection (current subject, active unit, upcoming exams, overdue assignments).
   - Strict Socratic pedagogy guardrails (never solves homework directly; decomposes problems into first principles and provides scaffolded guiding questions).
   - Topic-grounded recommended video tutorials and textbook references.
3. **Smart Note Playground & AI Cognitive Tools**:
   - Rich Markdown note editor with auto-save and pinning.
   - AI-driven one-click summarization, key takeaway extraction, flashcard generation, and note-to-quiz generation.
4. **Security & Production Hardening**:
   - Strict HTTP security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
   - Recursive input sanitizer against XSS and prototype pollution.
   - Tiered rate limiters (Auth: 500 req/min with localhost relaxation, AI: 100 req/min, General API: 500 req/min).
   - Live Security Self-Audit Endpoint (`GET /api/security/audit`) with 100% test pass rate (Grade A+).

### 1.3 Tech Stack & Frameworks
- **Frontend**: React 19 (`react` ^19.0.1, `react-dom` ^19.0.1), TypeScript, Tailwind CSS v4 (`@tailwindcss/vite` ^4.1.14), Vite 6 (`vite` ^6.2.3), Motion (`motion` ^12.23.24), Canvas Confetti (`canvas-confetti`), Lucide React icons (`lucide-react` ^0.546.0).
- **Backend / API**: Node.js, Express (`express` ^4.21.2), TypeScript execution via `tsx`, Vite Dev Middleware in dev mode, static SPA serving in production.
- **AI Providers & SDKs**: `@google/genai` (Gemini 2.5 Flash), Google GenAI Interactions API, local institutional curriculum knowledge base fallback engine.
- **Database & Persistence**:
  - In-memory active database structure (`InMemoryDatabase` in `src/server/db.ts`).
  - Disk-backed JSON persistence (`data/users.json`) with auto-sync on user create, update, delete, and class assignment.
- **Authentication**: Custom Bearer Token (Base64 JSON session token encoding `{ userId, role, time }`) with client-side `localStorage` caching and server-side RBAC validation (`getAuthenticatedUser`, `requireRole`, `requireAuth`).

---

## 2. Website Architecture

### 2.1 Folder Structure
```
c:/Users/ms/Downloads/edusync/
├── data/                                 # Persistent database storage
│   └── users.json                        # Disk-backed user database
├── public/                               # Static web assets
│   ├── favicon.ico
│   └── logo.png                          # EduSync brand mark
├── src/                                  # Frontend & Backend Source
│   ├── api/                              # Modular API route handlers
│   │   └── tutor/
│   │       └── route.js                  # Standalone Socratic AI Tutor API route
│   ├── assets/                           # Media & icons
│   ├── components/                       # UI Component Modules
│   │   ├── AdminDashboard/
│   │   │   └── AdminDashboard.tsx        # Registrar & Dean portal (Metrics, Register, Courses)
│   │   ├── AIStudyAssistant/
│   │   │   └── StudyAssistantChat.tsx    # Multi-modal RAG study chatbot
│   │   ├── SmartAITutor/
│   │   │   ├── ChatInterface.jsx         # Socratic chat window with follow-up chips
│   │   │   ├── ResourceSidebar.jsx       # Deadlines, syllabus card, recommended resources
│   │   │   └── TutorLayout.jsx           # 2-pane Socratic tutor container
│   │   ├── StudentDashboard/
│   │   │   ├── FlashcardDeckModal.tsx    # Interactive 3D flip flashcard viewer
│   │   │   ├── InteractiveQuizModal.tsx  # Gamified quiz test runner with confetti
│   │   │   ├── ResourceFeed.tsx          # Student central feed & assignment viewer
│   │   │   └── SmartNotePlayground.tsx   # Markdown note editor + AI tools
│   │   ├── TeacherDashboard/
│   │   │   ├── AIClassAnalytics.tsx      # Diagnostic charts & student risk alerts
│   │   │   ├── AssignmentHub.tsx         # Problem set creator & submission grader
│   │   │   ├── StudentDirectoryHub.tsx   # Enrolled class directory & gradebook
│   │   │   └── TimelineManager.tsx       # Course schedule & reference resource manager
│   │   ├── Header.tsx                    # Top navigation, course selector, profile dropdown
│   │   └── LoginScreen.tsx               # Institutional login & 1-click credential selector
│   ├── server/                           # Backend Business Logic & Engines
│   │   ├── conversationalEngine.ts       # Natural language & conversational fallback
│   │   ├── db.ts                         # In-memory database + JSON disk loader/saver
│   │   ├── gemini.ts                     # Multi-modal Gemini AI integration services
│   │   ├── knowledgeBase.ts              # Institutional engineering curriculum corpus
│   │   └── security.ts                   # Security headers, sanitizers, rate limiters, RBAC
│   ├── App.tsx                           # Master React app router, state store, & layouts
│   ├── index.css                         # Tailwind CSS base styles & animations
│   ├── main.tsx                          # React DOM entry point
│   └── types.ts                          # Unified TypeScript models & interfaces
├── .env.example                          # Environment template
├── package.json                          # NPM dependencies & scripts
├── server.ts                             # Express server + Vite integration + API routes
├── tsconfig.json                         # TypeScript configuration
└── vite.config.ts                        # Vite bundler & plugin configuration
```

### 2.2 Application Data Flow Diagram
```mermaid
graph TD
    Client["React Frontend (Browser)"]
    Server["Express Backend (server.ts)"]
    Security["Security Layer (security.ts)<br>Headers | Sanitizer | RateLimiter"]
    DB["Database Layer (db.ts)<br>InMemory + data/users.json"]
    AI["AI Services (gemini.ts & knowledgeBase.ts)<br>@google/genai (Gemini 2.5 Flash)"]

    Client -->|HTTP Requests (REST + Bearer Token)| Security
    Security -->|Sanitized & Rate-Checked Request| Server
    Server -->|Read / Write State| DB
    Server -->|Generate Prompts / Study Insights| AI
    AI -->|Structured JSON / Socratic Guidance| Server
    DB -->|Persist Users / Notes / Analytics| Server
    Server -->|JSON Response| Client
```

---

## 3. Models & Database Schema

### 3.1 Entity Summary Table

| Model Name | Primary Key | Key Relationships | Persistent Storage | Description |
| :--- | :--- | :--- | :--- | :--- |
| `User` | `id` (string) | References `enrolledSubjectIds`, `teachingSubjectIds` | `data/users.json` | Student, Faculty, or Administrator institutional identity |
| `Subject` | `id` (string) | Owned by `teacherId` (`User.id`) | Memory / Seed | Academic course offering (credits, room, syllabus topics) |
| `TimelineItem` | `id` (string) | Belongs to `subjectId` (`Subject.id`) | Memory / Seed | Lecture, exam, quiz, practical, or assignment milestone |
| `ReferenceResource`| `id` (string) | Belongs to `subjectId` (`Subject.id`) | Memory / Seed | Textbook, lecture note PDF, research paper, video guide |
| `Assignment` | `id` (string) | Belongs to `subjectId` (`Subject.id`) | Memory / Seed | Course problem set with rubrics and point value |
| `Submission` | `id` (string) | Belongs to `assignmentId` & `studentId` | Memory / Seed | Student submission with text/file, grade, and feedback |
| `StudentNote` | `id` (string) | Belongs to `studentId` & `subjectId` | Memory / Seed | Markdown note with summaries, flashcards, and quizzes |
| `ClassAnalytics` | `subjectId` | 1-to-1 with `Subject.id` | Memory / Seed | Aggregated class performance, grade curves, weak topics |
| `Flashcard` | `id` (string) | Child of `StudentNote.flashcards` | Embedded | Q&A flashcard item with hint and topic |
| `GeneratedQuiz` | `id` (string) | Child of `StudentNote.quiz` | Embedded | Multi-question multiple-choice practice quiz |

### 3.2 Detailed TypeScript Entity Definitions
All models are defined in `src/types.ts`:

- **User**: `id`, `name`, `email`, `username`, `password`, `role` (`'student' | 'teacher' | 'admin'`), `institutionalId`, `department`, `gender`, `program`, `enrolledSubjectIds`, `teachingSubjectIds`, `gpa`, `academicYear`, `officeLocation`, `officeHours`, `status`, `phone`, `designation`.
- **Subject**: `id`, `code`, `name`, `description`, `teacherId`, `teacherName`, `teacherEmail`, `color`, `accentBg`, `enrolledCount`, `semester`, `room`, `syllabusTopics`, `credits`, `schedule`, `department`.
- **Assignment**: `id`, `subjectId`, `title`, `description`, `richTextInstructions`, `points`, `createdDate`, `dueDate`, `strictDueDate`, `attachments`, `rubric` (`{ criterion, maxPoints, description }[]`), `tags`, `submissionCount`.
- **Submission**: `id`, `assignmentId`, `studentId`, `studentName`, `studentEmail`, `submissionText`, `fileAttachment`, `submittedAt`, `status` (`'submitted' | 'graded' | 'late'`), `grade`, `maxPoints`, `feedback`, `aiSuggestedGrade`, `aiFeedbackSummary`.
- **StudentNote**: `id`, `studentId`, `subjectId`, `title`, `content`, `tags`, `lastModified`, `isPinned`, `summary`, `keyTakeaways`, `flashcards`, `quiz`.
- **TimelineItem**: `id`, `subjectId`, `title`, `type` (`'exam' | 'quiz' | 'practical' | 'assignment' | 'lecture' | 'milestone'`), `date`, `startTime`, `endTime`, `location`, `description`, `topicsCovered`, `weightagePercent`, `status`.
- **ClassAnalytics**: `subjectId`, `subjectName`, `totalStudents`, `classAverage`, `submissionRate`, `atRiskStudentsCount`, `gradeDistribution`, `weakTopics`, `trends`, `aiExecutiveSummary`, `keyActionItems`, `lastGenerated`.

---

## 4. API Documentation

### 4.1 Security & System
- `GET /api/security/audit`
  - **Source:** `server.ts`
  - **Auth:** None (Public)
  - **Returns:** `{ timestamp, overallScore, grade, checks: [...] }`

### 4.2 Authentication & User Management
- `POST /api/auth/login`
  - **Source:** `server.ts`
  - **Auth:** Public / Rate-limited (`authRateLimiter`)
  - **Body:** `{ identifier: string, password?: string, role?: string }`
  - **Returns:** `{ success: true, token: string, user: User }`
- `GET /api/auth/public-users`
  - **Source:** `server.ts`
  - **Auth:** Public
  - **Returns:** `{ users: User[] }`
- `GET /api/auth/me`
  - **Source:** `server.ts`
  - **Auth:** Bearer Token (Optional: returns `{ authenticated: false, allUsers }` if omitted)
  - **Returns:** `{ authenticated: boolean, user: User | null, allUsers: User[], allDemoUsers: User[] }`
- `POST /api/auth/switch-user` (or `POST /api/auth/switch`)
  - **Source:** `server.ts`
  - **Auth:** Bearer Token (Admin / Dean only)
  - **Body:** `{ userId: string }`
  - **Returns:** `{ success: true, token: string, user: User }`
- `GET /api/users`
  - **Source:** `server.ts`
  - **Query:** `?role=student&department=CSE&search=dhruva`
  - **Returns:** `User[]`
- `POST /api/users`
  - **Source:** `server.ts`
  - **Body:** `NewStudentPayload` | `NewTeacherPayload`
  - **Returns:** `{ success: true, user: User }` (auto-persists to `data/users.json`)
- `PUT /api/users/:id`
  - **Source:** `server.ts`
  - **Body:** Partial user fields
  - **Returns:** `{ success: true, user: User }`
- `DELETE /api/users/:id`
  - **Source:** `server.ts`
  - **Auth:** Admin only (`requireRole(['admin'])`)
  - **Returns:** `{ success: true, message: string }`

### 4.3 Subjects, Timelines & Resources
- `GET /api/subjects` / `GET /api/subjects/all` / `GET /api/subjects/:id`
  - **Source:** `server.ts`
  - **Returns:** Filtered `Subject[]` based on user role and enrollment.
- `POST /api/subjects`
  - **Source:** `server.ts`
  - **Auth:** Teacher / Admin
  - **Body:** `NewClassPayload`
  - **Returns:** `Subject`
- `POST /api/subjects/:id/enroll` / `POST /api/subjects/:id/unenroll`
  - **Source:** `server.ts`
  - **Body:** `{ studentIds: string[] }` or `{ studentId: string }`
  - **Returns:** `{ success: true, enrolledCount: number }`
- `POST /api/students/:id/assign-classes`
  - **Source:** `server.ts`
  - **Body:** `{ subjectIds: string[] }`
  - **Returns:** `{ success: true, user: User }`
- `GET /api/timelines/:subjectId` / `POST /api/timelines` / `DELETE /api/timelines/:id`
  - **Source:** `server.ts`
  - **Returns:** `TimelineItem[]`
- `GET /api/resources/:subjectId` / `POST /api/resources` / `DELETE /api/resources/:id`
  - **Source:** `server.ts`
  - **Returns:** `ReferenceResource[]`

### 4.4 Assignments & Submissions
- `GET /api/assignments/:subjectId` / `POST /api/assignments`
  - **Source:** `server.ts`
  - **Returns:** `Assignment[]`
- `GET /api/submissions/:subjectId` / `POST /api/submissions`
  - **Source:** `server.ts`
  - **Body:** `{ assignmentId, submissionText, fileAttachment }`
  - **Returns:** `Submission`
- `POST /api/submissions/:id/grade`
  - **Source:** `server.ts`
  - **Auth:** Teacher only
  - **Body:** `{ grade: number, feedback: string }`
  - **Returns:** `Submission`

### 4.5 Notes Playground
- `GET /api/notes/:subjectId` / `GET /api/notes`
  - **Source:** `server.ts`
  - **Returns:** `StudentNote[]` (isolated per student)
- `POST /api/notes`
  - **Source:** `server.ts`
  - **Body:** `{ id?, subjectId, title, content, tags, isPinned, summary?, flashcards?, quiz? }`
  - **Returns:** `StudentNote`
- `DELETE /api/notes/:id`
  - **Source:** `server.ts`
  - **Returns:** `{ success: true }`

### 4.6 AI & Socratic Tutor Endpoints
- `POST /api/tutor`
  - **Source:** `src/api/tutor/route.js` & `server.ts`
  - **Body:** `{ message: string, studentContext: object, history?: array }`
  - **Returns:** `{ reply: string, followUpQuestions: string[], recommendedResources: object[] }`
- `POST /api/ai/chat` (or `/api/ai/study-assistant/chat`)
  - **Source:** `server.ts` -> `src/server/gemini.ts`
  - **Body:** `{ message: string, subjectId: string, history?: array, mode?: string }`
  - **Returns:** `StudyAssistantResult`
- `POST /api/ai/research`
  - **Source:** `server.ts` -> `src/server/gemini.ts`
  - **Body:** `{ prompt: string, subjectId: string }`
  - **Returns:** `{ topicOverview, keyConcepts, recommendedVideos, booksAndPapers, suggestedPracticeQuestions }`
- `POST /api/ai/summarize-note` (or `/api/ai/notes/summarize`)
  - **Source:** `server.ts` -> `src/server/gemini.ts`
  - **Body:** `{ content: string, subjectId?: string, noteId?: string }`
  - **Returns:** `{ summary: string, keyTakeaways: string[] }`
- `POST /api/ai/notes/generate`
  - **Source:** `server.ts` -> `src/server/gemini.ts`
  - **Body:** `{ prompt: string, subjectId: string, depth?: string, attachedText?: string }`
  - **Returns:** `{ title: string, content: string, tags: string[] }`
- `POST /api/ai/generate-flashcards` (or `/api/ai/notes/flashcards`)
  - **Source:** `server.ts` -> `src/server/gemini.ts`
  - **Body:** `{ content: string, noteId?: string }`
  - **Returns:** `{ flashcards: Flashcard[] }`
- `POST /api/ai/note-to-quiz` (or `/api/ai/notes/quiz`)
  - **Source:** `server.ts` -> `src/server/gemini.ts`
  - **Body:** `{ content: string, title?: string, noteId?: string }`
  - **Returns:** `{ quiz: GeneratedQuiz }`
- `POST /api/ai/quiz/generate`
  - **Source:** `server.ts` -> `src/server/gemini.ts`
  - **Body:** `{ prompt: string, subjectId: string, count?: number }`
  - **Returns:** `{ quiz: GeneratedQuiz }`
- `POST /api/ai/class-diagnostics`
  - **Source:** `server.ts` -> `src/server/gemini.ts`
  - **Body:** `{ subjectId: string }`
  - **Returns:** `{ analytics: ClassAnalytics }`
- `POST /api/ai/generate-syllabus`
  - **Source:** `server.ts` -> `src/server/gemini.ts`
  - **Body:** `{ courseName: string, description: string, weeksCount?: number, subjectId?: string }`
  - **Returns:** `{ timelineItems: array, timelines: array }`

---

## 5. Notes System Flow

```
[User Types Markdown in UI or Uploads Scanned OCR Text]
                       ↓
[SmartNotePlayground.tsx (Debounced Auto-Save & Manual Actions)]
                       ↓
[HTTP POST /api/notes (Payload: title, content, tags, subjectId)]
                       ↓
[Input Sanitizer Middleware (security.ts) -> Neutralizes Script & Event Handlers]
                       ↓
[server.ts handlePostNote -> Upsert in db.notes]
                       ↓
[Optional Trigger: POST /api/ai/notes/summarize OR /api/ai/notes/quiz]
                       ↓
[gemini.ts (generateNoteQuizAI / summarizeNoteAI / generateFlashcardsAI)]
                       ↓
[Updated Note with Quiz / Flashcards cached in db.notes]
                       ↓
[GET /api/notes/:subjectId -> Hydrates SmartNotePlayground.tsx & ResourceFeed.tsx]
```

### Key Source Files Involved:
1. **Frontend Editor:** `src/components/StudentDashboard/SmartNotePlayground.tsx`
2. **Interactive Modals:** `FlashcardDeckModal.tsx`, `InteractiveQuizModal.tsx`
3. **Backend API Route:** `server.ts` (`/api/notes`)
4. **AI Generation Engine:** `src/server/gemini.ts`

---

## 6. Student Profile Storage & Governance

### 6.1 Profile Schema & Settings
The student profile model contains academic and administrative metadata:
- Identity: `id`, `name`, `email`, `username`, `password`, `institutionalId` (e.g. `260101`).
- Academic Standing: `program` (`'CSE' | 'ECE' | 'ME'`), `academicYear` (e.g., `'1st Year (Semester 1)'`), `gpa` (e.g., `8.95`), `status` (`'active' | 'probation' | 'graduated' | 'leave'`).
- Enrolled Classes: `enrolledSubjectIds: string[]`.

### 6.2 Permissions & Role Isolation
- **Student Role**:
  - Read-only access to course timelines, resources, and assignment prompts.
  - Can only submit to assignments and view their own personal grades and submissions.
  - Isolated access to personal notes (`n.studentId === user.id`).
  - Strict 403 Forbidden protection preventing deletion or tampering with user rosters.
- **Faculty Role**:
  - Full CRUD control over assigned course timelines, reference resources, and problem sets.
  - Access to student directory, class gradebook, and diagnostic analytics.
- **Admin / Dean Role**:
  - Unrestricted registration of students, faculty, and new courses.
  - Audit mode capability to switch into any student or teacher viewpoint.

---

## 7. Conversation & Chat Storage

### 7.1 Schema
- **StudyChatMessage / ChatMessage**:
  - `id`: string
  - `role` / `sender`: `'user' | 'assistant'`
  - `content` / `text`: string (Markdown + LaTeX formatted)
  - `timestamp`: ISO timestamp
  - `followUpQuestions`: `string[]` (Socratic interactive inquiry chips)
  - `recommendedResources`: `ReferenceResource[]`
  - `recommendedVideos`: `YouTubeVideoRecommendation[]`
  - `practiceQuestions`: `PracticeQuestionItem[]`
  - `quiz`: `GeneratedQuiz`

### 7.2 Session Management & Context Window
- **Client Side:** State is maintained in React component state (`ChatInterface.jsx` and `StudyAssistantChat.tsx`) during active sessions.
- **Invisible Academic Context:** The frontend packs `studentContext` (`{ currentSubject, currentUnit, upcomingExam, upcomingAssignments, overdueCount }`) and transmits it alongside the chat history.
- **Server Side:** `/api/tutor` and `/api/ai/chat` format prior messages into turn-by-turn history passed into Gemini 2.5 Flash.

---

## 8. Existing Bot / Q&A System

### 8.1 Entry Points
- **Smart AI Tutor (Socratic Method):** `src/components/SmartAITutor/TutorLayout.jsx`, `ChatInterface.jsx`, and `src/api/tutor/route.js`.
- **Multi-Modal AI Study Assistant (RAG Chat):** `src/components/AIStudyAssistant/StudyAssistantChat.tsx`.

### 8.2 Prompt Generation & Guardrails
- **Socratic System Prompt:** Defined in `src/api/tutor/route.js`. Mandates that the assistant *never* write final essays or solutions.
- **Curriculum Grounding Corpus:** `src/server/knowledgeBase.ts` and `src/server/conversationalEngine.ts` provide pre-computed, verified academic responses for core engineering subjects (Thermodynamics, C Programming, Multivariable Calculus, Environmental Studies, Engineering Ethics).

---

## 9. AI Integration Points

Locations in the codebase architected for extending AI capabilities:

1. **Student Misconception & Doubt Detection**:
   - `src/server/gemini.ts` -> `generateClassDiagnosticsAI()`: Can be expanded to cluster incoming student questions and flag conceptual bottlenecks to teachers.
2. **OCR Note Ingestion & Vector Indexing**:
   - `server.ts` -> `POST /api/notes`: Ideal interception hook for external OCR note scanning apps (e.g., Smart India Hackathon OCR note maker).
3. **Automated Submission Grading & Plagiarism Detection**:
   - `server.ts` -> `POST /api/submissions/:id/grade`: Can integrate LLM rubric analysis to auto-suggest grade scores and constructive feedback prior to faculty sign-off.
4. **Adaptive Practice Recommendation Engine**:
   - `src/components/SmartAITutor/ResourceSidebar.jsx`: Can query student quiz performance to recommend remedial video chapters and practice problem sets.

---

## 10. Doubt Extraction Integration Plan (OCR & Mobile App Integration)

### 10.1 Where Student Questions Originate
- **OCR Handwritten Notes:** Scanned pages uploaded from the companion OCR Note Making App.
- **AI Tutor Chat Interactions:** Questions typed into `ChatInterface.jsx` or `StudyAssistantChat.tsx`.
- **Diagnostic Quiz Mistakes:** Questions answered incorrectly in `InteractiveQuizModal.tsx`.

### 10.2 Recommended Ingestion API Endpoints
```typescript
// Proposed New Integration Endpoints
POST /api/doubts/extract
Body: { studentId: string, subjectId: string, rawTextOrOcr: string, source: 'ocr_note' | 'chat' | 'quiz' }
Returns: {
  detectedDoubts: Array<{
    concept: string;
    question: string;
    severity: 'critical' | 'moderate' | 'minor';
    recommendedRef: string;
  }>
}

POST /api/ocr/sync
Body: { studentId: string, subjectId: string, scannedPages: Array<{ pageNumber: number, ocrText: string, imageUri?: string }> }
Returns: { syncedNoteId: string, generatedFlashcards: number, extractedDoubtsCount: number }
```

### 10.3 Recommended Database Table / Schema
```typescript
export interface ExtractedDoubt {
  id: string;
  studentId: string;
  subjectId: string;
  sourceNoteId?: string;
  rawExcerpt: string;
  normalizedQuestion: string;
  topicTag: string;
  resolved: boolean;
  resolutionNote?: string;
  createdAt: string;
}
```

---

## 11. Developer Onboarding

### 11.1 Quick Start Commands
```bash
# 1. Clone repository
git clone <repo_url>
cd edusync

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Add GEMINI_API_KEY if testing live LLM generation

# 4. Start local development server (Frontend + Backend on port 3000)
npm run dev

# 5. Run TypeScript typecheck & linter
npm run lint

# 6. Build for production
npm run build
npm start
```

### 11.2 Environment Variables
- `PORT` (default: `3000`): Port for Express & Vite application server.
- `GEMINI_API_KEY`: Google Gemini API Key. If unset, the server seamlessly falls back to the embedded institutional engineering knowledge base.
- `NODE_ENV`: Set to `development` or `production`.

### 11.3 Automated Verification Scripts
```bash
# Run Security Penetration Test Suite
node scratch/test_security_suite.js

# Run User Registration & Disk Persistence Test
node scratch/test_registration_persistence.js

# Run Socratic AI Tutor Multi-Domain Test
node scratch/test_trained_ai.js
```
