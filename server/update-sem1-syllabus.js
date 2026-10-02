const { db } = require('./db');

console.log('--- Updating Semester 1 Syllabus (BEU Group A • Batch 2026–2030) ---');

const sem1 = db.prepare('SELECT id FROM semesters WHERE sem_number = 1').get();
if (!sem1) {
  console.error('Semester 1 not found in database!');
  process.exit(1);
}
const sem1Id = sem1.id;

// The 7 Official Subjects from BEU ADDA (Batch 2026–2030, 1st Semester)
const sem1Subjects = [
  {
    code: '100102',
    name: 'Engineering Mathematics-I',
    description: 'Calculus, multivariable differentiation, sequence and series, matrices, and linear algebra.',
    credits: 3,
    units: [
      { unit_number: 1, title: 'Unit 1: Differential Calculus', description: "Evolutes and involutes, Curvature, Rolle's Theorem, Mean Value Theorems, Taylor's and Maclaurin's series with remainders." },
      { unit_number: 2, title: 'Unit 2: Multivariable Calculus (Differentiation)', description: 'Partial derivatives, Total derivative, Euler’s theorem on homogeneous functions, Maxima, minima and saddle points, Method of Lagrange multipliers.' },
      { unit_number: 3, title: 'Unit 3: Sequences and Series', description: "Convergence of sequence and series, tests for convergence (Comparison test, D'Alembert's ratio test, Cauchy root test, Raabe's test), Fourier series." },
      { unit_number: 4, title: 'Unit 4: Matrices & Linear Algebra', description: 'Rank of matrix, Elementary transformations, System of linear equations, Cayley-Hamilton Theorem, Eigenvalues and Eigenvectors, Diagonalization of matrices.' },
      { unit_number: 5, title: 'Unit 5: Vector Calculus', description: 'Gradient, Directional derivatives, Divergence, Curl, Line, Surface and Volume integrals, Green’s Theorem, Gauss Divergence Theorem, Stokes Theorem.' }
    ]
  },
  {
    code: '100104',
    name: 'Engineering Physics',
    description: 'Wave optics, lasers, fiber optics, quantum mechanics, semiconductor physics, and modern nanotechnology.',
    credits: 3,
    units: [
      { unit_number: 1, title: 'Unit 1: Wave Optics', description: "Interference (Fresnel's biprism, Newton's rings), Diffraction (Fraunhofer diffraction, diffraction grating, resolving power), Polarization and Brewster's law." },
      { unit_number: 2, title: 'Unit 2: Lasers & Fiber Optics', description: 'Spontaneous and stimulated emission, Einstein coefficients, population inversion, Ruby laser, He-Ne laser, Optical fibers, Numerical aperture, Attenuation and Dispersion.' },
      { unit_number: 3, title: 'Unit 3: Quantum Mechanics', description: 'Wave-particle duality, de-Broglie hypothesis, Heisenberg uncertainty principle, Schrödinger wave equation (time-dependent and time-independent), Particle in 1D box.' },
      { unit_number: 4, title: 'Unit 4: Semiconductor Physics', description: 'Intrinsic and extrinsic semiconductors, Fermi level, Carrier concentration, Hall Effect and its experimental determination, P-N junction diode band structure.' },
      { unit_number: 5, title: 'Unit 5: Superconductivity & Nanomaterials', description: 'Meissner effect, Type-I and Type-II superconductors, BCS theory overview, Nanomaterials synthesis (Top-down & Bottom-up), Carbon nanotubes (CNTs).' }
    ]
  },
  {
    code: '100105',
    name: 'Introduction to AI',
    description: 'Fundamental concepts of Artificial Intelligence, intelligent agents, search algorithms, knowledge representation, and machine learning foundations.',
    credits: 3,
    units: [
      { unit_number: 1, title: 'Unit 1: Foundations of Artificial Intelligence', description: 'Definition, history and evolution of AI, Turing test, Intelligent agents, Agent architectures and Environment classification, Real-world AI applications.' },
      { unit_number: 2, title: 'Unit 2: Problem Solving & Search Algorithms', description: 'State space representation, Uninformed search (BFS, DFS, Uniform Cost Search), Informed/Heuristic search (Greedy Best-First, A* search, AO*), Adversarial search (Minimax, Alpha-Beta pruning).' },
      { unit_number: 3, title: 'Unit 3: Knowledge Representation & Reasoning', description: 'Propositional logic, First-Order Predicate Logic (FOPL), Inference rules, Unification, Resolution theorem proving, Semantic networks, Conceptual dependency, Frames.' },
      { unit_number: 4, title: 'Unit 4: Machine Learning Fundamentals', description: 'Supervised vs Unsupervised vs Reinforcement learning, Linear regression, Logistic regression, Decision trees, Overfitting vs Underfitting, Evaluation metrics.' },
      { unit_number: 5, title: 'Unit 5: AI Ethics & Emerging Frontiers', description: 'Deep learning introduction, Computer vision basics, NLP basics, Ethical issues in AI, Bias, Fairness, Privacy, and Future of Autonomous Systems.' }
    ]
  },
  {
    code: '100108',
    name: 'Computer Fundamentals & Emerging Technologies',
    description: 'Computer hardware architectures, operating system basics, networking, cloud computing, IoT, cybersecurity, and emerging tech.',
    credits: 3,
    units: [
      { unit_number: 1, title: 'Unit 1: Computer Fundamentals & Hardware Architecture', description: 'Evolution of computers, Von Neumann architecture, CPU organization, Primary memory (RAM, ROM, Cache), Secondary storage, Input/Output interface.' },
      { unit_number: 2, title: 'Unit 2: Operating Systems & Computer Networking', description: 'Operating system functions (Process, Memory, File management), Computer networks (LAN, MAN, WAN), Network topologies, OSI reference model, TCP/IP, IP addressing.' },
      { unit_number: 3, title: 'Unit 3: Cloud Computing & Virtualization', description: 'Cloud computing concepts, Service models (IaaS, PaaS, SaaS), Deployment models (Public, Private, Hybrid), Virtualization hypervisors, Cloud storage.' },
      { unit_number: 4, title: 'Unit 4: Internet of Things (IoT) & Smart Systems', description: 'IoT architecture, Sensors and Actuators, Communication protocols (MQTT, CoAP, Bluetooth, Zigbee), Arduino & Raspberry Pi overview, Smart cities & home automation.' },
      { unit_number: 5, title: 'Unit 5: Cyber Security, Blockchain & Modern Innovations', description: 'Information security principles (CIA triad), Malware types, Firewalls, Cryptography basics, Blockchain concepts (Decentralization, Smart contracts), Quantum computing glimpse.' }
    ]
  },
  {
    code: '100109',
    name: 'Universal Human Values',
    description: 'Understanding harmony in human being, family, society, nature and existence; holistic approach to life and ethics.',
    credits: 2,
    units: [
      { unit_number: 1, title: 'Unit 1: Introduction to Value Education', description: 'Need, basic guidelines, content and process for Value Education, Self-Exploration: Content and Process, Natural Acceptance and Experiential Validation, Continuous Happiness and Prosperity.' },
      { unit_number: 2, title: 'Unit 2: Harmony in the Human Being', description: "Human being as co-existence of Sentient 'I' and Material 'Body', Needs of Self ('I') and 'Body', Harmony of 'I' with 'Body': Sanyam and Swasthya." },
      { unit_number: 3, title: 'Unit 3: Harmony in the Family & Society', description: 'Values in human-human relationships: Trust (Vishwas) and Respect (Samman) as foundational values, Affection, Care, Guidance, Reverence, Glory, Gratitude, Love, Undivided Society (Akhand Samaj).' },
      { unit_number: 4, title: 'Unit 4: Harmony in Nature & Existence', description: 'Interconnectedness and mutual fulfillment among four orders of nature (Material, Plant/Bio, Animal, Human order), Recyclability and self-regulation in nature, Co-existence (Sah-astitva).' },
      { unit_number: 5, title: 'Unit 5: Holistic Understanding of Ethics & Vision', description: 'Natural acceptance of human values, Definitiveness of Ethical Human Conduct, Basis for Humanistic Education and Constitution, Transition toward holistic alternative technologies.' }
    ]
  },
  {
    code: '100110',
    name: 'Essence of Indian Constitution',
    description: 'Historical background, philosophy, fundamental rights, directive principles, parliamentary structure, and constitutional governance in India.',
    credits: 0,
    units: [
      { unit_number: 1, title: 'Unit 1: Making & Philosophy of Indian Constitution', description: 'Historical background, Government of India Act 1935, Constituent Assembly, Drafting committee, Preamble, Salient features of the Constitution.' },
      { unit_number: 2, title: 'Unit 2: Fundamental Rights & Duties', description: 'Right to Equality (Articles 14-18), Right to Freedom (Articles 19-22), Right against Exploitation, Freedom of Religion, Cultural & Educational Rights, Constitutional Remedies (Article 32), Fundamental Duties (Article 51A).' },
      { unit_number: 3, title: 'Unit 3: Directive Principles of State Policy (DPSP)', description: 'Nature, significance and classification of DPSPs (Socialist, Gandhian, Liberal-Intellectual), Relationship between Fundamental Rights and DPSPs, Judicial interpretation.' },
      { unit_number: 4, title: 'Unit 4: Union Executive & Parliament', description: 'President of India, Powers and functions, Vice-President, Prime Minister and Council of Ministers, Lok Sabha and Rajya Sabha, Legislative procedure, Supreme Court of India.' },
      { unit_number: 5, title: 'Unit 5: State Government & Constitutional Authorities', description: 'Governor, Chief Minister, State Legislature, High Courts, Panchayati Raj and Municipalities (73rd and 74th Amendments), Election Commission of India, Comptroller and Auditor General (CAG).' }
    ]
  },
  {
    code: '100111',
    name: 'Basics of Electrical & Electronics Engineering',
    description: 'DC/AC network analysis, single-phase transformers, DC/AC machines, semiconductor diodes, rectifiers, transistors, and digital logic circuits.',
    credits: 3,
    units: [
      { unit_number: 1, title: 'Unit 1: DC Circuit Analysis', description: 'Ohm’s Law, Kirchhoff’s Laws (KCL, KVL), Mesh analysis, Node analysis, Star-Delta conversion, Thevenin’s Theorem, Norton’s Theorem, Superposition Theorem, Maximum Power Transfer Theorem.' },
      { unit_number: 2, title: 'Unit 2: AC Circuits & Transformers', description: 'Representation of sinusoidal waveforms, Peak and RMS values, Phasor analysis of R-L, R-C, R-L-C circuits, Resonance in series circuits, Single-phase transformer working principle, EMF equation, Losses and Efficiency.' },
      { unit_number: 3, title: 'Unit 3: Electrical Machines', description: 'Construction and working principle of DC generators and DC motors, EMF equation, Torque equation, Single-phase and Three-phase induction motors overview, Synchronous machines overview.' },
      { unit_number: 4, title: 'Unit 4: Semiconductor Diodes & Applications', description: 'P-N junction diode formation and V-I characteristics, Ideal vs Practical diode, Zener diode as voltage regulator, Half-wave rectifier, Full-wave center-tapped and bridge rectifiers, Filter circuits.' },
      { unit_number: 5, title: 'Unit 5: Transistors & Digital Electronics Basics', description: 'Bipolar Junction Transistor (BJT) operations and CE, CB, CC configurations, Transistor as a switch and amplifier, Digital logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR), Truth tables, De Morgan’s Laws.' }
    ]
  }
];

