import {
  User,
  Subject,
  TimelineItem,
  StudentProfile,
  ClassScheduleItem,
  LectureArchiveItem,
  AssignmentItem,
  StudentSubmission,
  StudentNote,
  TodoTask,
  CustomTutorPersona,
  QuizQuestion,
  ChatMessage,
  FlashcardItem,
  QuestionBankItem,
  VaultSnapshot,
  SecurityAuditResult,
} from '../types';

export const initialStudent: StudentProfile = {
  name: 'Student Dhruva',
  email: 'student.dhruva@bmu.edu.in',
  studentId: 'BMU-2026-7052',
  department: 'School of Engineering & Technology',
  academicProgram: 'B.Tech First Year (Applied Sciences)',
  explanationStyle: 'visual',
  avatarInitials: 'SD',
  gpa: 8.85,
};

export const initialUsers: User[] = [
  {
    id: 'student-1',
    name: 'Student Dhruva',
    email: 'student.dhruva@bmu.edu.in',
    username: 'student.dhruva',
    role: 'student',
    institutionalId: 'BMU-2026-7052',
    department: 'School of Engineering & Technology',
    program: 'B.Tech First Year (Applied Sciences)',
    avatarInitials: 'SD',
    enrolledSubjectIds: ['subj-phy', 'subj-mat', 'subj-che', 'subj-ess'],
    gpa: 8.85,
    learningProfile: {
      learningStyle: 'visual',
      pacePreference: 'standard',
      targetGrade: 'academic_mastery',
      strengths: ['Vectors & Coordinate Geometry', 'Newtonian Kinetics', 'Limits & Derivatives'],
      areasForImprovement: ['Incline Plane FBDs with Friction', 'Indeterminate Forms', 'Thermodynamic Enthalpy'],
      questionnaireCompleted: true,
    },
  },
  {
    id: 'student-2',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@edusync.edu.in',
    username: 'aarav.sharma',
    role: 'student',
    institutionalId: 'EDU-2026-1102',
    department: 'Senior Secondary Science Academy',
    program: 'Grade 11 PCM / Competitive JEE Track',
    avatarInitials: 'AS',
    enrolledSubjectIds: ['subj-phy', 'subj-mat', 'subj-che'],
    gpa: 9.2,
    learningProfile: {
      learningStyle: 'step_by_step',
      pacePreference: 'slow_thorough',
      targetGrade: 'competitive_exam',
      strengths: ['Kinematics', 'Trigonometric Limits', 'Chemical Bonding'],
      areasForImprovement: ['Rotational Dynamics & Torque', 'Integration by Parts'],
      questionnaireCompleted: true,
    },
  },
  {
    id: 'teacher-1',
    name: 'Dr. Rajesh Kulkarni',
    email: 'prof.rajesh@edusync.edu.in',
    username: 'prof.rajesh',
    role: 'teacher',
    institutionalId: 'FAC-PHY-401',
    department: 'Department of Physics & Applied Mechanics',
    program: 'Faculty of Natural Sciences',
    avatarInitials: 'RK',
    teachingSubjectIds: ['subj-phy'],
  },
  {
    id: 'teacher-2',
    name: 'Prof. Vikramaditya Roy',
    email: 'prof.vikram@edusync.edu.in',
    username: 'prof.vikram',
    role: 'teacher',
    institutionalId: 'FAC-MTH-402',
    department: 'Department of Mathematics & Computing',
    program: 'Faculty of Mathematical Sciences',
    avatarInitials: 'VR',
    teachingSubjectIds: ['subj-mat'],
  },
  {
    id: 'teacher-3',
    name: 'Dr. Sanmitra Bhattacharya',
    email: 'prof.sanmitra@edusync.edu.in',
    username: 'prof.sanmitra',
    role: 'teacher',
    institutionalId: 'FAC-ESS-403',
    department: 'Earth & Environmental Sciences',
    program: 'Faculty of Engineering Core',
    avatarInitials: 'SB',
    teachingSubjectIds: ['subj-ess', 'subj-che'],
  },
  {
    id: 'admin-1',
    name: 'Dr. Maneek Singh',
    email: 'dean.maneek@edusync.edu.in',
    username: 'dean.maneek',
    role: 'admin',
    institutionalId: 'ADM-DEAN-001',
    department: 'Office of Academic Affairs & Registrar',
    program: 'Dean of Academic Welfare',
    avatarInitials: 'MS',
  },
];

