export type UserRole = 'student' | 'teacher' | 'admin';

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

export interface LearnerPersona {
  learningStyle: 'visual' | 'step_by_step' | 'socratic' | 'exam_focused' | string;
  explanationTone?: 'intuitive_visual' | 'structured_rigorous' | 'socratic_dialogue' | 'bullet_summary' | string;
  preferredPace?: 'slow_thorough' | 'standard' | 'rapid_review' | string;
  pacePreference?: string;
  targetGrade?: 'competitive_exam' | 'academic_mastery' | 'foundational_pass' | 'A+' | string;
  strengthsAndInterests?: string[] | string;
  painPoints?: string[] | string;
  strengths?: string[];
  areasForImprovement?: string[];
  questionnaireCompleted?: boolean;
  completedAt?: string;
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

export interface CustomTutorPersona {
  id: string;
  name: string;
  tagline?: string;
  specialty?: string;
  prompt: string;
  avatarInitials?: string;
  initials?: string;
  subject?: string;
  isDefault?: boolean;
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
