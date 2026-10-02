const { db } = require('./db');

console.log('--- Applying 100% Exact BEU Official Syllabus from PDF (Batch 2026-30) ---');

const sem1 = db.prepare('SELECT id FROM semesters WHERE sem_number = 1').get();
if (!sem1) {
  console.error('Semester 1 not found!');
  process.exit(1);
}
const sem1Id = sem1.id;

// Official Courses and their EXACT Units / Body of Knowledge (BoK) from the BEU PDF
const officialSubjects = [
  {
    code: '100102',
    name: 'Engineering Mathematics-I',
    description: 'Basic linear algebra, single variable differential calculus, multivariable calculus, integral calculus, and vector calculus.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: Basic Linear Algebra',
        description: 'Elementary transformations and Rank of Matrix, Rank by using Echelon and Normal form of Matrices. Linear dependence & independence of vectors in R^n space, Consistency of System of Linear Equations, Eigenvalues & Eigenvectors, Cayley-Hamilton Theorem, Similarity of Matrices & Diagonalization of Square Matrices. Quadratic Form, Canonical Form of Matrices.'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: Differential Calculus: Single Variable',
        description: 'Higher order derivatives; Successive differentiation and Leibnitz’s Theorem, Mean Value Theorems (Rolle’s; Lagrange’s; Cauchy), Indeterminate Forms; L’ Hopital Rule, Tangents & Normal of Algebraic & Polar Curves, Curvature.'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: Differential Calculus: Several Variables',
        description: 'Partial differentiations; Euler’s theorems, Limit, Continuity and differentiability of functions of Several Variables, Taylor’s theorem with various forms of remainders, Maclaurin\'s theorem and related problems, Maxima & Minima for functions of several variables; Lagrange’s Multiplier Method.'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Integral Calculus',
        description: 'Differentiation under the integral sign; Leibnitz’s rule, Double integral; Change the order of integration; Evaluation of double integration by changing it into polar co-ordinates, Triple Integral; Evaluation of Triple integral by changing to Spherical Polar co-ordinates & Cylindrical polar co-ordinates, Beta; Gamma; Elliptic integral; Relation between Beta & Gamma functions, General Properties.'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: Vector Calculus',
        description: 'Scalar and vector valued functions; Concepts of gradient, divergence and curl and their geometrical and physical significance; tangent plane; directional derivative, Line, surface and volume integrals - Statement of Green’s, Stokes’ and Gauss divergence theorems - verification and evaluation of vector integrals.'
      }
    ]
  },
  {
    code: '100104',
    name: 'Engineering Physics',
    description: 'Wave optics, lasers and optical fiber, electromagnetism & waves, quantum mechanics, and semiconductors & nanomaterials.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: Wave Optics',
        description: 'Interference, Division of amplitude, Newton’s Ring experiment, Michelson interferometer, Diffraction, Fraunhofer diffraction, Single and double slit, & Circular aperture, Diffraction Grating, Rayleigh criterion, resolving power of telescope, Polarization, double-refracting crystal, Nicol prism.'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: Lasers and Optical Fiber',
        description: 'Characteristics of laser light, Einstein’s A & B coefficients, Population inversion, pumping mechanism, Optical resonator, Ruby laser, He-Ne laser, and Semiconductor laser, Structure of optical fiber, Basic principles (TIR, Acceptance angle and Numerical Aperture), Types of optical fibers, Propagation mechanism of light in fiber, Attenuation, Applications of optical fibres, Fibre optic sensors.'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: Electromagnetism & Propagation of Waves',
        description: 'Electric fields, Gauss’ Law, Dielectrics and Capacitors, Magnetic fields & Magnetic Materials, Maxwell’s Equations, Electromagnetic waves & Poynting Theorem.'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Quantum Mechanics',
        description: 'Introduction to Quantum Mechanics, De-Broglie hypothesis, Heisenberg uncertainty principle, Wave function and its characteristics, Schrödinger’s equation (time-dependent and independent), Particle in a box, Energy Eigen values and Eigen functions, Potential barrier and Tunneling.'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: Semiconductors & Nano-materials',
        description: 'Introduction, Types of materials (metal, semiconductor, insulator), Intrinsic and extrinsic semiconductors, P-type and N-type, Diffusion, Drift and Fermi level, Photodiode, P-N junction transistor, LED, Hall effect, Solar cell, Introduction to nanoscience & nanotechnology, Significance of nanoscale, Unique properties, 0D (Quantum Dot), 1D (Nanowire).'
      }
    ]
  },
  {
    code: '100105',
    name: 'Introduction to AI',
    description: 'Foundations of AI, problem solving by search, knowledge representation, reasoning under uncertainty, machine learning paradigms and frontiers.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: Introduction to Artificial Intelligence',
        description: 'What is AI? History and evolution of AI, Foundations of AI: philosophy, mathematics, and cognitive-science influences, Intelligent agents: agent–environment interaction, PEAS description, Types of environments, Types of agents: simple reflex, model-based, goal-based, utility-based, learning agents, Overview of AI application domains.'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: Problem Solving by Search',
        description: 'Problem formulation and state-space representation, Uninformed search: BFS, DFS, Uniform Cost Search, Depth-Limited and Iterative Deepening Search, Informed (heuristic) search: Greedy Best-First Search, A* algorithm, Heuristic function design, Local search: Hill Climbing, Simulated Annealing, Adversarial search: Minimax, Alpha-Beta pruning, Constraint Satisfaction Problems (CSP).'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: Knowledge Representation and Reasoning',
        description: 'Knowledge representation issues; propositional logic — syntax and semantics, Inference in propositional logic: resolution, First-order predicate logic — syntax, quantifiers, Inference in first-order logic: forward chaining, backward chaining, resolution, Structured knowledge representation: semantic networks, frames, Rule-based (production) systems.'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Reasoning Under Uncertainty',
        description: 'Sources of uncertainty; review of basic probability theory, Bayes\' theorem and its application to AI reasoning, Bayesian networks: representation and manual inference, Introduction to fuzzy logic and fuzzy sets, Certainty factors and rule-based uncertainty.'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: Introduction to Machine Learning and AI Applications',
        description: 'Machine learning paradigms: supervised, unsupervised, reinforcement learning, Regression and classification (linear regression, k-NN, decision trees), Clustering (k-means), Artificial neural networks: perceptron, NLP overview, Computer Vision, Expert systems, Robotics and AI, Ethics, bias, and responsible AI; SDGs.'
      }
    ]
  },
  {
    code: '100106',
    name: 'Basic Electrical Engineering',
    description: 'Electrical fundamentals, DC/AC circuits, magnetic circuits, transformers, and electrical special purpose machines.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: Electrical fundamentals and DC Circuits',
        description: 'Concept of Charge, Current, Voltage, Resistance, Inductance, Capacitance, EMF, Ohm\'s Law, Kirchhoff’s Current & Voltage Laws, Effect of Temperature on Resistance, Resistor, Inductor & Capacitor properties, Series/parallel circuits, Divider rules, Star-Delta transformations.'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: AC Circuits',
        description: 'Generation of sinusoidal EMF; Peak, RMS, average values, form factor, Wave and phasor representation, Impedance of R, L, C, RL, RC, RLC circuits, Resonance, Power in AC circuits (Active, reactive, apparent), Power factor, Harmonics, Three-phase systems, Star and Delta connections.'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: Magnetic Circuits and Electromagnetic induction',
        description: 'Magnetic Flux, Magnetic intensity, Flux Density(B), MMF, Reluctance, Permeability, Analogy with electric circuits, B-H Curve, Hysteresis and Eddy Current Losses, Faraday’s laws, Fleming’s rules, Statically & dynamically induced EMF, Self & mutual inductance.'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Transformer',
        description: 'Transformer construction, principle of operation, Single phase vs three phase, EMF equation, Performance (Load test, voltage regulation, losses and efficiency), Special purpose transformers (Audio, RF, IF, Pulse, Isolation, Impedance matching).'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: Electrical and Special Purpose Machines',
        description: 'DC machines: construction, EMF equation, types of DC Motor, starter, AC machines: Three-phase induction motor, slip, starters (DOL, Star-delta), Single-phase induction motors, Special machines: BLDC motor, Servo motor, Stepper motor, Switched Reluctance, Universal, Coreless motors.'
      }
    ]
  },
  {
    code: '100101',
    name: 'Communication Skills',
    description: 'Vocabulary enrichment, English grammar, technical communication, professional writing, and comprehension skills.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: Vocabulary Enrichment',
        description: 'Technical Vocabulary Development, Nature of Word Formation, Root Word and Morpheme, Prefix, and Suffix, Foreign Expressions in English, Synonyms and Antonyms, Homophones and Homographs, Abbreviations and Acronyms.'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: Basics of English Grammar',
        description: 'Parts of Speech, Articles, Prepositions, Subject Verb Agreement, Phrase and Clause, Question formation using Auxiliaries, Modals, Wh-Words, Tenses, Voice, Redundancies/Clichés.'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: Technical Communication',
        description: 'Communication Role and Relevance, Process/Steps, Types (formal/informal, verbal/non-verbal, Kinesics, Proxemics, Vocalics), Barriers to Communication, Channels, 7C’s for effective communication.'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Techniques of Professional Writing',
        description: 'Letter Writing (formal/informal/cover letter/application), Report Writing, Proposal, Notice, Agenda, Minutes of Meeting, Memorandum, Resume/CV, Essay Writing, Email Writing.'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: Comprehension and Interpretation Skills',
        description: 'If (Poem) by Rudyard Kipling, Of Studies (Essay) by Sir Francis Bacon, India: Our Motherland (Essay) by Swami Vivekananda, A Devoted Son (Story) by Anita Desai, Unseen/Untaught passage.'
      }
    ]
  },
  {
    code: '100108',
    name: 'Computer Fundamentals & Emerging Technologies',
    description: 'Hardware architecture, operating systems, networking, cloud, IoT, cyber security, and emerging tech.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: Computer Fundamentals & Functional Units',
        description: 'Generations of computers, Classification of computers, Von Neumann architecture, CPU functional units (ALU, CU, Registers), Memory hierarchy (Cache, RAM, ROM, Secondary storage).'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: Operating Systems & Networking Basics',
        description: 'Functions of Operating Systems (Process, Memory, File management), LAN, MAN, WAN, OSI 7-Layer model, TCP/IP protocol suite, IP addressing, Internet services.'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: Cloud Computing & Virtualization',
        description: 'Cloud computing concepts, Service models (IaaS, PaaS, SaaS), Deployment models (Public, Private, Hybrid), Virtualization hypervisors, Cloud storage and elasticity.'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Internet of Things (IoT) & Smart Applications',
        description: 'IoT architecture, Sensors, Actuators, Microcontrollers (Arduino/Raspberry Pi overview), IoT protocols, Applications in Smart Cities, Healthcare, and Agriculture.'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: Cyber Security, Blockchain & Emerging Innovations',
        description: 'Cyber security fundamentals (CIA triad), Threats, Malware, Cryptography basics, Blockchain decentralization, Smart contracts, Overview of Quantum Computing and Green Computing.'
      }
    ]
  },
  {
    code: '100109',
    name: 'Universal Human Values',
    description: 'Understanding harmony in the human being, family, society, nature and existence; holistic approach to life and ethics.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: Introduction to Value Education & Self-Exploration',
        description: 'Need, basic guidelines, content and process for Value Education, Self-Exploration: Natural Acceptance and Experiential Validation, Continuous Happiness and Prosperity.'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: Harmony in the Human Being (Myself & Body)',
        description: 'Understanding human being as co-existence of Sentient \'I\' (Self) and Material \'Body\', Needs of \'I\' vs \'Body\', Program to ensure harmony of \'I\' with \'Body\': Sanyam and Swasthya.'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: Harmony in Family & Society (Human-Human Relationship)',
        description: 'Values in relationships: Trust (Vishwas) and Respect (Samman) as foundational values, Affection, Care, Guidance, Reverence, Glory, Gratitude, Love, Undivided Society (Akhand Samaj).'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Harmony in Nature & Whole Existence as Co-existence',
        description: 'Interconnectedness and mutual fulfillment in four orders of nature (Material, Bio/Plant, Animal, Human), Recyclability, Self-regulation, Whole existence as Co-existence (Sah-astitva).'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: Implications on Professional Ethics & Holistic Systems',
        description: 'Natural acceptance of human values, Definitiveness of Ethical Human Conduct, Professional ethics in engineering, Transition toward holistic human order and technologies.'
      }
    ]
  },
  {
    code: '100110',
    name: 'Essence of Indian Constitution',
    description: 'Historical background, philosophy, fundamental rights, directive principles, parliamentary governance, and constitutional bodies in India.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: History of Making & Philosophy of Indian Constitution',
        description: 'Historical background, Constituent Assembly, Drafting committee, Preamble, Fundamental features and philosophical foundations of the Constitution.'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: Fundamental Rights & Fundamental Duties',
        description: 'Right to Equality (Articles 14-18), Right to Freedom (Articles 19-22), Right against Exploitation, Freedom of Religion, Cultural & Educational Rights, Constitutional Remedies (Article 32), Fundamental Duties (Article 51A).'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: Directive Principles of State Policy (DPSP)',
        description: 'Nature, significance and classification of DPSPs (Socialist, Gandhian, Liberal-Intellectual), Relationship between Fundamental Rights and DPSPs, Judicial interpretation.'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Organs of Governance (Union Government)',
        description: 'President, Vice-President, Prime Minister and Council of Ministers, Parliament (Lok Sabha, Rajya Sabha), Legislative procedure, Supreme Court of India and Judicial Review.'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: State Government, Local Administration & Constitutional Bodies',
        description: 'Governor, Chief Minister, State Legislature, High Courts, Panchayati Raj and Municipalities (73rd & 74th Amendments), Election Commission of India, CAG, UPSC.'
      }
    ]
  },
  {
    code: '100111',
    name: 'Basics of Electrical & Electronics Engineering',
    description: 'DC/AC network analysis, transformers, electrical machines, semiconductor diodes, transistors, and digital logic circuits.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: Electrical fundamentals and DC Circuits',
        description: 'Concept of Charge, Current, Voltage, Resistance, Inductance, Capacitance, EMF, Ohm\'s Law, Kirchhoff’s Current & Voltage Laws, Series/parallel circuits, Divider rules, Star-Delta transformations.'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: AC Circuits',
        description: 'Generation of sinusoidal EMF; Peak, RMS, average values, form factor, Wave and phasor representation, Impedance of R, L, C, RL, RC, RLC circuits, Resonance, Power in AC circuits, Three-phase systems.'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: Magnetic Circuits and Electromagnetic induction',
        description: 'Magnetic Flux, Magnetic intensity, Flux Density(B), MMF, Reluctance, Permeability, Analogy with electric circuits, B-H Curve, Faraday’s laws, Fleming’s rules, Self & mutual inductance.'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Transformer',
        description: 'Transformer construction, principle of operation, Single phase vs three phase, EMF equation, Performance (Load test, voltage regulation, losses and efficiency), Special purpose transformers.'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: Electrical and Special Purpose Machines',
        description: 'DC machines: construction, EMF equation, types of DC Motor, starter, AC machines: Three-phase induction motor, single-phase induction motors, Special machines (BLDC, Servo, Stepper motors).'
      }
    ]
  }
];