export const initialSubjects: Subject[] = [
  {
    id: 'subj-phy',
    code: 'PHY-11',
    name: 'Physics 11 (Mechanics & Dynamics)',
    description: 'Foundational Newtonian kinetics, inclined planes, free-body diagrams, and rotational mechanics.',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Rajesh Kulkarni',
    credits: 4,
    department: 'Applied Sciences',
    syllabusTopics: [
      'Vectors and Motion in 2D',
      "Newton's Laws of Motion & FBDs",
      'Work, Energy and Power',
      'System of Particles & Rotational Dynamics',
      'Gravitation & Orbital Motion',
    ],
    enrolledCount: 64,
    colorTheme: '#a33900',
  },
  {
    id: 'subj-mat',
    code: 'MAT-11',
    name: 'Mathematics 11 (Calculus & Functions)',
    description: 'Real functions, limits, continuity, differentiability, and rate of change derivations.',
    teacherId: 'teacher-2',
    teacherName: 'Prof. Vikramaditya Roy',
    credits: 4,
    department: 'Mathematics & Computing',
    syllabusTopics: [
      'Relations and Functions',
      'Limits and Indeterminate Forms',
      'Continuity and Differentiability',
      "Applications of Derivatives & L'Hopital",
      'Integral Calculus Foundations',
    ],
    enrolledCount: 58,
    colorTheme: '#0051d5',
  },
  {
    id: 'subj-che',
    code: 'CHE-11',
    name: 'Chemistry 11 (Thermodynamics & Structure)',
    description: 'Atomic orbitals, chemical thermodynamics, equilibrium constants, and state functions.',
    teacherId: 'teacher-3',
    teacherName: 'Dr. Ramesh Sharma',
    credits: 3,
    department: 'Chemical Sciences',
    syllabusTopics: [
      'Structure of Atom & Quantum Numbers',
      'Chemical Thermodynamics & Enthalpy',
      'Equilibrium & Le Chatelier Principle',
      'Redox Reactions & Electrochemistry',
    ],
    enrolledCount: 60,
    colorTheme: '#006947',
  },
  {
    id: 'subj-ess',
    code: 'ESS-11',
    name: 'Environmental & Earth Systems',
    description: 'Biogeochemical cycles, resource dynamics, climate modeling, and ecological resilience.',
    teacherId: 'teacher-3',
    teacherName: 'Dr. Sanmitra Bhattacharya',
    credits: 3,
    department: 'Earth & Environmental Sciences',
    syllabusTopics: [
      'Biogeochemical Carbon & Nitrogen Cycles',
      'Atmospheric Energy Balances',
      'Hydrological Systems & Aquifer Depletion',
      'Renewable Energy Integration',
    ],
    enrolledCount: 45,
    colorTheme: '#526070',
  },
];

export const initialTimelines: TimelineItem[] = [
  {
    id: 'tl-1',
    subjectId: 'subj-phy',
    subjectName: 'Physics 11',
    title: 'Lecture 14: Incline Planes & Friction Balance',
    date: '2026-09-02',
    type: 'lecture',
    status: 'completed',
    details: 'Rigorous derivation of N = mg cos(theta) and net acceleration with friction. Blackboard OCR synchronized.',
    room: 'Hall 302',
  },
  {
    id: 'tl-2',
    subjectId: 'subj-phy',
    subjectName: 'Physics 11',
    title: 'Lecture 15: Rotational Inertia & Connected Pulleys',
    date: '2026-09-08',
    type: 'lecture',
    status: 'completed',
    details: 'Atwood machine with non-negligible pulley moment of inertia I = 1/2 MR^2. KaTeX notes ready.',
    room: 'Hall 302',
  },
  {
    id: 'tl-3',
    subjectId: 'subj-phy',
    subjectName: 'Physics 11',
    title: 'Problem Set #3 Due: Incline Vectors & Atwood Dynamics',
    date: '2026-09-15',
    type: 'assignment',
    status: 'current',
    details: '5 problems on HC Verma mechanics. Includes weighted 3-criterion rubric evaluation.',
  },
  {
    id: 'tl-4',
    subjectId: 'subj-phy',
    subjectName: 'Physics 11',
    title: 'Midterm Assessment: Classical Kinetics & Work-Energy',
    date: '2026-09-24',
    type: 'exam',
    status: 'upcoming',
    details: 'Comprehensive 100-mark written examination covering units 1 through 4.',
    room: 'Exam Hall B',
  },
  {
    id: 'tl-5',
    subjectId: 'subj-mat',
    subjectName: 'Mathematics 11',
    title: "Lecture 12: Indeterminate Forms & L'Hopital Rule",
    date: '2026-09-05',
    type: 'lecture',
    status: 'completed',
    details: 'Evaluation of 0/0 and inf/inf limits. Geometric interpretation via Cauchy Mean Value Theorem.',
    room: 'Room 105',
  },
  {
    id: 'tl-6',
    subjectId: 'subj-mat',
    subjectName: 'Mathematics 11',
    title: 'Quiz 2: Continuity & Derivative First Principles',
    date: '2026-09-18',
    type: 'exam',
    status: 'upcoming',
    details: '30-minute in-class diagnostic quiz. 20 multiple-choice and 2 derivation questions.',
    room: 'Room 105',
  },
];

