import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  BookOpen,
  FileQuestion,
  Lightbulb,
  CheckCircle2,
  Copy,
  RefreshCw,
  Zap,
  GraduationCap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'teacher' | 'ai';
  text: string;
  timestamp: string;
  type?: 'lesson_plan' | 'exam_quiz' | 'analogy' | 'remediation' | 'general';
}

const INITIAL_TEACHER_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: `👨‍🏫 Welcome Professor! I am your **ClassSarthi Teacher Agentic AI Co-Pilot**.

I am calibrated for university pedagogy, curriculum planning, and student remediation. Here is how I can assist you today:
- 📋 **45-Minute Lesson Plan Generator**: Create structured lecture timelines with hooks, board derivations, and exit polls.
- 🎯 **Exam Question & Rubric Builder**: Generate challenging conceptual MCQs, numerical problems, and marking rubrics.
- 💡 **Intuitive Analogy Engine**: Construct real-world metaphors to dissolve recurring student misconceptions.
- 🛡️ **Debarred Student Recovery Track**: Generate tailored 3-week revision roadmaps for students with < 60% attendance.

You can speak to me using the **Microphone** button or choose any quick prompt below!`,
    timestamp: 'Just now',
    type: 'general'
  }
];

export const TeacherAgenticAIView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_TEACHER_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Web Speech API Voice Recognition (STT)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Text-to-Speech (TTS)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*#_`>]/g, '').slice(0, 450);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (customText?: string) => {
    const promptToSend = customText || inputPrompt;
    if (!promptToSend.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'teacher',
      text: promptToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputPrompt('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/teacher-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptToSend.trim(),
          language: selectedLanguage,
          history: messages.slice(-6).map(m => ({
            role: m.sender === 'teacher' ? 'user' : 'model',
            content: m.text
          }))
        })
      });

      let aiReply = '';
      if (response.ok) {
        const data = await response.json();
        aiReply = data.reply || data.text || '';
      }

      if (!aiReply) {
        throw new Error('Empty response from teacher AI endpoint');
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn('Teacher AI endpoint call failed, applying pedagogical fallback:', err);
      // Fallback generator for resilient offline operation
      const lower = promptToSend.toLowerCase();
      let fallbackText = '';

      if (lower.includes('lesson plan') || lower.includes('45 min')) {
        fallbackText = `### 📋 45-Minute University Lesson Plan: Atmospheric Thermal Inversion & Dispersion\n\n**Course:** ES-101 | **Target Level:** B.Tech 1st Year | **Pedagogical Strategy:** Problem-Based Active Learning\n\n---\n\n#### 1. Hook & Provocative Question (00:00 – 05:00 min)\n- **Visual Display:** Show side-by-side photos of New Delhi clear autumn morning vs. winter smog blanket at 8:00 AM.\n- **Inquiry Prompt:** *"Why do exhaust plumes in December flatten out horizontally like a tabletop instead of rising straight up?"*\n\n#### 2. Core Physics & Theoretical Derivation (05:00 – 20:00 min)\n- **Concept:** Environmental Lapse Rate ($\\\\Gamma_{env}$) vs. Dry Adiabatic Lapse Rate ($\\\\Gamma_d \\\\approx 9.8^\\\\circ\\\\text{C/km}$).\n- **Blackboard Derivation:**\n  $$\\\\frac{dT}{dz} > 0 \\\\implies \\\\text{Thermal Inversion (Static Stability Trap)}$$\n- **Key Insight:** Air parcel displaced upwards becomes cooler and denser than surroundings, forcing it back down.\n\n#### 3. Real-World Engineering Case (20:00 – 35:00 min)\n- Pasquill-Gifford Gaussian Plume Dispersion Model:\n  $$C(x,y,z) = \\\\frac{Q}{2\\\\pi u \\\\sigma_y \\\\sigma_z} \\\\exp\\\\left(-\\\\frac{y^2}{2\\\\sigma_y^2}\\\\right) \\\\left[ \\\\exp\\\\left(-\\\\frac{(z-H)^2}{2\\\\sigma_z^2}\\\\right) + \\\\exp\\\\left(-\\\\frac{(z+H)^2}{2\\\\sigma_z^2}\\\\right) \\\\right]$$\n\n#### 4. Formative Assessment & Exit Ticket (35:00 – 45:00 min)\n- **1-Minute Poll via ClassSarthi App:** *"If a power plant doubles stack height H during inversion, by what factor does maximum ground concentration drop?"* (Answer: Decreases quadratically by factor of 4).`;
      } else if (lower.includes('quiz') || lower.includes('mcq') || lower.includes('question')) {
        fallbackText = `### 🎯 High-Rigor University Exam Questions & Marking Rubric\n\n#### Question 1 (Conceptual Traps - Thermodynamics & Entropy)\n**Problem:** An inventor claims to have developed a cyclic heat engine operating between $800\\\\,\\\\text{K}$ and $300\\\\,\\\\text{K}$ that absorbs $1200\\\\,\\\\text{kJ}$ of heat and delivers $800\\\\,\\\\text{kJ}$ of net mechanical work while rejecting $400\\\\,\\\\text{kJ}$ of heat.\n\n**Options:**\n- **(A)** Feasible, satisfies both First and Second Laws.\n- **(B)** Violates First Law of Thermodynamics only.\n- **(C)** Satisfies First Law, but violates Second Law (Carnot Limit). *(Correct)*\n- **(D)** Impossible because temperature difference is insufficient.\n\n**Step-by-Step Solution & Grading Rubric (5 Marks):**\n1. **First Law Check ($2\\\\text{ Marks}$):** $Q_{in} = W + Q_{out} \\\\implies 1200\\\\,\\\\text{kJ} = 800\\\\,\\\\text{kJ} + 400\\\\,\\\\text{kJ}$. Satisfied!\n2. **Second Law Carnot Check ($3\\\\text{ Marks}$):**\n   $$\\\\eta_{\\\\text{claimed}} = \\\\frac{W}{Q_{in}} = 66.7\\\\%$$\n   $$\\\\eta_{\\\\text{max, Carnot}} = 1 - \\\\frac{300}{800} = 62.5\\\\%$$\n   Since $\\\\eta_{\\\\text{claimed}} > \\\\eta_{\\\\text{max}}$, the claim violates the Carnot limit.`;
      } else {
        fallbackText = `### 🎓 Faculty Advisory & Pedagogical Recommendations\n\nThank you for your prompt: *"${promptToSend}"*\n\nHere is an actionable pedagogical breakdown for your engineering lecture:\n1. **Class Preparedness:** Ensure students have reviewed prerequisite foundational derivations before class.\n2. **Active Participation:** Embed a 2-minute turn-and-talk discussion midway through the theoretical proof.\n3. **Targeted Remediation:** For students with attendance $< 75\\\\%$, dispatch the 1-page summary note directly to their ClassSarthi profile.`;
      }

      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Teacher Agentic AI Assistant</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Pedagogy Co-Pilot
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Generates lesson plans, university exam MCQs with rubrics, and high-retention analogies. Supports voice interaction and multilingual outputs.
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
            <Languages className="w-4 h-4 text-cyan-400 pl-1" />
            <button
              onClick={() => setSelectedLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedLanguage === 'en' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLanguage('hi')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedLanguage === 'hi' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setSelectedLanguage('hinglish')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedLanguage === 'hinglish' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hinglish
            </button>
          </div>
        </div>
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => handleSendMessage('Generate 45-minute lesson plan on Atmospheric Thermal Inversion')}
          className="px-3.5 py-2 bg-slate-900/95 hover:bg-slate-800 text-slate-100 hover:text-white border border-slate-750 hover:border-cyan-500/50 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
          <span>45-Min Lesson Plan</span>
        </button>

        <button
          onClick={() => handleSendMessage('Create 2 hard exam MCQs with grading rubric on Second Law Carnot cycles')}
          className="px-3.5 py-2 bg-slate-900/95 hover:bg-slate-800 text-slate-100 hover:text-white border border-slate-750 hover:border-purple-500/50 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <FileQuestion className="w-3.5 h-3.5 text-purple-300" />
          <span>Exam MCQs + Rubric</span>
        </button>

        <button
          onClick={() => handleSendMessage('Give me an intuitive real-world analogy to explain Clausius Inequality to struggling students')}
          className="px-3.5 py-2 bg-slate-900/95 hover:bg-slate-800 text-slate-100 hover:text-white border border-slate-750 hover:border-amber-500/50 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
          <span>Intuitive Teaching Analogy</span>
        </button>

        <button
          onClick={() => handleSendMessage('Draft a 3-week study recovery roadmap for students with attendance less than 60%')}
          className="px-3.5 py-2 bg-slate-900/95 hover:bg-slate-800 text-slate-100 hover:text-white border border-slate-750 hover:border-rose-500/50 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <GraduationCap className="w-3.5 h-3.5 text-rose-300" />
          <span>Debarred Recovery Plan</span>
        </button>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="bg-slate-900/90 border border-slate-750 rounded-2xl p-5 shadow-2xl min-h-[460px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map(msg => {
          const isAI = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative shadow-lg ${
                  isAI
                    ? 'bg-slate-950/95 border border-slate-750 text-slate-100'
                    : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white ml-auto shadow-cyan-500/20'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className={`font-mono text-[10px] font-bold ${isAI ? 'text-cyan-300' : 'text-blue-100'}`}>
                    {isAI ? 'Teacher Agentic AI' : 'Dr. Rajesh (Faculty)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-300 font-mono">{msg.timestamp}</span>

                    {isAI && (
                      <>
                        <button
                          onClick={() => speakText(msg.text)}
                          className="text-slate-300 hover:text-cyan-300 transition-colors p-1 cursor-pointer"
                          title="Read out aloud"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(msg.id, msg.text)}
                          className="text-slate-300 hover:text-white transition-colors p-1 cursor-pointer"
                          title="Copy to clipboard"
                        >
                          {copiedId === msg.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center gap-3 text-cyan-300 text-xs font-mono font-bold animate-pulse p-2">
            <Bot className="w-4 h-4" />
            <span>Teacher AI is formulating lesson plan & pedagogy recommendations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with Mic & Send */}
      <div className="bg-slate-900/95 border border-slate-750 rounded-2xl p-3.5 shadow-2xl flex items-center gap-2.5">
        <button
          onClick={toggleListening}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/30'
              : 'bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700'
          }`}
          title={isListening ? 'Stop Listening' : 'Speak via Microphone'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cyan-400" />}
        </button>

        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask Teacher AI: 'Generate 45-min lesson plan', 'Create exam rubric', or 'Give me an analogy'..."
          className="flex-1 bg-slate-950 border border-slate-700/90 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-medium"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputPrompt.trim() || isGenerating}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-black rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center gap-2"
        >
          <Send className="w-3.5 h-3.5 text-white" />
          <span>Ask AI</span>
        </button>
      </div>
    </div>
  );
};
