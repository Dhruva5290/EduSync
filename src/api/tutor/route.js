import { GoogleGenAI, Type } from '@google/genai';

/**
 * System Prompt enforcing the Socratic Tutor Pedagogy & Output Schema
 */
const SOCRATIC_SYSTEM_PROMPT = `You are "EduSync Socratic AI Tutor", an elite, empathetic university teaching assistant and academic mentor.

Your Mission:
Help students genuinely master challenging concepts through active inquiry, scaffolded reasoning, and critical thinking.

CRITICAL GUARDRAIL RULES:
1. THE SOCRATIC METHOD IS MANDATORY:
   - NEVER write complete essays, homework solutions, or direct final answers to assignment/exam problems.
   - If a student asks "What is the answer to question 3?" or "Write my lab report for me":
     * Decline to provide direct answers.
     * Identify the core concept underlying the question.
     * Break the problem down into manageable conceptual components.
     * Ask a targeted guiding question that leads the student to the next logical step.
2. CONTEXT-AWARE INSTRUCTION:
   - Leverage the provided student context (course, upcoming exams, active unit, and pending assignments) to tailor explanations and difficulty.
   - Relate abstract theoretical concepts back to the student's active syllabus and real-world physical intuitions.
3. STRUCTURED PEDAGOGICAL RESPONSES:
   - Use clear, inviting Markdown with LaTeX equations ($...$ for inline, $$...$$ for blocks).
   - Provide 2-3 focused follow-up reflection questions that prompt the student to formulate the next step.
   - Recommend 1-2 authoritative learning resources (video or book chapter) grounded in the discussed topic.

OUTPUT FORMAT REQUIREMENTS:
You MUST return your response as a valid JSON object matching this exact schema:
{
  "reply": "Your Socratic explanation and guiding prompts in clean Markdown...",
  "followUpQuestions": [
    "First guiding question to prompt student reflection?",
    "Second guiding question on boundary conditions or formulas?"
  ],
  "recommendedResources": [
    {
      "id": "rec-1",
      "title": "Title of tutorial or textbook chapter",
      "type": "video" or "book",
      "provider": "e.g., Khan Academy, MIT OpenCourseWare, or Textbook Author",
      "duration": "e.g., 12:40 or Pages 210-230",
      "url": "https://www.youtube.com/watch?v=... or relevant resource link",
      "description": "Brief 1-sentence synopsis of why this resource helps master this specific concept."
    }
  ]
}`;

