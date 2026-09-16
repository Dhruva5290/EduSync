import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../../types';
import { useStudentContext } from '../../../context/StudentContext';
import { MathRenderer } from '../../Common/MathRenderer';
import {
  Send,
  Play,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  X,
  RotateCcw,
  Bookmark,
  Sparkles,
  HelpCircle,
  ScanLine
} from 'lucide-react';

interface AITutorTabProps {
  currentUser: User;
  initialPrompt?: string;
  initialWeakTopic?: string;
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
  };
}

const TEACHING_METHODS = [
  { id: 'socratic', name: 'Socratic Method', prompt: 'Use pure Socratic dialogue: ask guiding questions rather than giving immediate answers.' },
  { id: 'feynman', name: 'Feynman Technique', prompt: 'Explain using simple intuitive analogies and zero unnecessary jargon.' },
  { id: 'direct', name: 'Alan Parsons (Structured)', prompt: 'Deliver a structured, sequential breakdown with categorized principles.' },
  { id: 'ranker', name: 'Nitin Jain (Ranker Shortcuts)', prompt: 'Focus on high-yield problem solving, boundary checks, and mathematical rigor.' }
];

export const AITutorTab: React.FC<AITutorTabProps> = ({
  currentUser,
  initialPrompt,
  initialWeakTopic
}) => {
  const { weakPoints, dashboardData } = useStudentContext();

  const [selectedSubject, setSelectedSubject] = useState<string>('Physics 11');
  const [selectedChapter, setSelectedChapter] = useState<string>('Chapter 3: Laws of Motion & Incline Forces');
  const [teachingMethod, setTeachingMethod] = useState<string>('socratic');
  const [activeMode, setActiveMode] = useState<'context' | 'freeform' | 'solver'>('context');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const studentFirstName = currentUser.name.split(' ')[0] || 'Student';

    const initialGreeting: ChatMessage = {
      id: 'msg-init',
      sender: 'tutor',
      text: `Hello ${studentFirstName}, What do you want to learn today?\n\n` +
        (initialPrompt 
          ? `You asked: "${initialPrompt}"\n\nLet's explore this concept step-by-step!`
          : `I'm your AI Tutor active in **${TEACHING_METHODS.find(m => m.id === teachingMethod)?.name}** mode. I have your lecture notes and blackboard captures loaded for **${selectedSubject} — ${selectedChapter}**.\n\nWhat concept or problem would you like to explore?`),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      video: {
        title: "Newton's Laws & Incline Forces Visualized",
        url: "https://www.youtube.com/watch?v=kKKM8Y-u7ds",
        channelName: "ClassSarthi Concept Studio"
      }
    };

    setMessages([initialGreeting]);
  }, [initialPrompt, initialWeakTopic, currentUser.name, selectedSubject, selectedChapter, teachingMethod]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputText).trim();
    if (!q || isThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    const methodPrompt = TEACHING_METHODS.find(m => m.id === teachingMethod)?.prompt || '';

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${q}\n\n[Subject: ${selectedSubject} | ${selectedChapter} | Method Directive: ${methodPrompt}]`,
          history: messages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            text: m.text
          })),
          context: {
            subject: selectedSubject,
            chapter: selectedChapter,
            weakTopics: weakPoints,
            lastLectureTitle: dashboardData?.todayLecture?.title,
            learningStyle: currentUser.learningProfile?.learningStyle || 'visual'
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const tutorReply: ChatMessage = {
          id: `tut-${Date.now()}`,
          sender: 'tutor',
          text: data.reply || data.explanation || "Let's examine the physical constraints and forces at play in this scenario.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          video: data.references?.[0] ? {
            title: data.references[0].title || "Concept Video Breakdown",
            url: data.references[0].url || "https://www.youtube.com/watch?v=kKKM8Y-u7ds",
            channelName: "ClassSarthi Studio"
          } : undefined
        };
        setMessages(prev => [...prev, tutorReply]);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `tut-fb-${Date.now()}`,
            sender: 'tutor',
            text: `Think about the direction gravity acts compared to the surface of the incline. Gravity acts strictly vertically downward ($mg$). Since the block can only press directly *into* the ramp perpendicularly, what component of that downward vector is aligned perpendicular to the incline?\n\nWhat equation balances normal force?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 700);
    } finally {
      setIsThinking(false);
    }
  };

  const keyConcepts = [
    'Free Body Diagram Resolution',
    'Incline Plane Normal Force: N = mg cos(θ)',
    'Kinetic vs. Static Friction (μ)',
    'Net Acceleration: a = g(sin θ - μ cos θ)'
  ];

  const commonQuestions = [
    'Why does friction oppose relative motion on an inclined plane?',
    'Derive maximum angle of repose (θ) before sliding occurs.',
    'How does tension distribute in a 2-block pulley incline system?'
  ];

  return (
    <div className="flex flex-col w-full px-6 lg:px-8 py-6 gap-6 max-w-[1520px] mx-auto animate-in fade-in duration-200">
      {/* Top Context Controls Bar */}
      <section className="w-full bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-4 border border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Subject */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-full font-bold text-xs text-[#0b1c30] transition-colors border border-slate-200 outline-none cursor-pointer"
              >
                <option value="Physics 11">⚡ Physics 11</option>
                <option value="Mathematics 11">📐 Mathematics 11</option>
                <option value="Chemistry 11">🧪 Chemistry 11</option>
              </select>
            </div>

            {/* Chapter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chapter:</span>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-full font-bold text-xs text-[#0b1c30] transition-colors border border-slate-200 outline-none cursor-pointer max-w-[260px] truncate"
              >
                <option value="Chapter 3: Laws of Motion & Incline Forces">Chapter 3: Laws of Motion & Incline Forces</option>
                <option value="Chapter 2: Kinematics 1D & 2D">Chapter 2: Kinematics 1D & 2D</option>
                <option value="Chapter 4: Work, Energy & Power">Chapter 4: Work, Energy & Power</option>
              </select>
            </div>

            {/* Method */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Method:</span>
              <select
                value={teachingMethod}
                onChange={(e) => setTeachingMethod(e.target.value)}
                className="bg-orange-50 hover:bg-orange-100 px-3.5 py-1.5 rounded-full font-bold text-xs text-[#c2410c] transition-colors border border-orange-200 outline-none cursor-pointer"
              >
                {TEACHING_METHODS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Context Chip */}
        <div className="flex items-center pt-1">
          <div className="inline-flex items-center gap-1.5 bg-orange-100/70 text-[#7f2b00] px-3 py-1 rounded-full text-xs font-semibold">
            <span>Context: {selectedSubject.split(' ')[0]} • {selectedChapter.split(':')[0]}</span>
            <button
              onClick={() => setActiveMode('freeform')}
              aria-label="Clear active context"
              className="hover:opacity-75 flex items-center justify-center ml-0.5 cursor-pointer"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Mode Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {[
            { id: 'context', icon: '📖', label: 'Context-Aware Tutoring' },
            { id: 'freeform', icon: '💬', label: 'Free-Form Questions' },
            { id: 'solver', icon: '🧮', label: 'Step-by-Step Problem Solver' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as any)}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeMode === tab.id
                  ? 'bg-orange-100 text-[#a33900] shadow-xs border border-orange-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100'
              }`}
              type="button"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Two-Column Tutoring Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Chat Pane (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-3xl p-6 shadow-sm min-h-[640px] border border-slate-100">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0051d5]"></div>
              <span className="text-xs font-bold text-[#0b1c30]">AI Tutor ({TEACHING_METHODS.find(m => m.id === teachingMethod)?.name})</span>
              <span className="text-xs text-slate-400">• Active</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]])}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Clear Chat"
                type="button"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Message Feed */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto py-4 pr-1 scrollbar-thin">
            {messages.map((m) => {
              const isUser = m.sender === 'user';

              return (
                <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#c2410c] text-white rounded-tr-xs shadow-sm font-medium'
                        : 'bg-slate-50 border border-slate-100 text-[#0b1c30] rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none text-[#0b1c30]">
                        <MathRenderer content={m.text} />
                      </div>
                    )}
                  </div>

                  {/* Video Resource Card */}
                  {m.video && !isUser && (
                    <div className="mt-2.5 w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                          <Play className="w-5 h-5 fill-white" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#0b1c30] truncate">{m.video.title}</span>
                          <span className="text-[11px] text-slate-500">{m.video.channelName} • 4:20 min</span>
                        </div>
                      </div>
                      <a
                        href={m.video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#c2410c] transition-colors shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}

            {isThinking && (
              <div className="bg-slate-50 rounded-2xl p-3 text-xs text-slate-600 flex items-center gap-2 w-fit border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-[#c2410c] animate-pulse"></span>
                <span>AI Tutor is reasoning in Socratic mode...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Action Chips Row */}
          <div className="pt-3 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick Action:</span>
            {[
              { label: 'Explain differently', prompt: 'Can you explain this concept in a completely different way?' },
              { label: 'Show example', prompt: 'Show me a concrete worked example with numbers and free body diagrams.' },
              { label: 'Go deeper', prompt: 'Let us go deeper into the mathematical derivation and boundary checks.' },
              { label: 'Simplify this', prompt: 'Can you simplify this so even a beginner can intuitively grasp it?' },
              { label: 'Ask quiz question', prompt: 'Give me a quick concept test question on this topic!' }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.prompt)}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-orange-50 hover:text-[#c2410c] hover:border-orange-200 border border-slate-200/70 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                type="button"
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="pt-2 flex flex-col gap-1.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-[#c2410c]/20"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask a question about ${selectedSubject} (${selectedChapter})...`}
                className="w-full bg-transparent border-none outline-none px-3.5 text-xs sm:text-sm text-[#0b1c30] placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isThinking}
                className="bg-[#c2410c] hover:bg-[#ea580c] disabled:opacity-40 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span>{inputText.length}/500 chars</span>
              <div className="flex items-center gap-1 text-[#c2410c] font-medium">
                <span>⚡ Live Synced with ClassSarthi Classroom Capture</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar / Reference Panels (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Key Concepts Panel */}
          <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-3 border border-slate-100">
            <div className="flex items-center gap-2 text-[#c2410c] font-bold text-xs uppercase tracking-wider">
              <span>📌</span>
              <span>Key Concepts in this Chapter</span>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              {keyConcepts.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(`Can we examine the core derivation for "${c}"?`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-orange-50 hover:text-[#c2410c] text-left transition-colors border border-slate-100 text-xs font-semibold text-slate-800 cursor-pointer"
                  type="button"
                >
                  <span className="truncate">{c}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Common Exam Questions Panel */}
          <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-3 border border-slate-100">
            <div className="flex items-center gap-2 text-[#c2410c] font-bold text-xs uppercase tracking-wider">
              <span>❓</span>
              <span>Common Exam Questions</span>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              {commonQuestions.map((q, i) => (
                <div
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs text-slate-700 font-medium"
                >
                  <span className="text-[#c2410c] font-bold">•</span>
                  <p>{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Classroom Sync Snapshot Summary Widget */}
          <div className="bg-slate-50 rounded-3xl p-6 flex flex-col gap-2 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b1c30]">
                <ScanLine className="w-4 h-4 text-[#006947]" />
                <span>Blackboard OCR Note</span>
              </div>
              <span className="text-[10px] text-slate-400">Captured 10:45 AM</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Prof. Sharma emphasized: Always break weight into mg sin(θ) along the plane and mg cos(θ) perpendicular. Do NOT invert trig ratios!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
