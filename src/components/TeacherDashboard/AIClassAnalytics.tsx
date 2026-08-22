import React, { useState } from 'react';
import { ClassAnalytics, Subject } from '../../types';
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
  Lightbulb
} from 'lucide-react';

interface AIClassAnalyticsProps {
  analytics: ClassAnalytics;
  activeSubject: Subject;
  onRefreshDiagnostics: () => Promise<void>;
  isGeneratingDiagnostics: boolean;
}

export const AIClassAnalytics: React.FC<AIClassAnalyticsProps> = ({
  analytics,
  activeSubject,
  onRefreshDiagnostics,
  isGeneratingDiagnostics
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'weakTopics' | 'trends'>('overview');

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
                  Real-time cognitive aggregation for {activeSubject.code} · {activeSubject.name} (Prof. {activeSubject.teacherName})
                </p>
              </div>
            </div>

            <button
              id="analytics-refresh-diagnostics-btn"
              onClick={onRefreshDiagnostics}
              disabled={isGeneratingDiagnostics}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingDiagnostics ? 'animate-spin' : ''}`} />
              <span>{isGeneratingDiagnostics ? 'Analyzing Cohort...' : 'Regenerate AI Briefing'}</span>
            </button>
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
                  {analytics.aiExecutiveSummary}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-md border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Cohort Average</p>
            <p className="text-2xl font-bold text-white mt-1">{analytics.classAverage}%</p>
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
            <p className="text-2xl font-bold text-white mt-1">{analytics.submissionRate}%</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Active deliverables</span>
          </div>
          <div className="w-10 h-10 rounded-sm bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-md border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Enrolled Students</p>
            <p className="text-2xl font-bold text-white mt-1">{analytics.totalStudents}</p>
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
              {analytics.atRiskStudentsCount} Students
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
            <span className="text-xs font-mono text-slate-400">Total: {analytics.totalStudents}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <AreaChart data={analytics.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              {analytics.weakTopics.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-sm border border-slate-800 bg-slate-950/70 hover:bg-slate-950 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-white leading-snug">
                      {topic.topic}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-sm border shrink-0 ${
                        topic.urgency === 'high'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : topic.urgency === 'medium'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}
                    >
                      {topic.errorRate}% Error Rate
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                    <span>Avg Score: <strong className="text-slate-200">{topic.averageScore}%</strong></span>
                    <span>•</span>
                    <span>Affects: <strong className="text-slate-200">{topic.affectedStudents} students</strong></span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-start gap-1.5 text-xs text-slate-300">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white font-medium">Remediation:</strong> {topic.recommendedRemediation}</span>
                  </div>
                </div>
              ))}
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
              {analytics.keyActionItems.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-200 p-2.5 rounded-sm bg-slate-950 border border-slate-800"
                >
                  <span className="w-4 h-4 rounded-sm bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