// Labs from the official PDF
const practicalLabs = [
  {
    code: '100101P',
    name: 'Communication Skills Lab',
    description: 'LSRW skills, social & academic communication, oral presentation, anchoring, interviews, GD, debate, JAM, phonetics & IPA, role plays.'
  },
  {
    code: '100104P',
    name: 'Engineering Physics Lab',
    description: 'Diffraction grating, Newton’s ring, resolving power of telescope, polarimeter, numerical aperture, dielectric constant, Planck’s constant, Hall effect, energy band gap.'
  },
  {
    code: '100106P',
    name: 'Basic Electrical Engineering Lab',
    description: 'Measurement of electrical parameters, Ohm’s law, KCL/KVL verification, AC waveform parameters, RLC circuits, single-phase transformer tests, induction motor operation.'
  },
  {
    code: '100112P',
    name: 'Programming for Problem Solving Lab',
    description: 'C programming algorithmic logic, decision making, loops, 1D/2D arrays, pointers & strings, recursion, structures & unions, file handling, C++ OOP classes & inheritance.'
  },
  {
    code: '100113P',
    name: 'Sports/Yoga/NCC/NSS',
    description: 'BMI assessment, physical fitness tests, warm-up exercises, yoga asanas (Tadasana, Vajrasana, Bhujangasana), Pranayama, meditation, athletics, team games.'
  }
];

