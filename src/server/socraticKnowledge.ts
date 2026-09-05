/**
 * Comprehensive Socratic AI Tutor Knowledge Engine
 * Provides diverse, rigorous, and pedagogical academic responses across:
 * - Physics (Mechanics, Fluids, Thermo, Electromagnetism, Optics, Modern Physics)
 * - Chemistry (Organic Mechanisms, Physical Thermo/Kinetics, Inorganic/Bonding)
 * - Mathematics (Calculus, Linear Algebra, Differential Equations, Probability, Vectors)
 * - Computer Science & Engineering (Pointers, Data Structures, Algorithms, OOP, Logic)
 * 
 * Includes intent-based response variations (conceptual, real-world examples, formula breakdowns,
 * practice problems, step-by-step strategies, and simple intuitive analogies)
 * and learner persona scaffolding.
 */

export interface SocraticTopic {
  id: string;
  category: 'Physics' | 'Chemistry' | 'Mathematics' | 'Computer Science' | 'General';
  title: string;
  keywords: string[];
  intents: {
    conceptual: string;
    example: string;
    formula: string;
    practice: string;
    strategy: string;
    simplified: string;
  };
  reflection: string;
}

export const SOCRATIC_KNOWLEDGE_BASE: SocraticTopic[] = [
  // ==========================================
  // PHYSICS — MECHANICS & DYNAMICS
  // ==========================================
  {
    id: 'force-and-newton',
    category: 'Physics',
    title: "Newton's Laws of Motion & Force Dynamics",
    keywords: ['force', 'newton', 'acceleration', 'inertia', 'fbd', 'free body', 'normal force', 'friction', 'tension'],
    intents: {
      conceptual: `Great physics inquiry! The fundamental cornerstone of dynamics is distinguishing **cause** from **kinematic effect**:

1. **Force (F⃗)** is the **cause**: a physical interaction (push, pull, field interaction) measured in Newtons ($N = \\text{kg}\\cdot\\text{m}/\\text{s}^2$).
2. **Acceleration (a⃗)** is the **kinematic effect**: the time-rate of change of velocity ($d\\vec{v}/dt$ in $\\text{m}/\\text{s}^2$).

By Newton's Second Law:
$$\\sum \\vec{F} = m\\vec{a}$$

Acceleration occurs **only** when there is a non-zero net unbalanced force. If $\\sum \\vec{F} = 0$, the body maintains constant velocity (Newton's First Law).`,

      example: `Let's examine a real-world scenario with a **1000 kg electric vehicle** accelerating from rest to $20\\text{ m/s}$ in $5\\text{ seconds}$:

1. **Calculate Required Acceleration**:
   $$a = \\frac{\\Delta v}{\\Delta t} = \\frac{20 - 0}{5} = 4\\text{ m/s}^2$$

2. **Determine Net Horizontal Force**:
   $$F_{\\text{net}} = m \\cdot a = 1000\\text{ kg} \\times 4\\text{ m/s}^2 = 4000\\text{ N}$$

Where does this $4000\\text{ N}$ forward force come from? By **Newton's Third Law**, the tires push backward on the pavement with $4000\\text{ N}$, and static friction between the road and rubber pushes the vehicle forward with an equal and opposite $4000\\text{ N}$!`,

      formula: `Here is the mathematical and dimensional breakdown for Force:

- **Vector Form**: $\\sum \\vec{F} = \\frac{d\\vec{p}}{dt} = m\\frac{d\\vec{v}}{dt} + \\vec{v}\\frac{dm}{dt}$ (simplifies to $\\vec{F} = m\\vec{a}$ for constant mass).
- **Frictional Force**: Static $f_s \\le \\mu_s N$; Kinetic $f_k = \\mu_k N$ (opposes relative motion).
- **Gravitational Weight**: $\\vec{W} = m\\vec{g}$ directed toward the center of the planet.
- **Dimensional Formula**: $[M^1 L^1 T^{-2}]$.
- **SI Units**: Newton ($1\\text{ N} = 1\\text{ kg}\\cdot\\text{m/s}^2$).`,

      practice: `**Practice Challenge Problem**:
A $5\\text{ kg}$ block rests on a horizontal table where the coefficient of static friction is $\\mu_s = 0.4$ and kinetic friction is $\\mu_k = 0.3$. Take $g = 9.8\\text{ m/s}^2$.

A horizontal pulling force of $15\\text{ N}$ is applied to the block.
1. What is the maximum static friction force the surface can supply?
2. Does the block move? What is the actual friction force acting on it?

*Hint: Calculate $f_{s,\\max} = \\mu_s m g$ before assuming the block accelerates!*`,

      strategy: `**Systematic 4-Step Strategy for Solving Any Force Problem**:

1. **Isolate the System & Draw the Free Body Diagram (FBD)**:
   Draw the body as a dot or simple block. Show all contact forces (Normal $N$, Tension $T$, Friction $f$) and field forces (Gravity $mg$).
2. **Select an Intelligent Coordinate System**:
   Align one axis along the direction of actual or anticipated acceleration (e.g., parallel to the inclined plane).
3. **Resolve Non-Aligned Vectors**:
   Break forces into orthogonal components: $F_x = F\\cos\\theta$, $F_y = F\\sin\\theta$.
4. **Apply Newton's Second Law Independently**:
   $$\\sum F_x = m a_x \\quad \\text{and} \\quad \\sum F_y = m a_y$$`,

      simplified: `Think of Force and Acceleration like **stepping on a car's gas pedal**:

- **Force** is your foot pushing the pedal down (the effort).
- **Mass** is how heavy the car is (how stubborn it is to change speed).
- **Acceleration** is the speedometer needle sweeping upwards (the result).

If you push an empty shopping cart and a loaded truck with the exact same strength, the light cart shoots forward rapidly, while the heavy truck barely creeps. Same cause (Force), totally different response (Acceleration) because of Mass!`
    },
    reflection: 'When an object moves in a circular path at constant speed, its velocity direction changes every millisecond. Does this mean a net force must be acting on it? Why or why not?'
  },

  {
    id: 'circular-motion-gravitation',
    category: 'Physics',
    title: 'Circular Motion, Centripetal Force & Gravitation',
    keywords: ['circular', 'centripetal', 'centrifugal', 'gravitation', 'orbit', 'kepler', 'gravity', 'satellite', 'escape velocity'],
    intents: {
      conceptual: `In uniform circular motion, speed $|\\vec{v}|$ is constant, but velocity $\\vec{v}$ continuously changes direction toward the center:

- **Centripetal Acceleration**:
  $$a_c = \\frac{v^2}{r} = \\omega^2 r$$
- **Centripetal Force**: Not a new mystical force! It is simply the net radial force supplied by real physical forces (gravity, tension, friction, or normal force):
  $$F_c = \\frac{m v^2}{r}$$

In orbital mechanics, **Newton's Universal Gravitation** provides this exact centripetal force:
$$G\\frac{M m}{r^2} = \\frac{m v^2}{r} \\implies v_{\\text{orbit}} = \\sqrt{\\frac{GM}{r}}$$`,

      example: `Consider the **International Space Station (ISS)** orbiting Earth at altitude $h = 400\\text{ km}$ ($r = 6.77 \\times 10^6\\text{ m}$):

Using $G = 6.674 \\times 10^{-11}\\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$ and $M_{\\text{Earth}} = 5.972 \\times 10^{24}\\text{ kg}$:
$$v = \\sqrt{\\frac{GM}{r}} \\approx 7.67\\text{ km/s} \\quad (\\approx 27,600\\text{ km/h})$$

At this tremendous speed, the ISS completes a full orbit around the Earth every **92 minutes**! The astronauts are not in "zero gravity" (Earth's gravitational pull is still $\\approx 89\\%$ of surface value); rather, they are in perpetual free-fall together with the station.`,

      formula: `**Key Equations of Circular Motion & Gravitation**:

- **Centripetal Acceleration**: $a_c = \\frac{v^2}{r} = \\omega^2 r = \\frac{4\\pi^2 r}{T^2}$
- **Newton's Law of Gravitation**: $F_g = G\\frac{m_1 m_2}{r^2}$ (Dimensional: $[M^{-1} L^3 T^{-2}]$)
- **Escape Velocity**: $v_e = \\sqrt{\\frac{2GM}{R}} = \\sqrt{2gR} \\approx 11.2\\text{ km/s}$ on Earth
- **Kepler's Third Law**: $T^2 = \\left(\\frac{4\\pi^2}{GM}\\right) r^3 \\implies T^2 \\propto r^3$`,

      practice: `**Conceptual Check**:
A car rounds an unbanked circular curve of radius $50\\text{ m}$ on a rainy road with coefficient of static friction $\\mu_s = 0.2$.
1. What provides the centripetal force preventing the car from skidding outward?
2. What is the maximum safe speed ($v_{\\max}$) the car can maintain without sliding? (Take $g = 9.8\\text{ m/s}^2$).`,

      strategy: `**How to Analyze Any Orbit or Circular Motion Problem**:
1. Identify the center of the circular trajectory.
2. Sum all real physical forces acting strictly along the radial axis toward the center:
   $$\\sum F_{\\text{radial}} = m\\frac{v^2}{r}$$
3. For banked tracks without friction: $N\\sin\\theta = m\\frac{v^2}{r}$ and $N\\cos\\theta = mg \\implies \\tan\\theta = \\frac{v^2}{rg}$.`,

      simplified: `Imagine swinging a bucket of water on a rope in a circle. Your arm pulls inward on the rope (centripetal force). If the rope snaps, the bucket doesn't fly straight outward—it flies off tangent to the circle, continuing in the direction it was already heading at that instant!`
    },
    reflection: 'If Earth’s mass doubled while its orbital radius around the Sun remained unchanged, would Earth take longer, shorter, or the same time to complete one year?'
  },

  {
    id: 'work-energy-momentum',
    category: 'Physics',
    title: 'Work-Energy Theorem, Power & Momentum Conservation',
    keywords: ['work', 'energy', 'kinetic', 'potential', 'momentum', 'collision', 'conservation', 'elastic', 'power'],
    intents: {
      conceptual: `Energy and Momentum are nature's supreme invariants:

1. **Work-Energy Theorem**:
   $$W_{\\text{net}} = \\Delta K = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2$$
   Work done by all forces equals the change in kinetic energy.
2. **Conservation of Mechanical Energy**:
   If only conservative forces (like gravity or spring forces) do work:
   $$K_i + U_i = K_f + U_f$$
3. **Conservation of Linear Momentum**:
   When external force $\\sum \\vec{F}_{\\text{ext}} = 0$:
   $$\\vec{P}_{\\text{total}} = \\sum m_i \\vec{v}_i = \\text{constant}$$`,

      example: `**Rollercoaster Loop Calculation**:
A cart of mass $m$ starts from rest at height $h$ on a frictionless track and enters a vertical circular loop of radius $R$:

To maintain contact at the loop's apex:
- Minimum speed at top: $v_{\\text{top}} = \\sqrt{gR}$
- By Conservation of Energy:
  $$m g h = m g (2R) + \\frac{1}{2} m v_{\\text{top}}^2 = 2mgR + \\frac{1}{2}mgR = 2.5 mgR$$
  $$\\implies h_{\\min} = 2.5 R$$

The cart must drop from at least $2.5$ times the loop radius to not fall off the track!`,

      formula: `**Core Energy & Momentum Formulas**:

- **Work**: $W = \\int \\vec{F} \\cdot d\\vec{r} = F d \\cos\\theta$ (measured in Joules, $J$)
- **Power**: $P = \\frac{dW}{dt} = \\vec{F} \\cdot \\vec{v}$ (measured in Watts, $W$)
- **Gravitational Potential Energy**: $U_g = mgh$ (near Earth) or $U_g = -\\frac{GMm}{r}$ (cosmic)
- **Spring Elastic Energy**: $U_s = \\frac{1}{2}k x^2$
- **Coefficient of Restitution**: $e = \\frac{v_{2f} - v_{1f}}{v_{1i} - v_{2i}}$ ($e = 1$ for perfectly elastic, $e = 0$ for perfectly inelastic).`,

      practice: `**Quick Challenge**:
A bullet of mass $10\\text{ g}$ moving at $400\\text{ m/s}$ embeds into a stationary wooden block of mass $990\\text{ g}$ hanging on a string.
1. Is mechanical energy conserved during the collision?
2. What is the combined velocity of the bullet and block immediately after impact?`,

      strategy: `**Energy vs Momentum Decision Matrix**:
- Is there an explosion, collision, or bullet impact? $\\to$ Use **Conservation of Momentum** (energy is lost to heat and deformation).
- Is an object sliding down a smooth ramp, swinging on a pendulum, or compressing a spring? $\\to$ Use **Conservation of Mechanical Energy** ($E_i = E_f$).`,

      simplified: `Think of Momentum like "mass in motion" that can never vanish—it gets traded like cash between colliding bodies. Energy is the total fuel in the tank: it can change forms (from speed to height to heat), but the total ledger always balances.`
    },
    reflection: 'In a car crash where vehicles crumple and stick together, kinetic energy drops dramatically. Where did all that missing energy go?'
  },

  {
    id: 'thermodynamics-carnot',
    category: 'Physics',
    title: 'Thermodynamics, Heat Engines & The Carnot Cycle',
    keywords: ['carnot', 'thermodynamics', 'entropy', 'heat engine', 'gibbs', 'efficiency', 'isothermal', 'adiabatic', 'second law'],
    intents: {
      conceptual: `Thermodynamics governs how thermal energy converts into useful mechanical work:

1. **First Law of Thermodynamics (Energy Conservation)**:
   $$\\Delta U = Q - W$$
   ($\\Delta U$ is internal energy state change, $Q$ is heat added, $W$ is work done by system).
2. **Second Law & Carnot Limit**:
   No engine operating between two thermal reservoirs ($T_H$ and $T_C$) can exceed the reversible Carnot efficiency:
   $$\\eta_{\\text{Carnot}} = 1 - \\frac{T_C}{T_H} \\quad (T\\text{ strictly in Kelvin})$$
3. **Entropy (S)**:
   For any spontaneous irreversible process in an isolated universe: $\\Delta S_{\\text{universe}} > 0$.`,

      example: `**Coal/Gas Power Plant Efficiency**:
A modern thermal turbine operates between steam at $T_H = 550^\\circ\\text{C} = 823.15\\text{ K}$ and cooling water at $T_C = 25^\\circ\\text{C} = 298.15\\text{ K}$:

$$\\eta_{\\text{Carnot}} = 1 - \\frac{298.15}{823.15} = 1 - 0.362 = 0.638 \\quad (63.8\\%)$$

Even with zero friction and perfect engineering, physics dictates that at least **36.2% of the burning fuel heat must be dumped into the river or atmosphere**! Real plants achieve $\\approx 40\\text{--}45\\%$ due to irreversibility.`,

      formula: `**Essential Thermodynamic Relations**:

- **Work in Gas Processes**: $W = \\int P\\,dV$
  - Isochoric ($V = \\text{const}$): $W = 0, \\Delta U = Q = n C_v \\Delta T$
  - Isobaric ($P = \\text{const}$): $W = P\\Delta V = n R \\Delta T$
  - Isothermal ($T = \\text{const}$): $\\Delta U = 0, Q = W = nRT\\ln\\left(\\frac{V_2}{V_1}\\right)$
  - Adiabatic ($Q = 0$): $P V^\\gamma = \\text{const}, W = \\frac{P_1 V_1 - P_2 V_2}{\\gamma - 1}$
- **Molar Heat Capacities**: $C_p - C_v = R, \\gamma = C_p / C_v$`,

      practice: `**Socratic Problem**:
An inventor claims to have built a refrigerator that extracts heat from a $0^\\circ\\text{C}$ compartment and dumps it into a $27^\\circ\\text{C}$ room while consuming only $10\\text{ W}$ of electricity for every $120\\text{ W}$ of cooling.
Calculate the maximum theoretical Coefficient of Performance (COP):
$$\\text{COP}_{\\max} = \\frac{T_C}{T_H - T_C}$$
Does the inventor's claim violate the Second Law?`,

      strategy: `**Problem Solving Protocol for P-V Cycles**:
1. Draw the closed loop on a $P-V$ diagram.
2. Net Work done per cycle = enclosed area of the loop (Clockwise = net work output; Counterclockwise = heat pump).
3. Thermal efficiency: $\\eta = \\frac{W_{\\text{net}}}{Q_{\\text{in}}} = \\frac{Q_{\\text{in}} - Q_{\\text{out}}}{Q_{\\text{in}}}$.`,

      simplified: `Heat is like water: it naturally flows downhill from hot to cold. A heat engine is like a waterwheel catching that flow to spin a shaft. You can never get 100% of the energy out because you must have a place for the water to drain!`
    },
    reflection: 'Why is it impossible to cool down your kitchen by leaving the refrigerator door wide open with the motor running?'
  },

  {
    id: 'fluid-mechanics-bernoulli',
    category: 'Physics',
    title: 'Fluid Mechanics, Bernoulli Principle & Buoyancy',
    keywords: ['bernoulli', 'fluid', 'viscosity', 'buoyancy', 'archimedes', 'continuity', 'pascal', 'reynolds', 'flow'],
    intents: {
      conceptual: `Fluid dynamics balances pressure, kinetic energy, and gravitational potential along streamlines:

1. **Continuity Equation (Mass Conservation)**:
   $$A_1 v_1 = A_2 v_2 \\implies v \\propto \\frac{1}{A}$$
   When a pipe narrows, fluid velocity must increase.
2. **Bernoulli's Equation (Energy Conservation)**:
   For steady, incompressible, non-viscous streamline flow:
   $$P + \\frac{1}{2}\\rho v^2 + \\rho g h = \\text{constant}$$
   Higher fluid speed directly corresponds to lower local static pressure!`,

      example: `**Airplane Wing Lift**:
An airfoil is shaped so air travels faster over the curved top surface ($v_{\\text{top}} > v_{\\text{bottom}}$).
By Bernoulli's principle:
$$P_{\\text{top}} < P_{\\text{bottom}}$$
The pressure difference $\\Delta P = P_{\\text{bottom}} - P_{\\text{top}}$ multiplied by wing area $A$ creates the net upward **aerodynamic lift force** $F_L = \\Delta P \\cdot A$ that keeps a 400-ton Boeing 747 in the air.`,

      formula: `**Core Fluid Equations**:

- **Hydrostatic Pressure**: $P = P_0 + \\rho g h$
- **Archimedes Buoyant Force**: $F_b = \\rho_{\\text{fluid}} V_{\\text{displaced}} g$
- **Torricelli Efflux Speed**: $v = \\sqrt{2gh}$ (water leaking from an orifice at depth $h$)
- **Reynolds Number**: $Re = \\frac{\\rho v D}{\\mu}$ ($Re < 2000$ laminar; $Re > 4000$ turbulent)`,

      practice: `A horizontal pipe carrying water narrows from a diameter of $10\\text{ cm}$ to $5\\text{ cm}$.
If the velocity in the wide section is $2\\text{ m/s}$, what is the velocity in the narrow constriction? How does the pressure change?`,

      strategy: `1. Always start with Continuity ($A_1 v_1 = A_2 v_2$) to express all velocities in terms of a single variable.
2. Pick two points along the same streamline and set:
   $$P_1 + \\frac{1}{2}\\rho v_1^2 + \\rho g h_1 = P_2 + \\frac{1}{2}\\rho v_2^2 + \\rho g h_2$$`,

      simplified: `Think of putting your thumb over a garden hose nozzle. By restricting the opening, the water squirts out much faster. That speed surge comes at the expense of internal pressure!`
    },
    reflection: 'Why do two high-speed trains passing closely in opposite directions get sucked toward each other rather than pushed apart?'
  },

  {
    id: 'electromagnetism-circuits',
    category: 'Physics',
    title: 'Electromagnetism, Gauss Law, Ohm & Kirchhoff Rules',
    keywords: ['coulomb', 'gauss', 'electric field', 'circuit', 'ohm', 'kirchhoff', 'capacitance', 'voltage', 'current', 'resistor'],
    intents: {
      conceptual: `Electromagnetism connects charges, fields, and circuit dynamics:

1. **Coulomb's Law & Electric Field**:
   $$F = \\frac{1}{4\\pi\\epsilon_0}\\frac{|q_1 q_2|}{r^2}, \\quad \\vec{E} = \\frac{\\vec{F}}{q}$$
2. **Gauss's Law**:
   $$\\Phi_E = \\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enclosed}}}{\\epsilon_0}$$
3. **Kirchhoff's Laws**:
   - **KCL (Current Law - Charge Conservation)**: $\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$ at any junction.
   - **KVL (Voltage Law - Energy Conservation)**: $\\sum \\Delta V = 0$ around any closed loop.`,

      example: `**RC Circuit Charging Transient**:
When a capacitor $C$ charges through resistor $R$ connected to battery $V_0$:
$$V_C(t) = V_0(1 - e^{-t / RC})$$
At time $t = \\tau = RC$ (one time constant), the capacitor charges to $1 - e^{-1} \\approx 63.2\\%$ of its final voltage! This exponential rate underlies pacemaker timing, camera flashes, and computer clock signals.`,

      formula: `**Key Equations**:
- **Ohm's Law**: $V = IR$ or microscopic form $\\vec{J} = \\sigma \\vec{E}$
- **Capacitance**: $C = \\frac{Q}{V} = \\frac{\\epsilon_0 A}{d}$, Energy $U = \\frac{1}{2}CV^2$
- **Parallel Resistors**: $\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2}$
- **Series Resistors**: $R_{eq} = R_1 + R_2$`,

      practice: `Find the equivalent resistance between terminals A and B for a Wheatstone bridge with $R_1 = 10\\,\\Omega, R_2 = 20\\,\\Omega, R_3 = 10\\,\\Omega, R_4 = 20\\,\\Omega$ and a galvanometer resistor $R_g = 50\\,\\Omega$ across the bridge. Does current flow through $R_g$?`,

      strategy: `1. Check for symmetry (Wheatstone bridge condition: $R_1/R_2 = R_3/R_4$).
2. Assign branch currents with direction arrows.
3. Apply KCL at junctions, then write KVL loop equations. Solve the linear system.`,

      simplified: `Voltage is like water pressure in a pipe; Current is the volume of water flowing per second; Resistance is a gravel filter impeding the flow. High pressure with a tight filter gives a trickle of current!`
    },
    reflection: 'Why can birds sit unharmed on high-voltage 100,000 V power lines without getting electrocuted?'
  },

  {
    id: 'optics-and-waves',
    category: 'Physics',
    title: 'Optics, Snell Law, Interference & Wave Mechanics',
    keywords: ['snell', 'optics', 'refraction', 'reflection', 'lens', 'interference', 'diffraction', 'young', 'slit', 'wavelength'],
    intents: {
      conceptual: `Light exhibits both ray (geometric) and wave (physical) characteristics:

1. **Snell's Law of Refraction**:
   $$n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2$$
   When light enters an optically denser medium ($n_2 > n_1$), it bends toward the normal because its phase speed decreases ($v = c/n$).
2. **Total Internal Reflection (TIR)**:
   Occurs when light travels from denser to rarer medium at angle $\\theta_1 > \\theta_c$, where $\\sin\\theta_c = n_2 / n_1$.
3. **Young's Double Slit Interference**:
   Wavefront division produces constructive bright fringes where path difference $\\Delta x = n\\lambda$, yielding fringe width:
   $$\\beta = \\frac{\\lambda D}{d}$$`,

      example: `**Fiber Optic Cables**:
Internet data pulses flash through glass fiber cores ($n_{\\text{core}} = 1.48$) surrounded by cladding ($n_{\\text{cladding}} = 1.44$).
$$\\theta_c = \\arcsin(1.44 / 1.48) \\approx 76.7^\\circ$$
Because laser light enters at glancing angles greater than $76.7^\\circ$, it undergoes 100% Total Internal Reflection with practically zero light loss over tens of kilometers!`,

      formula: `**Optics Mathematical Equations**:
- **Thin Lens Formula**: $\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}$ (Cartesian sign convention)
- **Lens Maker Equation**: $\\frac{1}{f} = (n - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)$
- **Magnification**: $m = \\frac{h_i}{h_o} = \\frac{v}{u}$
- **Interference Path Difference**: $\\Delta x = d\\sin\\theta \\approx d\\frac{y}{D}$`,

      practice: `A beam of light in water ($n = 1.33$) strikes the boundary with air ($n = 1.0$) at an angle of incidence of $55^\\circ$. Does light emerge into the air, or does it undergo total internal reflection?`,

      strategy: `1. Establish the Cartesian coordinate origin at the optical center / pole.
2. Distances opposite incident light are negative; distances in the direction of light are positive.
3. Distinguish whether the question is geometric (lenses/mirrors) or wave-based (fringe spacing/diffraction).`,

      simplified: `Think of a lawnmower rolling from a smooth pavement onto thick grass at an angle. The wheel that hits the grass first slows down, while the other wheel on the pavement keeps rolling fast. This causes the entire lawnmower to pivot and change direction—exactly how light bends!`
    },
    reflection: 'Why do oil slicks on wet asphalt display shimmering rainbow bands even though sunlight and motor oil are not colorful?'
  },

  // ==========================================
  // CHEMISTRY — ORGANIC, PHYSICAL & INORGANIC
  // ==========================================
  {
    id: 'organic-aldol-condensation',
    category: 'Chemistry',
    title: 'Aldol Condensation & Enolate Chemistry',
    keywords: ['aldol', 'enolate', 'alpha hydrogen', 'carbonyl', 'ketone', 'aldehyde', 'dehydration', 'conjugation'],
    intents: {
      conceptual: `The Aldol Condensation is a C-C bond forming powerhouse driven by the **acidity of the $\\alpha$-hydrogen** ($\\text{p}K_a \\approx 19\\text{--}20$):

1. **Deprotonation & Enolate Resonance**:
   A base ($\\text{OH}^-$ or $\\text{OEt}^-$) removes an $\\alpha$-proton. The resulting negative charge is stabilized across both the $\\alpha$-carbon and carbonyl oxygen ($[\\text{C}^- - \\text{C}=\\text{O} \\leftrightarrow \\text{C}=\\text{C}-\\text{O}^-]$).
2. **Nucleophilic Addition**:
   The nucleophilic enolate carbon attacks the electrophilic carbonyl carbon of an unreacted aldehyde, forming an intermediate alkoxide.
3. **Proton Transfer**:
   Yields a **$\\beta$-hydroxy carbonyl** (an *aldol* = aldehyde + alcohol).
4. **Dehydration (Elimination)**:
   Under heat or acid/base catalysis, water eliminates (E1cB mechanism) to give an **$\\alpha,\\beta$-unsaturated carbonyl**, driven by extended thermodynamic $\\pi$-conjugation.`,

      example: `**Self-Condensation of Acetaldehyde**:
$$\\text{CH}_3\\text{CHO} + \\text{CH}_3\\text{CHO} \\xrightarrow{\\text{dil. NaOH}} \\text{CH}_3-\\text{CH(OH)}-\\text{CH}_2-\\text{CHO} \\xrightarrow{\\Delta, -\\text{H}_2\\text{O}} \\text{CH}_3-\\text{CH}=\\text{CH}-\\text{CHO}$$
(Crotonaldehyde / 2-butenal)

Notice that crossed aldol reactions between two aldehydes with different $\\alpha$-hydrogens generate four confusing products. To avoid this, chemists use one partner without $\\alpha$-hydrogens (like benzaldehyde or formaldehyde) or employ pre-formed lithium enolates (LDA).`,

      formula: `**Reaction Progression**:
$$\\text{Carbonyl} + \\text{Base} \\rightleftharpoons \\text{Enolate} + \\text{BH}^+$$
$$\\text{Enolate} + \\text{Carbonyl} \\to \\beta\\text{-Alkoxide}$$
$$\\beta\\text{-Alkoxide} + \\text{H}_2\\text{O} \\to \\beta\\text{-Hydroxyaldehyde (Aldol)} + \\text{OH}^-$$
$$\\beta\\text{-Hydroxyaldehyde} \\xrightarrow{\\Delta} \\alpha,\\beta\\text{-Unsaturated Carbonyl} + \\text{H}_2\\text{O}$$`,

      practice: `What happens when **Benzaldehyde** ($\\text{C}_6\\text{H}_5\\text{CHO}$) is treated with **Acetophenone** ($\\text{C}_6\\text{H}_5\\text{COCH}_3$) in dilute base (Claisen-Schmidt reaction)?
Which partner forms the enolate, and which acts as the electrophile?`,

      strategy: `1. Count $\\alpha$-hydrogens on all carbonyl partners.
2. If only one partner has $\\alpha$-hydrogens, it MUST be the nucleophile (enolate source).
3. The other partner without $\\alpha$-hydrogens is the electrophile.
4. Always check if heat ($\\Delta$) is indicated—heat forces dehydration to the conjugated enone.`,

      simplified: `The carbonyl oxygen acts like an electron vacuum, sucking electron density away from adjacent carbon atoms. This makes the hydrogen atoms directly attached to the next-door carbon loose and acidic. Once plucked off, that carbon becomes eager to connect to another carbonyl carbon!`
    },
    reflection: 'Why does dehydration of a $\\beta$-hydroxy aldehyde occur so readily compared to regular alcohol dehydration, even in mild basic conditions?'
  },

  {
    id: 'physical-gibbs-equilibrium',
    category: 'Chemistry',
    title: 'Gibbs Free Energy, Spontaneity & Chemical Equilibrium',
    keywords: ['gibbs', 'entropy', 'enthalpy', 'spontaneous', 'equilibrium', 'le chatelier', 'free energy', 'delta g', 'nernst'],
    intents: {
      conceptual: `**Gibbs Free Energy ($\\Delta G$)** determines the spontaneous direction of a chemical system at constant temperature and pressure:

$$\\Delta G = \\Delta H - T\\Delta S$$

- **$\\Delta G < 0$**: Exergonic, thermodynamically spontaneous.
- **$\\Delta G > 0$**: Endergonic, non-spontaneous (requires work input).
- **$\\Delta G = 0$**: Dynamic chemical equilibrium.

At standard conditions, $\\Delta G^\\circ$ couples directly to the equilibrium constant $K_{eq}$:
$$\\Delta G^\\circ = -RT \\ln K_{eq}$$
If $\\Delta G^\\circ < 0$, then $K_{eq} > 1$, meaning products dominate at equilibrium!`,

      example: `**Haber-Bosch Ammonia Synthesis**:
$$\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g) \\quad (\\Delta H^\\circ = -92.4\\text{ kJ/mol})$$

1. **Enthalpy**: Exothermic ($\\Delta H < 0$).
2. **Entropy**: 4 moles of gas turn into 2 moles of gas, so entropy decreases ($\\Delta S < 0$).
3. **Temperature Trade-off**:
   - At low $T$, $\\Delta H$ dominates $\\implies \\Delta G < 0$ (favors ammonia).
   - At high $T$, the $-T\\Delta S$ term becomes positive and dominates $\\implies \\Delta G > 0$.
   However, industrial plants operate at $450^\\circ\\text{C}$ with iron catalyst to ensure reasonable reaction kinetics!`,

      formula: `**Thermodynamic Relationships**:
- $\\Delta G = \\Delta G^\\circ + RT\\ln Q$
- $\\Delta G^\\circ = -RT\\ln K_{eq} = -n F E^\\circ_{\\text{cell}}$
- **Van 't Hoff Equation**: $\\frac{d\\ln K}{dT} = \\frac{\\Delta H^\\circ}{R T^2}$
- **Nernst Equation**: $E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{RT}{nF}\\ln Q$`,

      practice: `For a reaction with $\\Delta H^\\circ = +40\\text{ kJ/mol}$ and $\\Delta S^\\circ = +100\\text{ J/(mol}\\cdot\\text{K)}$:
1. Is the reaction spontaneous at $298\\text{ K}$ ($25^\\circ\\text{C}$)?
2. At what temperature does the reaction transition from non-spontaneous to spontaneous?`,

      strategy: `**Signs of $\\Delta H$ and $\\Delta S$ Quad-Chart**:
- $\\Delta H < 0, \\Delta S > 0 \\implies$ Spontaneous at ALL temperatures.
- $\\Delta H > 0, \\Delta S < 0 \\implies$ Non-spontaneous at ALL temperatures.
- $\\Delta H < 0, \\Delta S < 0 \\implies$ Spontaneous at LOW temperatures ($T < \\Delta H / \\Delta S$).
- $\\Delta H > 0, \\Delta S > 0 \\implies$ Spontaneous at HIGH temperatures ($T > \\Delta H / \\Delta S$).`,

      simplified: `Nature loves two things: rolling downhill to the lowest energy state (negative enthalpy, $\\Delta H < 0$) and creating messy chaos (positive entropy, $\\Delta S > 0$). Gibbs Free Energy is the official referee balancing these two desires.`
    },
    reflection: 'If water freezing into ice reduces entropy ($\\Delta S_{\\text{system}} < 0$), why does it spontaneously occur below $0^\\circ\\text{C}$ without violating the Second Law?'
  },

  {
    id: 'organic-substitution-elimination',
    category: 'Chemistry',
    title: 'SN1, SN2, E1, E2 Reaction Mechanisms',
    keywords: ['sn1', 'sn2', 'e1', 'e2', 'substitution', 'elimination', 'nucleophile', 'electrophile', 'carbocation', 'zaitsev'],
    intents: {
      conceptual: `Alkyl halides react via four competing pathways governed by substrate sterics, nucleophile/base strength, and solvent:

1. **$S_N2$ (Bimolecular Nucleophilic Substitution)**:
   Concerted backside attack in a single transition state.
   - Rate $= k[R-X][\\text{Nu}^-]$
   - **Inversion of stereocenter (Walden inversion)**.
   - Favored by: primary ($1^\\circ$) halides, strong nucleophiles, polar aprotic solvents (acetone, DMSO).
2. **$S_N1$ (Unimolecular Substitution)**:
   Two-step mechanism: rate-determining leaving group departure forming a planar carbocation, followed by nucleophilic capture.
   - Rate $= k[R-X]$
   - **Racemization** of stereocenter.
   - Favored by: tertiary ($3^\\circ$) halides, weak nucleophiles, polar protic solvents (water, ethanol).
3. **$E2$ vs $E1$ Elimination**:
   Produces alkenes following **Zaitsev's Rule** (more substituted alkene is major product) unless a bulky base (like $t\\text{-BuO}^-$) forces the Hofmann product.`,

      example: `**Comparing Reactions on 2-Bromopropane**:
- With sodium ethoxide ($\\text{NaOEt}$, strong unhindered base/nucleophile) in ethanol:
  Major product is **propene via $E2$ elimination** ($\\approx 80\\%$).
- With sodium iodide ($\\text{NaI}$, strong nucleophile, weak base) in acetone:
  Major product is **2-iodopropane via $S_N2$ substitution**.`,

      formula: `**Kinetic Rate Laws**:
$$v_{S_N2} = k[\\text{Substrate}][\\text{Nu}]$$
$$v_{S_N1} = k[\\text{Substrate}]$$
$$\\text{Substrate Reactivity: } S_N2: 1^\\circ > 2^\\circ \\gg 3^\\circ \\quad \\text{vs} \\quad S_N1: 3^\\circ > 2^\\circ \\gg 1^\\circ$$`,

      practice: `Predict the mechanism ($S_N1, S_N2, E1,$ or $E2$) and draw the major product for:
1-Bromobutane treated with Potassium tert-butoxide ($t\\text{-BuOK}$) in tert-butanol under reflux.`,

      strategy: `**Decision Flowchart**:
1. Check Substrate: $1^\\circ \\to S_N2/E2$; $3^\\circ \\to S_N1/E1/E2$; $2^\\circ \\to$ depends on reagent.
2. Check Reagent:
   - Strong Base, Strong Nu ($\\text{OH}^-, \\text{OR}^-$): $E2$ on $2^\\circ/3^\\circ$; $S_N2$ on $1^\\circ$.
   - Bulky Strong Base ($t\\text{-BuO}^-$): Exclusively $E2$ (Hofmann product).
   - Weak Base, Strong Nu ($\\text{I}^-, \\text{CN}^-, \\text{RS}^-$): $S_N2$ or $S_N1$.
   - Weak Base, Weak Nu ($\\text{H}_2\\text{O}, \\text{ROH}$): $S_N1/E1$ (heat favors $E1$).`,

      simplified: `Imagine a crowded elevator. In $S_N2$, someone pushes in from the back door while someone leaves through the front door at the exact same moment. In $S_N1$, the leaving person walks out completely first, creating an empty space that someone else casually fills later.`
    },
    reflection: 'Why does polar aprotic solvent accelerate $S_N2$ reactions by hundreds of times compared to water or methanol?'
  },

  // ==========================================
  // MATHEMATICS — CALCULUS, LINEAR ALGEBRA & VECTORS
  // ==========================================
  {
    id: 'calculus-definite-integrals-king',
    category: 'Mathematics',
    title: "King's Property & Symmetry in Definite Integrals",
    keywords: ['integral', 'calculus', 'king', 'definite integral', 'substitution', 'derivative', 'leibniz', 'integration by parts'],
    intents: {
      conceptual: `The **King Property (Reflection Identity)** is one of the most elegant symmetry principles in definite integration:

$$\\int_{a}^{b} f(x)\\,dx = \\int_{a}^{b} f(a + b - x)\\,dx$$

**Mathematical Derivation**:
Substitute $t = a + b - x \\implies dt = -dx$.
When $x = a \\implies t = b$; when $x = b \\implies t = a$.
$$\\int_{a}^{b} f(x)\\,dx = \\int_{b}^{a} f(a+b-t)(-dt) = \\int_{a}^{b} f(a+b-t)\\,dt = \\int_{a}^{b} f(a+b-x)\\,dx$$

Adding the original integral $I$ to the transformed reflection integral gives:
$$2I = \\int_{a}^{b} \\Big[f(x) + f(a + b - x)\\Big]\\,dx$$
In competitive exams and STEM calculus, the integrand $f(x) + f(a+b-x)$ frequently collapses into a simple constant or cancels denominators entirely!`,

      example: `**Classic Evaluation**:
Evaluate $I = \\int_{0}^{\\pi/2} \\frac{\\sin x}{\\sin x + \\cos x}\\,dx$.

1. Apply King's Property ($a+b-x = \\pi/2 - x$):
   $$I = \\int_{0}^{\\pi/2} \\frac{\\sin(\\pi/2 - x)}{\\sin(\\pi/2 - x) + \\cos(\\pi/2 - x)}\\,dx = \\int_{0}^{\\pi/2} \\frac{\\cos x}{\\cos x + \\sin x}\\,dx$$
2. Add the two equations:
   $$2I = \\int_{0}^{\\pi/2} \\frac{\\sin x + \\cos x}{\\sin x + \\cos x}\\,dx = \\int_{0}^{\\pi/2} 1\\,dx = \\frac{\\pi}{2}$$
3. Conclude:
   $$I = \\frac{\\pi}{4}$$
No difficult trigonometric substitutions required!`,

      formula: `**Definite Integral Identities**:
- **King's Property**: $\\int_{a}^{b} f(x)\\,dx = \\int_{a}^{b} f(a+b-x)\\,dx$
- **Special Case ($a=0$)**: $\\int_{0}^{a} f(x)\\,dx = \\int_{0}^{a} f(a-x)\\,dx$
- **Even/Odd Symmetry**:
  $$\\int_{-a}^{a} f(x)\\,dx = \\begin{cases} 2\\int_{0}^{a} f(x)\\,dx & \\text{if } f(-x) = f(x) \\text{ (even)} \\\\ 0 & \\text{if } f(-x) = -f(x) \\text{ (odd)} \\end{cases}$$
- **Integration by Parts**: $\\int u\\,dv = uv - \\int v\\,du$`,

      practice: `Evaluate the following integral using King's Property:
$$I = \\int_{2}^{3} \\frac{\\sqrt{x}}{\\sqrt{x} + \\sqrt{5 - x}}\\,dx$$
What is $a + b - x$ here?`,

      strategy: `1. Check if the integral limits add up to something convenient ($a+b$).
2. Replace $x$ with $a+b-x$ throughout the integrand.
3. If the denominator remains invariant while numerators add up to match the denominator, use $2I = \\int [f(x) + f(a+b-x)]dx$.`,

      simplified: `Imagine a graph of a curve between $x=a$ and $x=b$. King's property simply flips the graph horizontally like looking at it in a mirror. Because you are still measuring the exact same enclosed area under the curve, the integral value stays identical!`
    },
    reflection: 'Why does the area under $f(x)$ from 0 to $\\pi$ remain unchanged even if $f(x)$ oscillates rapidly, as long as $f(\\pi - x) = f(x)$?'
  },

  {
    id: 'math-linear-algebra-eigen',
    category: 'Mathematics',
    title: 'Linear Algebra, Matrices, Determinants & Eigenvalues',
    keywords: ['eigenvalue', 'eigenvector', 'matrix', 'determinant', 'linear algebra', 'rank', 'diagonalization', 'cramer'],
    intents: {
      conceptual: `In linear algebra, a square matrix $A$ represents a geometric linear transformation.

Most vectors change direction when multiplied by $A$. However, **Eigenvectors (v⃗)** are special invariant directions where the transformation only scales the vector without rotating it:

$$A \\vec{v} = \\lambda \\vec{v}$$

- $\\vec{v}$ is the **Eigenvector** (non-zero direction).
- $\\lambda$ is the **Eigenvalue** (scalar stretch factor).

To find eigenvalues, rearrange to $(A - \\lambda I)\\vec{v} = \\vec{0}$. For non-trivial solutions $\\vec{v} \\neq \\vec{0}$, the matrix $(A - \\lambda I)$ must be singular:
$$\\det(A - \\lambda I) = 0$$
This polynomial equation is called the **characteristic equation**.`,

      example: `**Finding Eigenvalues for a $2\\times 2$ Matrix**:
Let $A = \\begin{pmatrix} 4 & 1 \\\\ 2 & 3 \\end{pmatrix}$.

1. Characteristic equation:
   $$\\det(A - \\lambda I) = \\det\\begin{pmatrix} 4-\\lambda & 1 \\\\ 2 & 3-\\lambda \\end{pmatrix} = (4-\\lambda)(3-\\lambda) - 2 = 0$$
   $$\\lambda^2 - 7\\lambda + 12 - 2 = \\lambda^2 - 7\\lambda + 10 = 0$$
2. Factor:
   $$(\\lambda - 5)(\\lambda - 2) = 0 \\implies \\lambda_1 = 5, \\quad \\lambda_2 = 2$$
3. Notice that:
   $$\\text{Trace}(A) = 4 + 3 = 7 = \\lambda_1 + \\lambda_2$$
   $$\\det(A) = 12 - 2 = 10 = \\lambda_1 \\cdot \\lambda_2$$`,

      formula: `**Essential Theorems**:
- **Sum of Eigenvalues**: $\\sum \\lambda_i = \\text{Trace}(A)$
- **Product of Eigenvalues**: $\\prod \\lambda_i = \\det(A)$
- **Matrix Inversion**: $A^{-1} = \\frac{1}{\\det A}\\text{adj}(A)$
- **Cayley-Hamilton Theorem**: Every square matrix satisfies its own characteristic equation ($p(A) = 0$).`,

      practice: `Find the eigenvectors corresponding to $\\lambda = 5$ for $A = \\begin{pmatrix} 4 & 1 \\\\ 2 & 3 \\end{pmatrix}$.
*Hint: Solve $(A - 5I)\\vec{v} = \\vec{0}$.*`,

      strategy: `1. Compute $\\text{Trace}(A)$ and $\\det(A)$ first to verify your characteristic roots: $\\lambda^2 - \\text{Tr}(A)\\lambda + \\det(A) = 0$.
2. For each eigenvalue $\\lambda_k$, solve the homogeneous linear system $(A - \\lambda_k I)\\vec{v} = \\vec{0}$ using Gaussian elimination.`,

      simplified: `Think of stretching a sheet of rubber diagonally. Almost every point moves in an arc, except points lying along the stretch axis itself, which only pull outward along a straight line. Those invariant axes are the eigenvectors, and how much they stretch is the eigenvalue!`
    },
    reflection: 'What physical meaning do eigenvalues have when analyzing mechanical vibrations or electrical resonance in engineering?'
  },

  // ==========================================
  // COMPUTER SCIENCE & PROGRAMMING
  // ==========================================
  {
    id: 'cs-pointers-memory-c',
    category: 'Computer Science',
    title: 'Pointers, Virtual Memory & Heap Allocation in C/C++',
    keywords: ['pointer', 'malloc', 'free', 'memory', 'segfault', 'address', 'dereference', 'stack', 'heap'],
    intents: {
      conceptual: `In C and systems programming, a **pointer** is a variable that stores the virtual memory address of another value:

- **Address-of operator (\`&\`)**: Retrieves the address where a variable resides in memory.
- **Dereference operator (\`*\`)**: Accesses or modifies the value residing at that stored address.

\`\`\`c
int x = 42;
int *p = &x;  // p points to memory location of x (e.g. 0x7ffd98)
*p = 99;      // directly mutates x to 99!
\`\`\`

**Memory Layout**:
1. **Stack**: Fast, automatic allocation/deallocation for local variables.
2. **Heap**: Dynamic memory managed manually with \`malloc()\` and \`free()\`. Failure to free causes **memory leaks**; accessing freed memory causes **undefined behavior / segmentation faults**.`,

      example: `**Dynamic Array Allocation & Pointer Arithmetic**:
\`\`\`c
int n = 5;
int *arr = (int *)malloc(n * sizeof(int));
if (arr == NULL) {
    fprintf(stderr, "Memory allocation failed\\n");
    return 1;
}

for (int i = 0; i < n; i++) {
    *(arr + i) = i * 10; // Equivalent to arr[i] = i * 10
}

free(arr);
arr = NULL; // Prevent dangling pointer
\`\`\`
Notice that \`arr + 1\` doesn't add 1 single byte; it adds \`sizeof(int)\` (4 bytes)!`,

      formula: `**Memory & Pointer Rules**:
- Pointer scaling: $\\text{Address}(p + k) = \\text{Address}(p) + k \\times \\text{sizeof}(*p)$
- \`malloc(size)\`: Allocates uninitialized heap bytes.
- \`calloc(n, size)\`: Allocates and zeroes out memory.
- \`free(ptr)\`: Returns heap block to allocator (does NOT nullify \`ptr\`).`,

      practice: `What is the bug in the following C snippet?
\`\`\`c
int* getSecretNumber() {
    int secret = 777;
    return &secret;
}
\`\`\`
Why will this cause a segmentation fault or print garbage when called?`,

      strategy: `1. Always check for \`NULL\` after \`malloc()\`.
2. Every \`malloc\` must have exactly one matching \`free\`.
3. Set pointers to \`NULL\` immediately after freeing them.
4. Never return the address of a stack-allocated local variable.`,

      simplified: `Think of your computer's RAM like a giant hotel with billions of rooms, each with a numbered address on the door. A normal variable is the guest sleeping inside the room. A pointer is a scrap of paper with that room number written down.`
    },
    reflection: 'Why does passing a pointer to a function allow that function to modify variables in the caller, while passing a normal variable does not?'
  },

  {
    id: 'cs-data-structures-algorithms',
    category: 'Computer Science',
    title: 'Data Structures, Big-O Complexity & Algorithms',
    keywords: ['algorithm', 'data structure', 'complexity', 'big o', 'linked list', 'tree', 'sorting', 'binary search', 'recursion'],
    intents: {
      conceptual: `Algorithmic performance is quantified using **Big-O Notation** ($O$), describing how execution time or memory scales as input size $n \\to \\infty$:

- **$O(1)$ Constant**: Hash map lookup, array indexing.
- **$O(\\log n)$ Logarithmic**: Binary search in a sorted array.
- **$O(n)$ Linear**: Single loop through an unsorted array.
- **$O(n\\log n)$ Linearithmic**: Merge Sort, Quick Sort (average), Heap Sort.
- **$O(n^2)$ Quadratic**: Bubble sort, nested pairwise comparisons.

Choosing the proper data structure trades off read speed vs write speed (e.g., Arrays have $O(1)$ random access but $O(n)$ insertions; Linked Lists have $O(1)$ insertions given a pointer but $O(n)$ access).`,

      example: `**Binary Search Speedup**:
To search for a name in an alphabetized directory of $n = 1,000,000$ users:
- **Linear Search ($O(n)$)**: Takes up to $1,000,000$ comparisons in the worst case.
- **Binary Search ($O(\\log_2 n)$)**:
  $$\\log_2(1,000,000) \\approx 20 \\text{ comparisons maximum!}$$
A 50,000-fold speedup achieved entirely through algorithmic design!`,

      formula: `**Master Theorem for Divide-and-Conquer**:
$$T(n) = a T(n/b) + f(n)$$
- If $f(n) = O(n^c)$ where $c < \\log_b a \\implies T(n) = \\Theta(n^{\\log_b a})$
- If $f(n) = O(n^{\\log_b a}) \\implies T(n) = \\Theta(n^{\\log_b a}\\log n)$ (e.g. Merge Sort: $T(n) = 2T(n/2) + O(n) \\implies O(n\\log n)$).`,

      practice: `Given a binary search tree (BST), which tree traversal order (Pre-order, In-order, or Post-order) outputs all node keys in strictly ascending sorted order? Why?`,

      strategy: `1. Clarify time vs space constraints.
2. Is the data sorted? If yes, consider two-pointers or binary search.
3. Are there overlapping subproblems? Consider memoization / dynamic programming.
4. Need fast lookups? Use a Hash Table ($O(1)$ average).`,

      simplified: `Big-O isn't about counting microseconds on a stopwatch; it's about asking: "If my userbase jumps from 100 people to 10,000,000 people, will my server handle it gracefully or catch fire?"`
    },
    reflection: 'Why does Merge Sort require $O(n)$ auxiliary memory, while Quick Sort can be implemented with $O(\\log n)$ stack space?'
  }
];

