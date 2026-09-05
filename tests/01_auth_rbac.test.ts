import { TestContext, TestRunner, apiRequest } from './test_helpers';
import assert from 'assert';

export async function runAuthRbacTests(ctx: TestContext, runner: TestRunner) {
  runner.setSuite('Authentication & RBAC', 'auth_rbac');

  // Test 1: Student Login with valid credentials
  await runner.runTest('Student Login with Valid Credentials', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/auth/login', {
      method: 'POST',
      body: {
        identifier: 'aarav.sharma',
        password: 'Student@2026!',
        role: 'student'
      }
    });

    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert(res.data.token, 'Expected token in response');
    assert.strictEqual(res.data.user.role, 'student', 'Expected student role');
    assert.strictEqual(res.data.user.username, 'aarav.sharma');
  });

  // Test 2: Teacher Login with Valid Credentials
  await runner.runTest('Teacher / Faculty Login with Valid Credentials', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/auth/login', {
      method: 'POST',
      body: {
        identifier: 'prof.rajesh',
        password: 'Physics@2026!',
        role: 'teacher'
      }
    });

    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert(res.data.token, 'Expected token in response');
    assert.strictEqual(res.data.user.role, 'teacher');
  });

  // Test 3: Admin / Dean Login with Valid Credentials
  await runner.runTest('Admin / Dean Login with Valid Credentials', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/auth/login', {
      method: 'POST',
      body: {
        identifier: 'dean.maneek',
        password: 'Dean@EduSync2026!',
        role: 'admin'
      }
    });

    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert(res.data.token, 'Expected token in response');
    assert.strictEqual(res.data.user.role, 'admin');
  });

  // Test 4: Rejection of Missing Username/Email
  await runner.runTest('Login Rejection when Identifier is Missing', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/auth/login', {
      method: 'POST',
      body: {
        password: 'Student@2026!'
      }
    });

    assert.strictEqual(res.status, 400, `Expected 400 Bad Request, got ${res.status}`);
    assert(res.data.error, 'Expected error message');
  });

  // Test 5: Session Profile Retrieval (/api/auth/me) with Bearer Token
  await runner.runTest('Session Profile Retrieval (/api/auth/me)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/auth/me', {
      token: ctx.studentToken
    });

    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert(res.data.user, 'Expected user object');
    assert(res.data.user.id, 'Expected user id');
  });

  // Test 6: Public Users List for Fast Persona Selector
  await runner.runTest('Public Users Directory for Quick Persona Switching', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/auth/public-users');

    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const users = Array.isArray(res.data) ? res.data : (res.data.users || []);
    assert(Array.isArray(users), 'Expected array of users');
    assert(users.length > 0, 'Expected non-empty users list');
    
    // Check that sensitive fields like raw password are not leaked
    const sample = users[0];
    assert(!sample.passwordHash, 'passwordHash should not be leaked in public-users');
  });

  // Test 7: Fast User Switch Endpoint (/api/auth/switch)
  await runner.runTest('Persona Switch Endpoint (/api/auth/switch)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/auth/switch', {
      method: 'POST',
      token: ctx.adminToken,
      body: {
        userId: 'student-1'
      }
    });

    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert(res.data.token, 'Expected token for switched user');
    assert.strictEqual(res.data.user.id, 'student-1');
  });

  // Test 8: RBAC Protection - Student cannot access Admin Vault Archive
  await runner.runTest('RBAC Protection: Student Denied Admin Vault Endpoints', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/admin/vault/list', {
      token: ctx.studentToken
    });

    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
    assert(res.data.error, 'Expected error message on forbidden access');
  });

  // Test 9: RBAC Access - Admin can access Admin Vault Archive
  await runner.runTest('RBAC Protection: Admin Authorized for Admin Vault Endpoints', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/admin/vault/list', {
      token: ctx.adminToken
    });

    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    assert(Array.isArray(res.data.snapshots), 'Expected array of snapshots');
  });
}