/**
 * POST /api/tutor
 * Handles Socratic student tutoring with Gemini API and invisible Context Injection
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { message, studentContext, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Invisible Context Injection with Learning Persona Scaffolding
    const persona = studentContext?.learnerProfile;
    const personaSnippet = persona ? `
[STUDENT_LEARNING_PERSONA]
- Learning Modality: ${persona.learningStyle ? persona.learningStyle.toUpperCase() : 'BALANCED'} (${
  persona.learningStyle === 'visual' ? 'Prioritize mental models, structural ASCII schematics, geometric perspectives, and vivid real-world physical analogies' :
  persona.learningStyle === 'step_by_step' ? 'Decompose problems into explicit sequential mathematical steps, stating all boundary invariants' :
  persona.learningStyle === 'socratic_dialogue' ? 'Use interactive guiding questions and thought experiments to draw out reasoning' :
  'Highlight high-frequency exam formulas, common traps, and concise cheat-sheet points'
})
- Target Academic Level: ${persona.targetGrade || 'A+'} (${persona.targetGrade === 'A+' ? 'Mastery with advanced edge cases' : 'Clear intuitive foundation'})
- Coaching Tone: ${persona.explanationTone || 'encouraging_mentor'} (${
  persona.explanationTone === 'strict_coach' ? 'Rigorous and direct academic rigor' :
  persona.explanationTone === 'practical_engineer' ? 'Pragmatic real-world systems and trade-offs' :
  'Warm, supportive, and patient mentor'
})
- Preferred Pace: ${persona.preferredPace || 'steady'}
- Strengths/Interests: ${persona.strengthsAndInterests || 'General Sciences'}
- Weak Areas/Pain Points: ${persona.painPoints || 'None specified (provide extra scaffolding when introducing equations)'}
[END_LEARNING_PERSONA]` : '';

    const contextSnippet = `
[STUDENT_ACADEMIC_CONTEXT]
- Active Course: ${studentContext?.currentSubject?.name || 'Undergraduate Science & Engineering'} (${studentContext?.currentSubject?.code || 'GEN-101'})
- Current Syllabus Unit: ${studentContext?.currentSubject?.currentUnit || 'General Studies'}
- Next Exam Milestone: ${studentContext?.upcomingExam?.title || 'Midterm'} on ${studentContext?.upcomingExam?.date || 'Upcoming'}
- Exam Syllabus Topics: ${studentContext?.upcomingExam?.syllabusTopics ? studentContext.upcomingExam.syllabusTopics.join('; ') : 'All Units'}
- Pending Assignments: ${studentContext?.upcomingAssignments?.length || 0} active (${studentContext?.upcomingAssignments?.map(a => `${a.title} due ${a.dueDate}`).join(' | ') || 'None'})
- Overdue Tasks: ${studentContext?.overdueCount || 0}
[END_STUDENT_CONTEXT]
${personaSnippet}`;

    // 2. Prepare conversation contents
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback Socratic generator when API key is not set
      const fallbackResponse = generateLocalSocraticReply(message, studentContext);
      return new Response(JSON.stringify(fallbackResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format chat history for LLM
    const formattedHistory = history.map(h => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    const fullPrompt = `${contextSnippet}\n\nStudent Query: "${message}"\n\nPlease formulate your Socratic guidance response following the JSON schema.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: fullPrompt }] }
      ],
      config: {
        systemInstruction: SOCRATIC_SYSTEM_PROMPT,
        responseMimeType: 'application/json'
      }
    });

    const rawText = result.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch {
      parsedResult = {
        reply: rawText,
        followUpQuestions: [
          'What is the fundamental equation or definition governing this concept?',
          'What variables are given in your problem, and what are you solving for?'
        ],
        recommendedResources: []
      };
    }

    return new Response(JSON.stringify(parsedResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in /api/tutor route:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process tutoring request',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Institutional Engineering Training Corpus for Socratic AI Tutor
 */