// Clean up old Sem 1 subjects not in the new syllabus (e.g. EE101)
const oldSem1Subjects = db.prepare('SELECT id, code, name FROM subjects WHERE semester_id = ?').all(sem1Id);
for (const oldSub of oldSem1Subjects) {
  const isKept = sem1Subjects.some(s => s.code === oldSub.code);
  if (!isKept) {
    console.log(`Removing outdated subject ${oldSub.code} (${oldSub.name})...`);
    db.prepare('DELETE FROM units WHERE subject_id = ?').run(oldSub.id);
    db.prepare('DELETE FROM subjects WHERE id = ?').run(oldSub.id);
  }
}

// Now insert or update the 7 official subjects and their units
for (const subData of sem1Subjects) {
  let existingSub = db.prepare('SELECT id FROM subjects WHERE semester_id = ? AND code = ?').get(sem1Id, subData.code);

  let subId;
  if (existingSub) {
    db.prepare(`
      UPDATE subjects
      SET name = ?, description = ?, is_active = 1
      WHERE id = ?
    `).run(subData.name, subData.description, existingSub.id);
    subId = existingSub.id;
    console.log(`Updated subject [${subData.code}] ${subData.name} (ID: ${subId})`);
  } else {
    const result = db.prepare(`
      INSERT INTO subjects (semester_id, code, name, description, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(sem1Id, subData.code, subData.name, subData.description);
    subId = result.lastInsertRowid;
    console.log(`Created subject [${subData.code}] ${subData.name} (ID: ${subId})`);
  }

  // Clear existing units for this subject to repopulate cleanly
  db.prepare('DELETE FROM units WHERE subject_id = ?').run(subId);

  // Insert Units 1 to 5
  const insertUnit = db.prepare(`
    INSERT INTO units (subject_id, unit_number, title, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const unit of subData.units) {
    insertUnit.run(subId, unit.unit_number, unit.title, unit.description);
  }
  console.log(`  Added ${subData.units.length} units for [${subData.code}]`);
}

console.log('\n--- VERIFICATION OF SEMESTER 1 SUBJECTS ---');
const updatedSubs = db.prepare(`
  SELECT 
    s.id, s.code, s.name, 
    (SELECT COUNT(*) FROM units WHERE subject_id = s.id) as units_count
  FROM subjects s 
  WHERE s.semester_id = ? 
  ORDER BY s.code ASC
`).all(sem1Id);

console.table(updatedSubs);
console.log('✅ Semester 1 syllabus updated successfully!');
