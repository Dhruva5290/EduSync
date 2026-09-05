"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedStudentLectureProgress = exports.seedConceptMastery = exports.seedMasteryQuizzes = exports.seedBoardCaptures = exports.seedLectures = void 0;
exports.seedLectures = [
    // =========================================================================
    // BENCHMARK LECTURE 1: PHYSICS 11 — NEWTON'S LAWS & FREE BODY DIAGRAMS
    // =========================================================================
    {
        id: 'lec-phy-101',
        subjectId: 'subj-phy-11',
        subjectCode: 'PHY-11',
        subjectName: 'Physics 11 (Mechanics & Dynamics)',
        title: "Newton's Laws of Motion & Free Body Diagrams",
        teacherName: 'Dr. Alok Verma',
        teacherId: 'teacher-phy',
        date: '2026-09-02',
        duration: '45 mins',
        summary: 'Foundational lecture on Newtonian kinetics: Definition of inertia, first law condition, rigorous formulation of free body diagrams on inclined planes, resolution of normal force, distinction between force and acceleration, and friction coupling.',
        topics: [
            "Newton's First Law",
            'Inertia & Reference Frames',
            'Free Body Diagram (FBD)',
            'Normal Force on Inclined Plane',
            'Force vs Acceleration',
            'Friction & Numerical Problems'
        ],
        timeline: [
            {
                id: 'tl-1',
                timestamp: '00:00',
                timestampSeconds: 0,
                title: 'Introduction & Kinematics Recap',
                teacherQuote: 'Good morning class. Today we transition from kinematics to kinetics—asking not just how objects move, but what fundamental physical interactions cause motion.',
                notes: 'Kinematics described trajectory $s(t)$, velocity $v(t)$, and acceleration $a(t)$. Kinetics investigates the causes of acceleration—namely forces acting between bodies.',
                boardImageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
                keyTakeaway: 'Forces cause changes in momentum; absent forces preserve state of motion.'
            },
            {
                id: 'tl-2',
                timestamp: '05:32',
                timestampSeconds: 332,
                title: "Newton's First Law (Law of Inertia)",
                teacherQuote: "Newton's First Law states: Every body continues in its state of rest or uniform motion in a straight line unless compelled to change that state by an external net unbalanced force.",
                notes: "Equilibrium condition: $\\sum \\vec{F}_{ext} = 0 \\implies \\vec{a} = 0 \\implies \\vec{v} = \\text{constant}$. This defines the inertial frame of reference.",
                formulaLatex: '\\sum \\vec{F}_{ext} = 0 \\iff \\vec{v} = \\text{constant}',
                boardImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
                keyTakeaway: "Zero net force does NOT mean zero velocity; it means zero acceleration."
            },
            {
                id: 'tl-3',
                timestamp: '12:48',
                timestampSeconds: 768,
                title: 'Inertia & Inertial vs Non-Inertial Frames',
                teacherQuote: 'Inertia is the intrinsic property of matter to resist any change in its velocity. Mass $m$ is the quantitative scalar measure of inertia. When a metro train brakes suddenly, passengers jerk forward not because a forward force was applied, but because their upper bodies maintain forward velocity due to inertia.',
                notes: 'Types of inertia: (1) Inertia of rest, (2) Inertia of motion, (3) Inertia of direction. In a non-inertial accelerating frame with acceleration $\\vec{a}_0$, a pseudo-force $\\vec{F}_{pseudo} = -m\\vec{a}_0$ must be introduced.',
                formulaLatex: '\\vec{F}_{pseudo} = -m\\vec{a}_0',
                boardImageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
                keyTakeaway: 'Mass is the scalar measure of inertia. Pseudo-forces arise only in accelerating reference frames.'
            },
            {
                id: 'tl-4',
                timestamp: '21:05',
                timestampSeconds: 1265,
                title: 'Free Body Diagram (FBD) & Normal Reaction',
                teacherQuote: 'Look closely at the blackboard at 21 minutes: To construct an FBD, isolate the mass $m$ completely from the system. Draw only the forces acting ON the body by the surroundings. Gravity acts vertically downward with magnitude $mg$. At an incline angle $\\theta$, resolve gravity into components: $mg\\cos\\theta$ perpendicular to the surface, and $mg\\sin\\theta$ parallel down the slope. The normal reaction $N$ balances $mg\\cos\\theta$, yielding $N = mg\\cos\\theta$.',
                notes: 'Rigorous FBD Construction Steps:\n1. Isolate the target body as a point mass.\n2. Draw gravity $\\vec{W} = m\\vec{g}$ vertically downwards.\n3. Identify contact surfaces: Normal force $\\vec{N}$ acts strictly perpendicular away from the contact plane.\n4. Resolve non-orthogonal vectors into parallel and perpendicular axes:\n$$N = mg\\cos\\theta$$\n$$F_{\\parallel} = mg\\sin\\theta - f_s$$',
                formulaLatex: 'N = mg\\cos\\theta, \\quad F_{\\text{parallel}} = mg\\sin\\theta - f_k',
                boardImageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
                diagramUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
                keyTakeaway: 'Normal force is perpendicular to contact surface, NOT always equal to mg.'
            },
            {
                id: 'tl-5',
                timestamp: '31:42',
                timestampSeconds: 1902,
                title: 'Numerical Problem & Force vs Acceleration Distinction',
                teacherQuote: 'Here is a critical misconception students make every year: Force and acceleration are NOT the same quantity. Force is an interaction (cause, measured in Newtons); acceleration is the kinematic rate of change of velocity (effect, in $m/s^2$). Let us solve: Block of mass $5\\text{ kg}$ on a $30^\\circ$ ramp with kinetic friction coefficient $\\mu_k = 0.2$. $a = g(\\sin 30^\\circ - \\mu_k \\cos 30^\\circ) = 9.8(0.5 - 0.2 \\times 0.866) = 3.20\\text{ m/s}^2$.',
                notes: 'Equation of Motion:\n$$\\sum F_x = mg\\sin\\theta - \\mu_k N = ma$$\n$$\\sum F_y = N - mg\\cos\\theta = 0 \\implies N = mg\\cos\\theta$$\n$$a = g(\\sin\\theta - \\mu_k\\cos\\theta)$$\nFor $m = 5\\text{ kg}, \\theta = 30^\\circ, \\mu_k = 0.2$:\n$$a = 9.8(0.5 - 0.173) = 3.20\\text{ m/s}^2$$',
                formulaLatex: 'a = g(\\sin\\theta - \\mu_k\\cos\\theta)',
                boardImageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
                keyTakeaway: 'Force is the cause (Newtons), acceleration is the effect (m/s²). Always write net force first before equating to ma.'
            },
            {
                id: 'tl-6',
                timestamp: '42:10',
                timestampSeconds: 2530,
                title: 'Homework & Assignment Mentioned by Teacher',
                teacherQuote: 'For your homework assignment: Solve problems 4 through 9 from Chapter 5 of HC Verma on connected pulley systems and friction blocks. Submit your work through the platform before Friday 5:00 PM.',
                notes: 'Homework assigned:\n- Problems 4-9 from Chapter 5 (Newton\'s Laws & Friction Blocks)\n- Draw clear Free Body Diagrams for each question\n- Due Date: Friday at 17:00 IST',
                boardImageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
                keyTakeaway: 'Submit Homework Problem Set 5 on connected pulleys by Friday 5 PM.'
            }
        ],
        boardCaptures: [
            {
                id: 'bc-phy-1',
                lectureId: 'lec-phy-101',
                lectureTitle: "Newton's Laws of Motion & Free Body Diagrams",
                subjectId: 'subj-phy-11',
                subjectName: 'Physics 11',
                timestamp: '21:05',
                title: 'Free Body Diagram on Inclined Plane',
                imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&auto=format&fit=crop&q=80',
                ocrLatex: 'N = mg\\cos\\theta, \\quad W_x = mg\\sin\\theta, \\quad f_s \\le \\mu_s N',
                diagramType: 'Vector Diagram / Free Body Decomposition',
                conceptTag: 'Free Body Diagram',
                explanation: 'Blackboard capture illustrating coordinate tilt along inclined plane with normal reaction perpendicular to surface and gravity decomposed into orthogonal vectors.'
            },
            {
                id: 'bc-phy-2',
                lectureId: 'lec-phy-101',
                lectureTitle: "Newton's Laws of Motion & Free Body Diagrams",
                subjectId: 'subj-phy-11',
                subjectName: 'Physics 11',
                timestamp: '31:42',
                title: 'Force vs Acceleration Derivation & Friction Graph',
                imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=900&auto=format&fit=crop&q=80',
                ocrLatex: '\\Sigma F = ma \\implies a = g(\\sin\\theta - \\mu_k\\cos\\theta)',
                diagramType: 'Equation & Graph Curve',
                conceptTag: 'Newton\'s Second Law',
                explanation: 'Step-by-step mathematical board work resolving two-block friction constraints and distinguishing net external force from kinematic acceleration.'
            },
            {
                id: 'bc-phy-3',
                lectureId: 'lec-phy-101',
                lectureTitle: "Newton's Laws of Motion & Free Body Diagrams",
                subjectId: 'subj-phy-11',
                subjectName: 'Physics 11',
                timestamp: '12:48',
                title: 'Inertia & Frame of Reference Vector Diagram',
                imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=900&auto=format&fit=crop&q=80',
                ocrLatex: '\\vec{F}_{eff} = \\vec{F}_{real} - m\\vec{a}_0',
                diagramType: 'Coordinate Frame Schematic',
                conceptTag: 'Inertia & Reference Frames',
                explanation: 'Comparison of inertial reference frame versus accelerating non-inertial reference frame illustrating origin of fictitious D\'Alembert pseudo-forces.'
            }
        ],
        audioTranscript: [
            {
                timestamp: '00:00',
                speaker: 'Dr. Alok Verma',
                text: 'Good morning everyone. Today we begin our core dynamics module on Newton\'s Laws of Motion.'
            },
            {
                timestamp: '05:32',
                speaker: 'Dr. Alok Verma',
                text: 'Newton\'s First Law: A body remains at rest or in uniform motion unless acted upon by a net external force. That is, sigma F equals zero if and only if velocity is constant.'
            },
            {
                timestamp: '12:48',
                speaker: 'Dr. Alok Verma',
                text: 'Inertia is the intrinsic property of matter resisting changes in velocity. Mass is the quantitative scalar measure of inertia. Remember, inertia is not a force; it is a property of mass.'
            },
            {
                timestamp: '21:05',
                speaker: 'Dr. Alok Verma',
                text: 'Look at this Free Body Diagram at 21 minutes. For mass m on an inclined plane of angle theta, gravity mg acts downwards. We decompose mg into mg cos theta perpendicular to the plane and mg sin theta parallel down the plane. The normal force N is perpendicular to the plane and equals mg cos theta.'
            },
            {
                timestamp: '31:42',
                speaker: 'Dr. Alok Verma',
                text: 'Notice: Force and acceleration are not the same physical quantity! Force is the cause, acceleration is the rate of change of velocity produced. The net force sigma F equals m times a.'
            },
            {
                timestamp: '42:10',
                speaker: 'Dr. Alok Verma',
                text: 'For homework, please solve problems 4 through 9 from Chapter 5 of HC Verma on connected pulley systems. Due Friday at 5 PM.'
            }
        ],
        generalizedNotes: {
            explanation: "Newtonian dynamics provides the predictive framework linking force interactions with particle motion. The first law defines the inertial reference frame where unaccelerated motion requires zero net interaction. The second law defines force as the time rate of change of linear momentum $\\vec{F} = \\frac{d\\vec{p}}{dt}$. Free Body Diagrams (FBDs) isolate a body and balance external forces along chosen Cartesian coordinates.",
            importantConcepts: [
                {
                    name: "Newton's First Law",
                    description: 'A body preserves constant velocity in the absence of net external force.',
                    formulaLatex: '\\sum \\vec{F}_{ext} = 0 \\iff \\vec{a} = 0'
                },
                {
                    name: 'Inertia',
                    description: 'The natural resistance of matter to velocity changes; measured quantitatively by scalar inertial mass $m$.',
                    formulaLatex: 'm = \\text{scalar measure of inertia}'
                },
                {
                    name: "Newton's Second Law",
                    description: 'Net external force equals the product of mass and acceleration vector.',
                    formulaLatex: '\\vec{F}_{net} = m\\vec{a}'
                },
                {
                    name: 'Free Body Diagram (FBD)',
                    description: 'A diagram isolating a single object showing all external forces acting upon it with orthogonal resolution.',
                    formulaLatex: 'N = mg\\cos\\theta'
                }
            ],
            formulas: [
                {
                    name: 'Inertial Equilibrium',
                    latex: '\\sum \\vec{F} = 0',
                    explanation: 'Vector sum of forces equals zero when velocity is constant.'
                },
                {
                    name: "Newton's Second Law",
                    latex: '\\vec{F}_{net} = m\\frac{d\\vec{v}}{dt} = m\\vec{a}',
                    explanation: 'Net force produces acceleration inversely proportional to mass.'
                },
                {
                    name: 'Normal Reaction on Incline',
                    latex: 'N = mg\\cos\\theta',
                    explanation: 'Perpendicular contact force balancing perpendicular gravity component.'
                },
                {
                    name: 'Kinetic Friction Force',
                    latex: 'f_k = \\mu_k N = \\mu_k mg\\cos\\theta',
                    explanation: 'Friction resisting relative sliding motion along the plane.'
                }
            ],
            examples: [
                {
                    problem: 'Find the acceleration of a 5 kg block sliding down a 30° inclined plane with kinetic friction coefficient μ = 0.2.',
                    solution: 'Resolve forces along slope: F_net = mg sin(30°) - μ mg cos(30°). Thus a = g(sin 30° - 0.2 cos 30°) = 9.8(0.5 - 0.173) = 3.20 m/s².',
                    latex: 'a = g(\\sin 30^\\circ - \\mu_k\\cos 30^\\circ) = 3.20\\text{ m/s}^2'
                }
            ],
            keyPoints: [
                'Normal force is perpendicular to the surface, NOT automatically equal to mg.',
                'Inertia is a property of mass, not a force.',
                'Force and acceleration have different dimensions: [F] = MLT⁻² (Newtons), [a] = LT⁻² (m/s²).',
                'Always isolate the body and draw external forces before writing equations of motion.'
            ],
            diagrams: [
                {
                    title: 'Inclined Plane Free Body Diagram',
                    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
                    description: 'Resolution of gravity vector W = mg into orthogonal components mg cos(θ) and mg sin(θ).'
                }
            ],
            homeworkMentioned: [
                {
                    task: 'HC Verma Chapter 5: Problems 4-9 on connected pulley systems and friction blocks',
                    dueDate: 'Friday at 17:00 IST',
                    context: 'Assigned during lecture at timestamp 42:10.'
                }
            ]
        },
        smartNotesMarkdown: `# Newton's Laws of Motion & Free Body Diagrams
*Captured by ClassSarthi Classroom Intelligence Layer • Physics 11 • Dr. Alok Verma*

## 1. Newton's First Law: The Law of Inertia (05:32)
Every body continues in its state of rest or uniform motion in a straight line unless acted upon by a net external force.
$$\\sum \\vec{F}_{ext} = 0 \\iff \\vec{v} = \\text{constant}$$

### What is Inertia? (12:48)
- **Definition**: The inherent property of matter that resists changes to its current state of motion.
- **Quantitative Measure**: Mass ($m$) is the scalar measure of inertia. Greater mass means greater resistance to acceleration.
- **Reference Frames**: In an accelerating (non-inertial) frame, an apparent pseudo-force $\\vec{F}_{pseudo} = -m\\vec{a}_0$ acts opposite to the frame acceleration.

---

## 2. Free Body Diagrams & Normal Force (21:05)
A Free Body Diagram (FBD) isolates an object and identifies all external interactions acting directly on it:
1. **Gravity ($\vec{W} = m\vec{g}$)**: Always directed toward the Earth's center.
2. **Normal Reaction ($\vec{N}$)**: Contact force exerted by a surface, always **perpendicular** to the contact interface.
3. **Friction ($\vec{f}$)**: Opposes relative motion tangent to the surface ($f_k = \\mu_k N$).

For an object resting or sliding on a plane inclined at angle $\\theta$:
$$N = mg\\cos\\theta$$
$$F_{\\text{down slope}} = mg\\sin\\theta - f_k$$

---

## 3. Newton's Second Law & Distinction (31:42)
$$\\vec{F}_{net} = m\\vec{a}$$
> **Important Distinction from Lecture**: Force is the **cause** (interaction, measured in Newtons); Acceleration is the kinematic **effect** (rate of change of velocity, in $\\text{m/s}^2$). They are fundamentally distinct quantities.

---

## 4. Homework Assigned in Lecture (42:10)
- **Problems 4 through 9** from Chapter 5 of HC Verma on connected pulley systems.
- **Due Date**: Friday 5:00 PM IST.`
    },
    // =========================================================================
    // BENCHMARK LECTURE 2: CHEMISTRY 11 — VSEPR & CHEMICAL BONDING
    // =========================================================================
    {
        id: 'lec-che-101',
        subjectId: 'subj-che-11',
        subjectCode: 'CHE-11',
        subjectName: 'Chemistry 11 (Inorganic & Physical)',
        title: 'VSEPR Theory, Molecular Geometry & Hybridization',
        teacherName: 'Dr. Neha Sharma',
        teacherId: 'teacher-che',
        date: '2026-09-01',
        duration: '45 mins',
        summary: 'Detailed study of molecular geometries predicted by Valence Shell Electron Pair Repulsion (VSEPR) theory. Steric numbers, lone-pair distortions in ammonia and water, and orbital hybridization schemas (sp, sp², sp³).',
        topics: [
            'Lewis Structures & Octet Rule',
            'VSEPR Postulates',
            'Lone Pair Repulsion Hierarchy',
            'Hybridization ($sp, sp^2, sp^3$)',
            'Bond Angles in $CH_4, NH_3, H_2O$'
        ],
        timeline: [
            {
                id: 'tl-che-1',
                timestamp: '00:00',
                timestampSeconds: 0,
                title: 'Introduction & Why Molecules Form Specific Shapes',
                teacherQuote: 'Molecules are not flat representations on paper. They occupy 3D space driven by electrostatic repulsion between electron pairs.',
                notes: 'Electron pairs around a central atom repel one another and adopt spatial orientations that minimize mutual potential energy.',
                boardImageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
                keyTakeaway: '3D geometry is governed by minimizing electron cloud repulsion.'
            },
            {
                id: 'tl-che-2',
                timestamp: '14:30',
                timestampSeconds: 870,
                title: 'The VSEPR Repulsion Hierarchy',
                teacherQuote: 'The fundamental rule of VSEPR is: Lone Pair - Lone Pair repulsion is stronger than Lone Pair - Bond Pair repulsion, which is stronger than Bond Pair - Bond Pair repulsion.',
                notes: 'Repulsion order:\n$$\\text{LP - LP} > \\text{LP - BP} > \\text{BP - BP}$$\nBecause lone pairs are held by only one nucleus, their electron clouds spread out more widely in space.',
                formulaLatex: '\\text{LP-LP} > \\text{LP-BP} > \\text{BP-BP}',
                boardImageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
                keyTakeaway: 'Lone pairs exert greater repulsive force than bonding pairs.'
            },
            {
                id: 'tl-che-3',
                timestamp: '25:10',
                timestampSeconds: 1510,
                title: 'Comparison: Methane vs Ammonia vs Water Bond Angles',
                teacherQuote: 'Notice methane has 0 lone pairs and bond angle 109.5°. Ammonia has 1 lone pair which squeezes the N-H bonds to 107°. Water has 2 lone pairs squeezing the O-H bonds down to 104.5°.',
                notes: '$$\\text{CH}_4 (0\\text{ LP}) = 109.5^\\circ \\quad | \\quad \\text{NH}_3 (1\\text{ LP}) = 107^\\circ \\quad | \\quad \\text{H}_2\\text{O} (2\\text{ LP}) = 104.5^\\circ$$',
                formulaLatex: '\\theta(\\text{CH}_4) = 109.5^\\circ, \\; \\theta(\\text{NH}_3) = 107^\\circ, \\; \\theta(\\text{H}_2\\text{O}) = 104.5^\\circ',
                boardImageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
                keyTakeaway: 'Each additional lone pair reduces ideal tetrahedral bond angle by approximately 2.5°.'
            },
            {
                id: 'tl-che-4',
                timestamp: '41:50',
                timestampSeconds: 2510,
                title: 'Homework & Laboratory Worksheet',
                teacherQuote: 'Draw Lewis structures and state hybridization for PCl5, SF6, and XeF4 for next Tuesday.',
                notes: 'Worksheet on expanded octets and hybridization schemes (sp³d, sp³d²).',
                keyTakeaway: 'Due Tuesday: PCl5, SF6, XeF4 geometries.'
            }
        ],
        boardCaptures: [
            {
                id: 'bc-che-1',
                lectureId: 'lec-che-101',
                lectureTitle: 'VSEPR Theory, Molecular Geometry & Hybridization',
                subjectId: 'subj-che-11',
                subjectName: 'Chemistry 11',
                timestamp: '25:10',
                title: 'Tetrahedral vs Trigonal Pyramidal vs Bent Geometry',
                imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=900&auto=format&fit=crop&q=80',
                ocrLatex: 'SN = 4: \\; CH_4 (109.5^\\circ), \\; NH_3 (107^\\circ), \\; H_2O (104.5^\\circ)',
                conceptTag: 'VSEPR Theory',
                explanation: 'Blackboard sketch of electron lone-pair cloud repulsion in methane, ammonia, and water.'
            }
        ],
        audioTranscript: [
            {
                timestamp: '00:00',
                speaker: 'Dr. Neha Sharma',
                text: 'Welcome back. Today we explore VSEPR theory and hybridization in chemical bonding.'
            },
            {
                timestamp: '14:30',
                speaker: 'Dr. Neha Sharma',
                text: 'The repulsion order is lone pair-lone pair greater than lone pair-bond pair greater than bond pair-bond pair.'
            },
            {
                timestamp: '25:10',
                speaker: 'Dr. Neha Sharma',
                text: 'In ammonia, the single lone pair compresses the H-N-H bond angle from the tetrahedral 109.5 degrees down to 107 degrees.'
            },
            {
                timestamp: '41:50',
                speaker: 'Dr. Neha Sharma',
                text: 'For homework, please draw Lewis structures and determine hybridization for PCl5, SF6, and XeF4 for Tuesday.'
            }
        ],
        generalizedNotes: {
            explanation: 'VSEPR theory models molecular geometry based on electrostatic minimization between valence electron pairs. Steric number determines electron geometry, while the placement of lone pairs determines observable molecular shape.',
            importantConcepts: [
                {
                    name: 'Steric Number (SN)',
                    description: 'Sum of bonded atoms (sigma bonds) and lone pairs on the central atom.',
                    formulaLatex: '\\text{SN} = \\sigma + \\text{LP}'
                },
                {
                    name: 'VSEPR Repulsion Rule',
                    description: 'Lone pairs repel more strongly than bonding pairs because their electron cloud is concentrated near one nucleus.',
                    formulaLatex: '\\text{LP-LP} > \\text{LP-BP} > \\text{BP-BP}'
                }
            ],
            formulas: [
                {
                    name: 'Steric Number Formula',
                    latex: '\\text{SN} = \\text{Number of } \\sigma\\text{-bonds} + \\text{Number of lone pairs}',
                    explanation: 'Calculates steric coordination of central atom.'
                }
            ],
            examples: [
                {
                    problem: 'Explain why water has a bent structure with angle 104.5° despite having steric number 4.',
                    solution: 'Oxygen has 2 bond pairs and 2 lone pairs (SN = 4). The two lone pairs repel strongly (LP-LP and LP-BP), compressing the H-O-H angle from 109.5° to 104.5°.'
                }
            ],
            keyPoints: [
                'Lone pairs occupy more equatorial space in trigonal bipyramidal arrangements.',
                'Hybridization considers only sigma bonds and lone pairs; pi bonds use pure p orbitals.'
            ],
            diagrams: [],
            homeworkMentioned: [
                {
                    task: 'Determine hybridization & geometry for PCl5, SF6, XeF4',
                    dueDate: 'Next Tuesday',
                    context: 'Announced at 41:50.'
                }
            ]
        },
        smartNotesMarkdown: `# VSEPR Theory, Molecular Geometry & Hybridization
*ClassSarthi Lecture Capture • Chemistry 11 • Dr. Neha Sharma*

## 1. Core Postulate of VSEPR (14:30)
$$\\text{LP-LP} > \\text{LP-BP} > \\text{BP-BP}$$
Lone pairs are attracted to only one atomic nucleus, causing their charge clouds to spread wider in angular space than bonding pairs.

## 2. Geometry Comparison Table (25:10)
| Molecule | Steric No. | Bond Pairs | Lone Pairs | Ideal Angle | Actual Angle | Shape |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| $\\text{CH}_4$ | 4 | 4 | 0 | $109.5^\\circ$ | $109.5^\\circ$ | Tetrahedral |
| $\\text{NH}_3$ | 4 | 3 | 1 | $109.5^\\circ$ | $107.0^\\circ$ | Trigonal Pyramidal |
| $\\text{H}_2\\text{O}$ | 4 | 2 | 2 | $109.5^\\circ$ | $104.5^\\circ$ | Bent / Angular |

## 3. Homework Mentioned (41:50)
- Determine Lewis structures, shapes, and hybridization for $\\text{PCl}_5, \\text{SF}_6, \\text{XeF}_4$. Due Tuesday.`
    },
    // =========================================================================
    // BENCHMARK LECTURE 3: MATHEMATICS 11 — LIMITS & SQUEEZE THEOREM
    // =========================================================================
    {
        id: 'lec-mat-101',
        subjectId: 'subj-mat-11',
        subjectCode: 'MAT-11',
        subjectName: 'Mathematics 11 (Calculus & Functions)',
        title: 'Limits, Continuity & The Squeeze (Sandwich) Theorem',
        teacherName: 'Dr. R. D. Raman',
        teacherId: 'teacher-mat',
        date: '2026-08-31',
        duration: '45 mins',
        summary: 'Rigorous exploration of limits, indeterminate forms, geometric proof of standard trigonometric limit lim(x->0) sin(x)/x = 1, and the Squeeze (Sandwich) Theorem for evaluating non-trivial limits.',
        topics: [
            'Definition of Limit',
            'Indeterminate Forms',
            'Geometric Proof of $\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1$',
            'The Squeeze (Sandwich) Theorem',
            'Limits with Oscillating Functions'
        ],
        timeline: [
            {
                id: 'tl-mat-1',
                timestamp: '00:00',
                timestampSeconds: 0,
                title: 'Introduction to Calculus of Limits',
                teacherQuote: 'A limit tells us what value a function approaches, not necessarily what it equals at that exact point.',
                notes: 'Formal definition: $\\lim_{x \\to c} f(x) = L$ if for every $\\epsilon > 0$, there exists $\\delta > 0$ such that $0 < |x - c| < \\delta \\implies |f(x) - L| < \\epsilon$.',
                formulaLatex: '\\lim_{x \\to c} f(x) = L',
                keyTakeaway: 'Limits evaluate local behavior near a point without requiring definition at the point.'
            },
            {
                id: 'tl-mat-2',
                timestamp: '15:40',
                timestampSeconds: 940,
                title: 'Proof: $\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1$',
                teacherQuote: 'Using the unit circle, we compare the area of triangle OAB, circular sector OAB, and outer triangle OAT. This yields cos(x) < sin(x)/x < 1.',
                notes: 'Geometric sandwich:\n$$\\cos x < \\frac{\\sin x}{x} < 1 \\quad \\text{for } 0 < |x| < \\frac{\\pi}{2}$$\nAs $x \\to 0$, $\\cos x \\to 1$. By Sandwich Theorem, $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$.',
                formulaLatex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1',
                keyTakeaway: 'Fundamental limit from which all trigonometric derivatives originate.'
            },
            {
                id: 'tl-mat-3',
                timestamp: '24:10',
                timestampSeconds: 1450,
                title: 'The Squeeze (Sandwich) Theorem Statement',
                teacherQuote: 'If g(x) <= f(x) <= h(x) near c, and both g(x) and h(x) approach L as x approaches c, then f(x) has no choice but to approach L as well.',
                notes: 'If $g(x) \\le f(x) \\le h(x)$ and $\\lim_{x\\to c} g(x) = \\lim_{x\\to c} h(x) = L$, then:\n$$\\lim_{x\\to c} f(x) = L$$',
                formulaLatex: 'g(x) \\le f(x) \\le h(x) \\implies \\lim_{x\\to c} f(x) = L',
                keyTakeaway: 'The Squeeze theorem confines unknown functions between two known bounding functions.'
            },
            {
                id: 'tl-mat-4',
                timestamp: '42:30',
                timestampSeconds: 2550,
                title: 'Homework Exercises',
                teacherQuote: 'Solve exercises 1 through 8 on trigonometric limits from Thomas Calculus page 112 for Friday.',
                notes: 'Homework: Thomas Calculus Ch 2 exercises 1-8 on Squeeze Theorem.',
                keyTakeaway: 'Thomas Calculus Ch 2 exercises due Friday.'
            }
        ],
        boardCaptures: [
            {
                id: 'bc-mat-1',
                lectureId: 'lec-mat-101',
                lectureTitle: 'Limits, Continuity & The Squeeze (Sandwich) Theorem',
                subjectId: 'subj-mat-11',
                subjectName: 'Mathematics 11',
                timestamp: '15:40',
                title: 'Geometric Unit Circle Proof of Trig Limit',
                imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=900&auto=format&fit=crop&q=80',
                ocrLatex: '\\cos(x) < \\frac{\\sin(x)}{x} < 1 \\implies \\lim_{x\\to 0} \\frac{\\sin(x)}{x} = 1',
                conceptTag: 'Trigonometric Limits',
                explanation: 'Unit circle geometric inequality bounding circular sector area between inscribed and circumscribed right triangles.'
            }
        ],
        audioTranscript: [
            {
                timestamp: '00:00',
                speaker: 'Dr. R. D. Raman',
                text: 'Good morning students. Today we prove the fundamental limit of calculus.'
            },
            {
                timestamp: '15:40',
                speaker: 'Dr. R. D. Raman',
                text: 'From the unit circle geometry, cos x is strictly less than sin x over x which is less than 1.'
            },
            {
                timestamp: '24:10',
                speaker: 'Dr. R. D. Raman',
                text: 'The Squeeze Theorem guarantees that when two boundary functions converge to the same limit L, the trapped function must also converge to L.'
            },
            {
                timestamp: '42:30',
                speaker: 'Dr. R. D. Raman',
                text: 'Complete exercises 1 through 8 from Thomas Calculus page 112 for Friday.'
            }
        ],
        generalizedNotes: {
            explanation: 'Limits examine mathematical behavior arbitrarily close to a point. When substitution yields indeterminate ratios like 0/0, bounding theorems such as the Squeeze Theorem resolve the exact value.',
            importantConcepts: [
                {
                    name: 'The Squeeze Theorem',
                    description: 'Traps a target function between two bounding functions possessing identical limits.',
                    formulaLatex: 'g(x) \\le f(x) \\le h(x)'
                }
            ],
            formulas: [
                {
                    name: 'Standard Trig Limit',
                    latex: '\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1',
                    explanation: 'Valid when x is expressed in radians.'
                }
            ],
            examples: [
                {
                    problem: 'Evaluate lim(x->0) x² sin(1/x).',
                    solution: 'Since -1 <= sin(1/x) <= 1, multiplying by x² gives -x² <= x² sin(1/x) <= x². Since lim(x->0) -x² = lim(x->0) x² = 0, by Squeeze Theorem the limit is 0.',
                    latex: '\\lim_{x\\to 0} x^2 \\sin(1/x) = 0'
                }
            ],
            keyPoints: ['Angle x must be in radians when using lim(x->0) sin(x)/x = 1.'],
            diagrams: [],
            homeworkMentioned: [
                {
                    task: 'Thomas Calculus Ch 2 exercises 1-8',
                    dueDate: 'Friday',
                    context: 'Given at 42:30.'
                }
            ]
        },
        smartNotesMarkdown: `# Limits, Continuity & The Squeeze Theorem
*ClassSarthi Lecture Capture • Mathematics 11 • Dr. R. D. Raman*

## 1. Standard Trigonometric Limit (15:40)
$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1 \\quad (x \\text{ in radians})$$
$$\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2} = \\frac{1}{2}$$

## 2. The Squeeze (Sandwich) Theorem (24:10)
If $g(x) \\le f(x) \\le h(x)$ for all $x$ in an open interval containing $c$ (except possibly at $c$ itself), and:
$$\\lim_{x \\to c} g(x) = \\lim_{x \\to c} h(x) = L$$
Then:
$$\\lim_{x \\to c} f(x) = L$$

## 3. Homework Mentioned (42:30)
- Thomas Calculus exercises 1-8 on Squeeze Theorem due Friday.`
    }
];
exports.seedBoardCaptures = exports.seedLectures.flatMap(l => l.boardCaptures || []);
// =========================================================================
// MASTERY QUIZZES INDEXED BY LECTURE ID
// =========================================================================
exports.seedMasteryQuizzes = {
    'lec-phy-101': {
        id: 'quiz-phy-101',
        lectureId: 'lec-phy-101',
        lectureTitle: "Newton's Laws of Motion & Free Body Diagrams",
        subjectId: 'subj-phy-11',
        questions: [
            {
                id: 'q1',
                question: "According to Newton's First Law, what condition is required for a body to remain in uniform motion along a straight line?",
                options: [
                    'A constant non-zero external force must be continuously applied.',
                    'The net external force acting on the body must be exactly zero (ΣF = 0).',
                    'Friction must equal the gravitational pull.',
                    'The mass of the object must be zero.'
                ],
                correctIndex: 1,
                explanation: "Newton's First Law states that if ΣF = 0, acceleration a = 0, so velocity v remains constant.",
                conceptTag: "Newton's First Law",
                questionType: 'concept',
                timestampRef: '05:32'
            },
            {
                id: 'q2',
                question: 'Which physical quantity is the direct scalar measure of an object\'s inertia?',
                options: [
                    'Velocity',
                    'Linear momentum',
                    'Inertial mass (m)',
                    'Net force applied'
                ],
                correctIndex: 2,
                explanation: 'Inertia is the resistance to changes in motion, and mass m is its scalar quantitative measure.',
                conceptTag: 'Inertia',
                questionType: 'concept',
                timestampRef: '12:48'
            },
            {
                id: 'q3',
                question: 'What is the magnitude of the Normal Reaction Force (N) acting on a mass m on an inclined plane of angle θ?',
                options: [
                    'N = mg',
                    'N = mg sin(θ)',
                    'N = mg cos(θ)',
                    'N = mg tan(θ)'
                ],
                correctIndex: 2,
                explanation: 'Resolving perpendicular to the incline, the surface balances the perpendicular component of gravity: N = mg cos(θ).',
                conceptTag: 'Free Body Diagram',
                questionType: 'formula',
                timestampRef: '21:05'
            },
            {
                id: 'q4',
                question: 'Why are force and acceleration fundamentally distinct physical concepts?',
                options: [
                    'They have different units, but physically describe the exact same quantity.',
                    'Force is the interaction causing motion (measured in Newtons), while acceleration is the kinematic rate of change of velocity produced (in m/s²).',
                    'Force only acts on moving bodies, whereas acceleration acts on stationary bodies.',
                    'Acceleration creates force, not vice versa.'
                ],
                correctIndex: 1,
                explanation: 'Force is an interaction (cause, [MLT⁻²]), whereas acceleration is the resulting kinematic rate of velocity change (effect, [LT⁻²]).',
                conceptTag: 'Force vs acceleration',
                questionType: 'reasoning',
                timestampRef: '21:05',
                misconceptionHint: 'Treating force and acceleration as identical is a common error. Force causes acceleration through F = ma.'
            },
            {
                id: 'q5',
                question: "How does Newton's Second Law define the relationship between net force and momentum?",
                options: [
                    'Net force is the time integral of acceleration.',
                    'Net force is equal to the time rate of change of linear momentum (F = dp/dt).',
                    'Net force is always constant for any moving mass.',
                    'Net force equals kinetic energy divided by time.'
                ],
                correctIndex: 1,
                explanation: 'F_net = dp/dt. When mass m is constant, this simplifies to F_net = m(dv/dt) = ma.',
                conceptTag: "Newton's Second Law",
                questionType: 'formula',
                timestampRef: '31:42'
            },
            {
                id: 'q6',
                question: 'A 5 kg block slides down a frictionless 30° inclined plane (g = 9.8 m/s²). What is its acceleration down the slope?',
                options: [
                    '9.80 m/s²',
                    '4.90 m/s²',
                    '8.49 m/s²',
                    '2.45 m/s²'
                ],
                correctIndex: 1,
                explanation: 'a = g sin(30°) = 9.8 × 0.5 = 4.90 m/s².',
                conceptTag: "Newton's Second Law",
                questionType: 'numerical',
                timestampRef: '31:42'
            }
        ]
    },
    'lec-che-101': {
        id: 'quiz-che-101',
        lectureId: 'lec-che-101',
        lectureTitle: 'VSEPR Theory, Molecular Geometry & Hybridization',
        subjectId: 'subj-che-11',
        questions: [
            {
                id: 'q-che-1',
                question: 'Which is the correct order of electron pair repulsive forces according to VSEPR theory?',
                options: [
                    'Bond Pair - Bond Pair > Lone Pair - Bond Pair > Lone Pair - Lone Pair',
                    'Lone Pair - Lone Pair > Lone Pair - Bond Pair > Bond Pair - Bond Pair',
                    'Lone Pair - Bond Pair > Lone Pair - Lone Pair > Bond Pair - Bond Pair',
                    'All electron pair repulsions are equal.'
                ],
                correctIndex: 1,
                explanation: 'LP-LP > LP-BP > BP-BP because lone pairs are held by only one nucleus and occupy greater angular space.',
                conceptTag: 'VSEPR Repulsion Order',
                questionType: 'concept',
                timestampRef: '14:30'
            },
            {
                id: 'q-che-2',
                question: 'Why is the bond angle in ammonia (NH3) 107° rather than the ideal tetrahedral angle of 109.5°?',
                options: [
                    'The nitrogen atom is too small.',
                    'The lone pair on nitrogen exerts stronger repulsive force on the N-H bond pairs, compressing the bond angle.',
                    'Hydrogen atoms attract each other.',
                    'Nitrogen is sp² hybridized in ammonia.'
                ],
                correctIndex: 1,
                explanation: 'The lone pair on N repels the 3 bonding pairs, decreasing the angle from 109.5° to 107°.',
                conceptTag: 'Bond Angle Distortion',
                questionType: 'reasoning',
                timestampRef: '25:10'
            }
        ]
    },
    'lec-mat-101': {
        id: 'quiz-mat-101',
        lectureId: 'lec-mat-101',
        lectureTitle: 'Limits, Continuity & The Squeeze (Sandwich) Theorem',
        subjectId: 'subj-mat-11',
        questions: [
            {
                id: 'q-mat-1',
                question: 'What is the value of lim(x->0) [sin(x)/x] when x is measured in radians?',
                options: ['0', '1', 'Undefined', 'Infinity'],
                correctIndex: 1,
                explanation: 'The fundamental trigonometric limit proved via the Squeeze Theorem equals 1.',
                conceptTag: 'Trigonometric Limits',
                questionType: 'concept',
                timestampRef: '15:40'
            }
        ]
    }
};
// =========================================================================
// INITIAL STUDENT PERFORMANCE & TOPIC MASTERY PROFILES
// =========================================================================
exports.seedConceptMastery = {
    'student-g11-1': [
        {
            concept: "Newton's First Law",
            subjectId: 'subj-phy-11',
            masteryScore: 92,
            timesTested: 3,
            needsRevision: false,
            lastTestedDate: '2026-09-02'
        },
        {
            concept: 'Inertia',
            subjectId: 'subj-phy-11',
            masteryScore: 88,
            timesTested: 3,
            needsRevision: false,
            lastTestedDate: '2026-09-02'
        },
        {
            concept: "Newton's Second Law",
            subjectId: 'subj-phy-11',
            masteryScore: 45,
            timesTested: 2,
            needsRevision: true,
            lastTestedDate: '2026-09-02'
        },
        {
            concept: 'Force vs acceleration',
            subjectId: 'subj-phy-11',
            masteryScore: 40,
            timesTested: 2,
            needsRevision: true,
            lastTestedDate: '2026-09-02'
        },
        {
            concept: 'Free Body Diagram',
            subjectId: 'subj-phy-11',
            masteryScore: 78,
            timesTested: 3,
            needsRevision: false,
            lastTestedDate: '2026-09-02'
        }
    ]
};
// =========================================================================
// INITIAL STUDENT LECTURE PROGRESS (UNFINISHED & COMPLETED SESSIONS)
// =========================================================================
exports.seedStudentLectureProgress = {
    'student-g11-1': {
        'lec-phy-101': {
            lectureId: 'lec-phy-101',
            completed: false,
            lastTimestamp: '21:05',
            progressPercent: 65,
            lastViewedAt: '2026-09-02T16:30:00',
            quizCompleted: true,
            quizScore: 4,
            quizTotal: 6,
            understoodConcepts: ["Newton's First Law", 'Inertia', 'Free Body Diagram'],
            weakConcepts: ["Newton's Second Law", 'Force vs acceleration'],
            recommendations: [
                'Review the difference between Net Force and Acceleration explained around 21:05 and 31:42.',
                'Re-solve numerical problem for block sliding with friction on inclined plane.'
            ],
            lastMistakeReview: {
                questionNumber: 4,
                studentAnswer: 'They have different units, but physically describe the exact same quantity.',
                correctAnswer: 'Force is the interaction causing motion (measured in Newtons), while acceleration is the kinematic rate of change of velocity produced (in m/s²).',
                misconception: 'Your answer treated force and acceleration as the same physical quantity. In lecture, Dr. Verma emphasized around 21:05 and 31:42 that Force is the cause, and acceleration is the effect.',
                timestampRef: '21:05'
            }
        }
    }
};
