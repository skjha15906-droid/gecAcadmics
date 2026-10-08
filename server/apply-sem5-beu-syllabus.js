const { db } = require('./db');

console.log('--- Applying Official BEU CSE Semester-V Syllabus from Image ---');

const sem5 = db.prepare('SELECT id FROM semesters WHERE sem_number = 5').get();
if (!sem5) {
  console.error('Semester 5 not found in database!');
  process.exit(1);
}
const sem5Id = sem5.id;

// Official Semester 5 Courses from BEU ADDA Scheme (Total 27 Credits)
const officialSem5Courses = [
  {
    code: '100508',
    name: 'Professional Skill Development',
    description: 'Soft skills, public speaking, group discussions, interpersonal dynamics, emotional intelligence, leadership, professional ethics, corporate communication, resume building & interview preparation (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Communication & Presentation Skills',
        description: 'Fundamentals of effective communication, barriers to communication, public speaking techniques, structuring technical and executive presentations, body language, non-verbal cues, audience analysis, voice modulation, visual aids and multimedia presentation design.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Interpersonal Dynamics & Leadership Skills',
        description: 'Emotional intelligence (EQ) and self-awareness, empathy in professional relationships, group dynamics and team collaboration, leadership styles and attributes, assertiveness vs aggressiveness, negotiation strategies, and conflict management.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Time Management & Stress Resilience',
        description: 'Time management principles, Eisenhower matrix, Pareto principle (80/20 rule), prioritization and goal setting (SMART goals), dealing with procrastination, stress identification and resilience, work-life balance, mindfulness and cognitive coping mechanisms.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Professional Ethics & Corporate Etiquette',
        description: 'Workplace ethics and integrity, accountability, diversity and inclusion, corporate culture and professional etiquette, business dress code, professional email writing, telephonic and virtual meeting etiquette, cross-cultural communication.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Employability Skills & Career Preparation',
        description: 'Curriculum Vitae (CV) vs Resume writing, tailoring resumes for applicant tracking systems (ATS), writing cover letters, Group Discussion (GD) strategies and evaluation parameters, personal interview preparation: technical, behavioral, and HR questions (STAR method), mock interview analysis. Textbooks: Meenakshi Raman & Sangeeta Sharma; Stephen R. Covey; Dale Carnegie.'
      }
    ]
  },
  {
    code: '105501',
    name: 'Artificial Intelligence',
    description: 'Foundations of AI, state space search (uninformed & heuristic A*), game playing (Minimax, Alpha-Beta), knowledge representation, first-order logic, probabilistic reasoning, machine learning & neural networks (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Introduction to AI & Intelligent Agents',
        description: 'Definitions of AI, Turing Test, cognitive modeling, foundations and history of AI. Intelligent Agents: PEAS framework (Performance measure, Environment, Actuators, Sensors), environment types, agent architectures: simple reflex, model-based, goal-based, utility-based, and learning agents.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Problem Solving & Search Strategies',
        description: 'Problem formulation, state space representations. Uninformed search algorithms: Breadth-First Search (BFS), Depth-First Search (DFS), Uniform Cost Search (UCS), Depth-Limited Search (DLS), Iterative Deepening Search (IDDFS). Informed (heuristic) search: Greedy Best-First Search, A* search, admissibility and consistency of heuristics, memory-bounded heuristic search, local search algorithms: Hill Climbing, Simulated Annealing, Genetic Algorithms.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Adversarial Search & Game Playing',
        description: 'Game theory formulation, two-player zero-sum games, Minimax algorithm, evaluation functions, Alpha-Beta pruning, move ordering, games with chance (expectiminimax), partially observable games, case studies in game playing (Chess, Checkers).'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Knowledge Representation & Logic',
        description: 'Knowledge-based agents, propositional logic, syntax, semantics, truth tables, inference, resolution. First-Order Logic (FOL): syntax, semantics, quantifiers, unification, forward and backward chaining, resolution refutation in FOL. Ontological engineering, semantic networks, frames, conceptual dependency.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Uncertain Knowledge & Probabilistic Reasoning',
        description: 'Handling uncertain knowledge, probability theory fundamentals, axioms of probability, Bayes\' Rule and conditional independence. Bayesian Networks: representation, syntax, semantics, exact inference by enumeration, variable elimination, approximate inference (Monte Carlo sampling), Markov Decision Processes (MDP).'
      },
      {
        unit_number: 6,
        title: 'Unit 6: Machine Learning & Modern AI',
        description: 'Forms of learning: supervised, unsupervised, reinforcement learning. Decision tree induction, K-Means clustering, Nearest Neighbor learning. Perceptron, Multi-Layer Perceptron (MLP), backpropagation, deep learning overview, applications of AI in computer vision and natural language processing. Textbooks: Stuart Russell & Peter Norvig (AIMA); Elaine Rich, Kevin Knight & S.B. Nair; Nils J. Nilsson.'
      }
    ]
  },
  {
    code: '105502',
    name: 'Database Management Systems',
    description: 'DBMS architecture, ER/EER models, relational algebra, SQL, normalization (1NF-BCNF), ACID transactions, concurrency control protocols, indexing (B/B+ Trees), storage & recovery (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Introduction to DBMS & System Architecture',
        description: 'Database system concepts, file systems vs DBMS, advantages of DBMS, data independence (logical and physical), Three-schema architecture (external, conceptual, internal), DBMS component modules, database users and DBA roles, database languages: DDL, DML, DCL, TCL.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Data Modeling: ER & Relational Data Model',
        description: 'Entity-Relationship (ER) model: entities, attributes, relationships, key constraints, cardinality ratios, weak entities, ER diagrams. Enhanced ER (EER): specialization, generalization, aggregation. Relational data model concepts, relational integrity constraints (Entity, Referential, Key, Domain), mapping ER/EER schemas to relational tables.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Relational Algebra & Structured Query Language (SQL)',
        description: 'Relational algebra operations: selection, projection, Cartesian product, union, intersection, set difference, joins (natural, equi, theta, outer), division. Relational calculus: TRC and DRC. SQL: schema definition, table creation, integrity constraints, basic queries, nested subqueries, aggregate functions, GROUP BY, HAVING, set operations, joins, views, assertions, triggers, transactions.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Relational Database Design & Normalization',
        description: 'Informal design guidelines, anomalies (insertion, deletion, update). Functional dependencies, Armstrong\'s axioms, attribute closure, minimal cover. Normal forms: 1NF, 2NF, 3NF, Boyce-Codd Normal Form (BCNF), multi-valued dependencies and 4NF, join dependencies and 5NF. Lossless join decomposition and dependency preservation.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Transaction Processing & Concurrency Control',
        description: 'Transaction concepts, ACID properties, transaction states, schedules: serial, non-serial, serializability (conflict and view serializability), testing for serializability, recoverability. Concurrency control protocols: Lock-based protocols (shared/exclusive, 2PL, Strict 2PL), Timestamp ordering protocol, Validation-based protocols. Deadlock handling: prevention, detection, wait-for graphs, recovery.'
      },
      {
        unit_number: 6,
        title: 'Unit 6: Storage, Indexing & Database Recovery',
        description: 'Storage hierarchy, file organization (heap, sorted, hashed), RAID technology. Indexing: primary, clustering, secondary indices, dense vs sparse indices, multi-level indices, B-Trees and B+ Trees indexing, static and dynamic hashing. Database recovery: failure classification, log-based recovery (deferred/immediate update), checkpoints, shadow paging, ARIES algorithm. Overview of NoSQL databases. Textbooks: Silberschatz, Korth, Sudarshan; Elmasri & Navathe; Ramakrishnan & Gehrke.'
      }
    ]
  },
  {
    code: '105503',
    name: 'Formal Language & Automata Theory',
    description: 'Finite automata (DFA, NFA), regular expressions and languages, context-free grammars (CFG), pushdown automata (PDA), Turing machines, undecidability and Chomsky hierarchy (Credits: 4 | ESE: 70, IA: 30 | L:3, T:1, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Fundamentals of Automata & Finite State Machines',
        description: 'Alphabet, languages, strings, operations on languages. Deterministic Finite Automata (DFA), Non-deterministic Finite Automata (NFA), NFA with epsilon transitions, equivalence of NFA and DFA, minimization of DFA using Myhill-Nerode theorem and table filling method. Moore and Mealy machines, state equivalence and machine conversion.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Regular Expressions, Languages & Properties',
        description: 'Regular expressions, operators, algebraic laws. Conversion of regular expressions to finite automata (Thomson\'s construction) and FA to regular expressions (Arden\'s theorem, state elimination). Pumping Lemma for regular languages and applications to non-regularity. Closure properties (union, intersection, complement, concatenation, star) and decision properties of regular languages.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Context-Free Grammars (CFG) & Languages (CFL)',
        description: 'Context-free grammars, derivations (leftmost, rightmost), parse trees, ambiguity in grammars, inherent ambiguity. Simplification of CFGs: elimination of useless symbols, null productions, and unit productions. Normal forms: Chomsky Normal Form (CNF) and Greibach Normal Form (GNF). Pumping Lemma for context-free languages, closure properties of CFLs.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Pushdown Automata (PDA)',
        description: 'Definition and model of PDA, instantaneous descriptions (ID), acceptance by empty stack and acceptance by final state, equivalence of acceptance mechanisms. Equivalence of PDA and Context-Free Grammars (conversion of CFG to PDA and PDA to CFG). Deterministic Pushdown Automata (DPDA) and deterministic CFLs, two-stack PDA.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Turing Machines & Computability',
        description: 'Turing Machine (TM) model, definition, instantaneous descriptions, design of Turing machines, techniques for TM construction: storage in state, multiple tracks, multi-tape TM, nondeterministic TM, equivalence of TM variants. Church-Turing thesis, Universal Turing Machine.'
      },
      {
        unit_number: 6,
        title: 'Unit 6: Undecidability & Chomsky Hierarchy',
        description: 'Decidable and undecidable problems, recursive and recursively enumerable languages, Halting problem of Turing Machine, Post\'s Correspondence Problem (PCP), Rice\'s theorem, reducibility. Chomsky hierarchy of languages: Type-0 (Unrestricted), Type-1 (Context-Sensitive), Type-2 (Context-Free), Type-3 (Regular). Textbooks: Hopcroft, Motwani & Ullman; Michael Sipser; Peter Linz; Mishra & Chandrasekaran.'
      }
    ]
  },
  {
    code: '105504',
    name: 'Software Engineering',
    description: 'SDLC models (Waterfall, Spiral, Agile/Scrum), requirement analysis (SRS), architectural design, estimation (COCOMO), software testing strategies (Black-box, White-box), quality assurance & maintenance (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Introduction to Software Engineering & Process Models',
        description: 'Software characteristics, software crisis, software engineering definition, layered technology. Software Process Models: Waterfall model, Prototyping model, Evolutionary models, Incremental model, Spiral model, RAD model. Agile Software Development: Agile principles, Scrum, Extreme Programming (XP), Kanban, comparison of process models.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Software Requirements Engineering',
        description: 'Requirements engineering process: Inception, Elicitation, Elaboration, Negotiation, Specification, Validation. Software Requirements Specification (SRS), IEEE 830 standard for SRS. Functional vs Non-functional requirements, User requirements, System requirements. Requirements modeling: Use case diagrams, Data Flow Diagrams (DFD), Entity Relationship Diagrams, state transition diagrams.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Software Design Engineering & Architecture',
        description: 'Design concepts: Abstraction, Modularity, Information Hiding, Cohesion and Coupling (types and evaluation). Software Architecture: Architectural styles (Data-centered, Data-flow, Call-and-return, Layered). Object-Oriented Design using UML: Class diagrams, Sequence diagrams, Collaboration diagrams, Activity diagrams, Component and Deployment diagrams.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Software Project Management & Cost Estimation',
        description: 'Software metrics: Size-oriented metrics (LOC), Function-oriented metrics (Function Points - FP). Cost estimation models: Empirical estimation, COCOMO model (Basic, Intermediate, Detailed), COCOMO-II. Project scheduling: Work Breakdown Structure (WBS), Gantt charts, PERT/CPM networks. Risk management: Risk identification, Risk projection (RMMM plan).'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Software Testing Strategies & Techniques',
        description: 'Software testing fundamentals: Verification vs Validation, error, fault, bug, failure. Test case design. White-box testing: Basis path testing, Cyclomatic complexity, control structure testing (Condition, Data flow, Loop testing). Black-box testing: Equivalence partitioning, Boundary Value Analysis (BVA), Cause-Effect graphing. Testing levels: Unit testing, Integration testing (Top-down, Bottom-up, Sandwich), System testing, Alpha and Beta testing, Regression testing, Mutation testing, Debugging techniques.'
      },
      {
        unit_number: 6,
        title: 'Unit 6: Software Maintenance, Quality Assurance & SCM',
        description: 'Software maintenance: Need, categories (Corrective, Adaptive, Perfective, Preventive), maintenance cost, Software reengineering, Reverse engineering. Software Quality: SQA activities, Software reliability metrics (MTTF, MTBF), SEI Capability Maturity Model (CMM/CMMI levels), ISO 9000/9001 standards. Software Configuration Management (SCM): SCM process, version control, change control, SCM tools. Textbooks: Roger S. Pressman; Ian Sommerville; Rajib Mall.'
      }
    ]
  },
  {
    code: '105505',
    name: 'Seminar',
    description: 'Literature review, contemporary technical topic presentation, technical slide deck design, public delivery, viva-voce and comprehensive report submission (Credits: 1 | ESE: 50, IA: 0 | L:1, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Technical Seminar Presentation & Report Writing',
        description: 'Guidelines: 1. Selection of an advanced and contemporary topic in Computer Science and Engineering from reputed journals (IEEE, ACM, Springer, Elsevier). 2. Literature survey and critical analysis of existing research work. 3. Preparation of technical presentation slides with effective visual structure. 4. Oral presentation before department evaluation committee and peer group. 5. Handling technical questions during Q&A session. 6. Preparation and submission of formal technical seminar report as per prescribed university format.'
      }
    ]
  },
  {
    code: '100510P',
    name: 'Summer Entrepreneurship - II',
    description: '6-Week industrial internship / entrepreneurship startup project between 4th and 5th sem, business model canvas, project execution, report submission and viva (Credits: 6 | ESE: 60, IA: 40 | PROJ)',
    units: [
      {
        unit_number: 1,
        title: 'Entrepreneurship Project / 6-Week Industry Internship',
        description: 'Course Guidelines: 1. Completion of 6-week industrial training / internship in registered industry/startup, or execution of an innovative entrepreneurship project between 4th and 5th semester. 2. Problem identification, market feasibility study, customer validation, and Business Model Canvas (BMC). 3. Prototype design, software development, or industrial process study. 4. Weekly progress monitoring under department mentor. 5. Compilation and submission of comprehensive internship/entrepreneurship report with industry completion certificate. 6. Final viva-voce examination and demonstration before university external examiner panel.'
      }
    ]
  },
  {
    code: '100511P',
    name: 'NPTEL Courses - 2',
    description: 'Approved 8-Week / 12-Week NPTEL / SWAYAM advanced certification course in CSE domains with assignment and proctored exam assessment (Credits: 2 | ESE: 30, IA: 20 | L:0, T:0, P:4)',
    units: [
      {
        unit_number: 1,
        title: 'NPTEL MOOC Certification Course - II Guidelines',
        description: 'Credit transfer guidelines as per BEU & AICTE framework: 1. Registration in approved advanced NPTEL/SWAYAM online courses in emerging domains (e.g. Deep Learning, Cloud Computing, Cyber Security, Blockchain Architecture, Full Stack Web Development). 2. Regular submission of weekly assignments and quizzes (internal assessment: 20 marks). 3. Participation in proctored end-term NPTEL certification examination (external assessment: 30 marks). 4. Credit transfer processing upon submission of official NPTEL e-certificate and grade card to department.'
      }
    ]
  },
  {
    code: '105502P',
    name: 'Database Management Systems Lab',
    description: 'Hands-on practice in SQL DDL/DML, complex joins, nested queries, views, PL/SQL procedures, functions, triggers, and cursors (Credits: 2 | ESE: 30, IA: 20 | L:0, T:0, P:4)',
    units: [
      {
        unit_number: 1,
        title: 'Practical Experiments: SQL, PL/SQL & Relational Database Design',
        description: 'List of practical experiments (PostgreSQL / MySQL / Oracle): 1. Creation of database schema and table definitions with integrity constraints (Primary Key, Foreign Key, Unique, Check, Not Null) using DDL. 2. Data manipulation (INSERT, UPDATE, DELETE) and query execution with WHERE, ORDER BY, GROUP BY, HAVING, LIKE. 3. Implementation of nested subqueries, correlated queries, and scalar subqueries. 4. Implementation of INNER, LEFT, RIGHT, FULL OUTER, and NATURAL JOIN operations. 5. Creation and management of Views, Sequences, and Indexes. 6. Writing PL/SQL blocks with conditional statements, loops, and exception handling. 7. Creation of PL/SQL Stored Procedures and Functions with IN/OUT parameters. 8. Creation of Database Triggers (BEFORE/AFTER triggers for audit logging and constraint checking). 9. Database Cursors (Implicit and Explicit cursors, Cursor FOR loops). 10. Mini-Project: Conceptual schema design (ER model), relational mapping, normalization to 3NF/BCNF, and application integration.'
      }
    ]
  }
];

