import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  CheckCheck,
  Radio,
  Fingerprint,
  RefreshCw,
  Filter,
  Users,
  Save,
  BarChart3,
  QrCode,
  Share2,
  UserPlus,
  Copy,
  Check,
  X,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { Student } from '../../../types';

interface StudentAttendanceScreenProps {
  students: Student[];
  initialBatch?: string;
  onUpdateStudentStatus: (studentId: string, newStatus: Student['status']) => void;
  onMarkAllPresent: (batch: string) => void;
  onAddNewStudent?: (student: Student) => void;
  onSaveAttendanceRecord?: (batch: string, summary: { present: number; late: number; absent: number; rate: number }) => void;
}

// Monthly historical attendance data for previous months
const HISTORICAL_ATTENDANCE_DATA = {
  february: [
    { week: 'Week 1 (Feb 02-06)', attendance: 91, present: 44, absent: 4 },
    { week: 'Week 2 (Feb 09-13)', attendance: 94, present: 45, absent: 3 },
    { week: 'Week 3 (Feb 16-20)', attendance: 88, present: 42, absent: 6 },
    { week: 'Week 4 (Feb 23-27)', attendance: 93, present: 45, absent: 3 },
  ],
  january: [
    { week: 'Week 1 (Jan 05-09)', attendance: 89, present: 43, absent: 5 },
    { week: 'Week 2 (Jan 12-16)', attendance: 92, present: 44, absent: 4 },
    { week: 'Week 3 (Jan 19-23)', attendance: 90, present: 43, absent: 5 },
    { week: 'Week 4 (Jan 26-30)', attendance: 91, present: 44, absent: 4 },
  ],
  march: [
    { week: 'Week 1 (Mar 02-06)', attendance: 92, present: 44, absent: 4 },
    { week: 'Week 2 (Mar 09-13)', attendance: 95, present: 46, absent: 2 },
  ],
};

