import React, { useState, useRef, useEffect } from 'react';
import {
  Subject,
  StudyChatMessage,
  GeneratedQuiz,
  YouTubeVideoRecommendation,
  PracticeQuestionItem,
  GroundingSourceItem,
  ReferenceResource
} from '../../types';
import {
  Sparkles,
  Send,
  Youtube,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Bot,
  User,
  Lightbulb,
  ExternalLink,
  Loader2,
  PlayCircle,
  Award,
  CheckCircle2,
  Search,
  Globe,
  Clock,
  Compass,
  Copy,
  Check,
  BookMarked,
  Layers,
  FileText,
  Plus
} from 'lucide-react';

interface StudyAssistantChatProps {
  activeSubject: Subject;
  messages: StudyChatMessage[];
  onSendMessage: (text: string, mode?: 'general' | 'research' | 'videos' | 'questions' | 'quiz') => Promise<void>;
  isSending: boolean;
  onClearChat: () => void;
  onLaunchQuiz?: (quiz: GeneratedQuiz) => void;
  onAddPointToNotes?: (content: string, topic?: string) => Promise<void>;
}

/**
 * Parses inline markdown: [links](url), raw URLs (https://...), `code`, **bold**, and *italic*
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];
  const tokens: React.ReactNode[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]+)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      // Markdown link [title](url)
      tokens.push(
        <a
          key={`md-link-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-200 underline font-medium inline-flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/60 px-1.5 py-0.5 rounded-xs border border-blue-800/60 transition-colors mx-0.5"
        >
          <span>{match[1]}</span>
          <ExternalLink className="w-2.5 h-2.5 shrink-0 text-blue-300" />
        </a>
      );
    } else if (match[3]) {
      // Raw URL
      const rawUrl = match[3];
      tokens.push(
        <a
          key={`raw-url-${match.index}`}
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-200 underline font-medium inline-flex items-center gap-1 bg-blue-950/40 hover:bg-blue-900/40 px-1.5 py-0.5 rounded-xs border border-blue-800/50 transition-colors mx-0.5"
        >
          <span className="truncate max-w-[200px]">{rawUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
          <ExternalLink className="w-2.5 h-2.5 shrink-0 text-blue-300" />
        </a>
      );
    } else if (match[4]) {
      // Inline code
      tokens.push(
        <code
          key={`code-${match.index}`}
          className="font-mono bg-slate-950 px-1.5 py-0.5 rounded-xs text-blue-300 border border-slate-800 text-[11px] mx-0.5"
        >
          {match[4]}
        </code>
      );
    } else if (match[5]) {
      // Bold
      tokens.push(
        <strong key={`bold-${match.index}`} className="font-bold text-slate-100">
          {match[5]}
        </strong>
      );
    } else if (match[6]) {
      // Italic
      tokens.push(
        <em key={`italic-${match.index}`} className="italic text-slate-300">
          {match[6]}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens;
}

/**
 * Formats full AI message content with headers, lists, code blocks, and markdown links
 */
