import {
  TeacherScheduleSlot,
  StudentAttendanceItem,
  AntiProxyDiscrepancy,
  StudentTelemetryMetric,
  CommonDoubtCluster,
  TeacherQuickStickyNote,
  TeacherLessonTask,
  TeacherLeaveRequest,
  TeacherAttendanceLog,
  AcademicCalendarEvent,
  ReferenceResource,
  AttendanceRiskLevel
} from '../types';

// Storage keys for browser persistence
const STORAGE_KEYS = {
  SCHEDULE: 'classsarthi_teacher_schedule',
  ATTENDANCE: 'classsarthi_teacher_attendance_roster',
  ANTI_PROXY: 'classsarthi_teacher_antiproxy',
  TELEMETRY: 'classsarthi_teacher_telemetry',
  DOUBT_CLUSTERS: 'classsarthi_teacher_doubt_clusters',
  STICKY_NOTES: 'classsarthi_teacher_sticky_notes',
  TASKS: 'classsarthi_teacher_tasks',
  LEAVES: 'classsarthi_teacher_leaves',
  TEACHER_LOG: 'classsarthi_teacher_log',
  CALENDAR: 'classsarthi_teacher_calendar',
  RESOURCES: 'classsarthi_teacher_resources'
};

// ========================================================
// INITIAL SEED MOCK DATA
// ========================================================

const INITIAL_SCHEDULE_SLOTS: TeacherScheduleSlot[] = [
  {
    id: 'slot-1',
    subjectId: 'subj-ess',
    subjectCode: 'ES-101',
    subjectName: 'Environmental Studies & Sustainability',
    section: 'Division A',
    dayOfWeek: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    room: 'Science Block C - Room 304',
    allottedStudentsCount: 45,
    todayTopic: 'Atmospheric Inversion, PM2.5 Dynamics & Air Quality Index',
    status: 'completed',
    attendanceTaken: true
  },
  {
    id: 'slot-2',
    subjectId: 'subj-eme',
    subjectCode: 'ME-102',
    subjectName: 'Engineering Thermodynamics',
    section: 'Division B',
    dayOfWeek: 'Monday',
    startTime: '10:15 AM',
    endTime: '11:15 AM',
    room: 'Mechanical Wing - Room 201',
    allottedStudentsCount: 52,
    todayTopic: 'Second Law of Thermodynamics, Carnot Efficiency & Entropy Balances',
    status: 'ongoing',
    attendanceTaken: false
  },
  {
    id: 'slot-3',
    subjectId: 'subj-ess',
    subjectCode: 'ES-101',
    section: 'Division C',
    subjectName: 'Environmental Studies & Sustainability',
    dayOfWeek: 'Monday',
    startTime: '01:30 PM',
    endTime: '02:30 PM',
    room: 'Science Block C - Room 304',
    allottedStudentsCount: 42,
    todayTopic: 'Municipal Solid Waste Recycling & Circular Material Flows',
    status: 'upcoming',
    attendanceTaken: false
  },
  {
    id: 'slot-4',
    subjectId: 'subj-ess-lab',
    subjectCode: 'ES-101L',
    subjectName: 'Environmental Systems Laboratory',
    section: 'Division A (Batch 1)',
    dayOfWeek: 'Monday',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    room: 'Environmental Wet Lab C-12',
    allottedStudentsCount: 45,
    todayTopic: 'Spectrophotometric Analysis of Dissolved Oxygen & Chemical Oxygen Demand',
    status: 'upcoming',
    attendanceTaken: false
  }
];

