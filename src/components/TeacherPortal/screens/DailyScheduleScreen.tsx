import React, { useState } from 'react';
import {
  UserCheck,
  Sparkles,
  CalendarX,
  Radio,
  Presentation,
  BarChart3,
  Flag,
  CheckSquare,
  DoorOpen,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Eye,
  SlidersHorizontal,
  FlaskConical,
  Zap,
  Mic,
  Cast,
  Brain,
  Fingerprint,
  Check,
  AlarmClock,
  StickyNote as StickyNoteIcon,
  Plus,
  Headphones,
  PhoneCall,
  MoreHorizontal,
  Wifi,
  Trash2,
  Quote,
  Shuffle,
  Folder,
  BookOpen,
  Save,
  X,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { LectureSlot, StickyNote, FlaggedDoubt, ScreenId, Student } from '../../../types';

interface DailyScheduleScreenProps {
  lectures: LectureSlot[];
  stickyNotes: StickyNote[];
  students?: Student[];
  onUpdateStudentStatus?: (studentId: string, newStatus: Student['status']) => void;
  onMarkAllPresent?: (batch: string) => void;
  onToggleNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onAddNote: (note: Omit<StickyNote, 'id'>) => void;
  onOpenAttendance: (courseCode: string) => void;
  onOpenAiLessonPlan: (initialCourse?: string) => void;
  onOpenLeaveModal: () => void;
  onOpenDoubtsModal: () => void;
  onOpenLabSetupModal: () => void;
  onOpenRosterModal: (lecture: LectureSlot) => void;
  onNavigateScreen: (screen: ScreenId) => void;
}

const TEACHER_QUOTES = [
  {
    quote: "Teaching is the greatest act of optimism.",
    author: "Colleen Wilcox",
    tag: "Optimism & Vision",
  },
  {
    quote: "A good teacher can inspire hope, ignite the imagination, and instill a love of learning.",
    author: "Brad Henry",
    tag: "Inspiration",
  },
  {
    quote: "The art of teaching is the art of assisting discovery.",
    author: "Mark Van Doren",
    tag: "Discovery",
  },
  {
    quote: "Education is not the filling of a pail, but the lighting of a fire.",
    author: "W.B. Yeats",
    tag: "Curiosity",
  },
  {
    quote: "To teach is to touch a life forever.",
    author: "Anonymous",
    tag: "Lifelong Impact",
  },
];

const ACADEMIC_PLUGINS = [
  {
    id: 'google-classroom',
    name: 'Google Classroom Auto-Sync',
    category: 'LMS & Assignments',
    version: 'v2.4.1',
    description: 'Syncs student roster, assignments, and Google Drive course attachments automatically.',
    status: 'Active',
    enabled: true,
  },
  {
    id: 'moodle-lms',
    name: 'Moodle LMS Exporter',
    category: 'Gradebook Sync',
    version: 'v4.2.0',
    description: 'Directly pushes daily continuous assessment scores and attendance into Moodle server.',
    status: 'Connected',
    enabled: true,
  },
  {
    id: 'nfc-scanner',
    name: 'RFID / NFC Podium Gate Driver',
    category: 'Hardware Integration',
    version: 'v1.8.3',
    description: 'Connects to Room 210 and South Block USB smart podiums for instant student ID card tap.',
    status: 'Online',
    enabled: true,
  },
  {
    id: 'zoom-meet',
    name: 'Zoom & Meet Smart Recorder',
    category: 'Media & Captures',
    version: 'v3.1.0',
    description: 'Automated 1080p lecture screen recording with live AI speech-to-text transcript.',
    status: 'Standby',
    enabled: true,
  },
  {
    id: 'gemini-copilot',
    name: 'Gemini AI Lesson & Quiz Copilot',
    category: 'GenAI Tools',
    version: 'v2.5 Pro',
    description: 'Instantly drafts quiz questions and provides in-lecture student clarification steps.',
    status: 'Active',
    enabled: true,
  },
];

export const DailyScheduleScreen: React.FC<DailyScheduleScreenProps> = ({
  lectures,
  stickyNotes,
  students = [],
  onUpdateStudentStatus,
  onMarkAllPresent,
  onToggleNote,
  onDeleteNote,
  onAddNote,
  onOpenAttendance,
  onOpenAiLessonPlan,
  onOpenLeaveModal,
  onOpenDoubtsModal,
  onOpenLabSetupModal,
  onOpenRosterModal,
  onNavigateScreen,
}) => {
  const [isCallingDesk, setIsCallingDesk] = useState(false);
  const [deskCallStatus, setDeskCallStatus] = useState<string | null>(null);
  const [telemetrySyncToast, setTelemetrySyncToast] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('URGENT • EXAM');

  // Encouraging Quote State
  const [quoteIndex, setQuoteIndex] = useState(0);
  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % TEACHER_QUOTES.length);
  };

  // Plug-in Folder State
  const [pluginFolderModalOpen, setPluginFolderModalOpen] = useState(false);
  const [pluginsList, setPluginsList] = useState(ACADEMIC_PLUGINS);
  const [pluginToast, setPluginToast] = useState<string | null>(null);

  // Class Overview & In-Page Attendance Hub State
  const [selectedClassHub, setSelectedClassHub] = useState<LectureSlot | null>(null);
  const [classHubTab, setClassHubTab] = useState<'details' | 'attendance'>('details');
  const [classAttendanceSavedToast, setClassAttendanceSavedToast] = useState<string | null>(null);
  const [classRosterSearch, setClassRosterSearch] = useState('');

  const handleOpenClassHub = (lecture: LectureSlot, initialTab: 'details' | 'attendance' = 'details') => {
    setSelectedClassHub(lecture);
    setClassHubTab(initialTab);
    setClassAttendanceSavedToast(null);
    setClassRosterSearch('');
  };

  const handleOpenClassHubByCode = (courseCode: string, divName: string, timeStr: string, roomStr: string) => {
    const existing = lectures.find((l) => l.courseCode === courseCode);
    if (existing) {
      setSelectedClassHub(existing);
    } else {
      const times = timeStr.split('-');
      setSelectedClassHub({
        id: `lec-${courseCode.toLowerCase()}`,
        courseCode,
        courseTitle: courseCode.includes('101') ? 'Basic Electrical & Electronics' : 'Engineering Thermodynamics',
        timeStart: times[0]?.trim() || '11:15 AM',
        timeEnd: times[1]?.trim() || '12:05 PM',
        division: divName || 'Division C',
        room: roomStr,
        status: 'upcoming',
        studentsCount: 50,
        actionType: 'live_attendance',
      });
    }
    setClassHubTab('details');
    setClassAttendanceSavedToast(null);
    setClassRosterSearch('');
  };

  const getStudentsForClass = (lecture: LectureSlot | null) => {
    if (!lecture) return [];
    const code = lecture.courseCode.toUpperCase();
    if (code.includes('101L')) {
      const match = students.filter((s) => s.batch.includes('101L') || s.batch.includes('Lab'));
      return match.length > 0 ? match : students.slice(0, 5);
    } else if (code.includes('ME-102') || code.includes('102')) {
      const match = students.filter((s) => s.batch.includes('ME-102') || s.batch.includes('102'));
      return match.length > 0 ? match : students.slice(0, 8);
    } else if (
      lecture.room.includes('405') ||
      lecture.courseTitle.includes('Div C') ||
      (lecture as any).batch?.includes('C') ||
      selectedClassHub?.courseTitle.includes('Div C')
    ) {
      const match = students.filter((s) => s.batch.includes('ES-101 (C)') || s.batch.includes('(C)'));
      return match.length > 0 ? match : students.slice(0, 10);
    } else {
      const match = students.filter((s) => s.batch.includes('ES-101 (A)') || s.batch.includes('(A)'));
      return match.length > 0 ? match : students.slice(0, 8);
    }
  };

  const handleTogglePlugin = (id: string) => {
    setPluginsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
    setPluginToast('Plugin settings updated.');
    setTimeout(() => setPluginToast(null), 3000);
  };

  const handleRingDesk = () => {
    setIsCallingDesk(true);
    setDeskCallStatus('Dialing Ext. 209 (AV Podium Support)...');
    setTimeout(() => {
      setDeskCallStatus('Connected: Officer K. Sharma online. "Podium 210 projector reset signal sent."');
      setTimeout(() => {
        setIsCallingDesk(false);
        setDeskCallStatus(null);
      }, 5000);
    }, 1500);
  };

  const handleSyncTelemetry = () => {
    setTelemetrySyncToast(true);
    setTimeout(() => setTelemetrySyncToast(false), 3000);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    let tagBg = '#eaedff';
    let tagText = '#3525cd';
    let category: StickyNote['category'] = 'general';

    if (newNoteTag.includes('EXAM')) {
      tagBg = '#ffe4e6';
      tagText = '#9f1239';
      category = 'exam';
    } else if (newNoteTag.includes('LAB')) {
      tagBg = '#d1fae5';
      tagText = '#065f46';
      category = 'lab';
    } else if (newNoteTag.includes('CO-INSTRUCTOR')) {
      tagBg = '#eaedff';
      tagText = '#3525cd';
      category = 'co-instructor';
    }

    onAddNote({
      tag: newNoteTag,
      tagBg,
      tagText,
      dueText: 'Today',
      content: newNoteContent.trim(),
      completed: false,
      meta: 'Faculty Quick Memo',
      category,
    });

    setNewNoteContent('');
    setShowAddNoteModal(false);
  };

  return (
    <div id="daily-schedule-screen" className="p-4 sm:p-6 lg:p-8 max-w-[1580px] mx-auto w-full flex flex-col gap-6 lg:gap-8">
      {/* Toast notifications */}
      {telemetrySyncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#3525cd]/40 animate-in fade-in slide-in-from-bottom-2">
          <Radio className="w-5 h-5 text-[#6ffbbe] animate-pulse" />
          <div className="text-[13px]">
            <span className="font-semibold text-white">Podium Telemetry Synced:</span> Room 210 smart console ping 12ms.
          </div>
        </div>
      )}

      {/* Top Welcome Banner & Direct Faculty Actions */}
      <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-[#eaedff]">
        <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-[#e2dfff]/30 blur-3xl pointer-events-none" />
        <div className="absolute right-48 -bottom-16 w-64 h-64 rounded-full bg-[#6ffbbe]/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3525cd] px-2 py-0.5 rounded bg-[#e2dfff] font-bold">
                Faculty Workspace • Tier 1
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555] flex items-center gap-1.5 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-[#006e4b] animate-pulse" />
                Terminal v4.28
              </span>
            </div>
            <h1 className="font-['Sora'] text-2xl lg:text-[28px] font-bold text-[#131b2e] tracking-tight mt-1">
              Good morning, Rajesh 👋
            </h1>
            <p className="text-[14px] text-[#464555] leading-relaxed">
              You have <strong className="text-[#131b2e] font-semibold">3 lectures and 1 lab</strong> scheduled for today{' '}
              <span className="font-['JetBrains_Mono'] text-[13px] text-[#131b2e] font-medium">(Wednesday, March 4, 2026)</span>.{' '}
              <span className="text-[#006e4b] font-semibold">1 lecture currently in session</span> in Room 210.
            </p>
          </div>

          {/* Daily Encouraging Quote for Teachers */}
          <div className="max-w-md w-full bg-[#f2f3ff] rounded-2xl p-4 border border-[#dae2fd] flex flex-col justify-between gap-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#3525cd]">
                <Quote className="w-4 h-4 text-[#3525cd]" />
                <span className="font-['JetBrains_Mono'] text-[11px] font-bold uppercase tracking-wider text-[#0f0069]">
                  Daily Teacher Inspiration
                </span>
              </div>
              <button
                onClick={handleNextQuote}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-['JetBrains_Mono'] text-[#3525cd] hover:bg-[#eaedff] transition-all cursor-pointer"
                title="Shuffle inspiring quote"
              >
                <Shuffle className="w-3 h-3" />
                <span>Next Quote</span>
              </button>
            </div>
            <p className="text-[13px] font-medium text-[#131b2e] italic leading-snug">
              &ldquo;{TEACHER_QUOTES[quoteIndex].quote}&rdquo;
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-[#dae2fd]/60 text-[11px] text-[#464555]">
              <span className="font-semibold text-[#3525cd]">— {TEACHER_QUOTES[quoteIndex].author}</span>
              <span className="font-['JetBrains_Mono'] text-[#006e4b] font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#006e4b]" />
                Teaching 182 Minds Today
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div
          id="kpi-todays-lectures"
          className="bg-white rounded-xl p-5 shadow-sm border border-[#eaedff] flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#464555] font-semibold uppercase tracking-wider">
              Today's Lectures
            </span>
            <span className="w-9 h-9 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-[#3525cd]">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-['Sora'] text-3xl font-bold text-[#131b2e] leading-none">
              4
            </span>
            <span className="text-[14px] text-[#464555]">Sessions</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px] text-[#464555]">
            <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e] font-medium">1 Done</span>
            <span className="px-2 py-0.5 rounded bg-[#6ffbbe] text-[#002113] font-bold">1 Active</span>
            <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e] font-medium">2 Upcoming</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div
          id="kpi-avg-attendance"
          onClick={() => onNavigateScreen('student-attendance')}
          className="bg-white rounded-xl p-5 shadow-sm border border-[#eaedff] flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#464555] font-semibold uppercase tracking-wider">
              Avg Daily Attendance
            </span>
            <span className="w-9 h-9 rounded-lg bg-[#6ffbbe] flex items-center justify-center text-[#002113]">
              <BarChart3 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-['Sora'] text-3xl font-bold text-[#131b2e] leading-none">
              89.4%
            </span>
            <span className="font-['JetBrains_Mono'] text-[12px] text-[#006e4b] font-bold">
              ↑ +2.1% wk
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-full bg-[#e2e7ff] h-2 rounded-full overflow-hidden">
              <div className="bg-[#006e4b] h-full rounded-full transition-all" style={{ width: '89.4%' }} />
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555] whitespace-nowrap">
              182 enrolled
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div
          id="kpi-urgent-doubts"
          onClick={onOpenDoubtsModal}
          className="bg-white rounded-xl p-5 shadow-sm border border-[#eaedff] flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#464555] font-semibold uppercase tracking-wider">
              Urgent Doubts Flagged
            </span>
            <span className="w-9 h-9 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
              <Flag className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-['Sora'] text-3xl font-bold text-[#ba1a1a] leading-none">
              7
            </span>
            <span className="text-[14px] text-[#464555]">High Priority</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[#464555] font-['JetBrains_Mono'] text-[11px]">
            <span className="text-[#131b2e] font-semibold">ES-101 (4) • ME-102 (3)</span>
            <span className="text-[#3525cd] font-bold group-hover:underline flex items-center gap-0.5">
              Resolve →
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div
          id="kpi-pending-prep"
          onClick={() => onNavigateScreen('teacher-workspace-and-leaves')}
          className="bg-white rounded-xl p-5 shadow-sm border border-[#eaedff] flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#464555] font-semibold uppercase tracking-wider">
              Pending Lesson Prep
            </span>
            <span className="w-9 h-9 rounded-lg bg-[#e9ddff] flex items-center justify-center text-[#23005c]">
              <CheckSquare className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-['Sora'] text-3xl font-bold text-[#131b2e] leading-none">
              3
            </span>
            <span className="text-[14px] text-[#464555]">Tasks Pending</span>
          </div>
          <div className="mt-3 flex items-center justify-between font-['JetBrains_Mono'] text-[11px]">
            <span className="text-[#6b38d4] font-semibold">Lab Handout & Quiz 2</span>
            <span className="text-[#464555]">Due by 05:00 PM</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout: 70% Timeline, 30% Quick Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: 70% Lecture Schedule & Timeline (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#eaedff] flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-6 bg-[#3525cd] rounded-full" />
                <div>
                  <h2 className="font-['Sora'] font-semibold text-[18px] text-[#131b2e]">
                    Daily Lecture Schedule
                  </h2>
                  <p className="text-[13px] text-[#464555]">
                    Academic Track • Department of Computer Science & Mechanical Eng.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-['JetBrains_Mono'] text-[12px] bg-[#f2f3ff] px-3 py-1 rounded-md text-[#464555] font-medium border border-[#e2e7ff]">
                  4 Sessions (360 Mins)
                </span>
                <button
                  onClick={() => onNavigateScreen('academic-calendar')}
                  className="p-1.5 rounded-lg text-[#464555] hover:bg-[#f2f3ff] hover:text-[#131b2e] transition-colors"
                  title="View schedule filter"
                  aria-label="View schedule filter"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Timeline Container */}
            <div className="relative flex flex-col gap-4">
              {/* SLOT 1: Completed */}
              <div
                id="lecture-slot-es101-diva"
                className="relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-[#f2f3ff]/70 hover:bg-[#f2f3ff] transition-all gap-4 border border-[#e2e7ff]/70"
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-28 shrink-0 py-1.5 px-2 rounded-lg bg-white text-center border border-[#e2e7ff] shadow-xs">
                    <span className="font-['JetBrains_Mono'] text-[13px] font-bold text-[#131b2e]">
                      09:00 AM
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555]">
                      09:50 AM
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-['JetBrains_Mono'] text-[12px] font-bold px-2 py-0.5 rounded bg-[#dae2fd] text-[#3323cc]">
                        ES-101
                      </span>
                      <span className="font-medium text-[14px] text-[#131b2e]">
                        Basic Electrical & Electronics
                      </span>
                      <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e]">
                        Div A • 54 students
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[12px] text-[#464555] mt-0.5">
                      <span className="flex items-center gap-1.5">
                        <DoorOpen className="w-4 h-4 text-[#777587]" />
                        Room 402 (Hall 4)
                      </span>
                      <span className="flex items-center gap-1.5 text-[#006e4b] font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Attendance Marked (50/54 • 92.6%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <span className="font-['JetBrains_Mono'] text-[11px] px-3 py-1 rounded-full bg-[#eaedff] text-[#464555] font-semibold">
                    Completed
                  </span>
                  <button
                    onClick={() => handleOpenClassHub(lectures[0] || {
                      id: 'lec-1',
                      timeStart: '09:00 AM',
                      timeEnd: '09:50 AM',
                      courseCode: 'ES-101',
                      courseTitle: 'Basic Electrical & Electronics',
                      division: 'Div A • 54 students',
                      studentsCount: 54,
                      room: 'Room 402 (Hall 4)',
                      status: 'completed',
                      actionType: 'view_roster',
                    })}
                    className="px-3.5 py-1.5 rounded-lg bg-white text-[#131b2e] hover:bg-[#eaedff] text-[13px] font-medium shadow-xs transition-all flex items-center gap-1.5 border border-[#e2e7ff] cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#3525cd]" />
                    <span>Class Info</span>
                  </button>
                  <button
                    onClick={() => handleOpenClassHub(lectures[0] || {
                      id: 'lec-1',
                      timeStart: '09:00 AM',
                      timeEnd: '09:50 AM',
                      courseCode: 'ES-101',
                      courseTitle: 'Basic Electrical & Electronics',
                      division: 'Div A • 54 students',
                      studentsCount: 54,
                      room: 'Room 402 (Hall 4)',
                      status: 'completed',
                      actionType: 'view_roster',
                    }, 'attendance')}
                    className="px-3 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3525cd] text-[13px] font-semibold transition-all flex items-center gap-1.5 border border-[#dae2fd] cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Attendance (50)</span>
                  </button>
                </div>
              </div>

              {/* SLOT 2: IN PROGRESS (Featured Card with Emerald Beacon) */}
              <div
                id="lecture-slot-me102-divb"
                className="relative flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl bg-white shadow-md border-2 border-[#3525cd]/30 transition-all gap-4 overflow-hidden cursor-pointer"
                onClick={() => handleOpenClassHub(lectures[1] || {
                  id: 'lec-2',
                  timeStart: '10:15 AM',
                  timeEnd: '11:05 AM',
                  courseCode: 'ME-102',
                  courseTitle: 'Engineering Thermodynamics',
                  division: 'Division B (48 Students)',
                  studentsCount: 48,
                  room: 'Room 210 (South Block)',
                  status: 'in_session',
                  actionType: 'live_attendance',
                })}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3525cd]" />

                <div className="flex items-start md:items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-28 shrink-0 py-2 px-2 rounded-lg bg-[#e2dfff] text-center border border-[#c3c0ff]">
                    <span className="font-['JetBrains_Mono'] text-[13px] font-bold text-[#0f0069]">
                      10:15 AM
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#3323cc]">
                      11:05 AM
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#3525cd] font-bold mt-1 uppercase tracking-wider">
                      NOW
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-['JetBrains_Mono'] text-[12px] font-bold px-2 py-0.5 rounded bg-[#dae2fd] text-[#3525cd]">
                        ME-102
                      </span>
                      <h3 className="font-['Sora'] font-semibold text-[16px] text-[#131b2e]">
                        Engineering Thermodynamics
                      </h3>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] font-['JetBrains_Mono'] text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#006e4b] animate-ping" />
                        <span>IN SESSION</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#464555]">
                      <span className="flex items-center gap-1.5 font-medium text-[#131b2e]">
                        <Users className="w-4 h-4 text-[#3525cd]" />
                        Division B (48 Students)
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-[#131b2e]">
                        <DoorOpen className="w-4 h-4 text-[#777587]" />
                        Room 210 (South Block)
                      </span>
                      <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555] bg-[#f2f3ff] px-2 py-0.5 rounded">
                        Elapsed: 22m / 50m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Live Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenClassHub(lectures[1], 'details')}
                    className="px-3.5 py-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-[13px] font-medium transition-colors flex items-center gap-1.5 border border-[#e2e7ff] cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#777587]" />
                    <span>Class Info</span>
                  </button>

                  <button
                    onClick={() => handleOpenClassHub(lectures[1], 'attendance')}
                    className="px-4 py-2 rounded-lg bg-[#3525cd] text-white font-medium text-[13px] flex items-center gap-2 shadow-sm hover:bg-[#3323cc] transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Take Attendance</span>
                  </button>
                </div>
              </div>

              {/* SLOT 3: Upcoming */}
              <div
                id="lecture-slot-es101-divc"
                className="relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-[#f2f3ff]/70 hover:bg-[#f2f3ff] transition-all gap-4 border border-[#e2e7ff]/70 cursor-pointer"
                onClick={() => handleOpenClassHubByCode('ES-101 (C)', 'Division C', '11:30 AM - 12:20 PM', 'Room 405 (Interactive Media Rm)')}
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-28 shrink-0 py-1.5 px-2 rounded-lg bg-white text-center border border-[#e2e7ff] shadow-xs">
                    <span className="font-['JetBrains_Mono'] text-[13px] font-bold text-[#131b2e]">
                      11:30 AM
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555]">
                      12:20 PM
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-['JetBrains_Mono'] text-[12px] font-bold px-2 py-0.5 rounded bg-[#dae2fd] text-[#3323cc]">
                        ES-101
                      </span>
                      <span className="font-medium text-[14px] text-[#131b2e]">
                        Basic Electrical & Electronics
                      </span>
                      <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e]">
                        Div C • 50 students
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[12px] text-[#464555] mt-0.5">
                      <span className="flex items-center gap-1.5">
                        <DoorOpen className="w-4 h-4 text-[#777587]" />
                        Room 405 (Interactive Media Rm)
                      </span>
                      <span className="flex items-center gap-1.5 text-[#6b38d4] font-medium">
                        <Clock className="w-4 h-4" />
                        Starts in 25 mins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenClassHubByCode('ES-101 (C)', 'Division C', '11:30 AM - 12:20 PM', 'Room 405 (Interactive Media Rm)')}
                    className="px-3.5 py-1.5 rounded-lg bg-white text-[#131b2e] hover:bg-[#eaedff] text-[13px] font-medium shadow-xs transition-all flex items-center gap-1.5 border border-[#e2e7ff] cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#3525cd]" />
                    <span>Class Info</span>
                  </button>
                  <button
                    onClick={() => {
                      handleOpenClassHubByCode('ES-101 (C)', 'Division C', '11:30 AM - 12:20 PM', 'Room 405 (Interactive Media Rm)');
                      setClassHubTab('attendance');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#3525cd] hover:bg-[#3323cc] text-white text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Take Attendance</span>
                  </button>
                </div>
              </div>

              {/* SLOT 4: Practical Lab (2h 30m) */}
              <div
                id="lecture-slot-es101l-lab"
                className="relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-[#f2f3ff]/70 hover:bg-[#f2f3ff] transition-all gap-4 border border-[#e2e7ff]/70 cursor-pointer"
                onClick={() => handleOpenClassHubByCode('ES-101L (B1)', 'Batch 1 Lab', '02:00 PM - 04:30 PM', 'Systems Hardware Lab 2')}
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-28 shrink-0 py-2 px-2 rounded-lg bg-white text-center border border-[#e2e7ff] shadow-xs">
                    <span className="font-['JetBrains_Mono'] text-[13px] font-bold text-[#131b2e]">
                      02:00 PM
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555]">
                      04:30 PM
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[#6b38d4] font-bold tracking-wide mt-0.5">
                      LAB (150m)
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-['JetBrains_Mono'] text-[12px] font-bold px-2 py-0.5 rounded bg-[#e9ddff] text-[#6b38d4]">
                        ES-101L
                      </span>
                      <span className="font-medium text-[14px] text-[#131b2e]">
                        Basic Electronics Practical Lab
                      </span>
                      <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e]">
                        Batch 1 • 30 students
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#464555] mt-0.5">
                      <span className="flex items-center gap-1.5">
                        <FlaskConical className="w-4 h-4 text-[#777587]" />
                        Systems Hardware Lab 2
                      </span>
                      <span className="flex items-center gap-1.5 text-[#006e4b] font-medium">
                        <Radio className="w-4 h-4" />
                        4 experiment workstations prepared
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenClassHubByCode('ES-101L (B1)', 'Batch 1 Lab', '02:00 PM - 04:30 PM', 'Systems Hardware Lab 2')}
                    className="px-3.5 py-1.5 rounded-lg bg-white text-[#131b2e] hover:bg-[#eaedff] text-[13px] font-medium shadow-xs transition-all flex items-center gap-1.5 border border-[#e2e7ff] cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#3525cd]" />
                    <span>Lab Info</span>
                  </button>
                  <button
                    onClick={() => {
                      handleOpenClassHubByCode('ES-101L (B1)', 'Batch 1 Lab', '02:00 PM - 04:30 PM', 'Systems Hardware Lab 2');
                      setClassHubTab('attendance');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#3525cd] hover:bg-[#3323cc] text-white text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Take Attendance</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Attendance Launcher Strip */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#3525cd]" />
                <span className="font-medium text-[14px] text-[#131b2e]">
                  Quick Class Hub & Attendance Launcher
                </span>
              </div>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555]">
                Click any class to inspect & mark
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleOpenClassHubByCode('ES-101 (A)', 'Division A', '09:00 AM - 09:50 AM', 'Room 402 (Hall 4)')}
                className="p-3 rounded-lg bg-[#f2f3ff] hover:bg-[#e2dfff] transition-all flex flex-col items-center text-center gap-1 border border-[#e2e7ff] cursor-pointer"
              >
                <span className="font-['JetBrains_Mono'] text-[12px] font-bold text-[#131b2e]">
                  ES-101 (A)
                </span>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#006e4b] font-medium">
                  Done • 92.6%
                </span>
              </button>

              <button
                onClick={() => handleOpenClassHubByCode('ME-102 (B)', 'Division B', '10:15 AM - 11:05 AM', 'Room 210 (South Block)')}
                className="p-3 rounded-lg bg-[#3525cd] text-white shadow-sm hover:scale-[1.02] transition-all flex flex-col items-center text-center gap-1 cursor-pointer"
              >
                <span className="font-['JetBrains_Mono'] text-[12px] font-bold">
                  ME-102 (B)
                </span>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#6ffbbe] font-bold">
                  ● Active Now
                </span>
              </button>

              <button
                onClick={() => handleOpenClassHubByCode('ES-101 (C)', 'Division C', '11:30 AM - 12:20 PM', 'Room 405 (Interactive Media Rm)')}
                className="p-3 rounded-lg bg-[#f2f3ff] hover:bg-[#3525cd] hover:text-white transition-all flex flex-col items-center text-center gap-1 border border-[#e2e7ff] group cursor-pointer"
              >
                <span className="font-['JetBrains_Mono'] text-[12px] font-bold group-hover:text-white">
                  ES-101 (C)
                </span>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555] group-hover:text-white">
                  Opens 11:25
                </span>
              </button>

              <button
                onClick={() => handleOpenClassHubByCode('ES-101L (B1)', 'Batch 1 Lab', '02:00 PM - 04:30 PM', 'Systems Hardware Lab 2')}
                className="p-3 rounded-lg bg-[#f2f3ff] hover:bg-[#3525cd] hover:text-white transition-all flex flex-col items-center text-center gap-1 border border-[#e2e7ff] group cursor-pointer"
              >
                <span className="font-['JetBrains_Mono'] text-[12px] font-bold group-hover:text-white">
                  ES-101L (B1)
                </span>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555] group-hover:text-white">
                  Opens 13:55
                </span>
              </button>
            </div>
          </div>

          {/* Academic Plug-in Folder & Classroom Add-ons */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#eaedff] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e2dfff] text-[#0f0069] flex items-center justify-center font-bold">
                  <Folder className="w-5 h-5 text-[#3525cd]" />
                </div>
                <div>
                  <h3 className="font-['Sora'] font-semibold text-[16px] text-[#131b2e] flex items-center gap-2">
                    <span>Academic Plug-in Folder</span>
                    <span className="font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#006e4b] font-bold">
                      {pluginsList.filter((p) => p.enabled).length} Active
                    </span>
                  </h3>
                  <p className="text-[13px] text-[#464555]">
                    LMS sync, RFID attendance scanner, automated recorders & AI assistant
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPluginFolderModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3525cd] text-[13px] font-semibold flex items-center gap-1.5 border border-[#dae2fd] cursor-pointer transition-all shadow-2xs shrink-0"
              >
                <Folder className="w-4 h-4" />
                <span>Open Plug-in Folder</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {pluginsList.slice(0, 4).map((plugin) => (
                <div
                  key={plugin.id}
                  onClick={() => setPluginFolderModalOpen(true)}
                  className="p-3.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] hover:border-[#dae2fd] hover:bg-white transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-['JetBrains_Mono'] text-[10px] text-[#464555] font-semibold uppercase tracking-wider truncate">
                        {plugin.category}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${plugin.enabled ? 'bg-[#006e4b]' : 'bg-[#777587]'}`} />
                    </div>
                    <div className="font-semibold text-[13px] text-[#131b2e] group-hover:text-[#3525cd] transition-colors line-clamp-1">
                      {plugin.name}
                    </div>
                    <p className="text-[11px] text-[#777587] line-clamp-1 mt-0.5">
                      {plugin.description}
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#f2f3ff] flex items-center justify-between font-['JetBrains_Mono'] text-[11px]">
                    <span className="text-[#464555]">{plugin.version}</span>
                    <span className="text-[#3525cd] font-semibold">{plugin.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 30% Biometric & Faculty Quick Hub (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Biometric Punch & Shift Status Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#eaedff] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-[#006e4b]" />
                <h3 className="font-['Sora'] font-semibold text-[16px] text-[#131b2e]">
                  Faculty Biometrics
                </h3>
              </div>
              <span className="font-['JetBrains_Mono'] text-[11px] px-2.5 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] font-bold">
                VERIFIED
              </span>
            </div>

            {/* Working Hours Progress Ring / Bar */}
            <div className="p-4 rounded-xl bg-[#f2f3ff] flex flex-col gap-3 border border-[#e2e7ff]">
              <div className="flex justify-between items-baseline">
                <span className="text-[13px] text-[#464555]">Shift Elapsed</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-['Sora'] text-lg font-bold text-[#131b2e] font-mono">
                    1h 45m
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555]">
                    / 7h 00m
                  </span>
                </div>
              </div>

              <div className="w-full bg-[#e2e7ff] h-2 rounded-full overflow-hidden">
                <div className="bg-[#3525cd] h-full rounded-full" style={{ width: '25%' }} />
              </div>

              <div className="flex items-center justify-between font-['JetBrains_Mono'] text-[11px] text-[#464555] pt-1">
                <span>
                  Punch In: <strong className="text-[#131b2e] font-semibold">08:42 AM</strong>
                </span>
                <span>
                  Est. Out: <strong className="text-[#131b2e] font-semibold">04:45 PM</strong>
                </span>
              </div>
            </div>

            {/* Biometric Gate details */}
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex items-center justify-between py-1">
                <span className="text-[#464555] flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-[#777587]" />
                  Entry Portal
                </span>
                <span className="font-['JetBrains_Mono'] text-[12px] text-[#131b2e] font-medium">
                  Biometric Gate 3 (East)
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#464555] flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-[#777587]" />
                  Network Auth
                </span>
                <span className="font-['JetBrains_Mono'] text-[12px] text-[#006e4b] font-medium">
                  Campus-5G-Faculty-Secure
                </span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#eaedff] text-[#131b2e] font-['JetBrains_Mono'] text-[11px]">
                <Check className="w-4 h-4 text-[#006e4b] shrink-0" />
                <span>Compliance rule met: Minimum 45min before 1st lecture</span>
              </div>
            </div>
          </div>

          {/* Upcoming Exam Alert Banner */}
          <div
            onClick={() => onNavigateScreen('academic-calendar')}
            className="rounded-xl p-4 bg-gradient-to-r from-[#e2dfff] via-[#e2e7ff] to-[#eaedff] shadow-sm border border-[#c3c0ff] flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-[#3525cd] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <AlarmClock className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[14px] text-[#131b2e]">
                  Mid-Term Examination
                </span>
                <span className="font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] font-bold">
                  T-6 Days
                </span>
              </div>
              <p className="text-[12px] text-[#464555] leading-relaxed">
                Commences on <strong className="text-[#131b2e] font-semibold font-mono">March 10, 2026</strong>. Final question paper submission portal locks this Friday.
              </p>
            </div>
          </div>

          {/* Quick Sticky Notes & Micro Tasks Widget */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#eaedff] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNoteIcon className="w-5 h-5 text-[#464555]" />
                <h3 className="font-['Sora'] font-semibold text-[16px] text-[#131b2e]">
                  Sticky Workspace
                </h3>
              </div>
              <button
                onClick={() => setShowAddNoteModal(true)}
                className="p-1 px-2 rounded-lg text-[#3525cd] hover:bg-[#eaedff] transition-colors flex items-center gap-1 text-[13px] font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </button>
            </div>

            {/* Note list */}
            <div className="flex flex-col gap-3">
              {stickyNotes.map((note) => {
                const isRose = note.tag.includes('EXAM') || note.category === 'exam';
                const isEmerald = note.tag.includes('LAB') || note.category === 'lab';

                return (
                  <div
                    key={note.id}
                    className={`p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden transition-all border ${
                      isRose
                        ? 'bg-[#fff1f2] border-[#ffe4e6]'
                        : isEmerald
                        ? 'bg-[#ecfdf5] border-[#d1fae5]'
                        : 'bg-[#f2f3ff] border-[#e2e7ff]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded font-bold tracking-wide"
                        style={{ backgroundColor: note.tagBg, color: note.tagText }}
                      >
                        {note.tag}
                      </span>
                      <span
                        className="font-['JetBrains_Mono'] text-[11px] font-medium"
                        style={{ color: isRose ? '#9f1239' : isEmerald ? '#065f46' : '#464555' }}
                      >
                        {note.dueText}
                      </span>
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={note.completed}
                        onChange={() => onToggleNote(note.id)}
                        className="mt-1 rounded text-[#3525cd] focus:ring-0 cursor-pointer w-4 h-4 border-[#777587]"
                      />
                      <span
                        className={`text-[13px] leading-snug font-medium transition-all ${
                          note.completed
                            ? 'line-through opacity-70 text-[#464555]'
                            : isRose
                            ? 'text-[#881337]'
                            : isEmerald
                            ? 'text-[#064e3b]'
                            : 'text-[#131b2e]'
                        }`}
                      >
                        {note.content}
                      </span>
                    </label>

                    <div
                      className="flex items-center justify-between pt-1 font-['JetBrains_Mono'] text-[11px]"
                      style={{ color: isRose ? '#9f1239' : isEmerald ? '#065f46' : '#464555' }}
                    >
                      <span className="truncate">{note.meta}</span>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="text-[#777587] hover:text-[#ba1a1a] p-1 rounded transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Add Note Form Modal */}
            {showAddNoteModal && (
              <form
                onSubmit={handleCreateNote}
                className="p-3.5 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] flex flex-col gap-2.5 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#131b2e]">Add New Sticky Note</span>
                  <button
                    type="button"
                    onClick={() => setShowAddNoteModal(false)}
                    className="text-[11px] text-[#777587] hover:underline"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {['URGENT • EXAM', 'CO-INSTRUCTOR', 'LAB PREP', 'RESEARCH'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewNoteTag(t)}
                      className={`text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded font-semibold cursor-pointer ${
                        newNoteTag === t
                          ? 'bg-[#3525cd] text-white'
                          : 'bg-white text-[#464555] border border-[#e2e7ff]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Note text..."
                  className="w-full text-[13px] bg-white rounded-lg p-2 border border-[#e2e7ff] focus:outline-none focus:border-[#3525cd]"
                  autoFocus
                />

                <button
                  type="submit"
                  className="w-full py-1.5 bg-[#3525cd] text-white rounded-lg text-[12px] font-semibold hover:bg-[#3323cc] cursor-pointer"
                >
                  Save to Sticky Board
                </button>
              </form>
            )}
          </div>

          {/* Faculty Quick Hotline / Escalation */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#eaedff] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-[#3525cd]">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-[#131b2e]">
                  AV/Podium Tech Support
                </span>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555]">
                  Ext. 209 (1-click call)
                </span>
              </div>
            </div>

            <button
              id="ring-desk-button"
              onClick={handleRingDesk}
              disabled={isCallingDesk}
              className="px-3.5 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-[13px] font-semibold transition-colors border border-[#e2e7ff] cursor-pointer flex items-center gap-1.5"
            >
              <PhoneCall className={`w-3.5 h-3.5 text-[#3525cd] ${isCallingDesk ? 'animate-bounce' : ''}`} />
              <span>{isCallingDesk ? 'Calling...' : 'Ring Desk'}</span>
            </button>
          </div>

          {deskCallStatus && (
            <div className="p-3 bg-[#e2dfff] rounded-xl border border-[#c3c0ff] text-[12px] text-[#0f0069] font-['JetBrains_Mono'] animate-in fade-in">
              {deskCallStatus}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          CLASS OVERVIEW & IN-PAGE ATTENDANCE HUB MODAL
          When teacher clicks on any class (e.g. ES-101 C, ME-102, ES-101 A),
          all information of the class is shown with option to take attendance directly.
         ========================================================================= */}
      {selectedClassHub && (() => {
        const classStudents = getStudentsForClass(selectedClassHub);
        const filteredRoster = classStudents.filter((s) => {
          if (!classRosterSearch.trim()) return true;
          const q = classRosterSearch.toLowerCase();
          return s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q);
        });
        const pCount = classStudents.filter((s) => s.status === 'present').length;
        const lCount = classStudents.filter((s) => s.status === 'late').length;
        const aCount = classStudents.filter((s) => s.status === 'absent').length;
        const rate = classStudents.length > 0
          ? Math.round(((pCount + lCount * 0.5) / classStudents.length) * 100)
          : 92;

        const isES101C = selectedClassHub.courseCode.includes('101') && (selectedClassHub.room.includes('405') || selectedClassHub.courseTitle.includes('Div C') || (selectedClassHub as any).batch?.includes('C'));
        const isME102 = selectedClassHub.courseCode.includes('102');
        const isLab = selectedClassHub.courseCode.includes('101L');

        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
            <div className="bg-[#faf8ff] rounded-2xl shadow-2xl border border-[#eaedff] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="px-6 py-4 bg-white border-b border-[#eaedff] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#3525cd] text-white flex items-center justify-center font-['JetBrains_Mono'] font-bold text-sm shadow-md">
                    {selectedClassHub.courseCode.split(' ')[0] || 'CLASS'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#131b2e]">
                        {selectedClassHub.courseCode} — {selectedClassHub.courseTitle}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e2dfff] text-[#0f0069] border border-[#c3c0ff]">
                        {isES101C ? 'Division C' : isME102 ? 'Division B' : isLab ? 'Lab Batch B1' : 'Division A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[12px] text-[#464555]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#3525cd]" />
                        {selectedClassHub.timeStart} - {selectedClassHub.timeEnd}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <DoorOpen className="w-3.5 h-3.5 text-[#3525cd]" />
                        Room {selectedClassHub.room}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#3525cd]" />
                        {classStudents.length} Students Enrolled
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedClassHub(null)}
                  className="w-9 h-9 rounded-xl hover:bg-[#f2f3ff] text-[#464555] hover:text-[#131b2e] flex items-center justify-center transition-colors border border-transparent hover:border-[#dae2fd]"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="px-6 bg-[#f2f3ff] border-b border-[#eaedff] flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setClassHubTab('details')}
                    className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                      classHubTab === 'details'
                        ? 'border-[#3525cd] text-[#3525cd] bg-white rounded-t-lg'
                        : 'border-transparent text-[#464555] hover:text-[#131b2e]'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Class Information & Syllabus
                  </button>

                  <button
                    onClick={() => setClassHubTab('attendance')}
                    className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                      classHubTab === 'attendance'
                        ? 'border-[#3525cd] text-[#3525cd] bg-white rounded-t-lg shadow-xs'
                        : 'border-transparent text-[#464555] hover:text-[#131b2e]'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    Take Attendance Roster
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-['JetBrains_Mono'] bg-[#3525cd] text-white">
                      {pCount}/{classStudents.length}
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => onOpenAttendance(selectedClassHub.courseCode)}
                  className="text-xs font-bold text-[#3525cd] hover:text-[#0f0069] flex items-center gap-1 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-white transition-colors"
                >
                  <span>Open Full Attendance Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toast Notification for In-Class Attendance Save */}
              {classAttendanceSavedToast && (
                <div className="mx-6 mt-4 p-3 bg-[#e8f8f0] border border-[#a1e3cb] rounded-xl flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#006e4b]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{classAttendanceSavedToast}</span>
                  </div>
                  <button
                    onClick={() => setClassAttendanceSavedToast(null)}
                    className="text-[#006e4b] hover:text-[#004f36]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                
                {/* TAB 1: CLASS INFORMATION & SYLLABUS */}
                {classHubTab === 'details' && (
                  <div className="space-y-6">
                    {/* Top Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-4 rounded-xl border border-[#eaedff]">
                        <span className="text-[11px] font-bold text-[#777587] uppercase">Attendance Health</span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-bold font-['JetBrains_Mono'] text-[#006e4b]">{rate}%</span>
                          <span className="text-[10px] font-semibold text-[#006e4b] bg-[#e8f8f0] px-1.5 py-0.5 rounded">Good</span>
                        </div>
                        <p className="text-[11px] text-[#777587] mt-1">{pCount} Present, {lCount} Late today</p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-[#eaedff]">
                        <span className="text-[11px] font-bold text-[#777587] uppercase">Academic Term</span>
                        <div className="mt-1 text-base font-bold text-[#131b2e]">Semester II</div>
                        <p className="text-[11px] text-[#777587] mt-1">Session 2024-25 (Odd Term)</p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-[#eaedff]">
                        <span className="text-[11px] font-bold text-[#777587] uppercase">Credits & L-T-P</span>
                        <div className="mt-1 text-base font-bold text-[#131b2e]">
                          {isLab ? '1.5 Credits (0-0-3)' : '4.0 Credits (3-1-0)'}
                        </div>
                        <p className="text-[11px] text-[#777587] mt-1">Theory + Practical component</p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-[#eaedff]">
                        <span className="text-[11px] font-bold text-[#777587] uppercase">Course Lead</span>
                        <div className="mt-1 text-base font-bold text-[#131b2e]">Prof. Rajesh Verma</div>
                        <p className="text-[11px] text-[#777587] mt-1">Lead Instructor & Mentor</p>
                      </div>
                    </div>

                    {/* Active Syllabus & Topics Section */}
                    <div className="bg-white p-5 rounded-xl border border-[#eaedff]">
                      <div className="flex items-center justify-between pb-3 border-b border-[#f2f3ff]">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#3525cd]" />
                          <h3 className="text-sm font-bold text-[#131b2e]">Current Module & Learning Objectives</h3>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-['JetBrains_Mono'] bg-[#eaedff] text-[#3525cd]">
                          {isES101C ? 'Unit 3 of 5' : isME102 ? 'Unit 4 of 6' : 'Experiment 6 of 10'}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-[#faf8ff] rounded-xl border border-[#eaedff]">
                          <span className="text-[11px] font-bold text-[#3525cd] uppercase tracking-wider font-['JetBrains_Mono']">
                            CURRENT TOPIC IN PROGRESS
                          </span>
                          <h4 className="text-sm font-bold text-[#131b2e] mt-1">
                            {isES101C
                              ? 'AC Circuit Fundamentals: Phasor Algebra, Series Resonance & Quality Factor (Q)'
                              : isME102
                              ? 'Second Law of Thermodynamics: Kelvin-Planck & Clausius Statements, Heat Pumps'
                              : 'Transient Response of Second-Order RLC Circuits with Digital Storage Oscilloscope'}
                          </h4>
                          <p className="text-xs text-[#464555] mt-1">
                            {isES101C
                              ? 'Covers frequency response curves, half-power cutoff frequencies, dynamic impedance at resonance, and real/reactive power measurement using two-wattmeter method.'
                              : isME102
                              ? 'Analysis of reversible and irreversible processes, Carnot cycle thermal efficiency bounds, and entropy generation in control volume systems.'
                              : 'Hands-on validation of underdamped, critically damped, and overdamped voltage wave shapes using Rigol DS1054Z oscilloscopes.'}
                          </p>
                        </div>

                        {/* Learning Outcomes Checklist */}
                        <div>
                          <h5 className="text-xs font-bold text-[#131b2e] mb-2">Key Learning Outcomes for this Week:</h5>
                          <ul className="space-y-1.5 text-xs text-[#464555]">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#006e4b] shrink-0 mt-0.5" />
                              <span>Calculate equivalent impedance and phase angle between voltage and branch currents.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#006e4b] shrink-0 mt-0.5" />
                              <span>Determine resonant frequency \(f_0\) and bandwidth \(\Delta f\) for series RLC configurations.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#006e4b] shrink-0 mt-0.5" />
                              <span>Apply power factor correction techniques using shunt capacitor banks in inductive loads.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Resources & Recommended Readings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-[#eaedff]">
                        <h4 className="text-xs font-bold text-[#131b2e] mb-2 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#3525cd]" />
                          Lecture Notes & Documents
                        </h4>
                        <ul className="space-y-2 text-xs">
                          <li className="flex items-center justify-between p-2 rounded-lg bg-[#faf8ff] hover:bg-[#f2f3ff] transition-colors">
                            <span className="font-semibold text-[#131b2e]">Unit 3 - Phasor Analysis Handout.pdf</span>
                            <span className="text-[11px] text-[#777587]">2.4 MB</span>
                          </li>
                          <li className="flex items-center justify-between p-2 rounded-lg bg-[#faf8ff] hover:bg-[#f2f3ff] transition-colors">
                            <span className="font-semibold text-[#131b2e]">Tutorial Sheet 4 - Problem Set.pdf</span>
                            <span className="text-[11px] text-[#777587]">1.1 MB</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-[#eaedff]">
                        <h4 className="text-xs font-bold text-[#131b2e] mb-2 flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-[#3525cd]" />
                          Reference Textbooks
                        </h4>
                        <div className="text-xs text-[#464555] space-y-1.5">
                          <p><strong className="text-[#131b2e]">Hughes Electrical and Electronic Technology</strong> (12th Edition), Pearson, Chapters 7–9.</p>
                          <p><strong className="text-[#131b2e]">Alexander & Sadiku</strong>: Fundamentals of Electric Circuits, McGraw-Hill Education.</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA to switch to Attendance */}
                    <div className="p-4 bg-[#eaedff] rounded-xl border border-[#dae2fd] flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#131b2e]">Ready to record class attendance?</h4>
                        <p className="text-xs text-[#464555]">
                          Mark attendance for the {classStudents.length} students enrolled in {selectedClassHub.courseCode}.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setClassHubTab('attendance')}
                          className="w-full sm:w-auto px-5 py-2.5 bg-[#3525cd] hover:bg-[#3323cc] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Take Attendance Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: TAKE ATTENDANCE ROSTER */}
                {classHubTab === 'attendance' && (
                  <div className="space-y-4">
                    {/* Attendance Stats & Action Bar */}
                    <div className="bg-white p-4 rounded-xl border border-[#eaedff] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e8f8f0] text-[#006e4b] border border-[#a1e3cb] text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{pCount} Present</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fff8e1] text-[#b25e00] border border-[#ffe082] text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{lCount} Late</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffebee] text-[#ba1a1a] border border-[#ffcdd2] text-xs font-bold">
                          <X className="w-3.5 h-3.5" />
                          <span>{aCount} Absent</span>
                        </div>
                        <div className="text-xs text-[#777587] font-semibold hidden sm:block">
                          Total: <span className="font-['JetBrains_Mono'] text-[#131b2e]">{classStudents.length}</span> students
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            if (onMarkAllPresent && classStudents[0]?.batch) {
                              onMarkAllPresent(classStudents[0].batch);
                            } else if (onUpdateStudentStatus) {
                              classStudents.forEach((s) => onUpdateStudentStatus(s.id, 'present'));
                            }
                            setClassAttendanceSavedToast(`All ${classStudents.length} students marked Present!`);
                            setTimeout(() => setClassAttendanceSavedToast(null), 3000);
                          }}
                          className="px-3 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3525cd] rounded-xl text-xs font-bold border border-[#dae2fd] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Mark All Present</span>
                        </button>

                        <button
                          onClick={() => {
                            setClassAttendanceSavedToast(
                              `Attendance successfully saved for ${selectedClassHub.courseCode}! Present: ${pCount}, Late: ${lCount}, Absent: ${aCount}. Synced with Academic DB.`
                            );
                            setTimeout(() => setClassAttendanceSavedToast(null), 4000);
                          }}
                          className="px-4 py-2 bg-[#006e4b] hover:bg-[#00573b] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Attendance</span>
                        </button>
                      </div>
                    </div>

                    {/* Search Filter */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#777587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={classRosterSearch}
                        onChange={(e) => setClassRosterSearch(e.target.value)}
                        placeholder={`Search ${classStudents.length} students by name or roll number...`}
                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#3525cd]"
                      />
                    </div>

                    {/* Student List */}
                    <div className="bg-white rounded-xl border border-[#eaedff] overflow-hidden">
                      <div className="px-4 py-2.5 bg-[#f2f3ff] border-b border-[#eaedff] grid grid-cols-12 text-[11px] font-bold text-[#777587] uppercase tracking-wider">
                        <div className="col-span-6 sm:col-span-5">Student Information</div>
                        <div className="col-span-3 sm:col-span-3">Batch & Roll No</div>
                        <div className="col-span-3 sm:col-span-4 text-right sm:text-center">Attendance Status</div>
                      </div>

                      <div className="divide-y divide-[#f2f3ff] max-h-[380px] overflow-y-auto custom-scrollbar">
                        {filteredRoster.map((student) => {
                          const initials = student.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('');

                          return (
                            <div
                              key={student.id}
                              className="px-4 py-3 grid grid-cols-12 items-center hover:bg-[#faf8ff] transition-colors"
                            >
                              {/* Student info */}
                              <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#e2dfff] flex items-center justify-center text-[#3525cd] font-bold text-xs shrink-0 border border-[#c3c0ff]">
                                  {student.avatar ? (
                                    <img
                                      src={student.avatar}
                                      alt={student.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <span>{initials}</span>
                                  )}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-[#131b2e] leading-tight">
                                    {student.name}
                                  </div>
                                  <div className="text-[11px] text-[#777587] font-['JetBrains_Mono']">
                                    {student.rollNo}
                                  </div>
                                </div>
                              </div>

                              {/* Batch & Stats */}
                              <div className="col-span-3 sm:col-span-3">
                                <span className="text-[11px] font-semibold text-[#464555] bg-[#f2f3ff] px-2 py-0.5 rounded border border-[#eaedff]">
                                  {student.batch}
                                </span>
                              </div>

                              {/* Status Toggles */}
                              <div className="col-span-3 sm:col-span-4 flex items-center justify-end sm:justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => onUpdateStudentStatus?.(student.id, 'present')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    student.status === 'present'
                                      ? 'bg-[#006e4b] text-white shadow-xs'
                                      : 'bg-[#f2f3ff] text-[#464555] hover:bg-[#e8f8f0] hover:text-[#006e4b]'
                                  }`}
                                  title="Mark Present"
                                >
                                  Present
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onUpdateStudentStatus?.(student.id, 'late')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    student.status === 'late'
                                      ? 'bg-[#b25e00] text-white shadow-xs'
                                      : 'bg-[#f2f3ff] text-[#464555] hover:bg-[#fff8e1] hover:text-[#b25e00]'
                                  }`}
                                  title="Mark Late"
                                >
                                  Late
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onUpdateStudentStatus?.(student.id, 'absent')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    student.status === 'absent'
                                      ? 'bg-[#ba1a1a] text-white shadow-xs'
                                      : 'bg-[#f2f3ff] text-[#464555] hover:bg-[#ffebee] hover:text-[#ba1a1a]'
                                  }`}
                                  title="Mark Absent"
                                >
                                  Absent
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {filteredRoster.length === 0 && (
                          <div className="py-8 text-center text-xs text-[#777587]">
                            No students match "{classRosterSearch}".
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-white border-t border-[#eaedff] flex items-center justify-between">
                <div className="text-xs text-[#777587]">
                  {classHubTab === 'attendance' ? (
                    <span>Changes reflect immediately in the live session roster.</span>
                  ) : (
                    <span>Course curriculum synchronized with Department ERP.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedClassHub(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#464555] hover:bg-[#f2f3ff] transition-colors border border-[#eaedff] cursor-pointer"
                  >
                    Done
                  </button>
                  {classHubTab === 'details' && (
                    <button
                      onClick={() => setClassHubTab('attendance')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#3525cd] text-white hover:bg-[#3323cc] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Take Attendance</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          ACADEMIC PLUG-IN FOLDER MODAL
          View and toggle all connected classroom plugins, LMS bridges, and hardware
         ========================================================================= */}
      {pluginFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-[#faf8ff] rounded-2xl shadow-2xl border border-[#eaedff] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-[#eaedff] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e2dfff] text-[#3525cd] flex items-center justify-center">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#131b2e]">
                    Academic Plug-in Folder & Classroom Add-ons
                  </h2>
                  <p className="text-xs text-[#464555]">
                    Manage active bridges to LMS platforms, biometric hardware, and AI assistants.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPluginFolderModalOpen(false)}
                className="w-9 h-9 rounded-xl hover:bg-[#f2f3ff] text-[#464555] hover:text-[#131b2e] flex items-center justify-center transition-colors border border-transparent hover:border-[#dae2fd]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plugin Toast */}
            {pluginToast && (
              <div className="mx-6 mt-4 p-3 bg-[#e8f8f0] border border-[#a1e3cb] rounded-xl flex items-center justify-between text-xs font-semibold text-[#006e4b] animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{pluginToast}</span>
                </div>
                <button onClick={() => setPluginToast(null)} className="text-[#006e4b]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Plugin List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
              {pluginsList.map((plugin) => (
                <div
                  key={plugin.id}
                  className="p-4 bg-white rounded-xl border border-[#eaedff] hover:border-[#dae2fd] transition-all flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f2f3ff] border border-[#eaedff] flex items-center justify-center text-[#3525cd] shrink-0 mt-0.5">
                      {plugin.id.includes('classroom') ? (
                        <Presentation className="w-5 h-5" />
                      ) : plugin.id.includes('moodle') ? (
                        <Layers className="w-5 h-5" />
                      ) : plugin.id.includes('rfid') ? (
                        <Fingerprint className="w-5 h-5" />
                      ) : plugin.id.includes('zoom') ? (
                        <Radio className="w-5 h-5" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#131b2e]">{plugin.name}</h4>
                        <span className="text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#f2f3ff] text-[#464555] border border-[#eaedff]">
                          {plugin.version}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#e2dfff] text-[#0f0069]">
                          {plugin.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#464555] mt-1">{plugin.description}</p>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          plugin.enabled
                            ? 'bg-[#e8f8f0] text-[#006e4b]'
                            : 'bg-[#f2f3ff] text-[#777587]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${plugin.enabled ? 'bg-[#006e4b]' : 'bg-[#777587]'}`} />
                          {plugin.enabled ? plugin.status : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTogglePlugin(plugin.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        plugin.enabled ? 'bg-[#3525cd]' : 'bg-[#e2e7ff]'
                      }`}
                      role="switch"
                      aria-checked={plugin.enabled}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          plugin.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-white border-t border-[#eaedff] flex items-center justify-between">
              <span className="text-xs text-[#777587]">
                5 Academic Plugins Configured & Ready for Podium
              </span>
              <button
                onClick={() => setPluginFolderModalOpen(false)}
                className="px-4 py-2 bg-[#3525cd] hover:bg-[#3323cc] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
