import React, { useState } from 'react';
import { ReferenceResource } from '../../types';
import {
  UploadCloud,
  FileText,
  BookOpen,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Plus,
  Sparkles,
  Tag,
  Share2,
  FileSpreadsheet
} from 'lucide-react';

interface ResourceUploaderViewProps {
  resources: ReferenceResource[];
  onUploadResource: (resource: Omit<ReferenceResource, 'id' | 'dateAdded'>) => void;
}

export const ResourceUploaderView: React.FC<ResourceUploaderViewProps> = ({
  resources,
  onUploadResource
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('subj-ess');
  const [category, setCategory] = useState<'Textbook' | 'Lecture Notes' | 'Research Paper' | 'Video Guide' | 'Lab Manual'>('Lecture Notes');
  const [description, setDescription] = useState('');
  const [keyTopics, setKeyTopics] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUploading(true);
    setTimeout(() => {
      onUploadResource({
        title: title.trim(),
        subjectId,
        category,
        url: '#',
        author: 'Dr. Sanmitra Bhattacharya (Faculty)',
        description: description.trim() || 'Official faculty reference material published on EduSync.',
        keyTopics: keyTopics ? keyTopics.split(',').map(t => t.trim()).filter(Boolean) : ['Course Syllabus', 'Reference']
      });

      setTitle('');
      setDescription('');
      setKeyTopics('');
      setFileName('');
      setIsUploading(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">Resource successfully synced to student feed!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl shrink-0">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Upload Documents</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Shared with Students
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Upload study notes, question papers, formula sheets, and lab guides directly for your students to view and download.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form (Left 1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Upload Documents Here</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Fill in the details below to publish documents directly to students.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-cyan-200 font-mono font-bold text-[11px] uppercase tracking-wider mb-1.5">Select Subject:</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
              >
                <option value="subj-ess">ES-101: Environmental Studies & Sustainability</option>
                <option value="subj-eme">ME-102: Engineering Thermodynamics</option>
                <option value="subj-ess-lab">ES-101L: Environmental Systems Lab</option>
              </select>
            </div>

            <div>
              <label className="block text-cyan-200 font-mono font-bold text-[11px] uppercase tracking-wider mb-1.5">Document Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 4 Carnot Cycle Revision Sheet"
                required
                className="w-full bg-slate-950 border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-400 font-medium focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
              />
            </div>

            <div>
              <label className="block text-cyan-200 font-mono font-bold text-[11px] uppercase tracking-wider mb-1.5">Document Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700/90 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
              >
                <option value="Lecture Notes">Lecture Notes & Handouts</option>
                <option value="Lab Manual">Lab Manual & Protocol</option>
                <option value="Textbook">Textbook Reference Excerpt</option>
                <option value="Research Paper">Case Study / Research Paper</option>
                <option value="Video Guide">Video Reference Link</option>
              </select>
            </div>

            <div>
              <label className="block text-cyan-200 font-mono font-bold text-[11px] uppercase tracking-wider mb-1.5">Choose File (PDF, Word, or Slides):</label>
              <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-3 text-center bg-slate-950/60 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1 py-1">
                  <UploadCloud className="w-5 h-5 text-emerald-400" />
                  <span className="text-[11px] font-medium text-slate-300">
                    {fileName ? (
                      <span className="text-emerald-300 font-bold font-mono truncate max-w-xs block">{fileName}</span>
                    ) : (
                      'Click to browse or drop file here'
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">PDF, DOCX, PPTX up to 25MB</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-cyan-200 font-mono font-bold text-[11px] uppercase tracking-wider mb-1.5">Short Description or Notes for Students:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Add brief tips or what students should focus on..."
                className="w-full bg-slate-950 border border-slate-700/90 rounded-xl px-3.5 py-2 text-white placeholder-slate-400 font-medium focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-cyan-200 font-mono font-bold text-[11px] uppercase tracking-wider mb-1.5">Topic Keywords (separated by commas):</label>
              <input
                type="text"
                value={keyTopics}
                onChange={(e) => setKeyTopics(e.target.value)}
                placeholder="e.g. Carnot Cycle, Entropy, Formula Sheet"
                className="w-full bg-slate-950 border border-slate-700/90 rounded-xl px-3.5 py-2 text-white placeholder-slate-400 font-medium focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading || !title.trim()}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/25 border border-emerald-400/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <span>Uploading Document...</span>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-emerald-200" />
                  <span>Upload Document to Students</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Uploaded Documents Directory (Right 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-750 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">Active Synchronized Study Materials</h3>
                <p className="text-xs text-slate-300">Materials currently live on enrolled students' devices</p>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-slate-950 text-cyan-200 border border-cyan-500/30">
                {resources.length} Materials Live
              </span>
            </div>

            <div className="space-y-3">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-slate-950/90 border border-slate-750 hover:border-emerald-500/50 rounded-2xl p-4 transition-all shadow-md flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="p-3 bg-slate-800/90 text-emerald-300 rounded-xl shrink-0 border border-emerald-500/30 shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-200 border border-emerald-500/50">
                          {res.category}
                        </span>
                        <span className="text-[10px] text-cyan-200 font-mono">
                          Added: {res.dateAdded}
                        </span>
                        <span className="text-[10px] text-emerald-300 font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Synced with class
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-white tracking-tight">
                        {res.title}
                      </h4>

                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                        {res.description}
                      </p>

                      {res.keyTopics && res.keyTopics.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                          {res.keyTopics.map((topic, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-slate-900 text-cyan-200 border border-slate-700/80"
                            >
                              #{topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <button
                      onClick={() => alert(`Opening preview for: ${res.title}`)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-700 shadow-xs flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
