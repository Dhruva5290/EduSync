import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WeakTopicItem {
  topic: string;
  score?: number;
  reason?: string;
  remediation?: string;
  subjectCode?: string;
}

export interface AIContextType {
  currentLectureId: string | null;
  setCurrentLectureId: (id: string | null) => void;
  lastLectureTitle: string | null;
  setLastLectureTitle: (title: string | null) => void;
  weakTopics: WeakTopicItem[];
  setWeakTopics: (topics: WeakTopicItem[]) => void;
  recentQuizAnswers: Record<string, any>;
  setRecentQuizAnswers: (answers: Record<string, any>) => void;
  activeStudentSummary: any;
  setActiveStudentSummary: (summary: any) => void;
  getContextPayload: () => {
    currentLectureId: string | null;
    lastLectureTitle: string | null;
    weakTopics: WeakTopicItem[];
    recentQuizAnswers: Record<string, any>;
  };
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLectureId, setCurrentLectureId] = useState<string | null>('lec-phy-101');
  const [lastLectureTitle, setLastLectureTitle] = useState<string | null>("Newton's Laws of Motion & Free Body Diagrams");
  const [weakTopics, setWeakTopics] = useState<WeakTopicItem[]>([
    {
      topic: "Newton's Second Law & Acceleration Distinction",
      score: 62,
      reason: 'Mistake identified in distinguishing external force vs acceleration equivalence.',
      subjectCode: 'PHY'
    },
    {
      topic: 'Air Resistance & Parabolic Trajectory Distortion',
      score: 58,
      reason: 'Gap in how atmospheric drag affects horizontal range and velocity decomposition.',
      subjectCode: 'PHY'
    },
    {
      topic: 'VSEPR Molecular Geometry & Lone Pair Repulsions',
      score: 65,
      reason: 'Confusion between tetrahedral vs trigonal bipyramidal bond angles in PCl5/SF4.',
      subjectCode: 'CHEM'
    }
  ]);
  const [recentQuizAnswers, setRecentQuizAnswers] = useState<Record<string, any>>({});
  const [activeStudentSummary, setActiveStudentSummary] = useState<any>(null);

  const getContextPayload = () => ({
    currentLectureId,
    lastLectureTitle,
    weakTopics,
    recentQuizAnswers
  });

  return (
    <AIContext.Provider
      value={{
        currentLectureId,
        setCurrentLectureId,
        lastLectureTitle,
        setLastLectureTitle,
        weakTopics,
        setWeakTopics,
        recentQuizAnswers,
        setRecentQuizAnswers,
        activeStudentSummary,
        setActiveStudentSummary,
        getContextPayload
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAIContext = (): AIContextType => {
  const context = useContext(AIContext);
  if (!context) {
    return {
      currentLectureId: 'lec-phy-101',
      setCurrentLectureId: () => {},
      lastLectureTitle: "Newton's Laws of Motion & Free Body Diagrams",
      setLastLectureTitle: () => {},
      weakTopics: [],
      setWeakTopics: () => {},
      recentQuizAnswers: {},
      setRecentQuizAnswers: () => {},
      activeStudentSummary: null,
      setActiveStudentSummary: () => {},
      getContextPayload: () => ({
        currentLectureId: 'lec-phy-101',
        lastLectureTitle: "Newton's Laws of Motion & Free Body Diagrams",
        weakTopics: [],
        recentQuizAnswers: {}
      })
    };
  }
  return context;
};
