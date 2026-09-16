import {
  TeacherScheduleSlot,
  DoubtLogEntry,
  DoubtPatternCluster,
  TeacherMaterialItem,
  MaterialViewEvent,
  TeacherBroadcastMessage,
  CalendarAcademicDay,
  SimulatedGateScanLog,
  ManagementStickyNote,
  TeacherChecklistItem,
  TeacherLeaveSubmission,
  DeskBoardSummary,
  AgentActionProposal
} from '../types';

const STORAGE_KEYS = {
  SCHEDULE: 'classsarthi_cc_schedule_slots',
  MATERIALS: 'classsarthi_cc_materials',
  BROADCASTS: 'classsarthi_cc_broadcasts',
  CALENDAR: 'classsarthi_cc_calendar',
  CHECKLIST: 'classsarthi_cc_checklist',
  LEAVES: 'classsarthi_cc_leaves',
  GATE_SCAN: 'classsarthi_cc_gate_scan',
  DOUBT_LOGS: 'classsarthi_cc_doubt_logs',
  TELEMETRY: 'classsarthi_cc_telemetry'
};

// ========================================================
// INITIAL SEED DATA
// ========================================================

export interface CommandScheduleSlot extends TeacherScheduleSlot {
  attendanceTrend: number[]; // Last 10 sessions percentage
  currentAttendancePercent: number;
  enrolledStudents: Array<{
    id: string;
    rollNo: string;
    name: string;
    present: boolean;
  }>;
}

const INITIAL_SCHEDULE: CommandScheduleSlot[] = [
  {
    id: 'cc-slot-1',
    subjectId: 'subj-ess',
    subjectCode: 'ES-101',
    subjectName: 'Environmental Studies',
    section: 'Sec A',
    dayOfWeek: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    room: 'Hall C-304',
    allottedStudentsCount: 45,
    todayTopic: 'Atmospheric Thermal Inversion & Plume Dynamics',
    status: 'completed',
    attendanceTaken: true,
    currentAttendancePercent: 88,
    attendanceTrend: [82, 85, 84, 88, 90, 87, 85, 89, 86, 88],
    enrolledStudents: [
      { id: 'st-1', rollNo: '2026-ENG-001', name: 'Aarav Sharma', present: true },
      { id: 'st-2', rollNo: '2026-ENG-002', name: 'Ananya Verma', present: true },
      { id: 'st-3', rollNo: '2026-ENG-003', name: 'Devendra Patel', present: false },
      { id: 'st-4', rollNo: '2026-ENG-004', name: 'Diya Sen', present: true },
      { id: 'st-5', rollNo: '2026-ENG-005', name: 'Ishaan Gupta', present: true }
    ]
  },
  {
    id: 'cc-slot-2',
    subjectId: 'subj-eme',
    subjectCode: 'ME-102',
    subjectName: 'Engineering Thermodynamics',
    section: 'Sec B',
    dayOfWeek: 'Monday',
    startTime: '10:15 AM',
    endTime: '11:15 AM',
    room: 'Mech Block 201',
    allottedStudentsCount: 50,
    todayTopic: 'Clausius Inequality & Reversible Heat Engines',
    status: 'ongoing',
    attendanceTaken: false,
    currentAttendancePercent: 74, // Amber stripe: 70-80%
    attendanceTrend: [78, 76, 75, 74, 72, 75, 73, 76, 75, 74],
    enrolledStudents: [
      { id: 'st-6', rollNo: '2026-ENG-010', name: 'Kabir Mehta', present: true },
      { id: 'st-7', rollNo: '2026-ENG-011', name: 'Kavya Nair', present: false },
      { id: 'st-8', rollNo: '2026-ENG-012', name: 'Madhav Joshi', present: true },
      { id: 'st-9', rollNo: '2026-ENG-013', name: 'Neha Rao', present: true },
      { id: 'st-10', rollNo: '2026-ENG-014', name: 'Pranav Kulkarni', present: false }
    ]
  },
  {
    id: 'cc-slot-3',
    subjectId: 'subj-calc',
    subjectCode: 'MA-101',
    subjectName: 'Engineering Mathematics I',
    section: 'Sec C',
    dayOfWeek: 'Monday',
    startTime: '01:30 PM',
    endTime: '02:30 PM',
    room: 'LH-2',
    allottedStudentsCount: 42,
    todayTopic: 'Taylor & Maclaurin Multivariable Series Expansion',
    status: 'upcoming',
    attendanceTaken: false,
    currentAttendancePercent: 64, // Terracotta stripe: <70%
    attendanceTrend: [70, 68, 67, 65, 66, 64, 63, 65, 62, 64],
    enrolledStudents: [
      { id: 'st-11', rollNo: '2026-ENG-020', name: 'Rohan Deshmukh', present: false },
      { id: 'st-12', rollNo: '2026-ENG-021', name: 'Saanvi Bhat', present: true },
      { id: 'st-13', rollNo: '2026-ENG-022', name: 'Samar Singh', present: false },
      { id: 'st-14', rollNo: '2026-ENG-023', name: 'Tanvi Iyer', present: true }
    ]
  },
  {
    id: 'cc-slot-4',
    subjectId: 'subj-ess-lab',
    subjectCode: 'ES-101L',
    subjectName: 'Environmental Chemistry Lab',
    section: 'Sec A (Batch 1)',
    dayOfWeek: 'Monday',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    room: 'Chemistry Lab 1',
    allottedStudentsCount: 22,
    todayTopic: 'Dissolved Oxygen & BOD5 Iodometric Titration',
    status: 'upcoming',
    attendanceTaken: false,
    currentAttendancePercent: 92,
    attendanceTrend: [90, 92, 91, 93, 90, 92, 94, 91, 92, 92],
    enrolledStudents: [
      { id: 'st-1', rollNo: '2026-ENG-001', name: 'Aarav Sharma', present: true },
      { id: 'st-2', rollNo: '2026-ENG-002', name: 'Ananya Verma', present: true },
      { id: 'st-4', rollNo: '2026-ENG-004', name: 'Diya Sen', present: true }
    ]
  }
];

