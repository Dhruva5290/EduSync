import path from 'path';
import fs from 'fs';
import { JsonCollection, ensureDatabaseDir } from './storageEngine';
import {
  DbClassSlot,
  DbStudentAttendance,
  DbAttendanceSession,
  DbAntiProxyAlert,
  DbStudentTelemetry,
  DbDoubtCluster,
  DbCalendarEvent,
  DbTeacherStickyNote,
  DbTeacherLessonTask,
  DbTeacherLeave,
  DbStudentTask,
  DbStudentQuizRecord,
  DatabaseStats,
  CollectionName
} from './types';
import {
  SEED_CLASSES,
  SEED_STUDENTS_ROSTER,
  SEED_ANTI_PROXY_ALERTS,
  SEED_STUDENT_TELEMETRY,
  SEED_DOUBT_CLUSTERS,
  SEED_CALENDAR_EVENTS,
  SEED_TEACHER_STICKY_NOTES,
  SEED_TEACHER_TASKS,
  SEED_TEACHER_LEAVES,
  SEED_STUDENT_TASKS
} from './seedData';
import { TeacherAttendanceLog } from '../../types';

class ClassSarthiDatabase {
  private startTime = Date.now();

  // Persistent Collections
  public readonly classes: JsonCollection<DbClassSlot>;
  public readonly attendanceRoster: JsonCollection<DbStudentAttendance>;
  public readonly attendanceSessions: JsonCollection<DbAttendanceSession>;
  public readonly teacherAttendanceLogs: JsonCollection<TeacherAttendanceLog & { id: string }>;
  public readonly antiProxyAlerts: JsonCollection<DbAntiProxyAlert>;
  public readonly performanceTelemetry: JsonCollection<DbStudentTelemetry>;
  public readonly doubtClusters: JsonCollection<DbDoubtCluster>;
  public readonly calendarEvents: JsonCollection<DbCalendarEvent>;
  public readonly teacherStickyNotes: JsonCollection<DbTeacherStickyNote>;
  public readonly teacherTasks: JsonCollection<DbTeacherLessonTask>;
  public readonly teacherLeaves: JsonCollection<DbTeacherLeave>;
  public readonly studentTasks: JsonCollection<DbStudentTask>;
  public readonly studentQuizSubmissions: JsonCollection<DbStudentQuizRecord & { id: string }>;

  constructor() {
    ensureDatabaseDir();

    this.classes = new JsonCollection<DbClassSlot>('classes', SEED_CLASSES);
    this.attendanceRoster = new JsonCollection<DbStudentAttendance>('attendance_roster', SEED_STUDENTS_ROSTER);
    this.attendanceSessions = new JsonCollection<DbAttendanceSession>('attendance_sessions', []);
    this.teacherAttendanceLogs = new JsonCollection<TeacherAttendanceLog & { id: string }>('teacher_attendance_logs', [
      {
        id: 'log-teacher-ess',
        teacherId: 'teacher-ess',
        date: new Date().toISOString().split('T')[0],
        punchInTime: '08:42 AM',
        status: 'Present'
      }
    ]);
    this.antiProxyAlerts = new JsonCollection<DbAntiProxyAlert>('anti_proxy_alerts', SEED_ANTI_PROXY_ALERTS);
    this.performanceTelemetry = new JsonCollection<DbStudentTelemetry>('performance_telemetry', SEED_STUDENT_TELEMETRY);
    this.doubtClusters = new JsonCollection<DbDoubtCluster>('doubt_clusters', SEED_DOUBT_CLUSTERS);
    this.calendarEvents = new JsonCollection<DbCalendarEvent>('calendar_events', SEED_CALENDAR_EVENTS);
    this.teacherStickyNotes = new JsonCollection<DbTeacherStickyNote>('teacher_sticky_notes', SEED_TEACHER_STICKY_NOTES);
    this.teacherTasks = new JsonCollection<DbTeacherLessonTask>('teacher_tasks', SEED_TEACHER_TASKS);
    this.teacherLeaves = new JsonCollection<DbTeacherLeave>('teacher_leaves', SEED_TEACHER_LEAVES);
    this.studentTasks = new JsonCollection<DbStudentTask>('student_tasks', SEED_STUDENT_TASKS);
    this.studentQuizSubmissions = new JsonCollection<DbStudentQuizRecord & { id: string }>('student_quiz_submissions', []);

    console.info(`[ClassSarthi Database] Initialized and verified on-disk storage in ${path.resolve(process.cwd(), 'data', 'database')}`);
  }

