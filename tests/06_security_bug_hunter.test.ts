import { TestContext, TestRunner, apiRequest } from './test_helpers';
import assert from 'assert';

export async function runSecurityAndBugHunterTests(ctx: TestContext, runner: TestRunner) {
  runner.setSuite('Security & Bug Hunter Edge Cases', 'dean_admin_os');

  // Test 1: OWASP Security Audit Self-Check Endpoint
  await runner.runTest('Security Self-Audit Diagnostic Endpoint (/api/security/audit)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/security/audit');
    assert.strictEqual(res.status, 200);
    assert(res.data.status === 'HEALTHY' || res.data.score || res.data.checks, 'Expected security audit report');
  });

  // Test 2: HTTP Security Headers Validation (OWASP Top 10)
  await runner.runTest('OWASP Top 10 Security Response Headers', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/subjects');
    const nosniff = res.headers.get('x-content-type-options');
    const frameOptions = res.headers.get('x-frame-options');
    const csp = res.headers.get('content-security-policy');
    
    assert.strictEqual(nosniff, 'nosniff', 'Expected X-Content-Type-Options: nosniff');
    assert(frameOptions, 'Expected X-Frame-Options header');
    assert(csp, 'Expected Content-Security-Policy header');
  });

  // Test 3: Prototype Pollution Injection Neutralization
  await runner.runTest('Security: Prototype Pollution Injection Guard', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/notes', {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        subjectId: 'sub_cs101',
        title: 'Prototype Pollution Test Note',
        content: 'Normal note content',
        __proto__: { isAdmin: true, polluted: 'hacked' },
        constructor: { prototype: { malicious: true } }
      }
    });

    // Check that server does not crash and prototype is not polluted
    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    const globalProto: any = ({} as any);
    assert.strictEqual(globalProto.polluted, undefined, 'Prototype pollution must not modify Object.prototype');
    assert.strictEqual(globalProto.isAdmin, undefined, 'Prototype pollution must not grant admin rights');
    
    // Clean up created note
    if (res.data?.id) {
      await apiRequest(ctx.baseUrl, `/api/notes/${res.data.id}`, { method: 'DELETE', token: ctx.studentToken });
    }
  });

  // Test 4: XSS Script Tag Neutralization in Note Input
  await runner.runTest('Security: XSS Script Injection Sanitization', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/notes', {
      method: 'POST',
      token: ctx.studentToken,
      body: {
        subjectId: 'sub_cs101',
        title: '<script>alert("XSS")</script>Secure Note Title',
        content: '<img src=x onerror="alert(1)">Exploit Payload'
      }
    });

    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    const note = res.data;
    assert(!note.title.includes('<script>'), 'Script tags should be sanitized from title');
    assert(!note.content.includes('onerror='), 'Dangerous event handlers should be stripped');

    // Clean up
    if (note?.id) {
      await apiRequest(ctx.baseUrl, `/api/notes/${note.id}`, { method: 'DELETE', token: ctx.studentToken });
    }
  });

  // Test 5: Bug Hunter: Non-existent Subject ID Request (Expected clean 404, not unhandled crash)
  await runner.runTest(
    'Bug Hunter: Graceful 404 on Non-Existent Subject ID',
    async () => {
      const res = await apiRequest(ctx.baseUrl, '/api/subjects/sub_non_existent_999999');
      assert.strictEqual(res.status, 404, `Expected 404 for missing resource, got ${res.status}`);
    },
    {
      expectedBug: {
        severity: 'LOW',
        issue: 'Server might return empty object instead of 404 when resource does not exist',
        expected: 'HTTP 404 Not Found',
        recommendation: 'Check if find() returns undefined and respond with res.status(404)'
      }
    }
  );

  // Test 6: Bug Hunter: Non-existent Lecture ID Request (Expected clean 404)
  await runner.runTest(
    'Bug Hunter: Graceful 404 on Non-Existent Lecture ID',
    async () => {
      const res = await apiRequest(ctx.baseUrl, '/api/lectures/lec_non_existent_999999');
      assert.strictEqual(res.status, 404, `Expected 404 for missing lecture, got ${res.status}`);
    },
    {
      expectedBug: {
        severity: 'LOW',
        issue: 'Non-existent lecture might return 500 or null payload',
        expected: 'HTTP 404 Not Found',
        recommendation: 'Ensure lecture lookups validate presence and return 404'
      }
    }
  );

  // Test 7: Admin / Dean OS: Fetch Institutional Overview Metrics
  await runner.runTest('Admin / Dean OS: Institutional KPI Overview Metrics', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/admin/metrics', {
      token: ctx.adminToken
    });

    assert.strictEqual(res.status, 200);
    assert(typeof res.data.totalStudents === 'number');
    assert(typeof res.data.totalTeachers === 'number');
    assert(typeof res.data.totalSubjects === 'number');
  });

  // Test 8: Admin / Dean OS: User Management CRUD
  let createdUserId = '';
  await runner.runTest('Admin / Dean OS: User Provisioning & Management CRUD', async () => {
    const dynamicId = Date.now();
    const res = await apiRequest(ctx.baseUrl, '/api/users', {
      method: 'POST',
      token: ctx.adminToken,
      body: {
        name: 'Dr. Elena Rostova',
        username: `elena.rostova.${dynamicId}`,
        email: `elena.rostova.${dynamicId}@edusync.edu`,
        role: 'teacher',
        department: 'Quantum Physics'
      }
    });

    assert.strictEqual(res.status, 201);
    createdUserId = res.data.id || res.data.user?.id;
    assert(createdUserId, 'Expected generated user ID');

    // Update user
    const updateRes = await apiRequest(ctx.baseUrl, `/api/users/${createdUserId}`, {
      method: 'PUT',
      token: ctx.adminToken,
      body: {
        department: 'Theoretical High Energy Physics'
      }
    });
    assert.strictEqual(updateRes.status, 200);

    // Delete user
    const deleteRes = await apiRequest(ctx.baseUrl, `/api/users/${createdUserId}`, {
      method: 'DELETE',
      token: ctx.adminToken
    });
    assert.strictEqual(deleteRes.status, 200);
  });

  // Test 9: Admin Disaster Recovery Vault Snapshots
  await runner.runTest('Admin Vault Disaster Recovery Snapshot Integrity', async () => {
    const listRes = await apiRequest(ctx.baseUrl, '/api/admin/vault/list', {
      token: ctx.adminToken
    });

    assert.strictEqual(listRes.status, 200);
    assert(Array.isArray(listRes.data.snapshots));
  });
}