const INITIAL_STUDENTS_ROSTER: StudentAttendanceItem[] = [
  {
    studentId: 'stud-101',
    rollNo: 'BMU-2026-7012',
    studentName: 'Rohan Verma',
    email: 'rohan.verma@bmu.edu.in',
    avatar: 'RV',
    totalClassesHeld: 26,
    classesAttended: 14,
    currentPercentage: 53.8,
    riskLevel: 'danger_60', // < 60%
    todayStatus: 'absent',
    consecutiveAbsences: 3
  },
  {
    studentId: 'stud-102',
    rollNo: 'BMU-2026-7018',
    studentName: 'Priya Sharma',
    email: 'priya.sharma@bmu.edu.in',
    avatar: 'PS',
    totalClassesHeld: 25,
    classesAttended: 17,
    currentPercentage: 68.0,
    riskLevel: 'warning_75', // < 75%
    todayStatus: 'present',
    consecutiveAbsences: 0
  },
  {
    studentId: 'stud-103',
    rollNo: 'BMU-2026-7052',
    studentName: 'Student Dhruva',
    email: 'student.dhruva@bmu.edu.in',
    avatar: 'SD',
    totalClassesHeld: 26,
    classesAttended: 24,
    currentPercentage: 92.3,
    riskLevel: 'safe', // >= 75%
    todayStatus: 'present',
    consecutiveAbsences: 0
  },
  {
    studentId: 'stud-104',
    rollNo: 'BMU-2026-7009',
    studentName: 'Aarav Patel',
    email: 'aarav.patel@bmu.edu.in',
    avatar: 'AP',
    totalClassesHeld: 24,
    classesAttended: 14,
    currentPercentage: 58.3,
    riskLevel: 'danger_60', // < 60%
    todayStatus: 'absent',
    consecutiveAbsences: 2
  },
  {
    studentId: 'stud-105',
    rollNo: 'BMU-2026-7034',
    studentName: 'Simran Kaur',
    email: 'simran.kaur@bmu.edu.in',
    avatar: 'SK',
    totalClassesHeld: 25,
    classesAttended: 18,
    currentPercentage: 72.0,
    riskLevel: 'warning_75', // < 75%
    todayStatus: 'present',
    consecutiveAbsences: 0
  },
  {
    studentId: 'stud-106',
    rollNo: 'BMU-2026-7041',
    studentName: 'Kavya Nair',
    email: 'kavya.nair@bmu.edu.in',
    avatar: 'KN',
    totalClassesHeld: 25,
    classesAttended: 22,
    currentPercentage: 88.0,
    riskLevel: 'safe',
    todayStatus: 'present',
    consecutiveAbsences: 0
  },
  {
    studentId: 'stud-107',
    rollNo: 'BMU-2026-7065',
    studentName: 'Aditya Malhotra',
    email: 'aditya.malhotra@bmu.edu.in',
    avatar: 'AM',
    totalClassesHeld: 25,
    classesAttended: 21,
    currentPercentage: 84.0,
    riskLevel: 'safe',
    todayStatus: 'present',
    consecutiveAbsences: 0
  },
  {
    studentId: 'stud-108',
    rollNo: 'BMU-2026-7088',
    studentName: 'Ananya Roy',
    email: 'ananya.roy@bmu.edu.in',
    avatar: 'AR',
    totalClassesHeld: 25,
    classesAttended: 16,
    currentPercentage: 64.0,
    riskLevel: 'warning_75', // < 75%
    todayStatus: 'late',
    consecutiveAbsences: 0
  },
  {
    studentId: 'stud-109',
    rollNo: 'BMU-2026-7102',
    studentName: 'Vikas Kumar',
    email: 'vikas.kumar@bmu.edu.in',
    avatar: 'VK',
    totalClassesHeld: 25,
    classesAttended: 12,
    currentPercentage: 48.0,
    riskLevel: 'danger_60', // < 60%
    todayStatus: 'absent',
    consecutiveAbsences: 4
  },
  {
    studentId: 'stud-110',
    rollNo: 'BMU-2026-7115',
    studentName: 'Meera Deshmukh',
    email: 'meera.deshmukh@bmu.edu.in',
    avatar: 'MD',
    totalClassesHeld: 26,
    classesAttended: 25,
    currentPercentage: 96.2,
    riskLevel: 'safe',
    todayStatus: 'present',
    consecutiveAbsences: 0
  },
  {
    studentId: 'stud-111',
    rollNo: 'BMU-2026-7128',
    studentName: 'Tanishq Iyer',
    email: 'tanishq.iyer@bmu.edu.in',
    avatar: 'TI',
    totalClassesHeld: 25,
    classesAttended: 18,
    currentPercentage: 72.0,
    riskLevel: 'warning_75',
    todayStatus: 'present',
    consecutiveAbsences: 0
  },
  {
    studentId: 'stud-112',
    rollNo: 'BMU-2026-7140',
    studentName: 'Ishaan Gupta',
    email: 'ishaan.gupta@bmu.edu.in',
    avatar: 'IG',
    totalClassesHeld: 24,
    classesAttended: 13,
    currentPercentage: 54.1,
    riskLevel: 'danger_60',
    todayStatus: 'absent',
    consecutiveAbsences: 3
  }
];

const INITIAL_ANTI_PROXY_ALERTS: AntiProxyDiscrepancy[] = [
  {
    id: 'proxy-1',
    studentId: 'stud-101',
    studentName: 'Rohan Verma',
    rollNo: 'BMU-2026-7012',
    date: '2026-09-12',
    earlySlotTime: '09:00 AM (ES-101)',
    earlySlotSubject: 'Environmental Studies',
    subsequentSlotTime: '10:15 AM (ME-102)',
    subsequentSlotSubject: 'Engineering Thermodynamics',
    flagReason: 'Marked Present in morning slot, but absent in consecutive slot without approved medical leave slip. Suspected proxy bunk.',
    status: 'unresolved'
  },
  {
    id: 'proxy-2',
    studentId: 'stud-109',
    studentName: 'Vikas Kumar',
    rollNo: 'BMU-2026-7102',
    date: '2026-09-12',
    earlySlotTime: '09:00 AM (ES-101)',
    earlySlotSubject: 'Environmental Studies',
    subsequentSlotTime: '10:15 AM (ME-102)',
    subsequentSlotSubject: 'Engineering Thermodynamics',
    flagReason: 'Device Wi-Fi biometric fingerprint mismatch logged between consecutive lecture halls.',
    status: 'unresolved'
  }
];

