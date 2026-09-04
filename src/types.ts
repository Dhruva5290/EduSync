export type UserRole = 'teacher' | 'student' | 'admin';

export interface LearnerPersona {
  learningStyle: 'visual' | 'step_by_step' | 'socratic_dialogue' | 'exam_focused';
  targetGrade: 'A+' | 'A' | 'B' | 'competitive';
  explanationTone: 'encouraging_mentor' | 'strict_coach' | 'practical_engineer';
  preferredPace: 'accelerated' | 'steady' | 'thorough';
  strengthsAndInterests?: string;
  painPoints?: string;
  questionnaireCompleted: boolean;
  completedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  institutionalId: string;
  department: string;
  gender?: 'Male' | 'Female' | 'Other' | string;
  program?: string;
  enrolledSubjectIds: string[];
  teachingSubjectIds: string[];
  gpa?: number;
  academicYear?: string;
  officeLocation?: string;
  officeHours?: string;
  status?: 'active' | 'probation' | 'graduated' | 'leave';
  joinedDate?: string;
  phone?: string;
  designation?: string;
  learningProfile?: LearnerPersona;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  color: string;
  accentBg: string;
  enrolledCount: number;
  semester: string;
  room: string;
  syllabusTopics: string[];
  credits?: number;
  schedule?: string;
  department?: string;
}

export interface NewStudentPayload {
  name: string;
  email: string;
  username?: string;
  password?: string;
  department: string;
  academicYear: string;
  institutionalId?: string;
  initialSubjectIds?: string[];
  gpa?: number;
  phone?: string;
}

export interface NewTeacherPayload {
  name: string;
  email: string;
  username?: string;
  password?: string;
  department: string;
  designation: string;
  institutionalId?: string;
  officeLocation?: string;
  teachingSubjectIds?: string[];
  phone?: string;
}

export interface NewClassPayload {
  code: string;
  name: string;
  description: string;
  teacherId: string;
  semester: string;
  room: string;
  credits?: number;
  department?: string;
  syllabusTopics: string[];
  initialEnrolledStudentIds?: string[];
  color?: string;
}

export type TimelineType = 'exam' | 'quiz' | 'practical' | 'assignment' | 'lecture' | 'milestone';

export interface TimelineItem {
  id: string;
  subjectId: string;
  title: string;
  type: TimelineType;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  topicsCovered: string[];
  weightagePercent?: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface ReferenceResource {
  id: string;
  subjectId: string;
  title: string;
  category: 'Textbook' | 'Lecture Notes' | 'Research Paper' | 'Video Guide' | 'Lab Manual';
  url: string;
  archiveUrl?: string;
  author: string;
  description: string;
  keyTopics: string[];
  dateAdded: string;
}

export interface RubricItem {
  criterion: string;
  maxPoints: number;
  description: string;
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  richTextInstructions: string;
  points: number;
  createdDate: string;
  dueDate: string;
  strictDueDate: boolean;
  attachments: string[];
  rubric: RubricItem[];
  tags: string[];
  submissionCount?: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submissionText: string;
  fileAttachment?: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late';
  grade?: number;
  maxPoints?: number;
  feedback?: string;
  aiSuggestedGrade?: number;
  aiFeedbackSummary?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  topic?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty?: 'easy' | 'moderate' | 'hard';
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  topic: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface LectureQuizAnalysis {
  summary: string;
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

export interface StudentNote {
  id: string;
  studentId: string;
  subjectId: string;
  title: string;
  content: string;
  tags: string[];
  lastModified: string;
  isPinned: boolean;
  summary?: string;
  keyTakeaways?: string[];
  flashcards?: Flashcard[];
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
  errorRate: number; // e.g. 42%
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
  role: 'user' | 'assistant';
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
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedVideos?: YouTubeVideoRecommendation[];
  practiceQuestions?: PracticeQuestionItem[];
  sources?: string[];
  referencedResources?: ReferenceResource[];
  groundingSources?: GroundingSourceItem[];
  quiz?: GeneratedQuiz;
}

// =======================================================
// CLASSSARTHI + EDUSYNC UNIFIED PLATFORM DATA MODELS
// =======================================================

export interface LectureTimelineEvent {
  id: string;
  timestamp: string; // e.g. "05:32", "21:05"
  timestampSeconds: number;
  title: string;
  teacherQuote: string; // Exact or summarized speech from teacher
  notes: string; // Relevant notes for this section
  boardImageUrl?: string; // Captured blackboard frame
  formulaLatex?: string; // Formula rendered via LaTeX/KaTeX
  diagramUrl?: string; // Diagram/graph if available
  keyTakeaway?: string;
}

export interface BoardCapture {
  id: string;
  lectureId: string;
  lectureTitle: string;
  subjectId: string;
  subjectName: string;
  timestamp: string; // e.g. "21:05"
  title: string; // e.g. "Free Body Diagram", "VSEPR Geometry"
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
  timestampRef: string; // e.g. "21:05"
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
  masteryScore: number; // 0 - 100
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
    struggleRatePercent: number; // e.g. 62%
    affectedStudentCount: number;
    totalStudents: number;
    recommendation: string; // e.g. "62% of students struggled with Newton's Second Law. This topic may need to be explained again."
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