export const initialNotes: StudentNote[] = [
  {
    id: 'note-1',
    subjectId: 'subj-phy',
    subjectName: 'Physics 11 (Mechanics)',
    title: "Newton's Laws & Incline Plane Normal Reaction",
    content: `# Incline Plane Dynamics & Vector Resolution

## 1. Normal Reaction on an Incline
When a mass $m$ rests on an incline of angle $\\theta$:
- Component of gravity perpendicular to ramp:
$$W_{\\perp} = mg \\cos(\\theta)$$
- Component parallel to surface (downhill driving force):
$$W_{\\parallel} = mg \\sin(\\theta)$$

By equilibrium in the perpendicular direction:
$$\\Sigma F_y = N - mg \\cos(\\theta) = 0 \\implies N = mg \\cos(\\theta)$$

> **Common Trap**: $N = mg$ only when the surface is horizontal ($\\theta = 0^\\circ$). On an incline, $N < mg$ always!

## 2. Kinetic Friction & Net Acceleration
When sliding down with kinetic friction coefficient $\\mu_k$:
$$f_k = \\mu_k N = \\mu_k mg \\cos(\\theta)$$

Applying Newton's Second Law along the ramp:
$$m a = mg \\sin(\\theta) - \\mu_k mg \\cos(\\theta)$$
$$a = g(\\sin(\\theta) - \\mu_k \\cos(\\theta))$$

## 3. Angle of Repose
The minimum angle $\\theta_r$ for sliding to begin:
$$\\tan(\\theta_r) = \\mu_s$$`,
    lastEdited: '2 hours ago',
    tags: ['Mechanics', 'FBD', 'KaTeX', 'Exam Essential'],
    pinned: true,
    summary: 'Resolved weight into perpendicular and parallel components. Derived normal force N = mg cos(theta) and net acceleration with friction.',
    keyTakeaways: [
      'Normal force is perpendicular to contact surface, NOT always equal to mg.',
      'Kinetic friction opposes relative surface slip: f_k = μ_k * mg * cos(θ).',
      'At angle of repose tan(θ) = μ_s, the block is on the verge of sliding.',
    ],
    formulas: ['N = mg \\cos(\\theta)', 'f_k = \\mu_k N', 'a = g(\\sin\\theta - \\mu_k \\cos\\theta)'],
  },
  {
    id: 'note-2',
    subjectId: 'subj-mat',
    subjectName: 'Mathematics 11',
    title: "Evaluation of Indeterminate Limits & L'Hopital Rule",
    content: `# Indeterminate Limits & Asymptotic Behavior

## 1. Indeterminate Forms
When direct substitution yields $\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$:
$$\\lim_{x \\to c} \\frac{f(x)}{g(x)} = \\lim_{x \\to c} \\frac{f'(x)}{g'(x)}$$
provided the limit of derivatives exists or is $\\pm\\infty$.

## 2. Standard Trigonometric Limit
$$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$
Using the Squeeze Theorem:
$$\\cos(x) \\le \\frac{\\sin(x)}{x} \\le 1 \\quad \\text{for } x \\in \\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$$

## 3. Exponential Limits
$$\\lim_{x \\to \\infty} \\left(1 + \\frac{1}{x}\\right)^x = e \\approx 2.71828$$`,
    lastEdited: 'Yesterday',
    tags: ['Calculus', 'Limits', 'LHopital'],
    pinned: false,
    summary: "Rigorous rules for indeterminate quotient limits and trigonometric asymptotic bounds.",
    keyTakeaways: [
      "Always check that 0/0 or inf/inf holds before differentiating numerator and denominator.",
      'Differentiate numerator and denominator separately—do NOT use quotient rule for L\'Hopital!',
    ],
    formulas: [
      '\\lim_{x \\to c} \\frac{f(x)}{g(x)} = \\lim_{x \\to c} \\frac{f\'(x)}{g\'(x)}',
      '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1',
    ],
  },
  {
    id: 'note-3',
    subjectId: 'subj-phy',
    subjectName: 'Physics 11 (Mechanics)',
    title: 'Conservation of Angular Momentum & Rotating Bodies',
    content: `# Rotational Mechanics & Angular Momentum

## 1. Torque & Time Derivative of Angular Momentum
$$\\vec{\\tau}_{ext} = \\frac{d\\vec{L}}{dt}$$
If net external torque $\\Sigma \\vec{\\tau}_{ext} = 0$:
$$\\vec{L}_i = \\vec{L}_f = \\text{constant}$$

For a rigid body rotating about a fixed principal axis:
$$L = I \\omega$$
$$I_1 \\omega_1 = I_2 \\omega_2$$

## 2. Moment of Inertia for Standard Geometries
- Solid Cylinder / Disk: $I = \\frac{1}{2} M R^2$
- Thin Hoop: $I = M R^2$
- Solid Sphere: $I = \\frac{2}{5} M R^2$
- Hollow Sphere: $I = \\frac{2}{3} M R^2$`,
    lastEdited: '3 days ago',
    tags: ['Rotational', 'Torque', 'Moment of Inertia'],
    pinned: false,
    summary: 'Angular momentum is conserved when external torque vanishes. Derived relationship I1*w1 = I2*w2 for skater/collapsing mass problems.',
    keyTakeaways: [
      'dL/dt = tau_ext is rotational analogue of dp/dt = F_net.',
      'Decreasing moment of inertia I increases angular velocity omega proportionally.',
    ],
    formulas: ['\\tau_{ext} = \\frac{dL}{dt}', 'L = I\\omega', 'I_1\\omega_1 = I_2\\omega_2'],
  },
];

