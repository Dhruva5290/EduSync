import React, { useState } from 'react';
import { useStudentContext } from '../../../context/StudentContext';
import { MathRenderer } from '../../Common/MathRenderer';
import {
  Lightbulb,
  Info,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizTabProps {
  initialLectureId?: string;
  onNavigateToTutorWithMistake: (mistakePrompt: string, topic: string) => void;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  onNavigateToTutorWithMistake
}) => {
  const { dashboardData, setWeakPoints } = useStudentContext();

  const [selectedSubject, setSelectedSubject] = useState<string>('Physics & Mechanics');
  const [selectedChapter, setSelectedChapter] = useState<string>('Derivatives & Limits');
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const questions = [
    {
      id: 'q-1',
      tag: 'Inertia',
      question: "Which physical quantity is the direct scalar measure of an object's inertia?",
      options: [
        'Velocity',
        'Linear momentum',
        'Inertial mass (m)',
        'Net force applied'
      ],
      correctIndex: 2,
      hint: "Consider Newton's first law and the intrinsic quantitative property that resists any change in translational velocity regardless of gravitational pull."
    },
    {
      id: 'q-2',
      tag: 'Incline Forces',
      question: "For a block of mass $m$ at rest on an incline of angle $\theta$, what is the magnitude of the normal force $N$?",
      options: [
        '$N = mg$',
        '$N = mg \cos(\theta)$',
        '$N = mg \sin(\theta)$',
        '$N = mg \tan(\theta)$'
      ],
      correctIndex: 1,
      hint: "Resolve the gravitational force perpendicular to the surface of the ramp."
    }
  ];

  const currentQ = questions[currentQIndex] || questions[0];

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowHint(false);
    } else {
      setIsCompleted(true);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="flex flex-col w-full px-6 lg:px-8 py-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border border-slate-100">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-[#0051d5] font-bold text-xs tracking-wide">
              ADAPTIVE PRACTICE QUIZ
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-xs font-semibold text-slate-500">Newton's Laws Mastery Check</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl">🧠</span>
            <h1 className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">Test Your Mastery</h1>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 text-[#0b1c30] font-bold text-xs px-4 py-2 rounded-full cursor-pointer transition-colors border border-slate-200 outline-none"
          >
            <option>Physics & Mechanics</option>
            <option>Chemistry</option>
            <option>Mathematics</option>
            <option>Biology</option>
          </select>

          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 text-[#0b1c30] font-bold text-xs px-4 py-2 rounded-full cursor-pointer transition-colors border border-slate-200 outline-none"
          >
            <option>Kinematics & Motion</option>
            <option>Derivatives & Limits</option>
            <option>Thermodynamics</option>
            <option>Organic Synthesis</option>
          </select>
        </div>
      </div>

      {/* Main Quiz Area */}
      {!isCompleted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Question Section */}
          <section className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[580px] border border-slate-100">
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0051d5] tracking-tight">
                    Question {currentQIndex + 1} of {questions.length}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    Tag: {currentQ.tag}
                  </span>
                </div>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-[#006947] hover:bg-emerald-100 transition-all text-xs font-bold shadow-2xs active:scale-95 cursor-pointer"
                  type="button"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Hint</span>
                </button>
              </div>

              {/* Hint Box */}
              {showHint && (
                <div className="mb-4 p-4 rounded-2xl bg-emerald-50 text-[#0b1c30] text-xs leading-relaxed border border-emerald-100 flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#006947] shrink-0 mt-0.5" />
                  <span>{currentQ.hint}</span>
                </div>
              )}

              {/* Question Text */}
              <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] leading-snug mb-6">
                <MathRenderer content={currentQ.question} />
              </h2>

              {/* Options */}
              <div className="flex flex-col gap-3">
                {currentQ.options.map((opt, idx) => {
                  const isSel = selectedOption === idx;
                  const letter = String.fromCharCode(65 + idx);

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer border ${
                        isSel
                          ? 'bg-blue-50/70 border-[#0051d5] ring-2 ring-[#0051d5]/30 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSel ? 'bg-[#0051d5] text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {letter}
                      </span>
                      <span className="text-sm text-[#0b1c30] font-medium flex-1">
                        <MathRenderer content={opt} />
                      </span>
                      {isSel && (
                        <CheckCircle2 className="w-5 h-5 text-[#0051d5] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100">
              <button
                disabled={currentQIndex === 0}
                onClick={() => {
                  setCurrentQIndex(prev => Math.max(0, prev - 1));
                  setShowHint(false);
                }}
                className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                type="button"
              >
                Previous
              </button>

              <button
                disabled={selectedOption === null}
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-7 py-2.5 rounded-full bg-[#c2410c] hover:bg-[#ea580c] disabled:opacity-40 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                type="button"
              >
                <span>{currentQIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Right Question Navigator */}
          <aside className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                QUESTION NAVIGATOR
              </h3>
              <span className="text-xs font-bold text-[#0051d5]">{selectedOption !== null ? '1' : '0'}/{questions.length} Answered</span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentQIndex(idx);
                    setShowHint(false);
                  }}
                  className={`h-11 rounded-2xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer ${
                    currentQIndex === idx
                      ? 'bg-[#c2410c] text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                  }`}
                  type="button"
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 bg-slate-50 rounded-2xl p-3 flex flex-col gap-2 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#c2410c]"></span>
                <span className="text-xs text-slate-600 font-medium">Current Active Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                <span className="text-xs text-slate-600 font-medium">Unvisited / Pending</span>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* Results Card */
        <div className="bg-white rounded-3xl p-8 shadow-sm max-w-2xl mx-auto text-center space-y-6 border border-slate-100">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006947] flex items-center justify-center text-3xl mx-auto">
            🏆
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#0b1c30]">Quiz Completed!</h2>
            <p className="text-sm text-slate-600 mt-1">Great job finishing the adaptive practice quiz.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-w-sm mx-auto flex items-center justify-around">
            <div>
              <span className="text-2xl font-black text-[#0051d5]">100%</span>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Accuracy</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-2xl font-black text-[#006947]">{questions.length}/{questions.length}</span>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Score</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCompleted(false);
              setCurrentQIndex(0);
              setSelectedOption(null);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c2410c] text-white rounded-full font-bold text-xs cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>
        </div>
      )}
    </div>
  );
};
