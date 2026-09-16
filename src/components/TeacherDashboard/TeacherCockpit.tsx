import React, { useState, useEffect } from 'react';
import { Subject, ClassAnalytics, User } from '../../types';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Users,
  Brain,
  RotateCcw,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Clock,
  BookOpen,
  ChevronRight,
  UserX,
  GraduationCap
} from 'lucide-react';

interface TeacherCockpitProps {
  activeSubject?: Subject;
  allUsers?: User[];
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface LectureHealth {
  id: string;
  title: string;
  date: string;
  duration: string;
  averageScore: number;
  totalAttendees: number;
  status: 'green' | 'yellow' | 'red';
  strugglingStudents: Array<{ id: string; name: string; score: number; missedConcept: string }>;
}

export const TeacherCockpit: React.FC<TeacherCockpitProps> = ({
  activeSubject: propActiveSubject,
  allUsers = [],
  onShowToast
}) => {
  const activeSubject: Subject = propActiveSubject || {
    id: 'subj-phy',
    code: 'PHY',
    name: 'Physics',
    department: 'Department of Applied Sciences',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Rajesh Kulkarni',
    teacherEmail: 'rajesh.kulkarni@classsarthi.edu',
    enrolledCount: 6,
    semester: 'Academic Year 2026-27',
    room: 'Physics Block P - Lab 201',
    credits: 4,
    description: 'Foundational Newtonian mechanics and thermodynamics.',
    color: 'blue',
    accentBg: 'bg-blue-500/10',
    syllabusTopics: []
  };

  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLectureForDetails, setSelectedLectureForDetails] = useState<LectureHealth | null>(null);

