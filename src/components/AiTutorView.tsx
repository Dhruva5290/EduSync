import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bookmark,
  RotateCcw,
  Play,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Lightbulb,
  FileCheck,
  Zap,
  Loader2,
} from 'lucide-react';
import { ChatMessage, CustomTutorPersona } from '../types';

interface AiTutorViewProps {
  initialTopic?: string;
  customTutors: CustomTutorPersona[];
  onOpenNotes?: () => void;
}

export const AiTutorView: React.FC<AiTutorViewProps> = ({
  initialTopic,
  customTutors,
  onOpenNotes,
}) => {
  const [subject, setSubject] = useState('Physics 11');
  const [chapter, setChapter] = useState(
    'Chapter 3: Laws of Motion & Incline Forces'
  );
  const [method, setMethod] = useState('Socratic Method');
  const [activeTab, setActiveTab] = useState<
    'context' | 'freeform' | 'solver'
  >('context');
  const [inputMessage, setInputMessage] = useState(initialTopic || '');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'tutor',
      text: "Hello Student, What do you want to learn today?\n\nI'm your AI Tutor active in Socratic Method mode. I have your lecture notes and blackboard captures loaded for Physics 11 — Chapter 3: Laws of Motion & Incline Forces.\n\nWhat concept or problem would you like to explore?",
      timestamp: '11:14 PM',
      method: 'Socratic Method',
      videoClip: {
        title: "Newton's Laws & Incline Forces Visualized",
        source: 'EduSync Concept Studio',
        duration: '4:20 min',
      },
    },
    {
      id: 'msg-2',
      sender: 'user',
      text: 'Can you help me understand why the normal force on an inclined plane is N = mg cos(θ) instead of just mg?',
      timestamp: '11:15 PM',
    },
    {
      id: 'msg-3',
      sender: 'tutor',
      text: 'Think about the direction gravity acts compared to the surface of the incline. Gravity acts strictly vertically downward (mg). Since the block can only press directly into the ramp perpendicularly, what component of that downward vector is aligned perpendicular to the incline?',
      timestamp: '11:16 PM',
      method: 'Socratic Method',
      isSocraticPrompt: true,
      suggestions: ['Draw the triangle of forces', 'What happens when θ = 0°?'],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTopic) {
      setInputMessage(initialTopic);
    }
  }, [initialTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const activePersona = customTutors[0]?.name || '';
      const customPrompt = customTutors[0]?.prompt || '';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          subject,
          chapter,
          method,
          persona: activePersona,
          customPrompt,
          history: messages.slice(-4),
        }),
      });

      const data = await res.json();
      const tutorMsg: ChatMessage = {
        id: `tut-${Date.now()}`,
        sender: 'tutor',
        text: data.reply || 'Let us break this down carefully.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        method,
        isSocraticPrompt: method === 'Socratic Method',
        suggestions: ['Show numerical example', 'Check dimensional formula'],
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `tut-err-${Date.now()}`,
        sender: 'tutor',
        text: `Consider the vector resolution along the coordinate frame tilted by angle θ. The gravity vector breaks into:\n- Parallel to ramp: F_parallel = mg sin(θ)\n- Perpendicular to ramp: F_perpendicular = mg cos(θ)\n\nWhat happens to the perpendicular component when θ = 90° (free fall)?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        method,
        isSocraticPrompt: true,
        suggestions: ['Explain with angle of repose', 'What if friction is zero?'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'msg-fresh',
        sender: 'tutor',
        text: `Hello Student! I'm loaded with ${subject} (${chapter}). What question would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        method,
      },
    ]);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1520px] mx-auto w-full">
      {/* Top Filter & Context Selectors */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-4">
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Subject selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#5a4138] uppercase tracking-wider">
                Subject:
              </span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-[#eff4ff] text-xs font-bold text-[#0b1c30] px-3 py-1.5 rounded-full border border-[#dce9ff] outline-none cursor-pointer"
              >
                <option value="Physics 11">⚡ Physics 11</option>
                <option value="Mathematics 11">📐 Mathematics 11</option>
                <option value="Chemistry 11">🧪 Chemistry 11</option>
              </select>
            </div>

            {/* Chapter selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#5a4138] uppercase tracking-wider">
                Chapter:
              </span>
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="bg-[#eff4ff] text-xs font-bold text-[#0b1c30] px-3 py-1.5 rounded-full border border-[#dce9ff] outline-none cursor-pointer max-w-[280px] truncate"
              >
                <option value="Chapter 3: Laws of Motion & Incline Forces">
                  Chapter 3: Laws of Motion & Incline Forces
                </option>
                <option value="Chapter 4: Work, Energy & Power">
                  Chapter 4: Work, Energy & Power
                </option>
                <option value="Chapter 7: Rotational Mechanics">
                  Chapter 7: Rotational Mechanics
                </option>
              </select>
            </div>

            {/* Method selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#5a4138] uppercase tracking-wider">
                Method:
              </span>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="bg-[#eff4ff] text-xs font-bold text-[#a33900] px-3 py-1.5 rounded-full border border-[#dce9ff] outline-none cursor-pointer"
              >
                <option value="Socratic Method">Socratic Method</option>
                <option value="Step-by-Step Derivation">
                  Step-by-Step Derivation
                </option>
                <option value="First Principles">First Principles</option>
                <option value="Exam-Focused Preparation">
                  Exam-Focused Preparation
                </option>
              </select>
            </div>
          </div>

          {/* Active Context Chip */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbce] text-[#7f2b00] text-xs font-bold">
            <span>Context: Physics • Chapter 3</span>
            <button
              onClick={() => {}}
              className="text-[#7f2b00] hover:text-black text-sm ml-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-t border-[#eff4ff] pt-3">
          <button
            onClick={() => setActiveTab('context')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'context'
                ? 'bg-[#eff4ff] text-[#a33900] shadow-2xs border border-[#dce9ff]'
                : 'text-[#5a4138] hover:bg-[#eff4ff]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Context-Aware Tutoring</span>
          </button>
          <button
            onClick={() => setActiveTab('freeform')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'freeform'
                ? 'bg-[#eff4ff] text-[#a33900] shadow-2xs border border-[#dce9ff]'
                : 'text-[#5a4138] hover:bg-[#eff4ff]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Free-Form Questions</span>
          </button>
          <button
            onClick={() => setActiveTab('solver')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'solver'
                ? 'bg-[#eff4ff] text-[#a33900] shadow-2xs border border-[#dce9ff]'
                : 'text-[#5a4138] hover:bg-[#eff4ff]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Step-by-Step Problem Solver</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Chat Workspace (8 cols) + Context Rail (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Chat Area */}
        <div className="xl:col-span-8 bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col justify-between min-h-[640px]">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0051d5] animate-pulse" />
              <span className="font-bold text-xs text-[#0b1c30]">
                AI Tutor ({method})
              </span>
              <span className="text-[11px] text-[#5a4138]">• Active Session</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetChat}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#5a4138] hover:bg-[#eff4ff] hover:text-[#0b1c30]"
                title="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#5a4138] hover:bg-[#eff4ff] hover:text-[#0b1c30]"
                title="Bookmark dialogue"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex flex-col gap-4 py-4 overflow-y-auto flex-1 max-h-[500px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* User Message */}
                {m.sender === 'user' && (
                  <div className="bg-[#a33900] text-white px-5 py-3 rounded-3xl rounded-br-xs max-w-lg shadow-xs text-sm font-medium">
                    <p>{m.text}</p>
                    <span className="text-[10px] text-white/70 block text-right mt-1">
                      {m.timestamp}
                    </span>
                  </div>
                )}

                {/* Tutor Message */}
                {m.sender === 'tutor' && (
                  <div className="flex flex-col gap-3 max-w-2xl">
                    {/* Socratic callout style or normal */}
                    <div
                      className={`p-5 rounded-3xl rounded-tl-xs shadow-2xs border text-sm ${
                        m.isSocraticPrompt
                          ? 'bg-[#eff4ff] border-[#dce9ff] text-[#0b1c30]'
                          : 'bg-[#f8f9ff] border-[#eff4ff] text-[#0b1c30]'
                      }`}
                    >
                      {m.isSocraticPrompt && (
                        <div className="flex items-center gap-1.5 text-[#a33900] font-bold text-xs uppercase tracking-wider mb-2">
                          <Lightbulb className="w-4 h-4" />
                          <span>Socratic Prompt</span>
                        </div>
                      )}
                      <p className="whitespace-pre-line leading-relaxed">
                        {m.text}
                      </p>

                      {/* Video Chip if available */}
                      {m.videoClip && (
                        <div className="mt-3.5 bg-white p-3 rounded-2xl border border-[#dce9ff] flex items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center flex-shrink-0">
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-xs text-[#0b1c30]">
                                {m.videoClip.title}
                              </span>
                              <span className="text-[10px] text-[#5a4138]">
                                {m.videoClip.source} • {m.videoClip.duration}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={onOpenNotes}
                            className="text-[#0051d5] hover:text-[#003ea8] p-1"
                            title="Open clip"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Interactive suggestions pills */}
                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pl-2">
                        {m.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSend(sug)}
                            className="bg-white hover:bg-[#eff4ff] text-[#0051d5] border border-[#dce9ff] px-3.5 py-1 rounded-full text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0051d5] bg-[#eff4ff] px-4 py-2 rounded-full w-fit animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Tutor is reasoning through the derivation...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Row */}
          <div className="pt-2 pb-3 border-t border-[#eff4ff]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a4138] flex-shrink-0">
                Quick Action:
              </span>
              {[
                { label: 'Explain differently', query: 'Can you explain this differently with an analogy?' },
                { label: 'Show example', query: 'Can you walk through a step-by-step numerical example?' },
                { label: 'Go deeper', query: 'Derive the mathematical proof from fundamental vector laws.' },
                { label: 'Simplify this', query: 'Can you simplify this concept into 3 bullet points?' },
              ].map((action, aIdx) => (
                <button
                  key={aIdx}
                  onClick={() => handleSend(action.query)}
                  className="px-3 py-1 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold rounded-full whitespace-nowrap transition-colors border border-[#dce9ff]/50 cursor-pointer"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar & Sync Label */}
          <div className="flex flex-col gap-1.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-[#eff4ff] p-2 rounded-2xl border border-[#dce9ff] focus-within:ring-2 focus-within:ring-[#0051d5]/30 transition-all"
            >
              <input
                type="text"
                value={inputMessage}
                maxLength={500}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask a question about ${subject} (${chapter})...`}
                className="bg-transparent border-none outline-none text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#5a4138] w-full px-2 font-medium"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-[#a33900] hover:bg-[#cc4900] disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer flex-shrink-0"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-[#5a4138] px-1">
              <span>{inputMessage.length}/500 chars</span>
              <span className="flex items-center gap-1 text-[#006947] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006947] animate-ping" />
                ⚡ Live Synced with Classroom Lectures
              </span>
            </div>
          </div>
        </div>

        {/* Right Rail Context (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Active Chapter Formula Reference */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#5a4138]">
                Formula Reference Sheet
              </h3>
              <span className="text-[10px] font-bold text-[#0051d5] bg-[#eff4ff] px-2 py-0.5 rounded-full">
                {subject}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#dce9ff]/50 flex flex-col gap-1">
                <span className="font-bold text-[#0b1c30]">Normal Reaction on Incline</span>
                <code className="text-xs font-mono text-[#a33900] bg-white px-2 py-1 rounded-lg w-fit">
                  N = mg \cos(\theta)
                </code>
              </div>
              <div className="p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#dce9ff]/50 flex flex-col gap-1">
                <span className="font-bold text-[#0b1c30]">Net Acceleration with Friction</span>
                <code className="text-xs font-mono text-[#a33900] bg-white px-2 py-1 rounded-lg w-fit">
                  a = g(\sin\theta - \mu_k \cos\theta)
                </code>
              </div>
              <div className="p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#dce9ff]/50 flex flex-col gap-1">
                <span className="font-bold text-[#0b1c30]">Angle of Repose Condition</span>
                <code className="text-xs font-mono text-[#a33900] bg-white px-2 py-1 rounded-lg w-fit">
                  \tan(\theta) = \mu_s
                </code>
              </div>
            </div>
          </div>

          {/* Blackboard OCR Note */}
          <div className="bg-[#eff4ff]/60 rounded-3xl p-6 border border-[#dce9ff] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#006947]">
                <FileCheck className="w-4 h-4" />
                <span className="font-bold text-xs">Blackboard OCR Note</span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">
                Captured 10:45 AM
              </span>
            </div>
            <p className="italic text-xs text-[#5a4138] leading-relaxed bg-white p-3 rounded-2xl border border-[#dce9ff]/40 shadow-2xs">
              "Prof. Sharma emphasized: Always break weight into mg sin(θ) along the plane and mg cos(θ) perpendicular. Do NOT invert trig ratios!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