const INSTITUTIONAL_KNOWLEDGE_CORPUS = [
  {
    subjects: ['PHYS 101', 'PHYSICS', 'THERMODYNAMICS', 'EME'],
    keywords: ['carnot', 'heat engine', 'efficiency', 'entropy', 'second law', 'kelvin', 'refrigerator', 'reservoir'],
    concept: 'Carnot Cycle, Heat Engines & The Second Law of Thermodynamics',
    principles: [
      'Thermal efficiency: $\\eta = \\frac{W}{Q_H} = 1 - \\frac{Q_C}{Q_H}$',
      'Carnot reversible maximum limit: $\\eta_{\\text{Carnot}} = 1 - \\frac{T_C}{T_H}$ (Temperatures strictly in Kelvin)',
      'Clausius statement: Heat cannot spontaneously flow from a colder to a hotter body without external work input.',
      'Entropy ($S$): State function where $\\Delta S = \\int \\frac{dQ_{\\text{rev}}}{T} \\ge 0$ for an isolated system.'
    ],
    socraticExplanation: `### ⚙️ Exploring Heat Engine Efficiency & The Carnot Limit

In any thermodynamic heat engine, efficiency $\\eta$ measures how effectively heat input ($Q_H$) is converted into mechanical work ($W = Q_H - Q_C$):

$$\\eta = \\frac{W}{Q_H} = 1 - \\frac{Q_C}{Q_H}$$

For a reversible **Carnot cycle** (consisting of two reversible isotherms and two reversible adiabatics):
$$\\eta_{\\text{Carnot}} = 1 - \\frac{T_C}{T_H}$$

#### 💡 Key Concept to Master:
Why can a real heat engine never reach $100\\%$ efficiency? Notice that for $\\eta = 1$, either $Q_C = 0$ (violating the Kelvin-Planck statement) or $T_C = 0\\text{ K}$ (unreachable by the Third Law of Thermodynamics).`,
    guidingQuestions: [
      'If an engine operates between a heat source at 600 K and an exhaust at 300 K, what is its maximum possible efficiency?',
      'Why is internal energy ($\\Delta U$) a state function while Work ($W$) and Heat ($Q$) depend on the specific path?'
    ],
    resources: [
      {
        id: 'res-carnot-1',
        title: 'The Carnot Cycle: Step-by-Step Cycle Tracing',
        type: 'video',
        provider: 'Khan Academy Physics',
        duration: '11:45',
        url: 'https://www.youtube.com/watch?v=DZt5xU44IfQ',
        description: 'Visual P-V diagram tracing isothermal expansion, adiabatic expansion, and compression.'
      },
      {
        id: 'res-phys-book-1',
        title: 'University Physics with Modern Physics: Thermodynamics',
        type: 'book',
        provider: 'Young & Freedman (15th Ed.)',
        duration: 'Chapter 20 (Pages 650–675)',
        url: '#',
        description: 'Rigorous derivations of cyclic heat engines, entropy calculation, and refrigerator COP.'
      }
    ]
  },
  {
    subjects: ['CPC', 'C PROGRAMMING', 'COMPUTER SCIENCE'],
    keywords: ['pointer', 'malloc', 'memory', 'segfault', 'array', 'address', 'dereference', 'linked list'],
    concept: 'Pointers, Dynamic Memory Allocation & Memory Safety in C',
    principles: [
      'Pointers store virtual memory addresses: `&var` (address-of), `*ptr` (dereference).',
      'Pointer arithmetic scales by type size: $\\text{Addr}(p + k) = \\text{Addr}(p) + k \\times \\text{sizeof}(*p)$.',
      'Heap allocation: `malloc(size)` allocates uninitialized memory; `calloc(n, size)` zero-initializes; `free(ptr)` releases heap pages.',
      'Memory safety: Always check `if (ptr == NULL)` and avoid dangling pointers by setting `ptr = NULL` after `free()`.'
    ],
    socraticExplanation: `### 🧠 Pointers & Memory Architecture in C

In C, variables are stored at specific contiguous memory addresses. A **pointer** is simply a variable holding the memory address of another variable.

\`\`\`c
int val = 42;
int *ptr = &val; // ptr holds the address of val (e.g. 0x7ffd98)
*ptr = 100;      // Directly modifies the memory at address 0x7ffd98
\`\`\`

#### 🔍 Critical Distinction:
When you perform pointer arithmetic (ptr + 1), the compiler does not advance by 1 single byte; it advances by sizeof(*ptr) bytes (4 bytes for an int, 8 bytes for a double).`,
    guidingQuestions: [
      'What happens in memory when you access an array as `arr[i]` versus `*(arr + i)`?',
      'Why does passing a pointer to a function allow that function to modify the caller’s original variables?'
    ],
    resources: [
      {
        id: 'res-c-ptr-1',
        title: 'Pointers and Memory in C (Full Visual Guide)',
        type: 'video',
        provider: 'freeCodeCamp.org',
        duration: '22:15',
        url: 'https://www.youtube.com/watch?v=KJgsSFOSQv0',
        description: 'Clear graphical visualization of stack frames, heap allocation, and pointer arithmetic.'
      },
      {
        id: 'res-c-book-1',
        title: 'The C Programming Language (2nd Ed.)',
        type: 'book',
        provider: 'Brian W. Kernighan & Dennis M. Ritchie',
        duration: 'Chapter 5: Pointers and Arrays',
        url: '#',
        description: 'The authoritative reference on pointer manipulation and dynamic memory allocation.'
      }
    ]
  },
  {
    subjects: ['CALC', 'MATHEMATICS', 'CALCULUS'],
    keywords: ['lagrange', 'optimization', 'partial derivative', 'gradient', 'integral', 'contour', 'extrema'],
    concept: 'Multivariable Optimization & Lagrange Multipliers',
    principles: [
      'Gradient vector: $\\nabla f(x, y) = \\left\\langle \\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y} \\right\\rangle$ points in the direction of steepest ascent.',
      'Constrained optimization: At extremum of $f(x, y)$ subject to $g(x, y) = c$, the gradient vectors must be collinear: $\\nabla f = \\lambda \\nabla g$.',
      'The scalar $\\lambda$ is the Lagrange multiplier representing the sensitivity / shadow price of the constraint.'
    ],
    socraticExplanation: `### 📐 Constrained Optimization via Lagrange Multipliers

When maximizing or minimizing a function $f(x, y)$ along a constraint curve $g(x, y) = c$, the optimal point occurs where the **level curves of $f$ are tangent to the constraint curve $g = c$**.

Because the gradient vectors $\\nabla f$ and $\\nabla g$ are perpendicular to their respective level curves, their directions must be parallel:

$$\\nabla f(x, y) = \\lambda \\nabla g(x, y)$$

Coupled with the constraint equation $g(x, y) = c$, this yields a system of equations to solve for the critical points $(x, y, \\lambda)$.`,
    guidingQuestions: [
      'Why would a point where the level curve crosses the constraint curve NOT be an extremum?',
      'How do you set up the partial derivative equations $\\frac{\\partial f}{\\partial x} = \\lambda \\frac{\\partial g}{\\partial x}$ and $\\frac{\\partial f}{\\partial y} = \\lambda \\frac{\\partial g}{\\partial y}$?'
    ],
    resources: [
      {
        id: 'res-calc-1',
        title: 'Lagrange Multipliers Visualized with Contour Lines',
        type: 'video',
        provider: '3Blue1Brown / Khan Academy',
        duration: '14:30',
        url: 'https://www.youtube.com/watch?v=9vKqVkMQHKk',
        description: 'Intuitive geometric demonstration of gradient vector alignment at constrained extrema.'
      },
      {
        id: 'res-calc-book-1',
        title: 'Calculus: Early Transcendentals (8th Ed.)',
        type: 'book',
        provider: 'James Stewart',
        duration: 'Section 14.8: Lagrange Multipliers',
        url: '#',
        description: 'Worked geometric and physical optimization problems with multiple constraints.'
      }
    ]
  }
];

