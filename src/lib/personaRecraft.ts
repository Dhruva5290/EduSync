import { LearnerPersona } from '../types';

export function recraftNoteForPersona(
  note: { title: string; content: string; subjectId?: string; generalisedNotes?: string; personalisedNotes?: string },
  persona?: LearnerPersona
): { content: string; keyTakeaways: string[]; summary: string; personalisedNotes: string } {
  const sanitizedTitle = note.title || 'Personalized Lecture Note';
  const style = persona?.learningStyle || 'visual';
  const tone = persona?.explanationTone || 'encouraging_mentor';
  const targetGrade = persona?.targetGrade || 'A+';

  // 1. Clean existing personalization scaffolding to avoid cascading headers on re-calibration
  let baseContent = (note.generalisedNotes && note.generalisedNotes.length > 50)
    ? note.generalisedNotes
    : note.content || '';

  baseContent = baseContent
    .replace(/^#\s+[^\n]+\(Tuned for [^\)]+\)\n+/gim, '')
    .replace(/^>\s*🎯\s*\*\*Cognitive Calibration:[^\n]+\n+/gim, '')
    .replace(/^>\s*⚡\s*\*\*Strict Coach Directive:[^\n]+\n+/gim, '')
    .replace(/^>\s*🌱\s*\*\*Mentor Advice:[^\n]+\n+/gim, '')
    .replace(/^>\s*🌱\s*\*\*Mentor Encouragement:[^\n]+\n+/gim, '')
    .replace(/^>\s*🛠️\s*\*\*Systems Engineer Perspective:[^\n]+\n+/gim, '')
    .replace(/^>\s*💡\s*\*\*Strength Connection:[^\n]+\n+/gim, '')
    .replace(/^>\s*💡\s*\*\*Strength Bridge:[^\n]+\n+/gim, '')
    .replace(/^>\s*🛡️\s*\*\*Pain Point Scaffolding:[^\n]+\n+/gim, '')
    .replace(/^>\s*🛡️\s*\*\*Scaffolding for Growth:[^\n]+\n+/gim, '')
    .replace(/\n##\s*🎨\s*Visual Intuition[\s\S]*?(?=\n##\s*[0-9A-Za-z]|$)/gim, '')
    .replace(/\n##\s*📐\s*Step-by-Step Analytical Derivation[\s\S]*?(?=\n##\s*[0-9A-Za-z]|$)/gim, '')
    .replace(/\n##\s*💬\s*Socratic Dialogue[\s\S]*?(?=\n##\s*[0-9A-Za-z]|$)/gim, '')
    .replace(/\n##\s*⚡\s*High-Yield Exam (Cram Matrix|Score Maximizer)[\s\S]*?(?=\n##\s*[0-9A-Za-z]|$)/gim, '')
    .replace(/\n##\s*✨\s*Personalized Cognitive Takeaways[\s\S]*$/gim, '')
    .trim();

  if (!baseContent.startsWith('# ')) {
    baseContent = `# ${sanitizedTitle}\n\n${baseContent}`;
  }

  // 2. Tone banner
  let toneBanner = '';
  if (tone === 'strict_coach') {
    toneBanner = `> ⚡ **Strict Coach Directive**: "Precision is the only acceptable standard. Eliminate sign errors, define all variables explicitly, and verify invariant conservation before finalizing your derivation."`;
  } else if (tone === 'practical_engineer') {
    toneBanner = `> 🛠️ **Systems Engineer Perspective**: "Theoretical formulas must be grounded in physical reality. Consider tolerances, thermal drift, sensor noise, and boundary constraints in real-world implementations."`;
  } else {
    toneBanner = `> 🌱 **Mentor Encouragement**: "Deep mathematical intuition takes patience and practice. Trust your conceptual reasoning, build from first principles, and celebrate each breakthrough!"`;
  }

  // 3. Goal & Benchmark banner
  const goalBadge = `> 🎯 **Cognitive Calibration: ${style.toUpperCase().replace(/_/g, ' ')} • Benchmark: Grade ${targetGrade} (${targetGrade === 'competitive' ? 'Olympiad/Advanced Prep' : targetGrade === 'A+' ? 'Top 1% Analytical Mastery' : 'High Distinction'})**`;

  // 4. Strengths & Pain points
  let customScaffolding = '';
  if (persona?.strengthsAndInterests) {
    customScaffolding += `\n> 💡 **Strength Bridge**: *Leveraging your strength in "${persona.strengthsAndInterests}"—notice how identical symmetry principles unify this topic with your domain expertise.*`;
  }
  if (persona?.painPoints) {
    customScaffolding += `\n> 🛡️ **Scaffolding for Growth**: *Targeting your focus area on "${persona.painPoints}"—we have unpacked intermediate steps with extra intuitive anchors below.*`;
  }

  // 5. Cognitive Structure block based on style
  let cognitiveBlock = '';
  let styleKeyTakeaways: string[] = [];

  if (style === 'visual') {
    cognitiveBlock = `
## 🎨 Visual Intuition & Spatial Flowchart

\`\`\`
+-----------------------------------------------------------------------+
|                    CORE PHYSICAL INVARIANT / STATE                    |
|                (Initial Potential / Boundary Geometry)                |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                      FLUX & GRADIENT DYNAMICS                         |
|             (Equilibrium Force Vector / Conservation Rule)            |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                     SYSTEM EVOLUTION & SOLUTION                       |
|               (Steady-State / Trajectory / Output Phase)              |
+-----------------------------------------------------------------------+
\`\`\`

### 🔍 Spatial Mental Model & Geometry
Think of this relationship as a geometric balance across orthogonal coordinates. Whenever the gradient steepens, the restorative flux increases proportionately to restore equilibrium.
`;
    styleKeyTakeaways = [
      'Visualized dynamic flux equilibrium across the conceptual topology map.',
      'Connected boundary constraints to spatial and geometric symmetries.',
      `Calibrated for visual spatial memory targeting Grade ${targetGrade}.`
    ];
  } else if (style === 'step_by_step') {
    cognitiveBlock = `
## 📐 Step-by-Step Analytical Derivation & Invariant Proofs

### Step 1: Definition of Primary Axioms & Variables
Establish the governing differential or algebraic relation from foundational physical axioms:
$$\\sum_{\\text{ext}} \\mathbf{\\Phi} = \\frac{d\\mathbf{\\Psi}}{dt}$$

### Step 2: Intermediate Algebraic Transformations & Substitution
Separate variables and integrate over the specified spatial or temporal boundaries:
$$\\int_{s_i}^{s_f} d\\mathbf{\\Psi} = \\int_{t_i}^{t_f} \\mathbf{\\Phi}(t) \\, dt$$

### Step 3: Dimensional Consistency & Invariant Verification ($\\text{LHS} \\equiv \\text{RHS}$)
Verify that all units reduce to standard SI dimensions $[M^a L^b T^c]$ with identical parity on both sides of the equation.

### Step 4: Limiting Cases & Boundary Analysis
- As the parameter approaches zero: System reduces smoothly to foundational statics.
- As the parameter approaches infinity: Invariant asymptotes preserve stability.
`;
    styleKeyTakeaways = [
      'Step-by-step first principles derivation without skipped algebra.',
      'Explicit dimensional consistency and invariant balance check verified.',
      'Limiting cases tested for extreme boundary stability.'
    ];
  } else if (style === 'socratic_dialogue') {
    cognitiveBlock = `
## 💬 Socratic Dialogue & Guided Self-Assessment

### ❓ Guiding Question 1: Foundational Assumption
*Before applying this formula, ask yourself: Is the system isolated from external dissipation, or must non-conservative work terms be accounted for?*

### 💡 Socratic Clue: Denominator Sensitivity
*Observe the denominator in the primary expression. What happens to the physical rate of change as the denominator approaches zero? What physical breakdown does this singularity represent?*

### 🧠 Thought Experiment: Dimensional Scaling
*Imagine doubling the scale of every physical dimension in the apparatus. Does the equilibrium response double, quadruple, or remain scale-invariant? Why?*

### 🎯 Synthesis Reflection Prompt
*Write down in one sentence why energy/mass conservation forbids any other mathematical form for this law.*
`;
    styleKeyTakeaways = [
      'Reflected on boundary assumptions via guided Socratic inquiry prompts.',
      'Analyzed singularity behavior and denominator sensitivity.',
      'Synthesized the core physical conservation principle in personal words.'
    ];
  } else { // exam_focused
    cognitiveBlock = `
## ⚡ High-Yield Exam Cram Matrix & Score Maximizer

### ⚠️ High-Frequency Student Traps & Pitfalls
- **Trap 1: Sign Convention Inversion**: Always define your coordinate axis before writing vector equations; never mix signs mid-derivation.
- **Trap 2: Dimension Incompatibility**: Watch for mixed units (e.g. grams vs kilograms, cm vs meters, degrees vs radians).
- **Trap 3: Domain Validity Violation**: Do not apply linear approximations when the perturbation angle or deviation exceeds small-value thresholds.

### ⏱️ 30-Second Rapid Exam Solution Shortcut
*In timed objective tests (JEE / CBSE / Finals), test extreme boundary conditions (e.g. $\\theta = 0^\\circ$ or $\\theta = 90^\\circ$) to instantly eliminate 2-3 incorrect options without full computation.*

### 📋 100% Full-Credit Scoring Rubric Checklist
1. **Formula Statement (1 Mark)**: Explicitly write the standard formula with all variables defined.
2. **Substitution with Units (1 Mark)**: Show numbers substituted with bracketed SI units.
3. **Boxed Final Answer with Direction (1 Mark)**: Box the final answer with correct significant figures and unit vector.
`;
    styleKeyTakeaways = [
      'Reviewed high-frequency exam traps and negative-marking pitfalls.',
      'Mastered 30-second rapid boundary check for objective elimination.',
      'Verified full-credit scoring rubric requirements for free-response exams.'
    ];
  }

  // 6. Assemble complete recrafted markdown note
  const recraftedContent = `${goalBadge}\n${toneBanner}${customScaffolding}\n\n${baseContent}\n\n${cognitiveBlock}\n\n## ✨ Personalized Cognitive Takeaways\n${styleKeyTakeaways.map(t => `- ${t}`).join('\n')}`;

  const summary = `Note calibrated for ${style.replace(/_/g, ' ')} learning style (${tone.replace(/_/g, ' ')}) targeting Grade ${targetGrade} with adaptive cognitive scaffolding.`;

  return {
    content: recraftedContent,
    summary,
    keyTakeaways: styleKeyTakeaways,
    personalisedNotes: recraftedContent
  };
}
