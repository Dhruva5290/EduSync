import {
  DbClassSlot,
  DbStudentAttendance,
  DbAntiProxyAlert,
  DbStudentTelemetry,
  DbDoubtCluster,
  DbCalendarEvent,
  DbTeacherStickyNote,
  DbTeacherLessonTask,
  DbTeacherLeave,
  DbStudentTask
} from './types';

export const SEED_CLASSES: DbClassSlot[] = [
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
    attendanceTaken: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: new Date().toISOString()
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
    attendanceTaken: false,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: new Date().toISOString()
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
    attendanceTaken: false,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: new Date().toISOString()
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
    attendanceTaken: false,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'slot-5',
    subjectId: 'subj-calc',
    subjectCode: 'MA-101',
    subjectName: 'Multivariable Calculus & Differential Forms',
    section: 'Division A',
    dayOfWeek: 'Tuesday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    room: 'Math Block B - Room 105',
    allottedStudentsCount: 50,
    todayTopic: 'Lagrange Multipliers, Gradient Fields & Constraint Optimization',
    status: 'upcoming',
    attendanceTaken: false,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'slot-6',
    subjectId: 'subj-cpc',
    subjectCode: 'CS-101',
    subjectName: 'C Programming & Pointers Laboratory',
    section: 'Division B',
    dayOfWeek: 'Wednesday',
    startTime: '11:30 AM',
    endTime: '01:00 PM',
    room: 'Turing Computing Lab 2',
    allottedStudentsCount: 48,
    todayTopic: 'Double Pointers, Dynamic Memory Allocation & Linked Data Structures',
    status: 'upcoming',
    attendanceTaken: false,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

export const SEED_STUDENTS_ROSTER: DbStudentAttendance[] = [
  {
    studentId: 'stud-101',
    rollNo: 'BMU-2026-7012',
    studentName: 'Rohan Verma',
    email: 'rohan.verma@bmu.edu.in',
    avatar: 'RV',
    totalClassesHeld: 26,
    classesAttended: 14,
    currentPercentage: 53.8,
    riskLevel: 'danger_60',
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
    riskLevel: 'warning_75',
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
    riskLevel: 'safe',
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
    riskLevel: 'danger_60',
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
    riskLevel: 'warning_75',
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
    riskLevel: 'warning_75',
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
    riskLevel: 'danger_60',
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

export const SEED_ANTI_PROXY_ALERTS: DbAntiProxyAlert[] = [
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

export const SEED_STUDENT_TELEMETRY: DbStudentTelemetry[] = [
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

export const SEED_DOUBT_CLUSTERS: DbDoubtCluster[] = [
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

export const SEED_CALENDAR_EVENTS: DbCalendarEvent[] = [
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
    submissionPendingCount: 45,
    description: 'Covers Units 1 & 2: Atmospheric Physics, Inversion Layers, Water Quality Indices and Environmental Legislation.'
  },
  {
    id: 'cal-2',
    subjectId: 'subj-eme',
    subjectCode: 'ME-102',
    title: 'Problem Set 3 Submission (Carnot Efficiency & Reversibility)',
    type: 'Assignment Deadline',
    date: '2026-09-18',
    time: '11:59 PM',
    room: 'ClassSarthi Portal Upload',
    totalStudents: 52,
    submissionSubmittedCount: 38,
    submissionPendingCount: 14,
    description: 'Mandatory 6-question analytical set on second law thermodynamic cycles and entropy balances.'
  },
  {
    id: 'cal-3',
    subjectId: 'subj-ess-lab',
    subjectCode: 'ES-101L',
    title: 'Winkler Method DO Titration Practical Viva',
    type: 'Lab Practical',
    date: '2026-09-25',
    time: '03:00 PM - 04:30 PM',
    room: 'Science Block C - Lab 302',
    totalStudents: 45,
    submissionSubmittedCount: 0,
    submissionPendingCount: 45,
    description: 'Individual titrations and calibration curve preparation for dissolved oxygen determination.'
  },
  {
    id: 'cal-4',
    subjectId: 'subj-ess',
    subjectCode: 'ES-101',
    title: 'Surprise Micro-Quiz (Air Quality Indices & Dispersion)',
    type: 'Quiz',
    date: '2026-09-15',
    time: '09:45 AM - 10:00 AM',
    room: 'Science Block C - Room 304',
    totalStudents: 45,
    submissionSubmittedCount: 41,
    submissionPendingCount: 4,
    description: '15-minute closed-book conceptual quiz on particulate matter PM2.5 and AQI calculation.'
  }
];

export const SEED_TEACHER_STICKY_NOTES: DbTeacherStickyNote[] = [
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

export const SEED_TEACHER_TASKS: DbTeacherLessonTask[] = [
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

export const SEED_TEACHER_LEAVES: DbTeacherLeave[] = [
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

export const SEED_STUDENT_TASKS: DbStudentTask[] = [
  {
    id: 'stask-01',
    studentId: 'student-1788461612290',
    title: 'Complete Thermodynamics Problem Set 3 (Carnot Efficiency)',
    categoryTag: 'Assignment',
    subjectCode: 'ME-102',
    dueDate: '2026-09-18',
    dueTime: '11:59 PM',
    completed: false,
    priority: 'high',
    source: 'google_classroom',
    createdAt: '2026-09-10T10:00:00.000Z'
  },
  {
    id: 'stask-02',
    studentId: 'student-1788461612290',
    title: 'Prepare Wet Lab Notebook for Dissolved Oxygen Titration',
    categoryTag: 'Lab Record',
    subjectCode: 'ES-101L',
    dueDate: '2026-09-25',
    dueTime: '02:00 PM',
    completed: true,
    priority: 'medium',
    source: 'manual',
    createdAt: '2026-09-11T12:00:00.000Z'
  },
  {
    id: 'stask-03',
    studentId: 'student-1788461612290',
    title: 'Review Lagrange Multipliers Practice Questions with AI Tutor',
    categoryTag: 'Exam Prep',
    subjectCode: 'MA-101',
    dueDate: '2026-09-16',
    dueTime: '09:00 AM',
    completed: false,
    priority: 'medium',
    source: 'manual',
    createdAt: '2026-09-12T09:30:00.000Z'
  }
];
