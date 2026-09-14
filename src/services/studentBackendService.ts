import {
  TutorPersona,
  StudentTaskItem,
  PluginIntegration,
  StudentLectureCard,
  QuizQuestionItem,
  StudentQuizSubmission
} from '../types';

// =======================================================
// INITIAL PRE-SEEDED DATASETS (OFFLINE / PERSISTENT STORAGE)
// =======================================================

export const INITIAL_TUTOR_PERSONAS: TutorPersona[] = [
  {
    id: 'feynman',
    name: 'Richard Feynman',
    title: 'Nobel Laureate & The Great Explainer',
    tagline: 'First principles, simple everyday analogies, and zero unnecessary jargon.',
    avatar: '⚛️',
    styleDescription: 'Breaks down complex derivations into playful intuition, waterfalls, gears, and thought experiments.',
    badgeText: 'Intuitive First-Principles',
    accentColor: 'from-amber-500 to-orange-600',
    greetingMessage: `Hey there! Feynman here. Don't worry about memorizing bloated formulas right now. Tell me what concept is bothering you, and let's rebuild it from scratch using plain English and a simple mechanical picture!`,
    systemPrompt: `You are Richard Feynman, the legendary theoretical physicist and educator. Your approach is the "Feynman Technique":
1. Never hide behind mathematical jargon; explain concepts as if speaking to a bright 12-year-old first, then build up rigor.
2. Use vivid physical analogies (water flowing, balls bouncing, energy banks, friction taxes).
3. Express excitement about how nature actually works.
4. If the student has made a mistake, show why that mistake is a natural trap and how to look at it differently.`
  },
  {
    id: 'alakh_pandey',
    name: 'Alakh Pandey (Physics Wallah)',
    title: 'High-Energy Concept Booster & Mentor',
    tagline: 'Hello Bachhoooon! Relatable Indian college context, Hinglish motivation, and memorization tricks.',
    avatar: '🔥',
    styleDescription: 'Unstoppable energy, memorable memory tricks, emotional encouragement, and exam-cracking confidence.',
    badgeText: 'High-Energy & Hinglish',
    accentColor: 'from-rose-500 to-red-600',
    greetingMessage: `Hello Bachhoooon! Kya haal chaal? Kaisi chal rahi hai padhai? Bilkul tension nahi lena! Koi bhi concept tough nahi hota, bas samajhne ka nazariya chahiye. Batao aaj kaunsa topic udaana hai!`,
    systemPrompt: `You are Alakh Pandey (founder of Physics Wallah). Your teaching style is legendary:
1. Start conversations with warmth and high enthusiasm ("Hello Bachhoooon!", "Bilkul ghabrana nahi hai!").
2. Mix conversational English with natural Hindi/Hinglish idioms and phrases to make students feel comfortable and connected.
3. Provide relatable desi analogies (chai tapri, local train, cricket, everyday Indian life).
4. Give quick mnemonic hacks ("Yeh trick yaad rakhna, exam me 2 second me answer aayega").
5. Motivate the student constantly—they are capable of topping their university exam!`
  },
  {
    id: 'niti_garg',
    name: 'Prof. Niti Garg',
    title: 'University Examination Rubric Master',
    tagline: 'Step-by-step marking rubrics, standard derivations, and precise exam definitions.',
    avatar: '📐',
    styleDescription: 'Focuses on what examiners look for on answer sheets: numbered assumptions, boxed final answers, and exact units.',
    badgeText: 'Marking Rubric Precision',
    accentColor: 'from-purple-500 to-indigo-600',
    greetingMessage: `Good day! I am Prof. Niti Garg. Let us approach this topic methodically. University examinations test your structure as much as your knowledge. Let us master the exact step-by-step proof so you secure full 10/10 marks.`,
    systemPrompt: `You are Prof. Niti Garg, a senior university professor and curriculum evaluator.
1. Provide highly structured, academically precise responses.
2. Break answers down into: (a) Standard Definition, (b) Governing Equations with Units, (c) Key Assumptions, (d) Step-by-Step Mathematical Derivation, (e) Common Examination Traps.
3. Point out where students typically lose 1-2 marks in university papers (e.g. missing units, wrong boundary conditions, unstated assumptions).`
  },
  {
    id: 'socrates',
    name: 'Socrates',
    title: 'The Guided Inquirer',
    tagline: 'Never gives you the answer directly—asks the one question that helps you discover it yourself.',
    avatar: '🏛️',
    styleDescription: 'Prompts you with thought-provoking counter-questions to reveal hidden contradictions.',
    badgeText: 'Socratic Inquiry',
    accentColor: 'from-emerald-500 to-teal-600',
    greetingMessage: `Greetings, seeker. What truth do you wish to examine today? Tell me what you currently believe about this problem, and let us dissect it together.`,
    systemPrompt: `You are Socrates. You follow the Socratic Method:
1. Do not simply hand over complete formulas. Ask guiding questions that lead the student to deduce the answer themselves.
2. Highlight underlying premises and contradictions gently.
3. Validate when the student takes a correct deductive step.`
  }
];

