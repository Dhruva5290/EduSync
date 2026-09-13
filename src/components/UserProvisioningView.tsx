import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  UploadCloud,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit,
  GraduationCap,
  Shield,
  BookOpen,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserProvisioningViewProps {
  users: User[];
  onAddUser: (user: Partial<User>) => void;
  onBulkImport: (csvText: string) => void;
  onDeleteUser?: (id: string) => void;
}

export const UserProvisioningView: React.FC<UserProvisioningViewProps> = ({
  users,
  onAddUser,
  onBulkImport,
  onDeleteUser,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showCsvModal, setShowCsvModal] = useState<boolean>(false);

  // Form states for single user
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newDept, setNewDept] = useState<string>('Applied Sciences');
  const [newProgram, setNewProgram] = useState<string>('B.Tech Track');
  const [newInstId, setNewInstId] = useState<string>('');

  // Bulk CSV state
  const [csvText, setCsvText] = useState<string>(
    `Name,Email,InstitutionalID\nRohan Gupta,rohan.gupta@bmu.edu.in,BMU-2026-7088\nAnanya Sen,ananya.sen@bmu.edu.in,BMU-2026-7090\nKavya Reddy,kavya.reddy@bmu.edu.in,BMU-2026-7092`
  );

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch =
      searchQuery === '' ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.institutionalId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      name: newName,
      email: newEmail,
      role: newRole,
      department: newDept,
      program: newProgram,
      institutionalId: newInstId || `EDU-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBulkImport(csvText);
    setShowCsvModal(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#0051d5]">
              Campus Identity & Access
            </span>
            <span className="text-xs text-[#5a4138]">RBAC Multi-Role Directory</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-1">
            User Provisioning & Cohorts
          </h1>
          <p className="text-sm text-[#5a4138]">
            Manage student enrollments, faculty profiles, and institutional administrators with bulk CSV import.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCsvModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-[#f8f9ff] text-[#0b1c30] border border-[#e2e8f0] rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            <UploadCloud className="w-4 h-4 text-[#0051d5]" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#a33900] hover:bg-[#822d00] text-white rounded-xl text-xs font-bold shadow-[0_2px_8px_rgba(163,57,0,0.25)] cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Individual</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-[#5a4138]" />
          <input
            type="text"
            placeholder="Search by name, institutional ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold text-[#0b1c30] bg-transparent outline-none placeholder:text-[#5a4138]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#5a4138]">
          <Filter className="w-4 h-4" />
          <span>Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#0b1c30] outline-none"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="student">Students</option>
            <option value="teacher">Faculty Instructors</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfdff] border-b border-[#eff4ff] text-[#5a4138] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">User / Identity</th>
                <th className="py-3.5 px-6">Institutional ID</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Department & Program</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-2xs ${
                          u.role === 'admin'
                            ? 'bg-[#0051d5]'
                            : u.role === 'teacher'
                            ? 'bg-[#a33900]'
                            : 'bg-[#006947]'
                        }`}
                      >
                        {u.avatarInitials}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#0b1c30] block">
                          {u.name}
                        </span>
                        <span className="text-[#5a4138] text-[11px]">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-mono font-bold text-[#0b1c30]">
                    {u.institutionalId}
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-[#eff4ff] text-[#0051d5]'
                          : u.role === 'teacher'
                          ? 'bg-[#fff3ea] text-[#a33900]'
                          : 'bg-[#e6f4ea] text-[#006947]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="font-semibold text-[#0b1c30] block">{u.department}</span>
                    <span className="text-[11px] text-[#5a4138]">{u.program}</span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => onDeleteUser && onDeleteUser(u.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="De-provision user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#0b1c30]">Provision New Campus User</h3>
            <form onSubmit={handleCreateSingle} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#5a4138]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siddharth Verma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-semibold text-[#0b1c30] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5a4138]">Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="siddharth.verma@bmu.edu.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-semibold text-[#0b1c30] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5a4138]">System Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full mt-1 p-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-bold text-[#0b1c30] outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Faculty Teacher</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#5a4138]">Roll / Employee ID</label>
                  <input
                    type="text"
                    placeholder="BMU-2026-7099"
                    value={newInstId}
                    onChange={(e) => setNewInstId(e.target.value)}
                    className="w-full mt-1 p-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-semibold text-[#0b1c30] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5a4138]">Department</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-semibold text-[#0b1c30] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5a4138] cursor-pointer hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#a33900] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#822d00]"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#0b1c30]">Bulk CSV Cohort Import</h3>
            <p className="text-xs text-[#5a4138]">
              Paste comma-separated rows with format: <code>Name,Email,InstitutionalID</code>.
            </p>

            <form onSubmit={handleBulkSubmit} className="space-y-3">
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full p-3 font-mono text-xs text-[#0b1c30] bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-[#0051d5]/30 leading-relaxed"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5a4138] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0051d5] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#0041ab]"
                >
                  Execute Batch Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
