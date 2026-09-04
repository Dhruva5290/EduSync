import React, { useState, useEffect, useRef } from 'react';
import { StudentNote, Subject, Flashcard, GeneratedQuiz, LearnerPersona } from '../../types';
import { InteractiveQuizModal } from './InteractiveQuizModal';
import { FlashcardDeckModal } from './FlashcardDeckModal';
import { cleanAndFormatMath } from '../SmartAITutor/ChatInterface';
import {
  FileText,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  Pin,
  Tag,
  CheckCircle2,
  Code,
  Heading,
  Bold,
  Italic,
  List,
  Quote,
  Play,
  Save,
  Layers,
  Search,
  Download,
  Copy,
  Check,
  Wand2,
  X,
  FileSpreadsheet,
  Zap,
  ChevronRight,
  Folder,
  FolderOpen,
  Eye,
  Edit3,
  Globe,
  Terminal,
  Calculator,
  BrainCircuit,
  Clock,
  Layers2,
  Camera,
  UploadCloud
} from 'lucide-react';

interface SmartNotePlaygroundProps {
  activeSubject: Subject;
  subjects?: Subject[];
  allSubjects?: Subject[];
  notes: StudentNote[];
  currentUser?: { id: string; name: string; learningProfile?: LearnerPersona };
  onOpenPersonalization?: () => void;
  onNavigateToVisionNote?: () => void;
  onSaveNote: (note: Partial<StudentNote>) => Promise<StudentNote>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onSummarizeNote: (noteId: string, content: string, learnerProfile?: LearnerPersona) => Promise<{ summary: string; keyTakeaways: string[] }>;
  onGenerateFlashcards: (noteId: string, content: string, learnerProfile?: LearnerPersona) => Promise<Flashcard[]>;
  onGenerateQuizFromNote: (noteId: string, content: string, title: string, learnerProfile?: LearnerPersona) => Promise<GeneratedQuiz>;
  onGenerateNoteFromPrompt?: (payload: {
    prompt: string;
    depth: string;
    targetSubjectId?: string;
    attachedText?: string;
    documentName?: string;
    learnerProfile?: LearnerPersona;
  }) => Promise<StudentNote>;
}

// Subject color styling tokens for clean visual segregation
export const SUBJECT_THEMES: Record<string, {
  name: string;
  code: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  activeRing: string;
  accentDot: string;
}> = {
  'subj-ess': {
    name: 'Environmental Studies',
    code: 'ESS',
    badgeBg: 'bg-emerald-950/70',
    textColor: 'text-emerald-300',
    borderColor: 'border-emerald-700/80',
    activeRing: 'border-emerald-500 bg-emerald-950/30 text-emerald-200',
    accentDot: 'bg-emerald-400'
  },
  'subj-calc': {
    name: 'Calculus & Mathematics',
    code: 'CALC',
    badgeBg: 'bg-blue-950/70',
    textColor: 'text-blue-300',
    borderColor: 'border-blue-700/80',
    activeRing: 'border-blue-500 bg-blue-950/30 text-blue-200',
    accentDot: 'bg-blue-400'
  },
  'subj-eme': {
    name: 'Mechanical Engineering',
    code: 'EME',
    badgeBg: 'bg-amber-950/70',
    textColor: 'text-amber-300',
    borderColor: 'border-amber-700/80',
    activeRing: 'border-amber-500 bg-amber-950/30 text-amber-200',
    accentDot: 'bg-amber-400'
  },
  'subj-ethics': {
    name: 'Engineering Ethics',
    code: 'ENG-ETH',
    badgeBg: 'bg-rose-950/70',
    textColor: 'text-rose-300',
    borderColor: 'border-rose-700/80',
    activeRing: 'border-rose-500 bg-rose-950/30 text-rose-200',
    accentDot: 'bg-rose-400'
  },
  'subj-cpc': {
    name: 'C Programming & Memory',
    code: 'CPC',
    badgeBg: 'bg-cyan-950/70',
    textColor: 'text-cyan-300',
    borderColor: 'border-cyan-700/80',
    activeRing: 'border-cyan-500 bg-cyan-950/30 text-cyan-200',
    accentDot: 'bg-cyan-400'
  },
  'others': {
    name: 'General & Electives',
    code: 'OTHERS',
    badgeBg: 'bg-purple-950/70',
    textColor: 'text-purple-300',
    borderColor: 'border-purple-700/80',
    activeRing: 'border-purple-500 bg-purple-950/30 text-purple-200',
    accentDot: 'bg-purple-400'
  }
};

