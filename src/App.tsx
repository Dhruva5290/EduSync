import React, { useState, useEffect, useRef } from 'react';
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
  LearnerPersona,
  QuestionBank
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
import { VisionNoteAuditHub } from './components/VisionNoteAudit/VisionNoteAuditHub';
import { LectureNotesStudio } from './components/VisionNoteLectures/LectureNotesStudio';
import { StudentHomeDashboard } from './components/StudentDashboard/StudentHomeDashboard';
import { LectureExperiencePage } from './components/LecturePage/LectureExperiencePage';
import { BoardVisualsHub } from './components/BoardVisuals/BoardVisualsHub';
import { QuestionBankManager } from './components/TeacherDashboard/QuestionBankManager';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { VisionNoteImportModal } from './components/VisionNoteImport/VisionNoteImportModal';
import { subscribeToVisionNotes, fetchVisionNotesFromSupabase, isSupabaseConfigured, smartCategorizeNote } from './lib/supabase';
import {
  FAKE_SUBJECTS,
  FAKE_USERS,
  FAKE_NOTES,
  FAKE_QUESTION_BANKS,
  FAKE_ASSIGNMENTS,
  FAKE_TIMELINES,
  FAKE_RESOURCES,
  FAKE_ANALYTICS
} from './mock/fakeData';


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
  LogOut,
  Camera,
  BrainCircuit,
  RotateCcw,
  Trash2
} from 'lucide-react';

