import { GoogleGenAI, Type } from '@google/genai';
import { sanitizePromptInput } from './security';
import { synthesizeIntelligentAcademicResponse } from './knowledgeBase';
import {
  Subject,
  TimelineItem,
  ReferenceResource,
  Assignment,
  Flashcard,
  QuizQuestion,
  GeneratedQuiz,
  YouTubeVideoRecommendation,
  PracticeQuestionItem,
  GroundingSourceItem,
  LearnerPersona
} from '../types';

let aiInstance: GoogleGenAI | null = null;

export function buildPersonaPromptInstructions(persona?: LearnerPersona): string {
  if (!persona) {
    return 'Adapt to an undergraduate engineering student with a clear, encouraging, structured pedagogical tone.';
  }

  const styleMap: Record<string, string> = {
    visual: 'LEARNING STYLE: VISUAL & ANALOGY-DRIVEN. Prioritize vivid real-world analogies, intuitive mental models, structural ASCII schematics/diagrams, and geometric perspectives.',
    step_by_step: 'LEARNING STYLE: STEP-BY-STEP MATHEMATICAL RIGOR. Break down every step sequentially from first principles. Show explicit derivations, invariant state checks, and boundary conditions.',
    socratic_dialogue: 'LEARNING STYLE: SOCRATIC & CONVERSATIONAL. Use guided questioning, thought experiments, and interactive scaffolding to help the student synthesize conclusions.',
    exam_focused: 'LEARNING STYLE: HIGH-YIELD EXAM FOCUS. Emphasize high-frequency formulas, scoring rubrics, common student traps/pitfalls, memory mnemonics, and quick summary tables.'
  };

  const toneMap: Record<string, string> = {
    encouraging_mentor: 'TONE: Warm, patient, highly encouraging, and empathetic academic mentor.',
    strict_coach: 'TONE: Rigorous, no-nonsense professor demanding intellectual precision and mathematical accuracy.',
    practical_engineer: 'TONE: Pragmatic industry software architect/engineer focusing on real-world implementations, trade-offs, and production systems.'
  };

  const targetMap: Record<string, string> = {
    'A+': 'TARGET GOAL: Top 1% Mastery (Grade A+). Include advanced edge cases, asymptotic proofs, and deep conceptual nuances.',
    'A': 'TARGET GOAL: High Distinction (Grade A). Focus on robust problem-solving, standard derivations, and comprehensive understanding.',
    'B': 'TARGET GOAL: Solid Foundation & Core Mastery. Focus on demystifying difficult concepts and building strong baseline intuition.',
    'competitive': 'TARGET GOAL: Competitive Olympiad / Research Mastery. Include non-trivial boundary analysis and challenging extension problems.'
  };

  const paceMap: Record<string, string> = {
    accelerated: 'PACE: Fast and concise, avoiding redundant explanations.',
    steady: 'PACE: Balanced, measured, and well-structured.',
    thorough: 'PACE: Deeply thorough, taking time to explain foundational prerequisites.'
  };

  const parts = [
    styleMap[persona.learningStyle] || styleMap.visual,
    toneMap[persona.explanationTone] || toneMap.encouraging_mentor,
    targetMap[persona.targetGrade] || targetMap['A'],
    paceMap[persona.preferredPace] || paceMap.steady
  ];

  if (persona.strengthsAndInterests) {
    parts.push(`STUDENT STRENGTHS/INTERESTS: Relate concepts to: ${persona.strengthsAndInterests}`);
  }
  if (persona.painPoints) {
    parts.push(`STUDENT PAIN POINTS / WEAK AREAS: Give extra clarity and scaffolding around: ${persona.painPoints}`);
  }

  return `[STUDENT_PERSONALIZED_LEARNING_PERSONA]\n${parts.join('\n')}`;
}

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found in environment, high-accuracy curriculum fallback will be used.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export interface ChatContextPayload {
  userMessage: string;
  chatHistory?: Array<{ role?: string; sender?: string; content?: string; text?: string }>;
  subject?: Subject;
  upcomingTimelines?: TimelineItem[];
  resources?: ReferenceResource[];
  assignments?: Assignment[];
  studentNotesSnippet?: string;
  requestedMode?: 'general' | 'research' | 'videos' | 'questions' | 'quiz';
  learnerProfile?: LearnerPersona;
}

export interface StudyAssistantResult {
  reply: string;
  response?: string;
  recommendedVideos: YouTubeVideoRecommendation[];
  practiceQuestions: PracticeQuestionItem[];
  sources: string[];
  referencedResources?: ReferenceResource[];
  groundingSources?: GroundingSourceItem[];
  quiz?: GeneratedQuiz;
}

/**
 * Standardized curated YouTube video collections for the 5 core university subjects
 */
