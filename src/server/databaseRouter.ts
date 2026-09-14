import { Router, Request, Response } from 'express';
import { eduSyncDb } from './database';

export const databaseRouter = Router();

// ==========================================
// 1. CLASSES & SCHEDULES
// ==========================================

databaseRouter.get('/classes', (req: Request, res: Response) => {
  try {
    const day = typeof req.query.dayOfWeek === 'string' ? req.query.dayOfWeek : undefined;
    const classes = eduSyncDb.getClasses(day);
    res.json(classes);
  } catch (err: any) {
    console.error('Error fetching classes:', err);
    res.status(500).json({ error: 'Failed to fetch classes from database.' });
  }
});

databaseRouter.get('/classes/:id', (req: Request, res: Response) => {
  try {
    const slot = eduSyncDb.getClassById(req.params.id);
    if (!slot) {
      res.status(404).json({ error: 'Class slot not found.' });
      return;
    }
    res.json(slot);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve class slot.' });
  }
});

databaseRouter.post('/classes', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const created = eduSyncDb.createClass(req.body, actor);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create class slot.' });
  }
});

databaseRouter.put('/classes/:id', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const updated = eduSyncDb.updateClass(req.params.id, req.body, actor);
    if (!updated) {
      res.status(404).json({ error: 'Class slot not found.' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update class slot.' });
  }
});

databaseRouter.delete('/classes/:id', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const ok = eduSyncDb.deleteClass(req.params.id, actor);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete class slot.' });
  }
});

// ==========================================
// 2. ATTENDANCE & ROSTERS
// ==========================================

databaseRouter.get('/attendance/roster', (_req: Request, res: Response) => {
  try {
    const roster = eduSyncDb.getAttendanceRoster();
    res.json(roster);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch student attendance roster.' });
  }
});

databaseRouter.post('/attendance/mark', (req: Request, res: Response) => {
  try {
    const { studentId, status, slotId } = req.body;
    if (!studentId || !status) {
      res.status(400).json({ error: 'studentId and status are required.' });
      return;
    }
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const updatedRoster = eduSyncDb.markStudentAttendance(studentId, status, slotId, actor);
    res.json(updatedRoster);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update student attendance.' });
  }
});

databaseRouter.post('/attendance/batch-mark', (req: Request, res: Response) => {
  try {
    const { status, slotId } = req.body;
    if (!status || (status !== 'present' && status !== 'absent')) {
      res.status(400).json({ error: 'Valid status (present/absent) is required.' });
      return;
    }
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const updatedRoster = eduSyncDb.batchMarkAttendance(status, slotId, actor);
    res.json(updatedRoster);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to batch mark attendance.' });
  }
});

databaseRouter.get('/attendance/teacher-log', (req: Request, res: Response) => {
  try {
    const teacherId = (req.query.teacherId as string) || 'teacher-ess';
    const log = eduSyncDb.getTeacherAttendanceLog(teacherId);
    res.json(log);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve teacher attendance log.' });
  }
});

databaseRouter.post('/attendance/teacher-punch', (req: Request, res: Response) => {
  try {
    const { teacherId = 'teacher-ess', action } = req.body;
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    let log;
    if (action === 'punch_out') {
      log = eduSyncDb.punchOutTeacher(teacherId, actor);
    } else {
      log = eduSyncDb.punchInTeacher(teacherId, actor);
    }
    res.json(log);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record teacher attendance punch.' });
  }
});

// ==========================================
// 3. ANTI-PROXY GOVERNANCE
// ==========================================

databaseRouter.get('/anti-proxy', (_req: Request, res: Response) => {
  try {
    const alerts = eduSyncDb.getAntiProxyAlerts();
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve anti-proxy alerts.' });
  }
});

databaseRouter.post('/anti-proxy/resolve', (req: Request, res: Response) => {
  try {
    const { alertId, resolution, note } = req.body;
    if (!alertId || !resolution) {
      res.status(400).json({ error: 'alertId and resolution are required.' });
      return;
    }
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const updatedAlerts = eduSyncDb.resolveAntiProxyAlert(alertId, resolution, note, actor);
    res.json(updatedAlerts);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to resolve anti-proxy alert.' });
  }
});

// ==========================================
// 4. STUDENT TELEMETRY & DOUBT CLUSTERS
// ==========================================

databaseRouter.get('/telemetry', (_req: Request, res: Response) => {
  try {
    const telemetry = eduSyncDb.getStudentTelemetry();
    res.json(telemetry);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve student telemetry records.' });
  }
});

databaseRouter.post('/telemetry/record', (req: Request, res: Response) => {
  try {
    const { studentId, delta } = req.body;
    if (!studentId || !delta) {
      res.status(400).json({ error: 'studentId and delta metrics are required.' });
      return;
    }
    const actor = (req.headers['x-actor'] as string) || 'system';
    const updated = eduSyncDb.recordStudentTelemetry(studentId, delta, actor);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record student telemetry.' });
  }
});