export const initialSubmissions: StudentSubmission[] = [
  {
    id: 'sub-1',
    assignmentId: 'asg-urgent',
    assignmentTitle: 'Problem Set #3: Incline Plane Mechanics & Connected Masses',
    subjectId: 'subj-phy',
    subjectName: 'Physics 11',
    studentId: 'student-1',
    studentName: 'Student Dhruva',
    studentEmail: 'student.dhruva@bmu.edu.in',
    studentAvatar: 'SD',
    submittedAt: '2026-09-10 14:32 IST',
    solutionText: `Resolved forces along x (downhill) and y (normal):
1. Normal Force: N = mg * cos(30 deg) = (5 kg)(9.8 m/s^2)(0.866) = 42.44 N.
2. Kinetic friction opposing motion: f_k = mu_k * N = (0.25)(42.44) = 10.61 N.
3. Gravitational downhill pull: F_g_x = mg * sin(30 deg) = (5)(9.8)(0.5) = 24.50 N.
4. Net accelerating force: F_net = 24.50 - 10.61 = 13.89 N.
5. Acceleration: a = F_net / m = 13.89 / 5 = 2.78 m/s^2.
Verified dimensional consistency [L T^-2].`,
    attachedFileName: 'dhruva_physics_fbd_scan.pdf',
    status: 'graded',
    score: 96,
    maxPoints: 100,
    rubricGrades: {
      'crit-1': 38, // Free Body Diagram (max 40)
      'crit-2': 39, // Mathematical Formulation (max 40)
      'crit-3': 19, // Calculation & Units (max 20)
    },
    feedback: 'Excellent rigor on vector resolution. Free body diagram isolate vectors cleanly. Minor note: remember to specify 3 significant digits consistently.',
    aiSuggestedGrade: 96,
    aiFeedbackSummary: 'Complete step-by-step resolution. Dimensional check included. Full rubric criteria met.',
  },
  {
    id: 'sub-2',
    assignmentId: 'asg-urgent',
    assignmentTitle: 'Problem Set #3: Incline Plane Mechanics & Connected Masses',
    subjectId: 'subj-phy',
    subjectName: 'Physics 11',
    studentId: 'student-2',
    studentName: 'Aarav Sharma',
    studentEmail: 'aarav.sharma@edusync.edu.in',
    studentAvatar: 'AS',
    submittedAt: '2026-09-11 18:05 IST',
    solutionText: `Vector balance on 30 deg ramp:
N = mg cos 30 = 42.44 N
f_k = mu * N = 10.61 N
a = g(sin 30 - 0.25 cos 30) = 9.8 * (0.5 - 0.2165) = 2.78 m/s^2.
Tension in connected string calculated from m2 hanging block yields T = 31.2 N.`,
    attachedFileName: 'aarav_solution_scanned.png',
    status: 'pending',
    maxPoints: 100,
    aiSuggestedGrade: 94,
    aiFeedbackSummary: 'Clean derivation. Could benefit from explicit FBD axis labeling in step 1.',
  },
];

export const initialFlashcards: FlashcardItem[] = [
  {
    id: 'fc-1',
    front: 'What is the normal reaction force on an inclined plane of angle θ?',
    back: 'N = mg cos(θ)',
    hint: 'Resolve the weight vector perpendicular to the surface of the ramp.',
    subject: 'Physics 11',
    formulaLatex: 'N = mg \\cos(\\theta)',
    mastered: true,
  },
  {
    id: 'fc-2',
    front: 'What is the acceleration of a block sliding down an incline with kinetic friction μ_k?',
    back: 'a = g(sin θ - μ_k cos θ)',
    hint: 'Apply F_net = m*a along the incline. Mass m cancels out.',
    subject: 'Physics 11',
    formulaLatex: 'a = g(\\sin\\theta - \\mu_k \\cos\\theta)',
    mastered: false,
  },
  {
    id: 'fc-3',
    front: 'What is the condition for conservation of angular momentum?',
    back: 'Net external torque must be zero: Σ τ_ext = 0 (dL/dt = 0).',
    hint: 'Recall dL/dt = τ_ext.',
    subject: 'Physics 11',
    formulaLatex: '\\Sigma \\vec{\\tau}_{ext} = 0 \\implies L_i = L_f',
    mastered: true,
  },
  {
    id: 'fc-4',
    front: "What is L'Hôpital's Rule and when can it be applied?",
    back: 'lim [f(x)/g(x)] = lim [f\'(x)/g\'(x)], valid strictly for indeterminate forms 0/0 or ±∞/±∞.',
    hint: 'Differentiate numerator and denominator separately, not quotient rule.',
    subject: 'Mathematics 11',
    formulaLatex: '\\lim_{x \\to c} \\frac{f(x)}{g(x)} = \\lim_{x \\to c} \\frac{f\'(x)}{g\'(x)}',
    mastered: false,
  },
  {
    id: 'fc-5',
    front: 'What is the angle of repose in mechanics?',
    back: 'The maximum ramp inclination before static friction breaks and sliding initiates: tan(θ_r) = μ_s.',
    hint: 'Equate downhill gravity component to maximum static friction f_s_max.',
    subject: 'Physics 11',
    formulaLatex: '\\tan(\\theta_r) = \\mu_s',
    mastered: true,
  },
];