const SUBJECT_CURATED_VIDEOS: Record<string, YouTubeVideoRecommendation[]> = {
  ESS: [
    {
      title: 'Renewable Energy 101 & Solar PV Cell Efficiency',
      url: 'https://www.youtube.com/watch?v=1kUE0BZtTRc',
      searchQuery: 'Renewable Energy 101 National Geographic solar wind',
      channelOrTopic: 'National Geographic',
      duration: '03:17',
      description: 'Overview of clean energy sources, solar photovoltaic conversion, and wind power generation systems.'
    },
    {
      title: 'Ecosystem Ecology: Energy Flow & Carbon Cycles',
      url: 'https://www.youtube.com/watch?v=7G3eIYSfg5o',
      searchQuery: 'Ecosystem Ecology Links in the Chain Crash Course Ecology',
      channelOrTopic: 'CrashCourse',
      duration: '10:09',
      description: 'Trophic energy pyramids, biogeochemical cycles, and ecosystem stability principles.'
    },
    {
      title: 'Environmental Impact Assessment (EIA) Process & Methodology',
      url: 'https://www.youtube.com/watch?v=O1EZXw4Xb_c',
      searchQuery: 'Environmental Impact Assessment EIA methodology NPTEL',
      channelOrTopic: 'NPTEL Engineering',
      duration: '28:40',
      description: 'Step-by-step EIA screening, scoping, impact baseline quantification, and public consultation protocols.'
    }
  ],
  CALC: [
    {
      title: 'The Essence of Calculus, Chapter 1: Visual Foundations',
      url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM',
      searchQuery: 'Essence of calculus chapter 1 3Blue1Brown',
      channelOrTopic: '3Blue1Brown',
      duration: '17:04',
      description: 'Visual geometric proof connecting area under curves, tangents, and fundamental theorem of calculus.'
    },
    {
      title: 'Lagrange Multipliers with Constrained Optimization Visualized',
      url: 'https://www.youtube.com/watch?v=9vKqVkMQHKk',
      searchQuery: 'Lagrange multipliers multivariable calculus Khan Academy 3Blue1Brown',
      channelOrTopic: 'Khan Academy / 3Blue1Brown',
      duration: '08:42',
      description: 'Geometric explanation of why contour gradients align (grad f = lambda grad g) at constrained extrema.'
    },
    {
      title: 'Calculus 3: Double and Triple Integrals in Polar & Cylindrical Coordinates',
      url: 'https://www.youtube.com/watch?v=tBVnfxSgmrc',
      searchQuery: 'Calculus 3 Double Integrals Professor Leonard',
      channelOrTopic: 'Professor Leonard (Calculus 3)',
      duration: '1:48:10',
      description: 'Complete walkthrough of 3D integration bounds, Jacobian coordinate transformations, and volume calculations.'
    }
  ],
  EME: [
    {
      title: 'Understanding Stress and Strain: Engineering Mechanics',
      url: 'https://www.youtube.com/watch?v=aQf6Q8t1FQE',
      searchQuery: 'Understanding Stress and Strain The Efficient Engineer',
      channelOrTopic: 'The Efficient Engineer',
      duration: '11:42',
      description: 'Fundamental explanation of normal stress, shear stress, Hooke’s law, and tensile stress-strain curves.'
    },
    {
      title: 'How Thermodynamic Engine Cycles Work (Otto & Diesel Cycles)',
      url: 'https://www.youtube.com/watch?v=DZt5xU44IfQ',
      searchQuery: 'How Diesel Engines Work Lesics Learn Engineering',
      channelOrTopic: 'Lesics (Learn Engineering)',
      duration: '08:12',
      description: 'Detailed animation of four-stroke cycle, P-v and T-s thermodynamic diagrams, and fuel injection physics.'
    },
    {
      title: 'Understanding Mohr’s Circle & Principal Stresses',
      url: 'https://www.youtube.com/watch?v=1OxTsdEUg-k',
      searchQuery: 'Understanding Mohrs Circle 2D Stress Transformation The Efficient Engineer',
      channelOrTopic: 'The Efficient Engineer',
      duration: '12:28',
      description: 'Stress transformation equations, drawing Mohr’s circle, and finding maximum in-plane shear stress.'
    }
  ],
  'ENG-ETH': [
    {
      title: 'Justice: What’s The Right Thing To Do? (Utilitarianism & Morality)',
      url: 'https://www.youtube.com/watch?v=kBdfcR-8hEY',
      searchQuery: 'Justice Episode 01 The Moral Side of Murder Harvard Sandel',
      channelOrTopic: 'Harvard University (Michael Sandel)',
      duration: '54:56',
      description: 'Seminal Harvard course lecture on moral reasoning, utilitarian trade-offs, and categorical ethical duties.'
    },
    {
      title: 'Engineering Ethics: The Space Shuttle Challenger Disaster',
      url: 'https://www.youtube.com/watch?v=0wI_y1t8Jps',
      searchQuery: 'Engineering Ethics Space Shuttle Challenger Crash Course Engineering',
      channelOrTopic: 'CrashCourse Engineering',
      duration: '09:44',
      description: 'Investigation into O-ring blow-by engineering warnings, managerial pressure, and ethical whistleblowing.'
    },
    {
      title: 'Artificial Intelligence, Algorithmic Bias & Engineering Governance',
      url: 'https://www.youtube.com/watch?v=40riCgmUXMs',
      searchQuery: 'Ethics Governance and Policy in AI MIT OpenCourseWare',
      channelOrTopic: 'MIT OpenCourseWare',
      duration: '48:30',
      description: 'Moral liability in autonomous machines, data ethics, and professional engineering accountability.'
    }
  ],
  CPC: [
    {
      title: 'C Programming Tutorial for Beginners: Full Course',
      url: 'https://www.youtube.com/watch?v=KJgsSFOSQv0',
      searchQuery: 'C Programming Tutorial for Beginners freeCodeCamp',
      channelOrTopic: 'freeCodeCamp.org',
      duration: '3:46:15',
      description: 'Comprehensive beginner-to-advanced curriculum covering variables, pointers, arrays, structs, and memory.'
    },
    {
      title: 'CS50 Lecture 4: Memory, Pointers, Heap Allocation & Malloc',
      url: 'https://www.youtube.com/watch?v=zYIER3UahhU',
      searchQuery: 'CS50 2023 Lecture 4 Memory Pointers David J Malan',
      channelOrTopic: 'Harvard CS50 (David J. Malan)',
      duration: '2:15:30',
      description: 'World-renowned lecture explaining hexadecimal memory addresses, pointer dereferencing, malloc, and free.'
    },
    {
      title: 'Introduction to Linked Lists & Dynamic Data Structures in C',
      url: 'https://www.youtube.com/watch?v=2ybLDQagr84',
      searchQuery: 'Introduction to Linked List in C Neso Academy',
      channelOrTopic: 'Neso Academy',
      duration: '14:28',
      description: 'Node struct declarations, self-referential structures, pointer manipulation, and dynamic list traversal.'
    }
  ]
};

/**
 * Robust JSON extraction helper from AI text that may contain markdown or surrounding commentary
 */
function extractJsonFromText<T>(text: string): T | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try markdown code block extraction
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]) as T;
      } catch {
        // Continue to bracket search
      }
    }
    // Try finding outer object or array brackets
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1)) as T;
      } catch {
        // ignore
      }
    }
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1)) as T;
      } catch {
        // ignore
      }
    }
    return null;
  }
}

/**
 * Dynamic YouTube Video Synthesis Engine based on specific topic query & course domain
 */
