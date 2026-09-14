import React, { useState } from 'react';
import {
  StudentTelemetryMetric,
  CommonDoubtCluster,
  TeacherScheduleSlot
} from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp,
  BrainCircuit,
  Clock,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  BookOpen,
  Users,
  Search,
  Bot,
  X,
  Filter,
  ChevronRight,
  Award,
  AlertCircle,
  BarChart3,
  Calendar,
  Layers,
  Lightbulb,
  Check
} from 'lucide-react';

interface PerformanceAnalyticsViewProps {
  telemetry: StudentTelemetryMetric[];
  doubtClusters: CommonDoubtCluster[];
  classes?: TeacherScheduleSlot[];
  onGenerateAIExplanation: (cluster: CommonDoubtCluster) => void;
}

// Detailed mistake and remediation mapping for deep-dive
interface StudentMistakeProfile {
  mistakes: string[];
  laggingTopics: string[];
  improvementPoints: string[];
  weeklyHours: Array<{ day: string; hours: number; score: number }>;
}

const DEFAULT_MISTAKE_PROFILES: Record<string, StudentMistakeProfile> = {
  'stud-101': {
    mistakes: [
      'Confuses heat transfer path function (dQ/T) with state property (dS) in Clausius Inequality',
      'Calculation errors in environmental lapse rates and plume inversion heights',
      'Forgets boundary flux balance in open thermodynamic control volumes'
    ],
    laggingTopics: ['Second Law Clausius Inequality', 'Atmospheric Thermal Inversion', 'Entropy Balances'],
    improvementPoints: [
      'Practice 4 step-by-step numerical problems on Clausius cycle integration',
      'Review the 1-page visual formula sheet on Atmospheric Lapse Rates',
      'Attend the Thursday 4:00 PM TA remedial doubt-clearing clinic'
    ],
    weeklyHours: [
      { day: 'Mon', hours: 1.2, score: 55 },
      { day: 'Tue', hours: 0.8, score: 52 },
      { day: 'Wed', hours: 1.5, score: 58 },
      { day: 'Thu', hours: 0.9, score: 54 },
      { day: 'Fri', hours: 1.0, score: 50 },
      { day: 'Sat', hours: 1.0, score: 53 }
    ]
  },
  'stud-102': {
    mistakes: [
      'Applying ideal gas law where compressibility factor Z deviates significantly from 1',
      'Confuses isothermal work with adiabatic work in reversible expansions',
      'Missing units in dilution factor P for BOD5 spectrophotometry'
    ],
    laggingTopics: ['Isothermal vs Adiabatic Work', 'Turbidity Calibration Curves', 'Compressibility Factor'],
    improvementPoints: [
      'Work through the boxed solution sheet for Carnot and Rankine cycles',
      'Re-attempt the Chapter 4 diagnostic quiz with Feynman AI Tutor mode',
      'Submit step-by-step observation notebook for Lab C-12'
    ],
    weeklyHours: [
      { day: 'Mon', hours: 2.5, score: 68 },
      { day: 'Tue', hours: 3.0, score: 70 },
      { day: 'Wed', hours: 2.8, score: 65 },
      { day: 'Thu', hours: 3.2, score: 72 },
      { day: 'Fri', hours: 2.2, score: 67 },
      { day: 'Sat', hours: 2.5, score: 68 }
    ]
  },
  'stud-103': {
    mistakes: [
      'Minor sign convention slips during cyclic work integration',
      'Rushing through multi-variable Lagrange constraint checks'
    ],
    laggingTopics: ['Lagrange Multipliers Optimization', 'Multivariable Gradient Vector Collinearity'],
    improvementPoints: [
      'Solve advanced competitive practice problems to maintain top percentile velocity',
      'Act as student mentor for the Section A peer study circle'
    ],
    weeklyHours: [
      { day: 'Mon', hours: 5.5, score: 92 },
      { day: 'Tue', hours: 6.0, score: 94 },
      { day: 'Wed', hours: 5.8, score: 90 },
      { day: 'Thu', hours: 6.2, score: 95 },
      { day: 'Fri', hours: 5.0, score: 91 },
      { day: 'Sat', hours: 6.0, score: 93 }
    ]
  }
};

