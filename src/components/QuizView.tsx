import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Flame,
  Award,
  Sliders,
  BookOpen,
  Zap,
  Check,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  questions?: QuizQuestion[];
  onAskTutorOnQuestion: (topic: string) => void;
}

const SUBJECT_TOPICS: Record<string, string[]> = {
  'Physics 11': [
    'Laws of Motion & Incline Forces',
    'Work, Energy & Power Conservation',
    'Rotational Mechanics & Torque',
    'Gravitation & Planetary Orbits',
  ],
  'Mathematics 11': [
    "Limits, Indeterminate Forms & L'Hopital",
    'Derivatives & Rate of Change',
    'Definite Integrals & Area Under Curves',
    'Coordinate Geometry & Conic Sections',
  ],
  'Chemistry 11': [
    'Chemical Bonding & VSEPR Geometry',
    "Thermodynamics, Enthalpy & Hess's Law",
    'Atomic Orbitals & Quantum Numbers',
    'Equilibrium & Le Chatelier Principle',
  ],
  'Computer Science': [
    'Data Structures & Time Complexity',
    'Recursion & Dynamic Programming',
    'Object-Oriented Design & Polymorphism',
    'Relational Database SQL Queries',
  ],
};

const DIFFICULTY_LEVELS = [
  { id: 'Easy', label: 'Foundational (Easy)', desc: 'Core definitions & direct formulas', badge: 'bg-[#dcfce7] text-[#15803d]' },
  { id: 'Medium', label: 'Standard (Medium)', desc: 'Multi-step analytical application', badge: 'bg-[#ffedd5] text-[#9a3412]' },
  { id: 'Hard', label: 'Advanced (Hard / Olympiad)', desc: 'Deep derivations & edge scenarios', badge: 'bg-[#fee2e2] text-[#991b1b]' },
];

