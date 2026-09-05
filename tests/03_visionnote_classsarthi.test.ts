import { TestContext, TestRunner, apiRequest } from './test_helpers';
import assert from 'assert';

export async function runVisionNoteClassSarthiTests(ctx: TestContext, runner: TestRunner) {
  runner.setSuite('ClassSarthi & VisionNote Integration', 'classsarthi_studio');

  let testLectureId = 'lec-phy-101';

  // Test 1: List all ClassSarthi Lectures
  await runner.runTest('List Synchronized ClassSarthi Lectures', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/lectures');
    assert.strictEqual(res.status, 200);
    const lectures = Array.isArray(res.data) ? res.data : (res.data.lectures || []);
    assert(Array.isArray(lectures), 'Expected array of lectures');
    assert(lectures.length > 0, 'Expected seeded ClassSarthi lectures');
    testLectureId = lectures[0].id;
  });

  // Test 2: Fetch Lecture Studio Details (Timestamps, Board OCR, Teacher Quotes)
  await runner.runTest('Fetch Lecture Studio Details with Timestamp Grounding', async () => {
    const res = await apiRequest(ctx.baseUrl, `/api/lectures/${testLectureId}`);
    assert.strictEqual(res.status, 200);
    const lecture = res.data.lecture || res.data;
    assert.strictEqual(lecture.id, testLectureId);
    assert(Array.isArray(lecture.timeline || lecture.timelineEvents || lecture.transcriptEvents), 'Expected timeline events');
    assert(lecture.title, 'Expected lecture title');
  });

  // Test 3: Fetch VisionNote Blackboard Captures Gallery
  await runner.runTest('Fetch VisionNote Board Visuals & OCR Captures', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/board-captures');
    assert.strictEqual(res.status, 200);
    const captures = Array.isArray(res.data) ? res.data : (res.data.captures || []);
    assert(Array.isArray(captures), 'Expected board captures list');
    assert(captures.length > 0, 'Expected seeded board captures');
    
    // Check OCR transcript / KaTeX formula in board capture
    const capture = captures[0];
    assert(capture.ocrLatex || capture.ocrText || capture.title, 'Expected OCR transcript or LaTeX formula');
    assert(capture.conceptTag || capture.title, 'Expected board capture metadata');
  });

  // Test 4: VisionNote Realtime Cloud Sync Status
  await runner.runTest('VisionNote Realtime Cloud Sync Status Check', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/notes/vision-sync/status');
    assert.strictEqual(res.status, 200);
    assert(res.data.status === 'active' || typeof res.data.totalVisionNotesSynced === 'number' || typeof res.data.active === 'boolean');
  });

  // Test 5: VisionNote Realtime Simulation Webhook
  await runner.runTest('Simulate Realtime Classroom Camera Note Ingest', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/notes/vision-sync/simulate', {
      method: 'POST',
      body: {
        classroom: 'Room 402 Physics Hall',
        topic: 'Rotational Dynamics & Moment of Inertia',
        rawOcr: '$$\\tau = I \\alpha$$ and $$I = \\sum m_i r_i^2$$',
        confidence: 0.96
      }
    });

    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    assert(res.data.success || res.data.noteId || res.data.note, 'Expected successful simulation');
  });

  // Test 6: ClassSarthi Ingestion Webhook (/api/webhooks/classsarthi-ingest)
  await runner.runTest('ClassSarthi Ingestion Webhook for External Camera Devices', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/webhooks/classsarthi-ingest', {
      method: 'POST',
      body: {
        title: 'ClassSarthi Live Camera Session: Rotational Mechanics',
        lectureId: testLectureId,
        boardSnapshot: {
          timestampSeconds: 420,
          imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
          ocrText: 'Centripetal Acceleration: $$a_c = \\frac{v^2}{r} = \\omega^2 r$$',
          confidenceScore: 0.98
        }
      }
    });

    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    assert(res.data.success);
  });
}
