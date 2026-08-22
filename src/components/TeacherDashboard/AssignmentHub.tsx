import React, { useState } from 'react';
import { Assignment, Submission, Subject, RubricItem } from '../../types';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Paperclip,
  Award,
  ChevronRight,
  Eye,
  Send,
  User,
  ShieldAlert
} from 'lucide-react';

interface AssignmentHubProps {
  activeSubject: Subject;
  assignments: Assignment[];
  onCreateAssignment: (assignment: Partial<Assignment>) => Promise<void>;
  onGradeSubmission: (submissionId: string, grade: number, feedback: string) => Promise<void>;
  fetchSubmissionsForAssignment: (assignmentId: string) => Promise<Submission[]>;
}

export const AssignmentHub: React.FC<AssignmentHubProps> = ({
  activeSubject,
  assignments,
  onCreateAssignment,
  onGradeSubmission,
  fetchSubmissionsForAssignment
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Form states for creating assignment
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [richInstructions, setRichInstructions] = useState('');
  const [points, setPoints] = useState('100');
  const [dueDate, setDueDate] = useState('2026-08-31T23:59');
  const [strictDueDate, setStrictDueDate] = useState(true);
  const [tags, setTags] = useState('');
  const [rubrics, setRubrics] = useState<RubricItem[]>([
    { criterion: 'Theoretical Proof Correctness', maxPoints: 40, description: 'Sound inductive argument and base cases.' },
    { criterion: 'Algorithmic Implementation', maxPoints: 40, description: 'Clean compilation and test fixture pass rate.' },
    { criterion: 'Empirical Benchmark & Report', maxPoints: 20, description: 'Clear complexity curve fitting.' }
  ]);

  // Grading form states
  const [gradeInput, setGradeInput] = useState<number>(90);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  const handleOpenSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    const data = await fetchSubmissionsForAssignment(assignment.id);
    setSubmissions(data);
    setLoadingSubmissions(false);
    if (data.length > 0) {
      handleSelectSubmission(data[0]);
    } else {
      setActiveSubmission(null);
    }
  };

  const handleSelectSubmission = (sub: Submission) => {
    setActiveSubmission(sub);
    setGradeInput(sub.grade !== undefined ? sub.grade : (sub.aiSuggestedGrade || 85));
    setFeedbackInput(sub.feedback || sub.aiFeedbackSummary || 'Good work on this problem set.');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;
    await onGradeSubmission(activeSubmission.id, gradeInput, feedbackInput);
    // update local state
    const updated = submissions.map(s => s.id === activeSubmission.id ? { ...s, grade: gradeInput, feedback: feedbackInput, status: 'graded' as const } : s);
    setSubmissions(updated);
    setActiveSubmission({ ...activeSubmission, grade: gradeInput, feedback: feedbackInput, status: 'graded' });
  };

  const handleCreateAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateAssignment({
      subjectId: activeSubject.id,
      title,
      description,
      richTextInstructions: richInstructions || description,
      points: Number(points) || 100,
      dueDate,
      strictDueDate,
      attachments: ['starter_template.zip'],
      rubric: rubrics,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setRichInstructions('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm text-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-slate-950 text-blue-400 font-mono border border-slate-800">
              {activeSubject.code}
            </span>
            <h2 className="text-base font-bold uppercase tracking-tight text-white">
              Assignment & Evaluation Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            BML Munjal University · Create coursework, configure rubric parameters, and evaluate 1st Year cohort submissions with Gemini AI grading support.
          </p>
        </div>

        <button
          id="assignment-create-new-btn"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Publish New Assignment</span>
        </button>
      </div>

      {/* Main Grid: Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 text-slate-100"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded-sm">
                  {assignment.points} PTS
                </span>
                {assignment.strictDueDate && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-rose-300 bg-rose-950 border border-rose-800 px-1.5 py-0.5 rounded-sm">
                    <Clock className="w-3 h-3 text-rose-400" />
                    Strict Deadline
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-white line-clamp-2">
                  {assignment.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {assignment.description}
                </p>
              </div>

              {/* Tags & Due Date */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-[11px]">Due: <strong className="text-slate-200">{new Date(assignment.dueDate).toLocaleDateString()}</strong> at {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-[11px]">{assignment.submissionCount || 0} / {activeSubject.enrolledCount || 15} Submitted</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenSubmissions(assignment)}
              className="w-full py-1.5 px-3 rounded-sm bg-slate-950 hover:bg-blue-950 hover:text-blue-300 text-slate-300 text-xs font-semibold border border-slate-800 hover:border-blue-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Review Submissions & Grade</span>
            </button>
          </div>
        ))}
      </div>

      {/* Submissions Review Modal / Drawer */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-md max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95 text-slate-100">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Submission Assessment
                </span>
                <h3 className="font-bold text-sm text-white">
                  {selectedAssignment.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-sm hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Split Screen: Left Submissions List, Right Grading Pane */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              {/* Left Submissions List */}
              <div className="md:col-span-4 border-r border-slate-800 overflow-y-auto p-3 space-y-2 bg-slate-950">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 font-mono">
                  Cohort Submissions ({submissions.length})
                </p>

                {submissions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No submissions received yet.
                  </div>
                ) : (
                  submissions.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectSubmission(sub)}
                      className={`w-full text-left p-3 rounded-sm border transition-all text-xs space-y-1.5 ${
                        activeSubmission?.id === sub.id
                          ? 'bg-blue-950/80 border-blue-700 text-white font-semibold shadow-xs'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{sub.studentName}</span>
                        {sub.status === 'graded' ? (
                          <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded-sm font-bold">
                            {sub.grade} / {sub.maxPoints || 100}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded-sm font-bold">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{sub.studentEmail}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {new Date(sub.submittedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </button>
                  ))
                )}
              </div>

              {/* Right Grading & Student Submission Viewer */}
              <div className="md:col-span-8 overflow-y-auto p-5 space-y-5 bg-slate-900">
                {activeSubmission ? (
                  <div className="space-y-6">
                    {/* Student Info Header */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-sm border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          {activeSubmission.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{activeSubmission.studentName}</p>
                          <p className="text-xs text-slate-400 font-mono">{activeSubmission.studentEmail}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-slate-400">Timestamp: </span>
                        <span className="font-mono text-slate-200">
                          {new Date(activeSubmission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Submission Text Content */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Student Submission Solution & Code
                      </h4>
                      <div className="bg-slate-950 p-4 rounded-sm border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
                        {activeSubmission.submissionText}
                      </div>
                    </div>

                    {/* Attached File */}
                    {activeSubmission.fileAttachment && (
                      <div className="flex items-center gap-2 p-3 bg-blue-950/50 rounded-sm border border-blue-800 text-xs text-blue-200 font-mono">
                        <Paperclip className="w-4 h-4 text-blue-400" />
                        <span>Attached File: <strong>{activeSubmission.fileAttachment}</strong></span>
                      </div>
                    )}

                    {/* AI Evaluation Suggestion Box */}
                    {activeSubmission.aiSuggestedGrade && (
                      <div className="p-4 rounded-sm bg-slate-950 border border-blue-800 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-blue-300 font-bold">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="uppercase text-[10px] tracking-wide">Gemini AI Evaluation Assist</span>
                          </div>
                          <span className="font-mono font-bold text-blue-300 bg-blue-950 border border-blue-700 px-2 py-0.5 rounded-sm">
                            Suggested: {activeSubmission.aiSuggestedGrade} / 100
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {activeSubmission.aiFeedbackSummary}
                        </p>
                      </div>
                    )}

                    {/* Faculty Grading Form */}
                    <form onSubmit={handleSaveGrade} className="p-4 bg-slate-950 rounded-sm border border-slate-800 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-tight text-white">
                        Faculty Grade & Official Feedback
                      </h4>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                            Score (0 - {selectedAssignment.points})
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={selectedAssignment.points}
                            required
                            value={gradeInput}
                            onChange={(e) => setGradeInput(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-sm focus:outline-none focus:border-blue-500 font-mono font-bold text-blue-400"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                            Instructor Feedback
                          </label>
                          <input
                            type="text"
                            value={feedbackInput}
                            onChange={(e) => setFeedbackInput(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            placeholder="Provide constructive feedback notes..."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-sm text-xs font-semibold hover:bg-blue-500 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish Verified Grade</span>
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    Select a student submission on the left to grade.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Assignment */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateAssignmentSubmit} className="bg-slate-900 rounded-md max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-800 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-tight text-white">
                Publish New Course Assignment
              </h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Problem Set 3: Pointer Arithmetic & Structs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Total Points</label>
                  <input
                    type="number"
                    required
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Due Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="strictCheck"
                  checked={strictDueDate}
                  onChange={(e) => setStrictDueDate(e.target.checked)}
                  className="rounded-xs text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-700"
                />
                <label htmlFor="strictCheck" className="text-xs font-medium text-slate-300">
                  Enforce strict due date lock (automatically penalize or lock late submissions)
                </label>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Brief Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="Brief 1-2 sentence overview..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Detailed Markdown Instructions & Proof Prompts</label>
                <textarea
                  rows={4}
                  value={richInstructions}
                  onChange={(e) => setRichInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="### Specific Tasks:&#10;1. Implement Dynamic Array in C...&#10;2. Analyze memory leaks with Valgrind..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Topic Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="Pointers, Dynamic Memory, Valgrind"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-sm text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-xs"
              >
                Publish Assignment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