function generateQuizBank(subject: string, topic: string, difficulty: string): QuizQuestion[] {
  // Pre-configured rich questions tailored to specific chosen parameters
  if (subject === 'Physics 11') {
    if (topic.includes('Rotational')) {
      return [
        {
          id: `q-rot-1`,
          tag: 'Rotational Inertia',
          question: `A solid cylinder and a thin spherical shell of equal mass and radius roll down an incline without slipping from rest. Which reaches the bottom first?`,
          options: [
            { key: 'A', text: 'The solid cylinder reaches first because its moment of inertia is smaller (1/2 MR² < 2/3 MR²).' },
            { key: 'B', text: 'The spherical shell reaches first because more of its mass is concentrated at the perimeter.' },
            { key: 'C', text: 'Both reach at the exact same instant because mass cancels out.' },
            { key: 'D', text: 'It depends on the static coefficient of friction μ_s.' },
          ],
          correctKey: 'A',
          hint: 'Acceleration on an incline rolling without slipping is a = g sin(θ) / (1 + I / MR²).',
          explanation: 'Since the solid cylinder has I = 0.5 MR² and the thin spherical shell has I = 0.67 MR², the cylinder has a smaller denominator (1.5 vs 1.67) and thus greater linear acceleration down the ramp.',
        },
        {
          id: `q-rot-2`,
          tag: 'Torque & Angular Momentum',
          question: `When a spinning ice skater pulls her arms inward, what happens to her kinetic energy and angular momentum (neglecting friction)?`,
          options: [
            { key: 'A', text: 'Angular momentum is conserved; rotational kinetic energy increases.' },
            { key: 'B', text: 'Both angular momentum and kinetic energy remain constant.' },
            { key: 'C', text: 'Angular momentum increases; kinetic energy decreases.' },
            { key: 'D', text: 'Angular momentum decreases due to internal tension.' },
          ],
          correctKey: 'A',
          hint: 'No external torque acts on the skater, but her muscles perform mechanical work.',
          explanation: 'External torque is zero (τ_ext = 0), so angular momentum L = Iω is strictly conserved. As moment of inertia I decreases, ω increases. Rotational kinetic energy K = L² / (2I) increases because of work done by inward muscular contraction.',
        },
        {
          id: `q-rot-3`,
          tag: 'Pure Rolling Condition',
          question: `For a wheel of radius R rolling without slipping along a flat surface with center of mass speed v_cm, what is the instantaneous velocity of the contact point on the ground?`,
          options: [
            { key: 'A', text: 'v = 0 (Instantaneous center of zero velocity)' },
            { key: 'B', text: 'v = v_cm directed forward' },
            { key: 'C', text: 'v = 2 v_cm directed backward' },
            { key: 'D', text: 'v = -v_cm directed backward' },
          ],
          correctKey: 'A',
          hint: 'No slipping means the relative velocity between contact surfaces is strictly zero.',
          explanation: 'The bottom contact point has forward translation +v_cm and backward rotational velocity -ωR = -v_cm. Summing vectors yields v_contact = 0.',
        },
      ];
    } else if (topic.includes('Work') || topic.includes('Energy')) {
      return [
        {
          id: `q-egy-1`,
          tag: 'Work-Energy Theorem',
          question: `A variable force F(x) = (3x² + 2x) N acts on a 2 kg particle along the x-axis from x = 0 m to x = 3 m. What is the total work done?`,
          options: [
            { key: 'A', text: '36 Joules' },
            { key: 'B', text: '27 Joules' },
            { key: 'C', text: '18 Joules' },
            { key: 'D', text: '45 Joules' },
          ],
          correctKey: 'A',
          hint: 'Work is the integral W = ∫ F(x) dx from 0 to 3.',
          explanation: 'W = ∫ (3x² + 2x) dx from 0 to 3 = [x³ + x²]₀³ = (27 + 9) - 0 = 36 Joules.',
        },
        {
          id: `q-egy-2`,
          tag: 'Conservative vs Non-Conservative Forces',
          question: `Which of the following is an example of a non-conservative force where mechanical work depends on the path taken?`,
          options: [
            { key: 'A', text: 'Kinetic friction force' },
            { key: 'B', text: 'Ideal spring Hooke force F = -kx' },
            { key: 'C', text: 'Newtonian gravitational force' },
            { key: 'D', text: 'Electrostatic Coulomb force' },
          ],
          correctKey: 'A',
          hint: 'Friction always opposes the instantaneous direction of motion, turning mechanical work into dissipated heat.',
          explanation: 'Friction is non-conservative: ∮ f · dr < 0 over any closed cycle, dissipating mechanical energy into thermal energy.',
        },
      ];
    } else {
      // Default / Laws of Motion
      return [
        {
          id: `q-mot-1`,
          tag: 'Normal Reaction on Incline',
          question: `Why is the contact normal force on a stationary block on a frictionless incline of angle θ equal to mg cos(θ) instead of mg?`,
          options: [
            { key: 'A', text: 'Only the perpendicular component of gravitational force compresses the surface plane.' },
            { key: 'B', text: 'Gravity is attenuated by the angle of inclination.' },
            { key: 'C', text: 'Friction counteracts the remaining vertical component of weight.' },
            { key: 'D', text: 'Air resistance cushions the normal load on tilted ramps.' },
          ],
          correctKey: 'A',
          hint: 'Resolve gravity vectors into axes parallel and perpendicular to the contact plane.',
          explanation: 'The surface plane can only push back along its outward normal. In the perpendicular direction, net acceleration is zero, so N = mg cos(θ).',
        },
        {
          id: `q-mot-2`,
          tag: 'Net Acceleration with Friction',
          question: `A block of mass m slides down an incline of angle θ with kinetic friction coefficient μ_k. What is its linear acceleration down the ramp?`,
          options: [
            { key: 'A', text: 'a = g(sin θ - μ_k cos θ)' },
            { key: 'B', text: 'a = g(cos θ - μ_k sin θ)' },
            { key: 'C', text: 'a = g(sin θ + μ_k cos θ)' },
            { key: 'D', text: 'a = g sin θ / μ_k' },
          ],
          correctKey: 'A',
          hint: 'Newton\'s Second Law: F_net = mg sin(θ) - f_k, with f_k = μ_k N.',
          explanation: 'F_net = mg sin(θ) - μ_k (mg cos θ) = m a. Dividing through by mass m gives a = g(sin θ - μ_k cos θ).',
        },
        {
          id: `q-mot-3`,
          tag: 'Angle of Repose',
          question: `At what critical ramp angle θ does an object at rest on a plane with static friction coefficient μ_s just begin to slip?`,
          options: [
            { key: 'A', text: 'θ = arctan(μ_s)' },
            { key: 'B', text: 'θ = arcsin(μ_s)' },
            { key: 'C', text: 'θ = arccos(μ_s)' },
            { key: 'D', text: 'θ = μ_s / g' },
          ],
          correctKey: 'A',
          hint: 'At impending slip, the downhill weight component equals maximum static friction: mg sin(θ) = μ_s mg cos(θ).',
          explanation: 'Dividing both sides by mg cos(θ) yields sin(θ)/cos(θ) = tan(θ) = μ_s, so θ = arctan(μ_s).',
        },
      ];
    }
  } else if (subject === 'Mathematics 11') {
    return [
      {
        id: `q-mth-1`,
        tag: "L'Hopital Rule & Limits",
        question: `Evaluate the limit: lim_{x -> 0} (sin(5x) / x).`,
        options: [
          { key: 'A', text: '5' },
          { key: 'B', text: '1' },
          { key: 'C', text: '0' },
          { key: 'D', text: 'Does not exist (Infinity)' },
        ],
        correctKey: 'A',
        hint: 'Use the standard trigonometric limit lim_{u -> 0} (sin u / u) = 1 or apply L\'Hopital\'s Rule 0/0.',
        explanation: 'By L\'Hopital\'s rule for 0/0: d/dx(sin 5x) / d/dx(x) = 5 cos(5x) / 1. Evaluated at x = 0, this is 5 * 1 = 5.',
      },
      {
        id: `q-mth-2`,
        tag: 'Continuity & Differentiability',
        question: `If a function f(x) is differentiable at x = a, what can be rigorously concluded about its continuity at x = a?`,
        options: [
          { key: 'A', text: 'f(x) must be continuous at x = a.' },
          { key: 'B', text: 'f(x) may or may not be continuous at x = a.' },
          { key: 'C', text: 'f(x) has a jump discontinuity at x = a.' },
          { key: 'D', text: 'f\'(x) must also be differentiable at x = a.' },
        ],
        correctKey: 'A',
        hint: 'Consider lim_{x -> a} (f(x) - f(a)) = lim_{x -> a} [(f(x) - f(a))/(x - a)] * (x - a).',
        explanation: 'Differentiability strictly implies continuity: lim (f(x) - f(a)) = f\'(a) * 0 = 0, so lim f(x) = f(a). The converse (continuity implies differentiability) is false (e.g. |x| at 0).',
      },
      {
        id: `q-mth-3`,
        tag: 'Chain Rule Derivatives',
        question: `What is the derivative of f(x) = ln(cos(x)) with respect to x?`,
        options: [
          { key: 'A', text: '-tan(x)' },
          { key: 'B', text: 'tan(x)' },
          { key: 'C', text: '-sec(x)' },
          { key: 'D', text: '1 / cos(x)' },
        ],
        correctKey: 'A',
        hint: 'By chain rule, d/dx [ln(u)] = (1/u) * (du/dx).',
        explanation: 'f\'(x) = (1 / cos(x)) * (-sin(x)) = -sin(x) / cos(x) = -tan(x).',
      },
    ];
  } else if (subject === 'Chemistry 11') {
    return [
      {
        id: `q-chm-1`,
        tag: 'VSEPR Molecular Geometry',
        question: `What is the molecular geometry and bond angle of a water molecule (H₂O) according to VSEPR theory?`,
        options: [
          { key: 'A', text: 'Bent (approx. 104.5°) due to 2 bonding pairs and 2 lone pairs.' },
          { key: 'B', text: 'Linear (180°) because oxygen is between two hydrogens.' },
          { key: 'C', text: 'Trigonal Planar (120°) with planar electron geometry.' },
          { key: 'D', text: 'Tetrahedral (109.5°) with zero repulsion variance.' },
        ],
        correctKey: 'A',
        hint: 'Lone pair - lone pair repulsion is stronger than bond pair - bond pair repulsion, compressing the tetrahedral angle from 109.5° down to 104.5°.',
        explanation: 'Oxygen has 4 electron domains (2 single bonds, 2 lone pairs) in tetrahedral arrangement. The lone pairs exert extra repulsion, creating a bent shape with ~104.5° bond angle.',
      },
      {
        id: `q-chm-2`,
        tag: 'Orbital Hybridization',
        question: `What is the hybridization of the central carbon in an ethene molecule (C₂H₄)?`,
        options: [
          { key: 'A', text: 'sp² hybridization (1 unhybridized p orbital forming the π bond)' },
          { key: 'B', text: 'sp³ hybridization' },
          { key: 'C', text: 'sp hybridization' },
          { key: 'D', text: 'dsp² hybridization' },
        ],
        correctKey: 'A',
        hint: 'Each carbon is bonded to 3 atoms (2 Hydrogens and 1 Carbon) in a planar arrangement.',
        explanation: 'Each carbon has steric number 3 (3 σ bonds and 1 π bond), giving trigonal planar geometry with sp² hybridization.',
      },
      {
        id: `q-chm-3`,
        tag: "Le Chatelier's Principle",
        question: `For the exothermic Haber synthesis: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) + 92 kJ, what happens if temperature is increased?`,
        options: [
          { key: 'A', text: 'Equilibrium shifts left toward reactants, decreasing NH₃ yield.' },
          { key: 'B', text: 'Equilibrium shifts right toward products, increasing NH₃ yield.' },
          { key: 'C', text: 'The equilibrium constant K_eq increases.' },
          { key: 'D', text: 'No shift occurs because moles of gas are balanced.' },
        ],
        correctKey: 'A',
        hint: 'Heat is a product in exothermic reactions (ΔH < 0). Adding heat pushes reaction in reverse to absorb thermal energy.',
        explanation: 'According to Le Chatelier\'s principle, adding heat to an exothermic system shifts equilibrium in the endothermic direction (reverse/left), reducing ammonia production.',
      },
    ];
  } else {
    // Computer Science
    return [
      {
        id: `q-cs-1`,
        tag: 'Time Complexity Analysis',
        question: `What is the average-case and worst-case time complexity of standard QuickSort with poor pivot selection?`,
        options: [
          { key: 'A', text: 'Average: O(n log n), Worst: O(n²)' },
          { key: 'B', text: 'Average: O(n), Worst: O(n log n)' },
          { key: 'C', text: 'Average: O(n²), Worst: O(n³)' },
          { key: 'D', text: 'Average: O(n log n), Worst: O(n log n)' },
        ],
        correctKey: 'A',
        hint: 'When the partition is completely unbalanced (e.g. already sorted array with first element pivot), recursion depth is n.',
        explanation: 'QuickSort splits partitions in half on average giving O(n log n). If unbalanced partitions of 1 and n-1 occur at every step, depth is n resulting in O(n²).',
      },
      {
        id: `q-cs-2`,
        tag: 'Dynamic Programming Principle',
        question: `What are the two foundational properties required to solve a computational problem using Dynamic Programming?`,
        options: [
          { key: 'A', text: 'Optimal Substructure and Overlapping Subproblems' },
          { key: 'B', text: 'Greedy Choice and Binary Division' },
          { key: 'C', text: 'Monotonicity and Constant Memory' },
          { key: 'D', text: 'Deterministic State and Strict Linearity' },
        ],
        correctKey: 'A',
        hint: 'DP caches results so subproblems do not need to be recomputed multiple times.',
        explanation: 'Dynamic programming requires optimal substructure (an optimal global solution is built from optimal subproblem solutions) and overlapping subproblems (the same smaller tasks are solved repeatedly).',
      },
    ];
  }
}

