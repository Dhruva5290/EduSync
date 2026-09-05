/**
 * EduSync Complete Feature Catalog & Architectural Specification
 * Describes all institutional LMS, AI tutoring, cognitive scaffolding, and ClassSarthi features.
 */

export interface SystemFeature {
  id: string;
  category: string;
  name: string;
  description: string;
  endpoints: string[];
  userRoles: ('student' | 'teacher' | 'admin' | 'all')[];
  primaryComponents: string[];
  keyCapabilities: string[];
}

export const EDU_SYNC_FEATURES: SystemFeature[] = [
  {
    id: 'auth_rbac',
    category: 'Security & Access Control',
    name: 'Multi-Role Authentication & RBAC Engine',
    description: 'Bearer token session validation with Student, Faculty, and Admin role isolation and quick-credential switching.',
    endpoints: [
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/auth/switch',
      'GET /api/auth/public-users'
    ],
    userRoles: ['all'],
    primaryComponents: ['LoginScreen.tsx', 'Header.tsx', 'security.ts'],
    keyCapabilities: [
      'Multi-role token generation with expiration and signature protection',
      'Quick persona switcher for Dean live audit testing',
      'Institutional ID, email, and username resolution',
      'Fallback offline authentication when cloud connection is interrupted'
    ]
  },
  {
    id: 'academic_core',
    category: 'Academic Operations',
    name: 'Curriculum, Subjects & Syllabus Manager',
    description: 'Course enrollment, syllabus milestones, and reference learning resources directory.',
    endpoints: [
      'GET /api/subjects',
      'GET /api/subjects/:id',
      'POST /api/subjects',
      'POST /api/subjects/:id/enroll',
      'POST /api/subjects/:id/unenroll',
      'GET /api/timelines/:subjectId',
      'POST /api/timelines',
      'DELETE /api/timelines/:id',
      'GET /api/resources/:subjectId',
      'POST /api/resources',
      'DELETE /api/resources/:id'
    ],
    userRoles: ['student', 'teacher', 'admin'],
    primaryComponents: ['StudentHomeDashboard.tsx', 'TimelineManager.tsx', 'ResourceFeed.tsx'],
    keyCapabilities: [
      'Subject catalog creation, enrollment tracking, and capacity management',
      'Syllabus timeline milestones with deadline indicators',
      'Reference material curation with external links and attachments',
      'AI-assisted syllabus milestone generation'
    ]
  },
  {
    id: 'assignments_rubrics',
    category: 'Grading & Assessment',
    name: 'Assignment Command Center & Rubric Evaluator',
    description: 'Faculty assignment creation with weighted rubrics, student submissions, and graded feedback.',
    endpoints: [
      'GET /api/assignments/:subjectId',
      'POST /api/assignments',
      'GET /api/assignments/:id/submissions',
      'GET /api/submissions/:subjectId',
      'POST /api/submissions',
      'POST /api/submissions/:id/grade'
    ],
    userRoles: ['student', 'teacher'],
    primaryComponents: ['AssignmentHub.tsx', 'StudentHomeDashboard.tsx'],
    keyCapabilities: [
      'Rubric criteria weighting and maximum point enforcement',
      'Student text and file attachment assignment submissions',
      'Faculty rubric grading interface with automated total calculation',
      'Submission status tracking (submitted, graded, overdue)'
    ]
  },
  {
    id: 'classsarthi_studio',
    category: 'Classroom OCR & Lecture Intelligence',
    name: 'ClassSarthi Video Lecture Studio & Timeline Events',
    description: 'Synchronized video lecture player with real-time teacher quotes, blackboard OCR snapshots, and doubt markers.',
    endpoints: [
      'GET /api/lectures',
      'GET /api/lectures/:id',
      'POST /api/lectures/:id/ask-my-class',
      'POST /api/lectures/:id/personalize'
    ],
    userRoles: ['student', 'teacher'],
    primaryComponents: ['LectureExperiencePage.tsx', 'LectureNotesStudio.tsx', 'classsarthiSeed.ts'],
    keyCapabilities: [
      'Synchronized YouTube/video player with timestamp-indexed transcript events',
      'Teacher quote extraction with direct jump-to-time markers',
      'Chalkboard and slide OCR snapshots with KaTeX mathematical formulas',
      'Ask-My-Class AI tutor grounded specifically in the lecture transcript'
    ]
  },
  {
    id: 'board_visuals_audit',
    category: 'Blackboard Vision',
    name: 'VisionNote Blackboard Visuals & Institutional Audit Hub',
    description: 'Blackboard capture gallery, OCR transcription confidence auditing, and detected student doubt clustering.',
    endpoints: [
      'GET /api/board-captures',
      'GET /api/notes/vision-sync/status',
      'POST /api/notes/vision-sync/simulate',
      'POST /api/webhooks/ocr-ingest'
    ],
    userRoles: ['student', 'teacher', 'admin'],
    primaryComponents: ['VisionNoteAuditHub.tsx', 'BoardVisualsHub.tsx', 'VisionNoteImportModal.tsx'],
    keyCapabilities: [
      'High-resolution chalkboard zoom with KaTeX math equation extraction',
      'OCR confidence scoring and transcript validation',
      'Student doubt clustering from camera/microphone detection feeds',
      'Live WebSocket / Supabase Realtime synchronization simulation'
    ]
  },
  {
    id: 'mastery_quizzes',
    category: 'Cognitive Diagnostics',
    name: 'ClassSarthi Concept Mastery Quizzes & Student Diagnostics',
    description: 'Post-lecture mastery assessments, diagnostic tracking of misunderstood physics/math concepts, and mastery analytics.',
    endpoints: [
      'GET /api/lectures/:id/mastery-quiz',
      'POST /api/lectures/:id/quiz-evaluate',
      'GET /api/students/:id/dashboard-summary',
      'GET /api/teacher/class-insights/:subjectId',
      'GET /api/question-banks',
      'POST /api/question-banks'
    ],
    userRoles: ['student', 'teacher'],
    primaryComponents: ['MasteryQuizModal.tsx', 'AIClassAnalytics.tsx'],
    keyCapabilities: [
      'Automatic quiz question delivery with concept mapping (e.g. Free-Body Diagrams, $N \\neq mg$)',
      'Instant grading and personalized weakness diagnosis',
      'Dynamic student mastery score updates (e.g. understood vs. weak concepts)',
      'Teacher classroom confusion clustering and risk heatmaps'
    ]
  },
  {
    id: 'smart_notes_ai',
    category: 'Adaptive Study Tools',
    name: 'Smart Notes, AI Summarizer, Flashcards & Quiz Deck',
    description: 'Rich Markdown note-taking with AI enrichment, 3D interactive flashcards, and automated quiz generation.',
    endpoints: [
      'GET /api/notes/:subjectId',
      'POST /api/notes',
      'DELETE /api/notes/:id',
      'POST /api/notes/repersonalize',
      'POST /api/ai/summarize-note',
      'POST /api/ai/notes/generate',
      'POST /api/ai/generate-flashcards',
      'POST /api/ai/note-to-quiz'
    ],
    userRoles: ['student'],
    primaryComponents: ['SmartNotePlayground.tsx', 'FlashcardDeckModal.tsx', 'QuizRunnerModal.tsx'],
    keyCapabilities: [
      'Rich Markdown note editor with pin, export, and KaTeX mathematical equation rendering',
      'Adaptive AI note enrichment tailored to student weak concepts',
      '1-click note summarization and key takeaway extraction',
      '3D flip flashcard generation with hints and study test runner'
    ]
  },
  {
    id: 'socratic_ai_tutor',
    category: 'Socratic AI Tutoring',
    name: 'Timestamp-Grounded Socratic AI Tutor',
    description: 'Pedagogical Socratic dialogue engine with strict guardrails preventing direct homework solving, grounded in lectures.',
    endpoints: [
      'POST /api/tutor',
      'POST /api/ai/chat',
      'POST /api/ai/study-assistant/chat',
      'POST /api/ai/research'
    ],
    userRoles: ['student'],
    primaryComponents: ['TutorLayout.jsx', 'ChatInterface.jsx', 'ResourceSidebar.jsx', 'socraticKnowledge.ts'],
    keyCapabilities: [
      'Pedagogical Socratic prompting that guides students through guided questioning',
      'Grounded timestamp references to course lectures and textbook pages',
      'KaTeX LaTeX mathematical notation in real-time answers',
      'Curriculum-aware subject context injection (Physics, Calculus, CS)'
    ]
  },
  {
    id: 'faculty_command',
    category: 'Faculty & Analytics',
    name: 'Faculty Command Center & Class Diagnostics',
    description: 'Classroom gradebook, enrolled student rosters, weak concept risk clustering, and AI syllabus timeline generation.',
    endpoints: [
      'GET /api/analytics/:subjectId',
      'GET /api/teacher/class-insights/:subjectId',
      'POST /api/ai/class-diagnostics',
      'POST /api/ai/generate-syllabus'
    ],
    userRoles: ['teacher', 'admin'],
    primaryComponents: ['StudentDirectoryHub.tsx', 'AIClassAnalytics.tsx', 'AssignmentHub.tsx'],
    keyCapabilities: [
      'Enrolled student roster with individual GPA and submission status',
      'AI-powered classroom diagnostic report with topic confusion clusters',
      'Automated syllabus generation from topic prompts',
      'Grade distribution curves and at-risk student detection'
    ]
  },
  {
    id: 'dean_admin_os',
    category: 'Institutional Administration',
    name: 'Registrar & Dean OS (User Management & Vault Recovery)',
    description: 'Institutional metrics, bulk CSV/Google Classroom roster import, user provisioning, and snapshot backups.',
    endpoints: [
      'GET /api/admin/metrics',
      'GET /api/users',
      'POST /api/users',
      'PUT /api/users/:id',
      'DELETE /api/users/:id',
      'POST /api/users/bulk-import',
      'POST /api/admin/provision-department',
      'POST /api/admin/vault/archive-and-reset',
      'GET /api/admin/vault/list',
      'POST /api/admin/vault/restore',
      'GET /api/security/audit'
    ],
    userRoles: ['admin'],
    primaryComponents: ['AdminDashboard.tsx', 'vaultArchive.ts', 'security.ts'],
    keyCapabilities: [
      'Institutional KPI summary (students, faculty, active subjects, campus average GPA)',
      'Single and bulk student/faculty registration via CSV',
      'Disaster recovery snapshot creation and workspace restore',
      'Automated security compliance self-audit report'
    ]
  }
];
