import { TestContext, TestRunner, apiRequest } from './test_helpers';
import assert from 'assert';

export async function runSmartNotesAndMasteryTests(ctx: TestContext, runner: TestRunner) {
  runner.setSuite('Smart Notes & Mastery Quizzes', 'smart_notes_ai');

  let createdNoteId = '';
  let testLectureId = 'lec-phy-101';

  // Test 1: Fetch student notes
  await runner.runTest('Fetch Student Smart Notes Collection', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/notes', {
      token: ctx.studentToken
    });

    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data), 'Expected array of notes');
  });

  // Test 2: Create a new Smart Note with KaTeX Math
  await runner.runTest('Create Rich Markdown Note with KaTeX Math', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/notes', {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        subjectId: 'sub_phys101',
        title: 'Work-Energy Theorem & Conservation Laws',
        content: '# Work-Energy Principle\n\nThe net work done on an object equals the change in kinetic energy:\n$$W_{net} = \\Delta K = \\frac{1}{2}mv_f^2 - \\frac{1}{2}mv_i^2$$\n\nFor conservative forces:\n$$E_{total} = K + U = \\text{constant}$$',
        tags: ['physics', 'mechanics', 'work-energy']
      }
    });

    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    assert(res.data.id, 'Expected generated note ID');
    createdNoteId = res.data.id;
  });

  // Test 3: Note AI Summarization Endpoint
  await runner.runTest('AI Summarizer & Key Takeaway Extractor', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/ai/summarize-note', {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        content: 'Newton second law states F = ma. When force is zero, acceleration is zero. Kinetic energy is 1/2 mv^2.'
      }
    });

    assert.strictEqual(res.status, 200);
    assert(res.data.summary, 'Expected summary text');
    assert(Array.isArray(res.data.keyTakeaways || res.data.keyPoints || res.data.takeaways), 'Expected key points array');
  });

  // Test 4: AI Flashcard Generator from Note Content
  await runner.runTest('AI Interactive 3D Flashcard Deck Generator', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/ai/generate-flashcards', {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        content: 'Coulomb Law: F = k*q1*q2 / r^2. Electric field E = F/q. Electric potential V = k*q/r.'
      }
    });

    assert.strictEqual(res.status, 200);
    const flashcards = Array.isArray(res.data) ? res.data : (res.data.flashcards || []);
    assert(Array.isArray(flashcards), 'Expected flashcards array');
    if (flashcards.length > 0) {
      assert(flashcards[0].front || flashcards[0].question, 'Expected flashcard front prompt');
      assert(flashcards[0].back || flashcards[0].answer, 'Expected flashcard back answer');
    }
  });

  // Test 5: AI Note-to-Quiz Generator
  await runner.runTest('AI Multiple-Choice Quiz Runner Generator', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/ai/note-to-quiz', {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        content: 'Thermodynamics First Law: dU = dQ - dW. Isothermal process means dT = 0. Adiabatic means dQ = 0.'
      }
    });

    assert.strictEqual(res.status, 200);
    const questions = res.data.quiz?.questions || res.data.questions;
    assert(Array.isArray(questions), 'Expected quiz questions array');
    if (questions.length > 0) {
      assert(questions[0].question, 'Expected question prompt');
      assert(Array.isArray(questions[0].options), 'Expected question options');
    }
  });

  // Test 6: ClassSarthi Mastery Quiz Fetch
  runner.setSuite('Mastery Diagnostics & Analytics', 'mastery_quizzes');
  await runner.runTest('Fetch ClassSarthi Post-Lecture Mastery Quiz', async () => {
    const res = await apiRequest(ctx.baseUrl, `/api/lectures/${testLectureId}/mastery-quiz`);
    assert.strictEqual(res.status, 200);
    const questions = res.data.quiz?.questions || res.data.questions;
    assert(Array.isArray(questions), 'Expected mastery quiz questions array');
  });

  // Test 7: ClassSarthi Quiz Evaluation & Concept Weakness Diagnostics
  await runner.runTest('ClassSarthi Quiz Evaluation & Dynamic Concept Mastery Update', async () => {
    const res = await apiRequest(ctx.baseUrl, `/api/lectures/${testLectureId}/quiz-evaluate`, {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        studentId: 'student-1',
        answers: {
          0: 1,
          1: 0
        }
      }
    });

    assert.strictEqual(res.status, 200);
    assert(typeof res.data.score === 'number', 'Expected numerical score');
    assert(Array.isArray(res.data.weakConcepts || res.data.understoodConcepts), 'Expected concept diagnostics');
  });

  // Test 8: Student Dashboard Summary with Cognitive Progress
  await runner.runTest('Student Cognitive Dashboard Summary & Weak Concept Radar', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/students/student-1/dashboard-summary');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.todayClasses), 'Expected todayClasses array');
    assert(Array.isArray(res.data.recommendedStudy), 'Expected recommendedStudy array');
  });

  // Test 9: Delete Test Smart Note
  await runner.runTest('Clean up Created Smart Note', async () => {
    if (createdNoteId) {
      const res = await apiRequest(ctx.baseUrl, `/api/notes/${createdNoteId}`, {
        method: 'DELETE',
        token: ctx.studentToken
      });
      assert.strictEqual(res.status, 200);
    }
  });
}
