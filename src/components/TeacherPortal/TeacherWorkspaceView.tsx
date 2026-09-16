import React, { useState, useMemo } from 'react';
import {
  TeacherQuickStickyNote,
  TeacherLessonTask,
  TeacherLeaveRequest
} from '../../types';
import {
  StickyNote,
  CheckSquare,
  Briefcase,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Sparkles,
  Send,
  FileCheck,
  X,
  Phone,
  UserCheck,
  BookOpen,
  Info,
  CalendarDays,
  Check,
  Palmtree,
  Coffee,
  ShieldCheck,
  Clock3
} from 'lucide-react';

interface TeacherWorkspaceViewProps {
  notes: TeacherQuickStickyNote[];
  tasks: TeacherLessonTask[];
  leaves: TeacherLeaveRequest[];
  onAddNote: (note: Omit<TeacherQuickStickyNote, 'id' | 'createdAt'>) => void;
  onDeleteNote: (noteId: string) => void;
  onToggleNoteComplete: (noteId: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<TeacherLessonTask, 'id'>) => void;
  onSubmitLeave: (leave: Omit<TeacherLeaveRequest, 'id' | 'status' | 'appliedAt'>) => void;
}

export const TeacherWorkspaceView: React.FC<TeacherWorkspaceViewProps> = ({
  notes,
  tasks,
  leaves,
  onAddNote,
  onDeleteNote,
  onToggleNoteComplete,
  onToggleTask,
  onAddTask,
  onSubmitLeave
}) => {
  // Sticky Note Form State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState<'yellow' | 'blue' | 'emerald' | 'purple' | 'rose'>('yellow');
  const [notePriority, setNotePriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [noteReminder, setNoteReminder] = useState('');

  // Task Form State
  const [taskText, setTaskText] = useState('');

  // Leave Form State (In-App Leave Application Panel)
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<'Casual Leave' | 'Paid Leave' | 'Duty Leave' | 'Medical Leave' | 'Academic Conference'>('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState('');
  const [substituteTeacher, setSubstituteTeacher] = useState('Dr. Ananya Sen (School of Engineering)');
  const [contactPhone, setContactPhone] = useState('+91 98452 10984');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Leave Quotas Allocation (Institutional Standard for Academic Year 2026)
  const LEAVE_QUOTAS = {
    paidLeavesTotal: 15,
    casualLeavesTotal: 10,
    dutyLeavesTotal: 6,
    medicalLeavesTotal: 10,
    gazettedHolidaysTotal: 19
  };

  // Compute Balances Dynamically
  const leaveStats = useMemo(() => {
    let clTaken = 0;
    let plTaken = 0;
    let dlTaken = 0;
    let mlTaken = 0;

    leaves.forEach(l => {
      const days = Number(l.totalDays) || 1;
      if (l.leaveType === 'Casual Leave') clTaken += days;
      else if (l.leaveType === 'Paid Leave') plTaken += days;
      else if (l.leaveType === 'Duty Leave' || l.leaveType === 'Academic Conference') dlTaken += days;
      else if (l.leaveType === 'Medical Leave') mlTaken += days;
    });

    // Baseline minimum taken for realistic faculty profile if fresh
    if (clTaken === 0 && plTaken === 0 && dlTaken === 0) {
      clTaken = 3;
      plTaken = 3;
      dlTaken = 1;
      mlTaken = 0;
    }

    const totalTaken = clTaken + plTaken + dlTaken + mlTaken;
    const paidAvailable = Math.max(0, LEAVE_QUOTAS.paidLeavesTotal - plTaken);
    const casualAvailable = Math.max(0, LEAVE_QUOTAS.casualLeavesTotal - clTaken);
    const dutyAvailable = Math.max(0, LEAVE_QUOTAS.dutyLeavesTotal - dlTaken);
    const medicalAvailable = Math.max(0, LEAVE_QUOTAS.medicalLeavesTotal - mlTaken);
    const holidaysLeft = 14; // 14 remaining Indian National & Festive Holidays in 2026

    return {
      clTaken,
      plTaken,
      dlTaken,
      mlTaken,
      totalTaken,
      paidAvailable,
      casualAvailable,
      dutyAvailable,
      medicalAvailable,
      holidaysLeft
    };
  }, [leaves]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auto calculate duration and date of joining when dates change
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (val && !endDate) {
      setEndDate(val);
      calcJoiningDate(val);
      setLeaveDays(1);
    } else if (val && endDate) {
      calcDaysAndJoining(val, endDate);
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (startDate && val) {
      calcDaysAndJoining(startDate, val);
    } else if (!startDate && val) {
      setStartDate(val);
      calcJoiningDate(val);
      setLeaveDays(1);
    }
  };

  const calcJoiningDate = (end: string) => {
    try {
      const d = new Date(end);
      d.setDate(d.getDate() + 1);
      // If next day is Sunday (0), move to Monday
      if (d.getDay() === 0) {
        d.setDate(d.getDate() + 1);
      }
      setDateOfJoining(d.toISOString().split('T')[0]);
    } catch {
      // fallback
    }
  };

  const calcDaysAndJoining = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diffMs = e.getTime() - s.getTime();
      const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
      setLeaveDays(diffDays);

      const nextDay = new Date(e);
      nextDay.setDate(nextDay.getDate() + 1);
      if (nextDay.getDay() === 0) {
        nextDay.setDate(nextDay.getDate() + 1);
      }
      setDateOfJoining(nextDay.toISOString().split('T')[0]);
    } catch {
      setLeaveDays(1);
    }
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    onAddNote({
      teacherId: 'teacher-ess',
      title: noteTitle.trim(),
      content: noteContent.trim(),
      color: noteColor,
      priority: notePriority,
      reminderTime: noteReminder.trim() || undefined,
      isCompleted: false
    });

    setNoteTitle('');
    setNoteContent('');
    setShowNoteModal(false);
    showToast('Sticky note pinned to workspace.');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    onAddTask({
      subjectId: 'subj-ess',
      task: taskText.trim(),
      dueDate: 'Today',
      isDone: false
    });

    setTaskText('');
    showToast('Lesson preparation task added.');
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) {
      showToast('Please state the reason for leave.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const sDate = startDate || todayStr;
    const eDate = endDate || sDate;
    const jDate = dateOfJoining || sDate;

    onSubmitLeave({
      teacherId: 'teacher-ess',
      teacherName: 'Dr. Rajesh Kulkarni',
      leaveType,
      startDate: sDate,
      endDate: eDate,
      dateOfJoining: jDate,
      totalDays: Number(leaveDays) || 1,
      reason: leaveReason.trim(),
      substituteTeacher: substituteTeacher.trim() || 'Dr. Ananya Sen (School of Engineering)',
      contactPhone: contactPhone.trim(),
      handoverNotes: handoverNotes.trim()
    });

    setLeaveReason('');
    setHandoverNotes('');
    setShowLeaveModal(false);
    showToast('Leave application submitted successfully for HOD approval.');
  };

  const colorStyles: Record<string, string> = {
    yellow: 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border-amber-500/60 text-amber-100 shadow-md shadow-amber-500/5',
    blue: 'bg-gradient-to-br from-cyan-950/50 via-slate-900 to-slate-950 border-cyan-500/60 text-cyan-100 shadow-md shadow-cyan-500/5',
    emerald: 'bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border-emerald-500/60 text-emerald-100 shadow-md shadow-emerald-500/5',
    purple: 'bg-gradient-to-br from-purple-950/50 via-slate-900 to-slate-950 border-purple-500/60 text-purple-100 shadow-md shadow-purple-500/5',
    rose: 'bg-gradient-to-br from-rose-950/50 via-slate-900 to-slate-950 border-rose-500/60 text-rose-100 shadow-md shadow-rose-500/5'
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-blue-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/25 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-xl shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Teacher Workspace & Leaves</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Faculty Desk
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Manage your daily notes, class preparation tasks, check your leave balances, and apply for leaves.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowNoteModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-700 flex items-center gap-1.5"
            >
              <StickyNote className="w-3.5 h-3.5 text-amber-400" />
              <span>New Sticky Note</span>
            </button>

            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leave Quotas & Balances Overview (Holidays left, Paid leaves, Casual leaves, Taken) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palmtree className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Leave Balance & Quota Overview</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Academic Year 2026</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Paid Leaves Available */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-emerald-300">Paid Leaves (PL)</span>
              <Palmtree className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{leaveStats.paidAvailable}</span>
                <span className="text-xs text-slate-400 font-medium">/ {LEAVE_QUOTAS.paidLeavesTotal} left</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {leaveStats.plTaken} days taken
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(leaveStats.paidAvailable / LEAVE_QUOTAS.paidLeavesTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* Casual Leaves Available (CL) */}
          <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-blue-300">Casual Leaves (CL)</span>
              <Coffee className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{leaveStats.casualAvailable}</span>
                <span className="text-xs text-slate-400 font-medium">/ {LEAVE_QUOTAS.casualLeavesTotal} left</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {leaveStats.clTaken} days taken
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${(leaveStats.casualAvailable / LEAVE_QUOTAS.casualLeavesTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* Duty Leaves Available (DL) */}
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-purple-300">Duty Leaves (DL)</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{leaveStats.dutyAvailable}</span>
                <span className="text-xs text-slate-400 font-medium">/ {LEAVE_QUOTAS.dutyLeavesTotal} left</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {leaveStats.dlTaken} days taken
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all"
                style={{ width: `${(leaveStats.dutyAvailable / LEAVE_QUOTAS.dutyLeavesTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* Medical Leaves (ML) */}
          <div className="bg-slate-900/90 border border-teal-500/30 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-teal-300">Medical Leaves (ML)</span>
              <AlertCircle className="w-4 h-4 text-teal-400" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{leaveStats.medicalAvailable}</span>
                <span className="text-xs text-slate-400 font-medium">/ {LEAVE_QUOTAS.medicalLeavesTotal} left</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {leaveStats.mlTaken} days taken
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all"
                style={{ width: `${(leaveStats.medicalAvailable / LEAVE_QUOTAS.medicalLeavesTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* Holidays Left in Year */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-amber-300">Holidays Left</span>
              <CalendarDays className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-300">{leaveStats.holidaysLeft}</span>
                <span className="text-xs text-slate-400 font-medium">days left</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Gazetted & Festival
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all"
                style={{ width: `${(leaveStats.holidaysLeft / LEAVE_QUOTAS.gazettedHolidaysTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* How Many Leaves Taken */}
          <div className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-rose-300">Total Leaves Taken</span>
              <Clock3 className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-rose-300">{leaveStats.totalTaken}</span>
                <span className="text-xs text-slate-400 font-medium">days</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Total taken this year
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (leaveStats.totalTaken / 25) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Sticky Notes & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sticky Notes (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-amber-400" />
              <span>Notes & Reminders</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {notes.filter(n => !n.isCompleted).length} active notes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {notes.map(note => (
              <div
                key={note.id}
                className={`p-4 rounded-2xl border transition-all relative ${
                  colorStyles[note.color] || colorStyles.yellow
                } ${note.isCompleted ? 'opacity-50 grayscale-50' : 'shadow-md'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleNoteComplete(note.id)}
                      className="cursor-pointer text-slate-300 hover:text-white"
                      title={note.isCompleted ? 'Mark Active' : 'Mark Completed'}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${note.isCompleted ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </button>
                    <span className="text-xs font-bold text-white tracking-tight">{note.title}</span>
                  </div>

                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="text-slate-400 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {note.content}
                </p>

                {note.reminderTime && (
                  <div className="flex items-center gap-1 mt-3 text-[10px] font-mono text-amber-300/90">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Reminder: {note.reminderTime}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lesson Prep Task Checklist (1 col) */}
        <div className="bg-slate-900/90 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Lesson Prep Tasks</span>
            </h3>
            <span className="text-xs text-emerald-300 font-mono font-black bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-500/40">
              {tasks.filter(t => t.isDone).length} / {tasks.length} Done
            </span>
          </div>

          {/* Quick Add Task Form */}
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="e.g. Test lab pH meter calibration..."
              className="flex-1 bg-slate-950 border border-slate-700/90 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 font-medium"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20"
            >
              Add
            </button>
          </form>

          {/* Task items list */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {tasks.map(task => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  task.isDone
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-400 line-through'
                    : 'bg-slate-950/90 border-slate-700/80 text-white font-medium hover:border-emerald-500/60 shadow-xs'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-black shrink-0 ${
                    task.isDone ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs' : 'border-slate-600 bg-slate-900'
                  }`}
                >
                  {task.isDone && '✓'}
                </div>
                <span className="text-xs leading-snug">{task.task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Leave Applications History Section */}
      <div className="bg-slate-900/90 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>My Leave History</span>
            </h3>
            <p className="text-xs text-slate-300">Track your applied leaves, date of issue to date of joining, substitute faculty, and status</p>
          </div>

          <button
            onClick={() => setShowLeaveModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-purple-500/20 border border-purple-400/40 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply for Leave</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/95 border-b border-slate-750 text-cyan-200 font-mono text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Leave Period</th>
                <th className="py-3.5 px-4">Joining Duty</th>
                <th className="py-3.5 px-4">Reason & Notes</th>
                <th className="py-3.5 px-4">Substitute Faculty</th>
                <th className="py-3.5 px-4">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-100">
              {leaves.map(leave => {
                const isApproved = leave.status === 'Approved';
                const isPending = leave.status.includes('Pending');

                return (
                  <tr key={leave.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-white text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        {leave.leaveType === 'Paid Leave' && <Palmtree className="w-3.5 h-3.5 text-emerald-400" />}
                        {leave.leaveType === 'Casual Leave' && <Coffee className="w-3.5 h-3.5 text-blue-400" />}
                        {leave.leaveType === 'Duty Leave' && <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />}
                        {leave.leaveType === 'Medical Leave' && <AlertCircle className="w-3.5 h-3.5 text-teal-400" />}
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-cyan-200 font-semibold">{leave.startDate} ➔ {leave.endDate}</span>
                      <span className="text-[10px] text-slate-300 block font-semibold">({leave.totalDays} {leave.totalDays === 1 ? 'Day' : 'Days'})</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-300 font-semibold">
                      {leave.dateOfJoining || 'Next working day'}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-200 font-medium">
                      <div className="truncate font-semibold text-slate-100" title={leave.reason}>
                        {leave.reason}
                      </div>
                      {leave.handoverNotes && (
                        <div className="text-[10px] text-slate-400 truncate mt-0.5" title={leave.handoverNotes}>
                          Handover: {leave.handoverNotes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{leave.substituteTeacher}</div>
                      {leave.contactPhone && (
                        <div className="text-[10px] text-slate-400 font-mono font-normal">{leave.contactPhone}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {isApproved && (
                        <span className="px-3 py-1 rounded-lg text-[10px] font-black font-mono bg-gradient-to-r from-emerald-950 to-teal-900 text-emerald-200 border border-emerald-500 shadow-sm shadow-emerald-500/20">
                          ✓ Endorsed & Approved
                        </span>
                      )}
                      {isPending && (
                        <span className="px-3 py-1 rounded-lg text-[10px] font-black font-mono bg-gradient-to-r from-amber-950 to-yellow-900 text-amber-200 border border-amber-500 shadow-sm shadow-amber-500/20 animate-pulse">
                          ⏳ Pending HOD Review
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sticky Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-base font-bold text-white">Create New Sticky Note</h3>

            <form onSubmit={handleCreateNote} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title:</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Follow up on Section B lab notebooks"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Details:</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={3}
                  placeholder="Enter details..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Color Style:</label>
                  <select
                    value={noteColor}
                    onChange={(e) => setNoteColor(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="yellow">Yellow Alert</option>
                    <option value="blue">Blue Focus</option>
                    <option value="emerald">Green Completed</option>
                    <option value="purple">Purple Insight</option>
                    <option value="rose">Red Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reminder Time:</label>
                  <input
                    type="text"
                    value={noteReminder}
                    onChange={(e) => setNoteReminder(e.target.value)}
                    placeholder="e.g. Today at 4 PM"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Pin Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW IN-APP LEAVE APPLICATION PANEL (Modal / Slide-Over) */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-2xl w-full my-6 p-6 shadow-2xl text-white space-y-5 relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Apply for Teacher Leave</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Submit your leave details from issue date to joining date. Your substitute faculty and HOD will be notified.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Leave Balance Pill Strip inside the Form */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>Your Current Leave Quota Balances:</span>
                <span className="text-slate-400 font-mono">Total Taken: <strong className="text-rose-300">{leaveStats.totalTaken} days</strong></span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-1.5">
                  <div className="text-[10px] text-emerald-400 font-semibold">Paid Leaves</div>
                  <div className="font-extrabold text-white text-sm">{leaveStats.paidAvailable} <span className="text-[10px] text-slate-400 font-normal">/ {LEAVE_QUOTAS.paidLeavesTotal}</span></div>
                </div>
                <div className="bg-slate-900 border border-blue-500/30 rounded-lg p-1.5">
                  <div className="text-[10px] text-blue-400 font-semibold">Casual (CL)</div>
                  <div className="font-extrabold text-white text-sm">{leaveStats.casualAvailable} <span className="text-[10px] text-slate-400 font-normal">/ {LEAVE_QUOTAS.casualLeavesTotal}</span></div>
                </div>
                <div className="bg-slate-900 border border-purple-500/30 rounded-lg p-1.5">
                  <div className="text-[10px] text-purple-400 font-semibold">Duty Leaves</div>
                  <div className="font-extrabold text-white text-sm">{leaveStats.dutyAvailable} <span className="text-[10px] text-slate-400 font-normal">/ {LEAVE_QUOTAS.dutyLeavesTotal}</span></div>
                </div>
                <div className="bg-slate-900 border border-teal-500/30 rounded-lg p-1.5">
                  <div className="text-[10px] text-teal-400 font-semibold">Medical Leaves</div>
                  <div className="font-extrabold text-white text-sm">{leaveStats.medicalAvailable} <span className="text-[10px] text-slate-400 font-normal">/ {LEAVE_QUOTAS.medicalLeavesTotal}</span></div>
                </div>
                <div className="bg-slate-900 border border-amber-500/30 rounded-lg p-1.5 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-amber-400 font-semibold">Holidays Left</div>
                  <div className="font-extrabold text-amber-300 text-sm">{leaveStats.holidaysLeft} <span className="text-[10px] text-slate-400 font-normal">days</span></div>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleCreateLeave} className="space-y-4 text-xs">
              {/* Row 1: Leave Type & Duration Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-200 font-bold mb-1">
                    Type of Leave <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-purple-500"
                  >
                    <option value="Casual Leave">Casual Leave (CL) - Personal reasons & casual off</option>
                    <option value="Paid Leave">Paid Leave (PL) - Earned annual institutional leave</option>
                    <option value="Duty Leave">Duty Leave (DL) - University exam duty / external inspection</option>
                    <option value="Medical Leave">Medical Leave (ML) - Illness or medical consultation</option>
                    <option value="Academic Conference">Academic Conference - Research presentation / workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1">Total Days</label>
                  <div className="bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-2.5 flex items-center justify-between">
                    <span className="font-mono text-purple-300 font-extrabold text-sm">{leaveDays} {leaveDays === 1 ? 'Day' : 'Days'}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Auto-calculated</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Date of Issue, End Date, Date of Joining */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-200 font-bold mb-1">
                    Date of Issue (Start Date) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1">
                    End Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1">
                    Date of Joining Duty <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfJoining}
                    onChange={(e) => setDateOfJoining(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-emerald-600/50 rounded-xl px-3 py-2.5 text-emerald-300 font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Row 3: Substitute Teacher & Contact Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-200 font-bold mb-1 flex items-center justify-between">
                    <span>Substitute Teacher / Faculty Proxy <span className="text-rose-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={substituteTeacher}
                    onChange={(e) => setSubstituteTeacher(e.target.value)}
                    placeholder="e.g. Dr. Ananya Sen (School of Engineering)"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold self-center">Quick pick:</span>
                    {['Dr. Ananya Sen', 'Prof. Vikram Malhotra', 'Dr. Rajesh Iyer'].map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setSubstituteTeacher(name + ' (Faculty Proxy)')}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1">
                    Contact Phone During Leave <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98452 10984"
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Available for emergency department contact</span>
                </div>
              </div>

              {/* Row 4: Official Reason */}
              <div>
                <label className="block text-slate-200 font-bold mb-1 flex items-center justify-between">
                  <span>Reason for Leave <span className="text-rose-400">*</span></span>
                  <span className="text-[10px] text-slate-400">Be clear and concise</span>
                </label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  rows={2}
                  placeholder="State the purpose of your leave (family event, medical appointment, conference, etc.)..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold self-center">Presets:</span>
                  {[
                    'Family Event & Personal Commitment',
                    'Medical Consultation & Health Check',
                    'Attending National IEEE Conference',
                    'Urgent Personal Domestic Work'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLeaveReason(preset)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 5: Handover Notes for Classes */}
              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Handover Notes & Class Instructions (Optional)
                </label>
                <textarea
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  rows={2}
                  placeholder="Instructions for substitute faculty regarding syllabus coverage, lab practical supervision, or student assignments..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Leave Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
