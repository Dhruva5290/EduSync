import React, { useState } from 'react';
import { Subject, StudentNote, LearnerPersona } from '../../types';
import {
  FileText,
  UploadCloud,
  Sparkles,
  X,
  CheckCircle2,
  BookOpen,
  Layers,
  ArrowRight,
  ClipboardPaste,
  FileCode
} from 'lucide-react';

interface VisionNoteImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  activeSubjectId: string;
  learnerProfile?: LearnerPersona;
  onImportNote: (newNote: Partial<StudentNote>) => Promise<StudentNote>;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const VisionNoteImportModal: React.FC<VisionNoteImportModalProps> = ({
  isOpen,
  onClose,
  subjects,
  activeSubjectId,
  learnerProfile,
  onImportNote,
  onShowToast
}) => {
  const [title, setTitle] = useState('');
  const [targetSubjectId, setTargetSubjectId] = useState(activeSubjectId || 'subj-misc');
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePasteSample = (sampleType: 'physics' | 'chemistry' | 'maths' | 'misc') => {
    if (sampleType === 'physics') {
      setTitle('Lecture 14: Rolling Motion & Friction Conservation');
      setTargetSubjectId('subj-phy');
      setRawText(
`# Lecture 14: Rolling Motion & Friction Constraints

## 1. Rolling Without Slipping Condition
For a rigid cylinder or sphere rolling along a horizontal plane:
$$v_{cm} = R \\omega$$
$$a_{cm} = R \\alpha$$

Static friction acts at the contact point without doing work:
$$f_s \\le \\mu_s N$$

## 2. Incline Dynamics
$$a_{cm} = \\frac{g \\sin\\theta}{1 + \\frac{I_{cm}}{m R^2}}$$

Key Exam Invariant: Total mechanical energy remains conserved because static friction performs zero net displacement on the instantaneous axis of rotation.`
      );
    } else if (sampleType === 'chemistry') {
      setTitle('Lecture 09: Aldol Condensation & Enolate Intermediates');
      setTargetSubjectId('subj-che');
      setRawText(
`# Lecture 09: Enolate Chemistry & Aldol Reaction Mechanisms

## 1. Enolization & Alpha-Proton Deprotonation
Acidity of alpha-hydrogens is governed by resonance stabilization of enolate anion:
$$\\text{p}K_a \\approx 19 - 20$$

## 2. Nucleophilic Addition & Dehydration
Base-catalyzed addition forms beta-hydroxy aldehydes:
$$R-CHO + R'-CH_2-CHO \\xrightarrow{OH^-} \\beta\\text{-hydroxy aldehyde} \\xrightarrow{\\Delta, -H_2O} \\alpha,\\beta\\text{-unsaturated carbonyl}$$

Thermodynamic driving force: Extended pi-conjugation between alkene and carbonyl pi bonds.`
      );
    } else if (sampleType === 'maths') {
      setTitle('Lecture 21: Definite Integrals & King Property Invariants');
      setTargetSubjectId('subj-mat');
      setRawText(
`# Lecture 21: Definite Integration Symmetry Theorems

## 1. King Property (Reflection Identity)
$$\\int_{a}^{b} f(x)\\,dx = \\int_{a}^{b} f(a + b - x)\\,dx$$

## 2. High-Yield Corollary
$$2I = \\int_{a}^{b} [f(x) + f(a + b - x)]\\,dx$$

Application: Eliminates algebraic numerators when $f(x) + f(a+b-x)$ reduces to a constant unity.`
      );
    } else {
      setTitle('VisionNote Capture: Cross-Disciplinary Sensor Calibration');
      setTargetSubjectId('subj-misc');
      setRawText(
`# VisionNote Capture: Sensor Drift & Uncertainty Analysis

## Experimental Overview
Recorded sensor voltages over a 4-hour continuous cycle:
- Baseline offset: $V_0 = 1.25\\,\\text{V}$
- Temperature drift coefficient: $\\alpha = 0.042\\,\\text{V/K}$

## Error Propagation Equation
$$\\sigma_{final} = \\sqrt{\\left(\\frac{\\partial f}{\\partial x}\\right)^2 \\sigma_x^2 + \\left(\\frac{\\partial f}{\\partial y}\\right)^2 \\sigma_y^2}$$

Action Item: Calibrate ADC gain parameters before next laboratory session.`
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setRawText(text);
      if (!title) {
        const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanFileName.charAt(0).toUpperCase() + cleanFileName.slice(1));
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      onShowToast('Please paste or upload note text from VisionNote', 'error');
      return;
    }

    const finalTitle = title.trim() || `VisionNote Lecture (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    setIsProcessing(true);

    try {
      const created = await onImportNote({
        title: finalTitle,
        content: rawText,
        subjectId: targetSubjectId,
        source: 'visionnote',
        isPersonalized: true
      });

      onShowToast(`Imported & Personalized note: "${created.title}"!`, 'success');
      onClose();
    } catch (err) {
      console.error('Import failed:', err);
      onShowToast('Error importing VisionNote text', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Import from VisionNote (Direct OCR Paste)
              </h2>
              <p className="text-xs text-slate-400">
                Paste raw whiteboard/OCR text or load a file. Auto-assigned to Misc if subject unspecified.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Quick Demo Templates */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick-Load VisionNote Demo Samples (For Mentors Presentation):
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handlePasteSample('physics')}
                className="px-2.5 py-1.5 rounded-lg bg-blue-950/60 border border-blue-800/80 text-blue-300 text-xs font-semibold hover:bg-blue-900/60 transition-all text-left truncate"
              >
                ⚛️ Physics Note
              </button>
              <button
                type="button"
                onClick={() => handlePasteSample('chemistry')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/60 transition-all text-left truncate"
              >
                🧪 Chemistry Note
              </button>
              <button
                type="button"
                onClick={() => handlePasteSample('maths')}
                className="px-2.5 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/80 text-purple-300 text-xs font-semibold hover:bg-purple-900/60 transition-all text-left truncate"
              >
                📐 Maths Note
              </button>
              <button
                type="button"
                onClick={() => handlePasteSample('misc')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-semibold hover:bg-amber-900/60 transition-all text-left truncate"
              >
                📁 Misc & Unspecified
              </button>
            </div>
          </div>

          {/* Title & Subject Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Note Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lecture 14: Rolling Motion & Invariants"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Subject</label>
              <select
                value={targetSubjectId}
                onChange={(e) => setTargetSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Raw Text Input or File Upload */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                Raw VisionNote Text / LaTeX OCR Content
              </label>
              <label className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer font-semibold flex items-center gap-1">
                <span>📁 Upload .txt File</span>
                <input
                  type="file"
                  accept=".txt,.md,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw OCR lecture notes here with markdown and equations ($$...$$)..."
              className="w-full p-3 font-mono text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 leading-relaxed scrollbar-thin resize-none"
            />
          </div>

          {/* Active Personalization Tag */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Personalization Style: <strong>{learnerProfile?.learningStyle ? learnerProfile.learningStyle.replace('_', ' ').toUpperCase() : 'Visual & Structured'}</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300">
              Auto-Adaptive
            </span>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !rawText.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-900/30 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Personalizing Note...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Import & Personalize Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
