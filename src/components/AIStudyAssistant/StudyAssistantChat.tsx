import React, { useState, useRef, useEffect } from 'react';
import {
  Subject,
  StudyChatMessage,
  GeneratedQuiz,
  YouTubeVideoRecommendation,
  PracticeQuestionItem,
  GroundingSourceItem
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
  Compass
} from 'lucide-react';

interface StudyAssistantChatProps {
  activeSubject: Subject;
  messages: StudyChatMessage[];
  onSendMessage: (text: string, mode?: 'general' | 'research' | 'videos' | 'questions' | 'quiz') => Promise<void>;
  isSending: boolean;
  onClearChat: () => void;
  onLaunchQuiz?: (quiz: GeneratedQuiz) => void;
}

export const StudyAssistantChat: React.FC<StudyAssistantChatProps> = ({
  activeSubject,
  messages,
  onSendMessage,
  isSending,
  onClearChat,
  onLaunchQuiz
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<'general' | 'research' | 'videos' | 'questions' | 'quiz'>('general');
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
                <div className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed prose-invert">
                  {msg.content}
                </div>

                {/* Grounding and Syllabus References */}
                {((msg.referencedMaterials && msg.referencedMaterials.length > 0) ||
                  (msg.groundingSources && msg.groundingSources.length > 0)) && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-1.5 font-mono">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-emerald-400" />
                      <span>Curriculum & Grounded Web Sources:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {msg.groundingSources?.map((src, i) => (
                        <a
                          key={`src-${i}`}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] px-2 py-0.5 rounded-sm bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:border-emerald-500 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>{src.title.length > 35 ? src.title.slice(0, 35) + '...' : src.title}</span>
                        </a>
                      ))}
                      {msg.referencedMaterials?.map((ref, i) => (
                        <span key={`ref-${i}`} className="text-[10px] px-2 py-0.5 rounded-sm bg-blue-950/60 text-blue-300 border border-blue-800/60 font-medium">
                          {ref}
                        </span>
                      ))}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {msg.recommendedVideos.map((vid, idx) => {
                      const videoUrl = vid.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(vid.searchQuery || vid.title)}`;
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-md bg-slate-950 border border-slate-800 hover:border-red-600/70 transition-all flex flex-col justify-between space-y-2 group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/70 px-1.5 py-0.5 rounded-sm border border-red-900/50 flex items-center gap-1 shrink-0">
                                <PlayCircle className="w-3 h-3" />
                                {vid.channelOrTopic}
                              </span>
                              {vid.duration && (
                                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                                  <Clock className="w-2.5 h-2.5" />
                                  {vid.duration}
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-xs text-slate-100 group-hover:text-red-300 transition-colors line-clamp-2">
                              {vid.title}
                            </h4>
                            {vid.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {vid.description}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-500">
                              Query: {vid.searchQuery.slice(0, 24)}...
                            </span>
                            <a
                              href={videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/50 hover:bg-red-900/50 border border-red-800 px-2.5 py-1 rounded-sm transition-all shadow-xs"
                            >
                              <span>Watch on YouTube</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
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

              <span className="text-[10px] text-slate-500 block px-1 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
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
