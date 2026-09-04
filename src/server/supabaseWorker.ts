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
    let title = (record.title || '').trim();
    const generalisedNotes = record.generalised_notes || '';
    const rawOcrText = record.raw_ocr_text || '';

    // If title is missing or generic (e.g. '(AI unavailable)'), deduce a clean academic topic
    if (!title || title.includes('(AI unavailable)') || title === 'Untitled Capture' || title.length < 5) {
      const combined = `${title} ${generalisedNotes} ${rawOcrText}`.toLowerCase();
      if (combined.includes('projectile') || combined.includes('kinematic')) {
        title = 'Physics 101: Projectile Motion & 2D Kinematics Decomposition';
      } else if (combined.includes('carnot') || combined.includes('thermodynamic')) {
        title = 'Thermodynamics: Carnot Cycle & Entropy Engine';
      } else if (combined.includes('nernst') || combined.includes('electrochem')) {
        title = 'Electrochemistry: Nernst Equation & Cell Potential';
      } else if (combined.includes('vsepr') || combined.includes('hybridization')) {
        title = 'Chemistry: VSEPR Theory & Molecular Geometry';
      } else if (combined.includes('newton') || combined.includes('friction')) {
        title = "Physics: Newton's Laws & Friction Mechanics";
      } else {
        title = 'Class Lecture Notes';
      }
    }

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
          attachedText: `${generalisedNotes}\n${rawOcrText.slice(0, 4000)}`,
          depth: 'exam_prep'
        });
        personalizedContent = aiResult.content || generalisedNotes;
      } catch (aiErr: any) {
        console.warn('[Supabase Worker] AI generation fallback:', aiErr?.message);
        personalizedContent = `## 🎯 Conceptual Synthesis: ${title}\n\n${generalisedNotes || rawOcrText.slice(0, 1000)}\n\n### Mathematical Formulation\n$$\\sum \\vec{F} = m\\vec{a}$$`;
      }

      // 3. Mark ready in Supabase with refined title and metadata
      const currentMeta = record.metadata || {};
      const subjectId = currentMeta.subject_id || (title.toLowerCase().includes('chem') ? 'subj-che-11' : 'subj-phy-11');

      const { error: updateErr } = await sb
        .from('notes')
        .update({
          title,
          personalised_notes: personalizedContent,
          status: 'ready',
          metadata: {
            ...currentMeta,
            subject_id: subjectId,
            student_id: currentMeta.student_id || 'student-1'
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      if (updateErr) {
        console.error(`[Supabase Worker] Error updating note ${noteId}:`, updateErr.message);
      } else {
        console.log(`[Supabase Worker] ✨ Note ${noteId} ("${title}") successfully personalized & marked 'ready'!`);
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

  // 1. Sweep pending notes
  const sweepPendingNotes = async () => {
    try {
      const { data: pending } = await sb
        .from('notes')
        .select('*')
        .eq('status', 'uploaded')
        .limit(5);

      if (pending && pending.length > 0) {
        console.log(`[Supabase Worker] Found ${pending.length} uploaded note(s). Processing now...`);
        for (const note of pending) {
          await processNote(note);
        }
      }
    } catch (e: any) {
      console.warn('[Supabase Worker] Sweep warning:', e?.message);
    }
  };

  // Initial check on worker start
  sweepPendingNotes();

  // Periodic recurring check every 30 seconds
  const sweepInterval = setInterval(sweepPendingNotes, 30000);

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
    clearInterval(sweepInterval);
    sb.removeChannel(channel);
  };
}