export function generateDynamicTopicVideos(topicQuery: string, subjectCode: string, subjectName: string): YouTubeVideoRecommendation[] {
  const cleanTopic = topicQuery.replace(/[#*`?]/g, '').trim();

  switch (subjectCode) {
    case 'CPC':
      return [
        {
          title: `${cleanTopic}: Complete Deep-Dive Tutorial & Memory Architecture`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTopic + ' in C programming freeCodeCamp Neso Academy')}`,
          searchQuery: `${cleanTopic} C programming Neso Academy`,
          channelOrTopic: 'Neso Academy / freeCodeCamp',
          duration: '18:45',
          description: `Comprehensive video tutorial explaining ${cleanTopic}, pointer addresses, stack/heap layout, and runtime invariants.`
        },
        {
          title: `CS50 Harvard Lecture Excerpt: Mastering ${cleanTopic}`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent('CS50 ' + cleanTopic + ' David Malan')}`,
          searchQuery: `CS50 ${cleanTopic} David Malan Harvard`,
          channelOrTopic: 'Harvard CS50 (David J. Malan)',
          duration: '24:10',
          description: `Visual walkthrough of data structures, hexadecimal memory dereferencing, and debugging techniques.`
        },
        {
          title: `${cleanTopic} Exam Problem Solving & Gate Smashers Masterclass`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTopic + ' Gate Smashers Varun Singla')}`,
          searchQuery: `${cleanTopic} Gate Smashers`,
          channelOrTopic: 'Gate Smashers',
          duration: '12:30',
          description: `Step-by-step problem walkthroughs, competitive programming edge cases, and exam trick questions.`
        }
      ];

    case 'CALC':
      return [
        {
          title: `Visual Essence of Multivariable Calculus: ${cleanTopic}`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTopic + ' 3Blue1Brown calculus visual')}`,
          searchQuery: `${cleanTopic} 3Blue1Brown`,
          channelOrTopic: '3Blue1Brown',
          duration: '16:20',
          description: `Geometric intuition, vector fields, and transformation diagrams for ${cleanTopic}.`
        },
        {
          title: `Professor Leonard Calculus 3: ${cleanTopic} Full Lecture`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent('Professor Leonard Calculus 3 ' + cleanTopic)}`,
          searchQuery: `Professor Leonard Calculus 3 ${cleanTopic}`,
          channelOrTopic: 'Professor Leonard',
          duration: '1:12:40',
          description: `Thorough step-by-step derivations, domain sketches, and full examination problem walkthroughs.`
        },
        {
          title: `MIT OpenCourseWare 18.02: ${cleanTopic} Recitation & Proof`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent('MIT 18.02 Multivariable Calculus ' + cleanTopic)}`,
          searchQuery: `MIT 18.02 Multivariable Calculus ${cleanTopic}`,
          channelOrTopic: 'MIT OpenCourseWare',
          duration: '38:15',
          description: `Rigorous mathematical formulation, coordinate transformations, and boundary evaluation.`
        }
      ];

    case 'EME':
      return [
        {
          title: `The Efficient Engineer: Visualizing ${cleanTopic}`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent('The Efficient Engineer ' + cleanTopic)}`,
          searchQuery: `The Efficient Engineer ${cleanTopic}`,
          channelOrTopic: 'The Efficient Engineer',
          duration: '14:50',
          description: `FEA animations, stress tensors, thermodynamics PV/TS cycles, and physical engineering applications.`
        },
        {
          title: `Engineering Mindset: Working Principles of ${cleanTopic}`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent('The Engineering Mindset ' + cleanTopic)}`,
          searchQuery: `The Engineering Mindset ${cleanTopic}`,
          channelOrTopic: 'The Engineering Mindset',
          duration: '19:30',
          description: `Clear 3D mechanical models, energy flow analysis, and mechanical efficiency equations.`
        },
        {
          title: `NPTEL Engineering: ${cleanTopic} Rigorous Formulation`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent('NPTEL Mechanical Engineering ' + cleanTopic)}`,
          searchQuery: `NPTEL Mechanical Engineering ${cleanTopic}`,
          channelOrTopic: 'NPTEL Engineering',
          duration: '42:10',
          description: `Academic university curriculum standard derivations and numerical problem set solving.`
        }
      ];

    case 'ESS':
      return [
        {
          title: `CrashCourse Ecology & Environment: ${cleanTopic}`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent('CrashCourse Environmental Science ' + cleanTopic)}`,
          searchQuery: `CrashCourse Environmental Science ${cleanTopic}`,
          channelOrTopic: 'CrashCourse',
          duration: '11:15',
          description: `Ecological impacts, biogeochemical dynamics, and sustainability metrics explained.`
        },
        {
          title: `National Geographic / NPTEL: ${cleanTopic} Scientific Assessment`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent('Environmental Impact Assessment ' + cleanTopic + ' NPTEL')}`,
          searchQuery: `Environmental Assessment ${cleanTopic} NPTEL`,
          channelOrTopic: 'National Geographic / NPTEL',
          duration: '26:40',
          description: `Quantitative environmental impact metrics, renewable energy thresholds, and policy frameworks.`
        }
      ];

    default:
      return [
        {
          title: `${cleanTopic}: Core Engineering & Scientific Principles`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTopic + ' ' + subjectName + ' tutorial lecture')}`,
          searchQuery: `${cleanTopic} ${subjectName}`,
          channelOrTopic: 'MIT OpenCourseWare / NPTEL',
          duration: '22:00',
          description: `Detailed university lecture and case analysis covering ${cleanTopic} in ${subjectName}.`
        },
        {
          title: `${cleanTopic}: Practical Case Study & Assessment Checklist`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTopic + ' CrashCourse engineering case study')}`,
          searchQuery: `${cleanTopic} CrashCourse`,
          channelOrTopic: 'CrashCourse Engineering',
          duration: '15:20',
          description: `Real-world industrial case studies, failure mode analyses, and professional guidelines.`
        }
      ];
  }
}

/**
 * Dynamic Topic-Specific Practice Questions Generator
 */
export function generateDynamicTopicPracticeQuestions(topicQuery: string, subjectCode: string, subjectName: string): PracticeQuestionItem[] {
  const clean = topicQuery.replace(/[#*`?]/g, '').trim();

  return [
    {
      question: `Define the primary governing relationship and fundamental invariants of "${clean}" in ${subjectName}.`,
      answer: `In **${subjectName}**, analyzing **${clean}** requires establishing:\n` +
        `1. **Conservation Invariants**: Energy/mass balance or deterministic state memory constraints must be preserved.\n` +
        `2. **Mathematical Formulation**: State variables must satisfy boundary limit conditions.\n` +
        `3. **Verification**: Check extreme boundary values (e.g. null state, zero denominator, or adiabatic limits) to prevent system failure.`,
      topic: `${subjectCode}: ${clean.slice(0, 25)}`,
      hint: 'Think about governing differential equations or state invariance preconditions.'
    },
    {
      question: `A university exam problem asks to calculate or implement the optimal solution for "${clean}". What are the critical steps?`,
      answer: `**Step-by-Step Problem Walkthrough for "${clean}":**\n` +
        `1. **State Assumptions**: Identify given initial values, boundary geometry, and physical/runtime constraints.\n` +
        `2. **Apply Fundamental Equation**: Express the target variable in terms of known system constants.\n` +
        `3. **Edge Case Guard**: Verify non-negativity and boundary continuity ($x \\ge 0$, valid pointers, non-singular matrices).\n` +
        `4. **Dimensional/Complexity Check**: Verify standard units (Joules, Watts, Pa) or algorithmic complexity $O(n)$ bounds.`,
      topic: `${subjectCode}: Exam Problem Solving`,
      hint: 'Always write down the fundamental equation and verify boundary units first.'
    }
  ];
}

/**
 * Dynamic Topic-Specific Diagnostic Quiz Generator
 */
