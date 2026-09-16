import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { BoardCapture } from '../types';

export interface StudentDashboardData {
  todayLecture: {
    id: string;
    subjectId: string;
    subjectName?: string;
    teacherName?: string;
    title: string;
    date: string;
    duration: string;
    rawText: string;
    summary: string;
    keyTakeaways: string[];
    boardCaptures: BoardCapture[];
  };
  masteryQuiz: {
    id: string;
    lectureId: string;
    subjectId: string;
    title: string;
    passingScore?: number;
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      conceptTag: string;
      timestampRef?: string;
    }>;
  };
  weakPoints: string[];
  todoAssignments: Array<{
    id: string;
    title: string;
    subjectId: string;
    subjectName: string;
    dueDate: string;
    dueCountdown: string;
    totalPoints: number;
    status: 'pending' | 'submitted' | 'graded';
  }>;
  upcomingTimeline: Array<{
    id: string;
    title: string;
    subjectId: string;
    subjectName: string;
    date: string;
    time: string;
    type: string;
    daysAway: number;
  }>;
  subjects: Array<{
    id: string;
    code: string;
    name: string;
    description: string;
    teacherName: string;
    color: string;
    enrolledCount: number;
    lectures: Array<{
      id: string;
      title: string;
      date: string;
      duration?: string;
      rawText: string;
      summary: string;
      keyTakeaways?: string[];
      boardCaptures?: BoardCapture[];
    }>;
  }>;
  studentProgress?: {
    feedback?: 'easy' | 'hard' | null;
    quizScore?: number | null;
    quizCompleted?: boolean;
    completed?: boolean;
  };
}

interface StudentContextType {
  weakPoints: string[];
  setWeakPoints: (points: string[]) => void;
  learningStyle: string;
  setLearningStyle: (style: string) => void;
  dashboardData: StudentDashboardData | null;
  setDashboardData: React.Dispatch<React.SetStateAction<StudentDashboardData | null>>;
  loading: boolean;
  refreshDashboardData: (studentId?: string) => Promise<void>;
  markAssignmentDone: (assignmentId: string, studentId?: string) => Promise<boolean>;
  submitLectureFeedback: (lectureId: string, feedback: 'easy' | 'hard', studentId?: string) => Promise<void>;
  activeFeedback: 'easy' | 'hard' | null;
  setActiveFeedback: (fb: 'easy' | 'hard' | null) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentContextProvider: React.FC<{ children: ReactNode; initialStudentId?: string }> = ({
  children,
  initialStudentId = 'student-1'
}) => {
  const [weakPoints, setWeakPoints] = useState<string[]>([
    "Normal Force Resolution on Inclines",
    "Kinetic Friction Vector Directions"
  ]);
  const [learningStyle, setLearningStyle] = useState<string>('visual');
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFeedback, setActiveFeedback] = useState<'easy' | 'hard' | null>(null);

  const refreshDashboardData = useCallback(async (studentId: string = initialStudentId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/dashboard-data?studentId=${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
        if (Array.isArray(data.weakPoints) && data.weakPoints.length > 0) {
          setWeakPoints(data.weakPoints);
        }
        if (data.studentProgress?.feedback) {
          setActiveFeedback(data.studentProgress.feedback);
        }
      }
    } catch (err) {
      console.warn('Could not fetch student dashboard data, using initial state:', err);
    } finally {
      setLoading(false);
    }
  }, [initialStudentId]);

  useEffect(() => {
    refreshDashboardData(initialStudentId);
  }, [refreshDashboardData, initialStudentId]);

  const markAssignmentDone = useCallback(async (assignmentId: string, studentId: string = initialStudentId): Promise<boolean> => {
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          studentId,
          content: 'Completed assignment submitted via Command Center quick-check.'
        })
      });

      if (res.ok || res.status === 201) {
        setDashboardData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            todoAssignments: prev.todoAssignments.map(a =>
              a.id === assignmentId ? { ...a, status: 'submitted' } : a
            )
          };
        });
        return true;
      }
    } catch (err) {
      console.error('Failed to submit assignment:', err);
    }

    // Optimistic fallback update
    setDashboardData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        todoAssignments: prev.todoAssignments.map(a =>
          a.id === assignmentId ? { ...a, status: 'submitted' } : a
        )
      };
    });
    return true;
  }, [initialStudentId]);

  const submitLectureFeedback = useCallback(async (
    lectureId: string,
    feedback: 'easy' | 'hard',
    studentId: string = initialStudentId
  ) => {
    setActiveFeedback(feedback);
    try {
      await fetch(`/api/lectures/${encodeURIComponent(lectureId)}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, feedback })
      });
    } catch (err) {
      console.warn('Failed to save lecture feedback on server:', err);
    }
  }, [initialStudentId]);

  return (
    <StudentContext.Provider
      value={{
        weakPoints,
        setWeakPoints,
        learningStyle,
        setLearningStyle,
        dashboardData,
        setDashboardData,
        loading,
        refreshDashboardData,
        markAssignmentDone,
        submitLectureFeedback,
        activeFeedback,
        setActiveFeedback
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export function useStudentContext(): StudentContextType {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudentContext must be used within a StudentContextProvider');
  }
  return context;
}
