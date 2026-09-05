process.env.TEST_MODE = 'true';
process.env.SKIP_LISTEN = 'true';

import http from 'http';
import { db } from '../src/server/db';
import { User } from '../src/types';

export interface TestContext {
  server: http.Server;
  baseUrl: string;
  studentToken: string;
  teacherToken: string;
  adminToken: string;
  close: () => Promise<void>;
}

export interface TestResult {
  suite: string;
  name: string;
  feature: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  bugReport?: {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    issue: string;
    expected: string;
    actual: string;
    recommendation: string;
  };
}

export function generateAuthToken(user: User): string {
  return Buffer.from(JSON.stringify({ userId: user.id, role: user.role, time: Date.now() })).toString('base64');
}

export class TestRunner {
  private results: TestResult[] = [];
  private currentSuite = 'General';
  private currentFeature = 'Core';

  setSuite(suiteName: string, featureName: string = 'Core') {
    this.currentSuite = suiteName;
    this.currentFeature = featureName;
  }

  async runTest(
    name: string,
    fn: () => Promise<void>,
    options?: {
      feature?: string;
      expectedBug?: {
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        issue: string;
        expected: string;
        recommendation: string;
      };
    }
  ): Promise<boolean> {
    const start = Date.now();
    const feature = options?.feature || this.currentFeature;

    try {
      await fn();
      const durationMs = Date.now() - start;
      this.results.push({
        suite: this.currentSuite,
        name,
        feature,
        passed: true,
        durationMs
      });
      console.log(`  \x1b[32m✔\x1b[0m ${name} \x1b[90m(${durationMs}ms)\x1b[0m`);
      return true;
    } catch (err: any) {
      const durationMs = Date.now() - start;
      const errorMsg = err?.message || String(err);
      
      const bugReport = options?.expectedBug
        ? {
            ...options.expectedBug,
            actual: errorMsg
          }
        : {
            severity: 'MEDIUM' as const,
            issue: `Assertion or Execution failure in: ${name}`,
            expected: 'Successful execution with appropriate HTTP status/response',
            actual: errorMsg,
            recommendation: 'Check endpoint handler logic, null checks, and validation guards.'
          };

      this.results.push({
        suite: this.currentSuite,
        name,
        feature,
        passed: false,
        durationMs,
        error: errorMsg,
        bugReport
      });
      console.log(`  \x1b[31m✖\x1b[0m ${name} \x1b[90m(${durationMs}ms)\x1b[0m`);
      console.log(`    \x1b[33mIssue:\x1b[0m ${errorMsg}`);
      return false;
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }
}

export async function setupTestServer(): Promise<TestContext> {
  process.env.TEST_MODE = 'true';
  process.env.SKIP_LISTEN = 'true';

  const { app } = await import('../server');
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve();
    });
  });

  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 3000;
  const baseUrl = `http://127.0.0.1:${port}`;

  // Find users for tokens
  const student = db.users.find(u => u.role === 'student') || db.users[0];
  const teacher = db.users.find(u => u.role === 'teacher') || db.users[1];
  const admin = db.users.find(u => u.role === 'admin') || db.users[2];

  const studentToken = generateAuthToken(student);
  const teacherToken = generateAuthToken(teacher);
  const adminToken = generateAuthToken(admin);

  return {
    server,
    baseUrl,
    studentToken,
    teacherToken,
    adminToken,
    close: () => {
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  };
}

export async function apiRequest(
  baseUrl: string,
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
) {
  const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  let data: any = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return {
    status: res.status,
    headers: res.headers,
    data,
    ok: res.ok
  };
}
