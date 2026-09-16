import React, { useState } from 'react';
import {
  Play,
  ArrowRight,
  ChevronRight,
  Calendar,
  TrendingUp,
  Check,
  Target,
  Lightbulb,
  Sparkles,
  BarChart3,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { NavRoute, ClassScheduleItem } from '../types';

interface DashboardViewProps {
  onNavigate: (route: NavRoute) => void;
  onOpenNotes: (classItem: ClassScheduleItem) => void;
  onAskTutorTopic: (topic: string) => void;
  classes: ClassScheduleItem[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNotes,
  onAskTutorTopic,
  classes,
}) => {
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [completedAssignments, setCompletedAssignments] = useState<Record<string, boolean>>({});

  const toggleAssignment = (id: string) => {
    setCompletedAssignments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const weeklyData = [
    { day: 'Mon', theoryH: 14, practiceH: 10, total: '2.4h' },
    { day: 'Tue', theoryH: 20, practiceH: 16, total: '3.6h' },
    { day: 'Wed', theoryH: 16, practiceH: 12, total: '2.8h' },
    { day: 'Thu', theoryH: 24, practiceH: 14, total: '3.8h' },
    { day: 'Fri', theoryH: 28, practiceH: 20, total: '4.8h' },
    { day: 'Today', theoryH: 18, practiceH: 24, total: '4.2h', isToday: true },
    { day: 'Sun', theoryH: 8, practiceH: 6, total: '1.4h', future: true },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1520px] mx-auto w-full">
      {/* Top Header Banner Section */}
      <div className="bg-white rounded-3xl p-6 lg:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Greeting & Subtext */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#d3e4fe]/60 text-[#0051d5] font-semibold text-xs tracking-wider uppercase">
              Student Dashboard
            </span>
            <span className="text-[#5a4138] text-xs font-semibold flex items-center gap-1">
              • Saturday, September 12, 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight flex items-center gap-2">
            <span>Good evening, Student</span>
            <span className="inline-block hover:rotate-12 transition-transform duration-200">
              👋
            </span>
          </h1>
          <p className="text-sm text-[#5a4138]">
            You have{' '}
            <strong className="font-bold text-[#0051d5]">5 pending tasks</strong> and{' '}
            <strong className="font-bold text-[#006947]">1 lecture ready for review</strong>{' '}
            today.
          </p>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 self-start lg:self-center flex-wrap">
          {/* Attendance Small Square */}
          <div className="bg-[#f0fdf4] rounded-2xl w-[86px] h-[80px] p-2 flex flex-col items-center justify-center shadow-xs border border-[#bbf7d0] text-center flex-shrink-0">
            <span className="text-2xl font-black text-[#15803d] leading-none">94%</span>
            <span className="text-[10px] font-extrabold text-[#166534] uppercase tracking-wider mt-1">
              Attendance
            </span>
            <span className="text-[8px] text-[#15803d] font-semibold">48/51 Days</span>
          </div>

          {/* 85% Mastery */}
          <div className="bg-[#eff4ff]/80 rounded-2xl w-[86px] h-[80px] p-2 flex flex-col items-center justify-center shadow-xs border border-[#dce9ff]/60 text-center flex-shrink-0">
            <span className="text-2xl font-extrabold text-[#0051d5] leading-none">85%</span>
            <span className="text-[10px] font-bold text-[#5a4138] uppercase tracking-wider mt-1">
              Mastery
            </span>
            <span className="text-[8px] text-[#5a4138]">Physics 11</span>
          </div>

          {/* 12 Lectures */}
          <div className="bg-[#eff4ff]/80 rounded-2xl w-[86px] h-[80px] p-2 flex flex-col items-center justify-center shadow-xs border border-[#dce9ff]/60 text-center flex-shrink-0">
            <span className="text-2xl font-extrabold text-[#006947] leading-none">12</span>
            <span className="text-[10px] font-bold text-[#5a4138] uppercase tracking-wider mt-1">
              Lectures
            </span>
            <span className="text-[8px] text-[#5a4138]">Archived</span>
          </div>

          {/* 5 To-Do */}
          <div className="bg-[#eff4ff]/80 rounded-2xl w-[86px] h-[80px] p-2 flex flex-col items-center justify-center shadow-xs border border-[#dce9ff]/60 text-center flex-shrink-0">
            <span className="text-2xl font-extrabold text-[#a33900] leading-none">5</span>
            <span className="text-[10px] font-bold text-[#5a4138] uppercase tracking-wider mt-1">
              To-Do
            </span>
            <span className="text-[8px] text-[#5a4138]">Pending</span>
          </div>
        </div>
      </div>

      {/* Core Grid Layout: 8-cols Main Workspace + 4-cols Contextual Hub */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Continue Learning Hero Feature Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0051d5] text-white p-6 md:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Background Ambient Glow Accents */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#316bf3]/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#a33900]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-2.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-white w-fit text-xs font-bold uppercase tracking-wider">
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Continue Learning</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                Live Lecture Session: Rotational Mechanics
              </h2>
              <p className="text-xs sm:text-sm text-white/80 flex items-center gap-2 flex-wrap">
                <span>Class 11 Physics (Mechanics & Thermodynamics)</span>
                <span>•</span>
                <span>Dr. Rajesh Kulkarni</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <span>⏱️</span> 45 mins
                </span>
              </p>
            </div>

            <div className="relative z-10 flex-shrink-0">
              <button
                onClick={() => onOpenNotes(classes[0])}
                className="inline-flex items-center gap-2 bg-white text-[#0051d5] font-bold text-sm px-6 py-3 rounded-full shadow-md hover:bg-[#eff4ff] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span>Resume Notes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Today's Classes & Schedule Section */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#dce9ff] flex items-center justify-center text-[#0051d5]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-lg text-[#0b1c30]">
                    Today's Classes & Schedule
                  </h3>
                  <span className="text-xs text-[#5a4138]">
                    Click a class to view synchronized notes & lecture recordings
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('classes')}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#0051d5] hover:underline"
              >
                <span>View All Classes</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Schedule Grid (3 Horizontal Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Physics 11 */}
              <div
                onClick={() => onOpenNotes(classes[0])}
                className="bg-[#eff4ff]/50 hover:bg-[#eff4ff] rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-xs border border-[#dce9ff]/40 transition-all hover:scale-[1.01] group cursor-pointer"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0051d5]">09:00 AM</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6ffbbe]/40 text-[#005236] text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006947]" />
                      Live Notes Ready
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">
                      Physics 11
                    </h4>
                    <p className="text-xs text-[#5a4138]">Dr. Rajesh Kulkarni • Room 302</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#5a4138] text-[11px] font-medium">
                    Vectors
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#5a4138] text-[11px] font-medium">
                    Normal Force
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#5a4138] text-[11px] font-medium">
                    Kinetic Friction
                  </span>
                </div>
              </div>

              {/* Card 2: Mathematics 11 */}
              <div
                onClick={() => onOpenNotes(classes[1])}
                className="bg-[#eff4ff]/50 hover:bg-[#eff4ff] rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-xs border border-[#dce9ff]/40 transition-all hover:scale-[1.01] group cursor-pointer"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0051d5]">11:00 AM</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dbe1ff] text-[#003ea8] text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]" />
                      Upcoming
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">
                      Mathematics 11
                    </h4>
                    <p className="text-xs text-[#5a4138]">Prof. Ananya Sen • Room 105</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#5a4138] text-[11px] font-medium">
                    Limits at ∞
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#5a4138] text-[11px] font-medium">
                    L'Hopital Rule
                  </span>
                </div>
              </div>

              {/* Card 3: Electronics & CS */}
              <div
                onClick={() => onOpenNotes(classes[3] || classes[2])}
                className="bg-[#eff4ff]/50 hover:bg-[#eff4ff] rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-xs border border-[#dce9ff]/40 transition-all hover:scale-[1.01] group cursor-pointer"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#5a4138]">02:00 PM</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d3e4fe] text-[#0b1c30] text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8e7166]" />
                      Scheduled
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">
                      Electronics & CS
                    </h4>
                    <p className="text-xs text-[#5a4138]">Dr. Sunita Rao • Lab B</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#5a4138] text-[11px] font-medium">
                    Boolean Algebra
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#5a4138] text-[11px] font-medium">
                    Logic Gates
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Learning Activity & Mastery (Graph & Insights) */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#a33900]">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#0b1c30]">
                    Your Learning Activity & Mastery
                  </h3>
                  <span className="text-xs text-[#5a4138]">
                    Weekly hours split between concept theory and problem sets
                  </span>
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#0051d5]" />
                  <span className="text-xs font-semibold text-[#0b1c30]">Theory</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#006947]" />
                  <span className="text-xs font-semibold text-[#0b1c30]">Practice</span>
                </div>
              </div>
            </div>

            {/* Weekly Bar Chart */}
            <div className="bg-[#eff4ff]/40 rounded-2xl p-5 flex flex-col gap-4 border border-[#dce9ff]/50">
              <div className="grid grid-cols-7 gap-2 items-end h-44 pt-4 px-2">
                {weeklyData.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center gap-2 h-full justify-end group ${
                      item.isToday ? 'bg-[#dce9ff]/60 rounded-xl p-1 -m-1' : ''
                    }`}
                  >
                    <div
                      className={`w-full max-w-[32px] flex flex-col gap-1 items-center ${
                        item.future ? 'opacity-40' : ''
                      }`}
                    >
                      {/* Theory portion */}
                      <div
                        style={{ height: `${item.theoryH * 2.5}px` }}
                        className="w-full bg-[#0051d5] rounded-t-sm group-hover:brightness-110 transition-all"
                        title={`Theory: ${item.theoryH / 10}h`}
                      />
                      {/* Practice portion */}
                      <div
                        style={{ height: `${item.practiceH * 2.5}px` }}
                        className={`w-full ${
                          item.isToday ? 'bg-[#a33900]' : 'bg-[#006947]'
                        } rounded-b-sm group-hover:brightness-110 transition-all`}
                        title={`Practice: ${item.practiceH / 10}h`}
                      />
                    </div>
                    <span
                      className={`text-xs ${
                        item.isToday
                          ? 'font-bold text-[#0051d5]'
                          : 'text-[#5a4138]'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff]">
                <span className="text-xs text-[#5a4138] font-medium">
                  Weekly Goal: 22h / 25h completed (88%)
                </span>
                <div className="flex items-center gap-1 text-[#006947] font-semibold text-xs">
                  <TrendingUp className="w-4 h-4" />
                  <span>+14% vs last week</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Upcoming Assignments Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📝</span>
                <h3 className="font-bold text-base sm:text-lg text-[#0b1c30]">
                  Upcoming Assignments
                </h3>
              </div>
              <button
                onClick={() => onNavigate('assignments')}
                className="text-xs font-bold text-[#0051d5] hover:underline"
              >
                View All
              </button>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2.5">
              {[
                {
                  id: 'asg-ps1',
                  title: 'Problem Set 1: Pointer & Vectors',
                  sub: 'Physics • 100 pts',
                  badge: 'Due Today',
                },
                {
                  id: 'asg-calc',
                  title: 'Assignment 1: Multivariable Calc',
                  sub: 'Physics • 100 pts',
                  badge: 'Due Today',
                },
                {
                  id: 'asg-term',
                  title: 'Term Project: Campus Case Study',
                  sub: 'Physics • 100 pts',
                  badge: 'Due Today',
                },
              ].map((item) => {
                const isDone = completedAssignments[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleAssignment(item.id)}
                    className="group bg-[#eff4ff]/40 hover:bg-[#eff4ff] p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-colors cursor-pointer border border-[#dce9ff]/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-2xs ${
                          isDone
                            ? 'bg-[#006947] text-white'
                            : 'bg-white border border-[#8e7166]/40 text-transparent hover:border-[#006947]'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`font-semibold text-xs sm:text-sm truncate transition-colors ${
                            isDone
                              ? 'line-through text-gray-400'
                              : 'text-[#0b1c30] group-hover:text-[#0051d5]'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[11px] text-[#5a4138]">{item.sub}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ffdbce] text-[#370e00] text-[11px] font-bold flex-shrink-0">
                      {item.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topics Needing Revision Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#0b1c30]">
                  Topics Needing Revision
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-xs font-bold">
                2 Topics
              </span>
            </div>

            {/* Revision Item 1 */}
            <div className="bg-[#eff4ff]/50 rounded-2xl p-4 flex flex-col gap-3 border border-[#dce9ff]/40">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-sm text-[#0b1c30]">
                  Force vs acceleration
                </span>
                <span className="text-[11px] font-bold text-[#ba1a1a] bg-white px-2.5 py-0.5 rounded-full shadow-2xs">
                  Needs Practice
                </span>
              </div>
              {/* Action Buttons: Ask Tutor & Quick Quiz */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onAskTutorTopic('Force vs acceleration')}
                  className="inline-flex items-center justify-center gap-1.5 bg-white text-[#a33900] font-bold text-xs py-2 px-3 rounded-full shadow-xs hover:bg-[#eff4ff] transition-all cursor-pointer"
                  type="button"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Tutor</span>
                </button>
                <button
                  onClick={() => onNavigate('quiz')}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#ba1a1a] text-white font-bold text-xs py-2 px-3 rounded-full shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  type="button"
                >
                  <span>🎯</span>
                  <span>Quick Quiz</span>
                </button>
              </div>
            </div>

            {/* Revision Item 2 */}
            <div className="bg-[#eff4ff]/30 rounded-2xl p-4 flex items-center justify-between gap-2 border border-[#dce9ff]/40">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-[#0b1c30]">
                  Kinematics: Projectile Motion
                </span>
                <span className="text-xs text-[#5a4138]">
                  Scored 62% in last checkpoint
                </span>
              </div>
              <button
                onClick={() => onAskTutorTopic('Kinematics: Projectile Motion')}
                className="w-8 h-8 rounded-full bg-white text-[#0051d5] flex items-center justify-center hover:scale-105 shadow-xs transition-transform"
                type="button"
                title="Review Projectile Motion"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </div>
          </div>

          {/* Daily Motivation & Flashcard Quick Review */}
          <div className="bg-[#dce9ff]/40 rounded-3xl p-6 flex flex-col gap-2.5 border border-[#d3e4fe]/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                Daily Flashcard
              </span>
              <Lightbulb className="w-4 h-4 text-[#0051d5]" />
            </div>

            {flashcardFlipped ? (
              <div className="py-1">
                <span className="text-[11px] font-bold text-[#006947] uppercase">
                  Explanation / Derivation:
                </span>
                <p className="font-semibold text-sm text-[#0b1c30] leading-snug mt-1">
                  {"Since τ_ext = dL/dt, if τ_ext = 0, then dL/dt = 0 ⟹ L_i = L_f = I₁ω₁ = I₂ω₂."}
                </p>
              </div>
            ) : (
              <p className="font-bold text-sm text-[#0b1c30] leading-snug">
                "Angular momentum ($L = I\omega$) is conserved whenever net external torque equals zero."
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#5a4138]">Physics 11 • Chapter 7</span>
              <button
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                className="text-xs font-bold text-[#0051d5] hover:underline cursor-pointer"
              >
                {flashcardFlipped ? 'Show Concept ←' : 'Flip Card →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
