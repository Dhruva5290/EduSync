import React, { useState } from 'react';
import { LearnerPersona } from '../../types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Brain,
  Eye,
  Target,
  Clock,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  Wand2,
  Zap,
  Lightbulb,
  BookOpen,
  MessageSquare,
  FileText,
  Code,
  Layers,
  Award,
  Flame,
  Check
} from 'lucide-react';

interface LearnerPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: LearnerPersona;
  studentName: string;
  onSave: (profile: LearnerPersona) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const LearnerPersonaModal: React.FC<LearnerPersonaModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  studentName,
  onSave,
  onShowToast
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Profile Form State
  const [learningStyle, setLearningStyle] = useState<LearnerPersona['learningStyle']>(
    currentProfile?.learningStyle || 'visual'
  );
  const [targetGrade, setTargetGrade] = useState<LearnerPersona['targetGrade']>(
    currentProfile?.targetGrade || 'A+'
  );
  const [explanationTone, setExplanationTone] = useState<LearnerPersona['explanationTone']>(
    currentProfile?.explanationTone || 'encouraging_mentor'
  );
  const [preferredPace, setPreferredPace] = useState<LearnerPersona['preferredPace']>(
    currentProfile?.preferredPace || 'steady'
  );
  const [strengthsAndInterests, setStrengthsAndInterests] = useState(
    currentProfile?.strengthsAndInterests || ''
  );
  const [painPoints, setPainPoints] = useState(
    currentProfile?.painPoints || ''
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleQuickChip = (field: 'strength' | 'pain', val: string) => {
    if (field === 'strength') {
      const current = strengthsAndInterests.trim();
      if (!current) {
        setStrengthsAndInterests(val);
      } else if (!current.includes(val)) {
        setStrengthsAndInterests(`${current}, ${val}`);
      }
    } else {
      const current = painPoints.trim();
      if (!current) {
        setPainPoints(val);
      } else if (!current.includes(val)) {
        setPainPoints(`${current}, ${val}`);
      }
    }
  };

  const applyPreset = (preset: 'exam_crunch' | 'deep_master' | 'code_first') => {
    if (preset === 'exam_crunch') {
      setLearningStyle('exam_focused');
      setTargetGrade('A');
      setExplanationTone('strict_coach');
      setPreferredPace('accelerated');
    } else if (preset === 'deep_master') {
      setLearningStyle('step_by_step');
      setTargetGrade('A+');
      setExplanationTone('encouraging_mentor');
      setPreferredPace('thorough');
    } else {
      setLearningStyle('visual');
      setTargetGrade('A+');
      setExplanationTone('practical_engineer');
      setPreferredPace('steady');
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const profile: LearnerPersona = {
        learningStyle,
        targetGrade,
        explanationTone,
        preferredPace,
        strengthsAndInterests: strengthsAndInterests.trim(),
        painPoints: painPoints.trim(),
        questionnaireCompleted: true,
        completedAt: new Date().toISOString()
      };

      await onSave(profile);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      onShowToast('✨ AI Persona configured! Your Notes & AI Tutor are now customized.', 'success');
      onClose();
    } catch (err: any) {
      console.error('Error saving persona:', err);
      onShowToast('Failed to save learning profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg text-white shadow-md">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono font-bold rounded uppercase tracking-wide">
                  Cognitive Tuning Questionnaire
                </span>
                <span className="text-xs text-slate-400 font-mono">Step {step} of 5</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                Personalize Your AI Notes & Study Assistant
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex items-center justify-between gap-2 py-2 px-3 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-mono shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Instant Presets:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => applyPreset('exam_crunch')}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-700 text-slate-300 transition-all font-medium"
            >
              🎯 High-Yield Exam Crunch
            </button>
            <button
              onClick={() => applyPreset('deep_master')}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-purple-950 border border-slate-800 hover:border-purple-700 text-slate-300 transition-all font-medium"
            >
              🏆 Deep Conceptual Master
            </button>
            <button
              onClick={() => applyPreset('code_first')}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-blue-950 border border-slate-800 hover:border-blue-700 text-slate-300 transition-all font-medium"
            >
              💻 Practical Code & Builder
            </button>
          </div>
        </div>

        {/* Progress Step Navigator */}
        <div className="grid grid-cols-5 gap-1.5 py-3 border-b border-slate-800/80">
          {[
            { num: 1, label: 'Modality' },
            { num: 2, label: 'Goals' },
            { num: 3, label: 'Pace' },
            { num: 4, label: 'Tone' },
            { num: 5, label: 'Focus' }
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num as any)}
              className={`cursor-pointer pb-1 transition-all border-b-2 text-center ${
                step === s.num
                  ? 'border-indigo-500 text-indigo-300 font-bold text-xs'
                  : step > s.num
                  ? 'border-emerald-500 text-emerald-400 text-xs font-semibold'
                  : 'border-slate-800 text-slate-500 text-xs'
              }`}
            >
              <span>{s.num}. {s.label}</span>
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          
          {/* STEP 1: LEARNING MODALITY */}
          {step === 1 && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  How do you absorb complex engineering & academic topics best?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  EduSync will tailor diagram density, mental models, and derivation style in all generated study notes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  {
                    id: 'visual',
                    title: '🎨 Visual & Analogy-Driven',
                    badge: 'Intuitive & Spatial',
                    desc: 'Mental models, real-world physical analogies, geometric perspectives, and structured ASCII flowcharts.'
                  },
                  {
                    id: 'step_by_step',
                    title: '📐 Step-by-Step Mathematical Rigor',
                    badge: 'First Principles',
                    desc: 'Sequential proofs, formal derivations, boundary invariant analysis, and step-by-step mathematical logic.'
                  },
                  {
                    id: 'socratic_dialogue',
                    title: '💬 Socratic & Inquiry-Driven',
                    badge: 'Active Scaffolding',
                    desc: 'Thought experiments, guided self-reflection questions, and scaffolded problem-solving checkpoints.'
                  },
                  {
                    id: 'exam_focused',
                    title: '🎯 High-Yield Exam Synthesis',
                    badge: 'Rapid Revision',
                    desc: 'Formula cheat sheets, common student traps, high-frequency exam questions, and memory mnemonics.'
                  }
                ].map((item) => {
                  const isSelected = learningStyle === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setLearningStyle(item.id as any)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        {isSelected ? <CheckCircle2 className="w-4 h-4 text-indigo-400" /> : (
                          <span className="text-[9px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: TARGET GRADE & MASTERY LEVEL */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  What is your academic ambition and mastery target?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calibrates the depth of notes, algorithmic complexity, and quiz question difficulty.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'A+',
                    title: '🏆 Grade A+ (Top 1% Honors)',
                    badge: 'Mastery & Nuance',
                    desc: 'Deep theoretical proofs, non-trivial boundary edge cases, asymptotic limits, and rigorous derivations.'
                  },
                  {
                    id: 'A',
                    title: '🌟 Grade A (High Distinction)',
                    badge: 'Standard Excellence',
                    desc: 'Balanced problem-solving, standard textbook derivations, clear worked examples, and comprehensive coverage.'
                  },
                  {
                    id: 'B',
                    title: '🛡️ Grade B / Core Foundation',
                    badge: 'Demystified Core',
                    desc: 'Focuses on building baseline intuition, simplifying tough concepts, and demystifying confusing formulas.'
                  },
                  {
                    id: 'competitive',
                    title: '🚀 Competitive Olympiad / Research',
                    badge: 'Extreme Edge Cases',
                    desc: 'Challenging boundary analysis, creative problem extensions, and cutting-edge practical optimizations.'
                  }
                ].map((item) => {
                  const isSelected = targetGrade === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setTargetGrade(item.id as any)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: PREFERRED LEARNING PACE */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  What is your preferred note-taking and explanation pace?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Controls note length, background context explanations, and speed of summaries.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'accelerated',
                    title: '⚡ Fast & Concise',
                    badge: 'High Density',
                    desc: 'Minimal preamble. Straight to the core formulas, checklists, and summary points.'
                  },
                  {
                    id: 'steady',
                    title: '⏱️ Steady & Balanced',
                    badge: 'Standard Flow',
                    desc: 'Measured balance of foundational theory, code examples, and practice takeaways.'
                  },
                  {
                    id: 'thorough',
                    title: '📖 Deeply Thorough',
                    badge: 'Step-by-Step',
                    desc: 'Takes time to explain prerequisites, foundational definitions, and historical context.'
                  }
                ].map((item) => {
                  const isSelected = preferredPace === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setPreferredPace(item.id as any)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500 text-white shadow-md ring-1 ring-blue-500'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: COACHING & MENTOR TONE */}
          {step === 4 && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  What AI mentor coaching style motivates you most?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Determines how your AI assistant gives feedback, introduces concepts, and motivates you.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  {
                    id: 'encouraging_mentor',
                    title: '🤝 Warm, Patient & Encouraging Mentor',
                    desc: 'Celebrates your progress, provides patient step-by-step guidance, and breaks through frustration with gentle encouragement.',
                    sample: '"Great effort on that derivation! Notice how the volume expands at constant pressure. What does that tell us about work done?"'
                  },
                  {
                    id: 'strict_coach',
                    title: '🏛️ Rigorous University Professor',
                    desc: 'Demands precision in terminology, flags logical leaps immediately, and pushes you toward mathematical correctness.',
                    sample: '"Check your boundary condition. That limit does not converge without enforcing state non-negativity. Correct the invariant."'
                  },
                  {
                    id: 'practical_engineer',
                    title: '⚡ Practical Industry Software Architect',
                    desc: 'Relates theory to real-world software architecture, hardware systems, practical performance trade-offs, and production code.',
                    sample: '"In production, this O(N²) approach will blow up your heap memory. Let\'s optimize to O(N log N) using a balanced tree."'
                  }
                ].map((tone) => {
                  const isSelected = explanationTone === tone.id;
                  return (
                    <div
                      key={tone.id}
                      onClick={() => setExplanationTone(tone.id as any)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-950/60 border-purple-500 text-white shadow-md ring-1 ring-purple-500'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{tone.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{tone.desc}</p>
                      <p className="text-[10px] font-mono text-purple-300 mt-2 bg-slate-900/90 p-2 rounded border border-slate-800 italic">
                        {tone.sample}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: STRENGTHS & PAIN POINTS */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  What are your key strengths and topics needing extra help?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  EduSync will automatically provide extra scaffolding on your pain points and build upon your strengths.
                </p>
              </div>

              {/* Strengths */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Areas of Strength & Interest (Click chips or type)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'C Programming & Pointers',
                    'Clean Code & Algorithms',
                    'Visual Physics Diagrams',
                    'Calculus Intuition',
                    'Thermodynamic Cycles',
                    'Fast Memorization'
                  ].map((chip) => (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => handleQuickChip('strength', chip)}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/60 rounded text-[11px] text-slate-300 transition-colors"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={strengthsAndInterests}
                  onChange={(e) => setStrengthsAndInterests(e.target.value)}
                  placeholder="e.g. Strong in coding and data structures, visual intuition"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Pain Points */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Pain Points & Topics Needing Extra Explanation (Click chips or type)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Double & Triple Integrals',
                    'Pointer Memory & Segfaults',
                    'Carnot Efficiency & Entropy',
                    'Mathematical Proofs by Induction',
                    'Formula Memorization under Pressure',
                    'Boundary Edge Cases'
                  ].map((chip) => (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => handleQuickChip('pain', chip)}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/60 rounded text-[11px] text-slate-300 transition-colors"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={painPoints}
                  onChange={(e) => setPainPoints(e.target.value)}
                  placeholder="e.g. Struggling with double integrals and pointer arithmetic"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Live Profile Summary Card */}
              <div className="p-3.5 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-950 rounded-lg border border-indigo-800/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3 text-indigo-400" /> Active AI Persona Blueprint
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                    Ready to Apply
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {studentName} · <strong>{learningStyle.replace('_', ' ').toUpperCase()}</strong> · Grade <strong>{targetGrade}</strong> · <strong>{explanationTone.replace('_', ' ')}</strong> · <strong>{preferredPace}</strong> pace
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  All study notes generated in the Smart Note Playground will immediately adopt this structure.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-auto">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold shadow transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Personalizing Notes Engine...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Save & Personalize All Notes</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerPersonaModal;
