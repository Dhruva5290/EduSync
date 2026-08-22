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
  StudyChatMessage,
  Flashcard,
  GeneratedQuiz
} from './types';
import { Header } from './components/Header';
import { AIClassAnalytics } from './components/TeacherDashboard/AIClassAnalytics';
import { TimelineManager } from './components/TeacherDashboard/TimelineManager';
import { AssignmentHub } from './components/TeacherDashboard/AssignmentHub';
import { StudentDirectoryHub } from './components/TeacherDashboard/StudentDirectoryHub';
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard';
import { ResourceFeed } from './components/StudentDashboard/ResourceFeed';
import { SmartNotePlayground } from './components/StudentDashboard/SmartNotePlayground';
import { StudyAssistantChat } from './components/AIStudyAssistant/StudyAssistantChat';
import { InteractiveQuizModal } from './components/StudentDashboard/InteractiveQuizModal';
import { LoginScreen } from './components/LoginScreen';

import {
  BarChart3,
  Calendar,
  FileText,
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
  Building
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

  // Chat Data
  const [chatMessages, setChatMessages] = useState<StudyChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
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
      const token = localStorage.getItem('edusync_token');
      if (!token) {
        setIsLoading(false);
        setCurrentUser(null);
        return;
      }

      try {
        // Fetch current user and all users
        const authData = await safeFetchJson<{ authenticated: boolean; user: User; allUsers?: User[]; allDemoUsers?: User[] }>('/api/auth/me');

        if (authData?.authenticated && authData.user) {
          setCurrentUser(authData.user);
          setAllUsers(authData.allUsers || authData.allDemoUsers || []);

          const [allSubjData, userSubjData] = await Promise.all([
            safeFetchJson<Subject[]>('/api/subjects/all'),
            safeFetchJson<Subject[]>('/api/subjects')
          ]);

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

          if (authData.user.role === 'teacher') {
            setActiveTab('analytics');
          } else if (authData.user.role === 'admin') {
            setActiveTab('overview');
          } else {
            setActiveTab('feed');
          }

          await fetchMasterData();
        } else {
          localStorage.removeItem('edusync_token');
          setAuthToken(null);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error loading initial session:', err);
        localStorage.removeItem('edusync_token');
        setAuthToken(null);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, [authToken]);

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

        // 4. Notes
        const noteData = await safeFetchJson<StudentNote[]>(`/api/notes/${activeSubjectId}`);
        if (noteData) {
          setNotes(noteData);
        }

        // 5. Analytics (if teacher or overview)
        const anaData = await safeFetchJson<ClassAnalytics>(`/api/analytics/${activeSubjectId}`);
        if (anaData) {
          setAnalytics(anaData);
        }

        // Initialize Chat with Welcome Message for this Subject
        const activeSubj = subjects.find(s => s.id === activeSubjectId) || allSubjects.find(s => s.id === activeSubjectId);
        const subjCode = activeSubj?.code || 'CPC';
        const subjName = activeSubj?.name || 'Curriculum';
        
        let initialVideos: any[] = [];
        let initialQuestions: any[] = [];
        
        if (subjCode === 'ESS') {
          initialVideos = [
            {
              title: 'Renewable Energy 101 & Solar PV Cell Efficiency',
              url: 'https://www.youtube.com/watch?v=1kUE0BZtTRc',
              searchQuery: 'Renewable Energy 101 National Geographic solar wind',
              channelOrTopic: 'National Geographic',
              duration: '03:17',
              description: 'Overview of clean energy sources, solar photovoltaic conversion, and wind power generation systems.'
            },
            {
              title: 'Ecosystem Ecology: Energy Flow & Carbon Cycles',
              url: 'https://www.youtube.com/watch?v=7G3eIYSfg5o',
              searchQuery: 'Ecosystem Ecology Links in the Chain Crash Course Ecology',
              channelOrTopic: 'CrashCourse',
              duration: '10:09',
              description: 'Trophic energy pyramids, biogeochemical cycles, and ecosystem stability principles.'
            }
          ];
          initialQuestions = [
            {
              question: 'What is the primary difference between EIA Screening and EIA Scoping?',
              answer: 'Screening determines WHETHER an EIA is required based on statutory thresholds, whereas Scoping defines WHAT environmental parameters, spatial boundaries, and alternatives must be investigated.',
              topic: 'EIA Methodology',
              hint: 'One is a yes/no threshold filter; the other defines the boundary of study.'
            }
          ];
        } else if (subjCode === 'CALC') {
          initialVideos = [
            {
              title: 'The Essence of Calculus, Chapter 1: Visual Foundations',
              url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM',
              searchQuery: 'Essence of calculus chapter 1 3Blue1Brown',
              channelOrTopic: '3Blue1Brown',
              duration: '17:04',
              description: 'Visual geometric proof connecting area under curves, tangents, and fundamental theorem of calculus.'
            },
            {
              title: 'Lagrange Multipliers with Constrained Optimization Visualized',
              url: 'https://www.youtube.com/watch?v=9vKqVkMQHKk',
              searchQuery: 'Lagrange multipliers multivariable calculus Khan Academy 3Blue1Brown',
              channelOrTopic: 'Khan Academy / 3Blue1Brown',
              duration: '08:42',
              description: 'Geometric explanation of why contour gradients align (grad f = lambda grad g) at constrained extrema.'
            }
          ];
          initialQuestions = [
            {
              question: 'Why must grad f = lambda * grad g at the constrained local extremum of f(x, y) subject to g(x, y) = c?',
              answer: 'Because at the optimal point on the constraint curve, the level curves of f are tangent to g = c. If they crossed, you could increase f by moving along the curve.',
              topic: 'Constrained Optimization',
              hint: 'Consider the geometric alignment of gradient normal vectors.'
            }
          ];
        } else if (subjCode === 'EME') {
          initialVideos = [
            {
              title: 'Understanding Stress and Strain: Engineering Mechanics',
              url: 'https://www.youtube.com/watch?v=aQf6Q8t1FQE',
              searchQuery: 'Understanding Stress and Strain The Efficient Engineer',
              channelOrTopic: 'The Efficient Engineer',
              duration: '11:42',
              description: 'Fundamental explanation of normal stress, shear stress, Hooke’s law, and tensile stress-strain curves.'
            },
            {
              title: 'How Thermodynamic Engine Cycles Work (Otto & Diesel Cycles)',
              url: 'https://www.youtube.com/watch?v=DZt5xU44IfQ',
              searchQuery: 'How Diesel Engines Work Lesics Learn Engineering',
              channelOrTopic: 'Lesics (Learn Engineering)',
              duration: '08:12',
              description: 'Detailed animation of four-stroke cycle, P-v and T-s thermodynamic diagrams, and fuel injection physics.'
            }
          ];
          initialQuestions = [
            {
              question: 'For the same compression ratio and heat input, why does an ideal Otto cycle achieve higher thermal efficiency than a Diesel cycle?',
              answer: 'In the Otto cycle, all heat addition occurs at constant volume (highest peak temperature and pressure), whereas in the Diesel cycle, heat addition occurs at constant pressure during expansion.',
              topic: 'Thermodynamics',
              hint: 'Compare heat addition processes: isochoric vs isobaric.'
            }
          ];
        } else if (subjCode === 'ENG-ETH') {
          initialVideos = [
            {
              title: 'Justice: What’s The Right Thing To Do? (Utilitarianism & Morality)',
              url: 'https://www.youtube.com/watch?v=kBdfcR-8hEY',
              searchQuery: 'Justice Episode 01 The Moral Side of Murder Harvard Sandel',
              channelOrTopic: 'Harvard University',
              duration: '54:56',
              description: 'Seminal Harvard course lecture on moral reasoning, utilitarian trade-offs, and categorical ethical duties.'
            },
            {
              title: 'Engineering Ethics: The Space Shuttle Challenger Disaster',
              url: 'https://www.youtube.com/watch?v=0wI_y1t8Jps',
              searchQuery: 'Engineering Ethics Space Shuttle Challenger Crash Course Engineering',
              channelOrTopic: 'CrashCourse Engineering',
              duration: '09:44',
              description: 'Investigation into O-ring blow-by engineering warnings, managerial pressure, and ethical whistleblowing.'
            }
          ];
          initialQuestions = [
            {
              question: 'Under the NSPE Code of Ethics, what is an engineer’s primary obligation when discovering a safety-critical defect?',
              answer: 'Engineers must hold paramount the safety, health, and welfare of the public. If their judgment is overruled, they must notify their employer and, if unaddressed, appropriate regulatory authorities.',
              topic: 'NSPE Fundamental Canons',
              hint: 'Review Fundamental Canon 1.'
            }
          ];
        } else {
          // CPC
          initialVideos = [
            {
              title: 'C Programming Tutorial for Beginners: Full Course',
              url: 'https://www.youtube.com/watch?v=KJgsSFOSQv0',
              searchQuery: 'C Programming Tutorial for Beginners freeCodeCamp',
              channelOrTopic: 'freeCodeCamp.org',
              duration: '3:46:15',
              description: 'Comprehensive beginner-to-advanced curriculum covering variables, pointers, arrays, structs, and memory.'
            },
            {
              title: 'Introduction to Linked Lists & Dynamic Data Structures in C',
              url: 'https://www.youtube.com/watch?v=2ybLDQagr84',
              searchQuery: 'Introduction to Linked List in C Neso Academy',
              channelOrTopic: 'Neso Academy',
              duration: '14:28',
              description: 'Node struct declarations, self-referential structures, pointer manipulation, and dynamic list traversal.'
            }
          ];
          initialQuestions = [
            {
              question: 'What happens when you dereference a freed pointer (dangling pointer) in C?',
              answer: 'It results in Undefined Behavior (UB). The memory page may still contain stale data, be reallocated to another process, or trigger a SIGSEGV segmentation fault.',
              topic: 'Memory Safety',
              hint: 'Think about heap allocator memory ownership after free().'
            }
          ];
        }

        setChatMessages([
          {
            id: 'msg-welcome',
            role: 'assistant',
            content: `Hello! I am your **AI Subject Research & Curriculum Tutor** grounded in **${subjCode} (${subjName})**.\n\nI have real-time Google Search grounding enabled to research academic proofs, verify textbook concepts, recommend actual YouTube tutorials, provide practice problem sets, and generate interactive quizzes. What would you like to explore today?`,
            timestamp: new Date().toISOString(),
            practiceQuestions: initialQuestions,
            recommendedVideos: initialVideos,
            referencedMaterials: [
              `${subjCode} Approved Coursepack & Syllabus`,
              'University Academic Guidelines'
            ],
            quiz: {
              id: `quiz-welcome-${Date.now()}`,
              title: `Introductory Diagnostic: ${subjCode} Fundamentals`,
              topic: subjName,
              createdAt: new Date().toISOString(),
              questions: [
                {
                  id: 'q-w-1',
                  question: `Which fundamental principle is central to ${subjName} (${subjCode})?`,
                  options: [
                    'Adherence to mathematical invariants, physical conservation laws, and rigorous design constraints',
                    'Operating without boundary conditions or safety protocols',
                    'Arbitrary trial and error without verification',
                    'Ignoring environmental and computational efficiency'
                  ],
                  correctIndex: 0,
                  explanation: 'All engineering disciplines enforce strict conservation laws, deterministic invariants, and verified safety constraints.',
                  topic: 'Foundations'
                }
              ]
            }
          }
        ]);
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

  const handleReturnToAdmin = () => {
    if (auditAdmin) {
      handleSwitchUser(auditAdmin.id);
    } else {
      const admin = allUsers.find(u => u.role === 'admin');
      if (admin) handleSwitchUser(admin.id);
    }
  };

  const handleLoginSuccess = (user: User, token: string) => {
    setAuthToken(token);
    setCurrentUser(user);
    if (user.role === 'teacher') {
      setActiveTab('analytics');
    } else if (user.role === 'admin') {
      setActiveTab('overview');
    } else {
      setActiveTab('feed');
    }
    showToast(`Welcome back, ${user.name}! Access granted to ${user.role.toUpperCase()} workspace.`, 'success');
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
    description: 'Ecology, renewable energy systems, climate change modeling, environmental impact assessment (EIA).'
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
  const handleSummarizeNote = async (noteId: string, content: string) => {
    const res = await fetch('/api/ai/notes/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, content })
    });
    if (res.ok) {
      const data = await res.json();
      showToast('AI note synthesis complete!');
      return data;
    }
    throw new Error('Failed to summarize note');
  };

  // 12. AI Generate Flashcards
  const handleGenerateFlashcards = async (noteId: string, content: string): Promise<Flashcard[]> => {
    const res = await fetch('/api/ai/notes/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, content })
    });
    if (res.ok) {
      const data = await res.json();
      showToast(`Generated ${data.flashcards?.length || 0} high-yield flashcards!`);
      return data.flashcards || [];
    }
    throw new Error('Failed to generate flashcards');
  };

  // 13. AI Note-to-Quiz Bridge
  const handleGenerateQuizFromNote = async (noteId: string, content: string, title: string): Promise<GeneratedQuiz> => {
    const res = await fetch('/api/ai/notes/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, content, title })
    });
    if (res.ok) {
      const data = await res.json();
      showToast(`Generated Note-to-Quiz interactive assessment!`);
      return data.quiz;
    }
    throw new Error('Failed to generate quiz');
  };

  // 14. Refresh AI Class Diagnostics
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

  // 15. Send Chat to AI Study Assistant
  const handleSendMessage = async (text: string, mode?: 'general' | 'research' | 'videos' | 'questions' | 'quiz') => {
    const userMsg: StudyChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      mode: mode || 'general'
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/ai/study-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: activeSubject.id,
          message: text,
          mode: mode || 'general',
          history: chatMessages.slice(-6)
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: StudyChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: data.reply || data.response || 'Here is your subject analysis.',
          timestamp: new Date().toISOString(),
          recommendedVideos: data.recommendedVideos,
          practiceQuestions: data.practiceQuestions,
          referencedMaterials: data.sources || data.referencedMaterials,
          groundingSources: data.groundingSources,
          quiz: data.quiz,
          mode: mode || 'general'
        };
        setChatMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        content: `Study Assistant session cleared for **${activeSubject.code}**. Ready for your next research inquiry or quiz assessment!`,
        timestamp: new Date().toISOString()
      }
    ]);
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
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.role === 'admin';
  const isTeacher = currentUser.role === 'teacher';
  const isAuditing = Boolean(auditAdmin && currentUser && currentUser.role !== 'admin');

  return (
    <div className="flex h-screen w-full bg-[#090d16] text-slate-100 font-sans overflow-hidden transition-colors">
      {/* 1. Geometric Balance Dark Sidebar */}
      <aside className={`w-64 bg-slate-950 text-white flex flex-col border-r border-slate-800 shrink-0 z-30 transition-all ${
        mobileMenuOpen ? 'fixed inset-y-0 left-0 shadow-2xl' : 'hidden md:flex'
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
            className="md:hidden text-slate-400 hover:text-white p-1"
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
                <span>Student Roster & Classes</span>
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
                <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Timeline & References</span>
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
                <FileText className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Assignments Hub</span>
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
                <span>Curriculum & Tasks</span>
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
                id="sidebar-tab-assistant"
                onClick={() => { setActiveTab('assistant'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold transition-colors text-left ${
                  activeTab === 'assistant'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0 text-blue-400" />
                <span>AI Study Tutor</span>
              </button>
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

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0 font-mono border border-slate-700">
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16]">
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
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-sm shadow-sm transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Return to Registrar Portal ➔</span>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-4 text-slate-300 hover:bg-slate-800 border-b border-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
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
            />
          </div>
        </div>

        {/* Content Body */}
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#090d16]">
          {/* Top Enrolled Subjects Quick Switcher (for Student & Faculty) */}
          {!isAdmin && subjects.length > 0 && (
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
                  onNavigateToAssistant={() => setActiveTab('assistant')}
                />
              )}

              {activeTab === 'notes' && (
                <SmartNotePlayground
                  activeSubject={activeSubject}
                  notes={notes}
                  onSaveNote={handleSaveNote}
                  onDeleteNote={handleDeleteNote}
                  onSummarizeNote={handleSummarizeNote}
                  onGenerateFlashcards={handleGenerateFlashcards}
                  onGenerateQuizFromNote={handleGenerateQuizFromNote}
                />
              )}

              {activeTab === 'assistant' && (
                <StudyAssistantChat
                  activeSubject={activeSubject}
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isSending={isSendingChat}
                  onClearChat={handleClearChat}
                  onLaunchQuiz={(quiz) => setActiveQuizModal(quiz)}
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
