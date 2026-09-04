import React, { useState } from 'react';
import {
  usePersonalizedNotesRealtime,
  SupabaseNoteRow,
  NoteStatus
} from '../../lib/supabase';
import { MathRenderer } from '../Common/MathRenderer';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Radio,
  FileText,
  Eye,
  Send,
  Zap,
  Tag,
  Cpu,
  Layers
} from 'lucide-react';

interface PersonalizedNoteFeedProps {
  userId?: string;
  userName?: string;
  onSelectNote?: (note: SupabaseNoteRow) => void;
}

export const PersonalizedNoteFeed: React.FC<PersonalizedNoteFeedProps> = ({
  userId = 'student-1',
  userName = 'Student'
}) => {
  const [activeTabMap, setActiveTabMap] = useState<Record<string, 'personalized' | 'generalized' | 'raw'>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time subscription hook
  const { notes, isLoading, error, connectionStatus, uploadNote, refetch } =
    usePersonalizedNotesRealtime({
      userId,
      onNoteReady: (note) => {
        setToastMessage(`✨ Note "${note.title}" has been personalized by Gemini!`);
        setTimeout(() => setToastMessage(null), 5000);
      }
    });

  const getNoteTab = (noteId: string): 'personalized' | 'generalized' | 'raw' => {
    return activeTabMap[noteId] || 'personalized';
  };

  const setNoteTab = (noteId: string, tab: 'personalized' | 'generalized' | 'raw') => {
    setActiveTabMap(prev => ({ ...prev, [noteId]: tab }));
  };

  // Status Badge Helper
  const renderStatusBadge = (status: NoteStatus) => {
    switch (status) {
      case 'uploaded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Uploaded — Queued
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            AI Personalizing (Gemini 2.5 Flash)...
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Personalized & Ready
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Personalization Failed
          </span>
        );
    }
  };

  // Quick action: Simulate Python desktop client upload
  const handleSimulateDesktopPush = async () => {
    setIsSimulating(true);
    const demoTitles = [
      'Newton’s Laws & Inclined Plane Dynamics',
      'Rotational Kinematics & Moment of Inertia',
      'Thermodynamic Heat Engines & Carnot Cycle',
      'Electromagnetic Induction & Faraday’s Flux'
    ];
    const chosenTitle = demoTitles[Math.floor(Math.random() * demoTitles.length)];

    const result = await uploadNote({
      userId,
      title: chosenTitle,
      generalised_notes: `Teacher derived normal reaction $N = mg\\cos\\theta$ and acceleration $a = g(\\sin\\theta - \\mu_k\\cos\\theta)$ for mass $m=5\\text{ kg}$ on $\\theta=30^\\circ$ slope with friction $\\mu_k = 0.2$. Emphasized drawing isolated Free Body Diagrams before balancing axes.`,
      raw_ocr_text: `[OCR Frame 00:21:05] Board 1: N - mg cos 30 = 0 => N = mg cos 30. mg sin 30 - f_k = m a. f_k = mu_k * N. a = g(sin 30 - 0.2 cos 30). a = 3.20 m/s^2. Homework: HCV Ch 5 Q 4-9.`,
      metadata: {
        source: 'VisionNote Desktop Client',
        weakConcepts: ['Normal force resolution', 'Free Body Diagram balance'],
        explanationTone: 'Supportive exam coach'
      }
    });

    setIsSimulating(false);
    if (!result.success) {
      alert(`Simulation failed: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-100 rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              VisionNote Real-time AI Stream
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <Radio
                className={`w-3 h-3 ${
                  connectionStatus === 'CONNECTED'
                    ? 'text-emerald-400 animate-pulse'
                    : connectionStatus === 'CONNECTING'
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              />
              <span>{connectionStatus}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Realtime updates from Python desktop OCR client &rarr; Supabase DB Webhook &rarr; Gemini 2.5 Flash
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSimulateDesktopPush}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-950/40 transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-cyan-200" />
            {isSimulating ? 'Simulating Push...' : 'Simulate Desktop OCR Push'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Notes Stream Feed */}
      {notes.length === 0 && !isLoading ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/30 border border-slate-800/80">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No notes captured yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Push OCR lecture captures from the Python desktop client or click "Simulate Desktop OCR Push" above to test the real-time pipeline.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map(note => {
            const currentTab = getNoteTab(note.id);
            const isReady = note.status === 'ready';

            return (
              <div
                key={note.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-md backdrop-blur-md"
              >
                {/* Note Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>ID: {note.id.slice(0, 8)}...</span>
                      <span>•</span>
                      <span>Captured: {new Date(note.created_at).toLocaleTimeString()}</span>
                      {note.updated_at && note.updated_at !== note.created_at && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-400">Updated: {new Date(note.updated_at).toLocaleTimeString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">{renderStatusBadge(note.status)}</div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 pt-3 pb-3">
                  <button
                    onClick={() => setNoteTab(note.id, 'personalized')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      currentTab === 'personalized'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Personalized Note
                  </button>

                  <button
                    onClick={() => setNoteTab(note.id, 'generalized')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      currentTab === 'generalized'
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Generalized Notes
                  </button>

                  <button
                    onClick={() => setNoteTab(note.id, 'raw')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      currentTab === 'raw'
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Raw OCR
                  </button>
                </div>

                {/* Tab Content Display */}
                <div className="mt-2 p-4 rounded-xl bg-[#0b101b] border border-slate-800/80 text-sm text-slate-200 leading-relaxed">
                  {currentTab === 'personalized' && (
                    <div>
                      {note.status === 'processing' ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-amber-300 gap-3">
                          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                          <p className="text-sm font-semibold">
                            Gemini 2.5 Flash is analyzing your lecture blackboard notes...
                          </p>
                          <p className="text-xs text-slate-400">
                            Constructing conceptual scaffolding, KaTeX equations, and mental models.
                          </p>
                        </div>
                      ) : note.status === 'uploaded' ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-sky-300 gap-2">
                          <Clock className="w-6 h-6 text-sky-400 animate-pulse" />
                          <p className="text-sm">Note queued for edge function execution.</p>
                        </div>
                      ) : note.status === 'failed' ? (
                        <div className="p-4 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-500/20 text-xs">
                          <p className="font-semibold text-sm mb-1">Personalization Error:</p>
                          <p>{note.error_message || 'Could not complete personalization.'}</p>
                        </div>
                      ) : note.personalised_notes ? (
                        <div className="prose prose-invert max-w-none text-slate-200">
                          <MathRenderer content={note.personalised_notes} />
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No personalized notes available.</p>
                      )}
                    </div>
                  )}

                  {currentTab === 'generalized' && (
                    <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
                      <MathRenderer content={note.generalised_notes} />
                    </div>
                  )}

                  {currentTab === 'raw' && (
                    <div className="font-mono text-xs text-cyan-300/90 whitespace-pre-wrap bg-black/40 p-3 rounded-lg border border-cyan-900/30">
                      {note.raw_ocr_text || '(No raw OCR text attached)'}
                    </div>
                  )}
                </div>

                {/* Metadata tags footer */}
                {note.metadata && Object.keys(note.metadata).length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Tag className="w-3 h-3" /> Metadata:
                    </span>
                    {Object.entries(note.metadata).map(([key, val]) => (
                      <span
                        key={key}
                        className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300"
                      >
                        {key}: {Array.isArray(val) ? val.join(', ') : String(val)}
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
  );
};