const INITIAL_STUDENT_TELEMETRY: StudentTelemetryMetric[] = [
  {
    studentId: 'stud-103',
    studentName: 'Student Dhruva',
    rollNo: 'BMU-2026-7052',
    avatar: 'SD',
    studyHoursOnPlatform: 34.5,
    doubtsAskedCount: 19,
    questionsSolvedCount: 112,
    growthRatePercent: 24.8,
    trajectory: 'accelerating',
    lastActiveDate: 'Today, 2:15 PM',
    recentDoubtTopics: ['Carnot Efficiency Formulas', 'Biochemical Oxygen Demand Titration']
  },
  {
    studentId: 'stud-110',
    studentName: 'Meera Deshmukh',
    rollNo: 'BMU-2026-7115',
    avatar: 'MD',
    studyHoursOnPlatform: 38.2,
    doubtsAskedCount: 22,
    questionsSolvedCount: 130,
    growthRatePercent: 28.1,
    trajectory: 'accelerating',
    lastActiveDate: 'Today, 1:40 PM',
    recentDoubtTopics: ['Clausius-Clapeyron Equation', 'Photochemical Smog Reaction Mechanism']
  },
  {
    studentId: 'stud-106',
    studentName: 'Kavya Nair',
    rollNo: 'BMU-2026-7041',
    avatar: 'KN',
    studyHoursOnPlatform: 27.0,
    doubtsAskedCount: 14,
    questionsSolvedCount: 88,
    growthRatePercent: 16.4,
    trajectory: 'steady',
    lastActiveDate: 'Yesterday, 8:10 PM',
    recentDoubtTopics: ['Entropy of Mixing', 'Acid Rain Neutralization Stoichiometry']
  },
  {
    studentId: 'stud-107',
    studentName: 'Aditya Malhotra',
    rollNo: 'BMU-2026-7065',
    avatar: 'AM',
    studyHoursOnPlatform: 25.4,
    doubtsAskedCount: 12,
    questionsSolvedCount: 76,
    growthRatePercent: 14.2,
    trajectory: 'steady',
    lastActiveDate: 'Today, 11:30 AM',
    recentDoubtTopics: ['Reversible vs Irreversible Heat Engines']
  },
  {
    studentId: 'stud-105',
    studentName: 'Simran Kaur',
    rollNo: 'BMU-2026-7034',
    avatar: 'SK',
    studyHoursOnPlatform: 19.8,
    doubtsAskedCount: 16,
    questionsSolvedCount: 52,
    growthRatePercent: 9.5,
    trajectory: 'steady',
    lastActiveDate: 'Yesterday, 6:45 PM',
    recentDoubtTopics: ['Eutrophication Nitrogen Cycles', 'Entropy Balance']
  },
  {
    studentId: 'stud-102',
    studentName: 'Priya Sharma',
    rollNo: 'BMU-2026-7018',
    avatar: 'PS',
    studyHoursOnPlatform: 16.2,
    doubtsAskedCount: 15,
    questionsSolvedCount: 44,
    growthRatePercent: 7.1,
    trajectory: 'needs_boost',
    lastActiveDate: '2 days ago',
    recentDoubtTopics: ['Turbidity Calibration Curves', 'Isothermal vs Adiabatic Work']
  },
  {
    studentId: 'stud-108',
    studentName: 'Ananya Roy',
    rollNo: 'BMU-2026-7088',
    avatar: 'AR',
    studyHoursOnPlatform: 14.5,
    doubtsAskedCount: 11,
    questionsSolvedCount: 38,
    growthRatePercent: 4.8,
    trajectory: 'needs_boost',
    lastActiveDate: '3 days ago',
    recentDoubtTopics: ['Ozone Depletion Catalytic Cycles']
  },
  {
    studentId: 'stud-111',
    studentName: 'Tanishq Iyer',
    rollNo: 'BMU-2026-7128',
    avatar: 'TI',
    studyHoursOnPlatform: 15.0,
    doubtsAskedCount: 13,
    questionsSolvedCount: 40,
    growthRatePercent: 5.2,
    trajectory: 'needs_boost',
    lastActiveDate: 'Yesterday, 9:20 PM',
    recentDoubtTopics: ['Solid Waste Leachate Control']
  },
  {
    studentId: 'stud-104',
    rollNo: 'BMU-2026-7009',
    studentName: 'Aarav Patel',
    avatar: 'AP',
    studyHoursOnPlatform: 8.2,
    doubtsAskedCount: 6,
    questionsSolvedCount: 18,
    growthRatePercent: -2.4,
    trajectory: 'needs_boost',
    lastActiveDate: '5 days ago',
    recentDoubtTopics: ['Carnot Cycle Steps']
  },
  {
    studentId: 'stud-101',
    rollNo: 'BMU-2026-7012',
    studentName: 'Rohan Verma',
    avatar: 'RV',
    studyHoursOnPlatform: 6.4,
    doubtsAskedCount: 4,
    questionsSolvedCount: 12,
    growthRatePercent: -6.8,
    trajectory: 'needs_boost',
    lastActiveDate: '6 days ago',
    recentDoubtTopics: ['Entropy Concept']
  },
  {
    studentId: 'stud-112',
    rollNo: 'BMU-2026-7140',
    studentName: 'Ishaan Gupta',
    avatar: 'IG',
    studyHoursOnPlatform: 5.8,
    doubtsAskedCount: 3,
    questionsSolvedCount: 10,
    growthRatePercent: -8.1,
    trajectory: 'needs_boost',
    lastActiveDate: '1 week ago',
    recentDoubtTopics: ['Atmospheric Inversion Layers']
  },
  {
    studentId: 'stud-109',
    rollNo: 'BMU-2026-7102',
    studentName: 'Vikas Kumar',
    avatar: 'VK',
    studyHoursOnPlatform: 3.5,
    doubtsAskedCount: 2,
    questionsSolvedCount: 6,
    growthRatePercent: -12.5,
    trajectory: 'needs_boost',
    lastActiveDate: '9 days ago',
    recentDoubtTopics: ['Basic Definitions']
  }
];