databaseRouter.get('/doubt-clusters', (_req: Request, res: Response) => {
  try {
    const clusters = eduSyncDb.getDoubtClusters();
    res.json(clusters);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve doubt clusters.' });
  }
});

databaseRouter.post('/doubt-clusters/:id/script', (req: Request, res: Response) => {
  try {
    const { script } = req.body;
    if (!script) {
      res.status(400).json({ error: 'script content is required.' });
      return;
    }
    const actor = (req.headers['x-actor'] as string) || 'ai_engine';
    const updated = eduSyncDb.saveDoubtClusterScript(req.params.id, script, actor);
    if (!updated) {
      res.status(404).json({ error: 'Doubt cluster not found.' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save doubt remediation script.' });
  }
});

// ==========================================
// 5. ACADEMIC CALENDAR & MILESTONES
// ==========================================

databaseRouter.get('/calendar', (_req: Request, res: Response) => {
  try {
    const events = eduSyncDb.getCalendarEvents();
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve calendar events.' });
  }
});

databaseRouter.post('/calendar', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const created = eduSyncDb.createCalendarEvent(req.body, actor);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create calendar event.' });
  }
});

databaseRouter.put('/calendar/:id', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const updated = eduSyncDb.updateCalendarEvent(req.params.id, req.body, actor);
    if (!updated) {
      res.status(404).json({ error: 'Calendar event not found.' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update calendar event.' });
  }
});

databaseRouter.delete('/calendar/:id', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const ok = eduSyncDb.deleteCalendarEvent(req.params.id, actor);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete calendar event.' });
  }
});

// ==========================================
// 6. TEACHER WORKSPACE (STICKY NOTES, TASKS, LEAVES)
// ==========================================

databaseRouter.get('/workspace/notes', (_req: Request, res: Response) => {
  try {
    res.json(eduSyncDb.getTeacherNotes());
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve sticky notes.' });
  }
});

databaseRouter.post('/workspace/notes', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const note = eduSyncDb.addTeacherNote(req.body, actor);
    res.status(201).json(note);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create sticky note.' });
  }
});

databaseRouter.patch('/workspace/notes/:id/toggle', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const toggled = eduSyncDb.toggleTeacherNote(req.params.id, actor);
    if (!toggled) {
      res.status(404).json({ error: 'Sticky note not found.' });
      return;
    }
    res.json(toggled);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle note.' });
  }
});

databaseRouter.delete('/workspace/notes/:id', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const ok = eduSyncDb.deleteTeacherNote(req.params.id, actor);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete sticky note.' });
  }
});

databaseRouter.get('/workspace/tasks', (_req: Request, res: Response) => {
  try {
    res.json(eduSyncDb.getTeacherTasks());
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve teacher tasks.' });
  }
});

databaseRouter.post('/workspace/tasks', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const task = eduSyncDb.addTeacherTask(req.body, actor);
    res.status(201).json(task);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create teacher task.' });
  }
});

databaseRouter.patch('/workspace/tasks/:id/toggle', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const toggled = eduSyncDb.toggleTeacherTask(req.params.id, actor);
    if (!toggled) {
      res.status(404).json({ error: 'Teacher task not found.' });
      return;
    }
    res.json(toggled);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle teacher task.' });
  }
});

databaseRouter.get('/workspace/leaves', (_req: Request, res: Response) => {
  try {
    res.json(eduSyncDb.getTeacherLeaves());
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve leave requests.' });
  }
});

databaseRouter.post('/workspace/leaves', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'faculty';
    const leave = eduSyncDb.submitTeacherLeave(req.body, actor);
    res.status(201).json(leave);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit leave request.' });
  }
});

// ==========================================
// 7. STUDENT WORKSPACE & TASKS
// ==========================================

databaseRouter.get('/student/tasks', (req: Request, res: Response) => {
  try {
    const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
    res.json(eduSyncDb.getStudentTasks(studentId));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve student tasks.' });
  }
});

databaseRouter.post('/student/tasks', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'student';
    const task = eduSyncDb.addStudentTask(req.body, actor);
    res.status(201).json(task);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create student task.' });
  }
});

databaseRouter.patch('/student/tasks/:id/toggle', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'student';
    const toggled = eduSyncDb.toggleStudentTask(req.params.id, actor);
    if (!toggled) {
      res.status(404).json({ error: 'Student task not found.' });
      return;
    }
    res.json(toggled);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle student task.' });
  }
});

databaseRouter.post('/student/quiz-submissions', (req: Request, res: Response) => {
  try {
    const actor = (req.headers['x-actor'] as string) || 'student';
    const recorded = eduSyncDb.recordQuizSubmission(req.body, actor);
    res.status(201).json(recorded);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record quiz submission.' });
  }
});

// ==========================================
// 8. DATABASE DIAGNOSTICS & EXPORT
// ==========================================

databaseRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = eduSyncDb.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve database stats.' });
  }
});

databaseRouter.get('/export', (_req: Request, res: Response) => {
  try {
    const dump = eduSyncDb.exportAll();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="edusync-database-dump-${Date.now()}.json"`);
    res.json(dump);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to export database.' });
  }
});
