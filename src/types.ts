export type UserRole = 'teacher' | 'student' | 'admin';

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
  gender?: 'Male' | 'Female';
  program?: 'CSE' | 'ECE' | 'ME';
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
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  topic: string;
  questions: QuizQuestion[];
  createdAt: string;
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
  groundingSources?: GroundingSourceItem[];
  quiz?: GeneratedQuiz;
}

