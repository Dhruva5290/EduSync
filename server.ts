import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './src/server/db';
import {
  generateStudyAssistantReply,
  summarizeNoteAI,
  generateFlashcardsAI,
  generateNoteQuizAI,
  generatePromptQuizAI,
  researchTopicAndVideosAI,
  generateClassDiagnosticsAI,
  generateSyllabusTimelineAI
} from './src/server/gemini';
import { User, Subject, StudentNote, Assignment, Submission, TimelineItem, ReferenceResource } from './src/types';

dotenv.config();

// Active session state for prototyping (defaults to Teacher for initial inspection, easily switchable)
let currentUserId = 'teacher-1';

// In-memory rate limiting tracker
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 60; // 60 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000;

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip || 'local-client';
  const now = Date.now();
  let record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitMap.set(clientIp, record);
  } else {
    record.count++;
  }

  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - record.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

  if (record.count > RATE_LIMIT_MAX) {
    res.status(429).json({
      error: 'Rate limit exceeded. Please wait a moment before sending more AI requests.'
    });
    return;
  }
  next();
}

function getAuthenticatedUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      if (decoded && decoded.userId) {
        const found = db.users.find(u => u.id === decoded.userId);
        if (found) return found;
      }
    } catch {
      // Invalid token
    }
  }

  // Check header fallback
  const customUserId = req.headers['x-user-id'] as string;
  if (customUserId) {
    const found = db.users.find(u => u.id === customUserId);
    if (found) return found;
  }

  return null;
}

function getCurrentUser(req?: Request): User {
  if (req) {
    const user = getAuthenticatedUser(req);
    if (user) return user;
  }
  return db.users.find(u => u.id === currentUserId) || db.users[0];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(rateLimiter);

  // ==========================================
  // AUTH & IDENTITY MANAGEMENT (RBAC)
  // ==========================================

  // 1. Password Login Endpoint (Supports preloaded credentials + Straightforward Instant Login for any user ID)
  app.post('/api/auth/login', (req, res) => {
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
    }

    // Create Base64 Session Token
    const token = Buffer.from(JSON.stringify({ userId: user.id, role: user.role, time: Date.now() })).toString('base64');

    res.json({
      success: true,
      token,
      user
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

  app.post('/api/auth/switch', handleSwitchUser);
  app.post('/api/auth/switch-user', handleSwitchUser);

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

    res.json({ success: true, user });
  });

  // Delete user
  app.delete('/api/users/:id', (req, res) => {
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

    student.enrolledSubjectIds.forEach(id => {
      if (!next.has(id)) {
        const s = db.subjects.find(sub => sub.id === id);
        if (s && s.enrolledCount > 0) s.enrolledCount--;
      }
    });

    student.enrolledSubjectIds = subjectIds;
    res.json({ success: true, user: student });
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
    let userNotes = db.notes.filter(n => n.studentId === user.id);
    if (subjectId) {
      userNotes = userNotes.filter(n => n.subjectId === subjectId);
    }
    res.json(userNotes);
  };

  app.get('/api/notes/:subjectId', handleGetNotes);
  app.get('/api/notes', handleGetNotes);

  app.post('/api/notes', (req, res) => {
    const user = getCurrentUser(req);
    const { id, subjectId, title, content, tags, isPinned, summary, keyTakeaways, flashcards, quiz } = req.body;

    if (id) {
      const idx = db.notes.findIndex(n => n.id === id && n.studentId === user.id);
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
        res.json(db.notes[idx]);
        return;
      }
    }

    // Create new note
    const newNote: StudentNote = {
      id: `note-${Date.now()}`,
      studentId: user.id,
      subjectId: subjectId || 'subj-cs301',
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
    res.json(newNote);
  });

  app.delete('/api/notes/:id', (req, res) => {
    const user = getCurrentUser(req);
    const idx = db.notes.findIndex(n => n.id === req.params.id && n.studentId === user.id);
    if (idx !== -1) {
      db.notes.splice(idx, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Note not found' });
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
      const user = getCurrentUser();
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
        requestedMode: req.body.mode || 'general'
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

  app.post('/api/ai/chat', handleAIChat);
  app.post('/api/ai/study-assistant/chat', handleAIChat);

  // Dedicated Subject Deep Research & YouTube Video Finder
  app.post('/api/ai/research', async (req, res) => {
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
  app.post('/api/ai/quiz/generate', async (req, res) => {
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

  // 2. Note Summarization
  const handleSummarizeNote = async (req: express.Request, res: express.Response) => {
    try {
      const { noteId, content, subjectId } = req.body;
      const subject = db.subjects.find(s => s.id === subjectId);
      const result = await summarizeNoteAI(content, subject?.name);

      // If noteId provided, update note in db
      if (noteId) {
        const note = db.notes.find(n => n.id === noteId);
        if (note) {
          note.summary = result.summary;
          note.keyTakeaways = result.keyTakeaways;
          note.lastModified = new Date().toISOString();
        }
      }

      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/ai/summarize-note:', err);
      res.status(500).json({ error: 'Failed to summarize note' });
    }
  };

  app.post('/api/ai/summarize-note', handleSummarizeNote);
  app.post('/api/ai/notes/summarize', handleSummarizeNote);

  // 3. Quick Flashcard Generation
  const handleGenerateFlashcards = async (req: express.Request, res: express.Response) => {
    try {
      const { noteId, content } = req.body;
      const flashcards = await generateFlashcardsAI(content, 5);

      if (noteId) {
        const note = db.notes.find(n => n.id === noteId);
        if (note) {
          note.flashcards = flashcards;
          note.lastModified = new Date().toISOString();
        }
      }

      res.json({ flashcards });
    } catch (err: any) {
      console.error('Error in /api/ai/generate-flashcards:', err);
      res.status(500).json({ error: 'Failed to generate flashcards' });
    }
  };

  app.post('/api/ai/generate-flashcards', handleGenerateFlashcards);
  app.post('/api/ai/notes/flashcards', handleGenerateFlashcards);

  // 4. Note-to-Quiz Bridge
  const handleNoteToQuiz = async (req: express.Request, res: express.Response) => {
    try {
      const { noteId, content, title } = req.body;
      const quizData = await generateNoteQuizAI(content, title);

      const generatedQuiz = {
        id: `quiz-${Date.now()}`,
        title: quizData.title,
        topic: title || 'Custom Note Practice',
        questions: quizData.questions,
        createdAt: new Date().toISOString()
      };

      if (noteId) {
        const note = db.notes.find(n => n.id === noteId);
        if (note) {
          note.quiz = generatedQuiz;
          note.lastModified = new Date().toISOString();
        }
      }

      res.json({ quiz: generatedQuiz });
    } catch (err: any) {
      console.error('Error in /api/ai/note-to-quiz:', err);
      res.status(500).json({ error: 'Failed to create quiz from notes' });
    }
  };

  app.post('/api/ai/note-to-quiz', handleNoteToQuiz);
  app.post('/api/ai/notes/quiz', handleNoteToQuiz);

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

  app.post('/api/ai/class-diagnostics', handleClassDiagnostics);
  app.post('/api/ai/analytics/diagnostics', handleClassDiagnostics);

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

  app.post('/api/ai/generate-syllabus', handleSyllabusGenerate);
  app.post('/api/ai/syllabus/generate', handleSyllabusGenerate);

  // ==========================================
  // VITE MIDDLEWARE SETUP
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduSync Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
