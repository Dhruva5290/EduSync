import React, { useState } from 'react';
import { Subject, Assignment, TimelineItem, ReferenceResource, Submission, User } from '../../types';
import {
  FileText,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Upload,
  BookOpen,
  Award,
  FlaskConical,
  Sparkles,
  Send,
  GraduationCap,
  Layers,
  ChevronRight,
  Building,
  UserCheck,
  Check,
  Filter,
  ArrowRight,
  BookMarked,
  Globe
} from 'lucide-react';

interface ResourceFeedProps {
  currentUser: User;
  subjects: Subject[];
  allSubjects?: Subject[];
  activeSubject: Subject;
  onSelectSubject: (subjectId: string) => void;
  assignments: Assignment[];
  allAssignments?: Assignment[];
  timelines: TimelineItem[];
  allTimelines?: TimelineItem[];
  resources: ReferenceResource[];
  allResources?: ReferenceResource[];
  submissions: Submission[];
  allSubmissions?: Submission[];
  onSubmitAssignment: (assignmentId: string, text: string, file: string) => Promise<void>;
  onNavigateToNotes?: () => void;
}

export const ResourceFeed: React.FC<ResourceFeedProps> = ({
  currentUser,
  subjects,
  allSubjects = [],
  activeSubject,
  onSelectSubject,
  assignments,
  allAssignments = [],
  timelines,
  allTimelines = [],
  resources,
  allResources = [],
  submissions,
  allSubmissions = [],
  onSubmitAssignment,
  onNavigateToNotes
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'active-subject' | 'all-assignments' | 'master-schedule' | 'library'>('overview');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileName, setFileName] = useState('solution_proof.zip');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use full sets if available, otherwise active sets
  const masterSubjects = (allSubjects.length > 0 ? allSubjects : subjects);
  const displaySubjects = currentUser.role === 'student' ? masterSubjects : subjects;
  const masterAssignments = allAssignments.length > 0 ? allAssignments : assignments;
  const masterTimelines = allTimelines.length > 0 ? allTimelines : timelines;
  const masterResources = allResources.length > 0 ? allResources : resources;
  const masterSubmissions = allSubmissions.length > 0 ? allSubmissions : submissions;

  // Filtered assignments
  const filteredAssignments = selectedSubjectFilter === 'all'
    ? masterAssignments
    : masterAssignments.filter(a => a.subjectId === selectedSubjectFilter);

  // Filtered timelines
  const filteredTimelines = selectedSubjectFilter === 'all'
    ? masterTimelines
    : masterTimelines.filter(t => t.subjectId === selectedSubjectFilter);

  // Filtered resources
  const filteredResources = selectedSubjectFilter === 'all'
    ? masterResources
    : masterResources.filter(r => r.subjectId === selectedSubjectFilter);

  const handleOpenSubmit = (assignment: Assignment) => {
    setSelectedAssignmentForSubmit(assignment);
    const existing = masterSubmissions.find(s => s.assignmentId === assignment.id);
    if (existing) {
      setSubmissionText(existing.submissionText);
      setFileName(existing.fileAttachment || 'solution_proof.zip');
    } else {
      setSubmissionText(`### Solution for ${assignment.title}\n\n1. Mathematical Proof & Analysis:\n\n2. Implementation Details:\n`);
    }
  };

  const handleSendSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmitAssignment(selectedAssignmentForSubmit.id, submissionText, fileName);
      setSelectedAssignmentForSubmit(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeRemaining = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const now = Date.now();
    const diff = due - now;
    if (diff <= 0) return { label: 'Deadline Passed', urgent: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return { label: `${days}d ${hours}h left`, urgent: days <= 2 };
    return { label: `${hours}h left`, urgent: true };
  };

  const totalCredits = displaySubjects.reduce((sum, s) => sum + (s.credits || 4), 0);
  const gradedSubmissionsCount = masterSubmissions.filter(s => s.status === 'graded').length;

  return (
    <div className="space-y-6">
      {/* 1. Student Academic Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-sm p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold rounded-xs uppercase tracking-wider">
                B.Tech 1st Year (Semester 1)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Roll No: <strong className="text-white">{currentUser.institutionalId}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentUser.name}’s Academic Dashboard
            </h2>
            <p className="text-xs text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-blue-300">Degree Course: {currentUser.department}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Academic Standing: <strong className="text-emerald-400">{currentUser.gpa || 9.85} GPA (Dean's List)</strong></span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">{displaySubjects.length} Allotted Subjects ({totalCredits} Total Credits)</span>
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/80 p-2.5 rounded-sm border border-slate-800/80">
            <div className="text-center px-2.5 py-1 border-r border-slate-800">
              <div className="text-lg font-mono font-bold text-white">{displaySubjects.length}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Subjects</div>
            </div>
            <div className="text-center px-2.5 py-1 border-r border-slate-800">
              <div className="text-lg font-mono font-bold text-blue-400">{totalCredits}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Credits</div>
            </div>
            <div className="text-center px-2.5 py-1 border-r border-slate-800">
              <div className="text-lg font-mono font-bold text-emerald-400">{gradedSubmissionsCount}/{masterAssignments.length}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Graded</div>
            </div>
            <div className="text-center px-2.5 py-1">
              <div className="text-lg font-mono font-bold text-purple-400">{currentUser.gpa || 9.85}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">GPA</div>
            </div>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-4 mt-4 border-t border-slate-800/80">
          <button
            id="student-tab-all-subjects"
            onClick={() => setViewMode('overview')}
            className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-all ${
              viewMode === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            All 5 Subjects Overview
          </button>
          <button
            id="student-tab-active-workspace"
            onClick={() => setViewMode('active-subject')}
            className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-all ${
              viewMode === 'active-subject'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {activeSubject.code} Subject Workspace
          </button>
          <button
            id="student-tab-all-assignments"
            onClick={() => setViewMode('all-assignments')}
            className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-all ${
              viewMode === 'all-assignments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            Assignments & Tasks ({masterAssignments.length})
          </button>
          <button
            id="student-tab-master-schedule"
            onClick={() => setViewMode('master-schedule')}
            className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-all ${
              viewMode === 'master-schedule'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            Exams & Timelines ({masterTimelines.length})
          </button>
          <button
            id="student-tab-library"
            onClick={() => setViewMode('library')}
            className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-all ${
              viewMode === 'library'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            Textbooks & References ({masterResources.length})
          </button>
        </div>
      </div>

      {/* 2. OVERVIEW MODE: ALL 5 ENROLLED SUBJECTS GRID */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold uppercase tracking-tight text-white">
                1st Year B.Tech Enrolled Curriculum (All 5 Subjects)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              5 Courses Enrolled · Fall 2026
            </span>
          </div>

          {/* 5 Subjects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySubjects.map((subj) => {
              const isSelected = subj.id === activeSubject.id;
              const subjAssignment = masterAssignments.find(a => a.subjectId === subj.id);
              const subjSubmission = subjAssignment ? masterSubmissions.find(s => s.assignmentId === subjAssignment.id) : null;
              const subjTimeline = masterTimelines.find(t => t.subjectId === subj.id);

              return (
                <div
                  key={subj.id}
                  className={`bg-slate-900 rounded-md border transition-all p-5 flex flex-col justify-between space-y-4 shadow-sm ${
                    isSelected
                      ? 'border-blue-500/80 ring-1 ring-blue-500/30 bg-slate-900/95'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Code, Credits, Active pill */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-mono font-bold rounded-xs">
                          {subj.code}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {subj.credits || 4} Credits
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Active Focus
                        </span>
                      )}
                    </div>

                    {/* Subject Title */}
                    <div>
                      <h4 className="text-base font-bold text-white line-clamp-2 leading-snug">
                        {subj.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {subj.description}
                      </p>
                    </div>

                    {/* Teacher & Department Details */}
                    <div className="p-3 bg-slate-950/80 rounded-sm border border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Faculty In-Charge</span>
                        <span className="text-[10px] font-mono text-slate-400">{subj.room}</span>
                      </div>
                      <p className="font-bold text-slate-200 truncate">{subj.teacherName}</p>
                      <p className="text-[11px] text-blue-400 truncate">{subj.department || 'Academic Department'}</p>
                    </div>

                    {/* Next Upcoming Event */}
                    {subjTimeline && (
                      <div className="p-2.5 bg-slate-950 rounded-sm border border-slate-800/60 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="uppercase font-bold text-amber-400">Next Milestone</span>
                          <span>{subjTimeline.date}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-200 truncate">{subjTimeline.title}</p>
                      </div>
                    )}

                    {/* Submission / Grade Status */}
                    {subjSubmission && (
                      <div className="flex items-center justify-between p-2 bg-emerald-950/50 rounded-sm border border-emerald-800/60 text-xs">
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {subjSubmission.status === 'graded' ? 'Assignment Graded' : 'Submitted'}
                        </span>
                        {subjSubmission.grade !== undefined && (
                          <span className="font-mono font-bold text-xs text-emerald-200">
                            {subjSubmission.grade}/100 PTS
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        onSelectSubject(subj.id);
                        setViewMode('active-subject');
                      }}
                      className="py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xs text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>Open Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectSubject(subj.id);
                        if (onNavigateToNotes) onNavigateToNotes();
                      }}
                      className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xs text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Notes</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Snapshot: Upcoming Deadlines Across All Subjects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {/* Upcoming Deadlines */}
            <div className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <h4 className="text-sm font-bold uppercase tracking-tight text-white">
                    Upcoming Deliverables Across All 5 Subjects
                  </h4>
                </div>
                <button
                  onClick={() => setViewMode('all-assignments')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  View All ({masterAssignments.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {masterAssignments.slice(0, 4).map((assign) => {
                  const s = subjects.find(sub => sub.id === assign.subjectId);
                  const subStatus = masterSubmissions.find(sub => sub.assignmentId === assign.id);
                  const timeStatus = getTimeRemaining(assign.dueDate);

                  return (
                    <div
                      key={assign.id}
                      className="flex items-center justify-between p-3 bg-slate-950 rounded-sm border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs bg-slate-800 text-slate-300">
                            {s?.code || 'CRS'}
                          </span>
                          <h5 className="text-xs font-semibold text-white truncate">{assign.title}</h5>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{s?.teacherName} · {assign.points} pts</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {subStatus ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {subStatus.status === 'graded' ? `${subStatus.grade}/${assign.points}` : 'Submitted'}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenSubmit(assign)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xs text-[11px] font-semibold"
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Scheduled Exams / Labs */}
            <div className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold uppercase tracking-tight text-white">
                    Master Exam & Lab Schedule (All 5 Subjects)
                  </h4>
                </div>
                <button
                  onClick={() => setViewMode('master-schedule')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Full Schedule ({masterTimelines.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {masterTimelines.slice(0, 4).map((item) => {
                  const s = subjects.find(sub => sub.id === item.subjectId);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-950 rounded-sm border border-slate-800/80"
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs bg-blue-950 text-blue-300 border border-blue-800">
                            {s?.code || 'CRS'}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-amber-400 font-mono">
                            {item.type}
                          </span>
                        </div>
                        <h5 className="text-xs font-semibold text-white truncate">{item.title}</h5>
                        <p className="text-[10px] text-slate-400 truncate">{item.location} · {item.startTime}</p>
                      </div>

                      <span className="text-[11px] font-mono text-slate-300 shrink-0 font-bold">
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIVE SUBJECT WORKSPACE */}
      {viewMode === 'active-subject' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Active Subject Info Card */}
          <div className="bg-slate-900 border border-blue-500/40 rounded-md p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 bg-blue-600 text-white font-mono font-bold text-sm rounded-xs">
                  {activeSubject.code}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">{activeSubject.name}</h3>
                  <p className="text-xs text-slate-400">{activeSubject.credits || 4} Credit Hours · {activeSubject.semester} · {activeSubject.room}</p>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs">
                <p className="font-bold text-slate-200">Instructor: {activeSubject.teacherName}</p>
                <p className="text-blue-400">{activeSubject.department || 'Department'}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
              {activeSubject.description}
            </p>

            {/* Syllabus Topics */}
            {activeSubject.syllabusTopics && activeSubject.syllabusTopics.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1.5">Key Syllabus Modules</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeSubject.syllabusTopics.map((topic, i) => (
                    <span key={i} className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded-xs text-slate-300 border border-slate-800">
                      Unit {i + 1}: {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Subject Assignments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold uppercase tracking-tight text-white">
                  {activeSubject.code} Coursework & Assignments
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {assignments.length} Tasks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => {
                const submission = submissions.find(s => s.assignmentId === assignment.id);
                const timeStatus = getTimeRemaining(assignment.dueDate);

                return (
                  <div
                    key={assignment.id}
                    className="bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 text-slate-100"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-blue-950 text-blue-300 border border-blue-800">
                          {assignment.points} PTS
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border flex items-center gap-1 ${
                            timeStatus.urgent ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {timeStatus.label}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-white line-clamp-2">
                          {assignment.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                          {assignment.description}
                        </p>
                      </div>

                      {/* Rubric */}
                      {assignment.rubric && assignment.rubric.length > 0 && (
                        <div className="p-2.5 bg-slate-950 rounded-sm border border-slate-800 text-[11px] text-slate-400 space-y-1">
                          <p className="font-bold text-[9px] uppercase tracking-wider text-slate-500 font-mono">Grading Rubric</p>
                          {assignment.rubric.slice(0, 2).map((r, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="truncate max-w-[170px]">{r.criterion}</span>
                              <span className="font-mono font-bold text-slate-300">{r.maxPoints} pts</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Submission Status */}
                      {submission && (
                        <div className="p-3 bg-emerald-950/60 rounded-sm border border-emerald-800 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-emerald-300">
                            <span className="flex items-center gap-1 font-mono text-[10px] uppercase">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                            </span>
                            {submission.grade !== undefined && (
                              <span className="text-emerald-200 bg-emerald-900 border border-emerald-700 px-1.5 py-0.2 rounded-sm font-mono font-bold text-[10px]">
                                {submission.grade} / {assignment.points}
                              </span>
                            )}
                          </div>
                          {submission.feedback && (
                            <p className="text-slate-300 text-[11px] pt-1 border-t border-emerald-800/80">
                              <strong className="text-emerald-300">Instructor Note:</strong> {submission.feedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenSubmit(assignment)}
                      className={`w-full py-1.5 px-4 rounded-sm text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                        submission
                          ? 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{submission ? 'Update Submission' : 'Submit Solution'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Subject Timelines */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold uppercase tracking-tight text-white">
                  {activeSubject.code} Academic Milestones & Labs
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {timelines.length} Events
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timelines.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm flex flex-col justify-between space-y-3 text-slate-100"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-sm border ${
                          item.type === 'exam'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : item.type === 'quiz'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : item.type === 'practical'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}
                      >
                        {item.type} {item.weightagePercent ? `(${item.weightagePercent}%)` : ''}
                      </span>
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        {item.date}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.description}
                    </p>

                    {item.topicsCovered && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.topicsCovered.map((t, i) => (
                          <span key={i} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-sm text-slate-400 font-mono border border-slate-800">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 font-mono flex items-center justify-between pt-2 border-t border-slate-800">
                    <span>{item.startTime} - {item.endTime}</span>
                    <span className="text-slate-300 font-medium">{item.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Subject Reference Materials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold uppercase tracking-tight text-white">
                {activeSubject.code} Textbooks & Reading Materials
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm flex flex-col justify-between space-y-3 text-slate-100"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-sm bg-blue-950 text-blue-300 border border-blue-800">
                        {res.category}
                      </span>
                      <span className="text-xs text-slate-400">{res.author}</span>
                    </div>

                    <h4 className="font-bold text-sm text-white">
                      {res.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 pt-2 border-t border-slate-800"
                  >
                    <span>Open Digital Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. ALL 5 ASSIGNMENTS TAB */}
      {viewMode === 'all-assignments' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Coursework Hub across All 5 Subjects</h3>
              <p className="text-xs text-slate-400">Complete, submit, and inspect grades for all first-year courses</p>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedSubjectFilter('all')}
                className={`px-2.5 py-1 rounded-xs text-xs font-semibold transition-all ${
                  selectedSubjectFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Subjects ({masterAssignments.length})
              </button>
              {subjects.map(subj => (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubjectFilter(subj.id)}
                  className={`px-2.5 py-1 rounded-xs text-xs font-semibold transition-all ${
                    selectedSubjectFilter === subj.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {subj.code}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => {
              const subj = subjects.find(s => s.id === assignment.subjectId);
              const submission = masterSubmissions.find(s => s.assignmentId === assignment.id);
              const timeStatus = getTimeRemaining(assignment.dueDate);

              return (
                <div
                  key={assignment.id}
                  className="bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {subj?.code || 'CRS'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded-xs">
                        {assignment.points} PTS
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white">{assignment.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Faculty: {subj?.teacherName}</p>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-3">{assignment.description}</p>
                    </div>

                    {submission && (
                      <div className="p-2.5 bg-emerald-950/60 rounded-xs border border-emerald-800 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-emerald-300">
                          <span className="flex items-center gap-1 font-mono text-[10px] uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                          </span>
                          {submission.grade !== undefined && (
                            <span className="text-emerald-200 bg-emerald-900 px-1.5 py-0.2 rounded-xs font-mono font-bold text-[10px]">
                              {submission.grade}/{assignment.points}
                            </span>
                          )}
                        </div>
                        {submission.feedback && (
                          <p className="text-slate-300 text-[10px] pt-1 border-t border-emerald-800/60">
                            {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenSubmit(assignment)}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xs text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{submission ? 'Update Submission' : 'Submit Solution'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. MASTER TIMELINES & SCHEDULE TAB */}
      {viewMode === 'master-schedule' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Master Academic Timetable (All 5 Subjects)</h3>
              <p className="text-xs text-slate-400">Chronological schedule of quizzes, laboratory practicals, and midterms</p>
            </div>

            {/* Subject Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedSubjectFilter('all')}
                className={`px-2.5 py-1 rounded-xs text-xs font-semibold transition-all ${
                  selectedSubjectFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Subjects
              </button>
              {subjects.map(subj => (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubjectFilter(subj.id)}
                  className={`px-2.5 py-1 rounded-xs text-xs font-semibold transition-all ${
                    selectedSubjectFilter === subj.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {subj.code}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTimelines.map((item) => {
              const subj = subjects.find(s => s.id === item.subjectId);
              return (
                <div
                  key={item.id}
                  className="bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-xs bg-blue-950 text-blue-300 border border-blue-800">
                          {subj?.code || 'CRS'}
                        </span>
                        <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                          {item.type} {item.weightagePercent ? `(${item.weightagePercent}%)` : ''}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-300 font-mono">{item.date}</span>
                    </div>

                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400">{item.description}</p>

                    {item.topicsCovered && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.topicsCovered.map((t, i) => (
                          <span key={i} className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded-xs text-slate-300 border border-slate-800">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 font-mono flex items-center justify-between pt-2 border-t border-slate-800">
                    <span>{item.startTime} - {item.endTime}</span>
                    <span className="text-slate-300 font-semibold">{item.location}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. REFERENCE LIBRARY TAB */}
      {viewMode === 'library' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Central Reference Library (All 5 Subjects)</h3>
              <p className="text-xs text-slate-400">Curated standard textbooks, lab manuals, and faculty lecture slides</p>
            </div>

            {/* Subject Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedSubjectFilter('all')}
                className={`px-2.5 py-1 rounded-xs text-xs font-semibold transition-all ${
                  selectedSubjectFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Subjects
              </button>
              {subjects.map(subj => (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubjectFilter(subj.id)}
                  className={`px-2.5 py-1 rounded-xs text-xs font-semibold transition-all ${
                    selectedSubjectFilter === subj.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {subj.code}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res) => {
              const subj = subjects.find(s => s.id === res.subjectId);
              return (
                <div
                  key={res.id}
                  className="bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-xs bg-blue-950 text-blue-300 border border-blue-800">
                          {subj?.code || 'CRS'}
                        </span>
                        <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-xs bg-slate-800 text-slate-300">
                          {res.category}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{res.author}</span>
                    </div>

                    <h4 className="font-bold text-sm text-white">{res.title}</h4>
                    <p className="text-xs text-slate-400">{res.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-sm transition-all shadow-xs"
                    >
                      {res.url.endsWith('.pdf') ? (
                        <>
                          <FileText className="w-3.5 h-3.5 text-white" />
                          <span>Open PDF Document</span>
                        </>
                      ) : res.url.includes('openstax.org') ? (
                        <>
                          <BookOpen className="w-3.5 h-3.5 text-white" />
                          <span>Read Free on OpenStax</span>
                        </>
                      ) : res.url.includes('ocw.mit.edu') ? (
                        <>
                          <GraduationCap className="w-3.5 h-3.5 text-white" />
                          <span>Explore MIT OCW Course</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5 text-white" />
                          <span>Access Full Reference</span>
                        </>
                      )}
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>

                    <a
                      href={`https://scholar.google.com/scholar?q=${encodeURIComponent(res.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-sm transition-all"
                      title="Search Academic Papers on Google Scholar"
                    >
                      <span>Google Scholar</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignmentForSubmit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSendSubmission} className="bg-slate-900 rounded-md max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-800 animate-in fade-in zoom-in-95 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                  Coursework Submission
                </span>
                <h3 className="font-bold text-sm text-white">
                  {selectedAssignmentForSubmit.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssignmentForSubmit(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Written Response / Mathematical Proof & Description
                </label>
                <textarea
                  rows={6}
                  required
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full font-mono text-xs p-3 border border-slate-700 rounded-sm focus:outline-none focus:border-blue-500 leading-relaxed bg-slate-950 text-slate-200"
                  placeholder="Paste your inductive proof steps, complexity calculations, or code description here..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Attached Archive / Code Bundle
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-sm border border-slate-700 text-xs">
                  <Paperclip className="w-4 h-4 text-blue-400 shrink-0" />
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full bg-transparent border-none text-xs font-mono font-bold text-slate-200 focus:outline-none"
                    placeholder="bundle_solution.zip"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedAssignmentForSubmit(null)}
                className="px-3 py-1.5 rounded-sm text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Uploading...' : 'Confirm Submission'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
