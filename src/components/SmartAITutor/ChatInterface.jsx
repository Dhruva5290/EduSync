import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, RotateCcw, Copy, Check, Terminal, Lightbulb, AlertCircle, BookOpen, CheckCircle2 } from 'lucide-react';

/**
 * Cleans and transforms raw LaTeX math strings into clean, readable Unicode math text
 * e.g. x^{2} -> x², \frac{a}{b} -> (a / b), \sqrt{x} -> √(x), \lim_{x \to 0} -> lim(x → 0)
 */
export function cleanAndFormatMath(text) {
  if (!text) return '';
  let str = text;

  // 0. Recover accidentally unescaped JS control characters and unicode replacement glyphs:
  str = str.replace(/\x0Bec\{([a-zA-Z0-9])\}/g, '$1⃗');
  str = str.replace(/\x0Bec\s*([a-zA-Z0-9])/g, '$1⃗');
  str = str.replace(/[\uFFFD\u25A1\u25AF\u25A0]?ec\{([a-zA-Z0-9])\}/g, '$1⃗');
  str = str.replace(/\x0Crac/g, '\\frac');
  str = str.replace(/[\uFFFD\u25A1\u25AF\u25A0]?rac/g, '\\frac');
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');

  // 1. Remove enclosing $$ ... $$ or $ ... $ delimiters
  str = str.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
  str = str.replace(/\$([^\$\n]+?)\$/g, '$1');

  // 2. Fractions: safe single/nested fraction conversion with infinite loop guard
  let fracIter = 0;
  while (str.includes('\\frac') && fracIter < 5) {
    const prev = str;
    str = str.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1 / $2)');
    if (str === prev) {
      // If braces are nested or mismatched, remove the token and break
      str = str.replace(/\\frac/g, '');
      break;
    }
    fracIter++;
  }

  // 3. Text styling wrappers: \text{...}, \mathbf{...}, \mathrm{...}
  str = str.replace(/\\(?:text|mathbf|mathrm|mathcal|mathit|textbf|textit)\{([^{}]+)\}/g, '$1');

  // 4. Square roots: \sqrt{x} -> √(x)
  str = str.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');

  // 5. Superscripts: convert ^{...} and ^digit to clean Unicode superscripts
  const superscripts = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'T': 'ᵀ', 'H': 'ᴴ', 'C': 'ᶜ'
  };

  str = str.replace(/\^\{([^{}]+)\}/g, (_, exp) => {
    const converted = exp.split('').map(c => superscripts[c] || c).join('');
    return converted === exp ? `^${exp}` : converted;
  });
  str = str.replace(/\^([0-9nix])/g, (_, digit) => superscripts[digit] || `^${digit}`);

  // 6. Subscripts: convert _{...} and _digit to clean Unicode subscripts
  const subscripts = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
    'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
    'v': 'ᵥ', 'x': 'ₓ'
  };

  str = str.replace(/_\{([^{}]+)\}/g, (_, sub) => {
    const converted = sub.split('').map(c => subscripts[c] || c).join('');
    return converted === sub ? `_${sub}` : converted;
  });
  str = str.replace(/_([0-9aehijklmnoprstuvx])/g, (_, digit) => subscripts[digit] || `_${digit}`);

  // 7. Standard mathematical & Greek symbols
  const symbolMap = {
    '\\times': '×',
    '\\cdot': '·',
    '\\div': '÷',
    '\\pm': '±',
    '\\approx': '≈',
    '\\le': '≤',
    '\\leq': '≤',
    '\\ge': '≥',
    '\\geq': '≥',
    '\\neq': '≠',
    '\\equiv': '≡',
    '\\in': '∈',
    '\\notin': '∉',
    '\\subset': '⊂',
    '\\subseteq': '⊆',
    '\\infty': '∞',
    '\\partial': '∂',
    '\\nabla': '∇',
    '\\int': '∫',
    '\\oint': '∮',
    '\\sum': '∑',
    '\\prod': '∏',
    '\\lim': 'lim',
    '\\rightarrow': '→',
    '\\to': '→',
    '\\leftarrow': '←',
    '\\leftrightarrow': '↔',
    '\\Rightarrow': '⇒',
    '\\Leftarrow': '⇐',
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\Gamma': 'Γ',
    '\\delta': 'δ',
    '\\Delta': 'Δ',
    '\\epsilon': 'ε',
    '\\theta': 'θ',
    '\\Theta': 'Θ',
    '\\lambda': 'λ',
    '\\Lambda': 'Λ',
    '\\mu': 'μ',
    '\\pi': 'π',
    '\\Pi': 'Π',
    '\\rho': 'ρ',
    '\\sigma': 'σ',
    '\\Sigma': 'Σ',
    '\\tau': 'τ',
    '\\phi': 'φ',
    '\\Phi': 'Φ',
    '\\psi': 'ψ',
    '\\omega': 'ω',
    '\\Omega': 'Ω',
    '\\eta': 'η',
    '\\cos': 'cos',
    '\\sin': 'sin',
    '\\tan': 'tan',
    '\\circ': '°',
    '\\quad': '  ',
    '\\qquad': '    ',
    '\\left': '',
    '\\right': '',
    '\\{': '{',
    '\\}': '}'
  };

  // Vectors: \vec{F} -> F⃗, \vec F -> F⃗
  str = str.replace(/\\vec\{([a-zA-Z0-9])\}/g, '$1⃗');
  str = str.replace(/\\vec\s+([a-zA-Z0-9])/g, '$1⃗');

  for (const [tex, sym] of Object.entries(symbolMap)) {
    str = str.replaceAll(tex, sym);
  }

  // Remove dangling single backslashes before plain letters
  str = str.replace(/\\([a-zA-Z]+)/g, '$1');

  // Strip dangling unescaped '$' or '$_' artifacts
  str = str.replace(/\$_/g, '_').replace(/\$/g, '');

  return str;
}

