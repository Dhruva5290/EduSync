import { QuizQuestion, StudentNote, LearnerPersona } from '../types';

export function getOrGenerateQuizQuestions(
  note: StudentNote,
  persona?: LearnerPersona
): QuizQuestion[] {
  // 1. If note already has pre-saved questions from faculty or previous generation, use them!
  if (note.quiz?.questions && Array.isArray(note.quiz.questions) && note.quiz.questions.length >= 3) {
    return note.quiz.questions.map((q, idx) => ({
      id: q.id || `q-saved-${idx}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation || 'Verified from curriculum notes.',
      topic: q.topic || note.title.slice(0, 30),
      difficulty: (q.difficulty || 'moderate') as 'easy' | 'moderate' | 'hard'
    }));
  }

  const title = note.title || 'Lecture Checkpoint';
  const text = `${title} ${(note.tags || []).join(' ')} ${note.summary || ''} ${(note.content || '').slice(0, 1200)}`.toLowerCase();

  // 2. NDA Selection Process / Defence Studies / SSB
  if (text.includes('nda') || text.includes('ssb') || text.includes('defence') || text.includes('military')) {
    return [
      {
        id: 'nda-q1',
        question: 'What are the two mandatory written papers conducted in Stage 1 of the UPSC NDA Entrance Examination?',
        options: [
          'Paper 1: Mathematics (300 Marks) & Paper 2: General Ability Test / GAT (600 Marks)',
          'Paper 1: Physics (400 Marks) & Paper 2: General Knowledge (500 Marks)',
          'Paper 1: English (450 Marks) & Paper 2: Numerical Aptitude (450 Marks)',
          'Paper 1: Current Affairs (300 Marks) & Paper 2: Military Aptitude (600 Marks)'
        ],
        correctIndex: 0,
        explanation: 'The UPSC NDA written exam consists of Paper 1 (Mathematics - 300 marks) and Paper 2 (General Ability Test / GAT - 600 marks), totaling 900 marks.',
        topic: 'NDA Exam Structure',
        difficulty: 'easy'
      },
      {
        id: 'nda-q2',
        question: 'In the 5-day Services Selection Board (SSB) Interview, which testing battery takes place on Day 1 (Stage 1 Screening)?',
        options: [
          'Officer Intelligence Rating (OIR) Test & Picture Perception & Discussion Test (PPDT)',
          'Progressive Group Task (PGT) and Half Group Task (HGT)',
          'Thematic Apperception Test (TAT) and Word Association Test (WAT)',
          'Final Board Conference with Interviewing Officers'
        ],
        correctIndex: 0,
        explanation: 'Stage 1 screening on Day 1 consists of the Officer Intelligence Rating (OIR) test and the Picture Perception & Discussion Test (PPDT). Only candidates who clear Stage 1 stay for the remaining 4 days.',
        topic: 'SSB Screening Protocol',
        difficulty: 'easy'
      },
      {
        id: 'nda-q3',
        question: 'What minimum sectional qualifying score is typically mandated by UPSC in both Mathematics and GAT papers?',
        options: [
          '25% minimum cutoff in each individual paper',
          '50% aggregate cutoff with no sectional minimum',
          '40% in Mathematics and 30% in GAT',
          '15% minimum qualifying score'
        ],
        correctIndex: 0,
        explanation: 'UPSC mandates a qualifying sectional cutoff (usually 25% to 30%) in both Paper 1 (Mathematics) and Paper 2 (GAT) to qualify for SSB shortlisting.',
        topic: 'Qualifying Cutoffs',
        difficulty: 'moderate'
      },
      {
        id: 'nda-q4',
        question: 'Which assessment battery is conducted on Day 2 of the SSB Interview to evaluate Officer-Like Qualities (OLQs) in candidate psychology?',
        options: [
          'TAT (Thematic Apperception), WAT (Word Association), SRT (Situation Reaction) & Self-Description (SD)',
          'Individual Obstacle Race (10 obstacles) and Command Task',
          'Snake Race and Group Discussion on Geopolitics',
          'Anthropometric Measurement & Special Medical Board Inspection'
        ],
        correctIndex: 0,
        explanation: 'Day 2 psychological testing comprises TAT, WAT, SRT, and SDT to evaluate candidates\' sub-conscious responses and character traits.',
        topic: 'SSB Psychological Battery',
        difficulty: 'moderate'
      },
      {
        id: 'nda-q5',
        question: 'What happens if a candidate is declared "Temporarily Medically Unfit" (e.g. slight overweight, wax in ears) by the Special Medical Board (SMB)?',
        options: [
          'Granted 42 days of remediation with right to appeal before the Appeal Medical Board (AMB)',
          'Permanent immediate disqualification with no right of re-examination',
          'Automatic waiver upon submitting a certified civil doctor affidavit',
          'Immediate re-allotment to administrative cadre without medical review'
        ],
        correctIndex: 0,
        explanation: 'Candidates declared temporarily unfit are granted a 42-day window to remediate minor conditions and report to an designated Appeal Medical Board.',
        topic: 'Medical Board Protocol',
        difficulty: 'hard'
      },
      {
        id: 'nda-q6',
        question: 'In the GTO (Group Testing Officer) round of SSB, which task tests tactical leadership where the candidate is assigned subordinates to solve an obstacle problem?',
        options: [
          'Command Task',
          'Group Planning Exercise (GPE)',
          'Lecturette',
          'Final Group Task (FGT)'
        ],
        correctIndex: 0,
        explanation: 'In the Command Task, the GTO nominates the candidate as a commander, allowing them to choose 2-3 subordinates from the group to bridge an obstacle under time pressure.',
        topic: 'GTO Evaluation',
        difficulty: 'hard'
      }
    ];
  }

  // 3. Newton's Laws & Friction on Inclined Planes
  if (text.includes('newton') || text.includes('friction') || text.includes('incline')) {
    return [
      {
        id: 'phy-newton-1',
        question: 'For a block of mass $m$ resting on an inclined plane with angle $\\theta$, what is the magnitude of the normal force exerted by the surface?',
        options: [
          '$N = mg \\cos(\\theta)$',
          '$N = mg \\sin(\\theta)$',
          '$N = mg / \\cos(\\theta)$',
          '$N = mg \\tan(\\theta)$'
        ],
        correctIndex: 0,
        explanation: 'Perpendicular to the inclined plane, acceleration is zero, so $N - mg \\cos(\\theta) = 0 \\implies N = mg \\cos(\\theta)$.',
        topic: 'Normal Force on Incline',
        difficulty: 'easy'
      },
      {
        id: 'phy-newton-2',
        question: 'What is the minimum angle of inclination $\\theta$ (angle of repose) at which a block will begin to slide down an incline with coefficient of static friction $\\mu_s$?',
        options: [
          '$\\theta = \\arctan(\\mu_s)$',
          '$\\theta = \\arcsin(\\mu_s)$',
          '$\\theta = \\arccos(\\mu_s)$',
          '$\\theta = \\mu_s \\times 90^\\circ$'
        ],
        correctIndex: 0,
        explanation: 'At impending motion, $mg \\sin(\\theta) = f_{s,\\max} = \\mu_s mg \\cos(\\theta) \\implies \\tan(\\theta) = \\mu_s$.',
        topic: 'Angle of Repose',
        difficulty: 'easy'
      },
      {
        id: 'phy-newton-3',
        question: 'If a constant external force pulls the block up the incline with acceleration $a$, what is the kinetic friction force acting on the block?',
        options: [
          '$f_k = \\mu_k mg \\cos(\\theta)$ pointing down the incline',
          '$f_k = \\mu_k mg \\sin(\\theta)$ pointing up the incline',
          '$f_k = m(g + a) \\cos(\\theta)$ pointing horizontally',
          '$f_k = 0$ because kinetic friction vanishes during acceleration'
        ],
        correctIndex: 0,
        explanation: 'Kinetic friction opposes the relative motion (points down the incline) with magnitude $f_k = \\mu_k N = \\mu_k mg \\cos(\\theta)$.',
        topic: 'Kinetic Friction Direction',
        difficulty: 'moderate'
      },
      {
        id: 'phy-newton-4',
        question: 'Two blocks of masses $m_1$ and $m_2$ ($m_1 > m_2$) are connected by an inextensible string over a frictionless pulley. What is the acceleration of the system?',
        options: [
          '$a = \\frac{m_1 - m_2}{m_1 + m_2} g$',
          '$a = \\frac{m_1 + m_2}{m_1 - m_2} g$',
          '$a = \\frac{2 m_1 m_2}{m_1 + m_2} g$',
          '$a = g$'
        ],
        correctIndex: 0,
        explanation: 'Applying Newton\'s second law to Atwood\'s machine yields net driving force $(m_1 - m_2)g$ divided by total mass $(m_1 + m_2)$.',
        topic: 'Atwood Machine Dynamics',
        difficulty: 'moderate'
      },
      {
        id: 'phy-newton-5',
        question: 'A rigid cylinder rolls down an incline without slipping. Does static friction perform net mechanical work on the cylinder?',
        options: [
          'No, because the instantaneous point of contact is at rest relative to the incline ($W = \\int \\mathbf{F} \\cdot d\\mathbf{s} = 0$)',
          'Yes, it dissipates kinetic energy into thermal heat energy',
          'Yes, it increases the total mechanical energy of the center of mass',
          'No, because the normal force cancels the friction vector at all times'
        ],
        correctIndex: 0,
        explanation: 'In pure rolling without slipping, the instantaneous velocity of the contact point is zero ($v_c = 0$), so static friction does zero net work.',
        topic: 'Rolling Friction Work Invariant',
        difficulty: 'hard'
      }
    ];
  }

  // 4. Electromagnetic Induction & Faraday-Lenz Law
  if (text.includes('induction') || text.includes('faraday') || text.includes('lenz') || text.includes('flux')) {
    return [
      {
        id: 'phy-emi-1',
        question: 'According to Faraday\'s law of induction, the induced electromotive force (EMF) $\\mathcal{E}$ in a closed circuit is proportional to:',
        options: [
          'The negative time rate of change of magnetic flux ($\\mathcal{E} = -\\frac{d\\Phi_B}{dt}$)',
          'The total accumulated static charge in the conductor',
          'The square of the applied external voltage',
          'The magnetic flux divided by current squared'
        ],
        correctIndex: 0,
        explanation: 'Faraday\'s law states $\\mathcal{E} = -N \\frac{d\\Phi_B}{dt}$, where magnetic flux $\\Phi_B = \\int \\mathbf{B} \\cdot d\\mathbf{A}$.',
        topic: 'Faraday\'s Law Statement',
        difficulty: 'easy'
      },
      {
        id: 'phy-emi-2',
        question: 'What fundamental physical conservation law is responsible for the negative sign in Lenz\'s law?',
        options: [
          'Law of Conservation of Energy',
          'Conservation of Electric Charge',
          'Second Law of Thermodynamics',
          'Conservation of Angular Momentum'
        ],
        correctIndex: 0,
        explanation: 'If the induced current aided the change in flux instead of opposing it, energy would be created from nothing, violating energy conservation.',
        topic: 'Lenz Law & Conservation of Energy',
        difficulty: 'easy'
      },
      {
        id: 'phy-emi-3',
        question: 'A straight conducting rod of length $L$ moves at constant velocity $v$ perpendicular to a uniform magnetic field $B$. What is the motional EMF induced across its ends?',
        options: [
          '$\\mathcal{E} = B L v$',
          '$\\mathcal{E} = \\frac{1}{2} B L^2 v$',
          '$\\mathcal{E} = \\frac{B v}{L}$',
          '$\\mathcal{E} = B^2 L v$'
        ],
        correctIndex: 0,
        explanation: 'The Lorentz force on conduction charges $\\mathbf{F} = q(\\mathbf{v} \\times \\mathbf{B})$ generates a motional EMF $\\mathcal{E} = \\int (\\mathbf{v} \\times \\mathbf{B}) \\cdot d\\mathbf{l} = B L v$.',
        topic: 'Motional EMF',
        difficulty: 'moderate'
      },
      {
        id: 'phy-emi-4',
        question: 'When a thick copper plate swings between the poles of a strong electromagnet, it comes to an abrupt halt. What phenomenon causes this magnetic braking?',
        options: [
          'Eddy currents induced in the bulk conductor create opposing Lorentz forces that dissipate kinetic energy as Joule heat',
          'Ferromagnetic attraction between copper and the magnetic pole faces',
          'Electrostatic repulsion from surface charge accumulation',
          'Capacitive reactance of the copper plate in a DC field'
        ],
        correctIndex: 0,
        explanation: 'Changing flux through the swinging plate induces circular eddy currents. By Lenz\'s law, the magnetic force opposes the motion, braking the pendulum.',
        topic: 'Eddy Currents & Damping',
        difficulty: 'moderate'
      },
      {
        id: 'phy-emi-5',
        question: 'A circular loop of radius $R$ is placed in a time-varying magnetic field $B(t) = B_0 \\alpha t$. What is the magnitude of the induced non-electrostatic electric field $E$ at distance $r < R$ from the axis of symmetry?',
        options: [
          '$E(r) = \\frac{1}{2} r B_0 \\alpha$',
          '$E(r) = r^2 B_0 \\alpha$',
          '$E(r) = \\frac{R^2 B_0 \\alpha}{2r}$',
          '$E(r) = 0$ inside the boundary'
        ],
        correctIndex: 0,
        explanation: 'Applying Maxwell-Faraday equation: $\\oint \\mathbf{E} \\cdot d\\mathbf{l} = E(2\\pi r) = -\\frac{d}{dt}(B_0 \\alpha t \\cdot \\pi r^2) \\implies E = \\frac{1}{2} r B_0 \\alpha$.',
        topic: 'Induced Non-Conservative Electric Field',
        difficulty: 'hard'
      }
    ];
  }

  // 5. Electrochemistry & Nernst Equation
  if (text.includes('nernst') || text.includes('electrochem') || text.includes('galvanic')) {
    return [
      {
        id: 'che-nernst-1',
        question: 'What is the standard form of the Nernst equation for a redox half-cell reaction at $T = 298\\text{ K}$?',
        options: [
          '$E = E^\\circ - \\frac{0.0591}{n} \\log_{10}(Q)$',
          '$E = E^\\circ + \\frac{0.0591}{n} \\ln(Q)$',
          '$E = E^\\circ - \\frac{RT}{nF} \\log_{10}(Q)$',
          '$E = \\frac{E^\\circ}{n} - 0.0591 Q$'
        ],
        correctIndex: 0,
        explanation: 'At 298.15 K, $\\frac{2.303 R T}{F} \\approx 0.05916\\text{ V}$, yielding $E = E^\\circ - \\frac{0.0591}{n} \\log_{10}(Q)$.',
        topic: 'Nernst Equation at 298 K',
        difficulty: 'easy'
      },
      {
        id: 'che-nernst-2',
        question: 'When a galvanic electrochemical cell reaches dynamic thermodynamic equilibrium, what are the values of cell potential ($E_{\\text{cell}}$) and reaction quotient ($Q$)?',
        options: [
          '$E_{\\text{cell}} = 0\\text{ V}$ and $Q = K_{\\text{eq}}$',
          '$E_{\\text{cell}} = E^\\circ_{\\text{cell}}$ and $Q = 1$',
          '$E_{\\text{cell}} = 1\\text{ V}$ and $Q = 0$',
          '$E_{\\text{cell}} = \\infty$ and $Q = K_{\\text{eq}}$'
        ],
        correctIndex: 0,
        explanation: 'At equilibrium, $\\Delta G = 0 \\implies E_{\\text{cell}} = 0\\text{ V}$, and the reaction quotient equals the equilibrium constant $K_{\\text{eq}}$.',
        topic: 'Electrochemical Equilibrium',
        difficulty: 'easy'
      },
      {
        id: 'che-nernst-3',
        question: 'For the standard Daniell cell: $\\text{Zn}(s) + \\text{Cu}^{2+}(aq) \\rightleftharpoons \\text{Zn}^{2+}(aq) + \\text{Cu}(s)$, how does increasing $[\\text{Zn}^{2+}]$ affect the cell EMF?',
        options: [
          'Decreases $E_{\\text{cell}}$ because $Q = [\\text{Zn}^{2+}]/[\\text{Cu}^{2+}]$ increases',
          'Increases $E_{\\text{cell}}$ because zinc ions accelerate electron transfer',
          'Has no effect on $E_{\\text{cell}}$ because solid copper buffers the potential',
          'Causes $E_{\\text{cell}}$ to become zero immediately'
        ],
        correctIndex: 0,
        explanation: 'Since $\\text{Zn}^{2+}$ is a product, increasing its concentration increases $Q$, which subtracts a larger value in the Nernst equation, decreasing $E_{\\text{cell}}$.',
        topic: 'Le Chatelier & Nernst Shifts',
        difficulty: 'moderate'
      },
      {
        id: 'che-nernst-4',
        question: 'Why are the activities of pure solids (like $\\text{Zn}(s)$ and $\\text{Cu}(s)$) assigned a value of 1 in the Nernst reaction quotient $Q$?',
        options: [
          'Their chemical potential is standard and their molar density/concentration remains constant during the reaction',
          'Solids do not participate in electron transfer reactions',
          'Their standard reduction potentials are defined as zero by IUPAC convention',
          'Solids have zero Gibbs free energy of formation at all temperatures'
        ],
        correctIndex: 0,
        explanation: 'Pure condensed phases (solids and liquids) have constant chemical activity ($a = 1$) because their molar volume is invariant throughout the reaction.',
        topic: 'Solid State Activity Convention',
        difficulty: 'moderate'
      },
      {
        id: 'che-nernst-5',
        question: 'For a hydrogen half-cell $\\text{H}^+(aq) + e^- \\rightleftharpoons \\frac{1}{2}\\text{H}_2(g, 1\\text{ atm})$, what is the reduction potential at $25^\\circ\\text{C}$ as a function of pH?',
        options: [
          '$E = -0.0591 \\times \\text{pH}$',
          '$E = +0.0591 \\times \\text{pH}$',
          '$E = -0.0295 / \\text{pH}$',
          '$E = 0.00\\text{ V}$ independent of pH'
        ],
        correctIndex: 0,
        explanation: 'Nernst equation gives $E = 0 - 0.0591 \\log_{10}(1/[\\text{H}^+]) = -0.0591 \\text{pH}$.',
        topic: 'pH Dependence of SHE',
        difficulty: 'hard'
      }
    ];
  }

  // 6. Generic High-Yield Fallback based on Note Title & Invariants
  return [
    {
      id: 'gen-q1',
      question: `What is the core definition or governing framework established in "${title}"?`,
      options: [
        'Deterministic invariant balance and conservation under specified boundary conditions',
        'Stochastic divergence where physical quantities fluctuate arbitrarily',
        'Complete independence between driving potentials and system response',
        'Spontaneous decay of states without interaction with boundary fields'
      ],
      correctIndex: 0,
      explanation: `The foundational curriculum principles in "${title}" require continuous conservation and well-defined boundary states.`,
      topic: 'Core Axioms',
      difficulty: 'easy'
    },
    {
      id: 'gen-q2',
      question: `Which key relationship governs the scaling or proportionality highlighted in "${title}"?`,
      options: [
        'Direct relationship between gradient flux and restorative potential',
        'Non-linear divergence exceeding small-signal boundary limits',
        'Universal inverse quadratic decay regardless of mass or medium',
        'Complete nullification of response across all active variables'
      ],
      correctIndex: 0,
      explanation: 'Physical scaling laws enforce direct dimensional proportionality between gradient potentials and observable flux.',
      topic: 'Proportionality & Scaling',
      difficulty: 'moderate'
    },
    {
      id: 'gen-q3',
      question: `When evaluating limiting edge cases for "${title}", what invariant condition must always be satisfied?`,
      options: [
        'Continuous differentiability and dimensional homogeneity across LHS and RHS',
        'Discontinuous phase jumps without conservation of energy',
        'Arbitrary sign changes without coordinate reference frame definition',
        'Asymptotic infinite divergence without mathematical justification'
      ],
      correctIndex: 0,
      explanation: 'Valid physical equations require strict dimensional homogeneity $[M^a L^b T^c]$ and continuous boundary transitions.',
      topic: 'Dimensional Invariants',
      difficulty: 'moderate'
    },
    {
      id: 'gen-q4',
      question: `What common student error or negative-marking pitfall is most frequent in "${title}"?`,
      options: [
        'Inverting coordinate sign conventions or confusing boundary units',
        'Applying Newton\'s laws in inertial frames of reference',
        'Writing units alongside numerical substitutions',
        'Verifying invariant conservation before stating the final solution'
      ],
      correctIndex: 0,
      explanation: 'The most frequent trap is neglecting negative signs in gradient equations or failing to convert to standard SI units.',
      topic: 'Common Exam Pitfalls',
      difficulty: 'hard'
    },
    {
      id: 'gen-q5',
      question: `In an applied examination problem on "${title}", what initial step secures foundational method credit?`,
      options: [
        'Stating the governing formula explicitly with all boundary variables defined',
        'Writing only the final numerical answer without intermediate working',
        'Omitting vector direction arrows in multi-dimensional problems',
        'Assuming zero resistance without justifying the physical regime'
      ],
      correctIndex: 0,
      explanation: 'Examination rubrics allocate initial credit for stating the governing law and defining boundary conditions.',
      topic: 'Exam Solution Strategy',
      difficulty: 'hard'
    }
  ];
}
