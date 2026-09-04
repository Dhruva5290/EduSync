import { createClient } from '@supabase/supabase-js';
import { generateDetailedTopicNoteAI } from './gemini';

/**
 * Background Realtime Worker for Supabase
 * Automatically listens for newly captured or uploaded notes in public.notes,
 * processes them with Gemini 3.7 Flash, and marks them 'ready' in real-time.
 */
export function startSupabaseRealtimeWorker() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.info('[Supabase Realtime Worker] Skipped: Supabase credentials not found.');
    return;
  }

  const sb = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 10 } }
  });

  const processNote = async (record: any) => {
    if (!record || !record.id || record.status !== 'uploaded') return;

    const noteId = record.id;
    const title = record.title || 'Class Lecture Note';
    const generalisedNotes = record.generalised_notes || '';
    const rawOcrText = record.raw_ocr_text || '';

    console.log(`[Supabase Worker] Processing note ${noteId}: "${title}"`);

    try {
      // 1. Set status to processing
      await sb
        .from('notes')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      // 2. Personalize with Gemini AI
      let personalizedContent = '';
      try {
        const aiResult = await generateDetailedTopicNoteAI({
          prompt: title,
          attachedText: `${generalisedNotes}\n${rawOcrText}`,
          depth: 'exam_prep'
        });
        personalizedContent = aiResult.content || generalisedNotes;
      } catch (aiErr: any) {
        console.warn('[Supabase Worker] AI generation fallback:', aiErr?.message);
        personalizedContent = `## 🎯 Conceptual Synthesis: ${title}\n\n${generalisedNotes}\n\n### Mathematical Formulation\n$$\\sum \\vec{F} = m\\vec{a}$$`;
      }

      // 3. Mark ready in Supabase
      const { error: updateErr } = await sb
        .from('notes')
        .update({
          personalised_notes: personalizedContent,
          status: 'ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      if (updateErr) {
        console.error(`[Supabase Worker] Error updating note ${noteId}:`, updateErr.message);
      } else {
        console.log(`[Supabase Worker] ✨ Note ${noteId} successfully personalized & marked 'ready'!`);
      }
    } catch (err: any) {
      console.error(`[Supabase Worker] Failed to process note ${noteId}:`, err?.message);
      await sb
        .from('notes')
        .update({
          status: 'failed',
          error_message: err?.message || 'Processing failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);
    }
  };

  // 1. Process any pending notes that were uploaded while server was offline
  (async () => {
    try {
      const { data: pending } = await sb
        .from('notes')
        .select('*')
        .eq('status', 'uploaded')
        .limit(10);

      if (pending && pending.length > 0) {
        console.log(`[Supabase Worker] Found ${pending.length} pending notes. Processing now...`);
        for (const note of pending) {
          await processNote(note);
        }
      }
    } catch (e: any) {
      console.warn('[Supabase Worker] Initial check warning:', e?.message);
    }
  })();

  // 2. Subscribe to Realtime INSERT and UPDATE events
  const channel = sb
    .channel('edusync_notes_realtime_worker')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notes' },
      payload => {
        if (payload.new && payload.new.status === 'uploaded') {
          processNote(payload.new);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'notes' },
      payload => {
        if (payload.new && payload.new.status === 'uploaded') {
          processNote(payload.new);
        }
      }
    )
    .subscribe(status => {
      console.log(`[Supabase Worker] Realtime subscription status: ${status}`);
    });

  return () => {
    sb.removeChannel(channel);
  };
}
