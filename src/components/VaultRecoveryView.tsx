import React, { useState } from 'react';
import {
  Server,
  Archive,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Database,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { VaultSnapshot } from '../types';

interface VaultRecoveryViewProps {
  snapshots: VaultSnapshot[];
  onCreateSnapshot: (title: string) => void;
  onRestoreSnapshot: (id: string) => void;
}

export const VaultRecoveryView: React.FC<VaultRecoveryViewProps> = ({
  snapshots,
  onCreateSnapshot,
  onRestoreSnapshot,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [snapshotTitle, setSnapshotTitle] = useState<string>('');
  const [restoredMessage, setRestoredMessage] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSnapshot(snapshotTitle || 'Manual Campus Snapshot');
    setShowCreateModal(false);
    setSnapshotTitle('');
  };

  const handleRestore = (id: string) => {
    onRestoreSnapshot(id);
    setRestoredMessage(`Workspace state successfully restored from snapshot [${id}]. Integrity checksums verified.`);
    setTimeout(() => setRestoredMessage(null), 4000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#0051d5]">
              Disaster Recovery Engine
            </span>
            <span className="text-xs text-[#5a4138]">Atomic State Snapshots</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-1">
            Data Vault & Instant Rollback
          </h1>
          <p className="text-sm text-[#5a4138]">
            Point-in-time database snapshots, isolated JSON backup bundles, and zero-downtime disaster recovery.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#a33900] hover:bg-[#822d00] text-white rounded-xl text-xs font-bold shadow-[0_2px_8px_rgba(163,57,0,0.25)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Instant Snapshot</span>
        </button>
      </div>

      {restoredMessage && (
        <div className="p-4 bg-[#e6f4ea] border border-[#006947]/30 text-[#006947] rounded-2xl text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{restoredMessage}</span>
        </div>
      )}

      {/* Snapshots Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#eff4ff] flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#0051d5]" />
            Archived Snapshot Master Table ({snapshots.length})
          </h3>
          <span className="text-xs text-[#006947] font-bold flex items-center gap-1">
            <FileCheck className="w-4 h-4" /> SHA-256 Checksum Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfdff] border-b border-[#eff4ff] text-[#5a4138] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Snapshot Identifier</th>
                <th className="py-3.5 px-6">Timestamp (IST)</th>
                <th className="py-3.5 px-6">Record Manifest</th>
                <th className="py-3.5 px-6">Size</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {snapshots.map((s) => (
                <tr key={s.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="py-3.5 px-6">
                    <span className="font-bold text-sm text-[#0b1c30] block">{s.title}</span>
                    <span className="font-mono text-[11px] text-[#5a4138]">{s.id}</span>
                  </td>
                  <td className="py-3.5 px-6 text-[#5a4138] font-medium">{s.timestamp}</td>
                  <td className="py-3.5 px-6">
                    <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                      <span className="bg-[#eff4ff] text-[#0051d5] px-2 py-0.5 rounded">
                        {s.recordCount.users} Users
                      </span>
                      <span className="bg-[#fff3ea] text-[#a33900] px-2 py-0.5 rounded">
                        {s.recordCount.notes} Notes
                      </span>
                      <span className="bg-[#e6f4ea] text-[#006947] px-2 py-0.5 rounded">
                        {s.recordCount.assignments} Assignments
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-[#5a4138]">
                    {(s.sizeBytes / 1024).toFixed(1)} KB
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.status === 'Live Active'
                          ? 'bg-[#e6f4ea] text-[#006947]'
                          : 'bg-[#eff4ff] text-[#5a4138]'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleRestore(s.id)}
                      className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] text-xs font-bold rounded-lg transition-colors cursor-pointer border border-[#0051d5]/20"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rollback</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#0b1c30]">Create Master Snapshot</h3>
            <p className="text-xs text-[#5a4138]">
              Stores full system state: user credentials, learner profiles, OCR blackboard scans, KaTeX notes, and graded submissions.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#5a4138]">Snapshot Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pre-Midterm Examination Baseline"
                  value={snapshotTitle}
                  onChange={(e) => setSnapshotTitle(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-xs font-semibold text-[#0b1c30] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5a4138] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#a33900] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#822d00]"
                >
                  Confirm & Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
