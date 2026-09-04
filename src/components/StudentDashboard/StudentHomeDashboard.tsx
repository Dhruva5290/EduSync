import React, { useState, useEffect } from 'react';
import { User, ClassSarthiLecture, StudentDashboardSummary } from '../../types';
import { MathRenderer } from '../Common/MathRenderer';
import {
  BookOpen,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Play,
  FileCheck,
  Brain,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface StudentHomeDashboardProps {
  currentUser: User;
  onOpenLecture: (lectureId: string, initialTimestamp?: string) => void;
  onOpenTutorWithPrompt?: (prompt: string, lectureContext?: any) => void;
  onViewAssignments?: () => void;
  onViewBoardVisuals?: () => void;
}

export const StudentHomeDashboard: React.FC<StudentHomeDashboardProps> = ({
  currentUser,
  onOpenLecture,
  onOpenTutorWithPrompt,
  onViewAssignments,
  onViewBoardVisuals
}) => {
  const [summary, setSummary] = useState<StudentDashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${currentUser.id}/dashboard-summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Failed to load student dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [currentUser.id]);

  if (loading && !summary) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Synchronizing classroom lecture data & personalized learning plan...</p>
      </div>
    );
  }

  const {
    todayClasses = [],
    recentLectures = [],
    unfinishedLectures = [],
    assignments = [],
    topicsNeedingRevision = [],
    recentQuizPerformance,
    recommendedStudy = []
  } = summary || {};

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* 1. Core Purpose Banner: "After my class happened, what do I need to know, understand and do?" */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ClassSarthi Synced
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your classroom lectures are transcribed, indexed, and personalized below. Review key concepts, inspect blackboard captures, and test your mastery.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onOpenLecture(recentLectures[0]?.id || 'lec-phy-101')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Today's Class</span>
            </button>
            <button
              onClick={fetchSummary}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Today's Classes</p>
            <p className="text-lg sm:text-xl font-extrabold text-white mt-0.5">{todayClasses.length} Sessions</p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[10px] uppercase font-mono text-amber-400 font-semibold">Pending Homework</p>
            <p className="text-lg sm:text-xl font-extrabold text-amber-300 mt-0.5">{assignments.length} Tasks</p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[10px] uppercase font-mono text-rose-400 font-semibold">Needs Revision</p>
            <p className="text-lg sm:text-xl font-extrabold text-rose-300 mt-0.5">{topicsNeedingRevision.length} Concepts</p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">Recent Checkpoint</p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-300 mt-0.5">
              {recentQuizPerformance ? `${recentQuizPerformance.score}/${recentQuizPerformance.total}` : 'Ready'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Priority: Recommended Things to Study & Needs Revision */}
      {topicsNeedingRevision.length > 0 && (
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Concepts Needing Revision</h2>
                <p className="text-xs text-rose-200/80">Identified from your recent quiz mistakes — reinforced in lecture context</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-900/50 text-rose-300 rounded border border-rose-800">
              Targeted Scaffolding
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topicsNeedingRevision.map((topic, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/90 border border-rose-800/40 hover:border-rose-500/60 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{topic.concept}</span>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900">
                      Mastery: {topic.masteryScore}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{topic.reason}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onOpenLecture(topic.relatedLectureId, topic.timestampRef)}
                    className="flex-1 py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Jump to Class ({topic.timestampRef})</span>
                  </button>
                  <button
                    onClick={() =>
                      onOpenTutorWithPrompt &&
                      onOpenTutorWithPrompt(
                        `Why did I struggle with "${topic.concept}"? In lecture this was explained around ${topic.timestampRef}. Walk me through the physical reasoning step-by-step.`,
                        { lectureId: topic.relatedLectureId, weakConcepts: [topic.concept], timestampRef: topic.timestampRef }
                      )
                    }
                    className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Explain to Me</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Dashboard 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recently Uploaded & Unfinished Lectures */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recently Uploaded Lectures from ClassSarthi */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white tracking-tight">Recently Uploaded Lectures</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">From ClassSarthi</span>
            </div>

            <div className="space-y-3">
              {recentLectures.map(lecture => (
                <div
                  key={lecture.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {lecture.subjectCode}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {lecture.date} • {lecture.duration}
                      </span>
                      <span className="text-[11px] text-slate-400">by {lecture.teacherName}</span>
                    </div>

                    <h3
                      onClick={() => onOpenLecture(lecture.id)}
                      className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors cursor-pointer truncate"
                    >
                      {lecture.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{lecture.summary}</p>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {lecture.topics.slice(0, 3).map((topic, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800">
                          {topic}
                        </span>
                      ))}
                      {lecture.topics.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-mono">+{lecture.topics.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenLecture(lecture.id)}
                      className="px-3 py-2 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Study Lecture</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unfinished Lectures Section */}
          {unfinishedLectures.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold text-white tracking-tight">Unfinished Lectures</h2>
                </div>
                <span className="text-xs text-slate-400">Resume where you left off</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unfinishedLectures.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>{item.lecture.subjectCode}</span>
                        <span className="text-amber-400 font-bold">Stopped at {item.lastTimestamp}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{item.lecture.title}</h4>
                      {/* Progress bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${item.progressPercent}%` }} />
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenLecture(item.lecture.id, item.lastTimestamp)}
                      className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Resume at {item.lastTimestamp}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Next Steps */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Recommended Things to Study</h2>
            </div>

            <div className="space-y-2.5">
              {recommendedStudy.map((rec, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-200">{rec.title}</p>
                    <p className="text-[11px] text-slate-400">{rec.reason}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (rec.actionId.startsWith('lec-')) {
                        onOpenLecture(rec.actionId);
                      } else if (onViewAssignments) {
                        onViewAssignments();
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer"
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Today's Classes & Assignments */}
        <div className="space-y-6">
          {/* Today's Classes */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Today's Class Schedule</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{todayClasses.length} Scheduled</span>
            </div>

            <div className="space-y-2.5">
              {todayClasses.map(cls => (
                <div key={cls.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-cyan-400">{cls.subjectCode}</span>
                    <span className="text-slate-400">{cls.time}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 truncate">{cls.topic}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{cls.teacherName}</span>
                    <span className="text-slate-500">{cls.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments Mentioned in Lecture */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Extracted Assignments</h3>
              </div>
              {onViewAssignments && (
                <button
                  onClick={onViewAssignments}
                  className="text-[11px] text-emerald-400 hover:underline cursor-pointer font-semibold"
                >
                  View All
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {assignments.map(asg => (
                <div key={asg.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">{asg.subjectName}</span>
                    <span className="text-amber-400 font-bold">{asg.dueDate}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 leading-snug">{asg.title}</p>
                  <p className="text-[10px] text-slate-400 italic">From: {asg.relatedLectureTitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access to Board & Visuals */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400">Classroom Blackboard Visuals</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Inspect blackboard captures with OCR equations, vector free-body diagrams, and chemical structures captured by ClassSarthi.
            </p>
            {onViewBoardVisuals && (
              <button
                onClick={onViewBoardVisuals}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Browse Board Captures</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
