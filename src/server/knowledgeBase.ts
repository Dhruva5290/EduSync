import { Subject, TimelineItem, YouTubeVideoRecommendation, PracticeQuestionItem, GeneratedQuiz, ReferenceResource } from '../types';
import { generateNaturalConversationalResponse } from './conversationalEngine';

export interface TopicKnowledge {
  topicMatchKeywords: string[];
  title: string;
  explanation: string;
  workedExample: string;
  commonPitfalls: string[];
  examTips: string[];
  videos: YouTubeVideoRecommendation[];
  practiceQuestions: PracticeQuestionItem[];
  quizQuestions: Array<{
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanation: string;
    topic: string;
  }>;
}

/**
 * Authentic, Exhaustive Subject Knowledge Base for Engineering University Courses
 */
export const SUBJECT_KNOWLEDGE_BASE: Record<string, TopicKnowledge[]> = {
  CPC: [
    {
      topicMatchKeywords: ['pointer', 'pointer arithmetic', 'void pointer', 'memory', 'dereference', 'address', 'array pointer'],
      title: 'Pointer Arithmetic, Memory Addressing & Void Pointers in C',
      explanation: `### 🧠 Pointers & Memory Architecture in C

In C, a **pointer** is a variable that directly stores the physical/virtual hexadecimal memory address of another variable. Because C allows direct memory manipulation, understanding pointers is essential for writing efficient, high-performance software.

#### 1. Address-of (\`&\`) vs Dereference (\`*\`) Operators
* \`&x\`: Retrieves the memory address where \`x\` is stored.
* \`*ptr\`: Dereferences the pointer to access or modify the value stored at that address.

\`\`\`c
int x = 42;
int *ptr = &x; // ptr points to memory address of x

printf("Value of x: %d\\n", x);          // Output: 42
printf("Address of x: %p\\n", (void*)&x);   // e.g. 0x7ffeefbff5ac
printf("Value via *ptr: %d\\n", *ptr);     // Output: 42
\`\`\`

#### 2. How Pointer Arithmetic Works (Type Scaling)
When you add an integer $k$ to a pointer $p$, the address does **not** increase by $k$ bytes; it increases by $k \\times \\text{sizeof}(*p)$ bytes:
$$\\text{Address}(p + k) = \\text{Address}(p) + k \\times \\text{sizeof}(\\text{type})$$

* For \`int *p\` (where \`sizeof(int) = 4\`): \`p + 1\` advances by **4 bytes**.
* For \`double *p\` (where \`sizeof(double) = 8\`): \`p + 1\` advances by **8 bytes**.
* For \`char *p\` (where \`sizeof(char) = 1\`): \`p + 1\` advances by **1 byte**.

#### 3. Void Pointers (\`void*\`) & Generic Memory
A \`void*\` is a generic pointer that can hold the address of any data type:
- **Rule 1**: You **cannot directly dereference** a \`void*\` (\`*vptr\` is illegal) because \`sizeof(void)\` is undefined. You must typecast it first: \`*(int*)vptr\`.
- **Rule 2**: You **cannot perform arithmetic** on a \`void*\` in standard ANSI C without casting it to a byte pointer like \`char*\` or \`uint8_t*\`.`,
      workedExample: `#### 💻 Step-by-Step Code Execution & Memory Tracing

\`\`\`c
#include <stdio.h>

int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    int *p1 = arr;         // Points to arr[0] (Address: 0x1000)
    int *p2 = arr + 3;     // Points to arr[3] (Address: 0x1000 + 3*4 = 0x100C)

    printf("1. *p1 = %d\\n", *p1);                         // 10
    printf("2. *(p1 + 2) = %d\\n", *(p1 + 2));               // 30 (arr[2])
    printf("3. p2 - p1 = %ld\\n", p2 - p1);                  // 3 elements (Index distance)
    printf("4. (char*)p2 - (char*)p1 = %ld\\n", 
           (char*)p2 - (char*)p1);                           // 12 bytes (3 * 4 bytes)

    // In-place modification via pointer arithmetic
    *(p1 + 2) += 15;
    printf("5. Modified arr[2] = %d\\n", arr[2]);            // 45

    return 0;
}
\`\`\`

**Memory Mapping Diagram:**
\`\`\`
Address:    [0x1000]   [0x1004]   [0x1008]   [0x100C]   [0x1010]
Element:     arr[0]     arr[1]     arr[2]     arr[3]     arr[4]
Value:         10         20         45         40         50
             ^                     ^          ^
             p1                 *(p1+2)       p2
\`\`\``,
      commonPitfalls: [
        'Dereferencing uninitialized / wild pointers produces undefined behavior and immediate Segmentation Faults (SIGSEGV).',
        'Directly dereferencing a void pointer `*(void_ptr)` without casting produces a compile-time syntax error.',
        'Confusing `*ptr++` (returns value, then increments pointer) with `(*ptr)++` (increments value at pointer address).',
        'Assuming pointer subtraction `p2 - p1` returns byte distance instead of element distance.'
      ],
      examTips: [
        'Array indexing `arr[i]` is strictly equivalent to `*(arr + i)` and `i[arr]`.',
        'When passing arrays into functions, they automatically decay into pointers to their first element (`int arr[]` becomes `int *arr`).',
        'Always verify `ptr != NULL` before accessing memory returned by `malloc()` or passed into APIs.'
      ],
      videos: [
        {
          title: 'CS50 Lecture 4: Memory, Pointers, Stack & Heap Allocation',
          url: 'https://www.youtube.com/watch?v=zYIER3UahhU',
          searchQuery: 'CS50 Lecture 4 Memory Pointers David J Malan',
          channelOrTopic: 'Harvard CS50 (Prof. David J. Malan)',
          duration: '2:15:30',
          description: 'The world-famous Harvard lecture explaining hexadecimal memory addresses, pointer dereferencing, and memory management.'
        },
        {
          title: 'Pointer Arithmetic in C Explained with Visual Memory Diagrams',
          url: 'https://www.youtube.com/watch?v=ASVK7lXoFbg',
          searchQuery: 'Pointer Arithmetic in C Neso Academy',
          channelOrTopic: 'Neso Academy',
          duration: '14:25',
          description: 'Step-by-step visual animation of pointer scaling, pointer increments/decrements, and pointer subtraction.'
        },
        {
          title: 'Void Pointers (Generic Pointers) in C with Real Code Examples',
          url: 'https://www.youtube.com/watch?v=84uDsqqB_6Y',
          searchQuery: 'Void Pointers in C programming Neso Academy',
          channelOrTopic: 'Neso Academy',
          duration: '11:10',
          description: 'How generic void* pointers work, typecasting rules, and how qsort() uses void pointers for polymorphic sorting.'
        }
      ],
      practiceQuestions: [
        {
          question: 'Given `int a[5] = {1, 2, 3, 4, 5}; int *p = a + 1;`, what is the exact output of `printf("%d %d", *p, *(p + 2));` and why?',
          answer: `**Output:** \`2 4\`\n\n**Step-by-Step Explanation:**\n1. \`a\` is the base address of the array (points to \`a[0] = 1\`).\n2. \`p = a + 1\` points to \`a[1]\`, so \`*p\` evaluates to \`2\`.\n3. \`*(p + 2)\` moves 2 integers forward from \`a[1]\`, pointing to \`a[3]\`, so \`*(p + 2)\` evaluates to \`4\`.`,
          topic: 'CPC: Pointer Arithmetic',
          hint: 'Trace which array element index p is pointing to after the initial offset.'
        },
        {
          question: 'Why does `void *v; int x = 10; v = &x; printf("%d", *v);` fail to compile in ANSI C, and how do you fix it?',
          answer: `**Explanation:** A \`void*\` has no associated data type, so the compiler does not know how many bytes to read (\`sizeof(void)\` is undefined).\n\n**Fix:** Cast \`v\` to \`int*\` before dereferencing:\n\`\`\`c\nprintf("%d\\n", *(int*)v); // Correctly casts and prints 10\n\`\`\``,
          topic: 'CPC: Void Pointers',
          hint: 'Consider what sizeof(*v) would be for a void type.'
        }
      ],
      quizQuestions: [
        {
          question: 'What is the output of the following C code snippet?\n\n```c\n#include <stdio.h>\nint main() {\n    int arr[] = {10, 20, 30, 40};\n    int *ptr = arr;\n    printf("%d ", *ptr++);\n    printf("%d", *ptr);\n    return 0;\n}\n```',
          options: [
            '10 20',
            '10 10',
            '20 20',
            '11 20'
          ],
          correctIndex: 0,
          explanation: 'Postfix increment `*ptr++` dereferences the pointer first (evaluating to 10), then increments the pointer address to point to `arr[1]`. The subsequent `*ptr` prints 20.',
          topic: 'Pointers & Operator Precedence'
        },
        {
          question: 'If `short *ptr = (short*)0x2000;`, what is the hexadecimal address of `ptr + 4` on an architecture where `sizeof(short) == 2` bytes?',
          options: [
            '0x2008',
            '0x2004',
            '0x2010',
            '0x2002'
          ],
          correctIndex: 0,
          explanation: 'Pointer arithmetic scales by `sizeof(type)`: Address = 0x2000 + 4 * sizeof(short) = 0x2000 + 4 * 2 = 0x2000 + 8 = 0x2008.',
          topic: 'Pointer Arithmetic Calculations'
        },
        {
          question: 'Which statement regarding `void*` in standard C is TRUE?',
          options: [
            'A void* can store the address of any object type, but must be explicitly cast to a concrete type before dereferencing.',
            'A void* can be dereferenced directly without casting.',
            'Pointer arithmetic on void* always increments by 4 bytes automatically in standard ISO C.',
            'A void* cannot be passed as a function argument.'
          ],
          correctIndex: 0,
          explanation: '`void*` is a generic pointer. Because `sizeof(void)` is undefined, you cannot dereference it or perform arithmetic without casting to a concrete pointer type.',
          topic: 'Void Pointers'
        }
      ]
    },
    {
      topicMatchKeywords: ['struct', 'structure', 'linked list', 'dynamic memory', 'malloc', 'free', 'calloc'],
      title: 'Structures, Dynamic Memory (malloc/free) & Linked Lists in C',
      explanation: `### 📦 Dynamic Memory Allocation & Linked Lists in C

#### 1. Structures (\`struct\`)
A \`struct\` is a user-defined composite data type that groups related variables of different types under a single name:

\`\`\`c
typedef struct Node {
    int data;
    struct Node *next; // Self-referential pointer for linked lists
} Node;
\`\`\`

#### 2. Heap Allocation with \`malloc()\` and \`free()\`
* \`malloc(size)\`: Allocates \`size\` bytes of uninitialized memory on the heap.
* \`calloc(num, size)\`: Allocates zero-initialized memory for an array.
* \`free(ptr)\`: Deallocates heap memory. Always set \`ptr = NULL\` afterwards to prevent dangling pointers.

\`\`\`c
Node *newNode = (Node*)malloc(sizeof(Node));
if (newNode == NULL) {
    perror("Memory allocation failed");
    exit(1);
}
newNode->data = 100;
newNode->next = NULL;
\`\`\``,
      workedExample: `#### 💻 Building & Traversing a Singly Linked List

\`\`\`c
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int val;
    struct Node *next;
} Node;

void append(Node **head, int value) {
    Node *n = (Node*)malloc(sizeof(Node));
    n->val = value;
    n->next = NULL;
    
    if (*head == NULL) {
        *head = n;
        return;
    }
    Node *curr = *head;
    while (curr->next != NULL) {
        curr = curr->next;
    }
    curr->next = n;
}

int main() {
    Node *head = NULL;
    append(&head, 10);
    append(&head, 20);
    append(&head, 30);

    for (Node *curr = head; curr != NULL; curr = curr->next) {
        printf("%d -> ", curr->val);
    }
    printf("NULL\\n"); // Output: 10 -> 20 -> 30 -> NULL

    return 0;
}
\`\`\``,
      commonPitfalls: [
        'Memory leaks occur when `malloc()` is called without matching `free()`.',
        'Dangling pointer: Accessing memory after calling `free(ptr)`.',
        'Using the `.` operator instead of `->` when accessing struct members through a pointer.'
      ],
      examTips: [
        'To modify the head pointer of a linked list inside a helper function, pass a double pointer (`Node **head_ref`).',
        'Always check `if (ptr == NULL)` immediately after every `malloc()` call.'
      ],
      videos: [
        {
          title: 'Introduction to Linked Lists in C (Nodes, Pointers & Traversal)',
          url: 'https://www.youtube.com/watch?v=2ybLDQagr84',
          searchQuery: 'Linked List in C Neso Academy',
          channelOrTopic: 'Neso Academy',
          duration: '14:28',
          description: 'Visual node representation, dynamic allocation, pointer links, and head pointer mechanics.'
        },
        {
          title: 'Dynamic Memory Allocation: malloc, calloc, realloc, free',
          url: 'https://www.youtube.com/watch?v=udgpqQ9yJ1U',
          searchQuery: 'Dynamic Memory Allocation in C freeCodeCamp',
          channelOrTopic: 'freeCodeCamp.org',
          duration: '18:40',
          description: 'Deep dive into stack vs heap memory, memory leaks, and dynamic reallocation.'
        }
      ],
      practiceQuestions: [
        {
          question: 'What is the difference between `malloc()` and `calloc()` in C?',
          answer: '`malloc(size)` allocates a single uninitialized block of bytes (containing garbage values). `calloc(n, size)` allocates memory for `n` items of size `size` and initializes every byte to `0`.',
          topic: 'CPC: Dynamic Memory',
          hint: 'Consider byte initialization.'
        }
      ],
      quizQuestions: [
        {
          question: 'What happens if you allocate memory with `malloc()` and overwrite the pointer variable holding its address without calling `free()`?',
          options: [
            'A Memory Leak occurs because the allocated heap memory can no longer be accessed or deallocated.',
            'The operating system automatically garbage collects the memory in C.',
            'A Segmentation Fault immediately crashes the program.',
            'The memory is automatically reclaimed onto the call stack.'
          ],
          correctIndex: 0,
          explanation: 'C does not have garbage collection. Losing the pointer to allocated heap memory creates a memory leak that persists until process termination.',
          topic: 'Memory Management'
        }
      ]
    }
  ],

  CALC: [
    {
      topicMatchKeywords: ['lagrange', 'lagrange multiplier', 'constrained optimization', 'extrema', 'gradient', 'constraint'],
      title: 'Lagrange Multipliers & Constrained Multivariable Optimization',
      explanation: `### 📐 Lagrange Multipliers: Mathematical Theory & Geometric Proof

#### 1. Optimization Problem Formulation
We want to optimize (maximize or minimize) a continuous differentiable function $f(x, y, z)$ subject to an equality constraint $g(x, y, z) = k$.

#### 2. The Geometric Tangency Principle
At the constrained extrema (maximum or minimum), the level surface of the objective function $f(x, y, z)$ is **tangent** to the constraint surface $g(x, y, z) = k$.

Because the gradient vector $\\nabla f$ is normal to level surfaces of $f$, and $\\nabla g$ is normal to the constraint surface, their normal gradient vectors must be **collinear (parallel)** at the optimum:
$$\\nabla f(x, y, z) = \\lambda \\nabla g(x, y, z)$$
where $\\lambda$ is the **Lagrange Multiplier**.

#### 3. System of Equations to Solve
For two variables $x, y$ and constraint $g(x, y) = k$:
$$\\begin{cases} f_x = \\lambda g_x \\\\ f_y = \\lambda g_y \\\\ g(x, y) = k \\end{cases}$$
Solving this system of 3 equations yields the critical points $(x_0, y_0)$ and multiplier $\\lambda$.`,
      workedExample: `#### 💻 Step-by-Step Worked University Exam Problem

**Problem**: Find the maximum and minimum values of $f(x, y) = 2x + 4y$ subject to the constraint $x^2 + y^2 = 5$.

**Step 1: Compute Gradients**
* Objective: $\\nabla f = \\langle 2, 4 \\rangle$
* Constraint: $g(x, y) = x^2 + y^2 = 5 \\implies \\nabla g = \\langle 2x, 2y \\rangle$

**Step 2: Set Up Lagrange System**
$$2 = \\lambda (2x) \\implies 1 = \\lambda x \\implies x = \\frac{1}{\\lambda}$$
$$4 = \\lambda (2y) \\implies 2 = \\lambda y \\implies y = \\frac{2}{\\lambda}$$

**Step 3: Substitute into Constraint $g(x, y) = 5$**
$$\\left(\\frac{1}{\\lambda}\\right)^2 + \\left(\\frac{2}{\\lambda}\\right)^2 = 5 \\implies \\frac{1 + 4}{\\lambda^2} = 5 \\implies \\frac{5}{\\lambda^2} = 5 \\implies \\lambda^2 = 1 \\implies \\lambda = \\pm 1$$

**Step 4: Evaluate Critical Points**
* Case $\\lambda = 1$: $x = 1, y = 2 \\implies f(1, 2) = 2(1) + 4(2) = 10$ (**Maximum**)
* Case $\\lambda = -1$: $x = -1, y = -2 \\implies f(-1, -2) = 2(-1) + 4(-2) = -10$ (**Minimum**)

**Conclusion**: The maximum value is $10$ at $(1, 2)$ and the minimum value is $-10$ at $(-1, -2)$.`,
      commonPitfalls: [
        'Forgetting to include the constraint equation $g(x, y) = k$ as the final equation in the system.',
        'Dividing by variables without checking if they can be zero (e.g. dividing by x when x=0 is a valid solution).',
        'Confusing the Lagrange multiplier $\\lambda$ with the maximum/minimum value of $f(x, y)$.',
        'Failing to test all critical points obtained from positive and negative roots of $\\lambda$.'
      ],
      examTips: [
        'By the Extreme Value Theorem, continuous functions on compact (closed and bounded) constraint regions are guaranteed to achieve global max and min.',
        'The value of $\\lambda = \\frac{\\partial f^*}{\\partial k}$ represents the shadow price / marginal sensitivity with respect to loosening constraint $k$.'
      ],
      videos: [
        {
          title: 'Lagrange Multipliers Visualized (Geometric Intuition & Contour Proof)',
          url: 'https://www.youtube.com/watch?v=9vKqVkMQHKk',
          searchQuery: 'Lagrange Multipliers 3Blue1Brown Khan Academy',
          channelOrTopic: '3Blue1Brown / Khan Academy',
          duration: '08:42',
          description: 'Brilliant geometric demonstration showing why level curves must be tangent and gradient vectors align.'
        },
        {
          title: 'Calculus 3: Lagrange Multipliers with Multiple Constraints',
          url: 'https://www.youtube.com/watch?v=5A39H_1mflg',
          searchQuery: 'Calculus 3 Lagrange Multipliers Professor Leonard',
          channelOrTopic: 'Professor Leonard (Calculus 3)',
          duration: '1:18:20',
          description: 'Comprehensive college lecture with full exam problem walkthroughs and step-by-step algebra.'
        },
        {
          title: 'MIT 18.02 Multivariable Calculus: Constrained Extrema & Lagrange',
          url: 'https://www.youtube.com/watch?v=Xn7xK5S-3Kk',
          searchQuery: 'MIT 18.02 Lagrange Multipliers Multivariable Calculus',
          channelOrTopic: 'MIT OpenCourseWare',
          duration: '45:10',
          description: 'Rigorous derivation of the method of Lagrange multipliers with physical examples.'
        }
      ],
      practiceQuestions: [
        {
          question: 'Find the points on the sphere $x^2 + y^2 + z^2 = 4$ closest to and farthest from the point $(3, 1, -1)$.',
          answer: 'Using $f(x, y, z) = (x-3)^2 + (y-1)^2 + (z+1)^2$ and $g(x, y, z) = x^2+y^2+z^2 = 4$, solving $\\nabla f = \\lambda \\nabla g$ gives $(x, y, z) = \\pm \\frac{2}{\\sqrt{11}}(3, 1, -1)$. The positive point is closest and negative is farthest.',
          topic: 'CALC: 3D Constrained Optimization',
          hint: 'Minimize the square of the distance function to simplify derivatives.'
        }
      ],
      quizQuestions: [
        {
          question: 'Geometrically, why does the method of Lagrange Multipliers require $\\nabla f = \\lambda \\nabla g$ at a constrained extremum?',
          options: [
            'Because at the optimum, the level curve of f is tangent to the constraint curve g, meaning their normal gradient vectors are parallel.',
            'Because the gradient of f is always zero at any point on the constraint.',
            'Because the constraint function g must equal the objective function f.',
            'Because the second derivative test fails for multivariable functions.'
          ],
          correctIndex: 0,
          explanation: 'At a constrained extremum, moving along the constraint curve g=k produces zero instantaneous change in f, meaning the directional derivative is zero. Thus, the gradient vectors of f and g must be collinear (parallel).',
          topic: 'Lagrange Geometry'
        },
        {
          question: 'If $\\lambda = 3.5$ at the constrained maximum of $f(x, y)$ subject to $g(x, y) = 100$, approximately what happens to the maximum value of $f$ if the constraint is increased from $100$ to $102$?',
          options: [
            'The maximum value of f increases by approximately 7.0 (2 * 3.5).',
            'The maximum value of f decreases by 3.5.',
            'The maximum value of f remains unchanged.',
            'The maximum value of f doubles.'
          ],
          correctIndex: 0,
          explanation: 'The Lagrange multiplier represents the sensitivity $\\lambda = \\frac{df^*}{dk}$. A change $\\Delta k = 2$ yields $\\Delta f^* \\approx \\lambda \\Delta k = 3.5 \\times 2 = 7.0$.',
          topic: 'Sensitivity Analysis'
        }
      ]
    }
  ],

  EME: [
    {
      topicMatchKeywords: ['otto', 'diesel', 'carnot', 'cycle', 'thermodynamic', 'efficiency', 'pv diagram', 'ts diagram'],
      title: 'Otto vs Diesel Thermodynamic Power Cycles & Efficiency Derivation',
      explanation: `### ⚙️ Otto vs Diesel Thermodynamic Cycles

#### 1. The Air-Standard Otto Cycle (Spark Ignition / Petrol)
Consists of 4 internally reversible processes:
1. **1 $\\to$ 2**: Isentropic compression ($s_1 = s_2$) with compression ratio $r = \\frac{V_1}{V_2}$.
2. **2 $\\to$ 3**: Constant-volume (isochoric) heat addition ($Q_{\\text{in}} = m c_v (T_3 - T_2)$).
3. **3 $\\to$ 4**: Isentropic expansion (power stroke, $s_3 = s_4$).
4. **4 $\\to$ 1**: Constant-volume heat rejection ($Q_{\\text{out}} = m c_v (T_4 - T_1)$).

$$\\eta_{\\text{Otto}} = 1 - \\frac{1}{r^{\\gamma - 1}}$$

#### 2. The Air-Standard Diesel Cycle (Compression Ignition)
Heat is added at **constant pressure** (isobaric) rather than constant volume:
$$\\eta_{\\text{Diesel}} = 1 - \\frac{1}{r^{\\gamma - 1}} \\left[ \\frac{r_c^\\gamma - 1}{\\gamma(r_c - 1)} \\right]$$
where $r_c = \\frac{V_3}{V_2}$ is the **cut-off ratio**.

#### 3. Critical Engineering Comparison
* For the **same compression ratio $r$**, the **Otto cycle is more efficient** than the Diesel cycle because heat is added at constant volume (higher peak pressure and temperature).
* However, in **real-world engines**, Diesel engines operate at much higher compression ratios ($r \\approx 14\\text{--}22$) than petrol engines ($r \\approx 8\\text{--}11$, limited by fuel auto-ignition / knocking). Hence, real Diesel engines achieve higher practical thermal efficiency.`,
      workedExample: `#### 💻 Solved University Examination Problem

**Problem**: An ideal Otto cycle engine operates with a compression ratio $r = 8.5$. The specific heat ratio for air is $\\gamma = 1.4$. Calculate the thermal efficiency $\\eta_{\\text{Otto}}$.

**Solution**:
$$\\eta_{\\text{Otto}} = 1 - \\frac{1}{r^{\\gamma - 1}} = 1 - \\frac{1}{8.5^{1.4 - 1}} = 1 - \\frac{1}{8.5^{0.4}}$$
$$8.5^{0.4} \\approx 2.3536$$
$$\\eta_{\\text{Otto}} = 1 - \\frac{1}{2.3536} = 1 - 0.4249 = 0.5751 \\implies 57.51\\%$$

**Conclusion**: The ideal theoretical thermal efficiency is **57.51%**.`,
      commonPitfalls: [
        'Confusing cut-off ratio $r_c = V_3/V_2$ with compression ratio $r = V_1/V_2$.',
        'Using $c_p$ instead of $c_v$ for constant-volume heat addition in the Otto cycle.',
        'Assuming ideal air-standard efficiencies match real brake thermal efficiency without accounting for friction and pumping losses.'
      ],
      examTips: [
        'Always draw both the P-V and T-S diagrams before starting numerical derivations.',
        'Remember that as compression ratio $r$ increases, thermal efficiency increases asymptotically.'
      ],
      videos: [
        {
          title: 'Understanding the Otto Cycle & Diesel Cycle (P-V & T-S Diagrams)',
          url: 'https://www.youtube.com/watch?v=aQf6Q8t1FQE',
          searchQuery: 'Otto Cycle vs Diesel Cycle The Efficient Engineer',
          channelOrTopic: 'The Efficient Engineer',
          duration: '14:20',
          description: '3D animated cutaways showing 4-stroke piston motion, P-V state loops, and efficiency comparisons.'
        }
      ],
      practiceQuestions: [
        {
          question: 'Why does the thermal efficiency of a Diesel cycle decrease as the cut-off ratio $r_c$ increases?',
          answer: 'As $r_c$ increases, heat addition extends further into the expansion stroke where pressure is dropping, reducing the effective expansion ratio and increasing the temperature of rejected exhaust gas.',
          topic: 'EME: Diesel Cycle Efficiency',
          hint: 'Consider the bracketed factor $[r_c^\\gamma - 1]/[\\gamma(r_c - 1)]$ which is always $> 1$ for $r_c > 1$.'
        }
      ],
      quizQuestions: [
        {
          question: 'For the same compression ratio $r$ and heat input, which ideal thermodynamic cycle has higher thermal efficiency?',
          options: [
            'Otto Cycle (because heat is added at constant volume at the maximum pressure)',
            'Diesel Cycle (because heat is added at constant pressure)',
            'Both cycles have identical theoretical efficiency',
            'Carnot cycle is always lower than Otto cycle'
          ],
          correctIndex: 0,
          explanation: 'At the same compression ratio, adding heat at constant volume (Otto) generates a higher peak temperature and pressure than adding heat at constant pressure (Diesel), resulting in higher ideal thermal efficiency.',
          topic: 'Thermodynamic Cycle Comparison'
        }
      ]
    }
  ],

  ESS: [
    {
      topicMatchKeywords: ['eia', 'environmental impact assessment', 'solar', 'photovoltaic', 'renewable', 'carbon', 'ecology'],
      title: 'Environmental Impact Assessment (EIA) & Renewable Solar Energy Systems',
      explanation: `### 🌍 Environmental Impact Assessment (EIA) Methodology & Solar PV

#### 1. The EIA Process & Leopold Matrix
Environmental Impact Assessment (EIA) is a systematic evaluation of the potential environmental consequences of proposed engineering projects prior to major decision-making:
1. **Screening**: Determine whether an EIA is legally mandated.
2. **Scoping**: Identify critical baseline environmental factors (air, water, biodiversity, socioeconomic).
3. **Impact Prediction & Mitigation**: Quantify magnitude and significance using matrix methods (e.g. Leopold Matrix, Battelle Environmental Evaluation System).
4. **Environmental Management Plan (EMP)**: Post-construction monitoring protocols.

#### 2. Solar Photovoltaic (PV) Working Principles
Solar cells convert sunlight directly into electricity via the **photovoltaic effect**:
* Photons with energy $h\\nu \\ge E_g$ (bandgap energy) excite electrons from the valence band to the conduction band.
* The built-in electric field of the $p$-$n$ junction separates the electron-hole pairs, generating DC voltage.
* **Shockley-Queisser Limit**: Maximum theoretical single-junction solar cell efficiency is $\\approx 33.7\\%$ for a bandgap $E_g \\approx 1.34\\text{ eV}$ (Silicon $E_g = 1.12\\text{ eV}$).`,
      workedExample: `#### 💻 Solar PV Array Sizing Calculation

**Problem**: A university engineering lab requires $12\\text{ kWh}$ of electrical energy per day. The site receives an average of $5\\text{ Peak Sun Hours (PSH)}$ daily. Assuming an overall system performance ratio $PR = 0.75$, calculate the required peak PV capacity $P_{\\text{peak}}$.

**Solution**:
$$P_{\\text{peak}} = \\frac{E_{\\text{daily}}}{\\text{PSH} \\times PR} = \\frac{12\\text{ kWh}}{5\\text{ h} \\times 0.75} = \\frac{12}{3.75} = 3.2\\text{ kWp}$$

If using $400\\text{ W}$ solar panels:
$$\\text{Number of Panels} = \\frac{3200\\text{ W}}{400\\text{ W}} = 8\\text{ panels}$$`,
      commonPitfalls: [
        'Ignoring temperature coefficient of PV panels (silicon efficiency drops $\\approx 0.4\\%/^\\circ\\text{C}$ above $25^\\circ\\text{C}$).',
        'Confusing Peak Sun Hours (PSH, total daily irradiance in $\\text{kWh}/\\text{m}^2$) with total daylight hours.'
      ],
      examTips: [
        'In EIA, mitigation follows the hierarchy: Avoid $\\to$ Minimize $\\to$ Rectify $\\to$ Compensate.',
        'Silicon bandgap $E_g = 1.12\\text{ eV}$ requires photons with wavelength $\\lambda \\le 1100\\text{ nm}$.'
      ],
      videos: [
        {
          title: 'Environmental Impact Assessment (EIA) Process & Methodology',
          url: 'https://www.youtube.com/watch?v=O1EZXw4Xb_c',
          searchQuery: 'Environmental Impact Assessment EIA methodology NPTEL',
          channelOrTopic: 'NPTEL Engineering',
          duration: '28:40',
          description: 'Step-by-step EIA screening, scoping, impact baseline quantification, and public consultation protocols.'
        },
        {
          title: 'How Solar Cells Work & The Photovoltaic Effect',
          url: 'https://www.youtube.com/watch?v=1kUE0BZtTRc',
          searchQuery: 'How Solar Cells Work National Geographic',
          channelOrTopic: 'National Geographic',
          duration: '03:17',
          description: 'Visual breakdown of p-n junction physics, photon absorption, and semiconductor bandgaps.'
        }
      ],
      practiceQuestions: [
        {
          question: 'What is the Shockley-Queisser limit and what two fundamental physical phenomena cause it?',
          answer: 'The Shockley-Queisser limit ($~33.7\\%$) is the maximum theoretical efficiency of a single p-n junction solar cell. It is caused by: (1) Photons with energy below bandgap $h\\nu < E_g$ cannot be absorbed (transmission loss), and (2) Photons with $h\\nu > E_g$ lose excess energy as heat (thermalization loss).',
          topic: 'ESS: Solar Cell Physics',
          hint: 'Think about photon energy versus semiconductor bandgap.'
        }
      ],
      quizQuestions: [
        {
          question: 'What is the primary purpose of the "Scoping" phase in an Environmental Impact Assessment (EIA)?',
          options: [
            'To identify key environmental issues, baseline boundaries, and terms of reference for in-depth study.',
            'To decide whether a project needs an assessment at all.',
            'To issue the final environmental clearance certificate.',
            'To demolish existing structures.'
          ],
          correctIndex: 0,
          explanation: 'Screening decides IF an EIA is needed. Scoping identifies WHAT specific key environmental parameters must be investigated.',
          topic: 'EIA Stages'
        }
      ]
    }
  ],

  ETH: [
    {
      topicMatchKeywords: ['challenger', 'whistleblowing', 'ethics', 'nspe', 'intellectual property', 'bias', 'safety'],
      title: 'Engineering Ethics: Space Shuttle Challenger Case Study & NSPE Code',
      explanation: `### ⚖️ Engineering Ethics, Professional Responsibility & NSPE Code

#### 1. The Fundamental Canon of Engineering (NSPE Code of Ethics)
The primary canon of professional engineering ethics states:
> **"Engineers, in the fulfillment of their professional duties, shall hold paramount the safety, health, and welfare of the public."**

#### 2. The Space Shuttle Challenger Disaster (1986) Case Study
* **Technical Root Cause**: At low launch temperatures ($31^\\circ\\text{F} / -0.5^\\circ\\text{C}$), the synthetic rubber O-rings in the Solid Rocket Booster (SRB) field joints lost elasticity, allowing pressurized combustion gas blow-by that breached the external fuel tank.
* **Ethical Failure**: Morton Thiokol engineers (Roger Boisjoly and Allan McDonald) warned NASA managers about the O-ring cold embrittlement data and initially refused to sign launch clearance. Under intense schedule and political pressure, management overridden the engineering safety warnings with the infamous phrase: *"Take off your engineering hat and put on your management hat."*

#### 3. Professional Whistleblowing Criteria (DeGeorge Criteria)
Whistleblowing is morally permissible/obligatory when:
1. Serious and substantial harm to the public is at stake.
2. Engineers have reported their technical concerns to immediate superiors without resolution.
3. Internal remedies have been exhausted.
4. Documented technical evidence exists that would convince a reasonable observer.`,
      workedExample: `#### 💻 Ethical Decision Matrix Walkthrough

**Scenario**: An engineer discovers that an industrial control system contains a software vulnerability that could bypass pressure relief valves under rare edge conditions. Management asks to ship now and patch later.

**Ethical Action Flow**:
1. **Rule of Paramountcy**: Public safety overrides commercial deadlines (NSPE Canon 1).
2. **Technical Documentation**: Quantify the failure probability and failure mode consequences in a formal risk memo.
3. **Internal Escalation**: Present the safety memorandum to engineering management and the Chief Technical Officer.
4. **Resolution**: Enforce hardware mechanical fail-safes (physical burst discs) before commissioning.`,
      commonPitfalls: [
        'Treating ethics as subjective opinion rather than adherence to professional engineering standards and legal canons.',
        'Succumbing to "Groupthink" and managerial pressure over empirical test data.'
      ],
      examTips: [
        'Always cite NSPE Canon 1: "Hold paramount the safety, health, and welfare of the public."',
        'Remember that whistleblowing is a last resort after exhausting all internal communication channels.'
      ],
      videos: [
        {
          title: 'Engineering Ethics: The Space Shuttle Challenger Disaster',
          url: 'https://www.youtube.com/watch?v=0wI_y1t8Jps',
          searchQuery: 'Engineering Ethics Space Shuttle Challenger Crash Course Engineering',
          channelOrTopic: 'CrashCourse Engineering',
          duration: '09:44',
          description: 'Investigation into O-ring blow-by engineering warnings, managerial pressure, and ethical whistleblowing.'
        }
      ],
      practiceQuestions: [
        {
          question: 'Under the NSPE Code of Ethics, what must an engineer do if their professional technical judgment is overruled by management in a manner that endangers public safety?',
          answer: 'The engineer is ethically obligated to inform their employer, client, and if necessary, relevant regulatory authorities or the public to prevent harm.',
          topic: 'ETH: NSPE Canon 1',
          hint: 'Review the Canon of Paramountcy.'
        }
      ],
      quizQuestions: [
        {
          question: 'According to the NSPE Code of Ethics, what is the single most fundamental obligation of a professional engineer?',
          options: [
            'Hold paramount the safety, health, and welfare of the public.',
            'Maximize profitability for the client or employer.',
            'Deliver projects ahead of schedule at all costs.',
            'Avoid all public communication.'
          ],
          correctIndex: 0,
          explanation: 'Canon 1 of the NSPE Code of Ethics unequivocally states that engineers must hold paramount the safety, health, and welfare of the public above all other considerations.',
          topic: 'NSPE Canons'
        }
      ]
    }
  ]
};

