import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Play,
  CheckCircle2,
  Users,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { commandCenterService, CommandScheduleSlot } from '../../../services/commandCenterService';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ABBR: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat'
};

export const TodaysScheduleView: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [slots, setSlots] = useState<CommandScheduleSlot[]>(() =>
    commandCenterService.getScheduleSlots('Monday')
  );
  const [expandedAttendanceSlotId, setExpandedAttendanceSlotId] = useState<string | null>(null);

  // Live ticking date/time
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update slots when day changes
  useEffect(() => {
    setSlots(commandCenterService.getScheduleSlots(selectedDay));
    setExpandedAttendanceSlotId(null);
  }, [selectedDay]);

  const handleStartClass = (slotId: string) => {
    const updated = commandCenterService.startClass(slotId);
    setSlots(updated.filter(s => s.dayOfWeek.toLowerCase() === selectedDay.toLowerCase()));
  };

  const handleFinishClass = (slotId: string) => {
    const updated = commandCenterService.finishClass(slotId);
    setSlots(updated.filter(s => s.dayOfWeek.toLowerCase() === selectedDay.toLowerCase()));
  };

  const handleToggleStudent = (slotId: string, studentId: string) => {
    const updated = commandCenterService.toggleStudentAttendance(slotId, studentId);
    setSlots(updated.filter(s => s.dayOfWeek.toLowerCase() === selectedDay.toLowerCase()));
  };

  // Counters
  const completedCount = slots.filter(s => s.status === 'completed').length;
  const classesToTake = slots.filter(s => s.status !== 'completed').length;

  // Mini Sparkline SVG Generator
  const renderSparkline = (data: number[]) => {
    if (!data || data.length === 0) return null;
    const width = 80;
    const height = 24;
    const min = Math.min(...data, 60);
    const max = Math.max(...data, 100);
    const range = Math.max(1, max - min);

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * (width - 4) + 2;
        const y = height - 2 - ((val - min) / range) * (height - 6);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <div className="flex items-center gap-2">
        <svg width={width} height={height} className="overflow-visible">
          <polyline
            fill="none"
            stroke="#6EA8A0"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {/* Last data point dot */}
          {data.length > 0 && (
            <circle
              cx={width - 2}
              cy={height - 2 - ((data[data.length - 1] - min) / range) * (height - 6)}
              r="2"
              fill="#D9A566"
            />
          )}
        </svg>
        <span className="text-[10px] font-mono text-[#94A3B8]">
          {data[data.length - 1]}%
        </span>
      </div>
    );
  };

  // Determine left border stripe: Amber at 70-80%, Terracotta below 70%
  const getBorderStripeClass = (percent: number) => {
    if (percent < 70) {
      return 'border-l-4 border-l-[#C46859]'; // Terracotta
    }
    if (percent <= 80) {
      return 'border-l-4 border-l-[#D9A566]'; // Amber
    }
    return 'border-l-4 border-l-transparent';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar: Day-Tab Strip + Live Clock + Counters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#181D24] border border-[#26303B]">
        {/* Day-Tab Strip (Mon - Sat) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#12161A] border border-[#26303B] overflow-x-auto scrollbar-none">
          {DAYS_OF_WEEK.map(day => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer font-['Sora'] ${
                  isSelected
                    ? 'bg-[#6EA8A0] text-[#12161A] shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E252D]'
                }`}
              >
                {DAY_ABBR[day]}
              </button>
            );
          })}
        </div>

        {/* Live Date/Time & Progress Stats */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
          {/* Live Date/Time */}
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <Clock className="w-3.5 h-3.5 text-[#6EA8A0]" />
            <span className="font-mono text-[#E2E8F0]">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              {' • '}
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#26303B] hidden sm:block" />

          {/* Classes to take vs Completed counter */}
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-[#6EA8A0]/15 border border-[#6EA8A0]/30 text-[#6EA8A0] font-mono text-[11px] font-semibold">
              {classesToTake} to take
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#1E252D] border border-[#26303B] text-[#94A3B8] font-mono text-[11px]">
              {completedCount} completed
            </span>
          </div>
        </div>
      </div>

      {/* 2. Per-Class Cards List */}
      <div className="space-y-4">
        {slots.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#181D24] border border-[#26303B] text-[#94A3B8] text-sm font-sans">
            No scheduled classes for {selectedDay}.
          </div>
        ) : (
          slots.map(slot => {
            const isOngoing = slot.status === 'ongoing';
            const isCompleted = slot.status === 'completed';
            const stripeClass = getBorderStripeClass(slot.currentAttendancePercent);
            const isAttendanceExpanded = expandedAttendanceSlotId === slot.id;

            return (
              <div
                key={slot.id}
                className={`rounded-2xl bg-[#181D24] border border-[#26303B] transition-all overflow-hidden ${stripeClass} ${
                  isOngoing ? 'ring-1 ring-[#6EA8A0]/50' : ''
                }`}
              >
                {/* Main Card Row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-[#6EA8A0] font-bold">
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span className="text-[#94A3B8] text-xs">•</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#1E252D] border border-[#26303B] text-xs font-mono text-[#E2E8F0] font-semibold">
                        {slot.subjectCode}
                      </span>
                      <span className="text-xs text-[#94A3B8] font-sans">
                        {slot.section}
                      </span>

                      {/* Status indicator */}
                      {isOngoing && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#6EA8A0]/20 text-[#6EA8A0] border border-[#6EA8A0]/40 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6EA8A0] animate-ping" />
                          Ongoing Class
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#1E252D] text-[#94A3B8] border border-[#26303B]">
                          Finished
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-[#E2E8F0] font-['Sora'] tracking-tight">
                      {slot.subjectName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#6EA8A0]" />
                        {slot.room}
                      </span>
                      <span>•</span>
                      <span>Topic: {slot.todayTopic}</span>
                      <span>•</span>
                      <span>{slot.allottedStudentsCount} students enrolled</span>
                    </div>
                  </div>

                  {/* Right: Trend Sparkline & Actions */}
                  <div className="flex flex-wrap items-center gap-4 shrink-0">
                    {/* Attendance Trend Sparkline */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] uppercase font-mono text-[#94A3B8] tracking-wider">
                        10-Session Trend
                      </span>
                      {renderSparkline(slot.attendanceTrend)}
                    </div>

                    <div className="h-8 w-[1px] bg-[#26303B] hidden md:block" />

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {slot.status === 'upcoming' && (
                        <button
                          onClick={() => handleStartClass(slot.id)}
                          className="px-3.5 py-2 rounded-xl bg-[#6EA8A0] hover:bg-[#5D968E] text-[#12161A] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm font-['Sora']"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Class</span>
                        </button>
                      )}

                      {isOngoing && (
                        <button
                          onClick={() => handleFinishClass(slot.id)}
                          className="px-3.5 py-2 rounded-xl bg-[#1E252D] hover:bg-[#26303B] text-[#E2E8F0] border border-[#26303B] text-xs font-semibold transition-all cursor-pointer font-['Sora']"
                        >
                          <span>Mark Finished</span>
                        </button>
                      )}

                      {/* Toggle Mark Attendance Roster */}
                      <button
                        onClick={() =>
                          setExpandedAttendanceSlotId(isAttendanceExpanded ? null : slot.id)
                        }
                        className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-['Sora'] ${
                          isAttendanceExpanded
                            ? 'bg-[#1E252D] border-[#6EA8A0] text-[#6EA8A0]'
                            : 'bg-[#12161A] border-[#26303B] text-[#E2E8F0] hover:bg-[#1E252D]'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Attendance ({slot.currentAttendancePercent}%)</span>
                        {isAttendanceExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Expandable Attendance Roster Flow with Live Running % */}
                {isAttendanceExpanded && (
                  <div className="border-t border-[#26303B] p-5 bg-[#12161A]/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-[#E2E8F0] font-['Sora'] uppercase tracking-wider">
                          Live Attendance Roster — {slot.subjectCode} ({slot.section})
                        </h4>
                        <p className="text-[11px] text-[#94A3B8]">
                          Toggle individual presence. Running percentage updates in real time.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#94A3B8]">
                          Running Attendance:
                        </span>
                        <span
                          className={`text-sm font-mono font-bold px-2.5 py-0.5 rounded-md ${
                            slot.currentAttendancePercent < 70
                              ? 'bg-[#C46859]/20 text-[#C46859] border border-[#C46859]/40'
                              : slot.currentAttendancePercent <= 80
                              ? 'bg-[#D9A566]/20 text-[#D9A566] border border-[#D9A566]/40'
                              : 'bg-[#6EA8A0]/20 text-[#6EA8A0] border border-[#6EA8A0]/40'
                          }`}
                        >
                          {slot.currentAttendancePercent}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {slot.enrolledStudents.map(student => (
                        <div
                          key={student.id}
                          onClick={() => handleToggleStudent(slot.id, student.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            student.present
                              ? 'bg-[#181D24] border-[#6EA8A0]/50 text-[#E2E8F0]'
                              : 'bg-[#181D24]/50 border-[#26303B] text-[#94A3B8]'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-medium block text-[#E2E8F0]">
                              {student.name}
                            </span>
                            <span className="text-[10px] font-mono text-[#94A3B8]">
                              {student.rollNo}
                            </span>
                          </div>

                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-colors ${
                              student.present
                                ? 'bg-[#6EA8A0] text-[#12161A]'
                                : 'bg-[#1E252D] text-[#94A3B8]'
                            }`}
                          >
                            {student.present ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