export const initialQuestionBank: QuestionBankItem[] = [
  {
    id: 'qb-1',
    subjectId: 'subj-phy',
    subjectName: 'Physics 11',
    topic: 'Inclined Plane Dynamics',
    question: 'A 10 kg block is placed on an incline of 37 degrees with μ_s = 0.4 and μ_k = 0.3. Determine whether the block slides, and calculate its acceleration if it does.',
    difficulty: 'Moderate',
    source: 'HC Verma Vol 1 Chapter 5',
    sampleAnswer: 'tan(37 deg) = 0.75 > μ_s (0.4), so block slides. a = g(sin 37 - 0.3 cos 37) = 9.8*(0.6 - 0.24) = 3.53 m/s^2.',
  },
  {
    id: 'qb-2',
    subjectId: 'subj-phy',
    subjectName: 'Physics 11',
    topic: 'Atwood Machine & Pulleys',
    question: 'Two masses m1 = 4 kg and m2 = 6 kg hang from a frictionless, massless pulley. Find system acceleration and string tension.',
    difficulty: 'Basic',
    source: 'Resnick & Halliday Fundamentals of Physics',
    sampleAnswer: 'a = (m2 - m1)g / (m1 + m2) = 2*9.8/10 = 1.96 m/s^2. T = 2*m1*m2*g/(m1+m2) = 47.04 N.',
  },
  {
    id: 'qb-3',
    subjectId: 'subj-mat',
    subjectName: 'Mathematics 11',
    topic: "L'Hopital Rule & Trig Limits",
    question: 'Evaluate lim_{x -> 0} (tan x - x) / x^3 using series expansion or repeated L\'Hopital differentiation.',
    difficulty: 'Advanced',
    source: 'Thomas Calculus 14th Edition',
    sampleAnswer: 'Direct substitution yields 0/0. Applying L\'Hopital three times gives 1/3.',
  },
];

export const initialVaultSnapshots: VaultSnapshot[] = [
  {
    id: 'snap-2026-09-12-01',
    timestamp: '2026-09-12 18:00 IST',
    title: 'Pre-Midterm Institutional Master Snapshot',
    recordCount: { users: 6, notes: 3, assignments: 2, lectures: 1 },
    status: 'Live Active',
    sizeBytes: 428000,
  },
  {
    id: 'snap-2026-09-01-00',
    timestamp: '2026-09-01 09:00 IST',
    title: 'Semester Baseline Seed Archive',
    recordCount: { users: 6, notes: 2, assignments: 1, lectures: 1 },
    status: 'Archived',
    sizeBytes: 382000,
  },
];

export const initialSecurityAudit: SecurityAuditResult[] = [
  {
    id: 'sec-1',
    name: 'OWASP Security Response Headers',
    category: 'Network Transport',
    status: 'PASSED',
    description: 'X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, and Referrer-Policy are strictly configured.',
  },
  {
    id: 'sec-2',
    name: 'Content Security Policy (CSP)',
    category: 'Content Protection',
    status: 'PASSED',
    description: 'Restricts script and iframe execution to safe origins with KaTeX CDN whitelist.',
  },
  {
    id: 'sec-3',
    name: 'Recursive XSS Script Sanitization',
    category: 'Payload Validation',
    status: 'PASSED',
    description: 'All string payload inputs are recursively stripped of <script>, javascript:, and onerror attributes.',
  },
  {
    id: 'sec-4',
    name: 'Prototype Pollution Shield',
    category: 'Memory Integrity',
    status: 'PASSED',
    description: 'Object merger guards block __proto__, constructor, and prototype injection.',
  },
  {
    id: 'sec-5',
    name: 'Tiered Rate Limiter Burst Protection',
    category: 'Availability',
    status: 'PASSED',
    description: 'Auth ceiling at 500 req/min, AI inference at 100 req/min, REST at 500 req/min.',
  },
  {
    id: 'sec-6',
    name: 'Multi-Role RBAC Endpoint Isolation',
    category: 'Access Control',
    status: 'PASSED',
    description: 'Student role requests to admin endpoints (/api/admin/*) are rejected with 403 Forbidden.',
  },
  {
    id: 'sec-7',
    name: 'Zero-Leak Vault Snapshot Encryption',
    category: 'Disaster Recovery',
    status: 'PASSED',
    description: 'Snapshot backups are stored in isolated encrypted JSON vaults with atomic restoration.',
  },
  {
    id: 'sec-8',
    name: 'Pedagogical Socratic AI Guardrails',
    category: 'Academic Integrity',
    status: 'PASSED',
    description: 'AI model refuses to solve homework directly; breaks problems down into guided Socratic questions.',
  },
];


