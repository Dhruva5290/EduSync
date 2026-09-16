import React, { useState, useMemo } from 'react';
import {
  StudentAttendanceItem,
  TeacherScheduleSlot,
  AntiProxyDiscrepancy,
  AttendanceRiskLevel
} from '../../types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ShieldAlert,
  Send,
  UserX,
  FileSpreadsheet,
  RefreshCw,
  Info,
  ChevronDown,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Users
} from 'lucide-react';

interface AttendanceRosterViewProps {
  roster: StudentAttendanceItem[];
  activeSlot: TeacherScheduleSlot | null;
  allSlots: TeacherScheduleSlot[];
  antiProxyAlerts: AntiProxyDiscrepancy[];
  onSelectSlot: (slot: TeacherScheduleSlot) => void;
  onMarkStudent: (studentId: string, status: 'present' | 'absent' | 'late') => void;
  onBatchMarkAll: (status: 'present' | 'absent') => void;
  onResolveAntiProxy: (alertId: string, resolution: 'justified' | 'reported_to_dean', note?: string) => void;
}

export const AttendanceRosterView: React.FC<AttendanceRosterViewProps> = ({
  roster,
  activeSlot,
  allSlots,
  antiProxyAlerts,
  onSelectSlot,
  onMarkStudent,
  onBatchMarkAll,
  onResolveAntiProxy
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'danger_60' | 'warning_75' | 'safe' | 'absent'>('all');
  const [selectedAlertForAction, setSelectedAlertForAction] = useState<AntiProxyDiscrepancy | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Metrics calculation
  const totalStudents = roster.length;
  const presentCount = roster.filter(r => r.todayStatus === 'present' || r.todayStatus === 'late').length;
  const absentCount = roster.filter(r => r.todayStatus === 'absent').length;
  const attendanceRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '0';

  const debarredCount = roster.filter(r => r.currentPercentage < 60).length;
  const warningCount = roster.filter(r => r.currentPercentage >= 60 && r.currentPercentage < 75).length;
  const safeCount = roster.filter(r => r.currentPercentage >= 75).length;

  const unresolvedProxyCount = antiProxyAlerts.filter(a => a.status === 'unresolved').length;

  // Filtered roster
  const filteredRoster = useMemo(() => {
    return roster.filter(student => {
      const matchesSearch =
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterRisk === 'danger_60') return student.currentPercentage < 60;
      if (filterRisk === 'warning_75') return student.currentPercentage >= 60 && student.currentPercentage < 75;
      if (filterRisk === 'safe') return student.currentPercentage >= 75;
      if (filterRisk === 'absent') return student.todayStatus === 'absent';

      return true;
    });
  }, [roster, searchQuery, filterRisk]);

  const handleResolveAlert = (resolution: 'justified' | 'reported_to_dean') => {
    if (!selectedAlertForAction) return;
    onResolveAntiProxy(selectedAlertForAction.id, resolution, actionNote);
    showToast(
      resolution === 'justified'
        ? `Exemption approved for ${selectedAlertForAction.studentName}.`
        : `Formal notice dispatched to Dean & Proctor for ${selectedAlertForAction.studentName}.`
    );
    setSelectedAlertForAction(null);
    setActionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-blue-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-200">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold">{notificationToast}</span>
        </div>
      )}

      {/* Header Slot Selector & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Attendance Register
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Class Attendance & Eligibility Radar</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Mark attendance with 1-click controls. Students below 75% risk grade penalties; students below 60% are debarred from examination papers.
            </p>
          </div>

          {/* Active Class Slot Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 shrink-0">
            <span className="text-xs font-mono text-slate-400 pl-2">Active Class:</span>
            <select
              value={activeSlot?.id || ''}
              onChange={(e) => {
                const found = allSlots.find(s => s.id === e.target.value);
                if (found) onSelectSlot(found);
              }}
              className="bg-slate-900 text-xs font-bold text-white border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {allSlots.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.startTime} – {slot.subjectCode} ({slot.section}) - {slot.room}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance Summary Banner with Risk Color Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-700/80 shadow-sm">
            <span className="text-[10px] uppercase font-mono text-cyan-300 font-bold">Class Attendance Rate</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-white">{attendanceRate}%</span>
              <span className="text-xs text-slate-300 font-mono">({presentCount}/{totalStudents})</span>
            </div>
          </div>

          {/* 🔴 Severe Danger: < 60% Debarred */}
          <div className="bg-gradient-to-br from-rose-950/70 to-red-950/50 p-3.5 rounded-2xl border border-rose-500/60 shadow-lg shadow-rose-500/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-black text-rose-200 tracking-wider">DEBARRED (&lt; 60%)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185] animate-ping" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-rose-300 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]">{debarredCount}</span>
              <span className="text-[10px] text-rose-200 font-mono font-semibold">Cannot sit in paper</span>
            </div>
          </div>

          {/* 🟡 Warning: < 75% Grade Loss */}
          <div className="bg-gradient-to-br from-amber-950/70 to-yellow-950/50 p-3.5 rounded-2xl border border-amber-500/60 shadow-lg shadow-amber-500/10">
            <span className="text-[10px] uppercase font-mono font-black text-amber-200 tracking-wider">WARNING (&lt; 75%)</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]">{warningCount}</span>
              <span className="text-[10px] text-amber-200 font-mono font-semibold">Grade loss risk</span>
            </div>
          </div>

          {/* 🟢 Safe: >= 75% Eligible */}
          <div className="bg-gradient-to-br from-emerald-950/70 to-teal-950/50 p-3.5 rounded-2xl border border-emerald-500/60 shadow-lg shadow-emerald-500/10">
            <span className="text-[10px] uppercase font-mono font-black text-emerald-200 tracking-wider">ELIGIBLE (≥ 75%)</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">{safeCount}</span>
              <span className="text-[10px] text-emerald-200 font-mono font-semibold">Good standing</span>
            </div>
          </div>

          {/* 🚨 Anti-Proxy Bunk Discrepancies */}
          <div className="bg-gradient-to-br from-purple-950/70 to-indigo-950/50 p-3.5 rounded-2xl border border-purple-500/60 shadow-lg shadow-purple-500/10 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-black text-purple-200 tracking-wider">ANTI-PROXY FLAGS</span>
              {unresolvedProxyCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[9px] font-black animate-bounce">
                  {unresolvedProxyCount} New
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-purple-300 drop-shadow-[0_0_10px_rgba(192,132,252,0.4)]">{antiProxyAlerts.length}</span>
              <span className="text-[10px] text-purple-200 font-mono font-semibold">Correlated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Proxy Telemetry Warning Alert Box */}
      {antiProxyAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 border border-purple-500/40 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Anti-Proxy Attendance Correlation Alerts</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-600/40">
                    Automated Telemetry Cross-Check
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Detected students marked present in an early slot today but missing in a subsequent lecture.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {antiProxyAlerts.map(alert => {
              const isResolved = alert.status !== 'unresolved';
              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isResolved
                      ? 'bg-slate-950/40 border-slate-800 opacity-75'
                      : 'bg-purple-950/30 border-purple-500/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{alert.studentName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{alert.rollNo}</span>
                      </div>
                      <p className="text-[11px] text-purple-200/80 mt-1 font-mono">
                        Early: <span className="text-emerald-400 font-bold">{alert.earlySlotTime}</span> ➔ Subsequent: <span className="text-rose-400 font-bold">{alert.subsequentSlotTime}</span>
                      </p>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        {alert.flagReason}
                      </p>
                      {alert.teacherNote && (
                        <p className="text-[11px] text-cyan-300 mt-1 italic">
                          Teacher Resolution: {alert.teacherNote}
                        </p>
                      )}
                    </div>

                    {!isResolved ? (
                      <button
                        onClick={() => setSelectedAlertForAction(alert)}
                        className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow transition-all shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Take Action</span>
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                        {alert.status === 'justified' ? '✓ Justified' : '⚠️ Reported to Dean'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Dialog Modal for Anti-Proxy */}
      {selectedAlertForAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Resolve Anti-Proxy Discrepancy</h3>
                <p className="text-xs text-slate-400">
                  Student: <strong className="text-white">{selectedAlertForAction.studentName}</strong> ({selectedAlertForAction.rollNo})
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <p><strong>Timeline:</strong> {selectedAlertForAction.earlySlotTime} (Present) ➔ {selectedAlertForAction.subsequentSlotTime} (Absent)</p>
              <p className="text-slate-400 italic">{selectedAlertForAction.flagReason}</p>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Teacher Case Remark / Reason:</label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="e.g. Student provided signed sick bay pass from BMU Health Centre..."
                className="w-full h-20 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setSelectedAlertForAction(null)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleResolveAlert('justified')}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Approve Valid Exemption
                </button>
                <button
                  onClick={() => handleResolveAlert('reported_to_dean')}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Escalate to Dean / Proctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roster Controls: Search, Filters & 1-Click Batch Marking */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700/80 shadow-md">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student by name, roll no, or email..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-medium"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterRisk('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterRisk === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-750'
            }`}
          >
            All ({roster.length})
          </button>
          <button
            onClick={() => setFilterRisk('danger_60')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              filterRisk === 'danger_60'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                : 'bg-rose-950/50 text-rose-200 hover:bg-rose-900/80 border border-rose-500/60'
            }`}
          >
            🔴 &lt; 60% Debarred ({debarredCount})
          </button>
          <button
            onClick={() => setFilterRisk('warning_75')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              filterRisk === 'warning_75'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
                : 'bg-amber-950/50 text-amber-200 hover:bg-amber-900/80 border border-amber-500/60'
            }`}
          >
            🟡 &lt; 75% Warning ({warningCount})
          </button>
          <button
            onClick={() => setFilterRisk('safe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              filterRisk === 'safe'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-emerald-950/50 text-emerald-200 hover:bg-emerald-900/80 border border-emerald-500/60'
            }`}
          >
            🟢 Eligible ({safeCount})
          </button>
        </div>

        {/* Batch Marking Buttons */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <button
            onClick={() => {
              onBatchMarkAll('present');
              showToast('Marked all students as Present for this slot.');
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-500/20 border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>
          <button
            onClick={() => {
              onBatchMarkAll('absent');
              showToast('Reset all attendance for this slot.');
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Interactive Student Roster Table */}
      <div className="bg-slate-900/90 border border-slate-750 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/95 border-b border-slate-750 text-cyan-200 font-mono text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Student & Roll No</th>
                <th className="py-3.5 px-4">Classes Held</th>
                <th className="py-3.5 px-4">Attendance %</th>
                <th className="py-3.5 px-4">Exam & Grade Risk Status</th>
                <th className="py-3.5 px-4 text-center">Today's Class Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-100">
              {filteredRoster.map(student => {
                const isDanger = student.currentPercentage < 60;
                const isWarning = student.currentPercentage >= 60 && student.currentPercentage < 75;
                const isSafe = student.currentPercentage >= 75;

                return (
                  <tr
                    key={student.studentId}
                    className={`transition-colors hover:bg-slate-800/50 ${
                      isDanger ? 'bg-rose-950/25' : isWarning ? 'bg-amber-950/25' : ''
                    }`}
                  >
                    {/* Student Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-sm ${
                            isDanger
                              ? 'bg-rose-500/25 text-rose-200 border border-rose-500/50 shadow-rose-500/10'
                              : isWarning
                              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-amber-500/10'
                              : 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/50 shadow-emerald-500/10'
                          }`}
                        >
                          {student.avatar || student.studentName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                            <span>{student.studentName}</span>
                            {student.consecutiveAbsences >= 3 && (
                              <span
                                className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-900/90 text-rose-100 border border-rose-500 shadow-xs"
                                title="3 or more consecutive absences logged"
                              >
                                {student.consecutiveAbsences}x Absent
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-cyan-300/90 font-medium block">{student.rollNo}</span>
                        </div>
                      </div>
                    </td>

                    {/* Classes Held & Attended */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-white font-extrabold text-sm">
                        {student.classesAttended} / {student.totalClassesHeld}
                      </div>
                      <span className="text-[10px] text-slate-300 font-semibold">Lectures</span>
                    </td>

                    {/* Attendance Percentage with Visual Progress Bar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black font-mono text-base tracking-tight ${
                            isDanger
                              ? 'text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                              : isWarning
                              ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                              : 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                          }`}
                        >
                          {student.currentPercentage}%
                        </span>
                      </div>
                      <div className="w-28 bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-700">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDanger
                              ? 'bg-gradient-to-r from-rose-500 to-red-400'
                              : isWarning
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          }`}
                          style={{ width: `${Math.min(100, student.currentPercentage)}%` }}
                        />
                      </div>
                    </td>

                    {/* Visual Risk Badge */}
                    <td className="py-3.5 px-4">
                      {isDanger && (
                        <div className="inline-flex flex-col">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black bg-gradient-to-r from-rose-950 to-red-900/90 text-rose-100 border border-rose-500 shadow-md shadow-rose-500/20">
                            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                            ⛔ Debarred From Exam (&lt; 60%)
                          </span>
                          <span className="text-[10px] text-rose-200 font-semibold mt-1 font-mono">
                            Cannot sit in end-term examination paper
                          </span>
                        </div>
                      )}

                      {isWarning && (
                        <div className="inline-flex flex-col">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black bg-gradient-to-r from-amber-950 to-yellow-900/90 text-amber-100 border border-amber-500 shadow-md shadow-amber-500/20">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                            ⚠️ Grade Penalty Risk (&lt; 75%)
                          </span>
                          <span className="text-[10px] text-amber-200 font-semibold mt-1 font-mono">
                            Needs {Math.ceil((0.75 * student.totalClassesHeld - student.classesAttended) / 0.25)} more classes for 75%
                          </span>
                        </div>
                      )}

                      {isSafe && (
                        <div className="inline-flex flex-col">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black bg-gradient-to-r from-emerald-950 to-teal-900/90 text-emerald-100 border border-emerald-500 shadow-md shadow-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                            ✅ Eligible / Good Standing
                          </span>
                          <span className="text-[10px] text-emerald-200 font-semibold mt-1 font-mono">
                            Meets university attendance threshold
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 1-Click Marking Buttons */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onMarkStudent(student.studentId, 'present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            student.todayStatus === 'present'
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300'
                              : 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-emerald-200 hover:border-emerald-500/50 hover:bg-slate-800'
                          }`}
                          title="Mark Present"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Present</span>
                        </button>

                        <button
                          onClick={() => onMarkStudent(student.studentId, 'late')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            student.todayStatus === 'late'
                              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
                              : 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-amber-200 hover:border-amber-500/50 hover:bg-slate-800'
                          }`}
                          title="Mark Late / Excused"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-300" />
                          <span>Late</span>
                        </button>

                        <button
                          onClick={() => onMarkStudent(student.studentId, 'absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            student.todayStatus === 'absent'
                              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/30 ring-1 ring-rose-300'
                              : 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-rose-200 hover:border-rose-500/50 hover:bg-slate-800'
                          }`}
                          title="Mark Absent"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-300" />
                          <span>Absent</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
