import { FAKE_USERS } from '../src/mock/fakeData';
import {
  persistUserToCloud,
  findUserInCloud,
  loadUsersFromCloud,
  deleteUserFromCloud
} from '../src/server/supabaseUsers';
import { User } from '../src/types';
import { synthesizeMasteryQuizFromContent, evaluateQuizPerformance } from '../src/lib/quizGenerator';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-user-id'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse path
  let path = req.url || '';
  const matched = req.headers['x-matched-path'] || req.headers['x-now-route-matches'];
  if (typeof matched === 'string') path = matched;
  path = path.split('?')[0];

  try {
    // 1. GET /api/auth/public-users
    if (path.includes('/api/auth/public-users') || path.endsWith('/public-users')) {
      const cloudUsers = await loadUsersFromCloud();
      const all = [...FAKE_USERS];
      for (const cu of cloudUsers) {
        const idx = all.findIndex(u => u.id === cu.id);
        if (idx !== -1) all[idx] = cu;
        else all.push(cu);
      }
      res.status(200).json({ users: all });
      return;
    }

    // 2. POST /api/auth/login
    if (path.includes('/api/auth/login') && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { identifier, password, role } = body;
      const rawId = (identifier || '').trim();
      const loginId = rawId.toLowerCase();
      const loginPass = (password || '').trim();

      if (!loginId) {
        res.status(400).json({ error: 'Username or Institutional ID is required' });
        return;
      }

      // 1. Search in local seed users
      let user = FAKE_USERS.find(u =>
        (u.username && u.username.toLowerCase() === loginId) ||
        (u.email && u.email.toLowerCase() === loginId) ||
        (u.institutionalId && u.institutionalId.toLowerCase() === loginId) ||
        (u.name && u.name.toLowerCase() === loginId)
      );

      // 2. Search in Supabase Cloud
      if (!user) {
        user = await findUserInCloud(loginId);
      }

      if (!user) {
        res.status(401).json({
          error: `No registered account found matching "${rawId}". Please check your credentials or register as a new user.`
        });
        return;
      }

      const expectedPass = user.password || 'EduSync@260101';
      if (expectedPass !== loginPass) {
        res.status(401).json({
          error: 'Incorrect password. Please verify your credentials and try again.'
        });
        return;
      }

      const token = Buffer.from(JSON.stringify({ userId: user.id, role: user.role, time: Date.now() })).toString('base64');
      res.status(200).json({ success: true, token, user });
      return;
    }

    // 3. POST /api/users (Register User)
    if ((path.includes('/api/users') || path.endsWith('/users')) && !path.includes('/api/users/') && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { name, email, password, role, department, program, designation, phone, gender, academicYear, gpa, initialSubjectIds, teachingSubjectIds } = body;
      const targetRole = role || 'student';
      const cleanName = (name || '').trim().toLowerCase().split(' ')[0];
      const prefix = targetRole === 'teacher' ? 'BMU-FAC' : targetRole === 'admin' ? 'BMU-ADM' : '260';
      const finalInstId = `${prefix}-${Math.floor(202600 + Math.random() * 900)}`;

      const newUser: User = {
        id: `${targetRole}-${Date.now()}`,
        name: name || 'New User',
        email: email || `${cleanName}@bmu.edu.in`,
        username: `${targetRole === 'teacher' ? 'prof' : targetRole === 'admin' ? 'dean' : 'student'}.${cleanName}`,
        password: password || 'EduSync@260101',
        role: targetRole,
        gender: gender || 'Male',
        program: program || (targetRole === 'student' ? 'CSE' : undefined),
        institutionalId: finalInstId,
        department: department || 'Department of Computer Sciences',
        academicYear: targetRole === 'student' ? (academicYear || '1st Year') : undefined,
        designation: targetRole !== 'student' ? (designation || 'Faculty') : undefined,
        phone: phone || '+91 98765 43210',
        gpa: targetRole === 'student' ? Number(gpa || 8.0) : undefined,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        enrolledSubjectIds: targetRole === 'student' ? (initialSubjectIds || ['subj-ess', 'subj-calc', 'subj-eme']) : [],
        teachingSubjectIds: targetRole === 'teacher' ? (teachingSubjectIds || []) : []
      };

      await persistUserToCloud(newUser);
      res.status(201).json({ success: true, user: newUser });
      return;
    }

    // 4. DELETE /api/users/:id
    if (path.includes('/api/users/') && req.method === 'DELETE') {
      const parts = path.split('/api/users/');
      const userId = parts[1]?.split('?')[0];
      if (userId) {
        await deleteUserFromCloud(userId);
      }
      res.status(200).json({ success: true, message: 'User unregistered successfully' });
      return;
    }

    // 5. POST /api/admin/provision-department
    if (path.includes('/api/admin/provision-department') && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { users } = body;
      if (Array.isArray(users)) {
        for (const u of users) {
          persistUserToCloud(u).catch(() => {});
        }
      }
      res.status(200).json({ success: true, message: 'Department provisioned' });
      return;
    }

    // 6. POST /api/ai/quiz/generate-mastery-quiz
    if (path.includes('/api/ai/quiz/generate-mastery-quiz') && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { noteContent = '', title = 'Lecture Checkpoint', count = 5, learnerProfile } = body;

      if (process.env.GEMINI_API_KEY) {
        try {
          const { generateMasteryQuizAI } = await import('../src/server/gemini');
          const result = await generateMasteryQuizAI(noteContent, title, learnerProfile, count);
          if (result && Array.isArray(result.questions) && result.questions.length >= 3) {
            res.status(200).json(result);
            return;
          }
        } catch (geminiErr) {
          console.warn('[Serverless Gemini Quiz Warning]', geminiErr);
        }
      }

      const questions = synthesizeMasteryQuizFromContent(noteContent, title, learnerProfile, count);
      res.status(200).json({
        title: `Mastery Quiz: ${title}`,
        questions
      });
      return;
    }

    // 7. POST /api/ai/quiz/analyze-performance
    if (path.includes('/api/ai/quiz/analyze-performance') && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { quizTitle = 'Quiz', questions = [], userAnswers = [], learnerProfile } = body;

      if (process.env.GEMINI_API_KEY) {
        try {
          const { analyzeQuizPerformanceAI } = await import('../src/server/gemini');
          const analysis = await analyzeQuizPerformanceAI(quizTitle, questions, userAnswers, learnerProfile);
          if (analysis) {
            res.status(200).json(analysis);
            return;
          }
        } catch (geminiErr) {
          console.warn('[Serverless Gemini Analysis Warning]', geminiErr);
        }
      }

      const answersMap: Record<number, number> = {};
      (userAnswers || []).forEach((ans: number, idx: number) => {
        answersMap[idx] = ans;
      });
      const localAnalysis = evaluateQuizPerformance(quizTitle, questions, answersMap, learnerProfile);
      res.status(200).json(localAnalysis);
      return;
    }

    // 8. Default health status
    res.status(200).json({ status: 'ok', time: new Date().toISOString(), path });
  } catch (err: any) {
    console.error('[Serverless Error]', err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
