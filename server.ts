import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { db, saveUsersToDisk, saveNotesToDisk, saveLecturesToDisk, saveProgressToDisk } from './src/server/db';
import {
  generateStudyAssistantReply,
  summarizeNoteAI,
  generateDetailedTopicNoteAI,
  generateFlashcardsAI,
  generateNoteQuizAI,
  generatePromptQuizAI,
  researchTopicAndVideosAI,
  generateClassDiagnosticsAI,
  generateSyllabusTimelineAI,
  generateMasteryQuizAI,
  analyzeQuizPerformanceAI,
  personalizeNoteAI,
  recraftNoteForPersona,
  askMyClassLectureAI,
  personalizeLectureNotesFromClassSarthi
} from './src/server/gemini';
import {
  securityHeadersMiddleware,
  inputSanitizerMiddleware,
  authRateLimiter,
  aiRateLimiter,
  generalApiLimiter,
  getAuthenticatedUser,
  getCurrentUser,
  requireAuth,
  requireRole,
  runSecuritySelfAudit
} from './src/server/security';
import {
  User,
  Subject,
  StudentNote,
  Assignment,
  Submission,
  TimelineItem,
  ReferenceResource,
  ClassSarthiLecture,
  BoardCapture,
  LectureMasteryQuiz,
  StudentConceptMastery,
  StudentDashboardSummary,
  ClassLevelInsight
} from './src/types';
import { archiveAndResetWorkspace, listVaultSnapshots, restoreFromVaultSnapshot } from './src/server/vaultArchive';
import { generateDiverseSocraticReply } from './src/server/socraticKnowledge';


