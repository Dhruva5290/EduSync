import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Camera,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Award,
  Brain,
  MessageSquare,
  Compass,
  Sliders,
  Maximize2,
  X,
  FileText,
  Clock,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Subject, StudentNote, User, QuizQuestion, LectureQuizAnalysis } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';
import { FAKE_SUBJECTS } from '../../mock/fakeData';
import { MathRenderer } from '../Common/MathRenderer';
import { recraftNoteForPersona } from '../../lib/personaRecraft';
import { getOrGenerateQuizQuestions } from '../../lib/quizGenerator';

interface LectureNotesStudioProps {
  activeSubject: Subject;
  subjects: Subject[];
  allSubjects?: Subject[];
  onSelectSubject: (subjectId: string) => void;
  currentUser: User;
  notes: StudentNote[];
  onOpenQuestionnaire: () => void;
  onOpenSocraticTutor: (subjectId: string, initialPrompt?: string) => void;
  onNavigateToBack?: () => void;
  initialSelectedNoteId?: string;
}

const MISC_SUBJECT: Subject = {
  id: 'subj-misc',
  name: 'Miscellaneous & General',
  code: 'MISC',
  description: 'General study notes, aptitude, exams, lab protocols, and unassigned lectures.',
  teacherId: 'teacher-gen',
  teacherName: 'Academic General Studies',
  teacherEmail: 'academic@edusync.edu.in',
  color: 'violet',
  accentBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  enrolledCount: 7,
  semester: 'Academic Year 2026-27',
  room: 'General Resource Centre',
  credits: 2,
  department: 'Multidisciplinary Studies',
  syllabusTopics: ['Aptitude & General Studies', 'Exam Preparation & Selection Strategy', 'Research Methodology']
};