export const initialClasses: ClassScheduleItem[] = [
  {
    id: 'class-1',
    title: 'Physics 11',
    code: 'PHY-1101',
    instructor: 'Dr. Rajesh Kulkarni',
    room: 'Room 302',
    timeSlot: '09:00 AM - 10:00 AM',
    status: 'Completed',
    statusColor: 'tertiary',
    tags: ['Incline Plane Vectors', 'Normal Force Resolution', 'Kinetic Friction (μ)'],
    quote: '"Derived the net acceleration formula for a block sliding on a ramp with friction. Verified whiteboard free body diagrams."',
    notesSummary: 'Free Body Diagrams on inclined planes and normal force trigonometry.',
    fullNotesId: 'lec-phy-101',
    lectureClipDuration: '45 mins',
  },
  {
    id: 'class-2',
    title: 'Mathematics 11',
    code: 'MTH-1102',
    instructor: 'Prof. Ananya Sen',
    room: 'Room 105',
    timeSlot: '11:30 AM - 12:30 PM',
    status: 'In Progress',
    statusColor: 'orange',
    tags: ['Limits at Infinity', "L'Hopital Rule", 'Continuity proofs'],
    quote: '"Discussed indeterminate forms 0/0 and evaluated standard trigonometric limits."',
    notesSummary: "L'Hopital rule application and Squeeze theorem boundary limits.",
    fullNotesId: 'lec-mth-201',
    lectureClipDuration: '50 mins',
  },
  {
    id: 'class-3',
    title: 'Chemistry 11',
    code: 'CHM-1103',
    instructor: 'Dr. Ramesh Sharma',
    room: 'Lab A',
    timeSlot: '02:00 PM - 03:00 PM',
    status: 'Upcoming',
    statusColor: 'secondary',
    tags: ['Hybridization (sp, sp2, sp3)', 'VSEPR Theory Geometry', 'Molecular Dipoles preview'],
    quote: '"Scheduled for this afternoon in Science Block Lab A."',
    notesSummary: 'VSEPR geometry, steric numbers, and orbital overlapping.',
    fullNotesId: 'lec-chm-304',
    lectureClipDuration: '40 mins',
  },
  {
    id: 'class-4',
    title: 'Electronics & CS',
    code: 'ECS-1104',
    instructor: 'Dr. Sunita Rao',
    room: 'Lab B',
    timeSlot: '02:00 PM - 03:30 PM',
    status: 'Scheduled',
    statusColor: 'neutral',
    tags: ['Boolean Algebra', 'Logic Gates'],
    quote: '"Lab practical: Karnaugh mapping and dual input NAND gate construction."',
    notesSummary: 'Boolean simplification and logic gates minimization.',
    fullNotesId: 'lec-ecs-401',
    lectureClipDuration: '60 mins',
  },
];

export const initialLecturesArchive: LectureArchiveItem[] = [
  {
    id: 'lec-1',
    title: 'Newtonian Kinetics & Free Body Diagrams',
    subject: 'PHYSICS',
    category: 'MECHANICS',
    date: 'Sep 12',
    ocrSnippet: 'Whiteboard OCR with 4 vector force resolution on 30° incline ramp and friction coefficient derivation.',
    iconType: 'document',
    duration: '45m',
  },
  {
    id: 'lec-2',
    title: 'Epsilon-Delta Definition of Limits',
    subject: 'MATH',
    category: 'CALCULUS',
    date: 'Sep 11',
    ocrSnippet: 'Step-by-step rigorous proof of limit continuity with squeeze theorem neighborhood tolerances.',
    iconType: 'math',
    duration: '52m',
  },
  {
    id: 'lec-3',
    title: 'Atomic Orbitals & Electron Configurations',
    subject: 'CHEMISTRY',
    category: 'PERIODIC',
    date: 'Sep 10',
    ocrSnippet: 'Aufbau principle & Hund\'s multiplicity with radial distribution wavefunctions.',
    iconType: 'chemistry',
    duration: '48m',
  },
  {
    id: 'lec-4',
    title: 'Rotational Mechanics: Moment of Inertia',
    subject: 'PHYSICS',
    category: 'ROTATION',
    date: 'Sep 09',
    ocrSnippet: 'Parallel and perpendicular axis theorems applied to hollow cylinders and flat disks.',
    iconType: 'document',
    duration: '55m',
  },
];