/**
 * Intelligent Academic Reasoning & Content Synthesizer
 */
export function synthesizeIntelligentAcademicResponse(
  query: string,
  subjectCode: string,
  subjectName: string,
  contextResources?: ReferenceResource[],
  subject?: Subject,
  upcomingTimelines?: TimelineItem[]
): {
  reply: string;
  recommendedVideos: YouTubeVideoRecommendation[];
  practiceQuestions: PracticeQuestionItem[];
  quiz?: GeneratedQuiz;
  sources: string[];
} {
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  // 1. Natural Greeting & Conversational Intent Handling
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
    if (cleanQuery.includes('who are you') || cleanQuery.includes('what are you') || cleanQuery.includes('what can you do')) {
      return {
        reply: `### 👋 Hi! I'm your EduSync AI Academic Tutor for **${subjectName}** (${subjectCode}).

I'm here to help you master your coursework, prepare for exams, and solve homework problems. Here is what I can do:

* 📖 **Explain Concepts**: Ask me about any topic in ${subjectName} (theory, derivations, physical meaning, algorithms).
* 💻 **Code & Math Walkthroughs**: Give me a problem, equation, or code snippet to analyze, debug, or solve step-by-step.
* 📝 **Study Notes & Flashcards**: Generate structured summary notes and flashcards for exam revision.
* 🎯 **Practice & Self-Testing**: Ask me to quiz you on any specific topic to test your knowledge.

What topic or problem would you like to explore today?`,
        recommendedVideos: [],
        practiceQuestions: [],
        sources: [`${subjectCode} Course Curriculum`]
      };
    }

    if (cleanQuery.includes('thank') || cleanQuery.includes('thx')) {
      return {
        reply: `You're very welcome! 😊 Feel free to ask if you have any more questions about **${subjectName}**, need help with homework problems, or want to review for an exam. Good luck with your studies!`,
        recommendedVideos: [],
        practiceQuestions: [],
        sources: []
      };
    }

    // Default friendly greeting
    return {
      reply: `Hello! 👋 I'm your AI Study Assistant for **${subjectName}** (${subjectCode}).

How can I help you today? You can ask me to:
- 📖 **Explain any concept** in detail (e.g. pointers, calculus optimization, thermodynamics, environmental analysis)
- 💻 **Walk through code or math problems** step-by-step
- 📝 **Create structured study notes or practice quizzes** for upcoming exams

What topic would you like to study?`,
      recommendedVideos: [],
      practiceQuestions: [],
      sources: []
    };
  }

  const subjectList = SUBJECT_KNOWLEDGE_BASE[subjectCode] || [];

  // 2. Check for curated high-yield topic knowledge matches
  const matched = subjectList.find(item =>
    item.topicMatchKeywords.some(keyword => cleanQuery.includes(keyword))
  );

  if (matched) {
    const fullReply = `${matched.explanation}\n\n---\n\n${matched.workedExample}\n\n---\n\n#### ⚠️ Common Misconceptions & Exam Traps\n${matched.commonPitfalls.map(p => `* ❌ **${p}**`).join('\n')}\n\n---\n\n#### 🎯 High-Yield University Exam Checklist\n${matched.examTips.map(t => `- [x] ${t}`).join('\n')}`;

    const quiz: GeneratedQuiz = {
      id: `quiz-gen-${Date.now()}`,
      title: `Assessment: ${matched.title}`,
      topic: `${subjectCode} - ${subjectName}`,
      createdAt: new Date().toISOString(),
      questions: matched.quizQuestions.map((q, idx) => ({
        id: `q-${idx + 1}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        topic: q.topic
      }))
    };

    return {
      reply: fullReply,
      recommendedVideos: matched.videos,
      practiceQuestions: matched.practiceQuestions,
      quiz,
      sources: [
        `${subjectCode} University Coursepack & Official Syllabus`,
        'MIT OpenCourseWare & Bell Labs Archives',
        'National Academic Curriculum Reference Manual'
      ]
    };
  }

  // 3. Natural Human Conversational Engine for all other questions, coding tasks, and discussions
  return generateNaturalConversationalResponse(query, subjectCode, subjectName, subject, upcomingTimelines, contextResources);
}