const INITIAL_COMMON_DOUBT_CLUSTERS: CommonDoubtCluster[] = [
  {
    id: 'cluster-1',
    subjectId: 'subj-eme',
    topicName: 'Second Law Clausius Inequality & Entropy Generation Calculation',
    doubtCount: 14,
    affectedStudentNames: ['Rohan Verma', 'Priya Sharma', 'Aarav Patel', 'Simran Kaur', 'Vikas Kumar'],
    sampleDoubts: [
      'Why is Clausius integral dQ/T <= 0 for irreversible cycle, but dS >= 0 for isolated system?',
      'How to calculate entropy generation in an uninsulated turbine with heat loss?',
      'Difference between entropy transferred by heat vs entropy generated internally.'
    ],
    aiRemediationSuggestion: '68% of student doubts originate from confusing heat transfer path dependence with state variable entropy. Recommended: Spend 5 minutes on the "Water Reservoir + Friction Waterfall" analogy before solving numerical problems.',
    urgency: 'high'
  },
  {
    id: 'cluster-2',
    subjectId: 'subj-ess',
    topicName: 'Biochemical Oxygen Demand (BOD5) Dilution Method & Seeding Factors',
    doubtCount: 10,
    affectedStudentNames: ['Priya Sharma', 'Simran Kaur', 'Ananya Roy', 'Tanishq Iyer', 'Ishaan Gupta'],
    sampleDoubts: [
      'When do we use seed correction factor in BOD calculation equation?',
      'Why do we incubate at 20 degrees Celsius specifically for 5 days?',
      'What happens if initial DO is below 7 mg/L?'
    ],
    aiRemediationSuggestion: 'Distribute a 1-page visual formula cheat sheet outlining Step 1 (DO initial), Step 2 (DO final 5-day), and Step 3 (Dilution factor P). High exam probability.',
    urgency: 'medium'
  },
  {
    id: 'cluster-3',
    subjectId: 'subj-ess',
    topicName: 'Atmospheric Thermal Inversion & Gaussian Plume Dispersion Model',
    doubtCount: 7,
    affectedStudentNames: ['Aarav Patel', 'Ishaan Gupta', 'Rohan Verma', 'Ananya Roy'],
    sampleDoubts: [
      'How does negative environmental lapse rate trap pollutants near ground level?',
      'Distinction between radiation inversion at night vs subsidence inversion aloft.'
    ],
    aiRemediationSuggestion: 'Display a cross-sectional altitude-temperature diagram comparing normal cooling vs inversion ceiling lid.',
    urgency: 'low'
  }
];

const INITIAL_STICKY_NOTES: TeacherQuickStickyNote[] = [
  {
    id: 'note-1',
    teacherId: 'teacher-ess',
    title: 'Print Exam Hall Tickets for Section B',
    content: 'Ensure all students with <60% attendance (Rohan, Aarav, Vikas, Ishaan) have their conditional debarment notices counter-signed by Academic Dean.',
    color: 'rose',
    priority: 'high',
    reminderTime: 'Today at 04:30 PM',
    isCompleted: false,
    createdAt: '2026-09-12'
  },
  {
    id: 'note-2',
    teacherId: 'teacher-ess',
    title: 'Prepare Lab Chemical Reagents for ES-101L',
    content: 'Check Winkler titration reagent bottles (Manganous Sulfate, Alkali-Iodide-Azide, and Sodium Thiosulfate 0.025N).',
    color: 'emerald',
    priority: 'medium',
    reminderTime: 'Today at 02:45 PM',
    isCompleted: true,
    createdAt: '2026-09-12'
  },
  {
    id: 'note-3',
    teacherId: 'teacher-ess',
    title: 'Upload Mid-Term Problem Sheet to ClassSarthi',
    content: 'Include 3 PYQ questions from 2024 semester paper on Carnot cycle and BOD5 dilution.',
    color: 'yellow',
    priority: 'high',
    reminderTime: 'Tomorrow at 10:00 AM',
    isCompleted: false,
    createdAt: '2026-09-11'
  }
];

const INITIAL_LESSON_TASKS: TeacherLessonTask[] = [
  {
    id: 'task-1',
    subjectId: 'subj-ess',
    task: 'Explain Photochemical Smog mechanism & ozone accumulation cycle',
    dueDate: 'Today',
    isDone: true
  },
  {
    id: 'task-2',
    subjectId: 'subj-eme',
    task: 'Solve 2 numerical problems on Clausius Inequality & Entropy Balance',
    dueDate: 'Today',
    isDone: false
  },
  {
    id: 'task-3',
    subjectId: 'subj-ess',
    task: 'Conduct 5-minute interactive poll on Solid Waste segregations',
    dueDate: 'Today',
    isDone: false
  },
  {
    id: 'task-4',
    subjectId: 'subj-ess-lab',
    task: 'Demonstrate spectrophotometer blank calibration at 600nm wavelength',
    dueDate: 'Today',
    isDone: false
  }
];