  // 1. Fetch Analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/analytics/${activeSubject.id}`);
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.warn('Failed to load subject analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [activeSubject.id]);

  // Last 5 lectures with calculated traffic light status
  const lastLectures: LectureHealth[] = [
    {
      id: 'lec-phy-101',
      title: "Newton's Laws of Motion & Free Body Diagrams",
      date: '2026-09-02',
      duration: '48m',
      averageScore: 84,
      totalAttendees: 6,
      status: 'green',
      strugglingStudents: []
    },
    {
      id: 'lec-phy-102',
      title: 'Friction Mechanics, Static Thresholds & Inclined Planes',
      date: '2026-08-30',
      duration: '52m',
      averageScore: 68,
      totalAttendees: 6,
      status: 'yellow',
      strugglingStudents: [
        { id: 'student-3', name: 'Kabir Mehta', score: 50, missedConcept: 'Angle of Repose & Static Friction' },
        { id: 'student-5', name: 'Rohan Gupta', score: 60, missedConcept: 'Normal Force on Incline' }
      ]
    },
    {
      id: 'lec-phy-103',
      title: 'Rotational Dynamics, Torque & Moment of Inertia Proofs',
      date: '2026-08-27',
      duration: '50m',
      averageScore: 42,
      totalAttendees: 6,
      status: 'red',
      strugglingStudents: [
        { id: 'student-1', name: 'Aarav Sharma', score: 40, missedConcept: 'Parallel Axis Theorem' },
        { id: 'student-2', name: 'Diya Patel', score: 45, missedConcept: 'Perpendicular Axis Invariance' },
        { id: 'student-3', name: 'Kabir Mehta', score: 35, missedConcept: 'Radius of Gyration' },
        { id: 'student-5', name: 'Rohan Gupta', score: 40, missedConcept: 'Cross Product Torque Vectors' }
      ]
    },
    {
      id: 'lec-phy-104',
      title: 'Work-Energy Theorem & Non-Conservative Dissipative Systems',
      date: '2026-08-24',
      duration: '45m',
      averageScore: 88,
      totalAttendees: 6,
      status: 'green',
      strugglingStudents: []
    },
    {
      id: 'lec-phy-105',
      title: 'Universal Gravitation, Kepler Laws & Escape Velocity',
      date: '2026-08-20',
      duration: '55m',
      averageScore: 74,
      totalAttendees: 6,
      status: 'yellow',
      strugglingStudents: [
        { id: 'student-6', name: 'Ishaan Verma', score: 55, missedConcept: 'Orbital Energy Conservation' }
      ]
    }
  ];

  // At-Risk Roster: Students sorted by lowest concept mastery aggregate
  const studentUsers = allUsers.filter(u => u.role === 'student');
  const rosterData = (studentUsers.length > 0 ? studentUsers : [
    { id: 'student-3', name: 'Kabir Mehta', email: 'kabir.mehta@classsarthi.edu.in', institutionalId: 'EDU-STU-1103' },
    { id: 'student-5', name: 'Rohan Gupta', email: 'rohan.gupta@classsarthi.edu.in', institutionalId: 'EDU-STU-1202' },
    { id: 'student-6', name: 'Ishaan Verma', email: 'ishaan.verma@classsarthi.edu.in', institutionalId: 'EDU-STU-1203' },
    { id: 'student-1', name: 'Aarav Sharma', email: 'aarav.sharma@classsarthi.edu.in', institutionalId: 'EDU-STU-1101' },
    { id: 'student-2', name: 'Diya Patel', email: 'diya.patel@classsarthi.edu.in', institutionalId: 'EDU-STU-1102' },
    { id: 'student-4', name: 'Ananya Iyer', email: 'ananya.iyer@classsarthi.edu.in', institutionalId: 'EDU-STU-1201' }
  ]).map((s, idx) => {
    // Computed aggregate mastery (lowest to highest)
    const mockMasteryScores = [48, 56, 64, 78, 86, 94];
    const masteryScore = mockMasteryScores[idx] || 70;
    const weakestTopic = idx === 0
      ? 'Moment of Inertia & Rotation'
      : idx === 1
      ? 'Normal Force on Incline'
      : idx === 2
      ? 'Gravitational Potential'
      : 'Newton Second Law';

    return {
      ...s,
      aggregateMastery: masteryScore,
      weakestTopic,
      riskLevel: masteryScore < 60 ? 'high' : masteryScore < 75 ? 'medium' : 'low'
    };
  }).sort((a, b) => a.aggregateMastery - b.aggregateMastery);

  const handleReteachAction = (lectureTitle: string) => {
    if (onShowToast) {
      onShowToast(`🚨 Reteach Session scheduled for "${lectureTitle}" on tomorrow's calendar.`, 'info');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
              Faculty Intervention Cockpit
            </span>
            <span className="text-xs font-mono text-slate-400">{activeSubject.code} • {activeSubject.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Traffic Light Intervention Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Direct action insights on the last 5 lectures. Pinpoint failed students, schedule targeted reteaching, and intervene with at-risk learners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[90px]">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Cohort Avg</span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">
              {analytics?.classAverage || 78.5}%
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[90px]">
            <span className="text-[10px] font-mono font-bold text-rose-400 block uppercase">At Risk</span>
            <span className="text-xl sm:text-2xl font-bold text-rose-400 mt-0.5">
              {rosterData.filter(r => r.riskLevel === 'high').length} Students
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          1. THE TRAFFIC LIGHT LECTURE BOARD (Last 5 Lectures)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-400">
              Lecture Health (Last 5 Sessions)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">🟢 &gt;80% • 🟡 50-80% • 🔴 &lt;50%</span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {lastLectures.map((lec) => {
            const isGreen = lec.status === 'green';
            const isYellow = lec.status === 'yellow';
            const isRed = lec.status === 'red';

            return (
              <div
                key={lec.id}
                className={`rounded-2xl border p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isGreen
                    ? 'bg-slate-900/80 border-emerald-900/40 hover:border-emerald-500/50'
                    : isYellow
                    ? 'bg-slate-900/90 border-amber-900/50 hover:border-amber-500/60 shadow-md'
                    : 'bg-rose-950/20 border-rose-900/60 hover:border-rose-500/70 shadow-lg shadow-rose-950/20'
                }`}
              >
                {/* Status Indicator & Lecture Info */}
                <div className="flex items-start gap-4">
                  {/* Traffic Light Disc */}
                  <div
                    className={`w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center font-bold text-xs shadow-md ${
                      isGreen
                        ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                        : isYellow
                        ? 'bg-amber-400 text-slate-950 shadow-amber-400/30 animate-pulse'
                        : 'bg-rose-500 text-white shadow-rose-500/40 animate-pulse'
                    }`}
                  >
                    {isGreen ? '✓' : isYellow ? '!' : '✕'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{lec.date} • {lec.duration}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded ${
                          isGreen
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : isYellow
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {lec.averageScore}% Avg Quiz Score
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white">{lec.title}</h3>
                  </div>
                </div>

                {/* Right Action / Details Trigger */}
                <div className="flex items-center gap-2 shrink-0">
                  {isYellow && (
                    <button
                      onClick={() => setSelectedLectureForDetails(lec)}
                      className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{lec.strugglingStudents.length} Students Failed (Inspect)</span>
                    </button>
                  )}

                  {isRed && (
                    <button
                      onClick={() => handleReteachAction(lec.title)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-900/40 cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reteach Recommended</span>
                    </button>
                  )}

                  {isGreen && (
                    <span className="text-xs font-mono text-emerald-400 font-semibold px-3 py-1 bg-emerald-950/50 rounded-lg border border-emerald-900/50">
                      Cohort Mastered
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          2. THE AT-RISK ROSTER TABLE (Sorted by Lowest Concept Mastery)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-400" />
            <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-400">
              At-Risk Student Roster (Sorted by Lowest Concept Mastery)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">Live Academic Aggregation</span>
        </div>

        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Student Name & ID</th>
                  <th className="py-3.5 px-4 font-semibold">Mastery Aggregate</th>
                  <th className="py-3.5 px-4 font-semibold">Primary Weak Concept</th>
                  <th className="py-3.5 px-4 font-semibold">Risk Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rosterData.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-xs">{stu.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{stu.institutionalId} • {stu.email}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={stu.aggregateMastery < 60 ? 'text-rose-400' : stu.aggregateMastery < 75 ? 'text-amber-400' : 'text-emerald-400'}>
                        {stu.aggregateMastery}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {stu.weakestTopic}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          stu.riskLevel === 'high'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : stu.riskLevel === 'medium'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {stu.riskLevel} Risk
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          if (onShowToast) {
                            onShowToast(`Dispatched personalized diagnostic assignment to ${stu.name}`, 'success');
                          }
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                      >
                        Assign Remediation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Struggling Students Detail Modal */}
      {selectedLectureForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Struggling Students Breakdown</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedLectureForDetails.title}</p>
              </div>
              <button
                onClick={() => setSelectedLectureForDetails(null)}
                className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {selectedLectureForDetails.strugglingStudents.map((st) => (
                <div key={st.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">{st.name}</p>
                    <p className="text-[11px] text-rose-300 mt-0.5">Missed: {st.missedConcept}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-900">
                    {st.score}%
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (onShowToast) {
                  onShowToast(`Broadcasted revision study materials to ${selectedLectureForDetails.strugglingStudents.length} students.`, 'success');
                }
                setSelectedLectureForDetails(null);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Broadcast Remediation Study Material
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