/**
 * Fallback Local Socratic Engine (Deterministic & Context-Aware)
 */
function generateLocalSocraticReply(message, studentContext) {
  const clean = (message || '').toLowerCase();
  const subjectName = studentContext?.currentSubject?.name || 'Thermodynamics';

  // 1. Check if asking about syllabus / exam review
  if (clean.includes('syllabus') || clean.includes('exam') || clean.includes('midterm') || clean.includes('summarize')) {
    const exam = studentContext?.upcomingExam;
    const topics = exam?.syllabusTopics ? exam.syllabusTopics.join('; ') : 'All active modules';
    return {
      reply: `### 🎯 Socratic Syllabus Review for **${subjectName}**\n\nYour upcoming **${exam?.title || 'Exam'}** (${exam?.date || 'Scheduled Soon'}) focuses on:\n\n* **Core Focus Topics**: ${topics}\n\n#### How to Approach Your Revision:\nRather than passively memorizing equations, focus on **underlying invariants and conservation laws**. For example: Can you explain in your own words why internal energy is a state function while work and heat are path-dependent?`,
      followUpQuestions: [
        'Which syllabus topic do you feel least confident about right now?',
        'Can you state the governing equation for the primary topic in your own words?'
      ],
      recommendedResources: [
        {
          id: 'res-syl-1',
          title: 'High-Yield Exam Preparation & Concept Synthesis',
          type: 'video',
          provider: 'EduSync Academic Portal',
          duration: '15:00',
          url: 'https://www.youtube.com/watch?v=DZt5xU44IfQ',
          description: 'Comprehensive walkthrough connecting syllabus theory to university exam problem patterns.'
        }
      ]
    };
  }

  // 2. Search Institutional Knowledge Corpus
  for (const item of INSTITUTIONAL_KNOWLEDGE_CORPUS) {
    if (item.keywords.some(kw => clean.includes(kw))) {
      return {
        reply: item.socraticExplanation,
        followUpQuestions: item.guidingQuestions,
        recommendedResources: item.resources
      };
    }
  }

  // 3. General Socratic Fallback
  return {
    reply: `### 💡 Socratic Guidance on **${subjectName}**\n\nTo master this concept from first principles:\n\n1. **Identify the Core Phenomenon**: What physical laws, governing equations, or computational rules define this topic?\n2. **Break Down the Knowns**: What parameters are given, and what boundary conditions or constraints must hold true?\n\nTell me what you think the first step or governing relation is, and let's work through the derivation together!`,
    followUpQuestions: [
      'What equations or formulas connect the variables in your question?',
      'What happens at the boundary conditions (e.g. at zero or infinity)?'
    ],
    recommendedResources: [
      {
        id: 'res-gen-1',
        title: 'Undergraduate Engineering Foundations Reference',
        type: 'book',
        provider: 'University Coursepack',
        duration: 'Core Modules',
        url: '#',
        description: 'Comprehensive textbook reference with step-by-step conceptual walkthroughs.'
      }
    ]
  };
}

export default POST;
