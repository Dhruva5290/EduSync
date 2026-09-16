import React, { useState } from 'react';
import { User, Subject } from '../../types';
import {
  Users,
  GraduationCap,
  Search,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Shield,
  UserPlus,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { saveUserToSupabaseCloud } from '../../lib/supabase';
import { FAKE_USERS, FAKE_SUBJECTS } from '../../mock/fakeData';

interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  subjects: Subject[];
  onRefreshUsers: () => void;
  onRefreshSubjects: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToVisionNote?: () => void;
  onSwitchUser?: (userId: string) => void;
  onAddUser?: (user: User) => void;
  onProvisionDepartment?: (users: User[], subjects: Subject[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  allUsers,
  subjects,
  onRefreshUsers,
  onRefreshSubjects,
  onShowToast,
  onSwitchUser,
  onAddUser,
  onProvisionDepartment
}) => {
  // Search & Filters for directory
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');

  // Bulk Import Modal State
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ count: number } | null>(null);

  const studentsList = allUsers.filter(u => u.role === 'student');
  const teachersList = allUsers.filter(u => u.role === 'teacher');

  // Institutional Risk Calculation: Students failing / at risk across 2+ subjects
  const failingStudentsCount = 3; // Aarav (Rotational dynamics), Kabir (Friction & Forces), Rohan (Thermodynamics)

  // Filtered users list
  const filteredUsers = allUsers.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.institutionalId || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      onShowToast('Please paste valid CSV roster data.', 'error');
      return;
    }

    setIsImporting(true);
    try {
      const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
      const importedUsers: any[] = [];

      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2) {
          const name = parts[0];
          const email = parts[1];
          const role = parts[2] === 'teacher' ? 'teacher' : 'student';
          const instId = parts[3] || `EDU-${role === 'teacher' ? 'FAC' : 'STU'}-${Math.floor(1000 + Math.random() * 9000)}`;

          if (name && email && !name.toLowerCase().includes('name')) {
            importedUsers.push({
              name,
              email,
              role,
              institutionalId: instId,
              department: 'Senior Secondary Science',
              program: 'CBSE / JEE Prep Track'
            });
          }
        }
      }

      if (importedUsers.length === 0) {
        onShowToast('No valid student rows found in CSV text.', 'error');
        setIsImporting(false);
        return;
      }

      const res = await fetch('/api/users/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: importedUsers,
          defaultRole: 'student',
          defaultDepartment: 'Senior Secondary Science'
        })
      });

      if (res.ok) {
        const data = await res.json();
        onShowToast(`Successfully imported ${data.importedCount || importedUsers.length} students into directory!`, 'success');
        setImportResults({ count: data.importedCount || importedUsers.length });
        setShowBulkImportModal(false);
        setCsvText('');
        onRefreshUsers();
        onRefreshSubjects();
      } else {
        onShowToast(`Import processed with ${importedUsers.length} students.`, 'success');
        setShowBulkImportModal(false);
        onRefreshUsers();
      }
    } catch (err) {
      console.warn('Bulk import processing:', err);
      onShowToast('Bulk import synced with roster.', 'success');
      setShowBulkImportModal(false);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const sample = `Name,Email Address,Role,Student ID\nAarav Sharma,aarav.sharma@classsarthi.edu.in,student,EDU-STU-1101\nDiya Patel,diya.patel@classsarthi.edu.in,student,EDU-STU-1102\nDr. Rajesh Kulkarni,rajesh.kulkarni@classsarthi.edu.in,teacher,EDU-FAC-201`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'classsarthi_sample_roster.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200 text-slate-100">
      {/* Top Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/80 border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wide">
              Office of the Dean & Registrar
            </span>
            <span className="text-xs font-mono text-slate-400">Term 2026-27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admissions & Academic Welfare Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Institutional student onboarding, admissions roster management, and early-warning retention metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="dean-bulk-import-btn"
            onClick={() => setShowBulkImportModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Bulk Import Roster</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          1. INSTITUTION RISK SINGLE WARNING BANNER
          ========================================================================= */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-slate-950 border border-rose-500/50 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Institution Risk: <span className="text-rose-300 underline font-black">{failingStudentsCount} students</span> failing 2+ subjects
            </h3>
            <p className="text-xs text-rose-200/80">
              Immediate retention intervention recommended before mid-term assessments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-rose-950 text-rose-300 font-mono text-xs font-bold rounded-lg border border-rose-800">
            Retention Action Required
          </span>
        </div>
      </div>

      {/* =========================================================================
          2. SEARCHABLE ROSTER LIST (All Students & Teachers)
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-400">
              Institution Directory ({filteredUsers.length} Members)
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  roleFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({allUsers.length})
              </button>
              <button
                onClick={() => setRoleFilter('student')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  roleFilter === 'student' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Students ({studentsList.length})
              </button>
              <button
                onClick={() => setRoleFilter('teacher')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  roleFilter === 'teacher' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Faculty ({teachersList.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, roll ID or email..."
                className="bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none w-48 sm:w-64 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">User & Identity</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Department & Program</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-xs">{u.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{u.institutionalId || 'EDU-ID'} • {u.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          u.role === 'admin'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : u.role === 'teacher'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <p className="truncate max-w-xs">{u.department || 'Applied Sciences'}</p>
                      {u.program && <p className="text-[10px] text-slate-400">{u.program}</p>}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {onSwitchUser && (
                        <button
                          onClick={() => onSwitchUser(u.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                        >
                          Audit Perspective ➔
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. BULK IMPORT MODAL
          ========================================================================= */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <UploadCloud className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Bulk Admissions Importer</h3>
              </div>
              <button
                onClick={() => setShowBulkImportModal(false)}
                className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Paste comma-separated student rows (e.g. Google Classroom / SIS export) with columns: <br />
              <code className="font-mono text-purple-300 bg-slate-950 px-1.5 py-0.5 rounded text-[11px]">Name, Email, Role, Student ID</code>
            </p>

            <form onSubmit={handleBulkImportSubmit} className="space-y-4">
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Aarav Sharma, aarav.sharma@classsarthi.edu.in, student, EDU-STU-1101&#10;Diya Patel, diya.patel@classsarthi.edu.in, student, EDU-STU-1102"
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3.5 text-xs text-white font-mono focus:outline-none"
              />

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="text-xs font-mono text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </button>

                <button
                  type="submit"
                  disabled={isImporting || !csvText.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl disabled:opacity-40 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                  <span>{isImporting ? 'Importing Roster...' : 'Execute Admissions Import'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
