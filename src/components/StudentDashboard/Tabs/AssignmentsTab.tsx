import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Play,
  Sparkles,
  ArrowRight,
  Upload,
  ScanLine,
  Gavel,
  ExternalLink
} from 'lucide-react';

export const AssignmentsTab: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  return (
    <div className="flex flex-col w-full px-6 lg:px-8 py-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Metadata Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
          <span>ClassSarthi</span>
          <span>&gt;</span>
          <span className="text-[#0b1c30]">Assignments</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[#0b1c30] font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#006947]"></span>
            Fall 2024 Academic Term
          </span>
          <span className="hidden sm:inline-block">•</span>
          <span className="hidden sm:inline-block">Sync status: Synced 3m ago</span>
        </div>
      </div>

      {/* Header Section with Title & Controls */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4 border border-slate-100">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#c2410c] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30]">Assignments & Problem Sets</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
              Submit coursework, review faculty rubrics, and track automated grading diagnostics with real-time sync across enrolled courses.
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-full p-1 shadow-inner text-xs font-bold">
              {(['all', 'pending', 'submitted', 'graded'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    filter === tab
                      ? 'bg-[#c2410c] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  type="button"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'all' ? 5 : tab === 'pending' ? 3 : 1})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Spotlight Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-50/80 via-slate-50 to-white p-6 sm:p-8 rounded-3xl shadow-sm border border-orange-200/60">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#c2410c]/10 blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#c2410c] text-white font-bold text-[10px] uppercase tracking-wider shadow-2xs">
                <Clock className="w-3 h-3" />
                Due in 2 Days • Urgent
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-blue-50 text-[#0051d5] font-bold text-xs">
                Physics 11 (Mechanics) • Dr. Rajesh Kulkarni
              </span>
              <span className="text-xs font-semibold text-slate-500">100 pts • 3 Rubric Criteria</span>
            </div>
            <h2 className="text-xl font-bold text-[#0b1c30] tracking-tight">
              HC Verma Ch 5: Problems 4–9 on Connected Pulleys & Inclined Planes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Analyze free body diagrams for objects on 30° ramp with kinetic friction μk = 0.25. Derive equations of motion in LaTeX and attach free body sketch or notebook OCR scan.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-[#0b1c30]">
                <CheckCircle2 className="w-4 h-4 text-[#006947]" />
                <span>VisionNote OCR Ingestion Ready</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 min-w-[220px]">
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#c2410c] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer">
              <span>Submit Solution</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#0b1c30] font-bold text-xs transition-all shadow-2xs border border-slate-200 cursor-pointer">
              <Play className="w-4 h-4 text-[#0051d5] fill-[#0051d5]" />
              <span>Lecture Clip (21:05)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid: 8 cols Assignments / 4 cols Performance & Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Assignment Feed (8 Cols) */}
        <div className="xl:col-span-8 space-y-4">
          {/* Card 1: CS 101 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-red-50 text-rose-700 font-bold text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                    Due Today at 11:59 PM
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Computer Science (CS-101) • 100 pts</span>
                </div>
                <h3 className="text-base font-bold text-[#0b1c30]">
                  Problem Set 1: Pointer Arithmetic & Memory Alignment
                </h3>
                <p className="text-xs text-slate-600">
                  Implement custom slab allocator in C. Verify 8-byte boundaries and zero memory leak traces via Valgrind test fixtures.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs font-bold text-rose-600">Critical Deadline</span>
                <p className="text-[10px] text-slate-400">Late penalty: 10%/hr</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100">
              <span className="text-xs text-slate-600 font-medium">
                <strong>Rubric:</strong> Theoretical Rigor (50 pts), Implementation & Test Coverage (50 pts)
              </span>
              <button className="px-4 py-2 rounded-full bg-[#c2410c] text-white hover:bg-[#ea580c] font-bold text-xs transition-colors shadow-2xs flex items-center gap-1 cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload & Submit</span>
              </button>
            </div>
          </div>

          {/* Card 2: Chemistry 11 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                  Due Tuesday, Sep 15
                </span>
                <span className="text-xs font-semibold text-slate-500">Chemistry 11 • Dr. Ananya Sen • 50 pts</span>
              </div>
              <h3 className="text-base font-bold text-[#0b1c30]">
                Molecular Geometries & Hybridization Worksheet (PCl₅, SF₆)
              </h3>
              <p className="text-xs text-slate-600">
                Construct molecular orbital diagrams for hypervalent phosphorus and sulfur compounds. Detail steric numbers and bond angle deviations under lone pair repulsions.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100">
              <span className="text-xs text-slate-600 font-medium">
                <strong>Rubric:</strong> Orbital Overlap Accuracy (25 pts), Geometry Diagram (25 pts)
              </span>
              <button className="px-4 py-2 rounded-full bg-[#0051d5] text-white hover:bg-blue-700 font-bold text-xs transition-colors shadow-2xs flex items-center gap-1 cursor-pointer shrink-0">
                <span>Submit Solution</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostics, Rubrics & Quick OCR Ingest (4 Cols) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Submission Performance Widget */}
          <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0b1c30]">Submission Diagnostics</h3>
              <span className="text-xs text-slate-400 font-semibold">Semester Avg</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
                <span className="text-2xl font-extrabold text-[#c2410c]">85%</span>
                <span className="text-xs text-slate-500 font-medium">On-Time Rate</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
                <span className="text-2xl font-extrabold text-[#006947]">91.4%</span>
                <span className="text-xs text-slate-500 font-medium">Average Grade</span>
              </div>
            </div>
          </div>

          {/* Standard Faculty Rubric Quick Reference */}
          <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
                <Gavel className="w-4 h-4 text-[#0051d5]" />
                <span>Standard Rubric Reference</span>
              </h3>
            </div>
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span>1. Theoretical Rigor</span>
                  <span className="text-[#c2410c]">40%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Underlying validity, edge-case coverage.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span>2. Mathematical Formulation</span>
                  <span className="text-[#0051d5]">40%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Clean notation formatting & LaTeX proofs.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span>3. Units & Diagram Accuracy</span>
                  <span className="text-[#006947]">20%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">SI dimensional consistency & vector arrows.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