const transaction = db.transaction(() => {
  // 1. Delete existing units for Sem 5 subjects
  const existingSem5Subs = db.prepare('SELECT id FROM subjects WHERE semester_id = ?').all(sem5Id);
  const deleteUnitStmt = db.prepare('DELETE FROM units WHERE subject_id = ?');
  for (const sub of existingSem5Subs) {
    deleteUnitStmt.run(sub.id);
  }

  // 2. Delete existing Sem 5 subjects
  db.prepare('DELETE FROM subjects WHERE semester_id = ?').run(sem5Id);

  // 3. Insert official Sem 5 subjects & units
  const insertSub = db.prepare(`
    INSERT INTO subjects (semester_id, code, name, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  const insertUnit = db.prepare(`
    INSERT INTO units (subject_id, unit_number, title, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const course of officialSem5Courses) {
    const res = insertSub.run(sem5Id, course.code, course.name, course.description);
    const newSubjectId = res.lastInsertRowid;
    console.log(`[+] Added Subject: [${course.code}] ${course.name} (ID: ${newSubjectId})`);

    for (const unit of course.units) {
      insertUnit.run(newSubjectId, unit.unit_number, unit.title, unit.description);
    }
    console.log(`    -> Added ${course.units.length} unit(s) for ${course.code}`);
  }
});

transaction();
console.log('--- Successfully applied BEU Semester-V syllabus to database! ---');
