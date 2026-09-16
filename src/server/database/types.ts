import {
  User,
  Subject,
  TeacherScheduleSlot,
  StudentAttendanceItem,
  AntiProxyDiscrepancy,
  StudentTelemetryMetric,
  CommonDoubtCluster,
  TeacherQuickStickyNote,
  TeacherLessonTask,
  TeacherLeaveRequest,
  TeacherAttendanceLog,
  AcademicCalendarEvent,
  ReferenceResource,
  StudentTaskItem,
  StudentQuizSubmission,
  AttendanceRiskLevel,
  TaskPriority
} from '../../types';

export type CollectionName =
  | 'classes'
  | 'attendance_roster'
  | 'attendance_sessions'
  | 'teacher_attendance_logs'
  | 'anti_proxy_alerts'
  | 'performance_telemetry'
  | 'doubt_clusters'
  | 'calendar_events'
  | 'teacher_sticky_notes'
  | 'teacher_tasks'
  | 'teacher_leaves'
  | 'student_tasks'
  | 'student_quiz_submissions';

export interface DbClassSlot extends TeacherScheduleSlot {
  createdAt?: string;
  updatedAt?: string;
}

export interface DbStudentAttendance extends StudentAttendanceItem {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbAttendanceSession {
  id: string;
  slotId: string;
  subjectCode: string;
  teacherId: string;
  date: string;
  markedAt: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRatePercent: number;
  records: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'late';
  }>;
}

export interface DbAntiProxyAlert extends AntiProxyDiscrepancy {
  createdAt?: string;
  updatedAt?: string;
}

export interface DbStudentTelemetry extends StudentTelemetryMetric {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbDoubtCluster extends CommonDoubtCluster {
  createdAt?: string;
  updatedAt?: string;
}

export interface DbCalendarEvent extends AcademicCalendarEvent {
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbTeacherStickyNote extends TeacherQuickStickyNote {
  updatedAt?: string;
}

export interface DbTeacherLessonTask extends TeacherLessonTask {
  createdAt?: string;
  updatedAt?: string;
}

export interface DbTeacherLeave extends TeacherLeaveRequest {
  updatedAt?: string;
}

export interface DbStudentTask extends StudentTaskItem {
  studentId: string;
  updatedAt?: string;
}

export interface DbStudentQuizRecord extends StudentQuizSubmission {
  createdAt?: string;
}

export interface DbAuditLogEntry {
  id: string;
  timestamp: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'BATCH_UPDATE' | 'INIT';
  collection: CollectionName;
  recordId?: string;
  actor?: string;
  details?: Record<string, any>;
}

export interface DatabaseStats {
  status: 'healthy' | 'degraded';
  storageDirectory: string;
  collections: Record<CollectionName, number>;
  totalRecords: number;
  lastFlushedAt: string;
  uptimeSeconds: number;
  diskSizeBytes: number;
}
