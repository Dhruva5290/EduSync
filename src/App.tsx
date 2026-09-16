import React, { useState } from 'react';
import {
  NavRoute,
  ClassScheduleItem,
  LectureArchiveItem,
  TodoTask,
  CustomTutorPersona,
  StudentProfile,
  User,
  StudentNote,
  StudentSubmission,
  TimelineItem,
  QuestionBankItem,
  VaultSnapshot,
  Subject,
} from './types';
import {
  initialStudent,
  initialUsers,
  initialSubjects,
  initialTimelines,
  initialClasses,
  initialLecturesArchive,
  initialAssignments,
  initialSubmissions,
  initialNotes,
  initialTodos,
  initialCustomTutors,
  initialQuizQuestions,
  initialQuestionBank,
  initialVaultSnapshots,
  initialSecurityAudit,
} from './data/initialData';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ClassesView } from './components/ClassesView';
import { AiTutorView } from './components/AiTutorView';
import { AssignmentsView } from './components/AssignmentsView';
import { TodoListView } from './components/TodoListView';
import { PluginsView } from './components/PluginsView';
import { QuizView } from './components/QuizView';
import { SettingsView } from './components/SettingsView';
import { FacultyAnalyticsView } from './components/FacultyAnalyticsView';
import { TimelineManagerView } from './components/TimelineManagerView';
import { QuestionBankView } from './components/QuestionBankView';
import { RubricGraderView } from './components/RubricGraderView';
import { AdminMetricsView } from './components/AdminMetricsView';
import { UserProvisioningView } from './components/UserProvisioningView';
import { VaultRecoveryView } from './components/VaultRecoveryView';
import { SecurityAuditView } from './components/SecurityAuditView';
import { LectureNotesModal } from './components/LectureNotesModal';
import { LoginScreen } from './components/LoginScreen';
import { TeacherMasterPortal } from './components/TeacherPortal/TeacherMasterPortal';

