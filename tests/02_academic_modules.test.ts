import { TestContext, TestRunner, apiRequest } from './test_helpers';
import assert from 'assert';

export async function runAcademicModulesTests(ctx: TestContext, runner: TestRunner) {
  runner.setSuite('Academic Operations & Assessment', 'academic_core');

  let testSubjectId = 'sub_cs101';
  let createdAssignmentId = '';
  let createdSubmissionId = '';

  // Test 1: Fetch all Subjects catalog
  await runner.runTest('Fetch Subjects Directory', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/subjects');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data), 'Expected array of subjects');
    assert(res.data.length > 0, 'Expected at least one seeded subject');
    testSubjectId = res.data[0].id;
  });

  // Test 2: Fetch single Subject details
  await runner.runTest('Fetch Single Subject Details', async () => {
    const res = await apiRequest(ctx.baseUrl, `/api/subjects/${testSubjectId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.id, testSubjectId);
    assert(res.data.name, 'Expected subject name');
  });

  // Test 3: Student Course Enrollment
  await runner.runTest('Student Course Enrollment Workflow', async () => {
    const res = await apiRequest(ctx.baseUrl, `/api/subjects/${testSubjectId}/enroll`, {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        studentId: 'student-1'
      }
    });

    assert.strictEqual(res.status, 200);
    assert(res.data.success, 'Expected success status');
  });

  // Test 4: Fetch Subject Syllabus Timeline
  await runner.runTest('Fetch Syllabus Timeline Milestones', async () => {
    const res = await apiRequest(ctx.baseUrl, `/api/timelines/${testSubjectId}`);
    assert.strictEqual(res.status, 200);
    const items = Array.isArray(res.data) ? res.data : (res.data.timelines || res.data.items || []);
    assert(Array.isArray(items), 'Expected array of timeline milestones');
  });

  // Test 5: Create a new Syllabus Milestone
  let createdTimelineId = '';
  await runner.runTest('Create Syllabus Timeline Milestone', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/timelines', {
      method: 'POST',
      token: ctx.teacherToken,
      body: {
        subjectId: testSubjectId,
        title: 'Midterm Review & Problem Set Workshop',
        date: '2026-10-15',
        type: 'lecture',
        description: 'Comprehensive review of Newton laws and kinetic energy'
      }
    });

    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    assert(res.data.id, 'Expected generated timeline item ID');
    createdTimelineId = res.data.id;
  });

  // Test 6: Delete the created Syllabus Milestone
  await runner.runTest('Delete Syllabus Timeline Milestone', async () => {
    if (createdTimelineId) {
      const res = await apiRequest(ctx.baseUrl, `/api/timelines/${createdTimelineId}`, {
        method: 'DELETE',
        token: ctx.teacherToken
      });
      assert.strictEqual(res.status, 200);
    }
  });

  // Test 7: Fetch Reference Resources
  await runner.runTest('Fetch Reference Courseware Resources', async () => {
    const res = await apiRequest(ctx.baseUrl, `/api/resources/${testSubjectId}`);
    assert.strictEqual(res.status, 200);
    const resources = Array.isArray(res.data) ? res.data : (res.data.resources || []);
    assert(Array.isArray(resources));
  });

  // Test 8: Create Assignment with Weighted Rubrics
  await runner.runTest('Create Faculty Assignment with Weighted Rubrics', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/assignments', {
      method: 'POST',
      token: ctx.teacherToken,
      body: {
        subjectId: testSubjectId,
        title: 'Kinematics & Free-Body Diagram Analysis Lab',
        description: 'Derive equations of motion and provide complete free-body diagrams for inclined planes.',
        dueDate: '2026-09-30T23:59:59Z',
        totalPoints: 100,
        rubric: [
          { id: 'crit_1', name: 'Free-Body Diagram Accuracy', maxPoints: 40, weight: 0.4 },
          { id: 'crit_2', name: 'Mathematical Derivation ($F=ma$)', maxPoints: 40, weight: 0.4 },
          { id: 'crit_3', name: 'Conclusion & Error Discussion', maxPoints: 20, weight: 0.2 }
        ]
      }
    });

    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    assert(res.data.id, 'Expected generated assignment ID');
    assert(Array.isArray(res.data.rubric), 'Expected rubric criteria array');
    createdAssignmentId = res.data.id;
  });

  // Test 9: Student Submits Assignment
  await runner.runTest('Student Assignment Submission Workflow', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/submissions', {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        assignmentId: createdAssignmentId,
        studentId: 'student-1',
        content: 'Submitted full derivation with LaTeX equations: $$N = mg \\cos(\\theta)$$ and $$F_{net} = mg \\sin(\\theta) - f_k$$.',
        attachments: ['https://example.com/lab_report_kinematics.pdf']
      }
    });

    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    assert(res.data.id, 'Expected generated submission ID');
    assert.strictEqual(res.data.status, 'submitted');
    createdSubmissionId = res.data.id;
  });

  // Test 10: Faculty Rubric Grading of Submission
  await runner.runTest('Faculty Rubric Grading & Feedback Workflow', async () => {
    const res = await apiRequest(ctx.baseUrl, `/api/submissions/${createdSubmissionId}/grade`, {
      method: 'POST',
      token: ctx.teacherToken,
      body: {
        grade: 95,
        feedback: 'Outstanding mathematical derivation and clean Free-Body Diagrams. Excellent LaTeX typography.',
        rubricScores: {
          crit_1: 38,
          crit_2: 40,
          crit_3: 17
        }
      }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'graded');
    assert.strictEqual(res.data.grade, 95);
  });
}
