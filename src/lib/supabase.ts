import { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentNote } from '../types';

// =========================================================================
// 1. DATABASE SCHEMA TYPES (public.notes)
// =========================================================================

export type NoteStatus = 'uploaded' | 'processing' | 'ready' | 'failed';

export interface SupabaseNoteRow {
  id: string;
  user_id: string;
  title: string;
  raw_ocr_text?: string | null;
  generalised_notes: string;
  personalised_notes?: string | null;
  status: NoteStatus;
  error_message?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

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

// =========================================================================
// 2. CLIENT INITIALIZATION
// =========================================================================

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

// =========================================================================
// 3. REACT REALTIME HOOK: usePersonalizedNotesRealtime
// =========================================================================

export interface UsePersonalizedNotesOptions {
  userId?: string;
  onNoteReady?: (note: SupabaseNoteRow) => void;
  onStatusChange?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void;
}

export interface UsePersonalizedNotesReturn {
  notes: SupabaseNoteRow[];
  isLoading: boolean;
  error: string | null;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'MOCK_MODE';
  uploadNote: (params: {
    userId: string;
    title: string;
    generalised_notes: string;
    raw_ocr_text?: string;
    metadata?: Record<string, any>;
  }) => Promise<{ success: boolean; data?: SupabaseNoteRow; error?: string }>;
  refetch: () => Promise<void>;
}

/**
 * Custom React hook subscribing to real-time updates on `public.notes`.
 * Listens for INSERT and UPDATE events (specifically when status === 'ready').
 */
export function usePersonalizedNotesRealtime(
  options?: UsePersonalizedNotesOptions
): UsePersonalizedNotesReturn {
  const [notes, setNotes] = useState<SupabaseNoteRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'MOCK_MODE'
  >(supabase ? 'CONNECTING' : 'MOCK_MODE');

  const userId = options?.userId;
  const onNoteReady = options?.onNoteReady;
  const onStatusChange = options?.onStatusChange;

  // Initial fetch of notes
  const fetchNotes = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      let query = supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      setNotes((data as SupabaseNoteRow[]) || []);
    } catch (err: any) {
      console.error('[usePersonalizedNotesRealtime] Fetch error:', err);
      setError(err.message || 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Set up real-time subscription
  useEffect(() => {
    fetchNotes();

    if (!supabase) {
      setConnectionStatus('MOCK_MODE');
      return;
    }

    setConnectionStatus('CONNECTING');

    // Subscribe to postgres_changes on public:notes
    const channelName = `realtime_notes_${userId || 'all'}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          ...(userId ? { filter: `user_id=eq.${userId}` } : {})
        },
        (payload: any) => {
          const newRow = payload.new as SupabaseNoteRow;
          if (!newRow) return;

          console.log('[Realtime Note INSERT]:', newRow.id, newRow.status);
          setNotes(prev => {
            if (prev.some(n => n.id === newRow.id)) return prev;
            return [newRow, ...prev];
          });
        }
      )
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          ...(userId ? { filter: `user_id=eq.${userId}` } : {})
        },
        (payload: any) => {
          const updatedRow = payload.new as SupabaseNoteRow;
          if (!updatedRow) return;

          console.log('[Realtime Note UPDATE]:', updatedRow.id, updatedRow.status);

          setNotes(prev =>
            prev.map(note => (note.id === updatedRow.id ? updatedRow : note))
          );

          if (updatedRow.status === 'ready' && onNoteReady) {
            onNoteReady(updatedRow);
          }
        }
      )
      .on(
        'postgres_changes' as any,
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notes',
          ...(userId ? { filter: `user_id=eq.${userId}` } : {})
        },
        (payload: any) => {
          if (!payload.old?.id) return;
          setNotes(prev => prev.filter(note => note.id !== payload.old.id));
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('CONNECTED');
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setConnectionStatus('DISCONNECTED');
        }
        if (onStatusChange) onStatusChange(status as any);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotes, userId, onNoteReady, onStatusChange]);

  // Upload helper method
  const uploadNote = async (params: {
    userId: string;
    title: string;
    generalised_notes: string;
    raw_ocr_text?: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; data?: SupabaseNoteRow; error?: string }> => {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      };
    }

    try {
      const newRecord = {
        user_id: params.userId,
        title: params.title || 'Untitled Capture',
        generalised_notes: params.generalised_notes,
        raw_ocr_text: params.raw_ocr_text || '',
        status: 'uploaded',
        metadata: params.metadata || {}
      };

      const { data, error: insertError } = await supabase
        .from('notes')
        .insert([newRecord])
        .select()
        .single();

      if (insertError) throw insertError;

      return { success: true, data: data as SupabaseNoteRow };
    } catch (err: any) {
      console.error('[uploadNote] Error:', err);
      return { success: false, error: err.message || 'Upload failed' };
    }
  };

  return {
    notes,
    isLoading,
    error,
    connectionStatus,
    uploadNote,
    refetch: fetchNotes
  };
}

// =========================================================================
// 4. LEGACY / UTILITY HELPERS (Kept for full backward compatibility)
// =========================================================================

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

  return 'subj-phy-11';
}

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
    if (raw.is_archived) return;

    const meta = raw.metadata || {};
    const noteContent = raw.personalised_notes || raw.generalised_notes || raw.content || raw.raw_ocr_text || '';
    const subjectId = resolveSubjectIdFromRaw(raw);
    const rawSid = meta.student_id || meta.studentId || raw.student_id || raw.studentId || raw.user_id || 'student-1';
    const studentId = rawSid === 'student-g11-1' ? 'student-1' : rawSid;

    const doubts: string[] = Array.isArray(meta.doubts)
      ? meta.doubts
      : Array.isArray(raw.doubts_detected)
      ? raw.doubts_detected
      : [];

    const note: StudentNote = {
      id: raw.id || `note-vn-${Date.now()}`,
      studentId,
      subjectId,
      title: raw.title || 'ClassSarthi Lecture Capture',
      content: noteContent,
      cameraSnapshotUrl: meta.camera_snapshot_url || meta.image_url || raw.camera_snapshot_url,
      doubtsDetected: doubts,
      tags: Array.isArray(meta.tags) ? meta.tags : ['VisionNote', 'ClassSarthi'],
      lastModified: raw.updated_at || raw.created_at || new Date().toISOString(),
      isPinned: true,
      source: 'visionnote',
      summary: raw.summary || meta.summary || (raw.generalised_notes ? 'Auto-transcribed lecture notes.' : undefined),
      keyTakeaways: meta.key_takeaways || []
    };

    onNewNote(note);
  };

  const channel = supabase
    .channel('realtime_visionnote_sync')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes' }, handlePayload)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notes' }, handlePayload)
    .subscribe(status => {
      if (onStatusChange) onStatusChange(status as any);
    });

  return () => {
    supabase.removeChannel(channel);
  };
};

export const pushNoteToSupabase = async (note: StudentNote): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured yet. Please supply VITE_SUPABASE_URL in .env' };
  }

  try {
    const { error } = await supabase.from('notes').insert([
      {
        id: note.id,
        user_id: note.studentId,
        title: note.title,
        generalised_notes: note.content,
        raw_ocr_text: note.content,
        status: 'uploaded',
        metadata: {
          subject_id: note.subjectId,
          camera_snapshot_url: note.cameraSnapshotUrl,
          doubts_detected: note.doubtsDetected || [],
          source: note.source || 'visionnote',
          summary: note.summary
        }
      }
    ]);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error pushing note to Supabase:', err);
    return { success: false, error: err.message || 'Failed to push note' };
  }
};

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
      .order('created_at', { ascending: false });

    if (options?.studentId) {
      query = query.eq('user_id', options.studentId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    const notes: StudentNote[] = (data || []).map((raw: any) => {
      const meta = raw.metadata || {};
      const noteContent = raw.personalised_notes || raw.generalised_notes || raw.raw_ocr_text || '';
      const subjectId = resolveSubjectIdFromRaw(raw);
      const studentId = raw.user_id || 'student-1';

      return {
        id: raw.id,
        studentId,
        subjectId,
        title: raw.title || 'ClassSarthi Lecture Capture',
        content: noteContent,
        cameraSnapshotUrl: meta.camera_snapshot_url || meta.image_url,
        doubtsDetected: Array.isArray(meta.doubts_detected) ? meta.doubts_detected : [],
        tags: Array.isArray(meta.tags) ? meta.tags : ['VisionNote', 'ClassSarthi'],
        lastModified: raw.updated_at || raw.created_at || new Date().toISOString(),
        isPinned: true,
        source: 'visionnote',
        summary: raw.summary || meta.summary,
        keyTakeaways: meta.key_takeaways || []
      };
    });

    return { notes };
  } catch (err: any) {
    console.error('[EduSync Supabase] Failed to fetch notes:', err);
    return { notes: [], error: err.message || 'Failed to pull notes from Supabase' };
  }
};