const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        blocks.push(
          <div key={`code-blk-${i}`} className="my-2 p-3 bg-slate-950 rounded-sm border border-slate-800 font-mono text-xs text-blue-200 overflow-x-auto">
            {codeBlockLang && (
              <div className="text-[10px] text-slate-500 uppercase mb-1 font-bold tracking-wider">{codeBlockLang}</div>
            )}
            <pre className="whitespace-pre">{codeBlockLines.join('\n')}</pre>
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
        <h4 key={`h3-${i}`} className="text-xs font-bold text-white mt-3 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
          {renderInlineMarkdown(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={`h2-${i}`} className="text-sm font-bold text-white mt-3.5 mb-1.5 border-b border-slate-800/80 pb-1">
          {renderInlineMarkdown(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      blocks.push(
        <h2 key={`h1-${i}`} className="text-sm font-bold text-white mt-4 mb-2">
          {renderInlineMarkdown(line.slice(2))}
        </h2>
      );
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      blocks.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
          <div className="flex-1 text-xs leading-relaxed text-slate-200">
            {renderInlineMarkdown(line.slice(2))}
          </div>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      blocks.push(
        <div key={`oli-${i}`} className="flex items-start gap-2 my-1 pl-1">
          <span className="text-[11px] font-mono font-bold text-blue-400 shrink-0">{match ? match[1] + '.' : '•'}</span>
          <div className="flex-1 text-xs leading-relaxed text-slate-200">
            {renderInlineMarkdown(match ? match[2] : line)}
          </div>
        </div>
      );
    } else if (line.trim() === '') {
      blocks.push(<div key={`blank-${i}`} className="h-1" />);
    } else {
      blocks.push(
        <p key={`p-${i}`} className="text-xs leading-relaxed text-slate-200 my-0.5">
          {renderInlineMarkdown(line)}
        </p>
      );
    }
  }

  return <div className="space-y-0.5">{blocks}</div>;
};

/**
 * YouTube Video Recommendation Card with resilient thumbnail and verified watch/search actions
 */
const YouTubeVideoCard: React.FC<{
  video: YouTubeVideoRecommendation;
  subjectCode: string;
}> = ({ video, subjectCode }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const query = video.searchQuery || video.title;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  
  // Extract YouTube ID if present
  const videoIdMatch = video.url?.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : (video.url || searchUrl);
  const thumbUrl = videoId && !imgFailed ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(watchUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3 rounded-md bg-slate-950 border border-slate-800 hover:border-red-500/70 transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-red-950/20">
      <div className="space-y-2.5">
        {/* Video Thumbnail or Branded Fallback Poster */}
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block w-full aspect-video rounded-sm overflow-hidden bg-slate-900 border border-slate-800 group/thumb"
        >
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-950/70 via-slate-900 to-slate-950 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-red-600 text-white uppercase flex items-center gap-1">
                  <Youtube className="w-2.5 h-2.5" /> {subjectCode} Tutorial
                </span>
                <span className="text-[10px] font-mono text-slate-300 bg-black/60 px-1.5 py-0.5 rounded-xs">
                  {video.channelOrTopic}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-100 line-clamp-2">{video.title}</p>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex items-center justify-center opacity-90 group-hover/thumb:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover/thumb:scale-110 group-hover/thumb:bg-red-600 transition-all">
              <PlayCircle className="w-6 h-6 fill-white text-red-600" />
            </div>
          </div>

          {video.duration && (
            <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-xs border border-white/10">
              {video.duration}
            </span>
          )}
        </a>

        {/* Video Metadata */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded-xs border border-red-900/40 truncate max-w-[170px]">
              {video.channelOrTopic}
            </span>
            {video.duration && (
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {video.duration}
              </span>
            )}
          </div>
          <h4 className="font-semibold text-xs text-slate-100 group-hover:text-red-300 transition-colors line-clamp-2">
            {video.title}
          </h4>
          {video.description && (
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-1">
              {video.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={handleCopyLink}
          className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded-xs transition-colors shrink-0"
          title="Copy Video Link"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded-xs transition-all"
            title="Search related lectures on YouTube"
          >
            <Search className="w-3 h-3" />
            <span className="hidden sm:inline">Search</span>
          </a>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-red-300 hover:text-white bg-red-950/70 hover:bg-red-600 border border-red-800 hover:border-red-600 px-2.5 py-1 rounded-xs transition-all shadow-xs"
          >
            <PlayCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Watch Tutorial</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export const StudyAssistantChat: React.FC<StudyAssistantChatProps> = ({
  activeSubject,
  messages,
  onSendMessage,
  isSending,
  onClearChat,
  onLaunchQuiz,
  onAddPointToNotes
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<'general' | 'research' | 'videos' | 'questions' | 'quiz'>('general');
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});
  const [addedNoteMsgIds, setAddedNoteMsgIds] = useState<Record<string, boolean>>({});
  const [copiedMsgIds, setCopiedMsgIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleAddMessageToNotes = async (msg: StudyChatMessage) => {
    if (!onAddPointToNotes) return;
    await onAddPointToNotes(msg.content, activeSubject.name);
    setAddedNoteMsgIds(prev => ({ ...prev, [msg.id]: true }));
    setTimeout(() => {
      setAddedNoteMsgIds(prev => ({ ...prev, [msg.id]: false }));
    }, 4000);
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIds(prev => ({ ...prev, [msgId]: true }));
    setTimeout(() => {
      setCopiedMsgIds(prev => ({ ...prev, [msgId]: false }));
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const msg = inputText;
    setInputText('');
    await onSendMessage(msg, selectedMode);
  };

  const handlePromptClick = async (prompt: string, modeOverride?: 'general' | 'research' | 'videos' | 'questions' | 'quiz') => {
    if (isSending) return;
    const mode = modeOverride || selectedMode;
    await onSendMessage(prompt, mode);
  };

  const toggleAnswer = (key: string) => {
    setExpandedAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleHint = (key: string) => {
    setExpandedHints(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Curate dynamic prompt suggestions tailored specifically to the active subject code
  const getSubjectPromptSuggestions = (code: string) => {
    switch (code) {
      case 'ESS':
        return [
          { text: 'EIA Matrix & baseline assessment steps', mode: 'research' as const },
          { text: 'Solar PV cell efficiency & bandgap limits', mode: 'videos' as const },
          { text: 'Practice questions on Biodiversity indices', mode: 'questions' as const },
          { text: 'Interactive Quiz on Renewable Energy Systems', mode: 'quiz' as const }
        ];
      case 'CALC':
        return [
          { text: 'Lagrange Multipliers geometric visual proof', mode: 'videos' as const },
          { text: 'Double integrals in Polar & Cylindrical coords', mode: 'research' as const },
          { text: 'Directional derivatives & Gradient vectors', mode: 'questions' as const },
          { text: 'Interactive Quiz on Multivariable Optimization', mode: 'quiz' as const }
        ];
      case 'EME':
        return [
          { text: 'Otto vs Diesel cycle PV & TS diagrams', mode: 'videos' as const },
          { text: 'Mohr’s Circle plane stress derivation', mode: 'research' as const },
          { text: 'Four-bar linkage Grashof criterion analysis', mode: 'questions' as const },
          { text: 'Interactive Quiz on Thermodynamics & Stress', mode: 'quiz' as const }
        ];
      case 'ENG-ETH':
        return [
          { text: 'Therac-25 software race condition case study', mode: 'research' as const },
          { text: 'Utilitarianism vs Deontology in whistleblowing', mode: 'videos' as const },
          { text: 'NSPE Code of Ethics public safety practice', mode: 'questions' as const },
          { text: 'Interactive Quiz on AI & Engineering Ethics', mode: 'quiz' as const }
        ];
      case 'CPC':
      default:
        return [
          { text: 'Pointer arithmetic vs Array indexing memory layout', mode: 'videos' as const },
          { text: 'Dynamic memory allocation (malloc/free) & leaks', mode: 'research' as const },
          { text: 'Self-referential structs & linked lists in C', mode: 'questions' as const },
          { text: 'Interactive Quiz on C Pointers & Memory', mode: 'quiz' as const }
        ];
    }
  };

  const subjectSuggestions = getSubjectPromptSuggestions(activeSubject.code);

  return (
    <div className="bg-slate-900 rounded-md border border-slate-800 shadow-sm flex flex-col h-[780px] overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-4 bg-slate-950 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm uppercase tracking-tight">
                AI Subject Research & Curriculum Tutor
              </h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" /> Google Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Subject: <strong className="text-slate-200">{activeSubject.code} - {activeSubject.name}</strong> · Faculty: {activeSubject.teacherName || 'Course In-Charge'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearChat}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-sm transition-colors font-mono"
            title="Clear & Restart Assistant"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="bg-slate-950/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-blue-400" /> Mode:
          </span>
          <button
            onClick={() => setSelectedMode('general')}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-all flex items-center gap-1 ${
              selectedMode === 'general'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3" /> All-in-One Tutor
          </button>
          <button
            onClick={() => setSelectedMode('research')}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-all flex items-center gap-1 ${
              selectedMode === 'research'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Search className="w-3 h-3" /> Deep Research
          </button>
          <button
            onClick={() => setSelectedMode('videos')}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-all flex items-center gap-1 ${
              selectedMode === 'videos'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Youtube className="w-3 h-3" /> Video Tutorials
          </button>
          <button
            onClick={() => setSelectedMode('questions')}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-all flex items-center gap-1 ${
              selectedMode === 'questions'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <HelpCircle className="w-3 h-3" /> Practice Questions
          </button>
          <button
            onClick={() => setSelectedMode('quiz')}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-all flex items-center gap-1 ${
              selectedMode === 'quiz'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Award className="w-3 h-3" /> Interactive Quiz
          </button>
        </div>
      </div>

      {/* Suggested Topic Chips */}
      <div className="bg-slate-950/60 p-2.5 border-b border-slate-800 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-400" /> Recommended:
        </span>
        {subjectSuggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handlePromptClick(item.text, item.mode)}
            disabled={isSending}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-sm bg-slate-900 text-slate-300 hover:bg-blue-950 hover:text-blue-200 border border-slate-800 hover:border-blue-700 transition-all font-medium shrink-0 disabled:opacity-50 flex items-center gap-1.5"
          >
            {item.mode === 'videos' && <Youtube className="w-3 h-3 text-red-400" />}
            {item.mode === 'quiz' && <Award className="w-3 h-3 text-purple-400" />}
            {item.mode === 'questions' && <HelpCircle className="w-3 h-3 text-amber-400" />}
            {item.mode === 'research' && <Search className="w-3 h-3 text-emerald-400" />}
            <span>{item.text}</span>
          </button>
        ))}
      </div>

      {/* Message Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-950/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-sm bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`space-y-3 max-w-3xl ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Main Content Bubble */}
              <div
                className={`p-4 rounded-md text-xs leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 space-y-3'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap font-sans leading-relaxed">{msg.content}</div>
                ) : (
                  <MarkdownMessage content={msg.content} />
                )}

                {/* Grounding and Syllabus References Section */}
                {((msg.referencedResources && msg.referencedResources.length > 0) ||
                  (msg.referencedMaterials && msg.referencedMaterials.length > 0) ||
                  (msg.groundingSources && msg.groundingSources.length > 0)) && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2 font-mono">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                      <BookMarked className="w-3 h-3 text-blue-400" />
                      <span>Verified Course Textbooks, References & Grounded Sources:</span>
                    </div>

                    {/* Rich Structured Database Resources / Working PDFs */}
                    {msg.referencedResources && msg.referencedResources.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-1.5">
                        {msg.referencedResources.map((res, i) => {
                          const isPdf = res.url?.toLowerCase().endsWith('.pdf') || res.title?.toLowerCase().includes('pdf');
                          return (
                            <div
                              key={`res-card-${i}`}
                              className="p-3 rounded-sm bg-slate-950 border border-slate-800 hover:border-blue-500/70 transition-all flex flex-col justify-between gap-2 group shadow-xs"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-xs bg-blue-950 text-blue-300 border border-blue-800/60 font-mono">
                                      {res.category}
                                    </span>
                                    {isPdf && (
                                      <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded-xs bg-red-950 text-red-300 border border-red-800/60 font-mono flex items-center gap-0.5">
                                        <FileText className="w-2.5 h-2.5 text-red-400" /> PDF
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-slate-400 truncate max-w-[120px]">{res.author}</span>
                                </div>
                                <h5 className="text-[11px] font-bold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2">
                                  {res.title}
                                </h5>
                                {res.description && (
                                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                    {res.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-800/80">
                                <a
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded-xs transition-colors shadow-xs"
                                >
                                  <FileText className="w-3 h-3 text-white" />
                                  <span>{isPdf ? 'Open Direct PDF' : res.url?.includes('openstax.org') ? 'Read OpenStax' : res.url?.includes('ocw.mit.edu') ? 'Open MIT Course' : 'View Reference'}</span>
                                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                                </a>

                                <a
                                  href={`https://scholar.google.com/scholar?q=${encodeURIComponent(res.title)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded-xs border border-slate-800 transition-colors"
                                  title="Search Academic Papers on Google Scholar"
                                >
                                  <span>Scholar</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Chips for Grounding Sources & General References */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {msg.groundingSources?.map((src, i) => (
                        <a
                          key={`src-${i}`}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] px-2 py-0.5 rounded-sm bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:border-emerald-500 font-medium inline-flex items-center gap-1 transition-colors hover:bg-emerald-900/60"
                        >
                          <Globe className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{src.title.length > 32 ? src.title.slice(0, 32) + '...' : src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}

                      {msg.referencedMaterials?.map((ref, i) => {
                        const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(ref + ' ' + activeSubject.name)}`;
                        return (
                          <a
                            key={`ref-${i}`}
                            href={scholarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] px-2 py-0.5 rounded-sm bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:border-blue-500 font-medium inline-flex items-center gap-1 transition-colors hover:bg-blue-900/60"
                            title={`Search "${ref}" on Google Scholar`}
                          >
                            <FileText className="w-2.5 h-2.5 text-blue-400" />
                            <span>{ref}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 text-blue-400" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* YouTube Video Links Section */}
              {msg.recommendedVideos && msg.recommendedVideos.length > 0 && (
                <div className="p-4 bg-slate-900 border border-red-900/50 rounded-md space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-400 font-bold font-mono text-[11px] uppercase">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span>Curated YouTube Video Tutorials & Masterclasses:</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-red-950/80 px-2 py-0.5 rounded-sm border border-red-900/40">
                      {msg.recommendedVideos.length} Videos Available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {msg.recommendedVideos.map((vid, idx) => (
                      <YouTubeVideoCard
                        key={idx}
                        video={vid}
                        subjectCode={activeSubject.code}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Questions & Solutions Section */}
              {msg.practiceQuestions && msg.practiceQuestions.length > 0 && (
                <div className="p-4 bg-slate-900 border border-blue-900/50 rounded-md space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-300 font-bold font-mono text-[11px] uppercase">
                      <HelpCircle className="w-4 h-4 text-blue-400" />
                      <span>Exam Practice Check Questions & Step-by-Step Solutions:</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-blue-950/80 px-2 py-0.5 rounded-sm border border-blue-900/40">
                      {msg.practiceQuestions.length} Checkpoints
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {msg.practiceQuestions.map((pq, idx) => {
                      const answerKey = `${msg.id}-q-${idx}`;
                      const hintKey = `${msg.id}-hint-${idx}`;
                      const isAnswerOpen = !!expandedAnswers[answerKey];
                      const isHintOpen = !!expandedHints[hintKey];

                      return (
                        <div key={idx} className="bg-slate-950 p-3.5 rounded-md border border-slate-800 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-sm bg-blue-950 border border-blue-800 text-blue-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                                Q{idx + 1}
                              </span>
                              {pq.topic && (
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded-sm border border-slate-800">
                                  {pq.topic}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="font-semibold text-xs text-slate-100 leading-relaxed">
                            {pq.question}
                          </p>

                          <div className="flex items-center gap-3 pt-1">
                            <button
                              onClick={() => toggleAnswer(answerKey)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/50 hover:bg-blue-900/50 border border-blue-800/60 px-2.5 py-1 rounded-sm transition-all"
                            >
                              <span>{isAnswerOpen ? 'Hide Solution' : 'Reveal Step-by-Step Solution'}</span>
                              {isAnswerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {pq.hint && (
                              <button
                                onClick={() => toggleHint(hintKey)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-950/30 border border-amber-900/50 px-2 py-0.8 rounded-sm transition-all"
                              >
                                <Lightbulb className="w-3 h-3 text-amber-400" />
                                <span>{isHintOpen ? 'Hide Hint' : 'View Hint'}</span>
                              </button>
                            )}
                          </div>

                          {isHintOpen && pq.hint && (
                            <div className="p-2.5 bg-amber-950/30 rounded-sm text-amber-200 text-xs border border-amber-900/60 animate-in fade-in flex items-start gap-2">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <p className="leading-relaxed"><strong>Hint:</strong> {pq.hint}</p>
                            </div>
                          )}

                          {isAnswerOpen && (
                            <div className="p-3 bg-slate-900 rounded-sm text-slate-200 text-xs border border-blue-900/60 animate-in fade-in space-y-1 leading-relaxed">
                              <div className="flex items-center gap-1.5 text-blue-300 font-mono text-[10px] font-bold uppercase">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Verified Solution & Derivation:</span>
                              </div>
                              <p className="text-slate-200 whitespace-pre-wrap">{pq.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interactive Quiz Trigger Card */}
              {msg.quiz && msg.quiz.questions && msg.quiz.questions.length > 0 && (
                <div className="p-4 bg-slate-900 border border-purple-900/60 rounded-md space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-300 font-bold font-mono text-[11px] uppercase">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span>Interactive Diagnostic Assessment Ready:</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-sm border border-purple-900/50">
                      {msg.quiz.questions.length} Diagnostic MCQs
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-md border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-white">
                        {msg.quiz.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Topic: {msg.quiz.topic} · Instant Scoring & Explanations
                      </p>
                    </div>

                    <button
                      onClick={() => onLaunchQuiz && onLaunchQuiz(msg.quiz!)}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Start Interactive Quiz</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Message Action Footer */}
              <div className="flex items-center justify-between gap-2 px-1 pt-1">
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddMessageToNotes(msg)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold border transition-all ${
                        addedNoteMsgIds[msg.id]
                          ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                          : 'bg-slate-900 hover:bg-blue-950/80 text-slate-300 hover:text-blue-200 border-slate-800 hover:border-blue-700 shadow-xs'
                      }`}
                      title="Add this AI explanation directly into your subject study notes"
                    >
                      {addedNoteMsgIds[msg.id] ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Added to Notes!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 text-blue-400" />
                          <span>Add to Subject Notes</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="p-1 rounded-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      title="Copy response"
                    >
                      {copiedMsgIds[msg.id] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-sm bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex gap-3 justify-start items-center text-xs text-blue-400">
            <div className="w-8 h-8 rounded-sm bg-blue-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 p-3.5 rounded-md border border-slate-800 text-slate-300 flex items-center gap-2.5 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <div>
                <p className="font-medium text-white">Researching {activeSubject.code} curriculum with Google Search Grounding...</p>
                <p className="text-[11px] text-slate-400 font-mono">Synthesizing topic proofs, real YouTube tutorial links, and quiz assessments</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Research ${activeSubject.code} topics, get YouTube videos, practice questions, or quiz...`}
          className="flex-1 px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-sm focus:outline-none focus:border-blue-500 text-slate-100 placeholder:text-slate-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-sm text-xs font-semibold hover:bg-blue-500 transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask AI Tutor</span>
        </button>
      </form>
    </div>
  );
};
