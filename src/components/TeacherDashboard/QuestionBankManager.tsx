import React, { useState } from 'react';
import { Subject, QuestionBank, QuizQuestion, User } from '../../types';
import {
  BookOpen,
  Plus,
  Upload,
  Trash2,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  AlertCircle,
  FileCode,
  Tag,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Filter
} from 'lucide-react';

interface QuestionBankManagerProps {
  currentUser?: User;
  subjects?: Subject[];
  activeSubjectId?: string;
  onSelectSubject?: (id: string) => void;
  questionBanks?: QuestionBank[];
  onSaveQuestionBank: (bank: QuestionBank) => Promise<void>;
  onDeleteQuestionBank: (bankId: string) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({
  currentUser,
  subjects,
  activeSubjectId,
  onSelectSubject,
  questionBanks,
  onSaveQuestionBank,
  onDeleteQuestionBank,
  onShowToast
}) => {
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const safeQuestionBanks = Array.isArray(questionBanks) ? questionBanks : [];
  const safeCurrentUser = currentUser || { id: 'teacher-phy', name: 'Faculty Instructor' };

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>(activeSubjectId || 'all');
  const [expandedBankIds, setExpandedBankIds] = useState<Set<string>>(new Set(['qb-phy-01', 'qb-che-01', 'qb-mat-01']));
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<'form' | 'json'>('form');

  // New Bank State
  const [newBankTitle, setNewBankTitle] = useState('');
  const [newBankSubjectId, setNewBankSubjectId] = useState(activeSubjectId || safeSubjects[0]?.id || 'subj-phy');
  const [newBankDescription, setNewBankDescription] = useState('');
  const [bankQuestions, setBankQuestions] = useState<QuizQuestion[]>([]);

  // Single Question Form State
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIdx, setCorrectIdx] = useState<number>(0);
  const [qTopic, setQTopic] = useState('');
  const [qDifficulty, setQDifficulty] = useState<'easy' | 'moderate' | 'hard'>('moderate');
  const [qExplanation, setQExplanation] = useState('');

  // JSON Paste State
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedBankIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddQuestionToDraft = () => {
    if (!qText.trim()) {
      onShowToast('Please enter the question text.', 'error');
      return;
    }
    if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      onShowToast('Please fill out all 4 options (A, B, C, and D).', 'error');
      return;
    }

    const newQ: QuizQuestion = {
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      question: qText.trim(),
      options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
      correctIndex: correctIdx,
      explanation: qExplanation.trim() || 'No detailed explanation provided.',
      topic: qTopic.trim() || 'Core Concept',
      difficulty: qDifficulty,
      source: 'teacher_question_bank',
      teacherName: safeCurrentUser.name
    };