export const INITIAL_PLUGINS: PluginIntegration[] = [
  {
    id: 'plugin-classroom',
    type: 'google_classroom',
    name: 'Google Classroom Auto-Sync',
    description: 'Syncs upcoming assignments, class announcements, and attachments directly into your To-Do list.',
    icon: 'classroom',
    connected: true,
    autoSyncTasks: true,
    lastSyncedAt: 'Today at 02:15 PM',
    itemCountSynced: 6
  },
  {
    id: 'plugin-calendar',
    type: 'google_calendar',
    name: 'Google Calendar Timetable Sync',
    description: 'Syncs university timetable lectures, lab practicals, and mid-term exam milestones with date reminders.',
    icon: 'calendar',
    connected: true,
    autoSyncTasks: true,
    lastSyncedAt: 'Today at 08:30 AM',
    itemCountSynced: 14
  },
  {
    id: 'plugin-gmail',
    type: 'gmail',
    name: 'Institutional Gmail Parser',
    description: 'Scans university emails for professor notices, deadline extensions, and emergency room relocations.',
    icon: 'gmail',
    connected: false,
    autoSyncTasks: false,
    lastSyncedAt: 'Never',
    itemCountSynced: 0
  },
  {
    id: 'plugin-bmu',
    type: 'bmu_portal',
    name: 'University ERP / Attendance Portal',
    description: 'Syncs course attendance percentage and internal mid-term assessment marks automatically.',
    icon: 'portal',
    connected: true,
    autoSyncTasks: true,
    lastSyncedAt: 'Yesterday at 06:45 PM',
    itemCountSynced: 5
  }
];