const INITIAL_MATERIALS: TeacherMaterialItem[] = [
  {
    id: 'mat-1',
    title: 'Lecture 14 Handout: Atmospheric Inversion & Gaussian Plume Model',
    fileName: 'ES101_Lecture14_Dispersion_Handout.pdf',
    fileSize: '2.4 MB',
    keyTopics: ['Inversion Trapping', 'Effective Stack Height', 'Ground SO2 Concentration'],
    subjectCode: 'ES-101',
    uploadedAt: '2026-09-10',
    published: true,
    openedByCount: 41,
    avgTimeSpentSeconds: 504 // 8m 24s
  },
  {
    id: 'mat-2',
    title: 'Thermodynamics Problem Set 4: Carnot, Rankine & Entropy Balances',
    fileName: 'ME102_ProblemSet4_Entropy.pdf',
    fileSize: '1.8 MB',
    keyTopics: ['Clausius Inequality', 'Irreversibility', 'Reversible Heat Pump'],
    subjectCode: 'ME-102',
    uploadedAt: '2026-09-08',
    published: true,
    openedByCount: 36,
    avgTimeSpentSeconds: 742 // 12m 22s
  },
  {
    id: 'mat-3',
    title: 'Calculus Cheat Sheet: Multivariable Extrema & Hessian Matrices',
    fileName: 'MA101_Hessian_Determinant_Guide.pdf',
    fileSize: '950 KB',
    keyTopics: ['Saddle Points', 'Second Derivative Test', 'Taylor Expansion'],
    subjectCode: 'MA-101',
    uploadedAt: '2026-09-05',
    published: true,
    openedByCount: 29,
    avgTimeSpentSeconds: 380 // 6m 20s
  }
];

