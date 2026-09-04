import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentNote } from '../types';

// Read env variables safely in Vite
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.trim() !== '' &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey &&
    supabaseAnonKey.trim() !== ''
  );
};

// Create client instance or null if not configured
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

function resolveSubjectIdFromRaw(raw: any): string {
  const meta = raw.metadata || {};
  const explicit = (raw.subject_id || raw.subjectId || meta.subject_id || meta.subjectId || '').trim();
  const validIds = ['subj-phy-11', 'subj-che-11', 'subj-mat-11', 'subj-phy-12', 'subj-che-12', 'subj-mat-12'];
  if (validIds.includes(explicit)) return explicit;

  const text = `${explicit} ${meta.subject || ''} ${meta.course || ''} ${raw.title || ''}`.toLowerCase();
  const isGrade12 = text.includes('12') || text.includes('xii');

  if (text.includes('chem') || text.includes('che')) return isGrade12 ? 'subj-che-12' : 'subj-che-11';
  if (text.includes('math') || text.includes('mat') || text.includes('calc')) return isGrade12 ? 'subj-mat-12' : 'subj-mat-11';
  if (text.includes('phy')) return isGrade12 ? 'subj-phy-12' : 'subj-phy-11';

  // Default to Class 11 Physics (first active course) so test lectures never disappear
  return 'subj-phy-11';
}

/**
 * Real-time listener for incoming notes pushed from VisionNote / ClassSarthi or the cloud.
 * Automatically triggers callback when a new note is inserted or updated.
 */
export const subscribeToVisionNotes = (
  onNewNote: (note: StudentNote) => void,
  onStatusChange?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void
) => {
  if (!supabase) {
    console.info('[EduSync Supabase] Cloud credentials not configured. Running in local sync mode.');
    return () => {};
  }

  const handlePayload = (payload: any) => {
    const raw = payload.new;
    if (!raw) return;

    // Ensure zero-leak: ignore archived notes
    if (raw.is_archived) return;

    const meta = raw.metadata || {};
    const noteContent = raw.personalised_notes || raw.generalised_notes || raw.content || raw.raw_ocr_text || '';
    const subjectId = resolveSubjectIdFromRaw(raw);
    const rawSid = meta.student_id || meta.studentId || raw.student_id || raw.studentId || raw.user_id || 'student-1';
    const studentId = (rawSid === 'student-g11-1') ? 'student-1' : rawSid;

    const doubts: string[] = Array.isArray(meta.doubts)
      ? meta.doubts
      : Array.isArray(raw.doubts_detected)
      ? raw.doubts_detected
      : Array.isArray(meta.doubts_detected)
      ? meta.doubts_detected
      : [];

    const tags: string[] = Array.isArray(meta.tags)
      ? meta.tags
      : Array.isArray(raw.tags)
      ? raw.tags
      : ['VisionNote', 'ClassSarthi'];

    const note: StudentNote = {
      id: raw.id || `note-vn-${Date.now()}`,
      studentId,
      subjectId,
      title: raw.title || 'ClassSarthi Lecture Capture',
      content: noteContent,
      cameraSnapshotUrl: meta.camera_snapshot_url || meta.image_url || meta.snapshot_url || raw.camera_snapshot_url,
      doubtsDetected: doubts,
      tags,
      lastModified: raw.updated_at || raw.created_at || new Date().toISOString(),
      isPinned: true,
      source: 'visionnote',
      summary: raw.summary || meta.summary || (raw.generalised_notes ? 'Auto-transcribed lecture notes synchronized from ClassSarthi cloud.' : undefined),
      keyTakeaways: meta.key_takeaways || raw.key_takeaways || []
    };

    onNewNote(note);
  };

  const channel = supabase
    .channel('realtime_visionnote_sync')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notes'
      },
      handlePayload
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notes'
      },
      handlePayload
    )
    .subscribe((status) => {
      if (onStatusChange) {
        onStatusChange(status as any);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Pushes a note to Supabase if configured, with error handling.
 */
export const pushNoteToSupabase = async (note: StudentNote): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured yet. Please supply VITE_SUPABASE_URL in .env' };
  }

  try {
    const { error } = await supabase.from('notes').insert([
      {
        id: note.id,
        student_id: note.studentId,
        subject_id: note.subjectId,
        title: note.title,
        content: note.content,
        camera_snapshot_url: note.cameraSnapshotUrl,
        doubts_detected: note.doubtsDetected || [],
        source: note.source || 'visionnote',
        is_archived: false,
        summary: note.summary,
        created_at: note.lastModified || new Date().toISOString()
      }
    ]);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error pushing note to Supabase:', err);
    return { success: false, error: err.message || 'Failed to push note' };
  }
};

/**
 * Pulls all active VisionNote / ClassSarthi notes directly from the Supabase `notes` table.
 * Supports filtering by studentId or subjectId.
 */
export const fetchVisionNotesFromSupabase = async (options?: {
  studentId?: string;
  subjectId?: string;
  limit?: number;
}): Promise<{ notes: StudentNote[]; error?: string }> => {
  if (!supabase) {
    return {
      notes: [],
      error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    };
  }

  try {
    let query = supabase
      .from('notes')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (options?.subjectId) {
      query = query.eq('subject_id', options.subjectId);
    }
    if (options?.studentId) {
      query = query.eq('student_id', options.studentId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    const notes: StudentNote[] = (data || []).map((raw: any) => {
      const meta = raw.metadata || {};
      const noteContent = raw.personalised_notes || raw.generalised_notes || raw.content || raw.raw_ocr_text || '';
      const subjectId = resolveSubjectIdFromRaw(raw);
      const rawSid = meta.student_id || meta.studentId || raw.student_id || raw.studentId || raw.user_id || 'student-1';
      const studentId = (rawSid === 'student-g11-1') ? 'student-1' : rawSid;

      const doubts: string[] = Array.isArray(meta.doubts)
        ? meta.doubts
        : Array.isArray(raw.doubts_detected)
        ? raw.doubts_detected
        : Array.isArray(meta.doubts_detected)
        ? meta.doubts_detected
        : [];

      const tags: string[] = Array.isArray(meta.tags)
        ? meta.tags
        : Array.isArray(raw.tags)
        ? raw.tags
        : ['VisionNote', 'ClassSarthi'];

      return {
        id: raw.id || `note-vn-${Date.now()}`,
        studentId,
        subjectId,
        title: raw.title || 'ClassSarthi Lecture Capture',
        content: noteContent,
        cameraSnapshotUrl: meta.camera_snapshot_url || meta.image_url || meta.snapshot_url || raw.camera_snapshot_url,
        doubtsDetected: doubts,
        tags,
        lastModified: raw.updated_at || raw.created_at || new Date().toISOString(),
        isPinned: true,
        source: 'visionnote',
        summary: raw.summary || meta.summary || (raw.generalised_notes ? 'Auto-transcribed lecture notes synchronized from ClassSarthi cloud.' : undefined),
        keyTakeaways: meta.key_takeaways || raw.key_takeaways || []
      };
    });

    return { notes };
  } catch (err: any) {
    console.error('[EduSync Supabase] Failed to fetch notes:', err);
    return { notes: [], error: err.message || 'Failed to pull notes from Supabase' };
  }
};