const INITIAL_LEAVE_REQUESTS: TeacherLeaveRequest[] = [
  {
    id: 'leave-1',
    teacherId: 'teacher-ess',
    teacherName: 'Dr. Rajesh Kulkarni',
    leaveType: 'Academic Conference',
    startDate: '2026-09-24',
    endDate: '2026-09-26',
    totalDays: 3,
    reason: 'Presenting research paper at International Green Energy & Sustainability Symposium, IIT Delhi.',
    substituteTeacher: 'Dr. Ananya Sen (School of Engineering)',
    status: 'Approved',
    appliedAt: '2026-09-08'
  },
  {
    id: 'leave-2',
    teacherId: 'teacher-ess',
    teacherName: 'Dr. Rajesh Kulkarni',
    leaveType: 'Casual Leave',
    startDate: '2026-10-03',
    endDate: '2026-10-03',
    totalDays: 1,
    reason: 'Personal family commitment in hometown.',
    substituteTeacher: 'Prof. Rajesh Sharma',
    status: 'Pending HOD Approval',
    appliedAt: '2026-09-11'
  }
];

const INITIAL_CALENDAR_EVENTS: AcademicCalendarEvent[] = [
  {
    id: 'cal-1',
    subjectId: 'subj-ess',
    subjectCode: 'ES-101',
    title: 'Mid-Semester Written Examination',
    type: 'Mid-Term Exam',
    date: '2026-09-22',
    time: '10:00 AM - 12:00 PM',
    room: 'Auditorium Hall 1',
    totalStudents: 45,
    submissionSubmittedCount: 0,
    submissionPendingCount: 45
  },
  {
    id: 'cal-2',
    subjectId: 'subj-eme',
    subjectCode: 'ME-102',
    title: 'Thermodynamics Cycle Efficiency Quiz #2',
    type: 'Quiz',
    date: '2026-09-16',
    time: '10:15 AM - 11:00 AM',
    room: 'Mechanical Wing - Room 201',
    totalStudents: 52,
    submissionSubmittedCount: 0,
    submissionPendingCount: 52
  },
  {
    id: 'cal-3',
    subjectId: 'subj-ess',
    subjectCode: 'ES-101',
    title: 'Assignment 2: Municipal Waste & Circular Economy Case Study',
    type: 'Assignment Deadline',
    date: '2026-09-18',
    time: '11:59 PM',
    room: 'Online Portal',
    totalStudents: 45,
    submissionSubmittedCount: 38,
    submissionPendingCount: 7
  },
  {
    id: 'cal-4',
    subjectId: 'subj-ess-lab',
    subjectCode: 'ES-101L',
    title: 'End-Term Practical Lab Evaluation & Viva Voce',
    type: 'Lab Practical',
    date: '2026-10-14',
    time: '02:00 PM - 05:00 PM',
    room: 'Environmental Wet Lab C-12',
    totalStudents: 45,
    submissionSubmittedCount: 0,
    submissionPendingCount: 45
  }
];

const INITIAL_TEACHER_RESOURCES: ReferenceResource[] = [
  {
    id: 'res-t1',
    subjectId: 'subj-ess',
    title: 'Atmospheric Inversion & Gaussian Dispersion Master Formula Sheet',
    category: 'Lecture Notes',
    url: '#',
    author: 'Dr. Rajesh Kulkarni',
    description: 'Complete derivation of environmental lapse rates, stability criteria, and Pasquill-Gifford plume dispersion parameters.',
    keyTopics: ['Lapse Rates', 'Inversion', 'Dispersion Models', 'AQI Calculations'],
    dateAdded: '2026-09-10'
  },
  {
    id: 'res-t2',
    subjectId: 'subj-eme',
    title: 'Carnot Engine & Clausius Inequality Quick Revision Mindmap',
    category: 'Lecture Notes',
    url: '#',
    author: 'Dr. Rajesh Kulkarni',
    description: 'Visual schematic showing heat engine reservoir flows, reversible temperature scales, and entropy generation trap warnings.',
    keyTopics: ['Carnot Efficiency', 'Clausius Inequality', 'Entropy Generation'],
    dateAdded: '2026-09-08'
  },
  {
    id: 'res-t3',
    subjectId: 'subj-ess-lab',
    title: 'Lab Protocol C-12: Winkler Titration for Dissolved Oxygen',
    category: 'Lab Manual',
    url: '#',
    author: 'Dr. Rajesh Kulkarni',
    description: 'Step-by-step chemical preparation protocol, reagent titration guides, and blank factor adjustment formulas.',
    keyTopics: ['Winkler Method', 'Dissolved Oxygen', 'BOD5', 'COD'],
    dateAdded: '2026-09-04'
  }
];

// Helper to calculate risk level based on attendance percentage
export function calculateAttendanceRiskLevel(percentage: number): AttendanceRiskLevel {
  if (percentage < 60) return 'danger_60';
  if (percentage < 75) return 'warning_75';
  return 'safe';
}

// ========================================================
// STANDALONE TEACHER BACKEND SERVICE
// ========================================================

class TeacherBackendService {
  private isDbConnected = false;

  public isConnected(): boolean {
    return this.isDbConnected;
  }

  private getStorageItem<T>(key: string, fallback: T): T {
    try {
      const data = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn(`Failed saving to localStorage for ${key}`, e);
    }
  }

