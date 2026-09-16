export type UserRole = 'student' | 'teacher' | 'admin';

export interface LearnerPersona {
  learningStyle: 'visual' | 'step_by_step' | 'socratic_dialogue' | 'exam_focused' | 'socratic' | string;
  targetGrade?: 'A+' | 'A' | 'B' | 'competitive' | 'competitive_exam' | 'academic_mastery' | 'foundational_pass' | string;
  explanationTone?: 'encouraging_mentor' | 'strict_coach' | 'practical_engineer' | 'intuitive_visual' | 'structured_rigorous' | 'socratic_dialogue' | 'bullet_summary' | string;
  preferredPace?: 'accelerated' | 'steady' | 'thorough' | 'slow_thorough' | 'standard' | 'rapid_review' | string;
  pacePreference?: string;
  strengthsAndInterests?: string | string[];
  painPoints?: string | string[];
  strengths?: string[];
  areasForImprovement?: string[];
  questionnaireCompleted?: boolean;
  completedAt?: string;
  preferredLanguage?: 'en' | 'hi' | 'bilingual';
  cognitiveBlocker?: 'derivations' | 'formula_memorization' | 'visualization' | 'problem_speed';
  academicLevel?: 'class_10' | 'class_11_12' | 'competitive_jee_neet' | 'college_eng';
  diagnosticAnswers?: Record<string, string>;
}

export type ColorFlashcardCategory = 'trap' | 'formula' | 'intuition' | 'shortcut';

export interface ColorFlashcard {
  id?: string;
  category: ColorFlashcardCategory;
  front: string;
  back: string;
  tag: string;
  eli10Analogy?: string;
  keyFormula?: string;
  commonTrap?: string;
  visualHint?: string;
  asciiDiagram?: string;
}

