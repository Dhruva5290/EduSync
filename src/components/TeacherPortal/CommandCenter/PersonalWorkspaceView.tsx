import React, { useState } from 'react';
import {
  Clock,
  Briefcase,
  CheckSquare,
  Square,
  Pin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Plus,
  Radio,
  FileCheck,
  Building,
  RotateCcw
} from 'lucide-react';
import {
  commandCenterService
} from '../../../services/commandCenterService';
import {
  SimulatedGateScanLog,
  ManagementStickyNote,
  TeacherChecklistItem,
  TeacherLeaveSubmission,
  DeskBoardSummary
} from '../../../types';

export const PersonalWorkspaceView: React.FC = () => {
  const teacherId = 'prof.rajesh';
  const teacherName = 'Dr. Rajesh Kulkarni';

  // State
  const [gateScan, setGateScan] = useState<SimulatedGateScanLog>(() =>
    commandCenterService.getGateScanStatus(teacherId)
  );
  const [deskBoard] = useState<DeskBoardSummary>(() =>
    commandCenterService.getDeskBoardSummary()
  );
  const [stickyNotes] = useState<ManagementStickyNote[]>(() =>
    commandCenterService.getManagementStickyNotes()
  );
  const [checklist, setChecklist] = useState<TeacherChecklistItem[]>(() =>
    commandCenterService.getChecklist()
  );
  const [leaves, setLeaves] = useState<TeacherLeaveSubmission[]>(() =>
    commandCenterService.getLeaves()
  );

  // Mark-Leave Form State
  const [leaveDate, setLeaveDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // New Checklist Item State
  const [newChecklistText, setNewChecklistText] = useState('');

  const handleToggleGateScan = (isManualOverride: boolean = false) => {
    const updated = commandCenterService.toggleGateScan(teacherId, isManualOverride);
    setGateScan(updated);
  };

  const handleToggleChecklist = (id: string) => {
    const updated = commandCenterService.toggleChecklistItem(id);
    setChecklist(updated);
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const updated = commandCenterService.addChecklistItem(newChecklistText.trim());
    setChecklist(updated);
    setNewChecklistText('');
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const updated = commandCenterService.submitLeave(
      teacherId,
      teacherName,
      leaveDate,
      leaveReason.trim()
    );
    setLeaves(updated);
    setLeaveReason('');
    setLeaveSuccess(true);
    setTimeout(() => setLeaveSuccess(false), 2500);
  };

  const isCheckedIn = gateScan.scanType === 'check_in';

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. TOP DESK-BOARD STATS: HOURS TAKEN TODAY / THIS WEEK */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#181D24] border border-[#26303B]">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
            CLASS HOURS TODAY
          </span>
          <div className="text-2xl font-bold font-['Sora'] text-[#E2E8F0]">
            {deskBoard.hoursToday} <span className="text-xs font-normal text-[#94A3B8]">hrs</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            {deskBoard.classesCompletedToday} of {deskBoard.classesScheduledToday} sessions completed
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#181D24] border border-[#26303B]">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
            CLASS HOURS THIS WEEK
          </span>
          <div className="text-2xl font-bold font-['Sora'] text-[#6EA8A0]">
            {deskBoard.hoursThisWeek} <span className="text-xs font-normal text-[#94A3B8]">hrs</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            On track with university curriculum pace
          </p>
        </div>

        {/* 2. SIMULATED GATE-SCAN ATTENDANCE LOG */}
        <div className="sm:col-span-2 p-5 rounded-2xl bg-[#181D24] border border-[#26303B] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-3.5 h-3.5 text-[#6EA8A0] animate-pulse" />
                <span className="text-[10px] font-mono uppercase text-[#94A3B8] tracking-wider">
                  Campus Turnstile RFID Attendance
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#D9A566]/15 text-[#D9A566] border border-[#D9A566]/30">
                  Simulated
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-[#E2E8F0] font-['Sora']">
                  Status: {isCheckedIn ? 'Checked In' : 'Checked Out'}
                </span>
                <span className="text-xs font-mono text-[#94A3B8]">
                  (@ {gateScan.timestamp})
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Location: {gateScan.gateLocation}
              </p>
            </div>

            {/* Toggle Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleGateScan(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-['Sora'] transition-all cursor-pointer ${
                  isCheckedIn
                    ? 'bg-[#12161A] text-[#94A3B8] border border-[#26303B] hover:text-[#E2E8F0]'
                    : 'bg-[#6EA8A0] text-[#12161A] hover:bg-[#5D968E]'
                }`}
              >
                {isCheckedIn ? 'Simulate Scan Out' : 'Simulate Scan In'}
              </button>

              <button
                onClick={() => handleToggleGateScan(true)}
                className="px-2.5 py-1.5 rounded-xl bg-[#12161A] hover:bg-[#1E252D] border border-[#26303B] text-[11px] font-mono text-[#D9A566] cursor-pointer"
                title="Manual Faculty Override"
              >
                Manual Override
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MANAGEMENT STICKY NOTES & INTERACTIVE CHECKLIST */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sticky Notes from Management (Read-Only Feed, Pinned Items First) (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#181D24] border border-[#26303B] space-y-4">
          <div className="flex items-center justify-between border-b border-[#26303B] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#E2E8F0] font-['Sora'] tracking-tight flex items-center gap-2">
                <Building className="w-4 h-4 text-[#D9A566]" />
                Institutional Notices & Sticky Notes
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Read-only official memos from Dean, IQAC, and Department Office
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#12161A] text-[#94A3B8] border border-[#26303B]">
              Pinned First
            </span>
          </div>

          <div className="space-y-3">
            {stickyNotes.map(note => (
              <div
                key={note.id}
                className={`p-4 rounded-xl border transition-all space-y-2 ${
                  note.isPinned
                    ? 'bg-[#12161A] border-[#D9A566]/40'
                    : 'bg-[#12161A]/60 border-[#26303B]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {note.isPinned && <Pin className="w-3.5 h-3.5 text-[#D9A566] rotate-45 shrink-0" />}
                    <h4 className="text-xs font-semibold text-[#E2E8F0] font-['Sora']">
                      {note.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#94A3B8] shrink-0">
                    {note.createdAt}
                  </span>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {note.content}
                </p>

                <div className="pt-2 border-t border-[#26303B]/60 flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                  <span>From: <strong className="text-[#E2E8F0] font-normal">{note.from}</strong></span>
                  {note.priority === 'high' && (
                    <span className="text-[#C46859] font-bold uppercase">High Priority</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simple Interactive Checklist & Mark-Leave (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Interactive Checklist */}
          <div className="p-5 rounded-2xl bg-[#181D24] border border-[#26303B] space-y-4">
            <div className="border-b border-[#26303B] pb-3">
              <h3 className="text-sm font-semibold text-[#E2E8F0] font-['Sora'] tracking-tight flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#6EA8A0]" />
                Faculty Action Checklist
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Tick through daily grading, syllabus reviews, and administrative duties
              </p>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {checklist.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    item.completed
                      ? 'bg-[#12161A]/40 border-[#26303B]/50 opacity-60'
                      : 'bg-[#12161A] border-[#26303B] hover:border-[#6EA8A0]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#6EA8A0] shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-[#94A3B8] shrink-0" />
                    )}
                    <span className={`text-xs ${item.completed ? 'line-through text-[#94A3B8]' : 'text-[#E2E8F0]'}`}>
                      {item.text}
                    </span>
                  </div>

                  {item.category && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#181D24] border border-[#26303B] text-[#94A3B8]">
                      {item.category}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Add Checklist Item */}
            <form onSubmit={handleAddChecklist} className="flex gap-2 pt-2 border-t border-[#26303B]">
              <input
                type="text"
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                placeholder="+ Add task item..."
                className="flex-1 px-3 py-1.5 bg-[#12161A] border border-[#26303B] rounded-xl text-xs text-[#E2E8F0] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#6EA8A0]"
              />
              <button
                type="submit"
                disabled={!newChecklistText.trim()}
                className="px-3 py-1.5 rounded-xl bg-[#6EA8A0] hover:bg-[#5D968E] disabled:opacity-40 text-[#12161A] text-xs font-semibold cursor-pointer font-['Sora']"
              >
                Add
              </button>
            </form>
          </div>

          {/* Mark-Leave Action Form & Pending List */}
          <div className="p-5 rounded-2xl bg-[#181D24] border border-[#26303B] space-y-4">
            <div className="border-b border-[#26303B] pb-3">
              <h3 className="text-sm font-semibold text-[#E2E8F0] font-['Sora'] tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C46859]" />
                Mark Leave Action
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Submit leave date and reason to the pending departmental roster
              </p>
            </div>

            {leaveSuccess && (
              <div className="p-2.5 rounded-xl bg-[#6EA8A0]/15 border border-[#6EA8A0]/30 text-xs text-[#6EA8A0] flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Leave application registered into pending queue.</span>
              </div>
            )}

            <form onSubmit={handleLeaveSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-mono text-[10px] uppercase mb-1">
                    Leave Date
                  </label>
                  <input
                    type="date"
                    value={leaveDate}
                    onChange={e => setLeaveDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#12161A] border border-[#26303B] rounded-xl text-[#E2E8F0] focus:outline-none focus:border-[#C46859]"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-mono text-[10px] uppercase mb-1">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={leaveReason}
                    onChange={e => setLeaveReason(e.target.value)}
                    placeholder="e.g. Health Emergency / Academic Conference"
                    required
                    className="w-full px-3 py-2 bg-[#12161A] border border-[#26303B] rounded-xl text-[#E2E8F0] focus:outline-none focus:border-[#C46859]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!leaveReason.trim()}
                className="w-full py-2 rounded-xl bg-[#C46859] hover:bg-[#B35849] disabled:opacity-40 text-white font-semibold text-xs transition-all cursor-pointer font-['Sora']"
              >
                Submit Leave Application
              </button>
            </form>

            {/* Pending Leaves List */}
            {leaves.length > 0 && (
              <div className="pt-2 border-t border-[#26303B] space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#94A3B8]">
                  Pending / Submitted Leaves ({leaves.length})
                </span>
                {leaves.map(l => (
                  <div
                    key={l.id}
                    className="p-2.5 rounded-xl bg-[#12161A] border border-[#26303B] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[#E2E8F0] font-medium block">{l.reason}</span>
                      <span className="text-[10px] font-mono text-[#94A3B8]">Date: {l.startDate}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#D9A566]/20 text-[#D9A566] border border-[#D9A566]/40">
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
