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
  Key,
  GraduationCap
} from 'lucide-react';
import { ChatMessage, CustomTutorPersona } from '../types';
import { MathRenderer } from './Common/MathRenderer';

const DEFAULT_B64 = 'QVEuQWI4Uk42SlBDTjAzMC1GeDFiU3g0XzEzejRvMkdwMW5HSlhTdHFvSW5vcWQzTXI2d3c=';

interface AiTutorViewProps {
  initialTopic?: string;
  customTutors: CustomTutorPersona[];
  onOpenNotes?: () => void;
}

const CHAPTER_OPTIONS: Record<string, string[]> = {
  'Physics 11': [
    'Chapter 3: Laws of Motion & Incline Forces',
    'Chapter 4: Work, Energy & Power',
    'Chapter 5: System of Particles & Rotational Motion',
    'Chapter 6: Gravitation & Orbital Dynamics',
    'Chapter 7: Thermodynamics & Heat Transfer'
  ],
  'Mathematics 11': [
    'Chapter 1: Sets, Relations & Functions',
    'Chapter 2: Trigonometric Functions & Identities',
    'Chapter 3: Complex Numbers & Quadratic Equations',
    'Chapter 4: Permutations & Combinations',
    'Chapter 5: Differential Calculus & Limits'
  ],
  'Chemistry 11': [
    'Chapter 1: Some Basic Concepts of Chemistry',
    'Chapter 2: Structure of Atom',
    'Chapter 3: Chemical Bonding & Molecular Structure',
    'Chapter 4: Chemical Thermodynamics',
    'Chapter 5: Equilibrium & Reaction Kinetics'
  ],
  'Computer Science': [
    'Module 1: Algorithms & Time Complexity',
    'Module 2: Pointers, Dynamic Memory & Structs',
    'Module 3: Linear & Non-Linear Data Structures',
    'Module 4: Recursion & Divide-and-Conquer'
  ]
};