/**
 * Detect the student's inquiry intent to tailor response variation
 */
export function detectInquiryIntent(query: string): 'conceptual' | 'example' | 'formula' | 'practice' | 'strategy' | 'simplified' {
  const q = query.toLowerCase();

  if (q.includes('example') || q.includes('analogy') || q.includes('real life') || q.includes('real world') || q.includes('instance') || q.includes('demonstrate')) {
    return 'example';
  }
  if (q.includes('formula') || q.includes('equation') || q.includes('units') || q.includes('dimensions') || q.includes('derivation') || q.includes('expression')) {
    return 'formula';
  }
  if (q.includes('solve') || q.includes('how to solve') || q.includes('strategy') || q.includes('steps') || q.includes('approach') || q.includes('method')) {
    return 'strategy';
  }
  if (q.includes('quiz') || q.includes('problem') || q.includes('question') || q.includes('practice') || q.includes('test me') || q.includes('challenge')) {
    return 'practice';
  }
  if (q.includes('simple') || q.includes('simplify') || q.includes('explain like') || q.includes('eli5') || q.includes('basic') || q.includes('layman') || q.includes('easy')) {
    return 'simplified';
  }

  return 'conceptual';
}

/**
 * Finds the closest matching knowledge topic based on keywords and stems
 */