export const initialAssignments: AssignmentItem[] = [
  {
    id: 'asg-urgent',
    title: 'HC Verma Ch 5: Problems 4–9 on Connected Pulleys & Inclined Planes',
    subject: 'Physics 11 (Mechanics)',
    instructor: 'Dr. Rajesh Kulkarni',
    points: 100,
    dueDate: 'Due in 2 days',
    dueStatus: 'urgent',
    isUrgent: true,
    description: 'Analyze free body diagrams for objects on 30° ramp with kinetic friction μk = 0.25. Derive equations of motion in LaTeX and attach free body sketch or notebook OCR scan.',
    tags: ['VisionNote OCR Ingestion Ready', 'Automated Kinematics Sim Available'],
    rubricSummary: '3 Rubric Criteria',
    status: 'pending',
  },
  {
    id: 'asg-1',
    title: 'Problem Set 1: Pointer Arithmetic & Memory Alignment',
    subject: 'Computer Science (CS-101)',
    instructor: 'Prof. Roy',
    points: 100,
    dueDate: 'Due Today at 11:59 PM',
    dueStatus: 'due-today',
    latePenalty: '10%/hr',
    description: 'Implement custom slab allocator in C. Verify 8-byte boundaries and zero memory leak traces via Valgrind test fixtures.',
    tags: ['C Programming', 'Valgrind', 'Memory Leaks', 'GCC 13'],
    rubricSummary: 'Theoretical Rigor (50 pts), Implementation & Test Coverage (50 pts)',
    status: 'pending',
  },
  {
    id: 'asg-2',
    title: 'Molecular Geometries & Hybridization Worksheet (PCl₅, SF₆)',
    subject: 'Chemistry 11',
    instructor: 'Dr. Ananya Sen',
    points: 50,
    dueDate: 'Due Tuesday, Sep 15',
    dueStatus: 'upcoming',
    description: 'Construct molecular orbital diagrams for hypervalent phosphorus and sulfur compounds. Detail steric numbers and bond angle deviations under lone pair repulsions.',
    tags: ['VSEPR Theory', 'Hybridization', 'd-Orbitals'],
    rubricSummary: 'Orbital Overlap Accuracy (25 pts), Geometry Diagram (25 pts)',
    status: 'pending',
  },
  {
    id: 'asg-3',
    title: 'Calculus Limits & The Squeeze Theorem Problem Set',
    subject: 'Mathematics 11',
    instructor: 'Prof. Vikramaditya Roy',
    points: 100,
    dueDate: 'Graded Sep 11',
    dueStatus: 'graded',
    score: 94,
    grade: '94/100 (A)',
    description: 'Analytical evaluation of trigonometric and exponential indeterminate forms using sandwich bounds.',
    feedback: '"Excellent inductive proofs on trigonometric limits. Very clear KaTeX derivation for sin(x)/x as x -> 0. Pay close attention to delta neighborhood boundaries in question 4b."\nRigor: 48/50  •  Clarity: 46/50',
    tags: ['Calculus', 'Limits', 'Trigonometry'],
    status: 'graded',
  },
  {
    id: 'asg-4',
    title: 'Term Project: Campus Carbon Footprint & Energy Audit',
    subject: 'Environmental Science',
    instructor: 'Dr. Sanmitra Bhattacharya',
    points: 100,
    dueDate: 'Submitted Yesterday at 18:30',
    dueStatus: 'submitted',
    description: 'Full lifecycle analysis model comparing dormitory solar arrays vs. grid peak draw during hostel summer occupancy.',
    tags: ['Solar Efficiency', 'Sustainability', 'Lifecycle Analysis'],
    submittedFile: 'carbon_audit_report.pdf (4.8 MB)',
    status: 'submitted',
  },
];

export const initialTodos: TodoTask[] = [
  {
    id: 'todo-1',
    title: 'Review Free Body Diagram notes',
    subject: 'Physics',
    dueDate: 'Tomorrow',
    priority: 'High',
    completed: false,
  },
  {
    id: 'todo-2',
    title: 'Complete Calculus limit problem set',
    subject: 'Math',
    dueDate: 'In 3 days',
    priority: 'Medium',
    completed: false,
  },
  {
    id: 'todo-3',
    title: 'Watch rotational motion concept animation',
    subject: 'Physics',
    dueDate: 'Friday',
    priority: 'Low',
    completed: true,
  },
];

export const initialCustomTutors: CustomTutorPersona[] = [
  {
    id: 'tutor-1',
    name: 'Prof. Walter Lewin',
    specialty: 'Intuitive Demonstrations & High School Physics',
    prompt: 'Always begin with a real-world demonstration, show why common misconceptions fail, and derive equations from first principles.',
    initials: 'WL',
  },
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'tutor',
    text: "Hello Student, What do you want to learn today?\n\nI'm your AI Tutor active in Socratic Method mode. I have your lecture notes and blackboard captures loaded for Physics 11 — Chapter 3: Laws of Motion & Incline Forces.\n\nWhat concept or problem would you like to explore?",
    timestamp: '11:14 PM',
    method: 'Socratic Method',
    videoClip: {
      title: "Newton's Laws & Incline Forces Visualized",
      source: 'EduSync Concept Studio',
      duration: '4:20 min',
    },
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Can you help me understand why the normal force on an inclined plane is N = mg cos(θ) instead of just mg?',
    timestamp: '11:15 PM',
  },
  {
    id: 'msg-3',
    sender: 'tutor',
    text: 'Think about the direction gravity acts compared to the surface of the incline. Gravity acts strictly vertically downward (mg). Since the block can only press directly into the ramp perpendicularly, what component of that downward vector is aligned perpendicular to the incline?',
    timestamp: '11:16 PM',
    method: 'Socratic Method',
    isSocraticPrompt: true,
    suggestions: ['Draw the triangle of forces', 'What happens when θ = 0°?'],
  },
];