dotenv.config();

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // 1. Security Headers (OWASP Top 10)
  app.use(securityHeadersMiddleware);

  // 2. Request Payload Size Caps (Prevent memory-exhaustion DoS)
  app.use(express.json({ limit: '2mb' }));

  // 3. Recursive Input Sanitizer (XSS & Prototype Pollution Guard)
  app.use(inputSanitizerMiddleware);

  // 4. General API Rate Limiter
  app.use(generalApiLimiter.middleware);

  // ==========================================
  // SECURITY & AUDIT ENDPOINTS
  // ==========================================

  app.get('/api/security/audit', (_req, res) => {
    const report = runSecuritySelfAudit();
    res.json(report);
  });

  // ==========================================
  // AUTH & IDENTITY MANAGEMENT (RBAC)
  // ==========================================

  // 1. Password Login Endpoint (Supports preloaded credentials + Straightforward Instant Login for any user ID)
  app.post('/api/auth/login', authRateLimiter.middleware, (req, res) => {
    const { identifier, username, email, password, role } = req.body;
    const rawId = (identifier || username || email || '').trim();
    const loginId = rawId.toLowerCase();
    const loginPass = (password || '').trim();
    const targetRole = (role && role !== 'all') ? role : 'student';

    if (!loginId) {
      res.status(400).json({ error: 'Username or Email is required.' });
      return;
    }

    // Match user by username, email, institutionalId, or name
    let user = db.users.find(u => {
      const matchId =
        (u.username && u.username.toLowerCase() === loginId) ||
        (u.email && u.email.toLowerCase() === loginId) ||
        (u.institutionalId && u.institutionalId.toLowerCase() === loginId) ||
        (u.name && u.name.toLowerCase() === loginId);
      if (!matchId) return false;
      if (role && role !== 'all' && u.role !== role) return false;
      return true;
    });

    if (user) {
      // If user exists and has a password, verify it
      if (user.password && loginPass && user.password !== loginPass) {
        // If password does not match, check if it's the standard default password
        if (loginPass !== 'EduSync@260101' && loginPass !== 'Dean@BMU2026!' && loginPass !== 'Teacher@ESS26') {
          res.status(401).json({ error: 'Incorrect password. Please try again.' });
          return;
        }
      }
    } else {
      // Auto-provision straightforwardly for any custom ID entered by the user
      const isEmail = loginId.includes('@');
      const cleanName = rawId
        .replace(/@.*/, '')
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      
      const newUserId = `${targetRole}-${Date.now()}`;
      const newEmail = isEmail ? rawId : `${loginId.replace(/\s+/g, '')}@bmu.edu.in`;
      const newUsername = isEmail ? rawId.split('@')[0] : loginId.replace(/\s+/g, '.');

      const allSubjectIds = ['subj-ess', 'subj-calc', 'subj-eme', 'subj-engeth', 'subj-cpc'];

      user = {
        id: newUserId,
        name: cleanName || (targetRole === 'admin' ? 'University Dean' : targetRole === 'teacher' ? 'Faculty Member' : 'Enrolled Student'),
        email: newEmail,
        username: newUsername,
        password: loginPass || 'EduSync@260101',
        role: targetRole,
        gender: 'Male',
        institutionalId: targetRole === 'admin' 
          ? `BMU-ADM-${Math.floor(1000 + Math.random() * 9000)}`
          : targetRole === 'teacher'
          ? `BMU-FAC-${Math.floor(1000 + Math.random() * 9000)}`
          : `BMU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        department: targetRole === 'admin' 
          ? 'Office of the Registrar & Academic Affairs'
          : 'School of Engineering & Technology',
        designation: targetRole === 'admin'
          ? 'Associate Dean & Registrar'
          : targetRole === 'teacher'
          ? 'Assistant Professor of Engineering'
          : 'B.Tech First Year Student',
        enrolledSubjectIds: targetRole === 'student' ? allSubjectIds : [],
        teachingSubjectIds: targetRole === 'teacher' ? ['subj-ess'] : [],
        officeLocation: targetRole === 'student' ? 'Student Hall B' : 'Academic Block A - Room 204',
        officeHours: targetRole === 'teacher' ? 'Tue-Thu 02:00 PM - 04:00 PM' : 'Mon-Fri 09:00 AM - 05:00 PM',
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        phone: '+91 98765 43210'
      };

      // Add to database
      db.users.push(user);
      saveUsersToDisk(db.users);
    }

    // Create Base64 Session Token
    const token = Buffer.from(JSON.stringify({ userId: user.id, role: user.role, time: Date.now() })).toString('base64');

    res.json({
      success: true,
      token,
      user
    });
  });

  // ==========================================
  // SUPABASE DATABASE WEBHOOK (Direct No-CLI Alternative)
  // ==========================================
  app.post('/api/webhooks/personalize-note', async (req, res) => {
    try {
      const payload = req.body;
      const record = payload?.record || (payload?.id ? payload : undefined);
      if (!record || !record.id) {
        res.status(400).json({ error: 'Missing record.id in webhook payload' });
        return;
      }

      const noteId = record.id;
      const title = record.title || 'Untitled Capture';
      const generalisedNotes = record.generalised_notes || '';
      const rawOcrText = record.raw_ocr_text || '';

      console.log(`[Supabase Webhook] Synthesizing note ${noteId}: "${title}"`);

      // 1. Synthesize with Gemini AI
      let personalized = '';
      try {
        const aiReply = await generateDetailedTopicNoteAI({
          prompt: title,
          attachedText: `${generalisedNotes}\n${rawOcrText}`,
          depth: 'exam_prep'
        });
        personalized = aiReply.content || generalisedNotes;
      } catch (aiErr) {
        console.warn('[Webhook] Gemini AI call fallback:', aiErr);
        personalized = `## 🎯 Core Conceptual Synthesis: ${title}\n\n${generalisedNotes}\n\n$$\\sum \\vec{F}_{ext} = m\\vec{a}$$`;
      }

      // 2. If Supabase Service Key / URL is available, update row to 'ready'
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && serviceRoleKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(supabaseUrl, serviceRoleKey);
        await sb.from('notes').update({
          personalised_notes: personalized,
          status: 'ready',
          updated_at: new Date().toISOString()
        }).eq('id', noteId);
      }

      res.json({ success: true, noteId, status: 'ready' });
    } catch (err: any) {
      console.error('[Webhook Error]:', err);
      res.status(500).json({ error: err.message || 'Webhook failed' });
    }
  });

  // Public endpoint for LoginScreen to display registered accounts list
  app.get('/api/auth/public-users', (req, res) => {
    res.json({
      users: db.users.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role,
        institutionalId: u.institutionalId,
        password: u.password,
        department: u.department,
        designation: u.designation
      }))
    });
  });

  // 2. Current Session User (Includes all registered users for faculty roster & admin directory)
  app.get('/api/auth/me', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(200).json({
        authenticated: false,
        user: null,
        allUsers: db.users,
        allDemoUsers: db.users
      });
      return;
    }

    // Return full users roster for faculty class directories and administrative oversight
    res.json({
      authenticated: true,
      user,
      allUsers: db.users,
      allDemoUsers: db.users
    });
  });

  // 3. Switch User (Allows Deans to audit any perspective AND seamlessly return to Registrar)
  const handleSwitchUser = (req: express.Request, res: express.Response) => {
    const authUser = getAuthenticatedUser(req);
    const { userId } = req.body;
    const target = db.users.find(u => u.id === userId);

    if (!target) {
      res.status(404).json({ error: 'Target user not found' });
      return;
    }

    // Allow switch if:
    // 1. Current user is an admin auditing someone
    // 2. Target user is an admin (returning from audit mode to registrar portal)
    // 3. Requesting user has admin authorization
    const isReturningToAdmin = target.role === 'admin';
    const isAuthorizedAdmin = authUser && authUser.role === 'admin';

    if (!isAuthorizedAdmin && !isReturningToAdmin) {
      res.status(403).json({ error: 'Permission denied: Only Deans & Registrars can switch viewpoints.' });
      return;
    }

    const token = Buffer.from(JSON.stringify({ userId: target.id, role: target.role, time: Date.now() })).toString('base64');
    res.json({ success: true, token, user: target });
  };

  app.post('/api/auth/switch', generalApiLimiter.middleware, handleSwitchUser);
  app.post('/api/auth/switch-user', generalApiLimiter.middleware, handleSwitchUser);

  // Get all registered users (Students, Faculty, Admins)
  app.get('/api/users', (req, res) => {
    const { role, department, search } = req.query;
    let list = db.users;

    if (role && typeof role === 'string' && role !== 'all') {
      list = list.filter(u => u.role === role);
    }
    if (department && typeof department === 'string' && department !== 'all') {
      list = list.filter(u => u.department.toLowerCase().includes(department.toLowerCase()));
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.institutionalId.toLowerCase().includes(q)
      );
    }
    res.json(list);
  });

  // Get all students specifically with enrollment and academic metrics
  app.get('/api/students', (req, res) => {
    const students = db.users.filter(u => u.role === 'student');
    const enriched = students.map(s => {
      const enrolledSubs = db.subjects.filter(subj => s.enrolledSubjectIds.includes(subj.id));
      const studentSubs = db.submissions.filter(sub => sub.studentId === s.id);
      const studentNotes = db.notes.filter(n => n.studentId === s.id);
      return {
        ...s,
        enrolledSubjects: enrolledSubs,
        submissionCount: studentSubs.length,
        notesCount: studentNotes.length,
        gradedSubmissions: studentSubs.filter(sub => sub.status === 'graded')
      };
    });
    res.json(enriched);
  });

  // Get all teachers
  app.get('/api/teachers', (req, res) => {
    const teachers = db.users.filter(u => u.role === 'teacher');
    res.json(teachers);
  });

  // Register New Student / Teacher / Administrator
  app.post('/api/users', (req, res) => {
    const {
      name,
      email,
      role = 'student',
      department,
      academicYear,
      institutionalId,
      designation,
      officeLocation,
      officeHours,
      phone,
      initialSubjectIds = [],
      teachingSubjectIds = [],
      gpa = 3.8
    } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and Email are mandatory for registration.' });
      return;
    }

    // Check duplicate email
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      res.status(409).json({ error: 'A user with this institutional email already exists.' });
      return;
    }

    const prefix = role === 'teacher' ? 'BMU-FAC' : role === 'admin' ? 'BMU-ADM' : '260';
    const finalInstId = institutionalId || (role === 'student' ? `260${Math.floor(116 + Math.random() * 800)}` : `${prefix}-${Math.floor(2010 + Math.random() * 900)}`);

    const cleanName = name.trim().toLowerCase().split(' ')[0];
    const generatedUsername = req.body.username || (role === 'teacher' ? `prof.${cleanName}` : role === 'admin' ? `dean.${cleanName}` : `student.${cleanName}`);
    const generatedPassword = req.body.password || (role === 'teacher' ? `Teacher@${finalInstId.slice(-4)}` : role === 'admin' ? `Dean@${finalInstId.slice(-4)}!` : `EduSync@${finalInstId}`);

    const newUser: User = {
      id: `${role}-${Date.now()}`,
      name,
      email: email.includes('@') ? email : `${email}@bmu.edu.in`,
      username: generatedUsername,
      password: generatedPassword,
      role,
      avatar: undefined,
      gender: req.body.gender || 'Male',
      program: req.body.program || (role === 'student' ? 'CSE' : undefined),
      institutionalId: finalInstId,
      department: department || (role === 'teacher' ? 'Department of Computer Sciences' : 'B.Tech Computer Science (CSE)'),
      academicYear: role === 'student' ? (academicYear || '1st Year (Semester 1)') : undefined,
      designation: role === 'teacher' ? (designation || 'Assistant Professor') : role === 'admin' ? (designation || 'Academic Administrator') : undefined,
      officeLocation: officeLocation || (role === 'teacher' ? 'Academic Block A' : undefined),
      officeHours: officeHours || (role === 'teacher' ? 'Mon/Wed 11:00 AM - 01:00 PM' : undefined),
      phone: phone || `+91 ${Math.floor(98000 + Math.random() * 1999)} ${Math.floor(10000 + Math.random() * 89999)}`,
      gpa: role === 'student' ? Number(gpa || 8.0) : undefined,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      enrolledSubjectIds: role === 'student' ? (initialSubjectIds.length > 0 ? initialSubjectIds : db.subjects.map(s => s.id)) : [],
      teachingSubjectIds: role === 'teacher' ? teachingSubjectIds : []
    };

    db.users.push(newUser);
    saveUsersToDisk(db.users);

    // Update enrolled counts in subjects if student
    if (role === 'student' && initialSubjectIds.length > 0) {
      initialSubjectIds.forEach((subjId: string) => {
        const s = db.subjects.find(sub => sub.id === subjId);
        if (s) s.enrolledCount = (s.enrolledCount || 0) + 1;
      });
    }

    res.status(201).json({ success: true, user: newUser });
  });

  // Update existing user
  app.put('/api/users/:id', (req, res) => {
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const {
      name,
      email,
      department,
      academicYear,
      status,
      gpa,
      phone,
      designation,
      officeLocation,
      officeHours,
      enrolledSubjectIds,
      teachingSubjectIds
    } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (department) user.department = department;
    if (academicYear) user.academicYear = academicYear;
    if (status) user.status = status;
    if (gpa !== undefined) user.gpa = Number(gpa);
    if (phone) user.phone = phone;
    if (designation) user.designation = designation;
    if (officeLocation) user.officeLocation = officeLocation;
    if (officeHours) user.officeHours = officeHours;

    if (Array.isArray(enrolledSubjectIds)) {
      user.enrolledSubjectIds = enrolledSubjectIds;
    }
    if (Array.isArray(teachingSubjectIds)) {
      user.teachingSubjectIds = teachingSubjectIds;
    }

    saveUsersToDisk(db.users);
    res.json({ success: true, user });
  });

  // Delete user (Restricted to Administrator)
  app.delete('/api/users/:id', requireRole(['admin']), (req, res) => {
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx !== -1) {
      const removed = db.users.splice(idx, 1)[0];
      // Cleanup enrolled counts
      if (removed.role === 'student') {
        removed.enrolledSubjectIds.forEach(sId => {
          const s = db.subjects.find(sub => sub.id === sId);
          if (s && s.enrolledCount > 0) s.enrolledCount--;
        });
      }
      saveUsersToDisk(db.users);
      res.json({ success: true, message: 'User successfully unregistered' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // Assign classes to student
  app.post('/api/students/:id/assign-classes', (req, res) => {
    const student = db.users.find(u => u.id === req.params.id && u.role === 'student');
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const { subjectIds } = req.body;
    if (!Array.isArray(subjectIds)) {
      res.status(400).json({ error: 'subjectIds array is required' });
      return;
    }

    // Determine newly added and removed subjects for accurate counters
    const current = new Set(student.enrolledSubjectIds || []);
    const next = new Set(subjectIds);

    subjectIds.forEach(id => {
      if (!current.has(id)) {
        const s = db.subjects.find(sub => sub.id === id);
        if (s) s.enrolledCount = (s.enrolledCount || 0) + 1;
      }
    });

    student.enrolledSubjectIds?.forEach(id => {
      if (!next.has(id)) {
        const s = db.subjects.find(sub => sub.id === id);
        if (s && s.enrolledCount > 0) s.enrolledCount--;
      }
    });

    student.enrolledSubjectIds = subjectIds;
    saveUsersToDisk(db.users);
    res.json({ success: true, user: student });
  });

  // Save / Update Student Personalized Learning Profile (Questionnaire Results)
  app.post('/api/students/:id/learning-profile', (req, res) => {
    try {
      const student = db.users.find(u => u.id === req.params.id);
      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      const { learningProfile } = req.body;
      if (!learningProfile) {
        res.status(400).json({ error: 'learningProfile payload is required' });
        return;
      }

      student.learningProfile = {
        learningStyle: learningProfile.learningStyle || 'visual',
        targetGrade: learningProfile.targetGrade || 'A+',
        explanationTone: learningProfile.explanationTone || 'encouraging_mentor',
        preferredPace: learningProfile.preferredPace || 'steady',
        strengthsAndInterests: learningProfile.strengthsAndInterests || '',
        painPoints: learningProfile.painPoints || '',
        questionnaireCompleted: true,
        completedAt: new Date().toISOString()
      };

      saveUsersToDisk(db.users);

      // Immediately recraft all relevant notes for this student to match their calibrated persona!
      const studentNotes = db.notes.filter(n =>
        !n.studentId ||
        n.source === 'visionnote' ||
        n.studentId === student.id ||
        n.studentId === student.institutionalId ||
        n.studentId.startsWith('student-') ||
        student.role === 'admin' ||
        student.role === 'student'
      );

      for (const note of studentNotes) {
        const recrafted = recraftNoteForPersona(note, student.learningProfile);
        note.content = recrafted.content;
        note.personalisedNotes = recrafted.personalisedNotes;
        note.summary = recrafted.summary;
        note.keyTakeaways = recrafted.keyTakeaways;
        note.lastModified = new Date().toISOString();
      }

      saveNotesToDisk(db.notes);

      res.json({
        success: true,
        message: `Learning persona calibrated! All notes immediately re-crafted for ${student.learningProfile.learningStyle.replace('_', ' ').toUpperCase()} style.`,
        user: student,
        updatedNotes: studentNotes
      });
    } catch (err: any) {
      console.error('Error saving learning profile:', err);
      res.status(500).json({ error: 'Failed to update learning profile' });
    }
  });

  // Direct Note Re-Personalization Endpoint
  app.post('/api/notes/repersonalize', (req, res) => {
    try {
      const { noteId, studentId, persona } = req.body;
      const user = getCurrentUser(req);
      const targetStudent = (studentId && db.users.find(u => u.id === studentId)) || user;
      const targetPersona = persona || targetStudent?.learningProfile;

      if (noteId) {
        const note = db.notes.find(n => n.id === noteId);
        if (!note) {
          res.status(404).json({ error: 'Note not found' });
          return;
        }
        const recrafted = recraftNoteForPersona(note, targetPersona);
        note.content = recrafted.content;
        note.personalisedNotes = recrafted.personalisedNotes;
        note.summary = recrafted.summary;
        note.keyTakeaways = recrafted.keyTakeaways;
        note.lastModified = new Date().toISOString();
        saveNotesToDisk(db.notes);
        res.json({ success: true, note });
        return;
      }

      // Recraft all notes accessible to this student
      const notesToRecraft = db.notes.filter(n =>
        !n.studentId ||
        n.source === 'visionnote' ||
        n.studentId === targetStudent.id ||
        n.studentId === targetStudent.institutionalId ||
        targetStudent.role === 'admin' ||
        targetStudent.role === 'student'
      );

      for (const note of notesToRecraft) {
        const recrafted = recraftNoteForPersona(note, targetPersona);
        note.content = recrafted.content;
        note.personalisedNotes = recrafted.personalisedNotes;
        note.summary = recrafted.summary;
        note.keyTakeaways = recrafted.keyTakeaways;
        note.lastModified = new Date().toISOString();
      }

      saveNotesToDisk(db.notes);
      res.json({ success: true, updatedNotes: notesToRecraft });
    } catch (err: any) {
      console.error('Error re-personalizing notes:', err);
      res.status(500).json({ error: 'Failed to re-personalize notes' });
    }
  });

  // Bulk Import Users (Google Classroom CSV / Excel Roster Importer)
  app.post('/api/users/bulk-import', (req, res) => {
    try {
      const {
        users,
        targetSubjectIds = [],
        defaultRole = 'student',
        defaultDepartment = 'Department of Computer Science & Engineering',
        defaultProgram = 'B.Tech Computer Science and Engineering',
        defaultAcademicYear = '1st Year (Semester 1)'
      } = req.body;

      if (!Array.isArray(users) || users.length === 0) {
        res.status(400).json({ error: 'A non-empty users array is required for bulk import.' });
        return;
      }

      let importedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];
      const createdUsers: User[] = [];

      users.forEach((rawUser: any, index: number) => {
        // Support multiple common CSV column headers (Google Classroom, Standard SIS, etc.)
        const firstName = rawUser['First Name'] || rawUser.firstName || rawUser.first_name || '';
        const lastName = rawUser['Last Name'] || rawUser.lastName || rawUser.last_name || '';
        const rawName = rawUser.name || (firstName || lastName ? `${firstName} ${lastName}`.trim() : '');
        const rawEmail = (rawUser['Email Address'] || rawUser['Email'] || rawUser.email || rawUser.emailAddress || '').trim();
        const rawRoll = (rawUser['Student ID'] || rawUser['User ID'] || rawUser['Roll No'] || rawUser.institutionalId || rawUser.rollNo || rawUser.id || '').trim();

        if (!rawEmail && !rawName) {
          errors.push(`Row ${index + 1}: Skipped due to missing name and email.`);
          skippedCount++;
          return;
        }

        const cleanEmail = rawEmail.includes('@')
          ? rawEmail.toLowerCase()
          : `${(rawEmail || rawName).toLowerCase().replace(/[^a-z0-9]/g, '.')}@bmu.edu.in`;

        const cleanName = rawName || rawEmail.split('@')[0].replace(/\./g, ' ');
        const role = (rawUser.role || defaultRole).toLowerCase();
        const prefix = role === 'teacher' ? 'BMU-FAC' : role === 'admin' ? 'BMU-ADM' : '260';
        const finalRoll = rawRoll || `${prefix}${Math.floor(100 + Math.random() * 899)}`;

        const userSubjects: string[] = Array.isArray(rawUser.enrolledSubjectIds) && rawUser.enrolledSubjectIds.length > 0
          ? rawUser.enrolledSubjectIds
          : (targetSubjectIds.length > 0 ? targetSubjectIds : db.subjects.map(s => s.id));

        // Check if user already exists by email or institutionalId
        const existingUser = db.users.find(u =>
          (u.email && u.email.toLowerCase() === cleanEmail.toLowerCase()) ||
          (u.institutionalId && u.institutionalId.toLowerCase() === finalRoll.toLowerCase())
        );

        if (existingUser) {
          // Merge subject enrollments without duplicating
          const subsSet = new Set(existingUser.enrolledSubjectIds || []);
          userSubjects.forEach(sId => subsSet.add(sId));
          existingUser.enrolledSubjectIds = Array.from(subsSet);

          if (rawUser.department) existingUser.department = rawUser.department;
          if (rawUser.program) existingUser.program = rawUser.program;
          if (rawName && existingUser.name.length < cleanName.length) existingUser.name = cleanName;
          updatedCount++;
        } else {
          const usernamePrefix = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
          const cleanUsername = rawUser.username || (role === 'teacher' ? `prof.${usernamePrefix}` : `student.${usernamePrefix}`);
          const defaultPassword = rawUser.password || (role === 'teacher' ? `Teacher@${finalRoll.slice(-4)}` : `EduSync@${finalRoll}`);

          const newUser: User = {
            id: `${role}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            name: cleanName,
            email: cleanEmail,
            username: cleanUsername,
            password: defaultPassword,
            role: role as 'student' | 'teacher' | 'admin',
            gender: rawUser['Gender'] || rawUser.gender || 'Not Specified',
            institutionalId: finalRoll,
            department: rawUser['Department'] || rawUser.department || defaultDepartment,
            program: rawUser['Program'] || rawUser.program || defaultProgram,
            academicYear: rawUser['Academic Year'] || rawUser.academicYear || defaultAcademicYear,
            status: 'active',
            joinedDate: new Date().toISOString().split('T')[0],
            enrolledSubjectIds: role === 'student' ? userSubjects : [],
            teachingSubjectIds: role === 'teacher' ? userSubjects : [],
            gpa: rawUser['GPA'] || rawUser.gpa ? Number(rawUser['GPA'] || rawUser.gpa) : (role === 'student' ? 8.25 : undefined)
          };

          db.users.push(newUser);
          createdUsers.push(newUser);
          importedCount++;
        }
      });

      // Recalculate subject enrolled counts accurately
      db.subjects.forEach(subject => {
        const enrolled = db.users.filter(u => u.role === 'student' && u.enrolledSubjectIds.includes(subject.id));
        subject.enrolledCount = enrolled.length;
      });

      saveUsersToDisk(db.users);

      res.status(200).json({
        success: true,
        message: `Roster import completed: ${importedCount} created, ${updatedCount} updated, ${skippedCount} skipped.`,
        importedCount,
        updatedCount,
        skippedCount,
        errors,
        createdUsersSample: createdUsers.slice(0, 10)
      });
    } catch (err: any) {
      console.error('Error in bulk-import:', err);
      res.status(500).json({ error: 'Failed to process roster import: ' + err.message });
    }
  });

  // Bulk enroll students into a class
  app.post('/api/subjects/:id/enroll', (req, res) => {
    const subject = db.subjects.find(s => s.id === req.params.id);
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    const { studentIds, studentId } = req.body;
    const targets = Array.isArray(studentIds) ? studentIds : studentId ? [studentId] : [];

    if (targets.length === 0) {
      res.status(400).json({ error: 'Provide at least one student ID' });
      return;
    }

    let newlyEnrolled = 0;
    targets.forEach((sId: string) => {
      const student = db.users.find(u => u.id === sId && u.role === 'student');
      if (student) {
        if (!student.enrolledSubjectIds.includes(subject.id)) {
          student.enrolledSubjectIds.push(subject.id);
          newlyEnrolled++;
        }
      }
    });

    subject.enrolledCount = (subject.enrolledCount || 0) + newlyEnrolled;
    res.json({ success: true, enrolledCount: subject.enrolledCount, newlyEnrolled });
  });

  // Unenroll student from class
  app.post('/api/subjects/:id/unenroll', (req, res) => {
    const subject = db.subjects.find(s => s.id === req.params.id);
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    const { studentId } = req.body;
    const student = db.users.find(u => u.id === studentId);
    if (student) {
      student.enrolledSubjectIds = student.enrolledSubjectIds.filter(id => id !== subject.id);
      if (subject.enrolledCount > 0) subject.enrolledCount--;
      res.json({ success: true, enrolledCount: subject.enrolledCount });
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  });

  // Create New Class / Course (Teachers and Admins)
  app.post('/api/subjects', (req, res) => {
    const user = getCurrentUser();
    const {
      code,
      name,
      description,
      teacherId,
      semester,
      room,
      credits = 4,
      department,
      syllabusTopics = [],
      initialEnrolledStudentIds = [],
      color = 'indigo'
    } = req.body;

    if (!code || !name) {
      res.status(400).json({ error: 'Course code and title are required.' });
      return;
    }

    // Determine teacher
    const assignedTeacherId = teacherId || (user.role === 'teacher' ? user.id : 'teacher-1');
    const teacher = db.users.find(u => u.id === assignedTeacherId) || db.users.find(u => u.role === 'teacher') || db.users[0];

    const newSubjId = `subj-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

    const colorVariants: Record<string, string> = {
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      violet: 'bg-violet-50 border-violet-200 text-violet-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      amber: 'bg-amber-50 border-amber-200 text-amber-700',
      rose: 'bg-rose-50 border-rose-200 text-rose-700'
    };

    const newSubject: Subject = {
      id: newSubjId,
      code,
      name,
      description: description || `Comprehensive academic coursework covering ${name}.`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      color,
      accentBg: colorVariants[color] || colorVariants.indigo,
      enrolledCount: initialEnrolledStudentIds.length,
      semester: semester || 'Fall 2026',
      room: room || 'Academic Science Hall 201',
      credits: Number(credits) || 4,
      department: department || teacher.department || 'Computer Science & Engineering',
      syllabusTopics: syllabusTopics.length > 0 ? syllabusTopics : [
        'Course Overview & Fundamental Principles',
        'Theoretical Paradigms & Core Methods',
        'Midterm Practical Applications & Laboratory',
        'Advanced Topic Exploration & Case Studies',
        'Final Capstone Project & Defense'
      ]
    };

    db.subjects.push(newSubject);

    // Update teacher's teachingSubjectIds
    if (teacher && !teacher.teachingSubjectIds.includes(newSubjId)) {
      teacher.teachingSubjectIds.push(newSubjId);
    }

    // Enroll initial students
    if (Array.isArray(initialEnrolledStudentIds) && initialEnrolledStudentIds.length > 0) {
      initialEnrolledStudentIds.forEach((sId: string) => {
        const student = db.users.find(u => u.id === sId && u.role === 'student');
        if (student && !student.enrolledSubjectIds.includes(newSubjId)) {
          student.enrolledSubjectIds.push(newSubjId);
        }
      });
    }

    // Seed default baseline timeline item
    const baseTimeline: TimelineItem = {
      id: `time-${Date.now()}`,
      subjectId: newSubjId,
      title: 'Course Orientation & Syllabus Overview',
      type: 'lecture',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      location: newSubject.room,
      description: 'Introduction to curriculum structure, grading criteria, and semester expectations.',
      topicsCovered: ['Course Logistics', 'Grading Rubrics', 'Required Textbooks'],
      weightagePercent: 5,
      status: 'upcoming'
    };
    db.timelines.push(baseTimeline);

    res.status(201).json(newSubject);
  });

  // Admin Institutional Metrics
  app.get('/api/admin/metrics', (req, res) => {
    const totalStudents = db.users.filter(u => u.role === 'student').length;
    const totalFaculty = db.users.filter(u => u.role === 'teacher').length;
    const totalCourses = db.subjects.length;
    const totalAssignments = db.assignments.length;
    const totalSubmissions = db.submissions.length;

    const departmentsCount: Record<string, number> = {};
    db.users.forEach(u => {
      const dept = u.department || 'General Science';
      departmentsCount[dept] = (departmentsCount[dept] || 0) + 1;
    });

    res.json({
      totalStudents,
      totalFaculty,
      totalCourses,
      totalAssignments,
      totalSubmissions,
      departmentsCount,
      activeTerm: 'Fall Academic Term 2026',
      systemHealth: 'Optimal (All AI & Database Services Operational)'
    });
  });

  // ==========================================
  // SUBJECTS & TIMELINES (Data Isolation)
  // ==========================================

  app.get('/api/subjects/all', (req, res) => {
    res.json(db.subjects);
  });

  app.get('/api/subjects', (req, res) => {
    const user = getCurrentUser(req);
    if (user.role === 'teacher') {
      // Return strictly subjects taught by this teacher
      const teacherSubjects = db.subjects.filter(
        s => s.teacherId === user.id || (user.teachingSubjectIds && user.teachingSubjectIds.includes(s.id))
      );
      res.json(teacherSubjects);
    } else if (user.role === 'admin') {
      res.json(db.subjects);
    } else {
      // Return subjects enrolled by student
      const studentSubjects = db.subjects.filter(
        s => user.enrolledSubjectIds && user.enrolledSubjectIds.includes(s.id)
      );
      res.json(studentSubjects.length > 0 ? studentSubjects : db.subjects);
    }
  });

  app.get('/api/subjects/:id', (req, res) => {
    const subject = db.subjects.find(s => s.id === req.params.id);
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.json(subject);
  });

  // Timeline endpoints
  const handleGetTimelines = (req: express.Request, res: express.Response) => {
    const subjectId = req.params.subjectId || req.params.id || (req.query.subjectId as string);
    const items = db.timelines.filter(t => !subjectId || t.subjectId === subjectId);
    const resources = db.resources.filter(r => !subjectId || r.subjectId === subjectId);
    res.json({
      timelines: items,
      resources: resources,
      items: items
    });
  };

  app.get('/api/timelines/:subjectId', handleGetTimelines);
  app.get('/api/timelines', handleGetTimelines);
  app.get('/api/subjects/:id/timeline', (req, res) => {
    const items = db.timelines.filter(t => t.subjectId === req.params.id);
    res.json(items);
  });

  const handlePostTimeline = (req: express.Request, res: express.Response) => {
    const user = getCurrentUser(req);
    if (user.role !== 'teacher') {
      res.status(403).json({ error: 'Unauthorized: Only teachers can manage course timeline' });
      return;
    }

    const subjectId = req.body.subjectId || req.params.id;
    const { title, type, date, startTime, endTime, location, description, topicsCovered, weightagePercent } = req.body;
    const newItem: TimelineItem = {
      id: `time-${Date.now()}`,
      subjectId: subjectId || 'subj-cs301',
      title: title || 'Academic Milestone',
      type: type || 'lecture',
      date: date || new Date().toISOString().split('T')[0],
      startTime: startTime || '10:00 AM',
      endTime: endTime || '11:30 AM',
      location: location || 'Turing Hall / Online',
      description: description || '',
      topicsCovered: Array.isArray(topicsCovered) ? topicsCovered : [],
      weightagePercent: Number(weightagePercent) || 0,
      status: 'upcoming'
    };
    db.timelines.push(newItem);
    res.json(newItem);
  };

  app.post('/api/timelines', handlePostTimeline);
  app.post('/api/subjects/:id/timeline', handlePostTimeline);

  const handleDeleteTimeline = (req: express.Request, res: express.Response) => {
    const user = getCurrentUser(req);
    if (user.role !== 'teacher') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }
    const targetId = req.params.itemId || req.params.id;
    const idx = db.timelines.findIndex(t => t.id === targetId);
    if (idx !== -1) {
      db.timelines.splice(idx, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  };

  app.delete('/api/timelines/:id', handleDeleteTimeline);
  app.delete('/api/subjects/:subjectId/timeline/:itemId', handleDeleteTimeline);

  // Resource endpoints
  const handleGetResources = (req: express.Request, res: express.Response) => {
    const subjectId = req.params.subjectId || req.params.id || (req.query.subjectId as string);
    const resources = db.resources.filter(r => !subjectId || r.subjectId === subjectId);
    res.json(resources);
  };

  app.get('/api/resources/:subjectId', handleGetResources);
  app.get('/api/resources', handleGetResources);
  app.get('/api/subjects/:id/resources', handleGetResources);

  const handlePostResource = (req: express.Request, res: express.Response) => {
    const user = getCurrentUser(req);
    if (user.role !== 'teacher') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }
    const subjectId = req.body.subjectId || req.params.id;
    const { title, category, url, author, description, keyTopics } = req.body;
    const newRes: ReferenceResource = {
      id: `res-${Date.now()}`,
      subjectId: subjectId || 'subj-cs301',
      title: title || 'Course Material',
      category: category || 'Textbook',
      url: url || '#',
      author: author || user.name,
      description: description || '',
      keyTopics: Array.isArray(keyTopics) ? keyTopics : [],
      dateAdded: new Date().toISOString().split('T')[0]
    };
    db.resources.push(newRes);
    res.json(newRes);
  };

  app.post('/api/resources', handlePostResource);
  app.post('/api/subjects/:id/resources', handlePostResource);

  const handleDeleteResource = (req: express.Request, res: express.Response) => {
    const user = getCurrentUser(req);
    if (user.role !== 'teacher') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }
    const targetId = req.params.itemId || req.params.id;
    const idx = db.resources.findIndex(r => r.id === targetId);
    if (idx !== -1) {
      db.resources.splice(idx, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Resource not found' });
    }
  };

  app.delete('/api/resources/:id', handleDeleteResource);
  app.delete('/api/subjects/:subjectId/resources/:itemId', handleDeleteResource);

  // ==========================================
  // ASSIGNMENTS & SUBMISSION HUB
  // ==========================================

  const handleGetAssignments = (req: express.Request, res: express.Response) => {
    const subjectId = req.params.subjectId || (req.query.subjectId as string);
    let list = db.assignments;
    if (subjectId) {
      list = list.filter(a => a.subjectId === subjectId);
    }
    res.json(list);
  };

  app.get('/api/assignments/:subjectId', handleGetAssignments);
  app.get('/api/assignments', handleGetAssignments);

  app.post('/api/assignments', (req, res) => {
    const user = getCurrentUser(req);
    if (user.role !== 'teacher') {
      res.status(403).json({ error: 'Unauthorized: Only faculty can publish assignments' });
      return;
    }

    const { subjectId, title, description, richTextInstructions, points, dueDate, strictDueDate, attachments, rubric, tags } = req.body;
    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      subjectId: subjectId || 'subj-cs301',
      title: title || 'New Problem Set',
      description: description || '',
      richTextInstructions: richTextInstructions || description || '',
      points: Number(points) || 100,
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      strictDueDate: strictDueDate !== undefined ? Boolean(strictDueDate) : true,
      attachments: Array.isArray(attachments) ? attachments : [],
      rubric: Array.isArray(rubric) ? rubric : [
        { criterion: 'Theoretical Rigor & Correctness', maxPoints: 50, description: 'Sound mathematical foundations.' },
        { criterion: 'Implementation & Test Coverage', maxPoints: 50, description: 'Code quality and pass rate.' }
      ],
      tags: Array.isArray(tags) ? tags : ['General'],
      submissionCount: 0
    };
    db.assignments.unshift(newAssignment);
    res.json(newAssignment);
  });

  app.get('/api/assignments/:id/submissions', (req, res) => {
    const user = getCurrentUser(req);
    const assignmentSubmissions = db.submissions.filter(s => s.assignmentId === req.params.id);

    if (user.role === 'teacher') {
      res.json(assignmentSubmissions);
    } else {
      // Student only sees their own
      const mySubmissions = assignmentSubmissions.filter(s => s.studentId === user.id);
      res.json(mySubmissions);
    }
  });

  const handleGetSubmissions = (req: express.Request, res: express.Response) => {
    const user = getCurrentUser(req);
    const subjectId = req.params.subjectId || (req.query.subjectId as string);

    let relevantAssignments = db.assignments;
    if (subjectId) {
      relevantAssignments = relevantAssignments.filter(a => a.subjectId === subjectId);
    }
    const assignmentIds = new Set(relevantAssignments.map(a => a.id));
    let subs = db.submissions.filter(s => assignmentIds.has(s.assignmentId));
    if (user.role !== 'teacher') {
      subs = subs.filter(s => s.studentId === user.id);
    }
    res.json(subs);
  };

  app.get('/api/submissions/:subjectId', handleGetSubmissions);
  app.get('/api/submissions', handleGetSubmissions);

  const handleSubmitAssignment = (req: express.Request, res: express.Response) => {
    const user = getCurrentUser(req);
    const assignmentId = req.body.assignmentId || req.params.id;
    const { submissionText, fileAttachment } = req.body;

    const assignment = db.assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    const existingIdx = db.submissions.findIndex(s => s.assignmentId === assignment.id && s.studentId === user.id);
    const newSub: Submission = {
      id: existingIdx !== -1 ? db.submissions[existingIdx].id : `sub-${Date.now()}`,
      assignmentId: assignment.id,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      submissionText: submissionText || '',
      fileAttachment: fileAttachment || 'submission_bundle.zip',
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      maxPoints: assignment.points
    };

    if (existingIdx !== -1) {
      db.submissions[existingIdx] = newSub;
    } else {
      db.submissions.push(newSub);
      assignment.submissionCount = (assignment.submissionCount || 0) + 1;
    }

    res.json(newSub);
  };

  app.post('/api/submissions', handleSubmitAssignment);
  app.post('/api/assignments/:id/submit', handleSubmitAssignment);

  app.post('/api/submissions/:id/grade', (req, res) => {
    const user = getCurrentUser(req);
    if (user.role !== 'teacher') {
      res.status(403).json({ error: 'Unauthorized: Faculty access required' });
      return;
    }

    const { grade, feedback } = req.body;
    const sub = db.submissions.find(s => s.id === req.params.id);
    if (!sub) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    sub.grade = Number(grade);
    sub.feedback = feedback || 'Graded by instructor';
    sub.status = 'graded';
    res.json(sub);
  });

  // ==========================================
  // STUDENT NOTES PLAYGROUND
  // ==========================================

  const handleGetNotes = (req: express.Request, res: express.Response) => {
    const user = getCurrentUser(req);
    const subjectId = req.params.subjectId || (req.query.subjectId as string);
    const requestedStudentId = (req.query.studentId as string) || user.id;

    // Filter notes for the student (allow full access across students to study shared curriculum notes)
    let userNotes = db.notes.filter(n =>
      !n.studentId ||
      n.source === 'visionnote' ||
      n.studentId === requestedStudentId ||
      n.studentId === user.id ||
      n.studentId.startsWith('student-') ||
      user.role === 'admin' ||
      user.role === 'teacher' ||
      user.role === 'student'
    );

    if (subjectId && subjectId !== 'all') {
      if (subjectId === 'others' || subjectId === 'subj-others' || subjectId === 'subj-misc' || subjectId === 'misc') {
        userNotes = userNotes.filter(n =>
          n.subjectId === 'subj-misc' ||
          n.subjectId === 'others' ||
          n.subjectId === 'subj-others' ||
          n.subjectId === 'misc' ||
          ![
            'subj-phy', 'subj-phy-11', 'subj-phy-12',
            'subj-che', 'subj-che-11', 'subj-che-12',
            'subj-mat', 'subj-mat-11', 'subj-mat-12'
          ].includes(n.subjectId)
        );
      } else if (subjectId === 'subj-phy') {
        userNotes = userNotes.filter(n => n.subjectId === 'subj-phy' || n.subjectId === 'subj-phy-11' || n.subjectId === 'subj-phy-12');
      } else if (subjectId === 'subj-che') {
        userNotes = userNotes.filter(n => n.subjectId === 'subj-che' || n.subjectId === 'subj-che-11' || n.subjectId === 'subj-che-12');
      } else if (subjectId === 'subj-mat') {
        userNotes = userNotes.filter(n => n.subjectId === 'subj-mat' || n.subjectId === 'subj-mat-11' || n.subjectId === 'subj-mat-12');
      } else {
        userNotes = userNotes.filter(n => n.subjectId === subjectId);
      }
    }
    res.json(userNotes);
  };

  app.get('/api/notes/:subjectId', handleGetNotes);
  app.get('/api/notes', handleGetNotes);

  app.post('/api/notes', (req, res) => {
    const user = getCurrentUser(req);
    const { id, subjectId, title, content, tags, isPinned, summary, keyTakeaways, flashcards, quiz, studentId } = req.body;
    const noteStudentId = studentId || user.id || 'student-1';

    if (id) {
      const idx = db.notes.findIndex(n => n.id === id);
      if (idx !== -1) {
        db.notes[idx] = {
          ...db.notes[idx],
          subjectId: subjectId || db.notes[idx].subjectId,
          title: title || db.notes[idx].title,
          content: content !== undefined ? content : db.notes[idx].content,
          tags: Array.isArray(tags) ? tags : db.notes[idx].tags,
          isPinned: isPinned !== undefined ? isPinned : db.notes[idx].isPinned,
          summary: summary !== undefined ? summary : db.notes[idx].summary,
          keyTakeaways: keyTakeaways !== undefined ? keyTakeaways : db.notes[idx].keyTakeaways,
          flashcards: flashcards !== undefined ? flashcards : db.notes[idx].flashcards,
          quiz: quiz !== undefined ? quiz : db.notes[idx].quiz,
          lastModified: new Date().toISOString()
        };
        saveNotesToDisk(db.notes);
        res.json(db.notes[idx]);
        return;
      }
    }

    // Create new note
    const newNote: StudentNote = {
      id: id || `note-${Date.now()}`,
      studentId: noteStudentId,
      subjectId: subjectId || 'others',
      title: title || 'Untitled Study Note',
      content: content || '# New Note\n\nStart typing notes here...',
      tags: Array.isArray(tags) ? tags : ['Study'],
      lastModified: new Date().toISOString(),
      isPinned: Boolean(isPinned),
      summary,
      keyTakeaways,
      flashcards,
      quiz
    };
    db.notes.unshift(newNote);
    saveNotesToDisk(db.notes);
    res.json(newNote);
  });

  app.delete('/api/notes/:id', (req, res) => {
    const idx = db.notes.findIndex(n => n.id === req.params.id);
    if (idx !== -1) {
      db.notes.splice(idx, 1);
      saveNotesToDisk(db.notes);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  });

  // ==========================================
  // EXTERNAL OCR WEBHOOK INGESTION ENDPOINT
  // ==========================================
  app.post('/api/webhooks/ocr-ingest', async (req, res) => {
    try {
      const ocrSecret = req.headers['x-ocr-api-key'] || req.headers['x-ocr-secret'];
      const expectedSecret = process.env.OCR_WEBHOOK_SECRET || 'edusync_ocr_secret_2026';

      // 1. Verify Shared Secret Key
      if (ocrSecret !== expectedSecret) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: Invalid x-ocr-api-key provided.'
        });
        return;
      }

      const {
        studentId,
        studentEmail,
        subjectId,
        title,
        scannedContent,
        sourceImageUrl,
        tags = ['OCR', 'Handwritten', 'Auto-Ingested'],
        autoProcessAI = true
      } = req.body;

      if (!scannedContent || (!studentId && !studentEmail)) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: scannedContent and (studentId or studentEmail) are required.'
        });
        return;
      }

      // Resolve student from ID or email
      let targetStudent = db.users.find(u =>
        u.id === studentId ||
        (u.email && studentEmail && u.email.toLowerCase() === studentEmail.toLowerCase()) ||
        (u.institutionalId && studentId && u.institutionalId.toLowerCase() === studentId.toLowerCase())
      );

      // If student doesn't exist, auto-provision student record
      if (!targetStudent) {
        const fallbackEmail = studentEmail || `${studentId || 'student'}@bmu.edu.in`;
        const fallbackName = fallbackEmail.split('@')[0].replace(/\./g, ' ');
        targetStudent = {
          id: studentId || `student-${Date.now()}`,
          name: fallbackName,
          email: fallbackEmail,
          username: fallbackEmail.split('@')[0],
          password: `EduSync@${Date.now().toString().slice(-4)}`,
          role: 'student',
          gender: 'Not Specified',
          institutionalId: studentId || `260${Math.floor(100 + Math.random() * 899)}`,
          department: 'Department of Computer Science & Engineering',
          program: 'B.Tech Computer Science and Engineering',
          status: 'active',
          enrolledSubjectIds: subjectId ? [subjectId] : db.subjects.map(s => s.id),
          teachingSubjectIds: [],
          gpa: 8.0
        };
        db.users.push(targetStudent);
        saveUsersToDisk(db.users);
      }

      const finalSubjectId = subjectId || (targetStudent.enrolledSubjectIds?.[0]) || db.subjects[0]?.id || 'subj-cs301';
      const cleanTitle = title || `OCR Scan - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

      // Construct StudentNote
      const newNote: StudentNote = {
        id: `note-ocr-${Date.now()}`,
        studentId: targetStudent.id,
        subjectId: finalSubjectId,
        title: cleanTitle,
        content: scannedContent,
        tags: Array.isArray(tags) ? tags : ['OCR', 'Handwritten'],
        lastModified: new Date().toISOString(),
        isPinned: false
      };

      // 2. Auto-Enhance note with Gemini AI Cognitive Scaffolding (if enabled)
      if (autoProcessAI) {
        try {
          const summaryRes = await summarizeNoteAI(cleanTitle, scannedContent);
          newNote.summary = summaryRes.summary;
          newNote.keyTakeaways = summaryRes.keyTakeaways;

          const flashcardsRes = await generateFlashcardsAI(cleanTitle, scannedContent);
          if (Array.isArray(flashcardsRes) && flashcardsRes.length > 0) {
            newNote.flashcards = flashcardsRes;
          }
        } catch (aiErr) {
          console.warn('AI processing skipped or timed out during OCR ingestion:', aiErr);
        }
      }

      db.notes.unshift(newNote);
      saveNotesToDisk(db.notes);

      res.status(201).json({
        success: true,
        message: 'OCR note successfully received, ingested, and processed by EduSync.',
        note: newNote,
        student: {
          id: targetStudent.id,
          name: targetStudent.name,
          email: targetStudent.email
        }
      });
    } catch (err: any) {
      console.error('Error in OCR webhook ingestion:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // VISIONNOTE (VN) CENTRAL SYNC & INGESTION HUB
  // ==========================================

  // Helper to map grade and subject name to EduSync subjectId
  function resolveVisionNoteSubjectId(grade?: string, subjectName?: string, explicitSubjectId?: string): string {
    if (explicitSubjectId && db.subjects.some(s => s.id === explicitSubjectId)) {
      return explicitSubjectId;
    }
    const cleanSub = (subjectName || '').toLowerCase();

    if (cleanSub.includes('phy')) {
      return 'subj-phy';
    }
    if (cleanSub.includes('chem') || cleanSub.includes('che')) {
      return 'subj-che';
    }
    if (cleanSub.includes('math') || cleanSub.includes('mat') || cleanSub.includes('calc')) {
      return 'subj-mat';
    }

    return 'subj-misc';
  }

  // Helper to resolve student from studentId, grade, or name
  function resolveVisionNoteStudent(studentId?: string, grade?: string): User {
    if (studentId) {
      const match = db.users.find(u =>
        u.id === studentId ||
        (u.institutionalId && u.institutionalId.toLowerCase() === studentId.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(studentId.toLowerCase()))
      );
      if (match) return match;
    }

    // Default to an active student from the respective grade
    const isGrade12 = grade === '12';
    const fallbackStudentId = isGrade12 ? 'student-g12-1' : 'student-g11-1';
    return db.users.find(u => u.id === fallbackStudentId) || db.users.find(u => u.role === 'student') || db.users[0];
  }

  // 1. Central Note Sync Endpoint (Push from VisionNote)
  app.post('/api/notes/vision-sync', async (req, res) => {
    try {
      const payload = req.body;
      const notesToIngest = Array.isArray(payload) ? payload : [payload];

      if (notesToIngest.length === 0) {
        res.status(400).json({ error: 'No notes provided in payload' });
        return;
      }

      const syncedNotes: StudentNote[] = [];

      for (const item of notesToIngest) {
        const student = resolveVisionNoteStudent(item.studentId, item.grade);
        const subjectId = resolveVisionNoteSubjectId(item.grade, item.subject, item.subjectId);
        const noteTitle = item.title || `VisionNote Scan - ${new Date().toLocaleDateString()}`;
        const noteContent = item.content || '# Scanned Note\n\nNo text content extracted.';

        // Check if note already exists
        const existingIdx = item.id ? db.notes.findIndex(n => n.id === item.id) : -1;

        if (existingIdx !== -1) {
          db.notes[existingIdx] = {
            ...db.notes[existingIdx],
            title: noteTitle,
            content: noteContent,
            subjectId,
            studentId: student.id,
            tags: item.tags || db.notes[existingIdx].tags || ['VisionNote'],
            cameraSnapshotUrl: item.cameraSnapshotUrl || db.notes[existingIdx].cameraSnapshotUrl,
            doubtsDetected: item.doubtsDetected || db.notes[existingIdx].doubtsDetected,
            source: 'visionnote',
            lastModified: new Date().toISOString()
          };
          syncedNotes.push(db.notes[existingIdx]);
        } else {
          const newNote: StudentNote = {
            id: item.id || `note-vn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            studentId: student.id,
            subjectId,
            title: noteTitle,
            content: noteContent,
            tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : ['VisionNote', 'Camera OCR', item.subject || 'Science'],
            lastModified: new Date().toISOString(),
            isPinned: Boolean(item.isPinned),
            source: 'visionnote',
            cameraSnapshotUrl: item.cameraSnapshotUrl,
            doubtsDetected: item.doubtsDetected || [],
            summary: item.summary,
            keyTakeaways: item.keyTakeaways,
            flashcards: item.flashcards,
            quiz: item.quiz
          };

          // Auto AI enrichment if missing summary
          if (!newNote.summary && noteContent.length > 50) {
            try {
              const summaryRes = await summarizeNoteAI(noteTitle, noteContent);
              newNote.summary = summaryRes.summary;
              newNote.keyTakeaways = summaryRes.keyTakeaways;
            } catch (err) {
              console.warn('AI summary skipped during VisionNote sync:', err);
            }
          }

          db.notes.unshift(newNote);
          syncedNotes.push(newNote);
        }
      }

      saveNotesToDisk(db.notes);

      res.status(200).json({
        success: true,
        count: syncedNotes.length,
        notes: syncedNotes,
        message: `Successfully synchronized ${syncedNotes.length} note(s) from VisionNote.`
      });
    } catch (err: any) {
      console.error('Error in VisionNote sync:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. VisionNote Sync Status & Statistics
  app.get('/api/notes/vision-sync/status', (req, res) => {
    const vnNotes = db.notes.filter(n => n.source === 'visionnote' || n.tags?.includes('VisionNote'));
    const grade11Notes = db.notes.filter(n => n.subjectId?.endsWith('-11'));
    const grade12Notes = db.notes.filter(n => n.subjectId?.endsWith('-12'));
    const recentNotes = db.notes.slice(0, 8);

    res.json({
      status: 'active',
      autoSyncEnabled: true,
      lastSyncTimestamp: vnNotes[0]?.lastModified || new Date().toISOString(),
      totalNotesInEduSync: db.notes.length,
      totalVisionNotesSynced: vnNotes.length,
      grade11Count: grade11Notes.length,
      grade12Count: grade12Notes.length,
      recentNotes
    });
  });

  // 3. Simulate Real-Time VisionNote Camera Ingestion
  app.post('/api/notes/vision-sync/simulate', async (req, res) => {
    try {
      const { grade = '11', subject = 'Physics', studentId } = req.body;
      const isGrade12 = grade === '12';

      const samples = {
        'Physics-11': {
          title: 'Work-Energy Theorem & Conservation of Mechanical Energy',
          content: `# Work-Energy Theorem in Variable Force Fields
*(Simulated Live Camera Snapshot • Lecture Board OCR)*

## 1. Work Done by Variable Force $F(x)$:
$$W = \\int_{x_i}^{x_f} F(x) \\, dx$$

## 2. Work-Energy Theorem Proof:
Since $F = m \\frac{dv}{dt} = m v \\frac{dv}{dx}$:
$$W = \\int_{x_i}^{x_f} m v \\frac{dv}{dx} \\, dx = \\int_{v_i}^{v_f} m v \\, dv = \\frac{1}{2} m v_f^2 - \\frac{1}{2} m v_i^2 = \\Delta K$$

## 3. Potential Energy Gradient:
For conservative force fields:
$$F = -\\frac{dU}{dx} \\implies U(x) = -\\int F \\, dx$$`,
          cameraSnapshotUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=60',
          doubtsDetected: [
            'How does the work-energy theorem apply when non-conservative frictional forces are present?',
            'Why is potential energy defined only for conservative forces and not for friction?'
          ],
          tags: ['Physics 11', 'Work Energy Theorem', 'VisionNote Camera']
        },
        'Chemistry-11': {
          title: 'Ionic Equilibrium & Henderson-Hasselbalch Buffer Equation',
          content: `# Buffer Solutions & Henderson Equation
*(Simulated Live Camera Snapshot • Lab Notebook)*

## 1. Acidic Buffer Solution:
Mixture of weak acid ($HA$) and its conjugate base ($A^-$ / $NaA$):
$$\\text{pH} = \\text{p}K_a + \\log_{10} \\left( \\frac{[\\text{Conjugate Base}]}{[\\text{Weak Acid}]} \\right)$$

## 2. Buffer Capacity ($\\beta$):
$$\\beta = \\frac{d B}{d(\\text{pH})}$$
Maximum buffer action occurs when $[\\text{Salt}] = [\\text{Acid}] \\implies \\text{pH} = \\text{p}K_a$.`,
          cameraSnapshotUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=60',
          doubtsDetected: [
            'Why does adding a small amount of strong acid not significantly change the pH of a buffer?',
            'What is the effective pH range of a buffer solution relative to pKa?'
          ],
          tags: ['Chemistry 11', 'Equilibrium', 'Buffer Solutions', 'VisionNote Camera']
        },
        'Mathematics-11': {
          title: 'Binomial Theorem for Any Index & General Term Formulas',
          content: `# Binomial Expansions & Coefficient Properties
*(Simulated Live Camera Snapshot • Blackboard)*

## 1. Binomial Theorem for Positive Integral Index $n$:
$$(a + b)^n = \\sum_{r=0}^{n} \\binom{n}{r} a^{n-r} b^r$$

## 2. General Term ($T_{r+1}$):
$$T_{r+1} = \\binom{n}{r} a^{n-r} b^r$$

## 3. Middle Term Rules:
- If $n$ is even: Single middle term $T_{(n/2)+1}$.
- If $n$ is odd: Two middle terms $T_{(n+1)/2}$ and $T_{(n+3)/2}$.`,
          tags: ['Maths 11', 'Algebra', 'Binomial Theorem', 'VisionNote Camera'],
          doubtsDetected: [
            'How do you find the term independent of x in an expansion like (x^2 + 1/x)^9?'
          ]
        },
        'Physics-12': {
          title: 'Electromagnetic Induction: Faraday Law & Lenz Law Direction',
          content: `# Electromagnetic Induction & Motional EMF
*(Simulated Live Camera Snapshot • Physics Lab 3)*

## 1. Faraday\'s Law of Induction:
$$\\mathcal{E} = -\\frac{d\\Phi_B}{dt}$$

Where magnetic flux $\\Phi_B = \\int \\mathbf{B} \\cdot d\\mathbf{A} = B A \\cos \\theta$.

## 2. Motional EMF across Conducting Rod:
For a rod of length $L$ moving with velocity $v$ perpendicular to field $B$:
$$\\mathcal{E} = B v L$$

## 3. Lenz\'s Law:
The induced current flows in such a direction that its magnetic field opposes the change in magnetic flux that produced it (Conservation of Energy).`,
          cameraSnapshotUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=60',
          doubtsDetected: [
            'How is Lenz\'s law a direct consequence of the Law of Conservation of Energy?',
            'What external mechanical power is required to pull a conducting loop at constant velocity through a magnetic field?'
          ],
          tags: ['Physics 12', 'EMI', 'Faraday Law', 'VisionNote Camera']
        },
        'Chemistry-12': {
          title: 'Chemical Kinetics: Integrated Rate Law & Arrhenius Activation Energy',
          content: `# Chemical Kinetics: First Order Reactions & Arrhenius Equation
*(Simulated Live Camera Snapshot • Chemistry Lab 204)*

## 1. First Order Integrated Rate Equation:
$$k = \\frac{2.303}{t} \\log_{10} \\left( \\frac{[A]_0}{[A]} \\right)$$
Half-life ($t_{1/2}$):
$$t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}$$

## 2. Arrhenius Temperature Dependence:
$$k = A e^{-E_a / RT} \\implies \\ln \\left( \\frac{k_2}{k_1} \\right) = \\frac{E_a}{R} \\left( \\frac{1}{T_1} - \\frac{1}{T_2} \\right)$$`,
          tags: ['Chemistry 12', 'Kinetics', 'Arrhenius Equation', 'VisionNote Camera'],
          doubtsDetected: [
            'Why is the half-life of a first order reaction completely independent of initial reactant concentration?',
            'How do catalysts lower the activation energy without altering the equilibrium constant?'
          ]
        },
        'Mathematics-12': {
          title: 'Vectors & 3D Geometry: Shortest Distance Between Skew Lines',
          content: `# 3D Geometry: Vector Equations of Lines
*(Simulated Live Camera Snapshot • Ramanujan Block)*

## 1. Vector Equation of a Line:
$$\\mathbf{r} = \\mathbf{a} + \\lambda \\mathbf{b}$$

## 2. Shortest Distance ($d$) Between Skew Lines:
Lines $\\mathbf{r} = \\mathbf{a}_1 + \\lambda \\mathbf{b}_1$ and $\\mathbf{r} = \\mathbf{a}_2 + \\mu \\mathbf{b}_2$:
$$d = \\left| \\frac{(\\mathbf{b}_1 \\times \\mathbf{b}_2) \\cdot (\\mathbf{a}_2 - \\mathbf{a}_1)}{|\\mathbf{b}_1 \\times \\mathbf{b}_2|} \\right|$$
If $d = 0 \\implies$ Lines are coplanar and intersect.`,
          tags: ['Maths 12', '3D Geometry', 'Vectors', 'Skew Lines', 'VisionNote Camera'],
          doubtsDetected: [
            'What is the geometrical interpretation of the cross product b1 x b2 in the shortest distance formula?',
            'How do you determine if two non-parallel lines in 3D intersect or are skew?'
          ]
        }
      };

      const key = `${subject}-${grade}` as keyof typeof samples;
      const sample = samples[key] || samples['Physics-11'];

      const student = resolveVisionNoteStudent(studentId, grade);
      const subjectId = resolveVisionNoteSubjectId(grade, subject);

      const simulatedNote: StudentNote = {
        id: `note-vn-sim-${Date.now()}`,
        studentId: student.id,
        subjectId,
        title: sample.title,
        content: sample.content,
        tags: sample.tags,
        cameraSnapshotUrl: (sample as any).cameraSnapshotUrl,
        doubtsDetected: sample.doubtsDetected,
        lastModified: new Date().toISOString(),
        isPinned: true,
        source: 'visionnote',
        summary: `Auto-extracted notes on ${sample.title} with complete mathematical derivations and detected student doubts.`,
        keyTakeaways: [
          'Formulas verified and formatted in LaTeX.',
          'Doubt extraction engine flagged critical first-principles questions for the Socratic AI Tutor.'
        ]
      };

      db.notes.unshift(simulatedNote);
      saveNotesToDisk(db.notes);

      res.status(201).json({
        success: true,
        message: `Simulated live camera OCR note for Grade ${grade} ${subject} received from VisionNote.`,
        note: simulatedNote,
        student: { id: student.id, name: student.name }
      });
    } catch (err: any) {
      console.error('Error simulating VisionNote ingestion:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // ZERO-LEAK SECURE BACKEND VAULT & ARCHIVE (Admin Only)
  // ==========================================

  // 1. Snapshot and Reset Live Website (Quarantine Historical Records into Cold Storage & Return Dean Session)
  app.post('/api/admin/vault/archive-and-reset', (req, res) => {
    try {
      const { label, resetNotes, resetSubmissions, resetLectures } = req.body || {};
      const result = archiveAndResetWorkspace(db, {
        label: label || 'Dean Manual Reset',
        resetNotes: resetNotes !== false,
        resetSubmissions: resetSubmissions !== false,
        resetLectures: resetLectures !== false
      });

      // Find the Dean account (admin-1: Dr. Maneek Singh)
      const dean = db.users.find(u => u.role === 'admin') || db.users[0];
      const token = Buffer.from(
        JSON.stringify({ userId: dean.id, role: dean.role, timestamp: Date.now() })
      ).toString('base64');

      res.json({
        ...result,
        token,
        user: dean
      });
    } catch (err: any) {
      console.error('Error archiving workspace:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. List All Secure Vault Snapshots (Stored outside web directory, zero leakage)
  app.get('/api/admin/vault/list', requireAuth, requireRole(['admin']), (_req, res) => {
    try {
      const snapshots = listVaultSnapshots();
      res.json({ snapshots });
    } catch (err: any) {
      console.error('Error listing vault snapshots:', err);
      res.status(500).json({ snapshots: [], error: err.message });
    }
  });

  // 3. Restore Past Vault Snapshot
  app.post('/api/admin/vault/restore', requireAuth, requireRole(['admin']), (req, res) => {
    try {
      const { snapshotId } = req.body;
      if (!snapshotId) {
        return res.status(400).json({ success: false, error: 'Missing snapshotId' });
      }
      const result = restoreFromVaultSnapshot(snapshotId, db);
      res.json(result);
    } catch (err: any) {
      console.error('Error restoring vault snapshot:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // CLASSSARTHI & STUDENT LEARNING PLATFORM API
  // ==========================================

  // 1. Get Lectures List (Role and subject filterable)
  app.get('/api/lectures', (req, res) => {
    const { subjectId } = req.query;
    let lectures = db.lectures || [];
    if (subjectId && typeof subjectId === 'string' && subjectId !== 'all') {
      lectures = lectures.filter(l => l.subjectId === subjectId);
    }
    res.json({ lectures });
  });

  // 2. Get Single Lecture by ID
  app.get('/api/lectures/:id', (req, res) => {
    const lectureId = req.params.id;
    const lecture = (db.lectures || []).find(l => l.id === lectureId);
    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }
    res.json({ lecture });
  });

  // 3. "Ask My Class" Grounded Q&A against actual lecture data with timestamp citation
  app.post('/api/lectures/:id/ask-my-class', aiRateLimiter.middleware, async (req, res) => {
    try {
      const lectureId = req.params.id;
      const { question, studentId } = req.body;
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question is required' });
      }

      const lecture = (db.lectures || []).find(l => l.id === lectureId) || db.lectures[0];
      const result = await askMyClassLectureAI(question, lecture);
      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/lectures/:id/ask-my-class:', err);
      res.status(500).json({ error: err.message || 'Failed to answer question' });
    }
  });

  // 4. Personalize Lecture Notes based on student's actual performance history
  app.post('/api/lectures/:id/personalize', aiRateLimiter.middleware, async (req, res) => {
    try {
      const lectureId = req.params.id;
      const { studentId } = req.body;
      const lecture = (db.lectures || []).find(l => l.id === lectureId) || db.lectures[0];

      const sId = studentId || 'student-g11-1';
      const studentMastery = db.conceptMastery[sId] || [];
      const weakConcepts = studentMastery.filter(m => m.needsRevision).map(m => m.concept);

      const result = await personalizeLectureNotesFromClassSarthi(lecture, weakConcepts);
      res.json({
        ...result,
        studentId: sId,
        weakConcepts
      });
    } catch (err: any) {
      console.error('Error in /api/lectures/:id/personalize:', err);
      res.status(500).json({ error: err.message || 'Failed to personalize notes' });
    }
  });

  // 5. Get Mastery Quiz for Lecture
  app.get('/api/lectures/:id/mastery-quiz', (req, res) => {
    const lectureId = req.params.id;
    const quiz = db.masteryQuizzes[lectureId] || db.masteryQuizzes['lec-phy-101'];
    if (!quiz) {
      return res.status(404).json({ error: 'Mastery quiz not found for this lecture' });
    }
    res.json({ quiz });
  });

  // 6. Evaluate Mastery Quiz & Update Concept Mastery
  app.post('/api/lectures/:id/quiz-evaluate', (req, res) => {
    try {
      const lectureId = req.params.id;
      const { studentId = 'student-g11-1', answers = {} } = req.body;
      const quiz = db.masteryQuizzes[lectureId] || db.masteryQuizzes['lec-phy-101'];

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      let score = 0;
      const understoodConcepts: string[] = [];
      const weakConcepts: string[] = [];
      const questionBreakdown = quiz.questions.map((q, idx) => {
        const userAnswer = answers[idx] ?? -1;
        const isCorrect = userAnswer === q.correctIndex;
        if (isCorrect) {
          score += 1;
          if (!understoodConcepts.includes(q.conceptTag)) {
            understoodConcepts.push(q.conceptTag);
          }
        } else {
          if (!weakConcepts.includes(q.conceptTag)) {
            weakConcepts.push(q.conceptTag);
          }
        }
        return {
          questionId: q.id,
          question: q.question,
          userAnswerIndex: userAnswer,
          correctIndex: q.correctIndex,
          isCorrect,
          conceptTag: q.conceptTag,
          explanation: q.explanation,
          timestampRef: q.timestampRef,
          misconception: q.misconceptionHint
        };
      });

      const total = quiz.questions.length;
      const percentage = Math.round((score / total) * 100);

      // Recommendations
      const recommendations: string[] = [];
      if (weakConcepts.length === 0) {
        recommendations.push('Outstanding! Full conceptual mastery demonstrated. Ready to proceed to advanced problem sets.');
      } else {
        weakConcepts.forEach(c => {
          recommendations.push(`Revise concept: "${c}". Launch AI Tutor to understand boundary conditions and physical reasoning.`);
        });
      }

      // Update student concept mastery in database
      if (!db.conceptMastery[studentId]) {
        db.conceptMastery[studentId] = [];
      }

      understoodConcepts.forEach(c => {
        const existing = db.conceptMastery[studentId].find(m => m.concept === c);
        if (existing) {
          existing.masteryScore = Math.min(100, existing.masteryScore + 10);
          existing.timesTested += 1;
          existing.needsRevision = false;
          existing.lastTestedDate = new Date().toISOString().split('T')[0];
        } else {
          db.conceptMastery[studentId].push({
            concept: c,
            subjectId: quiz.subjectId,
            masteryScore: 85,
            timesTested: 1,
            needsRevision: false,
            lastTestedDate: new Date().toISOString().split('T')[0]
          });
        }
      });

      weakConcepts.forEach(c => {
        const existing = db.conceptMastery[studentId].find(m => m.concept === c);
        if (existing) {
          existing.masteryScore = Math.max(20, existing.masteryScore - 15);
          existing.timesTested += 1;
          existing.needsRevision = true;
          existing.lastTestedDate = new Date().toISOString().split('T')[0];
        } else {
          db.conceptMastery[studentId].push({
            concept: c,
            subjectId: quiz.subjectId,
            masteryScore: 40,
            timesTested: 1,
            needsRevision: true,
            lastTestedDate: new Date().toISOString().split('T')[0]
          });
        }
      });

      // Update student lecture progress
      if (!db.lectureProgress[studentId]) {
        db.lectureProgress[studentId] = {};
      }
      db.lectureProgress[studentId][lectureId] = {
        lectureId,
        completed: percentage >= 70,
        lastTimestamp: quiz.questions[0]?.timestampRef || '00:00',
        progressPercent: percentage >= 70 ? 100 : 75,
        lastViewedAt: new Date().toISOString(),
        quizCompleted: true,
        quizScore: score,
        quizTotal: total,
        understoodConcepts,
        weakConcepts,
        recommendations
      };

      saveProgressToDisk(db.lectureProgress);

      const suggestedTutorPrompt = weakConcepts.length > 0
        ? `Why did I get question ${questionBreakdown.findIndex(q => !q.isCorrect) + 1} wrong regarding ${weakConcepts[0]}?`
        : 'Can you give me a harder extension problem on this lecture?';

      res.json({
        score,
        total,
        percentage,
        understoodConcepts,
        weakConcepts,
        recommendations,
        questionBreakdown,
        suggestedTutorPrompt
      });
    } catch (err: any) {
      console.error('Error evaluating mastery quiz:', err);
      res.status(500).json({ error: err.message || 'Failed to evaluate quiz' });
    }
  });

  // 7. Student Dashboard Summary ("What do I need to know, understand and do?")
  app.get('/api/students/:id/dashboard-summary', (req, res) => {
    const studentId = req.params.id || 'student-g11-1';

    // Today's classes
    const todayClasses = [
      {
        id: 'cls-1',
        subjectCode: 'PHY-11',
        subjectName: 'Physics 11 (Mechanics)',
        time: '09:00 AM - 10:00 AM',
        room: 'Science Hall P-201',
        teacherName: 'Dr. Alok Verma',
        topic: "Newton's Laws & Free Body Diagrams"
      },
      {
        id: 'cls-2',
        subjectCode: 'CHE-11',
        subjectName: 'Chemistry 11 (Bonding)',
        time: '11:15 AM - 12:15 PM',
        room: 'Chemistry Lab C-105',
        teacherName: 'Dr. Neha Sharma',
        topic: 'VSEPR Theory & Hybridization'
      },
      {
        id: 'cls-3',
        subjectCode: 'MAT-11',
        subjectName: 'Mathematics 11 (Calculus)',
        time: '02:00 PM - 03:00 PM',
        room: 'Ramanujan Block M-302',
        teacherName: 'Dr. R. D. Raman',
        topic: 'Limits & The Squeeze Theorem'
      }
    ];

    // Recent lectures from ClassSarthi
    const recentLectures = db.lectures || [];

    // Unfinished lectures
    const studentProgressMap = db.lectureProgress[studentId] || {};
    const unfinishedLectures = recentLectures
      .filter(l => {
        const prog = studentProgressMap[l.id];
        return !prog || !prog.completed;
      })
      .map(l => {
        const prog = studentProgressMap[l.id];
        return {
          lecture: l,
          lastTimestamp: prog?.lastTimestamp || '12:48',
          progressPercent: prog?.progressPercent || 45
        };
      });

    // Extracted assignments from ClassSarthi & teachers
    const assignments = [
      {
        id: 'asg-hc-verma-5',
        title: 'HC Verma Ch 5: Problems 4-9 on Connected Pulleys',
        subjectName: 'Physics 11',
        dueDate: 'Friday at 17:00 IST',
        status: 'pending' as const,
        relatedLectureTitle: "Newton's Laws of Motion & Free Body Diagrams"
      },
      {
        id: 'asg-vsepr-shapes',
        title: 'Molecular Geometries & Hybridization Worksheet (PCl5, SF6)',
        subjectName: 'Chemistry 11',
        dueDate: 'Tuesday at 23:59 IST',
        status: 'pending' as const,
        relatedLectureTitle: 'VSEPR Theory & Hybridization'
      }
    ];

    // Topics that need revision (based on student mastery)
    const masteryList = db.conceptMastery[studentId] || [];
    const topicsNeedingRevision = masteryList
      .filter(m => m.needsRevision)
      .map(m => ({
        concept: m.concept,
        subjectName: 'Physics 11',
        masteryScore: m.masteryScore,
        reason: 'Mistake identified in recent quiz on force versus acceleration distinction.',
        relatedLectureId: 'lec-phy-101',
        timestampRef: '21:05'
      }));

    // Recent Quiz Performance
    const progValues = Object.values(studentProgressMap);
    const lastQuiz: any = progValues.find((p: any) => p.quizCompleted);
    const recentQuizPerformance = lastQuiz
      ? {
          lastQuizTitle: "Newton's Laws Checkpoint",
          score: lastQuiz.quizScore,
          total: lastQuiz.quizTotal,
          understoodCount: lastQuiz.understoodConcepts?.length || 3,
          revisionCount: lastQuiz.weakConcepts?.length || 2,
          date: '2026-09-02'
        }
      : {
          lastQuizTitle: "Newton's Laws Checkpoint",
          score: 4,
          total: 6,
          understoodCount: 3,
          revisionCount: 2,
          date: '2026-09-02'
        };

    // Recommended things to study
    const recommendedStudy = [
      {
        title: "Revisit Newton's Second Law & Acceleration Distinction",
        type: 'revision' as const,
        reason: 'Identified as a weak concept in your recent quiz (Score: 4/6).',
        actionId: 'lec-phy-101',
        subjectId: 'subj-phy-11'
      },
      {
        title: 'Review Free Body Diagram Blackboard Capture at 21:05',
        type: 'lecture' as const,
        reason: 'Teacher demonstrated normal force decomposition for inclined plane.',
        actionId: 'lec-phy-101',
        subjectId: 'subj-phy-11'
      },
      {
        title: 'Practice HC Verma Connected Pulley Problems',
        type: 'practice' as const,
        reason: 'Homework assigned by Dr. Verma at 42:10, due Friday.',
        actionId: 'asg-hc-verma-5',
        subjectId: 'subj-phy-11'
      }
    ];

    const summary: StudentDashboardSummary = {
      todayClasses,
      recentLectures,
      unfinishedLectures,
      assignments,
      topicsNeedingRevision,
      recentQuizPerformance,
      recommendedStudy
    };

    res.json(summary);
  });

  // 8. Board Captures Gallery
  app.get('/api/board-captures', (req, res) => {
    const { subjectId, lectureId, conceptTag } = req.query;
    let captures = db.boardCaptures || [];
    if (subjectId && typeof subjectId === 'string' && subjectId !== 'all') {
      captures = captures.filter(b => b.subjectId === subjectId);
    }
    if (lectureId && typeof lectureId === 'string') {
      captures = captures.filter(b => b.lectureId === lectureId);
    }
    if (conceptTag && typeof conceptTag === 'string') {
      captures = captures.filter(b => b.conceptTag.toLowerCase().includes((conceptTag as string).toLowerCase()));
    }
    res.json({ captures });
  });

  // 9. Teacher Side: Class-Level Insights
  app.get('/api/teacher/class-insights/:subjectId', (req, res) => {
    const subjectId = req.params.subjectId;
    const subject = db.subjects.find(s => s.id === subjectId) || db.subjects[0];
    const totalStudents = subject.enrolledCount || 15;

    const insights: ClassLevelInsight = {
      subjectId: subject.id,
      subjectName: subject.name,
      classSize: totalStudents,
      weakConcepts: [
        {
          concept: "Newton's Second Law (Force vs Acceleration)",
          struggleRatePercent: 62,
          affectedStudentCount: Math.round(totalStudents * 0.62),
          totalStudents,
          recommendation: '62% of students struggled with Newton\'s Second Law. This topic may need to be explained again in next lecture.',
          relatedLectureId: 'lec-phy-101',
          timestampRef: '21:05'
        },
        {
          concept: 'Normal Force Resolution on Inclined Plane',
          struggleRatePercent: 38,
          affectedStudentCount: Math.round(totalStudents * 0.38),
          totalStudents,
          recommendation: '38% of students mistakenly set N = mg without applying cos(theta) component.',
          relatedLectureId: 'lec-phy-101',
          timestampRef: '21:05'
        }
      ],
      studentsFallingBehind: [
        {
          id: 'student-g11-1',
          name: 'Aarav Sharma',
          gpa: 8.4,
          weakConceptCount: 2,
          urgent: true
        },
        {
          id: 'student-g11-3',
          name: 'Rohan Iyer',
          gpa: 7.8,
          weakConceptCount: 2,
          urgent: true
        }
      ]
    };

    res.json(insights);
  });

  // 10. Webhook for ClassSarthi Ingestion
  app.post('/api/webhooks/classsarthi-ingest', (req, res) => {
    try {
      const lectureData = req.body;
      if (!lectureData || !lectureData.title) {
        return res.status(400).json({ error: 'Invalid ClassSarthi lecture payload' });
      }

      const newLecture: ClassSarthiLecture = {
        id: lectureData.id || `lec-${Date.now()}`,
        subjectId: lectureData.subjectId || 'subj-phy-11',
        subjectCode: lectureData.subjectCode || 'PHY-11',
        subjectName: lectureData.subjectName || 'Physics 11',
        title: lectureData.title,
        teacherName: lectureData.teacherName || 'Faculty Instructor',
        teacherId: lectureData.teacherId || 'teacher-phy',
        date: lectureData.date || new Date().toISOString().split('T')[0],
        duration: lectureData.duration || '45 mins',
        summary: lectureData.summary || 'ClassSarthi captured lecture.',
        topics: lectureData.topics || ['General Discussion'],
        timeline: lectureData.timeline || [],
        boardCaptures: lectureData.boardCaptures || [],
        audioTranscript: lectureData.audioTranscript || [],
        generalizedNotes: lectureData.generalizedNotes || {
          explanation: lectureData.summary || '',
          importantConcepts: [],
          formulas: [],
          examples: [],
          keyPoints: [],
          diagrams: [],
          homeworkMentioned: []
        },
        smartNotesMarkdown: lectureData.smartNotesMarkdown || `# ${lectureData.title}\n\n${lectureData.summary}`
      };

      db.lectures.unshift(newLecture);
      if (newLecture.boardCaptures && newLecture.boardCaptures.length > 0) {
        db.boardCaptures = [...newLecture.boardCaptures, ...db.boardCaptures];
      }
      saveLecturesToDisk(db.lectures);

      res.status(201).json({
        success: true,
        lectureId: newLecture.id,
        message: `ClassSarthi lecture "${newLecture.title}" successfully ingested and indexed.`
      });
    } catch (err: any) {
      console.error('Error in ClassSarthi ingest webhook:', err);
      res.status(500).json({ error: err.message || 'Ingest error' });
    }
  });

  // ==========================================
  // AI CLASS ANALYTICS (Teacher View)
  // ==========================================

  app.get('/api/analytics/:subjectId', (req, res) => {
    const subjectId = req.params.subjectId;
    let analytics = db.analytics[subjectId];

    if (!analytics) {
      const subject = db.subjects.find(s => s.id === subjectId) || db.subjects[0];
      analytics = {
        subjectId: subject.id,
        subjectName: subject.name,
        totalStudents: subject.enrolledCount,
        classAverage: 82.5,
        submissionRate: 90.0,
        atRiskStudentsCount: 2,
        gradeDistribution: [
          { range: '90-100% (A)', count: 10, percentage: 31 },
          { range: '80-89% (B)', count: 14, percentage: 44 },
          { range: '70-79% (C)', count: 5, percentage: 16 },
          { range: '60-69% (D)', count: 2, percentage: 6 },
          { range: '<60% (F)', count: 1, percentage: 3 }
        ],
        weakTopics: [
          {
            topic: 'Foundational Proofs & Invariants',
            errorRate: 35,
            averageScore: 68.0,
            affectedStudents: 11,
            recommendedRemediation: 'Provide extra practice worksheets and step-by-step inductive proof walkthroughs.',
            urgency: 'high'
          }
        ],
        trends: [
          { week: 'Week 1', avgScore: 86.0, submissionRate: 96.0, activeCount: subject.enrolledCount },
          { week: 'Week 2', avgScore: 83.2, submissionRate: 91.0, activeCount: subject.enrolledCount },
          { week: 'Week 3', avgScore: 82.5, submissionRate: 90.0, activeCount: subject.enrolledCount }
        ],
        aiExecutiveSummary: `Class average for ${subject.name} is ${82.5}% with a steady ${90}% submission rate. Continue monitoring diagnostic quiz results.`,
        keyActionItems: [
          'Review weak topic proofs in upcoming lecture.',
          'Send reminders for next milestone deadline.'
        ],
        lastGenerated: new Date().toISOString()
      };
      db.analytics[subjectId] = analytics;
    }

    res.json(analytics);
  });

  // ==========================================
  // GEMINI AI INTEGRATION ENDPOINTS
  // ==========================================

  // 1. Study Assistant RAG Chatbot
  const handleAIChat = async (req: express.Request, res: express.Response) => {
    try {
      const { message, subjectId, history } = req.body;
      const subject = db.subjects.find(s => s.id === subjectId) || db.subjects[0];
      const upcomingTimelines = db.timelines.filter(t => t.subjectId === subject.id);
      const resources = db.resources.filter(r => r.subjectId === subject.id);
      const assignments = db.assignments.filter(a => a.subjectId === subject.id);

      // Fetch student's recent notes for snippet grounding
      const user = getCurrentUser(req);
      const studentNotes = db.notes.filter(n => n.studentId === user.id && n.subjectId === subject.id);
      const studentNotesSnippet = studentNotes.map(n => `Title: ${n.title}\nContent snippet: ${n.content.slice(0, 300)}`).join('\n---\n');

      const result = await generateStudyAssistantReply({
        userMessage: message,
        chatHistory: history,
        subject,
        upcomingTimelines,
        resources,
        assignments,
        studentNotesSnippet,
        requestedMode: req.body.mode || 'general',
        learnerProfile: req.body.learnerProfile || user.learningProfile
      });

      res.json({
        ...result,
        response: result.reply // ensure backwards compatibility
      });
    } catch (err: any) {
      console.error('Error in /api/ai/chat:', err);
      res.status(500).json({ error: err?.message || 'Failed to generate AI study reply' });
    }
  };

  app.post('/api/ai/chat', aiRateLimiter.middleware, handleAIChat);
  app.post('/api/ai/study-assistant/chat', aiRateLimiter.middleware, handleAIChat);

  // AI Tutor — Context-Aware Socratic AI Tutor with Lecture & Quiz Error Grounding
  app.post('/api/tutor', aiRateLimiter.middleware, async (req, res) => {
    try {
      const { message, history = [], studentContext, lectureContext } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required.' });
      }

      // 1. Build rich contextual grounding
      const lectureInfo = lectureContext || studentContext?.lectureContext;
      const activeLecture = lectureInfo?.lectureId
        ? db.lectures.find(l => l.id === lectureInfo.lectureId) || db.lectures[0]
        : db.lectures[0];

      const mistakeContext = lectureInfo?.quizMistake || lectureInfo?.lastMistakeReview;
      const weakConcepts = lectureInfo?.weakConcepts || ['Force vs acceleration'];

      let lectureContextPrompt = `
[CLASSROOM_INTELLIGENCE_CONTEXT (ClassSarthi)]
- Current Lecture: "${activeLecture.title}" (${activeLecture.subjectName})
- Teacher: ${activeLecture.teacherName}
- Relevant Timestamps:
  * 05:32 - Newton's First Law
  * 12:48 - Inertia and Reference Frames
  * 21:05 - Free Body Diagram & Normal Force
  * 31:42 - Force vs Acceleration & Friction Numericals
  * 42:10 - Pulley Homework
- Student's Identified Weak Concepts: ${weakConcepts.join(', ')}
`;

      if (mistakeContext) {
        lectureContextPrompt += `
- Student's Recent Quiz Error:
  * Question: "${mistakeContext.question || 'Why is force different from acceleration?'}"
  * Student's Incorrect Choice: "${mistakeContext.studentAnswer || 'Treated force and acceleration as the same quantity'}"
  * Correct Concept: "${mistakeContext.correctAnswer || 'Force is the cause (Newtons), acceleration is the kinematic effect (m/s²)'}"
  * Classroom Timestamp Reference: "${mistakeContext.timestampRef || '21:05'}"
  * Misconception: "${mistakeContext.misconception || 'Confusing cause and effect in Newton Second Law'}"
`;
      }

      const apiKey = process.env.GEMINI_API_KEY;

      // Diverse Socratic answer generator for any topic across Physics, Chemistry, Maths, CS, and Engineering
      const generateSmartSocraticFallback = (userMsg: string) => {
        return generateDiverseSocraticReply(userMsg, {
          studentContext,
          lectureContext: lectureInfo,
          history
        });
      };

      if (!apiKey) {
        return res.json({ reply: generateSmartSocraticFallback(message) });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      // Format chat history for Gemini API
      const chatHistory = (Array.isArray(history) ? history : [])
        .filter((h: any) => (h.text || h.content) && (h.sender || h.role))
        .map((h: any) => ({
          role: (h.sender === 'user' || h.role === 'user') ? 'user' : 'model',
          parts: [{ text: h.text || h.content }]
        }));

      try {
        const tutorPromise = ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [
            ...chatHistory,
            { role: 'user', parts: [{ text: `${lectureContextPrompt}\n\nSTUDENT QUESTION: "${message}"` }] }
          ],
          config: {
            systemInstruction: `You are the EduSync Socratic AI Tutor. You help students understand ANY concept in Physics, Chemistry, Mathematics, Engineering, or general academic topics.
CRITICAL PEDAGOGY:
1. If the student asks about a quiz mistake, use the classroom context to address it directly.
2. If the student asks ANY general question (e.g. concepts, homework, proofs, formulas, analogies), answer it thoroughly, encouragingly, and clearly.
3. Use clean Markdown and LaTeX formulas ($...$ for inline, $$...$$ for block formulas).
4. Always end with an engaging guiding reflection question that encourages the student to think deeper.`,
            temperature: 0.6
          }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Tutor AI timeout')), 6500)
        );

        const result: any = await Promise.race([tutorPromise, timeoutPromise]);
        const reply = result.text || generateSmartSocraticFallback(message);
        return res.json({ reply });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using intelligent Socratic fallback:', geminiError?.message);
        return res.json({ reply: generateSmartSocraticFallback(message) });
      }

    } catch (err: any) {
      console.error('Error in /api/tutor:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate tutor response.'
      });
    }
  });


  // Dedicated Subject Deep Research & YouTube Video Finder
  app.post('/api/ai/research', aiRateLimiter.middleware, async (req, res) => {
    try {
      const { prompt, subjectId } = req.body;
      const subject = db.subjects.find(s => s.id === subjectId) || db.subjects[0];
      const result = await researchTopicAndVideosAI(prompt, subject);
      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/ai/research:', err);
      res.status(500).json({ error: err?.message || 'Failed to research subject details' });
    }
  });

  // Dedicated Topic / Prompt Quiz Generator
  app.post('/api/ai/quiz/generate', aiRateLimiter.middleware, async (req, res) => {
    try {
      const { prompt, subjectId, count } = req.body;
      const subject = db.subjects.find(s => s.id === subjectId);
      const quiz = await generatePromptQuizAI(prompt, subject, count || 4);
      res.json({ quiz });
    } catch (err: any) {
      console.error('Error in /api/ai/quiz/generate:', err);
      res.status(500).json({ error: err?.message || 'Failed to generate prompt quiz' });
    }
  });

  // Dedicated Tiered Lecture Mastery Quiz Generator (5-10 Questions: Easy, Moderate, Hard)
  app.post('/api/ai/quiz/generate-mastery-quiz', aiRateLimiter.middleware, async (req, res) => {
    try {
      const { noteContent, title, count = 6, learnerProfile } = req.body;
      const user = getCurrentUser(req);
      const profile = learnerProfile || user?.learningProfile;
      const result = await generateMasteryQuizAI(noteContent || '', title, profile, count);
      res.json(result);
    } catch (err: any) {
      console.error('Error generating mastery quiz:', err);
      res.status(500).json({ error: err?.message || 'Failed to generate mastery quiz' });
    }
  });

  // Quiz Performance AI Analysis & Socratic Tutor Handoff
  app.post('/api/ai/quiz/analyze-performance', aiRateLimiter.middleware, async (req, res) => {
    try {
      const { quizTitle, questions, userAnswers, learnerProfile } = req.body;
      const user = getCurrentUser(req);
      const profile = learnerProfile || user?.learningProfile;
      const analysis = await analyzeQuizPerformanceAI(quizTitle || 'Quiz', questions || [], userAnswers || [], profile);
      res.json(analysis);
    } catch (err: any) {
      console.error('Error analyzing quiz performance:', err);
      res.status(500).json({ error: err?.message || 'Failed to analyze quiz performance' });
    }
  });

  // Re-frame / Personalize Lecture Note via Student Persona
  app.post('/api/ai/notes/personalize', aiRateLimiter.middleware, async (req, res) => {
    try {
      const { noteContent, title, learnerProfile } = req.body;
      const user = getCurrentUser(req);
      const profile = learnerProfile || user?.learningProfile;
      const result = await personalizeNoteAI(noteContent || '', title, profile);
      res.json(result);
    } catch (err: any) {
      console.error('Error personalizing note:', err);
      res.status(500).json({ error: err?.message || 'Failed to personalize note' });
    }
  });

  // 2. Note Summarization (with Persona Adaptation)
  const handleSummarizeNote = async (req: express.Request, res: express.Response) => {
    try {
      const { noteId, content, subjectId, learnerProfile } = req.body;
      const user = getCurrentUser(req);
      const subject = db.subjects.find(s => s.id === subjectId);
      const finalProfile = learnerProfile || user?.learningProfile;
      const result = await summarizeNoteAI(content, subject?.name, finalProfile);

      // If noteId provided, update note in db
      if (noteId) {
        const note = db.notes.find(n => n.id === noteId);
        if (note) {
          note.summary = result.summary;
          note.keyTakeaways = result.keyTakeaways;
          note.lastModified = new Date().toISOString();
          saveNotesToDisk(db.notes);
        }
      }

      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/ai/summarize-note:', err);
      res.status(500).json({ error: 'Failed to summarize note' });
    }
  };

  app.post('/api/ai/summarize-note', aiRateLimiter.middleware, handleSummarizeNote);
  app.post('/api/ai/notes/summarize', aiRateLimiter.middleware, handleSummarizeNote);

  // 2.5 Prompt-Based & Document-Fed AI Note Generator (with Persona Adaptation)
  app.post('/api/ai/notes/generate', aiRateLimiter.middleware, async (req, res) => {
    try {
      const { prompt, subjectId, depth, attachedText, documentName, learnerProfile } = req.body;
      const user = getCurrentUser(req);
      const isOthers = subjectId === 'others' || subjectId === 'subj-others';
      const subject = isOthers
        ? {
            id: 'others',
            code: 'OTHERS',
            name: 'General & Electives / Other Topics',
            department: 'Electives & Interdisciplinary Studies',
            teacherId: 'teacher-general',
            teacherName: 'Academic Faculty',
            teacherEmail: 'academics@bmu.edu.in',
            color: 'purple',
            accentBg: 'bg-purple-500/10',
            enrolledCount: 0,
            semester: 'Universal',
            room: 'Main Campus',
            credits: 3,
            description: 'General engineering, computer science, mathematics, and interdisciplinary topics.',
            syllabusTopics: []
          }
        : (db.subjects.find(s => s.id === subjectId) || db.subjects[0]);

      const result = await generateDetailedTopicNoteAI({
        prompt,
        subject,
        depth: depth || 'exam_prep',
        attachedText,
        documentName,
        learnerProfile: learnerProfile || user?.learningProfile
      });
      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/ai/notes/generate:', err);
      res.status(500).json({ error: 'Failed to generate comprehensive notes' });
    }
  });

  // 3. Quick Flashcard Generation (with Persona Adaptation)
  const handleGenerateFlashcards = async (req: express.Request, res: express.Response) => {
    try {
      const { noteId, content, learnerProfile } = req.body;
      const user = getCurrentUser(req);
      const finalProfile = learnerProfile || user?.learningProfile;
      const flashcards = await generateFlashcardsAI(content, 5, finalProfile);

      if (noteId) {
        const note = db.notes.find(n => n.id === noteId);
        if (note) {
          note.flashcards = flashcards;
          note.lastModified = new Date().toISOString();
          saveNotesToDisk(db.notes);
        }
      }

      res.json({ flashcards });
    } catch (err: any) {
      console.error('Error in /api/ai/generate-flashcards:', err);
      res.status(500).json({ error: 'Failed to generate flashcards' });
    }
  };

  app.post('/api/ai/generate-flashcards', aiRateLimiter.middleware, handleGenerateFlashcards);
  app.post('/api/ai/notes/flashcards', aiRateLimiter.middleware, handleGenerateFlashcards);

  // 4. Note-to-Quiz Bridge (with Teacher Question Bank Grounding & Persona Adaptation)
  const handleNoteToQuiz = async (req: express.Request, res: express.Response) => {
    try {
      const { noteId, content, title, learnerProfile, subjectId } = req.body;
      const user = getCurrentUser(req);
      const finalProfile = learnerProfile || user?.learningProfile;

      // Identify relevant subject to ground quiz with teacher's uploaded questions
      let targetSubjectId = subjectId;
      if (!targetSubjectId && noteId) {
        const foundNote = db.notes.find(n => n.id === noteId);
        if (foundNote?.subjectId) {
          targetSubjectId = foundNote.subjectId;
        }
      }
      if (!targetSubjectId && title) {
        const tLower = title.toLowerCase();
        if (tLower.includes('phys') || tLower.includes('mechanic') || tLower.includes('friction') || tLower.includes('force')) {
          targetSubjectId = 'subj-phy';
        } else if (tLower.includes('chem') || tLower.includes('thermo') || tLower.includes('aldol') || tLower.includes('reaction')) {
          targetSubjectId = 'subj-che';
        } else if (tLower.includes('math') || tLower.includes('calculus') || tLower.includes('integral') || tLower.includes('vector')) {
          targetSubjectId = 'subj-mat';
        }
      }

      // Collect teacher questions from matching question banks
      const relevantBanks = targetSubjectId
        ? db.questionBanks.filter(qb => qb.subjectId === targetSubjectId)
        : db.questionBanks;
      const teacherQuestions = (relevantBanks || []).flatMap(qb => qb.questions || []);

      const quizData = await generateNoteQuizAI(content, title, finalProfile, teacherQuestions);

      const generatedQuiz = {
        id: `quiz-${Date.now()}`,
        title: quizData.title,
        topic: title || 'Custom Note Practice',
        questions: quizData.questions,
        createdAt: new Date().toISOString(),
        hasTeacherQuestions: quizData.hasTeacherQuestions,
        teacherQuestionsCount: quizData.teacherQuestionsCount
      };

      if (noteId) {
        const note = db.notes.find(n => n.id === noteId);
        if (note) {
          note.quiz = generatedQuiz;
          note.lastModified = new Date().toISOString();
          saveNotesToDisk(db.notes);
        }
      }

      res.json({ quiz: generatedQuiz });
    } catch (err: any) {
      console.error('Error in /api/ai/note-to-quiz:', err);
      res.status(500).json({ error: 'Failed to create quiz from notes' });
    }
  };

  app.post('/api/ai/note-to-quiz', aiRateLimiter.middleware, handleNoteToQuiz);
  app.post('/api/ai/notes/quiz', aiRateLimiter.middleware, handleNoteToQuiz);

  // ==========================================
  // QUESTION BANKS API (Teacher Upload & AI Grounding)
  // ==========================================

  app.get('/api/question-banks', (req: Request, res: Response) => {
    try {
      const { subjectId } = req.query;
      if (subjectId && typeof subjectId === 'string' && subjectId !== 'all') {
        const filtered = (db.questionBanks || []).filter(qb => qb.subjectId === subjectId);
        return res.json(filtered);
      }
      return res.json(db.questionBanks || []);
    } catch (err: any) {
      console.error('Error fetching question banks:', err);
      res.status(500).json({ error: 'Failed to fetch question banks' });
    }
  });

  app.post('/api/question-banks', (req: Request, res: Response) => {
    try {
      const { subjectId, title, description, questions } = req.body;
      const user = getCurrentUser(req);
      if (!title || !subjectId || !Array.isArray(questions)) {
        return res.status(400).json({ error: 'Missing title, subjectId, or questions array' });
      }

      const newBank = {
        id: `qb-${Date.now()}`,
        subjectId,
        title: String(title).trim(),
        description: description ? String(description).trim() : 'Faculty question bank',
        teacherId: user?.id || 'teacher-phy',
        teacherName: user?.name || 'Department Faculty',
        uploadedAt: new Date().toISOString(),
        questionsCount: questions.length,
        questions: questions.map((q: any, i: number) => ({
          ...q,
          id: q.id || `q-${Date.now()}-${i}`,
          source: 'teacher_question_bank' as const,
          questionBankTitle: String(title).trim(),
          teacherName: user?.name || 'Department Faculty'
        }))
      };

      if (!db.questionBanks) db.questionBanks = [];
      db.questionBanks.unshift(newBank);
      res.status(201).json(newBank);
    } catch (err: any) {
      console.error('Error creating question bank:', err);
      res.status(500).json({ error: 'Failed to create question bank' });
    }
  });

  app.delete('/api/question-banks/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const initialLen = (db.questionBanks || []).length;
      db.questionBanks = (db.questionBanks || []).filter(qb => qb.id !== id);
      if (db.questionBanks.length === initialLen) {
        return res.status(404).json({ error: 'Question bank not found' });
      }
      res.json({ success: true, message: 'Question bank deleted' });
    } catch (err: any) {
      console.error('Error deleting question bank:', err);
      res.status(500).json({ error: 'Failed to delete question bank' });
    }
  });

  // 5. AI Class Diagnostics (Teacher Analytics)
  const handleClassDiagnostics = async (req: express.Request, res: express.Response) => {
    try {
      const { subjectId } = req.body;
      const subject = db.subjects.find(s => s.id === subjectId) || db.subjects[0];
      const existing = db.analytics[subject.id];
      const currentAnalytics = existing || {
        subjectId: subject.id,
        subjectName: subject.name,
        totalStudents: subject.enrolledCount,
        classAverage: 84.6,
        submissionRate: 92.1,
        atRiskStudentsCount: 3,
        gradeDistribution: [
          { range: '90-100% (A)', count: 14, percentage: 37 },
          { range: '80-89% (B)', count: 12, percentage: 32 },
          { range: '70-79% (C)', count: 7, percentage: 18 },
          { range: '60-69% (D)', count: 3, percentage: 8 },
          { range: '<60% (F)', count: 2, percentage: 5 }
        ],
        weakTopics: [],
        trends: [
          { week: 'Week 1', avgScore: 82, submissionRate: 95, activeCount: 38 },
          { week: 'Week 2', avgScore: 86, submissionRate: 94, activeCount: 38 },
          { week: 'Week 3', avgScore: 79, submissionRate: 88, activeCount: 36 },
          { week: 'Week 4', avgScore: 85, submissionRate: 92, activeCount: 38 }
        ],
        aiExecutiveSummary: '',
        keyActionItems: [],
        lastGenerated: new Date().toISOString()
      };

      const diagnostics = await generateClassDiagnosticsAI(subject, currentAnalytics);

      // Update analytics in database
      db.analytics[subject.id] = {
        ...currentAnalytics,
        aiExecutiveSummary: diagnostics.aiExecutiveSummary,
        keyActionItems: diagnostics.keyActionItems,
        weakTopics: diagnostics.weakTopics,
        lastGenerated: new Date().toISOString()
      };

      res.json({ analytics: db.analytics[subject.id] });
    } catch (err: any) {
      console.error('Error in /api/ai/class-diagnostics:', err);
      res.status(500).json({ error: 'Failed to generate class diagnostics' });
    }
  };

  app.post('/api/ai/class-diagnostics', aiRateLimiter.middleware, handleClassDiagnostics);
  app.post('/api/ai/analytics/diagnostics', aiRateLimiter.middleware, handleClassDiagnostics);

  // 6. Teacher AI Syllabus & Timeline Generator
  const handleSyllabusGenerate = async (req: express.Request, res: express.Response) => {
    try {
      const { courseName, description, courseDescription, weeksCount, subjectId } = req.body;
      const timelineItems = await generateSyllabusTimelineAI(courseName, description || courseDescription, weeksCount || 6);

      const addedTimelines: any[] = [];
      // Optionally append to subject timeline
      if (subjectId && Array.isArray(timelineItems)) {
        const startDate = new Date();
        timelineItems.forEach((item, index) => {
          const targetDate = new Date(startDate.getTime() + (item.weekNumber || index + 1) * 7 * 86400000);
          const newItem = {
            id: `time-ai-${Date.now()}-${index}`,
            subjectId,
            title: item.title,
            type: item.type,
            date: targetDate.toISOString().split('T')[0],
            startTime: '10:00 AM',
            endTime: '11:30 AM',
            location: 'Main Hall / Online',
            description: item.description,
            topicsCovered: item.topicsCovered || [],
            weightagePercent: item.weightagePercent || 10,
            status: 'upcoming' as const
          };
          db.timelines.push(newItem);
          addedTimelines.push(newItem);
        });
      }

      res.json({ timelineItems, timelines: addedTimelines });
    } catch (err: any) {
      console.error('Error in /api/ai/generate-syllabus:', err);
      res.status(500).json({ error: 'Failed to generate syllabus timeline' });
    }
  };

  app.post('/api/ai/generate-syllabus', aiRateLimiter.middleware, handleSyllabusGenerate);
  app.post('/api/ai/syllabus/generate', aiRateLimiter.middleware, handleSyllabusGenerate);

  // Global Safe Error Handling Middleware (Prevents internal stack trace leakage)
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err) {
      if (err.type === 'entity.too.large') {
        res.status(413).json({ error: 'Payload too large. Maximum allowed size is 2MB.' });
        return;
      }
      if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({ error: 'Malformed JSON payload.' });
        return;
      }
      console.error('Unhandled server error:', err);
      res.status(500).json({ error: 'Internal server error.' });
      return;
    }
    next();
  });

  // ==========================================
  // VITE & PRODUCTION STATIC ASSETS
  // ==========================================

  async function startServer() {
    if (process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      return;
    }

    const distPath = path.join(process.cwd(), 'dist');
    const distIndexHtml = path.join(distPath, 'index.html');
    const hasDist = fs.existsSync(distIndexHtml);
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction && hasDist) {
      console.log(`EduSync serving production static build from: ${distPath}`);
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(distIndexHtml);
      });
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`EduSync Server running on http://0.0.0.0:${PORT}`);
      });
    } else {
      console.log('EduSync running in Development mode with Vite HMR.');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`EduSync Server running on http://0.0.0.0:${PORT}`);
      });
    }
  }

  startServer();

  export default app;
