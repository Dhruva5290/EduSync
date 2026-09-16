import { TestContext, TestRunner, apiRequest } from './test_helpers';
import assert from 'assert';

export async function runPluginsSystemTests(ctx: TestContext, runner: TestRunner) {
  runner.setSuite('Plugins & MCP Automation Hub', 'plugins_mcp');

  // Test 1: Fetch all plugins
  await runner.runTest('Fetch all pre-built plugins (GET /api/plugins)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/plugins');
    assert.strictEqual(res.status, 200, 'Status should be 200');
    assert.strictEqual(res.data.success, true, 'success should be true');
    assert(Array.isArray(res.data.plugins), 'plugins should be an array');
    assert(res.data.plugins.length >= 4, 'should have at least 4 pre-built plugins');
    const classroom = res.data.plugins.find((p: any) => p.pluginId === 'google_classroom');
    assert(Boolean(classroom), 'Google Classroom plugin should exist');
  });

  // Test 2: Connect a plugin via OAuth2
  await runner.runTest('Connect external plugin (POST /api/plugins/connect)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/plugins/connect', {
      method: 'POST',
      body: {
        pluginId: 'notion',
        accountEmail: 'student.dhruva@notion.so',
      },
    });
    assert.strictEqual(res.status, 200, 'Status should be 200');
    assert.strictEqual(res.data.success, true, 'success should be true');
    assert.strictEqual(res.data.plugin.status, 'connected', 'Notion should be connected');
    assert.strictEqual(res.data.plugin.accountEmail, 'student.dhruva@notion.so', 'Account email should match');
  });

  // Test 3: Toggle automation rule
  await runner.runTest('Toggle plugin automation rule (POST /api/plugins/:id/rules/toggle)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/plugins/plugin-gc/rules/toggle', {
      method: 'POST',
      body: {
        ruleId: 'rule-gc-3',
        enabled: true,
      },
    });
    assert.strictEqual(res.status, 200, 'Status should be 200');
    assert.strictEqual(res.data.success, true, 'success should be true');
    assert.strictEqual(res.data.rule.enabled, true, 'Rule should be enabled');
  });

  // Test 4: Force synchronization
  await runner.runTest('Trigger manual plugin synchronization (POST /api/plugins/:id/sync)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/plugins/plugin-gc/sync', {
      method: 'POST',
    });
    assert.strictEqual(res.status, 200, 'Status should be 200');
    assert.strictEqual(res.data.success, true, 'success should be true');
    assert.strictEqual(res.data.plugin.lastSync, 'Just now', 'Last sync should be updated');
  });

  // Test 5: Test plugin connection health
  await runner.runTest('Test plugin connection diagnostics (POST /api/plugins/:id/test)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/plugins/plugin-gc/test', {
      method: 'POST',
    });
    assert.strictEqual(res.status, 200, 'Status should be 200');
    assert.strictEqual(res.data.success, true, 'success should be true');
    assert.strictEqual(res.data.status, 'Active & Responding', 'Status should be active');
  });

  // Test 6: Fetch custom tutors
  await runner.runTest('Fetch custom tutors (GET /api/tutors)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/tutors');
    assert.strictEqual(res.status, 200, 'Status should be 200');
    assert.strictEqual(res.data.success, true, 'success should be true');
    assert(Array.isArray(res.data.tutors), 'tutors should be an array');
    assert(res.data.tutors.length >= 3, 'should have initial approved tutors');
  });

  // Test 7: Create custom tutor with MCP configuration
  await runner.runTest('Create custom tutor persona with MCP (POST /api/tutors/create)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/tutors/create', {
      method: 'POST',
      body: {
        name: 'Prof. Emmy Noether',
        specialty: 'Symmetries & Conservation Laws',
        bio: 'Pioneer of abstract algebra and theoretical physics.',
        method: 'feynman',
        prompt: 'Connect physical conservation laws to underlying continuous symmetries. Use intuitive geometric analogies.',
        mcpConfig: {
          provider: 'anthropic',
          mcpUrl: 'https://api.noether.internal/mcp',
          authMethod: 'bearer',
          capabilities: ['Answer questions', 'Generate examples'],
        },
      },
    });
    assert.strictEqual(res.status, 200, 'Status should be 200');
    assert.strictEqual(res.data.success, true, 'success should be true');
    assert.strictEqual(res.data.tutor.status, 'pending_approval', 'New tutor should be pending approval');
    assert.strictEqual(res.data.tutor.name, 'Prof. Emmy Noether', 'Tutor name should match');
  });

  // Test 8: Live MCP Connection Test
  await runner.runTest('Live MCP Connection Test (POST /api/tutors/test-mcp)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/tutors/test-mcp', {
      method: 'POST',
      body: {
        provider: 'anthropic',
        mcpUrl: 'https://api.noether.internal/mcp',
        capabilities: ['Answer questions', 'Generate examples'],
      },
    });
    assert.strictEqual(res.status, 200, 'Status should be 200');
    assert.strictEqual(res.data.success, true, 'success should be true');
    assert.strictEqual(res.data.status, 'verified', 'MCP test should be verified');
  });

  // Test 9: Get pending tutor approval requests
  await runner.runTest('Get pending tutor approvals (GET /api/admin/tutors/pending)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/admin/tutors/pending');
    assert.strictEqual(res.status, 200, 'Status should be 200');
    assert.strictEqual(res.data.success, true, 'success should be true');
    assert(Array.isArray(res.data.requests), 'requests should be an array');
    assert(res.data.pendingCount >= 1, 'should have pending requests');
  });

  // Test 10: Run diagnostic sample test on submitted tutor
  await runner.runTest('Run sample test query against custom tutor (POST /api/admin/tutors/:id/test-sample)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/admin/tutors/req-101/test-sample', {
      method: 'POST',
      body: {
        question: 'Explain why energy is conserved in a time-invariant system.',
      },
    });
    assert.strictEqual(res.status, 200, 'Status should be 200');
    assert.strictEqual(res.data.success, true, 'success should be true');
    assert(typeof res.data.response === 'string' && res.data.response.length > 20, 'Should return generated response');
  });

  // Test 11: Authorize & Approve custom tutor
  await runner.runTest('Authorize & Approve tutor request (POST /api/admin/tutors/:id/approve)', async () => {
    const res = await apiRequest(ctx.baseUrl, '/api/admin/tutors/req-101/approve', {
      method: 'POST',
      body: {
        adminNotes: 'Approved by Dean of Physical Sciences',
      },
    });
    assert.strictEqual(res.status, 200, 'Status should be 200');
    assert.strictEqual(res.data.success, true, 'success should be true');
    assert.strictEqual(res.data.request.status, 'approved', 'Request should be approved');
  });
}
