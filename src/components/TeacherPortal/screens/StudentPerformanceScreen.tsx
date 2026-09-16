import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  Mail,
  Calendar,
  Search,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  X,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Lightbulb,
  Check,
  Flame,
  Filter,
} from 'lucide-react';
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
  Line,
} from 'recharts';
import { Student } from '../../../types';

interface StudentPerformanceScreenProps {
  students: Student[];
  onOpenSchedule1on1: (studentName: string) => void;
}

// Detailed mistake and remediation mapping for deep-dive
interface StudentMistakeProfile {
  mistakes: string[];
  laggingTopics: string[];
  improvementPoints: string[];
  weeklyHours: Array<{ day: string; hours: number; score: number }>;
}

const DEFAULT_MISTAKE_PROFILES: Record<string, StudentMistakeProfile> = {
  's-1': {
    mistakes: [
      'Confuses heat transfer path function (dQ/T) with state property (dS) in Clausius Inequality',
      'Calculation errors in environmental lapse rates and plume inversion heights',
      'Forgets boundary flux balance in open thermodynamic control volumes',
    ],
    laggingTopics: ['Second Law Clausius Inequality', 'Atmospheric Thermal Inversion', 'Entropy Balances'],
    improvementPoints: [
      'Practice 4 step-by-step numerical problems on Clausius cycle integration',
      'Review the 1-page visual formula sheet on Atmospheric Lapse Rates',
      'Attend the Thursday 4:00 PM TA doubt-clearing session',
    ],
    weeklyHours: [
      { day: 'Mon', hours: 1.2, score: 55 },
      { day: 'Tue', hours: 0.8, score: 52 },
      { day: 'Wed', hours: 1.5, score: 58 },
      { day: 'Thu', hours: 0.9, score: 54 },
      { day: 'Fri', hours: 1.0, score: 50 },
      { day: 'Sat', hours: 1.0, score: 53 },
    ],
  },
  's-2': {
    mistakes: [
      'Applying ideal gas law where compressibility factor Z deviates significantly from 1',
      'Confuses isothermal work with adiabatic work in reversible expansions',
      'Missing units in dilution factor P for BOD5 spectrophotometry',
    ],
    laggingTopics: ['Isothermal vs Adiabatic Work', 'Turbidity Calibration Curves', 'Compressibility Factor'],
    improvementPoints: [
      'Work through the step-by-step solution sheet for Carnot and Rankine cycles',
      'Re-attempt the Chapter 4 practice test with AI Tutor hints',
      'Submit step-by-step observation notebook for Lab C-12',
    ],
    weeklyHours: [
      { day: 'Mon', hours: 2.5, score: 68 },
      { day: 'Tue', hours: 3.0, score: 70 },
      { day: 'Wed', hours: 2.8, score: 65 },
      { day: 'Thu', hours: 3.2, score: 72 },
      { day: 'Fri', hours: 2.2, score: 67 },
      { day: 'Sat', hours: 2.5, score: 68 },
    ],
  },
  's-3': {
    mistakes: [
      'Minor sign convention slips during cyclic work integration',
      'Rushing through multi-variable Lagrange constraint checks',
    ],
    laggingTopics: ['Lagrange Multipliers Optimization', 'Multivariable Gradient Vector Collinearity'],
    improvementPoints: [
      'Solve advanced practice problems to maintain high test velocity',
      'Act as student mentor for the Section A study group',
    ],
    weeklyHours: [
      { day: 'Mon', hours: 5.5, score: 92 },
      { day: 'Tue', hours: 6.0, score: 94 },
      { day: 'Wed', hours: 5.8, score: 90 },
      { day: 'Thu', hours: 6.2, score: 95 },
      { day: 'Fri', hours: 5.0, score: 91 },
      { day: 'Sat', hours: 6.0, score: 93 },
    ],
  },
  's-4': {
    mistakes: [
      'Inverting phase angles when computing Reactive Power Q in complex RLC circuits',
      'Misinterpreting Kirchhoff Current Law nodal boundary signs in mesh loops',
    ],
    laggingTopics: ['AC Power Triangles', 'Complex Phasor Notation', 'Three-Phase Delta Connections'],
    improvementPoints: [
      'Simulate 3 AC nodal problems using Multisim or interactive circuit sandbox',
      'Complete Chapter 6 review exercises on Phasor Diagrams before next test',
    ],
    weeklyHours: [
      { day: 'Mon', hours: 3.1, score: 78 },
      { day: 'Tue', hours: 3.5, score: 80 },
      { day: 'Wed', hours: 2.9, score: 75 },
      { day: 'Thu', hours: 4.0, score: 82 },
      { day: 'Fri', hours: 3.8, score: 79 },
      { day: 'Sat', hours: 3.2, score: 81 },
    ],
  },
  's-5': {
    mistakes: [
      'Neglecting transient response time constants (L/R and RC) in first-order switching circuits',
      'Incomplete boundary conditions for differential equation step solutions',
    ],
    laggingTopics: ['First-Order RL/RC Transients', 'Capacitor Voltage Continuity'],
    improvementPoints: [
      'Review time-domain step response curves on page 142 of textbook',
      'Submit the solved practice problem set on RL decay curves',
    ],
    weeklyHours: [
      { day: 'Mon', hours: 2.0, score: 62 },
      { day: 'Tue', hours: 2.2, score: 64 },
      { day: 'Wed', hours: 1.8, score: 60 },
      { day: 'Thu', hours: 2.5, score: 65 },
      { day: 'Fri', hours: 2.1, score: 61 },
      { day: 'Sat', hours: 2.4, score: 63 },
    ],
  },
};

