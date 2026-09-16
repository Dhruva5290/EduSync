import React, { useState, useEffect, useRef } from 'react';
import { User, BoardCapture } from '../../types';
import { useStudentContext } from '../../context/StudentContext';
import { recraftNoteForPersona } from '../../lib/personaRecraft';
import { MathRenderer } from '../Common/MathRenderer';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Layers,
  ChevronRight,
  Play,
  RotateCcw,
  Check,
  AlertTriangle,
  ArrowRight,
  X,
  FileDown,
  GraduationCap,
  ExternalLink,
  Target,
  FileText,
  HelpCircle,
  Flame,
  ChevronLeft,
  BookMarked,
  Settings,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentCommandCenterProps {
  currentUser: User;
  onOpenPersonaModal?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  video?: {
    title: string;
    url: string;
    channelName: string;
    thumbnail?: string;
  };
}

export const StudentCommandCenter: React.FC<StudentCommandCenterProps> = ({
  currentUser,
  onOpenPersonaModal
}) => {
  const {
    weakPoints,
    setWeakPoints,
    learningStyle,
    setLearningStyle,
    dashboardData,
    loading,
    refreshDashboardData,
    markAssignmentDone,
    submitLectureFeedback,
    activeFeedback
  } = useStudentContext();

  // Sync learning style from currentUser
  useEffect(() => {
    if (currentUser.learningProfile?.learningStyle) {
      setLearningStyle(currentUser.learningProfile.learningStyle);
    }
  }, [currentUser, setLearningStyle]);

  // Greeting based on time of day
  const greetingTime = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // ==========================================
  // SECTION 1: TODAY'S PERSONALIZED NOTES
  // ==========================================
  const todayLecture = dashboardData?.todayLecture;
  const personalizedNote = React.useMemo(() => {
    if (!todayLecture) return null;
    return recraftNoteForPersona(
      {
        title: todayLecture.title,
        content: todayLecture.rawText,
        generalisedNotes: todayLecture.rawText
      },
      currentUser.learningProfile
    );
  }, [todayLecture, currentUser.learningProfile]);

  const [savingFeedback, setSavingFeedback] = useState(false);

  const handleFeedback = async (type: 'easy' | 'hard') => {
    if (!todayLecture || savingFeedback) return;
    setSavingFeedback(true);
    await submitLectureFeedback(todayLecture.id, type, currentUser.id);
    setSavingFeedback(false);
  };

  const handleDownloadPDF = () => {
    if (!todayLecture || !personalizedNote) return;
    const element = document.createElement('a');
    const file = new Blob(
      [
        `# ${todayLecture.title}\n` +
        `Date: ${todayLecture.date} | Teacher: ${todayLecture.teacherName || 'Faculty'}\n` +
        `Subject: ${todayLecture.subjectName}\n\n` +
        `## 🎯 Personalized Summary\n${personalizedNote.summary}\n\n` +
        `## 📝 Core Class Notes\n${personalizedNote.content}\n\n` +
        `## ⚡ Key Takeaways\n${todayLecture.keyTakeaways.map(k => `- ${k}`).join('\n')}`
      ],
      { type: 'text/markdown;charset=utf-8' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `${todayLecture.title.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // ==========================================
  // SECTION 2: THE MASTERY CHECK (Quiz)
  // ==========================================
  const quiz = dashboardData?.masteryQuiz;
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizEvaluating, setQuizEvaluating] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null);
  const [quizWeakPoints, setQuizWeakPoints] = useState<string[]>([]);
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleQuizSubmit = async () => {
    if (!quiz || Object.keys(selectedAnswers).length === 0 || quizEvaluating) return;
    setQuizEvaluating(true);

    try {
      const res = await fetch(`/api/lectures/${encodeURIComponent(quiz.lectureId)}/quiz-evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          answers: selectedAnswers
        })
      });

      if (res.ok) {
        const data = await res.json();
        setQuizScore({ score: data.score, total: data.total });
        const detectedWeaks = (data.weakConcepts || []).length > 0
          ? data.weakConcepts
          : (quiz.questions || [])
              .filter((q, idx) => selectedAnswers[idx] !== q.correctIndex)
              .map(q => q.conceptTag);

        setQuizWeakPoints(detectedWeaks);
        if (detectedWeaks.length > 0) {
          setWeakPoints(detectedWeaks);
        }

        if (data.score === data.total) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
      } else {
        let correctCount = 0;
        const fallbackWeaks: string[] = [];
        quiz.questions.forEach((q, idx) => {
          if (selectedAnswers[idx] === q.correctIndex) {
            correctCount++;
          } else {
            fallbackWeaks.push(q.conceptTag);
          }
        });
        setQuizScore({ score: correctCount, total: quiz.questions.length });
        setQuizWeakPoints(fallbackWeaks);
        if (fallbackWeaks.length > 0) setWeakPoints(fallbackWeaks);
        if (correctCount === quiz.questions.length) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
      }
    } catch {
      let correctCount = 0;
      const fallbackWeaks: string[] = [];
      quiz.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          correctCount++;
        } else {
          fallbackWeaks.push(q.conceptTag);
        }
      });
      setQuizScore({ score: correctCount, total: quiz.questions.length });
      setQuizWeakPoints(fallbackWeaks);
      if (fallbackWeaks.length > 0) setWeakPoints(fallbackWeaks);
    } finally {
      setQuizSubmitted(true);
      setQuizEvaluating(false);
    }
  };

  const handleRetryIncorrect = () => {
    if (!quiz) return;
    const newAnswers: Record<number, number> = {};
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        newAnswers[idx] = selectedAnswers[idx];
      }
    });
    setSelectedAnswers(newAnswers);
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // ==========================================
  // SECTION 3: CONTEXTUAL AI TUTOR
  // ==========================================
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTutorThinking, setIsTutorThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const primaryWeak = weakPoints[0] || (quizWeakPoints[0] || "Free Body Diagrams on Inclines");
    const initialGreeting: ChatMessage = {
      id: 'init-msg-1',
      sender: 'tutor',
      text: `Hi ${currentUser.name.split(' ')[0]}! I'm your Socratic Study Assistant for **"${todayLecture?.title || 'Physics'}"**.\n\n` +
        (weakPoints.length > 0 
          ? `I noticed you're practicing **${weakPoints.join(', ')}**. What forces do you think act on an object at rest on a ramp?`
          : `What concept would you like to explore today? We can break down the vector components or walk through a real-world model.`),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      video: {
        title: "Free Body Diagrams & Inclined Planes Visualized",
        url: "https://www.youtube.com/watch?v=kKKM8Y-u7ds",
        channelName: "ClassSarthi Concept Studio",
        thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80"
      }
    };
    setMessages([initialGreeting]);
  }, [weakPoints, todayLecture?.title, currentUser.name]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTutorThinking]);

  const parseTutorReply = (text: string): { cleanText: string; video?: { title: string; url: string; channelName: string } } => {
    const resourceMatch = text.match(/\[RESOURCE:\s*(https?:\/\/[^\s\]]+)\s*\|\s*([^\]]+)\]/i);
    if (resourceMatch) {
      const url = resourceMatch[1];
      const title = resourceMatch[2];
      const cleanText = text.replace(resourceMatch[0], '').trim();
      return {
        cleanText,
        video: {
          title,
          url,
          channelName: 'Recommended Video Explanation'
        }
      };
    }
    return { cleanText: text };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTutorThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTutorThinking(true);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            text: m.text
          })),
          context: {
            weakTopics: weakPoints,
            weakestTopicName: weakPoints[0] || (quizWeakPoints[0] || "Newton's Second Law"),
            lastLectureTitle: todayLecture?.title || "Newton's Laws of Motion",
            learningStyle: currentUser.learningProfile?.learningStyle || learningStyle
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawReply = data.reply || data.response || 'Let us explore this step by step.';
        const parsed = parseTutorReply(rawReply);
        
        const tutorMsg: ChatMessage = {
          id: `tut-${Date.now()}`,
          sender: 'tutor',
          text: parsed.cleanText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          video: data.videoRecommendation || parsed.video || (rawReply.includes('youtube.com') ? {
            title: "Concept Walkthrough Video",
            url: "https://www.youtube.com/watch?v=kKKM8Y-u7ds",
            channelName: "Recommended Concept Video"
          } : undefined)
        };
        setMessages(prev => [...prev, tutorMsg]);
      } else {
        throw new Error('API failed');
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `tut-${Date.now()}`,
        sender: 'tutor',
        text: `Regarding **${weakPoints[0] || 'your question'}**: On an incline of angle $\\theta$, remember that gravity breaks down into $mg\\cos\\theta$ perpendicular and $mg\\sin\\theta$ parallel to the plane.\n\n$$F_{\\text{net}} = mg\\sin\\theta - f_k$$\n\nWhat happens to the acceleration if the friction coefficient becomes zero ($\\mu_k = 0$)?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTutorThinking(false);
    }
  };

  // ==========================================
  // SECTION 4: OVERVIEW HUB (Tabs)
  // ==========================================
  const [overviewTab, setOverviewTab] = useState<'todo' | 'upcoming'>('todo');

  // ==========================================
  // SECTION 5: SUBJECT ARCHIVE & SIDE SHEET
  // ==========================================
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedLectureDetail, setSelectedLectureDetail] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenSubjectDrawer = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedLectureDetail(null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedLectureDetail(null);
  };

  const activeSubject = dashboardData?.subjects?.find(s => s.id === selectedSubjectId);

  // Quick stats calculations
  const pendingAssignmentsCount = dashboardData?.todoAssignments.filter(a => a.status !== 'submitted').length || 0;
  const upcomingTestsCount = dashboardData?.upcomingTimeline?.length || 0;

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-800 font-sans selection:bg-blue-500/20 pb-16">
      
      {/* 2.1 HEADER: "Hi [Student Name] 👋" + Settings ⚙️ */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-sm tracking-tight text-base">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {greetingTime}, {currentUser.name.split(' ')[0]} 👋
                </h1>
                <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Physics (Class 11)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Here is your learning summary for today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenPersonaModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
              title="Configure learning persona & settings"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Learning Style:</span>
              <span className="font-bold text-teal-700 capitalize">
                {(currentUser.learningProfile?.learningStyle || 'visual').replace('_', ' ')}
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>
            
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ========================================================================= */}
        {/* 2.1 QUICK STATS BAR (Horizontal cards with key metrics) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0">
              📚
            </div>
            <div>
              <span className="block text-xl font-black text-slate-900 leading-tight">3</span>
              <span className="block text-xs font-medium text-slate-500">Lectures This Week</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-xl shrink-0">
              🎯
            </div>
            <div>
              <span className="block text-xl font-black text-teal-700 leading-tight">85%</span>
              <span className="block text-xs font-medium text-slate-500">Mastery Average</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl shrink-0">
              📝
            </div>
            <div>
              <span className="block text-xl font-black text-amber-700 leading-tight">{pendingAssignmentsCount}</span>
              <span className="block text-xs font-medium text-slate-500">Due Soon Assignments</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-xl shrink-0">
              ⏰
            </div>
            <div>
              <span className="block text-xl font-black text-rose-700 leading-tight">1</span>
              <span className="block text-xs font-medium text-slate-500">Quiz Due Today</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2.1 SECTION: "YOUR LEARNING PATH TODAY" (AI-generated Recommendation) */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-blue-50/90 via-teal-50/50 to-indigo-50/90 rounded-2xl border border-blue-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs mt-0.5">
                🎯
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    AI Recommendation
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Personalized for you</span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                  Recommended: Review Free Body Diagrams & Normal Forces
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  <strong>Why?</strong> You scored 72% on related quiz questions. Mastering vector resolution on inclines will unlock circular dynamics.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href="#section-todays-notes"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Review Lecture
              </a>
              <a
                href="#section-mastery-quiz"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Take Mastery Quiz
              </a>
              <button
                onClick={() => handleSendMessage('Can you explain normal force on an incline in simple terms?')}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Ask Tutor
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: TODAY'S PERSONALIZED NOTES (Top Reading View) */}
        {/* ========================================================================= */}
        <section
          id="section-todays-notes"
          aria-label="Today's Personalized Notes"
          className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 transition-shadow hover:shadow-md"
        >
          {/* Card Header with Title & Export PDF Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    📖 Today's Class: {todayLecture?.title || "Newton's Laws of Motion"}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                    ✓ Live Notes
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {todayLecture?.subjectName || 'Physics 11'} • {todayLecture?.teacherName || 'Dr. Rajesh Kulkarni'} • {todayLecture?.duration || '45 mins'} • 3 Concepts
                </p>
              </div>
            </div>

            {/* Top Right: Export PDF Action */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
                title="Export Personalized Notes as Markdown/PDF"
              >
                <FileDown className="w-4 h-4 text-blue-300" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Reading Card Body */}
          {todayLecture ? (
            <div className="mt-5 space-y-4">
              <div className="bg-[#FBFBFE] rounded-xl border border-slate-100 p-5 text-sm text-slate-700 leading-relaxed max-h-[360px] overflow-y-auto scrollbar-thin">
                <MathRenderer content={personalizedNote?.content || todayLecture.rawText} />
              </div>

              {/* Key Takeaways Container */}
              {todayLecture.keyTakeaways && todayLecture.keyTakeaways.length > 0 && (
                <div className="bg-blue-50/50 rounded-xl border border-blue-100/80 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Key Takeaways
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {todayLecture.keyTakeaways.map((takeaway, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Absolute Bottom: Pill-Shaped Easy/Hard Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs font-medium text-slate-500">
                  How did you find today's class content?
                </span>

                <div className="inline-flex items-center bg-slate-100/80 p-1 rounded-full border border-slate-200/80 text-xs shadow-inner">
                  <button
                    onClick={() => handleFeedback('easy')}
                    disabled={savingFeedback}
                    className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full font-bold transition cursor-pointer ${
                      activeFeedback === 'easy'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>👍 Easy</span>
                  </button>

                  <button
                    onClick={() => handleFeedback('hard')}
                    disabled={savingFeedback}
                    className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full font-bold transition cursor-pointer ${
                      activeFeedback === 'hard'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>👎 Hard</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading today's personalized notes...
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* MIDDLE SECTION: 60% MASTERY CHECK (Left) + 40% CONTEXTUAL AI TUTOR (Right) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ----------------------------------------------------------------------- */}
          {/* 2. THE MASTERY CHECK (Middle Left - 60% Width) */}
          {/* ----------------------------------------------------------------------- */}
          <section
            id="section-mastery-quiz"
            aria-label="The Mastery Check"
            className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                      🧠 Quick Mastery Check
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {quiz ? `${quiz.questions.length} Adaptive Questions on Today's Concepts` : 'Concept Mastery Check'}
                    </p>
                  </div>
                </div>

                {quizSubmitted && quizScore && (
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                    quizScore.score / quizScore.total >= 0.7
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {Math.round((quizScore.score / quizScore.total) * 100)}% Mastery
                  </span>
                )}
              </div>

              {/* Quiz Body: Questions List OR Post-Submission State */}
              {quiz ? (
                <div>
                  {!quizSubmitted ? (
                    <div className="space-y-5">
                      {quiz.questions.map((q, qIndex) => {
                        const selectedOpt = selectedAnswers[qIndex];
                        const isHintShown = showHint[qIndex];

                        return (
                          <div
                            key={q.id || qIndex}
                            className="bg-slate-50/70 rounded-xl border border-slate-200/70 p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                                  {qIndex + 1}
                                </span>
                                <div>
                                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                                    {q.question}
                                  </p>
                                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                                    Topic: {q.conceptTag}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => setShowHint(prev => ({ ...prev, [qIndex]: !prev[qIndex] }))}
                                className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>Hint</span>
                              </button>
                            </div>

                            {/* Hint callout if toggled */}
                            {isHintShown && (
                              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 animate-in fade-in duration-150">
                                💡 <strong>Hint:</strong> Remember to resolve forces parallel ($mg\sin\theta$) and perpendicular ($mg\cos\theta$) to the incline.
                              </div>
                            )}

                            {/* Multiple Choice Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt, optIndex) => {
                                const isSelected = selectedOpt === optIndex;
                                return (
                                  <button
                                    key={optIndex}
                                    onClick={() => handleSelectAnswer(qIndex, optIndex)}
                                    className={`p-3 rounded-xl text-xs font-medium text-left border transition flex items-center justify-between cursor-pointer ${
                                      isSelected
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="truncate">{opt}</span>
                                    <span className={`text-[10px] font-bold font-mono ml-2 px-1.5 py-0.5 rounded ${
                                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                      {String.fromCharCode(65 + optIndex)}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Submit Action */}
                      <div className="pt-2">
                        <button
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(selectedAnswers).length < quiz.questions.length || quizEvaluating}
                          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {quizEvaluating ? (
                            <span>Evaluating Mastery...</span>
                          ) : (
                            <>
                              <span>Submit Mastery Check</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* POST-SUBMISSION STATE (Clean Results View) */
                    <div className="space-y-6 py-2">
                      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 text-center space-y-3">
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          ✅ Correct: {quizScore?.score}/{quizScore?.total}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {quizScore?.score === quizScore?.total
                            ? 'Outstanding work! You have complete conceptual clarity on this lecture.'
                            : 'Review your detected weak points below and consult your AI Tutor.'}
                        </p>

                        {/* Prominent Warning-Colored Weak Point Pills */}
                        {quizWeakPoints.length > 0 ? (
                          <div className="pt-2">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                              Identified Concept Gaps
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              {quizWeakPoints.map((topic, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-2xs"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>❌ Weak Point: {topic}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>All Concept Tests Passed!</span>
                          </div>
                        )}
                      </div>

                      {/* Question Breakdown with Explanations */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Review Answers & Explanations
                        </h4>
                        {quiz.questions.map((q, idx) => {
                          const isCorrect = selectedAnswers[idx] === q.correctIndex;
                          return (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                                isCorrect
                                  ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-900'
                                  : 'bg-rose-50/40 border-rose-200/80 text-rose-900'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span>Q{idx + 1}: {q.question}</span>
                                <span>{isCorrect ? '✅ Correct' : '❌ Incorrect'}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed pt-0.5">
                                <strong>Explanation:</strong> {q.explanation}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Retry Incorrect Button */}
                      <div className="pt-2">
                        <button
                          onClick={handleRetryIncorrect}
                          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Retry Incorrect Questions</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Loading mastery check quiz...
                </div>
              )}
            </div>
          </section>

          {/* ----------------------------------------------------------------------- */}
          {/* 3. CONTEXTUAL AI TUTOR (Middle Right - 40% Width - Sticky) */}
          {/* ----------------------------------------------------------------------- */}
          <section
            aria-label="Contextual AI Tutor"
            className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col h-[620px] sticky top-20"
          >
            {/* Header */}
            <div className="pb-3 mb-2 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs text-base font-bold">
                  💡
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Socratic AI Tutor
                    </h2>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Guidance tuned to your learning style
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                {(currentUser.learningProfile?.learningStyle || 'visual').replace('_', ' ')}
              </span>
            </div>

            {/* Dynamic Alert State Banner */}
            {weakPoints.length > 0 && (
              <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 shrink-0 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-snug">
                  <strong>Focus Area:</strong> I see you struggled with <strong>{weakPoints.join(', ')}</strong>. Ask me anything to clear it up!
                </div>
              </div>
            )}

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin text-xs">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'tutor' && (
                    <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-black text-[10px] mt-0.5">
                      AI
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-teal-50/50 border border-teal-200/80 text-slate-800'
                  }`}>
                    <MathRenderer content={m.text} />

                    {/* RESOURCE CARD: Video Thumbnail Card in Chat Flow */}
                    {m.video && (
                      <a
                        href={m.video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2.5 block p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-500 shadow-2xs hover:shadow-xs transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Play className="w-4 h-4 fill-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 block">
                              Recommended Video
                            </span>
                            <p className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600 truncate">
                              {m.video.title}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {m.video.channelName}
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                        </div>
                      </a>
                    )}

                    <span className="block text-[9px] text-slate-400 mt-1 text-right font-mono">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isTutorThinking && (
                <div className="flex items-center gap-2 text-slate-400 pl-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce delay-200"></div>
                  <span className="text-[11px]">Tutor thinking through Socratic guidance...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestion Pills */}
            <div className="pt-2 pb-1.5 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              <button
                onClick={() => handleSendMessage('Can you explain with a real-world visual analogy?')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-medium text-slate-700 transition whitespace-nowrap cursor-pointer"
              >
                💡 Visual Analogy
              </button>
              <button
                onClick={() => handleSendMessage('Derive the formula step-by-step from first principles.')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-medium text-slate-700 transition whitespace-nowrap cursor-pointer"
              >
                📐 Step-by-Step Derivation
              </button>
              <button
                onClick={() => handleSendMessage('Give me 1 practice problem to test my understanding.')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-medium text-slate-700 transition whitespace-nowrap cursor-pointer"
              >
                🎯 Practice Problem
              </button>
            </div>

            {/* Chat Input */}
            <div className="pt-2 border-t border-slate-100 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-slate-100/90 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500/30 transition"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question about today's concepts..."
                  className="flex-1 bg-transparent px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTutorThinking}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </section>

        </div>

        {/* ========================================================================= */}
        {/* 2.1 SECTION: "YOUR WEAK TOPICS" (Pill Row with Drilldown) */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>🎯 Your Concept Mastery Radar</span>
                <span className="text-xs font-normal text-slate-500">(Auto-updated from quizzes)</span>
              </h2>
            </div>
            <button
              onClick={() => handleSendMessage('Give me a diagnostic breakdown of my weakest physics concepts.')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Get Extra Help
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
              🔴 Circular Motion (68%)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
              🟡 Rotational Inertia (76%)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              🟢 Normal Force on Inclines (85%)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              🟢 Newton's Third Law (92%)
            </span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BOTTOM SECTION: OVERVIEW HUB (Bottom Left) + SUBJECT ARCHIVE (Bottom Right) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ----------------------------------------------------------------------- */}
          {/* 4. STUDENT OVERVIEW HUB (Bottom Left - 50% Width) */}
          {/* ----------------------------------------------------------------------- */}
          <section
            aria-label="Student Overview Hub"
            className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7"
          >
            {/* Hub Header & Tabs */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    📋 Assignments Due & Tests
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Weekly actionable priorities
                  </p>
                </div>
              </div>

              {/* Segmented Tab Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setOverviewTab('todo')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    overviewTab === 'todo'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  To-Do ({pendingAssignmentsCount})
                </button>
                <button
                  onClick={() => setOverviewTab('upcoming')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    overviewTab === 'upcoming'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tests ({upcomingTestsCount})
                </button>
              </div>
            </div>

            {/* TAB 1: TO-DO CHECKLIST */}
            {overviewTab === 'todo' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                {(dashboardData?.todoAssignments || []).length > 0 ? (
                  (dashboardData?.todoAssignments || []).map((assignment) => {
                    const isDone = assignment.status === 'submitted';

                    return (
                      <div
                        key={assignment.id}
                        className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-slate-50 border-slate-200/60 opacity-60'
                            : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* Circular Radio Button to Mark as Done */}
                          <button
                            onClick={() => markAssignmentDone(assignment.id, currentUser.id)}
                            disabled={isDone}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 hover:border-blue-600 bg-white'
                            }`}
                            title={isDone ? 'Completed' : 'Mark as Done'}
                          >
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {assignment.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                              <span className="font-semibold text-blue-600">{assignment.subjectName}</span>
                              <span>•</span>
                              <span>{assignment.totalPoints} pts</span>
                            </div>
                          </div>
                        </div>

                        {/* Orange / Due Countdown Badge */}
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                          assignment.dueCountdown.includes('Today') || assignment.dueCountdown.includes('1 day') || assignment.dueCountdown.includes('2 day')
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {assignment.dueCountdown}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-xs text-slate-400">No pending assignments!</p>
                )}
              </div>
            )}

            {/* TAB 2: UPCOMING TESTS (Calendar-Style Minimal List View) */}
            {overviewTab === 'upcoming' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                {(dashboardData?.upcomingTimeline || []).length > 0 ? (
                  (dashboardData?.upcomingTimeline || []).map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4"
                    >
                      {/* Left: Date / Time Column */}
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-center shrink-0">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-700">
                            {item.date.slice(0, 3)}
                          </span>
                          <span className="block text-xs font-black text-blue-900">
                            {item.time || '10:00 AM'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500">{item.subjectName} • {item.date}</p>
                        </div>
                      </div>

                      {/* Right: Days Away Badge */}
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        {item.daysAway === 1 ? 'Tomorrow' : `In ${item.daysAway} days`}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-xs text-slate-400">No upcoming tests scheduled.</p>
                )}
              </div>
            )}
          </section>

          {/* ----------------------------------------------------------------------- */}
          {/* 5. SUBJECT ARCHIVE (Bottom Right - 50% Width) */}
          {/* ----------------------------------------------------------------------- */}
          <section
            aria-label="Subject Archive"
            className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    📚 Subject Library & Archives
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Tap a course to browse past lectures
                  </p>
                </div>
              </div>
            </div>

            {/* Grid of Large, Tappable, Colorful Subject Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(dashboardData?.subjects || []).map((subject, idx) => {
                const colors = [
                  { bg: 'bg-blue-50/70', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-600' },
                  { bg: 'bg-teal-50/70', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-600' },
                  { bg: 'bg-emerald-50/70', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-600' },
                  { bg: 'bg-amber-50/70', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-600' }
                ];
                const theme = colors[idx % colors.length];

                return (
                  <button
                    key={subject.id}
                    onClick={() => handleOpenSubjectDrawer(subject.id)}
                    className={`p-4 rounded-2xl border text-left transition hover:shadow-md cursor-pointer flex flex-col justify-between h-28 ${theme.bg} ${theme.border}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-md ${theme.badge}`}>
                        {subject.code}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {subject.lectures.length} Lectures
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {subject.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {subject.teacherName || 'Faculty'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* SECTION 5 SIDE-SHEET (DRAWER) SLIDING IN FROM RIGHT */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={handleCloseDrawer}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Side Sheet Drawer Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-[#FBFBFE]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                    {activeSubject?.code}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {activeSubject?.name || 'Subject Timeline'}
                  </h3>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selectedLectureDetail ? (
                  /* Lecture Detail Reader */
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <button
                      onClick={() => setSelectedLectureDetail(null)}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to Timeline</span>
                    </button>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {selectedLectureDetail.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Recorded on {selectedLectureDetail.date}
                      </p>
                    </div>

                    {/* Board OCR Visuals */}
                    {selectedLectureDetail.boardCaptures && selectedLectureDetail.boardCaptures.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-700">📸 Board Visuals & OCR</p>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedLectureDetail.boardCaptures.map((b: BoardCapture) => (
                            <div key={b.id} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                              {b.imageUrl && (
                                <img src={b.imageUrl} alt={b.title} className="w-full h-32 object-cover" />
                              )}
                              <div className="p-2 text-[11px] font-semibold text-slate-700">
                                {b.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Note Content */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed max-h-[350px] overflow-y-auto">
                      <MathRenderer content={selectedLectureDetail.rawText || selectedLectureDetail.summary} />
                    </div>
                  </div>
                ) : (
                  /* Past Lectures Timeline */
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Lectures Timeline
                    </p>

                    {activeSubject?.lectures && activeSubject.lectures.length > 0 ? (
                      activeSubject.lectures.map((lec, idx) => (
                        <div
                          key={lec.id || idx}
                          onClick={() => setSelectedLectureDetail(lec)}
                          className="p-3.5 rounded-xl bg-slate-50/70 hover:bg-blue-50/50 border border-slate-200/70 hover:border-blue-200 transition flex items-center justify-between gap-3 cursor-pointer group"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                              {lec.title}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {lec.date} • {lec.boardCaptures?.length || 1} Board Captures
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-8 text-center">
                        No previous lectures archived yet.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
                <button
                  onClick={handleCloseDrawer}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentCommandCenter;