    setBankQuestions(prev => [...prev, newQ]);
    // Clear form
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setQExplanation('');
    setQTopic('');
    onShowToast('Question added to draft bank!', 'success');
  };

  const handleApplyJson = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setJsonError('JSON must be an array of question objects.');
        return;
      }
      const validated: QuizQuestion[] = parsed.map((item, idx) => {
        if (!item?.question || !Array.isArray(item?.options) || item.options.length < 2) {
          throw new Error(`Question #${idx + 1} is missing a question string or options array.`);
        }
        return {
          id: item.id || `q-json-${Date.now()}-${idx}`,
          question: String(item.question),
          options: (item.options || []).map(String),
          correctIndex: typeof item.correctIndex === 'number' ? item.correctIndex : 0,
          explanation: item.explanation || 'Verified professor question.',
          topic: item.topic || 'General Topic',
          difficulty: item.difficulty || 'moderate',
          source: 'teacher_question_bank',
          teacherName: safeCurrentUser.name
        };
      });

      setBankQuestions(prev => [...prev, ...validated]);
      onShowToast(`Successfully parsed ${validated.length} questions from JSON!`, 'success');
      setJsonText('');
      setUploadMode('form');
    } catch (err: any) {
      setJsonError(err.message || 'Malformed JSON payload.');
    }
  };

  const handleSaveBank = async () => {
    if (!newBankTitle.trim()) {
      onShowToast('Please provide a title for the Question Bank.', 'error');
      return;
    }
    if (bankQuestions.length === 0) {
      onShowToast('Please add at least 1 question to the bank.', 'error');
      return;
    }

    const newBank: QuestionBank = {
      id: `qb-${Date.now()}`,
      subjectId: newBankSubjectId,
      title: newBankTitle.trim(),
      description: newBankDescription.trim() || 'Faculty curated question repository.',
      teacherId: safeCurrentUser.id,
      teacherName: safeCurrentUser.name,
      uploadedAt: new Date().toISOString(),
      questionsCount: bankQuestions.length,
      questions: bankQuestions
    };

    await onSaveQuestionBank(newBank);
    onShowToast(`Question Bank "${newBank.title}" saved! Available for AI student quizzes.`, 'success');
    // Reset modal
    setNewBankTitle('');
    setNewBankDescription('');
    setBankQuestions([]);
    setShowUploadModal(false);
  };

  const filteredBanks = selectedSubjectFilter === 'all'
    ? safeQuestionBanks
    : safeQuestionBanks.filter(qb => qb?.subjectId === selectedSubjectFilter);

  const getSubjectName = (subjId: string) => {
    const subj = safeSubjects.find(s => s?.id === subjId);
    return subj ? `${subj.code} · ${subj.name}` : subjId;
  };

  const totalQuestionsAllSubjects = safeQuestionBanks.reduce((acc, b) => {
    const qCount = Array.isArray(b?.questions) ? b.questions.length : (b?.questionsCount || 0);
    return acc + qCount;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-700/40 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-600/30 rounded-lg border border-blue-500/40">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Faculty Question Banks & AI Quiz Grounding Hub
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Upload curated multiple-choice questions for your subjects. When students launch an <strong>Interactive AI Quiz</strong> or practice from their study notes, the system grounds the assessment in your authentic departmental questions.
          </p>
        </div>

        <button
          onClick={() => {
            setNewBankSubjectId(activeSubjectId !== 'all' ? (activeSubjectId || safeSubjects[0]?.id || 'subj-phy') : (safeSubjects[0]?.id || 'subj-phy'));
            setShowUploadModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload / Create Question Bank</span>
        </button>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Filter by Subject:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedSubjectFilter('all')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              selectedSubjectFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Subjects ({totalQuestionsAllSubjects} Qs)
          </button>
          {safeSubjects.map(subj => {
            const count = safeQuestionBanks
              .filter(b => b?.subjectId === subj.id)
              .reduce((acc, b) => {
                const qCount = Array.isArray(b?.questions) ? b.questions.length : (b?.questionsCount || 0);
                return acc + qCount;
              }, 0);
            return (
              <button
                key={subj.id}
                onClick={() => setSelectedSubjectFilter(subj.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                  selectedSubjectFilter === subj.id
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                {subj.code} ({count} Qs)
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Banks List */}
      <div className="space-y-4">
        {filteredBanks.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl space-y-3">
            <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No Question Banks for this Subject</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your first question bank to allow the AI tutor to test students with your authentic curriculum questions.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-500 transition-all cursor-pointer"
            >
              Upload Question Bank Now
            </button>
          </div>
        ) : (
          filteredBanks.map(bank => {
            const isExpanded = expandedBankIds.has(bank.id);
            const questionsList = Array.isArray(bank?.questions) ? bank.questions : [];
            const questionsCount = questionsList.length || bank?.questionsCount || 0;

            return (
              <div
                key={bank.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all hover:border-slate-700"
              >
                {/* Bank Header Card */}
                <div
                  onClick={() => toggleExpand(bank.id)}
                  className="p-4 bg-slate-900 hover:bg-slate-800/60 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800/80"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-700">
                        {getSubjectName(bank.subjectId)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Active in Student AI Quizzes
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Uploaded by {bank.teacherName || 'Faculty'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{bank.title}</h3>
                    {bank.description && (
                      <p className="text-xs text-slate-400 leading-snug">{bank.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {questionsCount} Questions
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {bank.uploadedAt ? new Date(bank.uploadedAt).toLocaleDateString() : 'Active'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete question bank "${bank.title}"?`)) {
                          onDeleteQuestionBank(bank.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-all cursor-pointer"
                      title="Delete Question Bank"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <span className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </div>
                </div>

                {/* Expanded Questions View */}
                {isExpanded && (
                  <div className="p-4 space-y-3 bg-slate-950/50">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                      <span>Curated Questions ({questionsList.length})</span>
                      <span className="text-[11px] text-emerald-400">
                        ✓ Injected into Note-to-Quiz & AI Study Assistant
                      </span>
                    </div>

                    <div className="space-y-3">
                      {questionsList.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-3">No individual question entries stored in this bank.</p>
                      ) : (
                        questionsList.map((q, qIdx) => {
                          const optionsList = Array.isArray(q?.options) ? q.options : [];
                          return (
                            <div
                              key={q?.id || qIdx}
                              className="p-3 bg-slate-900/90 border border-slate-800/90 rounded-lg space-y-2 text-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-slate-200">
                                  <strong className="text-blue-400 font-mono">Q{qIdx + 1}.</strong> {q?.question || 'Question'}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                                    {q?.topic || 'General'}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                                    q?.difficulty === 'hard'
                                      ? 'bg-rose-950 text-rose-300'
                                      : q?.difficulty === 'moderate'
                                      ? 'bg-amber-950 text-amber-300'
                                      : 'bg-emerald-950 text-emerald-300'
                                  }`}>
                                    {q?.difficulty || 'moderate'}
                                  </span>
                                </div>
                              </div>

                              {/* Options grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                {optionsList.map((opt, oIdx) => {
                                  const isCorrect = oIdx === q?.correctIndex;
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`px-2.5 py-1.5 rounded flex items-center gap-2 border text-[11px] ${
                                        isCorrect
                                          ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200 font-medium'
                                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                                      }`}
                                    >
                                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-mono shrink-0 ${
                                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                                      }`}>
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span className="truncate">{opt}</span>
                                      {isCorrect && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation */}
                              {q?.explanation && (
                                <div className="pt-1.5 text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                                  <span className="font-semibold text-blue-300">Faculty Explanation: </span>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Upload / Create Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Upload / Create New Question Bank
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Question Bank Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kinematics & Laws of Motion Master Bank"
                  value={newBankTitle}
                  onChange={e => setNewBankTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Subject *
                </label>
                <select
                  value={newBankSubjectId}
                  onChange={e => setNewBankSubjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {safeSubjects.map(subj => (
                    <option key={subj.id} value={subj.id}>
                      {subj.code} — {subj.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Topic Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Curated for mid-term practice and JEE Advanced difficulty"
                  value={newBankDescription}
                  onChange={e => setNewBankDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Upload Method Switcher */}
            <div className="flex border-b border-slate-800 gap-4">
              <button
                type="button"
                onClick={() => setUploadMode('form')}
                className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  uploadMode === 'form'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                + Interactive Question Builder
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('json')}
                className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  uploadMode === 'json'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {'{ }'} Bulk JSON Upload / Paste
              </button>
            </div>

            {uploadMode === 'form' ? (
              <div className="space-y-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Question Prompt
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter question text or problem statement..."
                    value={qText}
                    onChange={e => setQText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Option A', val: optA, set: setOptA, idx: 0 },
                    { label: 'Option B', val: optB, set: setOptB, idx: 1 },
                    { label: 'Option C', val: optC, set: setOptC, idx: 2 },
                    { label: 'Option D', val: optD, set: setOptD, idx: 3 }
                  ].map(optItem => (
                    <div key={optItem.idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{optItem.label}</span>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="correctOpt"
                            checked={correctIdx === optItem.idx}
                            onChange={() => setCorrectIdx(optItem.idx)}
                            className="text-blue-500"
                          />
                          <span className={correctIdx === optItem.idx ? 'text-emerald-400 font-bold' : ''}>
                            Correct
                          </span>
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder={`Text for ${optItem.label}...`}
                        value={optItem.val}
                        onChange={e => optItem.set(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Topic Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Work-Energy Theorem"
                      value={qTopic}
                      onChange={e => setQTopic(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Difficulty</label>
                    <select
                      value={qDifficulty}
                      onChange={e => setQDifficulty(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="hard">Hard (Advanced)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    Faculty Explanation / Solution Steps
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apply conservation of momentum along x-axis..."
                    value={qExplanation}
                    onChange={e => setQExplanation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestionToDraft}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold rounded text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question to Current Draft</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Paste JSON Array of Questions:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setJsonText(JSON.stringify([
                        {
                          question: "What is the unit of magnetic flux in the SI system?",
                          options: ["Weber (Wb)", "Tesla (T)", "Henry (H)", "Gauss (G)"],
                          correctIndex: 0,
                          explanation: "Magnetic flux is measured in Webers (Wb = T * m^2).",
                          topic: "Electromagnetism",
                          difficulty: "easy"
                        }
                      ], null, 2));
                    }}
                    className="text-blue-400 hover:underline text-[11px]"
                  >
                    Insert Example JSON
                  </button>
                </div>
                <textarea
                  rows={6}
                  placeholder={`[\n  {\n    "question": "Question text here",\n    "options": ["Option A", "Option B", "Option C", "Option D"],\n    "correctIndex": 0,\n    "explanation": "Why option A is correct",\n    "topic": "Topic Name",\n    "difficulty": "moderate"\n  }\n]`}
                  value={jsonText}
                  onChange={e => setJsonText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
                {jsonError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{jsonError}</span>
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleApplyJson}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs transition-all cursor-pointer"
                >
                  Parse & Add JSON Questions
                </button>
              </div>
            )}

            {/* Staged Questions Counter */}
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">
                Total Staged Questions: <strong className="text-blue-400 font-bold">{bankQuestions.length}</strong>
              </span>
              {bankQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBankQuestions([])}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Clear All ({bankQuestions.length})
                </button>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBank}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Save & Deploy to Student AI Quizzes ({bankQuestions.length} Qs)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
