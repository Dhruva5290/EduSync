import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  CalendarX,
  FileCheck,
  Plus,
  Trash2,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Phone,
  Calendar,
  Sparkles,
  Info,
  Check,
  Palmtree,
  Coffee,
  ShieldCheck,
  Clock3,
  Radio,
} from 'lucide-react';
import { StickyNote, LeaveRequest } from '../../../types';

interface TeacherWorkspaceScreenProps {
  stickyNotes: StickyNote[];
  leaves: LeaveRequest[];
  onToggleNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onAddNote: (note: Omit<StickyNote, 'id'>) => void;
  onAddLeave: (leave: Omit<LeaveRequest, 'id' | 'status' | 'submittedDate'>) => void;
  onOpenEcosystemPing?: () => void;
}

export const TeacherWorkspaceScreen: React.FC<TeacherWorkspaceScreenProps> = ({
  stickyNotes,
  leaves,
  onToggleNote,
  onDeleteNote,
  onAddNote,
  onAddLeave,
  onOpenEcosystemPing,
}) => {
  const [activeTab, setActiveTab] = useState<'sticky' | 'leaves' | 'dispatches'>('sticky');
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [leaveSubmittedToast, setLeaveSubmittedToast] = useState<string | null>(null);

  // New leave state (In-App Leave Application Panel)
  const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('Casual');
  const [fromDate, setFromDate] = useState('2026-03-24');
  const [toDate, setToDate] = useState('2026-03-25');
  const [dateOfJoining, setDateOfJoining] = useState('2026-03-26');
  const [totalDays, setTotalDays] = useState(2);
  const [reason, setReason] = useState('');
  const [proxyFaculty, setProxyFaculty] = useState('Dr. Ananya Sen (Dept. of CSE)');
  const [contactPhone, setContactPhone] = useState('+91 98452 10984');
  const [handoverNotes, setHandoverNotes] = useState('');

  // New note state
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<StickyNote['category']>('exam');

  // Dynamic Quota Calculations
  const leaveStats = useMemo(() => {
    let clTaken = 3;
    let plTaken = 3;
    let odTaken = 1;
    let mlTaken = 0;

    leaves.forEach((l) => {
      const d = Number(l.days) || 1;
      if (l.type === 'Casual') clTaken += d;
      else if (l.type === 'Paid') plTaken += d;
      else if (l.type === 'Academic Duty') odTaken += d;
      else if (l.type === 'Medical') mlTaken += d;
    });

    return {
      paidTotal: 15,
      paidAvailable: Math.max(0, 15 - plTaken),
      paidTaken: plTaken,
      casualTotal: 10,
      casualAvailable: Math.max(0, 10 - clTaken),
      casualTaken: clTaken,
      dutyTotal: 6,
      dutyAvailable: Math.max(0, 6 - odTaken),
      dutyTaken: odTaken,
      medicalTotal: 10,
      medicalAvailable: Math.max(0, 10 - mlTaken),
      medicalTaken: mlTaken,
      holidaysLeft: 14,
      totalTaken: clTaken + plTaken + odTaken + mlTaken,
    };
  }, [leaves]);

  // Date Calculation Helpers
  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    if (val && !toDate) {
      setToDate(val);
      calcJoiningAndDays(val, val);
    } else if (val && toDate) {
      calcJoiningAndDays(val, toDate);
    }
  };

  const handleToDateChange = (val: string) => {
    setToDate(val);
    if (fromDate && val) {
      calcJoiningAndDays(fromDate, val);
    } else if (!fromDate && val) {
      setFromDate(val);
      calcJoiningAndDays(val, val);
    }
  };

  const calcJoiningAndDays = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diffMs = e.getTime() - s.getTime();
      const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
      setTotalDays(days);

      const nextDay = new Date(e);
      nextDay.setDate(nextDay.getDate() + 1);
      // Skip Sunday (0)
      if (nextDay.getDay() === 0) {
        nextDay.setDate(nextDay.getDate() + 1);
      }
      setDateOfJoining(nextDay.toISOString().split('T')[0]);
    } catch {
      setTotalDays(1);
    }
  };

  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onAddLeave({
      type: leaveType,
      fromDate,
      toDate,
      days: totalDays,
      reason: reason.trim(),
      proxyFaculty,
      dateOfJoining,
      contactPhone,
      handoverNotes: handoverNotes.trim(),
    });

    setLeaveSubmittedToast(
      `Leave application (${leaveType}, ${totalDays} days) submitted to Dean & HOD. Joining duty on ${dateOfJoining}.`
    );
    setTimeout(() => setLeaveSubmittedToast(null), 5000);

    setReason('');
    setHandoverNotes('');
    setShowApplyLeaveModal(false);
  };

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    let tag = 'GENERAL';
    let tagBg = '#f2f3ff';
    let tagText = '#3525cd';

    if (noteCategory === 'exam') {
      tag = 'URGENT • EXAM';
      tagBg = '#ffe4e6';
      tagText = '#9f1239';
    } else if (noteCategory === 'co-instructor') {
      tag = 'CO-INSTRUCTOR';
      tagBg = '#e2dfff';
      tagText = '#0f0069';
    } else if (noteCategory === 'lab') {
      tag = 'LAB PREP';
      tagBg = '#d1fae5';
      tagText = '#065f46';
    }

    onAddNote({
      tag,
      tagBg,
      tagText,
      dueText: 'Today',
      content: noteContent.trim(),
      completed: false,
      meta: 'Teacher Desk Note',
      category: noteCategory,
    });

    setNoteContent('');
    setShowAddNoteModal(false);
  };

  return (
    <div id="teacher-workspace-screen" className="p-4 sm:p-6 lg:p-8 max-w-[1580px] mx-auto w-full flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#eaedff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#e2dfff] text-[#0f0069] font-bold">
              FACULTY DESK & AFFAIRS
            </span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555]">
              Office 304 • Block 3 • Employee ID: BMU-FAC-2021-089
            </span>
          </div>
          <h1 className="font-['Sora'] text-2xl font-bold text-[#131b2e] mt-1">
            Teacher Workspace & Leave Portal
          </h1>
          <p className="text-[14px] text-[#464555]">
            Sticky task board, institutional leave quota overview, substitute coverage workflows, and dean academic circulars.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenEcosystemPing && (
            <button
              onClick={onOpenEcosystemPing}
              className="px-3.5 py-2 rounded-lg bg-[#e2dfff]/60 hover:bg-[#e2dfff] text-[#0f0069] text-[13px] font-bold flex items-center gap-1.5 border border-[#d0cbff] cursor-pointer transition-all shadow-2xs"
              title="Connect & Ping Google Mail, Calendar, and Apple iOS"
            >
              <Radio className="w-4 h-4 text-[#3525cd] animate-pulse" />
              <span>Ecosystem Ping Hub</span>
            </button>
          )}

          <button
            onClick={() => setShowAddNoteModal(true)}
            className="px-3.5 py-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-[13px] font-semibold flex items-center gap-1.5 border border-[#e2e7ff] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#3525cd]" />
            <span>New Note</span>
          </button>

          <button
            onClick={() => setShowApplyLeaveModal(true)}
            className="px-3.5 py-2 rounded-lg bg-[#3525cd] hover:bg-[#3323cc] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CalendarX className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {leaveSubmittedToast && (
        <div className="p-3.5 bg-[#ecfdf5] border border-[#d1fae5] text-[#065f46] rounded-xl text-[13px] font-medium flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#006e4b] shrink-0" />
          <span>{leaveSubmittedToast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#eaedff] pb-2">
        <button
          onClick={() => setActiveTab('sticky')}
          className={`px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'sticky'
              ? 'bg-[#3525cd] text-white shadow-xs'
              : 'bg-white text-[#464555] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Sticky Task Board ({stickyNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'leaves'
              ? 'bg-[#3525cd] text-white shadow-xs'
              : 'bg-white text-[#464555] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          <CalendarX className="w-4 h-4" />
          <span>Leave Quotas & Proxy Coverage ({leaves.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatches')}
          className={`px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'dispatches'
              ? 'bg-[#3525cd] text-white shadow-xs'
              : 'bg-white text-[#464555] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Dean Academic Dispatches (2)</span>
        </button>
      </div>

      {/* TAB 1: STICKY TASK BOARD */}
      {activeTab === 'sticky' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stickyNotes.map((note) => {
            const isYellow = note.tagBg === '#fffbeb';
            const isPink = note.tagBg === '#ffe4e6';
            const isGreen = note.tagBg === '#d1fae5';
            const isPurple = note.tagBg === '#e2dfff';

            let cardBg = 'bg-white';
            let cardBorder = 'border-[#eaedff]';

            if (isYellow) {
              cardBg = 'bg-[#fffef0]';
              cardBorder = 'border-[#fef08a]';
            } else if (isPink) {
              cardBg = 'bg-[#fff5f5]';
              cardBorder = 'border-[#fecdd3]';
            } else if (isGreen) {
              cardBg = 'bg-[#f0fdf4]';
              cardBorder = 'border-[#bbf7d0]';
            } else if (isPurple) {
              cardBg = 'bg-[#f7f5ff]';
              cardBorder = 'border-[#ddd6fe]';
            }

            return (
              <div
                key={note.id}
                className={`${cardBg} ${cardBorder} border rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[170px] relative group transition-all hover:shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                      style={{ backgroundColor: note.tagBg, color: note.tagText }}
                    >
                      {note.tag}
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#777587]">
                      {note.dueText}
                    </span>
                  </div>

                  <p
                    className={`text-[14px] leading-relaxed ${
                      note.completed ? 'line-through text-[#777587]' : 'text-[#131b2e]'
                    }`}
                  >
                    {note.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                  <button
                    onClick={() => onToggleNote(note.id)}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-[#464555] hover:text-[#3525cd] cursor-pointer"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        note.completed ? 'text-[#006e4b] fill-[#d1fae5]' : 'text-[#777587]'
                      }`}
                    />
                    <span>{note.completed ? 'Done' : 'Mark complete'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1 rounded text-[#777587] hover:text-[#ba1a1a] hover:bg-black/5 cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: LEAVE QUOTAS OVERVIEW & PROXY MANAGEMENT */}
      {activeTab === 'leaves' && (
        <div className="flex flex-col gap-6">
          {/* 6 LEAVE QUOTAS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Card 1: Paid Leaves */}
            <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#3525cd] uppercase tracking-wider font-['JetBrains_Mono']">
                    Paid Leaves
                  </span>
                  <Briefcase className="w-4 h-4 text-[#3525cd]" />
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="font-['Sora'] text-2xl font-bold text-[#131b2e]">
                    {leaveStats.paidAvailable}
                  </span>
                  <span className="text-[12px] text-[#464555]">/ {leaveStats.paidTotal} available</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-[#f2f3ff] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#3525cd] h-full rounded-full"
                    style={{ width: `${(leaveStats.paidAvailable / leaveStats.paidTotal) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#777587] mt-1 block font-['JetBrains_Mono']">
                  Taken: {leaveStats.paidTaken} days
                </span>
              </div>
            </div>

            {/* Card 2: Casual Leaves */}
            <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0f0069] uppercase tracking-wider font-['JetBrains_Mono']">
                    Casual (CL)
                  </span>
                  <Coffee className="w-4 h-4 text-[#0f0069]" />
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="font-['Sora'] text-2xl font-bold text-[#131b2e]">
                    {leaveStats.casualAvailable}
                  </span>
                  <span className="text-[12px] text-[#464555]">/ {leaveStats.casualTotal} available</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-[#f2f3ff] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0f0069] h-full rounded-full"
                    style={{ width: `${(leaveStats.casualAvailable / leaveStats.casualTotal) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#777587] mt-1 block font-['JetBrains_Mono']">
                  Taken: {leaveStats.casualTaken} days
                </span>
              </div>
            </div>

            {/* Card 3: Duty Leave */}
            <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#6b38d4] uppercase tracking-wider font-['JetBrains_Mono']">
                    Duty Leave (OD)
                  </span>
                  <ShieldCheck className="w-4 h-4 text-[#6b38d4]" />
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="font-['Sora'] text-2xl font-bold text-[#6b38d4]">
                    {leaveStats.dutyAvailable}
                  </span>
                  <span className="text-[12px] text-[#464555]">/ {leaveStats.dutyTotal} available</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-[#f2f3ff] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6b38d4] h-full rounded-full"
                    style={{ width: `${(leaveStats.dutyAvailable / leaveStats.dutyTotal) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#777587] mt-1 block font-['JetBrains_Mono']">
                  Conferences / Viva
                </span>
              </div>
            </div>

            {/* Card 4: Medical Leave */}
            <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#006e4b] uppercase tracking-wider font-['JetBrains_Mono']">
                    Medical (ML)
                  </span>
                  <Palmtree className="w-4 h-4 text-[#006e4b]" />
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="font-['Sora'] text-2xl font-bold text-[#006e4b]">
                    {leaveStats.medicalAvailable}
                  </span>
                  <span className="text-[12px] text-[#464555]">/ {leaveStats.medicalTotal} available</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-[#f2f3ff] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#006e4b] h-full rounded-full"
                    style={{ width: `${(leaveStats.medicalAvailable / leaveStats.medicalTotal) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#777587] mt-1 block font-['JetBrains_Mono']">
                  Medical certificate req.
                </span>
              </div>
            </div>

            {/* Card 5: Holidays Left */}
            <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#b45309] uppercase tracking-wider font-['JetBrains_Mono']">
                    Holidays Left
                  </span>
                  <Calendar className="w-4 h-4 text-[#b45309]" />
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="font-['Sora'] text-2xl font-bold text-[#b45309]">
                    {leaveStats.holidaysLeft}
                  </span>
                  <span className="text-[12px] text-[#464555]">days in 2026</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[10px] text-[#006e4b] bg-[#ecfdf5] px-2 py-0.5 rounded font-bold font-['JetBrains_Mono'] block text-center">
                  National & Gazetted
                </span>
              </div>
            </div>

            {/* Card 6: Total Taken */}
            <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#ba1a1a] uppercase tracking-wider font-['JetBrains_Mono']">
                    Total Taken
                  </span>
                  <Clock3 className="w-4 h-4 text-[#ba1a1a]" />
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="font-['Sora'] text-2xl font-bold text-[#131b2e]">
                    {leaveStats.totalTaken}
                  </span>
                  <span className="text-[12px] text-[#464555]">days this year</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[10px] text-[#777587] font-['JetBrains_Mono'] block text-center">
                  CL: 3 • PL: 3 • OD: 1
                </span>
              </div>
            </div>
          </div>

          {/* Past Leave Requests Table */}
          <div className="bg-white rounded-xl shadow-sm border border-[#eaedff] overflow-hidden">
            <div className="p-4 border-b border-[#eaedff] flex items-center justify-between">
              <div>
                <h3 className="font-['Sora'] font-semibold text-[16px] text-[#131b2e]">
                  Institutional Leave Applications & Proxy History
                </h3>
                <p className="text-[12px] text-[#464555]">
                  Shows official approval status, date of issue, joining duty date, and assigned proxy instructor.
                </p>
              </div>

              <button
                onClick={() => setShowApplyLeaveModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#3525cd] text-white text-[12px] font-semibold hover:bg-[#3323cc] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply for Leave</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="bg-[#f2f3ff] border-b border-[#eaedff] text-[11px] font-semibold text-[#464555] uppercase font-['JetBrains_Mono']">
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration & Days</th>
                    <th className="py-3 px-4">Joining Duty Date</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Assigned Proxy Faculty</th>
                    <th className="py-3 px-4">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-[#faf8ff]">
                      <td className="py-3 px-4 font-semibold text-[#131b2e]">
                        <span className="px-2 py-0.5 rounded bg-[#f2f3ff] text-[#3525cd] text-[12px] font-['JetBrains_Mono']">
                          {l.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-['JetBrains_Mono'] text-[12px]">
                        <div>{l.fromDate} to {l.toDate}</div>
                        <span className="text-[11px] text-[#777587]">({l.days} days)</span>
                      </td>
                      <td className="py-3 px-4 font-['JetBrains_Mono'] text-[12px] text-[#006e4b] font-bold">
                        {l.dateOfJoining || 'Next Day 09:00 AM'}
                      </td>
                      <td className="py-3 px-4 text-[#464555] max-w-xs">
                        <div className="truncate font-medium">{l.reason}</div>
                        {l.handoverNotes && (
                          <div className="text-[11px] text-[#777587] truncate">
                            Notes: {l.handoverNotes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#3525cd]">
                        {l.proxyFaculty}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-['JetBrains_Mono'] text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                            l.status === 'Approved'
                              ? 'bg-[#d1fae5] text-[#065f46]'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEAN DISPATCHES */}
      {activeTab === 'dispatches' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white p-6 rounded-xl border border-[#eaedff] shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-['JetBrains_Mono'] text-[11px] font-bold px-2 py-0.5 rounded bg-[#ffe4e6] text-[#9f1239]">
                DISPATCH #44 • URGENT
              </span>
              <span className="text-[12px] font-['JetBrains_Mono'] text-[#777587]">
                March 03, 2026 • 04:30 PM
              </span>
            </div>
            <h3 className="font-['Sora'] font-semibold text-[16px] text-[#131b2e]">
              Mid-Term Exam Seating Arrangement & Hall 4 Paper Logistics
            </h3>
            <p className="text-[13px] text-[#464555] leading-relaxed">
              All course instructors of first and second year core courses (including ES-101 and ME-102) must verify the 160 seating buffer for Hall 4. Paper printing requests must be lodged with the central examination bank before Friday 5:00 PM.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#eaedff] shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-['JetBrains_Mono'] text-[11px] font-bold px-2 py-0.5 rounded bg-[#e2dfff] text-[#0f0069]">
                DISPATCH #41 • SMART CAMPUS
              </span>
              <span className="text-[12px] font-['JetBrains_Mono'] text-[#777587]">
                Feb 27, 2026
              </span>
            </div>
            <h3 className="font-['Sora'] font-semibold text-[16px] text-[#131b2e]">
              Room 210 Smart Podium Firmware v4.28 Release
            </h3>
            <p className="text-[13px] text-[#464555] leading-relaxed">
              Smart pod telemetry now includes real-time microphone acoustic resonance (dB) and student participation score index. Support hotlines are operational via Ext. 209.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-APP LEAVE APPLICATION MODAL (DATE OF ISSUE, JOINING, QUOTAS, PROXY) */}
      {/* ========================================================================= */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#eaedff] my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-3 mb-4">
              <div>
                <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e]">
                  Faculty Leave Application Form
                </h3>
                <p className="text-[12px] text-[#464555]">
                  Fills date of issue, joining duty, leave quota deduction, and lecture proxy.
                </p>
              </div>
              <button
                onClick={() => setShowApplyLeaveModal(false)}
                className="text-[#777587] hover:text-[#131b2e] p-1 rounded-lg hover:bg-[#f2f3ff] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} className="flex flex-col gap-4">
              {/* Leave Category */}
              <div>
                <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                  Leave Category & Available Quota
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                >
                  <option value="Paid">Paid Leave ({leaveStats.paidAvailable} / 15 days available)</option>
                  <option value="Casual">Casual Leave ({leaveStats.casualAvailable} / 10 days available)</option>
                  <option value="Academic Duty">Academic Duty / Conference ({leaveStats.dutyAvailable} / 6 days available)</option>
                  <option value="Medical">Medical Leave ({leaveStats.medicalAvailable} / 10 days available)</option>
                  <option value="Special">Special Institutional Leave</option>
                </select>
              </div>

              {/* Date of Issue & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                    Date of Issue (Start Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => handleFromDateChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => handleToDateChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                  />
                </div>
              </div>

              {/* Auto-Calculated Fields Banner */}
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-[#065f46] block uppercase font-['JetBrains_Mono']">
                    Total Days of Absence
                  </span>
                  <span className="font-['Sora'] text-lg font-bold text-[#065f46]">
                    {totalDays} Day{totalDays > 1 ? 's' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#065f46] block uppercase font-['JetBrains_Mono']">
                    Date of Joining Duty
                  </span>
                  <span className="font-['JetBrains_Mono'] text-sm font-bold text-[#065f46]">
                    {dateOfJoining} (09:00 AM)
                  </span>
                </div>
              </div>

              {/* Assigned Substitute Teacher */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] font-semibold text-[#131b2e]">
                    Assigned Substitute / Proxy Faculty *
                  </label>
                  <span className="text-[11px] text-[#777587]">Will cover lecture slots</span>
                </div>
                <select
                  value={proxyFaculty}
                  onChange={(e) => setProxyFaculty(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                >
                  <option value="Dr. Ananya Sen (Dept. of CSE)">Dr. Ananya Sen (Dept. of CSE)</option>
                  <option value="Prof. Rajesh Kumar (Dept. of ME)">Prof. Rajesh Kumar (Dept. of ME)</option>
                  <option value="Dr. Vikram Deshmukh (Dept. of ECE)">Dr. Vikram Deshmukh (Dept. of ECE)</option>
                  <option value="Dr. Meenakshi Sundaram (Dept. of Mathematics)">Dr. Meenakshi Sundaram (Dept. of Mathematics)</option>
                </select>

                {/* Quick Pick Colleague Chips */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[
                    'Dr. Ananya Sen',
                    'Prof. Rajesh Kumar',
                    'Dr. Vikram Deshmukh',
                  ].map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => setProxyFaculty(`${name} (Dept. of ME)`)}
                      className="px-2 py-0.5 text-[11px] font-medium rounded bg-[#e2dfff] text-[#0f0069] hover:bg-[#d0cbff] cursor-pointer"
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Contact Phone */}
              <div>
                <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                  Emergency Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#777587] absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                  />
                </div>
              </div>

              {/* Reason for Leave */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] font-semibold text-[#131b2e]">
                    Reason for Leave *
                  </label>
                  <span className="text-[11px] text-[#777587]">Formal institution record</span>
                </div>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Attending AICTE faculty development programme in New Delhi..."
                  className="w-full p-2.5 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                />

                {/* Reason Presets */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[
                    'Attending IEEE International Conference',
                    'Routine Medical Consultation & Diagnostics',
                    'Personal Family Obligation',
                    'University Accreditation Committee Workshop',
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setReason(preset)}
                      className="px-2 py-0.5 text-[11px] rounded bg-[#f2f3ff] text-[#464555] hover:bg-[#eaedff] border border-[#eaedff] cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Handover Notes for Proxy */}
              <div>
                <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                  Handover Notes & Syllabus Coverage for Substitute Teacher
                </label>
                <textarea
                  rows={2}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="e.g. Please solve Exercise 4.2 numericals on Clausius inequality for ME-102 Div B; slides are in Course Drive."
                  className="w-full p-2.5 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setShowApplyLeaveModal(false)}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#464555] hover:bg-[#f2f3ff] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#3525cd] text-white font-semibold text-[13px] hover:bg-[#3323cc] shadow-xs cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Sticky Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#eaedff]">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-3 mb-4">
              <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e]">
                New Sticky Workspace Note
              </h3>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="text-[#777587] hover:text-[#131b2e] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNoteSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                  Category
                </label>
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                >
                  <option value="exam">Exam & Quiz Preparation (Urgent)</option>
                  <option value="co-instructor">Co-Instructor Coordination</option>
                  <option value="lab">Lab Hardware Setup</option>
                  <option value="general">General Administrative</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                  Note Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Task description..."
                  className="w-full p-2.5 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#eaedff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#464555] hover:bg-[#f2f3ff] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#3525cd] text-white font-semibold text-[13px] hover:bg-[#3323cc] shadow-xs cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