  // ==========================================
  // DOMAIN REPOSITORIES & BUSINESS LOGIC
  // ==========================================

  /**
   * 1. CLASSES & SCHEDULES
   */
  public getClasses(dayOfWeek?: string): DbClassSlot[] {
    if (dayOfWeek) {
      return this.classes.getAll(c => c.dayOfWeek?.toLowerCase() === dayOfWeek.toLowerCase());
    }
    return this.classes.getAll();
  }

  public getClassById(id: string): DbClassSlot | null {
    return this.classes.getById(id);
  }

  public createClass(slot: Omit<DbClassSlot, 'id'>, actor?: string): DbClassSlot {
    const newSlot: DbClassSlot = {
      ...slot,
      id: `slot-${Date.now()}`
    };
    return this.classes.insert(newSlot, actor);
  }

  public updateClass(id: string, updates: Partial<DbClassSlot>, actor?: string): DbClassSlot | null {
    return this.classes.update(id, updates, actor);
  }

  public deleteClass(id: string, actor?: string): boolean {
    return this.classes.delete(id, actor);
  }

  /**
   * 2. ATTENDANCE & ROSTERS
   */
  public getAttendanceRoster(): DbStudentAttendance[] {
    return this.attendanceRoster.getAll();
  }

  public markStudentAttendance(
    studentId: string,
    status: 'present' | 'absent' | 'late',
    slotId?: string,
    actor = 'faculty'
  ): DbStudentAttendance[] {
    const student = this.attendanceRoster.getById(studentId) ||
      this.attendanceRoster.getAll().find(s => s.studentId === studentId);

    if (student) {
      const isPresent = status === 'present' || status === 'late';
      const wasPresent = student.todayStatus === 'present' || student.todayStatus === 'late';

      let classesAttended = student.classesAttended;
      if (isPresent && !wasPresent) classesAttended += 1;
      else if (!isPresent && wasPresent && classesAttended > 0) classesAttended -= 1;

      const totalClassesHeld = Math.max(student.totalClassesHeld, classesAttended);
      const currentPercentage = totalClassesHeld > 0
        ? Number(((classesAttended / totalClassesHeld) * 100).toFixed(1))
        : 0;

      let riskLevel: 'danger_60' | 'warning_75' | 'safe' = 'safe';
      if (currentPercentage < 60) riskLevel = 'danger_60';
      else if (currentPercentage < 75) riskLevel = 'warning_75';

      let consecutiveAbsences = student.consecutiveAbsences || 0;
      if (status === 'absent') {
        if (student.todayStatus !== 'absent') consecutiveAbsences += 1;
      } else {
        consecutiveAbsences = 0;
      }

      this.attendanceRoster.update(student.id || studentId, {
        todayStatus: status,
        classesAttended,
        totalClassesHeld,
        currentPercentage,
        riskLevel,
        consecutiveAbsences,
        lastMarkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, actor);
    }

    return this.getAttendanceRoster();
  }

  public batchMarkAttendance(
    status: 'present' | 'absent',
    slotId?: string,
    actor = 'faculty'
  ): DbStudentAttendance[] {
    const students = this.attendanceRoster.getAll();
    const updatedList = students.map(student => {
      const isPresent = status === 'present';
      const wasPresent = student.todayStatus === 'present' || student.todayStatus === 'late';

      let classesAttended = student.classesAttended;
      if (isPresent && !wasPresent) classesAttended += 1;
      else if (!isPresent && wasPresent && classesAttended > 0) classesAttended -= 1;

      const totalClassesHeld = Math.max(student.totalClassesHeld, classesAttended);
      const currentPercentage = totalClassesHeld > 0
        ? Number(((classesAttended / totalClassesHeld) * 100).toFixed(1))
        : 0;

      let riskLevel: 'danger_60' | 'warning_75' | 'safe' = 'safe';
      if (currentPercentage < 60) riskLevel = 'danger_60';
      else if (currentPercentage < 75) riskLevel = 'warning_75';

      let consecutiveAbsences = student.consecutiveAbsences || 0;
      if (status === 'absent') {
        if (student.todayStatus !== 'absent') consecutiveAbsences += 1;
      } else {
        consecutiveAbsences = 0;
      }

      return {
        ...student,
        todayStatus: status,
        classesAttended,
        totalClassesHeld,
        currentPercentage,
        riskLevel,
        consecutiveAbsences,
        lastMarkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });

    this.attendanceRoster.setAll(updatedList, actor);

    // If slot provided, mark slot as attendance taken
    if (slotId) {
      this.classes.update(slotId, { attendanceTaken: true, status: 'completed' }, actor);
    }

    return this.getAttendanceRoster();
  }

  public getTeacherAttendanceLog(teacherId: string): TeacherAttendanceLog {
    const today = new Date().toISOString().split('T')[0];
    const found = this.teacherAttendanceLogs.getAll(l => l.teacherId === teacherId && l.date === today)[0];
    if (found) return found;

    return {
      teacherId,
      date: today,
      punchInTime: '08:42 AM',
      status: 'Present'
    };
  }

  public punchInTeacher(teacherId: string, actor = 'faculty'): TeacherAttendanceLog {
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const existing = this.teacherAttendanceLogs.getAll(l => l.teacherId === teacherId && l.date === today)[0];
    if (existing) {
      const updated = this.teacherAttendanceLogs.update(existing.id, {
        status: 'Present',
        punchInTime: existing.punchInTime || timeStr
      }, actor);
      return updated!;
    }

    const newLog: TeacherAttendanceLog & { id: string } = {
      id: `tlog-${Date.now()}`,
      teacherId,
      date: today,
      punchInTime: timeStr,
      status: 'Present'
    };
    return this.teacherAttendanceLogs.insert(newLog, actor);
  }

  public punchOutTeacher(teacherId: string, actor = 'faculty'): TeacherAttendanceLog {
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const existing = this.teacherAttendanceLogs.getAll(l => l.teacherId === teacherId && l.date === today)[0];
    if (existing) {
      const updated = this.teacherAttendanceLogs.update(existing.id, {
        status: 'Present',
        punchOutTime: timeStr
      }, actor);
      return updated!;
    }

    const newLog: TeacherAttendanceLog & { id: string } = {
      id: `tlog-${Date.now()}`,
      teacherId,
      date: today,
      punchInTime: '08:42 AM',
      punchOutTime: timeStr,
      status: 'Present'
    };
    return this.teacherAttendanceLogs.insert(newLog, actor);
  }

  /**
   * 3. ANTI-PROXY GOVERNANCE
   */
  public getAntiProxyAlerts(): DbAntiProxyAlert[] {
    return this.antiProxyAlerts.getAll();
  }

  public resolveAntiProxyAlert(
    alertId: string,
    resolution: 'justified' | 'reported_to_dean',
    resolutionNote?: string,
    actor = 'faculty'
  ): DbAntiProxyAlert[] {
    this.antiProxyAlerts.update(alertId, {
      status: resolution,
      teacherNote: resolutionNote || (resolution === 'justified' ? 'Exemption approved by course instructor.' : 'Notice dispatched to Proctor Office.')
    }, actor);
    return this.getAntiProxyAlerts();
  }

  /**
   * 4. STUDENT PERFORMANCE & DOUBT CLUSTERS
   */
  public getStudentTelemetry(): DbStudentTelemetry[] {
    return this.performanceTelemetry.getAll();
  }

  public recordStudentTelemetry(
    studentId: string,
    delta: {
      studyHours?: number;
      doubtsAsked?: number;
      questionsSolved?: number;
      masteryScore?: number;
    },
    actor = 'system'
  ): DbStudentTelemetry[] {
    const record = this.performanceTelemetry.getAll(t => t.studentId === studentId)[0];
    if (record) {
      const studyHoursOnPlatform = Number((record.studyHoursOnPlatform + (delta.studyHours || 0)).toFixed(1));
      const doubtsAskedCount = record.doubtsAskedCount + (delta.doubtsAsked || 0);
      const questionsSolvedCount = record.questionsSolvedCount + (delta.questionsSolved || 0);
      const growthRatePercent = Number((record.growthRatePercent + (questionsSolvedCount > 50 ? 1.5 : 0.5)).toFixed(1));

      this.performanceTelemetry.update(record.id || studentId, {
        studyHoursOnPlatform,
        doubtsAskedCount,
        questionsSolvedCount,
        growthRatePercent,
        trajectory: growthRatePercent > 10 ? 'accelerating' : 'steady'
      }, actor);
    }
    return this.getStudentTelemetry();
  }

  public getDoubtClusters(): DbDoubtCluster[] {
    return this.doubtClusters.getAll();
  }

  public saveDoubtClusterScript(clusterId: string, script: string, actor = 'ai_engine'): DbDoubtCluster | null {
    return this.doubtClusters.update(clusterId, { aiRemediationSuggestion: script }, actor);
  }

  /**
   * 5. ACADEMIC CALENDAR & MILESTONES
   */
  public getCalendarEvents(): DbCalendarEvent[] {
    return this.calendarEvents.getAll();
  }

  public createCalendarEvent(event: Omit<DbCalendarEvent, 'id'>, actor?: string): DbCalendarEvent {
    const newEvent: DbCalendarEvent = {
      ...event,
      id: `cal-${Date.now()}`
    };
    return this.calendarEvents.insert(newEvent, actor);
  }

  public updateCalendarEvent(id: string, updates: Partial<DbCalendarEvent>, actor?: string): DbCalendarEvent | null {
    return this.calendarEvents.update(id, updates, actor);
  }

  public deleteCalendarEvent(id: string, actor?: string): boolean {
    return this.calendarEvents.delete(id, actor);
  }

  /**
   * 6. TEACHER WORKSPACE (STICKY NOTES, TASKS, LEAVES)
   */
  public getTeacherNotes(): DbTeacherStickyNote[] {
    return this.teacherStickyNotes.getAll();
  }

  public addTeacherNote(note: Omit<DbTeacherStickyNote, 'id' | 'createdAt'>, actor?: string): DbTeacherStickyNote {
    const newNote: DbTeacherStickyNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    return this.teacherStickyNotes.insert(newNote, actor);
  }

  public deleteTeacherNote(id: string, actor?: string): boolean {
    return this.teacherStickyNotes.delete(id, actor);
  }

  public toggleTeacherNote(id: string, actor?: string): DbTeacherStickyNote | null {
    const note = this.teacherStickyNotes.getById(id);
    if (!note) return null;
    return this.teacherStickyNotes.update(id, { isCompleted: !note.isCompleted }, actor);
  }

  public getTeacherTasks(): DbTeacherLessonTask[] {
    return this.teacherTasks.getAll();
  }

  public addTeacherTask(task: Omit<DbTeacherLessonTask, 'id'>, actor?: string): DbTeacherLessonTask {
    const newTask: DbTeacherLessonTask = {
      ...task,
      id: `task-${Date.now()}`
    };
    return this.teacherTasks.insert(newTask, actor);
  }

  public toggleTeacherTask(id: string, actor?: string): DbTeacherLessonTask | null {
    const task = this.teacherTasks.getById(id);
    if (!task) return null;
    return this.teacherTasks.update(id, { isDone: !task.isDone }, actor);
  }

  public getTeacherLeaves(): DbTeacherLeave[] {
    return this.teacherLeaves.getAll();
  }

  public submitTeacherLeave(leave: Omit<DbTeacherLeave, 'id' | 'appliedAt' | 'status'>, actor?: string): DbTeacherLeave {
    const newLeave: DbTeacherLeave = {
      ...leave,
      id: `leave-${Date.now()}`,
      status: 'Pending HOD Approval',
      appliedAt: new Date().toISOString()
    };
    return this.teacherLeaves.insert(newLeave, actor);
  }

  /**
   * 7. STUDENT WORKSPACE & TASKS
   */
  public getStudentTasks(studentId?: string): DbStudentTask[] {
    if (studentId) {
      return this.studentTasks.getAll(t => t.studentId === studentId);
    }
    return this.studentTasks.getAll();
  }

  public addStudentTask(task: Omit<DbStudentTask, 'id'>, actor?: string): DbStudentTask {
    const newTask: DbStudentTask = {
      ...task,
      id: `stask-${Date.now()}`
    };
    return this.studentTasks.insert(newTask, actor);
  }

  public toggleStudentTask(id: string, actor?: string): DbStudentTask | null {
    const task = this.studentTasks.getById(id);
    if (!task) return null;
    return this.studentTasks.update(id, { completed: !task.completed }, actor);
  }

  public recordQuizSubmission(submission: DbStudentQuizRecord, actor = 'student'): DbStudentQuizRecord {
    const record = {
      ...submission,
      id: `qsub-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    return this.studentQuizSubmissions.insert(record, actor);
  }

  /**
   * 8. STATS & HEALTH CHECK
   */
  public getStats(): DatabaseStats {
    const collectionsMap: Record<CollectionName, number> = {
      classes: this.classes.count(),
      attendance_roster: this.attendanceRoster.count(),
      attendance_sessions: this.attendanceSessions.count(),
      teacher_attendance_logs: this.teacherAttendanceLogs.count(),
      anti_proxy_alerts: this.antiProxyAlerts.count(),
      performance_telemetry: this.performanceTelemetry.count(),
      doubt_clusters: this.doubtClusters.count(),
      calendar_events: this.calendarEvents.count(),
      teacher_sticky_notes: this.teacherStickyNotes.count(),
      teacher_tasks: this.teacherTasks.count(),
      teacher_leaves: this.teacherLeaves.count(),
      student_tasks: this.studentTasks.count(),
      student_quiz_submissions: this.studentQuizSubmissions.count()
    };

    const totalRecords = Object.values(collectionsMap).reduce((a, b) => a + b, 0);

    const totalDiskBytes =
      this.classes.getFileSize() +
      this.attendanceRoster.getFileSize() +
      this.attendanceSessions.getFileSize() +
      this.teacherAttendanceLogs.getFileSize() +
      this.antiProxyAlerts.getFileSize() +
      this.performanceTelemetry.getFileSize() +
      this.doubtClusters.getFileSize() +
      this.calendarEvents.getFileSize() +
      this.teacherStickyNotes.getFileSize() +
      this.teacherTasks.getFileSize() +
      this.teacherLeaves.getFileSize() +
      this.studentTasks.getFileSize() +
      this.studentQuizSubmissions.getFileSize();

    return {
      status: 'healthy',
      storageDirectory: path.resolve(process.cwd(), 'data', 'database'),
      collections: collectionsMap,
      totalRecords,
      lastFlushedAt: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      diskSizeBytes: totalDiskBytes
    };
  }

  /**
   * 9. COMPLETE DATABASE EXPORT DUMP
   */
  public exportAll(): Record<string, any> {
    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '2.0.0',
        engine: 'ClassSarthi Persistent File Database'
      },
      classes: this.classes.getAll(),
      attendanceRoster: this.attendanceRoster.getAll(),
      attendanceSessions: this.attendanceSessions.getAll(),
      teacherAttendanceLogs: this.teacherAttendanceLogs.getAll(),
      antiProxyAlerts: this.antiProxyAlerts.getAll(),
      performanceTelemetry: this.performanceTelemetry.getAll(),
      doubtClusters: this.doubtClusters.getAll(),
      calendarEvents: this.calendarEvents.getAll(),
      teacherStickyNotes: this.teacherStickyNotes.getAll(),
      teacherTasks: this.teacherTasks.getAll(),
      teacherLeaves: this.teacherLeaves.getAll(),
      studentTasks: this.studentTasks.getAll(),
      studentQuizSubmissions: this.studentQuizSubmissions.getAll()
    };
  }
}

export const eduSyncDb = new ClassSarthiDatabase();
