import React, { useState } from 'react';
import { StudentNote, Subject, Flashcard, GeneratedQuiz } from '../../types';
import { InteractiveQuizModal } from './InteractiveQuizModal';
import { FlashcardDeckModal } from './FlashcardDeckModal';
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
  HelpCircle,
  Play,
  Save,
  Layers,
  Search
} from 'lucide-react';

interface SmartNotePlaygroundProps {
  activeSubject: Subject;
  notes: StudentNote[];
  onSaveNote: (note: Partial<StudentNote>) => Promise<StudentNote>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onSummarizeNote: (noteId: string, content: string) => Promise<{ summary: string; keyTakeaways: string[] }>;
  onGenerateFlashcards: (noteId: string, content: string) => Promise<Flashcard[]>;
  onGenerateQuizFromNote: (noteId: string, content: string, title: string) => Promise<GeneratedQuiz>;
}

export const SmartNotePlayground: React.FC<SmartNotePlaygroundProps> = ({
  activeSubject,
  notes,
  onSaveNote,
  onDeleteNote,
  onSummarizeNote,
  onGenerateFlashcards,
  onGenerateQuizFromNote
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);
  const [searchQuery, setSearchQuery] = useState('');

  // Active note editor state
  const activeNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  const [title, setTitle] = useState(activeNote?.title || 'New Study Note');
  const [content, setContent] = useState(activeNote?.content || '');
  const [tagsInput, setTagsInput] = useState(activeNote?.tags?.join(', ') || '');
  const [isPinned, setIsPinned] = useState(activeNote?.isPinned || false);

  // AI loading states
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Active Modals
  const [activeQuiz, setActiveQuiz] = useState<GeneratedQuiz | null>(null);
  const [activeDeck, setActiveDeck] = useState<Flashcard[] | null>(null);

  // Update local state when active note changes
  React.useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setTagsInput(activeNote.tags.join(', '));
      setIsPinned(activeNote.isPinned);
    }
  }, [selectedNoteId, activeNote?.id]);

  const handleSelectNote = (n: StudentNote) => {
    setSelectedNoteId(n.id);
  };

  const handleCreateNewNote = async () => {
    const created = await onSaveNote({
      subjectId: activeSubject.id,
      title: 'Untitled Lecture Note',
      content: `# Notes: ${activeSubject.name}\n\n## 1. Core Principles\n- Define concepts...\n\n\`\`\`c\n// Code snippet\n\`\`\`\n`,
      tags: ['General', 'Exam Prep'],
      isPinned: false
    });
    setSelectedNoteId(created.id);
  };

  const handleSaveCurrent = async () => {
    if (!activeNote) return;
    await onSaveNote({
      id: activeNote.id,
      subjectId: activeSubject.id,
      title,
      content,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      isPinned
    });
  };

  // AI Summarization Action
  const handleRunSummarize = async () => {
    if (!activeNote) return;
    setIsSummarizing(true);
    try {
      const res = await onSummarizeNote(activeNote.id, content);
      // local update
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
      const cards = await onGenerateFlashcards(activeNote.id, content);
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
      const quiz = await onGenerateQuizFromNote(activeNote.id, content, title);
      activeNote.quiz = quiz;
      setActiveQuiz(quiz);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Markdown Formatting Helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    setContent(prev => prev + `\n${prefix} ` + suffix);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm text-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-blue-950 text-blue-300 border border-blue-800">
              {activeSubject.code}
            </span>
            <h2 className="text-base font-bold uppercase tracking-tight text-white">
              Smart Note-Making & Synthesis Playground
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured subject notes with one-click AI summarization, flashcards, and Note-to-Quiz testing.
          </p>
        </div>

        <button
          id="notes-create-new-btn"
          onClick={handleCreateNewNote}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Note</span>
        </button>
      </div>

      {/* Main Split Layout: Left Notes Sidebar, Right Note Editor & AI Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Notes Browser */}
        <div className="lg:col-span-4 bg-slate-900 p-4 rounded-md border border-slate-800 shadow-sm space-y-4 text-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes or tags..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No notes found. Create your first note above!
              </div>
            ) : (
              filteredNotes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleSelectNote(n)}
                  className={`p-3.5 rounded-md border transition-all cursor-pointer space-y-1.5 ${
                    activeNote?.id === n.id
                      ? 'bg-blue-950/80 border-blue-700 shadow-xs text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white truncate">
                      {n.title}
                    </h4>
                    {n.isPinned && <Pin className="w-3 h-3 text-blue-400 fill-blue-400 shrink-0" />}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {n.summary || n.content.replace(/[#*`]/g, '')}
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
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Rich Note Editor & AI Action Toolbar */}
        <div className="lg:col-span-8 bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm space-y-5 text-slate-100">
          {activeNote ? (
            <div className="space-y-4">
              {/* Note Title & Header Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="font-bold text-base text-white bg-transparent focus:outline-none w-full tracking-tight"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    className={`p-1.5 rounded-sm border transition-colors ${
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-sm text-xs font-semibold hover:bg-blue-500 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>

                  <button
                    onClick={() => onDeleteNote(activeNote.id)}
                    className="p-1.5 rounded-sm border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* AI Powered Superpowers Bar */}
              <div className="p-3 bg-slate-950 rounded-md border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-200">Gemini AI Actions:</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* 1. Summarize */}
                  <button
                    id="note-ai-summarize-btn"
                    onClick={handleRunSummarize}
                    disabled={isSummarizing}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-blue-400 ${isSummarizing ? 'animate-spin' : ''}`} />
                    <span>{isSummarizing ? 'Summarizing...' : 'AI Summary'}</span>
                  </button>

                  {/* 2. Flashcards */}
                  <button
                    id="note-ai-flashcards-btn"
                    onClick={handleRunFlashcards}
                    disabled={isGeneratingCards}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50"
                  >
                    <Layers className={`w-3.5 h-3.5 text-blue-400 ${isGeneratingCards ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingCards ? 'Generating...' : 'Flashcards'}</span>
                  </button>

                  {/* 3. Note-to-Quiz Bridge */}
                  <button
                    id="note-ai-quiz-bridge-btn"
                    onClick={handleRunNoteQuiz}
                    disabled={isGeneratingQuiz}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all shadow-xs disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${isGeneratingQuiz ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingQuiz ? 'Generating...' : 'Note-to-Quiz'}</span>
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 pb-1 border-b border-slate-800 text-slate-400">
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
                  onClick={() => insertFormatting('```c\n// Code snippet\n```')}
                  className="p-1 rounded-sm hover:bg-slate-800 hover:text-white"
                  title="Code Block"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Note Content Textarea */}
              <textarea
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 font-mono text-xs text-slate-200 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
                placeholder="Start writing notes with markdown formatting..."
              />

              {/* Tags Editor */}
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Tags (comma-separated, e.g. Functions, Memory, Arrays)"
                  className="w-full text-xs font-mono text-slate-300 border-none focus:outline-none bg-transparent"
                />
              </div>

              {/* AI Generated Summary & Key Takeaways Drawer */}
              {activeNote.summary && (
                <div className="p-4 rounded-md bg-blue-950/50 border border-blue-800 space-y-2">
                  <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="font-mono uppercase tracking-wider text-[10px]">AI Executive Synthesis</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeNote.summary}
                  </p>

                  {activeNote.keyTakeaways && activeNote.keyTakeaways.length > 0 && (
                    <div className="pt-2 border-t border-blue-800/80 space-y-1">
                      <p className="text-[10px] font-bold font-mono uppercase tracking-wider text-blue-300">
                        High-Yield Key Takeaways
                      </p>
                      <ul className="space-y-1">
                        {activeNote.keyTakeaways.map((takeaway, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>{takeaway}</span>
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-950 text-slate-300 border border-slate-800 text-xs font-semibold hover:bg-slate-800"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Launch Flashcards ({activeNote.flashcards.length})</span>
                  </button>
                )}

                {activeNote.quiz && (
                  <button
                    onClick={() => setActiveQuiz(activeNote.quiz || null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-950 text-blue-300 border border-blue-800 text-xs font-semibold hover:bg-blue-900"
                  >
                    <Play className="w-3.5 h-3.5 text-blue-400" />
                    <span>Launch Saved Quiz ({activeNote.quiz.questions.length} Qs)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              Select or create a study note to begin.
            </div>
          )}
        </div>
      </div>

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
