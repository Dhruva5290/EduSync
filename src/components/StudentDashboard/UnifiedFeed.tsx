import React, { useState, useEffect, useTransition } from 'react';
import { User, ClassSarthiLecture, BoardCapture, QuizQuestion, GeneratedQuiz } from '../../types';
import { recraftNoteForPersona } from '../../lib/personaRecraft';
import { synthesizeMasteryQuizFromContent } from '../../lib/quizGenerator';
import { useAIContext } from '../../context/AIContext';
import { MasteryQuizModal } from '../LecturePage/MasteryQuizModal';
import { MathRenderer } from '../Common/MathRenderer';
import {
  Sparkles,
  BookOpen,
  Download,
  Play,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  FileText,
  Video,
  Send,
  Bot,
  User as UserIcon,
  ChevronRight,
  Award,
  ExternalLink,
  Layers,
  HelpCircle,
  Film
} from 'lucide-react';

interface UnifiedFeedProps {
  currentUser: User;
  onOpenPersonaModal?: () => void;
}

interface StudentSummaryData {
  name: string;
  studentId: string;
  urgentAssignmentsCount: number;
  overallMasteryPercentage: number;
  weakestTopicName: string;
}

interface WeakTopicItem {
  id: string;
  topic: string;
  score: number;
  masteryScore: number;
  subjectId: string;
  subjectCode: string;
  reason: string;
  remediation: string;
  relatedLectureId: string;
  timestampRef: string;
}