const INITIAL_BROADCASTS: TeacherBroadcastMessage[] = [
  {
    id: 'bcast-1',
    authorId: 'prof.rajesh',
    authorName: 'Dr. Rajesh Kulkarni',
    title: 'Lab Observation Sheet Mandatory for ES-101L on Wednesday',
    message: 'Please bring your printed graph paper and observation notebooks. Unsigned lab sheets will not receive viva marks.',
    targetSections: ['Sec A', 'Sec B'],
    createdAt: 'Today, 08:30 AM',
    pinned: true
  },
  {
    id: 'bcast-2',
    authorId: 'prof.rajesh',
    authorName: 'Dr. Rajesh Kulkarni',
    title: 'Remedial Problem Session for Carnot Numerical Drills',
    message: 'An optional doubt-clearing session for ME-102 will be held Thursday 04:30 PM in Room 201.',
    targetSections: ['Sec B'],
    createdAt: 'Yesterday, 04:15 PM',
    pinned: false
  }
];

const INITIAL_CALENDAR_DAYS: CalendarAcademicDay[] = [
  {
    date: '2026-09-14',
    isHoliday: false,
    events: [
      { id: 'ev-1', title: 'ES-101 Lecture 15: Urban Heat Island Effect', type: 'Regular Class', time: '09:00 AM', subjectCode: 'ES-101' },
      { id: 'ev-2', title: 'ME-102 Problem Sheet 4 Due', type: 'Assignment Deadline', time: '11:59 PM', subjectCode: 'ME-102' }
    ]
  },
  {
    date: '2026-09-15',
    isHoliday: false,
    events: [
      { id: 'ev-3', title: 'ME-102 Lecture: Rankine Vapor Cycles', type: 'Regular Class', time: '10:15 AM', subjectCode: 'ME-102' }
    ]
  },
  {
    date: '2026-09-16',
    isHoliday: false,
    events: [
      { id: 'ev-4', title: 'Mid-Term Diagnostic Quiz 2', type: 'Quiz', time: '02:00 PM', subjectCode: 'ES-101' }
    ]
  },
  {
    date: '2026-09-17',
    isHoliday: true,
    holidayName: 'University Foundation Day',
    events: [
      { id: 'ev-5', title: 'Campus Foundation Day (No Classes)', type: 'Holiday' }
    ]
  },
  {
    date: '2026-09-18',
    isHoliday: false,
    events: [
      { id: 'ev-6', title: 'MA-101 Taylor Series Lab Test', type: 'Quiz', time: '01:30 PM', subjectCode: 'MA-101' }
    ]
  },
  {
    date: '2026-09-21',
    isHoliday: false,
    events: [
      { id: 'ev-7', title: 'Mid-Semester Written Examination', type: 'Mid-Term Exam', time: '10:00 AM', subjectCode: 'ES-101' }
    ]
  }
];

const INITIAL_MANAGEMENT_NOTES: ManagementStickyNote[] = [
  {
    id: 'sn-1',
    title: 'Mid-Semester Internal Marks Submission Deadline',
    content: 'All faculty must upload continuous assessment test marks (CAT-1) to the portal before 22nd September.',
    from: 'Office of Academic Dean',
    isPinned: true,
    createdAt: '11 Sep 2026',
    priority: 'high'
  },
  {
    id: 'sn-2',
    title: 'NAAC Peer Team Classroom Observation Protocol',
    content: 'Please ensure lecture plan syllabus maps are pinned to notice boards in all assigned rooms.',
    from: 'IQAC Cell',
    isPinned: true,
    createdAt: '09 Sep 2026',
    priority: 'high'
  },
  {
    id: 'sn-3',
    title: 'Air Conditioning Maintenance in Science Block C',
    content: 'Maintenance scheduled this Saturday from 02:00 PM to 06:00 PM.',
    from: 'Estate Management',
    isPinned: false,
    createdAt: '08 Sep 2026'
  }
];

