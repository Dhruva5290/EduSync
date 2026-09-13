import React from 'react';
import {
  Settings,
  User,
  Shield,
  Check,
  Smartphone,
  Lock,
  Calendar,
  Award,
  GraduationCap,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface SettingsViewProps {
  student: StudentProfile;
  onUpdateStudent?: (updated: Partial<StudentProfile>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  student,
}) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1000px] mx-auto w-full">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#a33900] flex items-center justify-center flex-shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">
              Account & Profile Details
            </h1>
            <p className="text-xs text-[#5a4138]">
              Official university enrolled credentials and student system preferences
            </p>
          </div>
        </div>

        {/* Attendance Small Square Indicator in Settings */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-3 rounded-2xl flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-[#86efac] flex flex-col items-center justify-center text-center shadow-2xs">
            <span className="text-sm font-black text-[#15803d] leading-none">94%</span>
            <span className="text-[8px] font-bold text-[#16a34a] uppercase">Attend</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#14532d]">Current Attendance</span>
            <span className="text-[11px] text-[#15803d]">48 of 51 Sessions Logged</span>
          </div>
        </div>
      </div>

      {/* Official Identity Card (Read-Only) */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-6">
        {/* Institutional notice banner */}
        <div className="bg-[#eff4ff] border border-[#dce9ff] p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#0051d5]">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span className="font-bold">
              Institutional Profile — Read Only
            </span>
          </div>
          <span className="text-[11px] text-[#5a4138]">
            Name and credentials are authenticated via the university registrar
          </span>
        </div>

        {/* Profile Avatar & Primary Display */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#a33900] text-white flex items-center justify-center font-black text-2xl shadow-sm">
            {student.avatarInitials}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl text-[#0b1c30]">
              {student.name}
            </span>
            <span className="text-xs text-[#5a4138]">{student.email}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono font-bold bg-[#eff4ff] text-[#0051d5] px-2 py-0.5 rounded-full border border-[#dce9ff]">
                ID: BMU-2026-PHY-042
              </span>
              <span className="text-[10px] font-bold bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded-full">
                Active Enrolled Student
              </span>
            </div>
          </div>
        </div>

        {/* Read-Only Info Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* Full Name Display */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
              Student Legal Name
            </span>
            <span className="text-sm font-black text-[#0b1c30]">
              {student.name}
            </span>
            <span className="text-[10px] text-[#94a3b8]">Verified identity</span>
          </div>

          {/* Institutional Email Display */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
              Institutional Email
            </span>
            <span className="text-sm font-bold text-[#0b1c30] truncate">
              {student.email}
            </span>
            <span className="text-[10px] text-[#94a3b8]">Google Workspace domain</span>
          </div>

          {/* Academic Cohort */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
              Academic Cohort
            </span>
            <span className="text-sm font-bold text-[#0b1c30]">
              {student.grade}
            </span>
            <span className="text-[10px] text-[#94a3b8]">Class 11 Science (Section B)</span>
          </div>

          {/* Roll Number */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
              Roll / Registration Number
            </span>
            <span className="text-sm font-mono font-bold text-[#0b1c30]">
              PHY-2026-042
            </span>
            <span className="text-[10px] text-[#94a3b8]">Academic Year 2026–2027</span>
          </div>

          {/* Department */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
              Academic Department
            </span>
            <span className="text-sm font-bold text-[#0b1c30]">
              Physics & Applied Sciences
            </span>
            <span className="text-[10px] text-[#94a3b8]">Faculty Mentor: Dr. Rajesh Kulkarni</span>
          </div>

          {/* Student Status */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
              Academic Standing
            </span>
            <span className="text-sm font-bold text-[#15803d] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#15803d]" />
              Honor Roll (GPA: 3.92)
            </span>
            <span className="text-[10px] text-[#94a3b8]">Full tuition scholarship</span>
          </div>
        </div>

        {/* Tutoring & System Preferences (Read-Only reference) */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#eff4ff]">
          <h3 className="font-extrabold text-sm text-[#0b1c30]">
            Configured Tutoring & AI Preferences
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                title: 'Socratic Method',
                desc: 'Deep guided questions to build fundamental concepts',
                active: true,
              },
              {
                title: 'Step-by-Step Derivation',
                desc: 'Detailed mathematical calculus & vector steps',
                active: false,
              },
              {
                title: 'First Principles',
                desc: 'Axiomatic physics derivations from ground truth',
                active: false,
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex flex-col gap-1 transition-all ${
                  p.active
                    ? 'bg-[#eff4ff] border-[#0051d5]/40 shadow-xs'
                    : 'bg-[#f8fafc] border-[#e2e8f0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0b1c30]">{p.title}</span>
                  {p.active && (
                    <span className="w-2 h-2 rounded-full bg-[#0051d5]" />
                  )}
                </div>
                <span className="text-[11px] text-[#5a4138]">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
