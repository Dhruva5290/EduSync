import React, { useState, useEffect } from 'react';
import { ClassAnalytics, Subject, ClassLevelInsight } from '../../types';
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
  Legend
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  BrainCircuit,
  ArrowUpRight,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

interface AIClassAnalyticsProps {
  analytics?: ClassAnalytics;
  activeSubject?: Subject;
  onRefreshDiagnostics?: () => Promise<void>;
  isGeneratingDiagnostics?: boolean;
}

export const AIClassAnalytics: React.FC<AIClassAnalyticsProps> = ({
  analytics: propAnalytics,
  activeSubject: propActiveSubject,
  onRefreshDiagnostics,
  isGeneratingDiagnostics = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'weakTopics' | 'trends'>('overview');
  const [classInsights, setClassInsights] = useState<ClassLevelInsight | null>(null);

  const activeSubject: Subject = propActiveSubject || {
    id: 'subj-phy',
    code: 'PHY',
    name: 'Physics',
    department: 'Department of Applied Sciences',
    teacherName: 'Dr. Ramesh Sharma',
    enrolledCount: 32
  };

  const analytics: ClassAnalytics = propAnalytics || {
    subjectId: activeSubject.id,
    subjectName: activeSubject.name,
    totalStudents: activeSubject.enrolledCount || 32,
    classAverage: 82.5,
    submissionRate: 90.0,
    atRiskStudentsCount: 2,
    gradeDistribution: [
      { range: '90-100% (A)', count: 10, percentage: 31 },
      { range: '80-89% (B)', count: 14, percentage: 44 },
      { range: '70-79% (C)', count: 5, percentage: 16 },
      { range: '60-69% (D)', count: 2, percentage: 6 },
      { range: '<60% (F)', count: 1, percentage: 3 }
    ],
    weakTopics: [
      {
        topic: 'Foundational Proofs & Invariants',
        errorRate: 35,
        averageScore: 68.0,
        affectedStudents: 11,
        recommendedRemediation: 'Provide extra practice worksheets and step-by-step inductive proof walkthroughs.',
        urgency: 'high'
      }
    ],
    trends: [
      { week: 'Week 1', avgScore: 86.0, submissionRate: 96.0, activeCount: 32 },
      { week: 'Week 2', avgScore: 83.2, submissionRate: 91.0, activeCount: 32 },
      { week: 'Week 3', avgScore: 82.5, submissionRate: 90.0, activeCount: 32 }
    ],
    aiExecutiveSummary: `Class average for ${activeSubject.name} is 82.5% with a steady 90% submission rate. Continue monitoring diagnostic quiz results.`,
    keyActionItems: [
      'Review weak topic proofs in upcoming lecture.',
      'Send reminders for next milestone deadline.'
    ],
    lastGenerated: new Date().toISOString()
  };

  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      try {
        if (!activeSubject?.id) return;
        const res = await fetch(`/api/teacher/class-insights/${activeSubject.id}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && typeof data === 'object') {
            setClassInsights(data);
          }
        }
      } catch (err) {
        console.error('Failed to load class insights:', err);
      }
    };
    fetchInsights();
    return () => {
      isMounted = false;
    };
  }, [activeSubject.id]);

  const weakConceptsList = Array.isArray(classInsights?.weakConcepts) ? classInsights.weakConcepts : [];
  const weakTopicsList = Array.isArray(analytics?.weakTopics) ? analytics.weakTopics : [];
  const keyActionItemsList = Array.isArray(analytics?.keyActionItems) ? analytics.keyActionItems : [];
  const gradeDistributionList = Array.isArray(analytics?.gradeDistribution) ? analytics.gradeDistribution : [];
  const trendsList = Array.isArray(analytics?.trends) ? analytics.trends : [];

  return (
    <div className="space-y-6">
      {/* Top Banner with AI Diagnostic Summary & Refresh Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-md p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-white uppercase">
                    AI Pedagogical Diagnostic Hub
                  </h2>
                  <span className="bg-blue-950 text-blue-300 text-[10px] px-2 py-0.5 rounded-sm border border-blue-800 font-mono font-medium">
                    BML Munjal University · AI Grounded
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Real-time cognitive aggregation for {activeSubject?.code || 'SUBJ'} · {activeSubject?.name || 'Course'} (Prof. {activeSubject?.teacherName || 'Faculty'})
                </p>
              </div>
            </div>

            {onRefreshDiagnostics && (
              <button
                id="analytics-refresh-diagnostics-btn"
                onClick={onRefreshDiagnostics}
                disabled={isGeneratingDiagnostics}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingDiagnostics ? 'animate-spin' : ''}`} />
                <span>{isGeneratingDiagnostics ? 'Analyzing Cohort...' : 'Regenerate AI Briefing'}</span>
              </button>
            )}
          </div>

          {/* AI Executive Summary Box */}
          <div className="mt-4 bg-slate-950 rounded-sm p-4 border border-slate-800">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Executive Faculty Briefing
                </p>
                <div className="text-xs text-slate-200 leading-relaxed font-sans">
                  {analytics?.aiExecutiveSummary || 'Cohort diagnostics running smoothly. All student mastery curves in acceptable range.'}
                </div>
              </div>
            </div>
          </div>

          {/* Class-Level Insights: "62% of students struggled with Newton's Second Law" */}
          {weakConceptsList.length > 0 && (
            <div className="mt-4 bg-amber-950/20 border border-amber-900/50 rounded-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
                    Class-Level Lecture Insights (Action Required)
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                  {weakConceptsList.length} Topics Flagged
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {weakConceptsList.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/80 rounded border border-amber-900/40 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">{item?.concept || 'Key Topic'}</span>
                      <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-900">
                        {item?.struggleRatePercent ?? 50}% Struggled
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
                      {item?.recommendation || 'Review key formulas and applications in next session.'}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                      <span>{item?.affectedStudentCount ?? 0} of {item?.totalStudents ?? 0} students affected</span>
                      <span className="text-cyan-400">ClassSarthi Ref: {item?.timestampRef || 'Live Lecture'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-md border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Cohort Average</p>
            <p className="text-2xl font-bold text-white mt-1">{analytics?.classAverage ?? 82.5}%</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-1">
              <TrendingUp className="w-3 h-3" /> +2.4% vs last week
            </span>
          </div>
          <div className="w-10 h-10 rounded-sm bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-md border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">On-Time Submissions</p>
            <p className="text-2xl font-bold text-white mt-1">{analytics?.submissionRate ?? 90}%</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Active deliverables</span>
          </div>
          <div className="w-10 h-10 rounded-sm bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-md border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Enrolled Students</p>
            <p className="text-2xl font-bold text-white mt-1">{analytics?.totalStudents ?? 32}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Verified BMU roll IDs</span>
          </div>
          <div className="w-10 h-10 rounded-sm bg-slate-950 text-slate-300 border border-slate-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-md border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">At-Risk Interventions</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">
              {analytics?.atRiskStudentsCount ?? 0} Students
            </p>
            <span className="text-[10px] text-rose-400 font-medium mt-1 block">Sub-65% diagnostic threshold</span>
          </div>
          <div className="w-10 h-10 rounded-sm bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Grade Distribution & Cohort Trends */}
        <div className="lg:col-span-7 bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm space-y-4 text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-tight text-white">
                Grade Distribution & Mastery Spreads
              </h3>
              <p className="text-xs text-slate-400">Distribution across 1st Year engineering assessments</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Total: {analytics?.totalStudents ?? 32}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistributionList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderRadius: '4px', color: '#fff', fontSize: '12px', border: '1px solid #1e293b' }}
                  formatter={(value: any) => [`${value} Students`, 'Count']}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Historical Trend Area */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                4-Week Longitudinal Mastery Curve
              </h4>
              <span className="text-xs text-blue-400 font-semibold font-mono">Mean + Participation</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderRadius: '4px', color: '#fff', fontSize: '12px', border: '1px solid #1e293b' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '6px', color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="avgScore" name="Avg Score (%)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#scoreGrad)" />
                  <Area type="monotone" dataKey="submissionRate" name="Submission Rate (%)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#subGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: AI Weak Topics & Action Items */}
        <div className="lg:col-span-5 space-y-6">
          {/* Weak Topics Analysis Cards */}
          <div className="bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm uppercase tracking-tight text-white">
                  Identified Knowledge Gaps
                </h3>
              </div>
              <span className="text-[10px] bg-blue-950 text-blue-300 font-semibold px-2 py-0.5 rounded-sm border border-blue-800">
                AI Pinpointed
              </span>
            </div>

            <div className="space-y-3">
              {weakTopicsList.length === 0 ? (
                <div className="p-4 rounded-sm border border-slate-800 bg-slate-950/70 text-center text-xs text-slate-400">
                  No critical knowledge gaps identified for this cohort.
                </div>
              ) : (
                weakTopicsList.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-sm border border-slate-800 bg-slate-950/70 hover:bg-slate-950 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs text-white leading-snug">
                        {topic?.topic || 'Concept Area'}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-sm border shrink-0 ${
                          topic?.urgency === 'high'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : topic?.urgency === 'medium'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-blue-950 text-blue-300 border-blue-800'
                        }`}
                      >
                        {topic?.errorRate ?? 25}% Error Rate
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                      <span>Avg Score: <strong className="text-slate-200">{topic?.averageScore ?? 75}%</strong></span>
                      <span>•</span>
                      <span>Affects: <strong className="text-slate-200">{topic?.affectedStudents ?? 0} students</strong></span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-start gap-1.5 text-xs text-slate-300">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white font-medium">Remediation:</strong> {topic?.recommendedRemediation || 'Conduct targeted review problem.'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Items Checklist for Faculty */}
          <div className="bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm space-y-3 text-slate-100">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm uppercase tracking-tight text-white">
                Recommended Pedagogical Actions
              </h3>
            </div>
            <ul className="space-y-2">
              {keyActionItemsList.length === 0 ? (
                <li className="text-xs text-slate-400 p-2.5 bg-slate-950 border border-slate-800 rounded-sm">
                  Cohort pace is on track with syllabus timeline.
                </li>
              ) : (
                keyActionItemsList.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-200 p-2.5 rounded-sm bg-slate-950 border border-slate-800"
                  >
                    <span className="w-4 h-4 rounded-sm bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