const INITIAL_CHECKLIST: TeacherChecklistItem[] = [
  { id: 'chk-1', text: 'Grade Assignment 3 submissions for ES-101', completed: false, category: 'Grading', createdAt: '2026-09-11' },
  { id: 'chk-2', text: 'Prepare slides for Carnot & Rankine thermal efficiency', completed: true, category: 'Preparation', createdAt: '2026-09-10' },
  { id: 'chk-3', text: 'Sign laboratory safety sheets for Chemistry Lab', completed: false, category: 'Administrative', createdAt: '2026-09-11' },
  { id: 'chk-4', text: 'Review anti-proxy flagging for Sec B morning lecture', completed: true, category: 'Attendance', createdAt: '2026-09-12' }
];

const INITIAL_DOUBT_LOGS: DoubtLogEntry[] = [
  {
    id: 'dl-1',
    studentId: 'st-1',
    studentName: 'Aarav Sharma',
    subjectCode: 'ES-101',
    topic: 'Atmospheric Inversion',
    question: 'Why does air temperature increase with altitude in an inversion if pressure still decreases?',
    frequencyCount: 14,
    timestamp: '2026-09-11'
  },
  {
    id: 'dl-2',
    studentId: 'st-2',
    studentName: 'Ananya Verma',
    subjectCode: 'ES-101',
    topic: 'Atmospheric Inversion',
    question: 'Does thermal inversion trap pollutants only at night or can it persist during the daytime?',
    frequencyCount: 12,
    timestamp: '2026-09-11'
  },
  {
    id: 'dl-3',
    studentId: 'st-6',
    studentName: 'Kabir Mehta',
    subjectCode: 'ME-102',
    topic: 'Clausius Inequality',
    question: 'Why is cyclic integral of dQ/T less than or equal to zero instead of equal to entropy change?',
    frequencyCount: 19,
    timestamp: '2026-09-10'
  },
  {
    id: 'dl-4',
    studentId: 'st-7',
    studentName: 'Kavya Nair',
    subjectCode: 'ME-102',
    topic: 'Clausius Inequality',
    question: 'How do you determine if a cycle is reversible or impossible just from the boundary temperatures?',
    frequencyCount: 16,
    timestamp: '2026-09-10'
  },
  {
    id: 'dl-5',
    studentId: 'st-11',
    studentName: 'Rohan Deshmukh',
    subjectCode: 'MA-101',
    topic: 'Hessian Matrix',
    question: 'If determinant of Hessian is zero, why cannot we use higher order derivatives easily?',
    frequencyCount: 8,
    timestamp: '2026-09-09'
  },
  {
    id: 'dl-6',
    studentId: 'st-12',
    studentName: 'Saanvi Bhat',
    subjectCode: 'MA-101',
    topic: 'Taylor Series',
    question: 'When truncating at quadratic term, how is remainder bound calculated for multivariable functions?',
    frequencyCount: 5,
    timestamp: '2026-09-08'
  }
];

export interface StudentTelemetryRow {
  studentId: string;
  name: string;
  rollNo: string;
  section: string;
  studyHours: number;
  questionsSolved: number;
  doubtsAsked: number;
  growthRatePercent: number;
  studyHoursHistory: Array<{ session: string; hours: number; questions: number }>;
  growthTrajectory: Array<{ week: string; rate: number }>;
}