  /**
   * Initializes or refreshes all local cached data from the persistent server-side database.
   */
  public async initFromDatabase(): Promise<boolean> {
    try {
      const statsRes = await fetch('/api/db/stats');
      if (!statsRes.ok) return false;

      // Parallel fetch all entities from persistent database
      const [
        classesRes,
        rosterRes,
        antiProxyRes,
        telemetryRes,
        doubtsRes,
        calendarRes,
        notesRes,
        tasksRes,
        leavesRes
      ] = await Promise.all([
        fetch('/api/db/classes').then(r => r.ok ? r.json() : null),
        fetch('/api/db/attendance/roster').then(r => r.ok ? r.json() : null),
        fetch('/api/db/anti-proxy').then(r => r.ok ? r.json() : null),
        fetch('/api/db/telemetry').then(r => r.ok ? r.json() : null),
        fetch('/api/db/doubt-clusters').then(r => r.ok ? r.json() : null),
        fetch('/api/db/calendar').then(r => r.ok ? r.json() : null),
        fetch('/api/db/workspace/notes').then(r => r.ok ? r.json() : null),
        fetch('/api/db/workspace/tasks').then(r => r.ok ? r.json() : null),
        fetch('/api/db/workspace/leaves').then(r => r.ok ? r.json() : null)
      ]);

      if (classesRes && Array.isArray(classesRes)) this.setStorageItem(STORAGE_KEYS.SCHEDULE, classesRes);
      if (rosterRes && Array.isArray(rosterRes)) this.setStorageItem(STORAGE_KEYS.ATTENDANCE, rosterRes);
      if (antiProxyRes && Array.isArray(antiProxyRes)) this.setStorageItem(STORAGE_KEYS.ANTI_PROXY, antiProxyRes);
      if (telemetryRes && Array.isArray(telemetryRes)) this.setStorageItem(STORAGE_KEYS.TELEMETRY, telemetryRes);
      if (doubtsRes && Array.isArray(doubtsRes)) this.setStorageItem(STORAGE_KEYS.DOUBT_CLUSTERS, doubtsRes);
      if (calendarRes && Array.isArray(calendarRes)) this.setStorageItem(STORAGE_KEYS.CALENDAR, calendarRes);
      if (notesRes && Array.isArray(notesRes)) this.setStorageItem(STORAGE_KEYS.STICKY_NOTES, notesRes);
      if (tasksRes && Array.isArray(tasksRes)) this.setStorageItem(STORAGE_KEYS.TASKS, tasksRes);
      if (leavesRes && Array.isArray(leavesRes)) this.setStorageItem(STORAGE_KEYS.LEAVES, leavesRes);

      this.isDbConnected = true;
      console.info('[ClassSarthi DB] Connected & synchronized with persistent on-disk database.');
      return true;
    } catch (err) {
      console.warn('[ClassSarthi DB] Running in offline / local cache fallback mode:', err);
      this.isDbConnected = false;
      return false;
    }
  }

