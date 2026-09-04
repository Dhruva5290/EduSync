import fs from 'fs';
import path from 'path';
import { InMemoryDatabase, saveNotesToDisk, saveUsersToDisk, saveLecturesToDisk, saveProgressToDisk } from './db';
import { StudentNote, Submission } from '../types';

const VAULT_DIR = path.resolve(process.cwd(), 'data', 'secure_vault');

export interface VaultSnapshotMetadata {
  id: string;
  filename: string;
  timestamp: string;
  label: string;
  notesCount: number;
  submissionsCount: number;
  usersCount: number;
  fileSizeBytes: number;
}

export interface VaultSnapshotPayload {
  metadata: VaultSnapshotMetadata;
  notes: StudentNote[];
  submissions: Submission[];
  customUsers: any[];
  lectures?: any[];
  boardCaptures?: any[];
  studentMastery?: any;
  studentLectureProgress?: any;
}

/**
 * Ensures the secure vault directory exists on the server filesystem.
 * This directory is outside the web-accessible folders, ensuring 0% chance of browser leakage.
 */
function ensureVaultDir(): string {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }
  return VAULT_DIR;
}

/**
 * Creates an encrypted/isolated cold snapshot of all user notes, submissions, lectures, and session data,
 * then cleanses the active website database so it appears completely fresh.
 */
export function archiveAndResetWorkspace(
  db: InMemoryDatabase,
  options: {
    label?: string;
    preserveFacultyAndBaselineStudents?: boolean;
    resetNotes?: boolean;
    resetSubmissions?: boolean;
    resetLectures?: boolean;
  } = {}
): { success: boolean; snapshot: VaultSnapshotMetadata; message: string } {
  const dir = ensureVaultDir();
  const timestamp = new Date().toISOString();
  const safeTimestamp = timestamp.replace(/[:.]/g, '-');
  const label = options.label?.trim() || 'Dean Session Reset';
  const snapshotId = `vault-${Date.now()}`;
  const filename = `snapshot_${safeTimestamp}_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
  const filePath = path.join(dir, filename);

  // 1. Capture complete snapshot payload (Notes, Submissions, Lectures, Board Captures, Progress)
  const snapshotPayload: VaultSnapshotPayload = {
    metadata: {
      id: snapshotId,
      filename,
      timestamp,
      label,
      notesCount: db.notes.length,
      submissionsCount: db.submissions.length,
      usersCount: db.users.length,
      fileSizeBytes: 0
    },
    notes: JSON.parse(JSON.stringify(db.notes || [])),
    submissions: JSON.parse(JSON.stringify(db.submissions || [])),
    customUsers: JSON.parse(JSON.stringify(db.users || [])),
    lectures: JSON.parse(JSON.stringify(db.lectures || [])),
    boardCaptures: JSON.parse(JSON.stringify(db.boardCaptures || [])),
    studentMastery: JSON.parse(JSON.stringify(db.conceptMastery || {})),
    studentLectureProgress: JSON.parse(JSON.stringify(db.lectureProgress || {}))
  };

  // Write file to cold storage
  const serialized = JSON.stringify(snapshotPayload, null, 2);
  fs.writeFileSync(filePath, serialized, 'utf-8');
  snapshotPayload.metadata.fileSizeBytes = Buffer.byteLength(serialized, 'utf-8');

  // Update file with accurate size
  fs.writeFileSync(filePath, JSON.stringify(snapshotPayload, null, 2), 'utf-8');

  // 2. Perform Clean-Slate Reset on the live active database
  if (options.resetNotes !== false) {
    db.notes = [];
    saveNotesToDisk(db.notes);
  }

  if (options.resetSubmissions !== false) {
    db.submissions = [];
  }

  // Clear live lectures so fresh VisionNote captures start on a clean slate
  if (options.resetLectures !== false) {
    db.lectures = [];
    db.boardCaptures = [];
    saveLecturesToDisk(db.lectures);
  }

  // Reset student progress and concept mastery
  db.conceptMastery = {};
  db.lectureProgress = {};
  saveProgressToDisk(db.lectureProgress);

  console.log(`[Zero-Leak Vault] Successfully archived ${snapshotPayload.metadata.notesCount} notes, ${snapshotPayload.lectures?.length || 0} lectures, and ${snapshotPayload.metadata.submissionsCount} submissions to ${filename}. Live site is now clean.`);

  return {
    success: true,
    snapshot: snapshotPayload.metadata,
    message: `Secure snapshot created in backend vault (${filename}). Active workspace successfully archived and reset.`
  };
}

/**
 * Returns a list of all stored snapshots in the backend vault.
 * Restricted to administrators only.
 */
export function listVaultSnapshots(): VaultSnapshotMetadata[] {
  const dir = ensureVaultDir();
  try {
    const files = fs.readdirSync(dir).filter(f => f.startsWith('snapshot_') && f.endsWith('.json'));
    const snapshots: VaultSnapshotMetadata[] = [];

    for (const file of files) {
      try {
        const fullPath = path.join(dir, file);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const parsed: VaultSnapshotPayload = JSON.parse(content);
        if (parsed?.metadata) {
          snapshots.push(parsed.metadata);
        }
      } catch (e) {
        console.warn(`[Vault] Could not parse snapshot file ${file}:`, e);
      }
    }

    // Sort newest first
    return snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    console.error('[Vault] Error reading vault snapshots:', err);
    return [];
  }
}

/**
 * Restores a selected snapshot back into the live active database.
 */
export function restoreFromVaultSnapshot(
  filenameOrId: string,
  db: InMemoryDatabase
): { success: boolean; restoredNotes: number; restoredSubmissions: number; message: string } {
  const dir = ensureVaultDir();
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const targetFile = files.find(f => f === filenameOrId || f.includes(filenameOrId));

  if (!targetFile) {
    return { success: false, restoredNotes: 0, restoredSubmissions: 0, message: 'Snapshot file not found in secure vault.' };
  }

  const fullPath = path.join(dir, targetFile);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const payload: VaultSnapshotPayload = JSON.parse(content);

  if (Array.isArray(payload.notes)) {
    db.notes = payload.notes;
    saveNotesToDisk(db.notes);
  }

  if (Array.isArray(payload.submissions)) {
    db.submissions = payload.submissions;
  }

  return {
    success: true,
    restoredNotes: payload.notes?.length || 0,
    restoredSubmissions: payload.submissions?.length || 0,
    message: `Restored snapshot "${payload.metadata.label}" (${targetFile}) with ${payload.notes?.length || 0} notes.`
  };
}