const INITIAL_STUDENT_TELEMETRY: StudentTelemetryRow[] = [
  {
    studentId: 'st-1',
    name: 'Aarav Sharma',
    rollNo: '2026-ENG-001',
    section: 'Sec A',
    studyHours: 28.5,
    questionsSolved: 142,
    doubtsAsked: 11,
    growthRatePercent: 14.8,
    studyHoursHistory: [
      { session: 'W1', hours: 4.2, questions: 20 },
      { session: 'W2', hours: 5.0, questions: 26 },
      { session: 'W3', hours: 6.1, questions: 32 },
      { session: 'W4', hours: 6.8, questions: 34 },
      { session: 'W5', hours: 6.4, questions: 30 }
    ],
    growthTrajectory: [
      { week: 'W1', rate: 4.5 },
      { week: 'W2', rate: 7.2 },
      { week: 'W3', rate: 10.1 },
      { week: 'W4', rate: 12.8 },
      { week: 'W5', rate: 14.8 }
    ]
  },
  {
    studentId: 'st-2',
    name: 'Ananya Verma',
    rollNo: '2026-ENG-002',
    section: 'Sec A',
    studyHours: 32.0,
    questionsSolved: 168,
    doubtsAsked: 8,
    growthRatePercent: 18.2,
    studyHoursHistory: [
      { session: 'W1', hours: 5.5, questions: 28 },
      { session: 'W2', hours: 6.2, questions: 33 },
      { session: 'W3', hours: 6.5, questions: 35 },
      { session: 'W4', hours: 7.0, questions: 38 },
      { session: 'W5', hours: 6.8, questions: 34 }
    ],
    growthTrajectory: [
      { week: 'W1', rate: 5.0 },
      { week: 'W2', rate: 8.5 },
      { week: 'W3', rate: 12.0 },
      { week: 'W4', rate: 15.5 },
      { week: 'W5', rate: 18.2 }
    ]
  },
  {
    studentId: 'st-6',
    name: 'Kabir Mehta',
    rollNo: '2026-ENG-010',
    section: 'Sec B',
    studyHours: 19.4,
    questionsSolved: 84,
    doubtsAsked: 19,
    growthRatePercent: 6.4,
    studyHoursHistory: [
      { session: 'W1', hours: 3.2, questions: 14 },
      { session: 'W2', hours: 3.8, questions: 16 },
      { session: 'W3', hours: 4.0, questions: 18 },
      { session: 'W4', hours: 4.1, questions: 18 },
      { session: 'W5', hours: 4.3, questions: 18 }
    ],
    growthTrajectory: [
      { week: 'W1', rate: 2.1 },
      { week: 'W2', rate: 3.2 },
      { week: 'W3', rate: 4.5 },
      { week: 'W4', rate: 5.5 },
      { week: 'W5', rate: 6.4 }
    ]
  },
  {
    studentId: 'st-11',
    name: 'Rohan Deshmukh',
    rollNo: '2026-ENG-020',
    section: 'Sec C',
    studyHours: 14.2,
    questionsSolved: 58,
    doubtsAsked: 16,
    growthRatePercent: -2.1,
    studyHoursHistory: [
      { session: 'W1', hours: 3.8, questions: 16 },
      { session: 'W2', hours: 3.2, questions: 14 },
      { session: 'W3', hours: 2.8, questions: 10 },
      { session: 'W4', hours: 2.4, questions: 9 },
      { session: 'W5', hours: 2.0, questions: 9 }
    ],
    growthTrajectory: [
      { week: 'W1', rate: 2.5 },
      { week: 'W2', rate: 1.2 },
      { week: 'W3', rate: 0.0 },
      { week: 'W4', rate: -1.2 },
      { week: 'W5', rate: -2.1 }
    ]
  }
];

// ========================================================
// SERVICE IMPLEMENTATION
// ========================================================

