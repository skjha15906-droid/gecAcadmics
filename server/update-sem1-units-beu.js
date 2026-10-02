const { db } = require('./db');

console.log('--- Aligning Semester 1 Units with BEU Official Syllabus ---');

const sem1 = db.prepare('SELECT id FROM semesters WHERE sem_number = 1').get();
if (!sem1) {
  console.error('Semester 1 not found!');
  process.exit(1);
}
const sem1Id = sem1.id;

// Official BEU (Bihar Engineering University) New Syllabus Module Breakdowns
const beuSyllabus = [
  {
    code: '100102',
    name: 'Engineering Mathematics-I',
    description: 'Linear algebra, single-variable calculus, and multivariable calculus differentiation & integration.',
    units: [
      { unit_number: 1, title: 'Unit 1: Linear Algebra-I', description: 'Elementary Row operations, Gauss-Jordan Method, Complex Matrices (Hermitian, Skew-Hermitian, Unitary), Vector Space, Subspaces, Linear Dependence/Independence, Basis, Dimension, Rank of a Matrix, Solvability of Linear Equations.' },
      { unit_number: 2, title: 'Unit 2: Linear Algebra-II', description: 'Linear Transformations, Kernel and Range, Matrix Representation, Rank-Nullity Theorem, Eigenvalues & Eigenvectors, Orthogonal Transformation, Matrix Diagonalization, Cayley-Hamilton Theorem.' },
      { unit_number: 3, title: 'Unit 3: Calculus for Single Variable', description: "Indeterminate forms, L'Hospital's Rule, Rolle's Theorem, Mean Value Theorems, Taylor and Maclaurin Series, Riemann Integration, Beta and Gamma Functions." },
      { unit_number: 4, title: 'Unit 4: Multivariable Calculus (Differentiation)', description: 'Functions of several variables, Limits, Continuity, Partial Differentiation, Total Differentiation, Euler’s Theorem, Tangent plane and normal line, Maxima and Minima, Lagrange Multipliers.' },
      { unit_number: 5, title: 'Unit 5: Multivariable Calculus (Integration)', description: 'Double Integrals, Change of order of integration, Triple Integrals, Change of variables (Polar, Cylindrical, Spherical), Applications to Area and Volume.' }
    ]
  },
  {
    code: '100104',
    name: 'Engineering Physics',
    description: 'Frame of reference, oscillations, optics, lasers, quantum mechanics, and electrostatics.',
    units: [
      { unit_number: 1, title: 'Unit 1: Frame of Reference & Oscillations', description: 'Non-inertial frames of reference, rotating coordinate systems, Coriolis acceleration, Simple harmonic motion, Damped oscillations, Forced oscillations and Resonance.' },
      { unit_number: 2, title: 'Unit 2: Optics & LASER', description: "Interference (Fresnel's biprism, Newton's rings), Fraunhofer diffraction (single slit, grating), Polarization, Einstein coefficients, Population inversion, Ruby Laser, He-Ne Laser." },
      { unit_number: 3, title: 'Unit 3: Quantum Mechanics', description: 'Photoelectric effect, Compton effect, de Broglie hypothesis, Heisenberg uncertainty principle, Wave function, Schrödinger wave equation, Particle in 1D box.' },
      { unit_number: 4, title: 'Unit 4: Vector Calculus & Electrostatics', description: 'Gradient, Divergence, Curl, Gauss divergence theorem, Stokes theorem, Electrostatic fields, Poisson and Laplace equations, Dielectrics and Polarization.' },
      { unit_number: 5, title: 'Unit 5: Semiconductor Physics & Superconductivity', description: 'Intrinsic and Extrinsic semiconductors, Fermi level, Carrier concentration, Hall Effect, Meissner effect, Type-I and Type-II superconductors, BCS theory overview.' }
    ]
  },
  {
    code: '100105',
    name: 'Introduction to AI',
    description: 'Foundations of artificial intelligence, intelligent agents, search algorithms, knowledge representation, and machine learning.',
    units: [
      { unit_number: 1, title: 'Unit 1: Introduction to Artificial Intelligence', description: 'Definition, history and evolution of AI, Turing test, Strong AI vs Weak AI, Applications across engineering domains, Ethical considerations.' },
      { unit_number: 2, title: 'Unit 2: Intelligent Agents & Environments', description: 'Agents and Environments, Rationality, Structure of agents, PEAS description (Performance measure, Environment, Actuators, Sensors), Types of agent environments and agent architectures.' },
      { unit_number: 3, title: 'Unit 3: Problem Solving & Search Algorithms', description: 'State space search, Uninformed search (BFS, DFS, Uniform Cost Search), Informed/Heuristic search (Greedy Best-First, A* search), Adversarial search (Minimax, Alpha-Beta pruning), Constraint Satisfaction Problems (CSP).' },
      { unit_number: 4, title: 'Unit 4: Knowledge Representation & Logic', description: 'Propositional logic, First-Order Predicate Logic (FOPL), Inference, Unification, Resolution theorem proving, Semantic networks, Frames, Rule-based expert systems.' },
      { unit_number: 5, title: 'Unit 5: Machine Learning Fundamentals & AI Frontiers', description: 'Supervised vs Unsupervised learning, Linear regression, Decision trees, Neural networks overview, Natural Language Processing (NLP) basics, Computer vision overview, Future of AI.' }
    ]
  },
  {
    code: '100108',
    name: 'Computer Fundamentals & Emerging Technologies',
    description: 'Hardware architecture, operating systems, networking, cloud, IoT, cyber security, and emerging tech.',
    units: [
      { unit_number: 1, title: 'Unit 1: Computer Fundamentals & Functional Units', description: 'Generations of computers, Classification of computers, Von Neumann architecture, CPU functional units (ALU, CU, Registers), Memory hierarchy (Cache, RAM, ROM, Secondary storage).' },
      { unit_number: 2, title: 'Unit 2: Operating Systems & Networking Basics', description: 'Functions of Operating Systems (Process, Memory, File management), LAN, MAN, WAN, OSI 7-Layer model, TCP/IP protocol suite, IP addressing, Internet services.' },
      { unit_number: 3, title: 'Unit 3: Cloud Computing & Virtualization', description: 'Cloud computing concepts, Service models (IaaS, PaaS, SaaS), Deployment models (Public, Private, Hybrid), Virtualization hypervisors, Cloud storage and elasticity.' },
      { unit_number: 4, title: 'Unit 4: Internet of Things (IoT) & Smart Applications', description: 'IoT architecture, Sensors, Actuators, Microcontrollers (Arduino/Raspberry Pi overview), IoT protocols, Applications in Smart Cities, Healthcare, and Agriculture.' },
      { unit_number: 5, title: 'Unit 5: Cyber Security, Blockchain & Emerging Innovations', description: 'Cyber security fundamentals (CIA triad), Threats, Malware, Cryptography basics, Blockchain decentralization, Smart contracts, Overview of Quantum Computing and Green Computing.' }
    ]
  },
  {
    code: '100109',
    name: 'Universal Human Values',
    description: 'Understanding harmony in the human being, family, society, nature and existence; holistic approach to life and ethics.',
    units: [
      { unit_number: 1, title: 'Unit 1: Introduction to Value Education & Self-Exploration', description: 'Need, basic guidelines, content and process for Value Education, Self-Exploration: Natural Acceptance and Experiential Validation, Continuous Happiness and Prosperity.' },
      { unit_number: 2, title: 'Unit 2: Harmony in the Human Being (Myself & Body)', description: "Understanding human being as co-existence of Sentient 'I' (Self) and Material 'Body', Needs of 'I' vs 'Body', Program to ensure harmony of 'I' with 'Body': Sanyam and Swasthya." },
      { unit_number: 3, title: 'Unit 3: Harmony in Family & Society (Human-Human Relationship)', description: 'Values in relationships: Trust (Vishwas) and Respect (Samman) as foundational values, Affection, Care, Guidance, Reverence, Glory, Gratitude, Love, Undivided Society (Akhand Samaj).' },
      { unit_number: 4, title: 'Unit 4: Harmony in Nature & Whole Existence as Co-existence', description: 'Interconnectedness and mutual fulfillment in four orders of nature (Material, Bio/Plant, Animal, Human), Recyclability, Self-regulation, Whole existence as Co-existence (Sah-astitva).' },
      { unit_number: 5, title: 'Unit 5: Implications on Professional Ethics & Holistic Systems', description: 'Natural acceptance of human values, Definitiveness of Ethical Human Conduct, Professional ethics in engineering, Transition toward holistic human order and technologies.' }
    ]
  },
  {
    code: '100110',
    name: 'Essence of Indian Constitution',
    description: 'Historical background, philosophy, fundamental rights, directive principles, parliamentary governance, and constitutional bodies in India.',
    units: [
      { unit_number: 1, title: 'Unit 1: History of Making & Philosophy of Indian Constitution', description: 'Historical background, Constituent Assembly, Drafting committee, Preamble, Fundamental features and philosophical foundations of the Constitution.' },
      { unit_number: 2, title: 'Unit 2: Fundamental Rights & Fundamental Duties', description: 'Right to Equality (Articles 14-18), Right to Freedom (Articles 19-22), Right against Exploitation, Freedom of Religion, Cultural & Educational Rights, Constitutional Remedies (Article 32), Fundamental Duties (Article 51A).' },
      { unit_number: 3, title: 'Unit 3: Directive Principles of State Policy (DPSP)', description: 'Nature, significance and classification of DPSPs (Socialist, Gandhian, Liberal-Intellectual), Relationship between Fundamental Rights and DPSPs, Judicial interpretation.' },
      { unit_number: 4, title: 'Unit 4: Organs of Governance (Union Government)', description: 'President, Vice-President, Prime Minister and Council of Ministers, Parliament (Lok Sabha, Rajya Sabha), Legislative procedure, Supreme Court of India and Judicial Review.' },
      { unit_number: 5, title: 'Unit 5: State Government, Local Administration & Constitutional Bodies', description: 'Governor, Chief Minister, State Legislature, High Courts, Panchayati Raj and Municipalities (73rd & 74th Amendments), Election Commission of India, CAG, UPSC.' }
    ]
  },
  {
    code: '100111',
    name: 'Basics of Electrical & Electronics Engineering',
    description: 'DC/AC network analysis, transformers, electrical machines, semiconductor diodes, transistors, and digital logic circuits.',
    units: [
      { unit_number: 1, title: 'Unit 1: DC Circuit Analysis', description: 'Ohm’s Law, Kirchhoff’s Laws (KCL, KVL), Mesh analysis, Node analysis, Star-Delta conversion, Thevenin’s Theorem, Norton’s Theorem, Superposition Theorem, Maximum Power Transfer Theorem.' },
      { unit_number: 2, title: 'Unit 2: AC Circuits & Transformers', description: 'Representation of sinusoidal waveforms, Peak, Average and RMS values, Phasor analysis of R-L, R-C, R-L-C circuits, Series resonance, Single-phase transformer working principle, EMF equation, Losses and Efficiency.' },
      { unit_number: 3, title: 'Unit 3: Electrical Machines', description: 'Construction and working principle of DC generators and DC motors, EMF and Torque equations, Single-phase and Three-phase induction motors overview, Synchronous machines overview.' },
      { unit_number: 4, title: 'Unit 4: Semiconductor Diodes & Applications', description: 'P-N junction diode formation and V-I characteristics, Ideal vs Practical diode, Zener diode as voltage regulator, Half-wave rectifier, Full-wave center-tapped and bridge rectifiers, Filter circuits.' },
      { unit_number: 5, title: 'Unit 5: Transistors & Digital Logic Circuits', description: 'Bipolar Junction Transistor (BJT) operations and CE, CB, CC configurations, Transistor as a switch and amplifier, Digital logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR), Truth tables, De Morgan’s Laws.' }
    ]
  }
];

for (const sub of beuSyllabus) {
  const dbSub = db.prepare('SELECT id FROM subjects WHERE semester_id = ? AND code = ?').get(sem1Id, sub.code);
  if (!dbSub) continue;

  // Clear existing units and reinsert the official BEU module structure
  db.prepare('DELETE FROM units WHERE subject_id = ?').run(dbSub.id);

  const insertUnit = db.prepare(`
    INSERT INTO units (subject_id, unit_number, title, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const u of sub.units) {
    insertUnit.run(dbSub.id, u.unit_number, u.title, u.description);
  }
  console.log(`Updated units for [${sub.code}] ${sub.name}:`);
  sub.units.forEach(u => console.log(`  - ${u.title}`));
}

console.log('✅ BEU Official syllabus units aligned successfully!');