export function generateDynamicTopicQuiz(topicQuery: string, subjectCode: string, subjectName: string): GeneratedQuiz {
  const clean = topicQuery.replace(/[#*`?]/g, '').trim();

  return {
    id: `quiz-${Date.now()}`,
    title: `Diagnostic Checkpoint: ${clean.slice(0, 40)}`,
    topic: `${subjectCode} - ${subjectName}`,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: `q-gen-1`,
        question: `Which statement represents the core theoretical principle of "${clean}" in ${subjectName}?`,
        options: [
          `It enforces strict state invariants and optimizes system performance within physical and computational constraints.`,
          `It ignores boundary conditions and allows arbitrary unconstrained state transitions.`,
          `It violates conservation of energy and asymptotic efficiency bounds.`,
          `It is purely heuristic with no deterministic mathematical or algorithmic basis.`
        ],
        correctIndex: 0,
        explanation: `In ${subjectName}, "${clean}" is governed by deterministic mathematical principles, invariant boundaries, and conservation constraints.`,
        topic: `${subjectCode}: Theory`
      },
      {
        id: `q-gen-2`,
        question: `When debugging or evaluating edge cases for "${clean}", which error must engineers and students guard against most?`,
        options: [
          `Boundary limit violations, uninitialized state, or division by zero / null handle dereferences.`,
          `Maintaining clean code documentation and standardized variable units.`,
          `Operating strictly within the linear elastic or valid memory region.`,
          `Applying proper safety and environmental compliance protocols.`
        ],
        correctIndex: 0,
        explanation: `Extreme boundary conditions (null pointers, zero denominators, adiabatic limits) represent the most frequent source of system faults and exam deductions.`,
        topic: `${subjectCode}: Edge Cases`
      },
      {
        id: `q-gen-3`,
        question: `What is the recommended verification step when completing an analysis of "${clean}" on a technical exam?`,
        options: [
          `Perform dimensional analysis on all units, verify boundary limits ($0, \\infty$), and check invariant consistency.`,
          `Skip the mathematical derivation and guess the final numerical value.`,
          `Assume all system efficiencies are 100% without accounting for losses.`,
          `Delete all intermediate calculation steps.`
        ],
        correctIndex: 0,
        explanation: `Checking dimensional consistency and asymptotic limit behavior ($0, \\infty$) ensures the derived model is mathematically sound.`,
        topic: `${subjectCode}: Verification`
      }
    ]
  };
}

/**
 * 1. AI Study Assistant with Google Search Grounding for Real YouTube Links, Practice Questions & Interactive Quizzes
 */
export async function generateStudyAssistantReply(context: ChatContextPayload): Promise<StudyAssistantResult> {
  const subjectCode = context.subject?.code || 'CPC';
  const subjectName = context.subject?.name || 'Engineering Curriculum';
  const rawQuery = context.userMessage || 'Subject Overview';
  const contextResources = context.resources && context.resources.length > 0 ? context.resources : [];

  const cleanQuery = rawQuery.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const GREETING_PATTERNS = [
    'hi', 'hello', 'hey', 'hola', 'sup', 'yo', 'hii', 'hiii', 'heyy',
    'good morning', 'good afternoon', 'good evening',
    'how are you', 'who are you', 'what are you', 'what can you do',
    'help', 'help me', 'thanks', 'thank you', 'thx', 'ok', 'okay', 'cool',
    'bye', 'goodbye', 'test'
  ];

  const isGreeting = GREETING_PATTERNS.includes(cleanQuery) || 
    cleanQuery === '' || 
    (cleanQuery.startsWith('hi ') && cleanQuery.length < 15) ||
    (cleanQuery.startsWith('hello ') && cleanQuery.length < 18);

  if (isGreeting) {
    const synthesized = synthesizeIntelligentAcademicResponse(rawQuery, subjectCode, subjectName, contextResources, context.subject, context.upcomingTimelines);
    return {
      reply: synthesized.reply,
      response: synthesized.reply,
      recommendedVideos: [],
      practiceQuestions: [],
      sources: synthesized.sources,
      referencedResources: contextResources,
      groundingSources: [],
      quiz: undefined
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const synthesized = synthesizeIntelligentAcademicResponse(rawQuery, subjectCode, subjectName, contextResources, context.subject, context.upcomingTimelines);
    return {
      reply: synthesized.reply,
      response: synthesized.reply,
      recommendedVideos: synthesized.recommendedVideos,
      practiceQuestions: synthesized.practiceQuestions,
      sources: synthesized.sources,
      referencedResources: contextResources,
      groundingSources: synthesized.recommendedVideos.map(v => ({ title: v.title, uri: v.url })),
      quiz: synthesized.quiz
    };
  }

  const ai = getAI();

  const subjectInfo = context.subject
    ? `Current Subject: ${context.subject.code} - ${context.subject.name}
Faculty In-Charge: ${context.subject.teacherName || 'Course Faculty'} (${context.subject.department || 'B.Tech Engineering'})
Course Description: ${context.subject.description}
Syllabus Topics:
${context.subject.syllabusTopics.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}`
    : 'Subject: General B.Tech Engineering Curriculum';

  const upcomingInfo = context.upcomingTimelines && context.upcomingTimelines.length > 0
    ? `Upcoming Academic Deadlines & Milestones:\n${context.upcomingTimelines.map(t => `- [${t.type.toUpperCase()}] ${t.title} on ${t.date} (${t.startTime})`).join('\n')}`
    : 'No immediate deadlines recorded.';

  const resourcesInfo = contextResources.length > 0
    ? `Teacher References & Textbooks:\n${contextResources.map(r => `- ${r.title} (${r.category} by ${r.author}) [URL: ${r.url}]: ${r.description}`).join('\n')}`
    : '';

  const systemInstruction = `You are "EduSync AI Academic Tutor", an intelligent, friendly, natural, and supportive educational AI assistant (similar to ChatGPT / Gemini).
Your role is to help students learn, solve problems, prepare for exams, and succeed in their studies.

${buildPersonaPromptInstructions(context.learnerProfile)}

Active Course Context:
- Current Subject: ${context.subject ? `${context.subject.code} - ${context.subject.name}` : 'General Curriculum'}
- Course Faculty: ${context.subject?.teacherName || 'Faculty In-Charge'} (${context.subject?.department || 'Engineering'})
- Syllabus Topics: ${context.subject?.syllabusTopics ? context.subject.syllabusTopics.join(', ') : 'Standard University Syllabus'}
- Upcoming Deadlines: ${context.upcomingTimelines && context.upcomingTimelines.length > 0 ? context.upcomingTimelines.map(t => `${t.title} on ${t.date}`).join(', ') : 'None currently scheduled'}

Behavioral Guidelines:
1. Speak naturally, conversationally, clearly, and helpfully. Adapt your tone and depth to match the student's personalized learning persona.
2. Answer both subject-specific technical questions (C code, multivariable calculus, mechanics, environmental science, ethics) and general academic/student productivity questions (time management, Pomodoro, active recall, study routines).
3. When writing code, provide clean, runnable, well-commented code with complexity notes.
4. When writing math, format equations clearly using LaTeX ($...$ inline and $$...$$ block).
5. If the student asks personal private questions about the user or AI:
   - Respond with a standard, polite LLM refusal: "As an AI academic assistant, I don't have access to private personal data or feelings. I'm here to help with your coursework, study techniques, and learning!"

Return your response in clean JSON format:
{
  "reply": "Your clear, natural, helpful Markdown response tailored to the student persona...",
  "sources": ["Course Syllabus / Academic Reference"]
}`;

  const { cleanText: sanitizedUserMessage } = sanitizePromptInput(context.userMessage || '');

  try {
    // Generate content using Gemini 3.7 Flash with Google Search Grounding
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `[STUDENT_ACADEMIC_QUERY_START]\n${sanitizedUserMessage}\n[STUDENT_ACADEMIC_QUERY_END]\n\nSubject: ${context.subject?.code} - ${context.subject?.name}\nMode: ${context.requestedMode || 'general'}\n\nPlease research the topic thoroughly and provide a deep, step-by-step, textbook-grade pedagogical explanation tailored to the query above.`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });

    const rawText = response.text || '';
    const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks || [];
    
    // Extract real web sources from grounding metadata
    const webGroundingSources: GroundingSourceItem[] = [];
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk?.web?.uri && chunk?.web?.title) {
          webGroundingSources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      }
    }

    const parsed = extractJsonFromText<any>(rawText);
    const reply = (parsed && (parsed.reply || parsed.response)) ? (parsed.reply || parsed.response) : rawText;

    const sources = (parsed && Array.isArray(parsed.sources)) ? parsed.sources : [
      context.subject?.name ? `${context.subject.code} Course Syllabus` : 'University Curriculum Reference',
      'Verified Academic Lecture Archives'
    ];

    const synthesized = synthesizeIntelligentAcademicResponse(sanitizedUserMessage, subjectCode, subjectName, contextResources, context.subject, context.upcomingTimelines);

    return {
      reply: reply || synthesized.reply,
      response: reply || synthesized.reply,
      recommendedVideos: synthesized.recommendedVideos,
      practiceQuestions: synthesized.practiceQuestions,
      sources,
      referencedResources: contextResources,
      groundingSources: webGroundingSources.length > 0 ? webGroundingSources : synthesized.recommendedVideos.map(v => ({ title: v.title, uri: v.url })),
      quiz: synthesized.quiz
    };
  } catch (error) {
    console.error('Error generating study assistant reply with Google Search Grounding:', error);
    const synthesized = synthesizeIntelligentAcademicResponse(sanitizedUserMessage, subjectCode, subjectName, contextResources, context.subject, context.upcomingTimelines);
    return {
      reply: synthesized.reply,
      response: synthesized.reply,
      recommendedVideos: synthesized.recommendedVideos,
      practiceQuestions: synthesized.practiceQuestions,
      sources: synthesized.sources,
      referencedResources: contextResources,
      groundingSources: synthesized.recommendedVideos.map(v => ({ title: v.title, uri: v.url })),
      quiz: synthesized.quiz
    };
  }
}

