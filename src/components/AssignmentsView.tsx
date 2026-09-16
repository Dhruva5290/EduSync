import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  Play,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { AssignmentItem } from '../types';

interface AssignmentsViewProps {
  assignments: AssignmentItem[];
  onAskTutorAssignment: (title: string) => void;
  onSubmitAssignment: (id: string) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  onAskTutorAssignment,
  onSubmitAssignment,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('All Subjects');
  const [valgrindRunning, setValgrindRunning] = useState<boolean>(false);
  const [valgrindSuccess, setValgrindSuccess] = useState<boolean>(false);
  const [activeFeedbackModal, setActiveFeedbackModal] = useState<AssignmentItem | null>(null);

  const filtered = assignments.filter((asg) => {
    if (filter === 'pending' && asg.status !== 'pending') return false;
    if (filter === 'submitted' && asg.status !== 'submitted') return false;
    if (filter === 'graded' && asg.status !== 'graded') return false;
    if (subjectFilter !== 'All Subjects' && !asg.subject.includes(subjectFilter)) {
      return false;
    }
    return true;
  });

  const runValgrind = () => {
    setValgrindRunning(true);
    setTimeout(() => {
      setValgrindRunning(false);
      setValgrindSuccess(true);
    }, 1500);
  };

  const counts = {
    all: assignments.length,
    pending: assignments.filter((a) => a.status === 'pending').length,
    submitted: assignments.filter((a) => a.status === 'submitted').length,
    graded: assignments.filter((a) => a.status === 'graded').length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1520px] mx-auto w-full">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5a4138]">
          <span>ClassSarthi</span>
          <span>&gt;</span>
          <span className="text-[#0b1c30]">Assignments</span>
          <span className="ml-auto flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#0051d5]" />
            <span>Fall 2024 Academic Term</span>
            <span>•</span>
            <span className="text-gray-400">Sync status: Synced 3m ago</span>
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#a33900] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
                Assignments & Problem Sets
              </h1>
              <p className="text-xs text-[#5a4138]">
                Submit coursework, review faculty rubrics, and track automated grading diagnostics with real-time sync across enrolled courses.
              </p>
            </div>
          </div>

