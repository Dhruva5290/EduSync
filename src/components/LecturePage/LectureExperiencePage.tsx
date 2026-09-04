import React, { useState, useEffect } from 'react';
import { ClassSarthiLecture, LectureTimelineEvent, BoardCapture, User } from '../../types';
import { MathRenderer } from '../Common/MathRenderer';
import { MasteryQuizModal } from './MasteryQuizModal';
import {
  Clock,
  BookOpen,
  Camera,
  MessageSquare,
  HelpCircle,
  Award,
  Sparkles,
  ChevronRight,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Maximize2,
  X,
  FileCheck,
  RefreshCw,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface LectureExperiencePageProps {
  lectureId: string;
  currentUser: User;
  onNavigateBack: () => void;
  onOpenTutorWithContext?: (prompt: string, context: any) => void;
  initialTimestamp?: string;
}

export const LectureExperiencePage: React.FC<LectureExperiencePageProps> = ({
  lectureId,
  currentUser,
  onNavigateBack,
  onOpenTutorWithContext,
  initialTimestamp
}) => {
  const [lecture, setLecture] = useState<ClassSarthiLecture | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'timeline' | 'board' | 'ask'>('notes');
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<LectureTimelineEvent | null>(null);

  // Ask My Class State
  const [askQuestion, setAskQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [askHistory, setAskHistory] = useState<
    Array<{
      question: string;
      answer: string;
      timestamp?: string;
      timelineEventId?: string;
      quoteSnippet?: string;
      boardImageUrl?: string;
      formulaLatex?: string;
    }>
  >([]);

  // Personalization State
  const [isPersonalizing, setIsPersonalizing] = useState<boolean>(false);
  const [personalizedNotes, setPersonalizedNotes] = useState<string | null>(null);
  const [reinforcedConcepts, setReinforcedConcepts] = useState<string[]>([]);

  // Mastery Quiz Modal
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);

  // Fullscreen Image Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLecture = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/lectures/${lectureId}`);
        if (res.ok) {
          const data = await res.json();
          setLecture(data.lecture);

          // Select initial timeline event
          const timeline = data.lecture.timeline || [];
          if (initialTimestamp) {
            const match = timeline.find((t: LectureTimelineEvent) => t.timestamp === initialTimestamp);
            setSelectedTimelineEvent(match || timeline[0] || null);
            if (match) setActiveTab('timeline');
          } else {
            setSelectedTimelineEvent(timeline[0] || null);
          }
        }
      } catch (err) {
        console.error('Failed to load lecture packet:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [lectureId, initialTimestamp]);

  const handleAskMyClass = async (queryToAsk?: string) => {
    const q = queryToAsk || askQuestion;
    if (!q.trim() || isAsking || !lecture) return;

    setIsAsking(true);
    try {
      const res = await fetch(`/api/lectures/${lecture.id}/ask-my-class`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, studentId: currentUser.id })
      });
      if (res.ok) {
        const data = await res.json();
        setAskHistory(prev => [
          {
            question: q,
            answer: data.answer,
            timestamp: data.timestamp,
            timelineEventId: data.timelineEventId,
            quoteSnippet: data.quoteSnippet,
            boardImageUrl: data.boardImageUrl,
            formulaLatex: data.formulaLatex
          },
          ...prev
        ]);
        if (!queryToAsk) setAskQuestion('');
      }
    } catch (err) {
      console.error('Error asking class:', err);
    } finally {
      setIsAsking(false);
    }
  };

  const handlePersonalizeNotes = async () => {
    if (!lecture || isPersonalizing) return;
    setIsPersonalizing(true);
    try {
      const res = await fetch(`/api/lectures/${lecture.id}/personalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: currentUser.id })
      });
      if (res.ok) {
        const data = await res.json();
        setPersonalizedNotes(data.personalizedNotes);
        setReinforcedConcepts(data.reinforcedConcepts || []);
      }
    } catch (err) {
      console.error('Error personalizing lecture notes:', err);
    } finally {
      setIsPersonalizing(false);
    }
  };

  if (loading || !lecture) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-3">
        <RefreshCw className="w-7 h-7 animate-spin text-blue-500" />
        <p className="text-sm font-semibold">Unpacking ClassSarthi lecture intelligence data...</p>
      </div>
    );
  }

  const quickQuestions = [
    'What did the teacher explain about inertia?',
    'What formula did the teacher write?',
    'What example did the teacher give?',
    'What was discussed around 25 minutes?',
    'Explain the graph from today\'s lecture.',
    'Did the teacher give homework?'
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onNavigateBack}
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>← Student Dashboard</span>
              </button>
              <span className="text-slate-600">•</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {lecture.subjectCode}
              </span>
              <span className="text-[11px] font-mono text-slate-400">{lecture.subjectName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {lecture.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-300 font-medium flex-wrap pt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Teacher: <strong>{lecture.teacherName}</strong>
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                {lecture.date}
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {lecture.duration}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsQuizOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Take Mastery Quiz</span>
            </button>

            <button
              onClick={handlePersonalizeNotes}
              disabled={isPersonalizing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isPersonalizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{personalizedNotes ? 'Personalized (Active)' : 'Personalize Notes'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Smart Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
              activeTab === 'timeline'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Class Timeline ({lecture.timeline.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
              activeTab === 'board'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Board & Visuals ({lecture.boardCaptures.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ask')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
              activeTab === 'ask'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-950/60 text-indigo-300 border-indigo-900/60 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask My Class</span>
          </button>
        </div>
      </div>

      {/* 2. Prominent "Ask My Class" Feature Bar (Always visible or in dedicated tab) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ask My Class</h3>
              <p className="text-[11px] text-slate-400">Ask questions answered strictly from the actual classroom audio & board data with timestamp citations.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
            Ground Truth Citing
          </span>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={askQuestion}
            onChange={e => setAskQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAskMyClass()}
            placeholder="e.g., What did the teacher explain about inertia? or What formula was written at 21 minutes?"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={() => handleAskMyClass()}
            disabled={isAsking || !askQuestion.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isAsking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Ask</span>
          </button>
        </div>

        {/* Quick Question Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase mr-1">Frequent Inquiries:</span>
          {quickQuestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleAskMyClass(chip)}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white transition-all cursor-pointer truncate max-w-xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Latest Ask My Class Responses */}
        {askHistory.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-800 mt-3">
            {askHistory.slice(0, 3).map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-indigo-900/40 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-300 font-mono">Q: {item.question}</span>
                  {item.timestamp && (
                    <button
                      onClick={() => {
                        setActiveTab('timeline');
                        const ev = lecture.timeline.find(t => t.timestamp === item.timestamp);
                        if (ev) setSelectedTimelineEvent(ev);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 hover:bg-indigo-500/30 cursor-pointer"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </button>
                  )}
                </div>
                <div className="text-xs text-slate-200 leading-relaxed">
                  <MathRenderer content={item.answer} />
                </div>
                {item.quoteSnippet && (
                  <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800 italic">
                    <strong className="text-slate-300 not-italic">Teacher's Exact Speech:</strong> "{item.quoteSnippet}"
                  </p>
                )}
                {item.boardImageUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <img
                      src={item.boardImageUrl}
                      alt="Board Reference"
                      className="w-16 h-10 object-cover rounded border border-slate-700 cursor-pointer"
                      onClick={() => setLightboxImage(item.boardImageUrl || null)}
                    />
                    <span className="text-[10px] text-slate-400">Click to expand blackboard frame reference</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Sub-View: Smart Notes */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Notes Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md leading-relaxed">
              {reinforcedConcepts.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/60 flex items-center justify-between gap-3 text-xs text-indigo-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Personalized for your performance: Extra intuition added for <strong>{reinforcedConcepts.join(', ')}</strong>.</span>
                  </div>
                  <button
                    onClick={() => setPersonalizedNotes(null)}
                    className="text-[10px] font-mono text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    View Original Notes
                  </button>
                </div>
              )}

              {/* Note Content with KaTeX */}
              <div className="prose prose-invert max-w-none space-y-4 text-slate-200 text-sm">
                <MathRenderer
                  content={personalizedNotes || lecture.smartNotesMarkdown}
                  isBlock
                />
              </div>

              {/* Formulas Highlight Gallery */}
              {lecture.generalizedNotes?.formulas && lecture.generalizedNotes.formulas.length > 0 && (
                <div className="pt-6 border-t border-slate-800 space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Important Formulas from Lecture
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lecture.generalizedNotes.formulas.map((f, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <p className="text-xs font-bold text-white">{f.name}</p>
                        <div className="text-sm font-mono text-cyan-300 py-1">
                          <MathRenderer content={`$$${f.latex}$$`} isBlock />
                        </div>
                        <p className="text-[11px] text-slate-400">{f.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples Breakdown */}
              {lecture.generalizedNotes?.examples && lecture.generalizedNotes.examples.length > 0 && (
                <div className="pt-6 border-t border-slate-800 space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Numerical Problems & Worked Examples
                  </h3>
                  <div className="space-y-3">
                    {lecture.generalizedNotes.examples.map((ex, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Example {i + 1}</span>
                        <p className="text-xs font-semibold text-white">{ex.problem}</p>
                        <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed">
                          <MathRenderer content={ex.solution} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Associated Board Images, Homework & Quick Navigation */}
          <div className="space-y-6">
            {/* Homework Mentioned in Lecture */}
            {lecture.generalizedNotes?.homeworkMentioned && lecture.generalizedNotes.homeworkMentioned.length > 0 && (
              <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-5 space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-amber-400">
                  <FileCheck className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider">Homework Mentioned</h3>
                </div>
                {lecture.generalizedNotes.homeworkMentioned.map((hw, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-xs font-bold text-white">{hw.task}</p>
                    <p className="text-[10px] text-amber-300 font-mono">Due: {hw.dueDate || 'Check Course Calendar'}</p>
                    <p className="text-[10px] text-slate-400">{hw.context}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Blackboard Images Associated with Notes */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">
                    Board Visuals ({lecture.boardCaptures.length})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('board')}
                  className="text-[10px] font-semibold text-cyan-400 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {lecture.boardCaptures.slice(0, 2).map((bc, i) => (
                  <div
                    key={i}
                    onClick={() => setLightboxImage(bc.imageUrl)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group space-y-2"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={bc.imageUrl}
                        alt={bc.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-cyan-300 border border-white/10 backdrop-blur-xs">
                        {bc.timestamp}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white truncate">{bc.title}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{bc.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Timeline Access */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Class Highlights</h3>
              <div className="space-y-1.5">
                {lecture.timeline.map((ev, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveTab('timeline');
                      setSelectedTimelineEvent(ev);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between gap-2 border border-slate-800/80 cursor-pointer transition-colors"
                  >
                    <span className="truncate">{ev.title}</span>
                    <span className="text-[10px] font-mono text-blue-400 shrink-0">{ev.timestamp}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub-View: Synchronized Class Timeline */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Interactive Timeline Event Rail */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 px-1">Classroom Timeline Events</h3>
            <div className="space-y-2">
              {lecture.timeline.map((event, idx) => {
                const isSelected = selectedTimelineEvent?.id === event.id;
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedTimelineEvent(event)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md ring-1 ring-blue-500/40'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-cyan-400'
                        }`}>
                          {event.timestamp}
                        </span>
                        <span className="text-xs font-bold truncate">{event.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                        "{event.teacherQuote}"
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-1 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (2 Cols): Synchronized Event Inspector (Teacher Speech, Notes, Board Image, Formulas) */}
          <div className="lg:col-span-2 space-y-5">
            {selectedTimelineEvent ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                {/* Event Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {selectedTimelineEvent.timestamp}
                      </span>
                      <h2 className="text-lg font-extrabold text-white">{selectedTimelineEvent.title}</h2>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAskMyClass(`Explain what was discussed around ${selectedTimelineEvent.timestamp}`)}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Ask About This</span>
                  </button>
                </div>

                {/* What Teacher Said */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <p className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider">
                    What Teacher Said (Audio & Transcript Sync)
                  </p>
                  <blockquote className="text-sm font-medium text-slate-200 italic border-l-2 border-cyan-400 pl-3 leading-relaxed">
                    "{selectedTimelineEvent.teacherQuote}"
                  </blockquote>
                </div>

                {/* Relevant Notes */}
                <div className="space-y-2">
                  <p className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                    Synchronized Explanation & Notes
                  </p>
                  <div className="text-xs sm:text-sm text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 leading-relaxed">
                    <MathRenderer content={selectedTimelineEvent.notes} isBlock />
                  </div>
                </div>

                {/* Formula in LaTeX (if available) */}
                {selectedTimelineEvent.formulaLatex && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <p className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                      Blackboard Formula (KaTeX)
                    </p>
                    <div className="text-base text-cyan-300 font-mono py-1">
                      <MathRenderer content={`$$${selectedTimelineEvent.formulaLatex}$$`} isBlock />
                    </div>
                  </div>
                )}

                {/* Board Image (if available) */}
                {selectedTimelineEvent.boardImageUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                        Blackboard Camera Capture ({selectedTimelineEvent.timestamp})
                      </p>
                      <button
                        onClick={() => setLightboxImage(selectedTimelineEvent.boardImageUrl || null)}
                        className="text-[11px] text-cyan-400 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Zoom Capture</span>
                      </button>
                    </div>
                    <div
                      onClick={() => setLightboxImage(selectedTimelineEvent.boardImageUrl || null)}
                      className="rounded-xl overflow-hidden border border-slate-800 cursor-pointer group relative"
                    >
                      <img
                        src={selectedTimelineEvent.boardImageUrl}
                        alt="Board Capture"
                        className="w-full max-h-72 object-cover group-hover:scale-102 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Maximize2 className="w-4 h-4" />
                        <span>Click to Inspect Full Blackboard</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">Select an event from the timeline to inspect.</p>
            )}
          </div>
        </div>
      )}

      {/* 5. Sub-View: Board & Visuals Gallery */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Classroom Blackboard Captures</h3>
            <span className="text-xs text-slate-400 font-mono">{lecture.boardCaptures.length} Captures Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lecture.boardCaptures.map(bc => (
              <div
                key={bc.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 cursor-pointer group" onClick={() => setLightboxImage(bc.imageUrl)}>
                    <img src={bc.imageUrl} alt={bc.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-200" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-cyan-300 border border-white/10 backdrop-blur-xs">
                      {bc.timestamp}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">{bc.conceptTag}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{bc.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{bc.explanation}</p>
                  </div>

                  {bc.ocrLatex && (
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                      <MathRenderer content={`$$${bc.ocrLatex}$$`} isBlock />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('timeline');
                      const ev = lecture.timeline.find(t => t.timestamp === bc.timestamp);
                      if (ev) setSelectedTimelineEvent(ev);
                    }}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Jump to Timeline ({bc.timestamp})</span>
                  </button>
                  <button
                    onClick={() => setLightboxImage(bc.imageUrl)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Zoom Image"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={lightboxImage} alt="Enlarged Board Frame" className="rounded-xl max-h-[85vh] object-contain border border-slate-700 shadow-2xl" />
          </div>
        </div>
      )}

      {/* Mastery Quiz Modal */}
      <MasteryQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        lectureId={lecture.id}
        lectureTitle={lecture.title}
        currentUser={currentUser}
        onOpenTutorWithMistake={onOpenTutorWithContext}
      />
    </div>
  );
};