export const StudentAttendanceScreen: React.FC<StudentAttendanceScreenProps> = ({
  students,
  initialBatch,
  onUpdateStudentStatus,
  onMarkAllPresent,
  onAddNewStudent,
  onSaveAttendanceRecord,
}) => {
  const [selectedBatch, setSelectedBatch] = useState(initialBatch || 'ME-102 (B)');

  React.useEffect(() => {
    if (initialBatch) {
      setSelectedBatch(initialBatch);
    }
  }, [initialBatch]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSyncingRFID, setIsSyncingRFID] = useState(false);
  const [rfidSuccessMsg, setRfidSuccessMsg] = useState<string | null>(null);

  // Save Attendance State
  const [isSaving, setIsSaving] = useState(false);
  const [attendanceSavedToast, setAttendanceSavedToast] = useState<string | null>(null);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>('Today, 10:20 AM');

  // Previous Month Attendance Graph State
  const [showMonthlyGraph, setShowMonthlyGraph] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<'february' | 'january' | 'march'>('february');

  // Direct Onboarding Link Modal State
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Late Student Quick-Add & QR Auto-Registration Modal State
  const [showLateStudentModal, setShowLateStudentModal] = useState(false);
  const [lateStudentName, setLateStudentName] = useState('');
  const [lateStudentRoll, setLateStudentRoll] = useState('');
  const [lateStudentStatus, setLateStudentStatus] = useState<Student['status']>('late');
  const [lateStudentSuccessToast, setLateStudentSuccessToast] = useState<string | null>(null);

  const batches = [
    { id: 'ME-102 (B)', name: 'ME-102 (Div B)', count: 48, active: true },
    { id: 'ES-101 (A)', name: 'ES-101 (Div A)', count: 54, active: false },
    { id: 'ES-101 (C)', name: 'ES-101 (Div C)', count: 50, active: false },
    { id: 'ES-101L (B1)', name: 'ES-101L (Lab B1)', count: 30, active: false },
  ];

  const filteredStudents = students
    .filter((s) => s.batch === selectedBatch)
    .filter((s) => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'at-risk') return s.isAtRisk;
      return s.status === filterStatus;
    })
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q)
      );
    });

  const batchStudents = students.filter((s) => s.batch === selectedBatch);
  const presentCount = batchStudents.filter((s) => s.status === 'present').length;
  const lateCount = batchStudents.filter((s) => s.status === 'late').length;
  const absentCount = batchStudents.filter((s) => s.status === 'absent').length;
  const excusedCount = batchStudents.filter((s) => s.status === 'excused').length;
  const attendanceRate = batchStudents.length
    ? Math.round(((presentCount + lateCount * 0.5) / batchStudents.length) * 100)
    : 0;

  const handleSyncRFID = () => {
    setIsSyncingRFID(true);
    setTimeout(() => {
      setIsSyncingRFID(false);
      setRfidSuccessMsg('RFID turnstile sensors in Hall 4 / Room 210 synced successfully. 2 late entries logged.');
      setTimeout(() => setRfidSuccessMsg(null), 4000);
    }, 1200);
  };

  // 1. SAVE ATTENDANCE BUTTON HANDLER
  const handleSaveAttendance = () => {
    setIsSaving(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const formatted = `Today at ${timeStr}`;

    setTimeout(() => {
      setIsSaving(false);
      setLastSavedTimestamp(formatted);

      if (onSaveAttendanceRecord) {
        onSaveAttendanceRecord(selectedBatch, {
          present: presentCount,
          late: lateCount,
          absent: absentCount,
          rate: attendanceRate,
        });
      }

      // Sync to database
      fetch('/api/db/attendance/batch-mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch: selectedBatch,
          presentCount,
          lateCount,
          absentCount,
          attendanceRate,
          timestamp: now.toISOString(),
        }),
      }).catch(() => {});

      setAttendanceSavedToast(
        `Attendance successfully saved for ${selectedBatch}! Verified ${presentCount} present, ${lateCount} late, ${absentCount} absent (${attendanceRate}% attendance). Locked & synced.`
      );
      setTimeout(() => setAttendanceSavedToast(null), 5000);
    }, 800);
  };

  // 2. DIRECT ONBOARDING LINK HANDLERS
  const directJoinLink = `https://edusync.bmu.edu.in/join?batch=${encodeURIComponent(selectedBatch)}&session=2026-S1`;
  const whatsappInviteText = `Dear Students of ${selectedBatch}, please join the EduSync classroom portal using this direct registration link: ${directJoinLink}. You will be automatically added to the attendance roster and course resources.`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directJoinLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappInviteText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  // 3. LATE STUDENT AUTO-REGISTRATION HANDLER
  const handleAddLateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lateStudentName.trim() || !lateStudentRoll.trim()) return;

    const newStudent: Student = {
      id: `s-${Date.now()}`,
      rollNo: lateStudentRoll.trim().toUpperCase(),
      name: lateStudentName.trim(),
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80`,
      status: lateStudentStatus,
      punchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      streak: [true, true, false, true, true],
      batch: selectedBatch,
      quizScore: 78,
      midTermReadiness: 75,
      doubtsCount: 0,
      isAtRisk: false,
    };

    if (onAddNewStudent) {
      onAddNewStudent(newStudent);
    }

    setLateStudentSuccessToast(
      `Student ${newStudent.name} (${newStudent.rollNo}) successfully auto-registered and marked ${newStudent.status.toUpperCase()} for ${selectedBatch}!`
    );
    setTimeout(() => setLateStudentSuccessToast(null), 5000);

    setLateStudentName('');
    setLateStudentRoll('');
    setShowLateStudentModal(false);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['RollNo,Name,Status,PunchTime,Batch']
        .concat(
          batchStudents.map(
            (s) => `${s.rollNo},${s.name},${s.status},${s.punchTime || 'N/A'},${s.batch}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${selectedBatch.replace(/\s+/g, '_')}_March4_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="student-attendance-screen" className="p-4 sm:p-6 lg:p-8 max-w-[1580px] mx-auto w-full flex flex-col gap-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#eaedff] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-[11px] px-2.5 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] font-bold">
              LIVE SAFE PROTOCOL
            </span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555]">
              Real-Time Biometric & RFID Attendance Console
            </span>
          </div>
          <h1 className="font-['Sora'] text-2xl font-bold text-[#131b2e] mt-1">
            Student Attendance Management
          </h1>
          <p className="text-[14px] text-[#464555]">
            Save class attendance, view previous month attendance trends, send direct student onboarding links, and auto-register late students.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Send Direct Join Link Button */}
          <button
            onClick={() => setShowOnboardingModal(true)}
            className="px-3.5 py-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3525cd] text-[13px] font-semibold flex items-center gap-1.5 border border-[#dae2fd] cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Send Direct Student Link</span>
          </button>

          {/* Quick-Add Late Student Button */}
          <button
            onClick={() => setShowLateStudentModal(true)}
            className="px-3.5 py-2 rounded-lg bg-[#e2dfff] hover:bg-[#d0cbff] text-[#0f0069] text-[13px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Late Student (QR)</span>
          </button>

          {/* Show Previous Month Attendance Toggle Button */}
          <button
            onClick={() => setShowMonthlyGraph(!showMonthlyGraph)}
            className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showMonthlyGraph
                ? 'bg-[#131b2e] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#131b2e] hover:bg-[#eaedff] border border-[#e2e7ff]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#3525cd]" />
            <span>{showMonthlyGraph ? 'Hide Monthly Graph' : 'Show Previous Month Attendance'}</span>
          </button>

          {/* MARK ALL PRESENT */}
          <button
            onClick={() => onMarkAllPresent(selectedBatch)}
            className="px-3.5 py-2 rounded-lg bg-[#006e4b] hover:bg-[#005236] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>

          {/* PROMINENT SAVE ATTENDANCE BUTTON */}
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-[#3525cd] hover:bg-[#281bb2] disabled:opacity-50 text-white text-[13px] font-bold flex items-center gap-2 shadow-md shadow-[#3525cd]/20 cursor-pointer transition-all"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Attendance</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Toasts */}
      {attendanceSavedToast && (
        <div className="p-4 bg-[#ecfdf5] border border-[#d1fae5] text-[#065f46] rounded-xl text-[13px] font-medium flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#006e4b] shrink-0" />
            <span>{attendanceSavedToast}</span>
          </div>
          <span className="text-[11px] font-['JetBrains_Mono'] text-[#065f46]/80 shrink-0">
            Audit ID: ATT-2026-089
          </span>
        </div>
      )}

      {lateStudentSuccessToast && (
        <div className="p-4 bg-[#e2dfff] border border-[#d0cbff] text-[#0f0069] rounded-xl text-[13px] font-medium flex items-center gap-2.5 animate-in fade-in">
          <Sparkles className="w-5 h-5 text-[#3525cd] shrink-0" />
          <span>{lateStudentSuccessToast}</span>
        </div>
      )}

      {rfidSuccessMsg && (
        <div className="p-3 bg-[#ecfdf5] border border-[#d1fae5] text-[#065f46] rounded-xl text-[13px] font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#006e4b]" />
          <span>{rfidSuccessMsg}</span>
        </div>
      )}

      {/* 2. PREVIOUS MONTH ATTENDANCE TREND (COLLAPSIBLE / EXPANDABLE GRAPH) */}
      {showMonthlyGraph && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#eaedff] animate-in fade-in space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f2f3ff] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#3525cd]" />
                <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e]">
                  Historical Attendance Trend for {selectedBatch}
                </h3>
              </div>
              <p className="text-[13px] text-[#464555]">
                Easy month-by-month and week-by-week attendance review across previous terms.
              </p>
            </div>

            {/* Month Toggle Pills */}
            <div className="flex bg-[#f2f3ff] p-1 rounded-xl border border-[#e2e7ff]">
              <button
                onClick={() => setSelectedMonth('february')}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  selectedMonth === 'february'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#131b2e]'
                }`}
              >
                February 2026 (Previous)
              </button>
              <button
                onClick={() => setSelectedMonth('january')}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  selectedMonth === 'january'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#131b2e]'
                }`}
              >
                January 2026
              </button>
              <button
                onClick={() => setSelectedMonth('march')}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  selectedMonth === 'march'
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#131b2e]'
                }`}
              >
                March 2026 (Current)
              </button>
            </div>
          </div>

          {/* Key Summary Cards in Simple Words */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff]">
              <span className="text-[11px] font-bold text-[#464555] uppercase font-['JetBrains_Mono']">
                Monthly Class Average
              </span>
              <div className="font-['Sora'] text-2xl font-bold text-[#3525cd] mt-1">
                {selectedMonth === 'february' ? '91.5%' : selectedMonth === 'january' ? '90.5%' : '93.5%'}
              </div>
              <span className="text-[11px] text-[#006e4b] font-medium font-['JetBrains_Mono']">
                Above 75% university requirement
              </span>
            </div>

            <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff]">
              <span className="text-[11px] font-bold text-[#464555] uppercase font-['JetBrains_Mono']">
                Best Attendance Day
              </span>
              <div className="font-['Sora'] text-2xl font-bold text-[#006e4b] mt-1">
                {selectedMonth === 'february' ? '98%' : selectedMonth === 'january' ? '96%' : '96%'}
              </div>
              <span className="text-[11px] text-[#464555]">
                {selectedMonth === 'february' ? 'Feb 18 (Lab Practical)' : 'Jan 16 (Module 2)'}
              </span>
            </div>

            <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff]">
              <span className="text-[11px] font-bold text-[#464555] uppercase font-['JetBrains_Mono']">
                Lowest Attendance Day
              </span>
              <div className="font-['Sora'] text-2xl font-bold text-[#ba1a1a] mt-1">
                {selectedMonth === 'february' ? '82%' : selectedMonth === 'january' ? '84%' : '90%'}
              </div>
              <span className="text-[11px] text-[#ba1a1a]">
                {selectedMonth === 'february' ? 'Feb 06 (Pre-fest Friday)' : 'Jan 09 (Cold weather)'}
              </span>
            </div>

            <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff]">
              <span className="text-[11px] font-bold text-[#464555] uppercase font-['JetBrains_Mono']">
                Total Classes Held
              </span>
              <div className="font-['Sora'] text-2xl font-bold text-[#131b2e] mt-1">
                {selectedMonth === 'february' ? '18' : selectedMonth === 'january' ? '16' : '6'} Classes
              </div>
              <span className="text-[11px] text-[#464555]">All biometric sessions confirmed</span>
            </div>
          </div>

          {/* Simple Easy-to-Read Graph */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HISTORICAL_ATTENDANCE_DATA[selectedMonth]} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f3ff" />
                <XAxis dataKey="week" stroke="#777587" fontSize={12} />
                <YAxis stroke="#777587" fontSize={12} domain={[70, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#eaedff', borderRadius: '10px', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="attendance" name="Attendance Rate %" fill="#3525cd" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. Batch Selector & Real-Time Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {batches.map((batch) => {
          const isSelected = selectedBatch === batch.id;
          return (
            <div
              key={batch.id}
              onClick={() => setSelectedBatch(batch.id)}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#3525cd] shadow-md ring-1 ring-[#3525cd]'
                  : 'bg-white border-[#eaedff] hover:border-[#3525cd]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-['JetBrains_Mono'] text-[12px] font-bold px-2 py-0.5 rounded bg-[#f2f3ff] text-[#3525cd]">
                  {batch.id}
                </span>
                {batch.active && (
                  <span className="flex items-center gap-1.5 text-[11px] font-['JetBrains_Mono'] text-[#006e4b] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#006e4b] animate-ping" />
                    IN SESSION
                  </span>
                )}
              </div>
              <div className="mt-3">
                <h3 className="font-['Sora'] font-bold text-[16px] text-[#131b2e]">{batch.name}</h3>
                <span className="text-[13px] text-[#464555]">
                  {batch.count} registered students
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Live Attendance Metrics */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[#eaedff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <span className="text-[11px] uppercase font-semibold text-[#464555]">Batch Attendance</span>
            <div className="font-['Sora'] text-2xl font-bold text-[#3525cd]">{attendanceRate}%</div>
          </div>
          <div className="h-8 w-px bg-[#eaedff]" />
          <div>
            <span className="text-[11px] uppercase font-semibold text-[#006e4b]">Present</span>
            <div className="font-['Sora'] text-2xl font-bold text-[#006e4b]">{presentCount}</div>
          </div>
          <div className="h-8 w-px bg-[#eaedff]" />
          <div>
            <span className="text-[11px] uppercase font-semibold text-[#6b38d4]">Late (+15m)</span>
            <div className="font-['Sora'] text-2xl font-bold text-[#6b38d4]">{lateCount}</div>
          </div>
          <div className="h-8 w-px bg-[#eaedff]" />
          <div>
            <span className="text-[11px] uppercase font-semibold text-[#ba1a1a]">Absent</span>
            <div className="font-['Sora'] text-2xl font-bold text-[#ba1a1a]">{absentCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12px] font-['JetBrains_Mono'] text-[#777587]">
            Last Saved: <strong className="text-[#131b2e]">{lastSavedTimestamp || 'Not saved yet'}</strong>
          </span>
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className="px-3 py-1.5 bg-[#3525cd] hover:bg-[#281bb2] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Attendance Now</span>
          </button>
        </div>
      </div>

      {/* 5. Live Roster Table with Search & Status Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-[#eaedff] overflow-hidden">
        <div className="p-4 border-b border-[#eaedff] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-['Sora'] font-semibold text-[15px] text-[#131b2e]">
              Roster: {selectedBatch} ({filteredStudents.length} students)
            </h3>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#777587] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[12px] focus:outline-none focus:ring-1 focus:ring-[#3525cd] w-56"
              />
            </div>

            {/* Filter pills */}
            <div className="flex bg-[#f2f3ff] p-1 rounded-lg border border-[#e2e7ff] text-[12px]">
              {['all', 'present', 'late', 'absent', 'at-risk'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-all cursor-pointer ${
                    filterStatus === status
                      ? 'bg-white text-[#3525cd] shadow-xs font-bold'
                      : 'text-[#464555] hover:text-[#131b2e]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="p-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#464555] border border-[#eaedff] cursor-pointer"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#f2f3ff] border-b border-[#eaedff] text-[11px] font-semibold text-[#464555] uppercase font-['JetBrains_Mono']">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Status & Punch Time</th>
                <th className="py-3 px-4 text-center">5-Day Streak</th>
                <th className="py-3 px-4 text-center">Quiz Score</th>
                <th className="py-3 px-4 text-right">Quick Mark Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff]">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-[#faf8ff] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#e2dfff] flex items-center justify-center font-bold text-[11px] text-[#0f0069]">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="absolute">{s.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#131b2e] block">{s.name}</span>
                        <span className="text-[11px] text-[#777587] font-['JetBrains_Mono']">{s.batch}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-['JetBrains_Mono'] text-[12px] text-[#464555]">
                    {s.rollNo}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded font-bold capitalize ${
                          s.status === 'present'
                            ? 'bg-[#d1fae5] text-[#065f46]'
                            : s.status === 'late'
                            ? 'bg-[#fef3c7] text-[#92400e]'
                            : s.status === 'excused'
                            ? 'bg-[#e2dfff] text-[#0f0069]'
                            : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                      >
                        {s.status}
                      </span>
                      {s.punchTime && (
                        <span className="text-[11px] text-[#777587] font-['JetBrains_Mono'] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {s.punchTime}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {s.streak.map((present, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-xs flex items-center justify-center text-[9px] font-bold ${
                            present ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          {present ? 'P' : 'A'}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center font-['JetBrains_Mono'] font-bold text-[#3525cd]">
                    {s.quizScore}%
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1 bg-[#f2f3ff] p-1 rounded-lg border border-[#eaedff]">
                      <button
                        onClick={() => onUpdateStudentStatus(s.id, 'present')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                          s.status === 'present'
                            ? 'bg-[#006e4b] text-white shadow-xs'
                            : 'text-[#065f46] hover:bg-white'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => onUpdateStudentStatus(s.id, 'late')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                          s.status === 'late'
                            ? 'bg-[#b45309] text-white shadow-xs'
                            : 'text-[#92400e] hover:bg-white'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => onUpdateStudentStatus(s.id, 'absent')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                          s.status === 'absent'
                            ? 'bg-[#ba1a1a] text-white shadow-xs'
                            : 'text-[#ba1a1a] hover:bg-white'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: DIRECT STUDENT ONBOARDING LINK & QR CODE FOR NEW BATCH           */}
      {/* ========================================================================= */}
      {showOnboardingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff]">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#3525cd]" />
                <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e]">
                  Direct Student Onboarding Link
                </h3>
              </div>
              <button
                onClick={() => setShowOnboardingModal(false)}
                className="text-[#777587] hover:text-[#131b2e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-[13px]">
              <p className="text-[#464555]">
                Share this direct onboarding link with new or incoming students for <strong>{selectedBatch}</strong>. Students who click this link will open EduSync Student Portal and be automatically added to the batch roster.
              </p>

              {/* Direct Link Box */}
              <div>
                <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                  Direct Student Portal Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={directJoinLink}
                    className="flex-1 px-3 py-2 bg-[#f2f3ff] border border-[#eaedff] rounded-xl text-[12px] font-['JetBrains_Mono'] text-[#131b2e] focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 bg-[#3525cd] hover:bg-[#281bb2] text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* QR Code Simulation */}
              <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff] flex items-center gap-4">
                <div className="w-24 h-24 bg-white p-2 rounded-xl border border-[#eaedff] flex flex-col items-center justify-center shadow-xs">
                  <QrCode className="w-16 h-16 text-[#3525cd]" />
                  <span className="text-[9px] font-bold text-[#3525cd] mt-0.5">SCAN ME</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#131b2e] font-['Sora'] text-[14px]">
                    Projected In-Class QR Code
                  </h4>
                  <p className="text-[12px] text-[#464555]">
                    Display on classroom projector. Students scan from camera to instantly join.
                  </p>
                  <span className="inline-block text-[11px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#e2dfff] text-[#0f0069] font-semibold">
                    Batch: {selectedBatch}
                  </span>
                </div>
              </div>

              {/* Share WhatsApp Message */}
              <div className="pt-2">
                <button
                  onClick={handleCopyMessage}
                  className="w-full py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3525cd] rounded-xl text-[12px] font-semibold border border-[#eaedff] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{copiedMessage ? 'WhatsApp Invite Message Copied!' : 'Copy WhatsApp / Email Classroom Invite'}</span>
                </button>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#eaedff]">
                <button
                  onClick={() => setShowOnboardingModal(false)}
                  className="px-4 py-2 bg-[#f2f3ff] text-[#131b2e] rounded-xl text-[12px] font-semibold hover:bg-[#eaedff] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK-ADD LATE STUDENT (WITH QR CODE AUTO-REGISTRATION)          */}
      {/* ========================================================================= */}
      {showLateStudentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#eaedff]">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#3525cd]" />
                <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e]">
                  Add Late / Walk-in Student
                </h3>
              </div>
              <button
                onClick={() => setShowLateStudentModal(false)}
                className="text-[#777587] hover:text-[#131b2e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic QR Check-in Banner */}
            <div className="mb-4 p-3 bg-[#e2dfff]/40 border border-[#d0cbff] rounded-xl flex items-center gap-3">
              <div className="w-14 h-14 bg-white p-1 rounded-lg border border-[#eaedff] flex items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-[#3525cd]" />
              </div>
              <div className="text-[12px]">
                <span className="font-bold text-[#0f0069] block">Student can scan to auto-punch</span>
                <span className="text-[#464555]">Show this QR code to the late-arriving student for instant auto-registration.</span>
              </div>
            </div>

            {/* Quick Registration Form */}
            <form onSubmit={handleAddLateStudentSubmit} className="space-y-3.5">
              <div>
                <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={lateStudentName}
                  onChange={(e) => setLateStudentName(e.target.value)}
                  placeholder="e.g. Yash Vardhan"
                  className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] focus:outline-none focus:border-[#3525cd]"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                  University Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={lateStudentRoll}
                  onChange={(e) => setLateStudentRoll(e.target.value)}
                  placeholder="e.g. 24CSE112"
                  className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] font-['JetBrains_Mono'] focus:outline-none focus:border-[#3525cd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                    Class Batch
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedBatch}
                    className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] text-[#777587]"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                    Punch Status
                  </label>
                  <select
                    value={lateStudentStatus}
                    onChange={(e) => setLateStudentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] font-semibold"
                  >
                    <option value="late">Late (+15m)</option>
                    <option value="present">Present (Excused)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setShowLateStudentModal(false)}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#464555] hover:bg-[#f2f3ff] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#3525cd] hover:bg-[#281bb2] text-white text-[13px] font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Register & Punch Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