export const SmartNotePlayground: React.FC<SmartNotePlaygroundProps> = ({
  activeSubject,
  subjects = [],
  allSubjects = [],
  notes,
  currentUser,
  onOpenPersonalization,
  onNavigateToVisionNote,
  onSaveNote,
  onDeleteNote,
  onSummarizeNote,
  onGenerateFlashcards,
  onGenerateQuizFromNote,
  onGenerateNoteFromPrompt
}) => {
  // Merge subjects list
  const availableSubjects: Subject[] = (subjects && subjects.length > 0)
    ? subjects
    : (allSubjects && allSubjects.length > 0)
    ? allSubjects
    : [activeSubject];

  // Selected filter in sidebar: 'all' | 'others' | subjectId
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  // Active note editor state
  const activeNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  const [title, setTitle] = useState(activeNote?.title || 'New Study Note');
  const [content, setContent] = useState(activeNote?.content || '');
  const [noteSubjectId, setNoteSubjectId] = useState<string>(activeNote?.subjectId || activeSubject.id);
  const [tagsInput, setTagsInput] = useState(activeNote?.tags?.join(', ') || '');
  const [isPinned, setIsPinned] = useState(activeNote?.isPinned || false);
  const [copiedState, setCopiedState] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // AI loading states
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // AI Note Generator Modal state
  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [aiGenPrompt, setAiGenPrompt] = useState('');
  const [aiGenTargetSubject, setAiGenTargetSubject] = useState<string>(activeSubject.id);
  const [aiGenDepth, setAiGenDepth] = useState<'exam_prep' | 'cheat_sheet' | 'deep_dive' | 'formula_sheet'>('exam_prep');
  const [aiGenAttachedText, setAiGenAttachedText] = useState('');
  const [aiGenDocName, setAiGenDocName] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Active Modals
  const [activeQuiz, setActiveQuiz] = useState<GeneratedQuiz | null>(null);
  const [activeDeck, setActiveDeck] = useState<Flashcard[] | null>(null);

  // Update local editor state when active note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setNoteSubjectId(activeNote.subjectId || 'others');
      setTagsInput(activeNote.tags?.join(', ') || '');
      setIsPinned(activeNote.isPinned || false);
    }
  }, [selectedNoteId, activeNote?.id]);

  // Helper to get styling theme for any subject ID
  const getSubjectTheme = (subjId: string) => {
    if (!subjId || subjId === 'others' || subjId === 'subj-others') {
      return SUBJECT_THEMES['others'];
    }
    if (SUBJECT_THEMES[subjId]) {
      return SUBJECT_THEMES[subjId];
    }
    const match = availableSubjects.find(s => s.id === subjId || s.code.toLowerCase() === subjId.toLowerCase());
    if (match) {
      const codeKey = `subj-${match.code.toLowerCase()}`;
      if (SUBJECT_THEMES[codeKey]) return SUBJECT_THEMES[codeKey];
      return {
        name: match.name,
        code: match.code,
        badgeBg: 'bg-blue-950/70',
        textColor: 'text-blue-300',
        borderColor: 'border-blue-700/80',
        activeRing: 'border-blue-500 bg-blue-950/30 text-blue-200',
        accentDot: 'bg-blue-400'
      };
    }
    return SUBJECT_THEMES['others'];
  };

  // Filter notes based on subject category and search text
  const filteredNotes = notes.filter(n => {
    // Subject filter
    if (subjectFilter !== 'all') {
      if (subjectFilter === 'others') {
        const isKnownSubj = availableSubjects.some(s => s.id === n.subjectId);
        if (isKnownSubj && n.subjectId !== 'others' && n.subjectId !== 'subj-others') {
          return false;
        }
      } else if (n.subjectId !== subjectFilter) {
        return false;
      }
    }

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  const handleSelectNote = (n: StudentNote) => {
    setSelectedNoteId(n.id);
  };

  const handleCreateNewNote = async () => {
    const targetSubj = subjectFilter !== 'all' ? subjectFilter : activeSubject.id;
    const theme = getSubjectTheme(targetSubj);

    const created = await onSaveNote({
      subjectId: targetSubj,
      title: `Untitled Note (${theme.code})`,
      content: `# Study Note: ${theme.name}\n\n## 1. Key Invariants & Principles\n- Define theoretical framework...\n\n$$\\lim_{x \\to \\infty} f(x) = L$$\n\n\`\`\`c\n// Implementation or formula reference\n\`\`\`\n`,
      tags: [theme.code, 'Study-Notes'],
      isPinned: false
    });
    if (created && created.id) {
      setSelectedNoteId(created.id);
    }
  };

  const handleSaveCurrent = async () => {
    if (!activeNote) return;
    setSaveStatus('saving');
    try {
      const saved = await onSaveNote({
        id: activeNote.id,
        subjectId: noteSubjectId,
        title,
        content,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        isPinned
      });
      if (saved) {
        activeNote.title = title;
        activeNote.content = content;
        activeNote.subjectId = noteSubjectId;
        activeNote.tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
        activeNote.isPinned = isPinned;
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Error in handleSaveCurrent:', err);
      setSaveStatus('idle');
    }
  };

  // AI Summarize Action
  const handleRunSummarize = async () => {
    if (!activeNote) return;
    setIsSummarizing(true);
    try {
      const res = await onSummarizeNote(activeNote.id, content, currentUser?.learningProfile);
      activeNote.summary = res.summary;
      activeNote.keyTakeaways = res.keyTakeaways;
    } finally {
      setIsSummarizing(false);
    }
  };

  // AI Flashcards Action
  const handleRunFlashcards = async () => {
    if (!activeNote) return;
    setIsGeneratingCards(true);
    try {
      const cards = await onGenerateFlashcards(activeNote.id, content, currentUser?.learningProfile);
      activeNote.flashcards = cards;
      setActiveDeck(cards);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  // AI Note-to-Quiz Bridge Action
  const handleRunNoteQuiz = async () => {
    if (!activeNote) return;
    setIsGeneratingQuiz(true);
    try {
      const quiz = await onGenerateQuizFromNote(activeNote.id, content, title, currentUser?.learningProfile);
      activeNote.quiz = quiz;
      setActiveQuiz(quiz);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Generate Note from Prompt / PDF Text
  const handleGenerateNoteFromAI = async () => {
    if (!aiGenPrompt.trim()) return;
    setIsAiGenerating(true);

    try {
      const targetSubjId = aiGenTargetSubject || activeSubject.id;
      const theme = getSubjectTheme(targetSubjId);

      if (onGenerateNoteFromPrompt) {
        const generated = await onGenerateNoteFromPrompt({
          prompt: aiGenPrompt.trim(),
          depth: aiGenDepth,
          targetSubjectId: targetSubjId,
          attachedText: aiGenAttachedText.trim() || undefined,
          documentName: aiGenDocName.trim() || undefined,
          learnerProfile: currentUser?.learningProfile
        });
        if (generated && generated.id) {
          setSelectedNoteId(generated.id);
        }
      } else {
        const res = await fetch('/api/ai/notes/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: aiGenPrompt.trim(),
            subjectId: targetSubjId,
            depth: aiGenDepth,
            attachedText: aiGenAttachedText.trim() || undefined,
            documentName: aiGenDocName.trim() || undefined,
            learnerProfile: currentUser?.learningProfile
          })
        });

        if (res.ok) {
          const data = await res.json();
          const newNote = await onSaveNote({
            subjectId: targetSubjId,
            title: data.title || `${theme.code}: ${aiGenPrompt}`,
            content: data.content,
            tags: data.tags || [theme.code, 'AI-Generated'],
            summary: data.summary,
            keyTakeaways: data.keyTakeaways,
            isPinned: true
          });
          if (newNote && newNote.id) {
            setSelectedNoteId(newNote.id);
          }
        }
      }

      setShowAiGenModal(false);
      setAiGenPrompt('');
      setAiGenAttachedText('');
      setAiGenDocName('');
    } catch (err) {
      console.error('Error generating AI note:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Copy Note Action
  const handleCopyNote = () => {
    navigator.clipboard.writeText(`${title}\n\n${cleanAndFormatMath(content)}`);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  // Export Note as .md File
  const handleExportMarkdown = () => {
    const theme = getSubjectTheme(noteSubjectId);
    const blob = new Blob([`# ${title}\n\nSubject: ${theme.name} (${theme.code})\nTags: ${tagsInput}\n\n${content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Preset topic prompt loader
  const handleLoadSamplePrompt = (sampleTopic: string, depthType: 'exam_prep' | 'cheat_sheet' | 'deep_dive' | 'formula_sheet') => {
    setAiGenPrompt(sampleTopic);
    setAiGenDepth(depthType);
  };

  // Markdown Formatting Helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    setContent(prev => prev + `\n${prefix} ` + suffix);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const activeTheme = getSubjectTheme(noteSubjectId);

  // Active Subject Preset Topics for quick inspiration in modal
  const selectedModalSubj = availableSubjects.find(s => s.id === aiGenTargetSubject);
  const sampleTopics = selectedModalSubj?.syllabusTopics?.length
    ? selectedModalSubj.syllabusTopics.slice(0, 4)
    : [
        'Lagrange Multipliers & Constrained Optimization',
        'Pointer Arithmetic & Dynamic Memory Invariants in C',
        'Carnot Cycle Efficiency & Second Law of Thermodynamics',
        'Solar Photovoltaic Cell Efficiency & Clean Energy Systems'
      ];

  return (
    <div className="space-y-5">
      {/* 1. Header Banner & Action Center */}
      <div className="bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-slate-800 shadow-md text-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
              Unified AI Note Synthesizer
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-300 font-medium">
              {notes.length} Total Saved Notes
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white mt-1 flex items-center gap-2">
            <span>Academic Notes & Synthesis Hub</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {currentUser?.learningProfile?.questionnaireCompleted ? (
            <button
              type="button"
              onClick={onOpenPersonalization}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-950/90 text-purple-200 border border-purple-700/90 hover:border-purple-500 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
              title="Calibrate cognitive style for all note generations"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>✨ {currentUser.learningProfile.learningStyle.replace('_', ' ').toUpperCase()} ({currentUser.learningProfile.targetGrade})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenPersonalization}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-200 border border-purple-600 px-3 py-1.5 rounded-lg transition-all cursor-pointer animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>⚡ Calibrate Persona</span>
            </button>
          )}

          {onNavigateToVisionNote && (
            <button
              id="notes-import-vn-btn"
              type="button"
              onClick={onNavigateToVisionNote}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer animate-pulse"
              title="Open VisionNote Hub to push/pull camera notes"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-200" />
              <span>Import from VN</span>
            </button>
          )}

          <button
            id="notes-ai-generate-btn"
            onClick={() => {
              setAiGenTargetSubject(subjectFilter !== 'all' ? subjectFilter : activeSubject.id);
              setShowAiGenModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Generate Note</span>
          </button>

          <button
            id="notes-create-new-btn"
            onClick={handleCreateNewNote}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* 2. Visual Subject Segregation Bar (Clean Categorized Tabs) */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 shadow-inner">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          {/* ALL NOTES */}
          <button
            onClick={() => setSubjectFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              subjectFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800/90 border border-slate-800'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>All Courses</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              subjectFilter === 'all' ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {notes.length}
            </span>
          </button>

          {/* INDIVIDUAL SUBJECT PILLS */}
          {availableSubjects.map((subj) => {
            const count = notes.filter(n => n.subjectId === subj.id).length;
            const isSelected = subjectFilter === subj.id;
            const theme = getSubjectTheme(subj.id);

            return (
              <button
                key={subj.id}
                onClick={() => setSubjectFilter(subj.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? `${theme.activeRing} shadow-md font-bold`
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/90'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${theme.accentDot}`} />
                <span className="font-mono font-bold tracking-tight">{subj.code}</span>
                <span className="hidden md:inline text-[11px] opacity-80 max-w-[130px] truncate">
                  {subj.name.split(' ')[0]}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-black/30 text-white font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* OTHERS / ELECTIVES CATEGORY */}
          {(() => {
            const othersCount = notes.filter(n =>
              n.subjectId === 'others' ||
              n.subjectId === 'subj-others' ||
              !availableSubjects.some(s => s.id === n.subjectId)
            ).length;
            const isSelected = subjectFilter === 'others';
            const theme = SUBJECT_THEMES['others'];

            return (
              <button
                onClick={() => setSubjectFilter('others')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? `${theme.activeRing} shadow-md font-bold`
                    : 'bg-slate-900/90 border-purple-900/40 text-purple-300 hover:text-white hover:bg-purple-950/50'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Others & Electives</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-purple-900 text-white font-bold' : 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                }`}>
                  {othersCount}
                </span>
              </button>
            );
          })()}
        </div>
      </div>

      {/* 3. Main Split View: Left Categorized Notes List, Right Rich Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Sidebar: Notes Browser */}
        <div className="lg:col-span-4 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-sm space-y-3.5 text-slate-100 flex flex-col h-[680px]">
          {/* Search Header */}
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, content, or tags..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-sans placeholder:text-slate-500"
            />
          </div>

          {/* Notes Scrollable Cards */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs space-y-3">
                <Folder className="w-10 h-10 mx-auto text-slate-600 opacity-40" />
                <p className="font-semibold text-slate-400">No notes in this category yet.</p>
                <button
                  onClick={handleCreateNewNote}
                  className="px-3.5 py-1.5 bg-blue-600/20 border border-blue-500 text-blue-300 rounded-lg text-xs font-semibold hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  + Create New Note
                </button>
              </div>
            ) : (
              filteredNotes.map((n) => {
                const isSelected = activeNote?.id === n.id;
                const theme = getSubjectTheme(n.subjectId);

                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNote(n)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-950/90 to-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${theme.badgeBg} ${theme.textColor} ${theme.borderColor} shrink-0`}>
                          {theme.code}
                        </span>
                        <h4 className="font-bold text-xs text-white truncate">
                          {n.title || 'Untitled Note'}
                        </h4>
                      </div>
                      {n.isPinned && <Pin className="w-3.5 h-3.5 text-blue-400 fill-blue-400 shrink-0" />}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {n.summary || cleanAndFormatMath(n.content?.replace(/[#*`]/g, '') || '')}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                      <div className="flex gap-1 flex-wrap">
                        {(n.tags || []).slice(0, 2).map((t, idx) => (
                          <span key={idx} className="bg-slate-900 px-1.5 py-0.2 rounded text-slate-400 border border-slate-800">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {n.lastModified ? new Date(n.lastModified).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Rich Note Editor & AI Action Toolbar */}
        <div className="lg:col-span-8 bg-slate-900/95 backdrop-blur-md p-5 rounded-xl border border-slate-800 shadow-sm space-y-4 text-slate-100 flex flex-col h-[680px]">
          {activeNote ? (
            <div className="flex flex-col h-full space-y-3.5 min-h-0">
              {/* Note Header: Subject Dropdown, Title & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/90 shrink-0">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Clean Subject Picker Pill */}
                  <div className="flex items-center shrink-0">
                    <select
                      value={noteSubjectId}
                      onChange={(e) => setNoteSubjectId(e.target.value)}
                      className={`font-mono font-bold text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none cursor-pointer transition-colors ${activeTheme.badgeBg} ${activeTheme.textColor} ${activeTheme.borderColor}`}
                      title="Change course category for this note"
                    >
                      {availableSubjects.map((s) => (
                        <option key={s.id} value={s.id} className="bg-slate-950 text-white">
                          📁 {s.code} — {s.name}
                        </option>
                      ))}
                      <option value="others" className="bg-slate-950 text-purple-300">
                        🌐 OTHERS — General / Electives
                      </option>
                    </select>
                  </div>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Note Title..."
                    className="font-bold text-base text-white bg-transparent focus:outline-none w-full tracking-tight min-w-0"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle Preview / Edit Mode */}
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('edit')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        viewMode === 'edit' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        viewMode === 'preview' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCopyNote}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Copy Note Text (with Clean Math)"
                  >
                    {copiedState ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleExportMarkdown}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Export Markdown (.md)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      isPinned
                        ? 'bg-blue-950 border-blue-700 text-blue-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                    title="Pin Note"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleSaveCurrent}
                    disabled={saveStatus === 'saving'}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer ${
                      saveStatus === 'saved'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {saveStatus === 'saved' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-100" />
                        <span>Saved!</span>
                      </>
                    ) : saveStatus === 'saving' ? (
                      <>
                        <Save className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Note</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteNote(activeNote.id)}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 transition-colors cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* AI Superpowers Synthesis Bar */}
              <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-200">
                    AI Superpowers:
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    id="note-ai-summarize-btn"
                    onClick={handleRunSummarize}
                    disabled={isSummarizing}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isSummarizing ? 'animate-spin' : ''}`} />
                    <span>{isSummarizing ? 'Synthesizing...' : 'AI Summary'}</span>
                  </button>

                  <button
                    id="note-ai-flashcards-btn"
                    onClick={handleRunFlashcards}
                    disabled={isGeneratingCards}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Layers className={`w-3.5 h-3.5 text-blue-400 ${isGeneratingCards ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingCards ? 'Extracting...' : 'Flashcards'}</span>
                  </button>

                  <button
                    id="note-ai-quiz-bridge-btn"
                    onClick={handleRunNoteQuiz}
                    disabled={isGeneratingQuiz}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Play className={`w-3.5 h-3.5 ${isGeneratingQuiz ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingQuiz ? 'Building Quiz...' : 'Note-to-Quiz'}</span>
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar (Edit Mode) */}
              {viewMode === 'edit' && (
                <div className="flex items-center gap-1 pb-1 border-b border-slate-800/70 text-slate-400 flex-wrap shrink-0">
                  <button
                    type="button"
                    onClick={() => insertFormatting('## ')}
                    className="p-1.5 rounded hover:bg-slate-800 text-xs font-bold hover:text-white"
                    title="Heading 2"
                  >
                    <Heading className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('**Bold Text**')}
                    className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('*Italic Text*')}
                    className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('- ')}
                    className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('> ')}
                    className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
                    title="Blockquote"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('$$', '$$')}
                    className="p-1.5 rounded hover:bg-slate-800 hover:text-indigo-300"
                    title="Math Equation ($$ ... $$)"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('```c\n// Code snippet\n```')}
                    className="p-1.5 rounded hover:bg-slate-800 hover:text-white"
                    title="Code Block"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Note Content View / Editor */}
              <div className="flex-1 min-h-0 flex flex-col">
                {viewMode === 'edit' ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 w-full p-3.5 font-mono text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 leading-relaxed resize-none scrollbar-thin"
                    placeholder="Write lecture notes with markdown, LaTeX formulas ($$...$$), and code snippets..."
                  />
                ) : (
                  <div className="flex-1 w-full p-4 font-sans text-xs sm:text-sm text-slate-200 bg-slate-950 border border-slate-800 rounded-xl leading-relaxed overflow-y-auto space-y-3 scrollbar-thin">
                    <div className="whitespace-pre-wrap font-sans leading-relaxed">
                      {cleanAndFormatMath(content)}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags & Footer Info */}
              <div className="flex items-center justify-between gap-3 text-slate-400 pt-1 shrink-0">
                <div className="flex items-center gap-2 flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Tags (comma-separated, e.g. Derivations, Invariants, Exam-Prep)"
                    className="w-full text-xs font-mono text-slate-300 border-none focus:outline-none bg-transparent"
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 shrink-0">
                  {wordCount} words · {charCount} chars
                </div>
              </div>

              {/* AI Generated Summary & Key Takeaways Drawer */}
              {activeNote.summary && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/60 space-y-2 shrink-0 max-h-36 overflow-y-auto scrollbar-thin">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-mono uppercase tracking-wider text-[10px]">AI Executive Synthesis</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cleanAndFormatMath(activeNote.summary)}
                  </p>

                  {activeNote.keyTakeaways && activeNote.keyTakeaways.length > 0 && (
                    <div className="pt-2 border-t border-purple-800/40 space-y-1">
                      <p className="text-[10px] font-bold font-mono uppercase tracking-wider text-purple-300">
                        High-Yield Key Takeaways
                      </p>
                      <ul className="space-y-0.5">
                        {activeNote.keyTakeaways.map((takeaway, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                            <span className="text-purple-400 font-bold">•</span>
                            <span>{cleanAndFormatMath(takeaway)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Stored Flashcards & Quiz shortcuts */}
              {(activeNote.flashcards?.length || activeNote.quiz) ? (
                <div className="flex items-center gap-3 pt-1 shrink-0">
                  {activeNote.flashcards && activeNote.flashcards.length > 0 && (
                    <button
                      onClick={() => setActiveDeck(activeNote.flashcards || null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>Launch Flashcards ({activeNote.flashcards.length})</span>
                    </button>
                  )}

                  {activeNote.quiz && (
                    <button
                      onClick={() => setActiveQuiz(activeNote.quiz || null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-800 text-xs font-semibold hover:bg-purple-900 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-purple-400" />
                      <span>Launch Saved Quiz ({activeNote.quiz.questions.length} Qs)</span>
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs space-y-2">
              <p>Select or create a study note to begin.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Note Generator & Document/PDF Feeder Modal */}
      {showAiGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-bold text-base text-white">Universal AI Study Note Synthesizer</h3>
                  <p className="text-[10px] text-purple-300 font-mono">Calibrated with your cognitive learning persona</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiGenModal(false)}
                className="p-1 rounded-sm text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Subject Selector with "Others" */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Select Subject Category to store this note:</span>
                <span className="text-[10px] font-mono text-slate-400">Assigns to specific syllabus or electives library</span>
              </label>
              <select
                value={aiGenTargetSubject}
                onChange={(e) => setAiGenTargetSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500 font-sans cursor-pointer"
              >
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    📚 {s.code} — {s.name}
                  </option>
                ))}
                <option value="others">🌐 Others (General / Electives / Cross-Disciplinary)</option>
              </select>
            </div>

            {/* Quick Topic Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                Suggested Topic Starters:
              </label>
              <div className="flex flex-wrap gap-2">
                {sampleTopics.map((topic, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleLoadSamplePrompt(topic, 'exam_prep')}
                    className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-md text-purple-300 hover:bg-slate-800 font-mono text-left truncate max-w-xs cursor-pointer"
                  >
                    ✨ {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                What concept or topic should the AI generate notes for?
              </label>
              <input
                type="text"
                value={aiGenPrompt}
                onChange={(e) => setAiGenPrompt(e.target.value)}
                placeholder="e.g. In-depth derivation of Lagrange Multipliers, Pointer Arithmetic memory layout, or Carnot Heat Engine Efficiency..."
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
              />
            </div>

            {/* Note Depth / Format Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Note Format & Depth:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setAiGenDepth('exam_prep')}
                  className={`p-2.5 rounded-lg border text-left space-y-1 transition-all cursor-pointer ${
                    aiGenDepth === 'exam_prep'
                      ? 'bg-purple-950/80 border-purple-600 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-xs text-white">
                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                    <span>Exam Prep</span>
                  </div>
                  <p className="text-[10px] leading-tight text-slate-400">Theory, proofs & traps</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAiGenDepth('cheat_sheet')}
                  className={`p-2.5 rounded-lg border text-left space-y-1 transition-all cursor-pointer ${
                    aiGenDepth === 'cheat_sheet'
                      ? 'bg-purple-950/80 border-purple-600 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-xs text-white">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cheat Sheet</span>
                  </div>
                  <p className="text-[10px] leading-tight text-slate-400">High-density bullet points</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAiGenDepth('deep_dive')}
                  className={`p-2.5 rounded-lg border text-left space-y-1 transition-all cursor-pointer ${
                    aiGenDepth === 'deep_dive'
                      ? 'bg-purple-950/80 border-purple-600 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-xs text-white">
                    <Code className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deep Dive</span>
                  </div>
                  <p className="text-[10px] leading-tight text-slate-400">Mathematical derivations & code</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAiGenDepth('formula_sheet')}
                  className={`p-2.5 rounded-lg border text-left space-y-1 transition-all cursor-pointer ${
                    aiGenDepth === 'formula_sheet'
                      ? 'bg-purple-950/80 border-purple-600 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-xs text-white">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                    <span>Formulas</span>
                  </div>
                  <p className="text-[10px] leading-tight text-slate-400">Definitions & variables</p>
                </button>
              </div>
            </div>

            {/* Optional Document / PDF Text Feeder */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Feed Document / PDF Text Content (Optional):</span>
                <span className="text-[11px] font-mono text-slate-500">Paste excerpts or textbook pages</span>
              </div>

              <input
                type="text"
                value={aiGenDocName}
                onChange={(e) => setAiGenDocName(e.target.value)}
                placeholder="Document / PDF Source Name (e.g. Unit 3 Lecture Slide / Beej Guide Chapter 4)..."
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
              />

              <textarea
                rows={4}
                value={aiGenAttachedText}
                onChange={(e) => setAiGenAttachedText(e.target.value)}
                placeholder="Paste raw PDF text, textbook excerpt, or lecture transcript here..."
                className="w-full p-2.5 font-mono text-xs text-slate-200 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAiGenModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateNoteFromAI}
                disabled={!aiGenPrompt.trim() || isAiGenerating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold disabled:opacity-50 shadow-md cursor-pointer"
              >
                <Wand2 className={`w-4 h-4 ${isAiGenerating ? 'animate-spin' : ''}`} />
                <span>{isAiGenerating ? 'Synthesizing Detailed Note...' : 'Generate & Save Study Note'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {activeQuiz && (
        <InteractiveQuizModal
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
        />
      )}

      {/* Flashcard Modal */}
      {activeDeck && (
        <FlashcardDeckModal
          flashcards={activeDeck}
          noteTitle={title}
          onClose={() => setActiveDeck(null)}
        />
      )}
    </div>
  );
};

export default SmartNotePlayground;
