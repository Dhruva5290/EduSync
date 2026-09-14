import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Radio
} from 'lucide-react';
import { TeacherScheduleSlot, TeacherAttendanceLog } from '../../types';

interface DailyScheduleViewProps {
  slots: TeacherScheduleSlot[];
  teacherLog: TeacherAttendanceLog;
  onPunchIn: () => void;
  onPunchOut: () => void;
  onSelectSlotForAttendance: (slot: TeacherScheduleSlot) => void;
  onUpdateSlotStatus: (slotId: string, status: 'upcoming' | 'ongoing' | 'completed', attendanceTaken?: boolean) => void;
}

export const DailyScheduleView: React.FC<DailyScheduleViewProps> = ({
  slots,
  teacherLog,
  onPunchIn,
  onPunchOut,
  onSelectSlotForAttendance,
  onUpdateSlotStatus
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const totalAllottedStudents = slots.reduce((acc, s) => acc + s.allottedStudentsCount, 0);
  const completedSlots = slots.filter(s => s.status === 'completed').length;
  const ongoingSlot = slots.find(s => s.status === 'ongoing');

  return (
    <div className="space-y-6">
      {/* Top Banner: Faculty Daily Overview & Punch In Status */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-blue-500/15 border border-blue-500/40 rounded-2xl text-cyan-300 shadow-md shadow-blue-500/20 shrink-0">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-black text-white font-display tracking-tight bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
                  Today's Teaching Schedule & Allotment
                </h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-cyan-300 border border-cyan-400/40 font-mono shadow-xs">
                  Regular Timetable
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800/90 text-slate-200 border border-slate-700">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1.5 max-w-2xl leading-relaxed">
                Review your daily lecture slots, track allotted student counts, monitor ongoing classrooms, and record mandatory class attendance.
              </p>
            </div>
          </div>

          {/* Teacher Own Attendance Punch Widget */}
          <div className="flex items-center gap-3 bg-slate-950/90 border border-slate-700/80 p-3.5 rounded-2xl shrink-0 shadow-lg">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-300 font-bold">Faculty Attendance</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2.5 h-2.5 rounded-full ${teacherLog.status === 'Present' ? 'bg-emerald-400 animate-ping shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
                <span className="text-sm font-black text-white">
                  {teacherLog.status} {teacherLog.punchInTime && `(${teacherLog.punchInTime})`}
                </span>
              </div>
            </div>

            {teacherLog.status === 'Present' ? (
              <button
                onClick={onPunchOut}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer border border-slate-700 shadow-sm"
                title="Log Faculty Departure"
              >
                Punch Out
              </button>
            ) : (
              <button
                onClick={onPunchIn}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Punch In Now</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/90">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/70 shadow-sm">
            <span className="text-[10px] text-cyan-300/90 uppercase font-mono font-bold">Classes Allotted Today</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.25)]">{slots.length}</span>
              <span className="text-xs text-slate-300 font-mono font-semibold">Lectures/Labs</span>
            </div>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/70 shadow-sm">
            <span className="text-[10px] text-emerald-300/90 uppercase font-mono font-bold">Total Students Taught</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.25)]">{totalAllottedStudents}</span>
              <span className="text-xs text-slate-300 font-mono font-semibold">Across Divisions</span>
            </div>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/70 shadow-sm">
            <span className="text-[10px] text-purple-300/90 uppercase font-mono font-bold">Completed Today</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-purple-300 drop-shadow-[0_0_10px_rgba(192,132,252,0.25)]">{completedSlots} / {slots.length}</span>
              <span className="text-xs text-slate-300 font-mono font-semibold">Finished</span>
            </div>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/70 shadow-sm">
            <span className="text-[10px] text-amber-300/90 uppercase font-mono font-bold">Current Live Slot</span>
            <div className="flex items-center gap-1.5 mt-1.5 truncate">
              {ongoingSlot ? (
                <>
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                  <span className="text-sm font-black text-emerald-300 truncate">{ongoingSlot.subjectCode} ({ongoingSlot.room})</span>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-300">No active class right now</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekday Selector Strip */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedDay === day
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Academic Term: <strong className="text-blue-400">Semester 2 (2026)</strong>
        </span>
      </div>

      {/* Timetable Period Slots List */}
      <div className="space-y-4">
        {slots.map((slot, index) => {
          const isOngoing = slot.status === 'ongoing';
          const isCompleted = slot.status === 'completed';
          const isUpcoming = slot.status === 'upcoming';

          return (
            <div
              key={slot.id}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${
                isOngoing
                  ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900/90 border-emerald-500/50 shadow-xl ring-1 ring-emerald-500/30'
                  : isCompleted
                  ? 'bg-slate-900/50 border-slate-800/70 opacity-90'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              {/* Left Color Accent Bar */}
              <div
                className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                  isOngoing ? 'bg-emerald-500' : isCompleted ? 'bg-slate-600' : 'bg-blue-500'
                }`}
              />

              <div className="p-5 pl-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Time & Class Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2">
                    <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-white bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {slot.startTime} – {slot.endTime}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      {slot.subjectCode}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-300 bg-slate-800 border border-slate-700">
                      {slot.section}
                    </span>

                    {isOngoing && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                        <Radio className="w-3 h-3" /> Live Class In Progress
                      </span>
                    )}

                    {isCompleted && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        <CheckCircle2 className="w-3 h-3 text-slate-400" /> Completed
                      </span>
                    )}

                    {isUpcoming && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        Upcoming
                      </span>
                    )}

                    {slot.attendanceTaken ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-700/60">
                        ✓ Attendance Recorded
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-700/60">
                        ⚠️ Attendance Pending
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                    {slot.subjectName}
                  </h3>

                  <p className="text-xs text-slate-200 mt-1.5 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-bold text-cyan-300 font-mono">Today's Topic:</span>
                    <span className="text-slate-100 font-medium truncate">{slot.todayTopic}</span>
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-300 flex-wrap">
                    <span className="flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <strong className="text-amber-200">{slot.room}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Allotted: <strong className="text-cyan-200 font-bold">{slot.allottedStudentsCount} Students</strong></span>
                    </span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {isUpcoming && (
                    <button
                      onClick={() => onUpdateSlotStatus(slot.id, 'ongoing')}
                      className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                    >
                      <PlayCircle className="w-4 h-4 text-white" />
                      <span>Start Class</span>
                    </button>
                  )}

                  {isOngoing && (
                    <button
                      onClick={() => onUpdateSlotStatus(slot.id, 'completed', true)}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Mark Finished</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectSlotForAttendance(slot)}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center gap-1.5 transform hover:scale-[1.02]"
                  >
                    <span>Mark Student Attendance</span>
                    <ChevronRight className="w-4 h-4 text-cyan-300" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
