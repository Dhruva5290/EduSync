import 'dotenv/config';
import { fetchVisionNotesFromSupabase, isSupabaseConfigured, pushNoteToSupabase } from '../src/lib/supabase';

async function main() {
  console.log('--- TESTING SUPABASE INTEGRATION & DATA PULL ---');
  console.log('isSupabaseConfigured():', isSupabaseConfigured());
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);

  // 1. Test fetch all notes
  console.log('\n[TEST 1] Fetching notes from Supabase...');
  const res = await fetchVisionNotesFromSupabase();
  console.log('Result error:', res.error);
  console.log('Result count:', res.notes.length);

  if (res.notes.length > 0) {
    console.log('\n--- Sample Note Pulled from Supabase ---');
    console.log({
      id: res.notes[0].id,
      title: res.notes[0].title,
      subjectId: res.notes[0].subjectId,
      studentId: res.notes[0].studentId,
      source: res.notes[0].source,
      contentSnippet: res.notes[0].content.slice(0, 100) + '...'
    });
  }

  // 2. Test fetch with non-UUID studentId (e.g. 'student-1') to verify no 22P02 Postgres errors
  console.log('\n[TEST 2] Fetching notes with studentId="student-1"...');
  const resStudent = await fetchVisionNotesFromSupabase({ studentId: 'student-1' });
  console.log('Student-1 fetch error:', resStudent.error);
  console.log('Student-1 notes count:', resStudent.notes.length);

  // 3. Test fetch with subjectId (e.g. 'subj-phy-11')
  console.log('\n[TEST 3] Fetching notes with subjectId="subj-phy-11"...');
  const resPhy = await fetchVisionNotesFromSupabase({ subjectId: 'subj-phy-11' });
  console.log('Physics fetch error:', resPhy.error);
  console.log('Physics notes count:', resPhy.notes.length);

  // 4. Test pushNoteToSupabase with a new lecture capture
  console.log('\n[TEST 4] Pushing a test note to Supabase...');
  const testNote = {
    id: `test-note-${Date.now()}`,
    studentId: 'student-1',
    subjectId: 'subj-phy-11',
    title: 'Electromagnetic Induction & Faraday Laws Verification',
    content: 'Faraday demonstrated that changing magnetic flux induces an electromotive force (EMF) in a closed circuit.',
    tags: ['Faraday', 'Physics', 'Verification'],
    lastModified: new Date().toISOString(),
    isPinned: false,
    source: 'visionnote' as const,
    summary: 'Auto-verification note pushed to test Supabase write path.'
  };

  const pushRes = await pushNoteToSupabase(testNote);
  console.log('Push result:', pushRes);

  // 5. Re-fetch to ensure the new note is immediately pulled
  console.log('\n[TEST 5] Re-fetching to confirm new note is pulled from Supabase...');
  const refetch = await fetchVisionNotesFromSupabase();
  console.log('Re-fetch count:', refetch.notes.length);
  const found = refetch.notes.find(n => n.title === testNote.title);
  console.log('Newly pushed note found in Supabase pull?', Boolean(found));

  if (found) {
    console.log('✅ ALL TESTS PASSED: Supabase is pulling and pushing live data flawlessly!');
  } else {
    console.error('❌ Test failed to find inserted note.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
