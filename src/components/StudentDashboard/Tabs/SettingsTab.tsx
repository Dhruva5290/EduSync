import React, { useState } from 'react';
import { User } from '../../../types';
import { useStudentContext } from '../../../context/StudentContext';
import {
  Sparkles,
  Save,
  CheckCircle2
} from 'lucide-react';

interface SettingsTabProps {
  currentUser: User;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ currentUser }) => {
  const { learningStyle, setLearningStyle } = useStudentContext();

  const [selectedStyle, setSelectedStyle] = useState<string>(
    currentUser.learningProfile?.learningStyle || learningStyle || 'visual'
  );
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    setApiKeyStatus('saving');
    try {
      const res = await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      if (res.ok) {
        setApiKeyStatus('saved');
        setApiKey('');
        setTimeout(() => setApiKeyStatus('idle'), 3000);
      } else {
        setApiKeyStatus('error');
      }
    } catch (e) {
      setApiKeyStatus('error');
    }
  };

  const handleSave = () => {
    setLearningStyle(selectedStyle as any);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const explanationStyles = [
    {
      id: 'visual',
      title: 'Visual Explanations',
      desc: 'Emphasizes diagrams, blackboard vectors, and spatial animations.'
    },
    {
      id: 'step_by_step',
      title: 'Step-by-Step Derivations',
      desc: 'Detailed mathematical proofs and sequential breakdown.'
    },
    {
      id: 'socratic',
      title: 'Socratic Dialogue',
      desc: 'Guiding questions that help you derive the answers yourself.'
    },
    {
      id: 'exam_focused',
      title: 'Exam-Focused Preparation',
      desc: 'High-yield numerical tricks, common traps, and formulas.'
    }
  ];

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-[1060px] mx-auto w-full animate-in fade-in duration-200">
      {/* HeaderCard */}
      <header className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl select-none">⚙️</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Student Settings & Preferences
          </h1>
        </div>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 font-normal">
          Manage your account profile, AI explanation styles, and ClassSarthi cloud synchronization
        </p>
      </header>

      {/* StudentProfileCard */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0284c7] font-bold text-lg flex items-center justify-center shadow-2xs border border-blue-100">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0f172a]">{currentUser.name}</h2>
            <div className="flex items-center text-xs text-slate-500 font-medium mt-0.5 space-x-1.5 flex-wrap">
              <span>{currentUser.email}</span>
              <span>•</span>
              <span>ID: BMU-2026-7052</span>
            </div>
          </div>
        </div>

        {/* Academic Information Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Department / Grade:</span>
            <span className="text-sm font-bold text-[#0f172a]">School of Engineering & Technology</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Program:</span>
            <span className="text-sm font-bold text-[#0f172a]">CBSE / Competitive JEE-NEET Track</span>
          </div>
        </div>
      </section>

      {/* LearningPreferencesCard */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <Sparkles className="w-5 h-5 text-[#0d9488]" />
          <h3 className="text-base font-bold text-[#0f172a]">Learning Preferences (Explanation Style)</h3>
        </div>

        {/* Grid of Explanation Style Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {explanationStyles.map(style => {
            const isSel = selectedStyle === style.id;

            return (
              <label
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`relative flex items-start gap-3.5 p-5 rounded-2xl border-2 transition cursor-pointer ${
                  isSel
                    ? 'border-[#2563eb] bg-[#eff6ff] shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSel ? 'border-[#2563eb]' : 'border-slate-400'
                }`}>
                  {isSel && <div className="w-2 h-2 rounded-full bg-[#2563eb]" />}
                </div>
                <div>
                  <span className="block text-sm font-bold text-[#0f172a]">{style.title}</span>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{style.desc}</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
          <div>
            {savedToast && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006947] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Preferences saved successfully!</span>
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs px-6 py-3 rounded-full shadow-sm transition active:scale-95 cursor-pointer"
            type="button"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </section>

      {/* API Key Settings */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <Sparkles className="w-5 h-5 text-[#0d9488]" />
          <h3 className="text-base font-bold text-[#0f172a]">AI Configuration</h3>
        </div>
        <p className="text-xs text-slate-500 mb-6 font-normal">
          Add your Google Gemini API Key to enable AI features. The key will be saved globally.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="password"
            placeholder="Enter Gemini API Key (AIzaSy...)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
          />
          <button
            onClick={handleSaveApiKey}
            disabled={!apiKey.trim() || apiKeyStatus === 'saving'}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap flex items-center justify-center min-w-[120px]"
          >
            {apiKeyStatus === 'saving' ? 'Saving...' : apiKeyStatus === 'saved' ? 'Saved!' : 'Save Key'}
          </button>
        </div>
        
        {apiKeyStatus === 'saved' && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">
              API key saved successfully. It may take a moment to apply. You can test the AI features now.
            </span>
          </div>
        )}
        {apiKeyStatus === 'error' && (
          <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2">
            <span className="text-xs font-bold text-red-700">
              Failed to save API key. Check console for details.
            </span>
          </div>
        )}
      </section>
    </div>
  );
};