/**
 * 2. Dedicated Research & YouTube Video Finder Endpoint Helper
 */
export async function researchTopicAndVideosAI(prompt: string, subject?: Subject): Promise<{
  researchSummary: string;
  videos: YouTubeVideoRecommendation[];
  practiceQuestions: PracticeQuestionItem[];
  quiz: GeneratedQuiz;
  groundingSources: GroundingSourceItem[];
}> {
  const result = await generateStudyAssistantReply({
    userMessage: prompt,
    subject,
    requestedMode: 'research'
  });

  return {
    researchSummary: result.reply,
    videos: result.recommendedVideos,
    practiceQuestions: result.practiceQuestions,
    quiz: result.quiz || {
      id: `quiz-gen-${Date.now()}`,
      title: `Practice Assessment: ${prompt.slice(0, 30)}`,
      topic: subject?.name || 'Engineering Concepts',
      createdAt: new Date().toISOString(),
      questions: []
    },
    groundingSources: result.groundingSources || []
  };
}

/**
 * 3. Generate High-Yield Note Summaries
 */
export async function summarizeNoteAI(noteContent: string, subjectName?: string, learnerProfile?: LearnerPersona): Promise<{ summary: string; keyTakeaways: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      summary: 'Executive summary generated from lecture notes focusing on primary engineering principles, invariants, and complexity bounds.',
      keyTakeaways: [
        'Main theoretical invariants and structural constraints.',
        'Asymptotic runtime and thermodynamic efficiency bounds.',
        'Crucial edge cases and boundary conditions to review prior to the upcoming exam.'
      ]
    };
  }

  const ai = getAI();
  try {
    const personaGuidance = buildPersonaPromptInstructions(learnerProfile);
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Please summarize the following student study notes for ${subjectName || 'the academic course'} into an executive conceptual summary and 3-5 punchy key takeaways:\n\n${noteContent}`,
      config: {
        systemInstruction: `You are an academic synthesis engine. Return crisp, high-yield summary text and bullet takeaways tailored to the student's learning profile.\n\n${personaGuidance}`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'A 2-3 sentence executive synthesis of the note content' },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 vital high-yield takeaways for exam preparation'
            }
          },
          required: ['summary', 'keyTakeaways']
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error('Error in summarizeNoteAI:', err);
    return {
      summary: 'Summarized core principles from student notes.',
      keyTakeaways: ['Key invariant rules and properties', 'Complexity bounds and proofs', 'Edge cases for exam preparation']
    };
  }
}

export interface GenerateNotePayload {
  prompt: string;
  subject?: Subject;
  depth?: 'exam_prep' | 'cheat_sheet' | 'deep_dive' | 'formula_sheet';
  attachedText?: string;
  documentName?: string;
  learnerProfile?: LearnerPersona;
}

export interface GeneratedNoteResult {
  title: string;
  content: string;
  tags: string[];
  summary: string;
  keyTakeaways: string[];
}

/**
 * 3.5. Generate Comprehensive Subject Notes via Prompt / Fed Document Text
 */