export const commandCenterService = {
  // --- 1. SCHEDULE & ATTENDANCE ---
  getScheduleSlots(day: string = 'Monday'): CommandScheduleSlot[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    let all: CommandScheduleSlot[] = INITIAL_SCHEDULE;
    if (raw) {
      try {
        all = JSON.parse(raw);
      } catch {
        all = INITIAL_SCHEDULE;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(INITIAL_SCHEDULE));
    }
    return all.filter(s => s.dayOfWeek.toLowerCase() === day.toLowerCase());
  },

  getAllScheduleSlots(): CommandScheduleSlot[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(INITIAL_SCHEDULE));
      return INITIAL_SCHEDULE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SCHEDULE;
    }
  },

  startClass(slotId: string): CommandScheduleSlot[] {
    const all = this.getAllScheduleSlots();
    const updated = all.map(s => (s.id === slotId ? { ...s, status: 'ongoing' as const } : s));
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(updated));
    return updated;
  },

  finishClass(slotId: string): CommandScheduleSlot[] {
    const all = this.getAllScheduleSlots();
    const updated = all.map(s => (s.id === slotId ? { ...s, status: 'completed' as const } : s));
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(updated));
    return updated;
  },

  toggleStudentAttendance(slotId: string, studentId: string): CommandScheduleSlot[] {
    const all = this.getAllScheduleSlots();
    const updated = all.map(s => {
      if (s.id === slotId) {
        const students = s.enrolledStudents.map(st =>
          st.id === studentId ? { ...st, present: !st.present } : st
        );
        const presentCount = students.filter(st => st.present).length;
        const newPercent = Math.round((presentCount / Math.max(1, students.length)) * 100);
        return {
          ...s,
          enrolledStudents: students,
          attendanceTaken: true,
          currentAttendancePercent: newPercent
        };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(updated));
    return updated;
  },

  // --- 2. MATERIALS & VIEW TRACKING ---
  getMaterials(): TeacherMaterialItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(INITIAL_MATERIALS));
      return INITIAL_MATERIALS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MATERIALS;
    }
  },

  uploadMaterial(item: Omit<TeacherMaterialItem, 'id' | 'uploadedAt' | 'openedByCount' | 'avgTimeSpentSeconds'>): TeacherMaterialItem {
    const materials = this.getMaterials();
    const newItem: TeacherMaterialItem = {
      ...item,
      id: `mat-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
      openedByCount: 0,
      avgTimeSpentSeconds: 0
    };
    const updated = [newItem, ...materials];
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(updated));
    return newItem;
  },

  recordMaterialView(studentId: string, materialId: string, durationSeconds: number): void {
    const materials = this.getMaterials();
    const updated = materials.map(m => {
      if (m.id === materialId) {
        const totalPreviousTime = m.avgTimeSpentSeconds * m.openedByCount;
        const newCount = m.openedByCount + 1;
        const newAvg = Math.round((totalPreviousTime + durationSeconds) / newCount);
        return {
          ...m,
          openedByCount: newCount,
          avgTimeSpentSeconds: newAvg
        };
      }
      return m;
    });
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(updated));
  },

  // --- 3. BROADCASTS ---
  getBroadcasts(): TeacherBroadcastMessage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BROADCASTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BROADCASTS, JSON.stringify(INITIAL_BROADCASTS));
      return INITIAL_BROADCASTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BROADCASTS;
    }
  },

  publishBroadcast(bcast: Omit<TeacherBroadcastMessage, 'id' | 'createdAt'>): TeacherBroadcastMessage {
    const all = this.getBroadcasts();
    const newItem: TeacherBroadcastMessage = {
      ...bcast,
      id: `bcast-${Date.now()}`,
      createdAt: 'Just now'
    };
    const updated = [newItem, ...all];
    localStorage.setItem(STORAGE_KEYS.BROADCASTS, JSON.stringify(updated));
    return newItem;
  },

  // --- 4. CALENDAR ---
  getCalendarDays(): CalendarAcademicDay[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CALENDAR);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(INITIAL_CALENDAR_DAYS));
      return INITIAL_CALENDAR_DAYS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CALENDAR_DAYS;
    }
  },

  addCalendarEvent(date: string, title: string, type: 'Quiz' | 'Assignment Deadline' | 'Mid-Term Exam', subjectCode?: string): CalendarAcademicDay[] {
    const days = this.getCalendarDays();
    const existing = days.find(d => d.date === date);
    let updated: CalendarAcademicDay[];
    if (existing) {
      updated = days.map(d =>
        d.date === date
          ? {
              ...d,
              events: [
                ...d.events,
                { id: `ev-${Date.now()}`, title, type, subjectCode }
              ]
            }
          : d
      );
    } else {
      updated = [
        ...days,
        {
          date,
          isHoliday: false,
          events: [{ id: `ev-${Date.now()}`, title, type, subjectCode }]
        }
      ];
    }
    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(updated));
    return updated;
  },

  // --- 5. PERSONAL WORKSPACE & GATE SCAN SIMULATION ---
  getGateScanStatus(teacherId: string): SimulatedGateScanLog {
    const raw = localStorage.getItem(`${STORAGE_KEYS.GATE_SCAN}_${teacherId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return {
      id: `scan-${Date.now()}`,
      teacherId,
      date: new Date().toISOString().split('T')[0],
      scanType: 'check_in',
      timestamp: '08:42 AM',
      isSimulated: true,
      isManualOverride: false,
      gateLocation: 'Campus Main Gate RFID Turnstile #3'
    };
  },

  toggleGateScan(teacherId: string, isManualOverride: boolean = false): SimulatedGateScanLog {
    const current = this.getGateScanStatus(teacherId);
    const newType = current.scanType === 'check_in' ? 'check_out' : 'check_in';
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog: SimulatedGateScanLog = {
      id: `scan-${Date.now()}`,
      teacherId,
      date: now.toISOString().split('T')[0],
      scanType: newType,
      timestamp: timeStr,
      isSimulated: true,
      isManualOverride,
      gateLocation: isManualOverride ? 'Manual Faculty Desk Override' : 'Campus Main Gate RFID Turnstile #3'
    };

    localStorage.setItem(`${STORAGE_KEYS.GATE_SCAN}_${teacherId}`, JSON.stringify(newLog));
    return newLog;
  },

  getDeskBoardSummary(): DeskBoardSummary {
    return {
      hoursToday: 3.5,
      hoursThisWeek: 16.0,
      classesScheduledToday: 4,
      classesCompletedToday: 1
    };
  },

  getManagementStickyNotes(): ManagementStickyNote[] {
    return INITIAL_MANAGEMENT_NOTES.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  },

  getChecklist(): TeacherChecklistItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(INITIAL_CHECKLIST));
      return INITIAL_CHECKLIST;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CHECKLIST;
    }
  },

  toggleChecklistItem(id: string): TeacherChecklistItem[] {
    const all = this.getChecklist();
    const updated = all.map(c => (c.id === id ? { ...c, completed: !c.completed } : c));
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(updated));
    return updated;
  },

  addChecklistItem(text: string, category: string = 'General'): TeacherChecklistItem[] {
    const all = this.getChecklist();
    const newItem: TeacherChecklistItem = {
      id: `chk-${Date.now()}`,
      text,
      completed: false,
      category,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newItem, ...all];
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(updated));
    return updated;
  },

  getLeaves(): TeacherLeaveSubmission[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LEAVES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  submitLeave(teacherId: string, teacherName: string, startDate: string, reason: string): TeacherLeaveSubmission[] {
    const all = this.getLeaves();
    const newLeave: TeacherLeaveSubmission = {
      id: `leave-${Date.now()}`,
      teacherId,
      teacherName,
      startDate,
      reason,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    const updated = [newLeave, ...all];
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(updated));
    return updated;
  },

  // --- 6. DOUBT CLUSTERING & TELEMETRY ---
  getStudentTelemetry(): StudentTelemetryRow[] {
    return INITIAL_STUDENT_TELEMETRY;
  },

  getDoubtLogs(): DoubtLogEntry[] {
    return INITIAL_DOUBT_LOGS;
  },

  async getDoubtPatternClusters(): Promise<DoubtPatternCluster[]> {
    const logs = this.getDoubtLogs();
    const topicMap: Record<string, { count: number; questions: string[]; subject: string }> = {};

    logs.forEach(log => {
      if (!topicMap[log.topic]) {
        topicMap[log.topic] = { count: 0, questions: [], subject: log.subjectCode };
      }
      topicMap[log.topic].count += log.frequencyCount;
      topicMap[log.topic].questions.push(log.question);
    });

    const clusters: DoubtPatternCluster[] = Object.keys(topicMap).map(topic => {
      const entry = topicMap[topic];
      let frequencyBucket: 'High' | 'Moderate' | 'Low' = 'Low';
      if (entry.count >= 20) frequencyBucket = 'High';
      else if (entry.count >= 10) frequencyBucket = 'Moderate';

      // Templated fallback explanation
      let misconception = `Students in ${topic} frequently conflate rate equations with steady-state boundary conditions. Specifically, questions indicate difficulty distinguishing between localized equilibrium flux and global volume conservation.`;
      if (topic === 'Clausius Inequality') {
        misconception = `Students persistently confuse the path-dependent heat transfer boundary integral with the state property entropy (dS). They frequently treat reversible heat engine bounds as applicable to dissipative, uninsulated real-world processes.`;
      } else if (topic === 'Atmospheric Inversion') {
        misconception = `Students fail to recognize that radiative cooling at ground level forms a rigid density barrier overhead. They mistake the decrease of absolute atmospheric pressure aloft for an unrestricted buoyancy gradient.`;
      } else if (topic === 'Hessian Matrix') {
        misconception = `Students struggle to interpret the sign-definiteness of eigenvalues when the determinant is zero, assuming the presence of a saddle point rather than testing parametric paths.`;
      }

      return {
        topic,
        frequencyBucket,
        count: entry.count,
        sampleQuestions: entry.questions,
        aiMisconceptionExplanation: misconception,
        subjectCode: entry.subject
      };
    });

    // Sort High -> Moderate -> Low
    const bucketOrder = { High: 3, Moderate: 2, Low: 1 };
    return clusters.sort((a, b) => bucketOrder[b.frequencyBucket] - bucketOrder[a.frequencyBucket]);
  },

  // --- 7. AGENTIC ACTION EXECUTOR ---
  executeAgentAction(proposal: AgentActionProposal): { success: boolean; message: string } {
    const results: string[] = [];

    for (const intent of proposal.intents) {
      if (intent === 'mark_leave') {
        const date = proposal.parsedParameters.date || new Date().toISOString().split('T')[0];
        const reason = proposal.parsedParameters.reason || 'Medical / Personal Leave';
        this.submitLeave('prof.rajesh', 'Dr. Rajesh Kulkarni', date, reason);
        results.push(`Submitted leave request for ${date} ("${reason}")`);
      }

      if (intent === 'cancel_class') {
        const slotId = proposal.parsedParameters.slotId || 'cc-slot-2';
        const all = this.getAllScheduleSlots();
        const updated = all.map(s => (s.id === slotId ? { ...s, status: 'completed' as const, todayTopic: `${s.todayTopic} [CANCELLED]` } : s));
        localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(updated));
        results.push(`Cancelled class slot (${proposal.parsedParameters.subjectCode || 'ME-102'})`);
      }

      if (intent === 'start_class') {
        const slotId = proposal.parsedParameters.slotId || 'cc-slot-2';
        this.startClass(slotId);
        results.push(`Class session successfully initiated for ${slotId}`);
      }

      if (intent === 'draft_announcement') {
        const title = proposal.parsedParameters.title || 'Class Notice';
        const message = proposal.parsedParameters.message || 'Please review today\'s posted materials.';
        const sections = proposal.parsedParameters.sections || ['Sec A', 'Sec B'];
        this.publishBroadcast({ authorId: 'prof.rajesh', authorName: 'Dr. Rajesh Kulkarni', title, message, targetSections: sections });
        results.push(`Published announcement to ${sections.join(', ')}: "${title}"`);
      }

      if (intent === 'schedule_meeting') {
        const date = proposal.parsedParameters.date || new Date().toISOString().split('T')[0];
        const title = proposal.parsedParameters.title || 'Faculty Academic Meeting';
        this.addCalendarEvent(date, title, 'Quiz');
        results.push(`Scheduled meeting: "${title}" on ${date}`);
      }

      if (intent === 'sync_attendance') {
        results.push('Synchronized attendance records with university ERP ledger');
      }
    }

    return {
      success: true,
      message: results.join(' • ')
    };
  }
};