          {/* Filter badges */}
          <div className="flex items-center gap-1.5 bg-[#eff4ff] p-1 rounded-full border border-[#dce9ff]/60 self-start md:self-auto overflow-x-auto">
            {(['all', 'pending', 'submitted', 'graded'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all capitalize whitespace-nowrap ${
                  filter === tab
                    ? 'bg-[#a33900] text-white shadow-xs'
                    : 'text-[#5a4138] hover:text-[#0b1c30]'
                }`}
              >
                {tab} ({counts[tab]})
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-white text-xs font-semibold text-[#0b1c30] px-3.5 py-1.5 rounded-full border border-[#dce9ff] outline-none cursor-pointer shadow-2xs"
          >
            <option value="All Subjects">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Environmental Science">Environmental Science</option>
          </select>

          <span className="text-xs font-semibold text-[#5a4138]">
            Due Date (Urgent First) ⇅
          </span>
        </div>
      </div>

      {/* Main Grid: 8 cols content + 4 cols sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Urgent featured card + Assignment list */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Urgent Featured Card: HC Verma Ch 5 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-2 border-[#ffdbce] relative overflow-hidden flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  Due in 2 days • Urgent
                </span>
                <span className="text-xs text-[#5a4138]">
                  Physics 11 (Mechanics) • Dr. Rajesh Kulkarni • 100 pts • 3 Rubric Criteria
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex flex-col gap-2 max-w-xl">
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0b1c30]">
                  HC Verma Ch 5: Problems 4–9 on Connected Pulleys & Inclined Planes
                </h3>
                <p className="text-xs text-[#5a4138] leading-relaxed">
                  Analyze free body diagrams for objects on 30° ramp with kinetic friction μk = 0.25. Derive equations of motion in LaTeX and attach free body sketch or assignment PDF.
                </p>
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#6ffbbe]/30 text-[#005236] text-[11px] font-bold">
                    <CheckCircle className="w-3 h-3" />
                    Digital Submission Ready
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#dbe1ff] text-[#003ea8] text-[11px] font-bold">
                    Automated Kinematics Sim Available
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0 min-w-[170px]">
                <button
                  onClick={() => onSubmitAssignment('asg-urgent')}
                  className="w-full bg-[#cc4900] hover:bg-[#a33900] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Submit Solution</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => onAskTutorAssignment('Connected Pulleys & Inclined Planes')}
                  className="w-full bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Lecture Clip (21:05)</span>
                </button>
                <button
                  onClick={() => onAskTutorAssignment('HC Verma Ch 5 Incline problem')}
                  className="w-full text-[#a33900] hover:underline px-4 py-1 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Tutor on this</span>
                </button>
              </div>
            </div>
          </div>

          {/* Standard Assignment Cards List */}
          <div className="flex flex-col gap-4">
            {filtered.map((item) => {
              if (item.id === 'asg-urgent') return null; // already shown in hero

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-3 hover:border-[#dce9ff] transition-all"
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          item.status === 'graded'
                            ? 'text-[#006947]'
                            : item.status === 'submitted'
                            ? 'text-[#0051d5]'
                            : 'text-[#ba1a1a]'
                        }`}
                      >
                        • {item.dueDate}
                      </span>
                      <span className="text-xs text-[#5a4138]">
                        {item.subject} • {item.points} pts
                      </span>
                    </div>

                    {item.latePenalty && (
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#ba1a1a] block">
                          Critical Deadline
                        </span>
                        <span className="text-[10px] text-[#5a4138]">
                          Late penalty: {item.latePenalty}
                        </span>
                      </div>
                    )}

                    {item.grade && (
                      <span className="text-xl font-extrabold text-[#006947]">
                        {item.score}%
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0b1c30]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#5a4138] mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] text-[11px] font-semibold border border-[#dce9ff]/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Feedback quote if graded */}
                  {item.feedback && (
                    <div className="bg-[#eff4ff]/60 rounded-2xl p-4 border border-[#dce9ff] flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#006947]">
                        <span>Feedback from Prof. Vikramaditya Roy</span>
                        <span>Graded Sep 11</span>
                      </div>
                      <p className="italic text-[#5a4138] whitespace-pre-line mt-1">
                        {item.feedback}
                      </p>
                    </div>
                  )}

                  {/* Submitted file info */}
                  {item.submittedFile && (
                    <div className="flex items-center gap-2 text-xs text-[#0051d5] font-semibold bg-[#eff4ff] px-3 py-2 rounded-xl">
                      <span>📄</span>
                      <span>Submitted Yesterday at 18:30 • {item.submittedFile}</span>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-[#eff4ff]">
                    {item.rubricSummary && (
                      <span className="text-xs text-[#5a4138]">
                        Rubric: {item.rubricSummary}
                      </span>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      {/* Valgrind Check button for CS problem set */}
                      {item.id === 'asg-1' && (
                        <button
                          onClick={runValgrind}
                          disabled={valgrindRunning}
                          className="px-4 py-1.5 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {valgrindRunning ? (
                            <span>Checking memory leaks...</span>
                          ) : valgrindSuccess ? (
                            <span className="text-[#006947]">✓ Valgrind Clean (0 leaks)</span>
                          ) : (
                            <span>Run Valgrind Check</span>
                          )}
                        </button>
                      )}

                      {item.status === 'pending' && (
                        <button
                          onClick={() => onSubmitAssignment(item.id)}
                          className="px-5 py-2 rounded-full bg-[#a33900] hover:bg-[#cc4900] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload & Submit</span>
                        </button>
                      )}

                      {item.status === 'graded' && (
                        <button
                          onClick={() => setActiveFeedbackModal(item)}
                          className="px-4 py-1.5 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] text-xs font-bold transition-colors cursor-pointer"
                        >
                          View Graded Feedback & Rubric
                        </button>
                      )}

                      {item.status === 'submitted' && (
                        <button
                          onClick={() => setActiveFeedbackModal(item)}
                          className="px-4 py-1.5 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] text-xs font-bold transition-colors cursor-pointer"
                        >
                          View Submission Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Submission Diagnostics, VisionNote OCR, Rubrics */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Submission Diagnostics Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0051d5]" />
                <h3 className="font-bold text-sm text-[#0b1c30]">
                  Submission Diagnostics
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#5a4138]">
                Semester Avg
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#eff4ff]/60 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-2xl font-extrabold text-[#0051d5]">85%</span>
                <span className="text-[10px] uppercase font-bold text-[#5a4138]">
                  On-Time Rate
                </span>
              </div>
              <div className="bg-[#eff4ff]/60 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-2xl font-extrabold text-[#006947]">91.4%</span>
                <span className="text-[10px] uppercase font-bold text-[#5a4138]">
                  Average Grade
                </span>
              </div>
            </div>

            {/* Course distribution bars */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5a4138]">Course Distribution</span>
                <span className="font-bold text-[#0b1c30]">Points Earned</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] pb-1">
                    <span className="font-semibold text-[#0b1c30]">Physics 11</span>
                    <span className="text-[#5a4138]">88 / 100</span>
                  </div>
                  <div className="w-full bg-[#eff4ff] rounded-full h-2">
                    <div className="bg-[#0051d5] h-2 rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] pb-1">
                    <span className="font-semibold text-[#0b1c30]">Mathematics 11</span>
                    <span className="text-[#5a4138]">94 / 100</span>
                  </div>
                  <div className="w-full bg-[#eff4ff] rounded-full h-2">
                    <div className="bg-[#0051d5] h-2 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] pb-1">
                    <span className="font-semibold text-[#0b1c30]">Computer Science</span>
                    <span className="text-[#5a4138]">92 / 100</span>
                  </div>
                  <div className="w-full bg-[#eff4ff] rounded-full h-2">
                    <div className="bg-[#0051d5] h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-[#5a4138] pt-2 border-t border-[#eff4ff] flex items-center justify-between">
              <span>Pending faculty reviews</span>
              <strong className="text-[#0051d5]">1 Submission</strong>
            </div>
          </div>

          {/* Standard Rubric Reference Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#0b1c30]">
              <ShieldCheck className="w-4 h-4 text-[#0051d5]" />
              <span>Standard Rubric Reference</span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between font-semibold text-[#0b1c30]">
                  <span>1. Theoretical Rigor & Correctness</span>
                  <span className="text-[#0051d5]">40%</span>
                </div>
                <p className="text-[11px] text-[#5a4138] mt-0.5">
                  Underlying physics/mathematical validity, edge-case coverage, and logical theorem continuity.
                </p>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-[#0b1c30]">
                  <span>2. Mathematical Formulation & LaTeX</span>
                  <span className="text-[#0051d5]">40%</span>
                </div>
                <p className="text-[11px] text-[#5a4138] mt-0.5">
                  Clean notation formatting, explicit intermediate steps, and proper variable definitions.
                </p>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-[#0b1c30]">
                  <span>3. Units & Diagram Accuracy</span>
                  <span className="text-[#0051d5]">20%</span>
                </div>
                <p className="text-[11px] text-[#5a4138] mt-0.5">
                  SI dimensional consistency, coordinate arrows, free body vectors, and legend labels.
                </p>
              </div>
            </div>

            <a
              href="#"
              className="text-[#0051d5] font-semibold text-xs hover:underline flex items-center gap-1 pt-2 border-t border-[#eff4ff]"
            >
              <span>View Departmental Policy Document</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Submission / Feedback Modal */}
      {activeFeedbackModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#e2e8f0] flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
              <h3 className="font-bold text-base text-[#0b1c30]">
                {activeFeedbackModal.title}
              </h3>
              <button
                onClick={() => setActiveFeedbackModal(null)}
                className="w-7 h-7 rounded-full bg-[#eff4ff] text-[#5a4138] flex items-center justify-center hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <span className="font-semibold text-[#006947]">
                Status: {activeFeedbackModal.status.toUpperCase()}
              </span>
              <p className="text-[#5a4138] leading-relaxed">
                {activeFeedbackModal.description}
              </p>
              {activeFeedbackModal.feedback && (
                <div className="bg-[#eff4ff] p-3 rounded-xl border border-[#dce9ff] mt-2">
                  <span className="font-bold text-[#006947] block mb-1">
                    Evaluator Feedback:
                  </span>
                  <p className="italic text-[#0b1c30] whitespace-pre-line">
                    {activeFeedbackModal.feedback}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setActiveFeedbackModal(null)}
              className="mt-2 w-full py-2.5 bg-[#a33900] text-white font-bold text-xs rounded-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