export const initialQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'A crate of mass 10 kg rests on an inclined plane with angle 30°. If the coefficient of static friction is μs = 0.6, will the crate slide down without an applied force?',
    tag: 'Friction',
    options: [
      { key: 'A', text: 'Yes, because tan(30°) is greater than 0.6' },
      { key: 'B', text: 'No, because tan(30°) ≈ 0.577, which is less than μs = 0.6' },
      { key: 'C', text: 'Yes, gravity always overcomes static friction on inclines' },
      { key: 'D', text: 'Cannot be determined without knowing the normal force explicitly' },
    ],
    correctKey: 'B',
    hint: 'Compare the incline slope tan(θ) to the static coefficient of friction μs (angle of repose criterion).',
    explanation: 'The angle of repose requires tan(θ) > μs for sliding to begin. Since tan(30°) ≈ 0.577 < 0.6, the block stays in static equilibrium.',
  },
  {
    id: 2,
    question: "Which physical quantity is the direct scalar measure of an object's inertia?",
    tag: 'Inertia',
    options: [
      { key: 'A', text: 'Velocity' },
      { key: 'B', text: 'Linear momentum' },
      { key: 'C', text: 'Inertial mass (m)' },
      { key: 'D', text: 'Net force applied' },
    ],
    correctKey: 'C',
    hint: "Recall Newton's First Law: what intrinsic scalar property quantifies resistance to changes in state of motion?",
    explanation: 'In classical mechanics, inertial mass is the fundamental scalar measure of an object\'s resistance to acceleration when a net external force is applied.',
  },
  {
    id: 3,
    question: 'When a book sits at rest on a flat table, what is the Newton\'s Third Law reaction force to the normal force exerted by the table on the book?',
    tag: "Newton's 3rd Law",
    options: [
      { key: 'A', text: 'The gravitational pull of the Earth on the book' },
      { key: 'B', text: 'The normal force exerted by the book pushing down onto the table' },
      { key: 'C', text: 'The gravitational pull of the book on the Earth' },
      { key: 'D', text: 'Static friction between the table surface and the book' },
    ],
    correctKey: 'B',
    hint: 'Action and reaction pairs act on two different bodies and are of the exact same physical interaction type.',
    explanation: 'If object A (table) exerts a contact normal force on object B (book), the reaction pair is object B (book) exerting an equal and opposite contact normal force on object A (table).',
  },
  {
    id: 4,
    question: 'An Atwood machine consists of masses m1 = 3 kg and m2 = 5 kg connected by a light string over a frictionless pulley. What is the system acceleration (g = 9.8 m/s²)?',
    tag: 'Connected Pulleys',
    options: [
      { key: 'A', text: '2.45 m/s²' },
      { key: 'B', text: '4.90 m/s²' },
      { key: 'C', text: '1.22 m/s²' },
      { key: 'D', text: '9.80 m/s²' },
    ],
    correctKey: 'A',
    hint: 'Net driving force is (m2 - m1)g, divided by total inertia (m1 + m2).',
    explanation: 'a = (m2 - m1) / (m1 + m2) * g = (5 - 3) / (5 + 3) * 9.8 = (2/8) * 9.8 = 2.45 m/s².',
  },
  {
    id: 5,
    question: 'Under what condition is the net angular momentum of a rotating physical system conserved?',
    tag: 'Rotational Mechanics',
    options: [
      { key: 'A', text: 'When the net external force is zero' },
      { key: 'B', text: 'When the net external torque about the reference axis equals zero' },
      { key: 'C', text: 'Only when the system angular velocity is constant' },
      { key: 'D', text: 'When kinetic friction vanishes completely' },
    ],
    correctKey: 'B',
    hint: 'Recall dL/dt = τ_ext. What makes the time derivative vanish?',
    explanation: 'Angular momentum L is conserved whenever the sum of external torques acting on the system is zero: dL/dt = τ_ext = 0.',
  },
  {
    id: 6,
    question: 'If a particle executes projectile motion in a vacuum, at which point of its trajectory is its speed at a minimum?',
    tag: 'Kinematics',
    options: [
      { key: 'A', text: 'At launch (t = 0)' },
      { key: 'B', text: 'At the apex (highest point)' },
      { key: 'C', text: 'Right before impact on the ground' },
      { key: 'D', text: 'Speed is constant throughout flight' },
    ],
    correctKey: 'B',
    hint: 'Consider the velocity components: v_x remains constant, while v_y reaches zero at the apex.',
    explanation: 'At the apex, the vertical velocity component is zero (vy = 0), so the speed is purely the horizontal component (vx = v0 cos θ), which is its minimum value.',
  },
];