export function findMatchingTopic(query: string): SocraticTopic | null {
  const q = query.toLowerCase();

  let bestMatch: SocraticTopic | null = null;
  let highestScore = 0;

  for (const topic of SOCRATIC_KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of topic.keywords) {
      if (q.includes(keyword)) {
        score += keyword.length > 5 ? 3 : 2;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = topic;
    }
  }

  return highestScore >= 2 ? bestMatch : null;
}

/**
 * Dynamically synthesizes an intelligent Socratic response
 */
export function generateDiverseSocraticReply(
  userMsg: string,
  options?: {
    studentContext?: any;
    lectureContext?: any;
    history?: any[];
  }
): string {
  const intent = detectInquiryIntent(userMsg);
  const matchedTopic = findMatchingTopic(userMsg);

  // Check if student has a recent quiz error or lecture context that connects to this
  const lecture = options?.lectureContext;
  const mistake = lecture?.quizMistake || lecture?.lastMistakeReview;
  const persona = options?.studentContext?.learnerProfile;

  let headerPrefix = '';
  if ((mistake && userMsg.toLowerCase().includes('quiz')) || (mistake && userMsg.toLowerCase().includes('mistake'))) {
    headerPrefix = `### 🎯 Grounding in Your Recent Quiz Review\n**Question**: "${mistake.question || 'Cause vs Effect in Mechanics'}"\n**Identified Misconception**: ${mistake.misconception || 'Confusing applied force with kinematic acceleration'}\n*(Referenced at lecture timestamp ${mistake.timestampRef || '21:05'})*\n\n`;
  }

  if (matchedTopic) {
    let mainBody = matchedTopic.intents[intent] || matchedTopic.intents.conceptual;

    // Apply persona adjustments
    if (persona?.learningStyle === 'visual' && !mainBody.includes('Mental Model')) {
      mainBody += `\n\n🎨 **Visual Mental Model**: Picture this as a vector arrow diagram. The direction of the principal vector dictates the immediate outcome, while opposing resistance vectors shave off magnitude.`;
    } else if (persona?.learningStyle === 'step_by_step' && !mainBody.includes('Step 1')) {
      mainBody += `\n\n📋 **Actionable Sequential Check**: 1. Identify given invariants $\\to$ 2. State governing law $\\to$ 3. Eliminate unknowns $\\to$ 4. Check dimensional consistency.`;
    }

    const reflectionQuestion = matchedTopic.reflection;

    return `${headerPrefix}${mainBody}

💭 **Socratic Reflection**: ${reflectionQuestion}`;
  }

  // Adaptive General Socratic Engine
  return `To understand **${userMsg}**, let's look directly at the underlying core ideas. Break down the components of what's being asked, connect them to the relevant definitions or formulas, and test how they behave under standard conditions.

How would you like to explore this further? Feel free to ask any specific follow-up!`;
}
