import React, { useState } from 'react';
import {
  FileQuestion,
  Search,
  Filter,
  Plus,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { QuestionBankItem, Subject } from '../types';

interface QuestionBankViewProps {
  questions: QuestionBankItem[];
  subjects: Subject[];
  onAddQuestion?: (q: Omit<QuestionBankItem, 'id'>) => void;
  onPushToQuiz?: (q: QuestionBankItem) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questions,
  subjects,
  onAddQuestion,
  onPushToQuiz,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pushedMessage, setPushedMessage] = useState<string | null>(null);

  const filtered = questions.filter((q) => {
    const matchSubject = selectedSubjectId === 'all' || q.subjectId === selectedSubjectId;
    const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchSearch =
      searchQuery === '' ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchDiff && matchSearch;
  });

  const handlePush = (q: QuestionBankItem) => {
    if (onPushToQuiz) {
      onPushToQuiz(q);
    }
    setPushedMessage(`Problem on "${q.topic}" added to active student diagnostic quiz!`);
    setTimeout(() => setPushedMessage(null), 3000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#0051d5]">
              Faculty Assessment Core
            </span>
            <span className="text-xs text-[#5a4138]">HC Verma & Resnick Halliday Grounded</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-1">
            Standardized Question Repository
          </h1>
          <p className="text-sm text-[#5a4138]">
            Curated STEM derivation problems, textbook problem sets, and diagnostic question templates.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#5a4138]" />
          <input
            type="text"
            placeholder="Search questions, topics (e.g. Incline, L'Hopital)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold text-[#0b1c30] bg-transparent outline-none placeholder:text-[#5a4138]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5a4138]">
            <span>Subject:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl px-2.5 py-1 text-xs font-bold text-[#0b1c30] outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5a4138]">
            <span>Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl px-2.5 py-1 text-xs font-bold text-[#0b1c30] outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="Basic">Basic</option>
              <option value="Moderate">Moderate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {pushedMessage && (
        <div className="p-3 bg-[#e6f4ea] border border-[#006947]/30 text-[#006947] rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{pushedMessage}</span>
        </div>
      )}

      {/* Questions Grid */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#e2e8f0] hover:border-[#cbd5e1] p-6 shadow-xs transition-all space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eff4ff] text-[#0051d5]">
                  {item.subjectName}
                </span>
                <span className="text-xs font-bold text-[#0b1c30] bg-[#f8f9ff] px-2 py-0.5 rounded-md border border-[#e2e8f0]">
                  {item.topic}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    item.difficulty === 'Advanced'
                      ? 'bg-[#ffebee] text-[#ba1a1a]'
                      : item.difficulty === 'Moderate'
                      ? 'bg-[#fff3ea] text-[#a33900]'
                      : 'bg-[#e6f4ea] text-[#006947]'
                  }`}
                >
                  {item.difficulty}
                </span>
              </div>

              <span className="text-xs text-[#5a4138] italic">
                Source: {item.source}
              </span>
            </div>

            <p className="text-sm font-bold text-[#0b1c30] leading-relaxed">
              {item.question}
            </p>

            {item.sampleAnswer && (
              <div className="p-3 bg-[#f8f9ff] border border-[#eff4ff] rounded-xl text-xs space-y-1">
                <span className="font-bold text-[#0051d5] uppercase tracking-wider text-[10px]">
                  Model Derivation & Key Steps:
                </span>
                <p className="font-mono text-xs text-[#1e293b] leading-relaxed">
                  {item.sampleAnswer}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff]">
              <span className="text-[11px] text-[#5a4138]">
                ID: {item.id} • Aligned with CBSE & JEE Advanced Standards
              </span>

              <button
                onClick={() => handlePush(item)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                <span>Deploy to Student Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