export function App() {
  // Auth & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('classsarthi_token'));
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('classsarthi_theme') as 'light' | 'dark') || 'light';
  });
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('classsarthi_theme', next);
      return next;
    });
  };

  // Active User & Identity
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('classsarthi_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialUsers[0];
  });

  // Navigation & Layout
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // App Domain State
  const [student, setStudent] = useState<StudentProfile>(initialStudent);
  const [subjects] = useState<Subject[]>(initialSubjects);
  const [classes] = useState<ClassScheduleItem[]>(initialClasses);
  const [lectureArchives] = useState<LectureArchiveItem[]>(initialLecturesArchive);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [notes, setNotes] = useState<StudentNote[]>(initialNotes);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(initialSubmissions);
  const [timelines, setTimelines] = useState<TimelineItem[]>(initialTimelines);
  const [todos, setTodos] = useState<TodoTask[]>(initialTodos);
  const [customTutors, setCustomTutors] = useState<CustomTutorPersona[]>(initialCustomTutors);
  const [quizQuestions, setQuizQuestions] = useState(initialQuizQuestions);
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>(initialQuestionBank);
  const [vaultSnapshots, setVaultSnapshots] = useState<VaultSnapshot[]>(initialVaultSnapshots);

  // Interactive Cross-View Context
  const [tutorPrefillTopic, setTutorPrefillTopic] = useState<string>('');
  const [selectedLectureNotes, setSelectedLectureNotes] = useState<
    ClassScheduleItem | LectureArchiveItem | null
  >(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Auth actions
  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('classsarthi_token', token);
    localStorage.setItem('classsarthi_user_id', user.id);
    try { localStorage.setItem('classsarthi_user', JSON.stringify(user)); } catch {}

    if (user.role === 'teacher') {
      setCurrentRoute('faculty-analytics');
    } else if (user.role === 'admin') {
      setCurrentRoute('admin-metrics');
    } else {
      setCurrentRoute('dashboard');
    }
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('classsarthi_token');
    localStorage.removeItem('classsarthi_user_id');
    localStorage.removeItem('classsarthi_user');
    setIsAuthenticated(false);
    showToast('You have been signed out.');
  };

  // Nav Actions
  const handleNavigate = (route: NavRoute) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchUser = (userId: string) => {
    const selected = users.find((u) => u.id === userId);
    if (!selected) return;
    setCurrentUser(selected);
    try { localStorage.setItem('classsarthi_user', JSON.stringify(selected)); } catch {}

    // Auto navigate to home for role
    if (selected.role === 'teacher') {
      setCurrentRoute('faculty-analytics');
      showToast(`Switched to Faculty mode: ${selected.name}`);
    } else if (selected.role === 'admin') {
      setCurrentRoute('admin-metrics');
      showToast(`Switched to Administrator mode: ${selected.name}`);
    } else {
      setCurrentRoute('dashboard');
      showToast(`Switched to Student mode: ${selected.name}`);
    }
  };

  const handleOpenNotes = (item: ClassScheduleItem | LectureArchiveItem) => {
    setSelectedLectureNotes(item);
  };

  const handleAskTutor = (topic: string) => {
    setTutorPrefillTopic(topic);
    setCurrentRoute('ai-tutor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuiz = () => {
    setCurrentRoute('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Notes actions
  const handleSaveNote = async (updatedNote: Partial<StudentNote>) => {
    if (updatedNote.id) {
      setNotes((prev) =>
        prev.map((n) => (n.id === updatedNote.id ? ({ ...n, ...updatedNote } as StudentNote) : n))
      );
    } else {
      const newNote: StudentNote = {
        id: `note-${Date.now()}`,
        studentId: currentUser.id,
        subjectId: updatedNote.subjectId || 'subj-phy',
        subjectName: updatedNote.subjectName || 'Physics 11',
        title: updatedNote.title || 'New Study Note',
        content: updatedNote.content || '',
        lastEdited: 'Just now',
        tags: updatedNote.tags || ['Study Note'],
        pinned: updatedNote.pinned || false,
      };
      setNotes((prev) => [newNote, ...prev]);
    }
    showToast('Note updated and synchronized.');

    // Asynchronously sync with server
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote),
      });
    } catch (e) {
      // Offline fallback
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('Note removed from notebook.');
  };

  // Submissions & Rubric Grader
  const handleGradeSubmission = async (
    submissionId: string,
    score: number,
    feedback: string,
    rubricGrades: Record<string, number>
  ) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'graded',
              score,
              feedback,
              rubricGrades,
            }
          : s
      )
    );
    showToast(`Published evaluation: ${score}/100 with rubric breakdown!`);

    try {
      await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, feedback, rubricGrades }),
      });
    } catch (e) {
      // offline fallback
    }
  };

  // Timeline & Milestone Manager
  const handleAddTimeline = async (item: Omit<TimelineItem, 'id'>) => {
    const newItem: TimelineItem = {
      ...item,
      id: `tl-${Date.now()}`,
    };
    setTimelines((prev) => [newItem, ...prev]);
    showToast(`Curriculum milestone "${item.title}" published!`);

    try {
      await fetch('/api/timelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
    } catch (e) {}
  };

  const handleDeleteTimeline = (id: string) => {
    setTimelines((prev) => prev.filter((t) => t.id !== id));
    showToast('Milestone removed from timeline.');
  };

  // Question Bank
  const handlePushQuestionToQuiz = (q: QuestionBankItem) => {
    const newQuizQ = {
      id: Date.now(),
      question: q.question,
      tag: q.topic,
      options: [
        { key: 'A', text: q.sampleAnswer ? q.sampleAnswer.split('.')[0] : 'Correct derivation option' },
        { key: 'B', text: 'Equate net normal reaction to zero without cosine component' },
        { key: 'C', text: 'Assume friction coefficient μ vanishes at steep angles' },
        { key: 'D', text: 'Kinematic acceleration independent of gravitational field' },
      ],
      correctKey: 'A',
      hint: `Reference: ${q.source}. Focus on resolving forces perpendicular to ramp.`,
      explanation: q.sampleAnswer || 'Model answer demonstrates proper coordinate rotation and vector resolution.',
    };
    setQuizQuestions((prev) => [newQuizQ, ...prev]);
    showToast(`Added problem to student diagnostic practice quiz.`);
  };

  // User Provisioning
  const handleAddUser = async (user: Partial<User>) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: user.name || 'New Member',
      email: user.email || 'member@bmu.edu.in',
      username: (user.email || 'user').split('@')[0],
      role: user.role || 'student',
      institutionalId: user.institutionalId || `BMU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      department: user.department || 'Applied Sciences',
      program: user.program || 'B.Tech Program',
      avatarInitials: (user.name || 'NM')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase(),
      enrolledSubjectIds: ['subj-phy', 'subj-mat'],
    };
    setUsers((prev) => [newUser, ...prev]);
    showToast(`User ${newUser.name} provisioned successfully!`);

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
    } catch (e) {}
  };

  const handleBulkImport = async (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const newItems: User[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length >= 2 && parts[0]) {
        const name = parts[0];
        const email = parts[1];
        const instId = parts[2] || `BMU-2026-${Math.floor(7000 + Math.random() * 900)}`;
        newItems.push({
          id: `usr-csv-${Date.now()}-${i}`,
          name,
          email,
          username: email.split('@')[0],
          role: 'student',
          institutionalId: instId,
          department: 'Applied Sciences',
          program: 'B.Tech First Year',
          avatarInitials: name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase(),
          enrolledSubjectIds: ['subj-phy', 'subj-mat'],
        });
      }
    }

    if (newItems.length > 0) {
      setUsers((prev) => [...prev, ...newItems]);
      showToast(`Imported ${newItems.length} student records from CSV!`);
      try {
        await fetch('/api/users/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvText }),
        });
      } catch (e) {}
    }
  };

  // Disaster Recovery Vault
  const handleCreateSnapshot = async (title: string) => {
    const newSnap: VaultSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      title: title || 'Manual Master Snapshot',
      recordCount: {
        users: users.length,
        notes: notes.length,
        assignments: assignments.length,
        lectures: classes.length,
      },
      status: 'Archived',
      sizeBytes: Math.floor(400000 + Math.random() * 80000),
    };
    setVaultSnapshots((prev) => [newSnap, ...prev]);
    showToast(`Encrypted master snapshot [${newSnap.id}] created and archived.`);

    try {
      await fetch('/api/admin/vault/archive-and-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
    } catch (e) {}
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    showToast(`Snapshot [${snapshotId}] loaded. System data state synchronized.`);
    try {
      await fetch('/api/admin/vault/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshotId }),
      });
    } catch (e) {}
  };

  // Todo handlers
  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTodo = (task: Omit<TodoTask, 'id' | 'completed'>) => {
    const newTask: TodoTask = {
      ...task,
      id: `todo-${Date.now()}`,
      completed: false,
    };
    setTodos((prev) => [newTask, ...prev]);
    showToast('New study task added!');
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Custom Tutor handlers
  const handleAddCustomTutor = (tutor: Omit<CustomTutorPersona, 'id' | 'initials'>) => {
    const initials = tutor.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newTutor: CustomTutorPersona = {
      ...tutor,
      id: `tut-custom-${Date.now()}`,
      initials,
    };
    setCustomTutors((prev) => [newTutor, ...prev]);
    showToast(`Custom tutor persona "${tutor.name}" created!`);
  };

  const handleRemoveCustomTutor = (id: string) => {
    setCustomTutors((prev) => prev.filter((t) => t.id !== id));
  };

  // Assignment submission
  const handleSubmitAssignment = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'submitted' as const,
              submittedFile: 'homework_solution_ocr_scan.pdf',
            }
          : a
      )
    );
    showToast('Assignment submitted successfully! Faculty will review.');
  };

  const handleUpdateStudent = (updated: Partial<StudentProfile>) => {
    setStudent((prev) => ({ ...prev, ...updated }));
    showToast('Student profile updated.');
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        allUsers={users}
      />
    );
  }

  if (currentUser.role === 'teacher') {
    return (
      <TeacherMasterPortal
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans antialiased selection:bg-[#ffdbce] selection:text-[#370e00]">
      {/* Left Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
      />

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        collapsed={sidebarCollapsed}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        onNavigateTo={handleNavigate}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        allUsers={users}
      />

      {/* Main Content Area */}
      <main
        className={`pt-16 min-h-screen transition-all duration-300 pb-12 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Student Views */}
        {currentRoute === 'dashboard' && (
          <DashboardView
            onNavigate={handleNavigate}
            onOpenNotes={handleOpenNotes}
            onAskTutorTopic={handleAskTutor}
            classes={classes}
          />
        )}

        {currentRoute === 'classes' && (
          <ClassesView
            classes={classes}
            archives={lectureArchives}
            onOpenNotes={handleOpenNotes}
          />
        )}

        {currentRoute === 'ai-tutor' && (
          <AiTutorView
            initialTopic={tutorPrefillTopic}
            customTutors={customTutors}
            onOpenNotes={() => handleOpenNotes(classes[0])}
          />
        )}

        {currentRoute === 'assignments' && (
          <AssignmentsView
            assignments={assignments}
            onAskTutorAssignment={handleAskTutor}
            onSubmitAssignment={handleSubmitAssignment}
          />
        )}

        {currentRoute === 'to-do-list' && (
          <TodoListView
            todos={todos}
            onToggleTodo={handleToggleTodo}
            onAddTodo={handleAddTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        )}

        {currentRoute === 'plugins' && (
          <PluginsView
            customTutors={customTutors}
            onAddCustomTutor={handleAddCustomTutor}
            onRemoveCustomTutor={handleRemoveCustomTutor}
            currentUser={currentUser}
            onNavigateToTutor={(topic?: string) => {
              if (topic) setTutorPrefillTopic(topic);
              setCurrentRoute('ai-tutor');
            }}
            showToast={showToast}
          />
        )}

        {currentRoute === 'quiz' && (
          <QuizView
            questions={quizQuestions}
            onAskTutorOnQuestion={handleAskTutor}
          />
        )}

        {currentRoute === 'settings' && (
          <SettingsView
            student={student}
            onUpdateStudent={handleUpdateStudent}
          />
        )}

        {/* Faculty Views */}
        {currentRoute === 'faculty-analytics' && (
          <FacultyAnalyticsView
            subjects={subjects}
            onPushIntervention={(topic) => showToast(`Remedial intervention for "${topic}" pushed to student portals.`)}
          />
        )}

        {currentRoute === 'timeline-manager' && (
          <TimelineManagerView
            timelines={timelines}
            subjects={subjects}
            onAddTimeline={handleAddTimeline}
            onDeleteTimeline={handleDeleteTimeline}
          />
        )}

        {currentRoute === 'question-bank' && (
          <QuestionBankView
            questions={questionBank}
            subjects={subjects}
            onPushToQuiz={handlePushQuestionToQuiz}
          />
        )}

        {currentRoute === 'rubric-grader' && (
          <RubricGraderView
            submissions={submissions}
            onGradeSubmission={handleGradeSubmission}
          />
        )}

        {/* Dean & Admin Views */}
        {currentRoute === 'admin-metrics' && (
          <AdminMetricsView
            totalStudents={users.filter((u) => u.role === 'student').length}
            totalFaculty={users.filter((u) => u.role === 'teacher').length}
            totalSubjects={subjects.length}
            totalSubmissions={submissions.length}
            onNavigateToUsers={() => setCurrentRoute('user-provisioning')}
            onNavigateToVault={() => setCurrentRoute('vault-recovery')}
            onNavigateToSecurity={() => setCurrentRoute('security-audit')}
          />
        )}

        {currentRoute === 'user-provisioning' && (
          <UserProvisioningView
            users={users}
            onAddUser={handleAddUser}
            onBulkImport={handleBulkImport}
            onDeleteUser={(id) => {
              setUsers((prev) => prev.filter((u) => u.id !== id));
              showToast('User de-provisioned.');
            }}
          />
        )}

        {currentRoute === 'vault-recovery' && (
          <VaultRecoveryView
            snapshots={vaultSnapshots}
            onCreateSnapshot={handleCreateSnapshot}
            onRestoreSnapshot={handleRestoreSnapshot}
          />
        )}

        {currentRoute === 'security-audit' && (
          <SecurityAuditView auditItems={initialSecurityAudit} />
        )}
      </main>

      {/* Synchronized Lecture Notes Modal */}
      {selectedLectureNotes && (
        <LectureNotesModal
          item={selectedLectureNotes}
          onClose={() => setSelectedLectureNotes(null)}
          onAskTutor={handleAskTutor}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {/* Toast Notification Banner */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#6ffbbe]" />
          <span>{notificationToast}</span>
        </div>
      )}
    </div>
  );
}

export default App;