export default function App() {
  // State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('edusync_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('edusync_accent') || 'blue';
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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem('edusync_user_id');
    if (savedUserId) {
      const matched = FAKE_USERS.find(u => u.id === savedUserId);
      if (matched) return matched;
    }
    return null;
  });
  const [allUsers, setAllUsers] = useState<User[]>(FAKE_USERS);
  const [subjects, setSubjects] = useState<Subject[]>(FAKE_SUBJECTS);
  const [activeSubjectId, setActiveSubjectId] = useState<string>('subj-phy');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedLectureId, setSelectedLectureId] = useState<string>('lec-phy-101');
  const [selectedLectureTimestamp, setSelectedLectureTimestamp] = useState<string | undefined>(undefined);
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState<string>('');
  const [tutorLectureContext, setTutorLectureContext] = useState<any>(null);
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

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor);
    localStorage.setItem('edusync_accent', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Course Data (Defaulted to Full Rich Fake Data so Vercel is Never Reset / Blank)
  const [timelines, setTimelines] = useState<TimelineItem[]>(FAKE_TIMELINES);
  const [resources, setResources] = useState<ReferenceResource[]>(FAKE_RESOURCES);
  const [assignments, setAssignments] = useState<Assignment[]>(FAKE_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [notes, setNotes] = useState<StudentNote[]>(() => {
    const deletedIds: string[] = (() => {
      try {
        return JSON.parse(localStorage.getItem('edusync_deleted_note_ids') || '[]');
      } catch {
        return [];
      }
    })();
    const saved = localStorage.getItem('edusync_notes');
    let baseNotes: StudentNote[] = [];
    try {
      baseNotes = saved ? JSON.parse(saved) : FAKE_NOTES;
    } catch {
      baseNotes = FAKE_NOTES;
    }
    // Ensure standard notes (including NDA Selection Process) are present if not explicitly deleted
    for (const fn of FAKE_NOTES) {
      if (!baseNotes.some(b => b.id === fn.id)) {
        baseNotes.push(fn);
      }
    }
    // Smartly categorize every note into its respected subject, routing unrelated ones to Misc
    const categorized = baseNotes.map(n => ({
      ...n,
      subjectId: smartCategorizeNote(n)
    }));
    try {
      localStorage.setItem('edusync_notes', JSON.stringify(categorized));
    } catch (e) {}
    return categorized.filter(n => !deletedIds.includes(n.id));
  });

  // Undo tracking for note deletion
  const [lastDeletedNote, setLastDeletedNote] = useState<StudentNote | null>(null);
  const undoTimeoutRef = useRef<any>(null);
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(FAKE_ANALYTICS['subj-phy']);

  // Master Multi-Course Semester Datasets
  const [allSubjects, setAllSubjects] = useState<Subject[]>(FAKE_SUBJECTS);
  const [allTimelines, setAllTimelines] = useState<TimelineItem[]>(FAKE_TIMELINES);
  const [allResources, setAllResources] = useState<ReferenceResource[]>(FAKE_RESOURCES);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>(FAKE_ASSIGNMENTS);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);

  // Question Banks (Faculty-Uploaded & Grounded in AI Quizzes)
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>(() => {
    const saved = localStorage.getItem('edusync_question_banks');
    try {
      return saved ? JSON.parse(saved) : FAKE_QUESTION_BANKS;
    } catch {
      return FAKE_QUESTION_BANKS;
    }
  });

  const [activeQuizModal, setActiveQuizModal] = useState<GeneratedQuiz | null>(null);
  const [showVNImportModal, setShowVNImportModal] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('edusync_demo_mode');
    return saved === null ? true : saved === 'true';
  });


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

  const handleToggleDemoMode = (demo: boolean) => {
    setIsDemoMode(demo);
    localStorage.setItem('edusync_demo_mode', String(demo));
    if (!demo) {
      // Clean slate mode for production: reset to empty state
      setNotes([]);
      setTimelines([]);
      setAssignments([]);
      localStorage.removeItem('edusync_notes');
      localStorage.removeItem('edusync_timelines');
      localStorage.removeItem('edusync_assignments');
      showToast('Clean Slate Mode Active: Cleared demo data for fresh production setup.', 'info');
    } else {
      // Mentor demo mode: restore full rich fake data
      setNotes(FAKE_NOTES);
      setTimelines(FAKE_TIMELINES);
      setAssignments(FAKE_ASSIGNMENTS);
      setQuestionBanks(FAKE_QUESTION_BANKS);
      localStorage.setItem('edusync_notes', JSON.stringify(FAKE_NOTES));
      localStorage.setItem('edusync_timelines', JSON.stringify(FAKE_TIMELINES));
      localStorage.setItem('edusync_assignments', JSON.stringify(FAKE_ASSIGNMENTS));
      localStorage.setItem('edusync_question_banks', JSON.stringify(FAKE_QUESTION_BANKS));
      showToast('✨ Mentor Demo Mode Active: Restored full presentation notes and questions!', 'success');
    }
  };

  const handleChangeAccentColor = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('edusync_accent', color);
    document.documentElement.dataset.accent = color;
    showToast(`Accent theme updated to ${color.toUpperCase()}`, 'info');
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

      // Check for saved session so page reload on Vercel doesn't kick the user out
      const savedToken = authToken || localStorage.getItem('edusync_token');
      const savedUserId = localStorage.getItem('edusync_user_id');
      if (savedToken && savedUserId && !currentUser) {
        const matched = FAKE_USERS.find(u => u.id === savedUserId);
        if (matched) {
          setCurrentUser(matched);
          setAuthToken(savedToken);
        }
      }

      try {
        // Fetch all registered users list so LoginScreen and rosters have up-to-date data
        const publicData = await safeFetchJson<{ users: User[] }>('/api/auth/public-users');
        if (publicData?.users && Array.isArray(publicData.users) && publicData.users.length > 0) {
          setAllUsers(publicData.users);
        }

        // Fetch subjects if available
        const subjData = await safeFetchJson<Subject[]>('/api/subjects');
        if (subjData && Array.isArray(subjData) && subjData.length > 0) {
          setSubjects(subjData);
          setAllSubjects(subjData);
        }

        // Fetch question banks if available
        const qbData = await safeFetchJson<QuestionBank[]>('/api/question-banks');
        if (qbData && Array.isArray(qbData) && qbData.length > 0) {
          setQuestionBanks(qbData);
        }

        await fetchMasterData();
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
        if (noteData && noteData.length > 0) {
          setNotes((prevNotes) => {
            const merged = [...noteData];
            for (const prev of prevNotes) {
              if (!merged.some(m => m.id === prev.id)) {
                merged.push(prev);
              }
            }
            return merged;
          });
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

  // Supabase Cloud Ingestion: Pull existing notes on mount + listen in real-time
  useEffect(() => {
    if (!currentUser) return;

    // 1. Pull existing notes uploaded by VisionNote from Supabase Cloud
    if (isSupabaseConfigured()) {
      fetchVisionNotesFromSupabase().then(({ notes: cloudNotes, error }) => {
        if (!error && cloudNotes && cloudNotes.length > 0) {
          setNotes((prevNotes) => {
            const deletedIds: string[] = (() => {
              try {
                return JSON.parse(localStorage.getItem('edusync_deleted_note_ids') || '[]');
              } catch {
                return [];
              }
            })();

            // Filter out user-deleted notes and ensure clean categorization
            const eligibleCloud = cloudNotes.map(n => ({
              ...n,
              subjectId: smartCategorizeNote(n)
            })).filter(n => !deletedIds.includes(n.id));

            // Merge cloud notes and existing notes without overwriting
            const merged = [...eligibleCloud];
            for (const prev of prevNotes) {
              if (!merged.some(m => m.id === prev.id) && !deletedIds.includes(prev.id)) {
                merged.push({
                  ...prev,
                  subjectId: smartCategorizeNote(prev)
                });
              }
            }
            try {
              localStorage.setItem('edusync_notes', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      });
    }

    // 2. Real-time listener for incoming notes pushed while user is on page
    const unsubscribe = subscribeToVisionNotes((incomingNote) => {
      const deletedIds: string[] = (() => {
        try {
          return JSON.parse(localStorage.getItem('edusync_deleted_note_ids') || '[]');
        } catch {
          return [];
        }
      })();
      if (deletedIds.includes(incomingNote.id)) return;

      const isTarget = !incomingNote.studentId ||
        incomingNote.studentId === currentUser.id ||
        incomingNote.studentId === currentUser.institutionalId ||
        incomingNote.source === 'visionnote' ||
        currentUser.role === 'admin' ||
        currentUser.role === 'teacher';

      if (!isTarget) return;

      const categorizedIncoming: StudentNote = {
        ...incomingNote,
        subjectId: smartCategorizeNote(incomingNote)
      };

      setNotes((prevNotes) => {
        let updated: StudentNote[];
        if (prevNotes.some(n => n.id === categorizedIncoming.id)) {
          updated = prevNotes.map(n => n.id === categorizedIncoming.id ? categorizedIncoming : n);
        } else {
          updated = [categorizedIncoming, ...prevNotes];
        }
        try {
          localStorage.setItem('edusync_notes', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      showToast(`📸 VisionNote Cloud Sync: "${categorizedIncoming.title}" synced!`, 'info');
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id]);

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
  // 9. Save Student Note
  const handleSaveNote = async (note: Partial<StudentNote>): Promise<StudentNote> => {
    try {
      const token = authToken || localStorage.getItem('edusync_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;

      const finalSubjId = note.subjectId || activeSubjectId || 'others';
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...note,
          subjectId: finalSubjId,
          studentId: currentUser?.id
        })
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
        showToast('Study note saved successfully!');
        return saved;
      }
    } catch (err) {
      console.error('Error saving note:', err);
    }
    return note as StudentNote;
  };

  // 10. Delete Note with Persistent Blacklist & Undo
  const handleDeleteNote = async (noteId: string) => {
    const noteToDelete = notes.find(n => n.id === noteId);
    if (!noteToDelete) return;

    // 1. Mark in user-deleted blacklist
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('edusync_deleted_note_ids') || '[]');
      if (!deletedIds.includes(noteId)) {
        deletedIds.push(noteId);
        localStorage.setItem('edusync_deleted_note_ids', JSON.stringify(deletedIds));
      }
    } catch (e) {}

    // 2. Remove from active notes state and persist in localStorage
    const updated = notes.filter(n => n.id !== noteId);
    setNotes(updated);
    try {
      localStorage.setItem('edusync_notes', JSON.stringify(updated));
    } catch (e) {}

    // 3. Set up Undo notification state
    setLastDeletedNote(noteToDelete);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => {
      setLastDeletedNote(null);
    }, 12000);

    // 4. Background server deletion
    try {
      const token = authToken || localStorage.getItem('edusync_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      fetch(`/api/notes/${noteId}`, { method: 'DELETE', headers }).catch(() => {});
    } catch (err) {}
  };

  const handleUndoDeleteNote = () => {
    if (!lastDeletedNote) return;
    const restored = lastDeletedNote;

    // 1. Remove from user-deleted blacklist
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('edusync_deleted_note_ids') || '[]');
      const filtered = deletedIds.filter(id => id !== restored.id);
      localStorage.setItem('edusync_deleted_note_ids', JSON.stringify(filtered));
    } catch (e) {}

    // 2. Restore to active notes state and localStorage
    setNotes(prev => {
      const exists = prev.some(n => n.id === restored.id);
      const nextNotes = exists ? prev : [restored, ...prev];
      try {
        localStorage.setItem('edusync_notes', JSON.stringify(nextNotes));
      } catch (e) {}
      return nextNotes;
    });

    setLastDeletedNote(null);
    showToast(`Restored "${restored.title}"!`, 'success');
  };

  // 11. AI Summarize Note
  const handleSummarizeNote = async (noteId: string, content: string, learnerProfile?: LearnerPersona) => {
    const token = authToken || localStorage.getItem('edusync_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (currentUser?.id) headers['x-user-id'] = currentUser.id;

    const res = await fetch('/api/ai/notes/summarize', {
      method: 'POST',
      headers,
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
    const token = authToken || localStorage.getItem('edusync_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (currentUser?.id) headers['x-user-id'] = currentUser.id;

    const res = await fetch('/api/ai/notes/flashcards', {
      method: 'POST',
      headers,
      body: JSON.stringify({ noteId, content, learnerProfile: learnerProfile || currentUser?.learningProfile })
    });
    if (res.ok) {
      const data = await res.json();
      showToast(`Generated ${data.flashcards?.length || 0} high-yield flashcards!`);
      return data.flashcards || [];
    }
    throw new Error('Failed to generate flashcards');
  };

  // 13. AI Note-to-Quiz Bridge (Grounding in Teacher Question Banks)
  const handleGenerateQuizFromNote = async (noteId: string, content: string, title: string, learnerProfile?: LearnerPersona): Promise<GeneratedQuiz> => {
    const token = authToken || localStorage.getItem('edusync_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (currentUser?.id) headers['x-user-id'] = currentUser.id;

    const note = notes.find(n => n.id === noteId);
    const targetSubjId = note?.subjectId || activeSubjectId;

    try {
      const res = await fetch('/api/ai/notes/quiz', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          noteId,
          content,
          title,
          subjectId: targetSubjId,
          learnerProfile: learnerProfile || currentUser?.learningProfile
        })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(
          data.quiz?.hasTeacherQuestions
            ? `✨ Quiz generated with verified faculty question bank!`
            : `Generated Note-to-Quiz interactive assessment!`
        );
        return data.quiz;
      }
    } catch (err) {
      console.warn('Backend quiz endpoint error, synthesizing locally with faculty question bank:', err);
    }

    // Local fallback utilizing questions from matching teacher question banks
    const matchingBanks = questionBanks.filter(qb => qb.subjectId === targetSubjId);
    const facultyQs = matchingBanks.flatMap(qb => qb.questions || []);
    const chosenQs = facultyQs.length > 0 ? facultyQs.slice(0, 4) : [
      {
        id: `q-loc-1`,
        question: `Based on "${title}", what is the primary invariant condition required?`,
        options: ['State equilibrium and conservation of energy', 'Arbitrary divergence', 'Infinite entropy growth', 'Unbounded recursion'],
        correctIndex: 0,
        explanation: 'The fundamental concept maintains rigorous conservation and state boundary conditions.',
        topic: title.slice(0, 20),
        difficulty: 'moderate' as const
      }
    ];

    const fallbackQuiz: GeneratedQuiz = {
      id: `quiz-fb-${Date.now()}`,
      title: facultyQs.length > 0 ? `Faculty Curated Assessment: ${title}` : `Practice Quiz: ${title}`,
      topic: title,
      questions: chosenQs,
      createdAt: new Date().toISOString(),
      hasTeacherQuestions: facultyQs.length > 0,
      teacherQuestionsCount: chosenQs.filter(q => q.source === 'teacher_question_bank').length
    };

    showToast(
      fallbackQuiz.hasTeacherQuestions
        ? `✨ Quiz loaded with verified faculty question bank!`
        : `Generated Note-to-Quiz interactive assessment!`
    );
    return fallbackQuiz;
  };

  // 13.2 Question Bank Handlers (Faculty Upload & Storage)
  const handleSaveQuestionBank = async (bank: QuestionBank) => {
    setQuestionBanks(prev => {
      const next = [bank, ...prev.filter(b => b.id !== bank.id)];
      localStorage.setItem('edusync_question_banks', JSON.stringify(next));
      return next;
    });

    try {
      const token = authToken || localStorage.getItem('edusync_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch('/api/question-banks', {
        method: 'POST',
        headers,
        body: JSON.stringify(bank)
      });
    } catch (err) {
      console.warn('Backend question bank sync offline, saved in local state:', err);
    }
  };

  const handleDeleteQuestionBank = async (bankId: string) => {
    setQuestionBanks(prev => {
      const next = prev.filter(b => b.id !== bankId);
      localStorage.setItem('edusync_question_banks', JSON.stringify(next));
      return next;
    });

    try {
      const token = authToken || localStorage.getItem('edusync_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/question-banks/${bankId}`, {
        method: 'DELETE',
        headers
      });
    } catch (err) {
      console.warn('Backend question bank delete failed:', err);
    }
  };

  // 13.3 Direct VisionNote Text Import with Adaptive Persona Synthesis
  const handleImportVNNote = async (newNoteData: Partial<StudentNote>): Promise<StudentNote> => {
    const targetSubjId = newNoteData.subjectId || 'subj-misc';
    const cleanTitle = newNoteData.title || 'VisionNote OCR Lecture';
    const persona = currentUser?.learningProfile;

    let finalContent = newNoteData.content || '';
    let summaryText = 'VisionNote OCR captured notes. Calibrated to individual student persona.';
    let takeaways = [
      'Invariants and core boundary conditions identified.',
      'Governing equations and derivations formatted in KaTeX.',
      'Mapped directly to course curriculum syllabus.'
    ];

    if (persona) {
      if (persona.learningStyle === 'visual') {
        finalContent = `# ${cleanTitle} [Visual Study Blueprint]\n\n> 📊 **Visual Mindmap & Concept Blueprint**\n> Concept Flow: Invariants ➔ Boundary Conditions ➔ Governing Law ➔ Practical Applications\n\n${finalContent}`;
      } else if (persona.learningStyle === 'step_by_step') {
        finalContent = `# ${cleanTitle} [Step-by-Step Derivation Breakdown]\n\n> 🧩 **Sequential Breakdown for Mastery**\n> 1. Foundational Axioms\n> 2. Analytical Derivation\n> 3. Exam Verification\n\n${finalContent}`;
      } else {
        finalContent = `# ${cleanTitle} [Personalized High-Yield Edition]\n\n${finalContent}`;
      }
    }

    const createdNote: StudentNote = {
      id: `vn-note-${Date.now()}`,
      subjectId: targetSubjId,
      title: cleanTitle,
      content: finalContent,
      summary: summaryText,
      keyTakeaways: takeaways,
      tags: ['VisionNote', 'OCR-Import', targetSubjId],
      lastModified: new Date().toISOString(),
      source: 'visionnote',
      isPersonalized: true
    };

    const nextNotes = [createdNote, ...notes.filter(n => n.id !== createdNote.id)];
    setNotes(nextNotes);
    localStorage.setItem('edusync_notes', JSON.stringify(nextNotes));
    setActiveSubjectId(targetSubjId);
    setActiveTab('notes');
    return createdNote;
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

  // 14. Save Student Personalized Learning Profile & Immediately Recraft Notes
  const handleSaveLearningProfile = async (profile: LearnerPersona) => {
    if (!currentUser) return;
    const res = await fetch(`/api/students/${currentUser.id}/learning-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learningProfile: profile })
    });
    if (res.ok) {
      const data = await res.json();
      setCurrentUser(prev => prev ? { ...prev, learningProfile: profile } : null);
      setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, learningProfile: profile } : u));
      if (data.updatedNotes && Array.isArray(data.updatedNotes)) {
        setNotes(prevNotes => {
          const updatedMap = new Map<string, StudentNote>(data.updatedNotes.map((n: StudentNote) => [n.id, n]));
          return prevNotes.map(n => updatedMap.get(n.id) || n);
        });
      }
      showToast(data.message || `✨ Notes immediately re-crafted for ${profile.learningStyle.replace('_', ' ').toUpperCase()} style!`, 'success');
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
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onLaunchVisionNoteDirectly={async (user, token) => {
          await handleLoginSuccess(user, token);
          setActiveTab('visionnote-audit');
        }}
        allUsers={allUsers}
      />
    );
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

              <button
                id="sidebar-tab-question-banks"
                onClick={() => { setActiveTab('question-banks'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'question-banks'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BrainCircuit className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>Question Bank Hub ({questionBanks.filter(qb => qb.subjectId === activeSubjectId).length})</span>
              </button>
            </>
          ) : (
            <>
              <button
                id="sidebar-tab-feed"
                onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'overview' || activeTab === 'feed'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0 text-blue-400" />
                <span>Student Dashboard</span>
              </button>

              <button
                id="sidebar-tab-lecture"
                onClick={() => { setActiveTab('lecture'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'lecture'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>Interactive Lecture</span>
              </button>

              <button
                id="sidebar-tab-board-visuals"
                onClick={() => { setActiveTab('board-visuals'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'board-visuals'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Board Visuals Gallery</span>
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
                <span>Context-Aware AI Tutor</span>
              </button>

              <button
                id="sidebar-tab-lecture-notes"
                onClick={() => { setActiveTab('lecture-notes'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'lecture-notes'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0 text-cyan-400" />
                <div className="flex items-center justify-between flex-1">
                  <span>VN Studio</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Live
                  </span>
                </div>
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

          {/* Dedicated VisionNote & Grade 11-12 Science Sandbox Button for All Roles */}
          <div className="pt-1 pb-1">
            <button
              id="sidebar-tab-visionnote-audit"
              onClick={() => { setActiveTab('visionnote-audit'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left border ${
                activeTab === 'visionnote-audit'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-400/50 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/40 text-cyan-300 border-cyan-800/40 hover:bg-slate-800 hover:border-cyan-500/50'
              }`}
            >
              <Camera className="w-4 h-4 shrink-0 text-cyan-400 animate-pulse" />
              <div className="flex-1 truncate">
                <span className="block text-xs font-bold leading-tight">11-12th Science & VN Sync</span>
                <span className="block text-[9px] text-slate-400 font-normal">Physics, Chemistry, Maths & OCR</span>
              </div>
            </button>
          </div>

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
              onNavigateToVisionNote={() => setActiveTab('visionnote-audit')}
              isDemoMode={isDemoMode}
              onToggleDemoMode={handleToggleDemoMode}
              onOpenVNImport={() => setShowVNImportModal(true)}
              accentColor={accentColor}
              onChangeAccentColor={handleChangeAccentColor}
            />
          </div>
        </div>

        {/* Content Body Wrapped in ErrorBoundary */}
        <ErrorBoundary fallbackTitle="Workspace Recovered Safely">
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
          {/* Sleek Compact Curriculum Strip */}
          {!isAdmin && subjects.length > 0 && activeTab !== 'tutor' && (
            <div className="flex items-center justify-between gap-3 bg-slate-950/70 border border-slate-800/80 rounded-xl px-3 py-2 shadow-xs backdrop-blur-xs">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono shrink-0 mr-1 hidden sm:inline">
                  Curriculum:
                </span>
                {subjects.map((subj) => {
                  const isSelected = subj.id === activeSubjectId;
                  return (
                    <button
                      key={subj.id}
                      id={`course-tab-${subj.code.toLowerCase()}`}
                      onClick={() => setActiveSubjectId(subj.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 border cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-900/30'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {subj.code}
                      </span>
                      <span className="truncate max-w-[130px]">{subj.name}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] font-mono text-slate-400 shrink-0 hidden lg:inline">
                Faculty: <strong className="text-slate-200">{activeSubject.teacherName}</strong>
              </span>
            </div>
          )}

          {/* Main Views Container */}
          {activeTab === 'visionnote-audit' ? (
            <VisionNoteAuditHub
              currentUser={currentUser}
              onOpenSocraticTutor={(subjId, initialPrompt) => {
                setActiveSubjectId(subjId);
                setActiveTab('tutor');
              }}
              onViewNoteInEditor={(note) => {
                setActiveSubjectId(note.subjectId);
                setActiveTab('notes');
              }}
            />
          ) : isAdmin ? (
            <AdminDashboard
              currentUser={currentUser}
              allUsers={allUsers}
              subjects={subjects}
              onRefreshUsers={refreshUsersList}
              onRefreshSubjects={refreshSubjectsList}
              onShowToast={(msg, type) => showToast(msg, type || 'success')}
              onNavigateToVisionNote={() => setActiveTab('visionnote-audit')}
              onSwitchUser={handleSwitchUser}
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

              {activeTab === 'question-banks' && (
                <QuestionBankManager
                  currentUser={currentUser}
                  subjects={subjects}
                  activeSubjectId={activeSubjectId}
                  onSelectSubject={(id) => setActiveSubjectId(id)}
                  questionBanks={questionBanks}
                  onSaveQuestionBank={handleSaveQuestionBank}
                  onDeleteQuestionBank={handleDeleteQuestionBank}
                  onShowToast={(msg, type) => showToast(msg, type || 'success')}
                />
              )}
            </div>
          ) : (
            <div>
              {(activeTab === 'feed' || activeTab === 'overview' || activeTab === 'student-dashboard') && (
                <StudentHomeDashboard
                  currentUser={currentUser}
                  onOpenLecture={(lectureId, initialTs) => {
                    setSelectedLectureId(lectureId);
                    setSelectedLectureTimestamp(initialTs);
                    setActiveTab('lecture');
                  }}
                  onOpenTutorWithPrompt={(prompt, context) => {
                    setTutorInitialPrompt(prompt);
                    setTutorLectureContext(context);
                    setActiveTab('tutor');
                  }}
                  onViewAssignments={() => setActiveTab('feed-resources')}
                  onViewBoardVisuals={() => setActiveTab('board-visuals')}
                  onNavigateToVisionNote={() => setActiveTab('lecture-notes')}
                />
              )}

              {activeTab === 'lecture' && (
                <LectureExperiencePage
                  lectureId={selectedLectureId || 'lec-phy-101'}
                  currentUser={currentUser}
                  onNavigateBack={() => setActiveTab('overview')}
                  onOpenTutorWithContext={(prompt, context) => {
                    setTutorInitialPrompt(prompt);
                    setTutorLectureContext(context);
                    setActiveTab('tutor');
                  }}
                  initialTimestamp={selectedLectureTimestamp}
                />
              )}

              {activeTab === 'board-visuals' && (
                <BoardVisualsHub
                  subjects={subjects}
                  onOpenLecture={(lectureId, timestamp) => {
                    setSelectedLectureId(lectureId);
                    setSelectedLectureTimestamp(timestamp);
                    setActiveTab('lecture');
                  }}
                />
              )}

              {activeTab === 'feed-resources' && (
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
                  onNavigateToNotes={(subjectId) => {
                    if (subjectId) setActiveSubjectId(subjectId);
                    setActiveTab('lecture-notes');
                  }}
                  onNavigateToVisionNote={() => setActiveTab('lecture-notes')}
                />
              )}

              {activeTab === 'lecture-notes' && (
                <LectureNotesStudio
                  activeSubject={activeSubject}
                  subjects={subjects}
                  allSubjects={allSubjects}
                  onSelectSubject={(id) => setActiveSubjectId(id)}
                  currentUser={currentUser}
                  notes={notes}
                  onOpenQuestionnaire={() => setShowPersonaModal(true)}
                  onOpenSocraticTutor={(subjId, prompt) => {
                    if (subjId) setActiveSubjectId(subjId);
                    if (prompt) setTutorInitialPrompt(prompt);
                    setActiveTab('tutor');
                  }}
                  onNavigateToBack={() => setActiveTab('overview')}
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
                  onNavigateToVisionNote={() => setActiveTab('lecture-notes')}
                  onSaveNote={handleSaveNote}
                  onDeleteNote={handleDeleteNote}
                  onSummarizeNote={handleSummarizeNote}
                  onGenerateFlashcards={handleGenerateFlashcards}
                  onGenerateQuizFromNote={handleGenerateQuizFromNote}
                  onGenerateNoteFromPrompt={handleGenerateNoteFromPrompt}
                  onOpenTutor={(prompt, context) => {
                    setTutorInitialPrompt(prompt);
                    if (context) setTutorLectureContext(context);
                    setActiveTab('tutor');
                  }}
                />
              )}

              {activeTab === 'tutor' && (
                <TutorLayout
                  currentUser={currentUser}
                  activeSubject={activeSubject}
                  timelines={timelines}
                  assignments={assignments}
                  initialPrompt={tutorInitialPrompt}
                  lectureContext={tutorLectureContext}
                  onOpenPersonalization={() => setShowPersonaModal(true)}
                />
              )}
            </div>
          )}
        </section>
        </ErrorBoundary>
      </main>

      {/* Interactive Quiz Modal from Chat or Notes */}
      {activeQuizModal && (
        <InteractiveQuizModal
          quiz={activeQuizModal}
          onClose={() => setActiveQuizModal(null)}
          onAskAITutor={(prompt, context) => {
            setActiveQuizModal(null);
            setTutorInitialPrompt(prompt);
            if (context) setTutorLectureContext(context);
            setActiveTab('tutor');
          }}
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

      {/* Direct VisionNote Text / File Import Modal */}
      <VisionNoteImportModal
        isOpen={showVNImportModal}
        onClose={() => setShowVNImportModal(false)}
        subjects={subjects}
        activeSubjectId={activeSubjectId}
        learnerProfile={currentUser.learningProfile}
        onImportNote={handleImportVNNote}
        onShowToast={(msg, type) => showToast(msg, type || 'success')}
      />

      {/* Floating Undo Notification for Deleted Note */}
      {lastDeletedNote && (
        <div className="fixed bottom-20 right-5 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-amber-500/70 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-200">
                Deleted <span className="text-white font-bold max-w-[200px] truncate inline-block align-bottom">"{lastDeletedNote.title}"</span>
              </span>
            </div>
            <button
              id="undo-deleted-note-btn"
              onClick={handleUndoDeleteNote}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
            <button
              onClick={() => setLastDeletedNote(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
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
