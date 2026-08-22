import {
  User,
  Subject,
  TimelineItem,
  ReferenceResource,
  Assignment,
  Submission,
  StudentNote,
  ClassAnalytics
} from '../types';

export interface InMemoryDatabase {
  users: User[];
  subjects: Subject[];
  timelines: TimelineItem[];
  resources: ReferenceResource[];
  assignments: Assignment[];
  submissions: Submission[];
  notes: StudentNote[];
  analytics: Record<string, ClassAnalytics>;
}

export const db: InMemoryDatabase = {
  users: [
    // --- LEADERSHIP & REGISTRAR ---
    {
      id: 'admin-1',
      name: 'Dr. Maneek Singh',
      email: 'maneek.singh@bmu.edu.in',
      username: 'dean.maneek',
      password: 'Dean@BMU2026!',
      role: 'admin',
      gender: 'Male',
      institutionalId: 'BMU-ADM-1001',
      department: 'Department of Academic Welfare',
      designation: 'Dean of Academic Welfare & Institutional Registrar',
      enrolledSubjectIds: [],
      teachingSubjectIds: [],
      officeLocation: 'Academic Block A - Room 102',
      officeHours: 'Mon-Fri 10:00 AM - 04:30 PM',
      status: 'active',
      joinedDate: '2018-07-01',
      phone: '+91 98110 54321'
    },
    {
      id: 'admin-2',
      name: 'Dr. Kiran Khatter',
      email: 'kiran.khatter@bmu.edu.in',
      username: 'dean.kiran',
      password: 'Kiran@BMU2026!',
      role: 'admin',
      gender: 'Female',
      institutionalId: 'BMU-ADM-1002',
      department: 'Department of Computer Science',
      designation: 'Associate Dean & Head of Computing Programmes',
      enrolledSubjectIds: [],
      teachingSubjectIds: [],
      officeLocation: 'Academic Block B - Room 204',
      officeHours: 'Tue-Thu 02:00 PM - 05:00 PM',
      status: 'active',
      joinedDate: '2019-06-15',
      phone: '+91 98110 54322'
    },

    // --- FACULTY MEMBERS ---
    {
      id: 'teacher-1',
      name: 'Dr. Sanmitra Burman',
      email: 'sanmitra.burman@bmu.edu.in',
      username: 'prof.sanmitra',
      password: 'Teacher@ESS26',
      role: 'teacher',
      gender: 'Male',
      institutionalId: 'BMU-FAC-2001',
      department: 'Department of Environmental Sciences',
      designation: 'Associate Professor of Environmental Engineering',
      enrolledSubjectIds: [],
      teachingSubjectIds: ['subj-ess'],
      officeLocation: 'Science Block C - Room 301',
      officeHours: 'Mon & Wed 11:00 AM - 01:00 PM',
      status: 'active',
      joinedDate: '2021-08-01',
      phone: '+91 98231 44501'
    },
    {
      id: 'teacher-2',
      name: 'Dr. Raghav Singhal',
      email: 'raghav.singhal@bmu.edu.in',
      username: 'prof.raghav',
      password: 'Teacher@Calc26',
      role: 'teacher',
      gender: 'Male',
      institutionalId: 'BMU-FAC-2002',
      department: 'Dept. of Computational Sciences',
      designation: 'Professor of Pure & Applied Mathematics',
      enrolledSubjectIds: [],
      teachingSubjectIds: ['subj-calc'],
      officeLocation: 'Academic Block A - Room 315',
      officeHours: 'Tue & Thu 03:00 PM - 05:00 PM',
      status: 'active',
      joinedDate: '2020-01-10',
      phone: '+91 98231 44502'
    },
    {
      id: 'teacher-3',
      name: 'Dr. K Srikanth',
      email: 'k.srikanth@bmu.edu.in',
      username: 'prof.srikanth',
      password: 'Teacher@EME26',
      role: 'teacher',
      gender: 'Male',
      institutionalId: 'BMU-FAC-2003',
      department: 'Dept. of Mechanical Engineering',
      designation: 'Professor & Workshop Coordinator',
      enrolledSubjectIds: [],
      teachingSubjectIds: ['subj-eme'],
      officeLocation: 'Mechanical Engineering Workshop Complex - Room W-12',
      officeHours: 'Wed & Fri 02:00 PM - 04:30 PM',
      status: 'active',
      joinedDate: '2019-09-01',
      phone: '+91 98231 44503'
    },
    {
      id: 'teacher-4',
      name: 'Dr. Beenu Taneja',
      email: 'beenu.taneja@bmu.edu.in',
      username: 'prof.beenu',
      password: 'Teacher@Ethics26',
      role: 'teacher',
      gender: 'Male',
      institutionalId: 'BMU-FAC-2004',
      department: 'Department of Computer Engineering',
      designation: 'Associate Professor & Professional Ethics Chair',
      enrolledSubjectIds: [],
      teachingSubjectIds: ['subj-engeth'],
      officeLocation: 'Academic Block B - Room 118',
      officeHours: 'Mon & Thu 01:30 PM - 03:30 PM',
      status: 'active',
      joinedDate: '2021-01-15',
      phone: '+91 98231 44504'
    },
    {
      id: 'teacher-5',
      name: 'Dr. Nikhil Kumar',
      email: 'nikhil.kumar@bmu.edu.in',
      username: 'prof.nikhil',
      password: 'Teacher@CPC26',
      role: 'teacher',
      gender: 'Male',
      institutionalId: 'BMU-FAC-2005',
      department: 'Department of Computer Sciences',
      designation: 'Assistant Professor & C Programming Lead',
      enrolledSubjectIds: [],
      teachingSubjectIds: ['subj-cpc'],
      officeLocation: 'Computing Lab 4 - Room C-408',
      officeHours: 'Tue & Fri 10:00 AM - 12:30 PM',
      status: 'active',
      joinedDate: '2022-07-20',
      phone: '+91 98231 44505'
    },

    // --- 1ST YEAR B.TECH STUDENTS (ALL SUBJECTS ALLOTTED) ---
    {
      id: 'student-1',
      name: 'Dhruva',
      email: 'dhruva.260101@bmu.edu.in',
      username: 'student.dhruva',
      password: 'EduSync@260101',
      role: 'student',
      gender: 'Male',
      program: 'CSE',
      institutionalId: '260101',
      department: 'B.Tech Computer Science (CSE)',
      academicYear: '1st Year (Semester 1)',
      gpa: 9.85,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98188 260101'
    },
    {
      id: 'student-2',
      name: 'Aryan Sagar',
      email: 'aryan.260102@bmu.edu.in',
      username: 'student.aryan',
      password: 'EduSync@260102',
      role: 'student',
      gender: 'Male',
      program: 'CSE',
      institutionalId: '260102',
      department: 'B.Tech Computer Science (CSE)',
      academicYear: '1st Year (Semester 1)',
      gpa: 8.42,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98711 260102'
    },
    {
      id: 'student-3',
      name: 'Deepansh Garg',
      email: 'deepansh.260103@bmu.edu.in',
      username: 'student.deepansh',
      password: 'EduSync@260103',
      role: 'student',
      gender: 'Male',
      program: 'CSE',
      institutionalId: '260103',
      department: 'B.Tech Computer Science (CSE)',
      academicYear: '1st Year (Semester 1)',
      gpa: 7.95,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98102 260103'
    },
    {
      id: 'student-4',
      name: 'Dishika Saxena',
      email: 'dishika.260104@bmu.edu.in',
      username: 'student.dishika',
      password: 'EduSync@260104',
      role: 'student',
      gender: 'Female',
      program: 'CSE',
      institutionalId: '260104',
      department: 'B.Tech Computer Science (CSE)',
      academicYear: '1st Year (Semester 1)',
      gpa: 9.10,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98991 260104'
    },
    {
      id: 'student-5',
      name: 'Drishti',
      email: 'drishti.260105@bmu.edu.in',
      username: 'student.drishti',
      password: 'EduSync@260105',
      role: 'student',
      gender: 'Female',
      program: 'CSE',
      institutionalId: '260105',
      department: 'B.Tech Computer Science (CSE)',
      academicYear: '1st Year (Semester 1)',
      gpa: 8.78,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98733 260105'
    },
    {
      id: 'student-6',
      name: 'Chirag',
      email: 'chirag.260106@bmu.edu.in',
      username: 'student.chirag',
      password: 'EduSync@260106',
      role: 'student',
      gender: 'Male',
      program: 'CSE',
      institutionalId: '260106',
      department: 'B.Tech Computer Science (CSE)',
      academicYear: '1st Year (Semester 1)',
      gpa: 7.60,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98114 260106'
    },
    {
      id: 'student-7',
      name: 'Yuvraj Singh',
      email: 'yuvraj.260107@bmu.edu.in',
      username: 'student.yuvraj',
      password: 'EduSync@260107',
      role: 'student',
      gender: 'Male',
      program: 'ECE',
      institutionalId: '260107',
      department: 'B.Tech Electronics and Computer Engineering (ECE)',
      academicYear: '1st Year (Semester 1)',
      gpa: 8.15,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98215 260107'
    },
    {
      id: 'student-8',
      name: 'Aditya Tomar',
      email: 'aditya.260108@bmu.edu.in',
      username: 'student.aditya',
      password: 'EduSync@260108',
      role: 'student',
      gender: 'Male',
      program: 'ECE',
      institutionalId: '260108',
      department: 'B.Tech Electronics and Computer Engineering (ECE)',
      academicYear: '1st Year (Semester 1)',
      gpa: 8.65,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98762 260108'
    },
    {
      id: 'student-9',
      name: 'Mohit Yadav',
      email: 'mohit.260109@bmu.edu.in',
      username: 'student.mohit',
      password: 'EduSync@260109',
      role: 'student',
      gender: 'Male',
      program: 'CSE',
      institutionalId: '260109',
      department: 'B.Tech Computer Science (CSE)',
      academicYear: '1st Year (Semester 1)',
      gpa: 7.40,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98189 260109'
    },
    {
      id: 'student-10',
      name: 'Yukti Singh',
      email: 'yukti.260110@bmu.edu.in',
      username: 'student.yukti',
      password: 'EduSync@260110',
      role: 'student',
      gender: 'Female',
      program: 'ME',
      institutionalId: '260110',
      department: 'B.Tech Mechanical Engineering (ME)',
      academicYear: '1st Year (Semester 1)',
      gpa: 8.90,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98912 260110'
    },
    {
      id: 'student-11',
      name: 'Ashita Tiwari',
      email: 'ashita.260111@bmu.edu.in',
      username: 'student.ashita',
      password: 'EduSync@260111',
      role: 'student',
      gender: 'Female',
      program: 'ME',
      institutionalId: '260111',
      department: 'B.Tech Mechanical Engineering (ME)',
      academicYear: '1st Year (Semester 1)',
      gpa: 9.25,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98718 260111'
    },
    {
      id: 'student-12',
      name: 'Srijan Reddy',
      email: 'srijan.260112@bmu.edu.in',
      username: 'student.srijan',
      password: 'EduSync@260112',
      role: 'student',
      gender: 'Male',
      program: 'ME',
      institutionalId: '260112',
      department: 'B.Tech Mechanical Engineering (ME)',
      academicYear: '1st Year (Semester 1)',
      gpa: 8.30,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98105 260112'
    },
    {
      id: 'student-13',
      name: 'Jatin Rao',
      email: 'jatin.260113@bmu.edu.in',
      username: 'student.jatin',
      password: 'EduSync@260113',
      role: 'student',
      gender: 'Male',
      program: 'ME',
      institutionalId: '260113',
      department: 'B.Tech Mechanical Engineering (ME)',
      academicYear: '1st Year (Semester 1)',
      gpa: 7.85,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98734 260113'
    },
    {
      id: 'student-14',
      name: 'Preet Singh',
      email: 'preet.260114@bmu.edu.in',
      username: 'student.preet',
      password: 'EduSync@260114',
      role: 'student',
      gender: 'Male',
      program: 'ECE',
      institutionalId: '260114',
      department: 'B.Tech Electronics and Computer Engineering (ECE)',
      academicYear: '1st Year (Semester 1)',
      gpa: 8.05,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98116 260114'
    },
    {
      id: 'student-15',
      name: 'Gurasees Kaur',
      email: 'gurasees.260115@bmu.edu.in',
      username: 'student.gurasees',
      password: 'EduSync@260115',
      role: 'student',
      gender: 'Female',
      program: 'ECE',
      institutionalId: '260115',
      department: 'B.Tech Electronics and Computer Engineering (ECE)',
      academicYear: '1st Year (Semester 1)',
      gpa: 8.95,
      enrolledSubjectIds: ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'],
      teachingSubjectIds: [],
      status: 'active',
      joinedDate: '2026-08-01',
      phone: '+91 98219 260115'
    }
  ],

  subjects: [
    {
      id: 'subj-ess',
      code: 'ESS',
      name: 'Environmental Studies and Sustainability',
      description: 'Ecosystem dynamics, renewable energy technologies, climate change mitigation, EIA compliance, waste management, and sustainable development.',
      teacherId: 'teacher-1',
      teacherName: 'Dr. Sanmitra Burman',
      teacherEmail: 'sanmitra.burman@bmu.edu.in',
      color: 'emerald',
      accentBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      enrolledCount: 15,
      semester: 'Fall 2026 (Semester 1)',
      room: 'Science Block C - Lecture Hall 101',
      credits: 3,
      department: 'Department of Environmental Sciences',
      syllabusTopics: [
        'Ecosystem Structures, Biogeochemical Cycles & Food Webs',
        'Biodiversity Conservation, Hotspots & Threatened Species',
        'Renewable Energy: Solar Photovoltaics, Wind, Bio-energy',
        'Environmental Impact Assessment (EIA) Methodologies',
        'Solid & Electronic Waste Management Protocols',
        'Climate Policy, Carbon Offsetting & Sustainable Urban Planning'
      ]
    },
    {
      id: 'subj-calc',
      code: 'CALC',
      name: 'Calculus and Mathematics',
      description: 'Differential calculus, Taylor expansions, multivariable functions, partial derivatives, multiple integrals, vector calculus, and engineering ODEs.',
      teacherId: 'teacher-2',
      teacherName: 'Dr. Raghav Singhal',
      teacherEmail: 'raghav.singhal@bmu.edu.in',
      color: 'blue',
      accentBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      enrolledCount: 15,
      semester: 'Fall 2026 (Semester 1)',
      room: 'Academic Block A - Hall 302',
      credits: 4,
      department: 'Dept. of Computational Sciences',
      syllabusTopics: [
        'Limits, Continuity, Mean Value Theorems & Taylor Polynomials',
        'Partial Differentiation, Gradients, Divergence & Curl',
        'Maxima, Minima & Lagrange Multipliers for Optimization',
        'Double & Triple Integrals in Polar, Cylindrical & Spherical Coordinates',
        'Vector Calculus: Green’s, Stokes’ & Divergence Theorems',
        'First and Second Order Linear Differential Equations'
      ]
    },
    {
      id: 'subj-eme',
      code: 'EME',
      name: 'Elements of Mechanical Engineering',
      description: 'Laws of thermodynamics, IC engine cycles, power transmission, gear trains, engineering materials, stress-strain analysis, and manufacturing processes.',
      teacherId: 'teacher-3',
      teacherName: 'Dr. K Srikanth',
      teacherEmail: 'k.srikanth@bmu.edu.in',
      color: 'amber',
      accentBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      enrolledCount: 15,
      semester: 'Fall 2026 (Semester 1)',
      room: 'Mechanical Workshop W-101',
      credits: 4,
      department: 'Dept. of Mechanical Engineering',
      syllabusTopics: [
        'First and Second Laws of Thermodynamics & Heat Engines',
        'Otto, Diesel & Dual Combustion Engine Cycles',
        'Power Transmission: Belts, Ropes, Chains & Epicyclic Gear Trains',
        'Engineering Mechanics: Stress, Strain & Hooke’s Law',
        'Basic Manufacturing: Lathe, CNC Machining, Welding & 3D Printing',
        'Hydraulic Turbines & Fluid Power Systems'
      ]
    },
    {
      id: 'subj-engeth',
      code: 'ENG-ETH',
      name: 'Engineering Ethics',
      description: 'Philosophical foundations, professional codes of conduct, whistleblowing, engineering safety, intellectual property rights, and AI ethics.',
      teacherId: 'teacher-4',
      teacherName: 'Dr. Beenu Taneja',
      teacherEmail: 'beenu.taneja@bmu.edu.in',
      color: 'purple',
      accentBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      enrolledCount: 15,
      semester: 'Fall 2026 (Semester 1)',
      room: 'Academic Block B - Seminar Room 110',
      credits: 2,
      department: 'Department of Computer Engineering',
      syllabusTopics: [
        'Moral Frameworks: Utilitarianism, Deontology & Virtue Ethics',
        'IEEE, ACM & ASME Professional Codes of Ethics',
        'Engineering Disasters: Chernobyl, Challenger, Boeing 737 MAX Analysis',
        'Whistleblowing Protections, Moral Courage & Corporate Liability',
        'Intellectual Property Rights: Patents, Copyrights & Open Source',
        'Emerging Technologies: AI Bias, Autonomous Systems & Data Privacy'
      ]
    },
    {
      id: 'subj-cpc',
      code: 'CPC',
      name: 'Computer Programming in C',
      description: 'Algorithmic problem solving, control structures, pointers, dynamic memory allocation (malloc/free), structs, recursion, and file input/output.',
      teacherId: 'teacher-5',
      teacherName: 'Dr. Nikhil Kumar',
      teacherEmail: 'nikhil.kumar@bmu.edu.in',
      color: 'rose',
      accentBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      enrolledCount: 15,
      semester: 'Fall 2026 (Semester 1)',
      room: 'Computing Lab 4 - Room 408',
      credits: 4,
      department: 'Department of Computer Sciences',
      syllabusTopics: [
        'C Language Basics: Types, Operators, Expressions & I/O Functions',
        'Control Flow: Conditional Branching, Nested Loops & Switch Statements',
        'Modular Functions, Variable Scope & Recursive Problem Solving',
        'Arrays, String Manipulation & Multi-dimensional Matrix Operations',
        'Pointers, Pointer Arithmetic & Dynamic Memory Management',
        'Structures, Unions, Typedef & Low-level File Processing (stdio.h)'
      ]
    }
  ],

  timelines: [
    // --- ESS ---
    {
      id: 'time-ess-1',
      subjectId: 'subj-ess',
      title: 'Quiz 1: Biodiversity Hotspots & Carbon Cycle',
      type: 'quiz',
      date: '2026-08-25',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      location: 'Science Block C - Lecture Hall 101',
      description: 'Evaluation of biogeochemical cycles, ecological succession, and endangered flora/fauna in the Indian subcontinent.',
      topicsCovered: ['Carbon Cycle', 'Biodiversity Hotspots', 'Ecosystem Services'],
      weightagePercent: 10,
      status: 'upcoming'
    },
    {
      id: 'time-ess-2',
      subjectId: 'subj-ess',
      title: 'Field Practical: Campus Water Quality & Air Index Analysis',
      type: 'practical',
      date: '2026-09-02',
      startTime: '02:00 PM',
      endTime: '05:00 PM',
      location: 'BMU Environmental Chemistry Lab',
      description: 'Hands-on water pH, TDS testing, and particulate matter (PM2.5/PM10) campus sampling.',
      topicsCovered: ['Water Quality Index', 'Particulate Sampling', 'Lab Diagnostics'],
      weightagePercent: 15,
      status: 'upcoming'
    },

    // --- CALC ---
    {
      id: 'time-calc-1',
      subjectId: 'subj-calc',
      title: 'Midterm Quiz: Partial Derivatives & Lagrange Multipliers',
      type: 'quiz',
      date: '2026-08-27',
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      location: 'Academic Block A - Hall 302',
      description: 'Problem solving on multivariable partial differentiation, tangent planes, directional derivatives, and constrained optimization.',
      topicsCovered: ['Partial Derivatives', 'Gradients', 'Lagrange Multipliers'],
      weightagePercent: 15,
      status: 'upcoming'
    },
    {
      id: 'time-calc-2',
      subjectId: 'subj-calc',
      title: 'Mid-Semester Exam: Multivariable Calculus & ODEs',
      type: 'exam',
      date: '2026-09-18',
      startTime: '09:30 AM',
      endTime: '12:30 PM',
      location: 'Main Examination Hall',
      description: 'Comprehensive written paper covering Units 1, 2, and 3.',
      topicsCovered: ['Taylor Series', 'Multiple Integrals', 'Differential Equations'],
      weightagePercent: 30,
      status: 'upcoming'
    },

    // --- EME ---
    {
      id: 'time-eme-1',
      subjectId: 'subj-eme',
      title: 'Workshop Practical: Lathe Machine Turning & Facing Ops',
      type: 'practical',
      date: '2026-08-28',
      startTime: '01:30 PM',
      endTime: '04:30 PM',
      location: 'Mechanical Workshop W-101',
      description: 'Fabrication of cylindrical mild steel stepped shaft using center lathe and vernier caliper verification.',
      topicsCovered: ['Lathe Operations', 'Machining Tolerances', 'Safety Protocols'],
      weightagePercent: 15,
      status: 'upcoming'
    },

    // --- ENG-ETH ---
    {
      id: 'time-engeth-1',
      subjectId: 'subj-engeth',
      title: 'Case Study Defense: Engineering Whistleblowing & Safety',
      type: 'milestone',
      date: '2026-09-04',
      startTime: '11:00 AM',
      endTime: '01:00 PM',
      location: 'Academic Block B - Seminar Room 110',
      description: 'Team case analysis of Challenger space disaster and algorithmic liability in autonomous transport.',
      topicsCovered: ['Whistleblowing', 'Risk Assessment', 'Ethical Governance'],
      weightagePercent: 20,
      status: 'upcoming'
    },

    // --- CPC ---
    {
      id: 'time-cpc-1',
      subjectId: 'subj-cpc',
      title: 'Lab Practical Exam 1: Pointers & Dynamic Memory in C',
      type: 'practical',
      date: '2026-08-29',
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      location: 'Computing Lab 4',
      description: 'Live coding assessment covering malloc, free, double pointers, and linked list node traversal.',
      topicsCovered: ['Pointer Arithmetic', 'Dynamic Memory', 'Structs'],
      weightagePercent: 20,
      status: 'upcoming'
    }
  ],

  resources: [
    // --- ESS Resources ---
    {
      id: 'res-ess-1',
      subjectId: 'subj-ess',
      title: 'Environmental Studies: From Crisis to Cure (3rd Ed)',
      category: 'Textbook',
      url: 'https://www.oup.com/environmental-studies-rajamannar',
      author: 'Dr. R. Rajagopalan (Oxford University Press)',
      description: 'Core reference text for ecosystem energy flows, environmental legislation, and sustainability case studies in India.',
      keyTopics: ['Ecosystems', 'Pollution Control', 'Environmental Law'],
      dateAdded: '2026-08-05'
    },
    {
      id: 'res-ess-2',
      subjectId: 'subj-ess',
      title: 'Lecture Slides: Climate Change & Carbon Footprint Calculation',
      category: 'Lecture Notes',
      url: 'https://bmu.edu.in/academics/ess/unit-3-climate.pdf',
      author: 'Dr. Sanmitra Burman',
      description: 'Detailed formulations for GHG emissions estimation and renewable solar integration.',
      keyTopics: ['GHG Inventory', 'Solar Energy', 'Carbon Neutrality'],
      dateAdded: '2026-08-10'
    },

    // --- CALC Resources ---
    {
      id: 'res-calc-1',
      subjectId: 'subj-calc',
      title: 'Thomas’ Calculus (Early Transcendentals, 14th Edition)',
      category: 'Textbook',
      url: 'https://www.pearson.com/en-us/subject-catalog/p/thomas-calculus-early-transcendentals/P200000003444',
      author: 'George B. Thomas, Maurice D. Weir, Joel Hass',
      description: 'Comprehensive textbook for multivariable calculus, partial derivatives, and Stokes/Green theorem problems.',
      keyTopics: ['Partial Derivatives', 'Multiple Integrals', 'Vector Calculus'],
      dateAdded: '2026-08-04'
    },
    {
      id: 'res-calc-2',
      subjectId: 'subj-calc',
      title: 'Practice Problem Set: Lagrange Multipliers & Maxima-Minima',
      category: 'Lab Manual',
      url: 'https://bmu.edu.in/academics/calc/lagrange-handout.pdf',
      author: 'Dr. Raghav Singhal',
      description: 'Step-by-step solved engineering optimization problems with constraint equations.',
      keyTopics: ['Lagrange Multipliers', 'Critical Points', 'Hessian Matrix'],
      dateAdded: '2026-08-12'
    },

    // --- EME Resources ---
    {
      id: 'res-eme-1',
      subjectId: 'subj-eme',
      title: 'Basic Mechanical Engineering (5th Edition)',
      category: 'Textbook',
      url: 'https://www.mheducation.co.in/basic-mechanical-engineering-p-k-nag',
      author: 'P.K. Nag (McGraw Hill India)',
      description: 'Standard textbook for thermodynamic cycles, IC engines, refrigeration, and gear power transmission.',
      keyTopics: ['Thermodynamics', 'Otto Cycle', 'Gear Trains'],
      dateAdded: '2026-08-06'
    },

    // --- ENG-ETH Resources ---
    {
      id: 'res-engeth-1',
      subjectId: 'subj-engeth',
      title: 'Engineering Ethics: Concepts & Cases (6th Edition)',
      category: 'Textbook',
      url: 'https://www.cengage.com/c/engineering-ethics-concepts-and-cases-6e-harris',
      author: 'Charles E. Harris, Michael S. Pritchard, Michael J. Rabins',
      description: 'Seminal work exploring moral choices in engineering practice and disaster case studies.',
      keyTopics: ['Codes of Conduct', 'Challenger Disaster', 'AI Governance'],
      dateAdded: '2026-08-08'
    },

    // --- CPC Resources ---
    {
      id: 'res-cpc-1',
      subjectId: 'subj-cpc',
      title: 'The C Programming Language (ANSI C, 2nd Edition)',
      category: 'Textbook',
      url: 'https://www.pearson.com/en-us/subject-catalog/p/c-programming-language/P200000003450',
      author: 'Brian W. Kernighan & Dennis M. Ritchie',
      description: 'The definitive classic on C syntax, pointers, memory allocation, and standard library I/O.',
      keyTopics: ['Pointers', 'Structs', 'Memory Allocation'],
      dateAdded: '2026-08-02'
    }
  ],

  assignments: [
    // --- CPC Assignment ---
    {
      id: 'assign-cpc-1',
      subjectId: 'subj-cpc',
      title: 'Problem Set 1: Pointer Manipulation & Custom Dynamic Vector in C',
      description: 'Implement a dynamically resizable array in standard C using malloc, realloc, and pointer arithmetic.',
      richTextInstructions: `### Assignment Objective:
You will implement a generic, heap-allocated dynamic array struct \`Vector\` in C99 that automatically scales its capacity when filled.

#### Requirements:
1. **Structures**: Define \`typedef struct { int* data; size_t size; size_t capacity; } Vector;\`.
2. **Memory Management**: Implement \`vector_init\`, \`vector_push_back\`, \`vector_pop_back\`, \`vector_get\`, and \`vector_free\`.
3. **Zero Memory Leaks**: All allocated blocks must be freed cleanly with zero Valgrind / AddressSanitizer leaks.
4. **Time Complexity**: Amortized $O(1)$ push back with $2\\times$ geometric growth factor.`,
      points: 100,
      createdDate: '2026-08-16',
      dueDate: '2026-08-25T23:59:00',
      strictDueDate: true,
      attachments: ['starter-vector.c', 'test_harness.c'],
      rubric: [
        { criterion: 'Dynamic Memory Correctness (Valgrind Clean)', maxPoints: 35, description: 'Zero memory leaks, invalid frees, or out-of-bounds pointer accesses.' },
        { criterion: 'Implementation of Vector Operations', maxPoints: 45, description: 'All unit test cases for push, pop, insert, and resizing pass flawlessly.' },
        { criterion: 'Code Quality & Documentation', maxPoints: 20, description: 'Clear function headers, error boundary checks, and robust comments.' }
      ],
      tags: ['C Programming', 'Pointers', 'Dynamic Memory', 'Valgrind'],
      submissionCount: 15
    },

    // --- CALC Assignment ---
    {
      id: 'assign-calc-1',
      subjectId: 'subj-calc',
      title: 'Assignment 1: Multivariable Optimization & Lagrange Multipliers',
      description: 'Find optimal dimensions for industrial engineering heat exchangers under thermal constraint equations.',
      richTextInstructions: `### Multivariable Problem Set:
Solve the optimization problems by establishing objective functions $f(x, y, z)$ and constraint boundaries $g(x, y, z) = 0$.

#### Tasks:
1. Set up gradient alignment condition $\\nabla f = \\lambda \\nabla g$.
2. Compute Hessian matrix determinants to rigorously classify local extrema vs saddle points.
3. Include neat step-by-step mathematical derivations.`,
      points: 100,
      createdDate: '2026-08-15',
      dueDate: '2026-08-26T23:59:00',
      strictDueDate: true,
      attachments: ['calc_ps1_problems.pdf'],
      rubric: [
        { criterion: 'Mathematical Rigor & Partial Derivatives', maxPoints: 40, description: 'Accurate gradients and algebraic solutions for multiplier constants.' },
        { criterion: 'Hessian Matrix Classification', maxPoints: 35, description: 'Correct second derivative test verifying global extrema.' },
        { criterion: 'Neatness & Presentation', maxPoints: 25, description: 'Clear formatting and concise logical flow.' }
      ],
      tags: ['Calculus', 'Lagrange Multipliers', 'Optimization'],
      submissionCount: 15
    },

    // --- ESS Assignment ---
    {
      id: 'assign-ess-1',
      subjectId: 'subj-ess',
      title: 'Term Project: Campus Carbon Footprint & Solar Energy Assessment',
      description: 'Calculate BMU campus annual electricity consumption and propose a rooftop solar PV transition roadmap.',
      richTextInstructions: `### Project Deliverables:
1. Model carbon emissions ($tCO_2e$) for Academic Blocks A, B, and C.
2. Design a 250 kWp rooftop solar PV setup with estimated return on investment (ROI).
3. Draft a 3-page environmental mitigation policy.`,
      points: 100,
      createdDate: '2026-08-14',
      dueDate: '2026-08-30T23:59:00',
      strictDueDate: true,
      attachments: ['campus_energy_data.xlsx', 'eia_template.docx'],
      rubric: [
        { criterion: 'Carbon Audit Accuracy', maxPoints: 40, description: 'Correct emission factor application and load modeling.' },
        { criterion: 'Solar PV Feasibility Design', maxPoints: 35, description: 'Realistic kilowatt-peak calculations and payback period estimation.' },
        { criterion: 'Policy Report & Clarity', maxPoints: 25, description: 'Actionable sustainability recommendations.' }
      ],
      tags: ['Sustainability', 'Solar Energy', 'Carbon Footprint'],
      submissionCount: 14
    },

    // --- EME Assignment ---
    {
      id: 'assign-eme-1',
      subjectId: 'subj-eme',
      title: 'Lab Report 1: Lathe Machining, Tool Geometry & Thermodynamic Cycles',
      description: 'Document step turning practical calculations, cutting speed parameters, and Otto cycle thermal efficiency analysis.',
      richTextInstructions: `### Mechanical Engineering Practical Deliverables:
1. Calculate cutting speeds ($V = \\frac{\\pi D N}{1000}$) and feed rates for mild steel workpiece.
2. Formulate thermodynamic efficiency for standard Otto cycle with compression ratio $r = 8.5$.
3. Sketch four-stroke internal combustion engine indicator diagram.`,
      points: 100,
      createdDate: '2026-08-16',
      dueDate: '2026-08-28T23:59:00',
      strictDueDate: true,
      attachments: ['lathe_practical_guidelines.pdf', 'thermodynamic_tables.pdf'],
      rubric: [
        { criterion: 'Machining Calculations & Tool Angles', maxPoints: 40, description: 'Correct spindle RPM and rake angle specifications.' },
        { criterion: 'Thermodynamic Cycle Derivation', maxPoints: 35, description: 'Accurate thermal efficiency formulas and P-v graphs.' },
        { criterion: 'Safety & Workshop Protocols', maxPoints: 25, description: 'Complete documentation of safety adherence.' }
      ],
      tags: ['Mechanical Engineering', 'Lathe Operations', 'Thermodynamics', 'Otto Cycle'],
      submissionCount: 15
    },

    // --- ENG-ETH Assignment ---
    {
      id: 'assign-engeth-1',
      subjectId: 'subj-engeth',
      title: 'Ethical Case Analysis: AI Safety, Autonomous Systems & Whistleblowing',
      description: 'Analyze algorithmic bias in automated hiring and evaluate whistleblower protections under IEEE/ACM ethical codes.',
      richTextInstructions: `### Engineering Ethics Case Defense:
1. Conduct ethical audit of automated decision systems under ACM Code of Ethics.
2. Analyze the Challenger O-ring disaster through moral responsibility frameworks.
3. Formulate an institutional whistleblowing protocol safeguarding public safety.`,
      points: 100,
      createdDate: '2026-08-15',
      dueDate: '2026-08-29T23:59:00',
      strictDueDate: true,
      attachments: ['acm_ieee_code_of_ethics.pdf', 'challenger_case_brief.pdf'],
      rubric: [
        { criterion: 'Ethical Framework Application (ACM/IEEE)', maxPoints: 45, description: 'Rigorous application of moral principles to autonomous systems.' },
        { criterion: 'Case Study Depth & Historical Accuracy', maxPoints: 35, description: 'Accurate timeline and organizational failure analysis.' },
        { criterion: 'Clarity of Governance Protocol', maxPoints: 20, description: 'Actionable institutional escalation policies.' }
      ],
      tags: ['Engineering Ethics', 'AI Safety', 'Whistleblowing', 'ACM Code'],
      submissionCount: 15
    }
  ],

  submissions: [
    // --- Dhruva's High-Scoring Submissions Across All Subjects ---
    {
      id: 'sub-dhruva-ess',
      assignmentId: 'assign-ess-1',
      studentId: 'student-1',
      studentName: 'Dhruva',
      studentEmail: 'dhruva.260101@bmu.edu.in',
      submissionText: `### Campus Carbon Footprint & Solar Transition by Dhruva (Roll: 260101)
Estimated baseline campus emissions at 1,420 tCO2e/year. Proposed 250 kWp rooftop solar PV with 3.8-year payback period. Attached complete calculation spreadsheets.`,
      fileAttachment: 'dhruva_ess_carbon_audit.pdf',
      submittedAt: '2026-08-19T11:00:00',
      status: 'graded',
      grade: 98,
      maxPoints: 100,
      feedback: 'Excellent carbon modeling and financial feasibility analysis!',
      aiSuggestedGrade: 98,
      aiFeedbackSummary: 'Outstanding mathematical rigor and practical engineering roadmap.'
    },
    {
      id: 'sub-dhruva-calc',
      assignmentId: 'assign-calc-1',
      studentId: 'student-1',
      studentName: 'Dhruva',
      studentEmail: 'dhruva.260101@bmu.edu.in',
      submissionText: `### Multivariable Optimization Solutions by Dhruva (Roll: 260101)
Derived Lagrange multipliers for 3-variable constrained system. Evaluated Hessian determinants confirming global thermal minimum.`,
      fileAttachment: 'dhruva_calc_lagrange.pdf',
      submittedAt: '2026-08-19T14:15:00',
      status: 'graded',
      grade: 100,
      maxPoints: 100,
      feedback: 'Flawless derivations and crystal-clear step-by-step proofs!',
      aiSuggestedGrade: 100,
      aiFeedbackSummary: 'Perfect mathematical execution with complete Hessian classification.'
    },
    {
      id: 'sub-dhruva-eme',
      assignmentId: 'assign-eme-1',
      studentId: 'student-1',
      studentName: 'Dhruva',
      studentEmail: 'dhruva.260101@bmu.edu.in',
      submissionText: `### Lab Report: Step Turning & Otto Cycle Efficiency by Dhruva
Calculated spindle speed at 640 RPM for mild steel turning. Proved Otto thermal efficiency equation η = 1 - (1/r^(γ-1)).`,
      fileAttachment: 'dhruva_eme_lab_report.pdf',
      submittedAt: '2026-08-20T10:00:00',
      status: 'graded',
      grade: 97,
      maxPoints: 100,
      feedback: 'Superb workshop report with accurate tolerances and thermodynamic graphs.',
      aiSuggestedGrade: 97,
      aiFeedbackSummary: 'Thorough, accurate, and cleanly formatted workshop documentation.'
    },
    {
      id: 'sub-dhruva-engeth',
      assignmentId: 'assign-engeth-1',
      studentId: 'student-1',
      studentName: 'Dhruva',
      studentEmail: 'dhruva.260101@bmu.edu.in',
      submissionText: `### Autonomous Systems & Whistleblowing Policy by Dhruva
Applied deontological and utilitarian ethics to algorithmic bias in predictive policing and safety-critical avionics.`,
      fileAttachment: 'dhruva_engineering_ethics_defense.pdf',
      submittedAt: '2026-08-20T13:00:00',
      status: 'graded',
      grade: 99,
      maxPoints: 100,
      feedback: 'Brilliant philosophical depth paired with realistic engineering governance policies.',
      aiSuggestedGrade: 99,
      aiFeedbackSummary: 'Insightful ethical discourse grounded in IEEE/ACM codes.'
    },
    {
      id: 'sub-dhruva-cpc',
      assignmentId: 'assign-cpc-1',
      studentId: 'student-1',
      studentName: 'Dhruva',
      studentEmail: 'dhruva.260101@bmu.edu.in',
      submissionText: `### Vector Implementation in C99 by Dhruva (Roll: 260101)

\`\`\`c
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int* data;
    size_t size;
    size_t capacity;
} Vector;

Vector* vector_create(size_t initial_capacity) {
    Vector* v = (Vector*)malloc(sizeof(Vector));
    if (!v) return NULL;
    v->size = 0;
    v->capacity = initial_capacity > 0 ? initial_capacity : 4;
    v->data = (int*)malloc(v->capacity * sizeof(int));
    if (!v->data) { free(v); return NULL; }
    return v;
}

int vector_push_back(Vector* v, int value) {
    if (v->size == v->capacity) {
        size_t new_cap = v->capacity * 2;
        int* new_data = (int*)realloc(v->data, new_cap * sizeof(int));
        if (!new_data) return 0;
        v->data = new_data;
        v->capacity = new_cap;
    }
    v->data[v->size++] = value;
    return 1;
}

void vector_free(Vector* v) {
    if (v) {
        if (v->data) free(v->data);
        free(v);
    }
}
\`\`\`

Valgrind Verification Summary:
- Total Heap Usage: 4 allocs, 4 frees, 0 bytes in 0 blocks leaked.
- Code passed all stress tests with 1,000,000 push_back operations in 0.042 seconds.`,
      fileAttachment: 'dhruva_vector_solution_valgrind_clean.zip',
      submittedAt: '2026-08-20T14:30:00',
      status: 'graded',
      grade: 99,
      maxPoints: 100,
      feedback: 'Flawless C implementation! Exemplary memory management with defensive realloc checks and zero Valgrind leaks. Amortized proof is textbook quality.',
      aiSuggestedGrade: 99,
      aiFeedbackSummary: 'Outstanding submission. Code is completely leak-free, defensive against allocation failures, and highly optimized.'
    },
    {
      id: 'sub-aryan-cpc',
      assignmentId: 'assign-cpc-1',
      studentId: 'student-2',
      studentName: 'Aryan Sagar',
      studentEmail: 'aryan.260102@bmu.edu.in',
      submissionText: `Completed vector operations with dynamic realloc. Attached source code.`,
      fileAttachment: 'aryan_vector.c',
      submittedAt: '2026-08-20T16:10:00',
      status: 'graded',
      grade: 85,
      maxPoints: 100,
      feedback: 'Good implementation. Remember to handle the edge case where realloc fails without overwriting the original data pointer.',
      aiSuggestedGrade: 84,
      aiFeedbackSummary: 'Passes unit tests cleanly. Minor recommendation to avoid direct realloc assignment without temporary pointer.'
    },
    {
      id: 'sub-dishika-cpc',
      assignmentId: 'assign-cpc-1',
      studentId: 'student-4',
      studentName: 'Dishika Saxena',
      studentEmail: 'dishika.260104@bmu.edu.in',
      submissionText: `Dynamic Vector C code with test harness and Makefile included in attachment.`,
      fileAttachment: 'dishika_vector_c.zip',
      submittedAt: '2026-08-20T18:20:00',
      status: 'graded',
      grade: 92,
      maxPoints: 100,
      feedback: 'Very thorough test harness and clean code formatting. Great job on the vector shrinking logic!',
      aiSuggestedGrade: 92,
      aiFeedbackSummary: 'High quality submission with custom test harness and zero memory errors.'
    }
  ],

  notes: [
    {
      id: 'note-dhruva-1',
      studentId: 'student-1',
      subjectId: 'subj-cpc',
      title: 'Pointers, Memory Layout & Double Pointers in C',
      content: `# Memory Architecture & Pointer Mechanics in C

## 1. Virtual Address Space Layout:
- **Text Segment**: Machine instructions (Read-Only).
- **Data Segment**: Initialized global and static variables.
- **BSS Segment**: Uninitialized global and static variables (Zero-filled).
- **Heap Segment**: Dynamically allocated memory via \`malloc\`, \`calloc\`, \`realloc\` (Grows upwards).
- **Stack Segment**: Function stack frames, local automatic variables (Grows downwards).

## 2. Pointer Arithmetic Rules:
When adding an integer $k$ to a pointer $p$ of type $T*$:
$$\\text{New Address} = \\text{Address}(p) + k \\times \\text{sizeof}(T)$$

## 3. Double Pointers (\`int**\`):
Used when modifying a pointer variable itself inside a function:
\`\`\`c
void allocate_buffer(char** buf_ptr, size_t size) {
    *buf_ptr = (char*)malloc(size * sizeof(char));
}
\`\`\`

## Key Takeaway:
Always check if dynamic allocation returned \`NULL\` before dereferencing, and pair every \`malloc\` with exactly one \`free\`.`,
      tags: ['C Programming', 'Pointers', 'Memory Layout', 'Exam Prep'],
      lastModified: '2026-08-21T09:00:00',
      isPinned: true,
      summary: 'Comprehensive notes covering C process memory segmentation, pointer arithmetic scale factors, and double pointer function parameters.',
      keyTakeaways: [
        'Heap memory persists across function calls until explicitly released with free().',
        'Pointer arithmetic automatically scales by the sizeof the pointed-to data type.',
        'Always set freed pointers to NULL to avoid dangerous dangling pointer access.'
      ],
      flashcards: [
        {
          id: 'fc-cpc-1',
          question: 'What happens if you free a pointer twice in C?',
          answer: 'It results in undefined behavior (often a heap corruption crash / abort).',
          hint: 'Think about heap metadata consistency.',
          topic: 'Dynamic Memory'
        },
        {
          id: 'fc-cpc-2',
          question: 'How do you prevent memory leaks when reallocating memory in C?',
          answer: 'Store the result of realloc in a temporary pointer first; only overwrite the original pointer if temp is non-NULL.',
          hint: 'What happens if realloc returns NULL?',
          topic: 'Safe Allocation'
        }
      ]
    },
    {
      id: 'note-dhruva-2',
      studentId: 'student-1',
      subjectId: 'subj-calc',
      title: 'Lagrange Multipliers & Hessian Extrema Classification',
      content: `# Multivariable Optimization with Constraints

## 1. The Lagrange Multiplier Condition:
To optimize $f(x, y, z)$ subject to constraint $g(x, y, z) = c$:
$$\\nabla f = \\lambda \\nabla g$$

This implies the gradient vectors are parallel at boundary tangent points.

## 2. Setting Up the System of Equations:
$$\\begin{cases}
f_x = \\lambda g_x \\\\
f_y = \\lambda g_y \\\\
f_z = \\lambda g_z \\\\
g(x, y, z) = c
\\end{cases}$$

## 3. Second Derivative Test (Hessian Matrix):
$$H = \\begin{pmatrix} f_{xx} & f_{xy} \\\\ f_{yx} & f_{yy} \\end{pmatrix}$$
- If $\\det(H) > 0$ and $f_{xx} > 0 \\implies$ **Local Minimum**
- If $\\det(H) > 0$ and $f_{xx} < 0 \\implies$ **Local Maximum**
- If $\\det(H) < 0 \\implies$ **Saddle Point**`,
      tags: ['Calculus', 'Lagrange Multipliers', 'Optimization'],
      lastModified: '2026-08-20T15:30:00',
      isPinned: true,
      summary: 'Formulas and test criteria for constrained multivariable calculus optimization and Hessian determinant analysis.',
      keyTakeaways: [
        'At constrained extrema, level curves of the objective function are tangent to the constraint curve.',
        'The Hessian determinant classifies stationary points without ambiguity.'
      ],
      flashcards: [
        {
          id: 'fc-calc-1',
          question: 'What geometric relationship exists between gradients at a constrained extremum?',
          answer: 'The gradient of the objective function is parallel to the gradient of the constraint function (∇f = λ∇g).',
          hint: 'Consider the tangent planes to level surfaces.',
          topic: 'Lagrange Multipliers'
        }
      ]
    }
  ],

  analytics: {
    'subj-ess': {
      subjectId: 'subj-ess',
      subjectName: 'Environmental Studies and Sustainability',
      totalStudents: 15,
      classAverage: 86.4,
      submissionRate: 93.3,
      atRiskStudentsCount: 1,
      gradeDistribution: [
        { range: '90-100% (A)', count: 6, percentage: 40.0 },
        { range: '80-89% (B)', count: 6, percentage: 40.0 },
        { range: '70-79% (C)', count: 2, percentage: 13.3 },
        { range: '60-69% (D)', count: 1, percentage: 6.7 },
        { range: '<60% (F)', count: 0, percentage: 0.0 }
      ],
      weakTopics: [
        {
          topic: 'EIA Matrix Quantification & Scoping Protocols',
          errorRate: 32,
          averageScore: 71.0,
          affectedStudents: 5,
          recommendedRemediation: 'Provide structured Leopold matrix case study worksheets for Indian industrial projects.',
          urgency: 'medium'
        }
      ],
      trends: [
        { week: 'Week 1', avgScore: 88.5, submissionRate: 100.0, activeCount: 15 },
        { week: 'Week 2', avgScore: 86.0, submissionRate: 93.3, activeCount: 15 },
        { week: 'Week 3', avgScore: 85.2, submissionRate: 93.3, activeCount: 14 },
        { week: 'Week 4', avgScore: 86.4, submissionRate: 93.3, activeCount: 15 }
      ],
      aiExecutiveSummary: `The 1st Year B.Tech cohort across CSE, ECE, and ME is showing excellent engagement in ESS. Class average stands at 86.4% under Dr. Sanmitra Burman. Dhruva and Ashita lead in environmental audit precision.`,
      keyActionItems: [
        'Conduct the campus water sampling practical session.',
        'Review Leopold EIA scoring methodology before the midterm.'
      ],
      lastGenerated: '2026-08-21T10:00:00'
    },
    'subj-calc': {
      subjectId: 'subj-calc',
      subjectName: 'Calculus and Mathematics',
      totalStudents: 15,
      classAverage: 84.8,
      submissionRate: 96.0,
      atRiskStudentsCount: 2,
      gradeDistribution: [
        { range: '90-100% (A)', count: 5, percentage: 33.3 },
        { range: '80-89% (B)', count: 6, percentage: 40.0 },
        { range: '70-79% (C)', count: 3, percentage: 20.0 },
        { range: '60-69% (D)', count: 1, percentage: 6.7 },
        { range: '<60% (F)', count: 0, percentage: 0.0 }
      ],
      weakTopics: [
        {
          topic: 'Lagrange Multipliers with Dual Constraints',
          errorRate: 36,
          averageScore: 69.5,
          affectedStudents: 5,
          recommendedRemediation: 'Conduct dedicated tutorial on 3D geometric intersections and multiplier substitutions.',
          urgency: 'high'
        }
      ],
      trends: [
        { week: 'Week 1', avgScore: 87.0, submissionRate: 100.0, activeCount: 15 },
        { week: 'Week 2', avgScore: 85.0, submissionRate: 93.3, activeCount: 15 },
        { week: 'Week 3', avgScore: 83.2, submissionRate: 93.3, activeCount: 15 },
        { week: 'Week 4', avgScore: 84.8, submissionRate: 96.0, activeCount: 15 }
      ],
      aiExecutiveSummary: `Dr. Raghav Singhal’s calculus cohort demonstrates strong foundational derivative skills. Dhruva achieved top marks in multivariable derivations (9.85 GPA).`,
      keyActionItems: [
        'Schedule problem-solving clinic on Lagrange dual-constraint systems.',
        'Publish practice mock sheet for upcoming Mid-Semester Exam.'
      ],
      lastGenerated: '2026-08-21T10:15:00'
    },
    'subj-eme': {
      subjectId: 'subj-eme',
      subjectName: 'Elements of Mechanical Engineering',
      totalStudents: 15,
      classAverage: 82.5,
      submissionRate: 90.0,
      atRiskStudentsCount: 2,
      gradeDistribution: [
        { range: '90-100% (A)', count: 4, percentage: 26.7 },
        { range: '80-89% (B)', count: 7, percentage: 46.7 },
        { range: '70-79% (C)', count: 3, percentage: 20.0 },
        { range: '60-69% (D)', count: 1, percentage: 6.7 },
        { range: '<60% (F)', count: 0, percentage: 0.0 }
      ],
      weakTopics: [
        {
          topic: 'Air Standard Otto vs Diesel Cycle Thermal Efficiency Proofs',
          errorRate: 30,
          averageScore: 72.0,
          affectedStudents: 4,
          recommendedRemediation: 'Demonstrate step-by-step P-v and T-s thermodynamic cycle diagrams.',
          urgency: 'medium'
        }
      ],
      trends: [
        { week: 'Week 1', avgScore: 84.0, submissionRate: 95.0, activeCount: 15 },
        { week: 'Week 2', avgScore: 82.5, submissionRate: 90.0, activeCount: 15 },
        { week: 'Week 3', avgScore: 81.0, submissionRate: 88.0, activeCount: 14 },
        { week: 'Week 4', avgScore: 82.5, submissionRate: 90.0, activeCount: 15 }
      ],
      aiExecutiveSummary: `Dr. K Srikanth reports solid workshop attendance. Machine tool practicals are scheduled for next week.`,
      keyActionItems: [
        'Ensure workshop safety gear check before lathe operations.',
        'Review thermodynamic cycle thermal efficiency formulas.'
      ],
      lastGenerated: '2026-08-21T10:30:00'
    },
    'subj-engeth': {
      subjectId: 'subj-engeth',
      subjectName: 'Engineering Ethics',
      totalStudents: 15,
      classAverage: 89.2,
      submissionRate: 98.0,
      atRiskStudentsCount: 0,
      gradeDistribution: [
        { range: '90-100% (A)', count: 8, percentage: 53.3 },
        { range: '80-89% (B)', count: 5, percentage: 33.3 },
        { range: '70-79% (C)', count: 2, percentage: 13.3 },
        { range: '60-69% (D)', count: 0, percentage: 0.0 },
        { range: '<60% (F)', count: 0, percentage: 0.0 }
      ],
      weakTopics: [
        {
          topic: 'Deontological vs Utilitarian Whistleblower Liability',
          errorRate: 18,
          averageScore: 82.4,
          affectedStudents: 2,
          recommendedRemediation: 'Deep-dive into landmark case studies on engineering disclosure rights.',
          urgency: 'low'
        }
      ],
      trends: [
        { week: 'Week 1', avgScore: 90.0, submissionRate: 100.0, activeCount: 15 },
        { week: 'Week 2', avgScore: 89.5, submissionRate: 97.0, activeCount: 15 },
        { week: 'Week 3', avgScore: 88.8, submissionRate: 98.0, activeCount: 15 },
        { week: 'Week 4', avgScore: 89.2, submissionRate: 98.0, activeCount: 15 }
      ],
      aiExecutiveSummary: `Dr. Beenu Taneja notes exceptional debate quality in engineering disaster ethics. 0 at-risk students.`,
      keyActionItems: [
        'Finalize team case study presentations on autonomous vehicle ethics.'
      ],
      lastGenerated: '2026-08-21T10:45:00'
    },
    'subj-cpc': {
      subjectId: 'subj-cpc',
      subjectName: 'Computer Programming in C',
      totalStudents: 15,
      classAverage: 85.5,
      submissionRate: 94.0,
      atRiskStudentsCount: 1,
      gradeDistribution: [
        { range: '90-100% (A)', count: 5, percentage: 33.3 },
        { range: '80-89% (B)', count: 6, percentage: 40.0 },
        { range: '70-79% (C)', count: 3, percentage: 20.0 },
        { range: '60-69% (D)', count: 1, percentage: 6.7 },
        { range: '<60% (F)', count: 0, percentage: 0.0 }
      ],
      weakTopics: [
        {
          topic: 'Double Pointers (**ptr) & Heap Reallocation Memory Leaks',
          errorRate: 35,
          averageScore: 68.0,
          affectedStudents: 5,
          recommendedRemediation: 'Run interactive Valgrind lab demonstration on dynamic array resizing.',
          urgency: 'high'
        }
      ],
      trends: [
        { week: 'Week 1', avgScore: 88.0, submissionRate: 100.0, activeCount: 15 },
        { week: 'Week 2', avgScore: 86.5, submissionRate: 94.0, activeCount: 15 },
        { week: 'Week 3', avgScore: 83.0, submissionRate: 90.0, activeCount: 14 },
        { week: 'Week 4', avgScore: 85.5, submissionRate: 94.0, activeCount: 15 }
      ],
      aiExecutiveSummary: `Dr. Nikhil Kumar reports great enthusiasm for Problem Set 1. Dhruva achieved 99% with zero Valgrind leaks. Review session on pointer arithmetic scheduled for Thursday.`,
      keyActionItems: [
        'Host Valgrind memory leak debugging clinic in Computing Lab 4.',
        'Review double pointers and linked list node linking.'
      ],
      lastGenerated: '2026-08-21T11:00:00'
    }
  }
};
