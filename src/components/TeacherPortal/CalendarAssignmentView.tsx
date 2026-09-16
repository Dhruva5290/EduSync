import React, { useState } from 'react';
import { AcademicCalendarEvent } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Bell,
  Sparkles,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Users,
  Filter,
  X,
  Flag,
  Sun,
  Award
} from 'lucide-react';

interface CalendarAssignmentViewProps {
  events: AcademicCalendarEvent[];
  onAddEvent: (event: Omit<AcademicCalendarEvent, 'id'>) => void;
}

export interface IndianHolidayItem {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type: 'National Holiday' | 'Festival Holiday' | 'University Milestone';
  day: string;
  isCampusClosed: boolean;
  significance: string;
}

export const INDIAN_HOLIDAYS_2026: IndianHolidayItem[] = [
  {
    id: 'hol-1',
    name: 'Republic Day',
    date: '2026-01-26',
    type: 'National Holiday',
    day: 'Monday',
    isCampusClosed: true,
    significance: 'Commemoration of the adoption of the Constitution of India. Official campus flag hoisting.'
  },
  {
    id: 'hol-2',
    name: 'Maha Shivratri',
    date: '2026-02-15',
    type: 'Festival Holiday',
    day: 'Sunday',
    isCampusClosed: true,
    significance: 'Hindu auspicious festival dedicated to Lord Shiva. University closed.'
  },
  {
    id: 'hol-3',
    name: 'Holi (Dhulandi)',
    date: '2026-03-04',
    type: 'Festival Holiday',
    day: 'Wednesday',
    isCampusClosed: true,
    significance: 'Vibrant spring festival of colors. Academic classes suspended.'
  },
  {
    id: 'hol-4',
    name: 'Id-ul-Fitr',
    date: '2026-03-21',
    type: 'Festival Holiday',
    day: 'Saturday',
    isCampusClosed: true,
    significance: 'Islamic festival marking the end of the Holy month of Ramadan. Gazetted Holiday.'
  },
  {
    id: 'hol-5',
    name: 'Mahavir Jayanti',
    date: '2026-03-31',
    type: 'Festival Holiday',
    day: 'Tuesday',
    isCampusClosed: true,
    significance: 'Celebration of the birth of Lord Mahavira, founder of Jainism.'
  },
  {
    id: 'hol-6',
    name: 'Good Friday',
    date: '2026-04-03',
    type: 'Festival Holiday',
    day: 'Friday',
    isCampusClosed: true,
    significance: 'Christian holy day commemorating the crucifixion of Jesus Christ.'
  },
  {
    id: 'hol-7',
    name: 'Dr. B.R. Ambedkar Jayanti',
    date: '2026-04-14',
    type: 'National Holiday',
    day: 'Tuesday',
    isCampusClosed: true,
    significance: 'Honoring the principal architect of the Constitution of India.'
  },
  {
    id: 'hol-8',
    name: 'Id-ul-Zuha (Bakrid)',
    date: '2026-05-27',
    type: 'Festival Holiday',
    day: 'Wednesday',
    isCampusClosed: true,
    significance: 'Feast of the Sacrifice observed across India. Gazetted holiday.'
  },
  {
    id: 'hol-9',
    name: 'Muharram',
    date: '2026-06-26',
    type: 'Festival Holiday',
    day: 'Friday',
    isCampusClosed: true,
    significance: 'First month of the Islamic calendar, Day of Ashura.'
  },
  {
    id: 'hol-10',
    name: 'Independence Day',
    date: '2026-08-15',
    type: 'National Holiday',
    day: 'Saturday',
    isCampusClosed: true,
    significance: 'Celebration of Indian independence. Annual ceremonial flag parade in University Amphitheater.'
  },
  {
    id: 'hol-11',
    name: 'Raksha Bandhan',
    date: '2026-08-28',
    type: 'Festival Holiday',
    day: 'Friday',
    isCampusClosed: false,
    significance: 'Festival celebrating sibling bonds. University cultural celebration.'
  },
  {
    id: 'hol-12',
    name: 'Janmashtami (Krishna Jayanti)',
    date: '2026-09-04',
    type: 'Festival Holiday',
    day: 'Friday',
    isCampusClosed: true,
    significance: 'Celebration of the birth of Lord Krishna. Gazetted holiday.'
  },
  {
    id: 'hol-13',
    name: 'Eid-e-Milad (Milad-un-Nabi)',
    date: '2026-09-05',
    type: 'Festival Holiday',
    day: 'Saturday',
    isCampusClosed: true,
    significance: 'Observance of the birthday of the Prophet Muhammad.'
  },
  {
    id: 'hol-14',
    name: 'Mahatma Gandhi Jayanti',
    date: '2026-10-02',
    type: 'National Holiday',
    day: 'Friday',
    isCampusClosed: true,
    significance: 'National holiday commemorating the birth of the Father of the Nation.'
  },
  {
    id: 'hol-15',
    name: 'Dussehra (Vijayadashami)',
    date: '2026-10-20',
    type: 'Festival Holiday',
    day: 'Tuesday',
    isCampusClosed: true,
    significance: 'Triumph of good over evil. Campus holiday.'
  },
  {
    id: 'hol-16',
    name: 'Diwali (Deepavali)',
    date: '2026-11-08',
    type: 'Festival Holiday',
    day: 'Sunday',
    isCampusClosed: true,
    significance: 'Festival of Lights, celebrated nationwide. Campus closed.'
  },
  {
    id: 'hol-17',
    name: 'Govardhan Puja & Bhai Dooj',
    date: '2026-11-10',
    type: 'Festival Holiday',
    day: 'Tuesday',
    isCampusClosed: true,
    significance: 'Traditional post-Diwali festivities. University holiday.'
  },
  {
    id: 'hol-18',
    name: 'Guru Nanak Jayanti (Gurpurab)',
    date: '2026-11-24',
    type: 'Festival Holiday',
    day: 'Tuesday',
    isCampusClosed: true,
    significance: 'Birth anniversary of Guru Nanak Dev Ji, founder of Sikhism.'
  },
  {
    id: 'hol-19',
    name: 'Christmas Day',
    date: '2026-12-25',
    type: 'Festival Holiday',
    day: 'Friday',
    isCampusClosed: true,
    significance: 'Christian holiday celebrating the birth of Jesus Christ. Winter recess begins.'
  }
];

