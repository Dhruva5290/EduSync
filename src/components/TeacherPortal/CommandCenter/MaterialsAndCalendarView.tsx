import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Clock,
  Eye,
  Calendar,
  Send,
  Plus,
  Pin,
  CheckCircle2,
  Tag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  commandCenterService
} from '../../../services/commandCenterService';
import {
  TeacherMaterialItem,
  TeacherBroadcastMessage,
  CalendarAcademicDay
} from '../../../types';

export const MaterialsAndCalendarView: React.FC = () => {
  const [materials, setMaterials] = useState<TeacherMaterialItem[]>(() =>
    commandCenterService.getMaterials()
  );
  const [broadcasts, setBroadcasts] = useState<TeacherBroadcastMessage[]>(() =>
    commandCenterService.getBroadcasts()
  );
  const [calendarDays, setCalendarDays] = useState<CalendarAcademicDay[]>(() =>
    commandCenterService.getCalendarDays()
  );

  // Material Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadTopics, setUploadTopics] = useState('');
  const [uploadSubject, setUploadSubject] = useState('ES-101');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Broadcast Composer State (Separate from upload)
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetSections, setTargetSections] = useState<string[]>(['Sec A']);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Add Event to Calendar Form State
  const [eventDate, setEventDate] = useState('2026-09-18');
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'Quiz' | 'Assignment Deadline' | 'Mid-Term Exam'>('Quiz');
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Calendar navigation
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date(2026, 8, 1)); // Sep 2026

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    const topicsArray = uploadTopics
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newItem = commandCenterService.uploadMaterial({
      title: uploadTitle.trim(),
      fileName: uploadFileName.trim() || 'Uploaded_Document.pdf',
      fileSize: '1.9 MB',
      keyTopics: topicsArray.length > 0 ? topicsArray : ['Core Curriculum'],
      subjectCode: uploadSubject,
      published: true
    });

    setMaterials(commandCenterService.getMaterials());
    setUploadTitle('');
    setUploadFileName('');
    setUploadTopics('');
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2500);
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    commandCenterService.publishBroadcast({
      authorId: 'prof.sanmitra',
      authorName: 'Dr. Sanmitra Bhattacharya',
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      targetSections,
      pinned: false
    });

    setBroadcasts(commandCenterService.getBroadcasts());
    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 2500);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const updated = commandCenterService.addCalendarEvent(
      eventDate,
      eventTitle.trim(),
      eventType,
      'ES-101'
    );
    setCalendarDays(updated);
    setEventTitle('');
    setShowAddEventModal(false);
  };

  const toggleTargetSection = (sec: string) => {
    if (targetSections.includes(sec)) {
      if (targetSections.length > 1) {
        setTargetSections(targetSections.filter(s => s !== sec));
      }
    } else {
      setTargetSections([...targetSections, sec]);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Calendar Grid Setup for September 2026
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const monthName = currentCalendarDate.toLocaleString('default', { month: 'long' });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. UPLOAD FORM & ALREADY-UPLOADED MATERIALS WITH TRACKING */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#181D24] border border-[#26303B] space-y-4">
          <div className="border-b border-[#26303B] pb-3">
            <h3 className="text-sm font-semibold text-[#E2E8F0] font-['Sora'] tracking-tight flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[#6EA8A0]" />
              Publish Course Study Material
            </h3>
            <p className="text-[11px] text-[#94A3B8]">
              Upload notes, lecture derivations, and formula handouts to student portal
            </p>
          </div>

          {uploadSuccess && (
            <div className="p-3 rounded-xl bg-[#6EA8A0]/15 border border-[#6EA8A0]/30 text-xs text-[#6EA8A0] flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Material published! Initialized student view telemetry.</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#94A3B8] uppercase font-mono text-[10px] mb-1">
                Document Title *
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
                placeholder="e.g. Lecture 15: Dispersion Contours & Gaussian SO2 Calculation"
                required
                className="w-full px-3 py-2 bg-[#12161A] border border-[#26303B] rounded-xl text-[#E2E8F0] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#6EA8A0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#94A3B8] uppercase font-mono text-[10px] mb-1">
                  Subject Code
                </label>
                <select
                  value={uploadSubject}
                  onChange={e => setUploadSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-[#12161A] border border-[#26303B] rounded-xl text-[#E2E8F0] focus:outline-none focus:border-[#6EA8A0]"
                >
                  <option value="ES-101">ES-101 (Environmental Studies)</option>
                  <option value="ME-102">ME-102 (Thermodynamics)</option>
                  <option value="MA-101">MA-101 (Mathematics I)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#94A3B8] uppercase font-mono text-[10px] mb-1">
                  File Attachment
                </label>
                <input
                  type="text"
                  value={uploadFileName}
                  onChange={e => setUploadFileName(e.target.value)}
                  placeholder="e.g. Inversion_Plume_Model.pdf"
                  className="w-full px-3 py-2 bg-[#12161A] border border-[#26303B] rounded-xl text-[#E2E8F0] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#6EA8A0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#94A3B8] uppercase font-mono text-[10px] mb-1">
                Key Topics (Comma Separated)
              </label>
              <input
                type="text"
                value={uploadTopics}
                onChange={e => setUploadTopics(e.target.value)}
                placeholder="e.g. Effective Stack Height, Ground SO2, Plume Reflection"
                className="w-full px-3 py-2 bg-[#12161A] border border-[#26303B] rounded-xl text-[#E2E8F0] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#6EA8A0]"
              />
            </div>

            <button
              type="submit"
              disabled={!uploadTitle.trim()}
              className="w-full py-2.5 rounded-xl bg-[#6EA8A0] hover:bg-[#5D968E] disabled:opacity-40 text-[#12161A] font-semibold tracking-wide uppercase text-xs transition-all cursor-pointer shadow-sm font-['Sora'] mt-2"
            >
              Publish Material to Students
            </button>
          </form>
        </div>

        {/* Uploaded Materials List with View-Tracking Stats (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#181D24] border border-[#26303B] space-y-4">
          <div className="flex items-center justify-between border-b border-[#26303B] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#E2E8F0] font-['Sora'] tracking-tight">
                Published Materials & Student View Dwell Analytics
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Sourced from student dwell tracking hook — opened-by count and average session duration
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#6EA8A0]">
              {materials.length} active documents
            </span>
          </div>

          <div className="space-y-3">
            {materials.map(mat => (
              <div
                key={mat.id}
                className="p-4 rounded-xl bg-[#12161A] border border-[#26303B] space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#181D24] border border-[#26303B] flex items-center justify-center text-[#6EA8A0] shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181D24] border border-[#26303B] text-[#6EA8A0] font-semibold">
                          {mat.subjectCode}
                        </span>
                        <span className="text-[10px] text-[#94A3B8] font-mono">
                          {mat.fileSize}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-[#E2E8F0] font-['Sora'] leading-snug">
                        {mat.title}
                      </h4>
                    </div>
                  </div>

                  {/* View-Tracking Badges */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#6EA8A0]/15 border border-[#6EA8A0]/30 text-[#6EA8A0] text-[11px] font-mono font-semibold">
                      <Eye className="w-3 h-3" />
                      <span>{mat.openedByCount} students opened</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-[#D9A566]">
                      <Clock className="w-3 h-3" />
                      <span>Avg dwell: {formatDuration(mat.avgTimeSpentSeconds)}</span>
                    </div>
                  </div>
                </div>

                {/* Key Topics Tag Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {mat.keyTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181D24] text-[#94A3B8] border border-[#26303B]"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SEPARATE SHORT-BROADCAST COMPOSER FOR NOTES/MESSAGES */}
      {/* ========================================================= */}
      <div className="p-5 rounded-2xl bg-[#181D24] border border-[#26303B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26303B] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-[#E2E8F0] font-['Sora'] tracking-tight flex items-center gap-2">
              <Send className="w-4 h-4 text-[#D9A566]" />
              Direct Student Broadcast Composer
            </h3>
            <p className="text-[11px] text-[#94A3B8]">
              Dispatch urgent notifications, lab prerequisites, or remedial class reminders directly to student boards
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#D9A566]/15 text-[#D9A566] border border-[#D9A566]/30">
            Dedicated Broadcast Channel
          </span>
        </div>

        {broadcastSuccess && (
          <div className="p-3 rounded-xl bg-[#6EA8A0]/15 border border-[#6EA8A0]/30 text-xs text-[#6EA8A0] flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Broadcast dispatched to selected divisions.</span>
          </div>
        )}

        <form onSubmit={handleBroadcastSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                placeholder="Broadcast subject (e.g. Lab Observation Sheet Mandatory on Wednesday)"
                required
                className="w-full px-3.5 py-2.5 bg-[#12161A] border border-[#26303B] rounded-xl text-xs text-[#E2E8F0] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#D9A566]"
              />
            </div>

            {/* Target Sections */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#94A3B8]">To:</span>
              {['Sec A', 'Sec B', 'Sec C'].map(sec => {
                const isSelected = targetSections.includes(sec);
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => toggleTargetSection(sec)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#D9A566] text-[#12161A]'
                        : 'bg-[#12161A] text-[#94A3B8] border border-[#26303B]'
                    }`}
                  >
                    {sec}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            value={broadcastMessage}
            onChange={e => setBroadcastMessage(e.target.value)}
            rows={2}
            placeholder="Type your message to students here..."
            required
            className="w-full px-3.5 py-2.5 bg-[#12161A] border border-[#26303B] rounded-xl text-xs text-[#E2E8F0] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#D9A566]"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!broadcastTitle.trim() || !broadcastMessage.trim()}
              className="px-5 py-2 rounded-xl bg-[#D9A566] hover:bg-[#C89455] disabled:opacity-40 text-[#12161A] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer font-['Sora']"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Broadcast</span>
            </button>
          </div>
        </form>

        {/* Existing Sent Broadcasts Feed */}
        <div className="pt-3 border-t border-[#26303B] space-y-2">
          <span className="text-[10px] uppercase font-mono text-[#94A3B8] tracking-wider block">
            Recent Sent Broadcasts
          </span>
          {broadcasts.map(b => (
            <div
              key={b.id}
              className="p-3 rounded-xl bg-[#12161A] border border-[#26303B] flex items-start justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {b.pinned && <Pin className="w-3 h-3 text-[#D9A566] rotate-45" />}
                  <span className="font-semibold text-[#E2E8F0] font-['Sora']">{b.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#181D24] text-[#D9A566] border border-[#26303B]">
                    {b.targetSections.join(', ')}
                  </span>
                </div>
                <p className="text-[#94A3B8]">{b.message}</p>
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8] shrink-0">{b.createdAt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MONTH-GRID ACADEMIC CALENDAR WITH WHAT'S DUE */}
      {/* ========================================================= */}
      <div className="p-5 rounded-2xl bg-[#181D24] border border-[#26303B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#26303B] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-[#E2E8F0] font-['Sora'] tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#6EA8A0]" />
              Academic Calendar & Milestones ({monthName} {year})
            </h3>
            <p className="text-[11px] text-[#94A3B8]">
              Color-coded holidays and class sessions showing what is due on each day
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Color Legend */}
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-[#6EA8A0]">
                <span className="w-2 h-2 rounded-full bg-[#6EA8A0]" />
                Regular Class
              </span>
              <span className="flex items-center gap-1.5 text-[#D9A566]">
                <span className="w-2 h-2 rounded-full bg-[#D9A566]" />
                Due / Exam
              </span>
              <span className="flex items-center gap-1.5 text-[#C46859]">
                <span className="w-2 h-2 rounded-full bg-[#C46859]" />
                Holiday
              </span>
            </div>

            <button
              onClick={() => setShowAddEventModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[#12161A] hover:bg-[#1E252D] border border-[#26303B] text-xs font-semibold text-[#E2E8F0] flex items-center gap-1.5 cursor-pointer font-['Sora']"
            >
              <Plus className="w-3.5 h-3.5 text-[#6EA8A0]" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center font-mono text-[10px] uppercase text-[#94A3B8] pb-1 border-b border-[#26303B]">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Month Day Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[70px] rounded-xl bg-[#12161A]/30 opacity-20" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayData = calendarDays.find(d => d.date === dateStr);
            const isHoliday = dayData?.isHoliday;
            const hasDueEvents = dayData?.events.some(
              e => e.type === 'Quiz' || e.type === 'Assignment Deadline' || e.type === 'Mid-Term Exam'
            );

            return (
              <div
                key={dayNum}
                className={`min-h-[75px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                  isHoliday
                    ? 'bg-[#C46859]/10 border-[#C46859]/30'
                    : hasDueEvents
                    ? 'bg-[#D9A566]/10 border-[#D9A566]/30'
                    : 'bg-[#12161A] border-[#26303B]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={isHoliday ? 'text-[#C46859] font-bold' : 'text-[#E2E8F0]'}>
                    {dayNum}
                  </span>
                  {isHoliday && (
                    <span className="text-[9px] font-mono text-[#C46859] uppercase truncate">
                      Holiday
                    </span>
                  )}
                </div>

                {/* Due Items Listing */}
                <div className="space-y-1 my-1">
                  {dayData?.events.map((ev, idx) => (
                    <div
                      key={idx}
                      className={`text-[9px] font-sans px-1.5 py-0.5 rounded truncate leading-tight ${
                        ev.type === 'Holiday'
                          ? 'bg-[#C46859]/20 text-[#C46859]'
                          : ev.type === 'Quiz' || ev.type === 'Assignment Deadline' || ev.type === 'Mid-Term Exam'
                          ? 'bg-[#D9A566]/20 text-[#D9A566]'
                          : 'bg-[#6EA8A0]/15 text-[#6EA8A0]'
                      }`}
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#181D24] border border-[#26303B] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#E2E8F0] font-['Sora']">
              Add Academic Milestone Event
            </h3>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-mono text-[10px] uppercase mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  placeholder="e.g. CAT-1 Thermodynamics Quiz"
                  required
                  className="w-full px-3 py-2 bg-[#12161A] border border-[#26303B] rounded-xl text-[#E2E8F0] focus:outline-none focus:border-[#6EA8A0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-mono text-[10px] uppercase mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e: any) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#12161A] border border-[#26303B] rounded-xl text-[#E2E8F0] focus:outline-none focus:border-[#6EA8A0]"
                  >
                    <option value="Quiz">Quiz</option>
                    <option value="Assignment Deadline">Assignment Deadline</option>
                    <option value="Mid-Term Exam">Mid-Term Exam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-mono text-[10px] uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#12161A] border border-[#26303B] rounded-xl text-[#E2E8F0] focus:outline-none focus:border-[#6EA8A0]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#12161A] text-[#94A3B8] hover:text-[#E2E8F0] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!eventTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-[#6EA8A0] hover:bg-[#5D968E] text-[#12161A] text-xs font-semibold cursor-pointer font-['Sora']"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
