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
    </div>
  );
};
