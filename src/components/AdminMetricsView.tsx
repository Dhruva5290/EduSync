import React from 'react';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  Building,
  Server,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

interface AdminMetricsViewProps {
  totalStudents: number;
  totalFaculty: number;
  totalSubjects: number;
  totalSubmissions: number;
  onNavigateToUsers: () => void;
  onNavigateToVault: () => void;
  onNavigateToSecurity: () => void;
}

export const AdminMetricsView: React.FC<AdminMetricsViewProps> = ({
  totalStudents,
  totalFaculty,
  totalSubjects,
  totalSubmissions,
  onNavigateToUsers,
  onNavigateToVault,
  onNavigateToSecurity,
}) => {
  const departments = [
    { name: 'School of Engineering & Applied Sciences', head: 'Dr. Rajesh Kulkarni', students: 38, gpa: 8.85, status: 'Optimal' },
    { name: 'Department of Mathematics & Computing', head: 'Prof. Vikramaditya Roy', students: 32, gpa: 9.12, status: 'Optimal' },
    { name: 'Chemical Sciences & Nanotechnology', head: 'Dr. Ramesh Sharma', students: 28, gpa: 8.74, status: 'Optimal' },
    { name: 'Earth & Environmental Systems', head: 'Dr. Sanmitra Bhattacharya', students: 24, gpa: 8.91, status: 'Optimal' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#0051d5]">
              Office of the Dean & Registrar
            </span>
            <span className="text-xs text-[#5a4138]">Institutional Oversight OS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-1">
            Institutional Performance Dashboard
          </h1>
          <p className="text-sm text-[#5a4138]">
            High-level academic analytics, cohort health, faculty load, and campus-wide compliance telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToSecurity}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#e6f4ea] hover:bg-[#d0eed8] text-[#006947] rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#006947]/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security Rating: Grade A+</span>
          </button>
        </div>
      </div>

      {/* Top Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={onNavigateToUsers}
          className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs hover:border-[#0051d5] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a4138]">Enrolled Students</span>
            <Users className="w-4 h-4 text-[#0051d5]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl lg:text-3xl font-black text-[#0b1c30]">
              {totalStudents} Active
            </span>
          </div>
          <span className="text-[11px] text-[#0051d5] font-semibold mt-1 flex items-center">
            Manage Cohorts <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>

        <div
          onClick={onNavigateToUsers}
          className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs hover:border-[#a33900] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a4138]">Faculty Instructors</span>
            <GraduationCap className="w-4 h-4 text-[#a33900]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl lg:text-3xl font-black text-[#0b1c30]">
              {totalFaculty} Teaching
            </span>
          </div>
          <span className="text-[11px] text-[#a33900] font-semibold mt-1 flex items-center">
            View Profiles <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a4138]">Campus Average GPA</span>
            <Award className="w-4 h-4 text-[#006947]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl lg:text-3xl font-black text-[#0b1c30]">8.92</span>
            <span className="text-xs font-bold text-[#006947] flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Top 5%
            </span>
          </div>
          <span className="text-[11px] text-[#5a4138] mt-1 block">Accredited 10-point scale</span>
        </div>

        <div
          onClick={onNavigateToVault}
          className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs hover:border-[#006947] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a4138]">Data Vault Integrity</span>
            <Server className="w-4 h-4 text-[#006947]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl lg:text-3xl font-black text-[#006947]">100%</span>
            <span className="text-xs font-bold text-[#006947]">Protected</span>
          </div>
          <span className="text-[11px] text-[#006947] font-semibold mt-1 flex items-center">
            Snapshots & Recovery <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <Building className="w-5 h-5 text-[#0051d5]" />
            Academic Department Oversight
          </h3>
          <span className="text-xs text-[#5a4138]">Semester 1 (AY 2026-27)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#eff4ff] text-[#5a4138] font-bold uppercase tracking-wider">
                <th className="pb-3">Department Name</th>
                <th className="pb-3">Department Head</th>
                <th className="pb-3">Active Students</th>
                <th className="pb-3">Mean GPA</th>
                <th className="pb-3">Operational State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {departments.map((d) => (
                <tr key={d.name} className="hover:bg-[#fcfdff] transition-colors">
                  <td className="py-3 font-bold text-[#0b1c30]">{d.name}</td>
                  <td className="py-3 text-[#5a4138]">{d.head}</td>
                  <td className="py-3 font-bold text-[#0051d5]">{d.students} students</td>
                  <td className="py-3 font-mono font-bold text-[#0b1c30]">{d.gpa}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f4ea] text-[#006947]">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