export const PerformanceAnalyticsView: React.FC<PerformanceAnalyticsViewProps> = ({
  telemetry,
  doubtClusters,
  classes = [],
  onGenerateAIExplanation
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrajectory, setSelectedTrajectory] = useState<'all' | 'accelerating' | 'steady' | 'needs_boost'>('all');
  const [aiClarificationScript, setAiClarificationScript] = useState<{ topic: string; script: string } | null>(null);

  // Student Deep-Dive Drawer / Modal state
  const [selectedStudent, setSelectedStudent] = useState<StudentTelemetryMetric | null>(null);
  const [assignedTaskToast, setAssignedTaskToast] = useState<string | null>(null);

  // Filter students based on selected class
  const classFilteredTelemetry = telemetry.filter(student => {
    if (selectedClassId === 'all') return true;
    if (selectedClassId === 'slot-1' || selectedClassId === 'slot-3' || selectedClassId === 'slot-4') {
      // Environmental Studies classes
      return student.rollNo.endsWith('089') || student.rollNo.endsWith('001') || student.rollNo.endsWith('034') ||
        student.rollNo.endsWith('062') || student.rollNo.endsWith('019') || student.rollNo.endsWith('078') ||
        student.rollNo.endsWith('7012') || student.rollNo.endsWith('7052') || student.rollNo.endsWith('7115');
    }
    if (selectedClassId === 'slot-2') {
      // Thermodynamics Mechanical Wing
      return student.rollNo.endsWith('041') || student.rollNo.endsWith('095') || student.rollNo.endsWith('027') ||
        student.rollNo.endsWith('085') || student.rollNo.endsWith('7018') || student.rollNo.endsWith('7009') ||
        student.rollNo.endsWith('7102');
    }
    return true;
  });

  // Filter doubt clusters based on selected class
  const classFilteredDoubts = doubtClusters.filter(cluster => {
    if (selectedClassId === 'all') return true;
    const selectedSlot = classes.find(c => c.id === selectedClassId);
    if (!selectedSlot) return true;
    return cluster.subjectId === selectedSlot.subjectId;
  });

  // Search and trajectory filtering
  const displayTelemetry = classFilteredTelemetry.filter(student => {
    const matchesSearch =
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedTrajectory !== 'all' && student.trajectory !== selectedTrajectory) return false;
    return true;
  });

  // Aggregated metrics for active class
  const totalStudyHours = classFilteredTelemetry.reduce((sum, s) => sum + s.studyHoursOnPlatform, 0).toFixed(1);
  const totalDoubtsAsked = classFilteredTelemetry.reduce((sum, s) => sum + s.doubtsAskedCount, 0);
  const totalQuestionsSolved = classFilteredTelemetry.reduce((sum, s) => sum + s.questionsSolvedCount, 0);
  const avgGrowthRate = (
    classFilteredTelemetry.reduce((sum, s) => sum + s.growthRatePercent, 0) /
    (classFilteredTelemetry.length || 1)
  ).toFixed(1);

  // Chart data
  const chartData = displayTelemetry.slice(0, 8).map(s => ({
    name: s.studentName.split(' ')[0],
    fullName: s.studentName,
    hours: s.studyHoursOnPlatform,
    solved: s.questionsSolvedCount,
    doubts: s.doubtsAskedCount,
    growth: s.growthRatePercent
  }));

  const handleGenerateScript = (cluster: CommonDoubtCluster) => {
    const script = `🎓 5-Minute Class Clarification Script for "${cluster.topicName}":

"Good morning class. Reviewing our EduSync telemetry, ${cluster.doubtCount} students logged doubts regarding ${cluster.topicName}. Let us clarify the core misconception in 3 concrete steps:

1. The Key Trap to Avoid:
${cluster.sampleDoubts[0] || 'Do not confuse path-dependent heat transfer with point-function entropy.'}

2. Intuitive Real-World Analogy:
Think of the system as an open reservoir. Heat entering at high temperature carries less disorder than heat entering at low temperature. When work is extracted irreversibly, friction degrades useful energy into molecular randomness.

3. The Examination Formula Rule:
Always write the net entropy balance equation before substituting numerical values: dS = dQ/T + S_gen. Remember that S_gen >= 0 for all real processes."`;

    setAiClarificationScript({
      topic: cluster.topicName,
      script
    });
    onGenerateAIExplanation(cluster);
  };

  const handleAssignBoosterTask = (student: StudentTelemetryMetric) => {
    const taskTitle = `Remedial Practice Drill: ${student.recentDoubtTopics[0] || 'Core Subject Misconceptions'}`;

    // Post to persistent database student tasks
    fetch('/api/db/student/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.studentId,
        title: taskTitle,
        categoryTag: 'Revision',
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        completed: false,
        priority: 'high',
        source: 'manual',
        createdAt: new Date().toISOString()
      })
    }).catch(() => {});

    setAssignedTaskToast(`Assigned remedial booster task to ${student.studentName}!`);
    setTimeout(() => setAssignedTaskToast(null), 3500);
  };

  const getStudentProfile = (s: StudentTelemetryMetric): StudentMistakeProfile => {
    if (DEFAULT_MISTAKE_PROFILES[s.studentId]) {
      return DEFAULT_MISTAKE_PROFILES[s.studentId];
    }
    return {
      mistakes: [
        `Difficulty applying core formulas in ${s.recentDoubtTopics[0] || 'Unit 2 derivations'}`,
        'Inconsistent assumption checks during numerical problem solving',
        'Time management pacing during timed multiple-choice diagnostic drills'
      ],
      laggingTopics: s.recentDoubtTopics.length > 0 ? s.recentDoubtTopics : ['Analytical Numerical Calculations', 'Boundary Conditions'],
      improvementPoints: [
        `Review lecture notes on ${s.recentDoubtTopics[0] || 'core definitions'} before the next tutorial`,
        'Practice 3 standard past-exam questions with boxed step-by-step reasoning',
        'Schedule a 10-minute check-in during faculty office hours'
      ],
      weeklyHours: [
        { day: 'Mon', hours: Math.max(1, Math.round(s.studyHoursOnPlatform * 0.15)), score: Math.max(45, Math.round(65 + s.growthRatePercent)) },
        { day: 'Tue', hours: Math.max(1, Math.round(s.studyHoursOnPlatform * 0.18)), score: Math.max(50, Math.round(68 + s.growthRatePercent)) },
        { day: 'Wed', hours: Math.max(1, Math.round(s.studyHoursOnPlatform * 0.12)), score: Math.max(48, Math.round(64 + s.growthRatePercent)) },
        { day: 'Thu', hours: Math.max(1, Math.round(s.studyHoursOnPlatform * 0.22)), score: Math.max(55, Math.round(72 + s.growthRatePercent)) },
        { day: 'Fri', hours: Math.max(1, Math.round(s.studyHoursOnPlatform * 0.15)), score: Math.max(52, Math.round(70 + s.growthRatePercent)) },
        { day: 'Sat', hours: Math.max(1, Math.round(s.studyHoursOnPlatform * 0.18)), score: Math.max(58, Math.round(75 + s.growthRatePercent)) }
      ]
    };
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {assignedTaskToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181D24] border border-[#6EA8A0] text-[#E2E8F0] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#6EA8A0] shrink-0" />
          <span>{assignedTaskToast}</span>
        </div>
      )}

      {/* 1. Header Banner & Class Switcher */}
      <div className="bg-[#181D24] border border-[#26303B] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#6EA8A0]/15 text-[#6EA8A0] border border-[#6EA8A0]/30">
                Performance Dashboard
              </span>
              <h2 className="text-xl font-bold text-[#E2E8F0] tracking-tight font-['Sora']">
                Student Performance & Progress
              </h2>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl">
              Track real study hours, questions solved, major student doubt topics, and click any student name to inspect where they make mistakes and how to help them improve.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#12161A] p-2.5 rounded-xl border border-[#26303B] shrink-0">
            <TrendingUp className="w-5 h-5 text-[#6EA8A0]" />
            <div>
              <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">Class Growth Average</span>
              <span className="text-sm font-bold text-[#6EA8A0]">+{avgGrowthRate}% This Month</span>
            </div>
          </div>
        </div>

        {/* CLASS SWITCHER STRIP */}
        <div className="mt-5 pt-4 border-t border-[#26303B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D9A566]" />
            <span className="text-xs font-semibold text-[#E2E8F0] font-['Sora']">Switch Class View:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedClassId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-['Sora'] transition-all cursor-pointer whitespace-nowrap ${
                selectedClassId === 'all'
                  ? 'bg-[#6EA8A0] text-[#12161A] font-bold shadow-md shadow-[#6EA8A0]/20'
                  : 'bg-[#12161A] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#26303B]'
              }`}
            >
              All Classes Combined
            </button>

            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-['Sora'] transition-all cursor-pointer whitespace-nowrap ${
                  selectedClassId === cls.id
                    ? 'bg-[#6EA8A0] text-[#12161A] font-bold shadow-md shadow-[#6EA8A0]/20'
                    : 'bg-[#12161A] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#26303B]'
                }`}
              >
                {cls.subjectCode} ({cls.section})
              </button>
            ))}
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
          <div className="bg-[#12161A] p-3.5 rounded-xl border border-[#26303B]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8] uppercase font-mono font-bold">Study Hours</span>
              <Clock className="w-3.5 h-3.5 text-[#6EA8A0]" />
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-black text-[#E2E8F0] font-['Sora']">{totalStudyHours}</span>
              <span className="text-xs text-[#6EA8A0] font-mono">hrs</span>
            </div>
            <span className="text-[10px] text-[#94A3B8] font-mono block mt-0.5">Platform learning time</span>
          </div>

          <div className="bg-[#12161A] p-3.5 rounded-xl border border-[#26303B]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8] uppercase font-mono font-bold">Doubts Asked</span>
              <HelpCircle className="w-3.5 h-3.5 text-[#D9A566]" />
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-black text-[#D9A566] font-['Sora']">{totalDoubtsAsked}</span>
              <span className="text-xs text-[#D9A566] font-mono">questions</span>
            </div>
            <span className="text-[10px] text-[#94A3B8] font-mono block mt-0.5">Asked to AI & tutors</span>
          </div>

          <div className="bg-[#12161A] p-3.5 rounded-xl border border-[#26303B]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8] uppercase font-mono font-bold">Practice Drills</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6EA8A0]" />
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-black text-[#6EA8A0] font-['Sora']">{totalQuestionsSolved}</span>
              <span className="text-xs text-[#6EA8A0] font-mono">solved</span>
            </div>
            <span className="text-[10px] text-[#94A3B8] font-mono block mt-0.5">Completed exercises</span>
          </div>

          <div className="bg-[#12161A] p-3.5 rounded-xl border border-[#26303B]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8] uppercase font-mono font-bold">Accelerating Pace</span>
              <Flame className="w-3.5 h-3.5 text-[#D9A566]" />
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-black text-[#E2E8F0] font-['Sora']">
                {classFilteredTelemetry.filter(s => s.trajectory === 'accelerating').length}
              </span>
              <span className="text-xs text-[#94A3B8] font-mono">/ {classFilteredTelemetry.length}</span>
            </div>
            <span className="text-[10px] text-[#94A3B8] font-mono block mt-0.5">Rapidly improving</span>
          </div>
        </div>
      </div>

      {/* 2. Major Student Doubts & Collective Highlights */}
      <div className="bg-[#181D24] border border-[#26303B] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#D9A566]/15 text-[#D9A566] border border-[#D9A566]/30 rounded-xl">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E2E8F0] font-['Sora'] flex items-center gap-2">
                <span>Major Student Doubts & Questions</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D9A566]/20 text-[#D9A566] border border-[#D9A566]/30">
                  {classFilteredDoubts.length} Key Topics Highlighted
                </span>
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Topics where multiple students got stuck. Review these before exams to prevent widespread score loss.
              </p>
            </div>
          </div>
        </div>

        {/* Collective Doubt Highlight Banner */}
        <div className="mb-4 p-3.5 bg-[#12161A] border border-[#D9A566]/30 rounded-xl flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-[#D9A566] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[#E2E8F0] block font-['Sora']">
              Collective Class Insight:
            </span>
            <span className="text-[#94A3B8] leading-relaxed">
              Across {selectedClassId === 'all' ? 'all combined classes' : 'this class'}, the highest frequency of doubts occurs in <strong className="text-[#D9A566]">"{classFilteredDoubts[0]?.topicName || 'Clausius Inequality'}"</strong> with {classFilteredDoubts[0]?.doubtCount || 14} student inquiries. Most errors stem from confusing heat path dependence with state variables.
            </span>
          </div>
        </div>

        {/* Doubt Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {classFilteredDoubts.map(cluster => {
            const isHigh = cluster.urgency === 'high';

            return (
              <div
                key={cluster.id}
                className="bg-[#12161A] border border-[#26303B] hover:border-[#6EA8A0]/50 p-4 rounded-xl flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isHigh
                          ? 'bg-[#C46859]/20 text-[#C46859] border border-[#C46859]/40'
                          : 'bg-[#D9A566]/20 text-[#D9A566] border border-[#D9A566]/40'
                      }`}
                    >
                      {cluster.urgency} Priority
                    </span>
                    <span className="text-xs font-mono font-bold text-[#6EA8A0] bg-[#181D24] px-2.5 py-0.5 rounded-lg border border-[#26303B]">
                      👥 {cluster.doubtCount} Students
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#E2E8F0] leading-snug font-['Sora']">
                    {cluster.topicName}
                  </h4>

                  {/* Sample questions students asked */}
                  <div className="mt-3 space-y-1.5 bg-[#181D24] p-3 rounded-xl border border-[#26303B]">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#D9A566]">Questions Students Asked:</span>
                    {cluster.sampleDoubts.slice(0, 2).map((doubt, i) => (
                      <p key={i} className="text-xs text-[#94A3B8] font-medium italic">
                        "{doubt}"
                      </p>
                    ))}
                  </div>

                  {/* AI Quick Remediation Guide */}
                  <div className="mt-3 bg-[#181D24] border border-[#6EA8A0]/30 p-3 rounded-xl">
                    <span className="text-[10px] font-mono font-bold text-[#6EA8A0] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#D9A566]" />
                      How to Explain in Class:
                    </span>
                    <p className="text-xs text-[#E2E8F0] mt-1 leading-relaxed">
                      {cluster.aiRemediationSuggestion}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#26303B]">
                  <button
                    onClick={() => handleGenerateScript(cluster)}
                    className="w-full py-2 px-3 bg-[#6EA8A0]/15 hover:bg-[#6EA8A0]/25 text-[#6EA8A0] rounded-xl text-xs font-bold border border-[#6EA8A0]/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Bot className="w-4 h-4 text-[#6EA8A0]" />
                    <span>Generate Explanation Script</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Teaching Script Modal */}
        {aiClarificationScript && (
          <div className="mt-5 p-4 bg-[#12161A] border border-[#6EA8A0]/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6EA8A0] flex items-center gap-1.5 font-['Sora']">
                <Sparkles className="w-4 h-4 text-[#D9A566]" />
                Classroom Teaching Script: {aiClarificationScript.topic}
              </span>
              <button
                onClick={() => setAiClarificationScript(null)}
                className="text-xs text-[#94A3B8] hover:text-[#E2E8F0] px-2 py-1 bg-[#181D24] border border-[#26303B] rounded cursor-pointer"
              >
                Close
              </button>
            </div>
            <pre className="text-xs text-[#E2E8F0] bg-[#181D24] p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed border border-[#26303B]">
              {aiClarificationScript.script}
            </pre>
          </div>
        )}
      </div>

      {/* 3. Performance & Engagement Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#181D24] border border-[#26303B] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#E2E8F0] font-['Sora']">Study Hours vs. Practice Drills</h3>
              <p className="text-xs text-[#94A3B8]">Comparison of student platform time against questions completed</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26303B" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12161A', borderColor: '#26303B', borderRadius: '12px', fontSize: '12px', color: '#E2E8F0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="hours" name="Hours Logged" fill="#6EA8A0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="solved" name="Questions Solved" fill="#D9A566" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#181D24] border border-[#26303B] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#E2E8F0] font-['Sora']">Learning Growth Trajectory (%)</h3>
              <p className="text-xs text-[#94A3B8]">Month-over-month learning progress and velocity per student</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26303B" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12161A', borderColor: '#26303B', borderRadius: '12px', fontSize: '12px', color: '#E2E8F0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="growth" name="Growth Rate %" stroke="#6EA8A0" fill="#6EA8A0" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Student List Table (Interactive on Click) */}
      <div className="bg-[#181D24] border border-[#26303B] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#26303B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#12161A]">
          <div>
            <h3 className="text-base font-bold text-[#E2E8F0] font-['Sora']">
              Student Performance Records
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Click on any student row below to inspect their detailed mistakes, weak areas, and improvement points.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#6EA8A0] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or roll no..."
                className="bg-[#181D24] border border-[#26303B] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-[#6EA8A0] font-medium"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#181D24] p-1 rounded-xl border border-[#26303B]">
              <button
                onClick={() => setSelectedTrajectory('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedTrajectory === 'all' ? 'bg-[#6EA8A0] text-[#12161A] font-bold' : 'text-[#94A3B8] hover:text-[#E2E8F0]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedTrajectory('accelerating')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedTrajectory === 'accelerating' ? 'bg-[#6EA8A0] text-[#12161A] font-bold' : 'text-[#94A3B8] hover:text-[#6EA8A0]'
                }`}
              >
                Accelerating
              </button>
              <button
                onClick={() => setSelectedTrajectory('needs_boost')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedTrajectory === 'needs_boost' ? 'bg-[#C46859] text-white font-bold' : 'text-[#94A3B8] hover:text-[#C46859]'
                }`}
              >
                Needs Boost
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#12161A] border-b border-[#26303B] text-[#6EA8A0] font-mono text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Student (Click for Details)</th>
                <th className="py-3.5 px-4">Study Hours</th>
                <th className="py-3.5 px-4">Doubts Asked</th>
                <th className="py-3.5 px-4">Questions Solved</th>
                <th className="py-3.5 px-4">Growth Rate</th>
                <th className="py-3.5 px-4">Pace Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26303B] text-[#E2E8F0]">
              {displayTelemetry.map(s => {
                const isAccelerating = s.trajectory === 'accelerating';
                const isNeedsBoost = s.trajectory === 'needs_boost';

                return (
                  <tr
                    key={s.studentId}
                    onClick={() => setSelectedStudent(s)}
                    className="hover:bg-[#12161A] transition-colors cursor-pointer group"
                    title="Click to view detailed performance, mistakes, and improvement points"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#12161A] text-[#6EA8A0] flex items-center justify-center font-mono font-bold text-xs border border-[#26303B] group-hover:border-[#6EA8A0]/60 transition-colors">
                          {s.avatar || s.studentName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-[#E2E8F0] text-sm block group-hover:text-[#6EA8A0] transition-colors">
                            {s.studentName}
                          </span>
                          <span className="text-[11px] font-mono text-[#94A3B8]">{s.rollNo}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <strong className="text-[#E2E8F0] font-bold text-sm">{s.studyHoursOnPlatform}</strong> <span className="text-[#94A3B8]">hrs</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-[#D9A566] font-bold text-sm">{s.doubtsAskedCount}</span> <span className="text-[#94A3B8]">doubts</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-[#6EA8A0] font-bold text-sm">{s.questionsSolvedCount}</span> <span className="text-[#94A3B8]">solved</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1 font-bold">
                        {s.growthRatePercent >= 0 ? (
                          <>
                            <ArrowUpRight className="w-4 h-4 text-[#6EA8A0]" />
                            <span className="text-[#6EA8A0] text-sm">+{s.growthRatePercent}%</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-4 h-4 text-[#C46859]" />
                            <span className="text-[#C46859] text-sm">{s.growthRatePercent}%</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isAccelerating && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-[#6EA8A0]/15 text-[#6EA8A0] border border-[#6EA8A0]/30">
                          🚀 Accelerating
                        </span>
                      )}
                      {isNeedsBoost && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-[#C46859]/20 text-[#C46859] border border-[#C46859]/40">
                          ⚠️ Needs Boost
                        </span>
                      )}
                      {!isAccelerating && !isNeedsBoost && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-[#12161A] text-[#94A3B8] border border-[#26303B]">
                          Steady
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(s);
                        }}
                        className="px-3 py-1 bg-[#12161A] hover:bg-[#6EA8A0] text-[#6EA8A0] hover:text-[#12161A] border border-[#6EA8A0]/40 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        Inspect Details →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. INTERACTIVE STUDENT DEEP-DIVE MODAL / DRAWER */}
      {/* ========================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#181D24] border border-[#26303B] rounded-2xl max-w-4xl w-full p-6 shadow-2xl text-[#E2E8F0] space-y-6 my-auto max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#26303B] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#12161A] text-[#6EA8A0] border border-[#6EA8A0]/40 flex items-center justify-center font-bold text-lg font-mono">
                  {selectedStudent.avatar || selectedStudent.studentName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#E2E8F0] font-['Sora']">
                      {selectedStudent.studentName}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#6EA8A0]/15 text-[#6EA8A0] border border-[#6EA8A0]/30">
                      {selectedStudent.rollNo}
                    </span>
                  </div>
                  <span className="text-xs text-[#94A3B8] font-mono">
                    {selectedStudent.studentName.toLowerCase().replace(/\s+/g, '.')}@bmu.edu.in
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl text-[#94A3B8] hover:text-[#E2E8F0] bg-[#12161A] border border-[#26303B] cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split Details & Deep Dive Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Basic Details & Engagement Stats */}
              <div className="space-y-4">
                <div className="bg-[#12161A] p-4 rounded-xl border border-[#26303B] space-y-3">
                  <h4 className="text-xs font-bold text-[#6EA8A0] uppercase tracking-wider font-mono">
                    Basic Profile & Status
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#26303B]">
                      <span className="text-[#94A3B8]">Roll Number</span>
                      <span className="font-mono font-bold text-[#E2E8F0]">{selectedStudent.rollNo}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#26303B]">
                      <span className="text-[#94A3B8]">Study Hours</span>
                      <span className="font-mono font-bold text-[#6EA8A0]">{selectedStudent.studyHoursOnPlatform} hrs</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#26303B]">
                      <span className="text-[#94A3B8]">Doubts Submitted</span>
                      <span className="font-mono font-bold text-[#D9A566]">{selectedStudent.doubtsAskedCount} questions</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#26303B]">
                      <span className="text-[#94A3B8]">Practice Drills</span>
                      <span className="font-mono font-bold text-[#6EA8A0]">{selectedStudent.questionsSolvedCount} completed</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#26303B]">
                      <span className="text-[#94A3B8]">Learning Pace</span>
                      <span className="font-mono font-bold text-[#E2E8F0] capitalize">
                        {selectedStudent.trajectory.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-[#94A3B8]">Growth Velocity</span>
                      <span className={`font-mono font-bold ${selectedStudent.growthRatePercent >= 0 ? 'text-[#6EA8A0]' : 'text-[#C46859]'}`}>
                        {selectedStudent.growthRatePercent >= 0 ? `+${selectedStudent.growthRatePercent}%` : `${selectedStudent.growthRatePercent}%`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#12161A] p-4 rounded-xl border border-[#26303B] space-y-2">
                  <span className="text-[10px] font-mono font-bold text-[#D9A566] uppercase">Topics with Doubts:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedStudent.recentDoubtTopics.map((topic, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] bg-[#181D24] text-[#E2E8F0] border border-[#26303B]">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 2 Columns: Detailed Chart, Mistakes, and Improvement Points */}
              <div className="md:col-span-2 space-y-4">
                {/* Individual Performance Weekly Chart */}
                <div className="bg-[#12161A] p-4 rounded-xl border border-[#26303B]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#E2E8F0] font-['Sora'] flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-[#6EA8A0]" />
                      Weekly Study Hours & Quiz Scores
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">Last 6 Days</span>
                  </div>

                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getStudentProfile(selectedStudent).weeklyHours}>
                        <CartesianGrid strokeDasharray="2 2" stroke="#26303B" />
                        <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} />
                        <YAxis stroke="#94A3B8" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#181D24', borderColor: '#26303B', borderRadius: '8px', fontSize: '11px', color: '#E2E8F0' }}
                        />
                        <Line type="monotone" dataKey="hours" name="Daily Hours" stroke="#6EA8A0" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="score" name="Test Score %" stroke="#D9A566" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Where He is Doing Mistakes & Lags */}
                <div className="bg-[#12161A] p-4 rounded-xl border border-[#C46859]/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#C46859]" />
                    <h4 className="text-xs font-bold text-[#C46859] uppercase tracking-wider font-['Sora']">
                      Where the Student Lags & Makes Mistakes:
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#E2E8F0]">
                    {getStudentProfile(selectedStudent).mistakes.map((mistake, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#181D24] p-2.5 rounded-lg border border-[#26303B]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C46859] mt-1.5 shrink-0" />
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concrete Improvement Points to be Added */}
                <div className="bg-[#12161A] p-4 rounded-xl border border-[#6EA8A0]/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6EA8A0]" />
                    <h4 className="text-xs font-bold text-[#6EA8A0] uppercase tracking-wider font-['Sora']">
                      Personalized Action Points for Improvement:
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#E2E8F0]">
                    {getStudentProfile(selectedStudent).improvementPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#181D24] p-2.5 rounded-lg border border-[#26303B]">
                        <Check className="w-4 h-4 text-[#6EA8A0] mt-0.5 shrink-0" />
                        <span className="text-[#E2E8F0] font-medium">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Row */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 bg-[#12161A] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#26303B] rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleAssignBoosterTask(selectedStudent)}
                    className="px-4 py-2 bg-[#6EA8A0] hover:bg-[#6EA8A0]/90 text-[#12161A] rounded-xl text-xs font-bold font-['Sora'] shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Assign Remedial Practice Task</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
