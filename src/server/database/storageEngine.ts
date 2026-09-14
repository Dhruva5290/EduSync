import fs from 'fs';
import path from 'path';
import { CollectionName, DbAuditLogEntry } from './types';

const DB_DIR = path.resolve(process.cwd(), 'data', 'database');
const AUDIT_LOG_PATH = path.join(DB_DIR, 'audit_log.jsonl');

/**
 * Ensures the physical database directory exists on disk.
 */
export function ensureDatabaseDir(): string {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  return DB_DIR;
}

/**
 * Appends an audit log entry for database observability.
 */
export function appendAuditLog(entry: Omit<DbAuditLogEntry, 'id' | 'timestamp'>): void {
  try {
    ensureDatabaseDir();
    const logItem: DbAuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    fs.appendFileSync(AUDIT_LOG_PATH, JSON.stringify(logItem) + '\n', 'utf-8');
  } catch (err) {
    console.error('[EduSync DB Audit] Failed to record audit log:', err);
  }
}

/**
 * Generic persistent JSON collection with atomic transactional writes.
 */
export class JsonCollection<T extends { id?: string }> {
  private items: T[] = [];
  private filePath: string;
  private isLoaded = false;

  constructor(
    public readonly name: CollectionName,
    private initialSeed: T[] = []
  ) {
    this.filePath = path.join(ensureDatabaseDir(), `${name}.json`);
    this.load();
  }

  /**
   * Loads records from disk or seeds on first boot.
   */
  public load(): void {
    ensureDatabaseDir();
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.items = parsed;
          this.isLoaded = true;
          return;
        }
      }
    } catch (err) {
      console.warn(`[EduSync DB] Failed to read ${this.name}.json, initializing with default seed:`, err);
    }

    // Seed file if missing or corrupt
    this.items = [...this.initialSeed];
    this.flushToDisk();
    appendAuditLog({
      action: 'INIT',
      collection: this.name,
      details: { seededRows: this.items.length }
    });
    this.isLoaded = true;
  }

  /**
   * Atomically flushes the in-memory array to disk using write-then-rename.
   */
  public flushToDisk(): void {
    ensureDatabaseDir();
    const tmpPath = `${this.filePath}.tmp.${Date.now()}`;
    try {
      fs.writeFileSync(tmpPath, JSON.stringify(this.items, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.filePath);
    } catch (err) {
      console.error(`[EduSync DB] Fatal error writing ${this.name}.json:`, err);
      if (fs.existsSync(tmpPath)) {
        try { fs.unlinkSync(tmpPath); } catch {}
      }
    }
  }

  /**
   * Returns a cloned copy of all items, optionally filtered.
   */
  public getAll(filter?: (item: T) => boolean): T[] {
    if (!this.isLoaded) this.load();
    const list = filter ? this.items.filter(filter) : this.items;
    return JSON.parse(JSON.stringify(list));
  }

  /**
   * Finds a single item by id or natural key (studentId, teacherId).
   */
  public getById(id: string): T | null {
    if (!this.isLoaded) this.load();
    const found = this.items.find(
      item => item.id === id || (item as any).studentId === id || (item as any).teacherId === id
    );
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  /**
   * Inserts an item, assigns an ID if missing, and flushes to disk.
   */
  public insert(item: T, actor = 'system'): T {
    if (!this.isLoaded) this.load();

    const now = new Date().toISOString();
    const recordId = item.id || (item as any).studentId || (item as any).teacherId || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const record: any = {
      ...item,
      id: recordId,
      createdAt: (item as any).createdAt || now,
      updatedAt: now
    };

    this.items.push(record);
    this.flushToDisk();

    appendAuditLog({
      action: 'INSERT',
      collection: this.name,
      recordId: record.id,
      actor,
      details: { id: record.id }
    });

    return JSON.parse(JSON.stringify(record));
  }

  /**
   * Updates an item by ID or natural key.
   */
  public update(id: string, updates: Partial<T>, actor = 'system'): T | null {
    if (!this.isLoaded) this.load();

    const idx = this.items.findIndex(
      item => item.id === id || (item as any).studentId === id || (item as any).teacherId === id
    );
    if (idx === -1) return null;

    const existing = this.items[idx];
    const actualId = existing.id || id;
    const updated: any = {
      ...existing,
      ...updates,
      id: actualId, // Preserve immutable ID
      updatedAt: new Date().toISOString()
    };

    this.items[idx] = updated;
    this.flushToDisk();

    appendAuditLog({
      action: 'UPDATE',
      collection: this.name,
      recordId: actualId,
      actor,
      details: { updatedFields: Object.keys(updates) }
    });

    return JSON.parse(JSON.stringify(updated));
  }

  /**
   * Deletes an item by ID or natural key.
   */
  public delete(id: string, actor = 'system'): boolean {
    if (!this.isLoaded) this.load();

    const initialLen = this.items.length;
    this.items = this.items.filter(
      item => item.id !== id && (item as any).studentId !== id && (item as any).teacherId !== id
    );

    if (this.items.length !== initialLen) {
      this.flushToDisk();
      appendAuditLog({
        action: 'DELETE',
        collection: this.name,
        recordId: id,
        actor
      });
      return true;
    }
    return false;
  }

  /**
   * Atomically replaces all items.
   */
  public setAll(items: T[], actor = 'system'): T[] {
    this.items = [...items];
    this.flushToDisk();

    appendAuditLog({
      action: 'BATCH_UPDATE',
      collection: this.name,
      actor,
      details: { newCount: items.length }
    });

    return this.getAll();
  }

  /**
   * Returns current collection item count.
   */
  public count(): number {
    if (!this.isLoaded) this.load();
    return this.items.length;
  }

  /**
   * Returns the file size in bytes.
   */
  public getFileSize(): number {
    try {
      if (fs.existsSync(this.filePath)) {
        return fs.statSync(this.filePath).size;
      }
    } catch {}
    return 0;
  }
}
