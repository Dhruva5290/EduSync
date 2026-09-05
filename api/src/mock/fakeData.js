"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAKE_ANALYTICS = exports.FAKE_RESOURCES = exports.FAKE_TIMELINES = exports.FAKE_ASSIGNMENTS = exports.FAKE_QUESTION_BANKS = exports.FAKE_NOTES = exports.FAKE_USERS = exports.FAKE_SUBJECTS = void 0;
exports.FAKE_SUBJECTS = [
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
    }
];
exports.FAKE_USERS = [
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
        designation: 'Senior Faculty of Physics',
        enrolledSubjectIds: [],
        teachingSubjectIds: ['subj-phy', 'subj-misc'],
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
        designation: 'Head of Department (Chemistry)',
        enrolledSubjectIds: [],
        teachingSubjectIds: ['subj-che', 'subj-misc'],
        officeLocation: 'Chemistry Block C - Room 302',
        officeHours: 'Tue & Fri 11:00 AM - 01:00 PM',
        status: 'active',
        joinedDate: '2020-01-15',
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
        designation: 'Professor of Mathematics',
        enrolledSubjectIds: [],
        teachingSubjectIds: ['subj-mat', 'subj-misc'],
        officeLocation: 'Ramanujan Block M - Room 405',
        officeHours: 'Wed & Fri 03:00 PM - 05:00 PM',
        status: 'active',
        joinedDate: '2017-08-01',
        phone: '+91 98110 54333'
    },
    {
        id: 'student-1',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@edusync.edu.in',
        username: 'aarav.sharma',
        password: 'Student@2026!',
        role: 'student',
        gender: 'Male',
        institutionalId: 'EDU-STU-1101',
        department: 'Science & Engineering Division',
        program: 'Physics, Chemistry & Mathematics Track',
        academicYear: '1st Year',
        gpa: 9.4,
        enrolledSubjectIds: ['subj-phy', 'subj-che', 'subj-mat', 'subj-misc'],
        teachingSubjectIds: [],
        status: 'active',
        joinedDate: '2026-04-01',
        phone: '+91 98100 11001',
        learningProfile: {
            learningStyle: 'step_by_step',
            targetGrade: 'A+',
            explanationTone: 'strict_coach',
            preferredPace: 'steady',
            strengthsAndInterests: 'Newtonian mechanics, calculus proofs, integration by parts',
            painPoints: 'Rotational kinetic energy on inclines, 3D vectors',
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
        department: 'Science & Engineering Division',
        program: 'Physics, Chemistry & Mathematics Track',
        academicYear: '1st Year',
        gpa: 9.1,
        enrolledSubjectIds: ['subj-phy', 'subj-che', 'subj-mat', 'subj-misc'],
        teachingSubjectIds: [],
        status: 'active',
        joinedDate: '2026-04-01',
        phone: '+91 98100 11002',
        learningProfile: {
            learningStyle: 'visual',
            targetGrade: 'A',
            explanationTone: 'encouraging_mentor',
            preferredPace: 'steady',
            strengthsAndInterests: 'Chemical bonding, molecular orbital diagrams, geometry',
            painPoints: 'Second law of thermodynamics proofs, differential calculus',
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
        department: 'Science & Engineering Division',
        program: 'Physics, Chemistry & Mathematics Track',
        academicYear: '1st Year',
        gpa: 8.5,
        enrolledSubjectIds: ['subj-phy', 'subj-che', 'subj-mat', 'subj-misc'],
        teachingSubjectIds: [],
        status: 'active',
        joinedDate: '2026-04-01',
        phone: '+91 98100 11003',
        learningProfile: {
            learningStyle: 'socratic_dialogue',
            targetGrade: 'B',
            explanationTone: 'practical_engineer',
            preferredPace: 'thorough',
            strengthsAndInterests: 'Real-world physics applications, thermodynamics',
            painPoints: 'Calculus derivatives, chemical equilibrium derivations',
            questionnaireCompleted: true,
            completedAt: '2026-09-01T10:30:00.000Z'
        }
    },
    {
        id: 'student-1788461612290',
        name: 'Student Dhruva',
        email: 'student.dhruva@bmu.edu.in',
        username: 'student.dhruva',
        password: 'EduSync@260101',
        role: 'student',
        gender: 'Male',
        institutionalId: 'BMU-2026-7052',
        department: 'School of Engineering & Technology',
        designation: 'B.Tech / Science 1st Year',
        enrolledSubjectIds: ['subj-phy', 'subj-che', 'subj-mat', 'subj-misc'],
        teachingSubjectIds: [],
        officeLocation: 'Student Hall B',
        status: 'active',
        learningProfile: {
            learningStyle: 'visual',
            targetGrade: 'A+',
            explanationTone: 'encouraging_mentor',
            preferredPace: 'steady',
            strengthsAndInterests: 'Interactive coding, mathematical graphs, physical models',
            painPoints: 'Complex integration, multi-variable calculus',
            questionnaireCompleted: true,
            completedAt: '2026-09-04T12:00:00.000Z'
        }
    }
];
exports.FAKE_NOTES = [
    {
        id: 'note-phy-01',
        studentId: 'student-1',
        subjectId: 'subj-phy',
        title: 'Newtonian Mechanics: Laws of Motion & Friction Invariants',
        content: `# Newtonian Mechanics: Laws of Motion & Friction Invariants\n\n## 1. Classical Axioms\nNewton's second law: $$\\sum \\vec{F}_{ext} = \\frac{d\\vec{p}}{dt} = m\\vec{a}$$\nStatic friction inequality: $$f_s \\le \\mu_s N$$\nKinetic friction: $$f_k = \\mu_k N \\quad (\\mu_k < \\mu_s)$$\n\n## 2. Invariant Momentum Conservation\nIn an isolated system ($\\sum \\vec{F}_{ext} = 0$), total linear momentum is conserved:\n$$\\vec{P}_{sys} = \\sum_{i=1}^N m_i \\vec{v}_i = \\text{const}$$\n\n## 3. Work-Kinetic Energy Theorem\n$$W_{net} = \\int_{\\vec{r}_1}^{\\vec{r}_2} \\vec{F}_{net} \\cdot d\\vec{r} = \\Delta K = \\frac{1}{2}m v_2^2 - \\frac{1}{2}m v_1^2$$`,
        tags: ['Physics', 'Mechanics', 'NewtonLaws', 'Friction', 'WorkEnergy'],
        lastModified: '2026-09-04T12:00:00.000Z',
        isPinned: true,
        source: 'visionnote',
        doubtsDetected: [
            'Why does static friction self-adjust until reaching its maximum threshold?',
            'Under what relativistic velocities does F = dp/dt deviate from F = ma?'
        ],
        summary: 'Foundational formulation of Newtonian dynamics, friction bounds, momentum conservation, and work-energy theorem.',
        keyTakeaways: [
            'Static friction is an inequality adjusting up to mu_s * N.',
            'Linear momentum conservation holds strictly in inertial frames.',
            'The work-energy theorem applies to all forces including friction.'
        ]
    },
    {
        id: 'note-che-01',
        studentId: 'student-2',
        subjectId: 'subj-che',
        title: 'Thermodynamics & Spontaneity: Gibbs Free Energy & Hess Law',
        content: `# Chemical Thermodynamics: Gibbs Free Energy & Hess Law\n\n## 1. First & Second Laws of Thermodynamics\n$$\\Delta U = q + w = q - P\\Delta V$$\n$$\\Delta S_{univ} = \\Delta S_{sys} + \\Delta S_{surr} \\ge 0$$\n\n## 2. Gibbs Free Energy (Constant T and P)\n$$\\Delta G = \\Delta H - T\\Delta S$$\n- $\\Delta G < 0$: Spontaneous forward process (Exergonic)\n- $\\Delta G = 0$: Equilibrium state\n- $\\Delta G > 0$: Non-spontaneous (Endergonic)\n\n## 3. Standard Free Energy and Equilibrium Constant\n$$\\Delta G^\\circ = -R T \\ln K_{eq}$$`,
        tags: ['Chemistry', 'Thermodynamics', 'GibbsEnergy', 'Entropy', 'Equilibrium'],
        lastModified: '2026-09-04T12:15:00.000Z',
        isPinned: true,
        source: 'visionnote',
        doubtsDetected: [
            'How does temperature dictate spontaneity when Delta H > 0 and Delta S > 0?',
            'Why does standard free energy change equal zero only when K_eq = 1?'
        ],
        summary: 'Thermochemical state functions, entropy evolution, Gibbs free energy criterion for reaction spontaneity, and temperature dependence.',
        keyTakeaways: [
            'Delta G combines enthalpy and entropy into a single criterion at constant T and P.',
            'Endothermic reactions with positive entropy become spontaneous only above T = Delta H / Delta S.'
        ]
    },
    {
        id: 'note-mat-01',
        studentId: 'student-1',
        subjectId: 'subj-mat',
        title: 'Techniques of Integration: Integration by Parts & Partial Fractions',
        content: `# Techniques of Integration: Integration by Parts & Partial Fractions\n\n## 1. Integration by Parts Formula\n$$\\int u \\, dv = u v - \\int v \\, du$$\nLIATE Priority: **L**ogarithmic > **I**nverse Trig > **A**lgebraic > **T**rigonometric > **E**xponential.\n\n## 2. The King's Property of Definite Integrals\n$$\\int_{a}^{b} f(x) \\, dx = \\int_{a}^{b} f(a + b - x) \\, dx$$\n\n## 3. Partial Fractions Decomposition\n$$\\frac{1}{(x - a)(x - b)} = \\frac{A}{x - a} + \\frac{B}{x - b}$$`,
        tags: ['Mathematics', 'Calculus', 'Integration', 'DefiniteIntegrals', 'LIATE'],
        lastModified: '2026-09-04T12:30:00.000Z',
        isPinned: true,
        source: 'visionnote',
        doubtsDetected: [
            'When does repeated integration by parts produce a cyclical algebraic equation?',
            'Why does the King property leave the total definite area unchanged?'
        ],
        summary: 'Integration by parts with the LIATE priority scheme, King property of definite integrals, and partial fraction templates.',
        keyTakeaways: [
            'The LIATE rule provides a deterministic algorithm for choosing u(x).',
            'The King property reflects the integrand across its interval midpoint without altering total enclosed area.'
        ]
    },
    {
        id: 'note-misc-01',
        studentId: 'student-1',
        subjectId: 'subj-misc',
        title: 'Scientific Research Methodology & Experimental Error Propagation',
        content: `# Scientific Research Methodology & Error Propagation\n\n## 1. Experimental Uncertainty & Error Bounds\nFor independent variables with Gaussian uncertainties:\n$$\\sigma_f = \\sqrt{ \\left( \\frac{\\partial f}{\\partial x} \\sigma_x \\right)^2 + \\left( \\frac{\\partial f}{\\partial y} \\sigma_y \\right)^2 }$$\n\n## 2. Relative Error for Product Forms $f = x^a y^b$\n$$\\frac{\\sigma_f}{f} = \\sqrt{ \\left( a \\frac{\\sigma_x}{x} \\right)^2 + \\left( b \\frac{\\sigma_y}{y} \\right)^2 }$$\n\n## 3. Significant Figures & Dimensional Guardrails\n- Addition/Subtraction: Governed by the decimal place of least precision.\n- Multiplication/Division: Governed by the lowest count of significant digits.`,
        tags: ['Misc', 'Research', 'ErrorPropagation', 'Experimentation', 'Measurements'],
        lastModified: '2026-09-04T12:45:00.000Z',
        isPinned: true,
        source: 'manual',
        summary: 'Formulas for linear and non-linear experimental error propagation, quadrature summation, and significant figure rules.',
        keyTakeaways: [
            'Uncertainties in independent parameters add in quadrature through partial derivatives.',
            'Power terms amplify relative error by their exponent coefficient.'
        ]
    },
    {
        id: '8def9d36-cf49-4821-a8ab-14711d1f006f',
        studentId: 'student-1',
        subjectId: 'subj-misc',
        title: 'NDA Selection Process: Written Exam, SSB Interview & Medicals',
        content: `# NDA Selection Process: Comprehensive Lecture Notes\n\n## 1. Executive Summary\nNational Defence Academy (NDA) provides direct admission into the officer cadet cadre for 4 years of comprehensive studying and training (first 3 years joint tri-service training at NDA Khadakwasla, Pune, and final year at respective branch academies: IMA Dehradun for Army, INA Ezhimala for Navy, AFA Dundigal for Air Force).\n\n## 2. Defence Forces Rank Structure\nRanks are divided into two primary cadres:\n1. **Commissioned Officers Cadre** (Starts from Lieutenant in Army, Sub-Lieutenant in Navy, Flying Officer in Air Force)\n2. **JCO / NCO / OR Cadre** (Junior Commissioned Officers, Non-Commissioned Officers, and Other Ranks starting from Sepoy)\n- *Advantage of NDA*: Direct entry into the Commissioned Officer cadet after Class 12 without spending decades climbing from Sepoy.\n\n## 3. The 3-Step Selection Process\n### Step 1: UPSC Written Examination (900 Marks)\n- **Paper 1: Mathematics** (120 questions, 300 marks, duration 2.5 hrs). Marking: +2.5 for correct, -0.83 for incorrect.\n- **Paper 2: General Ability Test (GAT)** (150 questions, 600 marks, duration 2.5 hrs). Marking: +4.0 for correct, -1.33 for incorrect. Includes English, Physics, Chemistry, General Science, History, Geography, and Current Affairs.\n- *Key Strategy*: Focus on accuracy rather than attempting all 120 math questions. Solving 50-60 high-accuracy questions reliably clears the cut-off.\n\n### Step 2: 5-Day SSB (Services Selection Board) Interview (900 Marks)\n- **Stage 1 (Screening)**:\n  - OIR (Officer Intelligence Rating Test)\n  - PPDT (Picture Perception & Description Test with Group Discussion)\n- **Stage 2 (4 Days for Screened-in Candidates)**:\n  - Psychology Tests: TAT (Thematic Apperception), WAT (Word Association), SRT (Situation Reaction), SD (Self Description)\n  - GTO Tasks: Group Discussion, Progressive Group Task (PGT), Half Group Task (HGT), Individual Obstacles, Command Task\n  - Personal Interview by Interviewing Officer (IO)\n  - Final Board Conference with panel of assessors\n\n### Step 3: Medical Board Examination\n- 6-7 day comprehensive medical evaluation at designated Military Hospitals (specialized standards for Army, Navy, and Air Force including eyesight, audiometry, surgical, and dental points).\n\n## 4. Merit List Formulation\n- Total score out of 1800 marks (900 Written + 900 SSB).\n- Final All India Rank (AIR) list published by UPSC for final academy joining letters.`,
        tags: ['NDA', 'DefenceStudies', 'SSB', 'UPSC', 'ExamPrep', 'VisionNote'],
        lastModified: '2026-09-04T12:59:41.998Z',
        isPinned: true,
        source: 'visionnote',
        doubtsDetected: [
            'What are the minimum qualifying sectional cut-off marks for the Mathematics paper in NDA written examination?',
            'How does the 5-day SSB interview evaluate the 15 Officer-Like Qualities (OLQs)?'
        ],
        summary: 'Comprehensive breakdown of the 3-stage National Defence Academy selection: Written Examination (Maths & GAT), 5-day SSB interview (PPDT, OIR, GTO), and medical board.',
        keyTakeaways: [
            'NDA gives direct officer cadet commission, bypassing decades needed to rise from lower ranks.',
            'Written examination consists of 2 papers (Maths 300 marks + GAT 600 marks) totaling 900 marks.',
            'SSB is a 5-day assessment measuring Officer-Like Qualities through Psychological, GTO, and Interview tasks.',
            'Final Merit List is compiled out of 1800 aggregate marks.'
        ]
    },
    {
        id: 'd27fec75-e928-4a56-ad11-2300a0faf566',
        studentId: 'student-1',
        subjectId: 'subj-phy',
        title: 'Physics 101: Projectile Motion & 2D Kinematics Decomposition',
        content: `# Projectile Motion & 2D Kinematics Decomposition\n\n## 1. Classical Galileo Trajectory Axiom\nA projectile moving under uniform gravity experiences independent orthogonal motions:\n$$\\vec{r}(t) = \\left( v_0 \\cos\\theta \\cdot t \\right) \\hat{i} + \\left( v_0 \\sin\\theta \\cdot t - \\frac{1}{2}g t^2 \\right) \\hat{j}$$\n\n## 2. Invariant Trajectory Parabola Equation\nEliminating time $t = \\frac{x}{v_0 \\cos\\theta}$:\n$$y = x \\tan\\theta - \\frac{g x^2}{2 v_0^2 \\cos^2\\theta} = x \\tan\\theta \\left(1 - \\frac{x}{R}\\right)$$\nWhere Range $R = \\frac{v_0^2 \\sin(2\\theta)}{g}$.\n\n## 3. Time of Flight & Maximum Height\n$$T = \\frac{2 v_0 \\sin\\theta}{g}, \\quad H_{max} = \\frac{v_0^2 \\sin^2\\theta}{2g}$$\nFor maximum range on flat terrain, $\\theta = 45^\\circ$.`,
        tags: ['Physics', 'Kinematics', 'ProjectileMotion', 'Galileo', '2DMotion', 'VisionNote'],
        lastModified: '2026-09-04T12:25:43.105Z',
        isPinned: true,
        source: 'visionnote',
        doubtsDetected: [
            'How does air resistance distort the ideal parabolic trajectory into an asymmetrical curve?',
            'Why is acceleration in the horizontal x-direction strictly zero in ideal projectile motion?'
        ],
        summary: 'Kinematic decomposition of 2D projectile trajectory, Cartesian parabola formulation, range maximization, and flight time derivations.',
        keyTakeaways: [
            'Horizontal velocity component remains invariant throughout flight in the absence of air drag.',
            'Trajectory equation in terms of Range is y = x tan(theta) * (1 - x/R).'
        ]
    }
];
exports.FAKE_QUESTION_BANKS = [
    {
        id: 'qb-phy-01',
        subjectId: 'subj-phy',
        title: 'Mechanics, Thermodynamics & Laws of Motion Question Bank',
        description: 'Faculty-curated diagnostic and competition questions for Physics 101 prepared by Dr. Rajesh Kulkarni.',
        teacherId: 'teacher-phy',
        teacherName: 'Dr. Rajesh Kulkarni',
        uploadedAt: '2026-09-03T14:30:00.000Z',
        questionsCount: 4,
        questions: [
            {
                id: 'q-phy-1',
                question: 'A mass m moves on a horizontal table with friction coefficient μ. If an external horizontal force F = 2μmg is applied, what is the acceleration of the block?',
                options: ['g', '2g', 'μg', '0.5g'],
                correctIndex: 0,
                explanation: 'F_net = F - f_k = 2μmg - μmg = μmg. By Newton second law, a = F_net / m = μmg / m = μg? Wait: if F = 2μmg and f_k = μmg, then a = (2μmg - μmg)/m = μg. But if μ=1, a=g. Exactly: a = μg.',
                topic: 'Newton Laws & Friction',
                difficulty: 'moderate',
                source: 'teacher_question_bank',
                questionBankTitle: 'Mechanics, Thermodynamics & Laws of Motion',
                teacherName: 'Dr. Rajesh Kulkarni'
            },
            {
                id: 'q-phy-2',
                question: 'Under what condition is the mechanical energy of a multi-body system strictly conserved?',
                options: [
                    'When all internal and external forces doing work are conservative.',
                    'Whenever the system is in an inertial frame regardless of friction.',
                    'Only when the total linear momentum is exactly zero.',
                    'Whenever the acceleration of the center of mass is zero.'
                ],
                correctIndex: 0,
                explanation: 'Mechanical energy (K + U) is strictly conserved if and only if all work done by non-conservative forces (like friction or drag) is zero.',
                topic: 'Work, Energy & Power',
                difficulty: 'easy',
                source: 'teacher_question_bank',
                questionBankTitle: 'Mechanics, Thermodynamics & Laws of Motion',
                teacherName: 'Dr. Rajesh Kulkarni'
            },
            {
                id: 'q-phy-3',
                question: 'A Carnot heat engine operates between reservoirs at 600 K and 300 K. What is the maximum theoretical efficiency?',
                options: ['50%', '75%', '33.3%', '100%'],
                correctIndex: 0,
                explanation: 'Efficiency eta = 1 - (T_cold / T_hot) = 1 - (300 / 600) = 0.50 (50%).',
                topic: 'Carnot Heat Engines',
                difficulty: 'easy',
                source: 'teacher_question_bank',
                questionBankTitle: 'Mechanics, Thermodynamics & Laws of Motion',
                teacherName: 'Dr. Rajesh Kulkarni'
            },
            {
                id: 'q-phy-4',
                question: 'According to Faraday and Lenz laws, what causes an induced electromotive force (EMF) in a closed loop?',
                options: [
                    'A time rate of change of magnetic flux through the surface bounded by the loop.',
                    'A constant electrostatic potential difference across the boundary wire.',
                    'The absolute magnitude of the ambient magnetic field regardless of time variation.',
                    'Zero net charge inside the bounding Gaussian surface.'
                ],
                correctIndex: 0,
                explanation: 'Faraday law states EMF = -d(Phi_B)/dt, meaning EMF arises specifically from the time variation of magnetic flux.',
                topic: 'Electromagnetic Induction',
                difficulty: 'moderate',
                source: 'teacher_question_bank',
                questionBankTitle: 'Mechanics, Thermodynamics & Laws of Motion',
                teacherName: 'Dr. Rajesh Kulkarni'
            }
        ]
    },
    {
        id: 'qb-che-01',
        subjectId: 'subj-che',
        title: 'Physical & Organic Reaction Mechanisms Master Bank',
        description: 'Curated university assessment bank for Chemistry 101 by Dr. Ananya Sen.',
        teacherId: 'teacher-che',
        teacherName: 'Dr. Ananya Sen',
        uploadedAt: '2026-09-02T16:00:00.000Z',
        questionsCount: 4,
        questions: [
            {
                id: 'q-che-1',
                question: 'For a reaction with Delta H > 0 and Delta S > 0, at what temperatures is the reaction spontaneous at constant pressure?',
                options: [
                    'Only at high temperatures where T > Delta H / Delta S.',
                    'At all temperatures without exception.',
                    'Only at low temperatures where T < Delta H / Delta S.',
                    'The reaction can never be spontaneous.'
                ],
                correctIndex: 0,
                explanation: 'Delta G = Delta H - T*Delta S. For Delta G < 0 when both are positive, T*Delta S must outweigh Delta H, which occurs when T > Delta H / Delta S.',
                topic: 'Gibbs Free Energy',
                difficulty: 'moderate',
                source: 'teacher_question_bank',
                questionBankTitle: 'Physical & Organic Reaction Mechanisms',
                teacherName: 'Dr. Ananya Sen'
            },
            {
                id: 'q-che-2',
                question: 'Which structural feature is mandatory for an aldehyde to undergo the base-catalyzed Aldol Condensation?',
                options: [
                    'At least one alpha-hydrogen atom adjacent to the carbonyl carbon.',
                    'An aromatic ring directly attached to the carbonyl group.',
                    'Absence of any alpha-hydrogens to allow disproportionation.',
                    'Presence of a quaternary nitrogen atom.'
                ],
                correctIndex: 0,
                explanation: 'Aldol condensation requires removal of an acidic alpha-hydrogen by base to form an enolate ion intermediate.',
                topic: 'Aldol Condensation',
                difficulty: 'moderate',
                source: 'teacher_question_bank',
                questionBankTitle: 'Physical & Organic Reaction Mechanisms',
                teacherName: 'Dr. Ananya Sen'
            },
            {
                id: 'q-che-3',
                question: 'What is the effect of doubling the concentration of reactant [A] on a second-order reaction Rate = k[A]^2?',
                options: [
                    'The rate quadruples (increases by a factor of 4).',
                    'The rate doubles.',
                    'The rate increases by a factor of 8.',
                    'The rate remains unchanged.'
                ],
                correctIndex: 0,
                explanation: 'Rate_2 = k(2[A])^2 = 4 * k[A]^2 = 4 * Rate_1.',
                topic: 'Chemical Kinetics',
                difficulty: 'easy',
                source: 'teacher_question_bank',
                questionBankTitle: 'Physical & Organic Reaction Mechanisms',
                teacherName: 'Dr. Ananya Sen'
            },
            {
                id: 'q-che-4',
                question: 'What is the geometry of the SF6 molecule according to VSEPR theory?',
                options: [
                    'Octahedral (sp3d2 hybridization)',
                    'Trigonal bipyramidal (sp3d hybridization)',
                    'Tetrahedral (sp3 hybridization)',
                    'Square planar'
                ],
                correctIndex: 0,
                explanation: 'SF6 has 6 bonding pairs and 0 lone pairs around sulfur, corresponding to an octahedral electron and molecular geometry.',
                topic: 'VSEPR & Chemical Bonding',
                difficulty: 'easy',
                source: 'teacher_question_bank',
                questionBankTitle: 'Physical & Organic Reaction Mechanisms',
                teacherName: 'Dr. Ananya Sen'
            }
        ]
    },
    {
        id: 'qb-mat-01',
        subjectId: 'subj-mat',
        title: 'Calculus, Definite Integrals & 3D Geometry Question Bank',
        description: 'Departmental question bank compiled by Prof. Vikramaditya Roy.',
        teacherId: 'teacher-mat',
        teacherName: 'Prof. Vikramaditya Roy',
        uploadedAt: '2026-09-01T11:20:00.000Z',
        questionsCount: 4,
        questions: [
            {
                id: 'q-mat-1',
                question: 'Evaluate I = integral from 0 to pi/2 of [sin(x) / (sin(x) + cos(x))] dx using the King Property.',
                options: ['pi / 4', 'pi / 2', '1', 'pi'],
                correctIndex: 0,
                explanation: 'By King property: I = integral of cos(x)/(cos(x)+sin(x)) dx. Adding the two: 2I = integral from 0 to pi/2 of 1 dx = pi/2 ==> I = pi/4.',
                topic: 'Definite Integrals & King Property',
                difficulty: 'moderate',
                source: 'teacher_question_bank',
                questionBankTitle: 'Calculus, Definite Integrals & 3D Geometry',
                teacherName: 'Prof. Vikramaditya Roy'
            },
            {
                id: 'q-mat-2',
                question: 'What is the geometrical significance of the magnitude of the vector cross product |a x b|?',
                options: [
                    'The area of the parallelogram formed by vectors a and b.',
                    'The volume of the rectangular prism bounded by a and b.',
                    'The length of projection of a onto b.',
                    'The cosine of the angle between a and b.'
                ],
                correctIndex: 0,
                explanation: '|a x b| = |a||b|sin(theta), which corresponds geometrically to the area of the parallelogram spanned by vectors a and b.',
                topic: 'Vector Cross Product',
                difficulty: 'easy',
                source: 'teacher_question_bank',
                questionBankTitle: 'Calculus, Definite Integrals & 3D Geometry',
                teacherName: 'Prof. Vikramaditya Roy'
            },
            {
                id: 'q-mat-3',
                question: 'In integration by parts int u dv = uv - int v du, which category in the LIATE rule takes highest priority to be chosen as u?',
                options: [
                    'Logarithmic functions',
                    'Algebraic functions',
                    'Trigonometric functions',
                    'Exponential functions'
                ],
                correctIndex: 0,
                explanation: 'LIATE priority order: L (Logarithmic) > I (Inverse Trig) > A (Algebraic) > T (Trigonometric) > E (Exponential).',
                topic: 'Integration by Parts',
                difficulty: 'easy',
                source: 'teacher_question_bank',
                questionBankTitle: 'Calculus, Definite Integrals & 3D Geometry',
                teacherName: 'Prof. Vikramaditya Roy'
            },
            {
                id: 'q-mat-4',
                question: 'What is the limit of sin(x)/x as x approaches 0?',
                options: ['1', '0', 'Infinity', 'Undefined'],
                correctIndex: 0,
                explanation: 'lim_{x->0} sin(x)/x = 1 by L-Hopital rule or geometric squeeze theorem comparison.',
                topic: 'Limits & Continuity',
                difficulty: 'easy',
                source: 'teacher_question_bank',
                questionBankTitle: 'Calculus, Definite Integrals & 3D Geometry',
                teacherName: 'Prof. Vikramaditya Roy'
            }
        ]
    },
    {
        id: 'qb-misc-01',
        subjectId: 'subj-misc',
        title: 'General Engineering & Research Methodology Question Bank',
        description: 'Interdisciplinary and research questions for all student cohorts.',
        teacherId: 'teacher-phy',
        teacherName: 'Dr. Rajesh Kulkarni',
        uploadedAt: '2026-09-02T09:00:00.000Z',
        questionsCount: 2,
        questions: [
            {
                id: 'q-misc-1',
                question: 'When combining independent experimental measurements in quadrature, how is total variance sigma_total^2 calculated?',
                options: [
                    'Sum of individual variances: sigma_1^2 + sigma_2^2 + ...',
                    'Simple arithmetic sum of standard deviations: sigma_1 + sigma_2',
                    'Difference of squares: sigma_1^2 - sigma_2^2',
                    'Product of standard deviations: sigma_1 * sigma_2'
                ],
                correctIndex: 0,
                explanation: 'Independent Gaussian errors add in quadrature: sigma_total^2 = sigma_1^2 + sigma_2^2 + ...',
                topic: 'Error Propagation',
                difficulty: 'moderate',
                source: 'teacher_question_bank',
                questionBankTitle: 'General Engineering & Research Methodology',
                teacherName: 'Dr. Rajesh Kulkarni'
            },
            {
                id: 'q-misc-2',
                question: 'In engineering ethics, what is the primary obligation of a licensed professional engineer?',
                options: [
                    'To hold paramount the safety, health, and welfare of the public.',
                    'To maximize company profitability above all design considerations.',
                    'To keep all technical product defects confidential without exception.',
                    'To disregard environmental regulatory standards.'
                ],
                correctIndex: 0,
                explanation: 'The paramount ethical canon of engineering is public safety, health, and welfare.',
                topic: 'Engineering Ethics',
                difficulty: 'easy',
                source: 'teacher_question_bank',
                questionBankTitle: 'General Engineering & Research Methodology',
                teacherName: 'Dr. Rajesh Kulkarni'
            }
        ]
    }
];
exports.FAKE_ASSIGNMENTS = [
    {
        id: 'assign-phy-1',
        subjectId: 'subj-phy',
        title: 'Problem Set 1: Friction & Work-Energy Conservation',
        description: 'Solve problems on static/kinetic friction on inclined planes and prove the work-energy theorem for non-conservative paths.',
        richTextInstructions: 'Submit clear handwritten derivations or typed solutions. Show all free-body diagrams and step-by-step vector projections.',
        points: 100,
        createdDate: '2026-09-01',
        dueDate: '2026-09-15',
        strictDueDate: true,
        attachments: ['https://arxiv.org/abs/physics/0101'],
        rubric: [
            { criterion: 'FBD & Equation of Motion Formulation', maxPoints: 40, description: 'Accurate free-body diagrams with all vector components' },
            { criterion: 'Work-Energy Theorem Application & Proof', maxPoints: 40, description: 'Rigorous derivation of non-conservative energy changes' },
            { criterion: 'Numerical Accuracy and Dimensional Units', maxPoints: 20, description: 'Correct SI units and significant figures' }
        ],
        tags: ['Mechanics', 'Friction', 'Work-Energy'],
        submissionCount: 4
    },
    {
        id: 'assign-che-1',
        subjectId: 'subj-che',
        title: 'Lab Report 1: Gibbs Free Energy & Equilibrium Constant',
        description: 'Analyze spectrophotometric absorbance data to compute Delta G and K_eq at three different temperatures.',
        richTextInstructions: 'Include regression plots of ln(K_eq) vs 1/T (van t Hoff plot) with calculated Delta H and Delta S values.',
        points: 50,
        createdDate: '2026-09-02',
        dueDate: '2026-09-18',
        strictDueDate: false,
        attachments: [],
        rubric: [
            { criterion: 'Data Table & Standard Curve Accuracy', maxPoints: 20, description: 'Calibration curves and linearity test' },
            { criterion: 'Thermodynamic Parameter Calculation', maxPoints: 20, description: 'Accurate enthalpy and entropy extraction' },
            { criterion: 'Error Bounds & Discussion', maxPoints: 10, description: 'Discussion of temperature probe error margins' }
        ],
        tags: ['Thermodynamics', 'Equilibrium', 'Gibbs Energy'],
        submissionCount: 5
    },
    {
        id: 'assign-mat-1',
        subjectId: 'subj-mat',
        title: 'Calculus Assignment 1: Definite Integrals & King Property',
        description: 'Complete proofs for King property variations and calculate enclosed area between intersecting paraboloids.',
        richTextInstructions: 'Provide rigorous proofs without skipping algebraic substitution steps.',
        points: 100,
        createdDate: '2026-09-03',
        dueDate: '2026-09-20',
        strictDueDate: true,
        attachments: [],
        rubric: [
            { criterion: 'Symmetry Lemma Proof', maxPoints: 50, description: 'Proof of integral f(a+b-x) symmetry identity' },
            { criterion: 'Area Integral Evaluation', maxPoints: 50, description: 'Accurate closed-form calculation of intersection domain' }
        ],
        tags: ['Calculus', 'Definite Integrals', 'King Property'],
        submissionCount: 6
    },
    {
        id: 'assign-misc-1',
        subjectId: 'subj-misc',
        title: 'Research Methodology Case Study: Error Analysis in Sensor Networks',
        description: 'Derive error propagation bounds for IoT sensor temperature readings and submit Python simulation script.',
        richTextInstructions: 'Submit both mathematical derivation and reproducible code script.',
        points: 50,
        createdDate: '2026-09-04',
        dueDate: '2026-09-25',
        strictDueDate: false,
        attachments: [],
        rubric: [
            { criterion: 'Error Propagation Formulation', maxPoints: 25, description: 'Taylor series first-order uncertainty propagation' },
            { criterion: 'Simulation Convergence', maxPoints: 25, description: 'Monte Carlo convergence with 10,000 runs' }
        ],
        tags: ['Research', 'Error Analysis', 'Scientific Computing'],
        submissionCount: 2
    }
];
exports.FAKE_TIMELINES = [
    {
        id: 'time-phy-1',
        subjectId: 'subj-phy',
        title: 'Unit Test 1: Newtonian Mechanics & Friction',
        type: 'exam',
        date: '2026-09-22',
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        location: 'Lecture Hall 101',
        description: 'Covers kinematics, laws of motion, friction bounds, and work-energy theorem.',
        topicsCovered: ['Newton Laws', 'Friction', 'Work-Energy'],
        weightagePercent: 15,
        status: 'upcoming'
    },
    {
        id: 'time-che-1',
        subjectId: 'subj-che',
        title: 'Mid-Semester Examination: Thermodynamics & Kinetics',
        type: 'exam',
        date: '2026-09-28',
        startTime: '02:00 PM',
        endTime: '04:00 PM',
        location: 'Science Auditorium',
        description: 'Covers Gibbs free energy, Nernst equation, reaction mechanisms, and kinetics.',
        topicsCovered: ['Thermodynamics', 'Electrochemistry', 'Reaction Kinetics'],
        weightagePercent: 25,
        status: 'upcoming'
    },
    {
        id: 'time-mat-1',
        subjectId: 'subj-mat',
        title: 'Calculus Diagnostic Quiz: Integration Techniques',
        type: 'quiz',
        date: '2026-09-16',
        startTime: '11:00 AM',
        endTime: '11:45 AM',
        location: 'Ramanujan Lab M-101',
        description: 'Speed test on integration by parts and King property applications.',
        topicsCovered: ['Integration by Parts', 'King Property', 'Partial Fractions'],
        weightagePercent: 10,
        status: 'upcoming'
    }
];
exports.FAKE_RESOURCES = [
    {
        id: 'res-phy-1',
        subjectId: 'subj-phy',
        title: 'Halliday, Resnick & Walker: Fundamentals of Physics (12th Ed)',
        category: 'Textbook',
        author: 'Jearl Walker, David Halliday',
        url: 'https://www.wiley.com/en-us/Fundamentals+of+Physics-p-9781119773474',
        description: 'Standard foundational textbook covering mechanics, gravitation, oscillations, and thermodynamics.',
        keyTopics: ['Mechanics', 'Friction', 'Work-Energy'],
        dateAdded: '2026-08-15'
    },
    {
        id: 'res-che-1',
        subjectId: 'subj-che',
        title: 'Atkins Physical Chemistry (11th Ed)',
        category: 'Textbook',
        author: 'Peter Atkins, Julio de Paula',
        url: 'https://global.oup.com/academic/product/atkins-physical-chemistry-9780198769865',
        description: 'Comprehensive physical chemistry reference for quantum mechanics, thermodynamics, and kinetics.',
        keyTopics: ['Thermodynamics', 'Gibbs Free Energy', 'Chemical Kinetics'],
        dateAdded: '2026-08-15'
    },
    {
        id: 'res-mat-1',
        subjectId: 'subj-mat',
        title: 'Thomas Calculus (14th Ed)',
        category: 'Textbook',
        author: 'George B. Thomas, Maurice D. Weir',
        url: 'https://www.pearson.com/en-us/subject-catalog/p/thomas-calculus/P200000003328',
        description: 'Authoritative calculus reference for multivariable differentiation, definite integrals, and vector geometry.',
        keyTopics: ['Definite Integrals', 'King Property', 'Vectors'],
        dateAdded: '2026-08-15'
    }
];
exports.FAKE_ANALYTICS = {
    'subj-phy': {
        subjectId: 'subj-phy',
        subjectName: 'Physics',
        totalStudents: 7,
        classAverage: 88.5,
        submissionRate: 96.0,
        atRiskStudentsCount: 1,
        gradeDistribution: [
            { range: '90-100% (A)', count: 3, percentage: 42.9 },
            { range: '80-89% (B)', count: 3, percentage: 42.9 },
            { range: '70-79% (C)', count: 1, percentage: 14.2 },
            { range: '<70%', count: 0, percentage: 0.0 }
        ],
        weakTopics: [
            {
                topic: 'Rotational Kinetic Energy on Incline Planes',
                errorRate: 34,
                averageScore: 71.0,
                affectedStudents: 2,
                recommendedRemediation: 'Provide scaffolded step-by-step vector derivations linking torque and friction.',
                urgency: 'high'
            }
        ],
        trends: [
            { week: 'Week 1', avgScore: 88.0, submissionRate: 100.0, activeCount: 7 },
            { week: 'Week 2', avgScore: 89.0, submissionRate: 95.0, activeCount: 7 }
        ],
        aiExecutiveSummary: 'Cohort shows stellar mechanics foundations. High attendance in problem-solving recitations.',
        keyActionItems: [
            'Conduct interactive lab demonstration on rotational moment of inertia.',
            'Assign practice problem set on inclined plane rolling.'
        ],
        lastGenerated: '2026-09-04T12:00:00.000Z'
    },
    'subj-che': {
        subjectId: 'subj-che',
        subjectName: 'Chemistry',
        totalStudents: 7,
        classAverage: 87.2,
        submissionRate: 94.5,
        atRiskStudentsCount: 1,
        gradeDistribution: [
            { range: '90-100% (A)', count: 3, percentage: 42.9 },
            { range: '80-89% (B)', count: 3, percentage: 42.9 },
            { range: '70-79% (C)', count: 1, percentage: 14.2 },
            { range: '<70%', count: 0, percentage: 0.0 }
        ],
        weakTopics: [
            {
                topic: 'Aldol vs Cannizzaro Reaction Conditions',
                errorRate: 28,
                averageScore: 74.0,
                affectedStudents: 2,
                recommendedRemediation: 'Review alpha-hydrogen acidity and resonance stabilization of enolate ions.',
                urgency: 'medium'
            }
        ],
        trends: [
            { week: 'Week 1', avgScore: 86.5, submissionRate: 96.0, activeCount: 7 },
            { week: 'Week 2', avgScore: 87.2, submissionRate: 94.5, activeCount: 7 }
        ],
        aiExecutiveSummary: 'Strong mastery of chemical kinetics and electrochemistry. Organic chemistry review scheduled.',
        keyActionItems: ['Review Nernst equation concentration cells.'],
        lastGenerated: '2026-09-04T12:00:00.000Z'
    },
    'subj-mat': {
        subjectId: 'subj-mat',
        subjectName: 'Mathematics',
        totalStudents: 7,
        classAverage: 90.1,
        submissionRate: 98.0,
        atRiskStudentsCount: 0,
        gradeDistribution: [
            { range: '90-100% (A)', count: 5, percentage: 71.4 },
            { range: '80-89% (B)', count: 2, percentage: 28.6 },
            { range: '<80%', count: 0, percentage: 0.0 }
        ],
        weakTopics: [
            {
                topic: '3D Cartesian Plane Normal Vectors',
                errorRate: 22,
                averageScore: 78.5,
                affectedStudents: 1,
                recommendedRemediation: 'Visualize vector cross product orthogonality in 3D coordinate space.',
                urgency: 'low'
            }
        ],
        trends: [
            { week: 'Week 1', avgScore: 89.5, submissionRate: 98.0, activeCount: 7 },
            { week: 'Week 2', avgScore: 90.1, submissionRate: 98.0, activeCount: 7 }
        ],
        aiExecutiveSummary: 'Outstanding mathematical rigor across the cohort. Zero at-risk students.',
        keyActionItems: ['Release challenge Olympiad problem set for Grade A+ students.'],
        lastGenerated: '2026-09-04T12:00:00.000Z'
    },
    'subj-misc': {
        subjectId: 'subj-misc',
        subjectName: 'Miscellaneous & General Notes',
        totalStudents: 7,
        classAverage: 91.0,
        submissionRate: 97.0,
        atRiskStudentsCount: 0,
        gradeDistribution: [
            { range: '90-100% (A)', count: 5, percentage: 71.4 },
            { range: '80-89% (B)', count: 2, percentage: 28.6 }
        ],
        weakTopics: [],
        trends: [
            { week: 'Week 1', avgScore: 91.0, submissionRate: 97.0, activeCount: 7 }
        ],
        aiExecutiveSummary: 'Interdisciplinary projects and scientific computing practicals show excellent student engagement.',
        keyActionItems: ['Finalize Python visualization lab submissions.'],
        lastGenerated: '2026-09-04T12:00:00.000Z'
    }
};
