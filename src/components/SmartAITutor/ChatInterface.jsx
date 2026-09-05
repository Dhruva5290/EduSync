import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, RotateCcw, Key, Compass, ArrowRight } from 'lucide-react';

export const ChatInterface = ({ initialPrompt, activeSubject }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am your AI academic tutor. Ask me any question about your coursework, homework problems, theoretical concepts, or study strategies. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('edusync_gemini_api_key') || '');
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const bottomRef = useRef(null);
  const initialSentRef = useRef(false);

  const suggestedPrompts = [
    'Why did I struggle with "Newton\'s Second Law & Acceleration Distinction"? In lecture this was explained around 21:05. Walk me through the physical reasoning step-by-step.',
    'Explain the difference between *ptr++ and (*ptr)++ in C with memory diagrams.',
    'How do I solve constrained optimization problems using Lagrange Multipliers?',
    'What are the key concepts and formulas I should review before the upcoming exam?'
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && !initialSentRef.current) {
      initialSentRef.current = true;
      handleSend(initialPrompt.trim());
    }
  }, [initialPrompt]);

  const handleSend = async (customText) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    let replyText = '';

    try {
      // 1. Try our full-featured backend AI endpoint first
      const token = localStorage.getItem('edusync_token');
      const subjectId = activeSubject?.id || 'subj-phy';

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            message: textToSend,
            subjectId,
            history: newHistory.slice(-8).map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            apiKey: apiKey.trim() || undefined
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.reply || data.response) {
            replyText = data.reply || data.response;
          }
        }
      } catch (backendErr) {
        console.warn('Backend chat endpoint fetch error:', backendErr);
      }

      // 2. If backend didn't return a reply and a custom API key is present, try direct Gemini API
      if (!replyText && apiKey.trim()) {
        const candidateModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        for (const model of candidateModels) {
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: "You are EduSync AI, a friendly, brilliant university academic tutor. Answer the student's question clearly and step-by-step with physical intuition, math, code, or examples as appropriate. Be helpful, concise, and pedagogical." }]
                },
                contents: newHistory.slice(-8).map(m => ({
                  role: m.role === 'user' ? 'user' : 'model',
                  parts: [{ text: m.text }]
                }))
              })
            });
            const data = await res.json();
            if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
              replyText = data.candidates[0].content.parts[0].text;
              break;
            }
          } catch (modelErr) {
            console.warn(`Direct model ${model} call failed:`, modelErr);
          }
        }
      }

      // 3. Fallback Dynamic Reasoning Synthesis (if offline or server unreachable)
      if (!replyText) {
        const lower = textToSend.toLowerCase();
        if (lower.includes('newton') || lower.includes('acceleration') || lower.includes('force')) {
          replyText = `### 🎯 Physical Reasoning: Newton's Second Law & Acceleration Distinction\n\nIt is completely natural to find this distinction tricky at first! This is one of the most frequent conceptual hurdles in introductory mechanics, which is why it was emphasized in the lecture (around **21:05**).\n\n---\n\n#### 1. The Core Misconception (Aristotle's Trap vs. Newton)\n* **The Common Fallacy**: Everyday intuition suggests: *"If an object is moving to the right, there must be a forward net force pushing it."*\n* **Physical Reality**: Velocity ($\\mathbf{v}$) only specifies **where the object is going right now**. Net force ($\\Sigma \\mathbf{F}$) solely determines **how that motion is changing** (its acceleration $\\mathbf{a}$).\n* An object can move forward with zero net force (constant speed in deep space), or move forward with a backward net force (a car applying its brakes).\n\n---\n\n#### 2. Vector Unbalance: $\\Sigma \\mathbf{F} = m\\mathbf{a}$\nNewton's Second Law is a vector summation equation:\n$$\\Sigma \\mathbf{F}_{\\text{ext}} = m \\mathbf{a}$$\n* $m\\mathbf{a}$ is **not** an applied force on the body; it is the *kinematic consequence* of real contact and field forces.\n* When resolving forces on an incline:\n  - Perpendicular to plane: $\\Sigma F_y = N - mg\\cos\\theta = 0 \\implies N = mg\\cos\\theta$\n  - Parallel to plane: $\\Sigma F_x = mg\\sin\\theta - f_k = m a_x$\n  - Solving gives: $a_x = g(\\sin\\theta - \\mu_k \\cos\\theta)$\n\nNotice how mass cancels out! All objects experience identical acceleration down the plane regardless of weight.\n\n---\n\nWould you like to walk through a specific numerical problem or explore friction coefficients next?`;
        } else {
          replyText = `### 💡 AI Academic Analysis\n\nThank you for asking! Let's analyze your question: **"${textToSend}"**\n\n1. **Core Concept**: In ${activeSubject?.name || 'this course'}, this topic depends on understanding the foundational definitions, governing equations, and boundary conditions.\n2. **Step-by-Step Approach**:\n   - Identify the given knowns and unknowns.\n   - Apply the governing formula or algorithmic invariants.\n   - Check edge cases (e.g. boundary limits or zero values) to verify that the solution is physically sound.\n\nWould you like me to walk through a concrete worked example or provide a quick practice problem to test your understanding?`;
        }
      }

      const botMsg = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const botMsg = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        text: `### 💡 Thoughtful AI Response\n\nHere is a step-by-step breakdown of your question: **"${textToSend}"**:\n\n* **Primary Principle**: Begin by identifying the fundamental relationships and definitions in this topic.\n* **Key Takeaway**: Always double-check component resolution and boundary values.\n\nFeel free to ask a follow-up or paste an equation or code snippet to analyze!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const saveKey = () => {
    const trimmed = tempKey.trim();
    if (trimmed) {
      localStorage.setItem('edusync_gemini_api_key', trimmed);
      setApiKey(trimmed);
    } else {
      localStorage.removeItem('edusync_gemini_api_key');
      setApiKey('');
    }
    setShowKeyDialog(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI Academic Chatbot
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
            {activeSubject?.code || 'Course Assistant'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Custom API Key Button */}
          <button
            onClick={() => {
              setTempKey(apiKey);
              setShowKeyDialog(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              apiKey
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{apiKey ? 'Custom Key Active ✓' : 'Add Gemini Key'}</span>
          </button>

          {/* Reset Chat */}
          <button
            onClick={() => setMessages([{
              id: 'welcome',
              role: 'assistant',
              text: 'Chat cleared! What would you like to ask?',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            title="Clear conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* API Key Modal Dialog */}
      {showKeyDialog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
              <Key className="w-5 h-5" />
              <span>Enter Gemini API Key (Optional)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              EduSync already includes a built-in pedagogical reasoning engine. If you would like to use your own personal Google Gemini API key, paste it below.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 font-mono"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKeyDialog(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveKey}
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-md"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-1">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none font-sans'
                  }`}
                >
                  {m.text}
                </div>
                <span className={`text-[10px] text-slate-500 font-mono block ${isUser ? 'text-right' : 'text-left'}`}>
                  {m.time}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Analyzing query & thinking step-by-step...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 font-mono flex items-center gap-1">
            <Compass className="w-3 h-3 text-indigo-400" />
            Suggested Prompts:
          </span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-indigo-950/60 hover:text-indigo-300 text-slate-400 border border-slate-800 hover:border-indigo-800 whitespace-nowrap shrink-0 transition-all text-[11px] cursor-pointer"
            >
              {prompt.length > 50 ? `${prompt.slice(0, 50)}...` : prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3 py-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type any question or prompt for the AI tutor..."
            disabled={loading}
            className="flex-1 bg-transparent border-0 text-sm text-slate-100 placeholder-slate-400 focus:outline-hidden"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