/**
 * Parses markdown inline styles (links, code, bold, italics, math)
 */
function renderInlineMarkdown(text) {
  if (!text) return [];
  const cleaned = cleanAndFormatMath(text);
  const tokens = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(cleaned.substring(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      tokens.push(
        <a
          key={`link-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-200 underline font-medium"
        >
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      tokens.push(
        <code
          key={`code-${match.index}`}
          className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs border border-slate-800"
        >
          {match[3]}
        </code>
      );
    } else if (match[4]) {
      tokens.push(
        <strong key={`bold-${match.index}`} className="font-bold text-white">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      tokens.push(
        <em key={`italic-${match.index}`} className="italic text-slate-300">
          {match[5]}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < cleaned.length) {
    tokens.push(cleaned.substring(lastIndex));
  }

  return tokens;
}

/**
 * Renders full structured markdown messages (code blocks, headers, bullet lists, math)
 */
const FormattedMessage = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const blocks = [];
  let inCodeBlock = false;
  let codeBlockLines = [];
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        const fullCode = codeBlockLines.join('\n');
        blocks.push(
          <div key={`code-block-${i}`} className="my-3 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 uppercase font-bold text-indigo-400">
                <Terminal className="w-3.5 h-3.5" /> {codeBlockLang || 'code'}
              </span>
            </div>
            <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
              {fullCode}
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        inCodeBlock = true;
        codeBlockLang = line.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h4 key={`h3-${i}`} className="text-xs font-bold text-indigo-300 uppercase tracking-wide mt-3.5 mb-1.5">
          {renderInlineMarkdown(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={`h2-${i}`} className="text-sm font-bold text-white mt-4 mb-2 border-b border-slate-800/80 pb-1">
          {renderInlineMarkdown(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      blocks.push(
        <h2 key={`h1-${i}`} className="text-base font-bold text-white mt-4.5 mb-2.5">
          {renderInlineMarkdown(line.slice(2))}
        </h2>
      );
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      blocks.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-1 pl-1 text-xs text-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
          <div className="flex-1 leading-relaxed">
            {renderInlineMarkdown(line.slice(2))}
          </div>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      blocks.push(
        <div key={`oli-${i}`} className="flex items-start gap-2 my-1 pl-1 text-xs text-slate-200">
          <span className="text-[11px] font-mono font-bold text-indigo-400 shrink-0">{match ? match[1] + '.' : '•'}</span>
          <div className="flex-1 leading-relaxed">
            {renderInlineMarkdown(match ? match[2] : line)}
          </div>
        </div>
      );
    } else if (line.trim() === '') {
      blocks.push(<div key={`blank-${i}`} className="h-1.5" />);
    } else {
      blocks.push(
        <p key={`p-${i}`} className="text-xs sm:text-sm leading-relaxed text-slate-200 my-1">
          {renderInlineMarkdown(line)}
        </p>
      );
    }
  }

  return <div className="space-y-0.5">{blocks}</div>;
};

export const ChatInterface = ({ onOpenPersonalization, learningProfile, initialPrompt, lectureContext }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: lectureContext
        ? `Hello! 👋 I'm your **EduSync Socratic AI Tutor**.\n\nI'm pre-primed with your current lecture: **${lectureContext.lectureTitle || "Newton's Laws of Motion"}** and your recent quiz performance. Ask me about your quiz errors or any classroom timestamp!`
        : `Hello! 👋 I'm your **EduSync AI Tutor**.\n\nAsk me any question — from code debugging and mathematical derivations to exam concepts and personalized study strategies. What would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const initialPromptSentRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && !initialPromptSentRef.current) {
      initialPromptSentRef.current = true;
      handleSendMessage(initialPrompt.trim());
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend) => {
    const messageText = (textToSend || inputValue).trim();
    if (!messageText || isLoading) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: newHistory.slice(-10),
          lectureContext: lectureContext || window.__edusync_lecture_context
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`);
      }

      const aiMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || 'Sorry, no response was returned by Gemini.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        isError: true,
        text: `⚠️ **Error connecting to Gemini API:**\n\n${err.message || 'Unknown network error'}\n\n*Tip: Ensure your ` + '`GEMINI_API_KEY`' + ` is set in your ` + '`.env`' + ` file.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat cleared! What topic or problem would you like to work on?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleCopyText = (msgId, text) => {
    navigator.clipboard.writeText(cleanAndFormatMath(text));
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    'Explain a complex concept with a simple analogy',
    'Help me debug and optimize code step-by-step',
    'Walk through a step-by-step mathematical derivation',
    'Create an effective active-recall study plan'
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-200 tracking-wide uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Gemini LLM Tutor
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPersonalization && (
            <button
              onClick={onOpenPersonalization}
              className="text-xs text-purple-300 hover:text-white flex items-center gap-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 px-2.5 py-1 rounded transition-colors font-medium cursor-pointer shadow-xs"
              title="Launch Cognitive Tuning Questionnaire"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{learningProfile?.questionnaireCompleted ? 'Tune Persona' : '⚡ Personalize Notes'}</span>
            </button>
          )}

          <button
            onClick={handleClearChat}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded transition-colors font-mono"
            title="Reset conversation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[90%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : msg.isError
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : msg.isError ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-1.5 max-w-full">
                <div
                  className={`p-4 rounded-2xl leading-relaxed shadow-sm text-slate-100 group relative ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : msg.isError
                      ? 'bg-rose-950/40 border border-rose-800/60 rounded-tl-none'
                      : 'bg-slate-950/90 text-slate-200 border border-slate-800/80 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">{msg.text}</div>
                  ) : (
                    <FormattedMessage content={msg.text} />
                  )}

                  {!isUser && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800"
                      title="Copy clean response text"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                <span className={`text-[10px] text-slate-500 font-mono block ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[88%] mr-auto items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Gemini is formulating a response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800/60 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-400" /> Suggestions:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded bg-slate-900 text-slate-300 hover:bg-indigo-950 hover:text-indigo-200 border border-slate-800 hover:border-indigo-800 transition-all shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3 py-2 transition-all shadow-inner"
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemini anything..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-hidden resize-none py-1.5 max-h-28"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg transition-colors shrink-0 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm"
            title="Send Message"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
