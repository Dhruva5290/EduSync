import React, { useState, useEffect } from 'react';
import { LectureMasteryQuiz, QuizEvaluationResult, User } from '../../types';
import { MathRenderer } from '../Common/MathRenderer';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Brain,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MasteryQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectureId: string;
  lectureTitle: string;
  currentUser: User;
  onOpenTutorWithMistake?: (prompt: string, lectureContext: any) => void;
}

export const MasteryQuizModal: React.FC<MasteryQuizModalProps> = ({
  isOpen,
  onClose,
  lectureId,
  lectureTitle,
  currentUser,
  onOpenTutorWithMistake
}) => {
  const [quiz, setQuiz] = useState<LectureMasteryQuiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<QuizEvaluationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchQuiz = async () => {
      setLoading(true);
      setEvaluation(null);
      setUserAnswers({});
      setCurrentIdx(0);
      try {
        const res = await fetch(`/api/lectures/${lectureId}/mastery-quiz`);
        if (res.ok) {
          const data = await res.json();
          setQuiz(data.quiz);
        }
      } catch (err) {
        console.error('Failed to load mastery quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [isOpen, lectureId]);

  if (!isOpen) return null;

  const handleSelect = (optionIdx: number) => {
    if (evaluation) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentIdx]: optionIdx
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/lectures/${lectureId}/quiz-evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          answers: userAnswers
        })
      });
      if (res.ok) {
        const result: QuizEvaluationResult = await res.json();
        setEvaluation(result);

        if (result.percentage >= 70) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch {}
        }
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentIdx];
  const allAnswered = questions.length > 0 && questions.every((_, i) => userAnswers[i] !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Mastery Checkpoint
              </span>
              <span className="text-xs text-slate-400 font-medium truncate max-w-md">{lectureTitle}</span>
            </div>
            <h2 className="text-lg font-bold text-white">Lecture Concept Mastery Assessment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
              <p className="text-xs">Generating lecture diagnostic questions...</p>
            </div>
          ) : evaluation ? (
            /* =========================================================================
               POST-QUIZ PEDAGOGICAL DIAGNOSTIC BREAKDOWN (Understood vs Needs Revision)
               ========================================================================= */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Score & Mastery Header */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-mono uppercase text-slate-400 font-semibold">Assessment Result</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-white">{evaluation.score} / {evaluation.total}</span>
                    <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                      evaluation.percentage >= 70 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {evaluation.percentage}% Score
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] block text-slate-400">Understood: <strong>{evaluation.understoodConcepts.length}</strong></span>
                    <span className="text-[11px] block text-rose-400">Needs Revision: <strong>{evaluation.weakConcepts.length}</strong></span>
                  </div>
                </div>
              </div>

              {/* 2-Box Conceptual Diagnostic Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Understood Concepts Box */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-emerald-300">
                      You Understood
                    </h3>
                  </div>
                  {evaluation.understoodConcepts.length > 0 ? (
                    <ul className="space-y-1.5">
                      {evaluation.understoodConcepts.map((concept, i) => (
                        <li key={i} className="text-xs text-slate-200 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span>{concept}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No concepts fully mastered yet. Review the lecture notes below.</p>
                  )}
                </div>

                {/* Needs Revision Box */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-rose-300">
                      Needs Revision
                    </h3>
                  </div>
                  {evaluation.weakConcepts.length > 0 ? (
                    <ul className="space-y-1.5">
                      {evaluation.weakConcepts.map((concept, i) => (
                        <li key={i} className="text-xs text-rose-200 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                          <span>{concept}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-300 font-semibold">Zero weak concepts identified. Excellent work!</p>
                  )}
                </div>
              </div>

              {/* Recommendations Section */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">Recommended Next Steps</h4>
                <ul className="space-y-1">
                  {evaluation.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* One-Click AI Tutor Handoff with Pre-injected Context */}
              {evaluation.weakConcepts.length > 0 && onOpenTutorWithMistake && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border border-indigo-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-amber-300" />
                      <span>Struggling with {evaluation.weakConcepts[0]}?</span>
                    </p>
                    <p className="text-[11px] text-slate-300">
                      The AI Tutor already has your specific quiz errors and lecture timestamps loaded.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTutorWithMistake(
                        evaluation.suggestedTutorPrompt,
                        {
                          lectureId,
                          lectureTitle,
                          weakConcepts: evaluation.weakConcepts,
                          quizMistake: evaluation.questionBreakdown.find(q => !q.isCorrect)
                        }
                      );
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
                  >
                    <span>Ask AI Tutor Why I Was Wrong</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Detailed Question Review */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">Question-by-Question Review</h4>
                <div className="space-y-3">
                  {evaluation.questionBreakdown.map((q, idx) => (
                    <div
                      key={q.questionId}
                      className={`p-3.5 rounded-xl border ${
                        q.isCorrect
                          ? 'bg-slate-950/40 border-slate-800'
                          : 'bg-rose-950/10 border-rose-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
                        <span className="font-mono font-bold text-slate-400">Question {idx + 1} • {q.conceptTag}</span>
                        <span className="flex items-center gap-1 font-mono text-[10px] text-cyan-400">
                          <Clock className="w-3 h-3" />
                          <span>Ref: {q.timestampRef}</span>
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-100">{q.question}</p>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        <strong className="text-slate-300">Teacher's Explanation:</strong> <MathRenderer content={q.explanation} />
                      </p>
                      {q.misconception && !q.isCorrect && (
                        <p className="text-[11px] text-rose-300 mt-1 bg-rose-950/40 p-2 rounded border border-rose-900/40">
                          <strong>Common Misconception:</strong> {q.misconception}
                        </p>
                      )}
                      {!q.isCorrect && (
                        <div className="pt-2 mt-2 border-t border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-[10px] text-rose-300 font-mono">
                            Need targeted scaffolding for this mistake?
                          </span>
                          <button
                            onClick={() => {
                              onClose();
                              onOpenTutorWithMistake(
                                `I missed Question ${idx + 1} on "${q.conceptTag}" in lecture "${lectureTitle}":
Question: "${q.question}"
Teacher's Explanation: "${q.explanation}"
${q.misconception ? `Misconception: ${q.misconception}` : ''}

Can you walk me through this concept step-by-step using interactive Socratic questioning?`,
                                {
                                  lectureId,
                                  lectureTitle,
                                  weakConcepts: [q.conceptTag],
                                  quizMistake: q,
                                  timestampRef: q.timestampRef
                                }
                              );
                            }}
                            className="px-2.5 py-1 rounded bg-gradient-to-r from-rose-900/90 to-indigo-900/90 hover:from-rose-800 hover:to-indigo-800 text-rose-200 border border-rose-700/80 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                          >
                            <Brain className="w-3 h-3 text-rose-300" />
                            <span>Ask AI Tutor Why I Was Wrong</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : currentQuestion ? (
            /* =========================================================================
               ACTIVE QUIZ RUNNER
               ========================================================================= */
            <div className="space-y-6">
              {/* Progress Tracker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Question {currentIdx + 1} of {questions.length}</span>
                  <span className="text-blue-400 font-semibold">{currentQuestion.questionType.toUpperCase()} • Ref: {currentQuestion.timestampRef}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text with KaTeX */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">{currentQuestion.conceptTag}</span>
                <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  <MathRenderer content={currentQuestion.question} />
                </h3>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(optIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/50 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span><MathRenderer content={opt} /></span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Step Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Previous
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => prev + 1)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!allAnswered || isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
                  >
                    {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                    <span>Submit Mastery Checkpoint</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">No quiz questions available for this lecture.</p>
          )}
        </div>
      </div>
    </div>
  );
};