export const CalendarAssignmentView: React.FC<CalendarAssignmentViewProps> = ({
  events,
  onAddEvent
}) => {
  // Small Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date(2026, 8, 1)); // September 2026
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'holidays' | 'exams' | 'assignments'>('all');

  // Add Event Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('subj-ess');
  const [type, setType] = useState<'Quiz' | 'Mid-Term Exam' | 'Final Exam' | 'Assignment Deadline' | 'Lab Practical'>('Quiz');
  const [date, setDate] = useState('2026-09-25');
  const [time, setTime] = useState('10:00 AM');
  const [room, setRoom] = useState('Science Block C - Room 304');
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Small Calendar Computations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const todayStr = today.toISOString().split('T')[0];
    setSelectedDate(todayStr);
  };

  const formatDateStr = (dayNum: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Indian Holidays in active month
  const holidaysInActiveMonth = INDIAN_HOLIDAYS_2026.filter(h => {
    const [hYear, hMonth] = h.date.split('-').map(Number);
    return hYear === year && hMonth === month + 1;
  });

  // Events in active month
  const eventsInActiveMonth = events.filter(e => {
    if (!e.date) return false;
    const [eYear, eMonth] = e.date.split('-').map(Number);
    return eYear === year && eMonth === month + 1;
  });

  // Filtered displayed events
  const displayedEvents = events.filter(evt => {
    if (filterCategory === 'holidays') return false;
    if (filterCategory === 'exams' && !evt.type.includes('Exam') && !evt.type.includes('Quiz') && !evt.type.includes('Practical')) return false;
    if (filterCategory === 'assignments' && !evt.type.includes('Assignment')) return false;
    if (selectedDate && evt.date !== selectedDate) return false;
    return true;
  });

  const displayedHolidays = INDIAN_HOLIDAYS_2026.filter(hol => {
    if (filterCategory === 'exams' || filterCategory === 'assignments') return false;
    if (selectedDate && hol.date !== selectedDate) return false;
    if (!selectedDate) {
      // If no day selected, show holidays in this month or coming soon
      const [hYear, hMonth] = hol.date.split('-').map(Number);
      return hYear === year && hMonth === month + 1;
    }
    return true;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      subjectId,
      subjectCode: subjectId === 'subj-ess' ? 'ES-101' : subjectId === 'subj-eme' ? 'ME-102' : 'ES-101L',
      title: title.trim(),
      type,
      date,
      time,
      room: room.trim(),
      totalStudents: 45,
      submissionSubmittedCount: 0,
      submissionPendingCount: 45
    });

    setTitle('');
    setShowAddModal(false);
    setReminderToast(`Event "${title}" scheduled on ${date}!`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  const handleSendReminder = (eventTitle: string, pendingCount: number) => {
    setReminderToast(`Reminder dispatched to ${pendingCount} pending students for "${eventTitle}"!`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {reminderToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181D24] border border-[#6EA8A0] text-[#E2E8F0] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in font-mono text-xs">
          <Bell className="w-4 h-4 text-[#6EA8A0] animate-bounce shrink-0" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-[#181D24] border border-[#26303B] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#6EA8A0]/15 text-[#6EA8A0] border border-[#6EA8A0]/30 rounded-xl shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#E2E8F0] tracking-tight font-['Sora']">
                Academic & National Holiday Calendar
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#6EA8A0]/15 text-[#6EA8A0] border border-[#6EA8A0]/30">
                2026 Academic Year
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Marking all official Indian national festivals, gazetted holidays, and university examination milestones with live reminders.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#6EA8A0] hover:bg-[#6EA8A0]/90 text-[#12161A] rounded-xl text-xs font-bold font-['Sora'] shadow-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Event</span>
        </button>
      </div>

      {/* 2. Main Grid: Mini Calendar (Left) & Upcoming Milestones (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Small Calendar (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#181D24] border border-[#26303B] rounded-2xl p-5 shadow-xl">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#E2E8F0] font-['Sora']">
                  {monthNames[month]} {year}
                </h3>
                <span className="text-[10px] text-[#94A3B8] font-mono">
                  {eventsInActiveMonth.length} exams & {holidaysInActiveMonth.length} holidays this month
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={jumpToToday}
                  className="px-2 py-1 text-[10px] font-mono text-[#6EA8A0] hover:bg-[#12161A] border border-[#26303B] rounded-lg transition-all cursor-pointer"
                  title="Jump to today"
                >
                  Today
                </button>
                <button
                  onClick={prevMonth}
                  className="p-1.5 text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#12161A] rounded-lg border border-[#26303B] cursor-pointer"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#12161A] rounded-lg border border-[#26303B] cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day Name Header Strip */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-[#6EA8A0] mb-2">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Calendar Day Cells Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* Padding empty slots before day 1 */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 rounded-lg bg-transparent" />
              ))}

              {/* Days of current month */}
              {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = formatDateStr(dayNum);
                const isSelected = selectedDate === dateStr;
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                // Check holidays and academic events on this date
                const dayHoliday = INDIAN_HOLIDAYS_2026.find(h => h.date === dateStr);
                const dayEvents = events.filter(e => e.date === dateStr);
                const hasHoliday = !!dayHoliday;
                const hasExam = dayEvents.some(e => e.type.includes('Exam') || e.type.includes('Quiz') || e.type.includes('Practical'));
                const hasAssignment = dayEvents.some(e => e.type.includes('Assignment'));

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`h-10 rounded-xl flex flex-col items-center justify-between py-1 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#6EA8A0] text-[#12161A] font-bold border-[#6EA8A0] shadow-md shadow-[#6EA8A0]/30'
                        : isToday
                        ? 'bg-[#12161A] text-[#6EA8A0] font-bold border-[#6EA8A0]/60 ring-1 ring-[#6EA8A0]/40'
                        : hasHoliday
                        ? 'bg-[#D9A566]/10 text-[#D9A566] hover:bg-[#D9A566]/20 border-[#D9A566]/30'
                        : 'bg-[#12161A] text-[#E2E8F0] hover:bg-[#1E252D] border-[#26303B]'
                    }`}
                  >
                    <span className="text-[11px] leading-tight font-semibold">{dayNum}</span>

                    {/* Colored Indicator Dots */}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {hasHoliday && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#12161A]' : 'bg-[#D9A566]'}`}
                          title={dayHoliday.name}
                        />
                      )}
                      {hasExam && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#12161A]' : 'bg-[#6EA8A0]'}`}
                          title="Examination / Quiz scheduled"
                        />
                      )}
                      {hasAssignment && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#12161A]' : 'bg-cyan-400'}`}
                          title="Assignment deadline"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-4 pt-3 border-t border-[#26303B] flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D9A566]" />
                <span>Festival / National Holiday</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6EA8A0]" />
                <span>University Exam / Quiz</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Deadline</span>
              </div>
            </div>
          </div>

          {/* Quick Filter Strip */}
          <div className="bg-[#181D24] border border-[#26303B] rounded-2xl p-4 shadow-xl space-y-2">
            <span className="text-xs font-bold text-[#E2E8F0] font-['Sora'] block">
              Filter Calendar Dates:
            </span>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => { setFilterCategory('all'); setSelectedDate(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterCategory === 'all' && !selectedDate
                    ? 'bg-[#6EA8A0] text-[#12161A] font-bold'
                    : 'bg-[#12161A] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#26303B]'
                }`}
              >
                All Dates
              </button>

              <button
                onClick={() => { setFilterCategory('holidays'); setSelectedDate(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterCategory === 'holidays'
                    ? 'bg-[#D9A566] text-[#12161A] font-bold'
                    : 'bg-[#12161A] text-[#94A3B8] hover:text-[#D9A566] border border-[#26303B]'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>National & Festival Holidays</span>
              </button>

              <button
                onClick={() => { setFilterCategory('exams'); setSelectedDate(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterCategory === 'exams'
                    ? 'bg-[#6EA8A0] text-[#12161A] font-bold'
                    : 'bg-[#12161A] text-[#94A3B8] hover:text-[#6EA8A0] border border-[#26303B]'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Exams & Quizzes</span>
              </button>

              <button
                onClick={() => { setFilterCategory('assignments'); setSelectedDate(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterCategory === 'assignments'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-[#12161A] text-[#94A3B8] hover:text-cyan-400 border border-[#26303B]'
                }`}
              >
                Assignment Deadlines
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Milestones & Holiday Schedule (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#181D24] border border-[#26303B] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#E2E8F0] font-['Sora'] flex items-center gap-2">
                  <span>Upcoming Holidays & Academic Events</span>
                  {selectedDate && (
                    <span className="text-xs font-mono text-[#6EA8A0] bg-[#12161A] px-2 py-0.5 rounded border border-[#26303B]">
                      Filtered: {selectedDate}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  {selectedDate ? 'Viewing events on selected day' : `Showing dates for ${monthNames[month]} ${year}`}
                </p>
              </div>

              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-[#6EA8A0] hover:underline flex items-center gap-1 cursor-pointer font-mono"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>View All</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* 1. Indian Holidays Display Cards */}
              {displayedHolidays.map(holiday => (
                <div
                  key={holiday.id}
                  className="bg-[#12161A] border border-[#D9A566]/40 rounded-xl p-4 transition-all hover:border-[#D9A566] shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-[#D9A566]/15 text-[#D9A566] rounded-xl border border-[#D9A566]/30 shrink-0 mt-0.5">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D9A566]/20 text-[#D9A566] border border-[#D9A566]/40">
                            {holiday.type}
                          </span>
                          <span className="text-xs font-mono text-[#E2E8F0] font-bold">
                            {holiday.date} ({holiday.day})
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C46859]/20 text-[#C46859] border border-[#C46859]/30">
                            {holiday.isCampusClosed ? 'Campus Closed' : 'Restricted Holiday'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#E2E8F0] font-['Sora']">
                          {holiday.name}
                        </h4>

                        <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                          {holiday.significance}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 2. University Academic Events Display Cards */}
              {displayedEvents.map(event => {
                const isExam = event.type.includes('Exam') || event.type.includes('Quiz') || event.type.includes('Practical');
                const isAssignment = event.type.includes('Assignment');
                const pendingCount = event.submissionPendingCount || 0;

                return (
                  <div
                    key={event.id}
                    className="bg-[#12161A] border border-[#26303B] hover:border-[#6EA8A0]/60 rounded-xl p-4 transition-all shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                          isExam
                            ? 'bg-[#6EA8A0]/15 text-[#6EA8A0] border-[#6EA8A0]/30'
                            : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                        }`}>
                          <FileCheck className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#181D24] text-[#6EA8A0] border border-[#26303B]">
                              {event.subjectCode}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isExam
                                ? 'bg-[#6EA8A0]/20 text-[#6EA8A0] border border-[#6EA8A0]/40'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            }`}>
                              {event.type}
                            </span>
                            <span className="text-xs font-mono text-[#94A3B8]">
                              {event.date}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-[#E2E8F0] font-['Sora'] leading-snug">
                            {event.title}
                          </h4>

                          <div className="flex items-center gap-4 text-xs text-[#94A3B8] font-mono mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#6EA8A0]" />
                              {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#D9A566]" />
                              {event.room}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-[#6EA8A0]" />
                              {event.totalStudents} Students
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Reminder / Action Button */}
                      {isAssignment && pendingCount > 0 && (
                        <button
                          onClick={() => handleSendReminder(event.title, pendingCount)}
                          className="px-3 py-1.5 bg-[#6EA8A0]/15 hover:bg-[#6EA8A0]/25 text-[#6EA8A0] border border-[#6EA8A0]/30 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shrink-0 self-start sm:self-center flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Remind {pendingCount} Pending</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {displayedHolidays.length === 0 && displayedEvents.length === 0 && (
                <div className="text-center py-10 text-xs text-[#94A3B8] font-mono">
                  No events or holidays found for this selection.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181D24] border border-[#26303B] rounded-2xl max-w-md w-full p-6 shadow-2xl text-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#26303B] pb-3">
              <h3 className="text-base font-bold text-[#E2E8F0] font-['Sora'] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#6EA8A0]" />
                <span>Schedule Academic Event</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#94A3B8] hover:text-[#E2E8F0] p-1.5 rounded-lg bg-[#12161A] border border-[#26303B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">Subject:</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full bg-[#12161A] border border-[#26303B] rounded-xl px-3.5 py-2 text-[#E2E8F0] focus:outline-none focus:border-[#6EA8A0]"
                >
                  <option value="subj-ess">ES-101: Environmental Studies</option>
                  <option value="subj-eme">ME-102: Engineering Thermodynamics</option>
                  <option value="subj-ess-lab">ES-101L: Environmental Systems Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">Event Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Written Examination"
                  required
                  className="w-full bg-[#12161A] border border-[#26303B] rounded-xl px-3.5 py-2 text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-[#6EA8A0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Event Type:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#12161A] border border-[#26303B] rounded-xl px-3 py-2 text-[#E2E8F0] focus:outline-none focus:border-[#6EA8A0]"
                  >
                    <option value="Quiz">Quiz</option>
                    <option value="Mid-Term Exam">Mid-Term Exam</option>
                    <option value="Final Exam">Final Exam</option>
                    <option value="Assignment Deadline">Assignment Deadline</option>
                    <option value="Lab Practical">Lab Practical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Date:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-[#12161A] border border-[#26303B] rounded-xl px-3 py-2 text-[#E2E8F0] focus:outline-none focus:border-[#6EA8A0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Time Slot:</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="10:00 AM - 12:00 PM"
                    required
                    className="w-full bg-[#12161A] border border-[#26303B] rounded-xl px-3 py-2 text-[#E2E8F0] focus:outline-none focus:border-[#6EA8A0]"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Room / Venue:</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Auditorium Hall 1"
                    required
                    className="w-full bg-[#12161A] border border-[#26303B] rounded-xl px-3 py-2 text-[#E2E8F0] focus:outline-none focus:border-[#6EA8A0]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#26303B]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#12161A] text-[#94A3B8] hover:text-[#E2E8F0] rounded-xl border border-[#26303B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6EA8A0] text-[#12161A] font-bold rounded-xl shadow cursor-pointer font-['Sora']"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
