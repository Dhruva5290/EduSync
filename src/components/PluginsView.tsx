import React, { useState } from 'react';
import {
  Puzzle,
  Zap,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { CustomTutorPersona } from '../types';

interface PluginsViewProps {
  customTutors: CustomTutorPersona[];
  onAddCustomTutor: (tutor: Omit<CustomTutorPersona, 'id' | 'initials'>) => void;
  onRemoveCustomTutor: (id: string) => void;
}

export const PluginsView: React.FC<PluginsViewProps> = ({
  customTutors,
  onAddCustomTutor,
  onRemoveCustomTutor,
}) => {
  // Automation Rules states
  const [rules, setRules] = useState({
    classroomSync: true,
    calendarSync: true,
    gmailDigest: false,
    lectureNotesSync: true,
  });

  // Form states
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [prompt, setPrompt] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleRule = (key: keyof typeof rules) => {
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !prompt.trim()) return;

    onAddCustomTutor({
      name: name.trim(),
      specialty: specialty.trim() || 'STEM Specialist',
      prompt: prompt.trim(),
    });

    setName('');
    setSpecialty('');
    setPrompt('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1520px] mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#5a4138]">
        <span>EduSync</span>
        <span>&gt;</span>
        <span className="text-[#0b1c30]">Plugins</span>
      </div>

      {/* Automation Rules */}
      <div className="bg-white rounded-3xl p-6 lg:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-5">
        <div className="flex items-center gap-2 text-[#a33900]">
          <Zap className="w-5 h-5 fill-current" />
          <h2 className="font-extrabold text-lg text-[#0b1c30]">Automation Rules</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rule 1 */}
          <div
            onClick={() => toggleRule('classroomSync')}
            className="bg-[#eff4ff]/50 hover:bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff]/60 flex items-center justify-between gap-4 cursor-pointer transition-colors"
          >
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm text-[#0b1c30]">
                Auto-sync Google Classroom assignments
              </span>
              <span className="text-xs text-[#5a4138] mt-0.5">
                Pulls newly posted homework to your to-do feed
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                rules.classroomSync ? 'bg-[#0051d5] text-white' : 'border border-gray-300 bg-white'
              }`}
            >
              {rules.classroomSync && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          {/* Rule 2 */}
          <div
            onClick={() => toggleRule('calendarSync')}
            className="bg-[#eff4ff]/50 hover:bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff]/60 flex items-center justify-between gap-4 cursor-pointer transition-colors"
          >
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm text-[#0b1c30]">
                Sync Deadlines to Google Calendar
              </span>
              <span className="text-xs text-[#5a4138] mt-0.5">
                Pushes 15-min reminder before class or quiz
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                rules.calendarSync ? 'bg-[#0051d5] text-white' : 'border border-gray-300 bg-white'
              }`}
            >
              {rules.calendarSync && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          {/* Rule 3 */}
          <div
            onClick={() => toggleRule('gmailDigest')}
            className="bg-[#eff4ff]/50 hover:bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff]/60 flex items-center justify-between gap-4 cursor-pointer transition-colors"
          >
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm text-[#0b1c30]">
                Gmail Daily Study Digest
              </span>
              <span className="text-xs text-[#5a4138] mt-0.5">
                Morning email with pending tasks & streak
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                rules.gmailDigest ? 'bg-[#0051d5] text-white' : 'border border-gray-300 bg-white'
              }`}
            >
              {rules.gmailDigest && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          {/* Rule 4 */}
          <div
            onClick={() => toggleRule('lectureNotesSync')}
            className="bg-[#eff4ff]/50 hover:bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff]/60 flex items-center justify-between gap-4 cursor-pointer transition-colors"
          >
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm text-[#0b1c30]">
                Classroom Lecture Sync
              </span>
              <span className="text-xs text-[#5a4138] mt-0.5">
                Automatic synchronized notes and transcripts
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                rules.lectureNotesSync ? 'bg-[#0051d5] text-white' : 'border border-gray-300 bg-white'
              }`}
            >
              {rules.lectureNotesSync && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Teacher / Tutor Persona Card */}
      <form
        onSubmit={handleSaveTutor}
        className="bg-white rounded-3xl p-6 lg:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#7c3aed] flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-[#0b1c30]">
              Add Custom Teacher / Tutor Persona
            </h2>
            <p className="text-xs text-[#5a4138]">
              Create tailored AI teaching styles and custom teacher prompts for the AI Tutor
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
              Teacher / Tutor Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. Walter Lewin, Dr. Feynman"
              className="bg-white border border-[#dce9ff] px-4 py-2.5 rounded-xl text-xs text-[#0b1c30] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
              Specialty / Tagline
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g. Intuitive Demonstrations & High School Physics"
              className="bg-white border border-[#dce9ff] px-4 py-2.5 rounded-xl text-xs text-[#0b1c30] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
            Custom Prompt & Teaching Philosophy
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe how this tutor should explain concepts (e.g. Always begin with a real-world demonstration, show why common misconceptions fail, and derive equations from first principles)."
            className="bg-white border border-[#dce9ff] p-3.5 rounded-xl text-xs text-[#0b1c30] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#7c3aed]/30 resize-none leading-relaxed"
            required
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {savedSuccess && (
            <span className="text-xs font-bold text-[#006947] flex items-center gap-1">
              <Check className="w-4 h-4" />
              Custom persona active in AI Tutor!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Save & Add Custom Tutor</span>
          </button>
        </div>
      </form>

      {/* Active Custom Tutors Section */}
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
          Active Custom Tutors ({customTutors.length})
        </span>

        <div className="flex flex-col gap-3">
          {customTutors.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#7c3aed] font-extrabold flex items-center justify-center flex-shrink-0 text-sm">
                  {tutor.initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#0b1c30]">
                      {tutor.name}
                    </span>
                    <span className="text-xs text-[#7c3aed] font-semibold">
                      {tutor.specialty}
                    </span>
                  </div>
                  <p className="text-xs text-[#5a4138] mt-0.5 line-clamp-1 italic">
                    "{tutor.prompt}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  onClick={() => onRemoveCustomTutor(tutor.id)}
                  className="text-xs font-bold text-[#ba1a1a] hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