export interface AgenticPersonalizedNote {
  id?: string;
  studentId: string;
  lectureId: string;
  generalizedNoteId?: string;
  customTitle: string;
  tailoredExplanationMarkdown: string;
  groundUpAnalogy: string;
  hindiVoiceSummary: string;
  englishVoiceSummary: string;
  asciiDiagram?: string;
  graphicDetails?: Array<{
    title: string;
    asciiArt: string;
    explanation: string;
  }>;
  doubtClarifications: Array<{
    doubt: string;
    clarification: string;
    keyTakeaway: string;
    eli10Analogy?: string;
    recommendedVideoId?: string;
  }>;
  pyqQuestions: Array<{
    examSource: string;
    question: string;
    solution: string;
    conceptTested: string;
    eli10Analogy?: string;
    trapToAvoid?: string;
  }>;
  practiceQuestions: Array<{
    question: string;
    hint: string;
    answer: string;
    eli10Hint?: string;
  }>;
  animatedVideos: Array<{
    title: string;
    youtubeSearchQuery: string;
    whyWatch: string;
    url?: string;
    videoId?: string;
    thumbnail?: string;
    timestampRef?: string;
    targetedMistake?: string;
  }>;
  flashcards: ColorFlashcard[];
  studyTimeRecommendation: string;
  reinforcedConcepts: string[];
  doubtPatternTriggers?: Array<{
    doubt: string;
    trapWarning: string;
    resolvedCount: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export type NavRoute =
  | 'dashboard'
  | 'classes'
  | 'ai-tutor'
  | 'assignments'
  | 'quiz'
  | 'faculty-analytics'
  | 'timeline-manager'
  | 'question-bank'
  | 'rubric-grader'
  | 'admin-metrics'
  | 'user-provisioning'
  | 'vault-recovery'
  | 'security-audit'
  | 'to-do-list'
  | 'plugins'
  | 'settings';

export type LearningStyle = 'visual' | 'step_by_step' | 'socratic' | 'exam_focused' | 'visual_learner' | 'verbal_listener' | 'practical_builder' | 'rapid_summarizer' | 'socratic_inquisitor';

export type AssignmentItem = Assignment;
export type FlashcardItem = Flashcard;
export interface RubricCriterion {
  id?: string;
  criterion?: string;
  name?: string;
  maxPoints?: number;
  points?: number;
  description?: string;
  weight?: number;
}
export type RubricItem = RubricCriterion;
export type TimelineType = 'lecture' | 'exam' | 'practical' | 'assignment' | 'quiz' | 'milestone' | string;
export interface SecurityAuditResult {
  id: string;
  category: string;
  name?: string;
  description?: string;
  status: 'passed' | 'warning' | 'critical' | string;
  details?: string;
  timestamp?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  gender?: string;
  designation?: string;
  academicYear?: string;
  role: UserRole;
  institutionalId?: string;
  studentId?: string;
  department?: string;
  program?: string;
  academicProgram?: string;
  avatarInitials?: string;
  avatar?: string;
  enrolledSubjectIds?: string[];
  teachingSubjectIds?: string[];
  gpa?: number;
  learningProfile?: LearnerPersona;
  officeLocation?: string;
  officeHours?: string;
  joinedDate?: string;
  phone?: string;
  status?: string;
}

export interface StudentProfile {
  name: string;
  email: string;
  studentId: string;
  department: string;
  academicProgram: string;
  explanationStyle: 'visual' | 'step-by-step' | 'socratic' | 'exam-focused' | string;
  avatarInitials: string;
  gpa?: number;
  grade?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  credits: number;
  department: string;
  syllabusTopics: string[];
  enrolledCount: number;
  colorTheme?: string;
  color?: string;
  accentBg?: string;
  room?: string;
  semester?: string;
  currentTopic?: string;
}

export interface TimelineItem {
  id: string;
  subjectId: string;
  subjectName?: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'lecture' | 'exam' | 'practical' | 'assignment' | 'quiz' | 'milestone' | string;
  status: 'completed' | 'current' | 'upcoming' | string;
  details?: string;
  description?: string;
  topicsCovered?: string[];
  room?: string;
  location?: string;
  weightagePercent?: number;
}

export interface ClassScheduleItem {
  id: string;
  title: string;
  code: string;
  instructor: string;
  room: string;
  timeSlot: string;
  status: 'Live Notes Ready' | 'Upcoming' | 'Scheduled' | 'Completed' | 'In Progress';
  statusColor: 'tertiary' | 'secondary' | 'neutral' | 'orange';
  tags: string[];
  quote?: string;
  notesSummary: string;
  fullNotesId: string;
  lectureClipDuration?: string;
}

export interface LectureArchiveItem {
  id: string;
  title: string;
  subjectTag?: string;
  subject?: string;
  category?: string;
  iconType?: string;
  duration?: string;
  date: string;
  description?: string;
  notesSummary?: string;
  tags?: string[];
  teacher?: string;
  fullNotesId?: string;
  formulaLatex?: string;
  ocrSnippet?: string;
}

export interface Assignment {
  id: string;
  subjectId?: string;
  subjectName?: string;
  subject?: string;
  instructor?: string;
  title: string;
  description: string;
  dueDate: string;
  dueStatus?: string;
  strictDueDate?: boolean | string;
  createdDate?: string;
  points: number;
  rubricCriteria?: string[];
  rubric?: any;
  rubricSummary?: string;
  feedback?: string;
  latePenalty?: string;
  grade?: string | number;
  score?: string | number;
  submittedFile?: string;
  status?: 'pending' | 'submitted' | 'graded';
  submissionCount?: number;
  relatedLectureId?: string;
  relatedLectureTitle?: string;
  createdAt?: string;
  urgent?: boolean;
  isUrgent?: boolean;
  tags?: string[];
  attachments?: string[];
  richTextInstructions?: string;
  rubricBreakdown?: {
    theoreticalRigor: number;
    mathematicalFormulation: number;
    unitsAndDiagrams: number;
  };
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  subjectId?: string;
  subjectName?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentAvatar?: string;
  submittedAt: string;
  content?: string;
  solutionText?: string;
  submissionText?: string;
  fileAttachment?: string;
  attachedFileName?: string;
  attachments?: string[];
  status: 'submitted' | 'graded' | 'pending';
  score?: number | string;
  maxScore?: number | string;
  maxPoints?: number | string;
  grade?: number | string;
  feedback?: string;
  aiSuggestedGrade?: number;
  aiFeedbackSummary?: string;
  rubricGrades?: Record<string, number>;
  sourceFile?: string;
}

export type StudentSubmission = Submission;

export interface TodoTask {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  dateStr?: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  category?: 'study' | 'assignment' | 'exam' | 'general';
}

export interface MCPConfig {
  provider: 'classsarthi_ai' | 'anthropic' | 'openai' | 'custom';
  mcpUrl?: string;
  apiKey?: string;
  authMethod: 'bearer' | 'header' | 'oauth2';
  capabilities: string[];
  status?: 'verified' | 'untested' | 'failed';
  lastTested?: string;
}

export interface CustomTutorPersona {
  id: string;
  name: string;
  tagline?: string;
  specialty?: string;
  prompt: string;
  avatarInitials?: string;
  initials?: string;
  subject?: string;
  bio?: string;
  method?: 'socratic' | 'feynman' | 'direct' | 'visual' | 'project_based' | 'custom' | string;
  mcpConfig?: MCPConfig;
  status?: 'approved' | 'pending_approval' | 'rejected' | 'draft';
  submittedAt?: string;
  approvedAt?: string;
  authorId?: string;
  authorName?: string;
  adminNotes?: string;
  isDefault?: boolean;
}

export type PluginId = 'google_classroom' | 'gmail' | 'google_calendar' | 'notion';

export interface AutomationRule {
  id: string;
  pluginId: PluginId;
  ruleName: string;
  description: string;
  enabled: boolean;
  trigger: string;
  action: string;
  lastSyncDetails?: string;
}

export interface PluginSyncHistoryItem {
  id: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  summary: string;
  itemsSynced?: number;
}

export interface PluginConnection {
  id: string;
  pluginId: PluginId;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  accountEmail?: string;
  lastSync?: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  permissions: string[];
  rules: AutomationRule[];
  syncHistory: PluginSyncHistoryItem[];
  icon: string;
  category: 'classroom' | 'communication' | 'productivity' | 'notes';
  settings?: Record<string, any>;

  // --- Backend only (Tokens should not be sent to frontend) ---
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: number;
  syncToken?: string; // used for incremental syncs
}

export interface TutorApprovalRequest {
  id: string;
  tutorId: string;
  tutorName: string;
  authorId: string;
  authorName: string;
  specialty: string;
  method: string;
  prompt: string;
  mcpConfig?: MCPConfig;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  testResult?: {
    question: string;
    response: string;
    latencyMs: number;
    success: boolean;
  };
}


export interface QuizOption {
  key: 'A' | 'B' | 'C' | 'D' | string;
  text: string;
}

export interface QuizQuestion {
  id: string | number;
  question: string;
  tag?: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  options: any;
  correctKey?: 'A' | 'B' | 'C' | 'D' | string;
  correctIndex?: number;
  hint?: string;
  explanation?: string;
  source?: 'ai_generated' | 'teacher_question_bank' | string;
  teacherName?: string;
}

export interface GeneratedQuiz {
  id: string;
  title?: string;
  topic: string;
  questions: QuizQuestion[];
  createdAt: string;
  hasTeacherQuestions?: boolean;
  teacherQuestionsCount?: number;
}

export interface LectureQuizAnalysis {
  summary: string;
  score?: number;
  totalQuestions?: number;
  percentage?: number;
  masteryLevel: 'Mastered' | 'Proficient' | 'Needs Review';
  difficultyBreakdown: {
    easy: { correct: number; total: number };
    moderate: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
  keyMisconceptions: string[];
  suggestedTutorTopic: string;
  suggestedTutorPrompt: string;
}

export interface Flashcard {
  id: string;
  question?: string;
  answer?: string;
  hint?: string;
  front?: string;
  back?: string;
  topic?: string;
  subject?: string;
  mastered?: boolean;
  formulaLatex?: string;
}

export interface ReferenceResource {
  id: string;
  subjectId: string;
  title: string;
  url: string;
  type?: 'pdf' | 'doc' | 'slides' | 'link' | 'video' | string;
  topicTag?: string;
  category?: string;
  author?: string;
  description?: string;
  keyTopics?: string[];
  dateAdded?: string;
}

export interface QuestionBankItem {
  id: string;
  subjectId?: string;
  subjectName?: string;
  topic: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'easy' | 'moderate' | string;
  type?: 'concept' | 'numerical' | 'derivation' | 'proof' | string;
  marks?: number;
  source: string;
  sampleAnswer?: string;
  formulaLatex?: string;
  options?: any;
  correctIndex?: number;
  explanation?: string;
  questionBankTitle?: string;
  teacherName?: string;
}

export interface QuestionBank {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  questionsCount: number;
  questions: QuestionBankItem[] | QuizQuestion[] | any;
  teacherId?: string;
  teacherName?: string;
  uploadedAt?: string;
}

export interface VaultSnapshot {
  id: string;
  name?: string;
  title?: string;
  timestamp: string;
  size?: string;
  recordCount?: any;
  sizeBytes?: any;
  status?: string;
  stateCounts?: {
    students: number;
    subjects: number;
    assignments: number;
    notes: number;
  };
}

export interface SecurityAuditItem {
  id: string;
  category: string;
  status: 'passed' | 'warning' | 'critical';
  details: string;
  timestamp: string;
}

export interface FacultyAnalyticsData {
  classAverage: number;
  submissionRate: number;
  atRiskCount: number;
  topPerformingTopic: string;
  weakestTopic: string;
  distribution: { grade: string; count: number; percentage: number }[];
  weakTopics: {
    topic: string;
    errorRate: number;
    affectedStudents: number;
    urgency: 'high' | 'medium' | 'low';
  }[];
}

export interface StudentNote {
  id: string;
  studentId?: string;
  subjectId: string;
  subjectName?: string;
  title: string;
  content: string;
  tags: string[];
  lastModified?: string;
  lastEdited?: string;
  pinned?: boolean;
  isPinned?: boolean;
  isPersonalized?: boolean;
  summary?: string;
  keyTakeaways?: string[];
  flashcards?: Flashcard[];
  formulas?: any[];
  quiz?: GeneratedQuiz;
  source?: 'manual' | 'visionnote' | 'ocr_stream';
  cameraSnapshotUrl?: string;
  doubtsDetected?: string[];
  generalisedNotes?: string;
  personalisedNotes?: string;
  rawOcrText?: string;
}

export interface VisionNotePayload {
  id?: string;
  studentId: string;
  grade?: '11' | '12' | string;
  subject?: 'Physics' | 'Chemistry' | 'Mathematics' | string;
  subjectId?: string;
  title: string;
  content: string;
  tags?: string[];
  cameraSnapshotUrl?: string;
  doubtsDetected?: string[];
  source?: 'manual' | 'visionnote' | 'ocr_stream';
  timestamp?: string;
}

export interface WeakTopic {
  topic: string;
  errorRate: number;
  averageScore: number;
  affectedStudents: number;
  recommendedRemediation: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface ClassPerformanceTrend {
  week: string;
  avgScore: number;
  submissionRate: number;
  activeCount: number;
}

export interface GradeDistributionItem {
  range: string;
  count: number;
  percentage: number;
}

export interface ClassAnalytics {
  subjectId: string;
  subjectName: string;
  totalStudents: number;
  classAverage: number;
  submissionRate: number;
  atRiskStudentsCount: number;
  gradeDistribution: GradeDistributionItem[];
  weakTopics: WeakTopic[];
  trends: ClassPerformanceTrend[];
  aiExecutiveSummary: string;
  keyActionItems: string[];
  lastGenerated: string;
}

export interface YouTubeVideoRecommendation {
  title: string;
  url?: string;
  searchQuery: string;
  channelOrTopic: string;
  duration?: string;
  description?: string;
  thumbnail?: string;
}

export interface PracticeQuestionItem {
  question: string;
  answer: string;
  topic?: string;
  hint?: string;
}

export interface GroundingSourceItem {
  title: string;
  uri: string;
}

export interface StudyChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tutor' | 'system' | string;
  content: string;
  timestamp: string;
  recommendedVideos?: YouTubeVideoRecommendation[];
  practiceQuestions?: PracticeQuestionItem[];
  referencedMaterials?: string[];
  referencedResources?: ReferenceResource[];
  groundingSources?: GroundingSourceItem[];
  quiz?: GeneratedQuiz;
  mode?: 'general' | 'research' | 'videos' | 'questions' | 'quiz';
}

export interface ChatMessage {
  id: string;
  sender?: 'user' | 'assistant' | 'tutor' | 'system' | string;
  role?: 'user' | 'assistant' | 'tutor' | 'system' | string;
  text?: string;
  content?: string;
  timestamp: string;
  method?: string;
  videoClip?: {
    title: string;
    source?: string;
    duration?: string;
  };
  isSocraticPrompt?: boolean;
  suggestions?: string[];
  recommendedVideos?: YouTubeVideoRecommendation[];
  practiceQuestions?: PracticeQuestionItem[];
  sources?: string[];
  referencedResources?: ReferenceResource[];
  groundingSources?: GroundingSourceItem[];
  quiz?: GeneratedQuiz;
}

export interface LectureTimelineEvent {
  id: string;
  timestamp: string;
  timestampSeconds: number;
  title: string;
  teacherQuote: string;
  notes: string;
  boardImageUrl?: string;
  formulaLatex?: string;
  diagramUrl?: string;
  keyTakeaway?: string;
}

export interface BoardCapture {
  id: string;
  lectureId: string;
  lectureTitle: string;
  subjectId: string;
  subjectName: string;
  timestamp: string;
  title: string;
  imageUrl: string;
  ocrLatex?: string;
  diagramType?: string;
  conceptTag: string;
  explanation: string;
}

export interface ClassSarthiLecture {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  teacherName: string;
  teacherId: string;
  date: string;
  duration: string;
  summary: string;
  topics: string[];
  timeline: LectureTimelineEvent[];
  boardCaptures: BoardCapture[];
  audioTranscript: Array<{ timestamp: string; speaker: string; text: string }>;
  generalizedNotes: {
    explanation: string;
    importantConcepts: Array<{ name: string; description: string; formulaLatex?: string }>;
    formulas: Array<{ name: string; latex: string; explanation: string }>;
    examples: Array<{ problem: string; solution: string; latex?: string }>;
    keyPoints: string[];
    diagrams: Array<{ title: string; imageUrl: string; description: string }>;
    homeworkMentioned: Array<{ task: string; dueDate?: string; context: string }>;
  };
  smartNotesMarkdown: string;
  homeworkAssignmentId?: string;
}

export interface MasteryQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTag: string;
  questionType: 'concept' | 'formula' | 'application' | 'reasoning' | 'numerical';
  timestampRef: string;
  misconceptionHint?: string;
}

export interface LectureMasteryQuiz {
  id: string;
  lectureId: string;
  lectureTitle: string;
  subjectId: string;
  questions: MasteryQuizQuestion[];
}

export interface QuizEvaluationResult {
  score: number;
  total: number;
  percentage: number;
  understoodConcepts: string[];
  weakConcepts: string[];
  recommendations: string[];
  questionBreakdown: Array<{
    questionId: string;
    question: string;
    userAnswerIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    conceptTag: string;
    explanation: string;
    timestampRef: string;
    misconception?: string;
  }>;
  suggestedTutorPrompt: string;
}

export interface StudentConceptMastery {
  concept: string;
  subjectId: string;
  masteryScore: number;
  timesTested: number;
  needsRevision: boolean;
  lastTestedDate: string;
}

export interface StudentDashboardSummary {
  todayClasses: Array<{
    id: string;
    subjectCode: string;
    subjectName: string;
    time: string;
    room: string;
    teacherName: string;
    topic: string;
  }>;
  recentLectures: ClassSarthiLecture[];
  unfinishedLectures: Array<{
    lecture: ClassSarthiLecture;
    lastTimestamp: string;
    progressPercent: number;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    subjectName: string;
    dueDate: string;
    status: 'pending' | 'submitted' | 'graded';
    relatedLectureTitle: string;
  }>;
  topicsNeedingRevision: Array<{
    concept: string;
    subjectName: string;
    masteryScore: number;
    reason: string;
    relatedLectureId: string;
    timestampRef: string;
  }>;
  recentQuizPerformance: {
    lastQuizTitle: string;
    score: number;
    total: number;
    understoodCount: number;
    revisionCount: number;
    date: string;
  } | null;
  recommendedStudy: Array<{
    title: string;
    type: 'revision' | 'lecture' | 'practice';
    reason: string;
    actionId: string;
    subjectId: string;
  }>;
}

export interface ClassLevelInsight {
  subjectId: string;
  subjectName: string;
  classSize: number;
  weakConcepts: Array<{
    concept: string;
    struggleRatePercent: number;
    affectedStudentCount: number;
    totalStudents: number;
    recommendation: string;
    relatedLectureId: string;
    timestampRef: string;
  }>;
  studentsFallingBehind: Array<{
    id: string;
    name: string;
    gpa: number;
    weakConceptCount: number;
    urgent: boolean;
  }>;
}

// =======================================================
// CLASSSARTHI FOR TEACHERS - ADVANCED FACULTY WORKSPACE TYPES
// =======================================================

export type AttendanceRiskLevel = 'safe' | 'warning_75' | 'danger_60';

export interface TeacherScheduleSlot {
  id: string;
  subjectId?: string;
  subjectCode: string;
  subjectName: string;
  section?: string;
  division?: string;
  dayOfWeek?: string;
  startTime: string;
  endTime: string;
  room?: string;
  roomNumber?: string;
  allottedStudentsCount?: number;
  totalStudents?: number;
  todayTopic?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'Upcoming' | 'In Progress' | 'Completed';
  attendanceTaken?: boolean;
  isAttendanceTaken?: boolean;
}

export interface StudentAttendanceItem {
  id?: string;
  studentId: string;
  rollNo?: string;
  rollNumber?: string;
  studentName?: string;
  name?: string;
  email?: string;
  contactEmail?: string;
  guardianPhone?: string;
  avatar?: string;
  division?: string;
  subjectCode?: string;
  totalClassesHeld: number;
  classesAttended: number;
  currentPercentage?: number;
  attendancePercentage?: number;
  riskLevel: AttendanceRiskLevel;
  todayStatus: 'present' | 'absent' | 'late' | 'unmarked';
  lastMarkedAt?: string;
  consecutiveAbsences: number;
}
export type StudentAttendanceRecord = StudentAttendanceItem;

export interface AntiProxyDiscrepancy {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  date: string;
  earlySlotTime: string;
  earlySlotSubject: string;
  subsequentSlotTime: string;
  subsequentSlotSubject: string;
  flagReason: string;
  status: 'unresolved' | 'justified' | 'reported_to_dean';
  teacherNote?: string;
}

export interface StudentTelemetryMetric {
  id?: string;
  studentId: string;
  studentName?: string;
  name?: string;
  rollNo?: string;
  rollNumber?: string;
  division?: string;
  avatar?: string;
  avgScore?: number;
  currentGrade?: string;
  attendancePercentage?: number;
  studyHoursOnPlatform?: number;
  studyHours?: number;
  doubtsAskedCount?: number;
  doubtsRaised?: number;
  questionsSolvedCount?: number;
  drillsSolved?: number;
  growthRatePercent?: number;
  growthTrajectoryPercent?: number;
  trajectory?: 'accelerating' | 'steady' | 'needs_boost';
  lastActiveDate?: string;
  recentDoubtTopics?: string[];
  weeklyPerformanceScores?: number[];
  identifiedMistakes?: string[];
  laggingConcepts?: string[];
  remediationAction?: string;
}
export type StudentTelemetrySummary = StudentTelemetryMetric;

export interface CommonDoubtCluster {
  id: string;
  subjectId?: string;
  subjectCode?: string;
  topicName?: string;
  topicTitle?: string;
  doubtCount?: number;
  flaggedCount?: number;
  affectedStudentNames?: string[];
  sampleDoubts?: string[];
  commonStudentQuestion?: string;
  remedialConcept?: string;
  actionScript?: string;
  aiRemediationSuggestion?: string;
  urgency?: 'high' | 'medium' | 'low';
  priority?: 'High' | 'Medium' | 'Low';
}
export type CommonDoubtTopic = CommonDoubtCluster;

export interface TeacherQuickStickyNote {
  id: string;
  teacherId?: string;
  title: string;
  content: string;
  color: 'yellow' | 'blue' | 'emerald' | 'purple' | 'rose';
  priority: 'high' | 'medium' | 'low' | 'urgent' | 'normal';
  reminderTime?: string;
  isCompleted?: boolean;
  completed?: boolean;
  createdAt?: string;
}
export type TeacherStickyNote = TeacherQuickStickyNote;

export interface TeacherLessonTask {
  id: string;
  subjectId?: string;
  subjectCode?: string;
  task: string;
  dueDate: string;
  isDone?: boolean;
  completed?: boolean;
  createdAt?: string;
}

export interface TeacherLeaveRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  leaveType: 'Casual Leave' | 'Paid Leave' | 'Duty Leave' | 'Medical Leave' | 'Academic Conference';
  startDate: string;
  endDate: string;
  dateOfJoining?: string;
  totalDays: number;
  reason: string;
  substituteTeacher: string;
  contactPhone?: string;
  handoverNotes?: string;
  status: 'Pending HOD Approval' | 'Approved' | 'Rejected';
  appliedAt: string;
}

export interface TeacherAttendanceLog {
  teacherId: string;
  date: string;
  punchInTime?: string;
  punchOutTime?: string;
  status: 'Present' | 'On Duty' | 'Not Punched';
}

export interface AcademicCalendarEvent {
  id: string;
  subjectId: string;
  subjectCode: string;
  title: string;
  type: 'Quiz' | 'Mid-Term Exam' | 'Final Exam' | 'Assignment Deadline' | 'Lab Practical';
  date: string;
  time: string;
  room: string;
  totalStudents: number;
  submissionSubmittedCount?: number;
  submissionPendingCount?: number;
}

// =======================================================
// CLASSSARTHI STUDENT PORTAL (WIREFRAME ARCHITECTURE MODELS)
// =======================================================

export type TutorStyleId = 'feynman' | 'alakh_pandey' | 'niti_garg' | 'socrates' | string;

export interface TutorPersona {
  id: TutorStyleId;
  name: string;
  title: string;
  tagline: string;
  avatar: string;
  styleDescription: string;
  systemPrompt: string;
  accentColor: string;
  greetingMessage: string;
  badgeText: string;
  isCustom?: boolean;
}

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface StudentTaskItem {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  categoryTag: string;
  dueDate: string;
  dueTime?: string;
  completed: boolean;
  subtasks?: Array<{ id: string; text: string; done: boolean }>;
  source?: 'manual' | 'google_classroom' | 'gmail' | 'calendar';
  pomodoroSessions?: number;
  subjectCode?: string;
  createdAt: string;
}

export type PluginType = 'google_classroom' | 'google_calendar' | 'gmail' | 'bmu_portal' | 'custom_teacher';

export interface PluginIntegration {
  id: string;
  type: PluginType;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  autoSyncTasks: boolean;
  lastSyncedAt?: string;
  itemCountSynced?: number;
}

export interface StudentLectureCard {
  id: string;
  lectureNumber: number;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  topicsCovered: string[];
  date: string;
  time: string;
  duration: string;
  teacherName: string;
  room: string;
  isToday: boolean;
  notesMarkdown: string;
  keyFormulas?: Array<{ name: string; latex: string }>;
  boardCaptureThumb?: string;
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicRef: string;
}

export interface StudentQuizSubmission {
  id: string;
  subjectId: string;
  subjectCode: string;
  topicName: string;
  lectureRef?: string;
  dateTaken: string;
  questions: QuizQuestionItem[];
  userAnswers: Record<string, number>;
  score: number;
  total: number;
  mistakes: Array<{
    questionId: string;
    question: string;
    selectedOption: string;
    correctOption: string;
    mistakeReason: string;
    coreTakeaway: string;
  }>;
  suggestedTutorPrompt: string;
}

// =======================================================
// COMMAND CENTER SPECIFICATION TYPES
// =======================================================

export interface DoubtLogEntry {
  id: string;
  studentId: string;
  studentName: string;
  subjectCode: string;
  topic: string;
  question: string;
  frequencyCount: number;
  timestamp: string;
}

export interface DoubtPatternCluster {
  topic: string;
  frequencyBucket: 'High' | 'Moderate' | 'Low';
  count: number;
  sampleQuestions: string[];
  aiMisconceptionExplanation: string;
  subjectCode: string;
}

export interface TeacherMaterialItem {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  keyTopics: string[];
  subjectCode: string;
  uploadedAt: string;
  published: boolean;
  openedByCount: number;
  avgTimeSpentSeconds: number;
}

export interface MaterialViewEvent {
  studentId: string;
  materialId: string;
  openedAt: string;
  durationSeconds: number;
}

export interface TeacherBroadcastMessage {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  message: string;
  targetSections: string[];
  createdAt: string;
  pinned?: boolean;
}

export interface CalendarAcademicDay {
  date: string;
  isHoliday: boolean;
  holidayName?: string;
  events: Array<{
    id: string;
    title: string;
    type: 'Quiz' | 'Assignment Deadline' | 'Mid-Term Exam' | 'Regular Class' | 'Holiday';
    time?: string;
    subjectCode?: string;
  }>;
}

export interface SimulatedGateScanLog {
  id: string;
  teacherId: string;
  date: string;
  scanType: 'check_in' | 'check_out';
  timestamp: string;
  isSimulated: boolean;
  isManualOverride: boolean;
  gateLocation: string;
}

export interface ManagementStickyNote {
  id: string;
  title: string;
  content: string;
  from: string;
  isPinned: boolean;
  createdAt: string;
  priority?: 'high' | 'normal';
}

export interface TeacherChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
  createdAt: string;
}

