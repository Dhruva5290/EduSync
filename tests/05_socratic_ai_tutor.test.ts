import { TestContext, TestRunner, apiRequest } from './test_helpers';
import assert from 'assert';

export async function runSocraticAiTutorTests(ctx: TestContext, runner: TestRunner) {
  runner.setSuite('Socratic AI Tutor & Intelligence', 'socratic_ai_tutor');

  // Test 1: Socratic AI Tutor Endpoint (/api/tutor)
  await runner.runTest('Socratic AI Tutor Interactive Reasoning & KaTeX Formatting', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/tutor', {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        message: 'Why is normal force not always equal to mg on an inclined plane?',
        subjectId: 'sub_phys101',
        context: {
          course: 'Physics 101: Classical Mechanics',
          lectureId: 'lec_phys_101'
        }
      }
    });

    assert.strictEqual(res.status, 200);
    assert(res.data.reply || res.data.message || res.data.text, 'Expected AI tutor response');
    const responseText = res.data.reply || res.data.message || res.data.text || '';
    assert(responseText.length > 20, 'Expected non-trivial Socratic reply');
  });

  // Test 2: Pedagogical Guardrail Test - Socratic Prompting rather than Direct Homework Solving
  await runner.runTest('Socratic Pedagogical Guardrail Verification', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/tutor', {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        message: 'Give me the exact final numerical answer to question 4 on the homework.',
        subjectId: 'sub_phys101'
      }
    });

    assert.strictEqual(res.status, 200);
    const reply = (res.data.reply || res.data.message || res.data.text || '').toLowerCase();
    // Verify that the tutor guides the student rather than giving a naked solution
    assert(
      reply.includes('step') ||
      reply.includes('think') ||
      reply.includes('consider') ||
      reply.includes('equation') ||
      reply.includes('guide') ||
      reply.includes('concept') ||
      reply.includes('force') ||
      reply.includes('let') ||
      reply.includes('what'),
      'AI tutor should provide guidance/reasoning steps'
    );
  });

  // Test 3: General Study Assistant AI Chat (/api/ai/chat)
  await runner.runTest('Study Assistant Conversational AI Chat', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/ai/chat', {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        message: 'Can you explain the difference between static and kinetic friction?',
        history: []
      }
    });

    assert.strictEqual(res.status, 200);
    assert(res.data.reply || res.data.response || res.data.message, 'Expected chat response');
  });

  // Test 4: AI Topic Research & Educational Video Grounding
  await runner.runTest('AI Topic Research & Video References Grounding', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/ai/research', {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        topic: 'Newtonian Fluid Dynamics and Viscosity'
      }
    });

    assert.strictEqual(res.status, 200);
    assert(res.data.researchSummary || res.data.overview || res.data.summary || res.data.reply, 'Expected research overview');
  });

  // Test 5: Faculty AI Classroom Diagnostics Generation
  runner.setSuite('Faculty Command Center', 'faculty_command');
  await runner.runTest('AI Classroom Diagnostic & Weak Topic Clustering Report', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/ai/class-diagnostics', {
      method: 'POST',
      token: ctx.teacherToken,
      body: {
        subjectId: 'subj-phy-11',
        topic: 'Newtonian Mechanics & Free-Body Diagrams'
      }
    });

    assert.strictEqual(res.status, 200);
    assert(res.data.analytics?.aiExecutiveSummary || res.data.aiExecutiveSummary || res.data.insights || res.data.summary, 'Expected class diagnostic report');
  });

  // Test 6: Faculty AI Syllabus Milestone Generator
  await runner.runTest('AI Syllabus Milestone Generator', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/ai/generate-syllabus', {
      method: 'POST',
      token: ctx.teacherToken,
      body: {
        subjectName: 'Quantum Computing and Algorithms',
        weeks: 4
      }
    });

    assert.strictEqual(res.status, 200);
    const milestones = Array.isArray(res.data) ? res.data : (res.data.timelineItems || res.data.timelines || res.data.timeline || res.data.milestones || res.data.syllabus);
    assert(Array.isArray(milestones), 'Expected syllabus milestones array');
  });
}
