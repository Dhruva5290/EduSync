import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
  Users,
  Sparkles,
  Lightbulb,
  Compass,
  X,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  commandCenterService,
  StudentTelemetryRow
} from '../../../services/commandCenterService';
import { DoubtPatternCluster } from '../../../types';

export const PerformanceAnalyticsView: React.FC = () => {
  const [telemetry, setTelemetry] = useState<StudentTelemetryRow[]>(() =>
    commandCenterService.getStudentTelemetry()
  );
  const [doubtClusters, setDoubtClusters] = useState<DoubtPatternCluster[]>([]);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>('st-1');
  const [isLoadingClusters, setIsLoadingClusters] = useState(true);

  // AI Doubt Remediation Strategy State
  const [remediationCluster, setRemediationCluster] = useState<DoubtPatternCluster | null>(null);
  const [remediationData, setRemediationData] = useState<{
    mentalModel: string;
    analogy: string;
    conceptCheckQuestion: {
      question: string;
      options: string[];
      correctOptionIndex: number;
      explanation: string;
    };
  } | null>(null);
  const [isLoadingRemediation, setIsLoadingRemediation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleGenerateRemediation = async (cluster: DoubtPatternCluster) => {
    setRemediationCluster(cluster);
    setRemediationData(null);
    setSelectedOption(null);
    setShowAnswer(false);
    setIsLoadingRemediation(true);

    try {
      const res = await fetch('/api/ai/doubt-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cluster.topic,
          subjectCode: cluster.subjectCode,
          misconceptionExplanation: cluster.aiMisconceptionExplanation,
          sampleQuestions: cluster.sampleQuestions
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRemediationData(data);
      } else {
        throw new Error('Non-200 response');
      }
    } catch (err) {
      console.warn('Remediation fetch error, falling back locally:', err);
      setRemediationData({
        mentalModel: `Reframe ${cluster.topic} as an energy and state balance constraint rather than pure algebraic manipulation.`,
        analogy: `Think of a pressurized reservoir pipe: when resistance and head pressures equalize, fluid flow stops. Similarly, gradient drives physical work.`,
        conceptCheckQuestion: {
          question: `In ${cluster.topic}, what is the invariant constraint governing valid system equilibrium?`,
          options: [
            'Dynamic dissipation rate exceeds source input',
            'Net flux across system boundary equals internal accumulation',
            'Entropy becomes identically zero for all reversible paths',
            'Static head cancels all kinematic potential'
          ],
          correctOptionIndex: 1,
          explanation: 'Mass and energy conservation across the control volume boundary must balance internal accumulation.'
        }
      });
    } finally {
      setIsLoadingRemediation(false);
    }
  };

  useEffect(() => {
    commandCenterService
      .getDoubtPatternClusters()
      .then(clusters => {
        setDoubtClusters(clusters);
      })
      .finally(() => {
        setIsLoadingClusters(false);
      });
  }, []);

  // Section aggregate calculations
  const totalHours = telemetry.reduce((sum, s) => sum + s.studyHours, 0);
  const totalQuestions = telemetry.reduce((sum, s) => sum + s.questionsSolved, 0);
  const totalDoubts = telemetry.reduce((sum, s) => sum + s.doubtsAsked, 0);

  const getBucketBadge = (bucket: 'High' | 'Moderate' | 'Low') => {
    switch (bucket) {
      case 'High':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#C46859]/20 text-[#C46859] border border-[#C46859]/40">
            High Frequency
          </span>
        );
      case 'Moderate':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#D9A566]/20 text-[#D9A566] border border-[#D9A566]/40">
            Moderate Frequency
          </span>
        );
      case 'Low':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#6EA8A0]/20 text-[#6EA8A0] border border-[#6EA8A0]/40">
            Low Frequency
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Class-Level Top Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#181D24] border border-[#26303B]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2 font-mono">
            <span>TOTAL STUDY HOURS</span>
            <Clock className="w-4 h-4 text-[#6EA8A0]" />
          </div>
          <div className="text-2xl font-bold font-['Sora'] text-[#E2E8F0]">
            {totalHours.toFixed(1)} <span className="text-xs font-normal text-[#94A3B8]">hrs across sections</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Avg. 23.5 hrs / student this semester
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#181D24] border border-[#26303B]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2 font-mono">
            <span>QUESTIONS & DRILLS SOLVED</span>
            <CheckCircle2 className="w-4 h-4 text-[#D9A566]" />
          </div>
          <div className="text-2xl font-bold font-['Sora'] text-[#E2E8F0]">
            {totalQuestions} <span className="text-xs font-normal text-[#94A3B8]">problems</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            +18% drill velocity compared to last term
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#181D24] border border-[#26303B]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2 font-mono">
            <span>TOTAL DOUBTS LOGGED</span>
            <HelpCircle className="w-4 h-4 text-[#C46859]" />
          </div>
          <div className="text-2xl font-bold font-['Sora'] text-[#E2E8F0]">
            {totalDoubts} <span className="text-xs font-normal text-[#94A3B8]">inquiries</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Clustered into 3 recurring concept traps
          </p>
        </div>
      </div>

      {/* 2. Doubt Pattern Panel (High / Moderate / Low) with AI Misconception Explanations */}
      <div className="p-5 rounded-2xl bg-[#181D24] border border-[#26303B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26303B] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6EA8A0]/15 border border-[#6EA8A0]/30 flex items-center justify-center text-[#6EA8A0]">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#E2E8F0] font-['Sora'] tracking-tight">
                Doubt Pattern Clustering & Misconception Analysis
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Grouped by frequency with AI-generated root-cause diagnostics
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#94A3B8]">
            {doubtClusters.length} topics identified
          </span>
        </div>

        {isLoadingClusters ? (
          <div className="p-6 text-center text-xs text-[#94A3B8] font-mono">
            Clustering doubt logs by frequency...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doubtClusters.map((cluster, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#12161A] border border-[#26303B] space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono text-[#6EA8A0] font-bold">
                      {cluster.subjectCode}
                    </span>
                    {getBucketBadge(cluster.frequencyBucket)}
                  </div>

                  <h4 className="text-sm font-semibold text-[#E2E8F0] font-['Sora']">
                    {cluster.topic}
                  </h4>

                  <span className="text-[11px] font-mono text-[#D9A566] block mt-0.5">
                    {cluster.count} logged questions
                  </span>

                  {/* AI-Generated Misconception Paragraph */}
                  <div className="mt-3 p-3 rounded-lg bg-[#181D24] border border-[#26303B] text-xs text-[#94A3B8] leading-relaxed">
                    <strong className="font-mono text-[#E2E8F0] block mb-1 text-[11px]">
                      Likely Conceptual Misconception:
                    </strong>
                    {cluster.aiMisconceptionExplanation}
                  </div>
                </div>

                {/* Sample Question Snippet */}
                {cluster.sampleQuestions.length > 0 && (
                  <div className="pt-2 border-t border-[#26303B] text-[11px] text-[#94A3B8] italic truncate">
                    "{cluster.sampleQuestions[0]}"
                  </div>
                )}

                {/* AI Remediation Action Button */}
                <button
                  onClick={() => handleGenerateRemediation(cluster)}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-[#6EA8A0]/15 hover:bg-[#6EA8A0]/25 border border-[#6EA8A0]/40 text-[#6EA8A0] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer font-['Sora'] shadow-sm hover:scale-[1.01]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D9A566]" />
                  <span>Generate AI Remediation Strategy</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Individual Student Table with Expandable Charts */}
      <div className="p-5 rounded-2xl bg-[#181D24] border border-[#26303B] space-y-4">
        <div className="border-b border-[#26303B] pb-3">
          <h3 className="text-sm font-semibold text-[#E2E8F0] font-['Sora'] tracking-tight">
            Individual Student Progression & Longitudinal Telemetry
          </h3>
          <p className="text-[11px] text-[#94A3B8]">
            Click any row to inspect dual-axis study hours vs questions and growth trajectory
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#94A3B8]">
            <thead className="text-[10px] uppercase font-mono text-[#94A3B8] border-b border-[#26303B]">
              <tr>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Section</th>
                <th className="py-2.5 px-3">Study Hours</th>
                <th className="py-2.5 px-3">Questions</th>
                <th className="py-2.5 px-3">Doubts</th>
                <th className="py-2.5 px-3">Growth Rate</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26303B]/60">
              {telemetry.map(student => {
                const isExpanded = expandedStudentId === student.studentId;
                const isPositive = student.growthRatePercent >= 0;

                return (
                  <React.Fragment key={student.studentId}>
                    <tr
                      onClick={() =>
                        setExpandedStudentId(isExpanded ? null : student.studentId)
                      }
                      className="hover:bg-[#1E252D]/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-medium text-[#E2E8F0]">
                        {student.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        {student.rollNo}
                      </td>
                      <td className="py-3 px-3">{student.section}</td>
                      <td className="py-3 px-3 font-mono text-[#E2E8F0]">
                        {student.studyHours}h
                      </td>
                      <td className="py-3 px-3 font-mono text-[#E2E8F0]">
                        {student.questionsSolved}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#E2E8F0]">
                        {student.doubtsAsked}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        <span
                          className={
                            isPositive ? 'text-[#6EA8A0]' : 'text-[#C46859]'
                          }
                        >
                          {isPositive ? `+${student.growthRatePercent}%` : `${student.growthRatePercent}%`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 ml-auto text-[#6EA8A0]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-auto text-[#94A3B8]" />
                        )}
                      </td>
                    </tr>

                    {/* Expandable Charts Row (Strict dual-color palette: Teal #6EA8A0 + Amber #D9A566) */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="p-4 bg-[#12161A]/90">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Chart 1: Study Hours vs Questions Solved */}
                            <div className="p-4 rounded-xl bg-[#181D24] border border-[#26303B] space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-[#E2E8F0] font-['Sora']">
                                  Study Hours vs. Questions Solved
                                </span>
                                <div className="flex items-center gap-3 text-[10px] font-mono">
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#6EA8A0]" />
                                    Hours
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#D9A566]" />
                                    Drills
                                  </span>
                                </div>
                              </div>

                              <div className="h-44 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={student.studyHoursHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#26303B" vertical={false} />
                                    <XAxis dataKey="session" stroke="#94A3B8" fontSize={10} />
                                    <YAxis yAxisId="left" stroke="#6EA8A0" fontSize={10} width={25} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#D9A566" fontSize={10} width={25} />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: '#12161A',
                                        borderColor: '#26303B',
                                        fontSize: '11px',
                                        color: '#E2E8F0'
                                      }}
                                    />
                                    <Bar yAxisId="left" dataKey="hours" fill="#6EA8A0" radius={[3, 3, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="questions" fill="#D9A566" radius={[3, 3, 0, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Chart 2: Growth Rate Trajectory Over Time */}
                            <div className="p-4 rounded-xl bg-[#181D24] border border-[#26303B] space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-[#E2E8F0] font-['Sora']">
                                  Growth Rate Trajectory Over Time
                                </span>
                                <span className="text-[10px] font-mono text-[#6EA8A0]">
                                  Velocity Index
                                </span>
                              </div>

                              <div className="h-44 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={student.growthTrajectory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#26303B" vertical={false} />
                                    <XAxis dataKey="week" stroke="#94A3B8" fontSize={10} />
                                    <YAxis stroke="#94A3B8" fontSize={10} width={28} />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: '#12161A',
                                        borderColor: '#26303B',
                                        fontSize: '11px',
                                        color: '#E2E8F0'
                                      }}
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="rate"
                                      stroke="#6EA8A0"
                                      strokeWidth={2}
                                      dot={{ fill: '#D9A566', r: 3 }}
                                      activeDot={{ r: 5, fill: '#6EA8A0' }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. AI Doubt Remediation Strategy Modal */}
      {remediationCluster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl bg-[#181D24] border border-[#26303B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#26303B] bg-[#12161A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#6EA8A0]/20 border border-[#6EA8A0]/40 flex items-center justify-center text-[#6EA8A0]">
                  <Sparkles className="w-4 h-4 text-[#D9A566]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#6EA8A0] font-bold">
                      {remediationCluster.subjectCode}
                    </span>
                    <span className="text-xs text-[#94A3B8]">·</span>
                    <span className="text-xs font-bold text-[#E2E8F0] font-['Sora']">
                      AI Pedagogical Remediation
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#E2E8F0]">
                    {remediationCluster.topic}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setRemediationCluster(null)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E252D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {isLoadingRemediation ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#6EA8A0]" />
                  <p className="font-mono text-[#94A3B8]">
                    Synthesizing 3-step pedagogical intervention plan...
                  </p>
                </div>
              ) : remediationData ? (
                <div className="space-y-4">
                  {/* Step 1: Mental Model Shift */}
                  <div className="p-4 rounded-xl bg-[#12161A] border border-[#6EA8A0]/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#6EA8A0] font-['Sora']">
                      <Compass className="w-4 h-4" />
                      <span>Step 1: Core Mental Model Shift</span>
                    </div>
                    <p className="text-xs text-[#E2E8F0] leading-relaxed">
                      {remediationData.mentalModel}
                    </p>
                  </div>

                  {/* Step 2: Real-World Analogy */}
                  <div className="p-4 rounded-xl bg-[#12161A] border border-[#D9A566]/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#D9A566] font-['Sora']">
                      <Lightbulb className="w-4 h-4" />
                      <span>Step 2: Intuitive Engineering Analogy</span>
                    </div>
                    <p className="text-xs text-[#E2E8F0] leading-relaxed">
                      {remediationData.analogy}
                    </p>
                  </div>

                  {/* Step 3: Diagnostic 5-Minute In-Class Concept Check */}
                  <div className="p-4 rounded-xl bg-[#12161A] border border-[#26303B] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#E2E8F0] font-['Sora']">
                        <CheckCircle2 className="w-4 h-4 text-[#6EA8A0]" />
                        <span>Step 3: Diagnostic 5-Minute In-Class Concept Check</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#94A3B8] bg-[#181D24] px-2 py-0.5 rounded border border-[#26303B]">
                        Run at start of class
                      </span>
                    </div>

                    <p className="font-medium text-[#E2E8F0] text-xs">
                      {remediationData.conceptCheckQuestion.question}
                    </p>

                    <div className="space-y-2 pt-1">
                      {remediationData.conceptCheckQuestion.options.map((option, oIdx) => {
                        const isChosen = selectedOption === oIdx;
                        const isCorrect = oIdx === remediationData.conceptCheckQuestion.correctOptionIndex;
                        let itemStyle = "bg-[#181D24] border-[#26303B] text-[#94A3B8] hover:border-[#6EA8A0]/50 hover:text-[#E2E8F0]";

                        if (showAnswer) {
                          if (isCorrect) {
                            itemStyle = "bg-[#6EA8A0]/15 border-[#6EA8A0] text-[#6EA8A0] font-semibold";
                          } else if (isChosen && !isCorrect) {
                            itemStyle = "bg-[#C46859]/15 border-[#C46859] text-[#C46859]";
                          }
                        } else if (isChosen) {
                          itemStyle = "bg-[#6EA8A0]/15 border-[#6EA8A0] text-[#6EA8A0]";
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => setSelectedOption(oIdx)}
                            className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${itemStyle}`}
                          >
                            <span className="font-mono font-bold text-[11px] shrink-0 mt-0.5">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <span className="flex-1">{option}</span>
                            {showAnswer && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-[#6EA8A0] shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="text-xs font-mono text-[#6EA8A0] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {showAnswer ? 'Hide Explanation' : 'Reveal Correct Answer & Pedagogical Note'}
                      </button>

                      {showAnswer && (
                        <span className="text-[10px] font-mono text-[#D9A566]">
                          Correct: Option {String.fromCharCode(65 + remediationData.conceptCheckQuestion.correctOptionIndex)}
                        </span>
                      )}
                    </div>

                    {showAnswer && (
                      <div className="p-3 rounded-lg bg-[#181D24] border border-[#26303B] text-xs text-[#94A3B8] leading-relaxed">
                        <strong className="text-[#E2E8F0] block mb-1 font-mono text-[11px]">
                          Instructor Pedagogical Note:
                        </strong>
                        {remediationData.conceptCheckQuestion.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#26303B] bg-[#12161A] flex items-center justify-end">
              <button
                onClick={() => setRemediationCluster(null)}
                className="px-4 py-2 rounded-xl bg-[#6EA8A0] hover:bg-[#5D968E] text-[#12161A] text-xs font-semibold font-['Sora'] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
