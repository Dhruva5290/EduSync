import React, { useMemo } from 'react';
import { User } from '../../../types';
import { useStudentContext } from '../../../context/StudentContext';
import {
  Play,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Lightbulb,
  Check,
  Target
} from 'lucide-react';

interface StudentHomeTabProps {
  currentUser: User;
  onNavigateToLecture: (lectureId: string) => void;
  onNavigateToClasses: (subjectId?: string) => void;
  onNavigateToQuiz: (lectureId?: string) => void;
  onNavigateToTutor: (initialPrompt?: string, weakTopic?: string) => void;
  onNavigateToAssignments: () => void;
}

export const StudentHomeTab: React.FC<StudentHomeTabProps> = ({
  currentUser,
  onNavigateToLecture,
  onNavigateToClasses,
  onNavigateToQuiz,
  onNavigateToTutor,
  onNavigateToAssignments
}) => {
  const { dashboardData, weakPoints, markAssignmentDone } = useStudentContext();

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const todayDateStr = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  const firstName = currentUser.name.split(' ')[0] || 'Student';

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8 max-w-[1520px] mx-auto w-full animate-in fade-in duration-200">
      {/* Top Header Banner Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-slate-100">
        {/* Greeting & Subtext */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-[#0051d5] font-semibold text-xs tracking-wider">
              STUDENT DASHBOARD
            </span>
            <span className="text-slate-500 font-medium text-xs flex items-center gap-1">
              • {todayDateStr}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight flex items-center gap-2">
            <span>{greetingTime}, {firstName}</span>
            <span className="inline-block hover:rotate-12 transition-transform duration-200">👋</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            You have <strong className="font-bold text-[#0051d5]">5 pending tasks</strong> and <strong className="font-bold text-[#006947]">1 lecture ready for review</strong> today.
          </p>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex items-center gap-4 self-start lg:self-center">
          {/* 85% Mastery */}
          <div className="bg-slate-50 rounded-2xl px-5 py-3 flex flex-col items-center justify-center min-w-[95px] shadow-xs border border-slate-100">
            <span className="text-2xl font-extrabold text-[#0051d5]">85%</span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mastery</span>
          </div>
          {/* 12 Lectures */}
          <div className="bg-slate-50 rounded-2xl px-5 py-3 flex flex-col items-center justify-center min-w-[95px] shadow-xs border border-slate-100">
            <span className="text-2xl font-extrabold text-[#006947]">12</span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lectures</span>
          </div>
          {/* 5 To-Do */}
          <div className="bg-slate-50 rounded-2xl px-5 py-3 flex flex-col items-center justify-center min-w-[95px] shadow-xs border border-slate-100">
            <span className="text-2xl font-extrabold text-[#c2410c]">5</span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">To-Do</span>
          </div>
        </div>
      </div>

      {/* Core Grid Layout: 8-cols Main Workspace + 4-cols Contextual Hub */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left / Center Main Column (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          {/* Continue Learning Hero Feature Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0051d5] text-white p-6 md:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Background Ambient Glow Accents */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#c2410c]/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-2.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold tracking-wider uppercase w-fit">
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Continue Learning</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {dashboardData?.todayLecture?.title || "ClassSarthi Live Camera Session: Rotational Mechanics"}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-1.5 flex-wrap">
                <span>Class 11 Physics (Mechanics & Thermodynamics)</span>
                <span>•</span>
                <span>Dr. Rajesh Kulkarni</span>
                <span>•</span>
                <span>⏱ 45 mins</span>
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                onClick={() => onNavigateToLecture('lec-phy-101')}
                className="inline-flex items-center gap-2 bg-white text-[#0051d5] font-bold text-sm px-6 py-3 rounded-full shadow-md hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Resume Notes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Today's Classes & Schedule Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 border border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0051d5] font-bold">
                  🗓️
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-[#0b1c30]">Today's Classes & Schedule</h3>
                  <span className="text-xs text-slate-500">Click a class to view synchronized notes & lecture recordings</span>
                </div>
              </div>
              <button
                onClick={() => onNavigateToClasses()}
                className="inline-flex items-center gap-1 text-sm font-bold text-[#0051d5] hover:underline cursor-pointer"
              >
                <span>View All Classes</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Schedule Grid (3 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Physics */}
              <div
                onClick={() => onNavigateToLecture('lec-phy-101')}
                className="bg-slate-50/70 hover:bg-slate-100/80 rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-2xs transition-all hover:scale-[1.01] group cursor-pointer border border-slate-100"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0051d5]">09:00 AM</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006947] text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006947]"></span>
                      Live Notes Ready
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Physics 11</h4>
                    <p className="text-xs text-slate-500">Dr. Rajesh Kulkarni • Room 302</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-medium border border-slate-100">Vectors</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-medium border border-slate-100">Normal Force</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-medium border border-slate-100">Kinetic Friction</span>
                </div>
              </div>

              {/* Card 2: Math */}
              <div
                onClick={() => onNavigateToLecture('lec-mth-201')}
                className="bg-slate-50/70 hover:bg-slate-100/80 rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-2xs transition-all hover:scale-[1.01] group cursor-pointer border border-slate-100"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0051d5]">11:00 AM</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0051d5] text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]"></span>
                      Upcoming
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Mathematics 11</h4>
                    <p className="text-xs text-slate-500">Prof. Ananya Sen • Room 105</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-medium border border-slate-100">Limits at ∞</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-medium border border-slate-100">L'Hopital Rule</span>
                </div>
              </div>

              {/* Card 3: Electronics */}
              <div
                onClick={() => onNavigateToLecture('lec-cs-301')}
                className="bg-slate-50/70 hover:bg-slate-100/80 rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-2xs transition-all hover:scale-[1.01] group cursor-pointer border border-slate-100"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-600">02:00 PM</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      Scheduled
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Electronics & CS</h4>
                    <p className="text-xs text-slate-500">Dr. Sunita Rao • Lab B</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-medium border border-slate-100">Boolean Algebra</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-medium border border-slate-100">Logic Gates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Learning Activity & Mastery (Graph & Insights) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 border border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-[#c2410c] font-bold">
                  📊
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0b1c30]">Your Learning Activity & Mastery</h3>
                  <span className="text-xs text-slate-500">Weekly hours split between concept theory and problem sets</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#0051d5]"></span>
                  <span className="text-xs font-semibold text-slate-700">Theory</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#006947]"></span>
                  <span className="text-xs font-semibold text-slate-700">Practice</span>
                </div>
              </div>
            </div>

            {/* Weekly Bar Visualization */}
            <div className="bg-slate-50/60 rounded-2xl p-5 flex flex-col gap-4 border border-slate-100">
              <div className="grid grid-cols-7 gap-2 items-end h-40 pt-4 px-2">
                {[
                  { day: 'Mon', tH: 'h-14', pH: 'h-10' },
                  { day: 'Tue', tH: 'h-20', pH: 'h-16' },
                  { day: 'Wed', tH: 'h-16', pH: 'h-12' },
                  { day: 'Thu', tH: 'h-24', pH: 'h-14' },
                  { day: 'Fri', tH: 'h-28', pH: 'h-20' },
                  { day: 'Today', tH: 'h-18', pH: 'h-24', isToday: true },
                  { day: 'Sun', tH: 'h-8', pH: 'h-6', isDim: true },
                ].map((col, idx) => (
                  <div key={idx} className={`flex flex-col items-center gap-2 h-full justify-end group ${col.isToday ? 'bg-blue-50/60 rounded-xl p-1' : ''}`}>
                    <div className="w-full max-w-[28px] flex flex-col gap-1 items-center">
                      <div className={`w-full bg-[#0051d5] rounded-t-sm ${col.tH} group-hover:brightness-110 transition-all ${col.isDim ? 'opacity-40' : ''}`}></div>
                      <div className={`w-full ${col.isToday ? 'bg-[#c2410c]' : 'bg-[#006947]'} rounded-b-sm ${col.pH} group-hover:brightness-110 transition-all ${col.isDim ? 'opacity-40' : ''}`}></div>
                    </div>
                    <span className={`text-xs font-semibold ${col.isToday ? 'text-[#0051d5] font-bold' : 'text-slate-500'}`}>
                      {col.day}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">Weekly Goal: 22h / 25h completed (88%)</span>
                <div className="flex items-center gap-1 text-[#006947] text-xs font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>+14% vs last week</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Panels (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          {/* Upcoming Assignments Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📝</span>
                <h3 className="text-base font-bold text-[#0b1c30]">Upcoming Assignments</h3>
              </div>
              <button
                onClick={onNavigateToAssignments}
                className="text-xs font-bold text-[#0051d5] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Assignment List Items */}
            <div className="flex flex-col gap-2.5">
              {[
                { id: 'as-1', title: 'Problem Set 1: Pointer & Vectors', course: 'Physics • 100 pts', due: 'Due Today' },
                { id: 'as-2', title: 'Assignment 1: Multivariable Calc', course: 'Physics • 100 pts', due: 'Due Today' },
                { id: 'as-3', title: 'Term Project: Campus Case Study', course: 'Physics • 100 pts', due: 'Due Today' }
              ].map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50/70 hover:bg-slate-100 p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-colors cursor-pointer border border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => markAssignmentDone(item.id, 'student-1')}
                      className="w-5 h-5 rounded-full bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center transition-all shrink-0 shadow-2xs cursor-pointer text-slate-400 hover:text-emerald-600"
                      type="button"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-[#0b1c30] truncate">{item.title}</span>
                      <span className="text-[11px] text-slate-500">{item.course}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#a33900] text-[10px] font-bold shrink-0 whitespace-nowrap">
                    {item.due}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Topics Needing Revision Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 text-rose-600 flex items-center justify-center font-bold">
                  🎯
                </div>
                <h3 className="text-base font-bold text-[#0b1c30]">Topics Needing Revision</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-rose-700 text-[10px] font-bold">
                {weakPoints.length || 2} Topics
              </span>
            </div>

            {/* Revision Item Box 1 */}
            <div className="bg-slate-50/70 rounded-2xl p-4 flex flex-col gap-3 border border-slate-100">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#0b1c30]">
                  {weakPoints[0] || "Force vs acceleration"}
                </span>
                <span className="text-[10px] font-bold text-rose-700 bg-white px-2.5 py-0.5 rounded-full shadow-2xs border border-rose-100">
                  Needs Practice
                </span>
              </div>
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onNavigateToTutor("Explain force vs acceleration intuitively", weakPoints[0] || "Force vs acceleration")}
                  className="inline-flex items-center justify-center gap-1.5 bg-white text-[#c2410c] text-xs font-bold py-2 px-3 rounded-full shadow-2xs hover:bg-orange-50 transition-all border border-orange-200 cursor-pointer"
                  type="button"
                >
                  <span>💡</span>
                  <span>Ask Tutor</span>
                </button>
                <button
                  onClick={() => onNavigateToQuiz('lec-phy-101')}
                  className="inline-flex items-center justify-center gap-1.5 bg-rose-600 text-white text-xs font-bold py-2 px-3 rounded-full shadow-2xs hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
                  type="button"
                >
                  <span>🎯</span>
                  <span>Quick Quiz</span>
                </button>
              </div>
            </div>

            {/* Revision Item Box 2 */}
            <div className="bg-slate-50/40 rounded-2xl p-3.5 flex items-center justify-between gap-2 border border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#0b1c30]">Kinematics: Projectile Motion</span>
                <span className="text-[11px] text-slate-500">Scored 62% in last checkpoint</span>
              </div>
              <button
                onClick={() => onNavigateToTutor("Review projectile motion derivation")}
                className="w-8 h-8 rounded-full bg-white text-[#0051d5] flex items-center justify-center hover:scale-105 shadow-2xs transition-transform border border-slate-200 cursor-pointer"
                type="button"
              >
                <Play className="w-4 h-4 fill-[#0051d5]" />
              </button>
            </div>
          </div>

          {/* Daily Flashcard Quick Review */}
          <div className="bg-blue-50/60 rounded-3xl p-6 flex flex-col gap-2.5 border border-blue-100/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Daily Flashcard</span>
              <Lightbulb className="w-4 h-4 text-[#0051d5]" />
            </div>
            <p className="text-xs font-bold text-[#0b1c30] leading-snug">
              "Angular momentum ($L = I\omega$) is conserved whenever net external torque equals zero."
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">Physics 11 • Chapter 7</span>
              <button
                onClick={() => onNavigateToQuiz()}
                className="text-xs font-bold text-[#0051d5] hover:underline cursor-pointer"
              >
                Flip Card →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
