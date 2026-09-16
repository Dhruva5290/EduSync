import React, { useState } from 'react';
import {
  TrendingUp,
  AlertOctagon,
  Users,
  Award,
  BookOpen,
  ArrowUpRight,
  Send,
  Sparkles,
  CheckCircle,
  HelpCircle,
  BarChart3,
  Filter,
} from 'lucide-react';
import { Subject } from '../types';

interface FacultyAnalyticsViewProps {
  subjects: Subject[];
  onPushIntervention?: (studentTopic: string) => void;
}

export const FacultyAnalyticsView: React.FC<FacultyAnalyticsViewProps> = ({
  subjects,
  onPushIntervention,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('subj-phy');
  const [interventionSentTopic, setInterventionSentTopic] = useState<string | null>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const riskClusters = [
    {
      id: 'cluster-1',
      concept: 'Normal Reaction on Inclined Planes',
      trapDescription: 'Students equate N = mg instead of N = mg cos(θ) when resolving perpendicular axes.',
      affectedCount: 9,
      percentage: '14.1% of class',
      severity: 'high',
      suggestedRemedy: 'Push 3-minute video explanation on coordinate tilt + 2-step FBD drill.',
    },
    {
      id: 'cluster-2',
      concept: 'Frictional Threshold & Mass Invariance',
      trapDescription: 'Misconception that heavier objects have higher angle of repose (tan θ = μ_s).',
      affectedCount: 6,
      percentage: '9.4% of class',
      severity: 'medium',
      suggestedRemedy: 'Post classroom Poll: "Does mass affect sliding start?" with Socratic guidance.',
    },
    {
      id: 'cluster-3',
      concept: "Indeterminate Limits (0/0) & L'Hôpital",
      trapDescription: 'Applying quotient rule to numerator/denominator instead of separate differentiation.',
      affectedCount: 5,
      percentage: '7.8% of class',
      severity: 'medium',
      suggestedRemedy: 'Review Cauchy Mean Value Theorem foundations during Friday lab.',
    },
  ];

  const handleSendRemedy = (concept: string) => {
    setInterventionSentTopic(concept);
    if (onPushIntervention) {
      onPushIntervention(concept);
    }
    setTimeout(() => setInterventionSentTopic(null), 3500);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with subject selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#0051d5]">
              Faculty Academic Intelligence
            </span>
            <span className="text-xs text-[#5a4138]">Real-time Classroom Ingestion</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-1">
            Class Mastery & Diagnostics
          </h1>
          <p className="text-sm text-[#5a4138]">
            Automated concept risk clusters, rubric grade distribution, and targeted remedial interventions.
          </p>
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2 bg-white border border-[#e2e8f0] p-1.5 rounded-2xl shadow-xs">
          <Filter className="w-4 h-4 text-[#5a4138] ml-2" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#0b1c30] outline-none pr-3 py-1 cursor-pointer"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-xs">
          <span className="text-xs font-bold text-[#5a4138]">Class Cohort Average</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-3xl font-black text-[#0b1c30]">84.6%</span>
            <span className="text-xs font-bold text-[#006947] flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +3.2%
            </span>
          </div>
          <span className="text-[11px] text-[#5a4138] mt-1 block">Across 64 enrolled students</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-xs">
          <span className="text-xs font-bold text-[#5a4138]">On-Time Submissions</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-3xl font-black text-[#0b1c30]">95.3%</span>
            <span className="text-xs font-bold text-[#006947]">High Velocity</span>
          </div>
          <span className="text-[11px] text-[#5a4138] mt-1 block">61 of 64 turned in Problem Set 3</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-xs">
          <span className="text-xs font-bold text-[#5a4138]">At-Risk Misconception Clusters</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-3xl font-black text-[#ba1a1a]">3 Active</span>
            <span className="text-xs font-bold text-[#ba1a1a]">Needs Review</span>
          </div>
          <span className="text-[11px] text-[#5a4138] mt-1 block">Concentrated in Incline Vectors</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-xs">
          <span className="text-xs font-bold text-[#5a4138]">Lecture Video Engagement</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-3xl font-black text-[#0051d5]">89.1%</span>
            <span className="text-xs font-bold text-[#0051d5]">OCR Synced</span>
          </div>
          <span className="text-[11px] text-[#5a4138] mt-1 block">Avg replay at 21:05 (FBD step)</span>
        </div>
      </div>

      {/* Middle Section: Risk Clusters & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Misconception Clusters */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
            <div>
              <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-[#ba1a1a]" />
                Cognitive Misconception Risk Clusters
              </h3>
              <p className="text-xs text-[#5a4138]">
                Detected from student quiz errors, OCR homework scans, and AI Socratic chat logs.
              </p>
            </div>
            <span className="text-xs font-bold text-[#a33900] bg-[#fff3ea] px-2.5 py-1 rounded-full">
              Automated AI Flag
            </span>
          </div>

          <div className="space-y-3">
            {riskClusters.map((cluster) => (
              <div
                key={cluster.id}
                className="p-4 rounded-xl border border-[#eff4ff] bg-[#fcfdff] hover:bg-white hover:border-[#cbd5e1] transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0b1c30]">
                      {cluster.concept}
                    </h4>
                    <p className="text-xs text-[#5a4138] mt-0.5 leading-relaxed">
                      {cluster.trapDescription}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex-shrink-0 ${
                      cluster.severity === 'high'
                        ? 'bg-[#ffebee] text-[#ba1a1a]'
                        : 'bg-[#fff3ea] text-[#a33900]'
                    }`}
                  >
                    {cluster.affectedCount} Students ({cluster.percentage})
                  </span>
                </div>

                <div className="bg-[#eff4ff] p-2.5 rounded-lg text-xs flex items-center justify-between gap-3">
                  <span className="text-[#00318b] font-medium">
                    💡 <strong>Suggested Intervention:</strong> {cluster.suggestedRemedy}
                  </span>
                  <button
                    onClick={() => handleSendRemedy(cluster.concept)}
                    className="flex-shrink-0 px-3 py-1 bg-[#0051d5] hover:bg-[#0041ab] text-white text-[11px] font-bold rounded-md transition-colors cursor-pointer"
                  >
                    Push Remedy
                  </button>
                </div>
              </div>
            ))}
          </div>

          {interventionSentTopic && (
            <div className="p-3 bg-[#e6f4ea] border border-[#006947]/30 text-[#006947] rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#006947]" />
              <span>Remedial drill on "{interventionSentTopic}" broadcast to all 9 affected student portals!</span>
            </div>
          )}
        </div>

        {/* Right: Rubric Grade Distribution & Replay Hotspots */}
        <div className="lg:col-span-5 space-y-6">
          {/* Grade Distribution */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0051d5]" />
              Rubric Assessment Distribution
            </h3>
            <div className="space-y-3">
              {[
                { range: 'A Grade (90% - 100%)', count: 32, pct: '50%', color: 'bg-[#006947]' },
                { range: 'B Grade (80% - 89%)', count: 21, pct: '33%', color: 'bg-[#0051d5]' },
                { range: 'C Grade (70% - 79%)', count: 8, pct: '12%', color: 'bg-[#a33900]' },
                { range: 'D/F Review (<70%)', count: 3, pct: '5%', color: 'bg-[#ba1a1a]' },
              ].map((tier) => (
                <div key={tier.range} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#0b1c30]">{tier.range}</span>
                    <span className="text-[#5a4138]">{tier.count} students ({tier.pct})</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${tier.color} rounded-full transition-all duration-500`}
                      style={{ width: tier.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Replay Hotspots */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0b1c30]">
              Lecture Replay Spikes
            </h3>
            <p className="text-xs text-[#5a4138]">
              Sections where students rewound or repeated classroom video:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#eff4ff] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0051d5]">21:05 - Incline Plane FBD Derivation</span>
                  <p className="text-[11px] text-[#5a4138]">94 student replays (Peak focus)</p>
                </div>
                <span className="text-[11px] font-bold text-[#006947] bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">
                  High Retention
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#fff3ea] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#a33900]">34:40 - Kinetic Friction Acceleration</span>
                  <p className="text-[11px] text-[#5a4138]">68 student replays</p>
                </div>
                <span className="text-[11px] font-bold text-[#a33900] bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">
                  Misconception Zone
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
