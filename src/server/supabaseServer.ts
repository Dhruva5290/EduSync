import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db, saveNotesToDisk, saveProgressToDisk } from './db';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isServerSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.trim() !== '' &&
    !supabaseUrl.includes('placeholder') &&
    supabaseKey &&
    supabaseKey.trim() !== ''
  );
};

export const serverSupabase: SupabaseClient | null = isServerSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const PERSONALIZED_NOTES_PATH = path.resolve(process.cwd(), 'data', 'personalized_notes.json');

function loadPersonalizedNotesFromDisk(): Record<string, any> {
  try {
    if (fs.existsSync(PERSONALIZED_NOTES_PATH)) {
      const raw = fs.readFileSync(PERSONALIZED_NOTES_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[SupabaseServer] Could not load personalized notes from disk:', err);
  }
  return {};
}

function savePersonalizedNotesToDisk(store: Record<string, any>) {
  try {
    const dir = path.dirname(PERSONALIZED_NOTES_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PERSONALIZED_NOTES_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[SupabaseServer] Could not save personalized notes to disk:', err);
  }
}

const localPersonalizedStore: Record<string, any> = loadPersonalizedNotesFromDisk();

const CURATED_DEFAULT_VIDEOS: Record<string, any[]> = {
  'lec-phy-101': [
    {
      title: "Khan Academy: Free Body Diagrams & Inclined Planes Visualized",
      youtubeSearchQuery: "Khan Academy Free body diagrams inclined plane animation",
      whyWatch: "Step-by-step vector breakdown of gravity into mg cos θ and mg sin θ on an incline.",
      url: "https://www.youtube.com/watch?v=5qmh_85aUqM",
      thumbnail: "https://img.youtube.com/vi/5qmh_85aUqM/mqdefault.jpg"
    },
    {
      title: "3Blue1Brown: Essence of Calculus — Velocity vs Acceleration",
      youtubeSearchQuery: "3Blue1Brown derivative velocity acceleration animation",
      whyWatch: "Geometric visual proof distinguishing the cause (force) from the kinematic rate of change (acceleration).",
      url: "https://www.youtube.com/watch?v=9vKqVkMQHKk",
      thumbnail: "https://img.youtube.com/vi/9vKqVkMQHKk/mqdefault.jpg"
    },
    {
      title: "The Organic Chemistry Tutor: Newton's Laws & Tension Problems",
      youtubeSearchQuery: "Organic Chemistry Tutor Newtons Laws of Motion friction problems",
      whyWatch: "Worked examples of coupled multi-mass systems and elevator apparent weight.",
      url: "https://www.youtube.com/watch?v=kKKM8Y-u7ds",
      thumbnail: "https://img.youtube.com/vi/kKKM8Y-u7ds/mqdefault.jpg"
    }
  ],
  'lec-che-101': [
    {
      title: "Tyler DeWitt: VSEPR Theory Made Easy & 3D Molecular Shapes",
      youtubeSearchQuery: "Tyler DeWitt VSEPR theory practice problems 3D animation",
      whyWatch: "Intuitive 3D spatial models demonstrating lone pair electron repulsion geometries.",
      url: "https://www.youtube.com/watch?v=nxebQZUVvTg",
      thumbnail: "https://img.youtube.com/vi/nxebQZUVvTg/mqdefault.jpg"
    },
    {
      title: "Khan Academy: Hybridization and Molecular Orbitals",
      youtubeSearchQuery: "Khan Academy hybridization sp sp2 sp3 molecular orbital animation",
      whyWatch: "Visual representations of sp, sp2, and sp3 orbital overlaps and bond angle shifts.",
      url: "https://www.youtube.com/watch?v=otYBgQpBCEU",
      thumbnail: "https://img.youtube.com/vi/otYBgQpBCEU/mqdefault.jpg"
    }
  ],
  'lec-mat-101': [
    {
      title: "3Blue1Brown: The Essence of Calculus — What is a Limit?",
      youtubeSearchQuery: "3Blue1Brown essence of calculus chapter 1 limits derivative animation",
      whyWatch: "Intuitive geometric framing of continuous boundaries and instantaneous rates.",
      url: "https://www.youtube.com/watch?v=kfF40MiS7zA",
      thumbnail: "https://img.youtube.com/vi/kfF40MiS7zA/mqdefault.jpg"
    },
    {
      title: "Khan Academy: Squeeze (Sandwich) Theorem Geometric Proof",
      youtubeSearchQuery: "Khan Academy Squeeze Theorem sandwich theorem proof sin x over x",
      whyWatch: "Unit circle geometric proof bounding sin(x)/x between cos(x) and 1 as x approaches zero.",
      url: "https://www.youtube.com/watch?v=4-m2c8x7w3I",
      thumbnail: "https://img.youtube.com/vi/4-m2c8x7w3I/mqdefault.jpg"
    }
  ]
};

/**
 * Fetch generalized lecture notes (from Supabase if configured, otherwise fallback to local db.lectures / db.notes)
 */
export async function getGeneralizedLectureNote(lectureId: string): Promise<{
  id?: string;
  lectureId: string;
  title: string;
  subjectId: string;
  subjectName: string;
  transcriptSummary: string;
  boardOcrText?: string;
  keyFormulas?: any[];
  coreTopics?: string[];
  smartNotesMarkdown?: string;
}> {
  if (serverSupabase) {
    try {
      const { data, error } = await serverSupabase
        .from('generalized_notes')
        .select('*')
        .eq('lecture_id', lectureId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          lectureId: data.lecture_id,
          title: data.title,
          subjectId: data.subject_id,
          subjectName: data.subject_name,
          transcriptSummary: data.transcript_summary,
          boardOcrText: data.board_ocr_text,
          keyFormulas: data.key_formulas || [],
          coreTopics: data.core_topics || []
        };
      }
    } catch (err) {
      console.warn('[SupabaseServer] Could not fetch generalized_notes from cloud, falling back to local data:', err);
    }
  }

  // Fallback to local db.lectures or db.notes
  const lecture = db.lectures.find(l => l.id === lectureId) || db.lectures[0];
  if (lecture) {
    const ocrSummary = (lecture.boardCaptures || [])
      .map(b => `${b.title}: ${b.ocrLatex || b.explanation}`)
      .join('\n');

    return {
      lectureId: lecture.id,
      title: lecture.title,
      subjectId: lecture.subjectId,
      subjectName: lecture.subjectName,
      transcriptSummary: lecture.summary,
      boardOcrText: ocrSummary,
      keyFormulas: lecture.generalizedNotes?.formulas || [],
      coreTopics: lecture.topics || [],
      smartNotesMarkdown: lecture.smartNotesMarkdown
    };
  }

  return {
    lectureId,
    title: 'Classroom Lecture Note',
    subjectId: 'subj-phy-11',
    subjectName: 'Physics',
    transcriptSummary: 'Comprehensive classroom discussion covering derivations and core principles.',
    coreTopics: ['Core Fundamentals']
  };
}

/**
 * Fetch student telemetry (mistakes, doubts, study time, learning style)
 */
export async function getStudentLearningTelemetry(studentId: string, lectureId?: string): Promise<{
  studentId: string;
  lectureId?: string;
  mistakePatterns: any[];
  doubtHistory: any[];
  timeStudiedSeconds: number;
  learningStyle: string;
  targetGrade: string;
}> {
  if (serverSupabase) {
    try {
      let query = serverSupabase
        .from('student_learning_telemetry')
        .select('*')
        .eq('student_id', studentId);

      if (lectureId) {
        query = query.eq('lecture_id', lectureId);
      }

      const { data, error } = await query.order('updated_at', { ascending: false }).limit(1).maybeSingle();

      if (!error && data) {
        return {
          studentId: data.student_id,
          lectureId: data.lecture_id,
          mistakePatterns: data.mistake_patterns || [],
          doubtHistory: data.doubt_history || [],
          timeStudiedSeconds: data.time_studied_seconds || 0,
          learningStyle: data.learning_style || 'visual',
          targetGrade: data.target_grade || 'A+'
        };
      }
    } catch (err) {
      console.warn('[SupabaseServer] Could not fetch telemetry from cloud, using local progress fallback:', err);
    }
  }

  // Fallback to local progress in db / student_progress.json
  const sId = (studentId === 'student-1' || !studentId) ? 'student-g11-1' : studentId;
  const studentData = (db.lectureProgress || {})[sId] || (db.lectureProgress || {})['student-g11-1'] || {};
  const lecProgress = (lectureId && studentData[lectureId]) ? studentData[lectureId] : Object.values(studentData)[0] as any;

  const mistakes: any[] = [];
  if (lecProgress?.lastMistakeReview) {
    mistakes.push({
      topic: lecProgress.weakConcepts?.[0] || 'Core Derivation',
      mistake: lecProgress.lastMistakeReview.misconception || lecProgress.lastMistakeReview.studentAnswer,
      timestampRef: lecProgress.lastMistakeReview.timestampRef
    });
  }
  if (lecProgress?.weakConcepts) {
    lecProgress.weakConcepts.forEach((c: string) => {
      if (!mistakes.some(m => m.topic === c)) {
        mistakes.push({ topic: c, mistake: `Struggled with ${c} during recent mastery check.` });
      }
    });
  }

  const user = db.users.find(u => u.id === studentId || u.id === sId);
  const persona = user?.learningProfile;

  return {
    studentId: sId,
    lectureId,
    mistakePatterns: mistakes,
    doubtHistory: [
      {
        question: `How to avoid confusing force and acceleration when analyzing inclined plane dynamics?`,
        resolved: false
      }
    ],
    timeStudiedSeconds: 1500, // 25 minutes
    learningStyle: persona?.learningStyle || 'visual',
    targetGrade: persona?.targetGrade || 'A+'
  };
}

/**
 * Save generated personalized note to Supabase (and mirror to local disk)
 */
export async function persistPersonalizedNote(notePayload: {
  studentId: string;
  lectureId: string;
  generalizedNoteId?: string;
  customTitle: string;
  tailoredExplanationMarkdown: string;
  groundUpAnalogy?: string;
  hindiVoiceSummary?: string;
  englishVoiceSummary?: string;
  asciiDiagram?: string;
  graphicDetails?: any[];
  doubtClarifications: any[];
  pyqQuestions: any[];
  practiceQuestions: any[];
  visualDiagrams?: any[];
  animatedVideos: any[];
  flashcards: any[];
  studyTimeRecommendation: string;
  reinforcedConcepts?: string[];
  doubtPatternTriggers?: any[];
}): Promise<any> {
  let savedCloudNote = null;

  if (serverSupabase) {
    try {
      const { data, error } = await serverSupabase
        .from('personalized_notes')
        .insert([
          {
            student_id: notePayload.studentId,
            lecture_id: notePayload.lectureId,
            generalized_note_id: notePayload.generalizedNoteId,
            custom_title: notePayload.customTitle,
            tailored_explanation_markdown: notePayload.tailoredExplanationMarkdown,
            doubt_clarifications: notePayload.doubtClarifications,
            pyq_questions: notePayload.pyqQuestions,
            practice_questions: notePayload.practiceQuestions,
            visual_diagrams: notePayload.visualDiagrams || [],
            animated_videos: notePayload.animatedVideos,
            flashcards: notePayload.flashcards,
            study_time_recommendation: notePayload.studyTimeRecommendation,
            reinforced_concepts: notePayload.reinforcedConcepts || []
          }
        ])
        .select()
        .single();

      if (!error && data) {
        savedCloudNote = data;
        console.log(`[SupabaseServer] Personalized note saved to Supabase (ID: ${data.id})`);
      } else if (error) {
        console.warn('[SupabaseServer] Note insert error into Supabase:', error.message);
      }
    } catch (err) {
      console.warn('[SupabaseServer] Failed to write note to Supabase:', err);
    }
  }

  // Always mirror/persist to ClassSarthi local disk cache
  const localNoteId = `note-pers-${Date.now()}`;
  const existingIdx = db.notes.findIndex(
    n => n.studentId === notePayload.studentId && n.title.includes(notePayload.customTitle)
  );

  const localRecord = {
    id: savedCloudNote?.id || (existingIdx >= 0 ? db.notes[existingIdx].id : localNoteId),
    studentId: notePayload.studentId,
    subjectId: 'subj-phy-11',
    title: notePayload.customTitle,
    content: notePayload.tailoredExplanationMarkdown,
    tags: ['AI-Personalized', 'VisionNote', ...(notePayload.reinforcedConcepts || [])],
    lastModified: new Date().toISOString(),
    isPinned: true,
    summary: notePayload.studyTimeRecommendation,
    keyTakeaways: (notePayload.reinforcedConcepts || []).map(c => `Reinforced: ${c}`),
    flashcards: notePayload.flashcards.map((f, i) => ({
      id: `fc-${Date.now()}-${i}`,
      question: f.front,
      answer: f.back,
      topic: f.tag || 'Mastery'
    })),
    source: 'visionnote' as const
  };

  if (existingIdx >= 0) {
    db.notes[existingIdx] = localRecord;
  } else {
    db.notes.unshift(localRecord);
  }
  saveNotesToDisk(db.notes);

  const fullRecord = {
    id: localNoteId,
    student_id: notePayload.studentId,
    studentId: notePayload.studentId,
    lecture_id: notePayload.lectureId,
    lectureId: notePayload.lectureId,
    custom_title: notePayload.customTitle,
    customTitle: notePayload.customTitle,
    tailored_explanation_markdown: notePayload.tailoredExplanationMarkdown,
    tailoredExplanationMarkdown: notePayload.tailoredExplanationMarkdown,
    doubt_clarifications: notePayload.doubtClarifications,
    doubtClarifications: notePayload.doubtClarifications,
    pyq_questions: notePayload.pyqQuestions,
    pyqQuestions: notePayload.pyqQuestions,
    practice_questions: notePayload.practiceQuestions,
    practiceQuestions: notePayload.practiceQuestions,
    visual_diagrams: notePayload.visualDiagrams || [],
    visualDiagrams: notePayload.visualDiagrams || [],
    animated_videos: (notePayload.animatedVideos && notePayload.animatedVideos.length > 0)
      ? notePayload.animatedVideos
      : (CURATED_DEFAULT_VIDEOS[notePayload.lectureId] || CURATED_DEFAULT_VIDEOS['lec-phy-101'] || []),
    animatedVideos: (notePayload.animatedVideos && notePayload.animatedVideos.length > 0)
      ? notePayload.animatedVideos
      : (CURATED_DEFAULT_VIDEOS[notePayload.lectureId] || CURATED_DEFAULT_VIDEOS['lec-phy-101'] || []),
    flashcards: notePayload.flashcards,
    study_time_recommendation: notePayload.studyTimeRecommendation,
    reinforced_concepts: notePayload.reinforcedConcepts || [],
    reinforcedConcepts: notePayload.reinforcedConcepts || [],
    ground_up_analogy: notePayload.groundUpAnalogy || '',
    groundUpAnalogy: notePayload.groundUpAnalogy || '',
    hindi_voice_summary: notePayload.hindiVoiceSummary || '',
    hindiVoiceSummary: notePayload.hindiVoiceSummary || '',
    english_voice_summary: notePayload.englishVoiceSummary || '',
    englishVoiceSummary: notePayload.englishVoiceSummary || '',
    ascii_diagram: notePayload.asciiDiagram || '',
    asciiDiagram: notePayload.asciiDiagram || '',
    graphic_details: notePayload.graphicDetails || [],
    graphicDetails: notePayload.graphicDetails || [],
    doubt_pattern_triggers: notePayload.doubtPatternTriggers || [],
    doubtPatternTriggers: notePayload.doubtPatternTriggers || []
  };

  // Save to persistent store
  localPersonalizedStore[`${notePayload.studentId}_${notePayload.lectureId}`] = fullRecord;
  localPersonalizedStore[notePayload.lectureId] = fullRecord;
  savePersonalizedNotesToDisk(localPersonalizedStore);

  return savedCloudNote
    ? {
        ...savedCloudNote,
        customTitle: savedCloudNote.custom_title,
        tailoredExplanationMarkdown: savedCloudNote.tailored_explanation_markdown,
        pyqQuestions: savedCloudNote.pyq_questions,
        practiceQuestions: savedCloudNote.practice_questions,
        animatedVideos: savedCloudNote.animated_videos || fullRecord.animated_videos,
        studyTimeRecommendation: savedCloudNote.study_time_recommendation,
        reinforcedConcepts: savedCloudNote.reinforced_concepts
      }
    : fullRecord;
}

/**
 * Fetch existing personalized note for a student & lecture
 */
export async function getExistingPersonalizedNote(studentId: string, lectureId: string) {
  if (serverSupabase) {
    try {
      const { data, error } = await serverSupabase
        .from('personalized_notes')
        .select('*')
        .eq('student_id', studentId)
        .eq('lecture_id', lectureId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          customTitle: data.custom_title,
          tailoredExplanationMarkdown: data.tailored_explanation_markdown,
          pyqQuestions: data.pyq_questions,
          practiceQuestions: data.practice_questions,
          animatedVideos: (data.animated_videos && data.animated_videos.length > 0)
            ? data.animated_videos
            : (CURATED_DEFAULT_VIDEOS[lectureId] || CURATED_DEFAULT_VIDEOS['lec-phy-101'] || []),
          studyTimeRecommendation: data.study_time_recommendation,
          reinforcedConcepts: data.reinforced_concepts
        };
      }
    } catch (err) {
      console.warn('[SupabaseServer] Failed to read personalized note from cloud:', err);
    }
  }

  // 1. Check persistent store
  const storeKey = `${studentId}_${lectureId}`;
  const altKey = `student-g11-1_${lectureId}`;
  const stored = localPersonalizedStore[storeKey] || localPersonalizedStore[altKey] || localPersonalizedStore[lectureId];
  if (stored) {
    if (!stored.animated_videos || stored.animated_videos.length === 0) {
      stored.animated_videos = CURATED_DEFAULT_VIDEOS[lectureId] || CURATED_DEFAULT_VIDEOS['lec-phy-101'] || [];
      stored.animatedVideos = stored.animated_videos;
    }
    return stored;
  }

  // 2. Build rich default personalized note using lecture data so video & notes sections are NEVER empty
  const lecture = db.lectures.find(l => l.id === lectureId) || db.lectures[0];
  const defaultVideos = CURATED_DEFAULT_VIDEOS[lectureId] || CURATED_DEFAULT_VIDEOS['lec-phy-101'] || [];

  const defaultNote = {
    id: `note-pers-${Date.now()}`,
    student_id: studentId,
    studentId: studentId,
    lecture_id: lectureId,
    lectureId: lectureId,
    custom_title: `${lecture?.title || 'Classroom Lecture'} (Personalized Note)`,
    customTitle: `${lecture?.title || 'Classroom Lecture'} (Personalized Note)`,
    tailored_explanation_markdown: lecture?.smartNotesMarkdown || '# Classroom Lecture Notes\n\nNotes synchronized from classroom capture.',
    tailoredExplanationMarkdown: lecture?.smartNotesMarkdown || '# Classroom Lecture Notes\n\nNotes synchronized from classroom capture.',
    doubt_clarifications: [
      {
        doubt: 'Why does normal force change on an inclined plane?',
        clarification: 'Because gravity decomposes into mg cos θ perpendicular to the plane, so N = mg cos θ.',
        keyTakeaway: 'Normal force balances only perpendicular components.'
      }
    ],
    pyq_questions: [
      {
        examSource: 'CBSE Board & JEE Main PYQ',
        question: 'A mass m rests on a smooth incline of angle θ. The incline accelerates horizontally with acceleration a to keep the mass stationary relative to the wedge. Find a.',
        solution: '1. In the frame of the wedge, an inertial pseudo-force ma acts opposite to acceleration.\n2. Normal force N has components N cos θ (vertical) and N sin θ (horizontal).\n3. Vertical: N cos θ = mg\n4. Horizontal: N sin θ = ma\n5. Dividing gives: tan θ = a / g => a = g tan θ.',
        conceptTested: 'Normal Force Decomposition & Pseudo-force Invariance'
      },
      {
        examSource: 'NEET / University Physics PYQ',
        question: 'A 60 kg person stands on a scale inside an elevator accelerating downward at 2 m/s². What does the scale read (g = 9.8 m/s²)?',
        solution: '1. Equation of motion: mg - N = ma\n2. N = m(g - a)\n3. N = 60(9.8 - 2.0) = 60(7.8) = 468 N (Apparent weight is reduced!).',
        conceptTested: "Apparent Weight & Newton's Second Law"
      }
    ],
    pyqQuestions: [
      {
        examSource: 'CBSE Board & JEE Main PYQ',
        question: 'A mass m rests on a smooth incline of angle θ. The incline accelerates horizontally with acceleration a to keep the mass stationary relative to the wedge. Find a.',
        solution: '1. In the frame of the wedge, an inertial pseudo-force ma acts opposite to acceleration.\n2. Normal force N has components N cos θ (vertical) and N sin θ (horizontal).\n3. Vertical: N cos θ = mg\n4. Horizontal: N sin θ = ma\n5. Dividing gives: tan θ = a / g => a = g tan θ.',
        conceptTested: 'Normal Force Decomposition & Pseudo-force Invariance'
      },
      {
        examSource: 'NEET / University Physics PYQ',
        question: 'A 60 kg person stands on a scale inside an elevator accelerating downward at 2 m/s². What does the scale read (g = 9.8 m/s²)?',
        solution: '1. Equation of motion: mg - N = ma\n2. N = m(g - a)\n3. N = 60(9.8 - 2.0) = 60(7.8) = 468 N (Apparent weight is reduced!).',
        conceptTested: "Apparent Weight & Newton's Second Law"
      }
    ],
    practice_questions: [
      {
        question: 'A block slides down a 30° incline with coefficient of kinetic friction μ_k = 0.2. Calculate the acceleration.',
        hint: 'Balance forces perpendicular to find N, then apply a = g(sin θ - μ_k cos θ).',
        answer: 'a = 9.8(0.5 - 0.2 * 0.866) = 9.8(0.5 - 0.1732) = 3.20 m/s²'
      }
    ],
    practiceQuestions: [
      {
        question: 'A block slides down a 30° incline with coefficient of kinetic friction μ_k = 0.2. Calculate the acceleration.',
        hint: 'Balance forces perpendicular to find N, then apply a = g(sin θ - μ_k cos θ).',
        answer: 'a = 9.8(0.5 - 0.2 * 0.866) = 9.8(0.5 - 0.1732) = 3.20 m/s²'
      }
    ],
    visual_diagrams: [],
    visualDiagrams: [],
    animated_videos: defaultVideos,
    animatedVideos: defaultVideos,
    flashcards: [
      {
        front: 'Why is Normal Force on an inclined plane equal to mg cos θ instead of mg?',
        back: 'Because gravity decomposes into mg cos θ perpendicular to the plane, and the block only accelerates parallel to the plane.',
        tag: 'Inclined Plane Dynamics'
      },
      {
        front: 'What is the physical difference between Force and Acceleration?',
        back: 'Force (N) is the cause / physical interaction. Acceleration (m/s²) is the kinematic effect produced on a mass.',
        tag: 'Core Misconceptions'
      }
    ],
    study_time_recommendation: '✅ Recommended: 35 minutes of study with the included derivations and animated walkthroughs.',
    studyTimeRecommendation: '✅ Recommended: 35 minutes of study with the included derivations and animated walkthroughs.',
    reinforced_concepts: lecture?.topics || ['Core Derivations', "Newton's Second Law"],
    reinforcedConcepts: lecture?.topics || ['Core Derivations', "Newton's Second Law"]
  };

  localPersonalizedStore[storeKey] = defaultNote;
  savePersonalizedNotesToDisk(localPersonalizedStore);
  return defaultNote;
}