export const LectureNotesStudio: React.FC<LectureNotesStudioProps> = ({
  activeSubject,
  subjects,
  allSubjects = [],
  onSelectSubject,
  currentUser,
  notes,
  onOpenQuestionnaire,
  onOpenSocraticTutor,
  onNavigateToBack,
  initialSelectedNoteId
}) => {
  // Available subjects for fast switching (Physics, Chemistry, Math, Misc)
  const displayedSubjects = useMemo(() => {
    const baseList = subjects.length > 0 ? subjects : (allSubjects.length > 0 ? allSubjects : FAKE_SUBJECTS);
    const list = [...baseList];
    if (!list.some(s => s.id === 'subj-misc' || s.code === 'MISC')) {
      list.push(MISC_SUBJECT);
    }
    return list;
  }, [subjects, allSubjects]);

  // Filter notes strictly belonging to this subject
  const subjectNotes = useMemo(() => {
    return notes.filter(n => {
      // Direct subject match
      if (n.subjectId === activeSubject.id) return true;

      // Handle common aliases/variations (e.g. subj-phy vs subj-phy-11)
      if (activeSubject.id.startsWith('subj-phy') && n.subjectId?.startsWith('subj-phy')) return true;
      if (activeSubject.id.startsWith('subj-che') && n.subjectId?.startsWith('subj-che')) return true;
      if (activeSubject.id.startsWith('subj-mat') && n.subjectId?.startsWith('subj-mat')) return true;
      if ((activeSubject.id === 'subj-misc' || activeSubject.code === 'MISC') && (n.subjectId === 'subj-misc' || !n.subjectId)) return true;

      // Strict tag check only if subjectId isn't set to a different major subject
      const cleanSubName = activeSubject.name.toLowerCase();
      const isPhy = cleanSubName.includes('physics') || activeSubject.code === 'PHY';
      const isChem = cleanSubName.includes('chemistry') || activeSubject.code === 'CHEM';
      const isMath = cleanSubName.includes('math') || activeSubject.code === 'MATH';
      const isMisc = cleanSubName.includes('misc') || activeSubject.code === 'MISC';

      if (isMisc) {
        return n.subjectId === 'subj-misc' || !n.subjectId;
      }

      if (n.tags && n.tags.length > 0) {
        const matchesTag = n.tags.some(t => {
          const cleanT = t.toLowerCase();
          if (isPhy && (cleanT.includes('physics') || cleanT.includes('kinematic') || cleanT.includes('newton') || cleanT.includes('thermo'))) return true;
          if (isChem && (cleanT.includes('chemistry') || cleanT.includes('vsepr') || cleanT.includes('nernst') || cleanT.includes('hybridization'))) return true;
          if (isMath && (cleanT.includes('math') || cleanT.includes('calculus') || cleanT.includes('integral') || cleanT.includes('algebra'))) return true;
          return false;
        });
        if (matchesTag) return true;
      }

      return false;
    });
  }, [notes, activeSubject]);

  // Toggle to view all sessions across all subjects if desired, defaults to false (clean subject view)
  const [showAllNotes, setShowAllNotes] = useState<boolean>(false);
  const displayedNotes = useMemo(() => {
    return showAllNotes ? notes : subjectNotes;
  }, [showAllNotes, notes, subjectNotes]);

  // Selected active note
  const [selectedNoteId, setSelectedNoteId] = useState<string>(initialSelectedNoteId || '');

  // Synchronize initialSelectedNoteId when provided or changed
  useEffect(() => {
    if (initialSelectedNoteId) {
      const targetNote = notes.find(n => n.id === initialSelectedNoteId);
      if (targetNote) {
        if (targetNote.subjectId && targetNote.subjectId !== activeSubject.id) {
          onSelectSubject(targetNote.subjectId);
        }
        setSelectedNoteId(initialSelectedNoteId);
        if (!subjectNotes.some(n => n.id === initialSelectedNoteId)) {
          setShowAllNotes(true);
        }
      }
    }
  }, [initialSelectedNoteId, notes]);

  useEffect(() => {
    if (initialSelectedNoteId && displayedNotes.some(n => n.id === initialSelectedNoteId)) {
      setSelectedNoteId(initialSelectedNoteId);
      return;
    }
    if (displayedNotes.length > 0 && !displayedNotes.some(n => n.id === selectedNoteId)) {
      setSelectedNoteId(displayedNotes[0].id);
    }
  }, [displayedNotes, activeSubject.id, initialSelectedNoteId]);

  const activeNote = useMemo(() => {
    return displayedNotes.find(n => n.id === selectedNoteId) || displayedNotes[0] || null;
  }, [displayedNotes, selectedNoteId]);

  // Personalization state
  const persona = currentUser.learningProfile;
  const isPersonaConfigured = Boolean(persona?.questionnaireCompleted);
  const [isPersonalizing, setIsPersonalizing] = useState<boolean>(false);
  const [showPersonalized, setShowPersonalized] = useState<boolean>(true);
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);
  const [personalizedTakeaways, setPersonalizedTakeaways] = useState<string[] | null>(null);

  // Reset personalized content override when switching notes or when persona changes
  useEffect(() => {
    setPersonalizedContent(null);
    setPersonalizedTakeaways(null);
  }, [selectedNoteId, persona?.completedAt, persona?.learningStyle, persona?.targetGrade, persona?.explanationTone]);

  // Compute what note content to display dynamically
  const displayedContent = useMemo(() => {
    if (!activeNote) return '';
    // If student explicitly toggled to standard lecture mode
    if (!showPersonalized) {
      return activeNote.generalisedNotes || activeNote.content;
    }
    // If the student clicked "Personalize for Me", use that immediate recrafted text
    if (personalizedContent) return personalizedContent;
    // If the active note was already recrafted, display it
    if (activeNote.personalisedNotes && activeNote.personalisedNotes.length > 50) {
      return activeNote.personalisedNotes;
    }
    // If persona is configured, automatically synthesize on the fly!
    if (isPersonaConfigured && persona) {
      try {
        const tuned = recraftNoteForPersona(activeNote, persona);
        return tuned.content;
      } catch (e) {
        return activeNote.content;
      }
    }
    return activeNote.content;
  }, [activeNote, showPersonalized, personalizedContent, isPersonaConfigured, persona]);

  // Compute what key takeaways to display
  const displayedTakeaways = useMemo(() => {
    if (personalizedTakeaways && personalizedTakeaways.length > 0) return personalizedTakeaways;
    if (showPersonalized && isPersonaConfigured && persona && activeNote) {
      try {
        const tuned = recraftNoteForPersona(activeNote, persona);
        return tuned.keyTakeaways;
      } catch (e) {}
    }
    return activeNote?.keyTakeaways || [];
  }, [personalizedTakeaways, showPersonalized, isPersonaConfigured, persona, activeNote]);

  // Camera Snapshot Lightbox modal
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Mastery Quiz State
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizAnalysis, setQuizAnalysis] = useState<LectureQuizAnalysis | null>(null);
  const [analyzingResults, setAnalyzingResults] = useState<boolean>(false);

  // Handle AI Personalization of Note
  const handlePersonalizeNote = async () => {
    if (!activeNote) return;
    setIsPersonalizing(true);
    setShowPersonalized(true);

    // 1. Immediately apply high-fidelity pedagogical recrafting on the client so it NEVER fails!
    try {
      const clientRecraft = recraftNoteForPersona(activeNote, persona);
      setPersonalizedContent(clientRecraft.content);
      setPersonalizedTakeaways(clientRecraft.keyTakeaways);
      activeNote.personalisedNotes = clientRecraft.content;
      activeNote.summary = clientRecraft.summary;
      activeNote.keyTakeaways = clientRecraft.keyTakeaways;
    } catch (e) {
      console.warn('Local recraft fallback:', e);
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}

    // 2. Also query backend AI endpoint asynchronously for optional cloud model enrichment
    try {
      const res = await fetch('/api/ai/notes/personalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteContent: activeNote.content,
          title: activeNote.title,
          learnerProfile: persona
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          setPersonalizedContent(data.content);
          if (data.keyTakeaways) setPersonalizedTakeaways(data.keyTakeaways);
          activeNote.personalisedNotes = data.content;
          if (data.keyTakeaways) activeNote.keyTakeaways = data.keyTakeaways;
        }
      }
    } catch (err) {
      console.warn('Cloud AI busy, using verified local pedagogical persona:', err);
    } finally {
      setIsPersonalizing(false);
    }
  };

  // Launch Post-Reading Quiz strictly generated by Gemini AI
  const handleStartQuiz = async () => {
    if (!activeNote) return;
    setShowQuizModal(true);
    setQuizSubmitted(false);
    setQuizAnalysis(null);
    setUserAnswers({});
    setCurrentQuestionIdx(0);
    setQuizError(null);

    // If note already has questions generated by AI from a previous run, use them
    if (activeNote.quiz?.questions && Array.isArray(activeNote.quiz.questions) && activeNote.quiz.questions.length >= 3) {
      setQuizQuestions(activeNote.quiz.questions);
      setQuizLoading(false);
      return;
    }

    // Otherwise, generate dynamically using Gemini AI from note content
    setQuizQuestions([]);
    setQuizLoading(true);

    try {
      const res = await fetch('/api/ai/quiz/generate-mastery-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteContent: displayedContent || activeNote.content,
          title: activeNote.title,
          count: 5,
          learnerProfile: persona
        })
      });

      if (!res.ok) {
        throw new Error(`AI generation service error (Status ${res.status})`);
      }

      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length >= 3) {
        setQuizQuestions(data.questions);
        // Persist to the active note
        activeNote.quiz = {
          id: `quiz-${activeNote.id}-${Date.now()}`,
          title: data.title || activeNote.title,
          topic: activeNote.title,
          questions: data.questions,
          createdAt: new Date().toISOString()
        };
      } else {
        throw new Error('AI returned an incomplete question set');
      }
    } catch (err: any) {
      console.warn('AI quiz generation error:', err);
      setQuizError(err?.message || 'Gemini AI is currently calibrating. Click below to retry.');
    } finally {
      setQuizLoading(false);
    }
  };

  // Select option in quiz
  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  // Submit Quiz & Run AI Diagnostics
  const handleSubmitQuiz = async () => {
    setQuizSubmitted(true);
    setAnalyzingResults(true);

    const answersArray = quizQuestions.map((_, i) => userAnswers[i] ?? -1);
    const score = quizQuestions.reduce((acc, q, i) => (userAnswers[i] === q.correctIndex ? acc + 1 : acc), 0);
    const percentage = Math.round((score / (quizQuestions.length || 1)) * 100);

    if (percentage >= 80) {
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    try {
      const res = await fetch('/api/ai/quiz/analyze-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizTitle: activeNote?.title || 'Lecture Checkpoint',
          questions: quizQuestions,
          userAnswers: answersArray,
          learnerProfile: persona
        })
      });
      const data: LectureQuizAnalysis = await res.json();
      setQuizAnalysis(data);
    } catch (err) {
      console.error('Failed to analyze quiz performance:', err);
    } finally {
      setAnalyzingResults(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Course Navigation Ribbon */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 p-6 md:p-7 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {activeSubject.code} • Lecture Studio
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isSupabaseConfigured() ? 'VisionNote Cloud Auto-Sync' : 'Local Lecture Engine'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {activeSubject.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Clean, lecture-by-lecture notes transcribed by <strong>VisionNote</strong>. Formatted with mathematical derivations, blackboard OCR captures, and personalized to your cognitive learning profile.
            </p>
          </div>

          {/* Quick Course Selector */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            {displayedSubjects.map(sub => (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  sub.id === activeSubject.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{sub.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cognitive Questionnaire Persona Ribbon */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            {isPersonaConfigured ? (
              <span className="text-slate-300">
                <strong className="text-white">AI Persona Active:</strong>{' '}
                <span className="font-mono text-indigo-300 capitalize">{persona?.learningStyle.replace('_', ' ')}</span> learner targeting{' '}
                <span className="font-mono text-emerald-300 font-bold">Grade {persona?.targetGrade}</span> with a{' '}
                <span className="font-mono text-purple-300 capitalize">{persona?.explanationTone.replace('_', ' ')}</span> tone.
              </span>
            ) : (
              <span className="text-slate-300">
                <strong className="text-amber-300">Standard View:</strong> Take the 1-minute questionnaire to calibrate all derivations, mental models, and difficulty to your style.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenQuestionnaire}
              className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-700/60 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isPersonaConfigured ? 'Tune Profile' : '⚡ Complete Questionnaire'}</span>
            </button>

            {isPersonaConfigured && activeNote && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPersonalized(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    !showPersonalized
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Switch between raw standard lecture and personalized edition"
                >
                  <span>{showPersonalized ? '👁️ Standard View' : '✨ Tuned View'}</span>
                </button>
                <button
                  onClick={handlePersonalizeNote}
                  disabled={isPersonalizing}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Re-run persona calibration for this lecture"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPersonalizing ? 'animate-spin' : ''}`} />
                  <span>{isPersonalizing ? 'Personalizing...' : '✨ Personalize for Me'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Studio Workspace: 2 Columns (Lecture List + Reading Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lecture Notes Roster (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {showAllNotes ? `All Notes (${notes.length})` : `${activeSubject.code} Lectures (${subjectNotes.length})`}
              </h3>
            </div>
            <button
              onClick={() => setShowAllNotes(prev => !prev)}
              className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
              title="Toggle between active subject and all notes"
            >
              {showAllNotes ? `Filter to ${activeSubject.code}` : `Show All (${notes.length})`}
            </button>
          </div>

          {displayedNotes.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Compass className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No recorded lectures yet for {activeSubject.name}.</p>
              <p className="text-[11px] text-slate-500">
                Lectures captured in VisionNote will automatically be categorized and appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
              {displayedNotes.map((note, index) => {
                const isSelected = note.id === selectedNoteId;
                const dateStr = note.lastModified ? new Date(note.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent';
                const hasDoubts = note.doubtsDetected && note.doubtsDetected.length > 0;

                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-950/90 to-slate-900 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                    )}

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                        <Clock className="w-3 h-3" />
                        Lecture {index + 1} · {dateStr}
                      </span>
                      {hasDoubts && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans font-bold">
                          {note.doubtsDetected!.length} Doubts Flagged
                        </span>
                      )}
                    </div>

                    <h4 className={`text-xs font-bold line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                      {note.title}
                    </h4>

                    {note.summary && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {note.summary}
                      </p>
                    )}

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                        {note.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Lecture Note Reading Studio (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeNote ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
              {/* Note Header & Metadata */}
              <div className="space-y-3 pb-5 border-b border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                      Classroom Lecture Notes
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Recorded {new Date(activeNote.lastModified || Date.now()).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                    </span>
                  </div>

                  <button
                    onClick={handleStartQuiz}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Take Mastery Quiz</span>
                  </button>
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {activeNote.title}
                </h2>

                {/* Executive Summary Card */}
                {activeNote.summary && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-blue-400 uppercase tracking-wider text-[10px] font-mono">
                      <BookOpen className="w-3.5 h-3.5" />
                      Summary & Core Concepts
                    </div>
                    <p className="leading-relaxed text-slate-200">
                      {activeNote.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Blackboard Camera Snapshot (if present) */}
              {activeNote.cameraSnapshotUrl && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                      Blackboard Snapshot
                    </span>
                    <button
                      onClick={() => setLightboxImageUrl(activeNote.cameraSnapshotUrl!)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      Zoom Lightbox
                    </button>
                  </div>
                  <div
                    onClick={() => setLightboxImageUrl(activeNote.cameraSnapshotUrl!)}
                    className="relative rounded-lg overflow-hidden border border-slate-800 max-h-56 cursor-pointer group"
                  >
                    <img
                      src={activeNote.cameraSnapshotUrl}
                      alt="Lecture blackboard snapshot"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white gap-1.5">
                      <Maximize2 className="w-4 h-4" /> Click to Enlarge
                    </div>
                  </div>
                </div>
              )}

              {/* Detected Blackboard Doubts Banner */}
              {activeNote.doubtsDetected && activeNote.doubtsDetected.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-mono">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      Classroom Clarifications Flagged ({activeNote.doubtsDetected.length})
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">AI Tutor Ready</span>
                  </div>

                  <div className="space-y-1.5">
                    {activeNote.doubtsDetected.map((doubt, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-start justify-between gap-3 p-2 rounded-lg bg-slate-950/70 border border-amber-900/30 text-slate-200 text-xs"
                      >
                        <p className="leading-snug text-slate-300 italic">"{doubt}"</p>
                        <button
                          onClick={() => onOpenSocraticTutor(activeSubject.id, `I'm reading the lecture on "${activeNote.title}". Please explain this concept: "${doubt}" step by step.`)}
                          className="shrink-0 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Ask Tutor</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lecture Note Content Area with MathRenderer */}
              <div className="prose prose-invert max-w-none space-y-4 text-slate-200 text-sm leading-relaxed">
                <MathRenderer content={displayedContent} isBlock />
              </div>

              {/* Key Takeaways Box */}
              {displayedTakeaways && displayedTakeaways.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                  <span className="font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    Key Takeaways ({persona ? persona.learningStyle.replace(/_/g, ' ').toUpperCase() : 'CALIBRATED'})
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {displayedTakeaways.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Post-Reading Action Callout */}
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 p-5 rounded-xl border">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    Finished reading this lecture?
                  </h4>
                  <p className="text-xs text-slate-400">
                    Verify your mastery now with a 5-10 question diagnostic quiz tiered from Easy to Hard.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartQuiz}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Start Mastery Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Select a lecture on the left to begin reading.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. LIGHTBOX MODAL: Blackboard Snapshot Preview */}
      {lightboxImageUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2 space-y-2">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" /> VisionNote High-Resolution Blackboard OCR Snapshot
              </span>
              <button
                onClick={() => setLightboxImageUrl(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={lightboxImageUrl}
              alt="High resolution snapshot"
              className="max-h-[80vh] w-auto rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* 4. MASTERY QUIZ MODAL: 5-10 Questions Tiered Easy, Moderate, Hard */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono uppercase font-bold text-emerald-400 tracking-wider">
                    Lecture Mastery Checkpoint
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {activeNote?.title || 'Quiz'}
                </h3>
              </div>

              <button
                onClick={() => setShowQuizModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quizLoading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-white">Synthesizing 5–10 Multi-Tier Mastery Questions...</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Gemini AI is calibrating Easy, Moderate, and Hard questions tailored to your persona from this lecture's derivations and detected blackboard doubts.
                </p>
              </div>
            ) : !quizSubmitted ? (
              quizQuestions.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <Brain className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {quizError ? 'AI Generation Paused' : 'Synthesize Mastery Quiz with AI'}
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {quizError
                        ? quizError
                        : 'Questions are generated in real-time by Gemini AI strictly from your lecture notes and personalized profile.'}
                    </p>
                  </div>
                  <button
                    onClick={handleStartQuiz}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {quizError ? 'Retry AI Generation' : 'Generate with Gemini AI'}
                  </button>
                </div>
              ) : (
                /* Quiz Runner Interface */
                <div className="space-y-6">
                {/* Progress Bar & Difficulty Badge */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Question {currentQuestionIdx + 1} of {quizQuestions.length}</span>
                  {quizQuestions[currentQuestionIdx]?.difficulty && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      quizQuestions[currentQuestionIdx].difficulty === 'easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : quizQuestions[currentQuestionIdx].difficulty === 'hard'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {quizQuestions[currentQuestionIdx].difficulty} Tier
                    </span>
                  )}
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 transition-all duration-300"
                    style={{ width: `${((currentQuestionIdx + 1) / (quizQuestions.length || 1)) * 100}%` }}
                  />
                </div>

                {/* Current Question */}
                {quizQuestions[currentQuestionIdx] && (
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold text-white leading-relaxed">
                      {quizQuestions[currentQuestionIdx].question}
                    </h4>

                    {/* Options List */}
                    <div className="space-y-2.5">
                      {quizQuestions[currentQuestionIdx].options.map((option, optIdx) => {
                        const isChosen = userAnswers[currentQuestionIdx] === optIdx;

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(currentQuestionIdx, optIdx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                              isChosen
                                ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isChosen ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{option}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIdx === 0}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Previous
                  </button>

                  {currentQuestionIdx < quizQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIdx(prev => Math.min(quizQuestions.length - 1, prev + 1))}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      Submit Quiz & Analyze
                    </button>
                  )}
                </div>
              </div>
            )) : (
              /* Quiz Results & AI Diagnostic Analysis */
              <div className="space-y-6">
                {/* Score & Mastery Level Banner */}
                {(() => {
                  const score = quizQuestions.reduce((acc, q, i) => (userAnswers[i] === q.correctIndex ? acc + 1 : acc), 0);
                  const percentage = Math.round((score / (quizQuestions.length || 1)) * 100);

                  return (
                    <div className="p-5 rounded-xl bg-gradient-to-br from-slate-950 to-indigo-950/60 border border-indigo-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono font-bold text-indigo-400">
                          Diagnostic Mastery Report
                        </span>
                        <h4 className="text-xl font-extrabold text-white">
                          You scored {score} / {quizQuestions.length} ({percentage}%)
                        </h4>
                        <p className="text-xs text-slate-300">
                          {percentage >= 80 ? '🌟 High Distinction • Ready for homework & exam problems.' : '💡 Good foundation with key misconceptions identified below.'}
                        </p>
                      </div>

                      {/* Difficulty Breakdown Badges */}
                      {quizAnalysis?.difficultyBreakdown && (
                        <div className="flex items-center gap-2">
                          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-emerald-800/60 text-center">
                            <span className="text-[10px] text-emerald-400 block font-mono">Easy</span>
                            <span className="text-xs font-bold text-white">
                              {quizAnalysis.difficultyBreakdown.easy.correct}/{quizAnalysis.difficultyBreakdown.easy.total}
                            </span>
                          </div>
                          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-amber-800/60 text-center">
                            <span className="text-[10px] text-amber-400 block font-mono">Moderate</span>
                            <span className="text-xs font-bold text-white">
                              {quizAnalysis.difficultyBreakdown.moderate.correct}/{quizAnalysis.difficultyBreakdown.moderate.total}
                            </span>
                          </div>
                          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-rose-800/60 text-center">
                            <span className="text-[10px] text-rose-400 block font-mono">Hard</span>
                            <span className="text-xs font-bold text-white">
                              {quizAnalysis.difficultyBreakdown.hard.correct}/{quizAnalysis.difficultyBreakdown.hard.total}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* AI Diagnostic Summary & Identified Misconceptions */}
                {analyzingResults ? (
                  <div className="py-6 text-center space-y-2">
                    <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">AI Learning Scientist is analyzing error patterns & cognitive gaps...</p>
                  </div>
                ) : quizAnalysis ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                      <span className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-mono">
                        <Brain className="w-3.5 h-3.5 text-indigo-400" />
                        AI Diagnostic Analysis
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {quizAnalysis.summary}
                      </p>
                    </div>

                    {quizAnalysis.keyMisconceptions && quizAnalysis.keyMisconceptions.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs space-y-1.5">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-mono">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          Identified Conceptual Misconceptions
                        </span>
                        <ul className="list-disc list-inside text-slate-300 space-y-1">
                          {quizAnalysis.keyMisconceptions.map((misc, mIdx) => (
                            <li key={mIdx} className="leading-snug">{misc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Socratic AI Tutor Recommendation Gateway */}
                    <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider font-mono">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          Recommended Next Step
                        </div>
                        <h4 className="text-sm font-bold text-white">
                          Resolve this with the Socratic AI Tutor
                        </h4>
                        <p className="text-xs text-slate-300 max-w-md">
                          Let the Socratic Tutor guide you through the exact concepts you struggled with using guiding questions, without giving away direct answers.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowQuizModal(false);
                          onOpenSocraticTutor(activeSubject.id, quizAnalysis.suggestedTutorPrompt);
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Launch Socratic AI Tutor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Review Questions & Explanations Accordion */}
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Question-by-Question Review ({quizQuestions.length})
                  </h5>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {quizQuestions.map((q, qIdx) => {
                      const userChoice = userAnswers[qIdx];
                      const isCorrect = userChoice === q.correctIndex;

                      return (
                        <div
                          key={qIdx}
                          className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                            isCorrect
                              ? 'bg-emerald-950/30 border-emerald-800/40'
                              : 'bg-rose-950/30 border-rose-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">
                              Q{qIdx + 1}: {q.question}
                            </span>
                            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                              isCorrect ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'
                            }`}>
                              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>

                          {!isCorrect && (
                            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-rose-900/50">
                              <span className="text-[10px] text-rose-300 font-mono">
                                Your choice: <span className="line-through">{q.options[userChoice] ?? 'None'}</span> • Correct: <span className="text-emerald-300 font-bold">{q.options[q.correctIndex]}</span>
                              </span>
                              <button
                                onClick={() => {
                                  setShowQuizModal(false);
                                  onOpenSocraticTutor(
                                    activeSubject.id,
                                    `I took the lecture checkpoint on "${activeNote?.title || activeSubject.name}" and struggled with Question ${qIdx + 1}:

Question: "${q.question}"
My Answer: "${q.options[userChoice] ?? 'None'}"
Correct Answer: "${q.options[q.correctIndex]}"
Teacher's Explanation: "${q.explanation}"

Please guide me step-by-step to understand why my answer was wrong and help me master this concept.`
                                  );
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-900 to-indigo-900 hover:from-rose-800 hover:to-indigo-800 text-rose-200 border border-rose-700/80 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                              >
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>Ask AI Tutor Why I Was Wrong</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setUserAnswers({});
                      setCurrentQuestionIdx(0);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => setShowQuizModal(false)}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Done & Return to Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