export interface TeacherLeaveSubmission {
  id: string;
  teacherId: string;
  teacherName: string;
  startDate: string;
  endDate?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface DeskBoardSummary {
  hoursToday: number;
  hoursThisWeek: number;
  classesScheduledToday: number;
  classesCompletedToday: number;
}

export type AgentCallableIntent =
  | 'schedule_meeting'
  | 'mark_leave'
  | 'start_class'
  | 'cancel_class'
  | 'generate_doubt_report'
  | 'draft_announcement'
  | 'summarize_student'
  | 'sync_attendance';

export interface AgentActionProposal {
  id: string;
  intents: AgentCallableIntent[];
  parsedParameters: Record<string, any>;
  description: string;
  requiresConfirmation: boolean;
  status: 'pending_confirmation' | 'executed' | 'dismissed';
  executedAt?: string;
  resultSummary?: string;
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionProposal?: AgentActionProposal;
  isReadonlyResult?: boolean;
  resultData?: any;
}

// =======================================================
// STITCH CLASSSARTHI FACULTY PORTAL TYPES
// =======================================================

export type ScreenId =
  | 'daily-schedule'
  | 'student-attendance'
  | 'student-performance'
  | 'upload-documents'
  | 'academic-calendar'
  | 'teacher-workspace-and-leaves'
  | 'ai-teacher-assistant';

export type ScreenType = ScreenId;

export interface LectureSlot {
  id: string;
  timeStart: string;
  timeEnd: string;
  courseCode: string;
  courseTitle: string;
  division: string;
  studentsCount: number;
  room: string;
  roomDetail?: string;
  status: 'completed' | 'in_session' | 'upcoming';
  badgeLabel?: string;
  elapsed?: string;
  totalDuration?: string;
  attendanceInfo?: string;
  workstationsPrepared?: string;
  actionType: 'view_roster' | 'live_attendance' | 'notes' | 'lab_setup';
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  avatar: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  punchTime?: string;
  streak: boolean[];
  batch: string;
  quizScore: number;
  midTermReadiness: number;
  doubtsCount: number;
  isAtRisk?: boolean;
}

export interface StickyNote {
  id: string;
  tag: string;
  tagBg: string;
  tagText: string;
  dueText: string;
  content: string;
  completed: boolean;
  meta: string;
  urgent?: boolean;
  category: 'exam' | 'co-instructor' | 'lab' | 'general';
}

export interface LeaveRequest {
  id: string;
  type: 'Casual' | 'Medical' | 'Academic Duty' | 'Special' | 'Paid';
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  proxyFaculty: string;
  dateOfJoining?: string;
  contactPhone?: string;
  handoverNotes?: string;
  status: 'Approved' | 'Pending' | 'Reviewing';
  submittedDate: string;
}

export interface CourseDocument {
  id: string;
  title: string;
  courseCode: string;
  category: 'Notes & Slides' | 'Question Paper' | 'Lab Manual' | 'Reference' | 'Syllabus';
  fileSize: string;
  uploadedAt: string;
  status: 'Published' | 'Locked & Watermarked' | 'Draft';
  downloads: number;
}

export interface FlaggedDoubt {
  id: string;
  studentName: string;
  rollNo: string;
  courseCode: string;
  topic: string;
  question: string;
  submittedTime: string;
  resolved: boolean;
  priority: 'High' | 'Medium';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'exam' | 'lecture' | 'meeting' | 'holiday' | 'lab';
  courseCode?: string;
  room?: string;
}
