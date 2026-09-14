import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Coffee,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { CalendarEvent } from '../../../types';

interface IndianHoliday {
  id: string;
  name: string;
  date: string;
  day: string;
  type: 'Gazetted' | 'Restricted' | 'National';
  description: string;
  campusClosed: boolean;
}

const INDIAN_HOLIDAYS_2026: IndianHoliday[] = [
  { id: 'hol-1', name: 'Republic Day', date: '2026-01-26', day: 'Monday', type: 'National', description: 'Celebrates the enactment of the Constitution of India. Flag hoisting ceremony on campus.', campusClosed: true },
  { id: 'hol-2', name: 'Maha Shivratri', date: '2026-02-15', day: 'Sunday', type: 'Gazetted', description: 'Auspicious festival honoring Lord Shiva. Prayers and overnight vigil.', campusClosed: true },
  { id: 'hol-3', name: 'Holi (Festival of Colors)', date: '2026-03-04', day: 'Wednesday', type: 'Gazetted', description: 'Celebration of spring, love, and the victory of good over evil.', campusClosed: true },
  { id: 'hol-4', name: 'Id-ul-Fitr (Ramzan Id)', date: '2026-03-21', day: 'Saturday', type: 'Gazetted', description: 'Culmination of the Islamic holy month of fasting (Ramadan).', campusClosed: true },
  { id: 'hol-5', name: 'Ram Navami', date: '2026-03-27', day: 'Friday', type: 'Gazetted', description: 'Celebration of the birth of Lord Rama.', campusClosed: true },
  { id: 'hol-6', name: 'Mahavir Jayanti', date: '2026-03-31', day: 'Tuesday', type: 'Gazetted', description: 'Birth anniversary of Lord Mahavira, the 24th Tirthankara of Jainism.', campusClosed: true },
  { id: 'hol-7', name: 'Good Friday', date: '2026-04-03', day: 'Friday', type: 'Gazetted', description: 'Solemn commemoration of the crucifixion of Jesus Christ.', campusClosed: true },
  { id: 'hol-8', name: 'Buddha Purnima', date: '2026-05-02', day: 'Saturday', type: 'Gazetted', description: 'Birth, enlightenment, and passing of Gautama Buddha.', campusClosed: true },
  { id: 'hol-9', name: 'Id-ul-Zuha (Bakrid)', date: '2026-05-28', day: 'Thursday', type: 'Gazetted', description: 'Festival of Sacrifice in the Islamic calendar.', campusClosed: true },
  { id: 'hol-10', name: 'Muharram', date: '2026-06-26', day: 'Friday', type: 'Gazetted', description: 'First month of the Islamic calendar; mourning of Ashura.', campusClosed: true },
  { id: 'hol-11', name: 'Independence Day', date: '2026-08-15', day: 'Saturday', type: 'National', description: 'Commemoration of Indian Independence in 1947. University ceremonial address.', campusClosed: true },
  { id: 'hol-12', name: 'Janmashtami', date: '2026-09-04', day: 'Friday', type: 'Gazetted', description: 'Celebration of the birth of Lord Krishna.', campusClosed: true },
  { id: 'hol-13', name: 'Milad-un-Nabi (Id-e-Milad)', date: '2026-09-25', day: 'Friday', type: 'Gazetted', description: 'Observance of the birthday of the Islamic Prophet Muhammad.', campusClosed: true },
  { id: 'hol-14', name: 'Mahatma Gandhi Jayanti', date: '2026-10-02', day: 'Friday', type: 'National', description: 'Birth anniversary of the Father of the Nation. International Day of Non-Violence.', campusClosed: true },
  { id: 'hol-15', name: 'Dussehra (Vijay Dashami)', date: '2026-10-20', day: 'Tuesday', type: 'Gazetted', description: 'Triumph of righteousness over evil. Culmination of Navratri festivities.', campusClosed: true },
  { id: 'hol-16', name: 'Diwali (Deepavali)', date: '2026-11-08', day: 'Sunday', type: 'Gazetted', description: 'Festival of Lights, symbolizing the spiritual victory of light over darkness.', campusClosed: true },
  { id: 'hol-17', name: 'Govardhan Puja / Bhai Dooj', date: '2026-11-10', day: 'Tuesday', type: 'Restricted', description: 'Celebration of sibling bonds and Govardhan Hill adoration.', campusClosed: true },
  { id: 'hol-18', name: 'Guru Nanak Jayanti', date: '2026-11-24', day: 'Tuesday', type: 'Gazetted', description: 'Celebration of the birth of Guru Nanak Dev Ji, founder of Sikhism.', campusClosed: true },
  { id: 'hol-19', name: 'Christmas Day', date: '2026-12-25', day: 'Friday', type: 'Gazetted', description: 'Celebration of the nativity of Jesus Christ.', campusClosed: true }
];