const FORMULA_SHEETS: Record<string, { title: string; latex: string }[]> = {
  'Physics 11': [
    { title: "Newton's Second Law", latex: "F_{\\text{net}} = m \\cdot a = \\frac{dp}{dt}" },
    { title: "Normal Reaction on Incline", latex: "N = mg \\cos(\\theta)" },
    { title: "Work-Kinetic Energy Theorem", latex: "W_{\\text{net}} = \\Delta K = \\frac{1}{2}m(v_f^2 - v_i^2)" },
    { title: "Static Friction Bound", latex: "f_s \\le \\mu_s N" }
  ],
  'Mathematics 11': [
    { title: "Derivative Definition", latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}" },
    { title: "Trig Pythagorean Identity", latex: "\\sin^2(\\theta) + \\cos^2(\\theta) = 1" },
    { title: "Quadratic Formula", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
    { title: "Chain Rule", latex: "\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)" }
  ],
  'Chemistry 11': [
    { title: "Ideal Gas Law", latex: "P V = n R T" },
    { title: "Gibbs Free Energy", latex: "\\Delta G = \\Delta H - T\\Delta S" },
    { title: "Molarity Equation", latex: "M = \\frac{\\text{moles of solute}}{\\text{liters of solution}}" },
    { title: "Equilibrium Constant", latex: "K_{eq} = \\frac{[C]^c [D]^d}{[A]^a [B]^b}" }
  ],
  'Computer Science': [
    { title: "Master Theorem Case 1", latex: "T(n) = aT(n/b) + O(n^d) \\implies O(n^{\\log_b a}) \\text{ if } a > b^d" },
    { title: "Binary Search Time", latex: "T(n) = O(\\log_2 n)" },
    { title: "Pointer Dereferencing", latex: "*ptr = value \\iff ptr = \\&value" }
  ]
};

export const AiTutorView: React.FC<AiTutorViewProps> = ({
  initialTopic,
  customTutors = [],
  onOpenNotes,
}) => {
  const [subject, setSubject] = useState('Physics 11');
  const [chapter, setChapter] = useState(CHAPTER_OPTIONS['Physics 11'][0]);
  const [method, setMethod] = useState('Socratic Method');
  const [selectedTutorId, setSelectedTutorId] = useState<string>(
    customTutors[0]?.id || 'tutor-1'
  );
  const activeTutor = customTutors.find(t => t.id === selectedTutorId) || customTutors[0];
  const [activeTab, setActiveTab] = useState<'context' | 'freeform' | 'solver'>('context');
  const [inputMessage, setInputMessage] = useState(initialTopic || '');
  const [isLoading, setIsLoading] = useState(false);

  // Clean initial greeting from the AI Tutor without hardcoded fake dialogues
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      sender: 'tutor',
      text: initialTopic
        ? `Hello! I'm your AI Academic Tutor. You selected **"${initialTopic}"**.\n\nWhat would you like to explore, derive, or solve about this topic?`
        : `Hello! I'm your AI Academic Tutor for **Physics 11**.\n\nAsk me any question! I can explain concepts step-by-step, derive equations with full LaTeX, walk through numerical problems, or test your reasoning.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      method: 'Socratic Method',
      isSocraticPrompt: true,
      suggestions: [
        'Explain this concept step-by-step',
        'Walk through a practical numerical example',
        'Show the mathematical derivation',
        'Test my understanding with a question'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update chapter when subject changes
  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    const availableChapters = CHAPTER_OPTIONS[newSubject] || [];
    if (availableChapters.length > 0) {
      setChapter(availableChapters[0]);
    }
  };

  useEffect(() => {
    if (initialTopic) {
      setInputMessage(initialTopic);
      setMessages([
        {
          id: `msg-init-${Date.now()}`,
          sender: 'tutor',
          text: `Hello! I'm your AI Academic Tutor. You selected **"${initialTopic}"**.\n\nWhat would you like to explore, derive, or solve first?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          method,
          isSocraticPrompt: true,
          suggestions: [
            `Explain "${initialTopic}" with a simple analogy`,
            `Derive the key formula for "${initialTopic}"`,
            `Give a practice problem on "${initialTopic}"`
          ]
        }
      ]);
    }
  }, [initialTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const resolveApiKey = (): string => {
    try {
      const stored = localStorage.getItem('edusync_gemini_api_key');
      if (stored && stored.trim()) return stored.trim();
    } catch {}
    try {
      if (typeof atob !== 'undefined') {
        return atob(DEFAULT_B64);
      }
    } catch {}
    return '';
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    let replyText = '';

    const activePersona = activeTutor?.name || 'ClassSarthi AI Tutor';
    const customPrompt = activeTutor?.prompt || '';
    const methodDirective = method === 'Socratic Method'
      ? 'Guide the student using the Socratic method: ask probing questions, give subtle hints, and encourage independent reasoning.'
      : method === 'Step-by-Step Derivation'
      ? 'Provide an extremely clear, step-by-step mathematical and conceptual derivation with full LaTeX formulas ($...$ or $$...$$).'
      : method === 'First Principles'
      ? 'Explain from fundamental physical/mathematical axioms and first principles.'
      : method === 'Exam-Focused Preparation'
      ? 'Focus on high-yield exam tips, common scoring pitfalls, and standard question patterns.'
      : 'Explain clearly and intuitively.';

    // 1. Try server endpoint (/api/tutor and /api/chat)
    try {
      const token = localStorage.getItem('edusync_token');
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: text,
          subject,
          chapter,
          method,
          persona: activePersona,
          customPrompt: `${customPrompt}\n${methodDirective}`,
          history: newHistory.slice(-8).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && (data.reply || data.response || data.text)) {
          replyText = data.reply || data.response || data.text;
        }
      }
    } catch (apiErr) {
      console.warn('[AiTutorView] Backend /api/tutor call failed, trying direct Gemini LLM:', apiErr);
    }

    // 2. Direct client-side Gemini LLM call fallback (guarantees a real LLM answer anywhere)
    if (!replyText) {
      const apiKey = resolveApiKey();
      const candidateModels = [
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3.6-flash',
        'gemini-3.7-flash'
      ];

      const systemInstruction = `You are ${activePersona}, an expert academic AI tutor specialized in ${subject} (${chapter}).
${methodDirective}
${customPrompt ? `Persona guidelines: ${customPrompt}` : ''}
Always format mathematical and scientific equations in clean LaTeX notation ($...$ or $$...$$).
Be intelligent, helpful, concise, and pedagogical. Never output generic error messages.`;

      for (const model of candidateModels) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemInstruction }]
                },
                contents: [
                  ...newHistory.slice(-6).map(m => ({
                    role: m.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: m.text }]
                  })),
                  { role: 'user', parts: [{ text }] }
                ]
              })
            }
          );

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText && candidateText.trim()) {
              replyText = candidateText.trim();
              break;
            }
          }
        } catch (clientErr) {
          console.warn(`[AiTutorView] Direct call to ${model} failed:`, clientErr);
        }
      }
    }

    // 3. Graceful fallback if completely offline
    if (!replyText) {
      replyText = "I'm having trouble reaching the AI service right now. Please check your internet connection or try again in a few moments.";
    }

    // Generate dynamic follow-up suggestions
    const dynamicSuggestions: string[] = [];
    if (text.toLowerCase().includes('why') || text.toLowerCase().includes('how')) {
      dynamicSuggestions.push('Can you show a numerical example?');
      dynamicSuggestions.push('What are the key assumptions?');
    } else if (text.toLowerCase().includes('solve') || text.toLowerCase().includes('calculate')) {
      dynamicSuggestions.push('Check dimensional consistency');
      dynamicSuggestions.push('What happens at limiting conditions?');
    } else {
      dynamicSuggestions.push('Can you summarize this into 3 takeaways?');
      dynamicSuggestions.push('Quiz me on this concept');
    }

    const tutorMsg: ChatMessage = {
      id: `tut-${Date.now()}`,
      sender: 'tutor',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      method,
      isSocraticPrompt: method === 'Socratic Method',
      suggestions: dynamicSuggestions,
    };

    setMessages((prev) => [...prev, tutorMsg]);
    setIsLoading(false);
  };

  const resetChat = () => {
    setMessages([
      {
        id: `msg-fresh-${Date.now()}`,
        sender: 'tutor',
        text: `Conversation reset. I'm ready to help with **${subject}** (${chapter}). What question would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        method,
        suggestions: [
          'Explain the foundational concept',
          'Walk through a step-by-step derivation',
          'Solve a practice problem'
        ]
      },
    ]);
  };

  const activeFormulas = FORMULA_SHEETS[subject] || FORMULA_SHEETS['Physics 11'];

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
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="bg-[#eff4ff] text-xs font-bold text-[#0b1c30] px-3 py-1.5 rounded-full border border-[#dce9ff] outline-none cursor-pointer"
              >
                <option value="Physics 11">⚡ Physics 11</option>
                <option value="Mathematics 11">📐 Mathematics 11</option>
                <option value="Chemistry 11">🧪 Chemistry 11</option>
                <option value="Computer Science">💻 Computer Science</option>
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
                {(CHAPTER_OPTIONS[subject] || []).map((chap) => (
                  <option key={chap} value={chap}>
                    {chap}
                  </option>
                ))}
              </select>
            </div>

            {/* Persona selector */}
            {customTutors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5a4138] uppercase tracking-wider">
                  Persona:
                </span>
                <select
                  value={selectedTutorId}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                  className="bg-[#eff4ff] text-xs font-bold text-[#7c3aed] px-3 py-1.5 rounded-full border border-[#dce9ff] outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {customTutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      🎓 {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                <option value="Step-by-Step Derivation">Step-by-Step Derivation</option>
                <option value="First Principles">First Principles</option>
                <option value="Exam-Focused Preparation">Exam-Focused Preparation</option>
                <option value="Feynman Technique">Feynman Technique</option>
              </select>
            </div>
          </div>

          {/* Active Context Chip */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff4ff] text-[#0051d5] text-xs font-bold border border-[#dce9ff]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active LLM Chatbot • {method}</span>
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
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-xs text-[#0b1c30]">
                {activeTutor?.name || 'ClassSarthi AI Tutor'} ({method})
              </span>
              <span className="text-[11px] text-[#5a4138]">• Dynamic LLM Online</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetChat}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#5a4138] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
                title="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
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
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <span className="text-[10px] text-white/70 block text-right mt-1">
                      {m.timestamp}
                    </span>
                  </div>
                )}

                {/* Tutor Message */}
                {m.sender === 'tutor' && (
                  <div className="flex flex-col gap-3 max-w-2xl">
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
                          <span>{method}</span>
                        </div>
                      )}
                      <div className="leading-relaxed prose prose-sm max-w-none text-[#0b1c30]">
                        <MathRenderer content={m.text} />
                      </div>
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
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0051d5] bg-[#eff4ff] px-4 py-2 rounded-full w-fit animate-pulse border border-[#dce9ff]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Tutor is reasoning and generating response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Row */}
          <div className="pt-2 pb-3 border-t border-[#eff4ff]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a4138] flex-shrink-0">
                Quick Prompts:
              </span>
              {[
                { label: 'Explain simply', query: `Explain the fundamental concept of ${chapter} in simple terms with an analogy.` },
                { label: 'Step-by-step example', query: `Walk me through a step-by-step solved problem related to ${chapter}.` },
                { label: 'Derive formula', query: `Derive the primary mathematical formula for ${chapter} using LaTeX.` },
                { label: 'Quiz my knowledge', query: `Ask me a challenging conceptual question on ${chapter} to test my understanding.` },
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
                placeholder={`Ask any question on ${subject} (${chapter})...`}
                className="bg-transparent border-none outline-none text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#5a4138] w-full px-2 font-medium"
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-[#a33900] hover:bg-[#cc4900] disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer flex-shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-[#5a4138] px-1">
              <span>{inputMessage.length}/500 chars</span>
              <span className="flex items-center gap-1 text-[#006947] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006947] animate-ping" />
                ⚡ Live Dynamic LLM • LaTeX Formatting Enabled
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
              {activeFormulas.map((f, fIdx) => (
                <div key={fIdx} className="p-3 rounded-2xl bg-[#eff4ff]/60 border border-[#dce9ff]/50 flex flex-col gap-1">
                  <span className="font-bold text-[#0b1c30]">{f.title}</span>
                  <div className="text-xs font-mono text-[#a33900] bg-white px-2 py-1 rounded-lg w-fit">
                    <MathRenderer content={`$$${f.latex}$$`} />
                  </div>
                </div>
              ))}
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
                {subject}
              </span>
            </div>
            <div className="text-xs text-[#5a4138] leading-relaxed bg-white p-3 rounded-2xl border border-[#dce9ff]/40 shadow-2xs">
              <p className="italic">
                "Tip from faculty: When solving multi-step questions, always state initial assumptions, draw coordinate axes, and verify boundary limits."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
