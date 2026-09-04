import React, { useState, useEffect, useMemo } from 'react';
import { BoardCapture, Subject } from '../../types';
import { MathRenderer } from '../Common/MathRenderer';
import { Camera, Clock, Maximize2, Search, Filter, ArrowRight, X, ExternalLink } from 'lucide-react';

interface BoardVisualsHubProps {
  subjects: Subject[];
  onOpenLecture: (lectureId: string, timestamp?: string) => void;
}

export const BoardVisualsHub: React.FC<BoardVisualsHubProps> = ({
  subjects,
  onOpenLecture
}) => {
  const [captures, setCaptures] = useState<BoardCapture[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCaptures = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedSubject !== 'all') queryParams.set('subjectId', selectedSubject);
        const res = await fetch(`/api/board-captures?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCaptures(data.captures || []);
        }
      } catch (err) {
        console.error('Failed to fetch board captures:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCaptures();
  }, [selectedSubject]);

  const filteredCaptures = useMemo(() => {
    if (!searchQuery.trim()) return captures;
    const q = searchQuery.toLowerCase();
    return captures.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.conceptTag.toLowerCase().includes(q) ||
      c.explanation.toLowerCase().includes(q) ||
      c.lectureTitle.toLowerCase().includes(q)
    );
  }, [captures, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Classroom Camera Studio
              </span>
              <span className="text-[11px] font-mono text-slate-400">ClassSarthi Ingested</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Blackboard Visuals & Diagram Gallery
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Browse actual high-resolution blackboard captures organized by subject, lecture, and timestamp. Inspect mathematical equations, vector diagrams, and chemical mechanisms.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All Subjects
            </button>
            {subjects.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  selectedSubject === s.id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {s.code}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search concepts or equations..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Visuals Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading board captures...</div>
      ) : filteredCaptures.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs">No blackboard captures found matching your filter.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCaptures.map(capture => (
            <div
              key={capture.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-md group"
            >
              <div className="space-y-3">
                {/* Image Container with Zoom */}
                <div
                  className="relative rounded-lg overflow-hidden border border-slate-800 cursor-pointer group"
                  onClick={() => setLightboxImage(capture.imageUrl)}
                >
                  <img
                    src={capture.imageUrl}
                    alt={capture.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-cyan-300 border border-white/10 backdrop-blur-xs">
                      {capture.subjectName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-amber-300 border border-white/10 backdrop-blur-xs flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {capture.timestamp}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-blue-400">{capture.conceptTag}</span>
                  <h3 className="text-sm font-bold text-white leading-snug">{capture.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{capture.explanation}</p>
                </div>

                {capture.ocrLatex && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono">
                    <MathRenderer content={`$$${capture.ocrLatex}$$`} isBlock />
                  </div>
                )}
              </div>

              {/* Jump to Lecture Timeline Action */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onOpenLecture(capture.lectureId, capture.timestamp)}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Jump to Class ({capture.timestamp})</span>
                </button>
                <button
                  onClick={() => setLightboxImage(capture.imageUrl)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Expand Image"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
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
            <img src={lightboxImage} alt="Enlarged Blackboard Frame" className="rounded-xl max-h-[85vh] object-contain border border-slate-700 shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
