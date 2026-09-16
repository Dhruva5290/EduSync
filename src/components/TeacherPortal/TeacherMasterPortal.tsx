import React, { useState, useEffect } from 'react';
import {
  User,
  ScreenId,
  Student,
  StickyNote,
  CourseDocument,
  CalendarEvent,
  FlaggedDoubt,
  LeaveRequest,
  LectureSlot,
} from '../../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DailyScheduleScreen } from './screens/DailyScheduleScreen';
import { StudentAttendanceScreen } from './screens/StudentAttendanceScreen';
import { StudentPerformanceScreen } from './screens/StudentPerformanceScreen';
import { UploadDocumentsScreen } from './screens/UploadDocumentsScreen';
import { AcademicCalendarScreen } from './screens/AcademicCalendarScreen';
import { TeacherWorkspaceScreen } from './screens/TeacherWorkspaceScreen';
import { AIAssistantScreen } from './screens/AIAssistantScreen';
import { EcosystemPingModal } from './modals/EcosystemPingModal';

import {
  INITIAL_LECTURES,
  INITIAL_STUDENTS,
  INITIAL_STICKY_NOTES,
  INITIAL_DOCUMENTS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_DOUBTS,
  INITIAL_LEAVES,
} from '../../data/stitchMockData';
import { ANTIGRAVITY_SPEC } from '../../data/antigravitySpec';
import { teacherBackendService } from '../../services/teacherBackendService';

import {
  Search,
  FlaskConical,
  X,
  Send,
  HelpCircle,
  CheckCircle2,
  FileCode2,
  Copy,
  Download,
  Check,
} from 'lucide-react';

interface TeacherMasterPortalProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser?: (userId: string) => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isAuditing?: boolean;
  onExitAudit?: () => void;
}