export const QuizView: React.FC<QuizViewProps> = ({
  questions: defaultQuestions,
  onAskTutorOnQuestion,
}) => {
  // Configuration State
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics 11');
  const [selectedTopic, setSelectedTopic] = useState<string>(
    SUBJECT_TOPICS['Physics 11'][0]
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Medium');
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  // Active Quiz State
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(() => {
    return generateQuizBank('Physics 11', 'Laws of Motion & Incline Forces', 'Medium');
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const availableTopics = SUBJECT_TOPICS[selectedSubject] || SUBJECT_TOPICS['Physics 11'];

  const handleSubjectChange = (newSub: string) => {
    setSelectedSubject(newSub);
    const topics = SUBJECT_TOPICS[newSub] || [];
    setSelectedTopic(topics[0] || '');
  };

  const handleGenerateQuiz = () => {
    setIsGenerating(true);
    setGenerationStep('Analyzing syllabus and academic rubrics...');

    setTimeout(() => {
      setGenerationStep(`Curating questions for ${selectedSubject} • ${selectedTopic}...`);
    }, 500);

    setTimeout(() => {
      setGenerationStep(`Calibrating ${selectedDifficulty} distractor choices and hints...`);
    }, 1000);

    setTimeout(() => {
      const newBank = generateQuizBank(selectedSubject, selectedTopic, selectedDifficulty);
      setActiveQuestions(newBank);
      setCurrentIdx(0);
      setSelectedOption(null);
      setIsSubmitted(false);
      setScore(0);
      setShowResults(false);
      setIsGenerating(false);
      setIsConfiguring(false);
    }, 1500);
  };

  const currentQ = activeQuestions[currentIdx] || activeQuestions[0];

  const handleSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    const selectedKey = currentQ.options[selectedOption]?.key;
    if (selectedKey === currentQ.correctKey) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResults(false);
  };

  const progressPercent = ((currentIdx + 1) / activeQuestions.length) * 100;

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1520px] mx-auto w-full">
      {/* Quiz Generator Selector / Setup Card */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0051d5] flex items-center justify-center flex-shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0b1c30]">
                Practice Quiz Generator
              </h2>
              <p className="text-xs text-[#5a4138]">
                Select your subject, topic, and difficulty to generate tailored diagnostic questions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isConfiguring && (
              <button
                onClick={() => setIsConfiguring(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-[#dce9ff]"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure New Quiz</span>
              </button>
            )}
          </div>
        </div>

        {/* Configuration Controls (Always open or togglable) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* 1. Subject Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#5a4138]">
              1. Choose Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="bg-[#eff4ff] text-xs font-bold text-[#0b1c30] px-4 py-2.5 rounded-xl border border-[#dce9ff] outline-none cursor-pointer focus:ring-2 focus:ring-[#0051d5]/30"
            >
              {Object.keys(SUBJECT_TOPICS).map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Topic Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#5a4138]">
              2. Choose Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-[#eff4ff] text-xs font-bold text-[#0b1c30] px-4 py-2.5 rounded-xl border border-[#dce9ff] outline-none cursor-pointer focus:ring-2 focus:ring-[#0051d5]/30 truncate"
            >
              {availableTopics.map((top) => (
                <option key={top} value={top}>
                  {top}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Difficulty Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#5a4138]">
              3. Difficulty Level
            </label>
            <div className="flex items-center gap-1.5">
              {DIFFICULTY_LEVELS.map((lvl) => {
                const isSelected = selectedDifficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(lvl.id)}
                    className={`flex-1 py-2 px-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer text-center truncate ${
                      isSelected
                        ? 'bg-[#a33900] text-white border-[#a33900] shadow-xs'
                        : 'bg-[#eff4ff] text-[#5a4138] border-[#dce9ff] hover:bg-[#dce9ff]'
                    }`}
                  >
                    {lvl.id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff]">
          <div className="text-[11px] text-[#5a4138] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0051d5]" />
            <span>
              Targeted: <strong>{selectedSubject}</strong> • <em>{selectedTopic}</em> ({selectedDifficulty})
            </span>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            className="bg-[#0051d5] hover:bg-[#003ea8] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Load & Generate Quiz</span>
              </>
            )}
          </button>
        </div>

        {/* Loading Overlay / Banner */}
        {isGenerating && (
          <div className="bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff] flex items-center gap-3 animate-pulse">
            <Loader2 className="w-5 h-5 text-[#0051d5] animate-spin flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#0051d5]">{generationStep}</span>
              <span className="text-[11px] text-[#5a4138]">
                Formatting mathematical derivations, answer validation keys, and hint sets...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Active Header */}
      <div className="bg-white rounded-3xl p-6 lg:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#a33900] flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a33900] bg-[#ffdbce] px-2.5 py-0.5 rounded-full">
                {selectedSubject}
              </span>
              <span className="text-xs font-semibold text-[#5a4138]">
                {selectedTopic}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0051d5] border border-[#dce9ff]">
                {selectedDifficulty}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight mt-1">
              Active Practice Quiz
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffdbce] text-[#7f2b00] text-xs font-bold">
            <Flame className="w-4 h-4 text-[#a33900] fill-current" />
            <span>4-day Streak</span>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-[#eff4ff] text-[#0051d5] text-xs font-bold border border-[#dce9ff]">
            Question {currentIdx + 1} of {activeQuestions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white p-2 rounded-2xl shadow-xs border border-[#eff4ff]">
        <div className="w-full bg-[#eff4ff] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#0051d5] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {!showResults ? (
        /* Question Card */
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-6">
          {/* Question title & prompt */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a33900]">
              Question {currentIdx + 1}: {currentQ.tag}
            </span>
            <p className="text-base sm:text-lg font-semibold text-[#0b1c30] leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Options Grid */}
          <div className="flex flex-col gap-3">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isCorrect = option.key === currentQ.correctKey;
              const showCorrectness = isSubmitted;

              let optionStyle =
                'border-[#dce9ff] bg-[#eff4ff]/40 hover:bg-[#eff4ff] text-[#0b1c30]';

              if (isSelected && !showCorrectness) {
                optionStyle = 'border-[#0051d5] bg-[#eff4ff] text-[#0051d5] font-bold shadow-xs';
              } else if (showCorrectness) {
                if (isCorrect) {
                  optionStyle =
                    'border-[#006947] bg-[#6ffbbe]/20 text-[#005236] font-bold';
                } else if (isSelected && !isCorrect) {
                  optionStyle =
                    'border-[#ba1a1a] bg-[#ffdad6]/40 text-[#ba1a1a] font-bold';
                } else {
                  optionStyle = 'border-gray-200 bg-white opacity-60 text-gray-500';
                }
              }

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelect(optIdx)}
                  className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 cursor-pointer transition-all ${optionStyle}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-[#0051d5] text-white'
                        : 'bg-white text-[#5a4138] border border-gray-300'
                    }`}
                  >
                    {option.key}
                  </div>
                  <span className="text-xs sm:text-sm flex-1 leading-relaxed">
                    {option.text}
                  </span>
                  {showCorrectness && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-[#006947] flex-shrink-0" />
                  )}
                  {showCorrectness && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-[#ba1a1a] flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Banner (when submitted) */}
          {isSubmitted && (
            <div className="bg-[#eff4ff] rounded-2xl p-5 border border-[#dce9ff] flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-[#006947] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Detailed Derivation & Concept Explanation
                </span>
                <button
                  onClick={() => onAskTutorOnQuestion(currentQ.tag)}
                  className="text-xs font-bold text-[#a33900] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Tutor for deeper derivation</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-[#0b1c30] leading-relaxed whitespace-pre-line mt-1">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff] flex-wrap gap-3">
            <button
              onClick={() => onAskTutorOnQuestion(currentQ.tag)}
              className="text-xs font-semibold text-[#5a4138] hover:text-[#0b1c30] flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Stuck? Hint: {currentQ.hint}</span>
            </button>

            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="bg-[#0051d5] hover:bg-[#003ea8] disabled:opacity-40 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-[#a33900] hover:bg-[#cc4900] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>
                  {currentIdx < activeQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results summary */
        <div className="bg-white rounded-3xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-[#dcfce7] text-[#15803d] flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#0b1c30]">
              Practice Quiz Completed!
            </h2>
            <p className="text-xs text-[#5a4138] mt-1">
              Topic: <strong>{selectedSubject}</strong> • <em>{selectedTopic}</em> ({selectedDifficulty})
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-md">
            <div className="bg-[#eff4ff] p-4 rounded-2xl flex flex-col">
              <span className="text-2xl font-extrabold text-[#0051d5]">
                {Math.round((score / activeQuestions.length) * 100)}%
              </span>
              <span className="text-[11px] font-bold text-[#5a4138]">Accuracy</span>
            </div>
            <div className="bg-[#eff4ff] p-4 rounded-2xl flex flex-col">
              <span className="text-2xl font-extrabold text-[#006947]">
                {score}/{activeQuestions.length}
              </span>
              <span className="text-[11px] font-bold text-[#5a4138]">Correct</span>
            </div>
            <div className="bg-[#eff4ff] p-4 rounded-2xl flex flex-col col-span-2 sm:col-span-1">
              <span className="text-2xl font-extrabold text-[#a33900]">+35 XP</span>
              <span className="text-[11px] font-bold text-[#5a4138]">Mastery</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRestart}
              className="bg-[#eff4ff] text-[#0051d5] border border-[#dce9ff] font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-[#dce9ff] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={() => {
                setShowResults(false);
                setIsConfiguring(true);
              }}
              className="bg-[#a33900] text-white font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-[#cc4900] transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Choose Another Topic</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
