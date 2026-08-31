import React from 'react';
import { Calendar, Clock, BookOpen, Video, ExternalLink, AlertTriangle, CheckCircle2, Bookmark, Flame } from 'lucide-react';

export const ResourceSidebar = ({ studentContext, recommendedResources }) => {
  const { upcomingAssignments, upcomingExam, currentSubject } = studentContext;

  return (
    <div className="flex flex-col h-full gap-4 overflow-y-auto pr-1">
      {/* 1. Upcoming Deadlines & Exam Card */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Upcoming Deadlines
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">
            {upcomingAssignments.length} Pending
          </span>
        </div>

        {/* Exam Milestone Callout */}
        {upcomingExam && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> {upcomingExam.title}
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-semibold bg-amber-950/60 px-1.5 py-0.5 rounded">
                {upcomingExam.date}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Syllabus Focus:
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {upcomingExam.syllabusTopics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] leading-tight">
                    <span className="text-amber-400 font-bold">•</span>
                    <span className="text-slate-300">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Assignment Items */}
        <div className="space-y-2.5">
          {upcomingAssignments.map((asg) => (
            <div
              key={asg.id}
              className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-lg p-3 space-y-1.5 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {asg.title}
                </h4>
                {asg.isUrgent && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded shrink-0">
                    Urgent
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> {asg.dueDate}
                </span>
                <span>{asg.points} Pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Dynamic Recommended Resources Card */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-sm flex-1">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Recommended Resources
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">
            Topic-Grounded
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-normal">
          Curated materials matching your active chat inquiries and course units:
        </p>

        <div className="space-y-3">
          {recommendedResources.map((res) => {
            const isVideo = res.type === 'video';
            return (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/60 rounded-lg p-3 transition-all duration-200 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {isVideo ? (
                      <span className="p-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        <Video className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Bookmark className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">
                      {res.type}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 group-hover:text-indigo-300">
                    {res.duration} <ExternalLink className="w-3 h-3" />
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-200 group-hover:text-white mt-2 leading-snug">
                  {res.title}
                </h4>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-indigo-400 font-mono">
                  Source: {res.provider}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResourceSidebar;