export const TeacherMasterPortal: React.FC<TeacherMasterPortalProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onLogout,
  theme,
  onToggleTheme,
  isAuditing,
  onExitAudit,
}) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('daily-schedule');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // App Data State (Initialized from stitchMockData, synchronized with teacherBackendService)
  const [lectures, setLectures] = useState<LectureSlot[]>(INITIAL_LECTURES);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(INITIAL_STICKY_NOTES);
  const [documents, setDocuments] = useState<CourseDocument[]>(INITIAL_DOCUMENTS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [doubts, setDoubts] = useState<FlaggedDoubt[]>(INITIAL_DOUBTS);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);

  // Modals & Drawers
  const [doubtsModalOpen, setDoubtsModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [labSetupModalOpen, setLabSetupModalOpen] = useState(false);
  const [rosterModalLecture, setRosterModalLecture] = useState<LectureSlot | null>(null);
  const [schedule1on1Modal, setSchedule1on1Modal] = useState<{
    open: boolean;
    studentName?: string;
  }>({ open: false });
  const [oneOnOneSuccess, setOneOnOneSuccess] = useState<string | null>(null);
  const [antigravityModalOpen, setAntigravityModalOpen] = useState(false);
  const [ecosystemPingModalOpen, setEcosystemPingModalOpen] = useState(false);
  const [copiedSpec, setCopiedSpec] = useState(false);

  // ⌘K hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize from persistent database service
  useEffect(() => {
    teacherBackendService.initFromDatabase().then((connected) => {
      if (connected) {
        // Sync any database updates if available
        const dbLeaves = teacherBackendService.getLeaveRequests();
        if (dbLeaves && dbLeaves.length > 0) {
          const mappedLeaves: LeaveRequest[] = dbLeaves.map((l) => ({
            id: l.id,
            type: (l.leaveType.includes('Casual')
              ? 'Casual'
              : l.leaveType.includes('Paid')
              ? 'Paid'
              : l.leaveType.includes('Duty')
              ? 'Academic Duty'
              : l.leaveType.includes('Medical')
              ? 'Medical'
              : 'Special') as any,
            fromDate: l.startDate,
            toDate: l.endDate,
            days: l.totalDays,
            reason: l.reason,
            proxyFaculty: l.substituteTeacher,
            dateOfJoining: l.dateOfJoining,
            contactPhone: l.contactPhone,
            handoverNotes: l.handoverNotes,
            status: (l.status.includes('Approved') ? 'Approved' : 'Pending') as any,
            submittedDate: l.appliedAt,
          }));
          setLeaves(mappedLeaves);
        }
      }
    });
  }, []);

  const handleCopySpec = () => {
    navigator.clipboard.writeText(ANTIGRAVITY_SPEC);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  const handleDownloadSpec = () => {
    const blob = new Blob([ANTIGRAVITY_SPEC], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ANTIGRAVITY.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Sticky Note handlers
  const handleToggleNote = (id: string) => {
    setStickyNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    );
    teacherBackendService.toggleStickyNoteComplete(id);
  };

  const handleDeleteNote = (id: string) => {
    setStickyNotes((prev) => prev.filter((n) => n.id !== id));
    teacherBackendService.deleteStickyNote(id);
  };

  const handleAddNote = (note: Omit<StickyNote, 'id'>) => {
    const newNote: StickyNote = {
      ...note,
      id: `sn-${Date.now()}`,
    };
    setStickyNotes((prev) => [newNote, ...prev]);
    teacherBackendService.addStickyNote({
      teacherId: currentUser.id,
      title: note.tag,
      content: note.content,
      color: 'yellow',
      priority: note.urgent ? 'high' : 'medium',
      reminderTime: note.dueText,
      isCompleted: false,
    });
  };

  // Student Attendance handlers
  const handleUpdateStudentStatus = (
    studentId: string,
    newStatus: Student['status']
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const isPresent = newStatus === 'present' || newStatus === 'late';
        return {
          ...s,
          status: newStatus,
          punchTime:
            newStatus === 'present'
              ? s.punchTime || '10:02 AM'
              : newStatus === 'late'
              ? '10:14 AM'
              : undefined,
          streak: [isPresent, ...s.streak.slice(0, 4)],
        };
      })
    );
  };

  const handleMarkAllPresent = (batch: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.batch === batch
          ? {
              ...s,
              status: 'present',
              punchTime: s.punchTime || '10:00 AM',
              streak: [true, ...s.streak.slice(0, 4)],
            }
          : s
      )
    );
  };

  // Document handlers
  const handleAddDocument = (doc: CourseDocument) => {
    setDocuments((prev) => [doc, ...prev]);
    teacherBackendService.uploadTeacherResource({
      title: doc.title,
      subjectId: doc.courseCode,
      category: 'Lecture Notes',
      url: '#',
      author: currentUser.name,
      description: `${doc.category} - ${doc.fileSize}`,
      keyTopics: [doc.courseCode, doc.category],
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Calendar Event handlers
  const handleAddEvent = (ev: CalendarEvent) => {
    setCalendarEvents((prev) => [...prev, ev]);
    teacherBackendService.addCalendarEvent({
      subjectId: 'subj-me102',
      subjectCode: ev.courseCode || 'ME-102',
      title: ev.title,
      type: ev.type === 'exam' ? 'Mid-Term Exam' : 'Quiz',
      date: ev.date,
      time: ev.time,
      room: ev.room || 'Campus Hall',
      totalStudents: 48,
      submissionSubmittedCount: 0,
      submissionPendingCount: 48,
    });
  };

  // Leave Handlers
  const handleAddLeave = (
    leave: Omit<LeaveRequest, 'id' | 'status' | 'submittedDate'>
  ) => {
    const newLeave: LeaveRequest = {
      ...leave,
      id: `lr-${Date.now()}`,
      status: 'Pending',
      submittedDate: new Date().toISOString().split('T')[0],
    };
    setLeaves((prev) => [newLeave, ...prev]);

    // Save to persistent database
    teacherBackendService.submitLeaveRequest({
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      leaveType: (leave.type === 'Paid'
        ? 'Paid Leave'
        : leave.type === 'Casual'
        ? 'Casual Leave'
        : leave.type === 'Academic Duty'
        ? 'Duty Leave'
        : leave.type === 'Medical'
        ? 'Medical Leave'
        : 'Casual Leave') as any,
      startDate: leave.fromDate,
      endDate: leave.toDate,
      dateOfJoining: leave.dateOfJoining,
      totalDays: leave.days,
      reason: leave.reason,
      substituteTeacher: leave.proxyFaculty,
      contactPhone: leave.contactPhone,
      handoverNotes: leave.handoverNotes,
    });
  };

  // Doubt handler
  const handleResolveDoubt = (id: string) => {
    setDoubts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, resolved: true } : d))
    );
  };

  // Selected batch when navigating to attendance
  const [attendanceInitialBatch, setAttendanceInitialBatch] = useState<string>('ME-102 (B)');

  // Navigation shortcuts
  const handleOpenAttendance = (courseCode?: string) => {
    if (courseCode) {
      const codeUpper = courseCode.toUpperCase();
      if (codeUpper.includes('101L') || codeUpper.includes('LAB') || codeUpper.includes('B1')) {
        setAttendanceInitialBatch('ES-101L (B1)');
      } else if (codeUpper.includes('101') && (codeUpper.includes('C') || courseCode.includes('405') || courseCode.includes('Div C'))) {
        setAttendanceInitialBatch('ES-101 (C)');
      } else if (codeUpper.includes('101') && (codeUpper.includes('A') || courseCode.includes('Div A'))) {
        setAttendanceInitialBatch('ES-101 (A)');
      } else if (codeUpper.includes('102') || codeUpper.includes('ME-102')) {
        setAttendanceInitialBatch('ME-102 (B)');
      } else {
        setAttendanceInitialBatch(courseCode);
      }
    }
    setCurrentScreen('student-attendance');
  };

  const handleOpenAiLessonPlan = (initialCourse?: string) => {
    setCurrentScreen('ai-teacher-assistant');
  };

  const handleOpenLeaveModal = () => {
    setCurrentScreen('teacher-workspace-and-leaves');
  };

  const handleOpenSchedule1on1 = (studentName: string) => {
    setSchedule1on1Modal({ open: true, studentName });
  };

  const handleConfirmSchedule1on1 = (e: React.FormEvent) => {
    e.preventDefault();
    setOneOnOneSuccess(
      `Office hour calendar invite dispatched to ${schedule1on1Modal.studentName} for Friday, March 6 at 04:30 PM (Office 304).`
    );
    setTimeout(() => {
      setOneOnOneSuccess(null);
      setSchedule1on1Modal({ open: false });
    }, 2800);
  };

  const unresolvedDoubts = doubts.filter((d) => !d.resolved);

  // Global search filtered items
  const filteredSearchLectures = lectures.filter(
    (l) =>
      l.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.room.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSearchStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex font-['Inter'] antialiased">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onSelectScreen={(screen) => {
          setCurrentScreen(screen);
          setMobileMenuOpen(false);
        }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        activeBatchCount={4}
      />

      {/* 2. Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Top Header */}
        <Header
          onOpenSearch={() => setSearchModalOpen(true)}
          onToggleMobileSidebar={() => setMobileMenuOpen(!mobileMenuOpen)}
          unreadDoubtsCount={unresolvedDoubts.length}
          doubts={doubts}
          onSelectDoubt={(doubt) => {
            setCurrentScreen('ai-teacher-assistant');
          }}
          onOpenAntigravityModal={() => setAntigravityModalOpen(true)}
          onOpenEcosystemPing={() => setEcosystemPingModalOpen(true)}
          currentUser={currentUser}
          allUsers={allUsers}
          onSwitchUser={(user) => onSwitchUser && onSwitchUser(user.id)}
          onLogout={onLogout}
          isAuditing={isAuditing}
          onExitAudit={onExitAudit}
        />

        {/* 3. Screen Views */}
        <main className="flex-1 pt-16 pb-16">
          {currentScreen === 'daily-schedule' && (
            <DailyScheduleScreen
              lectures={lectures}
              stickyNotes={stickyNotes}
              students={students}
              onUpdateStudentStatus={handleUpdateStudentStatus}
              onMarkAllPresent={handleMarkAllPresent}
              onToggleNote={handleToggleNote}
              onDeleteNote={handleDeleteNote}
              onAddNote={handleAddNote}
              onOpenAttendance={handleOpenAttendance}
              onOpenAiLessonPlan={handleOpenAiLessonPlan}
              onOpenLeaveModal={handleOpenLeaveModal}
              onOpenDoubtsModal={() => setDoubtsModalOpen(true)}
              onOpenLabSetupModal={() => setLabSetupModalOpen(true)}
              onOpenRosterModal={(lec) => setRosterModalLecture(lec)}
              onNavigateScreen={setCurrentScreen}
            />
          )}

          {currentScreen === 'student-attendance' && (
            <StudentAttendanceScreen
              students={students}
              initialBatch={attendanceInitialBatch}
              onUpdateStudentStatus={handleUpdateStudentStatus}
              onMarkAllPresent={handleMarkAllPresent}
              onAddNewStudent={(newStudent) => {
                setStudents((prev) => [newStudent, ...prev]);
              }}
              onSaveAttendanceRecord={(batch, summary) => {
                console.log(`[ClassSarthi Attendance] Saved record for ${batch}:`, summary);
              }}
            />
          )}

          {currentScreen === 'student-performance' && (
            <StudentPerformanceScreen
              students={students}
              onOpenSchedule1on1={handleOpenSchedule1on1}
            />
          )}

          {currentScreen === 'upload-documents' && (
            <UploadDocumentsScreen
              documents={documents}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {currentScreen === 'academic-calendar' && (
            <AcademicCalendarScreen
              events={calendarEvents}
              onAddEvent={handleAddEvent}
            />
          )}

          {currentScreen === 'teacher-workspace-and-leaves' && (
            <TeacherWorkspaceScreen
              stickyNotes={stickyNotes}
              leaves={leaves}
              onToggleNote={handleToggleNote}
              onDeleteNote={handleDeleteNote}
              onAddNote={handleAddNote}
              onAddLeave={handleAddLeave}
              onOpenEcosystemPing={() => setEcosystemPingModalOpen(true)}
            />
          )}

          {currentScreen === 'ai-teacher-assistant' && (
            <AIAssistantScreen
              doubts={doubts}
              onAddNote={handleAddNote}
              onResolveDoubt={handleResolveDoubt}
            />
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS & POPUPS                                                        */}
      {/* ========================================================================= */}

      {/* Global Search ⌘K Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl border border-[#eaedff] animate-in fade-in zoom-in-95">
            <div className="relative flex items-center border-b border-[#eaedff] pb-3">
              <Search className="w-5 h-5 text-[#3525cd] mr-3" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type course (e.g. ME-102), student name, or roll no..."
                className="flex-1 text-[15px] text-[#131b2e] placeholder:text-[#777587] focus:outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-md text-[#777587] hover:text-[#131b2e] hover:bg-[#f2f3ff] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 max-h-[380px] overflow-y-auto flex flex-col gap-2">
              <div className="text-[11px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#777587] px-2 py-1">
                Courses & Scheduled Lectures
              </div>
              {filteredSearchLectures.map((l) => (
                <div
                  key={l.id}
                  onClick={() => {
                    setCurrentScreen('daily-schedule');
                    setSearchModalOpen(false);
                  }}
                  className="p-2.5 rounded-lg hover:bg-[#f2f3ff] cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-['JetBrains_Mono'] text-[12px] font-bold px-2 py-0.5 rounded bg-[#dae2fd] text-[#3525cd]">
                      {l.courseCode}
                    </span>
                    <span className="font-semibold text-[13px] text-[#131b2e]">{l.courseTitle}</span>
                  </div>
                  <span className="text-[12px] text-[#464555] font-['JetBrains_Mono']">{l.room}</span>
                </div>
              ))}

              <div className="text-[11px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#777587] px-2 py-1 mt-2">
                Students
              </div>
              {filteredSearchStudents.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setCurrentScreen('student-attendance');
                    setSearchModalOpen(false);
                  }}
                  className="p-2.5 rounded-lg hover:bg-[#f2f3ff] cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={s.avatar} alt={s.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-[13px] font-medium text-[#131b2e]">{s.name}</span>
                    <span className="text-[11px] font-['JetBrains_Mono'] text-[#777587]">({s.rollNo})</span>
                  </div>
                  <span className="text-[11px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#f2f3ff] text-[#3525cd]">
                    {s.batch}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-[#f2f3ff] flex items-center justify-between text-[11px] font-['JetBrains_Mono'] text-[#777587]">
              <span>Press ESC to dismiss</span>
              <span>ClassSarthi Campus Quick-Index</span>
            </div>
          </div>
        </div>
      )}

      {/* Lab Setup Modal */}
      {labSetupModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#f2f3ff] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#006e4b]" />
                <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e]">
                  Hardware Lab 2: Experiment Setup
                </h3>
              </div>
              <button
                onClick={() => setLabSetupModalOpen(false)}
                className="text-[#777587] hover:text-[#131b2e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-[13px]">
              <div className="p-3 bg-[#ecfdf5] border border-[#d1fae5] rounded-xl text-[#065f46]">
                <span className="font-semibold block mb-0.5">Lab Station Readiness: 100%</span>
                Benches 1-8 powered, Rigol DS1054Z oscilloscopes calibrated, function generators loaded with 1kHz square wave.
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-semibold text-[#131b2e]">Required Lab Components:</span>
                <ul className="list-disc pl-5 text-[#464555] space-y-1">
                  <li>30x Breadboards & Jumper Kits (Batch 1)</li>
                  <li>Op-Amp IC LM741 (Active Filter Design)</li>
                  <li>10k potentiometer, 0.1uF ceramic capacitors</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#f2f3ff]">
                <span className="text-[12px] text-[#777587]">Lab Assistant: R. Verma (Ext. 402)</span>
                <button
                  onClick={() => setLabSetupModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#006e4b] text-white text-[13px] font-semibold hover:bg-[#005236] cursor-pointer"
                >
                  Confirm Station Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roster Modal */}
      {rosterModalLecture && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#f2f3ff] pb-3 mb-4">
              <div>
                <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e]">
                  {rosterModalLecture.courseCode} Attendance Roster
                </h3>
                <span className="text-[12px] text-[#464555]">
                  {rosterModalLecture.division} • {rosterModalLecture.room}
                </span>
              </div>
              <button
                onClick={() => setRosterModalLecture(null)}
                className="text-[#777587] hover:text-[#131b2e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 bg-[#f2f3ff] rounded-xl text-[13px]">
                <span>Present: <strong className="text-[#006e4b]">50</strong></span>
                <span>Late: <strong className="text-[#6b38d4]">2</strong></span>
                <span>Absent: <strong className="text-[#ba1a1a]">2</strong></span>
                <span>Verified: <strong className="text-[#3525cd]">92.6%</strong></span>
              </div>

              <p className="text-[13px] text-[#464555]">
                Biometric NFC log verified from Hall 4 smart turnstiles.
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#f2f3ff]">
                <button
                  onClick={() => {
                    setRosterModalLecture(null);
                    setCurrentScreen('student-attendance');
                  }}
                  className="px-4 py-2 bg-[#3525cd] text-white rounded-lg text-[13px] font-semibold hover:bg-[#3323cc] cursor-pointer"
                >
                  Open Live Attendance Console →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doubts Modal Popover */}
      {doubtsModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#eaedff] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#f2f3ff] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#ba1a1a]" />
                <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e]">
                  Active Student Inquiries & Doubts ({unresolvedDoubts.length})
                </h3>
              </div>
              <button
                onClick={() => setDoubtsModalOpen(false)}
                className="text-[#777587] hover:text-[#131b2e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
              {unresolvedDoubts.length === 0 ? (
                <div className="py-8 text-center text-[#777587]">
                  <CheckCircle2 className="w-10 h-10 text-[#006e4b] mx-auto mb-2" />
                  <p className="font-medium text-[#131b2e]">All student doubts are resolved!</p>
                  <p className="text-[12px] mt-1">Great job maintaining zero student inquiry lag.</p>
                </div>
              ) : (
                unresolvedDoubts.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl border border-[#e2e7ff] bg-[#faf8ff] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-['JetBrains_Mono'] text-[11px] font-bold px-2 py-0.5 rounded bg-[#dae2fd] text-[#3525cd]">
                        {d.courseCode} • {d.rollNo}
                      </span>
                      <span className="text-[11px] text-[#777587] font-['JetBrains_Mono']">
                        {d.submittedTime}
                      </span>
                    </div>

                    <div className="text-[13px] font-semibold text-[#131b2e]">
                      {d.studentName}: <span className="font-normal text-[#464555]">{d.question}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#f2f3ff]">
                      <button
                        onClick={() => {
                          setDoubtsModalOpen(false);
                          setCurrentScreen('ai-teacher-assistant');
                        }}
                        className="text-[12px] text-[#6b38d4] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Synthesize AI Answer →
                      </button>
                      <button
                        onClick={() => handleResolveDoubt(d.id)}
                        className="px-3 py-1 rounded-lg bg-[#3525cd] text-white text-[12px] font-medium hover:bg-[#3323cc] cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#f2f3ff] flex justify-end">
              <button
                onClick={() => setDoubtsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#f2f3ff] text-[#131b2e] font-medium text-[13px] hover:bg-[#eaedff] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-on-1 Office Hour Modal */}
      {schedule1on1Modal.open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#eaedff] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#f2f3ff] pb-3 mb-4">
              <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e]">
                Schedule Remedial 1-on-1
              </h3>
              <button
                onClick={() => setSchedule1on1Modal({ open: false })}
                className="text-[#777587] hover:text-[#131b2e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {oneOnOneSuccess ? (
              <div className="p-4 bg-[#ecfdf5] border border-[#d1fae5] text-[#065f46] rounded-xl text-[13px] font-medium flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#006e4b] shrink-0" />
                <span>{oneOnOneSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleConfirmSchedule1on1} className="flex flex-col gap-3.5">
                <div>
                  <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={schedule1on1Modal.studentName || ''}
                    className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#e2e7ff] text-[#464555]"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                    Slot Time
                  </label>
                  <input
                    type="text"
                    defaultValue="Friday, March 06 • 04:30 PM - 05:00 PM"
                    className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#e2e7ff] text-[#131b2e]"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                    Meeting Location
                  </label>
                  <input
                    type="text"
                    defaultValue="Faculty Cabin 304, Block 3"
                    className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#e2e7ff] text-[#131b2e]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f2f3ff]">
                  <button
                    type="button"
                    onClick={() => setSchedule1on1Modal({ open: false })}
                    className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#464555] hover:bg-[#f2f3ff] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#3525cd] text-white font-semibold text-[13px] hover:bg-[#3323cc] cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Invite</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Antigravity Spec Modal */}
      {antigravityModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#eaedff] animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#dae2fd] text-[#3525cd] flex items-center justify-center">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e] flex items-center gap-2">
                    <span>Antigravity Spec & Blueprint</span>
                    <span className="text-[11px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#f2f3ff] text-[#3525cd] font-semibold">
                      ANTIGRAVITY.md
                    </span>
                  </h3>
                  <p className="text-[12px] text-[#777587]">
                    Production specification ready to be fed directly into Google AI Studio / Antigravity
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAntigravityModalOpen(false)}
                className="p-1.5 rounded-lg text-[#777587] hover:text-[#131b2e] hover:bg-[#f2f3ff] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-[12px] text-[#464555]">
                File exists at root as <code className="bg-[#f2f3ff] px-1.5 py-0.5 rounded text-[#3525cd] font-mono">/ANTIGRAVITY.md</code>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySpec}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3525cd] text-[12px] font-semibold transition-all cursor-pointer"
                >
                  {copiedSpec ? (
                    <>
                      <Check className="w-4 h-4 text-[#006e4b]" />
                      <span className="text-[#006e4b]">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Spec</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadSpec}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3525cd] text-[12px] font-semibold transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl bg-[#131b2e] text-[#e2e7ff] p-4 font-mono text-[12px] leading-relaxed select-text border border-[#2b344e]">
              <pre className="whitespace-pre-wrap font-['JetBrains_Mono']">{ANTIGRAVITY_SPEC}</pre>
            </div>

            <div className="mt-4 pt-3 border-t border-[#eaedff] flex items-center justify-between text-[12px] text-[#777587]">
              <span>Ready for Antigravity, AI Studio Build, and Gemini models</span>
              <button
                onClick={() => setAntigravityModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#f2f3ff] text-[#131b2e] font-medium hover:bg-[#eaedff] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google & Apple Ecosystem Ping Hub Modal */}
      <EcosystemPingModal
        isOpen={ecosystemPingModalOpen}
        onClose={() => setEcosystemPingModalOpen(false)}
        teacherEmail={currentUser?.email || 'dr.jenkins@bmu.edu.in'}
        teacherName={currentUser?.name || 'Dr. Robert Jenkins'}
      />
    </div>
  );
};
