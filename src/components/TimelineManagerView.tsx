import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Filter,
  Send,
  Sparkles,
} from 'lucide-react';
import { TimelineItem, Subject } from '../types';

interface TimelineManagerViewProps {
  timelines: TimelineItem[];
  subjects: Subject[];
  onAddTimeline: (item: Omit<TimelineItem, 'id'>) => void;
  onDeleteTimeline: (id: string) => void;
}

export const TimelineManagerView: React.FC<TimelineManagerViewProps> = ({
  timelines,
  subjects,
  onAddTimeline,
  onDeleteTimeline,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('2026-09-22');
  const [newType, setNewType] = useState<'lecture' | 'exam' | 'practical' | 'assignment'>('lecture');
  const [newDetails, setNewDetails] = useState<string>('');
  const [newRoom, setNewRoom] = useState<string>('Hall 302');
  const [targetSubjectId, setTargetSubjectId] = useState<string>(subjects[0]?.id || 'subj-phy');

  const filteredTimelines =
    selectedSubjectId === 'all'
      ? timelines
      : timelines.filter((t) => t.subjectId === selectedSubjectId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === targetSubjectId) || subjects[0];
    onAddTimeline({
      subjectId: subj.id,
      subjectName: subj.name,
      title: newTitle || 'Upcoming Class Milestone',
      date: newDate,
      type: newType,
      status: 'upcoming',
      details: newDetails || 'Synchronized classroom syllabus milestone.',
      room: newRoom,
    });
    setShowAddModal(false);
    setNewTitle('');
    setNewDetails('');
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#0051d5]">
              Curriculum Operations
            </span>
            <span className="text-xs text-[#5a4138]">Live Student Sync</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-1">
            Timeline & Syllabus Manager
          </h1>
          <p className="text-sm text-[#5a4138]">
            Schedule lecture topics, midterms, lab sessions, and assignments with instant push to student dashboards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#e2e8f0] p-1.5 rounded-xl shadow-xs">
            <Filter className="w-4 h-4 text-[#5a4138] ml-2" />
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0b1c30] outline-none pr-3 py-1 cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#a33900] hover:bg-[#822d00] text-white rounded-xl text-xs font-bold shadow-[0_2px_8px_rgba(163,57,0,0.25)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Timeline Milestones List */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0051d5]" />
            Academic Roadmap Milestones ({filteredTimelines.length})
          </h3>
          <span className="text-xs text-[#006947] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized with Curriculum
          </span>
        </div>

        <div className="relative border-l-2 border-[#eff4ff] ml-4 pl-6 space-y-6">
          {filteredTimelines.map((item) => (
            <div key={item.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  item.status === 'completed'
                    ? 'bg-[#006947]'
                    : item.status === 'current'
                    ? 'bg-[#a33900] ring-4 ring-[#fff3ea]'
                    : 'bg-[#0051d5]'
                }`}
              />

              <div className="bg-[#fcfdff] hover:bg-[#f8f9ff] border border-[#eff4ff] hover:border-[#cbd5e1] p-4 rounded-xl transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#eff4ff] text-[#0051d5]">
                      {item.subjectName || 'Physics 11'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'exam'
                          ? 'bg-[#ffebee] text-[#ba1a1a]'
                          : item.type === 'assignment'
                          ? 'bg-[#fff3ea] text-[#a33900]'
                          : 'bg-[#eff4ff] text-[#00318b]'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs font-semibold text-[#5a4138]">
                      Date: {item.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.room && (
                      <span className="text-xs text-[#5a4138] flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {item.room}
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteTimeline(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Remove milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-extrabold text-[#0b1c30]">
                  {item.title}
                </h4>
                <p className="text-xs text-[#5a4138] leading-relaxed">
                  {item.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#0b1c30]">Add Curriculum Milestone</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#5a4138]">Target Subject</label>
                <select
                  value={targetSubjectId}
                  onChange={(e) => setTargetSubjectId(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-bold text-[#0b1c30] outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5a4138]">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture 16: Work-Energy Theorem & Conservative Forces"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-semibold text-[#0b1c30] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5a4138]">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full mt-1 p-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-semibold text-[#0b1c30] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#5a4138]">Event Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full mt-1 p-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-bold text-[#0b1c30] outline-none"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="exam">Midterm / Exam</option>
                    <option value="assignment">Assignment Due</option>
                    <option value="practical">Lab / Practical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5a4138]">Location / Room</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="Hall 302 / Physics Lab B"
                  className="w-full mt-1 p-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-semibold text-[#0b1c30] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5a4138]">Details & Key Concepts</label>
                <textarea
                  rows={3}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Outline topics covered, required textbook readings, and deliverables..."
                  className="w-full mt-1 p-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-medium text-[#0b1c30] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5a4138] hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#a33900] text-white rounded-xl text-xs font-bold hover:bg-[#822d00] cursor-pointer shadow-xs"
                >
                  Publish Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
