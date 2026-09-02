import React, { useState, useEffect } from 'react';
import {
  User,
  Subject,
  TimelineItem,
  Assignment,
  Submission,
  StudentNote,
  ReferenceResource,
  ClassAnalytics,
  Flashcard,
  GeneratedQuiz,
  LearnerPersona
} from './types';
import { Header } from './components/Header';
import { AIClassAnalytics } from './components/TeacherDashboard/AIClassAnalytics';
import { TimelineManager } from './components/TeacherDashboard/TimelineManager';
import { AssignmentHub } from './components/TeacherDashboard/AssignmentHub';
import { StudentDirectoryHub } from './components/TeacherDashboard/StudentDirectoryHub';
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard';
import { ResourceFeed } from './components/StudentDashboard/ResourceFeed';
import { SmartNotePlayground } from './components/StudentDashboard/SmartNotePlayground';
import { TutorLayout } from './components/SmartAITutor/TutorLayout';
import { InteractiveQuizModal } from './components/StudentDashboard/InteractiveQuizModal';
import { LearnerPersonaModal } from './components/Personalization/LearnerPersonaModal';
import { LoginScreen } from './components/LoginScreen';

import {
  BarChart3,
  Calendar,
  FileText,
  FileCheck,
  BookOpen,
  Sparkles,
  Bot,
  Layers,
  GraduationCap,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Plus,
  Menu,
  X,
  Users,
  UserPlus,
  Shield,
  Building,
  LogOut
} from 'lucide-react';

