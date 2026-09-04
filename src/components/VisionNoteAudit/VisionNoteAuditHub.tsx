import React, { useState, useEffect } from 'react';
import {
  Camera,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  UploadCloud,
  FileText,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Users,
  GraduationCap,
  Atom,
  FlaskConical,
  Binary,
  TrendingUp,
  BrainCircuit,
  Eye,
  Zap,
  Code,
  Check,
  X,
  Play
} from 'lucide-react';
import { User, Subject, StudentNote, ClassAnalytics } from '../../types';

interface VisionNoteAuditHubProps {
  currentUser: User | null;
  onOpenSocraticTutor?: (subjectId: string, initialPrompt?: string) => void;
  onViewNoteInEditor?: (note: StudentNote) => void;
}

export const VisionNoteAuditHub: React.FC<VisionNoteAuditHubProps> = ({
  currentUser,
  onOpenSocraticTutor,
  onViewNoteInEditor
}) => {
  const [selectedGrade, setSelectedGrade] = useState<'11' | '12'>('11');
  const [selectedSubject, setSelectedSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');
  const [activeTab, setActiveTab] = useState<'notes' | 'students' | 'diagnostics'>('notes');

  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCameraSimModal, setShowCameraSimModal] = useState(false);
  const [simulatingCapture, setSimulatingCapture] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  // Import form state
  const [importTitle, setImportTitle] = useState('');
  const [importContent, setImportContent] = useState('');
  const [importGrade, setImportGrade] = useState<'11' | '12'>('11');
  const [importSubject, setImportSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');
  const [importStudentId, setImportStudentId] = useState('');
  const [importDoubts, setImportDoubts] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // Current active subject ID calculation
  const currentSubjectId =
    selectedSubject === 'Physics'
      ? selectedGrade === '11' ? 'subj-phy-11' : 'subj-phy-12'
      : selectedSubject === 'Chemistry'
      ? selectedGrade === '11' ? 'subj-che-11' : 'subj-che-12'
      : selectedGrade === '11' ? 'subj-mat-11' : 'subj-mat-12';

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      if (Array.isArray(usersData)) {
        const gradeStudents = usersData.filter(
          (u: User) =>
            u.role === 'student' &&
            (selectedGrade === '11' ? u.institutionalId?.startsWith('11') || u.department?.includes('11') : u.institutionalId?.startsWith('12') || u.department?.includes('12'))
        );
        setStudents(gradeStudents);
      }

      // 2. Fetch Subjects
      const subjRes = await fetch('/api/subjects');
      const subjData = await subjRes.json();
      if (Array.isArray(subjData)) {
        setAllSubjects(subjData);
      }

      // 3. Fetch Notes for current subject
      const notesRes = await fetch(`/api/notes/${currentSubjectId}`);
      const notesData = await notesRes.json();
      if (Array.isArray(notesData)) {
        setNotes(notesData);
      }

      // 4. Fetch Sync Status
      const syncRes = await fetch('/api/notes/vision-sync/status');
      const syncData = await syncRes.json();
      setSyncStatus(syncData);

      // 5. Fetch Analytics
      const analRes = await fetch(`/api/analytics/${currentSubjectId}`);
      const analData = await analRes.json();
      setAnalytics(analData);
    } catch (err) {
      console.error('Error fetching VisionNote audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGrade, selectedSubject, currentSubjectId]);

  // Handle Manual Note Import
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importTitle || !importContent) return;

    setSyncing(true);
    try {
      const doubtsArr = importDoubts
        .split('\n')
        .map(d => d.trim())
        .filter(d => d.length > 0);

      const payload = {
        grade: importGrade,
        subject: importSubject,
        studentId: importStudentId || (selectedGrade === '11' ? 'student-g11-1' : 'student-g12-1'),
        title: importTitle,
        content: importContent,
        doubtsDetected: doubtsArr,
        source: 'visionnote',
        tags: ['VisionNote', `${importSubject} ${importGrade}`, 'Imported']
      };

      const res = await fetch('/api/notes/vision-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setImportSuccessMsg(`Successfully imported "${importTitle}" into ${importSubject} (Grade ${importGrade})!`);
        setTimeout(() => {
          setShowImportModal(false);
          setImportSuccessMsg('');
          setImportTitle('');
          setImportContent('');
          setImportDoubts('');
          fetchData();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to import note:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Handle Live Camera Scan Simulation
  const handleSimulateCameraCapture = async () => {
    setSimulatingCapture(true);
    setSimProgress(15);

    // Step animation
    setTimeout(() => setSimProgress(45), 400);
    setTimeout(() => setSimProgress(75), 900);
    setTimeout(() => setSimProgress(100), 1300);

    try {
      const res = await fetch('/api/notes/vision-sync/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedGrade,
          subject: selectedSubject
        })
      });
      const data = await res.json();

      setTimeout(() => {
        setSimulatingCapture(false);
        setShowCameraSimModal(false);
        setSimProgress(0);
        fetchData();
      }, 1600);
    } catch (err) {
      console.error('Simulation error:', err);
      setSimulatingCapture(false);
    }
  };

  const loadSampleTemplate = (type: 'phy' | 'che' | 'mat') => {
    if (type === 'phy') {
      setImportGrade('11');
      setImportSubject('Physics');
      setImportTitle('Bernoulli Principle & Venturimeter Flow Rate');
      setImportContent(`# Fluid Dynamics: Bernoulli Equation & Continuity
*(VisionNote Camera Scan • Fluid Lab)*

## 1. Equation of Continuity:
$$A_1 v_1 = A_2 v_2 = \\text{Constant (Volume Flow Rate } Q)$$

## 2. Bernoulli's Equation for Incompressible Non-viscous Fluid:
$$P + \\frac{1}{2} \\rho v^2 + \\rho g h = \\text{Constant}$$

## 3. Speed of Efflux (Torricelli's Law):
$$v = \\sqrt{2gh}$$`);
      setImportDoubts('Why does static pressure decrease when fluid speed increases?\nHow does viscosity introduce head loss in real pipelines?');
    } else if (type === 'che') {
      setImportGrade('12');
      setImportSubject('Chemistry');
      setImportTitle('Nernst Equation & Electrochemical Cell EMF');
      setImportContent(`# Electrochemistry: Nernst Equation Derivations
*(VisionNote Camera Scan • Physical Chemistry)*

## 1. Nernst Equation at $298\\text{ K}$:
$$E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n} \\log_{10} Q$$

Where $Q$ is the reaction quotient:
$$Q = \\frac{[\\text{Products}]^c}{[\\text{Reactants}]^a}$$

## 2. Relation with Gibbs Free Energy:
$$\\Delta G = -n F E_{\\text{cell}}, \\quad \\Delta G^\\circ = -n F E^\\circ_{\\text{cell}} = -RT \\ln K$$`);
      setImportDoubts('Why does cell EMF become zero at chemical equilibrium?\nWhat happens to EMF when electrolyte concentration is diluted by a factor of 10?');
    } else {
      setImportGrade('12');
      setImportSubject('Mathematics');
      setImportTitle('Integration by Partial Fractions');
      setImportContent(`# Integral Calculus: Partial Fraction Decompositions
*(VisionNote Camera Scan • Board Notes)*

## 1. Non-Repeated Linear Factors:
$$\\frac{P(x)}{(x - a)(x - b)} = \\frac{A}{x - a} + \\frac{B}{x - b}$$

## 2. Repeated Linear Factors:
$$\\frac{P(x)}{(x - a)^2} = \\frac{A}{x - a} + \\frac{B}{(x - a)^2}$$

## 3. Quadratic Non-Factorable Term:
$$\\frac{P(x)}{(x - a)(x^2 + bx + c)} = \\frac{A}{x - a} + \\frac{Bx + C}{x^2 + bx + c}$$`);
      setImportDoubts('How do you identify whether the degree of numerator requires polynomial long division first?');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & High-Level Switchers */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 border border-indigo-500/20 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Senior Secondary Science Sandbox • ClassSarthi Vision
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-cyan-200">
              Grade 11 & 12 Science Audit & VisionNote (VN) Sync
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time synchronization bridge between <strong>VisionNote (Camera OCR Studio)</strong> and <strong>EduSync LMS</strong>.
              Seamlessly push handwritten derivations, ingest camera blackboard feeds, extract Socratic doubts, and audit senior secondary student mastery.
            </p>
          </div>

          {/* Live Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCameraSimModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Camera className="w-4 h-4" />
              Simulate VN Camera Scan
            </button>
          </div>
        </div>

        {/* Grade & Subject Selector Ribbon */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Grade Toggle Pills */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 self-start">
            <button
              onClick={() => setSelectedGrade('11')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedGrade === '11'
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Class 11 (Grade XI)
            </button>
            <button
              onClick={() => setSelectedGrade('12')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedGrade === '12'
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Class 12 (Grade XII)
            </button>
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedSubject('Physics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedSubject === 'Physics'
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Atom className="w-4 h-4 text-blue-400" />
              Physics ({selectedGrade === '11' ? 'Mechanics' : 'Electromagnetism'})
            </button>

            <button
              onClick={() => setSelectedSubject('Chemistry')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedSubject === 'Chemistry'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              Chemistry ({selectedGrade === '11' ? 'Bonding & Thermo' : 'Kinetics & Organics'})
            </button>

            <button
              onClick={() => setSelectedSubject('Mathematics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedSubject === 'Mathematics'
                  ? 'bg-violet-500/20 border-violet-400 text-violet-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Binary className="w-4 h-4 text-violet-400" />
              Mathematics ({selectedGrade === '11' ? 'Limits & Trig' : 'Calculus & 3D'})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Live Sync Status & Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Live Status */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Sync Bridge Active</p>
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">Live Auto-Ingestion</p>
          </div>
        </div>

        {/* Metric 2: Total VN Notes */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Notes in Subject</p>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">{notes.length} Notes Synced</p>
          </div>
        </div>

        {/* Metric 3: Active Students Cohort */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Class {selectedGrade} Cohort</p>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">{students.length} Enrolled Students</p>
          </div>
        </div>

        {/* Metric 4: Class Average */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Batch Average</p>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">{analytics?.classAverage || 88.5}%</p>
          </div>
        </div>
      </div>

      {/* 3. Section Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'notes'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Camera className="w-4 h-4" />
          VisionNote Camera & OCR Stream ({notes.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'students'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          Grade {selectedGrade} Students ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'diagnostics'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          Curriculum Diagnostics & Doubts
        </button>
      </div>

      {/* 4. Tab 1: VisionNote Stream */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No VisionNotes for this subject yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Push notes from the VisionNote camera app, import a handwritten OCR note, or simulate a live capture.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowCameraSimModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Simulate Camera Capture
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {notes.map(note => {
                const noteStudent = students.find(s => s.id === note.studentId);
                return (
                  <div
                    key={note.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
                              <Camera className="w-3 h-3 text-indigo-500" />
                              VisionNote OCR
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(note.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{note.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Author: <strong className="text-slate-700 dark:text-slate-300">{noteStudent?.name || 'Class Student'}</strong> ({noteStudent?.institutionalId || 'Roll 1101'})
                          </p>
                        </div>
                      </div>

                      {/* Content Preview & Image Banner if present */}
                      <div className="p-5 space-y-4">
                        {note.cameraSnapshotUrl && (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-36 group">
                            <img
                              src={note.cameraSnapshotUrl}
                              alt="Camera snapshot"
                              className="w-full h-36 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                              <span className="text-[11px] text-white font-medium flex items-center gap-1">
                                <Eye className="w-3 h-3 text-cyan-400" /> Original Camera Feed Snapshot
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Note Summary */}
                        {note.summary && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                            <strong className="text-indigo-600 dark:text-indigo-400 block mb-1">💡 AI Executive Summary:</strong>
                            {note.summary}
                          </div>
                        )}

                        {/* Extracted Doubts Panel */}
                        {note.doubtsDetected && note.doubtsDetected.length > 0 && (
                          <div className="p-3 bg-amber-500/10 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 mb-2">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                              Detected Doubts & First-Principle Gaps:
                            </div>
                            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                              {note.doubtsDetected.map((d, i) => (
                                <li key={i} className="leading-snug">{d}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Raw Markdown Snippet */}
                        <div className="p-3 bg-slate-900 rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto max-h-28 line-clamp-4">
                          {note.content}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {note.tags?.slice(0, 3).map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {onOpenSocraticTutor && (
                          <button
                            onClick={() => onOpenSocraticTutor(currentSubjectId, `Let's discuss my VisionNote on: ${note.title}. Please guide me through: ${note.doubtsDetected?.[0] || 'the core derivations'}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
                          >
                            <BrainCircuit className="w-3.5 h-3.5" />
                            Socratic Tutor
                          </button>
                        )}
                        {onViewNoteInEditor && (
                          <button
                            onClick={() => onViewNoteInEditor(note)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Open Note
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: Students Roster */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Grade {selectedGrade} Students Roster ({selectedSubject})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enrolled senior secondary science students with academic standing and note activity
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              {students.length} Registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Roll ID</th>
                  <th className="p-4">Program & Grade</th>
                  <th className="p-4">GPA / Score</th>
                  <th className="p-4">Notes Synced</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((student, idx) => {
                  const studentNotesCount = notes.filter(n => n.studentId === student.id).length;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{student.name}</p>
                            <p className="text-xs text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {student.institutionalId}
                      </td>
                      <td className="p-4 text-xs text-slate-600 dark:text-slate-300">
                        {student.program || `Grade ${selectedGrade} Science`}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {student.gpa?.toFixed(2) || '9.00'} GPA
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {studentNotesCount} VisionNotes
                      </td>
                      <td className="p-4 text-right">
                        {onOpenSocraticTutor && (
                          <button
                            onClick={() => onOpenSocraticTutor(currentSubjectId, `Hi Socratic Tutor! I'm reviewing Grade ${selectedGrade} ${selectedSubject} for student ${student.name}.`)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all"
                          >
                            Tutor View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Diagnostics & Doubts */}
      {activeTab === 'diagnostics' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Executive Summary */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-500" />
                Faculty Diagnostic Summary
              </h3>
              <p className="text-xs text-slate-500 mt-1">{analytics.aiExecutiveSummary}</p>
            </div>

            {/* Weak Topics Analysis */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Identified Conceptual Bottlenecks & Weak Areas
              </h4>
              {analytics.weakTopics?.map((wt, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{wt.topic}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{wt.recommendedRemediation}</p>
                  </div>
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 rounded-md">
                      {wt.errorRate}% Error Rate
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {wt.affectedStudents} students affected
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Items */}
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-2">⚡ Recommended Action Plan for Teachers:</h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                {analytics.keyActionItems?.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Grade Curve Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Grade Distribution Curve</h3>
            <div className="space-y-3">
              {analytics.gradeDistribution?.map((gd, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span>{gd.range}</span>
                    <span>{gd.percentage}% ({gd.count} students)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                      style={{ width: `${gd.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 1: IMPORT FROM VISIONNOTE
          ========================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Import Notes from VisionNote</h3>
                  <p className="text-xs text-slate-500">Push OCR scans or paste Markdown / LaTeX note content</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Template Fill */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Load Sample:</span>
              <button
                type="button"
                onClick={() => loadSampleTemplate('phy')}
                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold"
              >
                Physics 11
              </button>
              <button
                type="button"
                onClick={() => loadSampleTemplate('che')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
              >
                Chemistry 12
              </button>
              <button
                type="button"
                onClick={() => loadSampleTemplate('mat')}
                className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 text-xs font-semibold"
              >
                Maths 12
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Grade</label>
                  <select
                    value={importGrade}
                    onChange={e => setImportGrade(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="11">Grade 11 (XI)</option>
                    <option value="12">Grade 12 (XII)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select
                    value={importSubject}
                    onChange={e => setImportSubject(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Student</label>
                  <select
                    value={importStudentId}
                    onChange={e => setImportStudentId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Auto-Assign to Active Student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.institutionalId})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Note Title</label>
                <input
                  type="text"
                  placeholder="e.g. Derivation of Bernoulli Equation & Flow Rate"
                  value={importTitle}
                  onChange={e => setImportTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Extracted Note Content (Markdown / LaTeX)
                </label>
                <textarea
                  rows={6}
                  placeholder="# Note Title\n\nType or paste notes here with LaTeX formulas..."
                  value={importContent}
                  onChange={e => setImportContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Extracted Doubts (1 per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Why does fluid speed change pressure?&#10;What are the boundary assumptions?"
                  value={importDoubts}
                  onChange={e => setImportDoubts(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              {importSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {importSuccessMsg}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={syncing}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {syncing ? 'Synchronizing Note...' : 'Ingest & Sync to EduSync'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: SIMULATE CAMERA SCAN
          ========================================== */}
      {showCameraSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-cyan-500/30 shadow-2xl p-6 md:p-8 text-center text-white space-y-6">
            <div className="space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Camera className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Live VisionNote Camera Stream</h3>
              <p className="text-xs text-slate-400">
                Simulating OCR ingestion for <strong>Grade {selectedGrade} {selectedSubject}</strong>
              </p>
            </div>

            {/* Viewport Simulation Box */}
            <div className="relative h-48 rounded-2xl bg-slate-950 border border-cyan-500/40 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
              {simulatingCapture && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />
              )}
              <div className="text-center space-y-2 z-10 p-4">
                <div className="text-xs font-mono text-cyan-400">
                  {simulatingCapture ? `[OCR ENGINE RUNNING • ${simProgress}%]` : '[CAMERA FEED READY]'}
                </div>
                <p className="text-xs text-slate-300">
                  Target: <strong>Class {selectedGrade} {selectedSubject}</strong> Blackboard / Notebook
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {simulatingCapture && (
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
                  style={{ width: `${simProgress}%` }}
                />
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCameraSimModal(false)}
                disabled={simulatingCapture}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulateCameraCapture}
                disabled={simulatingCapture}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all"
              >
                {simulatingCapture ? 'Processing Multimodal OCR...' : 'Capture & Sync Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