const TOPIC_MASTERY_DATA = [
  { topic: 'Thermodynamics Laws', classAvg: 82, target: 70, studentsLagging: 4 },
  { topic: 'Entropy & Clausius', classAvg: 64, target: 70, studentsLagging: 16 },
  { topic: 'AC Circuit Phasors', classAvg: 76, target: 70, studentsLagging: 8 },
  { topic: '3-Phase Transformers', classAvg: 88, target: 70, studentsLagging: 2 },
  { topic: 'Environmental Lapse', classAvg: 61, target: 70, studentsLagging: 19 },
];

const WEEKLY_TREND_DATA = [
  { week: 'Week 1', avgScore: 68, studyHours: 12.4 },
  { week: 'Week 2', avgScore: 71, studyHours: 13.8 },
  { week: 'Week 3', avgScore: 70, studyHours: 13.2 },
  { week: 'Week 4', avgScore: 74, studyHours: 15.0 },
  { week: 'Week 5', avgScore: 72, studyHours: 14.6 },
  { week: 'Week 6', avgScore: 77, studyHours: 16.2 },
  { week: 'Week 7', avgScore: 79, studyHours: 17.1 },
  { week: 'Week 8', avgScore: 81, studyHours: 18.0 },
];

export const StudentPerformanceScreen: React.FC<StudentPerformanceScreenProps> = ({
  students,
  onOpenSchedule1on1,
}) => {
  // Class Switcher State
  const [selectedClassTab, setSelectedClassTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [advisorAlertSent, setAdvisorAlertSent] = useState<string | null>(null);
  const [assignedTaskToast, setAssignedTaskToast] = useState<string | null>(null);
  const [aiClarificationOpen, setAiClarificationOpen] = useState(false);

  // Student Deep-Dive State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Filter students by class switcher
  const filteredStudents = useMemo(() => {
    let list = students;
    if (selectedClassTab === 'ES-101-A') {
      list = list.filter((s) => s.batch === 'ME-102-A' || s.rollNo.includes('089') || s.rollNo.includes('001') || s.rollNo.includes('034'));
    } else if (selectedClassTab === 'ME-102-B') {
      list = list.filter((s) => s.batch === 'ME-102 (B)' || s.batch === 'ME-102-B' || s.rollNo.includes('062') || s.rollNo.includes('019') || s.rollNo.includes('078'));
    } else if (selectedClassTab === 'ES-101-C') {
      list = list.filter((s) => s.batch === 'ES-101 (C)' || s.batch === 'ES-101-C' || s.rollNo.includes('045') || s.rollNo.includes('051'));
    } else if (selectedClassTab === 'ES-101L-1') {
      list = list.filter((s) => s.batch === 'ES-101L (B1)' || s.batch === 'ES-101L-1' || s.rollNo.includes('012') || s.rollNo.includes('023'));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q));
    }
    return list;
  }, [students, selectedClassTab, searchQuery]);

  const atRiskStudents = filteredStudents.filter((s) => s.isAtRisk || s.quizScore < 60);
  const avgQuiz = Math.round(
    filteredStudents.reduce((acc, s) => acc + s.quizScore, 0) / (filteredStudents.length || 1)
  );
  const avgReadiness = Math.round(
    filteredStudents.reduce((acc, s) => acc + s.midTermReadiness, 0) / (filteredStudents.length || 1)
  );

  const gradeDistribution = [
    { grade: 'A+ (90-100)', count: Math.round(filteredStudents.length * 0.3) || 3, percentage: 30, color: '#006e4b' },
    { grade: 'A (80-89)', count: Math.round(filteredStudents.length * 0.4) || 4, percentage: 40, color: '#3525cd' },
    { grade: 'B (70-79)', count: Math.round(filteredStudents.length * 0.15) || 2, percentage: 15, color: '#6b38d4' },
    { grade: 'C (60-69)', count: Math.round(filteredStudents.length * 0.05) || 1, percentage: 5, color: '#777587' },
    { grade: 'Needs Retest (<60)', count: atRiskStudents.length, percentage: Math.round((atRiskStudents.length / (filteredStudents.length || 1)) * 100), color: '#ba1a1a' },
  ];

  const handleNotifyAdvisor = (student: Student) => {
    setAdvisorAlertSent(`Academic Advisor notified for ${student.name} (${student.rollNo}). Counseling session queued.`);
    setTimeout(() => setAdvisorAlertSent(null), 4000);
  };

  const handleAssignRemedialTask = (student: Student) => {
    setAssignedTaskToast(`Practice homework drill #04 sent to ${student.name}'s student portal. Due in 48 hours.`);
    setTimeout(() => setAssignedTaskToast(null), 4000);
  };

  const getStudentProfile = (student: Student): StudentMistakeProfile => {
    if (DEFAULT_MISTAKE_PROFILES[student.id]) {
      return DEFAULT_MISTAKE_PROFILES[student.id];
    }
    if (student.quizScore < 65) {
      return {
        mistakes: [
          'Confuses heat transfer path function (dQ/T) with state property (dS) in Clausius Inequality',
          'Calculation errors in environmental lapse rates and plume inversion heights',
          'Forgets boundary flux balance in open thermodynamic control volumes',
        ],
        laggingTopics: ['Second Law Clausius Inequality', 'Atmospheric Thermal Inversion', 'Entropy Balances'],
        improvementPoints: [
          'Practice 4 step-by-step numerical problems on Clausius cycle integration',
          'Review the 1-page visual formula sheet on Atmospheric Lapse Rates',
          'Attend the Thursday 4:00 PM TA doubt-clearing session',
        ],
        weeklyHours: [
          { day: 'Mon', hours: 1.2, score: 55 },
          { day: 'Tue', hours: 0.8, score: 52 },
          { day: 'Wed', hours: 1.5, score: 58 },
          { day: 'Thu', hours: 0.9, score: 54 },
          { day: 'Fri', hours: 1.0, score: 50 },
          { day: 'Sat', hours: 1.0, score: 53 },
        ],
      };
    }
    return {
      mistakes: [
        'Minor algebraic slip in integrating non-ideal gas compressibility factor Z',
        'Overlooked energy balance velocity term for high-speed nozzle problem',
      ],
      laggingTopics: ['Nozzle Flow Dynamics', 'Compressibility Factor Z Curves'],
      improvementPoints: [
        'Solve 2 higher-order competitive exam questions for mastery',
        'Review the solved thermodynamics derivation in Chapter 5 notes',
      ],
      weeklyHours: [
        { day: 'Mon', hours: 3.5, score: 82 },
        { day: 'Tue', hours: 4.0, score: 85 },
        { day: 'Wed', hours: 3.8, score: 80 },
        { day: 'Thu', hours: 4.2, score: 86 },
        { day: 'Fri', hours: 3.2, score: 84 },
        { day: 'Sat', hours: 4.0, score: 88 },
      ],
    };
  };

  return (
    <div id="student-performance-screen" className="p-4 sm:p-6 lg:p-8 max-w-[1580px] mx-auto w-full flex flex-col gap-6">
      {/* 1. Header Banner & Class Switcher (Simplified Plain Words) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#eaedff] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#e2dfff] text-[#0f0069] font-bold">
              STUDENT PERFORMANCE & TEST SCORES
            </span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555]">
              Class Progress • Week 8
            </span>
          </div>
          <h1 className="font-['Sora'] text-2xl font-bold text-[#131b2e] mt-1">
            Student Marks, Test Scores & Progress
          </h1>
          <p className="text-[14px] text-[#464555]">
            Switch between classes, see where students need help, check test scores, and see how each student can improve.
          </p>
        </div>

        {/* Class Switcher Tabs */}
        <div className="flex flex-wrap items-center bg-[#f2f3ff] p-1.5 rounded-xl border border-[#e2e7ff] gap-1">
          {[
            { id: 'ALL', label: 'All Classes Combined' },
            { id: 'ES-101-A', label: 'ES-101 Div A' },
            { id: 'ME-102-B', label: 'ME-102 Div B' },
            { id: 'ES-101-C', label: 'ES-101 Div C' },
            { id: 'ES-101L-1', label: 'ES-101L Batch 1' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedClassTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                selectedClassTab === tab.id
                  ? 'bg-[#3525cd] text-white shadow-xs'
                  : 'text-[#464555] hover:text-[#131b2e] hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {advisorAlertSent && (
        <div className="p-3 bg-[#ecfdf5] border border-[#d1fae5] text-[#065f46] rounded-xl text-[13px] font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#006e4b]" />
          <span>{advisorAlertSent}</span>
        </div>
      )}

      {assignedTaskToast && (
        <div className="p-3 bg-[#e2dfff] border border-[#d0cbff] text-[#0f0069] rounded-xl text-[13px] font-medium flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-[#3525cd]" />
          <span>{assignedTaskToast}</span>
        </div>
      )}

      {/* 2. TOP TOPICS WHERE STUDENTS NEED HELP BANNER */}
      <div className="bg-gradient-to-r from-[#1e145b] to-[#3525cd] rounded-xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-['JetBrains_Mono'] bg-[#ffdad6] text-[#ba1a1a] flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#ba1a1a]" /> TOP TOPICS WHERE STUDENTS NEED HELP
            </span>
            <span className="text-[12px] text-white/80 font-['JetBrains_Mono']">
              {selectedClassTab === 'ALL' ? 'Across All Classes (48 Students)' : selectedClassTab}
            </span>
          </div>
          <h2 className="font-['Sora'] text-lg font-bold text-white">
            Clausius Inequality (18 Doubts) & BOD5 Dilution (14 Doubts) Need Quick Revision
          </h2>
          <p className="text-[13px] text-white/80">
            62% of students made repetitive mistakes with cycle integration signs in thermodynamics and water dilution calculations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setAiClarificationOpen(!aiClarificationOpen)}
            className="px-4 py-2 bg-white text-[#3525cd] hover:bg-[#f2f3ff] rounded-lg text-[13px] font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#3525cd]" />
            <span>{aiClarificationOpen ? 'Hide Explanation' : 'View Quick In-Class Explanation'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Explanation Box in Simple Words */}
      {aiClarificationOpen && (
        <div className="bg-white rounded-xl p-5 border border-[#eaedff] shadow-sm animate-in fade-in space-y-3">
          <div className="flex items-center justify-between border-b border-[#f2f3ff] pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#3525cd]" />
              <h3 className="font-['Sora'] font-bold text-[15px] text-[#131b2e]">
                Simple 5-Minute In-Class Clarification Guide
              </h3>
            </div>
            <span className="text-[11px] font-['JetBrains_Mono'] text-[#006e4b] bg-[#ecfdf5] px-2 py-0.5 rounded font-semibold">
              Ready for Monday Lecture
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
            <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff]">
              <h4 className="font-semibold text-[#3525cd] mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-[#3525cd]" />
                Thermodynamics: The Clausius Rule Made Easy
              </h4>
              <p className="text-[#464555] leading-relaxed">
                Start with a bicycle wheel analogy: for any real-world engine cycle, internal friction and entropy mean the overall cycle sum is strictly less than zero. Draw two simple circles on the board comparing an ideal reversible cycle (= 0) with a real engine (&lt; 0).
              </p>
            </div>

            <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff]">
              <h4 className="font-semibold text-[#006e4b] mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-[#006e4b]" />
                Environmental Studies: BOD5 Dilution Fraction
              </h4>
              <p className="text-[#464555] leading-relaxed">
                Show a standard 300 mL testing bottle. Remind students that the dilution fraction P is simply (Sample Volume in mL) divided by 300 mL. A 15 mL sample gives P = 0.05. Dividing by P instead of multiplying is where students lose 5 marks in tests.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. KPI Metric Cards (Simplified Language) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#eaedff]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase font-semibold text-[#464555]">Class Average Score</span>
            <Award className="w-5 h-5 text-[#3525cd]" />
          </div>
          <div className="font-['Sora'] text-3xl font-bold text-[#131b2e] mt-2">
            {avgQuiz}%
          </div>
          <span className="text-[12px] text-[#006e4b] font-medium font-['JetBrains_Mono']">
            ↑ +4.3% better than Quiz 1
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#eaedff]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase font-semibold text-[#464555]">Exam Readiness</span>
            <TrendingUp className="w-5 h-5 text-[#006e4b]" />
          </div>
          <div className="font-['Sora'] text-3xl font-bold text-[#006e4b] mt-2">
            {avgReadiness}%
          </div>
          <span className="text-[12px] text-[#464555]">Based on quizzes and homework</span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#eaedff]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase font-semibold text-[#ba1a1a]">Students Needing Help</span>
            <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />
          </div>
          <div className="font-['Sora'] text-3xl font-bold text-[#ba1a1a] mt-2">
            {atRiskStudents.length}
          </div>
          <span className="text-[12px] text-[#ba1a1a] font-medium font-['JetBrains_Mono']">
            Score below 60% or low attendance
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#eaedff]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase font-semibold text-[#6b38d4]">Lab Passing Rate</span>
            <BookOpen className="w-5 h-5 text-[#6b38d4]" />
          </div>
          <div className="font-['Sora'] text-3xl font-bold text-[#131b2e] mt-2">
            94.8%
          </div>
          <span className="text-[12px] text-[#464555]">All experiment reports submitted</span>
        </div>
      </div>

      {/* 4. DUAL CHARTS: TOPIC PERFORMANCE & WEEKLY SCORE GAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart: How Well the Class Knows Each Topic */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Sora'] font-semibold text-[16px] text-[#131b2e] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#3525cd]" />
                How Well the Class Knows Each Topic
              </h3>
              <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#f2f3ff] text-[#3525cd]">
                Target: 70%
              </span>
            </div>
            <p className="text-[13px] text-[#464555] mb-4">
              Compare average student scores against the 70% passing target for each unit.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TOPIC_MASTERY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f2f3ff" />
                  <XAxis dataKey="topic" stroke="#777587" fontSize={11} />
                  <YAxis stroke="#777587" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#eaedff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="classAvg" name="Class Average %" fill="#3525cd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Passing Target (70%)" fill="#dae2fd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-3 border-t border-[#f2f3ff] text-[12px] text-[#ba1a1a] font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Entropy & Environmental Lapse have 16+ students who need extra practice.</span>
          </div>
        </div>

        {/* Right Chart: Weekly Score Improvement & Study Hours */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Sora'] font-semibold text-[16px] text-[#131b2e] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#006e4b]" />
                Weekly Score Progress & Study Hours
              </h3>
              <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#ecfdf5] text-[#006e4b]">
                Steady Improvement
              </span>
            </div>
            <p className="text-[13px] text-[#464555] mb-4">
              Watch how weekly quiz scores improve as students spend more hours practicing.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEKLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3525cd" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3525cd" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="hourColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006e4b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#006e4b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f2f3ff" />
                  <XAxis dataKey="week" stroke="#777587" fontSize={11} />
                  <YAxis stroke="#777587" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#eaedff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="avgScore" name="Average Test Score %" stroke="#3525cd" fillOpacity={1} fill="url(#scoreColor)" />
                  <Area type="monotone" dataKey="studyHours" name="Hours Spent Studying" stroke="#006e4b" fillOpacity={1} fill="url(#hourColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-3 border-t border-[#f2f3ff] text-[12px] text-[#006e4b] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Scores have gained +13% overall since Week 1.</span>
          </div>
        </div>
      </div>

      {/* 5. Grade Breakdown & Students Needing Support Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grade Breakdown Bars */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div>
            <h3 className="font-['Sora'] font-semibold text-[16px] text-[#131b2e]">
              Class Grade Breakdown (Quiz 2)
            </h3>
            <p className="text-[13px] text-[#464555] mb-4">
              Marks distribution across {filteredStudents.length} registered students
            </p>

            <div className="flex flex-col gap-3">
              {gradeDistribution.map((item) => (
                <div key={item.grade} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[12px] font-['JetBrains_Mono']">
                    <span className="font-semibold text-[#131b2e]">{item.grade}</span>
                    <span className="text-[#464555]">
                      {item.count} students ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#f2f3ff] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#f2f3ff] flex items-center justify-between text-[12px] text-[#464555]">
            <span>Passing mark: 50%</span>
            <span className="font-['JetBrains_Mono'] text-[#3525cd] font-semibold">Most students scored between 75% - 90%</span>
          </div>
        </div>

        {/* Students Who Need Immediate Support */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />
                <h3 className="font-['Sora'] font-semibold text-[16px] text-[#131b2e]">
                  Students Who Need Immediate Support
                </h3>
              </div>
              <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] font-bold">
                Action Required
              </span>
            </div>
            <p className="text-[13px] text-[#464555] mt-1 mb-4">
              Students scoring below 60% or having attendance lower than 75%.
            </p>

            <div className="flex flex-col gap-3">
              {atRiskStudents.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-[#fff1f2] border border-[#ffe4e6] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div
                    onClick={() => setSelectedStudent(s)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#fecdd3] flex items-center justify-center font-bold text-[#881337] text-xs">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span>{s.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] text-[#881337] group-hover:underline">
                          {s.name}
                        </span>
                        <span className="font-['JetBrains_Mono'] text-[11px] text-[#9f1239]">
                          {s.rollNo}
                        </span>
                      </div>
                      <span className="text-[12px] text-[#9f1239]/80">
                        Score: {s.quizScore}% • Unresolved Doubts: {s.doubtsCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleNotifyAdvisor(s)}
                      className="px-2.5 py-1 rounded-lg bg-white text-[#9f1239] hover:bg-[#ffe4e6] text-[12px] font-semibold border border-[#ffe4e6] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Notify Advisor</span>
                    </button>
                    <button
                      onClick={() => onOpenSchedule1on1(s.name)}
                      className="px-2.5 py-1 rounded-lg bg-[#9f1239] hover:bg-[#881337] text-white text-[12px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>1-on-1 Help</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-[#f2f3ff] text-[12px] text-[#777587]">
            Counselor alerts are sent automatically every Wednesday at 6:00 PM.
          </div>
        </div>
      </div>

      {/* 6. DETAILED STUDENT MARKS LIST (CLICK TO DEEP DIVE) */}
      <div className="bg-white rounded-xl shadow-sm border border-[#eaedff] overflow-hidden">
        <div className="p-4 border-b border-[#eaedff] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-['Sora'] font-semibold text-[15px] text-[#131b2e]">
              Student Marks & Test Score List
            </h3>
            <p className="text-[12px] text-[#464555]">
              Click on any student to see their individual mistake profile, difficult topics, and simple steps to improve.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#777587] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student name or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[12px] focus:outline-none focus:ring-1 focus:ring-[#3525cd] w-56"
              />
            </div>
            <span className="font-['JetBrains_Mono'] text-[12px] text-[#3525cd] font-semibold bg-[#e2dfff] px-2.5 py-1 rounded-lg">
              {filteredStudents.length} Students Listed
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#f2f3ff] border-b border-[#eaedff] text-[12px] font-semibold text-[#464555] uppercase font-['JetBrains_Mono']">
                <th className="py-3 px-4">Student (Click for Details)</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4 text-center">Quiz 1 (100)</th>
                <th className="py-3 px-4 text-center">Quiz 2 (100)</th>
                <th className="py-3 px-4 text-center">Exam Prep</th>
                <th className="py-3 px-4 text-center">Unsolved Doubts</th>
                <th className="py-3 px-4 text-center">Learning Pace</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff]">
              {filteredStudents.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className="hover:bg-[#faf8ff] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#e2dfff] flex items-center justify-center font-bold text-[#0f0069] text-xs ring-1 ring-[#eaedff] group-hover:ring-[#3525cd]">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span>{s.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#131b2e] group-hover:text-[#3525cd] transition-colors block">
                          {s.name}
                        </span>
                        <span className="text-[11px] text-[#777587]">
                          {s.batch}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-['JetBrains_Mono'] text-[12px] text-[#464555]">
                    {s.rollNo}
                  </td>
                  <td className="py-3 px-4 text-center font-['JetBrains_Mono'] font-medium">
                    {s.quizScore > 65 ? s.quizScore - 4 : s.quizScore + 2}
                  </td>
                  <td className="py-3 px-4 text-center font-['JetBrains_Mono'] font-bold text-[#3525cd]">
                    {s.quizScore}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded font-bold ${
                        s.midTermReadiness >= 85
                          ? 'bg-[#d1fae5] text-[#065f46]'
                          : s.midTermReadiness >= 70
                          ? 'bg-[#e2dfff] text-[#0f0069]'
                          : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}
                    >
                      {s.midTermReadiness}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-['JetBrains_Mono']">
                    {s.doubtsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#ffe4e6] text-[#9f1239] text-[11px] font-bold">
                        {s.doubtsCount} Question{s.doubtsCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[#006e4b] text-[11px] font-medium">Clear</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {s.quizScore >= 80 ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ecfdf5] text-[#006e4b] border border-[#d1fae5]">
                        🚀 Doing Great
                      </span>
                    ) : s.quizScore < 60 ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ffdad6] text-[#ba1a1a] border border-[#ffcdd2]">
                        ⚠️ Needs Support
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f2f3ff] text-[#3525cd] border border-[#eaedff]">
                        Steady
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudent(s);
                      }}
                      className="px-3 py-1 bg-[#f2f3ff] hover:bg-[#3525cd] text-[#3525cd] hover:text-white rounded-lg text-[12px] font-semibold transition-all cursor-pointer"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. INTERACTIVE STUDENT DEEP DIVE MODAL (WHERE HE LAGS & MISTAKES)         */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white border border-[#eaedff] rounded-2xl max-w-4xl w-full p-6 shadow-2xl text-[#131b2e] space-y-6 my-auto max-h-[90vh] overflow-y-auto">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between border-b border-[#eaedff] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#e2dfff] flex items-center justify-center font-bold text-[#0f0069] text-base ring-2 ring-[#3525cd]/20">
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span>{selectedStudent.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#131b2e] font-['Sora']">
                      {selectedStudent.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-['JetBrains_Mono'] font-bold bg-[#e2dfff] text-[#0f0069]">
                      {selectedStudent.rollNo}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-['JetBrains_Mono'] bg-[#f2f3ff] text-[#464555]">
                      {selectedStudent.batch}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#777587] font-['JetBrains_Mono']">
                    {selectedStudent.name.toLowerCase().replace(/\s+/g, '.')}@bmu.edu.in
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-[#777587] hover:text-[#131b2e] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Details & Deep Dive Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Basic Details & Engagement Stats */}
              <div className="space-y-4">
                <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff] space-y-3">
                  <h4 className="text-[11px] font-bold text-[#3525cd] uppercase tracking-wider font-['JetBrains_Mono']">
                    Student Profile & Status
                  </h4>

                  <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between py-1 border-b border-[#eaedff]">
                      <span className="text-[#777587]">Roll Number</span>
                      <span className="font-['JetBrains_Mono'] font-bold text-[#131b2e]">{selectedStudent.rollNo}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#eaedff]">
                      <span className="text-[#777587]">Attendance Status</span>
                      <span className="font-['JetBrains_Mono'] font-bold capitalize text-[#006e4b]">
                        {selectedStudent.status} ({selectedStudent.punchTime || '10:02 AM'})
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#eaedff]">
                      <span className="text-[#777587]">Quiz 2 Score</span>
                      <span className="font-['JetBrains_Mono'] font-bold text-[#3525cd]">{selectedStudent.quizScore}%</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#eaedff]">
                      <span className="text-[#777587]">Exam Readiness</span>
                      <span className="font-['JetBrains_Mono'] font-bold text-[#131b2e]">{selectedStudent.midTermReadiness}%</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#eaedff]">
                      <span className="text-[#777587]">Unsolved Doubts</span>
                      <span className="font-['JetBrains_Mono'] font-bold text-[#ba1a1a]">
                        {selectedStudent.doubtsCount} pending
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-[#777587]">Learning Pace</span>
                      <span className={`font-['JetBrains_Mono'] font-bold ${
                        selectedStudent.quizScore >= 80 ? 'text-[#006e4b]' : selectedStudent.quizScore < 60 ? 'text-[#ba1a1a]' : 'text-[#3525cd]'
                      }`}>
                        {selectedStudent.quizScore >= 80 ? 'Doing Great' : selectedStudent.quizScore < 60 ? 'Needs Support' : 'Steady'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff] space-y-2">
                  <span className="text-[11px] font-['JetBrains_Mono'] font-bold text-[#464555] uppercase">
                    Past 5 Days Attendance:
                  </span>
                  <div className="flex items-center gap-1.5 pt-1">
                    {selectedStudent.streak.map((present, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          present ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                      >
                        {present ? 'P' : 'A'}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleAssignRemedialTask(selectedStudent)}
                    className="w-full py-2 bg-[#3525cd] hover:bg-[#281bb2] text-white rounded-xl text-[12px] font-semibold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Send Practice Homework to Student</span>
                  </button>

                  <button
                    onClick={() => {
                      const name = selectedStudent.name;
                      setSelectedStudent(null);
                      onOpenSchedule1on1(name);
                    }}
                    className="w-full py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3525cd] rounded-xl text-[12px] font-semibold border border-[#eaedff] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule 1-on-1 Help Session</span>
                  </button>
                </div>
              </div>

              {/* Right 2 Columns: Detailed Chart, Mistakes, and Improvement Points */}
              <div className="md:col-span-2 space-y-4">
                {/* Individual Performance Weekly Chart */}
                <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-bold text-[#131b2e] font-['Sora'] flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-[#3525cd]" />
                      Past 6 Days Study Hours & Test Scores
                    </span>
                    <span className="text-[11px] font-['JetBrains_Mono'] text-[#777587]">Daily Progress</span>
                  </div>

                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getStudentProfile(selectedStudent).weeklyHours}>
                        <CartesianGrid strokeDasharray="2 2" stroke="#eaedff" />
                        <XAxis dataKey="day" stroke="#777587" fontSize={10} />
                        <YAxis stroke="#777587" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#eaedff', borderRadius: '8px', fontSize: '11px' }}
                        />
                        <Line type="monotone" dataKey="hours" name="Daily Study Hours" stroke="#3525cd" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="score" name="Daily Test Score %" stroke="#006e4b" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Where the Student Makes Mistakes */}
                <div className="bg-[#fff1f2] p-4 rounded-xl border border-[#ffe4e6] space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
                    <h4 className="text-[12px] font-bold text-[#ba1a1a] uppercase tracking-wider font-['Sora']">
                      Where the Student is Making Mistakes:
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-[12px] text-[#881337]">
                    {getStudentProfile(selectedStudent).mistakes.map((mistake, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-[#ffe4e6]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] mt-1.5 shrink-0" />
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-1 flex flex-wrap gap-1">
                    <span className="text-[11px] font-bold text-[#ba1a1a]">Difficult Topics:</span>
                    {getStudentProfile(selectedStudent).laggingTopics.map((top, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white text-[#ba1a1a] text-[10px] font-semibold border border-[#ffe4e6]">
                        {top}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Simple Steps to Improve */}
                <div className="bg-[#ecfdf5] p-4 rounded-xl border border-[#d1fae5] space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#006e4b]" />
                    <h4 className="text-[12px] font-bold text-[#006e4b] uppercase tracking-wider font-['Sora']">
                      Simple Steps to Improve Marks:
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-[12px] text-[#065f46]">
                    {getStudentProfile(selectedStudent).improvementPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-[#d1fae5]">
                        <Check className="w-4 h-4 text-[#006e4b] shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
