import { FAKE_USERS } from '../src/mock/fakeData';
import {
  persistUserToCloud,
  findUserInCloud,
  loadUsersFromCloud,
  deleteUserFromCloud
} from '../src/server/supabaseUsers';
import { User } from '../src/types';
import { synthesizeMasteryQuizFromContent, evaluateQuizPerformance } from '../src/lib/quizGenerator';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-user-id'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse path
  let path = req.url || '';
  const matched = req.headers['x-matched-path'] || req.headers['x-now-route-matches'];
  if (typeof matched === 'string') path = matched;
  path = path.split('?')[0];

  try {
    // 1. GET /api/auth/public-users
    if (path.includes('/api/auth/public-users') || path.endsWith('/public-users')) {
      const cloudUsers = await loadUsersFromCloud();
      const all = [...FAKE_USERS];
      for (const cu of cloudUsers) {
        const idx = all.findIndex(u => u.id === cu.id);
        if (idx !== -1) all[idx] = cu;
        else all.push(cu);
      }
      res.status(200).json({ users: all });
      return;
    }

    // 2. POST /api/auth/login
    if (path.includes('/api/auth/login') && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { identifier, password, role } = body;
      const rawId = (identifier || '').trim();
      const loginId = rawId.toLowerCase();
      const loginPass = (password || '').trim();

      if (!loginId) {
        res.status(400).json({ error: 'Username or Institutional ID is required' });
        return;
      }

      // 1. Search in local seed users
      let user = FAKE_USERS.find(u =>
        (u.username && u.username.toLowerCase() === loginId) ||
        (u.email && u.email.toLowerCase() === loginId) ||
        (u.institutionalId && u.institutionalId.toLowerCase() === loginId) ||
        (u.name && u.name.toLowerCase() === loginId)
      );

      // 2. Search in Supabase Cloud
      if (!user) {
        user = await findUserInCloud(loginId);
      }

      if (!user) {
        res.status(401).json({
          error: `No registered account found matching "${rawId}". Please check your credentials or register as a new user.`
        });
        return;
      }

      const expectedPass = user.password || 'EduSync@260101';
      if (expectedPass !== loginPass) {
        res.status(401).json({
          error: 'Incorrect password. Please verify your credentials and try again.'
        });
        return;
      }

      const token = Buffer.from(JSON.stringify({ userId: user.id, role: user.role, time: Date.now() })).toString('base64');
      res.status(200).json({ success: true, token, user });
      return;
    }

    // 3. POST /api/users (Register User)
    if ((path.includes('/api/users') || path.endsWith('/users')) && !path.includes('/api/users/') && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { name, email, password, role, department, program, designation, phone, gender, academicYear, gpa, initialSubjectIds, teachingSubjectIds } = body;
      const targetRole = role || 'student';
      const cleanName = (name || '').trim().toLowerCase().split(' ')[0];
      const prefix = targetRole === 'teacher' ? 'BMU-FAC' : targetRole === 'admin' ? 'BMU-ADM' : '260';
      const finalInstId = `${prefix}-${Math.floor(202600 + Math.random() * 900)}`;

      const newUser: User = {
        id: `${targetRole}-${Date.now()}`,
        name: name || 'New User',
        email: email || `${cleanName}@bmu.edu.in`,
        username: `${targetRole === 'teacher' ? 'prof' : targetRole === 'admin' ? 'dean' : 'student'}.${cleanName}`,
        password: password || 'EduSync@260101',
        role: targetRole,
        gender: gender || 'Male',
        program: program || (targetRole === 'student' ? 'CSE' : undefined),
        institutionalId: finalInstId,
        department: department || 'Department of Computer Sciences',
        academicYear: targetRole === 'student' ? (academicYear || '1st Year') : undefined,
        designation: targetRole !== 'student' ? (designation || 'Faculty') : undefined,
        phone: phone || '+91 98765 43210',
        gpa: targetRole === 'student' ? Number(gpa || 8.0) : undefined,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        enrolledSubjectIds: targetRole === 'student' ? (initialSubjectIds || ['subj-ess', 'subj-calc', 'subj-eme']) : [],
        teachingSubjectIds: targetRole === 'teacher' ? (teachingSubjectIds || []) : []
      };

      await persistUserToCloud(newUser);
      res.status(201).json({ success: true, user: newUser });
      return;
    }

    // 4. DELETE /api/users/:id
    if (path.includes('/api/users/') && req.method === 'DELETE') {
      const parts = path.split('/api/users/');
      const userId = parts[1]?.split('?')[0];
      if (userId) {
        await deleteUserFromCloud(userId);
      }
      res.status(200).json({ success: true, message: 'User unregistered successfully' });
      return;
    }

    // 5. POST /api/admin/provision-department
    if (path.includes('/api/admin/provision-department') && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { users } = body;
      if (Array.isArray(users)) {
        for (const u of users) {
          persistUserToCloud(u).catch(() => {});
        }
      }
      res.status(200).json({ success: true, message: 'Department provisioned' });
      return;
    }

    // 6. POST /api/ai/quiz/generate-mastery-quiz
    if (path.includes('/api/ai/quiz/generate-mastery-quiz') && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { noteContent = '', title = 'Lecture Checkpoint', count = 5, learnerProfile } = body;

      if (process.env.GEMINI_API_KEY) {
        try {
          const { generateMasteryQuizAI } = await import('../src/server/gemini');
          const result = await generateMasteryQuizAI(noteContent, title, learnerProfile, count);
          if (result && Array.isArray(result.questions) && result.questions.length >= 3) {
            res.status(200).json(result);
            return;
          }
        } catch (geminiErr) {
          console.warn('[Serverless Gemini Quiz Warning]', geminiErr);
        }
      }

      let questions: any[] = [];
      const cleanT = (title || '').toLowerCase();
      if (cleanT.includes('nda') || cleanT.includes('selection') || cleanT.includes('ssb')) {
        const { getOrGenerateQuizQuestions } = await import('../src/lib/quizGenerator');
        questions = getOrGenerateQuizQuestions({ id: 'note-misc-nda', title, content: noteContent, subjectId: 'subj-misc', tags: [], lastModified: '' }, learnerProfile);
      } else if (cleanT.includes('friction') || cleanT.includes('newton')) {
        const { getOrGenerateQuizQuestions } = await import('../src/lib/quizGenerator');
        questions = getOrGenerateQuizQuestions({ id: 'note-phy-01', title, content: noteContent, subjectId: 'subj-phy', tags: [], lastModified: '' }, learnerProfile);
      } else {
        questions = synthesizeMasteryQuizFromContent(noteContent, title, learnerProfile, count);
      }

      res.status(200).json({
        title: `Mastery Quiz: ${title}`,
        questions
      });
      return;
    }

    // 7. POST /api/ai/quiz/analyze-performance
    if (path.includes('/api/ai/quiz/analyze-performance') && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { quizTitle = 'Quiz', questions = [], userAnswers = [], learnerProfile } = body;

      if (process.env.GEMINI_API_KEY) {
        try {
          const { analyzeQuizPerformanceAI } = await import('../src/server/gemini');
          const analysis = await analyzeQuizPerformanceAI(quizTitle, questions, userAnswers, learnerProfile);
          if (analysis) {
            res.status(200).json(analysis);
            return;
          }
        } catch (geminiErr) {
          console.warn('[Serverless Gemini Analysis Warning]', geminiErr);
        }
      }

      const answersMap: Record<number, number> = {};
      (userAnswers || []).forEach((ans: number, idx: number) => {
        answersMap[idx] = ans;
      });
      const localAnalysis = evaluateQuizPerformance(quizTitle, questions, answersMap, learnerProfile);
      res.status(200).json(localAnalysis);
      return;
    }

    // 8. POST /api/tutor (AI Socratic Tutor Chat)
    if ((path.includes('/api/tutor') || path.endsWith('/tutor')) && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { message, history = [], lectureContext, studentContext } = body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const ctx = studentContext || lectureContext || {};
      const persona = ctx?.learnerProfile;

      const SOCRATIC_SYSTEM_PROMPT = `You are "EduSync Socratic AI Tutor", an elite, empathetic university teaching assistant and academic mentor.

Your Mission:
Help students genuinely master challenging concepts through active inquiry, scaffolded reasoning, and critical thinking.

CRITICAL GUARDRAIL RULES:
1. THE SOCRATIC METHOD IS MANDATORY:
   - NEVER write complete essays, homework solutions, or direct final answers to assignment/exam problems.
   - If a student asks for a direct answer, decline and instead break the problem into guiding steps.
2. CONTEXT-AWARE INSTRUCTION:
   - Leverage any provided student context to tailor explanations and difficulty.
   - Relate abstract concepts back to real-world physical intuitions.
3. STRUCTURED PEDAGOGICAL RESPONSES:
   - Use clear, inviting Markdown with LaTeX equations ($...$ for inline, $$...$$ for blocks).
   - Provide 2-3 focused follow-up reflection questions.
   - Recommend 1-2 authoritative learning resources.

OUTPUT FORMAT:
Return your response as a valid JSON object:
{
  "reply": "Your Socratic explanation and guiding prompts in clean Markdown...",
  "followUpQuestions": ["Question 1?", "Question 2?"],
  "recommendedResources": [{ "id": "rec-1", "title": "...", "type": "video", "provider": "...", "duration": "...", "url": "...", "description": "..." }]
}`;

      const personaSnippet = persona ? `
[STUDENT_LEARNING_PERSONA]
- Learning Modality: ${(persona.learningStyle || 'balanced').toUpperCase()}
- Target Academic Level: ${persona.targetGrade || 'A+'}
- Coaching Tone: ${persona.explanationTone || 'encouraging_mentor'}
- Preferred Pace: ${persona.preferredPace || 'steady'}
- Strengths: ${persona.strengthsAndInterests || 'General Sciences'}
- Weak Areas: ${persona.painPoints || 'None specified'}
[END_LEARNING_PERSONA]` : '';

      const subjectName = ctx?.currentSubject?.name || 'General Studies';
      const contextSnippet = `
[STUDENT_ACADEMIC_CONTEXT]
- Active Course: ${subjectName} (${ctx?.currentSubject?.code || 'GEN-101'})
- Current Unit: ${ctx?.currentSubject?.currentUnit || 'General Studies'}
[END_STUDENT_CONTEXT]
${personaSnippet}`;

      // Try Gemini API first
      if (process.env.GEMINI_API_KEY) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

          const formattedHistory = (history || []).map((h: any) => ({
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
                'What variables are given, and what are you solving for?'
              ],
              recommendedResources: []
            };
          }

          res.status(200).json(parsedResult);
          return;
        } catch (geminiErr: any) {
          console.warn('[Tutor Gemini Error]', geminiErr?.message || geminiErr);
        }
      }

      // Fallback: Intelligent local Socratic responder
      const clean = message.toLowerCase();

      // Helper: count how many keywords match in the message
      const countMatches = (keywords: string[]) => keywords.filter(kw => clean.includes(kw)).length;

      // Extract the likely topic from the message
      const extractTopic = (msg: string): string => {
        // Try to find quoted topic names
        const quoteMatch = msg.match(/[""]([^""]+)[""]|"([^"]+)"/);
        if (quoteMatch) return quoteMatch[1] || quoteMatch[2] || '';
        // Try to find "about X" or "on X"
        const aboutMatch = msg.match(/(?:about|on|regarding|with)\s+(.+?)(?:\.|,|$|\?|and\s)/i);
        if (aboutMatch) return aboutMatch[1].trim();
        return msg.substring(0, 120);
      };

      const topic = extractTopic(message);

      // Knowledge corpus with MINIMUM match threshold (require 2+ keywords to match)
      const KNOWLEDGE_CORPUS = [
        {
          minMatches: 1, // specific enough terms
          keywords: ['projectile', 'trajectory', 'kinematics', 'v_0', 'v_{0', 'sin\\theta', 'sinθ', 'launch angle', 'range formula', 'time of flight', 'horizontal range'],
          reply: `### 🎯 Projectile Motion & 2D Kinematics\n\nProjectile motion splits into two independent components:\n\n**Horizontal (x-axis):** No acceleration → uniform motion\n$$x = v_0 \\cos\\theta \\cdot t$$\n\n**Vertical (y-axis):** Constant gravitational acceleration\n$$v_{0y} = v_0 \\sin\\theta$$\n$$y = v_0 \\sin\\theta \\cdot t - \\frac{1}{2}gt^2$$\n\n#### 💡 Key Insight:\nThe **Vertical Component** $v_{0y} = v_0 \\sin\\theta$ determines how HIGH and how LONG the projectile stays in the air. It is the initial upward velocity — the component of the launch velocity directed against gravity.\n\n**Why This Matters:**\n- **Time of flight**: $T = \\frac{2v_0\\sin\\theta}{g}$ — entirely determined by the vertical component\n- **Maximum height**: $H = \\frac{v_0^2\\sin^2\\theta}{2g}$\n- **Range**: $R = \\frac{v_0^2\\sin2\\theta}{g}$ — maximum at $\\theta = 45°$\n\nLet's work through this step by step. Can you identify what $v_0$ and $\\theta$ represent physically?`,
          followUpQuestions: [
            'Why does the horizontal velocity remain constant while the vertical velocity changes?',
            'At what angle does the projectile achieve maximum range, and why?',
            'What is the velocity of the projectile at its highest point?'
          ]
        },
        {
          minMatches: 1,
          keywords: ['carnot', 'heat engine', 'entropy', 'thermodynamics', 'second law of thermodynamics', 'adiabatic'],
          reply: `### ⚙️ Exploring Heat Engine Efficiency & The Carnot Limit\n\nIn any thermodynamic heat engine, efficiency $\\eta$ measures how effectively heat input ($Q_H$) is converted into mechanical work:\n\n$$\\eta = \\frac{W}{Q_H} = 1 - \\frac{Q_C}{Q_H}$$\n\nFor a reversible **Carnot cycle**:\n$$\\eta_{\\text{Carnot}} = 1 - \\frac{T_C}{T_H}$$\n\n#### 💡 Key Concept:\nWhy can a real heat engine never reach $100\\%$ efficiency? For $\\eta = 1$, either $Q_C = 0$ (violating the Kelvin-Planck statement) or $T_C = 0\\text{ K}$ (unreachable by the Third Law).`,
          followUpQuestions: [
            'If an engine operates between 600 K and 300 K, what is its maximum possible efficiency?',
            'Why is internal energy a state function while Work and Heat depend on the path?'
          ]
        },
        {
          minMatches: 1,
          keywords: ['pointer', 'malloc', 'segfault', 'dereference', 'linked list', 'c programming', 'memory allocation', 'heap'],
          reply: `### 🧠 Pointers & Memory Architecture in C\n\nIn C, variables are stored at specific memory addresses. A **pointer** holds the memory address of another variable.\n\n\`\`\`c\nint val = 42;\nint *ptr = &val; // ptr holds the address of val\n*ptr = 100;      // Directly modifies memory at that address\n\`\`\`\n\n#### 🔍 Critical Distinction:\nPointer arithmetic (ptr + 1) advances by sizeof(*ptr) bytes, not 1 byte. For an int, that's 4 bytes.`,
          followUpQuestions: [
            'What happens in memory when you access an array as arr[i] versus *(arr + i)?',
            'Why does passing a pointer to a function allow modifying the caller\'s original variables?'
          ]
        },
        {
          minMatches: 1,
          keywords: ['lagrange', 'partial derivative', 'gradient', 'extrema', 'multivariable calculus', 'constrained optimization'],
          reply: `### 📐 Constrained Optimization via Lagrange Multipliers\n\nWhen maximizing or minimizing $f(x, y)$ along a constraint $g(x, y) = c$, the optimal point occurs where the **level curves of $f$ are tangent to $g = c$**.\n\n$$\\nabla f(x, y) = \\lambda \\nabla g(x, y)$$\n\nCoupled with $g(x, y) = c$, this gives a system of equations for the critical points.`,
          followUpQuestions: [
            'Why would a point where the level curve crosses the constraint curve NOT be an extremum?',
            'How do you set up the partial derivative equations from the Lagrangian?'
          ]
        },
        {
          minMatches: 2, // Require 2+ matches to avoid false positives with generic words
          keywords: ['nda', 'ssb', 'national defence academy', 'officer like qualities', 'olq', 'upsc nda', 'services selection board'],
          reply: `### 🎖️ Understanding the NDA Selection Process\n\nThe NDA Selection Process follows a structured multi-stage pipeline:\n\n1. **Written Exam** (UPSC): Tests Mathematics and General Ability\n2. **SSB Interview** (5 Days): Psychological tests, Group Testing, Personal Interview to assess Officer-Like Qualities (OLQs)\n3. **Medical Examination**: Comprehensive fitness and health evaluation\n\n**Executive Summary** covers the high-level pipeline overview.\n**Training Architecture** refers to how cadets are trained at NDA (Khadakwasla).\n\nWhich specific area did you find challenging — the **exam structure**, **SSB evaluation criteria**, or **post-selection training flow**?`,
          followUpQuestions: [
            'Can you describe what Officer-Like Qualities (OLQs) the SSB evaluates?',
            'What is the difference between the screening test and the main SSB 5-day process?',
            'How does the training architecture at NDA differ from other military academies?'
          ]
        },
        {
          minMatches: 2, // Require 2+ to avoid false positives with "force" or "motion" alone
          keywords: ['friction', 'newton', 'free body diagram', 'inertia', 'net force', 'normal force', 'inclined plane', 'static friction', 'kinetic friction'],
          reply: `### 🔬 Newton's Laws & Friction Analysis\n\nNewton's Laws form the foundation of classical mechanics:\n\n1. **First Law (Inertia)**: An object at rest stays at rest unless acted on by a net external force.\n2. **Second Law**: $\\vec{F}_{\\text{net}} = m\\vec{a}$\n3. **Third Law**: For every action, there is an equal and opposite reaction.\n\n**Friction** resists relative motion:\n- Static: $f_s \\leq \\mu_s N$ (self-adjusting up to max)\n- Kinetic: $f_k = \\mu_k N$ (constant)`,
          followUpQuestions: [
            'Why is the coefficient of static friction typically greater than kinetic friction?',
            'How would you draw a free-body diagram for an object on an inclined plane with friction?'
          ]
        },
        {
          minMatches: 1,
          keywords: ['derivative', 'integration', 'limit', 'differentiation', 'chain rule', 'product rule', 'fundamental theorem'],
          reply: `### 📊 Calculus: Derivatives & Integration\n\nThe derivative measures the instantaneous rate of change:\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n\n**Key Rules:**\n- Power Rule: $\\frac{d}{dx}x^n = nx^{n-1}$\n- Chain Rule: $\\frac{d}{dx}f(g(x)) = f'(g(x)) \\cdot g'(x)$\n- Product Rule: $(fg)' = f'g + fg'$\n\nThe **Fundamental Theorem of Calculus** connects differentiation and integration:\n$$\\int_a^b f(x)\\,dx = F(b) - F(a)$$\n\nWhat specific aspect of calculus are you working on?`,
          followUpQuestions: [
            'Can you state the chain rule in your own words?',
            'What is the geometric meaning of the definite integral?'
          ]
        }
      ];

      // Find BEST matching corpus entry (most keyword hits, above its threshold)
      let bestMatch: any = null;
      let bestScore = 0;
      for (const item of KNOWLEDGE_CORPUS) {
        const score = countMatches(item.keywords);
        if (score >= (item.minMatches || 2) && score > bestScore) {
          bestScore = score;
          bestMatch = item;
        }
      }

      if (bestMatch) {
        res.status(200).json({
          reply: bestMatch.reply,
          followUpQuestions: bestMatch.followUpQuestions,
          recommendedResources: []
        });
        return;
      }

      // Smart generic fallback: extract topic from message and create contextual response
      const detectedTopic = topic || 'this concept';
      res.status(200).json({
        reply: `### 💡 Let's Break Down: **${detectedTopic}**\n\nGreat question! Let's approach this systematically from first principles:\n\n1. **Identify the Core Concept**: What is the fundamental law, equation, or definition at play here?\n2. **Break Down the Knowns**: What variables or parameters are given? What constraints apply?\n3. **Map the Relationships**: How do the pieces connect through equations or logical reasoning?\n4. **Check Your Understanding**: Can you restate the key idea in your own words?\n\nI noticed you're working on **${detectedTopic}**. Let me help you build a deep understanding rather than just memorizing answers.\n\n*Tell me which specific part is confusing — is it the underlying concept, the mathematical formulation, or how to apply it to problems?* 🚀`,
        followUpQuestions: [
          `What is the fundamental equation or definition governing ${detectedTopic}?`,
          'Can you identify what variables are given and what you need to find?',
          'What happens at the boundary conditions or extreme cases?'
        ],
        recommendedResources: [
          {
            id: 'res-gen-1',
            title: 'EduSync Study Resources',
            type: 'book',
            provider: 'University Coursepack',
            duration: 'Core Modules',
            url: '#',
            description: 'Comprehensive reference with step-by-step conceptual walkthroughs.'
          }
        ]
      });
      return;
    }

    res.status(200).json({ status: 'ok', time: new Date().toISOString(), path });
  } catch (err: any) {
    console.error('[Serverless Error]', err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