  public async getDatabaseStats(): Promise<any> {
    try {
      const res = await fetch('/api/db/stats');
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }

  // --- 1. DAILY SCHEDULE & TIMETABLE ---
  public getScheduleSlots(): TeacherScheduleSlot[] {
    return this.getStorageItem<TeacherScheduleSlot[]>(STORAGE_KEYS.SCHEDULE, INITIAL_SCHEDULE_SLOTS);
  }

  public updateSlotStatus(slotId: string, status: 'upcoming' | 'ongoing' | 'completed', attendanceTaken?: boolean): TeacherScheduleSlot[] {
    const slots = this.getScheduleSlots();
    const updated = slots.map(s => {
      if (s.id === slotId) {
        return {
          ...s,
          status,
          attendanceTaken: attendanceTaken !== undefined ? attendanceTaken : s.attendanceTaken
        };
      }
      return s;
    });
    this.setStorageItem(STORAGE_KEYS.SCHEDULE, updated);

    // Sync to persistent database
    fetch(`/api/db/classes/${slotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, attendanceTaken })
    }).catch(() => {});

    return updated;
  }

  // --- 2. TEACHER PERSONAL ATTENDANCE LOG ---
  public getTeacherAttendanceLog(teacherId: string = 'teacher-ess'): TeacherAttendanceLog {
    const today = new Date().toISOString().split('T')[0];
    const log = this.getStorageItem<TeacherAttendanceLog>(STORAGE_KEYS.TEACHER_LOG, {
      teacherId,
      date: today,
      punchInTime: '08:42 AM',
      status: 'Present'
    });
    return log;
  }

  public punchInTeacher(teacherId: string = 'teacher-ess'): TeacherAttendanceLog {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = now.toISOString().split('T')[0];
    const log: TeacherAttendanceLog = {
      teacherId,
      date: today,
      punchInTime: timeStr,
      status: 'Present'
    };
    this.setStorageItem(STORAGE_KEYS.TEACHER_LOG, log);

    // Sync to persistent database
    fetch('/api/db/attendance/teacher-punch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId, action: 'punch_in' })
    }).catch(() => {});

    return log;
  }

  public punchOutTeacher(teacherId: string = 'teacher-ess'): TeacherAttendanceLog {
    const log = this.getTeacherAttendanceLog(teacherId);
    const now = new Date();
    log.punchOutTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.setStorageItem(STORAGE_KEYS.TEACHER_LOG, log);

    // Sync to persistent database
    fetch('/api/db/attendance/teacher-punch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId, action: 'punch_out' })
    }).catch(() => {});

    return log;
  }

  // --- 3. STUDENT ATTENDANCE ROSTER & RISK HIGHLIGHTING ---
  public getStudentsRoster(): StudentAttendanceItem[] {
    return this.getStorageItem<StudentAttendanceItem[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_STUDENTS_ROSTER);
  }

  public markStudentAttendance(studentId: string, status: 'present' | 'absent' | 'late'): StudentAttendanceItem[] {
    const roster = this.getStudentsRoster();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = roster.map(item => {
      if (item.studentId === studentId) {
        const prevStatus = item.todayStatus;
        let newAttended = item.classesAttended;
        const newTotal = item.totalClassesHeld;

        // If today was previously marked absent and now present
        if (prevStatus === 'absent' && (status === 'present' || status === 'late')) {
          newAttended += 1;
        } else if ((prevStatus === 'present' || prevStatus === 'late') && status === 'absent') {
          newAttended = Math.max(0, newAttended - 1);
        }

        const newPercentage = Number(((newAttended / newTotal) * 100).toFixed(1));
        const newRisk = calculateAttendanceRiskLevel(newPercentage);

        return {
          ...item,
          todayStatus: status,
          classesAttended: newAttended,
          currentPercentage: newPercentage,
          riskLevel: newRisk,
          lastMarkedAt: nowStr,
          consecutiveAbsences: status === 'absent' ? item.consecutiveAbsences + 1 : 0
        };
      }
      return item;
    });

    this.setStorageItem(STORAGE_KEYS.ATTENDANCE, updated);

    // Sync to persistent database
    fetch('/api/db/attendance/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, status })
    }).catch(() => {});

    return updated;
  }

  public batchMarkAll(status: 'present' | 'absent'): StudentAttendanceItem[] {
    const roster = this.getStudentsRoster();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = roster.map(item => {
      const prevStatus = item.todayStatus;
      let newAttended = item.classesAttended;
      const newTotal = item.totalClassesHeld;

      if (prevStatus === 'absent' && status === 'present') {
        newAttended += 1;
      } else if (prevStatus === 'present' && status === 'absent') {
        newAttended = Math.max(0, newAttended - 1);
      }

      const newPercentage = Number(((newAttended / newTotal) * 100).toFixed(1));
      const newRisk = calculateAttendanceRiskLevel(newPercentage);

      return {
        ...item,
        todayStatus: status,
        classesAttended: newAttended,
        currentPercentage: newPercentage,
        riskLevel: newRisk,
        lastMarkedAt: nowStr,
        consecutiveAbsences: status === 'absent' ? item.consecutiveAbsences + 1 : 0
      };
    });

    this.setStorageItem(STORAGE_KEYS.ATTENDANCE, updated);

    // Sync to persistent database
    fetch('/api/db/attendance/batch-mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => {});

    return updated;
  }

  // --- 4. ANTI-PROXY DETECTION & CORRELATION ---
  public getAntiProxyAlerts(): AntiProxyDiscrepancy[] {
    return this.getStorageItem<AntiProxyDiscrepancy[]>(STORAGE_KEYS.ANTI_PROXY, INITIAL_ANTI_PROXY_ALERTS);
  }

  public resolveAntiProxyAlert(alertId: string, resolution: 'justified' | 'reported_to_dean', note?: string): AntiProxyDiscrepancy[] {
    const alerts = this.getAntiProxyAlerts();
    const updated = alerts.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: resolution,
          teacherNote: note || (resolution === 'justified' ? 'Approved valid justification.' : 'Forwarded to Dean of Student Welfare.')
        };
      }
      return a;
    });
    this.setStorageItem(STORAGE_KEYS.ANTI_PROXY, updated);

    // Sync to persistent database
    fetch('/api/db/anti-proxy/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId, resolution, note })
    }).catch(() => {});

    return updated;
  }

  public addAntiProxyAlert(alert: Omit<AntiProxyDiscrepancy, 'id'>): AntiProxyDiscrepancy[] {
    const alerts = this.getAntiProxyAlerts();
    const newAlert: AntiProxyDiscrepancy = {
      ...alert,
      id: `proxy-${Date.now()}`
    };
    const updated = [newAlert, ...alerts];
    this.setStorageItem(STORAGE_KEYS.ANTI_PROXY, updated);
    return updated;
  }

  // --- 5. STUDENT PERFORMANCE TELEMETRY & DOUBT CLUSTERING ---
  public getStudentTelemetry(): StudentTelemetryMetric[] {
    return this.getStorageItem<StudentTelemetryMetric[]>(STORAGE_KEYS.TELEMETRY, INITIAL_STUDENT_TELEMETRY);
  }

  public getCommonDoubtClusters(): CommonDoubtCluster[] {
    return this.getStorageItem<CommonDoubtCluster[]>(STORAGE_KEYS.DOUBT_CLUSTERS, INITIAL_COMMON_DOUBT_CLUSTERS);
  }

  // --- 6. RESOURCE & HELPING NOTES UPLOADER ---
  public getTeacherResources(): ReferenceResource[] {
    return this.getStorageItem<ReferenceResource[]>(STORAGE_KEYS.RESOURCES, INITIAL_TEACHER_RESOURCES);
  }

  public uploadTeacherResource(resource: Omit<ReferenceResource, 'id' | 'dateAdded'>): ReferenceResource[] {
    const current = this.getTeacherResources();
    const today = new Date().toISOString().split('T')[0];
    const newRes: ReferenceResource = {
      ...resource,
      id: `res-t-${Date.now()}`,
      dateAdded: today
    };
    const updated = [newRes, ...current];
    this.setStorageItem(STORAGE_KEYS.RESOURCES, updated);
    return updated;
  }

  // --- 7. ACADEMIC CALENDAR & ASSIGNMENT TRACKER ---
  public getCalendarEvents(): AcademicCalendarEvent[] {
    return this.getStorageItem<AcademicCalendarEvent[]>(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR_EVENTS);
  }

  public addCalendarEvent(event: Omit<AcademicCalendarEvent, 'id'>): AcademicCalendarEvent[] {
    const current = this.getCalendarEvents();
    const newEvent: AcademicCalendarEvent = {
      ...event,
      id: `cal-${Date.now()}`
    };
    const updated = [...current, newEvent];
    this.setStorageItem(STORAGE_KEYS.CALENDAR, updated);

    // Sync to persistent database
    fetch('/api/db/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent)
    }).catch(() => {});

    return updated;
  }

  // --- 8. TEACHER WORKSPACE: STICKY NOTES & TASKS ---
  public getStickyNotes(): TeacherQuickStickyNote[] {
    return this.getStorageItem<TeacherQuickStickyNote[]>(STORAGE_KEYS.STICKY_NOTES, INITIAL_STICKY_NOTES);
  }

  public addStickyNote(note: Omit<TeacherQuickStickyNote, 'id' | 'createdAt'>): TeacherQuickStickyNote[] {
    const current = this.getStickyNotes();
    const newNote: TeacherQuickStickyNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newNote, ...current];
    this.setStorageItem(STORAGE_KEYS.STICKY_NOTES, updated);

    // Sync to persistent database
    fetch('/api/db/workspace/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote)
    }).catch(() => {});

    return updated;
  }

  public deleteStickyNote(noteId: string): TeacherQuickStickyNote[] {
    const current = this.getStickyNotes();
    const updated = current.filter(n => n.id !== noteId);
    this.setStorageItem(STORAGE_KEYS.STICKY_NOTES, updated);

    // Sync to persistent database
    fetch(`/api/db/workspace/notes/${noteId}`, {
      method: 'DELETE'
    }).catch(() => {});

    return updated;
  }

  public toggleStickyNoteComplete(noteId: string): TeacherQuickStickyNote[] {
    const current = this.getStickyNotes();
    const updated = current.map(n => n.id === noteId ? { ...n, isCompleted: !n.isCompleted } : n);
    this.setStorageItem(STORAGE_KEYS.STICKY_NOTES, updated);

    // Sync to persistent database
    fetch(`/api/db/workspace/notes/${noteId}/toggle`, {
      method: 'PATCH'
    }).catch(() => {});

    return updated;
  }

  public getLessonTasks(): TeacherLessonTask[] {
    return this.getStorageItem<TeacherLessonTask[]>(STORAGE_KEYS.TASKS, INITIAL_LESSON_TASKS);
  }

  public toggleLessonTask(taskId: string): TeacherLessonTask[] {
    const current = this.getLessonTasks();
    const updated = current.map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t);
    this.setStorageItem(STORAGE_KEYS.TASKS, updated);

    // Sync to persistent database
    fetch(`/api/db/workspace/tasks/${taskId}/toggle`, {
      method: 'PATCH'
    }).catch(() => {});

    return updated;
  }

  public addLessonTask(task: Omit<TeacherLessonTask, 'id'>): TeacherLessonTask[] {
    const current = this.getLessonTasks();
    const newTask: TeacherLessonTask = {
      ...task,
      id: `task-${Date.now()}`
    };
    const updated = [...current, newTask];
    this.setStorageItem(STORAGE_KEYS.TASKS, updated);

    // Sync to persistent database
    fetch('/api/db/workspace/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    }).catch(() => {});

    return updated;
  }

  // --- 9. DIGITAL LEAVE APPLICATION ---
  public getLeaveRequests(): TeacherLeaveRequest[] {
    return this.getStorageItem<TeacherLeaveRequest[]>(STORAGE_KEYS.LEAVES, INITIAL_LEAVE_REQUESTS);
  }

  public submitLeaveRequest(request: Omit<TeacherLeaveRequest, 'id' | 'status' | 'appliedAt'>): TeacherLeaveRequest[] {
    const current = this.getLeaveRequests();
    const newReq: TeacherLeaveRequest = {
      ...request,
      id: `leave-${Date.now()}`,
      status: 'Pending HOD Approval',
      appliedAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newReq, ...current];
    this.setStorageItem(STORAGE_KEYS.LEAVES, updated);

    // Sync to persistent database
    fetch('/api/db/workspace/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq)
    }).catch(() => {});

    return updated;
  }

  // Reset all to fresh seed defaults
  public resetToFactoryMock(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
      localStorage.removeItem(STORAGE_KEYS.ANTI_PROXY);
      localStorage.removeItem(STORAGE_KEYS.TELEMETRY);
      localStorage.removeItem(STORAGE_KEYS.DOUBT_CLUSTERS);
      localStorage.removeItem(STORAGE_KEYS.STICKY_NOTES);
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.LEAVES);
      localStorage.removeItem(STORAGE_KEYS.TEACHER_LOG);
      localStorage.removeItem(STORAGE_KEYS.CALENDAR);
      localStorage.removeItem(STORAGE_KEYS.RESOURCES);
    }
  }
}

export const teacherBackendService = new TeacherBackendService();