interface AcademicCalendarScreenProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
}

export const AcademicCalendarScreen: React.FC<AcademicCalendarScreenProps> = ({
  events,
  onAddEvent,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-03-04');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarEvent['type']>('exam');
  const [newTime, setNewTime] = useState('10:00 AM - 11:30 AM');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'holidays' | 'exams' | 'academic'>('all');

  // March 2026 days (March 1, 2026 is a Sunday)
  const daysInMarch = Array.from({ length: 31 }, (_, i) => i + 1);

  // Merge calendar events with Indian Holidays that occur on selected date
  const selectedEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDate);
  }, [events, selectedDate]);

  const selectedHoliday = useMemo(() => {
    return INDIAN_HOLIDAYS_2026.find((h) => h.date === selectedDate);
  }, [selectedDate]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddEvent({
      id: `ev-${Date.now()}`,
      title: newTitle.trim(),
      date: selectedDate,
      time: newTime,
      type: newType,
      room: 'Room 210',
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div id="academic-calendar-screen" className="p-4 sm:p-6 lg:p-8 max-w-[1580px] mx-auto w-full flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#eaedff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#e2dfff] text-[#0f0069] font-bold">
              SPRING 2026 • SEMESTER SCHEDULE
            </span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555]">
              Current Week: W8 (Active Teaching Cycle)
            </span>
          </div>
          <h1 className="font-['Sora'] text-2xl font-bold text-[#131b2e] mt-1">
            Academic Calendar & Exam Schedule
          </h1>
          <p className="text-[14px] text-[#464555]">
            University senate exam timelines, departmental committee reviews, grading cutoffs, and official holidays.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-lg bg-[#3525cd] text-white font-semibold text-[13px] flex items-center gap-2 shadow-xs hover:bg-[#3323cc] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Entry</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
            categoryFilter === 'all'
              ? 'bg-[#3525cd] text-white shadow-xs'
              : 'bg-white text-[#464555] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          All Dates & Events
        </button>
        <button
          onClick={() => setCategoryFilter('holidays')}
          className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            categoryFilter === 'holidays'
              ? 'bg-[#006e4b] text-white shadow-xs'
              : 'bg-white text-[#006e4b] hover:bg-[#ecfdf5] border border-[#a7f3d0]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#006e4b]" />
          <span>Indian National & Festival Holidays (19)</span>
        </button>
        <button
          onClick={() => setCategoryFilter('exams')}
          className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            categoryFilter === 'exams'
              ? 'bg-[#ba1a1a] text-white shadow-xs'
              : 'bg-white text-[#ba1a1a] hover:bg-[#fff1f2] border border-[#fecdd3]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
          <span>Exams & Quizzes</span>
        </button>
      </div>

      {/* Main Grid: Calendar 8 cols, Agenda 4 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar View */}
        <div className="lg:col-span-8 bg-white rounded-xl p-6 shadow-sm border border-[#eaedff] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-['Sora'] font-bold text-xl text-[#131b2e]">
                March 2026
              </h2>
              <span className="font-['JetBrains_Mono'] text-[11px] px-2.5 py-0.5 rounded bg-[#6ffbbe] text-[#002113] font-bold">
                Mid-Terms in T-6 Days
              </span>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[#464555]">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3525cd]" /> Lectures
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" /> Exams
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006e4b]" /> Holidays
              </span>
            </div>
          </div>

          {/* Calendar Table */}
          <div className="grid grid-cols-7 gap-1 text-center font-['JetBrains_Mono'] text-[12px] font-semibold text-[#464555] py-2 border-b border-[#eaedff]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {daysInMarch.map((day) => {
              const dateStr = `2026-03-${day.toString().padStart(2, '0')}`;
              const isToday = day === 4;
              const isSelected = selectedDate === dateStr;
              const holiday = INDIAN_HOLIDAYS_2026.find((h) => h.date === dateStr);
              const dayEvents = events.filter((e) => e.date === dateStr);

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[88px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-[#3525cd] bg-[#f2f3ff] ring-2 ring-[#3525cd]/20'
                      : isToday
                      ? 'border-[#6ffbbe] bg-[#f2f3ff]/50'
                      : holiday
                      ? 'border-[#a7f3d0] bg-[#f0fdf4] hover:bg-[#dcfce7]'
                      : 'border-[#eaedff] bg-white hover:bg-[#faf8ff]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-['JetBrains_Mono'] text-[13px] font-bold ${
                        isToday
                          ? 'bg-[#3525cd] text-white w-6 h-6 rounded-full flex items-center justify-center text-[11px]'
                          : holiday
                          ? 'text-[#006e4b]'
                          : 'text-[#131b2e]'
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-bold font-['JetBrains_Mono'] text-[#3525cd] uppercase">
                        Today
                      </span>
                    )}
                    {holiday && !isToday && (
                      <span className="text-[9px] font-bold font-['JetBrains_Mono'] text-[#006e4b] uppercase">
                        Holiday
                      </span>
                    )}
                  </div>

                  {/* Badges on date */}
                  <div className="flex flex-col gap-1 mt-1">
                    {holiday && (
                      <span className="text-[10px] font-bold truncate px-1.5 py-0.5 rounded leading-tight bg-[#ecfdf5] text-[#006e4b] border border-[#a7f3d0]">
                        🔴 {holiday.name}
                      </span>
                    )}

                    {dayEvents.slice(0, 2).map((ev) => (
                      <span
                        key={ev.id}
                        className={`text-[10px] font-medium truncate px-1.5 py-0.5 rounded leading-tight ${
                          ev.type === 'exam'
                            ? 'bg-[#ffdad6] text-[#ba1a1a] font-bold'
                            : ev.type === 'holiday'
                            ? 'bg-[#d1fae5] text-[#065f46]'
                            : 'bg-[#e2dfff] text-[#0f0069]'
                        }`}
                      >
                        {ev.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-[#777587] font-['JetBrains_Mono']">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Agenda (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-6 shadow-sm border border-[#eaedff] flex flex-col gap-4">
          <div className="border-b border-[#f2f3ff] pb-3">
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#777587] uppercase">
              Schedule & Dispatches For
            </span>
            <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e] mt-0.5">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>
          </div>

          {/* If selected date is an Indian National Holiday */}
          {selectedHoliday && (
            <div className="p-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-['JetBrains_Mono'] font-bold px-2 py-0.5 rounded bg-[#d1fae5] text-[#065f46] uppercase">
                  🇮🇳 {selectedHoliday.type} Holiday
                </span>
                {selectedHoliday.campusClosed && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Campus Closed
                  </span>
                )}
              </div>
              <h4 className="font-['Sora'] font-bold text-[15px] text-[#006e4b]">
                {selectedHoliday.name}
              </h4>
              <p className="text-[12px] text-[#065f46] leading-relaxed">
                {selectedHoliday.description}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {selectedEvents.length === 0 ? (
              <div className="py-8 text-center text-[#777587]">
                <p className="text-[13px]">No specific exam or faculty meetings scheduled on this date.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 text-[12px] text-[#3525cd] font-semibold hover:underline"
                >
                  + Add task or agenda item
                </button>
              </div>
            ) : (
              selectedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-4 rounded-xl border flex flex-col gap-2 ${
                    ev.type === 'exam'
                      ? 'bg-[#fff1f2] border-[#ffe4e6]'
                      : ev.type === 'holiday'
                      ? 'bg-[#ecfdf5] border-[#d1fae5]'
                      : 'bg-[#f2f3ff] border-[#e2e7ff]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-['JetBrains_Mono'] font-bold px-2 py-0.5 rounded uppercase ${
                        ev.type === 'exam'
                          ? 'bg-[#ffe4e6] text-[#9f1239]'
                          : ev.type === 'holiday'
                          ? 'bg-[#d1fae5] text-[#065f46]'
                          : 'bg-[#e2dfff] text-[#0f0069]'
                      }`}
                    >
                      {ev.type}
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ev.time}
                    </span>
                  </div>

                  <h4 className="font-semibold text-[14px] text-[#131b2e]">
                    {ev.title}
                  </h4>

                  {ev.room && (
                    <div className="text-[12px] text-[#464555] flex items-center gap-1.5 font-['JetBrains_Mono']">
                      <MapPin className="w-3.5 h-3.5 text-[#777587]" />
                      <span>{ev.room}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-4 p-3.5 bg-[#f2f3ff] rounded-xl border border-[#e2e7ff] text-[12px] text-[#464555]">
            <span className="font-semibold text-[#131b2e] block mb-1">
              Important Registrar Notice:
            </span>
            Mid-term marks must be entered into the campus grading portal by March 24, 2026.
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#eaedff] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#f2f3ff] pb-3 mb-4">
              <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e]">
                Add Calendar Entry
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#777587] hover:text-[#131b2e]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="flex flex-col gap-3.5">
              <div>
                <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ME-102 Problem Solving Tutorial"
                  className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#e2e7ff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 02:00 PM - 03:30 PM"
                  className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#e2e7ff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                  Entry Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#e2e7ff] focus:outline-none"
                >
                  <option value="exam">Examination / Quiz</option>
                  <option value="lecture">Special Lecture</option>
                  <option value="meeting">Departmental Meeting</option>
                  <option value="holiday">Holiday / Recess</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f2f3ff]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#464555] hover:bg-[#f2f3ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#3525cd] text-white font-semibold text-[13px] hover:bg-[#3323cc]"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