// 1. Upsert Theory Subjects
for (const sub of officialSubjects) {
  let dbSub = db.prepare('SELECT id FROM subjects WHERE semester_id = ? AND code = ?').get(sem1Id, sub.code);
  let subId;
  if (dbSub) {
    db.prepare('UPDATE subjects SET name = ?, description = ?, is_active = 1 WHERE id = ?')
      .run(sub.name, sub.description, dbSub.id);
    subId = dbSub.id;
  } else {
    const res = db.prepare('INSERT INTO subjects (semester_id, code, name, description, is_active) VALUES (?, ?, ?, ?, 1)')
      .run(sem1Id, sub.code, sub.name, sub.description);
    subId = res.lastInsertRowid;
  }

  // Clear units and add exact units
  db.prepare('DELETE FROM units WHERE subject_id = ?').run(subId);
  const insUnit = db.prepare('INSERT INTO units (subject_id, unit_number, title, description, is_active) VALUES (?, ?, ?, ?, 1)');
  for (const u of sub.units) {
    insUnit.run(subId, u.unit_number, u.title, u.description);
  }
  console.log(`✓ [${sub.code}] ${sub.name}: ${sub.units.length} units configured`);
}

// 2. Upsert Practical Labs (with standard Lab Units)
for (const lab of practicalLabs) {
  let dbLab = db.prepare('SELECT id FROM subjects WHERE semester_id = ? AND code = ?').get(sem1Id, lab.code);
  let labId;
  if (dbLab) {
    db.prepare('UPDATE subjects SET name = ?, description = ?, is_active = 1 WHERE id = ?')
      .run(lab.name, lab.description, dbLab.id);
    labId = dbLab.id;
  } else {
    const res = db.prepare('INSERT INTO subjects (semester_id, code, name, description, is_active) VALUES (?, ?, ?, ?, 1)')
      .run(sem1Id, lab.code, lab.name, lab.description);
    labId = res.lastInsertRowid;
  }

  // Ensure lab has lab experiments / units
  const existingUnits = db.prepare('SELECT COUNT(*) as count FROM units WHERE subject_id = ?').get(labId).count;
  if (existingUnits === 0) {
    const insUnit = db.prepare('INSERT INTO units (subject_id, unit_number, title, description, is_active) VALUES (?, ?, ?, ?, 1)');
    insUnit.run(labId, 1, 'Lab Experiments & Practical Exercises', lab.description);
    insUnit.run(labId, 2, 'Lab Manual & Viva Questions', 'Complete lab manual records, observations, and viva voce question bank.');
  }
  console.log(`✓ [${lab.code}] ${lab.name} (Lab configured)`);
}

console.log('\n--- ALL SEMESTER 1 SUBJECTS IN DATABASE ---');
const allSem1 = db.prepare(`
  SELECT s.id, s.code, s.name, (SELECT COUNT(*) FROM units WHERE subject_id = s.id) as units_count
  FROM subjects s WHERE s.semester_id = ? ORDER BY s.code ASC
`).all(sem1Id);
console.table(allSem1);

console.log('✅ 100% BEU PDF SYLLABUS APPLIED!');