export async function generateDetailedTopicNoteAI(payload: GenerateNotePayload): Promise<GeneratedNoteResult> {
  const { prompt, subject, depth = 'exam_prep', attachedText, documentName } = payload;
  const { cleanText: sanitizedPrompt } = sanitizePromptInput(prompt || '');
  const { cleanText: sanitizedAttached } = sanitizePromptInput(attachedText || '');

  const apiKey = process.env.GEMINI_API_KEY;
  const subjectName = subject?.name || 'Engineering Course';
  const subjectCode = subject?.code || 'CRS';

  if (!apiKey) {
    const depthTitle = depth === 'cheat_sheet' ? 'Quick Revision Cheat Sheet' : depth === 'formula_sheet' ? 'Formula & Definitions Sheet' : 'Comprehensive Lecture & Exam Notes';
    const noteTitle = `${subjectCode}: ${sanitizedPrompt.slice(0, 45)} (${depthTitle})`;
    const generatedMarkdown = `# ${noteTitle}

> 📚 **Course**: ${subjectName} (${subjectCode})  
> 🎯 **Focus Area**: ${sanitizedPrompt}  
> 🏷️ **Depth**: ${depthTitle} ${documentName ? `· 📄 Attached Doc: ${documentName}` : ''}

---

## 1. Executive Conceptual Overview
In **${subjectName}**, understanding **${sanitizedPrompt}** requires mastering the governing equations, foundational assumptions, and invariant boundaries that maintain structural consistency across all system states.

${sanitizedAttached ? `### 📄 Analysis of Attached Document Material\n${sanitizedAttached.slice(0, 500)}\n\n` : ''}

## 2. Core Theorems & Mathematical Derivations
* **Fundamental Law**: Every change in state must preserve conservation of mass, energy, and boundary invariants.
* **Governing Relationship**:
  $$\\lim_{x \\to x_0} f(x) = L \\quad \\text{and} \\quad \\oint_C \\mathbf{F} \\cdot d\\mathbf{r} = 0$$
* **Key Variable Bounds**: Ensure boundary constants remain non-negative and all memory/energy allocations are within physical hardware constraints.

\`\`\`c
// Reference Implementation / Model Invariant Check
void verifyStateIntegrity(const SystemState* state) {
    if (state == NULL || state->capacity <= 0) {
        handleBoundaryError("Invalid state boundary invariant violated");
        return;
    }
    // Perform deterministic state transition
    processStateTransition(state);
}
\`\`\`

## 3. Critical Edge Cases & Common Exam Traps
1. **Null or Zero Division Traps**: Always enforce preconditions before performing inverse or matrix transformations.
2. **Boundary Discontinuities**: Pay strict attention to piece-wise definitions and asymptotic limit behaviors.
3. **Memory/Energy Leakage**: In dynamic systems, ensure all allocated handles are explicitly released.

## 4. High-Yield Exam Problem Solving Checklist
- [x] State all initial assumptions and boundary conditions.
- [x] Write out the fundamental formula with standard dimensional units.
- [x] Check asymptotic behavior for extreme edge cases ($0, \\infty, -\\infty$).
- [x] Verify final dimensional consistency.
`;

    return {
      title: noteTitle,
      content: generatedMarkdown,
      tags: [subjectCode, 'AI-Generated', depth.replace('_', '-')],
      summary: `High-yield structured notes for ${sanitizedPrompt} in ${subjectName} with theoretical definitions, code/derivation models, and exam checklists.`,
      keyTakeaways: [
        `Master the core mathematical relationship and invariant state bounds for ${sanitizedPrompt}.`,
        'Guard against boundary edge cases and division/null exceptions during analysis.',
        'Review standard problem-solving steps and dimensional units for exam problems.'
      ]
    };
  }

  const ai = getAI();
  try {
    const depthInstruction = depth === 'cheat_sheet'
      ? 'Structure this as a high-density, concise Cheat Sheet with bullet points, essential formulas, and quick lookup tables.'
      : depth === 'formula_sheet'
      ? 'Structure this as a Formula & Definitions Reference Sheet with clear variable definitions and unit specifications.'
      : depth === 'deep_dive'
      ? 'Structure this as an in-depth Academic Treatise with full mathematical derivations, edge cases, diagrams (ASCII/Markdown), and code/algorithmic implementations.'
      : 'Structure this as Comprehensive Exam Prep Notes with theory, solved example walkthroughs, common mistakes, and memory mnemonics.';

    const systemInstruction = `You are EduSync's elite University Curriculum & Note Generation AI.
Your objective is to generate structured, pedagogical, beautiful Markdown study notes for university engineering students based on their prompt, course syllabus, and any fed document text.

${buildPersonaPromptInstructions(payload.learnerProfile)}

Guidelines:
- Create an engaging, professional title ("title").
- Write comprehensive, thorough Markdown note content ("content") with clear headings (H1, H2, H3), blockquotes, code blocks (\`\`\`c or \`\`\`python), math formulas ($...$ or $$...$$), bullet points, and high-yield callouts.
- Include 3 to 4 relevant subject tags ("tags").
- Generate a 2-sentence executive summary ("summary").
- Provide 3 to 5 high-yield key takeaways for quick revision ("keyTakeaways").

Note Depth: ${depthInstruction}`;

    const promptContext = `Subject: ${subjectName} (${subjectCode})
Student Topic Prompt: ${sanitizedPrompt}
Depth Mode: ${depth}
${sanitizedAttached ? `Attached Document / PDF Text Content (${documentName || 'Uploaded Reference'}):\n${sanitizedAttached}` : ''}

Please generate comprehensive, publication-ready academic study notes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptContext,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Clear academic title of the generated note' },
            content: { type: Type.STRING, description: 'Complete structured Markdown note content' },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 relevant topic and subject tags'
            },
            summary: { type: Type.STRING, description: 'Executive 2-sentence synthesis of note' },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-5 high-yield bullet takeaways'
            }
          },
          required: ['title', 'content', 'tags', 'summary', 'keyTakeaways']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}') as GeneratedNoteResult;
    return {
      title: parsed.title || `${subjectCode}: ${sanitizedPrompt}`,
      content: parsed.content || `# ${subjectCode}: ${sanitizedPrompt}\n\nGenerated notes...`,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [subjectCode, 'Study-Notes'],
      summary: parsed.summary || `Synthesized study notes covering ${sanitizedPrompt}.`,
      keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : ['Core invariant definitions', 'Formula applications', 'Exam preparation tips']
    };
  } catch (err) {
    console.error('Error in generateDetailedTopicNoteAI:', err);
    return {
      title: `${subjectCode}: ${sanitizedPrompt}`,
      content: `# ${subjectCode}: ${sanitizedPrompt}\n\n## 1. Overview\nComprehensive notes covering ${sanitizedPrompt} for ${subjectName}.\n\n## 2. Key Takeaways\n- Master fundamental formulas.\n- Review edge cases.`,
      tags: [subjectCode, 'Notes'],
      summary: `Overview notes for ${sanitizedPrompt}.`,
      keyTakeaways: ['Key formulas', 'Exam preparation strategy']
    };
  }
}

/**
 * 4. Generate Study Flashcards
 */
