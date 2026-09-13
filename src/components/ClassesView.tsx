import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { ClassScheduleItem, LectureArchiveItem } from '../types';

interface ClassesViewProps {
  classes: ClassScheduleItem[];
  archives: LectureArchiveItem[];
  onOpenNotes: (classItem: ClassScheduleItem | any) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  archives,
  onOpenNotes,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'my' | 'completed'>('all');
  const [archiveCategory, setArchiveCategory] = useState<string>('All (23)');
  const [archiveSearch, setArchiveSearch] = useState<string>('');

  const filteredClasses = classes.filter((c) => {
    if (activeFilter === 'completed') return c.status === 'Completed';
    return true;
  });

  const categories = [
    { name: 'All (23)', count: undefined },
    { name: 'Physics', count: 0 },
    { name: 'Chemistry', count: 0 },
    { name: 'Mathematics', count: 0 },
    { name: 'Miscellaneous & General Notes', count: 0 },
    { name: 'Class 11 Physics (Mechanics & Thermodynamics)', count: undefined },
  ];

  // Specific 3 classes matching the uploaded image exactly
  const todayClasses = [
    {
      id: 'lec-phy-101',
      timeSlot: '09:00 AM - 10:00 AM',
      status: 'Completed',
      title: 'Physics 11',
      instructor: 'Dr. Rajesh Kulkarni',
      room: 'Room 302',
      topics: [
        'Incline Plane Vectors',
        'Normal Force Resolution',
        'Kinetic Friction (μ)',
      ],
      quote:
        '"Derived the net acceleration formula for a block sliding on a ramp with friction. Verified whiteboard free body diagrams."',
      fullNotesId: 'lec-phy-101',
    },
    {
      id: 'lec-mth-201',
      timeSlot: '11:30 AM - 12:30 PM',
      status: 'In Progress',
      title: 'Mathematics 11',
      instructor: 'Prof. Ananya Sen',
      room: 'Room 105',
      topics: [
        'Limits at Infinity',
        "L'Hopital Rule",
        'Continuity proofs',
      ],
      quote:
        '"Discussed indeterminate forms 0/0 and evaluated standard trigonometric limits."',
      fullNotesId: 'lec-mth-201',
    },
    {
      id: 'lec-chm-304',
      timeSlot: '02:00 PM - 03:00 PM',
      status: 'Upcoming',
      title: 'Chemistry 11 (Bonds)',
      instructor: 'Dr. Ramesh Sharma',
      room: 'Lab A',
      topics: [
        'Ionic & Covalent Chemical Bonds',
        'Property Comparison Table (Hardness & Bonds)',
        'Periodic Table D-Block Valence Orbitals',
      ],
      quote:
        '"Chemical Bonds: Electron pair sharing in covalent bonds vs electrostatic attraction in ionic compounds."',
      fullNotesId: 'lec-chm-304',
    },
  ];

  const archiveLectures = [
    {
      id: 'arch-1',
      categoryBadge: 'PHYSICS • MECHANICS',
      badgeColor: 'text-[#ea580c]',
      iconType: 'document',
      date: 'Sep 12',
      title: 'Newtonian Kinetics & Free ...',
      snippet: 'Whiteboard OCR with 4 vector force...',
      duration: '45 mins',
    },
    {
      id: 'arch-2',
      categoryBadge: 'MATH • CALCULUS',
      badgeColor: 'text-[#2563eb]',
      iconType: 'sigma',
      date: 'Sep 11',
      title: 'Epsilon-Delta Definition of ...',
      snippet: 'Step-by-step rigorous proof...',
      duration: '50 mins',
    },
    {
      id: 'arch-3',
      categoryBadge: 'CHEMISTRY • BONDS',
      badgeColor: 'text-[#0d9488]',
      iconType: 'flask',
      date: 'Sep 10',
      title: 'Chemistry - Bonds & Periodic Table',
      snippet: 'Ionic & covalent bonds comparison table, periodic table with Cl, and D-block...',
      duration: '40 mins',
    },
  ];