export default function App() {
  // State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('edusync_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('edusync_token'));
  const [auditAdmin, setAuditAdmin] = useState<User | null>(() => {
    const saved = localStorage.getItem('edusync_audit_admin');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string>('subj-1');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showPersonaModal, setShowPersonaModal] = useState(false);

  // Theme synchronization with HTML root
  useEffect(() => {
    localStorage.setItem('edusync_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    } else {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Course Data
  const [timelines, setTimelines] = useState<TimelineItem[]>([]);
  const [resources, setResources] = useState<ReferenceResource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);

  // Master Multi-Course Semester Datasets
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allTimelines, setAllTimelines] = useState<TimelineItem[]>([]);
  const [allResources, setAllResources] = useState<ReferenceResource[]>([]);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);

  const [activeQuizModal, setActiveQuizModal] = useState<GeneratedQuiz | null>(null);

  // Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingDiagnostics, setIsGeneratingDiagnostics] = useState<boolean>(false);
  const [isGeneratingSyllabus, setIsGeneratingSyllabus] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Safe fetch helper that guards against HTML fallback or network errors
  const safeFetchJson = async <T,>(url: string, init?: RequestInit): Promise<T | null> => {
    try {
      const headers = new Headers(init?.headers || {});
      const token = authToken || localStorage.getItem('edusync_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const res = await fetch(url, { ...init, headers });
      if (!res.ok) return null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
      const text = await res.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        return null;
      }
    } catch (err) {
      console.warn(`Fetch error for ${url}:`, err);
      return null;
    }
  };

  // Initial Data Fetch
  const fetchMasterData = async () => {
    try {
      const [allAssign, allTime, allSubs] = await Promise.all([
        safeFetchJson<Assignment[]>('/api/assignments'),
        safeFetchJson<{ timelines?: TimelineItem[]; resources?: ReferenceResource[]; items?: TimelineItem[] }>('/api/timelines'),
        safeFetchJson<Submission[]>('/api/submissions')
      ]);
      if (allAssign) setAllAssignments(allAssign);
      if (allTime) {
        setAllTimelines(allTime.timelines || allTime.items || []);
        setAllResources(allTime.resources || []);
      }
      if (allSubs) setAllSubmissions(allSubs);
    } catch (err) {
      console.error('Error loading master dataset:', err);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      // Clean start: always begin at the Login Screen on page load/refresh
      setCurrentUser(null);
      setAuthToken(null);
      localStorage.removeItem('edusync_token');

      try {
        // Fetch all registered users list so LoginScreen and rosters have up-to-date data
        const publicData = await safeFetchJson<{ users: User[] }>('/api/auth/public-users');
        if (publicData?.users && Array.isArray(publicData.users)) {
          setAllUsers(publicData.users);
        }
      } catch (err) {
        console.error('Error initializing user roster:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  // Fetch subject-specific data whenever activeSubjectId changes
  useEffect(() => {
    if (!activeSubjectId) return;

    const loadSubjectData = async () => {
      try {
        // 1. Timelines & Resources
        const timeData = await safeFetchJson<{ timelines?: TimelineItem[]; resources?: ReferenceResource[]; items?: TimelineItem[] }>(
          `/api/timelines/${activeSubjectId}`
        );
        if (timeData) {
          setTimelines(timeData.timelines || timeData.items || []);
          setResources(timeData.resources || []);
        }

        // 2. Assignments
        const assignData = await safeFetchJson<Assignment[]>(`/api/assignments/${activeSubjectId}`);
        if (assignData) {
          setAssignments(assignData);
        }

        // 3. Submissions
        const subData = await safeFetchJson<Submission[]>(`/api/submissions/${activeSubjectId}`);
        if (subData) {
          setSubmissions(subData);
        }

        // 4. Notes (Fetch all student notes for unified playground)
        const noteData = await safeFetchJson<StudentNote[]>('/api/notes');
        if (noteData) {
          setNotes(noteData);
        }

        // 5. Analytics (if teacher or overview)
        const anaData = await safeFetchJson<ClassAnalytics>(`/api/analytics/${activeSubjectId}`);
        if (anaData) {
          setAnalytics(anaData);
        }
      } catch (err) {
        console.error('Error loading subject records:', err);
      }
    };

    loadSubjectData();
  }, [activeSubjectId, subjects, allSubjects]);

  // Adjust default tab when switching roles
  const handleSwitchUser = async (userId: string) => {
    // If currently an admin, preserve self as the original Dean/Admin for returning from audit
    let currentAdmin = auditAdmin;
    if (currentUser?.role === 'admin' && !currentAdmin) {
      currentAdmin = currentUser;
      setAuditAdmin(currentUser);
      localStorage.setItem('edusync_audit_admin', JSON.stringify(currentUser));
    }

    try {
      const res = await safeFetchJson<{ success: boolean; token?: string; user: User }>('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res?.user) {
        if (res.token) {
          localStorage.setItem('edusync_token', res.token);
          setAuthToken(res.token);
        }

        // If returned to admin, clear audit session
        if (res.user.role === 'admin') {
          setAuditAdmin(null);
          localStorage.removeItem('edusync_audit_admin');
        }

        setCurrentUser(res.user);

        // Re-fetch subjects specifically for this user
        const newSubjs = await safeFetchJson<Subject[]>('/api/subjects');
        if (newSubjs && newSubjs.length > 0) {
          setSubjects(newSubjs);
          setActiveSubjectId(newSubjs[0].id);
        }

        if (res.user.role === 'teacher') {
          setActiveTab('analytics');
        } else if (res.user.role === 'admin') {
          setActiveTab('overview');
        } else {
          setActiveTab('feed');
        }

        await fetchMasterData();
        showToast(
          res.user.role === 'admin'
            ? 'Returned to Registrar Operations.'
            : `Auditing workspace as ${res.user.name} (${res.user.role.toUpperCase()})`,
          'info'
        );
      }
    } catch (err) {
      console.error('Error switching profile:', err);
    }
  };

  const handleReturnToAdmin = async () => {
    const adminId = auditAdmin?.id || allUsers.find(u => u.role === 'admin')?.id || 'admin-1';
    try {
      await handleSwitchUser(adminId);
      setAuditAdmin(null);
      localStorage.removeItem('edusync_audit_admin');
      setActiveTab('overview');
    } catch (err) {
      console.error('Error returning to registrar portal:', err);
    }
  };

  const handleLoginSuccess = async (user: User, token: string) => {
    setIsLoading(true);
    setAuthToken(token);
    setCurrentUser(user);

    try {
      // Fetch subjects and data for the logged-in user
      const [allSubjData, userSubjData, authData] = await Promise.all([
        safeFetchJson<Subject[]>('/api/subjects/all'),
        safeFetchJson<Subject[]>('/api/subjects'),
        safeFetchJson<{ allUsers?: User[]; allDemoUsers?: User[] }>('/api/auth/me')
      ]);

      if (authData?.allUsers && Array.isArray(authData.allUsers)) {
        setAllUsers(authData.allUsers);
      }

      if (allSubjData && allSubjData.length > 0) {
        setAllSubjects(allSubjData);
      }

      if (userSubjData && userSubjData.length > 0) {
        setSubjects(userSubjData);
        setActiveSubjectId(userSubjData[0].id);
      } else if (allSubjData && allSubjData.length > 0) {
        setSubjects(allSubjData);
        setActiveSubjectId(allSubjData[0].id);
      }

      if (user.role === 'teacher') {
        setActiveTab('analytics');
      } else if (user.role === 'admin') {
        setActiveTab('overview');
      } else {
        setActiveTab('feed');
      }

      await fetchMasterData();
      showToast(`Welcome back, ${user.name}! Access granted to ${user.role.toUpperCase()} workspace.`, 'success');
    } catch (err) {
      console.error('Error hydrating user workspace after login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('edusync_token');
    localStorage.removeItem('edusync_user_id');
    localStorage.removeItem('edusync_audit_admin');
    setAuditAdmin(null);
    setAuthToken(null);
    setCurrentUser(null);
    showToast('Signed out of EduSync workspace.', 'info');
  };

  const activeSubject: Subject = subjects.find(s => s.id === activeSubjectId) || subjects[0] || {
    id: 'subj-ess',
    code: 'ESS',
    name: 'Environmental Studies and Sustainability',
    department: 'Department of Environmental Sciences',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Sanmitra Burman',
    teacherEmail: 'sanmitra.burman@bmu.edu.in',
    enrolledCount: 15,
    semester: 'Fall 2026 (Semester 1)',
    room: 'Science Block C - Room 101',
    credits: 3,
    description: 'Ecology, renewable energy systems, climate change modeling, environmental impact assessment (EIA).',
    color: 'emerald',
    accentBg: 'bg-emerald-500/10',
    syllabusTopics: ['Ecology', 'Energy Systems', 'Climate Modeling']
  };

  // --- API Action Handlers ---

  // 1. Add Timeline Event
  const handleAddTimelineItem = async (item: Partial<TimelineItem>) => {
    try {
      const res = await fetch('/api/timelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, subjectId: activeSubject.id })
      });
      if (res.ok) {
        const newItem = await res.json();
        setTimelines(prev => [...prev, newItem]);
        showToast('Academic milestone event added to timeline!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Delete Timeline Event
  const handleDeleteTimelineItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/timelines/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setTimelines(prev => prev.filter(t => t.id !== itemId));
        showToast('Event removed from academic calendar');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Add Reference Resource
  const handleAddResource = async (resource: Partial<ReferenceResource>) => {
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...resource, subjectId: activeSubject.id })
      });
      if (res.ok) {
        const newRes = await res.json();
        setResources(prev => [...prev, newRes]);
        showToast('Reference material published to course library!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Generate AI Syllabus
  const handleGenerateAISyllabus = async (courseName: string, description: string) => {
    setIsGeneratingSyllabus(true);
    try {
      const res = await fetch('/api/ai/syllabus/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseName, courseDescription: description, subjectId: activeSubject.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.timelines) {
          setTimelines(prev => [...prev, ...data.timelines]);
        }
        showToast('Gemini AI generated comprehensive syllabus roadmap!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSyllabus(false);
    }
  };

  // 5. Create Assignment
  const handleCreateAssignment = async (assignment: Partial<Assignment>) => {
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...assignment, subjectId: activeSubject.id })
      });
      if (res.ok) {
        const created = await res.json();
        setAssignments(prev => [created, ...prev]);
        showToast('Assignment published successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Grade Submission
  const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, feedback })
      });
      if (res.ok) {
        showToast('Grade and feedback published to student record!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Fetch Submissions for an Assignment
  const fetchSubmissionsForAssignment = async (assignmentId: string): Promise<Submission[]> => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submissions`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error(err);
    }
    return [];
  };

  // 8. Submit Student Assignment
  const handleSubmitAssignment = async (assignmentId: string, text: string, file: string) => {
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          submissionText: text,
          fileAttachment: file
        })
      });
      if (res.ok) {
        const savedSub = await res.json();
        setSubmissions(prev => [savedSub, ...prev.filter(s => s.assignmentId !== assignmentId)]);
        showToast('Assignment solution submitted and timestamped!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 9. Save Student Note
  const handleSaveNote = async (note: Partial<StudentNote>): Promise<StudentNote> => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...note, subjectId: activeSubject.id })
      });
      if (res.ok) {
        const saved = await res.json();
        setNotes(prev => {
          const idx = prev.findIndex(n => n.id === saved.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [saved, ...prev];
        });
        showToast('Study note saved!');
        return saved;
      }
    } catch (err) {
      console.error(err);
    }
    return note as StudentNote;
  };

  // 10. Delete Note
  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
        showToast('Note deleted');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 11. AI Summarize Note
  const handleSummarizeNote = async (noteId: string, content: string, learnerProfile?: LearnerPersona) => {
    const res = await fetch('/api/ai/notes/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, content, learnerProfile: learnerProfile || currentUser?.learningProfile })
    });
    if (res.ok) {
      const data = await res.json();
      showToast('AI note synthesis complete!');
      return data;
    }
    throw new Error('Failed to summarize note');
  };

  // 12. AI Generate Flashcards
  const handleGenerateFlashcards = async (noteId: string, content: string, learnerProfile?: LearnerPersona): Promise<Flashcard[]> => {
    const res = await fetch('/api/ai/notes/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, content, learnerProfile: learnerProfile || currentUser?.learningProfile })
    });
    if (res.ok) {
      const data = await res.json();
      showToast(`Generated ${data.flashcards?.length || 0} high-yield flashcards!`);
      return data.flashcards || [];
    }
    throw new Error('Failed to generate flashcards');
  };

  // 13. AI Note-to-Quiz Bridge
  const handleGenerateQuizFromNote = async (noteId: string, content: string, title: string, learnerProfile?: LearnerPersona): Promise<GeneratedQuiz> => {
    const res = await fetch('/api/ai/notes/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, content, title, learnerProfile: learnerProfile || currentUser?.learningProfile })
    });
    if (res.ok) {
      const data = await res.json();
      showToast(`Generated Note-to-Quiz interactive assessment!`);
      return data.quiz;
    }
    throw new Error('Failed to generate quiz');
  };

  // 13.5 AI Generate Detailed Note from Topic Prompt / Document (Unified LLM with Cognitive Persona)
  const handleGenerateNoteFromPrompt = async (payload: {
    prompt: string;
    depth: string;
    targetSubjectId?: string;
    attachedText?: string;
    documentName?: string;
    learnerProfile?: LearnerPersona;
  }): Promise<StudentNote> => {
    const targetSubjId = payload.targetSubjectId || activeSubject.id;
    const targetSubj = subjects.find(s => s.id === targetSubjId) || allSubjects.find(s => s.id === targetSubjId);
    const subjCode = targetSubj ? targetSubj.code : (targetSubjId === 'others' || targetSubjId === 'subj-others' ? 'OTHERS' : 'NOTE');

    const res = await fetch('/api/ai/notes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        subjectId: targetSubjId,
        learnerProfile: payload.learnerProfile || currentUser?.learningProfile
      })
    });

    if (res.ok) {
      const data = await res.json();
      const newNote = await handleSaveNote({
        subjectId: targetSubjId,
        title: data.title || `${subjCode}: ${payload.prompt}`,
        content: data.content,
        tags: data.tags || [subjCode, 'AI-Generated'],
        summary: data.summary,
        keyTakeaways: data.keyTakeaways,
        isPinned: true
      });
      showToast(`AI note generated for ${payload.prompt}!`);
      return newNote;
    }
    throw new Error('Failed to generate detailed note');
  };

  // 14. Save Student Personalized Learning Profile
  const handleSaveLearningProfile = async (profile: LearnerPersona) => {
    if (!currentUser) return;
    const res = await fetch(`/api/students/${currentUser.id}/learning-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learningProfile: profile })
    });
    if (res.ok) {
      setCurrentUser(prev => prev ? { ...prev, learningProfile: profile } : null);
      setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, learningProfile: profile } : u));
    } else {
      throw new Error('Failed to update learning persona');
    }
  };

  // 15. Refresh AI Class Diagnostics
  const handleRefreshDiagnostics = async () => {
    setIsGeneratingDiagnostics(true);
    try {
      const res = await fetch('/api/ai/analytics/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: activeSubject.id })
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
        showToast('Generated fresh Gemini AI diagnostic brief!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDiagnostics(false);
    }
  };

  // Helper to re-fetch all users and current session
  const refreshUsersList = async () => {
    try {
      const res = await safeFetchJson<{ user: User; allUsers?: User[] }>('/api/auth/me');
      if (res?.allUsers) {
        setAllUsers(res.allUsers);
        if (currentUser) {
          const updatedSelf = res.allUsers.find(u => u.id === currentUser.id);
          if (updatedSelf) setCurrentUser(updatedSelf);
        }
      }
    } catch (err) {
      console.error('Error refreshing users list:', err);
    }
  };

  // Helper to re-fetch all subjects
  const refreshSubjectsList = async () => {
    try {
      const subjData = await safeFetchJson<Subject[]>('/api/subjects');
      if (subjData && subjData.length > 0) {
        setSubjects(subjData);
      }
    } catch (err) {
      console.error('Error refreshing subjects:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <img
            src="/logo.png"
            alt="EduSync Logo"
            className="w-14 h-14 object-contain mx-auto rounded-xl shadow-xl shadow-cyan-500/20 animate-pulse"
          />
          <p className="font-semibold text-white text-sm tracking-tight uppercase">EduSync Workspace</p>
          <p className="text-xs text-slate-400">Verifying Institutional Access & AI Engine...</p>
        </div>
      </div>
    );
  }

  // Not logged in: Show Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} allUsers={allUsers} />;
  }

  const isAdmin = currentUser.role === 'admin';
  const isTeacher = currentUser.role === 'teacher';
  const isStudent = currentUser.role === 'student';
  const isAuditing = Boolean(auditAdmin && currentUser && currentUser.role !== 'admin');

  return (
    <div className="flex h-screen w-screen max-w-full bg-[#090d16] text-slate-100 font-sans overflow-hidden transition-colors">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 1. Geometric Balance Dark Sidebar */}
      <aside className={`w-64 bg-slate-950 text-white flex flex-col border-r border-slate-800 shrink-0 transition-all ${
        mobileMenuOpen ? 'fixed inset-y-0 left-0 shadow-2xl z-50' : 'hidden md:flex z-30'
      }`}>
        {/* Logo & Brand */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="EduSync"
              className="w-9 h-9 object-contain rounded-lg shadow-sm shrink-0"
            />
            <div>
              <span className="text-lg font-bold tracking-tight uppercase text-white block leading-none">EduSync</span>
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider">
                {isAuditing ? 'Dean Audit Active' : isAdmin ? 'Registrar Edition' : isTeacher ? 'Faculty Edition' : 'Student Hub'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Way Mode Switcher - EXCLUSIVE TO DEANS / REGISTRARS & AUDITING DEANS */}
        {(isAdmin || isAuditing) && (
          <div className="p-2.5 border-b border-slate-800/60 bg-purple-950/20">
            <p className="text-[9px] uppercase tracking-widest text-purple-400 font-mono font-bold mb-1.5 px-1 flex items-center justify-between">
              <span>{isAuditing ? 'Audit Switcher' : 'Dean Audit Switcher'}</span>
              <span className="text-[8px] px-1 py-0.2 bg-purple-900/60 border border-purple-700 text-purple-200 rounded-xs font-mono">
                {isAuditing ? 'AUDITING' : 'ADMIN'}
              </span>
            </p>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-sm border border-slate-800">
              <button
                onClick={() => {
                  const student = allUsers.find(u => u.role === 'student');
                  if (student) handleSwitchUser(student.id);
                }}
                className={`px-1.5 py-1.5 rounded-sm text-[10px] font-semibold text-center transition-colors truncate ${
                  currentUser.role === 'student' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => {
                  const teacher = allUsers.find(u => u.role === 'teacher');
                  if (teacher) handleSwitchUser(teacher.id);
                }}
                className={`px-1.5 py-1.5 rounded-sm text-[10px] font-semibold text-center transition-colors truncate ${
                  currentUser.role === 'teacher' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Faculty
              </button>
              <button
                onClick={handleReturnToAdmin}
                className={`px-1.5 py-1.5 rounded-sm text-[10px] font-semibold text-center transition-colors truncate ${
                  currentUser.role === 'admin' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-purple-300 font-bold'
                }`}
              >
                Registrar
              </button>
            </div>
            {isAuditing && (
              <button
                onClick={handleReturnToAdmin}
                className="w-full mt-2 py-1 px-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Shield className="w-3 h-3" />
                <span>Return to Dean Dashboard ➔</span>
              </button>
            )}
          </div>
        )}

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="pt-2 pb-1.5 px-3 text-[10px] uppercase tracking-widest text-slate-500 font-mono font-bold">
            {isAdmin ? 'Registrar Operations' : isTeacher ? 'Faculty Workspace' : 'Student Center'}
          </div>

          {isAdmin ? (
            <>
              <button
                id="sidebar-tab-admin-portal"
                onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'overview' || activeTab === 'register' || activeTab === 'directory' || activeTab === 'courses'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0 text-purple-300" />
                <span>Identity & Provisioning</span>
              </button>
            </>
          ) : isTeacher ? (
            <>
              <button
                id="sidebar-tab-analytics"
                onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'analytics' || activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0 text-blue-400" />
                <span>AI Diagnostics</span>
              </button>

              <button
                id="sidebar-tab-students"
                onClick={() => { setActiveTab('students'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'students'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Students Roster ({allUsers.filter(u => u.role === 'student').length})</span>
              </button>

              <button
                id="sidebar-tab-timeline"
                onClick={() => { setActiveTab('timeline'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'timeline'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Syllabus & Milestones</span>
              </button>

              <button
                id="sidebar-tab-assignments"
                onClick={() => { setActiveTab('assignments'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'assignments'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Assignment Hub</span>
              </button>
            </>
          ) : (
            <>
              <button
                id="sidebar-tab-feed"
                onClick={() => { setActiveTab('feed'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'feed' || activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0 text-blue-400" />
                <span>Academic Overview</span>
              </button>

              <button
                id="sidebar-tab-notes"
                onClick={() => { setActiveTab('notes'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'notes'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Smart Note Playground</span>
              </button>

              <button
                id="sidebar-tab-tutor"
                onClick={() => { setActiveTab('tutor'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'tutor'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>Smart AI Tutor</span>
              </button>

              {/* Dedicated Questionnaire Sidebar Item */}
              <div className="pt-2">
                <button
                  id="sidebar-persona-questionnaire-btn"
                  onClick={() => { setShowPersonaModal(true); setMobileMenuOpen(false); }}
                  className="w-full text-left p-3 rounded-lg bg-gradient-to-br from-indigo-950/90 via-purple-950/80 to-slate-950 border border-indigo-700/60 hover:border-indigo-400 shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
                      AI Notes Tuning
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-900/90 text-indigo-200 border border-indigo-600 font-mono">
                      {currentUser.learningProfile?.questionnaireCompleted ? 'Configured' : 'Setup'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors">
                    {currentUser.learningProfile?.questionnaireCompleted
                      ? `✨ ${currentUser.learningProfile.learningStyle.replace('_', ' ').toUpperCase()} (${currentUser.learningProfile.targetGrade})`
                      : '⚡ Personalize All Notes'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    Launch 5-step cognitive tuning questionnaire
                  </p>
                </button>
              </div>
            </>
          )}

          <div className="pt-4 pb-1.5 px-3 text-[10px] uppercase tracking-widest text-slate-500 font-mono font-bold">
            {isAdmin ? 'All Institutional Classes' : 'Active Classes'}
          </div>

          <div className="space-y-1">
            {subjects.map((subj) => (
              <button
                key={subj.id}
                onClick={() => setActiveSubjectId(subj.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-sm text-xs transition-colors text-left ${
                  subj.id === activeSubjectId
                    ? 'bg-slate-800 text-white font-semibold border-l-2 border-blue-500'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span className="truncate pr-2 font-mono text-[11px]">{subj.code}</span>
                <span className="text-[10px] text-slate-500 font-mono">{subj.enrolledCount} st.</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer User Info & Always-Accessible Sign Out Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-sm bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0 font-mono border border-slate-700">
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0 truncate">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{currentUser.email}</p>
            </div>
          </div>
          {/* Direct Sidebar Sign Out Button */}
          <button
            onClick={handleLogout}
            id="sidebar-signout-btn"
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-rose-950/60 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-800/80 hover:border-rose-600 rounded text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Sign out of EduSync"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-300" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-[#090d16]">
        {/* Persistent Dean Audit Banner */}
        {isAuditing && (
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white px-4 py-2 flex items-center justify-between border-b border-purple-500/40 shadow-md text-xs z-50 shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-300"></span>
              </span>
              <span className="font-bold text-purple-200 uppercase tracking-wide">Dean Audit Mode</span>
              <span className="text-slate-300 hidden md:inline">· Currently inspecting workspace as:</span>
              <span className="bg-purple-950 px-2 py-0.5 rounded-sm border border-purple-700 text-purple-200 font-mono font-semibold">
                {currentUser.name} ({currentUser.role.toUpperCase()})
              </span>
            </div>
            <button
              onClick={handleReturnToAdmin}
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-sm shadow-sm transition-all transform hover:scale-[1.02] cursor-pointer shrink-0"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Return to Registrar Portal ➔</span>
            </button>
          </div>
        )}

        {/* Header Container */}
        <div className="flex items-center w-full min-w-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-4 text-slate-300 hover:bg-slate-800 border-b border-slate-800 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <Header
              currentUser={currentUser}
              allUsers={allUsers}
              onSwitchUser={handleSwitchUser}
              onLogout={handleLogout}
              subjects={subjects}
              activeSubjectId={activeSubjectId}
              onSelectSubject={(id) => setActiveSubjectId(id)}
              theme={theme}
              onToggleTheme={toggleTheme}
              isAuditing={isAuditing}
              onExitAudit={handleReturnToAdmin}
              activeTab={activeTab}
              onOpenPersonalization={() => setShowPersonaModal(true)}
            />
          </div>
        </div>

        {/* Content Body */}
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#090d16]">
          {/* Prominent Personalization Callout Banner for Students */}
          {isStudent && !currentUser?.learningProfile?.questionnaireCompleted && (
            <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 border border-purple-500/50 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600/30 border border-purple-400/40 rounded-lg shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Personalize All Your Study Notes & AI Assistant</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30">
                      1-Min Tuning
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Take the 5-step cognitive questionnaire to calibrate note derivations, visual diagrams, exam difficulty, and coaching style across all courses.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPersonaModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <span>Launch Questionnaire</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {/* Top Enrolled Subjects Quick Switcher (for Student & Faculty - hidden on universal AI Tutor tab) */}
          {!isAdmin && subjects.length > 0 && activeTab !== 'tutor' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-sm p-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    {currentUser.role === 'student' ? '1st Year Enrolled Curriculum (All 5 Subjects)' : 'Academic Courses Roster'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Active: <strong className="text-blue-400">{activeSubject.code}</strong> — {activeSubject.name} ({activeSubject.teacherName})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {subjects.map((subj) => {
                  const isSelected = subj.id === activeSubjectId;
                  return (
                    <button
                      key={subj.id}
                      id={`course-tab-${subj.code.toLowerCase()}`}
                      onClick={() => setActiveSubjectId(subj.id)}
                      className={`flex flex-col text-left p-2.5 rounded-sm border transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs ring-1 ring-blue-500/40'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full mb-1">
                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-xs ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {subj.code}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {subj.credits || 4} Cr
                        </span>
                      </div>
                      <span className="text-xs font-semibold truncate w-full text-slate-200" title={subj.name}>
                        {subj.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">
                        {subj.teacherName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Views Container */}
          {isAdmin ? (
            <AdminDashboard
              currentUser={currentUser}
              allUsers={allUsers}
              subjects={subjects}
              onRefreshUsers={refreshUsersList}
              onRefreshSubjects={refreshSubjectsList}
              onShowToast={(msg, type) => showToast(msg, type || 'success')}
            />
          ) : isTeacher ? (
            <div>
              {activeTab === 'students' && (
                <StudentDirectoryHub
                  currentUser={currentUser}
                  allUsers={allUsers}
                  subjects={subjects}
                  activeSubjectId={activeSubjectId}
                  onRefreshUsers={refreshUsersList}
                  onRefreshSubjects={refreshSubjectsList}
                  onShowToast={(msg, type) => showToast(msg, type || 'success')}
                />
              )}

              {(activeTab === 'analytics' || activeTab === 'overview') && analytics && (
                <AIClassAnalytics
                  analytics={analytics}
                  activeSubject={activeSubject}
                  onRefreshDiagnostics={handleRefreshDiagnostics}
                  isGeneratingDiagnostics={isGeneratingDiagnostics}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineManager
                  activeSubject={activeSubject}
                  timelines={timelines}
                  resources={resources}
                  onAddTimelineItem={handleAddTimelineItem}
                  onDeleteTimelineItem={handleDeleteTimelineItem}
                  onAddResource={handleAddResource}
                  onGenerateAISyllabus={handleGenerateAISyllabus}
                  isGeneratingSyllabus={isGeneratingSyllabus}
                />
              )}

              {activeTab === 'assignments' && (
                <AssignmentHub
                  activeSubject={activeSubject}
                  assignments={assignments}
                  onCreateAssignment={handleCreateAssignment}
                  onGradeSubmission={handleGradeSubmission}
                  fetchSubmissionsForAssignment={fetchSubmissionsForAssignment}
                />
              )}
            </div>
          ) : (
            <div>
              {(activeTab === 'feed' || activeTab === 'overview') && (
                <ResourceFeed
                  currentUser={currentUser}
                  subjects={subjects}
                  allSubjects={allSubjects}
                  activeSubject={activeSubject}
                  onSelectSubject={(id) => setActiveSubjectId(id)}
                  assignments={assignments}
                  allAssignments={allAssignments}
                  timelines={timelines}
                  allTimelines={allTimelines}
                  resources={resources}
                  allResources={allResources}
                  submissions={submissions}
                  allSubmissions={allSubmissions}
                  onSubmitAssignment={handleSubmitAssignment}
                  onNavigateToNotes={() => setActiveTab('notes')}
                />
              )}

              {activeTab === 'notes' && (
                <SmartNotePlayground
                  activeSubject={activeSubject}
                  subjects={subjects}
                  allSubjects={allSubjects}
                  notes={notes}
                  currentUser={currentUser}
                  onOpenPersonalization={() => setShowPersonaModal(true)}
                  onSaveNote={handleSaveNote}
                  onDeleteNote={handleDeleteNote}
                  onSummarizeNote={handleSummarizeNote}
                  onGenerateFlashcards={handleGenerateFlashcards}
                  onGenerateQuizFromNote={handleGenerateQuizFromNote}
                  onGenerateNoteFromPrompt={handleGenerateNoteFromPrompt}
                />
              )}

              {activeTab === 'tutor' && (
                <TutorLayout
                  currentUser={currentUser}
                  activeSubject={activeSubject}
                  timelines={timelines}
                  assignments={assignments}
                  onOpenPersonalization={() => setShowPersonaModal(true)}
                />
              )}
            </div>
          )}
        </section>
      </main>

      {/* Interactive Quiz Modal from Chat or Notes */}
      {activeQuizModal && (
        <InteractiveQuizModal
          quiz={activeQuizModal}
          onClose={() => setActiveQuizModal(null)}
        />
      )}

      {/* Learner Persona Questionnaire Modal */}
      {currentUser && (
        <LearnerPersonaModal
          isOpen={showPersonaModal}
          onClose={() => setShowPersonaModal(false)}
          currentProfile={currentUser.learningProfile}
          studentName={currentUser.name}
          onSave={handleSaveLearningProfile}
          onShowToast={(msg, type) => showToast(msg, type || 'success')}
        />
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-sm bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