export async function generateFlashcardsAI(noteContent: string, count: number = 5, learnerProfile?: LearnerPersona): Promise<Flashcard[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return [
      { id: `fc-gen-${Date.now()}-1`, question: 'What is the primary theorem discussed in the note?', answer: 'The fundamental balance or invariant bound guaranteeing optimal system runtime or efficiency.', hint: 'Think about asymptotic limits', topic: 'Core Concept' },
      { id: `fc-gen-${Date.now()}-2`, question: 'What is the operational complexity or efficiency formula?', answer: 'O(log n) or thermodynamic Carnot limit depending on domain constraints.', hint: 'Compare against baseline', topic: 'Complexity' },
      { id: `fc-gen-${Date.now()}-3`, question: 'What edge condition must be maintained?', answer: 'All structural invariants and boundary constraints must satisfy the defined specification.', hint: 'Consider boundary cases', topic: 'Invariants' }
    ];
  }

  const ai = getAI();
  try {
    const personaGuidance = buildPersonaPromptInstructions(learnerProfile);
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Extract ${count} high-yield, exam-oriented study flashcards (Q&A pairs with optional hints and topic tags) from these student notes:\n\n${noteContent}`,
      config: {
        systemInstruction: `You are an academic flashcard extraction engine. Adapt question depth, hints, and topics to match the student persona.\n\n${personaGuidance}`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: 'Clear, concise concept question' },
              answer: { type: Type.STRING, description: 'Accurate, complete explanation or formula' },
              hint: { type: Type.STRING, description: 'Helpful clue without giving away the full answer' },
              topic: { type: Type.STRING, description: 'Specific sub-topic label' }
            },
            required: ['question', 'answer', 'topic']
          }
        }
      }
    });

    const items = JSON.parse(response.text || '[]') as Array<{ question: string; answer: string; hint?: string; topic?: string }>;
    return items.map((item, idx) => ({
      id: `fc-gen-${Date.now()}-${idx}`,
      question: item.question,
      answer: item.answer,
      hint: item.hint,
      topic: item.topic
    }));
  } catch (err) {
    console.error('Error generating flashcards:', err);
    return [
      { id: `fc-gen-err-1`, question: 'What is the primary concept in these notes?', answer: 'Review the note definitions and formulas.', topic: 'General' }
    ];
  }
}

/**
 * 5. Generate Note-to-Quiz Diagnostic
 */
export async function generateNoteQuizAI(noteContent: string, title?: string, learnerProfile?: LearnerPersona): Promise<{ title: string; questions: QuizQuestion[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      title: title ? `Practice Quiz: ${title}` : 'Personalized Note-to-Quiz Practice',
      questions: [
        {
          id: 'q1',
          question: 'Which of the following best characterizes the invariant condition discussed in the notes?',
          options: [
            'All operational paths maintain equal black-height or thermal equilibrium',
            'Every state is guaranteed to be unconstrained without bounds',
            'Operations require O(n^2) worst-case time without exception',
            'State transitions alter the fundamental ordering of keys arbitrarily'
          ],
          correctIndex: 0,
          explanation: 'The fundamental invariant guarantees balanced depth and preserves strict ordered properties.',
          topic: 'Invariants'
        },
        {
          id: 'q2',
          question: 'What is the primary design trade-off in this approach?',
          options: [
            'Time efficiency vs memory/space overhead',
            'Infinite recursion vs zero computation',
            'Complete neglect of boundary safety',
            'Random execution without verification'
          ],
          correctIndex: 0,
          explanation: 'Standard engineering design balances algorithmic speed against memory storage requirements.',
          topic: 'Trade-offs'
        }
      ]
    };
  }

  const ai = getAI();
  try {
    const personaGuidance = buildPersonaPromptInstructions(learnerProfile);
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate a 4-to-5 question interactive multiple-choice practice quiz based strictly on the following student notes:\n\n${noteContent}`,
      config: {
        systemInstruction: `You are an educational quiz generation engine. Tailor the question difficulty and conceptual depth to match the student's target learning goals.\n\n${personaGuidance}`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Engaging title for the quiz' },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING, description: 'Challenging multiple choice question' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly 4 distinct plausible options'
                  },
                  correctIndex: { type: Type.INTEGER, description: '0-based index of the single correct answer' },
                  explanation: { type: Type.STRING, description: 'Step-by-step conceptual rationale' },
                  topic: { type: Type.STRING, description: 'Topic category' }
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation', 'topic']
              }
            }
          },
          required: ['title', 'questions']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}') as { title: string; questions: any[] };
    const questions: QuizQuestion[] = (parsed.questions || []).map((q: any, i: number) => ({
      id: `quiz-q-${Date.now()}-${i}`,
      question: q.question,
      options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      explanation: q.explanation || 'Step-by-step conceptual rationale.',
      topic: q.topic || 'Concept Mastery'
    }));

    return {
      title: parsed.title || title || 'Personalized Practice Quiz',
      questions: questions.length > 0 ? questions : []
    };
  } catch (err) {
    console.error('Error generating quiz:', err);
    return {
      title: title || 'Concept Check Quiz',
      questions: [
        {
          id: 'q-fallback-1',
          question: 'What is the primary invariant discussed in the notes?',
          options: [
            'Structural balance and asymptotic bounds',
            'Arbitrary linear chaining without termination',
            'Unbounded recursive depth',
            'Random key dispersal'
          ],
          correctIndex: 0,
          explanation: 'The notes describe structural invariants that enforce balance and prevent degenerate worst-case depths.',
          topic: 'Fundamentals'
        }
      ]
    };
  }
}

/**
 * 6. Generate Prompt-Based Quiz
 */
export async function generatePromptQuizAI(prompt: string, subject?: Subject, count: number = 4): Promise<GeneratedQuiz> {
  const apiKey = process.env.GEMINI_API_KEY;
  const subjName = subject?.name || 'Engineering Curriculum';

  if (!apiKey) {
    return {
      id: `quiz-gen-${Date.now()}`,
      title: `Diagnostic Quiz: ${prompt}`,
      topic: subjName,
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: `q1`,
          question: `In ${subjName}, what is the central principle of "${prompt}"?`,
          options: [
            'It establishes mathematical consistency, invariant maintenance, and boundary optimization',
            'It functions purely by random trial and error',
            'It disregards conservation of energy and computational complexity',
            'It has no defined inputs or outputs'
          ],
          correctIndex: 0,
          explanation: 'Engineering systems operate on strict deterministic laws and mathematical rigor.',
          topic: subject?.code || 'Core Concept'
        },
        {
          id: `q2`,
          question: 'What is the primary risk when ignoring edge condition verification?',
          options: [
            'System failure, runtime memory faults, or critical safety violations',
            'Instant 100% efficiency gain',
            'Automatic correction without code modification',
            'Zero impact on system behavior'
          ],
          correctIndex: 0,
          explanation: 'Edge cases and boundary conditions are the most common source of catastrophic failure if not guarded.',
          topic: 'Error Handling & Reliability'
        },
        {
          id: `q3`,
          question: 'Which method is standard for validating the performance of this approach?',
          options: [
            'Empirical benchmarking, asymptotic runtime analysis, and stress testing',
            'Assuming theoretical perfection without testing',
            'Deleting all test assertions',
            'Relying solely on visual inspection'
          ],
          correctIndex: 0,
          explanation: 'Rigorous empirical benchmarks and asymptotic complexity proofs ensure reproducibility and scalability.',
          topic: 'Verification & Testing'
        }
      ]
    };
  }

  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Create a ${count}-question multiple choice quiz for university students on the topic: "${prompt}" in the course "${subjName}" (${subject?.code || ''}).