  const filteredArchiveItems = archiveLectures.filter((item) => {
    if (!archiveSearch.trim()) return true;
    const query = archiveSearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.snippet.toLowerCase().includes(query) ||
      item.categoryBadge.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-7 max-w-[1520px] mx-auto w-full">
      {/* Header & Filter Controls - Matching Image */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col">
            {/* Daily Schedule Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-[#ffedd5] text-[#9a3412] px-2.5 py-0.5 rounded-full">
                DAILY SCHEDULE
              </span>
              <span className="text-xs font-semibold text-[#5a4138]">
                • SUNDAY, SEPTEMBER 13, 2026
              </span>
            </div>

            {/* Title with Calendar icon */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-1.5 flex items-center gap-2">
              <span className="text-2xl">🗓️</span>
              <span>Today's Classes</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Student Attendance Square Indicator */}
            <div className="bg-white rounded-2xl border border-[#eff4ff] p-2.5 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col items-center justify-center text-center">
                <span className="text-[13px] font-black text-[#047857] leading-none">94%</span>
                <span className="text-[8px] font-bold text-[#059669] uppercase tracking-tighter">Attd</span>
              </div>
              <div className="flex flex-col pr-1">
                <span className="text-[11px] font-bold text-[#0b1c30] leading-tight">Current Attendance</span>
                <span className="text-[10px] text-[#059669] font-semibold">48/51 Sessions (Good)</span>
              </div>
            </div>

            {/* Filter Pills: All Classes, My Classes, Completed */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[#e2e8f0]/80 shadow-2xs">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#a33900] text-white shadow-xs'
                    : 'text-[#5a4138] hover:text-[#0b1c30]'
                }`}
              >
                All Classes
              </button>
              <button
                onClick={() => setActiveFilter('my')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'my'
                    ? 'bg-[#a33900] text-white shadow-xs'
                    : 'text-[#5a4138] hover:text-[#0b1c30]'
                }`}
              >
                My Classes
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'completed'
                    ? 'bg-[#a33900] text-white shadow-xs'
                    : 'text-[#5a4138] hover:text-[#0b1c30]'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Class Schedule Cards - Matching Image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {todayClasses
          .filter((item) => {
            if (activeFilter === 'completed') return item.status === 'Completed';
            return true;
          })
          .map((item) => {
            const isCompleted = item.status === 'Completed';
            const isInProgress = item.status === 'In Progress';

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-2.5">
                  {/* Time slot & Status Pill */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#5a4138]">
                      {item.timeSlot}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isCompleted
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : isInProgress
                          ? 'bg-[#ffedd5] text-[#9a3412]'
                          : 'bg-[#e0f2fe] text-[#0369a1]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Subject Title & Instructor */}
                  <div className="mt-1">
                    <h3 className="text-2xl font-black text-[#0b1c30] tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#5a4138] font-medium mt-0.5">
                      {item.instructor} • {item.room}
                    </p>
                  </div>

                  {/* Key Topics List */}
                  <div className="flex flex-col gap-1.5 pt-2">
                    <span className="text-[11px] font-extrabold text-[#5a4138] uppercase tracking-wider">
                      KEY TOPICS:
                    </span>
                    <ul className="space-y-1">
                      {item.topics.map((topic, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-[#0b1c30] flex items-center gap-2 font-medium"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] flex-shrink-0" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quote / Transcript Callout Box */}
                  {item.quote && (
                    <div className="bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff]/40 mt-1">
                      <p className="italic text-xs text-[#5a4138] leading-relaxed">
                        {item.quote}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer: View full notes button & ID */}
                <div className="flex items-center justify-between pt-3 border-t border-[#eff4ff]">
                  <button
                    onClick={() => onOpenNotes(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c2410c] hover:text-[#9a3412] group cursor-pointer"
                  >
                    <span>View Full Notes</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <span className="text-[11px] font-mono text-gray-400">
                    ID: {item.fullNotesId}
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Browse All Lectures & Notes Archive Section - Matching Image */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] flex items-center gap-2">
              <span>📚</span>
              <span>Browse All Lectures & Notes</span>
            </h2>
            <p className="text-xs text-[#5a4138]">
              Access the complete archive of classroom recordings, OCR whiteboard graphs, and study guides
            </p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 bg-[#f8fafc] px-4 py-2.5 rounded-full w-full md:w-80 border border-[#e2e8f0]">
            <Search className="w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              value={archiveSearch}
              onChange={(e) => setArchiveSearch(e.target.value)}
              placeholder="Search topics, formulas, or OCR..."
              className="bg-transparent border-none outline-none text-xs text-[#0b1c30] placeholder:text-[#64748b] w-full font-medium"
            />
          </div>
        </div>

        {/* Category Filter Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = archiveCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setArchiveCategory(cat.name)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#a33900] text-white shadow-xs'
                    : 'bg-white border border-[#e2e8f0] text-[#0b1c30] hover:bg-[#f8fafc]'
                }`}
              >
                <span>{cat.name}</span>
                {cat.count !== undefined && (
                  <span
                    className={`text-[10px] ml-0.5 ${
                      isSelected ? 'text-white/80' : 'text-[#64748b]'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Lecture Archive Items Grid - Matching Image 3-column items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArchiveItems.map((lec) => (
            <div
              key={lec.id}
              onClick={() => onOpenNotes(lec)}
              className="bg-white hover:bg-[#fcfdff] p-4 rounded-2xl border border-[#e2e8f0] flex items-center gap-3.5 transition-all hover:shadow-xs cursor-pointer group"
            >
              {/* Left Icon with color matching subject */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                  lec.iconType === 'document'
                    ? 'bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa]'
                    : lec.iconType === 'sigma'
                    ? 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]'
                    : 'bg-[#f0fdfa] text-[#0d9488] border border-[#99f6e4]'
                }`}
              >
                {lec.iconType === 'document' ? (
                  <FileText className="w-5 h-5 text-[#ea580c]" />
                ) : lec.iconType === 'sigma' ? (
                  <span className="text-base font-bold">Σ</span>
                ) : (
                  <span className="text-base">⚗️</span>
                )}
              </div>

              {/* Text Info */}
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${lec.badgeColor}`}>
                    {lec.categoryBadge}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400">{lec.date}</span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#0b1c30] group-hover:text-[#0051d5] transition-colors truncate mt-0.5">
                  {lec.title}
                </h4>
                <p className="text-[11px] text-[#5a4138] truncate mt-0.5">
                  {lec.snippet}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
