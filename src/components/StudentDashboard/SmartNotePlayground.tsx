import React, { useState, useEffect } from 'react';
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
  HelpCircle,
  BrainCircuit
} from 'lucide-react';

interface SmartNotePlaygroundProps {
  activeSubject: Subject;
  subjects?: Subject[];
  allSubjects?: Subject[];
  notes: StudentNote[];
  currentUser?: { id: string; name: string; learningProfile?: LearnerPersona };
  onOpenPersonalization?: () => void;
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

export const SmartNotePlayground: React.FC<SmartNotePlaygroundProps> = ({
  activeSubject,
  subjects = [],
  allSubjects = [],
  notes,
  currentUser,
  onOpenPersonalization,
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
  const [saveIndicator, setSaveIndicator] = useState(false);

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

  // Update local state when active note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setNoteSubjectId(activeNote.subjectId || 'others');
      setTagsInput(activeNote.tags.join(', '));
      setIsPinned(activeNote.isPinned);
    }
  }, [selectedNoteId, activeNote?.id]);

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
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  const getSubjectBadge = (subjId: string) => {
    if (subjId === 'others' || subjId === 'subj-others') {
      return { code: 'OTHERS', name: 'General & Electives', color: 'bg-purple-950 text-purple-300 border-purple-800' };
    }
    const match = availableSubjects.find(s => s.id === subjId);
    if (match) {
      return { code: match.code, name: match.name, color: 'bg-blue-950 text-blue-300 border-blue-800' };
    }
    return { code: 'NOTE', name: 'Academic Note', color: 'bg-slate-800 text-slate-300 border-slate-700' };
  };

  const handleSelectNote = (n: StudentNote) => {
    setSelectedNoteId(n.id);
  };

  const handleCreateNewNote = async () => {
    const targetSubj = subjectFilter !== 'all' ? subjectFilter : activeSubject.id;
    const subjMeta = getSubjectBadge(targetSubj);

    const created = await onSaveNote({
      subjectId: targetSubj,
      title: `Untitled Note (${subjMeta.code})`,
      content: `# Study Note: ${subjMeta.name}\n\n## 1. Core Principles\n- Define concepts and theoretical framework...\n\n$$\\lim_{x \\to \\infty} f(x) = L$$\n\n\`\`\`c\n// Code or formula reference\n\`\`\`\n`,
      tags: [subjMeta.code, 'Study-Notes'],
      isPinned: false
    });
    setSelectedNoteId(created.id);
  };

  const handleSaveCurrent = async () => {
    if (!activeNote) return;
    setSaveIndicator(true);
    await onSaveNote({
      id: activeNote.id,
      subjectId: noteSubjectId,
      title,
      content,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      isPinned
    });
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  // AI Summarize Action (Uses student cognitive persona)
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

  // AI Flashcards Action (Uses student cognitive persona)
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

  // AI Note-to-Quiz Bridge Action (Uses student cognitive persona)
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

  // Generate Note from Prompt / PDF Text with target subject selection & questionnaire persona
  const handleGenerateNoteFromAI = async () => {
    if (!aiGenPrompt.trim()) return;
    setIsAiGenerating(true);

    try {
      const targetSubjId = aiGenTargetSubject || activeSubject.id;
      const targetSubj = availableSubjects.find(s => s.id === targetSubjId);

      if (onGenerateNoteFromPrompt) {
        const generated = await onGenerateNoteFromPrompt({
          prompt: aiGenPrompt.trim(),
          depth: aiGenDepth,
          targetSubjectId: targetSubjId,
          attachedText: aiGenAttachedText.trim() || undefined,
          documentName: aiGenDocName.trim() || undefined,
          learnerProfile: currentUser?.learningProfile
        });
        setSelectedNoteId(generated.id);
      } else {
        // Direct API Call
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
          const subjCode = targetSubj ? targetSubj.code : 'OTHERS';
          const newNote = await onSaveNote({
            subjectId: targetSubjId,
            title: data.title || `${subjCode}: ${aiGenPrompt}`,
            content: data.content,
            tags: data.tags || [subjCode, 'AI-Generated'],
            summary: data.summary,
            keyTakeaways: data.keyTakeaways,
            isPinned: true
          });
          setSelectedNoteId(newNote.id);
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
    const subjMeta = getSubjectBadge(noteSubjectId);
    const blob = new Blob([`# ${title}\n\nSubject: ${subjMeta.name} (${subjMeta.code})\nTags: ${tagsInput}\n\n${content}`], { type: 'text/markdown' });
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
    <div className="space-y-6">
      {/* Top Banner: Cognitive Persona & Unified Universal Note Maker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md p-5 rounded-md border border-slate-800 shadow-sm text-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
              <BrainCircuit className="w-3 h-3 text-indigo-400" />
              Unified Academic LLM
            </span>
            <h2 className="text-base font-bold uppercase tracking-tight text-white flex items-center gap-2">
              <span>Smart Note-Making & Synthesis Playground</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate and organize notes across any course or electives ("Others") with cognitive questionnaire tuning, LaTeX math formatting, flashcards, and Note-to-Quiz assessments.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {currentUser?.learningProfile?.questionnaireCompleted ? (
            <button
              type="button"
              onClick={onOpenPersonalization}
              className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-950/80 text-purple-300 border border-purple-700 hover:border-purple-500 px-2.5 py-1 rounded-sm transition-colors cursor-pointer shadow-xs"
              title="Click to customize AI note formatting persona"
            >
              <span>✨ {currentUser.learningProfile.learningStyle.toUpperCase()} · Target {currentUser.learningProfile.targetGrade}</span>
              <span className="text-[10px] text-purple-400 underline ml-0.5">Tune</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenPersonalization}
              className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700 hover:border-amber-500 px-2.5 py-1 rounded-sm transition-colors cursor-pointer animate-pulse"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>⚡ Personalize AI Notes</span>
            </button>
          )}

          <button
            id="notes-ai-generate-btn"
            onClick={() => {
              setAiGenTargetSubject(subjectFilter !== 'all' ? subjectFilter : activeSubject.id);
              setShowAiGenModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all shadow-xs cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-200" />
            <span>Generate Notes with AI</span>
          </button>

          <button
            id="notes-create-new-btn"
            onClick={handleCreateNewNote}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Bar (All Subjects + 5 Courses + "Others") */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setSubjectFilter('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
            subjectFilter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>All Notes ({notes.length})</span>
        </button>

        {availableSubjects.map((subj) => {
          const count = notes.filter(n => n.subjectId === subj.id).length;
          const isSelected = subjectFilter === subj.id;
          return (
            <button
              key={subj.id}
              onClick={() => setSubjectFilter(subj.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="font-mono font-bold text-[11px]">{subj.code}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}

        {/* Dedicated "Others" Category Button */}
        <button
          onClick={() => setSubjectFilter('others')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
            subjectFilter === 'others'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-900 border border-purple-900/60 text-purple-300 hover:text-white hover:bg-purple-950/60'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span>Others / Electives ({notes.filter(n => n.subjectId === 'others' || n.subjectId === 'subj-others' || !availableSubjects.some(s => s.id === n.subjectId)).length})</span>
        </button>
      </div>

      {/* Main Split Layout: Left Notes Sidebar, Right Note Editor & AI Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Notes Browser */}
        <div className="lg:col-span-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-md border border-slate-800 shadow-sm space-y-4 text-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all notes or tags..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 space-y-3">
                <Folder className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
                <p>No notes found in this view.</p>
                <button
                  onClick={handleCreateNewNote}
                  className="px-3 py-1 bg-blue-600/30 border border-blue-500 text-blue-300 rounded text-xs hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  + Create New Note
                </button>
              </div>
            ) : (
              filteredNotes.map((n) => {
                const subjBadge = getSubjectBadge(n.subjectId);
                const isSelected = activeNote?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNote(n)}
                    className={`p-3.5 rounded-md border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-950/80 border-blue-700 shadow-xs text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-white truncate flex-1">
                        {n.title}
                      </h4>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${subjBadge.color} shrink-0`}>
                        {subjBadge.code}
                      </span>
                      {n.isPinned && <Pin className="w-3 h-3 text-blue-400 fill-blue-400 shrink-0" />}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {n.summary || cleanAndFormatMath(n.content.replace(/[#*`]/g, ''))}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono">
                      <div className="flex gap-1 flex-wrap">
                        {n.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="bg-slate-900 px-1.5 py-0.5 rounded-sm text-slate-400 border border-slate-800">
                            {t}
                          </span>
                        ))}
                      </div>
                      <span>{new Date(n.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Rich Note Editor & AI Action Toolbar */}
        <div className="lg:col-span-8 bg-slate-900/90 backdrop-blur-md p-5 rounded-md border border-slate-800 shadow-sm space-y-5 text-slate-100">
          {activeNote ? (
            <div className="space-y-4">
              {/* Note Header: Subject Selector & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Subject Dropdown to assign note to any subject or "Others" */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold hidden sm:inline">Subject:</span>
                    <select
                      value={noteSubjectId}
                      onChange={(e) => setNoteSubjectId(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-blue-300 font-mono font-bold text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {availableSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                      <option value="others">OTHERS - General / Electives</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note Title..."
                    className="font-bold text-base text-white bg-transparent focus:outline-none w-full tracking-tight min-w-0"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle Preview / Edit Mode */}
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('edit')}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                        viewMode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                        viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCopyNote}
                    className="p-1.5 rounded-sm border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Copy Note Text (with Clean Math)"
                  >
                    {copiedState ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleExportMarkdown}
                    className="p-1.5 rounded-sm border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Export Markdown (.md)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    className={`p-1.5 rounded-sm border transition-colors cursor-pointer ${
                      isPinned
                        ? 'bg-blue-950 border-blue-700 text-blue-400'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                    title="Pin Note"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleSaveCurrent}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-sm text-xs font-semibold hover:bg-blue-500 shadow-xs cursor-pointer"
                  >
                    {saveIndicator ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saveIndicator ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteNote(activeNote.id)}
                    className="p-1.5 rounded-sm border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950 transition-colors cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* AI Powered Superpowers Bar */}
              <div className="p-3 bg-slate-950 rounded-md border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-200">
                    Gemini AI Synthesis:
                  </span>
                  {currentUser?.learningProfile?.questionnaireCompleted && (
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                      ✨ {currentUser.learningProfile.learningStyle.replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* 1. Summarize */}
                  <button
                    id="note-ai-summarize-btn"
                    onClick={handleRunSummarize}
                    disabled={isSummarizing}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isSummarizing ? 'animate-spin' : ''}`} />
                    <span>{isSummarizing ? 'Synthesizing...' : 'AI Summary'}</span>
                  </button>

                  {/* 2. Flashcards */}
                  <button
                    id="note-ai-flashcards-btn"
                    onClick={handleRunFlashcards}
                    disabled={isGeneratingCards}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Layers className={`w-3.5 h-3.5 text-blue-400 ${isGeneratingCards ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingCards ? 'Extracting...' : 'Flashcards'}</span>
                  </button>

                  {/* 3. Note-to-Quiz Bridge */}
                  <button
                    id="note-ai-quiz-bridge-btn"
                    onClick={handleRunNoteQuiz}
                    disabled={isGeneratingQuiz}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Play className={`w-3.5 h-3.5 ${isGeneratingQuiz ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingQuiz ? 'Building Quiz...' : 'Note-to-Quiz'}</span>
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar (Edit Mode) */}
              {viewMode === 'edit' && (
                <div className="flex items-center gap-1 pb-1 border-b border-slate-800 text-slate-400 flex-wrap">
                  <button
                    type="button"
                    onClick={() => insertFormatting('## ')}
                    className="p-1 rounded-sm hover:bg-slate-800 text-xs font-bold hover:text-white"
                    title="Heading 2"
                  >
                    <Heading className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('**Bold Text**')}
                    className="p-1 rounded-sm hover:bg-slate-800 hover:text-white"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('*Italic Text*')}
                    className="p-1 rounded-sm hover:bg-slate-800 hover:text-white"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('- ')}
                    className="p-1 rounded-sm hover:bg-slate-800 hover:text-white"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('> ')}
                    className="p-1 rounded-sm hover:bg-slate-800 hover:text-white"
                    title="Blockquote"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('$$', '$$')}
                    className="p-1 rounded-sm hover:bg-slate-800 hover:text-indigo-300"
                    title="Math Equation ($$ ... $$)"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('```c\n// Code snippet\n```')}
                    className="p-1 rounded-sm hover:bg-slate-800 hover:text-white"
                    title="Code Block"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Note Content View / Editor */}
              {viewMode === 'edit' ? (
                <textarea
                  rows={13}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 font-mono text-xs text-slate-200 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
                  placeholder="Write notes with markdown, LaTeX formulas ($$...$$), and code snippets..."
                />
              ) : (
                <div className="w-full p-4 font-sans text-xs sm:text-sm text-slate-200 bg-slate-950 border border-slate-800 rounded-sm leading-relaxed max-h-[500px] overflow-y-auto space-y-3">
                  <div className="whitespace-pre-wrap font-sans leading-relaxed">
                    {cleanAndFormatMath(content)}
                  </div>
                </div>
              )}

              {/* Tags & Footer Info */}
              <div className="flex items-center justify-between gap-3 text-slate-400">
                <div className="flex items-center gap-2 flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Tags (comma-separated, e.g. Derivations, Exam-Prep, Pointers)"
                    className="w-full text-xs font-mono text-slate-300 border-none focus:outline-none bg-transparent"
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 shrink-0">
                  {wordCount} words · {charCount} chars
                </div>
              </div>

              {/* AI Generated Summary & Key Takeaways Drawer */}
              {activeNote.summary && (
                <div className="p-4 rounded-md bg-purple-950/40 border border-purple-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="font-mono uppercase tracking-wider text-[10px]">AI Executive Synthesis</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cleanAndFormatMath(activeNote.summary)}
                  </p>

                  {activeNote.keyTakeaways && activeNote.keyTakeaways.length > 0 && (
                    <div className="pt-2 border-t border-purple-800/60 space-y-1">
                      <p className="text-[10px] font-bold font-mono uppercase tracking-wider text-purple-300">
                        High-Yield Key Takeaways
                      </p>
                      <ul className="space-y-1">
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
              <div className="flex items-center gap-3 pt-2">
                {activeNote.flashcards && activeNote.flashcards.length > 0 && (
                  <button
                    onClick={() => setActiveDeck(activeNote.flashcards || null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-950 text-slate-300 border border-slate-800 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Launch Flashcards ({activeNote.flashcards.length})</span>
                  </button>
                )}

                {activeNote.quiz && (
                  <button
                    onClick={() => setActiveQuiz(activeNote.quiz || null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-purple-950/80 text-purple-300 border border-purple-800 text-xs font-semibold hover:bg-purple-900 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-purple-400" />
                    <span>Launch Saved Quiz ({activeNote.quiz.questions.length} Qs)</span>
                  </button>
                )}
              </div>
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
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full p-6 space-y-5 text-slate-100 shadow-2xl">
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
                <span>Select Subject to add this note to:</span>
                <span className="text-[10px] font-mono text-slate-400">Assigns to active syllabus or elective library</span>
              </label>
              <select
                value={aiGenTargetSubject}
                onChange={(e) => setAiGenTargetSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500 font-sans cursor-pointer"
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
                    className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-sm text-purple-300 hover:bg-slate-800 font-mono text-left truncate max-w-xs cursor-pointer"
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
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
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
                  className={`p-2.5 rounded-sm border text-left space-y-1 transition-all cursor-pointer ${
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
                  className={`p-2.5 rounded-sm border text-left space-y-1 transition-all cursor-pointer ${
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
                  className={`p-2.5 rounded-sm border text-left space-y-1 transition-all cursor-pointer ${
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
                  className={`p-2.5 rounded-sm border text-left space-y-1 transition-all cursor-pointer ${
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
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
              />

              <textarea
                rows={4}
                value={aiGenAttachedText}
                onChange={(e) => setAiGenAttachedText(e.target.value)}
                placeholder="Paste raw PDF text, textbook excerpt, or lecture transcript here..."
                className="w-full p-2.5 font-mono text-xs text-slate-200 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-purple-500 leading-relaxed"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 disabled:opacity-50 shadow-md cursor-pointer"
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
