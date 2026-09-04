import React, { useState } from 'react';
import { GeneratedQuiz } from '../../types';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  GraduationCap
} from 'lucide-react';

interface InteractiveQuizModalProps {
  quiz: GeneratedQuiz;
  onClose: () => void;
  onAskAITutor?: (prompt: string, context?: any) => void;
}

export const InteractiveQuizModal: React.FC<InteractiveQuizModalProps> = ({
  quiz,
  onClose,
  onAskAITutor
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = quiz.questions[currentIndex];
  const hasAnsweredCurrent = selectedAnswers[currentIndex] !== undefined;

  const handleSelectOption = (optIdx: number) => {
    if (hasAnsweredCurrent) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optIdx }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      // Calculate score
      let correct = 0;
      quiz.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) correct++;
      });
      const pct = Math.round((correct / quiz.questions.length) * 100);
      if (pct >= 75) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setIsCompleted(false);
  };

  // Calculate final score
  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) correctCount++;
  });
  const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);

  const wrongQuestions = quiz.questions
    .map((q, idx) => ({ q, idx, userAns: selectedAnswers[idx] }))
    .filter(item => item.userAns !== undefined && item.userAns !== item.q.correctIndex);

  const handleAskTutorSingle = (item: { q: any; idx: number; userAns: number }) => {
    if (!onAskAITutor) return;
    onClose();
    onAskAITutor(
      `I took a quiz on "${quiz.title}" and made a mistake on Question ${item.idx + 1}:
Question: "${item.q.question}"
My Answer: "${item.q.options[item.userAns] ?? 'None'}"
Correct Answer: "${item.q.options[item.q.correctIndex]}"
Teacher's Explanation: "${item.q.explanation}"

Can you explain the core physics/conceptual intuition I missed and why my choice was wrong?`,
      { topic: item.q.topic, quizTitle: quiz.title, question: item.q.question }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-md max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-800 animate-in fade-in zoom-in-95 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                  {quiz.title}
                </h3>
                {quiz.hasTeacherQuestions && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    Faculty Bank Applied
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Note-to-Quiz Bridge · {quiz.questions.length} Diagnostic Questions
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm cursor-pointer">
            ✕
          </button>
        </div>

        {!isCompleted ? (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 uppercase">
                <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
                <span>Topic: {currentQ.topic}</span>
              </div>
              <div className="w-full h-1 bg-slate-950 rounded-sm overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="p-4 bg-slate-950 rounded-md border border-slate-800 space-y-2">
              {currentQ.source === 'teacher_question_bank' && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950/80 border border-emerald-700/80 rounded text-[10px] font-bold text-emerald-300 w-fit">
                  <GraduationCap className="w-3 h-3 text-emerald-400" />
                  <span>Curated from Faculty Question Bank {currentQ.teacherName ? `(${currentQ.teacherName})` : ''}</span>
                </div>
              )}
              <p className="text-xs font-bold text-white leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                const isCorrect = currentQ.correctIndex === optIdx;
                let optStyle = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200';

                if (hasAnsweredCurrent) {
                  if (isCorrect) {
                    optStyle = 'bg-emerald-950/80 border-emerald-700 text-emerald-200 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    optStyle = 'bg-rose-950/80 border-rose-700 text-rose-200';
                  } else {
                    optStyle = 'bg-slate-950/50 border-slate-800 text-slate-500 opacity-50';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={hasAnsweredCurrent}
                    className={`w-full text-left p-3 rounded-md border text-xs flex items-center justify-between transition-all ${optStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-sm bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {hasAnsweredCurrent && (
                      <div>
                        {isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Box */}
            {hasAnsweredCurrent && (
              <div className="p-3 bg-blue-950/60 border border-blue-800 rounded-md text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-blue-300 font-bold font-mono uppercase text-[10px]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Pedagogical Explanation:</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {currentQ.explanation}
                </p>

                {/* Direct Ask AI Tutor button on wrong answer */}
                {selectedAnswers[currentIndex] !== currentQ.correctIndex && onAskAITutor && (
                  <div className="pt-2 border-t border-blue-900/60">
                    <button
                      onClick={() =>
                        handleAskTutorSingle({
                          q: currentQ,
                          idx: currentIndex,
                          userAns: selectedAnswers[currentIndex]
                        })
                      }
                      className="w-full py-2 px-3 bg-gradient-to-r from-rose-900/90 to-indigo-900/90 hover:from-rose-800 hover:to-indigo-800 text-rose-200 border border-rose-700/80 rounded-md text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ask AI Tutor Why I Was Wrong</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                disabled={!hasAnsweredCurrent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                <span>{currentIndex === quiz.questions.length - 1 ? 'View Final Results' : 'Next Question'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Results Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-md bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center mx-auto shadow-xs">
              <Award className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-bold text-lg uppercase tracking-tight text-white">
                {scorePercent >= 80 ? 'Mastery Achieved!' : scorePercent >= 60 ? 'Good Practice Session!' : 'Review Recommended'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                You scored <strong className="text-blue-400 font-mono font-bold text-sm">{scorePercent}%</strong> ({correctCount} of {quiz.questions.length} correct)
              </p>
            </div>

            {/* Wrong Questions Action Gateway */}
            {wrongQuestions.length > 0 && onAskAITutor && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-indigo-950/40 to-slate-950 border border-rose-800/60 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Mistakes to Review ({wrongQuestions.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onAskAITutor(
                        `I just completed the quiz "${quiz.title}" and made mistakes on ${wrongQuestions.length} question(s):
${wrongQuestions.map(w => `- Q${w.idx + 1} (${w.q.topic}): Answered "${w.q.options[w.userAns]}" instead of "${w.q.options[w.q.correctIndex]}"`).join('\n')}

Can you guide me through where my intuition failed on these questions and help me master the underlying principles?`,
                        { quizTitle: quiz.title, wrongQuestionsCount: wrongQuestions.length }
                      );
                    }}
                    className="py-1 px-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Review All in AI Tutor</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {wrongQuestions.map((item) => (
                    <div
                      key={item.idx}
                      className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          Q{item.idx + 1}: {item.q.question}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          <span className="text-rose-400 line-through mr-1.5">You: {item.q.options[item.userAns]}</span>
                          <span className="text-emerald-400">✓ Correct: {item.q.options[item.q.correctIndex]}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleAskTutorSingle(item)}
                        className="py-1 px-2 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Ask Tutor</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-950 rounded-md border border-slate-800 text-xs text-left space-y-1.5">
              <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-mono">
                AI Study Recommendation
              </p>
              <p className="text-slate-400 leading-relaxed">
                {scorePercent >= 80
                  ? 'Excellent conceptual retention from your notes! You are well-prepared for this topic in upcoming quizzes and evaluations.'
                  : 'Review the flagged explanation concepts in your note playground or ask the AI Study Assistant for additional step-by-step walkthroughs.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-xs cursor-pointer"
              >
                Back to Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
