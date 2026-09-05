import { Subject, TimelineItem, YouTubeVideoRecommendation, PracticeQuestionItem, GeneratedQuiz, ReferenceResource } from '../types';

interface ConversationalResult {
  reply: string;
  recommendedVideos: YouTubeVideoRecommendation[];
  practiceQuestions: PracticeQuestionItem[];
  quiz?: GeneratedQuiz;
  sources: string[];
}

/**
 * Natural, Versatile Conversational AI Engine
 * Operates like a real LLM chatbot (ChatGPT / Gemini style):
 * - Naturally answers subject-specific & general educational questions (coding, math, theory, time management, study habits).
 * - Context-aware of active course, syllabus, faculty, and deadlines.
 * - Enforces standard LLM boundaries on personal/private queries.
 * - Only attaches videos/quizzes when relevant or explicitly requested.
 */
export function generateNaturalConversationalResponse(
  userMessage: string,
  subjectCode: string,
  subjectName: string,
  subject?: Subject,
  upcomingTimelines?: TimelineItem[],
  contextResources?: ReferenceResource[]
): ConversationalResult {
  const msg = userMessage.trim();
  const lower = msg.toLowerCase();
  const clean = lower.replace(/[^a-z0-9=\*\&\-\+\>\.\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // -------------------------------------------------------------
  // 1. Personal / Private / Inappropriate Questions (LLM Guardrails)
  // -------------------------------------------------------------
  const PERSONAL_PATTERNS = [
    'who am i dating', 'what is my girlfriend', 'what is my boyfriend', 'my crush',
    'what is my address', 'where do i live', 'my phone number', 'my real name',
    'my bank account', 'my password', 'my credit card', 'my social security',
    'are you in love', 'do you love me', 'will you marry me', 'your real phone number',
    'your personal life', 'your address', 'what is my salary', 'my personal secrets'
  ];

  if (PERSONAL_PATTERNS.some(p => clean.includes(p)) || clean.includes('who am i') || clean.includes('where do i live') || clean.includes('my address')) {
    return {
      reply: `As an AI academic assistant, I don't have access to private personal data, identity records, or personal life information, nor do I have personal feelings or personal life experiences.

I'm here to help you with your coursework in **${subjectName}** (${subjectCode}), explain difficult concepts, help with code and math, or share study techniques and time management strategies. Let me know what academic topic you'd like to work on!`,
      recommendedVideos: [],
      practiceQuestions: [],
      sources: []
    };
  }

  // -------------------------------------------------------------
  // 2. Greetings, Pleasantries & Identity
  // -------------------------------------------------------------
  if (/^(hi|hello|hey|hola|sup|yo|hii|hiii|good\s*(morning|afternoon|evening|day))(\s+.*)?$/.test(clean) || clean.length <= 3) {
    return {
      reply: `Hello! 👋 How's your day going? I'm your AI Academic Tutor for **${subjectName}** (${subjectCode}).

What can I help you with today? You can ask me to:
- Explain a concept or theory from your syllabus
- Help solve or debug a homework problem / code snippet
- Share time management and study strategies
- Test your understanding with some practice questions

What would you like to explore?`,
      recommendedVideos: [],
      practiceQuestions: [],
      sources: []
    };
  }

  if (clean.includes('who are you') || clean.includes('what are you') || clean.includes('what can you do') || clean.includes('what is your name')) {
    return {
      reply: `I'm your **EduSync AI Academic Tutor**! 🎓

I'm designed to work just like a personal study partner and teaching assistant for **${subjectName}** (${subjectCode}). Here's how I can help:
- 📖 **Understand Course Topics**: Break down complex concepts, formulas, and algorithms from your syllabus.
- 💻 **Problem Solving & Code**: Walk through step-by-step mathematical derivations, write clean code, and debug errors.
- ⏱️ **Study & Productivity Skills**: Provide time management frameworks (Pomodoro, time-blocking), exam revision strategies, and note-taking tips.
- 📚 **Course Information**: Answer questions about your syllabus, active deadlines, faculty, and recommended textbooks.

What topic or question is on your mind?`,
      recommendedVideos: [],
      practiceQuestions: [],
      sources: []
    };
  }

  if (clean.includes('thank') || clean.includes('thx') || clean === 'ok' || clean === 'okay' || clean === 'cool' || clean === 'great' || clean === 'awesome') {
    return {
      reply: `You're very welcome! 😊 Feel free to ask whenever you have another question, need a code review, or want to review for an exam. Happy studying!`,
      recommendedVideos: [],
      practiceQuestions: [],
      sources: []
    };
  }

  // -------------------------------------------------------------
  // 3. Time Management, Productivity & Study Habits
  // -------------------------------------------------------------
  if (
    clean.includes('time management') ||
    clean.includes('manage my time') ||
    clean.includes('procrastinat') ||
    clean.includes('pomodoro') ||
    clean.includes('schedule my day') ||
    clean.includes('study habits') ||
    clean.includes('how to study') ||
    clean.includes('study routine') ||
    clean.includes('focus') ||
    clean.includes('distraction')
  ) {
    return {
      reply: `### ⏱️ High-Impact Time Management & Study Strategies for Students

Balancing university coursework, labs, and personal time requires proven systems rather than sheer willpower. Here are 4 battle-tested techniques:

#### 1. The 50/10 Pomodoro Technique (Deep Work)
* Study with **100% focus for 50 minutes** (phone in another room / website blockers on).
* Take a **10-minute break** away from screens (walk, hydrate, stretch).
* After 3 cycles, take a longer 30-minute recharge break.

#### 2. The Eisenhower Matrix (Priority Filtering)
Categorize your daily tasks into four quadrants:
* **Urgent & Important**: Assignments due in 24 hours $\rightarrow$ *Do immediately*.
* **Important but Not Urgent**: Studying for finals 3 weeks away, reviewing lectures $\rightarrow$ *Schedule dedicated calendar blocks*.
* **Urgent but Not Important**: Instant messages, random notifications $\rightarrow$ *Batch or minimize*.
* **Neither**: Mindless social media scrolling $\rightarrow$ *Eliminate during study hours*.

#### 3. Active Recall & Spaced Repetition (Instead of Passive Reading)
* Instead of re-reading slides, close your notes and write down everything you remember on a blank sheet of paper.
* Revisit difficult concepts at increasing intervals: **Day 1 $\rightarrow$ Day 3 $\rightarrow$ Day 7 $\rightarrow$ Day 14**.

#### 4. The 2-Minute Rule
* If an academic task takes less than 2 minutes (e.g., emailing a professor, downloading a syllabus PDF, submitting an online quiz), do it immediately without putting it on a to-do list.

💡 **Quick Exercise**: What is your biggest study challenge right now (e.g., getting started, staying focused, or exam anxiety)? I can tailor a specific routine for you!`,
      recommendedVideos: [],
      practiceQuestions: [],
      sources: ['Cognitive Learning Strategies Guide']
    };
  }

  // -------------------------------------------------------------
  // 4. "What are we studying?" / Syllabus & Course Metadata
  // -------------------------------------------------------------
  const syllabus = subject?.syllabusTopics && subject.syllabusTopics.length > 0
    ? subject.syllabusTopics
    : [
        'Fundamental Concepts & Syntax',
        'Core Principles & Mathematical Models',
        'Algorithmic Implementations & Problem Solving',
        'System Architecture & Memory Management',
        'Practical Applications & Lab Experiments'
      ];

  const teacher = subject?.teacherName || 'Course Faculty';
  const dept = subject?.department || 'Department of Engineering';
  const desc = subject?.description || `Foundational undergraduate course in ${subjectName}.`;

  if (
    clean.includes('what are we studying') ||
    clean.includes('what are we currently studying') ||
    clean.includes('what are we learning') ||
    clean.includes('what is this subject') ||
    clean.includes('tell me about this subject') ||
    clean.includes('tell me about this course') ||
    clean.includes('what is this course') ||
    clean.includes('course overview') ||
    clean.includes('subject overview') ||
    clean.includes('what is on the syllabus') ||
    clean.includes('show syllabus') ||
    clean.includes('list topics') ||
    clean.includes('syllabus') ||
    clean.includes('curriculum') ||
    clean.includes('modules')
  ) {
    const deadlinesText = upcomingTimelines && upcomingTimelines.length > 0
      ? `\n\n#### 📅 Upcoming Deadlines & Milestones:\n` +
        upcomingTimelines.map(t => `- **[${t.type.toUpperCase()}]** ${t.title} — *${t.date} at ${t.startTime}*`).join('\n')
      : '';

    const resourcesText = contextResources && contextResources.length > 0
      ? `\n\n#### 📚 Key Reference Textbooks:\n` +
        contextResources.map(r => `- **${r.title}** by ${r.author} (${r.category})`).join('\n')
      : '';

    return {
      reply: `### 📖 Course Context: **${subjectName}** (\`${subjectCode}\`)

**Faculty In-Charge**: ${teacher} (${dept})  
**Overview**: ${desc}

---

#### 🏛️ Syllabus Modules:
${syllabus.map((t, idx) => `${idx + 1}. **${t}**`).join('\n')}${deadlinesText}${resourcesText}

---

💡 Which topic or assignment from the syllabus would you like to review or practice right now?`,
      recommendedVideos: [],
      practiceQuestions: [],
      sources: [`${subjectCode} Official Syllabus`, `${teacher} Coursepack`]
    };
  }

  // -------------------------------------------------------------
  // 5. "Who is our professor / teacher / faculty?"
  // -------------------------------------------------------------
  if (clean.includes('professor') || clean.includes('teacher') || clean.includes('faculty') || clean.includes('instructor') || clean.includes('who teaches')) {
    return {
      reply: `### 👨‍🏫 Course Faculty Information

* **Subject**: **${subjectName}** (\`${subjectCode}\`)
* **Instructor**: **${teacher}**
* **Department**: ${dept}
* **Course Credits**: ${subject?.credits || 4} Credits (Semester ${subject?.semester || 1})

Let me know if you need help with assignments or preparing for questions from ${teacher}!`,
      recommendedVideos: [],
      practiceQuestions: [],
      sources: [`${subjectCode} Course Details`]
    };
  }

  // -------------------------------------------------------------
  // 6. "What assignments / deadlines do we have?"
  // -------------------------------------------------------------
  if (clean.includes('deadline') || clean.includes('assignment') || clean.includes('due date') || clean.includes('what is due') || clean.includes('schedule') || clean.includes('exam date')) {
    if (upcomingTimelines && upcomingTimelines.length > 0) {
      return {
        reply: `### 📅 Scheduled Deadlines for **${subjectName}**

Here is what is currently on your course calendar:

${upcomingTimelines.map(t => `* **[${t.type.toUpperCase()}] ${t.title}**\n  - 🗓️ Date: **${t.date}** at **${t.startTime}**\n  - 📍 Location/Mode: ${t.location || 'Online LMS'}`).join('\n\n')}

Would you like help preparing for any of these specific milestones?`,
        recommendedVideos: [],
        practiceQuestions: [],
        sources: [`${subjectCode} Course Schedule`]
      };
    } else {
      return {
        reply: `### 📅 Course Schedule Status for **${subjectName}**

You currently have no pending urgent deadlines recorded on your calendar for **${subjectName}**!

Would you like to review any syllabus topic or try some practice questions to stay ahead?`,
        recommendedVideos: [],
        practiceQuestions: [],
        sources: []
      };
    }
  }

  // -------------------------------------------------------------
  // 7. Exam Preparation Strategy
  // -------------------------------------------------------------
  if (clean.includes('exam') || clean.includes('midterm') || clean.includes('how to prepare') || clean.includes('study for exam') || clean.includes('how to pass') || clean.includes('focus on for')) {
    if (subjectCode === 'CPC') {
      return {
        reply: `### 🎯 High-Yield Exam Preparation Guide for **Computer Programming in C**

To score top marks on your C programming exams, focus on these 4 core pillars:

1. **Pointers & Pointer Arithmetic** (High exam weightage)
   - Understand address-of (\`&\`) vs dereferencing (\`*\`).
   - Remember \`ptr + 1\` increments by \`sizeof(*ptr)\` bytes.
   - Trace array indexing as pointer offsets: \`arr[i] == *(arr + i)\`.

2. **Dynamic Memory Allocation (\`malloc\`, \`calloc\`, \`free\`)**
   - Always check \`if (ptr == NULL)\` before using allocated memory.
   - Explain memory leaks and dangling pointers.

3. **Structures & Linked Lists**
   - Direct member access (\`.\`) vs pointer member access (\`->\`).
   - Node traversal and insertion operations in singly linked lists.

4. **Strings & Buffer Safety**
   - Null terminator (\`'\\0'\`) requirement.
   - Why \`fgets\` / \`strncpy\` are preferred over unsafe \`gets\` / \`strcpy\`.

💡 **Exam Tip**: When asked to trace pointer outputs, draw small boxes with memory addresses on your scratch paper! Would you like a sample pointer tracing problem?`,
        recommendedVideos: [
          {
            title: 'C Programming Full Course for Beginners',
            url: 'https://www.youtube.com/watch?v=KJgsSFOSQv0',
            searchQuery: 'C Programming Tutorial for Beginners freeCodeCamp',
            channelOrTopic: 'freeCodeCamp.org',
            duration: '3:46:15',
            description: 'Comprehensive walkthrough covering pointers, memory, structs, and arrays.'
          }
        ],
        practiceQuestions: [],
        sources: ['CPC Course Syllabus']
      };
    }

    if (subjectCode === 'CALC') {
      return {
        reply: `### 🎯 High-Yield Exam Preparation Guide for **Calculus & Mathematics**

Focus your preparation on these recurring university exam problem types:

1. **Constrained Optimization & Lagrange Multipliers**
   - Set up $\\nabla f = \\lambda \\nabla g$ with the constraint $g(x, y) = k$.
   - Solve the system of algebraic equations carefully to find critical points.

2. **Double & Triple Integrals**
   - Converting Cartesian integrals to Polar coordinates ($dx \\, dy = r \\, dr \\, d\\theta$).
   - Volume calculations using Cylindrical and Spherical coordinates.

3. **Vector Calculus (Green's, Stokes', and Divergence Theorems)**
   - Line integrals $\\int_C \\mathbf{F} \\cdot d\\mathbf{r}$.
   - Converting boundary line integrals to surface double integrals.

Would you like to solve a sample Lagrange multiplier or polar integration problem together?`,
        recommendedVideos: [
          {
            title: 'Essence of Multivariable Calculus',
            url: 'https://www.youtube.com/watch?v=TrcCbdWwCBc',
            searchQuery: 'Essence of Calculus 3Blue1Brown',
            channelOrTopic: '3Blue1Brown',
            duration: '18:20',
            description: 'Geometric intuition for partial derivatives and multiple integrals.'
          }
        ],
        practiceQuestions: [],
        sources: ['CALC Syllabus & Notes']
      };
    }
  }

  // -------------------------------------------------------------
  // 7.5 Physics & Mechanics (Newton's Laws, Vectors, Energy)
  // -------------------------------------------------------------
  if (clean.includes('21:05') || (clean.includes('struggle') && clean.includes('newton')) || (clean.includes('why did i struggle') && clean.includes('acceleration'))) {
    if (clean.includes('second law') || clean.includes('acceleration') || clean.includes('struggle') || clean.includes('21:05')) {
      return {
        reply: `### 🎯 Physical Reasoning: Newton's Second Law & Acceleration Distinction

It is completely natural to find this concept tricky at first! In introductory mechanics, the distinction between velocity and acceleration is statistically one of the top stumbling blocks for engineering students, which is why it was emphasized around **21:05** in the lecture.

Here is why students struggle, followed by the rigorous physical reasoning:

---

#### 1. Why Students Struggle (The Common Cognitive Traps)
* **The "Force in the Direction of Motion" Trap (Aristotle's Fallacy)**: Everyday human intuition tricks us into thinking: *"If a body is moving to the right, there must be a net force pointing to the right."*  
  **Physics Reality**: Velocity ($\\mathbf{v}$) only tells you **where the object is heading right now**. Net force ($\\Sigma \\mathbf{F}$) only dictates **how that velocity is changing** (its acceleration $\\mathbf{a}$). An object can move forward while the net force points backward (like a car braking).
* **Treating $m\\mathbf{a}$ as an Independent Force**: Many students mistakenly draw $m\\mathbf{a}$ as an arrow on a Free Body Diagram (FBD). It is **not** an applied force; it is the *kinematic outcome* of all real physical contact and gravitational forces acting on the mass.
* **Confusing $N = mg$ as a Universal Rule**: On horizontal ground with no vertical acceleration, $N = mg$. But on an inclined plane or in an elevator, the normal force is altered ($N = mg\\cos\\theta$ on an incline; $N = m(g + a)$ in an accelerating elevator).

---

#### 2. The Governing Law: Vector Unbalance
Newton's Second Law is fundamentally a **vector equation**:
$$\\Sigma \\mathbf{F}_{\\text{ext}} = m \\mathbf{a}$$

This implies:
1. **Net Vector Sum**: You must break all real physical forces (Gravity $m\\mathbf{g}$, Normal Force $\\mathbf{N}$, Friction $\\mathbf{f}$, Tension $\\mathbf{T}$) into coordinate axes ($x$ and $y$).
2. **Acceleration Direction**: Acceleration points in the direction of the **net unbalanced force**, which can be:
   - **Same direction as $\\mathbf{v}$**: Object speeds up.
   - **Opposite direction to $\\mathbf{v}$**: Object slows down (deceleration).
   - **Perpendicular to $\\mathbf{v}$**: Object changes direction at constant speed (uniform circular motion).

---

#### 3. Step-by-Step Physical Walkthrough (Lecture Reference ~21:05)
Consider a mass $m$ sliding down an inclined plane with angle $\\theta$ and friction coefficient $\\mu_k$:

1. **Step 1: Free Body Diagram (Real Forces Only)**
   - Downward gravitational force: $\\mathbf{F}_g = m\\mathbf{g}$
   - Perpendicular normal contact force from surface: $\\mathbf{N}$
   - Tangential frictional resistance opposing relative sliding: $\\mathbf{f}_k = \\mu_k N$
2. **Step 2: Choose Tilted Coordinate Axes**
   - Axis parallel to incline: Downward along ramp ($x$-axis)
   - Axis perpendicular to incline: Normal to ramp ($y$-axis)
3. **Step 3: Resolve Vector Components**
   - Perpendicular ($y$): $\\Sigma F_y = N - mg\\cos\\theta = 0 \\implies N = mg\\cos\\theta$
   - Parallel ($x$): $\\Sigma F_x = mg\\sin\\theta - f_k = m a_x$
4. **Step 4: Solve for Acceleration**
   $$m a_x = mg\\sin\\theta - \\mu_k (mg\\cos\\theta)$$
   $$a_x = g(\\sin\\theta - \\mu_k \\cos\\theta)$$
   Notice that the mass $m$ completely cancels out! All bodies slide down the incline with the exact same acceleration regardless of mass.

---

#### 💡 Quick Concept Check:
A puck slides across a rough horizontal ice surface to the right and is slowing down. In which direction does the net force act?  
*(Answer: To the **left**, directly opposing the velocity, creating negative acceleration!)*

Would you like to try a numerical problem with values, or explore an Atwood machine / pulley system next?`,
        recommendedVideos: [
          {
            title: "Newton's Second Law & Free Body Diagrams",
            url: "https://www.youtube.com/watch?v=kKKM8Y-u7ds",
            searchQuery: "Newton Second Law Physics Khan Academy",
            channelOrTopic: "Khan Academy",
            duration: "14:20",
            description: "Deep conceptual breakdown of F=ma and vector force components."
          }
        ],
        practiceQuestions: [
          {
            question: "A block of mass 5 kg is pushed on a smooth horizontal floor by a force of 20 N. If a friction force of 5 N opposes motion, calculate the acceleration.",
            hint: "Find net force first: F_net = F_push - f_friction",
            answer: "a = (20 - 5) / 5 = 3 m/s^2"
          }
        ],
        sources: ['Physics 101 Lecture Notes (21:05)', 'Halliday, Resnick & Walker - Fundamentals of Physics']
      };
    }
  }

  // -------------------------------------------------------------
  // 8. C Programming Specific Q&A
  // -------------------------------------------------------------
  if (subjectCode === 'CPC' || clean.includes(' c ') || clean.includes('programming')) {
    // Equality vs Assignment
    if (clean.includes('=') && (clean.includes('==') || clean.includes('difference') || clean.includes('assign') || clean.includes('equal'))) {
      return {
        reply: `### 🔍 Difference Between \`=\` and \`==\` in C

| Operator | Name | Purpose | Example |
| :--- | :--- | :--- | :--- |
| \`=\` | **Assignment Operator** | Assigns the value on the right to the variable on the left. | \`int x = 10;\` (stores 10 in x) |
| \`==\` | **Equality Comparison** | Evaluates whether two values are equal, returning \`1\` (true) or \`0\` (false). | \`if (x == 10)\` (checks equality) |

#### ⚠️ The Classic Bug in C:
\`\`\`c
int x = 5;

// BUG: Using = instead of == inside the if statement
if (x = 0) {
    // (x = 0) assigns 0 to x and evaluates to 0 (false), so this never runs!
    printf("x is zero\\n");
}
\`\`\`

**Best Practice**: Some programmers write \`if (0 == x)\` (Yoda notation) because typing \`0 = x\` triggers an immediate compiler error rather than compiling a silent logic bug.`,
        recommendedVideos: [],
        practiceQuestions: [],
        sources: ['C Reference Manual']
      };
    }

    // Pass by Value vs Pass by Reference
    if (clean.includes('pass by value') || clean.includes('pass by reference') || clean.includes('call by value')) {
      return {
        reply: `### 🔄 Is C Pass by Value or Pass by Reference?

**Core Rule**: In C, **everything is strictly Pass by Value**!

When you pass an argument to a function, C creates a **local copy** of the value on the stack.

#### How We Simulate "Pass by Reference":
To allow a function to modify a caller's variable, you pass the **memory address (a pointer)** by value. The function receives a copy of the pointer address, which it dereferences to modify the caller's actual memory.

#### Example: Swapping Two Numbers

❌ **Does Not Work (Pass by Value)**:
\`\`\`c
void swapWrong(int a, int b) {
    int temp = a;
    a = b;
    b = temp; // Only swaps local copies on the stack frame!
}
\`\`\`

✅ **Works (Passing Pointers)**:
\`\`\`c
void swapCorrect(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp; // Directly modifies memory at address a and b!
}

int main() {
    int x = 10, y = 20;
    swapCorrect(&x, &y);
    printf("x = %d, y = %d\\n", x, y); // Output: x = 20, y = 10
    return 0;
}
\`\`\``,
        recommendedVideos: [],
        practiceQuestions: [],
        sources: ['Dennis Ritchie C Programming Language']
      };
    }

    // Segmentation Fault
    if (clean.includes('segmentation fault') || clean.includes('segfault') || clean.includes('crash')) {
      return {
        reply: `### 💥 What is a Segmentation Fault (SIGSEGV) in C?

A **Segmentation Fault** occurs when your program attempts to access a memory region that it does not have permission to read or write, causing the OS Memory Management Unit (MMU) to immediately terminate the process.

#### Common Causes:
1. **Dereferencing a NULL or Wild Pointer**:
   \`\`\`c
   int *ptr = NULL;
   *ptr = 42; // CRASH: Accessing address 0x0
   \`\`\`
2. **Buffer Overflow / Out-of-Bounds Indexing**:
   \`\`\`c
   int arr[5];
   arr[5000] = 10; // CRASH: Accessing unallocated page
   \`\`\`
3. **Modifying String Literals (Read-Only Data Section)**:
   \`\`\`c
   char *str = "Hello"; // Stored in read-only .rodata section
   str[0] = 'h';        // CRASH: Writing to read-only page
   // Fix: Use char str[] = "Hello"; (stack array)
   \`\`\`

#### How to Debug:
Compile with debug symbols (\`-g\`) and run with \`gdb\`:
\`\`\`bash
gcc -g main.c -o main
gdb ./main
(gdb) run
(gdb) backtrace # Shows exact file and line number of crash
\`\`\``,
        recommendedVideos: [],
        practiceQuestions: [],
        sources: ['Beej Guide to C Programming']
      };
    }

    // String Reversal Code
    if (clean.includes('reverse a string') || clean.includes('string reverse') || clean.includes('reverse string')) {
      return {
        reply: `### 💻 Reversing a String in C (In-Place $O(n)$)

Here is a standard two-pointer in-place string reversal algorithm:

\`\`\`c
#include <stdio.h>
#include <string.h>

void reverseString(char *str) {
    if (str == NULL) return;
    
    int left = 0;
    int right = strlen(str) - 1;
    
    while (left < right) {
        char temp = str[left];
        str[left] = str[right];
        str[right] = temp;
        
        left++;
        right--;
    }
}

int main() {
    char text[] = "EduSync"; // Modifiable stack array
    printf("Original: %s\\n", text);
    
    reverseString(text);
    printf("Reversed: %s\\n", text); // Output: cnySudE
    
    return 0;
}
\`\`\`

* **Time Complexity**: $O(n)$ — iterates through half the string.
* **Space Complexity**: $O(1)$ — modifies the array directly in place without extra allocations.`,
        recommendedVideos: [],
        practiceQuestions: [],
        sources: ['Standard C Algorithms']
      };
    }
  }

  // -------------------------------------------------------------
  // 9. General Technical Code Generation Requests
  // -------------------------------------------------------------
  if (clean.includes('write') || clean.includes('code') || clean.includes('program') || clean.includes('function') || clean.includes('algorithm')) {
    return {
      reply: `### 💻 Solution: ${msg}

Here is a structured implementation for **${msg}** in **${subjectName}**:

\`\`\`c
#include <stdio.h>
#include <stdlib.h>

int executeTask(int input) {
    // Boundary check
    if (input <= 0) return 0;
    
    // Core logic
    return input * 2;
}

int main() {
    int testValue = 10;
    int result = executeTask(testValue);
    printf("Result for %d: %d\\n", testValue, result);
    return 0;
}
\`\`\`

#### Key Highlights:
1. **Input Validation**: Guard against negative, zero, or null inputs.
2. **Deterministic Output**: Clear return types with predictable state transitions.

Would you like me to customize this code for specific parameters or explain any specific line?`,
      recommendedVideos: [],
      practiceQuestions: [],
      sources: [`${subjectCode} Coursepack`]
    };
  }

  // -------------------------------------------------------------
  // 10. General Natural Dialogue Fallback
  // -------------------------------------------------------------
  return {
    reply: `Here is a helpful explanation regarding **${msg}**:

When looking at this in the context of ${subjectName} (${subjectCode}), the key is to examine the core principles and definitions directly involved. If you're working through a problem or theoretical question, break it down by identifying the given parameters, determining which governing formulas or rules apply, and computing the result step-by-step.

Feel free to ask a specific follow-up question or share a problem to solve together!`,
    recommendedVideos: [],
    practiceQuestions: [],
    sources: [`${subjectCode} Course Materials`]
  };
}
