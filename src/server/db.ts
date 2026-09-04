import {
  User,
  Subject,
  TimelineItem,
  ReferenceResource,
  Assignment,
  Submission,
  StudentNote,
  ClassAnalytics,
  ClassSarthiLecture,
  BoardCapture,
  LectureMasteryQuiz,
  StudentConceptMastery,
  QuestionBank
} from '../types';
import { FAKE_QUESTION_BANKS } from '../mock/fakeData';
import {
  seedLectures,
  seedBoardCaptures,
  seedMasteryQuizzes,
  seedConceptMastery,
  seedStudentLectureProgress
} from './classsarthiSeed';

import fs from 'fs';
import path from 'path';
import seedUsersJson from '../../data/users.json';
import seedLecturesJson from '../../data/lectures.json';
import seedNotesJson from '../../data/notes.json';
import seedProgressJson from '../../data/student_progress.json';

export interface InMemoryDatabase {
  users: User[];
  subjects: Subject[];
  timelines: TimelineItem[];
  resources: ReferenceResource[];
  assignments: Assignment[];
  submissions: Submission[];
  notes: StudentNote[];
  analytics: Record<string, ClassAnalytics>;
  lectures: ClassSarthiLecture[];
  boardCaptures: BoardCapture[];
  conceptMastery: Record<string, StudentConceptMastery[]>;
  lectureProgress: Record<string, Record<string, any>>;
  masteryQuizzes: Record<string, LectureMasteryQuiz>;
  questionBanks: QuestionBank[];
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const USERS_FILE_PATH = path.resolve(process.cwd(), 'data', 'users.json');
const NOTES_FILE_PATH = path.resolve(process.cwd(), 'data', 'notes.json');
const LECTURES_FILE_PATH = path.resolve(process.cwd(), 'data', 'lectures.json');
const PROGRESS_FILE_PATH = path.resolve(process.cwd(), 'data', 'student_progress.json');

export function saveLecturesToDisk(lectures: ClassSarthiLecture[]) {
  if (isServerless) return;
  try {
    const dir = path.dirname(LECTURES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LECTURES_FILE_PATH, JSON.stringify(lectures, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving lectures to disk:', err);
  }
}

export function loadLecturesFromDisk(seed: ClassSarthiLecture[]): ClassSarthiLecture[] {
  const fallbackSeed = (Array.isArray(seedLecturesJson) && seedLecturesJson.length > 0) ? (seedLecturesJson as unknown as ClassSarthiLecture[]) : seed;
  try {
    if (fs.existsSync(LECTURES_FILE_PATH)) {
      const content = fs.readFileSync(LECTURES_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((l: any) => l.id));
        const missing = fallbackSeed.filter(s => !existingIds.has(s.id));
        return [...parsed, ...missing];
      }
    }
  } catch (err) {
    console.error('Error loading lectures from disk:', err);
  }
  return fallbackSeed;
}

export function saveProgressToDisk(progress: Record<string, Record<string, any>>) {
  if (isServerless) return;
  try {
    const dir = path.dirname(PROGRESS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PROGRESS_FILE_PATH, JSON.stringify(progress, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving progress to disk:', err);
  }
}

export function loadProgressFromDisk(seed: Record<string, Record<string, any>>): Record<string, Record<string, any>> {
  const fallbackSeed = (seedProgressJson && typeof seedProgressJson === 'object') ? (seedProgressJson as Record<string, Record<string, any>>) : seed;
  try {
    if (fs.existsSync(PROGRESS_FILE_PATH)) {
      const content = fs.readFileSync(PROGRESS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        return { ...fallbackSeed, ...parsed };
      }
    }
  } catch (err) {
    console.error('Error loading progress from disk:', err);
  }
  return fallbackSeed;
}

export function saveUsersToDisk(users: User[]) {
  if (isServerless) return;
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users to disk:', err);
  }
}

export function loadUsersFromDisk(seed: User[]): User[] {
  const fallbackSeed = (Array.isArray(seedUsersJson) && seedUsersJson.length > 0) ? (seedUsersJson as unknown as User[]) : seed;
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const content = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading users from disk:', err);
  }
  return fallbackSeed;
}

export function saveNotesToDisk(notes: StudentNote[]) {
  if (isServerless) return;
  try {
    const dir = path.dirname(NOTES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify(notes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving notes to disk:', err);
  }
}

export function loadNotesFromDisk(seed: StudentNote[]): StudentNote[] {
  const fallbackSeed = (Array.isArray(seedNotesJson) && seedNotesJson.length > 0) ? (seedNotesJson as unknown as StudentNote[]) : seed;
  try {
    if (fs.existsSync(NOTES_FILE_PATH)) {
      const content = fs.readFileSync(NOTES_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((n: any) => n.id));
        const missingSeeds = fallbackSeed.filter(s => !existingIds.has(s.id));
        return [...parsed, ...missingSeeds];
      }
    }
  } catch (err) {
    console.error('Error loading notes from disk:', err);
  }
  return fallbackSeed;
}

const seedUsers: User[] = [
  // --- ONLY DEAN ---
  {
    id: 'admin-1',
    name: 'Dr. Maneek Singh',
    email: 'dean.maneek@edusync.edu.in',
    username: 'dean.maneek',
    password: 'Dean@EduSync2026!',
    role: 'admin',
    gender: 'Male',
    institutionalId: 'EDU-ADM-1001',
    department: 'Office of the Dean & Academic Registrar',
    designation: 'Dean of Academic Welfare & Institutional Registrar',
    enrolledSubjectIds: [],
    teachingSubjectIds: [],
    officeLocation: 'Academic Block A - Room 102',
    officeHours: 'Mon-Fri 10:00 AM - 04:30 PM',
    status: 'active',
    joinedDate: '2018-07-01',
    phone: '+91 98110 54321'
  },

  // --- TEACHERS FOR PHYSICS, CHEMISTRY, MATHS ---
  {
    id: 'teacher-phy',
    name: 'Dr. Rajesh Kulkarni',
    email: 'rajesh.kulkarni@edusync.edu.in',
    username: 'prof.rajesh',
    password: 'Physics@2026!',
    role: 'teacher',
    gender: 'Male',
    institutionalId: 'EDU-FAC-201',
    department: 'Department of Physics',
    designation: 'Senior Faculty of Physics (Grades 11 & 12)',
    enrolledSubjectIds: [],
    teachingSubjectIds: ['subj-phy', 'subj-misc', 'subj-phy-11', 'subj-phy-12'],
    officeLocation: 'Physics Block P - Lab 201',
    officeHours: 'Mon & Thu 02:00 PM - 04:00 PM',
    status: 'active',
    joinedDate: '2019-07-01',
    phone: '+91 98110 54331'
  },
  {
    id: 'teacher-che',
    name: 'Dr. Ananya Sen',
    email: 'ananya.sen@edusync.edu.in',
    username: 'prof.ananya',
    password: 'Chemistry@2026!',
    role: 'teacher',
    gender: 'Female',
    institutionalId: 'EDU-FAC-202',
    department: 'Department of Chemistry',
    designation: 'Lead Faculty of Chemistry (Grades 11 & 12)',
    enrolledSubjectIds: [],
    teachingSubjectIds: ['subj-che', 'subj-misc', 'subj-che-11', 'subj-che-12'],
    officeLocation: 'Chemistry Block C - Hall 2',
    officeHours: 'Tue & Fri 11:00 AM - 01:00 PM',
    status: 'active',
    joinedDate: '2020-08-15',
    phone: '+91 98110 54332'
  },
  {
    id: 'teacher-mat',
    name: 'Prof. Vikramaditya Roy',
    email: 'vikram.roy@edusync.edu.in',
    username: 'prof.vikram',
    password: 'Maths@2026!',
    role: 'teacher',
    gender: 'Male',
    institutionalId: 'EDU-FAC-203',
    department: 'Department of Mathematics',
    designation: 'Senior Professor of Mathematics (Grades 11 & 12)',
    enrolledSubjectIds: [],
    teachingSubjectIds: ['subj-mat', 'subj-misc', 'subj-mat-11', 'subj-mat-12'],
    officeLocation: 'Ramanujan Block M - Room 101',
    officeHours: 'Wed & Fri 03:00 PM - 05:00 PM',
    status: 'active',
    joinedDate: '2018-06-01',
    phone: '+91 98110 54333'
  },

  // --- STUDENTS: COMBINED 11th & 12th WITH RANDOM AI LEARNER PERSONAS ---
  {
    id: 'student-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@edusync.edu.in',
    username: 'aarav.sharma',
    password: 'Student@2026!',
    role: 'student',
    gender: 'Male',
    institutionalId: 'EDU-STU-1101',
    department: 'Senior Secondary Science (Grade 11 PCM)',
    program: 'CBSE / JEE Prep Track',
    academicYear: 'Grade 11',
    gpa: 9.4,
    enrolledSubjectIds: ['subj-phy', 'subj-che', 'subj-mat', 'subj-misc', 'subj-phy-11', 'subj-che-11', 'subj-mat-11'],
    teachingSubjectIds: [],
    status: 'active',
    joinedDate: '2026-04-01',
    phone: '+91 98100 11001',
    learningProfile: {
      learningStyle: 'visual',
      targetGrade: 'A+',
      explanationTone: 'encouraging_mentor',
      preferredPace: 'steady',
      strengthsAndInterests: 'Visual mindmaps, free-body force diagrams, geometric graphs',
      painPoints: 'Abstract algebra without spatial diagrams, sign conventions',
      questionnaireCompleted: true,
      completedAt: '2026-09-01T10:00:00.000Z'
    }
  },
  {
    id: 'student-2',
    name: 'Diya Patel',
    email: 'diya.patel@edusync.edu.in',
    username: 'diya.patel',
    password: 'Student@2026!',
    role: 'student',
    gender: 'Female',
    institutionalId: 'EDU-STU-1102',
    department: 'Senior Secondary Science (Grade 11 PCM)',
    program: 'CBSE / JEE Prep Track',
    academicYear: 'Grade 11',
    gpa: 9.1,
    enrolledSubjectIds: ['subj-phy', 'subj-che', 'subj-mat', 'subj-misc', 'subj-phy-11', 'subj-che-11', 'subj-mat-11'],
    teachingSubjectIds: [],
    status: 'active',
    joinedDate: '2026-04-01',
    phone: '+91 98100 11002',
    learningProfile: {
      learningStyle: 'step_by_step',
      targetGrade: 'competitive',
      explanationTone: 'practical_engineer',
      preferredPace: 'thorough',
      strengthsAndInterests: 'First-principles calculus derivations, organic mechanisms, thermodynamics proofs',
      painPoints: 'Skipped intermediate steps in mathematical proofs, ambiguous notation',
      questionnaireCompleted: true,
      completedAt: '2026-09-01T10:15:00.000Z'
    }
  },
  {
    id: 'student-3',
    name: 'Kabir Mehta',
    email: 'kabir.mehta@edusync.edu.in',
    username: 'kabir.mehta',
    password: 'Student@2026!',
    role: 'student',
    gender: 'Male',
    institutionalId: 'EDU-STU-1103',
    department: 'Senior Secondary Science (Grade 11 PCM)',
    program: 'CBSE / JEE Prep Track',
    academicYear: 'Grade 11',
    gpa: 8.8,
    enrolledSubjectIds: ['subj-phy', 'subj-che', 'subj-mat', 'subj-misc', 'subj-phy-11', 'subj-che-11', 'subj-mat-11'],
    teachingSubjectIds: [],
    status: 'active',
    joinedDate: '2026-04-01',
    phone: '+91 98100 11003',
    learningProfile: {
      learningStyle: 'socratic_dialogue',
      targetGrade: 'A',
      explanationTone: 'encouraging_mentor',
      preferredPace: 'steady',
      strengthsAndInterests: 'Real-world physical analogies, thought experiments, inquiry',
      painPoints: 'Rote formula memorization under timed conditions',
      questionnaireCompleted: true,
      completedAt: '2026-09-01T10:30:00.000Z'
    }
  },
  {
    id: 'student-4',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@edusync.edu.in',
    username: 'ananya.iyer',
    password: 'Student@2026!',
    role: 'student',
    gender: 'Female',
    institutionalId: 'EDU-STU-1201',
    department: 'Senior Secondary Science (Grade 12 PCM)',
    program: 'CBSE / JEE Advanced Track',
    academicYear: 'Grade 12',
    gpa: 9.6,
    enrolledSubjectIds: ['subj-phy', 'subj-che', 'subj-mat', 'subj-misc', 'subj-phy-12', 'subj-che-12', 'subj-mat-12'],
    teachingSubjectIds: [],
    status: 'active',
    joinedDate: '2025-04-01',
    phone: '+91 98100 12001',
    learningProfile: {
      learningStyle: 'exam_focused',
      targetGrade: 'competitive',
      explanationTone: 'strict_coach',
      preferredPace: 'accelerated',
      strengthsAndInterests: 'High-yield numerical problem solving, integration shortcuts, circuit analysis',
      painPoints: 'Lengthy descriptive theory questions, coordination compound nomenclature',
      questionnaireCompleted: true,
      completedAt: '2026-09-01T11:00:00.000Z'
    }
  },
  {
    id: 'student-5',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@edusync.edu.in',
    username: 'rohan.gupta',
    password: 'Student@2026!',
    role: 'student',
    gender: 'Male',
    institutionalId: 'EDU-STU-1202',
    department: 'Senior Secondary Science (Grade 12 PCM)',
    program: 'CBSE / JEE Advanced Track',
    academicYear: 'Grade 12',
    gpa: 8.9,
    enrolledSubjectIds: ['subj-phy', 'subj-che', 'subj-mat', 'subj-misc', 'subj-phy-12', 'subj-che-12', 'subj-mat-12'],
    teachingSubjectIds: [],
    status: 'active',
    joinedDate: '2025-04-01',
    phone: '+91 98100 12002',
    learningProfile: {
      learningStyle: 'socratic_dialogue',
      targetGrade: 'A+',
      explanationTone: 'practical_engineer',
      preferredPace: 'steady',
      strengthsAndInterests: 'Electromagnetism, electromagnetic induction, wave optics experiments',
      painPoints: '3D spatial coordinate rotations and plane vectors',
      questionnaireCompleted: true,
      completedAt: '2026-09-01T11:30:00.000Z'
    }
  },
  {
    id: 'student-6',
    name: 'Ishaan Verma',
    email: 'ishaan.verma@edusync.edu.in',
    username: 'ishaan.verma',
    password: 'Student@2026!',
    role: 'student',
    gender: 'Male',
    institutionalId: 'EDU-STU-1203',
    department: 'Senior Secondary Science (Grade 12 PCM)',
    program: 'CBSE / JEE Advanced Track',
    academicYear: 'Grade 12',
    gpa: 9.0,
    enrolledSubjectIds: ['subj-phy', 'subj-che', 'subj-mat', 'subj-misc', 'subj-phy-12', 'subj-che-12', 'subj-mat-12'],
    teachingSubjectIds: [],
    status: 'active',
    joinedDate: '2025-04-01',
    phone: '+91 98100 12003',
    learningProfile: {
      learningStyle: 'visual',
      targetGrade: 'A',
      explanationTone: 'encouraging_mentor',
      preferredPace: 'thorough',
      strengthsAndInterests: 'Organic reaction flowcharts, optical ray diagrams, crystal lattices',
      painPoints: 'Equilibrium constants and multistep redox titrations',
      questionnaireCompleted: true,
      completedAt: '2026-09-01T11:45:00.000Z'
    }
  }
];

export const db: InMemoryDatabase = {
  users: loadUsersFromDisk(seedUsers),
  subjects: [
    // ==========================================
    // CORE UNIFIED SUBJECTS (PHY, CHEM, MATHS + MISC)
    // ==========================================
    {
      id: 'subj-phy',
      code: 'PHY',
      name: 'Physics',
      description: 'Foundational Newtonian mechanics, kinematics, rotational dynamics, work-energy theorem, universal gravitation, thermodynamics, and electromagnetism.',
      teacherId: 'teacher-phy',
      teacherName: 'Dr. Rajesh Kulkarni',
      teacherEmail: 'rajesh.kulkarni@edusync.edu.in',
      color: 'blue',
      accentBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      enrolledCount: 7,
      semester: 'Academic Year 2026-27',
      room: 'Physics Block P - Lecture Theatre 1',
      credits: 4,
      department: 'Department of Physics',
      syllabusTopics: [
        'Kinematics, Laws of Motion & Friction Mechanics',
        'Work, Energy and Power & Conservation Principles',
        'Rotational Dynamics & Moment of Inertia of Rigid Bodies',
        'Thermodynamics, Carnot Heat Engines & Kinetic Theory',
        'Electromagnetic Induction, Flux & Faraday-Lenz Law'
      ]
    },
    {
      id: 'subj-che',
      code: 'CHEM',
      name: 'Chemistry',
      description: 'Quantum atomic models, chemical bonding (VSEPR), chemical thermodynamics, electrochemistry (Nernst equation), chemical kinetics, and reaction mechanisms.',
      teacherId: 'teacher-che',
      teacherName: 'Dr. Ananya Sen',
      teacherEmail: 'ananya.sen@edusync.edu.in',
      color: 'emerald',
      accentBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      enrolledCount: 7,
      semester: 'Academic Year 2026-27',
      room: 'Chemistry Block C - Hall 2',
      credits: 4,
      department: 'Department of Chemistry',
      syllabusTopics: [
        'Chemical Bonding, VSEPR Theory & Hybridization',
        'Electrochemistry, Galvanic Cells & Nernst Equation',
        'Chemical Kinetics, Rate Laws & Arrhenius Activation',
        'Chemical Thermodynamics & Hess Law',
        'Organic Reaction Mechanisms & Carbonyl Chemistry'
      ]
    },
    {
      id: 'subj-mat',
      code: 'MATH',
      name: 'Mathematics',
      description: 'Techniques of integration, definite integrals, vector cross products, 3D geometry of planes, limits, continuity, and differential equations.',
      teacherId: 'teacher-mat',
      teacherName: 'Prof. Vikramaditya Roy',
      teacherEmail: 'vikram.roy@edusync.edu.in',
      color: 'violet',
      accentBg: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
      enrolledCount: 7,
      semester: 'Academic Year 2026-27',
      room: 'Ramanujan Block M - Room 101',
      credits: 4,
      department: 'Department of Mathematics',
      syllabusTopics: [
        'Techniques of Integration (Parts, Partial Fractions)',
        'Definite Integrals & King Reflection Property',
        'Vector Algebra & 3D Geometry of Planes',
        'Fundamental Limits, Squeeze Theorem & Continuity',
        'Matrices, Inverses & Differential Modeling'
      ]
    },
    {
      id: 'subj-misc',
      code: 'MISC',
      name: 'Miscellaneous & General Notes',
      description: 'Central designated repository where all cross-disciplinary, general studies, electives, lab journals, and other notes are organized.',
      teacherId: 'teacher-phy',
      teacherName: 'Dr. Rajesh Kulkarni',
      teacherEmail: 'rajesh.kulkarni@edusync.edu.in',
      color: 'purple',
      accentBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      enrolledCount: 7,
      semester: 'Academic Year 2026-27',
      room: 'Central Learning Commons - Suite 1',
      credits: 3,
      department: 'Interdisciplinary & General Studies',
      syllabusTopics: [
        'Scientific Research Methodology & Error Propagation',
        'Scientific Computing with Python, NumPy & Visualizations',
        'Laboratory Safety Protocols & Experimental Design',
        'General Studies & Cross-Curricular Projects'
      ]
    },

    // ==========================================
    // GRADE 11 SCIENCE SUBJECTS (PCM)
    // ==========================================
    {
      id: 'subj-phy-11',
      code: 'PHY11',
      name: 'Class 11 Physics (Mechanics & Thermodynamics)',
      description: 'Foundational Newtonian mechanics, kinematics, rotational dynamics, work-energy theorem, gravitation, fluid mechanics, and thermodynamics.',
      teacherId: 'teacher-phy',
      teacherName: 'Dr. Rajesh Kulkarni',
      teacherEmail: 'rajesh.kulkarni@edusync.edu.in',
      color: 'blue',
      accentBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      enrolledCount: 6,
      semester: 'Academic Year 2026-27 (Grade 11)',
      room: 'Physics Block P - Lecture Theatre 1',
      credits: 4,
      department: 'Senior Secondary Science - Grade 11',
      syllabusTopics: [
        'Kinematics in 1D & 2D (Vectors, Projectile Motion)',
        'Laws of Motion & Friction Mechanics',
        'Work, Energy and Power & Conservation Principles',
        'Rotational Motion & Moment of Inertia of Rigid Bodies',
        'Universal Gravitation & Orbital Mechanics',
        'Thermodynamics, Carnot Engines & Kinetic Theory of Gases'
      ]
    },
    {
      id: 'subj-che-11',
      code: 'CHE11',
      name: 'Class 11 Chemistry (Physical, Inorganic & Organic)',
      description: 'Quantum atomic structure, periodic classification, chemical bonding, thermodynamics, equilibrium, redox reactions, and fundamental organic chemistry.',
      teacherId: 'teacher-che',
      teacherName: 'Dr. Ananya Sen',
      teacherEmail: 'ananya.sen@edusync.edu.in',
      color: 'emerald',
      accentBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      enrolledCount: 6,
      semester: 'Academic Year 2026-27 (Grade 11)',
      room: 'Chemistry Block C - Hall 2',
      credits: 4,
      department: 'Senior Secondary Science - Grade 11',
      syllabusTopics: [
        'Atomic Structure (Bohr Model, Quantum Numbers & Orbitals)',
        'Chemical Bonding & Molecular Structure (VSEPR, Hybridization & MOT)',
        'Chemical Thermodynamics & Hess Law',
        'Ionic & Chemical Equilibrium (Le Chatelier Principle, pH & Buffers)',
        'Redox Reactions & Oxidation States',
        'Organic Chemistry Basics & Hydrocarbon Reaction Mechanisms'
      ]
    },
    {
      id: 'subj-mat-11',
      code: 'MAT11',
      name: 'Class 11 Mathematics (Algebra, Trig & Calculus Basics)',
      description: 'Sets, relations and functions, trigonometric functions, permutations and combinations, binomial theorem, straight lines, conic sections, and introductory limits.',
      teacherId: 'teacher-mat',
      teacherName: 'Prof. Vikramaditya Roy',
      teacherEmail: 'vikram.roy@edusync.edu.in',
      color: 'violet',
      accentBg: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
      enrolledCount: 6,
      semester: 'Academic Year 2026-27 (Grade 11)',
      room: 'Ramanujan Block M - Room 101',
      credits: 4,
      department: 'Senior Secondary Science - Grade 11',
      syllabusTopics: [
        'Sets, Relations & Cartesian Products',
        'Trigonometric Functions & Compound Angle Identities',
        'Permutations, Combinations & Binomial Theorem',
        'Coordinate Geometry: Straight Lines, Circles & Conic Sections',
        'Limits, Continuity & First Principles Derivative Foundations',
        'Probability & Statistical Dispersion'
      ]
    },

    // ==========================================
    // GRADE 12 SCIENCE SUBJECTS (PCM)
    // ==========================================
    {
      id: 'subj-phy-12',
      code: 'PHY12',
      name: 'Class 12 Physics (Electromagnetism, Optics & Modern Physics)',
      description: 'Electrostatics, Gauss Law, current electricity, magnetic effects of current, electromagnetic induction, wave optics, photoelectric effect, and nuclear physics.',
      teacherId: 'teacher-phy',
      teacherName: 'Dr. Rajesh Kulkarni',
      teacherEmail: 'rajesh.kulkarni@edusync.edu.in',
      color: 'sky',
      accentBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
      enrolledCount: 6,
      semester: 'Academic Year 2026-27 (Grade 12)',
      room: 'Physics Block P - Advanced Lab 3',
      credits: 4,
      department: 'Senior Secondary Science - Grade 12',
      syllabusTopics: [
        'Electric Charges, Fields & Gauss Theorem Proofs',
        'Electrostatic Potential & Capacitors with Dielectrics',
        'Current Electricity, Kirchhoff Rules & Wheatstone Bridge',
        'Magnetism & Moving Charges (Biot-Savart & Ampere Laws)',
        'Electromagnetic Induction & Alternating Current Circuits',
        'Wave & Ray Optics, Interference & Photoelectric Effect'
      ]
    },
    {
      id: 'subj-che-12',
      code: 'CHE12',
      name: 'Class 12 Chemistry (Electrochemistry, Kinetics & Organics)',
      description: 'Solid state, solutions, electrochemistry, chemical kinetics, d & f block elements, coordination compounds, haloalkanes, aldehydes, ketones, and biomolecules.',
      teacherId: 'teacher-che',
      teacherName: 'Dr. Ananya Sen',
      teacherEmail: 'ananya.sen@edusync.edu.in',
      color: 'amber',
      accentBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      enrolledCount: 6,
      semester: 'Academic Year 2026-27 (Grade 12)',
      room: 'Chemistry Block C - Lab 204',
      credits: 4,
      department: 'Senior Secondary Science - Grade 12',
      syllabusTopics: [
        'Solutions & Colligative Properties (Raoult Law, Van t Hoff Factor)',
        'Electrochemistry (Nernst Equation, Galvanic Cells & Fuel Cells)',
        'Chemical Kinetics (Integrated Rate Laws & Arrhenius Equation)',
        'Coordination Compounds & Crystal Field Splitting Theory',
        'Aldehydes, Ketones & Carboxylic Acids Mechanisms',
        'Biomolecules: Carbohydrates, Proteins & Nucleic Acids'
      ]
    },
    {
      id: 'subj-mat-12',
      code: 'MAT12',
      name: 'Class 12 Mathematics (Calculus, Vectors & 3D Geometry)',
      description: 'Inverse trigonometric functions, matrices & determinants, continuity & differentiability, applications of derivatives, integrals, differential equations, and 3D geometry.',
      teacherId: 'teacher-mat',
      teacherName: 'Prof. Vikramaditya Roy',
      teacherEmail: 'vikram.roy@edusync.edu.in',
      color: 'indigo',
      accentBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      enrolledCount: 6,
      semester: 'Academic Year 2026-27 (Grade 12)',
      room: 'Ramanujan Block M - Room 202',
      credits: 4,
      department: 'Senior Secondary Science - Grade 12',
      syllabusTopics: [
        'Relations, Functions & Inverse Trigonometric Functions',
        'Matrices, Inverses & System of Linear Equations (Determinants)',
        'Continuity, Differentiability & Mean Value Theorems',
        'Applications of Derivatives: Maxima/Minima & Tangents',
        'Definite & Indefinite Integrals & Area Under Curves',
        'Vector Algebra, 3D Geometry & Linear Programming'
      ]
    },

    // ==========================================
    // VISIONNOTE LIVE CAPTURE SUBJECT
    // ==========================================
    {
      id: 'subj-pyconfig',
      code: 'PYTEST',
      name: 'PyTest Config Class',
      description: 'Automated PyTest configuration, test fixtures, suites, and runners captured live from VisionNote.',
      teacherId: 'teacher-phy',
      teacherName: 'Dr. Rajesh Kulkarni',
      teacherEmail: 'rajesh.kulkarni@edusync.edu.in',
      color: 'purple',
      accentBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      enrolledCount: 6,
      semester: 'Academic Year 2026-27',
      room: 'Computing Lab 1 - Room 204',
      credits: 4,
      department: 'Software Engineering & Testing',
      syllabusTopics: [
        'PyTest Configuration & Ini Files',
        'Test Fixtures & Setup/Teardown',
        'Parametrized Tests & Markers',
        'Test Runners & CLI Flags',
        'Mocking & Assertion Introspection'
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
      title: 'OpenStax: Environmental Science (Full Free Online Textbook)',
      category: 'Textbook',
      url: 'https://openstax.org/details/books/environmental-science',
      author: 'OpenStax & Rice University',
      description: 'Complete peer-reviewed university textbook — read free online with full chapters on ecosystems, pollution, climate, biodiversity, and sustainability.',
      keyTopics: ['Ecosystems', 'Climate Change', 'Biodiversity', 'Sustainability'],
      dateAdded: '2026-08-05'
    },
    {
      id: 'res-ess-2',
      subjectId: 'subj-ess',
      title: 'IPCC AR5 Climate Change Synthesis Report — Summary for Policymakers (PDF, 3.3 MB)',
      category: 'Research Paper',
      url: 'https://www.ipcc.ch/site/assets/uploads/2018/02/AR5_SYR_FINAL_SPM.pdf',
      author: 'Intergovernmental Panel on Climate Change (IPCC)',
      description: 'Official United Nations climate science report PDF — covers greenhouse gas emissions, global warming projections, and mitigation pathways.',
      keyTopics: ['Carbon Footprint', 'Global Warming', 'Climate Policy', 'Renewable Energy'],
      dateAdded: '2026-08-10'
    },

    // --- CALC Resources ---
    {
      id: 'res-calc-1',
      subjectId: 'subj-calc',
      title: 'MIT OpenCourseWare 18.02SC — Multivariable Calculus (Full Course)',
      category: 'Textbook',
      url: 'https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/',
      author: 'Prof. Denis Auroux (MIT Mathematics)',
      description: 'Complete MIT course with lecture videos, notes PDFs, problem sets, and exams — covers partial derivatives, multiple integrals, and vector calculus.',
      keyTopics: ['Lagrange Multipliers', 'Multiple Integrals', 'Vector Fields', 'Stokes Theorem'],
      dateAdded: '2026-08-04'
    },
    {
      id: 'res-calc-2',
      subjectId: 'subj-calc',
      title: 'OpenStax: Calculus Volume 3 — Multivariable (Full Free Online Textbook)',
      category: 'Lecture Notes',
      url: 'https://openstax.org/details/books/calculus-volume-3',
      author: 'Prof. Gilbert Strang & Edwin Herman (OpenStax)',
      description: 'Complete 700+ page university textbook — read free online with interactive exercises, Lagrange multipliers, surface integrals, and Green/Stokes theorems.',
      keyTopics: ['Lagrange Multipliers', 'Gradient Vectors', 'Triple Integrals', 'Coordinate Transforms'],
      dateAdded: '2026-08-12'
    },

    // --- EME Resources ---
    {
      id: 'res-eme-1',
      subjectId: 'subj-eme',
      title: 'MIT Unified Engineering — Thermodynamics & Power Cycles (Course Notes PDF, 63 MB)',
      category: 'Textbook',
      url: 'https://web.mit.edu/16.unified/www/FALL/thermodynamics/notes/notes.pdf',
      author: 'Prof. Z. S. Spakovszky (MIT Aero/Astro)',
      description: 'Comprehensive 300+ page MIT course notes PDF — covers 1st/2nd laws, Otto/Diesel/Carnot cycles, entropy, P-v and T-s diagrams with derivations.',
      keyTopics: ['Thermodynamics', 'Otto & Diesel Cycles', 'Entropy', 'Carnot Efficiency'],
      dateAdded: '2026-08-06'
    },
    {
      id: 'res-eme-2',
      subjectId: 'subj-eme',
      title: 'Engineering LibreTexts — Mechanics of Materials & Stress Analysis (Full Bookshelf)',
      category: 'Lecture Notes',
      url: 'https://eng.libretexts.org/Bookshelves/Mechanical_Engineering',
      author: 'LibreTexts Engineering Consortium',
      description: 'Full open-access digital bookshelf — covers stress-strain tensors, Mohr\'s circle, beam bending, material failure criteria, and mechanism kinematics.',
      keyTopics: ['Stress-Strain', 'Mohr\'s Circle', 'Beam Bending', 'Material Failure'],
      dateAdded: '2026-08-11'
    },

    // --- ENG-ETH Resources ---
    {
      id: 'res-engeth-1',
      subjectId: 'subj-engeth',
      title: 'NASA Official: Report of the Presidential Commission on the Challenger Accident',
      category: 'Textbook',
      url: 'https://history.nasa.gov/rogersrep/v1ch1.htm',
      author: 'Presidential Rogers Commission / NASA History Office',
      description: 'Full official NASA-hosted investigation report — covers O-ring failure analysis, Morton Thiokol decision chain, and engineering ethics lessons.',
      keyTopics: ['Whistleblowing', 'Challenger Disaster', 'O-ring Failure', 'Public Safety'],
      dateAdded: '2026-08-08'
    },
    {
      id: 'res-engeth-2',
      subjectId: 'subj-engeth',
      title: 'NSPE Code of Ethics for Engineers — Official Canons & Rules of Practice',
      category: 'Lecture Notes',
      url: 'https://www.nspe.org/resources/ethics/code-ethics',
      author: 'National Society of Professional Engineers (NSPE)',
      description: 'Official NSPE standards page — Fundamental Canons, Rules of Practice, and Professional Obligations regarding public safety and ethical governance.',
      keyTopics: ['Public Safety', 'NSPE Canons', 'Conflict of Interest', 'Ethical Governance'],
      dateAdded: '2026-08-15'
    },

    // --- CPC Resources ---
    {
      id: 'res-cpc-1',
      subjectId: 'subj-cpc',
      title: 'Beej\'s Guide to C Programming (Complete Textbook PDF, 1.5 MB)',
      category: 'Textbook',
      url: 'https://beej.us/guide/bgc/pdf/bgc_usl_c_1.pdf',
      author: 'Brian "Beej" Hall',
      description: 'Beloved 300+ page C programming textbook PDF — covers variables, pointers, memory allocation, structs, file I/O, and the standard library with examples.',
      keyTopics: ['Pointers', 'Dynamic Memory', 'Structs', 'Standard Library'],
      dateAdded: '2026-08-02'
    },
    {
      id: 'res-cpc-2',
      subjectId: 'subj-cpc',
      title: 'Bell Labs: The C Reference Manual by Dennis M. Ritchie (Original PDF)',
      category: 'Lecture Notes',
      url: 'https://www.bell-labs.com/usr/dmr/www/cman.pdf',
      author: 'Dennis M. Ritchie (Bell Laboratories)',
      description: 'The original C language reference manual by its creator — covers syntax, types, declarations, pointer semantics, and expressions.',
      keyTopics: ['Memory Layout', 'Pointer Arithmetic', 'Type System', 'Language Semantics'],
      dateAdded: '2026-08-14'
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

  notes: loadNotesFromDisk([
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
    },

    // ==========================================
    // CORE SUBJECT NOTES (PHY, CHEM, MATHS, MISC)
    // ==========================================
    {
      id: 'note-phy-01',
      studentId: 'student-1',
      subjectId: 'subj-phy',
      title: "Newton's Laws of Motion & Friction Mechanics on Inclined Planes",
      content: `# Newton's Laws of Motion & Friction Mechanics on Inclined Planes\n\n## 1. Governing First Principles & Force Vector Balance\nWhen a body of mass $m$ rests on an incline of angle $\\theta$ with coefficient of friction $\\mu$:\n$$\\sum \\vec{F} = m\\vec{a}$$\n\nResolving forces along and perpendicular to the incline:\n- **Perpendicular to incline (Normal Reaction)**:\n  $$N = mg \\cos\\theta$$\n- **Along the incline (Driving Component)**:\n  $$F_{\\text{down}} = mg \\sin\\theta$$\n\n## 2. Static vs Kinetic Friction Conditions\n- Static friction condition ($f_s$ adjusts dynamically):\n  $$f_s \\le \\mu_s N = \\mu_s mg \\cos\\theta$$\n- **Angle of Repose ($\\phi$)**: The critical incline angle at which impending slipping occurs:\n  $$\\tan\\phi = \\mu_s$$\n- If $\\theta > \\phi$, the body accelerates down the incline with kinetic friction $f_k = \\mu_k mg \\cos\\theta$:\n  $$a = g(\\sin\\theta - \\mu_k \\cos\\theta)$$\n\n## 3. Work-Energy Verification on the Incline\nTotal work done by all forces as the mass slides a distance $d$:\n$$W_{\\text{net}} = W_{\\text{gravity}} + W_{\\text{friction}} = (mg\\sin\\theta) d - (\\mu_k mg\\cos\\theta) d = \\Delta K = \\frac{1}{2}m v_f^2$$\n$$\\implies v_f = \\sqrt{2gd(\\sin\\theta - \\mu_k \\cos\\theta)}$$`,
      generalisedNotes: "Analysis of force components on an inclined plane with static and kinetic friction thresholds.",
      tags: ['Physics', 'Mechanics', 'NewtonsLaws', 'Friction', 'Incline'],
      lastModified: '2026-09-04T12:00:00.000Z',
      isPinned: true,
      source: 'visionnote',
      doubtsDetected: [
        'Why is normal force mg cos(theta) and not mg / cos(theta)?',
        'Does static friction perform work when a cylinder rolls without slipping?'
      ],
      summary: "Core derivations of normal force, static vs kinetic friction, angle of repose, and acceleration on inclined planes.",
      keyTakeaways: [
        'Normal force scales with cos(theta), reducing frictional capacity at steeper inclines.',
        'Angle of repose depends strictly on the static friction coefficient: tan(phi) = mu_s.',
        'Work done by kinetic friction is non-conservative and dissipates into thermal energy.'
      ]
    },
    {
      id: 'note-phy-02',
      studentId: 'student-5',
      subjectId: 'subj-phy',
      title: 'Electromagnetic Induction & Faraday-Lenz Law',
      content: `# Electromagnetic Induction & Faraday-Lenz Law\n\n## 1. Magnetic Flux Formulation\nThe magnetic flux $\\Phi_B$ through a flat planar surface of area $A$ in a uniform magnetic field $\\vec{B}$:\n$$\\Phi_B = \\iint_S \\vec{B} \\cdot d\\vec{A} = B A \\cos\\theta$$\n\n## 2. Faraday's Law of Induction & Lenz's Law\nThe induced electromotive force (EMF) $\\mathcal{E}$ in a closed circuit of $N$ tightly wound turns:\n$$\\mathcal{E} = -N \\frac{d\\Phi_B}{dt}$$\n\n- The negative sign represents **Lenz's Law** (Conservation of Energy):\n  *The induced current always creates an opposing magnetic field that counters the change in external flux that induced it.*\n\n## 3. Motional EMF in a Conducting Rod\nFor a conducting rod of length $L$ moving at velocity $v$ perpendicular to uniform field $B$ along rails of resistance $R$:\n$$\\mathcal{E} = B v L$$\n\n- Induced current: $I = \\frac{\\mathcal{E}}{R} = \\frac{B v L}{R}$\n- Retarding Lorentz Magnetic Force: $F_{\\text{mag}} = I L B = \\frac{B^2 L^2 v}{R}$\n- Mechanical Power Balance: $P_{\\text{mech}} = F_{\\text{ext}} v = \\frac{B^2 L^2 v^2}{R} = I^2 R = P_{\\text{diss}}$`,
      tags: ['Physics', 'Electromagnetism', 'FaradayLaw', 'Induction', 'MotionalEMF'],
      lastModified: '2026-09-04T12:05:00.000Z',
      isPinned: true,
      source: 'visionnote',
      summary: 'Mathematical derivation of Faraday Law, magnetic flux differentiation, Lenz law energy conservation, and motional EMF power balance.',
      keyTakeaways: [
        'Induced EMF is driven strictly by time variation of flux.',
        'Mechanical input power exactly matches Joule heat dissipation in motional EMF.',
        'Lenz law is a fundamental manifestation of the law of conservation of energy.'
      ]
    },
    {
      id: 'note-phy-03',
      studentId: 'student-2',
      subjectId: 'subj-phy',
      title: 'Thermodynamics & Carnot Heat Engine Cycle',
      content: `# Thermodynamics & Carnot Heat Engine Cycle\n\n## 1. First & Second Laws of Thermodynamics\n- **First Law (Energy Balance)**: $\\Delta U = Q - W \\iff dQ = dU + P\\,dV$\n- **Second Law (Kelvin-Planck)**: No cyclic engine can absorb heat from a single reservoir and convert 100% of it into mechanical work without waste heat rejection.\n\n## 2. Four Reversible Stages of the Carnot Cycle\n1. **Isothermal Expansion ($A \\to B$) at $T_H$**: $Q_H = n R T_H \\ln(V_B / V_A)$\n2. **Adiabatic Expansion ($B \\to C$) from $T_H \\to T_C$**: $Q = 0, T_H V_B^{\\gamma - 1} = T_C V_C^{\\gamma - 1}$\n3. **Isothermal Compression ($C \\to D$) at $T_C$**: $Q_C = n R T_C \\ln(V_C / V_D)$\n4. **Adiabatic Compression ($D \\to A$) from $T_C \\to T_H$**: Returns gas to original state at $T_H$\n\n## 3. Maximum Theoretical Efficiency\n$$\\eta = \\frac{W_{\\text{net}}}{Q_H} = 1 - \\frac{T_C}{T_H}$$`,
      tags: ['Physics', 'Thermodynamics', 'CarnotCycle', 'HeatEngine', 'Entropy'],
      lastModified: '2026-09-04T12:10:00.000Z',
      isPinned: false,
      source: 'visionnote',
      summary: 'Stepwise thermodynamic derivations of the 4 reversible stages of a Carnot cycle and theoretical efficiency limits.',
      keyTakeaways: [
        'Carnot efficiency represents the absolute upper limit for any heat engine operating between two thermal baths.',
        'Efficiency can only reach 100% if the cold reservoir is at absolute zero (0 K).'
      ]
    },
    {
      id: 'note-che-01',
      studentId: 'student-4',
      subjectId: 'subj-che',
      title: 'Electrochemistry & Nernst Equation Calculations',
      content: `# Electrochemistry & Nernst Equation Calculations\n\n## 1. Standard Cell Potential & Gibbs Free Energy\n$$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}$$\n$$\\Delta G^\\circ = -n F E^\\circ_{\\text{cell}}$$\n\n## 2. Nernst Equation for Non-Standard Concentrations\n$$E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{RT}{nF} \\ln Q = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n} \\log_{10} Q$$\n\n## 3. Electrochemical Equilibrium\nAt equilibrium, $E_{\\text{cell}} = 0$:\n$$\\log_{10} K_{eq} = \\frac{n E^\\circ_{\\text{cell}}}{0.0591}$$`,
      tags: ['Chemistry', 'Electrochemistry', 'NernstEquation', 'Redox', 'PhysicalChemistry'],
      lastModified: '2026-09-04T12:15:00.000Z',
      isPinned: true,
      source: 'visionnote',
      summary: 'Derivation of cell electromotive force, Nernst concentration dependencies, and Gibbs free energy relationships.',
      keyTakeaways: [
        'Cell potential decreases as reaction proceeds forward because Q increases.',
        'Concentration cells generate voltage solely from ion concentration gradients.'
      ]
    },
    {
      id: 'note-che-02',
      studentId: 'student-6',
      subjectId: 'subj-che',
      title: 'VSEPR Theory & Molecular Geometry Hybridization',
      content: `# Chemical Bonding: VSEPR Theory & Hybridization Schemes\n\n## 1. VSEPR Repulsion Hierarchy\n$$\\text{Lone Pair - Lone Pair} > \\text{Lone Pair - Bond Pair} > \\text{Bond Pair - Bond Pair}$$\n\n## 2. Steric Number Formula & Hybridization Matrix\n$$\\text{Steric Number (SN)} = (\\sigma\\text{-bonds}) + (\\text{Lone Pairs on Central Atom})$$\n\n- SN = 2 ($sp$ Linear, $180^\\circ$)\n- SN = 3 ($sp^2$ Trigonal Planar, $120^\\circ$)\n- SN = 4 ($sp^3$ Tetrahedral, $109.5^\\circ$)\n- SN = 5 ($sp^3d$ Trigonal Bipyramidal, $90^\\circ, 120^\\circ$)\n- SN = 6 ($sp^3d^2$ Octahedral, $90^\\circ$)`,
      tags: ['Chemistry', 'ChemicalBonding', 'VSEPR', 'Hybridization', 'InorganicChemistry'],
      lastModified: '2026-09-04T12:20:00.000Z',
      isPinned: true,
      source: 'visionnote',
      summary: 'Systematic guide to steric number calculations, orbital hybridization, and VSEPR repulsion geometries.',
      keyTakeaways: [
        'Lone pairs exert stronger repulsions than bonding pairs, compressing adjacent bond angles.',
        'In trigonal bipyramidal molecules, axial bonds are longer and more reactive than equatorial bonds.'
      ]
    },
    {
      id: 'note-che-03',
      studentId: 'student-3',
      subjectId: 'subj-che',
      title: 'Chemical Kinetics & Reaction Rate Laws',
      content: `# Chemical Kinetics & Reaction Rate Laws\n\n## 1. Rate of Reaction & Rate Law Expression\n$$\\text{Rate} = -\\frac{1}{a}\\frac{d[A]}{dt} = k [A]^x [B]^y$$\n\n## 2. Integrated Rate Laws & Half-Life Equations\n- Zero Order: $[A]_t = [A]_0 - kt, \\quad t_{1/2} = [A]_0 / (2k)$\n- First Order: $\\ln[A]_t = \\ln[A]_0 - kt, \\quad t_{1/2} = 0.693 / k$\n- Second Order: $1/[A]_t = 1/[A]_0 + kt, \\quad t_{1/2} = 1 / (k[A]_0)$\n\n## 3. Temperature Dependence: Arrhenius Equation\n$$\\ln\\left(\\frac{k_2}{k_1}\\right) = \\frac{E_a}{R} \\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)$$`,
      tags: ['Chemistry', 'PhysicalChemistry', 'ChemicalKinetics', 'RateLaws', 'Arrhenius'],
      lastModified: '2026-09-04T12:25:00.000Z',
      isPinned: false,
      source: 'visionnote',
      summary: 'Integrated rate equations, half-life relationships across zero, first, and second order reactions, and Arrhenius activation energy.',
      keyTakeaways: [
        'First-order half-life is independent of initial concentration.',
        'Arrhenius plot of ln(k) vs 1/T yields a straight line with slope equal to -E_a / R.'
      ]
    },
    {
      id: 'note-mat-01',
      studentId: 'student-2',
      subjectId: 'subj-mat',
      title: 'Techniques of Integration: Integration by Parts & Partial Fractions',
      content: `# Techniques of Integration: Integration by Parts & Partial Fractions\n\n## 1. Integration by Parts Formula\n$$\\int u \\, dv = u v - \\int v \\, du$$\nLIATE Priority: **L**ogarithmic > **I**nverse Trig > **A**lgebraic > **T**rigonometric > **E**xponential.\n\n## 2. The King's Property of Definite Integrals\n$$\\int_{a}^{b} f(x) \\, dx = \\int_{a}^{b} f(a + b - x) \\, dx$$\n\n## 3. Partial Fractions Decomposition\n$$\\frac{1}{(x - a)(x - b)} = \\frac{A}{x - a} + \\frac{B}{x - b}$$`,
      tags: ['Mathematics', 'Calculus', 'Integration', 'DefiniteIntegrals', 'LIATE'],
      lastModified: '2026-09-04T12:30:00.000Z',
      isPinned: true,
      source: 'visionnote',
      summary: 'Integration by parts with the LIATE priority scheme, King property of definite integrals, and partial fraction templates.',
      keyTakeaways: [
        'The LIATE rule provides a deterministic algorithm for choosing u(x).',
        'The King property reflects the integrand across its interval midpoint without altering total enclosed area.'
      ]
    },
    {
      id: 'note-mat-02',
      studentId: 'student-5',
      subjectId: 'subj-mat',
      title: 'Vector Cross Product & 3D Geometry of Planes',
      content: `# Vector Cross Product & 3D Geometry of Planes\n\n## 1. Vector Cross Product Determinant Formulation\n$$\\vec{a} \\times \\vec{b} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ a_1 & a_2 & a_3 \\\\ b_1 & b_2 & b_3 \\end{vmatrix}$$\nArea of parallelogram formed by $\\vec{a}$ and $\\vec{b}$: $|\\vec{a} \\times \\vec{b}|$.\n\n## 2. 3D Plane Equation\n$$A(x - x_1) + B(y - y_1) + C(z - z_1) = 0 \\iff Ax + By + Cz + D = 0$$\nDistance from point $(x_0, y_0, z_0)$ to plane:\n$$d = \\frac{|A x_0 + B y_0 + C z_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}$$`,
      tags: ['Mathematics', 'Vectors', '3DGeometry', 'Planes', 'LinearAlgebra'],
      lastModified: '2026-09-04T12:35:00.000Z',
      isPinned: true,
      source: 'visionnote',
      summary: 'Vector cross product determinant formulas, normal vectors, 3D Cartesian plane equations, and perpendicular distance formulas.',
      keyTakeaways: [
        'The cross product vector is strictly orthogonal to both constituent vectors.',
        'The coefficients of x, y, z in a plane equation directly specify its normal vector coordinates.'
      ]
    },
    {
      id: 'note-mat-03',
      studentId: 'student-1',
      subjectId: 'subj-mat',
      title: 'Fundamental Limits, Continuity & Squeeze Theorem',
      content: `# Fundamental Limits, Continuity & Squeeze Theorem\n\n## 1. Standard Trigonometric Limits\n$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1, \\quad \\lim_{x \\to 0} \\frac{\\tan x}{x} = 1, \\quad \\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2} = \\frac{1}{2}$$\n\n## 2. Sandwich (Squeeze) Theorem\nIf $g(x) \\le f(x) \\le h(x)$ and $\\lim_{x \\to c} g(x) = \\lim_{x \\to c} h(x) = L$, then $\\lim_{x \\to c} f(x) = L$.\n\n## 3. L'Hôpital's Rule for Indeterminate Forms [0/0] and [∞/∞]\n$$\\lim_{x \\to c} \\frac{f(x)}{g(x)} = \\lim_{x \\to c} \\frac{f'(x)}{g'(x)}$$`,
      tags: ['Mathematics', 'Calculus', 'Limits', 'SqueezeTheorem', 'LHopital'],
      lastModified: '2026-09-04T12:40:00.000Z',
      isPinned: false,
      source: 'visionnote',
      summary: 'Geometric inequality proof of sin(x)/x, Sandwich theorem rigor, and L Hopital rule application rules.',
      keyTakeaways: [
        'Trigonometric limit proofs strictly require angles measured in radians.',
        'Squeeze Theorem traps intermediate limits between known converging functions.'
      ]
    },
    {
      id: 'note-misc-01',
      studentId: 'student-3',
      subjectId: 'subj-misc',
      title: 'Scientific Research Methodology & Experimental Error Analysis',
      content: `# Scientific Research Methodology & Experimental Error Analysis\n\n## 1. Systematic vs Random Experimental Errors\n- **Systematic Errors**: Inaccuracies in calibration or zero-offset; eliminated via calibration.\n- **Random Errors**: Statistical fluctuations; quantified with standard deviation $\\sigma$ and standard error $\\sigma / \\sqrt{N}$.\n\n## 2. Error Propagation Calculus\n$$\\Delta Z = \\sqrt{\\left(\\frac{\\partial f}{\\partial X} \\Delta X\\right)^2 + \\left(\\frac{\\partial f}{\\partial Y} \\Delta Y\\right)^2}$$\n\n- Sum / Difference: $\\Delta Z = \\sqrt{(\\Delta X)^2 + (\\Delta Y)^2}$\n- Product / Quotient: $\\frac{\\Delta Z}{Z} = \\sqrt{(\\frac{\\Delta X}{X})^2 + (\\frac{\\Delta Y}{Y})^2}$`,
      tags: ['GeneralNotes', 'ResearchMethodology', 'ErrorAnalysis', 'Statistics', 'LabPractice'],
      lastModified: '2026-09-04T12:42:00.000Z',
      isPinned: true,
      source: 'visionnote',
      summary: 'Systematic vs random errors, partial derivative error propagation, and research documentation standards.',
      keyTakeaways: [
        'Random errors diminish with sample size N by 1/sqrt(N).',
        'Report experimental values with uncertainty precision matched to the last significant digit.'
      ]
    },
    {
      id: 'note-misc-02',
      studentId: 'student-6',
      subjectId: 'subj-misc',
      title: 'Scientific Computing with Python, NumPy & Visualizations',
      content: `# Scientific Computing with Python, NumPy & Visualizations\n\n## 1. Vectorized Numerical Computing with NumPy\n\`\`\`python\nimport numpy as np\nx = np.linspace(0, 10, 1000)\npsi = np.exp(-0.25 * (x - 5)**2) * np.cos(3 * np.pi * x)\n\`\`\`\n\n## 2. Solving ODEs with SciPy\n\`\`\`python\nfrom scipy.integrate import solve_ivp\ndef oscillator(t, state, gamma=0.15, omega0=1.2):\n    x, v = state\n    return [v, -2 * gamma * v - (omega0**2) * x]\nsol = solve_ivp(oscillator, [0, 40], [1.5, 0.0], t_eval=np.linspace(0, 40, 2000))\n\`\`\`\n\n## 3. Publication Plotting with Matplotlib\n\`\`\`python\nimport matplotlib.pyplot as plt\nplt.plot(sol.t, sol.y[0], label='x(t)', color='#6366f1')\nplt.xlabel('Time (s)'); plt.ylabel('Position (m)'); plt.grid(True)\n\`\`\``,
      tags: ['GeneralNotes', 'Python', 'ScientificComputing', 'NumPy', 'Simulation'],
      lastModified: '2026-09-04T12:45:00.000Z',
      isPinned: false,
      source: 'visionnote',
      summary: 'Practical scientific computing patterns in Python covering vectorized array math, ODE integration, and visualization.',
      keyTakeaways: [
        'NumPy vectorization achieves massive speedups over Python for-loops.',
        'solve_ivp reduces second-order ODEs to first-order state vectors.'
      ]
    },

    // ==========================================
    // GRADE 11 & 12 VISIONNOTE (VN) SEEDED NOTES
    // ==========================================
    {
      id: 'note-vn-phy11-1',
      studentId: 'student-g11-1',
      subjectId: 'subj-phy-11',
      title: 'Rotational Dynamics: Moment of Inertia & Parallel Axis Theorem',
      content: `# Rotational Dynamics & Moment of Inertia of Rigid Bodies
*(Captured via VisionNote Camera Studio • Blackboard OCR Stream)*

## 1. Definition of Moment of Inertia ($I$):
For a continuous rigid body rotating about an axis:
$$I = \\int r^2 dm$$

Where $r$ is the perpendicular distance of mass element $dm$ from the chosen axis.

## 2. Parallel Axis Theorem (Steiner's Theorem):
If $I_{cm}$ is the moment of inertia about an axis through the center of mass, the moment of inertia $I$ about any parallel axis separated by distance $d$ is:
$$I = I_{cm} + M d^2$$

## 3. Rolling Motion without Slipping:
Total Kinetic Energy of a rolling object (Sphere/Cylinder):
$$K_{total} = K_{trans} + K_{rot} = \\frac{1}{2} M v_{cm}^2 + \\frac{1}{2} I_{cm} \\omega^2$$
Since $v_{cm} = R\\omega$:
$$K_{total} = \\frac{1}{2} M v_{cm}^2 \\left(1 + \\frac{k^2}{R^2}\\right)$$
Where $k$ is the radius of gyration.`,
      tags: ['Physics 11', 'Rotational Dynamics', 'Moment of Inertia', 'VisionNote'],
      lastModified: '2026-08-28T10:15:00',
      isPinned: true,
      source: 'visionnote',
      cameraSnapshotUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=60',
      doubtsDetected: [
        'Why can the Perpendicular Axis Theorem only be applied to planar lamina (2D objects)?',
        'How does friction provide torque without dissipating energy during pure rolling?'
      ],
      summary: 'Derived formulas for moment of inertia, Steiner parallel axis theorem, and total kinetic energy partition in pure rolling without slipping.',
      keyTakeaways: [
        'Moment of inertia depends fundamentally on both total mass and its spatial distribution relative to the axis of rotation.',
        'In pure rolling down an incline, objects with smaller (k/R)^2 reach the bottom first (Solid Sphere > Disc > Hollow Sphere > Ring).'
      ],
      flashcards: [
        {
          id: 'fc-phy11-1',
          question: 'What is the condition for using the Perpendicular Axis Theorem in rotational dynamics?',
          answer: 'It is strictly valid only for 2D planar laminas (Ix + Iy = Iz where z-axis is perpendicular to the lamina plane).',
          hint: 'Think about dimensions (2D vs 3D).',
          topic: 'Rotational Motion'
        },
        {
          id: 'fc-phy11-2',
          question: 'State Steiner\'s Parallel Axis Theorem.',
          answer: 'I = I_cm + M*d^2 (where d is perpendicular distance between the parallel axes and one axis must pass through the Center of Mass).',
          hint: 'One axis must pass through Center of Mass.',
          topic: 'Moment of Inertia'
        }
      ]
    },
    {
      id: 'note-vn-che11-1',
      studentId: 'student-g11-2',
      subjectId: 'subj-che-11',
      title: 'VSEPR Theory & Hybridization Schemes ($sp, sp^2, sp^3, dsp^2$)',
      content: `# Chemical Bonding & Hybridization Geometry
*(Captured via VisionNote Camera Studio • Scanned Notebook)*

## 1. Valence Shell Electron Pair Repulsion (VSEPR) Hierarchy:
$$\\text{Lone Pair - Lone Pair} > \\text{Lone Pair - Bond Pair} > \\text{Bond Pair - Bond Pair}$$

## 2. Steric Number Formula:
$$\\text{Steric Number} = (\\text{Number of } \\sigma \\text{ bonds}) + (\\text{Number of Lone Pairs})$$

| Steric No. | Hybridization | Ideal Geometry | Example | Bond Angle |
| :--- | :--- | :--- | :--- | :--- |
| **2** | $sp$ | Linear | $\\text{BeCl}_2, \\text{CO}_2$ | $180^\\circ$ |
| **3** | $sp^2$ | Trigonal Planar | $\\text{BF}_3, \\text{SO}_3$ | $120^\\circ$ |
| **4** | $sp^3$ | Tetrahedral | $\\text{CH}_4, \\text{NH}_3, \\text{H}_2\\text{O}$ | $109.5^\\circ$ ($107^\\circ, 104.5^\\circ$) |
| **5** | $sp^3d$ | Trigonal Bipyramidal | $\\text{PCl}_5, \\text{SF}_4$ | $90^\\circ, 120^\\circ$ |
| **6** | $sp^3d^2$ | Octahedral | $\\text{SF}_6, \\text{XeF}_4$ | $90^\\circ$ |`,
      tags: ['Chemistry 11', 'VSEPR', 'Hybridization', 'Chemical Bonding', 'VisionNote'],
      lastModified: '2026-08-28T11:45:00',
      isPinned: true,
      source: 'visionnote',
      cameraSnapshotUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=60',
      doubtsDetected: [
        'Why are axial P-Cl bonds in PCl5 longer and weaker than equatorial bonds?',
        'How does electronegativity of surrounding atoms affect bond angles in NH3 vs NF3?'
      ],
      summary: 'Comprehensive table of steric numbers, hybridization types, VSEPR lone-pair distortions, and molecular geometries.',
      keyTakeaways: [
        'Lone pairs occupy equatorial positions in trigonal bipyramidal geometry to minimize 90° repulsions.',
        'Hybrid orbitals form only sigma bonds and hold lone pairs; pi bonds are formed by unhybridized pure p/d orbitals.'
      ],
      flashcards: [
        {
          id: 'fc-che11-1',
          question: 'Why are axial bonds longer than equatorial bonds in PCl5?',
          answer: 'Axial bond pairs experience three 90° repulsions from equatorial bond pairs, whereas equatorial bond pairs experience only two 90° repulsions.',
          hint: 'Count the 90° vs 120° repulsion angles.',
          topic: 'VSEPR Theory'
        }
      ]
    },
    {
      id: 'note-vn-mat11-1',
      studentId: 'student-g11-3',
      subjectId: 'subj-mat-11',
      title: 'Trigonometric Limits & Squeeze Theorem Proofs',
      content: `# Fundamental Limits & Sandwich Theorem
*(Captured via VisionNote Camera Studio • Lecture Blackboard)*

## 1. Standard Trigonometric Limits:
$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1 \\quad (x \\text{ in radians})$$
$$\\lim_{x \\to 0} \\frac{\\tan x}{x} = 1$$
$$\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2} = \\frac{1}{2}$$

## 2. Geometric Proof of $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$:
Consider unit circle with angle $0 < x < \\frac{\\pi}{2}$:
$$\\text{Area}(\\triangle OAB) < \\text{Area}(\\text{Sector } OAB) < \\text{Area}(\\triangle OAT)$$
$$\\frac{1}{2} \\sin x < \\frac{1}{2} x < \\frac{1}{2} \\tan x$$
Dividing by $\\frac{1}{2} \\sin x$:
$$1 < \\frac{x}{\\sin x} < \\frac{1}{\\cos x} \\implies \\cos x < \\frac{\\sin x}{x} < 1$$
Taking limit as $x \\to 0$, since $\\lim_{x \\to 0} \\cos x = 1$, by **Sandwich (Squeeze) Theorem**:
$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$`,
      tags: ['Maths 11', 'Calculus', 'Limits', 'Squeeze Theorem', 'VisionNote'],
      lastModified: '2026-08-29T09:30:00',
      isPinned: true,
      source: 'visionnote',
      doubtsDetected: [
        'Why must x be in radians when applying standard trigonometric limits?',
        'How do you evaluate 0/0 limits when direct substitution produces indeterminate forms?'
      ],
      summary: 'Geometric derivation of sin(x)/x limit using unit circle area inequalities and the Sandwich Theorem.',
      keyTakeaways: [
        'Trigonometric limit proofs strictly require radian measure because arc length equals angle times radius.',
        'Squeeze Theorem rigorously traps limit between two bounding functions that converge to the same value.'
      ]
    },
    {
      id: 'note-vn-phy12-1',
      studentId: 'student-g12-1',
      subjectId: 'subj-phy-12',
      title: 'Gauss Law Applications: Electric Field of Infinite Sheet & Cylinders',
      content: `# Gauss's Law & Electrostatic Field Derivations
*(Captured via VisionNote Camera Studio • Scanned Lab Notes)*

## 1. Gauss's Law Statement:
$$\\Phi_E = \\oint_{S} \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{\\text{enclosed}}}{\\varepsilon_0}$$

## 2. Electric Field of Uniform Infinite Sheet of Charge:
Using cylindrical Gaussian pillbox of cross-section $A$:
$$\\oint \\mathbf{E} \\cdot d\\mathbf{A} = E(A) + E(A) = 2EA$$
$$Q_{\\text{enclosed}} = \\sigma A$$
$$2EA = \\frac{\\sigma A}{\\varepsilon_0} \\implies E = \\frac{\\sigma}{2\\varepsilon_0}$$
*(Notice field is independent of distance $r$ from the sheet)*.

## 3. Parallel Plate Capacitor with Dielectric:
$$C = \\frac{\\kappa \\varepsilon_0 A}{d}$$
Energy Density stored in electric field:
$$u_E = \\frac{1}{2} \\varepsilon_0 E^2$$`,
      tags: ['Physics 12', 'Electrostatics', 'Gauss Law', 'Capacitors', 'VisionNote'],
      lastModified: '2026-08-29T14:00:00',
      isPinned: true,
      source: 'visionnote',
      cameraSnapshotUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=60',
      doubtsDetected: [
        'Why does the electric field of an infinite sheet not decrease with distance?',
        'What is the difference between bound surface charge density and free surface charge density in a dielectric?'
      ],
      summary: 'Derived Gauss Law electric field formulas for planar sheets, cylindrical wire charges, and parallel plate capacitors with dielectric insertion.',
      keyTakeaways: [
        'Gauss Law is most powerful when high symmetry (spherical, cylindrical, planar) exists to pull E out of the flux integral.',
        'Dielectric insertion increases capacitance by factor kappa while reducing electric field in isolated capacitors.'
      ]
    },
    {
      id: 'note-vn-che12-1',
      studentId: 'student-g12-2',
      subjectId: 'subj-che-12',
      title: 'Aldol Condensation & Cannizzaro Reaction Mechanisms',
      content: `# Carbonyl Reactions: Aldol & Cannizzaro
*(Captured via VisionNote Camera Studio • Reaction Mechanism Board)*

## 1. Aldol Condensation ($\alpha$-Hydrogen required):
Reagents: Dilute $\\text{NaOH}$ or $\\text{Ba(OH)}_2$:
$$2 \\text{CH}_3\\text{CHO} \\xrightarrow{\\text{dil. NaOH}} \\text{CH}_3\\text{CH(OH)CH}_2\\text{CHO} \\xrightarrow{\\Delta, -\\text{H}_2\\text{O}} \\text{CH}_3\\text{CH}=\\text{CHCHO}$$
*(Formation of $\\alpha,\\beta$-unsaturated aldehyde / Crotonaldehyde)*.

## 2. Cannizzaro Reaction (NO $\alpha$-Hydrogen):
Reagents: Concentrated $50\\% \\text{KOH}$ (Disproportionation / Redox):
$$2 \\text{HCHO} \\xrightarrow{50\\% \\text{KOH}} \\text{CH}_3\\text{OH} + \\text{HCOO}^-\\text{K}^+$$
*(One molecule is reduced to alcohol, one is oxidized to carboxylate salt)*.`,
      tags: ['Chemistry 12', 'Organic Chemistry', 'Aldol', 'Cannizzaro', 'Mechanisms', 'VisionNote'],
      lastModified: '2026-08-30T16:20:00',
      isPinned: true,
      source: 'visionnote',
      doubtsDetected: [
        'Why does Cannizzaro reaction require high concentration of base (50% KOH) while Aldol requires dilute base?',
        'How do you predict major cross-aldol products when mixing benzaldehyde and acetone?'
      ],
      summary: 'Stepwise mechanism breakdown of Aldol condensation vs Cannizzaro disproportionation reaction based on alpha-hydrogen presence.',
      keyTakeaways: [
        'Alpha hydrogens are acidic due to resonance stabilization of the enolate anion by the carbonyl oxygen.',
        'Cross-aldol between an aromatic aldehyde (no alpha-H) and a ketone selectively yields a single major conjugated product.'
      ]
    },
    {
      id: 'note-vn-mat12-1',
      studentId: 'student-g12-3',
      subjectId: 'subj-mat-12',
      title: 'Definite Integrals: King Property & Area Under Curve',
      content: `# Definite Integrals & Properties of Integration
*(Captured via VisionNote Camera Studio • Blackboard)*

## 1. The "King's Property" of Definite Integrals:
$$\\int_{a}^{b} f(x) dx = \\int_{a}^{b} f(a + b - x) dx$$
Special Case for $[0, a]$:
$$\\int_{0}^{a} f(x) dx = \\int_{0}^{a} f(a - x) dx$$

## 2. Classic Problem Example:
Evaluate $I = \\int_{0}^{\\pi/2} \\frac{\\sqrt{\\sin x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}} dx$:
By King's Property:
$$I = \\int_{0}^{\\pi/2} \\frac{\\sqrt{\\cos x}}{\\sqrt{\\cos x} + \\sqrt{\\sin x}} dx$$
Adding both equations:
$$2I = \\int_{0}^{\\pi/2} 1 \\, dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$$`,
      tags: ['Maths 12', 'Calculus', 'Definite Integrals', 'King Property', 'VisionNote'],
      lastModified: '2026-08-30T17:10:00',
      isPinned: true,
      source: 'visionnote',
      doubtsDetected: [
        'When does the King property simplify integrals where standard substitution fails?',
        'How do you handle symmetry when integrating odd and even functions across [-a, a]?'
      ],
      summary: 'Integral properties including the King property and Leibniz integral rule with standard competitive exam problem solutions.',
      keyTakeaways: [
        'The King property reflects the integrand across the midpoint (a+b)/2 without changing the total area.',
        'Adding I and its reflected form often eliminates radical terms into a simple constant integrand.'
      ]
    }
  ]),

  analytics: {
    // Grade 11 Analytics
    'subj-phy-11': {
      subjectId: 'subj-phy-11',
      subjectName: 'Class 11 Physics (Mechanics & Thermodynamics)',
      totalStudents: 6,
      classAverage: 88.5,
      submissionRate: 95.0,
      atRiskStudentsCount: 1,
      gradeDistribution: [
        { range: '90-100% (A)', count: 3, percentage: 50.0 },
        { range: '80-89% (B)', count: 2, percentage: 33.3 },
        { range: '70-79% (C)', count: 1, percentage: 16.7 },
        { range: '<70%', count: 0, percentage: 0.0 }
      ],
      weakTopics: [
        {
          topic: 'Rotational Kinetic Energy in Pure Rolling on Inclines',
          errorRate: 34,
          averageScore: 70.5,
          affectedStudents: 2,
          recommendedRemediation: 'Provide scaffolded derivations linking torque, friction, and center of mass acceleration.',
          urgency: 'high'
        }
      ],
      trends: [
        { week: 'Week 1', avgScore: 89.0, submissionRate: 100.0, activeCount: 6 },
        { week: 'Week 2', avgScore: 88.0, submissionRate: 95.0, activeCount: 6 },
        { week: 'Week 3', avgScore: 88.5, submissionRate: 95.0, activeCount: 6 }
      ],
      aiExecutiveSummary: `Dr. Alok Verma's Class 11 Physics cohort shows strong conceptual grasp of Newtonian mechanics. Aarav Sharma leads with 9.4 GPA. Attention required on rolling motion friction vectors.`,
      keyActionItems: [
        'Demonstrate physical rolling cylinder experiments in Physics Lab 201.',
        'Assign practice set on Parallel Axis Theorem applications.'
      ],
      lastGenerated: '2026-08-30T10:00:00'
    },
    'subj-che-11': {
      subjectId: 'subj-che-11',
      subjectName: 'Class 11 Chemistry (Physical, Inorganic & Organic)',
      totalStudents: 6,
      classAverage: 87.2,
      submissionRate: 96.0,
      atRiskStudentsCount: 1,
      gradeDistribution: [
        { range: '90-100% (A)', count: 3, percentage: 50.0 },
        { range: '80-89% (B)', count: 2, percentage: 33.3 },
        { range: '70-79% (C)', count: 1, percentage: 16.7 },
        { range: '<70%', count: 0, percentage: 0.0 }
      ],
      weakTopics: [
        {
          topic: 'Molecular Orbital Theory Bond Order & Magnetic Nature (O2, B2, C2)',
          errorRate: 38,
          averageScore: 68.0,
          affectedStudents: 3,
          recommendedRemediation: 'Review energy level diagram differences for molecules with <= 14 electrons vs > 14 electrons.',
          urgency: 'high'
        }
      ],
      trends: [
        { week: 'Week 1', avgScore: 86.0, submissionRate: 100.0, activeCount: 6 },
        { week: 'Week 2', avgScore: 87.2, submissionRate: 96.0, activeCount: 6 }
      ],
      aiExecutiveSummary: `Dr. Neha Sharma reports strong test scores on VSEPR theory. Ananya Verma and Tanvi Patel achieved top marks.`,
      keyActionItems: [
        'Host MOT energy diagram workshop on Wednesday.'
      ],
      lastGenerated: '2026-08-30T11:00:00'
    },
    'subj-mat-11': {
      subjectId: 'subj-mat-11',
      subjectName: 'Class 11 Mathematics (Algebra, Trig & Calculus Basics)',
      totalStudents: 6,
      classAverage: 89.0,
      submissionRate: 98.0,
      atRiskStudentsCount: 0,
      gradeDistribution: [
        { range: '90-100% (A)', count: 4, percentage: 66.7 },
        { range: '80-89% (B)', count: 2, percentage: 33.3 },
        { range: '<80%', count: 0, percentage: 0.0 }
      ],
      weakTopics: [
        {
          topic: 'Permutations with Identical Objects & Circular Arrangements',
          errorRate: 25,
          averageScore: 78.0,
          affectedStudents: 2,
          recommendedRemediation: 'Provide visual combinatorial grouping exercises.',
          urgency: 'medium'
        }
      ],
      trends: [
        { week: 'Week 1', avgScore: 89.5, submissionRate: 100.0, activeCount: 6 },
        { week: 'Week 2', avgScore: 89.0, submissionRate: 98.0, activeCount: 6 }
      ],
      aiExecutiveSummary: `Dr. R. D. Raman's Grade 11 Mathematics class has 0 at-risk students. High fluency with trigonometric transformations.`,
      keyActionItems: [
        'Start introductory limit derivations and epsilon-delta intuition.'
      ],
      lastGenerated: '2026-08-30T12:00:00'
    },

    // Grade 12 Analytics
    'subj-phy-12': {
      subjectId: 'subj-phy-12',
      subjectName: 'Class 12 Physics (Electromagnetism, Optics & Modern Physics)',
      totalStudents: 6,
      classAverage: 91.0,
      submissionRate: 98.5,
      atRiskStudentsCount: 0,
      gradeDistribution: [
        { range: '90-100% (A)', count: 4, percentage: 66.7 },
        { range: '80-89% (B)', count: 2, percentage: 33.3 },
        { range: '<80%', count: 0, percentage: 0.0 }
      ],
      weakTopics: [
        {
          topic: 'Capacitor Dielectric Boundary Polarization & Energy Density',
          errorRate: 22,
          averageScore: 80.0,
          affectedStudents: 1,
          recommendedRemediation: 'Explain bound vs free charge with Gauss law in matter.',
          urgency: 'low'
        }
      ],
      trends: [
        { week: 'Week 1', avgScore: 90.0, submissionRate: 100.0, activeCount: 6 },
        { week: 'Week 2', avgScore: 91.0, submissionRate: 98.5, activeCount: 6 }
      ],
      aiExecutiveSummary: `Devansh Joshi (9.8 GPA) and Riya Kapoor demonstrate exemplary electromagnetic problem-solving rigor.`,
      keyActionItems: [
        'Prepare laboratory setup for Young Double Slit Experiment and diffraction gratings.'
      ],
      lastGenerated: '2026-08-30T13:00:00'
    },
    'subj-che-12': {
      subjectId: 'subj-che-12',
      subjectName: 'Class 12 Chemistry (Electrochemistry, Kinetics & Organics)',
      totalStudents: 6,
      classAverage: 88.0,
      submissionRate: 94.0,
      atRiskStudentsCount: 1,
      gradeDistribution: [
        { range: '90-100% (A)', count: 3, percentage: 50.0 },
        { range: '80-89% (B)', count: 2, percentage: 33.3 },
        { range: '70-79% (C)', count: 1, percentage: 16.7 }
      ],
      weakTopics: [
        {
          topic: 'Crystal Field Theory d-Orbital Splitting in Tetrahedral vs Octahedral Complexes',
          errorRate: 31,
          averageScore: 72.5,
          affectedStudents: 2,
          recommendedRemediation: 'Demonstrate eg and t2g orbital orientation relative to ligand axes.',
          urgency: 'medium'
        }
      ],
      trends: [
        { week: 'Week 1', avgScore: 87.5, submissionRate: 95.0, activeCount: 6 },
        { week: 'Week 2', avgScore: 88.0, submissionRate: 94.0, activeCount: 6 }
      ],
      aiExecutiveSummary: `Organic mechanisms show excellent retention. Riya Kapoor leads in Aldol and Cannizzaro reaction pathways.`,
      keyActionItems: [
        'Review Nernst equation concentration cell calculations before unit test.'
      ],
      lastGenerated: '2026-08-30T14:00:00'
    },
    'subj-mat-12': {
      subjectId: 'subj-mat-12',
      subjectName: 'Class 12 Mathematics (Calculus, Vectors & 3D Geometry)',
      totalStudents: 6,
      classAverage: 90.5,
      submissionRate: 97.0,
      atRiskStudentsCount: 0,
      gradeDistribution: [
        { range: '90-100% (A)', count: 4, percentage: 66.7 },
        { range: '80-89% (B)', count: 2, percentage: 33.3 },
        { range: '<80%', count: 0, percentage: 0.0 }
      ],
      weakTopics: [
        {
          topic: 'Shortest Distance Between Skew Lines in 3D Space',
          errorRate: 26,
          averageScore: 76.5,
          affectedStudents: 2,
          recommendedRemediation: 'Provide vector cross-product visualization for skew line projections.',
          urgency: 'medium'
        }
      ],
      trends: [
        { week: 'Week 1', avgScore: 89.0, submissionRate: 100.0, activeCount: 6 },
        { week: 'Week 2', avgScore: 90.5, submissionRate: 97.0, activeCount: 6 }
      ],
      aiExecutiveSummary: `Outstanding performance on Definite Integrals King Property. Siddharth Rao and Samaira Gupta achieve top ranks.`,
      keyActionItems: [
        'Assign 3D geometry plane equation problem sheet.'
      ],
      lastGenerated: '2026-08-30T15:00:00'
    },
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
  },
  lectures: loadLecturesFromDisk(seedLectures),
  boardCaptures: seedBoardCaptures,
  conceptMastery: seedConceptMastery,
  lectureProgress: loadProgressFromDisk(seedStudentLectureProgress),
  masteryQuizzes: seedMasteryQuizzes,
  questionBanks: [...FAKE_QUESTION_BANKS]
};