export const UnifiedFeed: React.FC<UnifiedFeedProps> = ({ currentUser, onOpenPersonaModal }) => {
  const { weakTopics: contextWeakTopics, setWeakTopics, setLastLectureTitle, setCurrentLectureId } = useAIContext();

  // Section 1 State: Status Bar
  const [summary, setSummary] = useState<StudentSummaryData>({
    name: currentUser.name || 'Aarav',
    studentId: currentUser.id,
    urgentAssignmentsCount: 2,
    overallMasteryPercentage: 78,
    weakestTopicName: "Newton's Second Law & Acceleration Distinction"
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Section 2 State: Today's Class
  const [recentLecture, setRecentLecture] = useState<ClassSarthiLecture | null>(null);
  const [boardCaptures, setBoardCaptures] = useState<BoardCapture[]>([]);
  const [lectureLoading, setLectureLoading] = useState(true);
  const [showHighlightModal, setShowHighlightModal] = useState(false);

  // Section 3 State: Knowledge Gaps
  const [weakTopics, setLocalWeakTopics] = useState<WeakTopicItem[]>([]);
  const [weakTopicsLoading, setWeakTopicsLoading] = useState(true);
  const [activeQuizTopic, setActiveQuizTopic] = useState<WeakTopicItem | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Section 4 State: Always-on Contextual Socratic Tutor
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'tutor'; text: string; time?: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // 1. Fetch Section 1: GET /api/students/{id}/summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);
        const res = await fetch(`/api/students/${currentUser.id}/summary`);
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.warn('Failed to fetch student summary:', err);
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [currentUser.id]);

  // 2. Fetch Section 2: GET /api/lectures?limit=1 & Board Captures
  useEffect(() => {
    const fetchTodayLecture = async () => {
      try {
        setLectureLoading(true);
        const [lecRes, boardRes] = await Promise.all([
          fetch('/api/lectures?limit=1'),
          fetch('/api/board-captures')
        ]);

        if (lecRes.ok) {
          const lecData = await lecRes.json();
          const target = lecData.lecture || (lecData.lectures && lecData.lectures[0]);
          if (target) {
            setRecentLecture(target);
            setCurrentLectureId(target.id);
            setLastLectureTitle(target.title);
          }
        }

        if (boardRes.ok) {
          const boardData = await boardRes.json();
          if (Array.isArray(boardData.captures)) {
            setBoardCaptures(boardData.captures.slice(0, 2));
          }
        }
      } catch (err) {
        console.warn('Failed to fetch today lecture context:', err);
      } finally {
        setLectureLoading(false);
      }
    };
    fetchTodayLecture();
  }, []);

  // 3. Fetch Section 3: GET /api/students/{id}/weak-topics
  useEffect(() => {
    const fetchWeakTopics = async () => {
      try {
        setWeakTopicsLoading(true);
        const res = await fetch(`/api/students/${currentUser.id}/weak-topics`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.weakTopics)) {
            setLocalWeakTopics(data.weakTopics);
            setWeakTopics(data.weakTopics.map((t: any) => ({
              topic: t.topic,
              score: t.score,
              reason: t.reason,
              subjectCode: t.subjectCode
            })));
          }
        }
      } catch (err) {
        console.warn('Failed to fetch weak topics:', err);
      } finally {
        setWeakTopicsLoading(false);
      }
    };
    fetchWeakTopics();
  }, [currentUser.id]);

  // 4. Initialize Section 4: Auto-seed Socratic Tutor on Feed Load
  useEffect(() => {
    const initTutor = async () => {
      const weakest = summary.weakestTopicName || "Newton's Second Law & Acceleration Distinction";
      const lecTitle = recentLecture?.title || "Newton's Laws of Motion & Free Body Diagrams";

      const seedGreeting = `I see you struggled with **${weakest}** in your last quiz. Let's look at the board from today's class on *${lecTitle}* to fix it.\n\nTo start: When a block accelerates down an inclined surface, why does the normal contact force equal $mg\\cos\\theta$ rather than the full gravitational weight $mg$?`;

      setChatMessages([
        {
          sender: 'tutor',
          text: seedGreeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    };

    if (!summaryLoading && !lectureLoading) {
      initTutor();
    }
  }, [summary.weakestTopicName, recentLecture?.title, summaryLoading, lectureLoading]);

  // Handler: Download Smart Notes (reusing personaRecraft.ts)
  const handleDownloadSmartNotes = () => {
    const baseTitle = recentLecture?.title || 'Lecture Smart Notes';
    const baseContent = recentLecture?.smartNotesMarkdown || `# ${baseTitle}\n\n## Core Concepts\n- Conservation of momentum and Newton's laws.\n- Normal force decomposition on inclined planes: $N = mg\\cos\\theta$.\n- Static vs Kinetic friction boundary thresholds.`;

    const recrafted = recraftNoteForPersona(
      {
        title: baseTitle,
        content: baseContent,
        subjectId: recentLecture?.subjectId || 'subj-phy'
      },
      currentUser.learningProfile
    );

    const blob = new Blob([recrafted.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Personalized_Notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handler: Socratic Tutor Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userText = chatInput.trim();
    setChatInput('');
    const userMsg = {
      sender: 'user' as const,
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    const isCasual = /^(hi|hello|hey|greetings|howdy|sup|good\s*(morning|afternoon|evening)|how\s*are\s*you|who\s*are\s*you|what\s*can\s*you\s*do|tell\s*me\s*about\s*yourself|what'?s\s*up|yo)\b/i.test(userText.trim());

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          isCasual,
          history: chatMessages.map(m => ({
            sender: m.sender,
            content: m.text
          })),
          context: isCasual ? {} : {
            weakTopics,
            weakestTopicName: summary.weakestTopicName,
            currentLectureId: recentLecture?.id || 'lec-phy-101',
            lastLectureTitle: recentLecture?.title || "Newton's Laws of Motion & Free Body Diagrams"
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply || data.response || (isCasual ? "Hello! How can I help you today?" : "Let's examine the foundational concept step-by-step.");
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'tutor',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch {
      // Fallback message
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'tutor',
          text: isCasual
            ? "Hello! I'm your AI tutor. How can I help you today?"
            : "I'm having difficulty connecting to the server. Please check your network and try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans antialiased selection:bg-blue-600/30">
      {/* Maximum Apple-Standard Container with Generous Spacing */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        
        {/* =========================================================================
            SECTION 1: THE STATUS BAR (Apple-Style Hero Bar)
            ========================================================================= */}
        <section
          id="unified-feed-status-bar"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/80 p-6 sm:p-9 shadow-2xl backdrop-blur-xl"
        >
          {/* Subtle Ambient Light Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono font-semibold text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ClassSarthi One-Stop Feed</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {getGreeting()}, {summary.name.split(' ')[0]}.
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
                You have <strong className="text-amber-300 font-semibold">{summary.urgentAssignmentsCount} assignments due</strong>. You are at <strong className="text-emerald-400 font-semibold">{summary.overallMasteryPercentage}% mastery</strong>.
              </p>
            </div>

            {/* Quick Metrics Capsule */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-center min-w-[110px] shadow-inner">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Mastery
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {summary.overallMasteryPercentage}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-center min-w-[110px] shadow-inner">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Due Soon
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300">
                  {summary.urgentAssignmentsCount}
                </span>
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SECTION 2: TODAY'S CLASS (Lecture Context)
            ========================================================================= */}
        <section id="unified-feed-todays-class" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-slate-400">
                Today's Class • Lecture Context
              </h2>
            </div>
            {recentLecture?.date && (
              <span className="text-xs font-mono text-slate-500">{recentLecture.date}</span>
            )}
          </div>

          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            {lectureLoading ? (
              <div className="py-12 flex items-center justify-center text-slate-400 space-x-2">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-xs">Loading lecture context & board captures...</span>
              </div>
            ) : (
              <>
                {/* Lecture Title & Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800/80">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {recentLecture?.subjectCode || 'PHY-11'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {recentLecture?.duration || '48 mins'} • Prof. {recentLecture?.teacherName || 'Dr. Rajesh Kulkarni'}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {recentLecture?.title || "Newton's Laws of Motion & Free Body Diagrams"}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {recentLecture?.summary || "Comprehensive breakdown of normal force decomposition, inclined plane dynamics, and tension forces."}
                    </p>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    <button
                      id="btn-download-smart-notes"
                      onClick={handleDownloadSmartNotes}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
                      title="Generate personalized Markdown notes based on your cognitive tuning"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Smart Notes</span>
                    </button>

                    <button
                      id="btn-highlight-reel"
                      onClick={() => setShowHighlightModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5 text-amber-400" />
                      <span>Highlight Reel</span>
                    </button>
                  </div>
                </div>

                {/* Top 2 Board Captures Gallery with OCR text */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Blackboard Derivations & OCR Captures</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(boardCaptures.length > 0 ? boardCaptures : [
                      {
                        id: 'bc-1',
                        title: 'Inclined Plane Force Decomposition',
                        timestamp: '21:05',
                        ocrText: 'N = mg cos(θ)\nF_net = mg sin(θ) - f_k = m a',
                        ocrDerivationLatex: 'N = mg\\cos\\theta \\quad \\text{and} \\quad \\sum F_x = mg\\sin\\theta - f_k = ma',
                        imageUrl: '/board_captures/fbd_incline.png'
                      },
                      {
                        id: 'bc-2',
                        title: 'Connected Pulley & Tension Invariant',
                        timestamp: '34:20',
                        ocrText: 'T - m1 g = m1 a\nm2 g - T = m2 a => a = g(m2-m1)/(m1+m2)',
                        ocrDerivationLatex: 'a = g\\left(\\frac{m_2 - m_1}{m_1 + m_2}\\right)',
                        imageUrl: '/board_captures/pulley_system.png'
                      }
                    ]).map((cap, idx) => (
                      <div
                        key={cap.id || idx}
                        className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3 hover:border-slate-700 transition-all group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                            {cap.title}
                          </span>
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-900 text-cyan-400 border border-slate-800">
                            {cap.timestamp}
                          </span>
                        </div>

                        {/* OCR Derivation Box */}
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 font-mono text-xs text-blue-200">
                          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">OCR Formulated Derivation</p>
                          <MathRenderer math={cap.ocrDerivationLatex || cap.ocrText} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>


        {/* =========================================================================
            SECTION 3: YOUR KNOWLEDGE GAPS (The Diagnostic)
            ========================================================================= */}
        <section id="unified-feed-knowledge-gaps" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-slate-400">
                Your Knowledge Gaps • The Diagnostic
              </h2>
            </div>
            <span className="text-xs font-mono text-rose-400">Targeted Remediation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(weakTopics.length > 0 ? weakTopics : [
              {
                id: 'gap-1',
                topic: "Newton's Second Law (Force vs Acceleration)",
                score: 62,
                masteryScore: 62,
                subjectId: 'subj-phy',
                subjectCode: 'PHY',
                reason: 'Struggled with distinguishing external force vs acceleration in last quiz.',
                remediation: 'Review lecture board derivation and solve targeted adaptive checkpoint.',
                relatedLectureId: 'lec-phy-101',
                timestampRef: '21:05'
              },
              {
                id: 'gap-2',
                topic: 'Air Resistance & Parabolic Trajectory Distortion',
                score: 58,
                masteryScore: 58,
                subjectId: 'subj-phy',
                subjectCode: 'PHY',
                reason: 'Identified gap in atmospheric drag velocity decomposition.',
                remediation: 'Review lecture board derivation and solve targeted adaptive checkpoint.',
                relatedLectureId: 'lec-phy-101',
                timestampRef: '34:20'
              },
              {
                id: 'gap-3',
                topic: 'VSEPR Molecular Geometry & Lone Pair Repulsions',
                score: 65,
                masteryScore: 65,
                subjectId: 'subj-che',
                subjectCode: 'CHEM',
                reason: 'Confusion between bond pair vs lone pair spatial repulsion angles.',
                remediation: 'Review lecture board derivation and solve targeted adaptive checkpoint.',
                relatedLectureId: 'lec-phy-101',
                timestampRef: '15:40'
              }
            ]).map((gap, idx) => (
              <div
                key={gap.id || idx}
                className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:border-rose-500/50 transition-all shadow-xl group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80">
                      {gap.subjectCode} • {gap.score}% Score
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Ref: {gap.timestampRef || 'Class'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-2">
                    {gap.topic}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {gap.reason}
                  </p>
                </div>

                <button
                  id={`fix-gap-btn-${idx}`}
                  onClick={() => {
                    setActiveQuizTopic(gap);
                    setIsQuizModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-950/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Fix This Now</span>
                </button>
              </div>
            ))}
          </div>
        </section>


        {/* =========================================================================
            SECTION 4: CONTEXTUAL SOCRATIC TUTOR (Always-On)
            ========================================================================= */}
        <section id="unified-feed-socratic-tutor" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-slate-400">
                Contextual Socratic Tutor • Always-On
              </h2>
            </div>
            <span className="text-xs font-mono text-indigo-400">Grounded in Today's Class</span>
          </div>

          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[520px]">
            {/* Tutor Chat Header */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">ClassSarthi Socratic AI Assistant</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Grounded with: {summary.weakestTopicName.slice(0, 32)}...
                  </p>
                </div>
              </div>
              {onOpenPersonaModal && (
                <button
                  onClick={onOpenPersonaModal}
                  className="text-[11px] font-mono font-bold text-indigo-300 hover:text-white px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/80 transition-colors"
                >
                  Tune Persona
                </button>
              )}
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/40">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'tutor' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-xl ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md space-y-2'
                    }`}
                  >
                    <MathRenderer math={msg.text} />
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>Thinking Socratically...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2">
              <input
                id="socratic-tutor-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Reply to the Socratic tutor or ask about today's class derivations..."
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
              />
              <button
                id="socratic-tutor-send-btn"
                type="submit"
                disabled={!chatInput.trim() || isSending}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

      </div>

      {/* Targeted Quiz Modal for Knowledge Gaps ("Fix This Now") */}
      {isQuizModalOpen && activeQuizTopic && (
        <MasteryQuizModal
          isOpen={isQuizModalOpen}
          onClose={() => {
            setIsQuizModalOpen(false);
            setActiveQuizTopic(null);
          }}
          lectureId={activeQuizTopic.relatedLectureId || 'lec-phy-101'}
          lectureTitle={`Fix Knowledge Gap: ${activeQuizTopic.topic}`}
          currentUser={currentUser}
          onOpenTutorWithMistake={(prompt) => {
            setIsQuizModalOpen(false);
            setChatMessages(prev => [
              ...prev,
              {
                sender: 'user',
                text: prompt,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            // Trigger tutor
            fetch('/api/tutor', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: prompt,
                context: {
                  weakTopics: [activeQuizTopic.topic],
                  weakestTopicName: activeQuizTopic.topic
                }
              })
            }).then(r => r.json()).then(d => {
              if (d.reply) {
                setChatMessages(prev => [
                  ...prev,
                  {
                    sender: 'tutor',
                    text: d.reply,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }
            });
          }}
        />
      )}

      {/* Highlight Reel Modal */}
      {showHighlightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Film className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Lecture Highlight Reel</h3>
              </div>
              <button
                onClick={() => setShowHighlightModal(false)}
                className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Key moments indexed from today's lecture on <strong>{recentLecture?.title || "Newton's Laws"}</strong>:
            </p>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-200">05:32 - Newton's 1st Law & Inertia</span>
                <span className="text-cyan-400">Intro</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-200">21:05 - Free Body Diagram on Ramp</span>
                <span className="text-amber-400 font-bold">Key Derivation</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-200">34:20 - Pulley Acceleration Derivation</span>
                <span className="text-emerald-400">Formula</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-200">42:10 - Homework Problem Set Assignment</span>
                <span className="text-indigo-400">Assignment</span>
              </div>
            </div>

            <button
              onClick={() => setShowHighlightModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
