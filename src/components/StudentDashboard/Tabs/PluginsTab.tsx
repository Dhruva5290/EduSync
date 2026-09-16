import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Trash2,
  Plus
} from 'lucide-react';

export const PluginsTab: React.FC = () => {
  const [autoSyncClassroom, setAutoSyncClassroom] = useState<boolean>(true);
  const [syncCalendarAlerts, setSyncCalendarAlerts] = useState<boolean>(true);
  const [emailDigest, setEmailDigest] = useState<boolean>(false);
  const [realtimeOCR, setRealtimeOCR] = useState<boolean>(true);

  const [customTutors, setCustomTutors] = useState<Array<{ id: string; name: string; tagline: string; prompt: string }>>(() => {
    try {
      const saved = localStorage.getItem('classsarthi_custom_tutors');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'tut-w-lewin',
        name: 'Prof. Walter Lewin',
        tagline: 'Intuitive Demonstrations & High School Physics',
        prompt: 'Always begin with a real-world demonstration, show why common misconceptions fail, and derive equations from first principles.'
      }
    ];
  });

  const [tutorName, setTutorName] = useState('');
  const [tutorTagline, setTutorTagline] = useState('');
  const [tutorPrompt, setTutorPrompt] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('classsarthi_custom_tutors', JSON.stringify(customTutors));
  }, [customTutors]);

  const handleAddTutor = () => {
    if (!tutorName.trim()) return;
    const newTutor = {
      id: `tut-${Date.now()}`,
      name: tutorName.trim(),
      tagline: tutorTagline.trim() || 'Custom Pedagogy',
      prompt: tutorPrompt.trim()
    };
    setCustomTutors(prev => [newTutor, ...prev]);
    setTutorName('');
    setTutorTagline('');
    setTutorPrompt('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRemoveTutor = (id: string) => {
    setCustomTutors(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Section 1: Automation Rules */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <span className="text-[#ea580c] text-xl font-bold">⚡</span>
          <h2 className="text-xl font-extrabold text-[#0b1c30] tracking-tight">Automation Rules</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rule 1 */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-sm text-[#0b1c30]">Auto-sync Google Classroom assignments</h3>
              <p className="text-xs text-slate-500">Pulls newly posted homework to your to-do feed</p>
            </div>
            <input
              type="checkbox"
              checked={autoSyncClassroom}
              onChange={() => setAutoSyncClassroom(!autoSyncClassroom)}
              className="w-5 h-5 rounded text-[#c2410c] focus:ring-[#c2410c] border-slate-300 cursor-pointer"
            />
          </div>

          {/* Rule 2 */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-sm text-[#0b1c30]">Sync Deadlines to Google Calendar</h3>
              <p className="text-xs text-slate-500">Pushes 15-min reminder before class or quiz</p>
            </div>
            <input
              type="checkbox"
              checked={syncCalendarAlerts}
              onChange={() => setSyncCalendarAlerts(!syncCalendarAlerts)}
              className="w-5 h-5 rounded text-[#c2410c] focus:ring-[#c2410c] border-slate-300 cursor-pointer"
            />
          </div>

          {/* Rule 3 */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-sm text-[#0b1c30]">Gmail Daily Study Digest</h3>
              <p className="text-xs text-slate-500">Morning email with pending tasks & streak</p>
            </div>
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={() => setEmailDigest(!emailDigest)}
              className="w-5 h-5 rounded text-[#c2410c] focus:ring-[#c2410c] border-slate-300 cursor-pointer"
            />
          </div>

          {/* Rule 4 */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-sm text-[#0b1c30]">ClassSarthi Live OCR Sync</h3>
              <p className="text-xs text-slate-500">Live whiteboard ingestion during lecture</p>
            </div>
            <input
              type="checkbox"
              checked={realtimeOCR}
              onChange={() => setRealtimeOCR(!realtimeOCR)}
              className="w-5 h-5 rounded text-[#c2410c] focus:ring-[#c2410c] border-slate-300 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Section 2: Add Custom Teacher / Tutor Persona */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-xl font-bold">
            🎓
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xl font-extrabold text-[#0b1c30] tracking-tight">Add Custom Teacher / Tutor Persona</h2>
            <p className="text-xs sm:text-sm text-slate-500">Create tailored AI teaching styles and custom teacher prompts for the AI Tutor</p>
          </div>
        </div>

        {/* Persona Creation Form */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">TEACHER / TUTOR NAME</label>
              <input
                type="text"
                value={tutorName}
                onChange={(e) => setTutorName(e.target.value)}
                placeholder="e.g. Prof. Walter Lewin, Dr. Feynman"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">SPECIALTY / TAGLINE</label>
              <input
                type="text"
                value={tutorTagline}
                onChange={(e) => setTutorTagline(e.target.value)}
                placeholder="e.g. Intuitive Demonstrations & High School Physics"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">CUSTOM PROMPT & TEACHING PHILOSOPHY</label>
            <textarea
              rows={4}
              value={tutorPrompt}
              onChange={(e) => setTutorPrompt(e.target.value)}
              placeholder="Describe how this tutor should explain concepts (e.g. Always begin with a real-world demonstration, show why common misconceptions fail, and derive equations from first principles)."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006947]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Custom Tutor saved!</span>
              </span>
            )}
            <button
              onClick={handleAddTutor}
              disabled={!tutorName.trim()}
              type="button"
              className="ml-auto inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#9333ea] hover:bg-[#7e22ce] disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Add Custom Tutor</span>
            </button>
          </div>
        </div>

        {/* Active Custom Tutors List */}
        <div className="flex flex-col gap-3 pt-2">
          <h3 className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            ACTIVE CUSTOM TUTORS ({customTutors.length})
          </h3>
          {customTutors.map(t => (
            <div key={t.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                  {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0b1c30]">{t.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold text-[10px]">{t.tagline}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">"{t.prompt}"</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveTutor(t.id)}
                type="button"
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer self-end sm:self-center"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
