import React, { useState } from 'react';
import {
  CheckSquare,
  FileText,
  User,
  Sparkles,
  CheckCircle2,
  Sliders,
  Send,
  Clock,
  Award,
} from 'lucide-react';
import { StudentSubmission, RubricCriterion } from '../types';

interface RubricGraderViewProps {
  submissions: StudentSubmission[];
  onGradeSubmission: (
    submissionId: string,
    score: number,
    feedback: string,
    rubricGrades: Record<string, number>
  ) => void;
}

export const RubricGraderView: React.FC<RubricGraderViewProps> = ({
  submissions,
  onGradeSubmission,
}) => {
  const [selectedSubId, setSelectedSubId] = useState<string>(submissions[0]?.id || '');
  const activeSub = submissions.find((s) => s.id === selectedSubId) || submissions[0];

  // Rubric criteria definitions
  const criteria: RubricCriterion[] = [
    {
      id: 'crit-1',
      criterion: 'Physical Model & Free Body Diagram',
      maxPoints: 40,
      description: 'Clear isolation of vectors, coordinate axes tilt along ramp, and normal force perpendicular alignment.',
    },
    {
      id: 'crit-2',
      criterion: 'Mathematical Formulation & Resolution',
      maxPoints: 40,
      description: 'Correct equations: N = mg cos(θ), downhill force mg sin(θ) - f_k, and mass cancellation.',
    },
    {
      id: 'crit-3',
      criterion: 'Numerical Precision & Unit Consistency',
      maxPoints: 20,
      description: 'Correct calculations to 3 significant figures with standard SI units (m/s², Newtons).',
    },
  ];

  const [scores, setScores] = useState<Record<string, number>>({
    'crit-1': activeSub?.rubricGrades?.['crit-1'] ?? 38,
    'crit-2': activeSub?.rubricGrades?.['crit-2'] ?? 38,
    'crit-3': activeSub?.rubricGrades?.['crit-3'] ?? 18,
  });

  const [facultyFeedback, setFacultyFeedback] = useState<string>(
    activeSub?.feedback ||
      'Solid step-by-step vector resolution. Free body diagram isolates vectors cleanly. Good dimensional check.'
  );
  const [gradeSubmitted, setGradeSubmitted] = useState<boolean>(false);

  // Sync when selected sub changes
  React.useEffect(() => {
    if (activeSub) {
      setScores({
        'crit-1': activeSub.rubricGrades?.['crit-1'] ?? (activeSub.status === 'graded' ? 38 : 36),
        'crit-2': activeSub.rubricGrades?.['crit-2'] ?? (activeSub.status === 'graded' ? 39 : 38),
        'crit-3': activeSub.rubricGrades?.['crit-3'] ?? (activeSub.status === 'graded' ? 19 : 18),
      });
      setFacultyFeedback(
        activeSub.feedback ||
          'Solid step-by-step vector resolution. Free body diagram isolates vectors cleanly. Good dimensional check.'
      );
      setGradeSubmitted(false);
    }
  }, [selectedSubId]);

  const totalScore = Object.values(scores).reduce((a: number, b: number) => a + b, 0);

  const handleScoreChange = (critId: string, val: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, val));
    setScores((prev) => ({ ...prev, [critId]: clamped }));
  };

  const handleSubmitGrade = () => {
    if (!activeSub) return;
    onGradeSubmission(activeSub.id, totalScore, facultyFeedback, scores);
    setGradeSubmitted(true);
    setTimeout(() => setGradeSubmitted(false), 3500);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#0051d5]">
              Faculty Evaluation Suite
            </span>
            <span className="text-xs text-[#5a4138]">Weighted 3-Criterion Rubric</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-1">
            Rubric Grading & Submissions
          </h1>
          <p className="text-sm text-[#5a4138]">
            Review student homework derivations, apply weighted rubric criteria, and push feedback to student portals.
          </p>
        </div>
      </div>

      {/* Main Grader Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Submissions Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5a4138]">
              Submissions Queue ({submissions.length})
            </span>
            <span className="text-xs font-semibold text-[#0051d5]">Problem Set #3</span>
          </div>

          <div className="space-y-2">
            {submissions.map((sub) => {
              const isSelected = sub.id === activeSub?.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                    isSelected
                      ? 'bg-[#eff4ff] border-[#0051d5] shadow-xs'
                      : 'bg-[#fcfdff] border-[#eff4ff] hover:bg-[#f8f9ff]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#a33900] text-white flex items-center justify-center text-xs font-bold">
                        {sub.studentAvatar}
                      </div>
                      <span className="text-xs font-bold text-[#0b1c30]">
                        {sub.studentName}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        sub.status === 'graded'
                          ? 'bg-[#e6f4ea] text-[#006947]'
                          : 'bg-[#fff3ea] text-[#a33900]'
                      }`}
                    >
                      {sub.status === 'graded' ? `Graded: ${sub.score}/100` : 'Pending Review'}
                    </span>
                  </div>

                  <p className="text-xs text-[#5a4138] line-clamp-2 font-mono">
                    {sub.solutionText.split('\n')[0]}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#5a4138] pt-1 border-t border-black/5">
                    <span>{sub.submittedAt}</span>
                    <span className="font-semibold text-[#0051d5]">
                      {sub.attachedFileName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Workstation & Rubric Sliders */}
        {activeSub ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Student Solution Box */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#eff4ff]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[#0b1c30]">
                      {activeSub.studentName}
                    </span>
                    <span className="text-xs text-[#5a4138]">({activeSub.studentEmail})</span>
                  </div>
                  <p className="text-xs text-[#0051d5] font-semibold mt-0.5">
                    {activeSub.assignmentTitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#5a4138]">Attached File:</span>
                  <span className="px-2.5 py-1 bg-[#eff4ff] text-[#00318b] rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {activeSub.attachedFileName}
                  </span>
                </div>
              </div>

              {/* Student Solution Text */}
              <div className="p-4 bg-[#f8f9ff] border border-[#eff4ff] rounded-xl font-mono text-xs text-[#0b1c30] leading-relaxed whitespace-pre-wrap select-all">
                {activeSub.solutionText}
              </div>

              {/* AI Diagnostic Pre-Check */}
              <div className="p-3.5 bg-[#eff4ff] border border-[#0051d5]/20 rounded-xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#0051d5] flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-[#00318b]">
                    AI Diagnostic Rubric Suggestion: {activeSub.aiSuggestedGrade || 94}/100
                  </span>
                  <p className="text-[#5a4138]">
                    {activeSub.aiFeedbackSummary ||
                      'Physical model identifies normal reaction perpendicular constraint correctly. Step-by-step resolution has no arithmetic flaws.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rubric Evaluation Panel */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
                <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#a33900]" />
                  Weighted Criterion Scoring
                </h3>

                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-[#5a4138]">Computed Total:</span>
                  <span className="text-2xl font-black text-[#a33900]">{totalScore}</span>
                  <span className="text-xs font-bold text-[#5a4138]">/ 100</span>
                </div>
              </div>

              <div className="space-y-6">
                {criteria.map((crit) => {
                  const currentScore = scores[crit.id] ?? 0;
                  return (
                    <div key={crit.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-[#0b1c30] text-sm block">
                            {crit.criterion}
                          </span>
                          <p className="text-[#5a4138] text-xs">{crit.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={crit.maxPoints}
                            value={currentScore}
                            onChange={(e) =>
                              handleScoreChange(crit.id, parseInt(e.target.value) || 0, crit.maxPoints)
                            }
                            className="w-16 p-1.5 bg-[#f8f9ff] border border-[#e2e8f0] rounded-lg text-center font-bold text-sm text-[#0b1c30] outline-none focus:border-[#0051d5]"
                          />
                          <span className="font-bold text-[#5a4138]">/ {crit.maxPoints}</span>
                        </div>
                      </div>

                      {/* Range slider for rapid input */}
                      <input
                        type="range"
                        min={0}
                        max={crit.maxPoints}
                        value={currentScore}
                        onChange={(e) =>
                          handleScoreChange(crit.id, parseInt(e.target.value), crit.maxPoints)
                        }
                        className="w-full accent-[#0051d5] cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Feedback Editor */}
              <div className="space-y-2 pt-4 border-t border-[#eff4ff]">
                <label className="text-xs font-bold text-[#5a4138] block">
                  Faculty Constructive Feedback:
                </label>
                <textarea
                  rows={3}
                  value={facultyFeedback}
                  onChange={(e) => setFacultyFeedback(e.target.value)}
                  className="w-full p-3 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-medium text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#0051d5]/30 leading-relaxed"
                  placeholder="Provide targeted guidance, point out exceptional steps or areas for improvement..."
                />
              </div>

              {gradeSubmitted && (
                <div className="p-3 bg-[#e6f4ea] border border-[#006947]/30 text-[#006947] rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Grade {totalScore}/100 and rubric feedback dispatched to {activeSub.studentName}'s portal!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleSubmitGrade}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#a33900] hover:bg-[#822d00] text-white rounded-xl text-xs font-bold shadow-[0_2px_8px_rgba(163,57,0,0.25)] transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Publish Grade & Feedback</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-[#5a4138]">
            <p>No submission selected</p>
          </div>
        )}
      </div>
    </div>
  );
};