Make each question rigorous with 4 distinct choices, exact 0-based correctIndex, and clear explanatory reasoning for the answer.`,
      config: {
        systemInstruction: 'You are an elite exam author. Return JSON with title, topic, and questions array.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            topic: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  topic: { type: Type.STRING }
                },
                required: ['question', 'options', 'correctIndex', 'explanation', 'topic']
              }
            }
          },
          required: ['title', 'topic', 'questions']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      id: `quiz-gen-${Date.now()}`,
      title: parsed.title || `Assessment: ${prompt}`,
      topic: parsed.topic || subjName,
      createdAt: new Date().toISOString(),
      questions: (parsed.questions || []).map((q: any, i: number) => ({
        id: `q-gen-${Date.now()}-${i}`,
        question: q.question,
        options: q.options,
        correctIndex: Number(q.correctIndex) || 0,
        explanation: q.explanation,
        topic: q.topic || subject?.code || 'Topic'
      }))
    };
  } catch (err) {
    console.error('Error generating prompt quiz:', err);
    return {
      id: `quiz-gen-fallback-${Date.now()}`,
      title: `Quiz: ${prompt}`,
      topic: subjName,
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: 'q-fb-1',
          question: `What is the primary definition associated with ${prompt}?`,
          options: [
            'Core mathematical and structural invariant definition',
            'Unrelated peripheral concept',
            'Non-functional aesthetic decoration',
            'Arbitrary placeholder value'
          ],
          correctIndex: 0,
          explanation: 'The fundamental definition specifies invariant boundaries and operational guarantees.',
          topic: 'Definitions'
        }
      ]
    };
  }
}

/**
 * 7. AI Class Diagnostics
 */
export async function generateClassDiagnosticsAI(subject: Subject, currentAnalytics: any): Promise<{
  aiExecutiveSummary: string;
  keyActionItems: string[];
  weakTopics: Array<{ topic: string; errorRate: number; averageScore: number; affectedStudents: number; recommendedRemediation: string; urgency: 'high' | 'medium' | 'low' }>;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      aiExecutiveSummary: `Class performance for ${subject.code} is currently averaging ${currentAnalytics.classAverage}% across ${currentAnalytics.totalStudents} enrolled students. Focus areas include rotation cases, thermodynamic cycle derivations, and memory layout tracking.`,
      keyActionItems: [
        'Review high-error questions during the upcoming lecture.',
        'Distribute targeted practice problem sets with step-by-step video solutions.',
        'Schedule targeted office hours for students scoring under 70%.'
      ],
      weakTopics: currentAnalytics.weakTopics || []
    };
  }

  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Analyze the class academic performance for ${subject.code} (${subject.name}).
Current Class Average: ${currentAnalytics.classAverage}%
Submission Rate: ${currentAnalytics.submissionRate}%
Enrolled Students: ${currentAnalytics.totalStudents}
At Risk Students: ${currentAnalytics.atRiskStudentsCount}
Current Recorded Weak Topics: ${JSON.stringify(currentAnalytics.weakTopics || [])}
Grade Distribution: ${JSON.stringify(currentAnalytics.gradeDistribution || [])}`,
      config: {
        systemInstruction: 'You are an elite academic analytics consultant for university faculty. Generate a high-level diagnostic executive briefing, prioritized pedagogical action items, and refined weak topic remediation strategies.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiExecutiveSummary: { type: Type.STRING, description: 'Executive summary with bolded key metrics and actionable pedagogical narrative' },
            keyActionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 direct, highly actionable steps the teacher can execute this week'
            },
            weakTopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  errorRate: { type: Type.NUMBER, description: 'Estimated percent error rate (e.g. 35)' },
                  averageScore: { type: Type.NUMBER, description: 'Average score on this topic (e.g. 68)' },
                  affectedStudents: { type: Type.NUMBER },
                  recommendedRemediation: { type: Type.STRING },
                  urgency: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
                },
                required: ['topic', 'errorRate', 'averageScore', 'affectedStudents', 'recommendedRemediation', 'urgency']
              }
            }
          },
          required: ['aiExecutiveSummary', 'keyActionItems', 'weakTopics']
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error('Error generating class diagnostics:', err);
    return {
      aiExecutiveSummary: `Class average is currently ${currentAnalytics.classAverage}% with ${currentAnalytics.submissionRate}% submission rate. Continue monitoring at-risk student progress.`,
      keyActionItems: ['Host review session prior to midterm', 'Send alerts to at-risk students'],
      weakTopics: currentAnalytics.weakTopics || []
    };
  }
}

/**
 * 8. Generate Syllabus Timeline Milestones
 */
export async function generateSyllabusTimelineAI(courseName: string, description: string, weeksCount: number = 6): Promise<Array<{
  title: string;
  type: 'lecture' | 'quiz' | 'exam' | 'practical' | 'assignment';
  weekNumber: number;
  description: string;
  topicsCovered: string[];
  weightagePercent?: number;
}>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return [
      { title: 'Unit 1 Foundations & Mathematical Invariants', type: 'lecture', weekNumber: 1, description: 'Core principles, state modeling, and problem decomposition.', topicsCovered: ['Theoretical Foundations', 'Recurrence Bounds'], weightagePercent: 0 },
      { title: 'Diagnostic Quiz 1: Core Theorems', type: 'quiz', weekNumber: 2, description: 'Quick assessment of introductory concepts.', topicsCovered: ['Invariants', 'Proof Techniques'], weightagePercent: 10 },
      { title: 'Practical Lab 1: Benchmark Suite', type: 'practical', weekNumber: 3, description: 'Hands-on performance verification and benchmarking.', topicsCovered: ['Data Structures', 'C Programming'], weightagePercent: 15 },
      { title: 'Midterm Examination', type: 'exam', weekNumber: 4, description: 'Comprehensive written evaluation across units 1-3.', topicsCovered: ['All Unit 1-3 topics'], weightagePercent: 30 }
    ];
  }

  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Create a structured academic timeline with ${weeksCount} milestones (lectures, quizzes, practical labs, assignments, and exams) for the course "${courseName}":\nDescription: ${description}`,
      config: {
        systemInstruction: 'You are an academic curriculum designer. Generate a balanced distribution of academic timeline events with realistic weightages and topic descriptions.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['lecture', 'quiz', 'exam', 'practical', 'assignment'] },
              weekNumber: { type: Type.INTEGER },
              description: { type: Type.STRING },
              topicsCovered: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              weightagePercent: { type: Type.INTEGER }
            },
            required: ['title', 'type', 'weekNumber', 'description', 'topicsCovered']
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (err) {
    console.error('Error generating syllabus timeline:', err);
    return [];
  }
}
