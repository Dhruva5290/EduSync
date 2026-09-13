import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  FileText,
  Bookmark
} from 'lucide-react';

interface ClassesTabProps {
  onSelectLecture: (lectureId: string) => void;
  initialSubjectId?: string;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  onSelectLecture
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'my' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const todayClasses = [
    {
      id: 'lec-phy-101',
      time: '09:00 AM - 10:00 AM',
      status: 'Completed',
      statusColor: 'bg-emerald-50 text-[#006947]',
      subject: 'Physics 11',
      faculty: 'Dr. Rajesh Kulkarni • Room 302',
      topics: ['Incline Plane Vectors', 'Normal Force Resolution', 'Kinetic Friction (μ)'],
      quote: '“Derived the net acceleration formula for a block sliding on a ramp with friction. Verified whiteboard free body diagrams.”',
      codeId: 'ID: lec-phy-101'
    },
    {
      id: 'lec-mth-201',
      time: '11:30 AM - 12:30 PM',
      status: 'In Progress',
      statusColor: 'bg-orange-100 text-[#a33900]',
      subject: 'Mathematics 11',
      faculty: 'Prof. Ananya Sen • Room 105',
      topics: ['Limits at Infinity', "L'Hopital Rule", 'Continuity proofs'],
      quote: '“Discussed indeterminate forms 0/0 and evaluated standard trigonometric limits.”',
      codeId: 'ID: lec-mth-201'
    },
    {
      id: 'lec-chm-304',
      time: '02:00 PM - 03:00 PM',
      status: 'Upcoming',
      statusColor: 'bg-slate-100 text-slate-600',
      subject: 'Chemistry 11',
      faculty: 'Dr. Ramesh Sharma • Lab A',
      topics: ['Hybridization (sp, sp2, sp3)', 'VSEPR Theory Geometry', 'Molecular Dipoles preview'],
      quote: '“Scheduled for this afternoon in Science Block Lab A.”',
      codeId: 'ID: lec-chm-304'
    }
  ];

  const archiveLectures = [
    {
      id: 'lec-phy-102',
      tag: 'Physics • Mechanics',
      date: 'Sep 12',
      title: 'Newtonian Kinetics & Free Fall',
      desc: 'Whiteboard OCR with 4 vector force diagrams',
      icon: '⚡',
      color: 'text-[#c2410c]'
    },
    {
      id: 'lec-mth-202',
      tag: 'Math • Calculus',
      date: 'Sep 11',
      title: 'Epsilon-Delta Definition of Limits',
      desc: 'Step-by-step rigorous proof annotations',
      icon: '📐',
      color: 'text-[#0051d5]'
    },
    {
      id: 'lec-chm-305',
      tag: 'Chemistry • Periodic',
      date: 'Sep 10',
      title: 'Atomic Orbitals & Electronic Config',
      desc: "Aufbau principle & Hund's multiplicity rule",
      icon: '🧪',
      color: 'text-[#006947]'
    }
  ];

  return (
    <div className="px-6 lg:px-8 py-6 flex flex-col gap-8 max-w-[1440px] mx-auto w-full animate-in fade-in duration-200">
      {/* Top Section: Today's Schedule */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#a33900]">DAILY SCHEDULE</span>
              <span>•</span>
              <span>Sunday, September 13, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🗓️</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">Today's Classes</h1>
            </div>
          </div>

          {/* Segmented Toggle */}
          <div className="inline-flex p-1 bg-slate-100 rounded-full self-start md:self-auto shadow-inner">
            {(['all', 'my', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === tab
                    ? 'bg-white text-[#c2410c] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                {tab === 'all' ? 'All Classes' : tab === 'my' ? 'My Classes' : 'Completed'}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todayClasses.map(card => (
            <div
              key={card.id}
              className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group border border-slate-100"
            >
              <div className="flex flex-col gap-4">
                {/* Timing & Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#c2410c] tracking-wide">{card.time}</span>
                  <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold ${card.statusColor}`}>
                    {card.status}
                  </span>
                </div>

                {/* Subject & Faculty */}
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-[#0b1c30] tracking-tight group-hover:text-[#c2410c] transition-colors">
                    {card.subject}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{card.faculty}</p>
                </div>

                {/* Key Topics */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">KEY TOPICS:</span>
                  <ul className="flex flex-col gap-1 text-xs text-[#0b1c30] font-medium">
                    {card.topics.map((t, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] shrink-0"></span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chalkboard Quote */}
                <div className="bg-slate-50 rounded-2xl p-3.5 mt-1 border border-slate-100">
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    {card.quote}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-6 mt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectLecture(card.id)}
                  className="inline-flex items-center gap-1.5 text-[#c2410c] font-bold text-xs hover:underline cursor-pointer"
                  type="button"
                >
                  <span>View Full Notes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-slate-400 font-mono">{card.codeId}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Section: Browse All Lectures & Notes */}
      <section className="flex flex-col gap-4 pt-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                Browse All Lectures & Notes
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Access the complete archive of classroom recordings, OCR whiteboard graphs, and study guides
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-2xs border border-slate-200 w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, formulas, or OCR..."
              className="bg-transparent border-none outline-none text-xs text-slate-800 placeholder:text-slate-400 w-full font-normal"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All (23)' },
            { id: 'physics', label: 'Physics (0)' },
            { id: 'chemistry', label: 'Chemistry (0)' },
            { id: 'math', label: 'Mathematics (0)' },
            { id: 'general', label: 'Miscellaneous & General Notes (0)' },
            { id: 'class11', label: 'Class 11 Physics (2)' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setCategoryFilter(p.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === p.id
                  ? 'bg-[#c2410c] text-white shadow-xs'
                  : 'bg-white text-slate-700 shadow-2xs hover:bg-slate-50 border border-slate-100'
              }`}
              type="button"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Archive Catalog Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {archiveLectures.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectLecture(item.id)}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 border border-slate-100 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-2xl border border-slate-100">
                {item.icon}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase ${item.color}`}>{item.tag}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                </div>
                <h3 className="text-sm font-bold text-[#0b1c30] truncate mt-0.5">{item.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