export const INITIAL_TASKS: StudentTaskItem[] = [
  {
    id: 'task-1',
    title: 'Complete ES-101 Lab Report on Water Hardness (EDTA Titration)',
    description: 'Include burette readings, blank titration calculation, and standard error graph.',
    priority: 'urgent',
    categoryTag: 'Lab Record',
    dueDate: new Date().toISOString().split('T')[0], // Today
    dueTime: '05:00 PM',
    completed: false,
    subjectCode: 'ES-101L',
    source: 'google_classroom',
    pomodoroSessions: 2,
    subtasks: [
      { id: 'st-1', text: 'Plot EDTA volume vs hardness curve', done: true },
      { id: 'st-2', text: 'Calculate temporary vs permanent hardness in ppm', done: false },
      { id: 'st-3', text: 'Get teacher signature on observation sheet', done: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'ME-102 Problem Sheet 4: Carnot & Rankine Cycle Numerical Drills',
    description: 'Solve questions 4, 7, and 9 from Chapter 4 on Clausius Inequality and Entropy Balance.',
    priority: 'high',
    categoryTag: 'Assignment',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    dueTime: '11:59 PM',
    completed: false,
    subjectCode: 'ME-102',
    source: 'google_classroom',
    pomodoroSessions: 3,
    subtasks: [
      { id: 'st-4', text: 'Review T-s diagram for superheated steam', done: false },
      { id: 'st-5', text: 'Solve problem 7 on reversible heat engine', done: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: 'Revise Atmospheric Inversion & Gaussian Dispersion Models',
    description: 'Focus on ground reflection factor and effective chimney height formula.',
    priority: 'medium',
    categoryTag: 'Revision',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    dueTime: '08:00 PM',
    completed: false,
    subjectCode: 'ES-101',
    source: 'manual',
    pomodoroSessions: 1,
    subtasks: [
      { id: 'st-6', text: 'Memorize Gaussian dispersion equation', done: false },
      { id: 'st-7', text: 'Take practice diagnostic quiz on EduSync', done: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-4',
    title: 'Mathematics-I: Partial Differentiation & Euler Theorem Proof',
    description: 'Review homogenous functions proof for internal assessment exam.',
    priority: 'low',
    categoryTag: 'Exam Prep',
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    completed: true,
    subjectCode: 'MA-101',
    source: 'manual',
    pomodoroSessions: 2,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_TODAY_CLASSES = [
  {
    id: 'slot-1',
    period: '09:00 - 10:00 AM',
    subjectCode: 'ES-101',
    subjectName: 'Environmental Studies & Sustainability',
    topic: 'Atmospheric Thermal Inversion & Plume Types',
    room: 'Science Block C - Room 304',
    teacherName: 'Dr. Sanmitra Bhattacharya',
    status: 'completed',
    hasNotes: true
  },
  {
    id: 'slot-2',
    period: '10:15 - 11:15 AM',
    subjectCode: 'ME-102',
    subjectName: 'Engineering Thermodynamics',
    topic: 'Second Law Clausius Inequality & Entropy Balance',
    room: 'Mechanical Block A - Room 102',
    teacherName: 'Prof. Ananya Sen',
    status: 'ongoing',
    hasNotes: true
  },
  {
    id: 'slot-3',
    period: '01:30 - 02:30 PM',
    subjectCode: 'MA-101',
    subjectName: 'Engineering Mathematics I',
    topic: 'Taylor & Maclaurin Series for Multivariable Functions',
    room: 'Lecture Hall 2',
    teacherName: 'Dr. Vikram Malhotra',
    status: 'upcoming',
    hasNotes: true
  },
  {
    id: 'slot-4',
    period: '03:00 - 04:30 PM',
    subjectCode: 'ES-101L',
    subjectName: 'Environmental Systems Lab',
    topic: 'BOD5 Dissolved Oxygen Analysis Lab Protocol',
    room: 'Environmental Chemistry Lab 1',
    teacherName: 'Dr. Sanmitra Bhattacharya',
    status: 'upcoming',
    hasNotes: true
  }
];

export const INITIAL_LECTURES: StudentLectureCard[] = [
  {
    id: 'lec-101',
    lectureNumber: 14,
    subjectId: 'subj-ess',
    subjectCode: 'ES-101',
    subjectName: 'Environmental Studies',
    title: 'Atmospheric Thermal Inversion & Plume Dispersion Types',
    topicsCovered: ['Thermal Inversion', 'Radiation Inversion', 'Gaussian Plume Model', 'Ground-Level Concentration'],
    date: new Date().toISOString().split('T')[0],
    time: '09:00 - 10:00 AM',
    duration: '55 mins',
    teacherName: 'Dr. Sanmitra Bhattacharya',
    room: 'Science Block C - Room 304',
    isToday: true,
    keyFormulas: [
      { name: 'Gaussian Plume Concentration', latex: 'C(x,y,z) = \\frac{Q}{2\\pi u \\sigma_y \\sigma_z} \\exp\\left(-\\frac{y^2}{2\\sigma_y^2}\\right) \\left[\\exp\\left(-\\frac{(z-H)^2}{2\\sigma_z^2}\\right) + \\exp\\left(-\\frac{(z+H)^2}{2\\sigma_z^2}\\right)\\right]' },
      { name: 'Effective Stack Height', latex: 'H = h_s + \\Delta h' }
    ],
    notesMarkdown: `### 📌 Lecture #14: Atmospheric Thermal Inversion & Plume Dispersion

#### 1. Core Phenomenon: What is Thermal Inversion?
Under normal conditions, temperature decreases with increasing altitude in the troposphere (Normal Lapse Rate $\\approx 6.5^\\circ\\text{C/km}$).
In a **Thermal Inversion**, a layer of warm air settles over cooler air near the ground.
$$\\frac{dT}{dz} > 0 \\quad \\text{(Inversion Condition)}$$

#### 2. Meteorological Significance
- Acts like an invisible ceiling trapping particulate pollutants ($PM_{2.5}, PM_{10}$) and emissions.
- Leads to dense winter smog episodes in northern India (Delhi-NCR winter smog traps).

#### 3. Plume Dispersion Behaviors (Exam Diagram Required)
1. **Looping**: Strong superadiabatic lapse rate; high solar insolation; unstable atmosphere.
2. **Coning**: Neutral conditions; cloudy day or windy night; symmetrical spread.
3. **Fanning**: Strong inversion aloft and below; pollutants spread horizontally like a fan; very safe at ground level unless wind shifts.
4. **Lofting**: Inversion below stack, unstable above; ideal condition because pollutants cannot mix downward to human breathing zone!
5. **Fumigation**: Inversion above stack, unstable below; **most hazardous ground condition** as all pollutants are driven downward.`
  },
  {
    id: 'lec-102',
    lectureNumber: 15,
    subjectId: 'subj-eme',
    subjectCode: 'ME-102',
    subjectName: 'Engineering Thermodynamics',
    title: 'Second Law Clausius Inequality & Entropy Balance',
    topicsCovered: ['Clausius Theorem', 'Reversible vs Irreversible Cycles', 'Entropy Generation', 'T-s Diagrams'],
    date: new Date().toISOString().split('T')[0],
    time: '10:15 - 11:15 AM',
    duration: '52 mins',
    teacherName: 'Prof. Ananya Sen',
    room: 'Mechanical Block A - Room 102',
    isToday: true,
    keyFormulas: [
      { name: 'Clausius Inequality', latex: '\\oint \\frac{\\delta Q}{T} \\le 0' },
      { name: 'Entropy Balance for Closed System', latex: 'S_2 - S_1 = \\int_1^2 \\frac{\\delta Q}{T} + S_{\\text{gen}}, \\quad S_{\\text{gen}} \\ge 0' }
    ],
    notesMarkdown: `### 📌 Lecture #15: Clausius Inequality & Second Law of Thermodynamics

#### 1. Clausius Inequality Formulation
For any cyclic thermodynamic process:
$$\\oint \\frac{\\delta Q}{T} = 0 \\quad \\text{(Internally Reversible Cycle)}$$
$$\\oint \\frac{\\delta Q}{T} < 0 \\quad \\text{(Irreversible Real Cycle)}$$
$$\\oint \\frac{\\delta Q}{T} > 0 \\quad \\text{(Impossible Violation)}$$

#### 2. Physical Meaning of Entropy Generation ($S_{\\text{gen}}$)
- In real processes, friction, unrestricted expansion, and heat transfer through finite temperature difference create disorder.
- $S_{\\text{gen}}$ is **never negative**. It is zero only for idealized reversible paths.
- Energy is conserved (First Law), but the **quality of energy (exergy)** is destroyed permanently.`
  },
  {
    id: 'lec-103',
    lectureNumber: 12,
    subjectId: 'subj-ma',
    subjectCode: 'MA-101',
    subjectName: 'Engineering Mathematics',
    title: 'Taylor & Maclaurin Expansions in Multivariable Calculus',
    topicsCovered: ['Multivariable Taylor Theorem', 'Hessian Matrix', 'Local Extrema', 'Saddle Points'],
    date: '2026-09-10',
    time: '01:30 - 02:30 PM',
    duration: '50 mins',
    teacherName: 'Dr. Vikram Malhotra',
    room: 'Lecture Hall 2',
    isToday: false,
    keyFormulas: [
      { name: 'Multivariable Taylor Expansion', latex: 'f(x+h, y+k) = f(x,y) + \\left(h\\frac{\\partial}{\\partial x} + k\\frac{\\partial}{\\partial y}\\right)f + \\frac{1}{2!}\\left(h\\frac{\\partial}{\\partial x} + k\\frac{\\partial}{\\partial y}\\right)^2 f + \\dots' },
      { name: 'Discriminant Hessian', latex: 'D = f_{xx} f_{yy} - (f_{xy})^2' }
    ],
    notesMarkdown: `### 📌 Lecture #12: Multivariable Taylor Series & Hessian Matrix

#### 1. Second Derivative Test for Local Extrema
Calculate $D = f_{xx}(a,b) f_{yy}(a,b) - [f_{xy}(a,b)]^2$:
- If $D > 0$ and $f_{xx} > 0$: **Local Minimum**.
- If $D > 0$ and $f_{xx} < 0$: **Local Maximum**.
- If $D < 0$: **Saddle Point** (inflection in 3D).
- If $D = 0$: Test is inconclusive.`
  },
  {
    id: 'lec-104',
    lectureNumber: 13,
    subjectId: 'subj-ph',
    subjectCode: 'PH-101',
    subjectName: 'Engineering Physics',
    title: 'Fraunhofer Single Slit Diffraction & Resolving Power',
    topicsCovered: ['Single Slit Diffraction', 'Central Maxima Width', 'Rayleigh Criterion', 'Grating Spectrometer'],
    date: '2026-09-08',
    time: '11:30 AM - 12:30 PM',
    duration: '55 mins',
    teacherName: 'Dr. Neeraj Shukla',
    room: 'Physics Lab 3',
    isToday: false,
    keyFormulas: [
      { name: 'Condition for Minima', latex: 'a \\sin \\theta = m \\lambda, \\quad m = \\pm 1, \\pm 2, \\dots' },
      { name: 'Angular Width of Central Maxima', latex: '2\\theta = \\frac{2\\lambda}{a}' }
    ],
    notesMarkdown: `### 📌 Lecture #13: Wave Optics - Fraunhofer Diffraction

#### 1. Difference Between Interference and Diffraction
- **Interference**: Superposition of light waves from two separate coherent pinholes/slits.
- **Diffraction**: Superposition of secondary wavelets originating from different points of the *same* wavefront.`
  }
];

export const TOPIC_QUIZ_BANK: Record<string, QuizQuestionItem[]> = {
  'Atmospheric Thermal Inversion & Plume Dispersion Types': [
    {
      id: 'q-inv-1',
      question: 'Which plume dispersion condition creates the most dangerous concentration of pollutants at human breathing height?',
      options: ['Lofting', 'Fumigation', 'Coning', 'Fanning'],
      correctIndex: 1,
      explanation: 'Fumigation occurs when there is an inversion layer above the stack and unstable air below. Pollutants cannot escape upward and are rapidly mixed down toward the ground, causing peak surface concentrations.',
      topicRef: 'Atmospheric Thermal Inversion & Plume Dispersion Types'
    },
    {
      id: 'q-inv-2',
      question: 'What is the sign of the vertical temperature gradient (dT/dz) in an atmospheric inversion layer?',
      options: ['Negative (dT/dz < 0)', 'Zero (dT/dz = 0)', 'Positive (dT/dz > 0)', 'Undefined'],
      correctIndex: 2,
      explanation: 'In a normal atmosphere, temperature drops with altitude. In an inversion layer, warm air sits atop cold air, meaning temperature increases with height (dT/dz > 0).',
      topicRef: 'Atmospheric Thermal Inversion & Plume Dispersion Types'
    },
    {
      id: 'q-inv-3',
      question: 'In the Gaussian Plume equation, what do the dispersion parameters σ_y and σ_z represent?',
      options: [
        'Molecular mass of the emitted gas',
        'Standard deviations of plume concentration distribution',
        'Velocity of wind at stack height',
        'Ambient atmospheric pressure'
      ],
      correctIndex: 1,
      explanation: 'σ_y and σ_z represent the standard deviations of the crosswind and vertical concentration profiles, scaling with downwind distance x and atmospheric stability class.',
      topicRef: 'Atmospheric Thermal Inversion & Plume Dispersion Types'
    }
  ],
  'Second Law Clausius Inequality & Entropy Balance': [
    {
      id: 'q-therm-1',
      question: 'For an irreversible real cyclic engine operating between two heat reservoirs, what does Clausius Inequality mandate?',
      options: [
        '∮ (δQ / T) = 0',
        '∮ (δQ / T) < 0',
        '∮ (δQ / T) > 0',
        '∮ (δQ / T) = ∞'
      ],
      correctIndex: 1,
      explanation: 'The Clausius Inequality states that for all irreversible real cycles, ∮ (δQ / T) < 0. It equals zero only for ideal reversible cycles. Any result greater than zero represents a physical impossibility.',
      topicRef: 'Second Law Clausius Inequality & Entropy Balance'
    },
    {
      id: 'q-therm-2',
      question: 'Can the entropy generation term S_gen in a real isolated system ever be negative?',
      options: [
        'Yes, during rapid refrigeration cycles',
        'Yes, if heat is extracted at high temperature',
        'No, S_gen ≥ 0 for all physical processes',
        'Yes, when enthalpy is minimized'
      ],
      correctIndex: 2,
      explanation: 'According to the Second Law of Thermodynamics, entropy generation S_gen due to internal irreversibilities (friction, mixing, resistance) can never be negative. S_gen = 0 for ideal reversible processes and S_gen > 0 for real processes.',
      topicRef: 'Second Law Clausius Inequality & Entropy Balance'
    }
  ],
  'Taylor & Maclaurin Expansions in Multivariable Calculus': [
    {
      id: 'q-math-1',
      question: 'If at a critical point (a,b), the Hessian discriminant D = f_xx f_yy - (f_xy)² < 0, what is the nature of the critical point?',
      options: ['Local Maximum', 'Local Minimum', 'Saddle Point', 'Point of Inconclusive Test'],
      correctIndex: 2,
      explanation: 'When D < 0, the eigenvalues of the Hessian matrix have opposite signs, meaning the surface curves up in one direction and down in another, forming a Saddle Point.',
      topicRef: 'Taylor & Maclaurin Expansions in Multivariable Calculus'
    }
  ]
};

// =======================================================
// SERVICE IMPLEMENTATION WITH LOCALSTORAGE PERSISTENCE
// =======================================================

const STORAGE_KEYS = {
  PERSONAS: 'edusync_student_tutor_personas',
  ACTIVE_PERSONA: 'edusync_student_active_tutor_id',
  TASKS: 'edusync_student_tasks',
  PLUGINS: 'edusync_student_plugins',
  LECTURES: 'edusync_student_lectures',
  QUIZ_HISTORY: 'edusync_student_quiz_history'
};

export const studentBackendService = {
  // --- TUTOR PERSONAS ---
  getPersonas(): TutorPersona[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PERSONAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PERSONAS, JSON.stringify(INITIAL_TUTOR_PERSONAS));
      return INITIAL_TUTOR_PERSONAS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TUTOR_PERSONAS;
    }
  },

  getActivePersona(): TutorPersona {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PERSONA) || 'feynman';
    const personas = this.getPersonas();
    return personas.find(p => p.id === activeId) || personas[0];
  },

  setActivePersona(id: string): TutorPersona {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PERSONA, id);
    return this.getActivePersona();
  },

  addCustomPersona(persona: Omit<TutorPersona, 'id' | 'isCustom'>): TutorPersona {
    const personas = this.getPersonas();
    const newPersona: TutorPersona = {
      ...persona,
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    const updated = [...personas, newPersona];
    localStorage.setItem(STORAGE_KEYS.PERSONAS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PERSONA, newPersona.id);
    return newPersona;
  },

  // --- TASKS (TICKTICK FEATURE SET) ---
  getTasks(): StudentTaskItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TASKS;
    }
  },

  addTask(task: Omit<StudentTaskItem, 'id' | 'createdAt'>): StudentTaskItem {
    const tasks = this.getTasks();
    const newTask: StudentTaskItem = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newTask, ...tasks];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
    return newTask;
  },

  toggleTask(taskId: string): StudentTaskItem[] {
    const tasks = this.getTasks();
    const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
    return updated;
  },

  deleteTask(taskId: string): StudentTaskItem[] {
    const tasks = this.getTasks();
    const updated = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
    return updated;
  },

  toggleSubtask(taskId: string, subtaskId: string): StudentTaskItem[] {
    const tasks = this.getTasks();
    const updated = tasks.map(t => {
      if (t.id === taskId && t.subtasks) {
        return {
          ...t,
          subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, done: !st.done } : st)
        };
      }
      return t;
    });
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
    return updated;
  },

  // --- PLUGINS & EXTERNAL INTEGRATIONS ---
  getPlugins(): PluginIntegration[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PLUGINS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PLUGINS, JSON.stringify(INITIAL_PLUGINS));
      return INITIAL_PLUGINS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PLUGINS;
    }
  },

  togglePlugin(pluginId: string): PluginIntegration[] {
    const plugins = this.getPlugins();
    const updated = plugins.map(p => p.id === pluginId ? { ...p, connected: !p.connected } : p);
    localStorage.setItem(STORAGE_KEYS.PLUGINS, JSON.stringify(updated));
    return updated;
  },

  syncPluginNow(pluginId: string): { plugin: PluginIntegration; syncedTasksCount: number } {
    const plugins = this.getPlugins();
    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin) throw new Error('Plugin not found');

    // Simulate automated task generation into To-Do list
    let generatedTask: StudentTaskItem | null = null;
    if (plugin.type === 'google_classroom') {
      generatedTask = {
        id: `auto-gc-${Date.now()}`,
        title: 'Google Classroom Auto-Import: Chemistry Viva Voce Preparation Sheet',
        description: 'Synchronized via Google Classroom API webhook. Review buffer solutions.',
        priority: 'high',
        categoryTag: 'Assignment',
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        completed: false,
        source: 'google_classroom',
        subjectCode: 'CH-101',
        createdAt: new Date().toISOString()
      };
    } else if (plugin.type === 'google_calendar') {
      generatedTask = {
        id: `auto-gcal-${Date.now()}`,
        title: 'Calendar Milestone: Mid-Term Examination Registration Deadline',
        description: 'Auto-synced from BMU Academic Calendar.',
        priority: 'urgent',
        categoryTag: 'Exam Prep',
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        completed: false,
        source: 'calendar',
        createdAt: new Date().toISOString()
      };
    }

    if (generatedTask) {
      const currentTasks = this.getTasks();
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([generatedTask, ...currentTasks]));
    }

    const updatedPlugins = plugins.map(p => {
      if (p.id === pluginId) {
        return {
          ...p,
          lastSyncedAt: 'Just now',
          itemCountSynced: (p.itemCountSynced || 0) + 1
        };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PLUGINS, JSON.stringify(updatedPlugins));

    return {
      plugin: updatedPlugins.find(p => p.id === pluginId)!,
      syncedTasksCount: generatedTask ? 1 : 0
    };
  },

  // --- CLASSES & LECTURES ---
  getTodayClasses() {
    return INITIAL_TODAY_CLASSES;
  },

  getLectures(): StudentLectureCard[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LECTURES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(INITIAL_LECTURES));
      return INITIAL_LECTURES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LECTURES;
    }
  },

  getLectureById(id: string): StudentLectureCard | undefined {
    return this.getLectures().find(l => l.id === id);
  },

  // --- QUIZ GENERATION & MISTAKE EVALUATION ---
  getAvailableTopics(): Array<{ subjectCode: string; topicName: string }> {
    return [
      { subjectCode: 'ES-101', topicName: 'Atmospheric Thermal Inversion & Plume Dispersion Types' },
      { subjectCode: 'ME-102', topicName: 'Second Law Clausius Inequality & Entropy Balance' },
      { subjectCode: 'MA-101', topicName: 'Taylor & Maclaurin Expansions in Multivariable Calculus' }
    ];
  },

  generateQuizForTopic(topicName: string): QuizQuestionItem[] {
    const found = TOPIC_QUIZ_BANK[topicName];
    if (found && found.length > 0) return found;

    // Fallback dynamic generator
    return [
      {
        id: `q-dyn-1`,
        question: `What is the primary governing conservation principle in "${topicName}"?`,
        options: [
          'First-order conservation of energy and flux equilibrium',
          'Entropy minimization in non-equilibrium thermodynamics',
          'Linear momentum dissipation without boundary friction',
          'Constant velocity steady-state approximation'
        ],
        correctIndex: 0,
        explanation: `In ${topicName}, the system must fundamentally satisfy First-Order flux equilibrium and energy conservation before applying boundary condition limits.`,
        topicRef: topicName
      },
      {
        id: `q-dyn-2`,
        question: `When analyzing boundary conditions for "${topicName}", what is the most common student pitfall?`,
        options: [
          'Confusing path-dependent work transfer with state functions',
          'Assuming adiabatic conditions without thermal insulation',
          'Forgetting to balance dimensional units across terms',
          'All of the above'
        ],
        correctIndex: 3,
        explanation: `All three pitfalls frequently degrade examination scores in ${topicName}. Always verify units, state functions, and heat insulation assumptions.`,
        topicRef: topicName
      }
    ];
  },

  evaluateQuizSubmission(
    subjectCode: string,
    topicName: string,
    questions: QuizQuestionItem[],
    userAnswers: Record<string, number>
  ): StudentQuizSubmission {
    let score = 0;
    const mistakes: StudentQuizSubmission['mistakes'] = [];

    questions.forEach(q => {
      const selected = userAnswers[q.id];
      if (selected === q.correctIndex) {
        score += 1;
      } else {
        mistakes.push({
          questionId: q.id,
          question: q.question,
          selectedOption: selected !== undefined ? q.options[selected] || 'Unanswered' : 'Unanswered',
          correctOption: q.options[q.correctIndex],
          mistakeReason: q.explanation,
          coreTakeaway: `Key Rule: Always remember that ${q.options[q.correctIndex]} is derived from the fundamental definition.`
        });
      }
    });

    const firstMistake = mistakes[0];
    const suggestedTutorPrompt = firstMistake
      ? `I just took a diagnostic quiz on "${topicName}" and got this question wrong:
Question: "${firstMistake.question}"
I chose: "${firstMistake.selectedOption}"
Correct Answer: "${firstMistake.correctOption}"

Can you explain the core physical intuition behind this so I truly understand where my reasoning went wrong?`
      : `I just scored 100% on the "${topicName}" quiz! Can you challenge me with an advanced application problem to test my deeper mastery?`;

    const submission: StudentQuizSubmission = {
      id: `sub-${Date.now()}`,
      subjectId: subjectCode.toLowerCase(),
      subjectCode,
      topicName,
      dateTaken: new Date().toISOString().split('T')[0],
      questions,
      userAnswers,
      score,
      total: questions.length,
      mistakes,
      suggestedTutorPrompt
    };

    // Save to history
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
    const history = raw ? JSON.parse(raw) : [];
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify([submission, ...history]));

    return submission;
  }
};
