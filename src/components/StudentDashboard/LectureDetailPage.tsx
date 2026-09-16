import React, { useState } from 'react';
import { User, BoardCapture } from '../../types';
import { useStudentContext } from '../../context/StudentContext';
import { recraftNoteForPersona } from '../../lib/personaRecraft';
import { MathRenderer } from '../Common/MathRenderer';
import {
  BookOpen,
  ArrowLeft,
  FileDown,
  CheckCircle2,
  Sparkles,
  Camera,
  Play,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Send,
  X,
  Layers,
  Box,
  Sliders,
  Printer
} from 'lucide-react';

interface LectureDetailPageProps {
  lectureId: string;
  currentUser: User;
  onBack: () => void;
  onOpenQuiz: (lectureId: string) => void;
  onOpenTutor: (prompt?: string) => void;
}

export const LectureDetailPage: React.FC<LectureDetailPageProps> = ({
  lectureId,
  currentUser,
  onBack,
  onOpenQuiz,
  onOpenTutor
}) => {
  const { dashboardData, submitLectureFeedback, activeFeedback } = useStudentContext();
  const [reframeMode, setReframeMode] = useState<'original' | 'step_by_step' | 'visual' | 'simple' | 'exam'>('original');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showARModal, setShowARModal] = useState(false);
  const [inclineAngle, setInclineAngle] = useState(30);
  const [askClassOpen, setAskClassOpen] = useState(false);
  const [askClassQuestion, setAskClassQuestion] = useState('');
  const [askClassHistory, setAskClassHistory] = useState<Array<{ q: string; a: string }>>([
    {
      q: 'Why is normal force equal to mg cos(theta) on an inclined plane?',
      a: 'Perpendicular to the inclined plane, the block has zero acceleration. Therefore, the normal force N exactly balances the perpendicular component of gravity, which is mg*cos(theta).'
    }
  ]);
  const [isAnswering, setIsAnswering] = useState(false);

  // Locate target lecture
  const lecture = React.useMemo(() => {
    let found = dashboardData?.todayLecture?.id === lectureId ? dashboardData.todayLecture : null;
    if (!found && dashboardData?.subjects) {
      for (const s of dashboardData.subjects) {
        const l = s.lectures?.find(item => item.id === lectureId);
        if (l) {
          found = {
            ...l,
            subjectId: s.id,
            subjectName: s.name,
            teacherName: s.teacherName
          } as any;
          break;
        }
      }
    }
    return found || dashboardData?.todayLecture;
  }, [lectureId, dashboardData]);

  // Personalized Content
  const displayedContent = React.useMemo(() => {
    if (!lecture) return '';
    if (reframeMode === 'original') {
      return lecture.rawText;
    }
    const persona = {
      ...currentUser.learningProfile,
      learningStyle: reframeMode === 'simple' ? 'intuitive' : (reframeMode === 'exam' ? 'exam_focused' : reframeMode)
    } as any;

    const recrafted = recraftNoteForPersona(
      {
        title: lecture.title,
        content: lecture.rawText,
        generalisedNotes: lecture.rawText
      },
      persona
    );
    return recrafted.content;
  }, [lecture, reframeMode, currentUser.learningProfile]);

  const handleExportPDF = () => {
    window.print();
  };

  const handleAskClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askClassQuestion.trim() || isAnswering) return;

    const q = askClassQuestion.trim();
    setAskClassQuestion('');
    setIsAnswering(true);

    setTimeout(() => {
      setAskClassHistory(prev => [
        ...prev,
        {
          q,
          a: `Based on the lecture recording and OCR captures for "${lecture?.title}", the key principle is to set up a Cartesian coordinate system with the x-axis parallel to the incline surface. The acceleration a = g*(sin(theta) - mu*cos(theta)).`
        }
      ]);
      setIsAnswering(false);
    }, 900);
  };

  if (!lecture) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-bold text-slate-700">Lecture not found.</p>
        <button onClick={onBack} className="mt-2 text-xs font-bold text-blue-600">Go back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      
      {/* TOP BAR WITH LECTURE ID, SUBJECT, TOPICS COVERED & ACTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Classes</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
              ID: {lecture.id}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {lecture.subjectName || 'Physics 11'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              • {lecture.teacherName || 'Dr. Rajesh Kulkarni'} • {lecture.date || 'Today'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {lecture.title}
          </h1>

          {/* Topics Covered */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] font-bold text-slate-400">Topics Covered:</span>
            {['Incline Coordinates', 'Normal Force Resolution', 'Kinetic Friction', 'Net Acceleration'].map((topic, i) => (
              <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                #{topic}
              </span>
            ))}
          </div>
        </div>

        {/* Action Controls: AR Mode, PDF Export, Take Quiz */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowARModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Box className="w-4 h-4" />
            <span>AR 3D Model</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={() => onOpenQuiz(lecture.id)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Practice Quiz</span>
          </button>
        </div>
      </div>

      {/* RE-FRAME PERSONA TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Re-frame Note Style:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'original', label: '📖 Textbook Standard' },
            { id: 'step_by_step', label: '🔢 Step-by-Step' },
            { id: 'visual', label: '📊 Visual & Analogies' },
            { id: 'simple', label: '💡 Intuitive (Feynman)' },
            { id: 'exam', label: '⚡ High Yield Exam Cram' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setReframeMode(mode.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                reframeMode === mode.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-COLUMN MAIN CONTENT: Markdown Notes + Blackboard Gallery & Ask Class */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT 8 COLS: Formatted Digital Textbook Note */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed">
            <MathRenderer content={displayedContent} />
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setIsCompleted(!isCompleted)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Marked as Completed' : 'Mark Lesson as Done'}</span>
            </button>

            <button
              onClick={() => onOpenTutor(`Can you explain the key concepts of "${lecture.title}" from today's class?`)}
              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ask AI Tutor About Notes</span>
            </button>
          </div>
        </div>

        {/* RIGHT 4 COLS: ClassSarthi Blackboard Photos & Ask My Class (RAG) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Blackboard Visuals Gallery */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Classroom Board Captures
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                {lecture.boardCaptures?.length || 2} Images
              </span>
            </div>

            <div className="space-y-3">
              {(lecture.boardCaptures || [
                { id: 'b1', imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80', timestamp: '05:20', ocrSnippet: 'F_parallel = mg sin(theta)' },
                { id: 'b2', imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80', timestamp: '14:45', ocrSnippet: 'N = mg cos(theta)' }
              ]).map((b: any, idx: number) => (
                <div key={b.id || idx} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                  <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                    <img
                      src={b.imageUrl}
                      alt="Classroom Board"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono font-bold backdrop-blur-xs">
                      ⏱ {b.timestamp || '10:00'}
                    </span>
                  </div>
                  <div className="p-2.5 text-[11px] text-slate-600 font-mono">
                    {b.ocrSnippet || 'OCR: Vector decomposition and Newton 2nd Law equations'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ask My Class (RAG Dialog) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Ask My Class (Lecture RAG)
              </h3>
            </div>

            <p className="text-[11px] text-slate-500">
              Ask anything specifically grounded in this lecture's audio transcript and board notes.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {askClassHistory.map((item, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                  <p className="font-bold text-slate-900">Q: {item.q}</p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">A: {item.a}</p>
                </div>
              ))}
              {isAnswering && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-medium animate-pulse">
                  Searching lecture transcript & blackboard OCR...
                </div>
              )}
            </div>

            <form onSubmit={handleAskClassSubmit} className="flex gap-2">
              <input
                type="text"
                value={askClassQuestion}
                onChange={(e) => setAskClassQuestion(e.target.value)}
                placeholder="Ask about this lecture..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-hidden"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* AR 3D INCLINE SIMULATOR MODAL */}
      {showARModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  AR 3D Force Diagram Simulator
                </h3>
              </div>
              <button
                onClick={() => setShowARModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Vector Canvas */}
            <div className="h-56 bg-slate-900 rounded-2xl p-4 relative overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 300 200" className="w-full h-full">
                {/* Incline Wedge */}
                <polygon
                  points={`50,160 250,160 250,${160 - inclineAngle * 2}`}
                  fill="#334155"
                  stroke="#64748b"
                  strokeWidth="2"
                />
                {/* Block on Incline */}
                <rect
                  x="140"
                  y={135 - inclineAngle}
                  width="40"
                  height="25"
                  fill="#3b82f6"
                  transform={`rotate(-${inclineAngle}, 160, ${145 - inclineAngle})`}
                  stroke="#60a5fa"
                  strokeWidth="1.5"
                />
                {/* Gravity Vector mg */}
                <line x1="160" y1={145 - inclineAngle} x2="160" y2={190 - inclineAngle} stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
                <text x="165" y={185 - inclineAngle} fill="#f87171" fontSize="10" fontFamily="sans-serif">mg</text>
                
                {/* Normal Force N */}
                <line
                  x1="160"
                  y1={145 - inclineAngle}
                  x2={160 - Math.sin((inclineAngle * Math.PI) / 180) * 35}
                  y2={145 - inclineAngle - Math.cos((inclineAngle * Math.PI) / 180) * 35}
                  stroke="#10b981"
                  strokeWidth="2"
                />
                <text x={140 - Math.sin((inclineAngle * Math.PI) / 180) * 35} y={135 - inclineAngle - Math.cos((inclineAngle * Math.PI) / 180) * 35} fill="#34d399" fontSize="10" fontFamily="sans-serif">N = mg cos(θ)</text>
              </svg>
            </div>

            {/* Incline Angle Slider */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Incline Angle (θ): {inclineAngle}°</span>
                <span className="text-purple-700">mg sin({inclineAngle}°) = {(Math.sin((inclineAngle * Math.PI) / 180) * 9.8).toFixed(2)} N/kg</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={inclineAngle}
                onChange={(e) => setInclineAngle(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowARModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 transition"
              >
                Close Simulator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
