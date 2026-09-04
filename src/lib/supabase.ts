import { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentNote, User } from '../types';

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

// Dynamic credentials accessor for Vite and Node/tsx environments
export const getSupabaseUrl = (): string =>
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL : '') ||
  '';

export const getSupabaseAnonKey = (): string =>
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY : '') ||
  '';

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
    url.trim() !== '' &&
    !url.includes('placeholder') &&
    key &&
    key.trim() !== ''
  );
};

export const isUuid = (val?: string | null): boolean =>
  typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

// =========================================================================
// 2. CLIENT INITIALIZATION (Lazy & Cached)
// =========================================================================

let _clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (_clientInstance) return _clientInstance;
  if (!isSupabaseConfigured()) return null;

  _clientInstance = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
  return _clientInstance;
};

// Main client instance (evaluated on load or accessed lazily)
export const supabase: SupabaseClient | null = getSupabaseClient();

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
  >(isSupabaseConfigured() ? 'CONNECTING' : 'MOCK_MODE');

  const userId = options?.userId;
  const onNoteReady = options?.onNoteReady;
  const onStatusChange = options?.onStatusChange;

  // Initial fetch of notes
  const fetchNotes = useCallback(async () => {
    const sb = getSupabaseClient() || supabase;
    if (!sb) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      let query = sb
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId && isUuid(userId)) {
        query = query.eq('user_id', userId);
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      let resultNotes = (data as SupabaseNoteRow[]) || [];
      if (userId && !isUuid(userId)) {
        resultNotes = resultNotes.filter(
          n => (n.metadata?.student_id === userId || n.metadata?.studentId === userId)
        );
      }

      setNotes(resultNotes);
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

    const sb = getSupabaseClient() || supabase;
    if (!sb) {
      setConnectionStatus('MOCK_MODE');
      return;
    }

    setConnectionStatus('CONNECTING');

    // Subscribe to postgres_changes on public:notes
    const channelName = `realtime_notes_${userId || 'all'}_${Date.now()}`;
    const channel = sb
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          ...(userId && isUuid(userId) ? { filter: `user_id=eq.${userId}` } : {})
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
          ...(userId && isUuid(userId) ? { filter: `user_id=eq.${userId}` } : {})
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
          ...(userId && isUuid(userId) ? { filter: `user_id=eq.${userId}` } : {})
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
      sb.removeChannel(channel);
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
    const sb = getSupabaseClient() || supabase;
    if (!sb) {
      return {
        success: false,
        error: 'Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      };
    }

    try {
      const newRecord: any = {
        title: params.title || 'Untitled Capture',
        generalised_notes: params.generalised_notes,
        raw_ocr_text: params.raw_ocr_text || '',
        status: 'uploaded',
        metadata: {
          ...(params.metadata || {}),
          student_id: params.userId
        }
      };

      if (isUuid(params.userId)) {
        newRecord.user_id = params.userId;
      }

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
// SMART SUBJECT CATEGORIZATION
// =========================================================================

export function smartCategorizeNote(note: {
  title?: string;
  content?: string;
  tags?: string[];
  subjectId?: string;
}): string {
  const metaSubject = (note.subjectId || '').trim();
  const text = `${note.title || ''} ${(note.tags || []).join(' ')} ${(note.content || '').slice(0, 800)}`.toLowerCase();

  // 1. Explicit Misc / Defence / General Studies / Unrelated topics -> strictly Misc!
  if (
    text.includes('nda') ||
    text.includes('defense') ||
    text.includes('defence') ||
    text.includes('military') ||
    text.includes('ssb') ||
    text.includes('upsc') ||
    text.includes('army') ||
    text.includes('navy') ||
    text.includes('air force') ||
    text.includes('sepoy') ||
    text.includes('cadet') ||
    text.includes('research methodology') ||
    text.includes('error propagation') ||
    text.includes('lab safety') ||
    text.includes('engineering ethics') ||
    text.includes('general studies') ||
    text.includes('aptitude') ||
    text.includes('general notes')
  ) {
    return 'subj-misc';
  }

  // 2. Physics Indicators
  const hasPhy =
    text.includes('physics') ||
    text.includes('projectile') ||
    text.includes('kinematics') ||
    text.includes('newton') ||
    text.includes('friction') ||
    text.includes('galileo') ||
    text.includes('electromagnet') ||
    text.includes('faraday') ||
    text.includes('lenz') ||
    text.includes('carnot') ||
    text.includes('heat engine') ||
    text.includes('thermodynamics') ||
    text.includes('free body') ||
    text.includes('fbd') ||
    text.includes('pulley') ||
    text.includes('momentum') ||
    text.includes('work-kinetic') ||
    text.includes('incline');

  // 3. Chemistry Indicators
  const hasChem =
    text.includes('chemistry') ||
    text.includes('vsepr') ||
    text.includes('hybridization') ||
    text.includes('nernst') ||
    text.includes('electrochem') ||
    text.includes('molecular geometry') ||
    text.includes('bonding') ||
    text.includes('redox') ||
    text.includes('galvanic') ||
    text.includes('chemical thermodynamics') ||
    text.includes('hess law') ||
    text.includes('gibbs');

  // 4. Mathematics Indicators
  const hasMath =
    text.includes('mathematics') ||
    text.includes('calculus') ||
    text.includes('integration') ||
    text.includes('integral') ||
    text.includes('derivative') ||
    text.includes('differentiation') ||
    text.includes('liate') ||
    text.includes('partial fraction') ||
    text.includes('definite integral') ||
    text.includes('matrix') ||
    text.includes('matrices') ||
    text.includes('determinant') ||
    text.includes('squeeze theorem') ||
    text.includes('limits');

  if (hasPhy && !hasChem && !hasMath) return 'subj-phy';
  if (hasChem && !hasPhy && !hasMath) return 'subj-che';
  if (hasMath && !hasPhy && !hasChem) return 'subj-mat';

  // Check explicit subjectId if provided
  if (metaSubject) {
    const s = metaSubject.toLowerCase();
    if (s.includes('phy')) return 'subj-phy';
    if (s.includes('che')) return 'subj-che';
    if (s.includes('mat') || s.includes('calc')) return 'subj-mat';
    if (s.includes('cpc')) return 'subj-cpc';
    if (s.includes('eme')) return 'subj-eme';
  }

  // Fallback to highest keyword match
  if (hasPhy) return 'subj-phy';
  if (hasChem) return 'subj-che';
  if (hasMath) return 'subj-mat';

  // Unrelated or uncategorized notes go in Misc
  return 'subj-misc';
}

export function resolveSubjectIdFromRaw(raw: any): string {
  const meta = raw.metadata || {};
  return smartCategorizeNote({
    title: raw.title,
    content: raw.personalised_notes || raw.generalised_notes || raw.raw_ocr_text,
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    subjectId: raw.subject_id || raw.subjectId || meta.subject_id || meta.subjectId || meta.subject
  });
}

export const subscribeToVisionNotes = (
  onNewNote: (note: StudentNote) => void,
  onStatusChange?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void
) => {
  const sb = getSupabaseClient() || supabase;
  if (!sb) {
    console.info('[EduSync Supabase] Cloud credentials not configured. Running in local sync mode.');
    return () => {};
  }

  const handlePayload = (payload: any) => {
    const raw = payload.new;
    if (!raw) return;
    if (raw.is_archived) return;
    if (raw.title?.startsWith('__EDUSYNC_USER__') || raw.metadata?.entity_type === 'edusync_user') return;

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

    const rawTags: string[] = Array.isArray(meta.tags) ? [...meta.tags] : ['VisionNote', 'ClassSarthi'];
    const textLower = `${raw.title || ''} ${noteContent}`.toLowerCase();
    if (
      (textLower.includes('nda') || textLower.includes('defense') || textLower.includes('defence') || textLower.includes('ssb')) &&
      !rawTags.some(t => t.toLowerCase().includes('nda'))
    ) {
      rawTags.unshift('NDA', 'DefenceStudies');
    }

    const note: StudentNote = {
      id: raw.id || `note-vn-${Date.now()}`,
      studentId,
      subjectId,
      title: raw.title || 'ClassSarthi Lecture Capture',
      content: noteContent,
      cameraSnapshotUrl: meta.camera_snapshot_url || meta.image_url || raw.camera_snapshot_url,
      doubtsDetected: doubts,
      tags: Array.from(new Set(rawTags)),
      lastModified: raw.updated_at || raw.created_at || new Date().toISOString(),
      isPinned: true,
      source: 'visionnote',
      summary: raw.summary || meta.summary || (raw.generalised_notes ? 'Auto-transcribed lecture notes.' : undefined),
      keyTakeaways: meta.key_takeaways || []
    };

    onNewNote(note);
  };

  const channel = sb
    .channel('realtime_visionnote_sync')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes' }, handlePayload)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notes' }, handlePayload)
    .subscribe(status => {
      if (onStatusChange) onStatusChange(status as any);
    });

  return () => {
    sb.removeChannel(channel);
  };
};

export const pushNoteToSupabase = async (note: StudentNote): Promise<{ success: boolean; error?: string }> => {
  const sb = getSupabaseClient() || supabase;
  if (!sb) {
    return { success: false, error: 'Supabase is not configured yet. Please supply VITE_SUPABASE_URL in .env' };
  }

  try {
    const row: any = {
      title: note.title,
      generalised_notes: note.content,
      raw_ocr_text: note.content,
      status: 'uploaded',
      metadata: {
        subject_id: note.subjectId,
        student_id: note.studentId,
        camera_snapshot_url: note.cameraSnapshotUrl,
        doubts_detected: note.doubtsDetected || [],
        source: note.source || 'visionnote',
        summary: note.summary
      }
    };

    if (isUuid(note.id)) {
      row.id = note.id;
    }
    if (isUuid(note.studentId)) {
      row.user_id = note.studentId;
    }

    const { error } = await sb.from('notes').insert([row]);

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
  const sb = getSupabaseClient() || supabase;
  if (!sb) {
    return {
      notes: [],
      error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    };
  }

  try {
    let query = sb
      .from('notes')
      .select('*')
      .not('title', 'like', '__EDUSYNC_USER__%')
      .order('created_at', { ascending: false });

    if (options?.studentId && isUuid(options.studentId)) {
      query = query.eq('user_id', options.studentId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    let notes: StudentNote[] = (data || []).map((raw: any) => {
      const meta = raw.metadata || {};
      const noteContent = raw.personalised_notes || raw.generalised_notes || raw.raw_ocr_text || '';
      const subjectId = resolveSubjectIdFromRaw(raw);
      const rawSid = meta.student_id || meta.studentId || raw.student_id || raw.studentId || raw.user_id || 'student-1';
      const studentId = rawSid === 'student-g11-1' ? 'student-1' : rawSid;

      const doubts = Array.isArray(meta.doubts_detected)
        ? meta.doubts_detected
        : Array.isArray(meta.doubts)
        ? meta.doubts
        : Array.isArray(raw.doubts_detected)
        ? raw.doubts_detected
        : [];

      const rawTags: string[] = Array.isArray(meta.tags) ? [...meta.tags] : ['VisionNote', 'ClassSarthi'];
      const textLower = `${raw.title || ''} ${noteContent}`.toLowerCase();
      if (
        (textLower.includes('nda') || textLower.includes('defense') || textLower.includes('defence') || textLower.includes('ssb')) &&
        !rawTags.some(t => t.toLowerCase().includes('nda'))
      ) {
        rawTags.unshift('NDA', 'DefenceStudies');
      }

      return {
        id: raw.id,
        studentId,
        subjectId,
        title: raw.title || 'ClassSarthi Lecture Capture',
        content: noteContent,
        cameraSnapshotUrl: meta.camera_snapshot_url || meta.image_url || raw.camera_snapshot_url,
        doubtsDetected: doubts,
        tags: Array.from(new Set(rawTags)),
        lastModified: raw.updated_at || raw.created_at || new Date().toISOString(),
        isPinned: true,
        source: 'visionnote',
        summary: raw.summary || meta.summary || (raw.generalised_notes ? 'Transcribed lecture notes with AI cognitive scaffolding.' : undefined),
        keyTakeaways: meta.key_takeaways || []
      };
    });

    if (options?.studentId && !isUuid(options.studentId)) {
      const target = options.studentId;
      notes = notes.filter(n => n.studentId === target || n.studentId === 'student-1' || !n.studentId || n.source === 'visionnote');
    }

    if (options?.subjectId) {
      notes = notes.filter(n => n.subjectId === options.subjectId);
    }

    return { notes };
  } catch (err: any) {
    console.error('[EduSync Supabase] Failed to fetch notes:', err);
    return { notes: [], error: err.message || 'Failed to pull notes from Supabase' };
  }
};

// =========================================================================
// 8. CLOUD USER PERSISTENCE (Saved FOREVER directly in Supabase Cloud)
// =========================================================================

export const saveUserToSupabaseCloud = async (user: User): Promise<boolean> => {
  try {
    const sb = getSupabaseClient();
    if (!sb) return false;

    const userTitle = `__EDUSYNC_USER__:${user.id}`;
    const payload = {
      user_id: null,
      title: userTitle,
      generalised_notes: JSON.stringify(user),
      personalised_notes: JSON.stringify(user),
      status: 'ready' as const,
      metadata: {
        entity_type: 'edusync_user',
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        institutionalId: user.institutionalId,
        user
      }
    };

    const { data: existing } = await sb
      .from('notes')
      .select('id')
      .eq('title', userTitle)
      .limit(1);

    if (existing && existing.length > 0) {
      const { error } = await sb
        .from('notes')
        .update({
          generalised_notes: payload.generalised_notes,
          personalised_notes: payload.personalised_notes,
          metadata: payload.metadata
        })
        .eq('id', existing[0].id);

      if (error) {
        console.warn('[EduSync Supabase] Error updating user in cloud:', error);
        return false;
      }
    } else {
      const { error } = await sb.from('notes').insert([payload]);
      if (error) {
        console.warn('[EduSync Supabase] Error inserting user into cloud:', error);
        return false;
      }
    }

    console.log(`[EduSync Supabase] ☁️ User ${user.name} (${user.id}) saved to cloud!`);
    return true;
  } catch (err) {
    console.warn('[EduSync Supabase] Exception saving user to cloud:', err);
    return false;
  }
};

export const fetchUsersFromSupabaseCloud = async (): Promise<User[]> => {
  try {
    const sb = getSupabaseClient();
    if (!sb) return [];

    const { data, error } = await sb
      .from('notes')
      .select('*')
      .like('title', '__EDUSYNC_USER__:%');

    if (error || !data) return [];

    const users: User[] = [];
    for (const row of data) {
      try {
        if (row.metadata?.user) {
          users.push(row.metadata.user);
        } else if (row.generalised_notes) {
          const parsed = JSON.parse(row.generalised_notes);
          if (parsed && parsed.id) users.push(parsed);
        }
      } catch {}
    }

    return users;
  } catch (err) {
    console.warn('[EduSync Supabase] Exception loading users from cloud:', err);
    return [];
  }
};

export const deleteUserFromSupabaseCloud = async (userId: string): Promise<boolean> => {
  try {
    const sb = getSupabaseClient();
    if (!sb) return false;

    const userTitle = `__EDUSYNC_USER__:${userId}`;
    const { error } = await sb.from('notes').delete().eq('title', userTitle);
    return !error;
  } catch (err) {
    console.warn('[EduSync Supabase] Exception deleting user from cloud:', err);
    return false;
  }
};

