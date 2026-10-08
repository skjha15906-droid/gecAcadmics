const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for reliability and speed
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      roll_number TEXT,
      semester INTEGER,
      role TEXT NOT NULL DEFAULT 'student',
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS semesters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sem_number INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semester_id INTEGER NOT NULL REFERENCES semesters(id) ON DELETE RESTRICT,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
      unit_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resource_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      icon TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      semester_id INTEGER NOT NULL REFERENCES semesters(id),
      subject_id INTEGER NOT NULL REFERENCES subjects(id),
      unit_id INTEGER NOT NULL REFERENCES units(id),
      topic TEXT,
      description TEXT,
      resource_type TEXT DEFAULT 'Handwritten Notes',
      file_url TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_by INTEGER NOT NULL REFERENCES users(id),
      uploader_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
      rejection_reason TEXT,
      rejection_details TEXT,
      reviewed_by INTEGER REFERENCES users(id),
      reviewed_at DATETIME,
      views_count INTEGER DEFAULT 0,
      downloads_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      reported_by INTEGER NOT NULL REFERENCES users(id),
      reporter_name TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
      resolved_by INTEGER REFERENCES users(id),
      resolution_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      user_name TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      admin_reply TEXT,
      replied_at DATETIME,
      replied_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    return; // Already seeded
  }

  console.log('[DB] Seeding initial GECWC Academics dataset...');

  // 1. Seed Users
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('@knowledge129admin', salt);
  const modHash = bcrypt.hashSync('mod123', salt);
  const studentHash = bcrypt.hashSync('student123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, roll_number, semester, role, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('pacifist', 'pacifist@gecwc.ac.in', adminHash, 'pacifist', null, 'admin', 'active');
  insertUser.run('Aman Kumar', 'aman.cse@gecwc.ac.in', studentHash, '22105128001', 5, 'student', 'active');
  insertUser.run('Priya Sharma', 'priya.cse@gecwc.ac.in', studentHash, '23105128014', 3, 'student', 'active');
  insertUser.run('Rahul Verma', 'rahul.cse@gecwc.ac.in', studentHash, '21105128045', 7, 'student', 'active');
  insertUser.run('Sneha Patel', 'sneha.cse@gecwc.ac.in', studentHash, '24105128020', 1, 'student', 'active');

  // 2. Seed Semesters (Semester 1 to 8)
  const insertSemester = db.prepare(`
    INSERT INTO semesters (sem_number, name, description, is_active)
    VALUES (?, ?, ?, 1)
  `);

  for (let i = 1; i <= 8; i++) {
    insertSemester.run(i, `Semester ${i}`, `B.Tech Computer Science & Engineering - Semester ${i}`);
  }

  // 3. Seed Subjects for CSE
  const insertSubject = db.prepare(`
    INSERT INTO subjects (semester_id, code, name, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  // Sem 1 (BEU Group A • Batch 2026–2030)
  insertSubject.run(1, '100102', 'Engineering Mathematics-I', 'Calculus, multivariable differentiation, sequence and series, matrices, and linear algebra.');
  insertSubject.run(1, '100104', 'Engineering Physics', 'Wave optics, lasers, fiber optics, quantum mechanics, semiconductor physics, and modern nanotechnology.');
  insertSubject.run(1, '100105', 'Introduction to AI', 'Fundamental concepts of Artificial Intelligence, intelligent agents, search algorithms, knowledge representation, and machine learning foundations.');
  insertSubject.run(1, '100108', 'Computer Fundamentals & Emerging Technologies', 'Computer hardware architectures, operating system basics, networking, cloud computing, IoT, cybersecurity, and emerging tech.');
  insertSubject.run(1, '100109', 'Universal Human Values', 'Understanding harmony in human being, family, society, nature and existence; holistic approach to life and ethics.');
  insertSubject.run(1, '100110', 'Essence of Indian Constitution', 'Historical background, philosophy, fundamental rights, directive principles, parliamentary structure, and constitutional governance in India.');
  insertSubject.run(1, '100111', 'Basics of Electrical & Electronics Engineering', 'DC/AC network analysis, single-phase transformers, DC/AC machines, semiconductor diodes, rectifiers, transistors, and digital logic circuits.');

  // Sem 2
  insertSubject.run(2, 'BS201', 'Engineering Mathematics - II', 'Ordinary differential equations, Laplace transforms, and complex variable functions.');
  insertSubject.run(2, 'PH201', 'Engineering Physics', 'Wave optics, lasers, fiber optics, and semiconductor physics.');
  insertSubject.run(2, 'EC201', 'Basic Electronics', 'Semiconductor diodes, bipolar transistors, FETs, and operational amplifiers.');

  // Sem 3 (BEU CSE / Cyber Security • Session 2024–2028 onwards)
  insertSubject.run(3, '152301', 'Digital Electronics', 'Fundamentals of Digital Systems, Combinational & Sequential Circuits, Converters, Memories and PLDs (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(3, '152302', 'Data Structure and Algorithms', 'Arrays, Stacks, Queues, Linked Lists, Searching, Sorting, Hashing, Trees and Graphs (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(3, '152303', 'Object Oriented Programming using JAVA', 'OOP Concepts, Classes, Inheritance, Interfaces, Packages, Exception Handling, Multithreading, Collections & JDBC (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(3, '152304', 'Discrete Mathematics and Graph Theory', 'Sets, Relations, Functions, Mathematical Induction, Propositional Logic, Proof Techniques, Algebraic Structures, Graphs & Trees (Credits: 4 | ESE: 70, IA: 30)');
  insertSubject.run(3, '152305', 'Operating System', 'OS Structures, Processes, CPU Scheduling, IPC, Deadlocks, Memory Management, Virtual Memory, File & Disk Management (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(3, '152306', 'Universal Human Values', 'Value Education, Harmony in Human Being, Family, Society, Nature/Existence, Professional Ethics (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(3, '152307', 'Indian Knowledge System', 'Overview of IKS, Vedic domains, Technical systems (Arthashastra, Ganita, Rasayana, Ayurveda, Vastu, Shilpa, Nyaya) (Non-Credit | 3-0-0)');
  insertSubject.run(3, '152301P', 'Digital Electronics Lab', '11 Practical experiments covering Logic gates, Code converters, Adders, MUX/DMUX, Flip-Flops, Counters, DAC/ADC & Multisim (Credits: 1 | ESE: 30, IA: 20)');
  insertSubject.run(3, '152302P', 'Data Structure and Algorithms Lab', '15 Practical experiments covering Arrays, Binary Search, Stacks, Queues, Linked Lists, & Tree Traversals (Credits: 1 | ESE: 30, IA: 20)');
  insertSubject.run(3, '152303P', 'Object Oriented Programming using JAVA Lab', '10 Hands-on Java programs covering Syntax, OOP, Inheritance, Exceptions, Multithreading, Streams, Collections & JDBC (Credits: 1 | ESE: 30, IA: 20)');
  insertSubject.run(3, '152305P', 'Operating System Lab', '10 Hands-on programs covering Scheduling algorithms, Banker algorithm, Device driver, Disk scheduling, IPC & Page Replacement (Credits: 1 | ESE: 30, IA: 20)');
  insertSubject.run(3, '152308', 'Internship-I', '2 Weeks Internship in Industry/Institute in consultation with college; detailed training report and certificate submission (Credits: 2 | ESE: 30, IA: 20)');

  // Sem 4 (BEU Official Curriculum - Session 2024-28 onwards, Total 26 Credits)
  insertSubject.run(4, '105401', 'Computer Organization and Architecture', 'Functional blocks, Von Neumann architecture, CPU organization, addressing modes, arithmetic algorithms (Booth\'s, division), memory hierarchy, cache mapping, virtual memory, pipelining and I/O organization (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(4, '105402', 'Formal Language and Automata Theory', 'Finite automata (DFA, NFA), regular expressions and languages, context-free grammars (CFG), pushdown automata (PDA), Turing machines, undecidability and Chomsky hierarchy (Credits: 4 | ESE: 70, IA: 30)');
  insertSubject.run(4, '105403', 'Design and Analysis of Algorithms', 'Asymptotic analysis, divide & conquer, greedy paradigm, dynamic programming, backtracking, branch & bound, string matching, NP-completeness and approximation algorithms (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(4, '105404', 'Database Management System', 'DBMS architecture, ER modeling, relational algebra, SQL, normalization (1NF-BCNF), ACID transactions, concurrency control protocols, indexing (B/B+ Trees), storage & recovery (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(4, '105405', 'Effective Technical Communication', 'Technical document design, technical reports, grammar and editing, interpersonal skills, presentation delivery, professional ethics, corporate communication and job interviews (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(4, '105406', 'Computer Networks', 'OSI & TCP/IP models, physical transmission, data link protocols (ARQ, CSMA/CD, Ethernet), IPv4/IPv6 subnetting, routing protocols (OSPF, BGP), TCP/UDP transport, DNS, HTTP, SSL/TLS security (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(4, '105401P', 'Computer Organization and Architecture Lab', 'Practical experiments in logic simulation, arithmetic circuits, Booth\'s algorithm, 8086 assembly programming, and pipeline hazard detection (Credits: 1 | ESE: 30, IA: 20)');
  insertSubject.run(4, '105403P', 'Design and Analysis of Algorithms Lab', 'Hands-on implementation of sorting algorithms, divide & conquer, greedy strategies, dynamic programming, backtracking, and string matching (Credits: 1 | ESE: 30, IA: 20)');
  insertSubject.run(4, '105404P', 'Database Management System Lab', 'Hands-on practice in SQL DDL/DML, complex joins, nested queries, views, PL/SQL procedures, functions, triggers, and cursors (Credits: 1 | ESE: 30, IA: 20)');
  insertSubject.run(4, '105406P', 'Computer Networks Lab', 'Hands-on experiments with network tools, Wireshark packet capture, error detection CRC, Cisco Packet Tracer topology setup, routing, and socket programming (Credits: 1 | ESE: 30, IA: 20)');
  insertSubject.run(4, '105407', 'NPTEL-I (Open Course)', '12-Week approved NPTEL / SWAYAM MOOC certification course in emerging CSE / Interdisciplinary domains (Credits: 3 | ESE: 70, IA: 30)');

  // Sem 5 (BEU Official Curriculum - Total 27 Credits)
  insertSubject.run(5, '100508', 'Professional Skill Development', 'Soft skills, public speaking, group discussions, interpersonal dynamics, emotional intelligence, leadership, professional ethics, corporate communication, resume building & interview preparation (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(5, '105501', 'Artificial Intelligence', 'Foundations of AI, state space search (uninformed & heuristic A*), game playing (Minimax, Alpha-Beta), knowledge representation, first-order logic, probabilistic reasoning, machine learning & neural networks (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(5, '105502', 'Database Management Systems', 'DBMS architecture, ER/EER models, relational algebra, SQL, normalization (1NF-BCNF), ACID transactions, concurrency control protocols, indexing (B/B+ Trees), storage & recovery (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(5, '105503', 'Formal Language & Automata Theory', 'Finite automata (DFA, NFA), regular expressions and languages, context-free grammars (CFG), pushdown automata (PDA), Turing machines, undecidability and Chomsky hierarchy (Credits: 4 | ESE: 70, IA: 30)');
  insertSubject.run(5, '105504', 'Software Engineering', 'SDLC models (Waterfall, Spiral, Agile/Scrum), requirement analysis (SRS), architectural design, estimation (COCOMO), software testing strategies (Black-box, White-box), quality assurance & maintenance (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(5, '105505', 'Seminar', 'Literature review, contemporary technical topic presentation, technical slide deck design, public delivery, viva-voce and comprehensive report submission (Credits: 1 | ESE: 50, IA: 0)');
  insertSubject.run(5, '100510P', 'Summer Entrepreneurship - II', '6-Week industrial internship / entrepreneurship startup project between 4th and 5th sem, business model canvas, project execution, report submission and viva (Credits: 6 | ESE: 60, IA: 40)');
  insertSubject.run(5, '100511P', 'NPTEL Courses - 2', 'Approved 8-Week / 12-Week NPTEL / SWAYAM advanced certification course in CSE domains with assignment and proctored exam assessment (Credits: 2 | ESE: 30, IA: 20)');
  insertSubject.run(5, '105502P', 'Database Management Systems Lab', 'Hands-on practice in SQL DDL/DML, complex joins, nested queries, views, PL/SQL procedures, functions, triggers, and cursors (Credits: 2 | ESE: 30, IA: 20)');

  // Sem 6 (BEU Official Curriculum - Total 23 Credits)
  insertSubject.run(6, '100602', 'Computer Networks', 'OSI & TCP/IP models, physical transmission, data link protocols (ARQ, CSMA/CD, Ethernet), IPv4/IPv6 subnetting, routing protocols (OSPF, BGP), TCP/UDP transport, DNS, HTTP, SSL/TLS security (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(6, '105601', 'Compiler Design', 'Lexical analysis (LEX), syntax analysis (LL, LR, LALR, YACC), syntax-directed translation, type systems, intermediate code generation, code optimization & machine code generation (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(6, '105602', 'Machine Learning', 'Statistical learning, linear regression, logistic classification, decision trees, SVM, ensemble methods (Random Forest, XGBoost), clustering (K-Means), PCA & neural networks (Credits: 4 | ESE: 70, IA: 30)');
  insertSubject.run(6, '1056XX (PE-I)', 'Program Elective-I', 'Specialized CSE Elective Basket: Graph Theory / Digital Image Processing / Introduction to Java Programming / Signals and Systems (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(6, '1056XX (PE-II)', 'Program Elective-II', 'Specialized CSE Elective Basket: Cloud Computing / Information Theory & Coding / Advanced Algorithms / Computer Graphics (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(6, '105601P', 'Compiler Design Lab', 'Hands-on compiler construction with LEX/FLEX, YACC/BISON, LL/LR parsing tables, and intermediate code generation (Credits: 2 | ESE: 30, IA: 20)');
  insertSubject.run(6, '100602P', 'Computer Networks Lab', 'Hands-on network experiments with packet sniffers (Wireshark), socket programming in C/Python, and Cisco Packet Tracer network simulation (Credits: 2 | ESE: 30, IA: 20)');
  insertSubject.run(6, '105620P', 'Python Programming Lab', 'Hands-on Python programming covering core syntax, data structures, OOP, file handling, NumPy, Pandas, and Scikit-learn (Credits: 1 | ESE: 30, IA: 20)');
  insertSubject.run(6, '100604P', 'NPTEL Courses-2', 'Approved 8-Week / 12-Week NPTEL / SWAYAM advanced certification course in CSE domains with assignment and proctored exam assessment (Credits: 2 | ESE: 30, IA: 20)');

  // Sem 7 (BEU Official Curriculum - Total 27 Credits)
  insertSubject.run(7, '100708', 'Biology for Engineers', 'Cell biology, biomolecules, genetics, information transfer (DNA, RNA, proteins), enzymes, metabolism, bio-mechanics, biosensors & engineering applications (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(7, '100702', 'Open Elective- I', 'Interdisciplinary Elective: Human Resource Management / Industrial Engineering / Environmental Pollution & Control / Cyber Law (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(7, '100703', 'Open Elective- II', 'Interdisciplinary Elective: Internet of Things / Renewable Energy Systems / Operations Research / Engineering Economics (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(7, '105701', 'Program Elective- III', 'Specialized CSE Elective: Cryptography & Network Security / Natural Language Processing / Mobile Computing / Big Data Analytics (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(7, '100701', 'Induction Program', 'Mandatory Non-Credit Student Induction & Value Orientation: Universal human values, creative arts, physical activities, mentoring & ethics (Credits: 0 | Mandatory Non-Credit)');
  insertSubject.run(7, '105702P', 'Project- I', 'Capstone Major Project Phase-I: Problem formulation, literature survey, requirements analysis, architectural design, prototype implementation & synopsis viva (Credits: 6 | ESE: 60, IA: 40)');
  insertSubject.run(7, '100710P', 'Summer Entrepreneurship- III', '8-Week intensive industry internship / entrepreneurship incubation between 6th and 7th sem, practical development, report submission & viva (Credits: 8 | ESE: 60, IA: 40)');
  insertSubject.run(7, '105703P', 'Professional Elective Lab- II', 'Hands-on practical experiments supporting Program Elective-III track (Network Security / NLP / Big Data / IoT) (Credits: 1 | ESE: 30, IA: 20)');

  // Sem 8 (BEU Official Curriculum - Total 18 Credits)
  insertSubject.run(8, '100801', 'Open Elective- III', 'Interdisciplinary Elective: Total Quality Management / Project Management / Disaster Management / Blockchain & FinTech (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(8, '100802', 'Open Elective- IV', 'Interdisciplinary Elective: Intellectual Property Rights / Entrepreneurship Development / Value Engineering / Smart Cities (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(8, '105801', 'Program Elective- IV', 'Specialized CSE Elective: Deep Learning / Cloud Computing & DevOps / Cyber Forensics / Wireless Sensor Networks (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(8, '105802', 'Program Elective- V', 'Specialized CSE Elective: Quantum Computing / Reinforcement Learning / Computer Vision / High-Performance Computing (Credits: 3 | ESE: 70, IA: 30)');
  insertSubject.run(8, '105803P', 'Project- II', 'Capstone Major Project Phase-II: Full software/hardware system implementation, empirical testing, research publication draft, dissertation thesis & final viva-voce (Credits: 6 | ESE: 60, IA: 40)');

  // 4. Seed Units for key subjects
  const insertUnit = db.prepare(`
    INSERT INTO units (subject_id, unit_number, title, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  // Units for Sem 3 Subjects (152301 - 152307, Labs & Internship)
  const deSub = db.prepare("SELECT id FROM subjects WHERE code = '152301'").get();
  if (deSub) {
    insertUnit.run(deSub.id, 1, 'Unit 1: Fundamentals of Digital Systems & Logic Families', 'Digital signals, logic gates, Boolean algebra, number systems, binary arithmetic, IC characteristics, TTL, Schottky TTL, CMOS logic, Tri-state logic.');
    insertUnit.run(deSub.id, 2, 'Unit 2: Combinational Digital Circuits', 'Standard logic representations, K-map simplification, Don’t care conditions, Multiplexer, DeMultiplexer, Adders, Subtractors, BCD arithmetic, ALU, parity generators, Q-M method.');
    insertUnit.run(deSub.id, 3, 'Unit 3: Sequential Circuits & Systems', 'Bistable latches, clocked SR, J-K, T and D flip flops, shift registers, serial/parallel converters, ring & sequence counters, ripple & synchronous counters, counter ICs.');
    insertUnit.run(deSub.id, 4, 'Unit 4: A/D and D/A Converters', 'Weighted resistor & R-2R ladder D/A converters, sample and hold circuit, Flash/comparator ADC, successive approximation ADC, dual slope ADC, ADC/DAC specifications.');
    insertUnit.run(deSub.id, 5, 'Unit 5: Semiconductor Memories', 'Memory organization, RAM, ROM, Content Addressable Memory (CAM), CCD memory, memory chips, ROM as PLD.');
    insertUnit.run(deSub.id, 6, 'Unit 6: Programmable Logic Devices (PLDs)', 'PLA, PAL, CPLD, and Field Programmable Gate Array (FPGA) architecture. Text: R.P. Jain, M.M. Mano, A. Kumar.');
  }

  const dsaSub = db.prepare("SELECT id FROM subjects WHERE code = '152302'").get();
  if (dsaSub) {
    insertUnit.run(dsaSub.id, 1, 'Unit 1: Introduction, Algorithm Analysis & Asymptotic Notations', 'Elementary data organizations, operations (insertion, deletion, traversal), algorithm analysis, Big-O, Omega, Theta notations, time-space trade-off.');
    insertUnit.run(dsaSub.id, 2, 'Unit 2: Stacks & Queues', 'ADT Stack and operations, complexity analysis, expression conversion (infix, prefix, postfix) and evaluation. ADT Queue, simple, circular and priority queues.');
    insertUnit.run(dsaSub.id, 3, 'Unit 3: Linked Lists', 'Singly linked lists, traversal, searching, insertion, deletion; stack/queue using linked list, doubly linked lists, circular linked lists.');
    insertUnit.run(dsaSub.id, 4, 'Unit 4: Searching, Sorting & Hashing', 'Linear and binary search; Selection, Bubble, Insertion, Quick, Merge and Heap Sort; hashing, hash functions and collision resolution.');
    insertUnit.run(dsaSub.id, 5, 'Unit 5: Trees & Binary Search Trees', 'Binary trees, Threaded Binary Trees, Binary Search Trees (BST), AVL Trees, tree traversals, B-Tree and B+ Tree concepts.');
    insertUnit.run(dsaSub.id, 6, 'Unit 6: Graphs & Advanced Traversal', 'Graph representations (adjacency matrix/list), BFS, DFS traversal algorithms, and complexity analysis. Text: Mark Allen Weiss, R.G. Dromey, Ellis Horowitz.');
  }

  const javaSub = db.prepare("SELECT id FROM subjects WHERE code = '152303'").get();
  if (javaSub) {
    insertUnit.run(javaSub.id, 1, 'Unit 1: OOP Concepts & Java Programming Basics', 'Introduction to Java, history, buzzwords, procedural vs OOP paradigm, JDK, JRE, JVM, data types, variables, control structures, compilation and execution.');
    insertUnit.run(javaSub.id, 2, 'Unit 2: Objects, Classes & Constructors in Java', 'Objects, classes, new keyword, methods, array of objects, constructors, overloading, method binding, overriding, static members, access modifiers, this, garbage collection, String class.');
    insertUnit.run(javaSub.id, 3, 'Unit 3: Inheritance, Interfaces & Packages', 'Inheritance hierarchies, super keyword, final classes/methods, Object class, polymorphism, dynamic binding, abstract classes, interfaces, packages, CLASSPATH.');
    insertUnit.run(javaSub.id, 4, 'Unit 4: Exception Handling', 'Error vs exception, exception hierarchy, checked/unchecked exceptions, try, catch, throw, throws, finally, nested try, custom exception subclasses.');
    insertUnit.run(javaSub.id, 5, 'Unit 5: Introduction to Multithreading', 'Process vs thread, thread lifecycle, Thread class & Runnable interface, priorities, synchronization, inter-thread communication (wait, notify, notifyAll).');
    insertUnit.run(javaSub.id, 6, 'Unit 6: Files, Collections Framework & Connecting to Database', 'Byte/character streams, file management, Collections Framework (ArrayList, LinkedList, HashSet, TreeSet, Map), JDBC database connectivity and SQL execution. Text: Herbert Schildt, E. Balagurusamy.');
  }

  const dmSub = db.prepare("SELECT id FROM subjects WHERE code = '152304'").get();
  if (dmSub) {
    insertUnit.run(dmSub.id, 1, 'Unit 1: Sets, Relation and Function', 'Operations and laws of sets, Cartesian products, binary relations, partial ordering, equivalence relations, functions, countable/uncountable sets, Cantor\'s diagonal, Power Set theorem.');
    insertUnit.run(dmSub.id, 2, 'Unit 2: Principles of Mathematical Induction & Counting Techniques', 'Well-Ordering Principle, recursive definitions, division algorithm, prime numbers, GCD, Euclidean algorithm, inclusion-exclusion, pigeonhole principle, permutations & combinations.');
    insertUnit.run(dmSub.id, 3, 'Unit 3: Propositional Logic & Inference Rules', 'Syntax, semantics, truth tables, logical equivalence, laws of logic, logical implications, rules of inference, universal & existential quantifiers.');
    insertUnit.run(dmSub.id, 4, 'Unit 4: Proof Techniques & Strategies', 'Terminology, proof methods and strategies: forward proof, proof by contradiction, proof by contraposition, necessity and sufficiency.');
    insertUnit.run(dmSub.id, 5, 'Unit 5: Algebraic Structures and Morphism', 'Semigroups, monoids, groups, quotient structures, permutation groups, normal subgroups, rings, integral domains, fields, Boolean algebra, DNF and CNF.');
    insertUnit.run(dmSub.id, 6, 'Unit 6: Graphs and Trees', 'Graph properties, connectivity, Eulerian and Hamiltonian walks, graph coloring, planar graphs, rooted trees, prefix codes, bi-connected components, shortest distance. Text: Kenneth H. Rosen, Susanna Epp.');
  }

  const osSub3 = db.prepare("SELECT id FROM subjects WHERE code = '152305'").get();
  if (osSub3) {
    insertUnit.run(osSub3.id, 1, 'Unit 1: Introduction to Operating Systems & Architecture', 'OS concepts, generations, types, OS services, system calls, OS structure (layered, monolithic, microkernel), virtual machines, UNIX & Windows case studies.');
    insertUnit.run(osSub3.id, 2, 'Unit 2: Processes, Threads & CPU Scheduling', 'Process states, PCB, context switching, threads, multithreading, CPU scheduling criteria, algorithms (FCFS, SJF, RR), multiprocessor real-time scheduling (RM, EDF).');
    insertUnit.run(osSub3.id, 3, 'Unit 3: Inter-Process Communication & Synchronization', 'Critical section, race conditions, mutual exclusion, Peterson\'s solution, Producer-Consumer, semaphores, monitors, message passing, Readers-Writers, Dining Philosophers.');
    insertUnit.run(osSub3.id, 4, 'Unit 4: Deadlocks & Banker\'s Algorithm', 'Necessary and sufficient deadlock conditions, deadlock prevention, avoidance with Banker\'s algorithm, detection and recovery.');
    insertUnit.run(osSub3.id, 5, 'Unit 5: Memory Management & Virtual Memory', 'Contiguous memory allocation, paging and segmentation, protection and sharing, virtual memory, demand paging, page replacement (Optimal, FIFO, LRU).');
    insertUnit.run(osSub3.id, 6, 'Unit 6: File Management, Disk Management & I/O Systems', 'File access methods, directories, file system structure, disk scheduling (FCFS, SSTF, SCAN, C-SCAN), I/O hardware, interrupt handlers, device drivers. Text: Silberschatz, Stallings, Tanenbaum.');
  }

  const uhvSub = db.prepare("SELECT id FROM subjects WHERE code = '152306'").get();
  if (uhvSub) {
    insertUnit.run(uhvSub.id, 1, 'Unit 1: Introduction to Value Education', 'Right understanding, relationship and physical facility, value education sharing, self-exploration process, continuous happiness and prosperity, fulfilling human aspirations.');
    insertUnit.run(uhvSub.id, 2, 'Unit 2: Harmony in the Human Being', 'Human being as co-existence of Self (\'I\') and Body, distinguishing needs of Self and Body, Body as instrument of Self, harmony in Self, self-regulation (Sanyam) and Health (Swasthya).');
    insertUnit.run(uhvSub.id, 3, 'Unit 3: Harmony in the Family & Society', 'Harmony in family, Trust (Vishwas) as foundational value, Respect (Samman), other feelings, justice in relationships, harmony in society, vision for Universal Human Order.');
    insertUnit.run(uhvSub.id, 4, 'Unit 4: Harmony in Nature / Existence', 'Harmony in nature, interconnectedness, mutual fulfilment among four orders of nature, existence as co-existence (Sah-astitva), holistic perception.');
    insertUnit.run(uhvSub.id, 5, 'Unit 5: Implications of Holistic Understanding & Professional Ethics', 'Natural acceptance of human values, definitiveness of ethical conduct, humanistic education, humanistic constitution, competence in professional ethics.');
    insertUnit.run(uhvSub.id, 6, 'Unit 6: Strategies for Transition Towards Value-Based Life & Profession', 'Competence in professional ethics, holistic technologies, production systems and management models, case studies. Text: R.R. Gaur, R. Asthana, G.P. Bagaria.');
  }

  const iksSub = db.prepare("SELECT id FROM subjects WHERE code = '152307'").get();
  if (iksSub) {
    insertUnit.run(iksSub.id, 1, 'Unit 1: Introduction to Indian Knowledge Systems', 'Overview of IKS, organization of IKS, conception and constitution of knowledge in Indian tradition, oral tradition, models and strategies.');
    insertUnit.run(iksSub.id, 2, 'Unit 2: Overview of IKS Domains & Vedic Foundations', 'The Vedas as the basis of IKS, overview of all six Vedangas (Siksha, Kalpa, Vyakarana, Nirukta, Chhanda, Jyotisha).');
    insertUnit.run(iksSub.id, 3, 'Unit 3: Relevance in Technical Education I: Economics, Maths & Chemistry', 'Arthashastra (economics and political systems), Ganita and Jyamiti (Indian mathematics, astronomy and geometry), Rasayana (chemical sciences and metallurgy).');
    insertUnit.run(iksSub.id, 4, 'Unit 4: Relevance in Technical Education II: Health, Astronomy & Ecology', 'Ayurveda (biological sciences, diet & nutrition), Jyotish Vidya (astronomy and calendar systems), Prakriti Vidya (terrestrial/material sciences, ecology, atmospheric sciences).');
    insertUnit.run(iksSub.id, 5, 'Unit 5: Relevance in Technical Education III: Architecture, Law & Ethics', 'Vastu Vidya (aesthetics, iconography, architecture), Nyaya Shastra (social ethics, logic and law).');
    insertUnit.run(iksSub.id, 6, 'Unit 6: Arts, Yoga, Agriculture & Preservation', 'Shilpa and Natya Shastra (performing and fine arts), Sankhya and Yoga Darshana (psychology, consciousness), Vrikshayurveda (plant science, agriculture). Text: K.B. Archak, B. Mahadevan.');
  }

  // Units for Sem 4 Subjects (105401 - 105407 & Labs)
  const coaSub = db.prepare("SELECT id FROM subjects WHERE code = '105401'").get();
  if (coaSub) {
    insertUnit.run(coaSub.id, 1, 'Unit 1: Functional Blocks of a Computer & Data Representation', 'Von Neumann vs Harvard architecture, functional units, bus structures, register transfer language, bus and memory transfers, arithmetic logic shift unit (ALSU), data representation: fixed-point, signed numbers, IEEE 754 floating-point standard, instruction codes, computer registers, instruction cycle, timing and control.');
    insertUnit.run(coaSub.id, 2, 'Unit 2: Central Processing Unit & Control Unit Design', 'General register organization, stack organization, instruction formats (three-address, two-address, one-address, zero-address), addressing modes, RISC vs CISC architectures. Control unit organization: Hardwired control vs Microprogrammed control unit design, control memory, address sequencing, microinstruction format, microprogram sequencer.');
    insertUnit.run(coaSub.id, 3, 'Unit 3: Computer Arithmetic & ALU Design', 'Addition and subtraction with signed-magnitude data, Booth\'s multiplication algorithm for signed-2\'s complement numbers, array multiplier, division algorithms: restoring and non-restoring division, floating-point arithmetic operations, decimal arithmetic operations, BCD adder.');
    insertUnit.run(coaSub.id, 4, 'Unit 4: Memory System Design & Hierarchy', 'Memory hierarchy, main memory (SRAM and DRAM chips), ROM, auxiliary memory (magnetic disks, SSD), associative memory, cache memory: cache organization, mapping functions (direct, associative, set-associative), cache replacement policies (LRU, FIFO), write policies (write-through, write-back), cache coherence, virtual memory: address translation, paging, TLB, segmentation.');
    insertUnit.run(coaSub.id, 5, 'Unit 5: Input-Output Organization & Pipelining', 'Peripheral devices, I/O interface, asynchronous data transfer (strobe control, handshaking), modes of transfer: programmed I/O, interrupt-initiated I/O, Direct Memory Access (DMA) controller and transfer cycle. Priority interrupt and daisy chaining. Pipelining: arithmetic and instruction pipeline, pipeline hazards (data, structural, control), branch prediction, vector processing, superscalar processors. Textbooks: M. Morris Mano, William Stallings, Carl Hamacher, Hennessy & Patterson.');
  }

  const flatSub = db.prepare("SELECT id FROM subjects WHERE code = '105402'").get();
  if (flatSub) {
    insertUnit.run(flatSub.id, 1, 'Unit 1: Fundamentals of Automata & Finite State Machines', 'Alphabet, languages, strings, operations on languages. Deterministic Finite Automata (DFA), Non-deterministic Finite Automata (NFA), NFA with epsilon transitions, equivalence of NFA and DFA, minimization of DFA using Myhill-Nerode theorem and table filling method. Moore and Mealy machines, state equivalence and machine conversion.');
    insertUnit.run(flatSub.id, 2, 'Unit 2: Regular Expressions, Languages & Properties', 'Regular expressions, operators, algebraic laws. Conversion of regular expressions to finite automata (Thomson\'s construction) and FA to regular expressions (Arden\'s theorem, state elimination). Pumping Lemma for regular languages and applications to non-regularity. Closure properties (union, intersection, complement, concatenation, star) and decision properties of regular languages.');
    insertUnit.run(flatSub.id, 3, 'Unit 3: Context-Free Grammars (CFG) & Languages (CFL)', 'Context-free grammars, derivations (leftmost, rightmost), parse trees, ambiguity in grammars, inherent ambiguity. Simplification of CFGs: elimination of useless symbols, null productions, and unit productions. Normal forms: Chomsky Normal Form (CNF) and Greibach Normal Form (GNF). Pumping Lemma for context-free languages, closure properties of CFLs.');
    insertUnit.run(flatSub.id, 4, 'Unit 4: Pushdown Automata (PDA)', 'Definition and model of PDA, instantaneous descriptions (ID), acceptance by empty stack and acceptance by final state, equivalence of acceptance mechanisms. Equivalence of PDA and Context-Free Grammars (conversion of CFG to PDA and PDA to CFG). Deterministic Pushdown Automata (DPDA) and deterministic CFLs, two-stack PDA.');
    insertUnit.run(flatSub.id, 5, 'Unit 5: Turing Machines & Computability', 'Turing Machine (TM) model, definition, instantaneous descriptions, design of Turing machines, techniques for TM construction: storage in state, multiple tracks, multi-tape TM, nondeterministic TM, equivalence of TM variants. Church-Turing thesis, Universal Turing Machine.');
    insertUnit.run(flatSub.id, 6, 'Unit 6: Undecidability & Chomsky Hierarchy', 'Decidable and undecidable problems, recursive and recursively enumerable languages, Halting problem of Turing Machine, Post\'s Correspondence Problem (PCP), Rice\'s theorem, reducibility. Chomsky hierarchy of languages: Type-0 (Unrestricted), Type-1 (Context-Sensitive), Type-2 (Context-Free), Type-3 (Regular). Textbooks: Hopcroft, Motwani & Ullman; Michael Sipser; Peter Linz; Mishra & Chandrasekaran.');
  }

  const daaSub4 = db.prepare("SELECT id FROM subjects WHERE code = '105403'").get();
  if (daaSub4) {
    insertUnit.run(daaSub4.id, 1, 'Unit 1: Introduction, Complexity Analysis & Recurrences', 'Algorithm definition, specifications, space and time complexity, asymptotic notations: Big-O, Omega, Theta, Little-o, Little-omega. Recurrence relations and solutions: substitution method, recursion-tree method, Master theorem and Master theorem extensions. Amortized analysis: aggregate method, accounting method, potential method.');
    insertUnit.run(daaSub4.id, 2, 'Unit 2: Divide-and-Conquer & Sorting Lower Bounds', 'Divide-and-conquer strategy, Binary Search, Merge Sort, Quick Sort (randomized quicksort, worst-case and average-case analysis), Strassen\'s matrix multiplication, Selection in linear time (Quickselect, Median-of-Medians). Comparison sort lower bounds (decision tree model), non-comparison linear sorts: Counting Sort, Radix Sort, Bucket Sort.');
    insertUnit.run(daaSub4.id, 3, 'Unit 3: Greedy Algorithms & Dynamic Programming', 'Greedy strategy: Fractional Knapsack, Huffman coding, Activity selection problem, Minimum Spanning Trees (Kruskal\'s and Prim\'s algorithms), Single-source shortest path (Dijkstra\'s algorithm). Dynamic Programming: Principle of Optimality, Matrix Chain Multiplication, Longest Common Subsequence (LCS), 0/1 Knapsack, All-pairs shortest paths (Floyd-Warshall), Bellman-Ford algorithm, Travelling Salesperson Problem (TSP).');
    insertUnit.run(daaSub4.id, 4, 'Unit 4: Backtracking & Branch and Bound', 'Backtracking approach: state space tree search, N-Queens problem, Sum-of-subsets problem, Graph Coloring (m-colorability), Hamiltonian cycles. Branch-and-Bound approach: FIFO and LC branch-and-bound, 0/1 Knapsack problem using branch-and-bound, Travelling Salesperson Problem (TSP) using branch-and-bound.');
    insertUnit.run(daaSub4.id, 5, 'Unit 5: String Matching & Advanced Graph Algorithms', 'String matching: Naive string matching, Rabin-Karp algorithm, Knuth-Morris-Pratt (KMP) algorithm, Boyer-Moore algorithm. Graph algorithms: Biconnected components, Strongly Connected Components (Kosaraju\'s and Tarjan\'s algorithms), Topological sorting, Maximum Network Flow (Ford-Fulkerson algorithm, Max-Flow Min-Cut theorem).');
    insertUnit.run(daaSub4.id, 6, 'Unit 6: Tractability & NP-Completeness', 'Tractable and intractable problems, polynomial-time verification, complexity classes P, NP, NP-Hard, and NP-Complete. Polynomial-time reductions, Cook\'s theorem, NP-completeness proofs for SAT, 3-SAT, Clique, Vertex Cover, Set Cover, Hamiltonian Cycle, and TSP. Introduction to approximation algorithms: Vertex Cover, Metric TSP. Textbooks: Cormen, Leiserson, Rivest, Stein (CLRS); Horowitz & Sahni; Kleinberg & Tardos.');
  }

  const dbmsSub4 = db.prepare("SELECT id FROM subjects WHERE code = '105404'").get();
  if (dbmsSub4) {
    insertUnit.run(dbmsSub4.id, 1, 'Unit 1: Introduction to DBMS & System Architecture', 'Database system concepts, file systems vs DBMS, characteristics and advantages of database approach, data models, schemas and instances. Three-schema architecture and data independence (logical and physical). DBMS component modules, database users, database administrator (DBA) roles, database languages: DDL, DML, DCL, TCL.');
    insertUnit.run(dbmsSub4.id, 2, 'Unit 2: Data Modeling: ER & Relational Data Model', 'Entity-Relationship (ER) model: entities, attributes, relationships, key constraints, cardinality ratios, participation constraints, weak entities, ER diagrams. Enhanced ER (EER): specialization, generalization, aggregation. Relational model: relational concepts, integrity constraints (Entity, Referential, Key, Domain), mapping ER and EER schemas to relational tables.');
    insertUnit.run(dbmsSub4.id, 3, 'Unit 3: Relational Algebra & Structured Query Language (SQL)', 'Relational algebra: selection, projection, union, set difference, Cartesian product, joins (natural, equi, theta, outer join), division. Relational calculus: TRC and DRC. SQL: schema definition, table creation, constraints, basic queries, complex nested queries, aggregate functions, GROUP BY, HAVING, set operations, joins, views, assertions, triggers, and transactions.');
    insertUnit.run(dbmsSub4.id, 4, 'Unit 4: Relational Database Design & Normalization', 'Informal design guidelines, data redundancy, anomalies (insertion, deletion, update). Functional dependencies, inference rules (Armstrong\'s axioms), attribute closure, minimal cover. Normalization: 1NF, 2NF, 3NF, Boyce-Codd Normal Form (BCNF), multi-valued dependencies and 4NF, join dependencies and 5NF. Lossless join decomposition and dependency preservation.');
    insertUnit.run(dbmsSub4.id, 5, 'Unit 5: Transaction Processing & Concurrency Control', 'Transaction concepts, ACID properties, transaction states, schedules: serial, non-serial, serializable schedules (conflict and view serializability), testing for serializability, recoverability. Concurrency control: Lock-based protocols (shared, exclusive locks), Two-Phase Locking (2PL), Strict 2PL, Timestamp ordering protocol, Validation-based protocols. Deadlock handling: prevention, detection, wait-for graphs, recovery.');
    insertUnit.run(dbmsSub4.id, 6, 'Unit 6: Storage, Indexing & Database Recovery', 'Storage hierarchy, file organization (heap, sorted, hashed), RAID levels. Indexing: primary, clustering, secondary indices, dense vs sparse indices, multi-level indices, B-Trees and B+ Trees indexing, static and dynamic hashing. Recovery: failure classification, storage structures, log-based recovery (deferred/immediate update), checkpoints, shadow paging, ARIES algorithm. Overview of NoSQL databases. Textbooks: Silberschatz, Korth, Sudarshan; Elmasri & Navathe; Ramakrishnan & Gehrke.');
  }

  const etcSub4 = db.prepare("SELECT id FROM subjects WHERE code = '105405'").get();
  if (etcSub4) {
    insertUnit.run(etcSub4.id, 1, 'Unit 1: Information Design and Development', 'Different kinds of technical documents, information development life cycle, organizational structures of technical documents, factors affecting information and document design, strategies for technical organization, information design checklist, characteristics of effective technical communication, audience analysis.');
    insertUnit.run(etcSub4.id, 2, 'Unit 2: Technical Writing, Grammar and Editing', 'Technical writing process, forms of discourse, writing abstracts, summaries, executive summaries, technical proposals, research papers, project reports, instruction manuals and lab reports. Technical grammar: active vs passive voice, conciseness, precision, sentence variety, avoiding ambiguity and jargon. Editing, proofreading, and style manuals.');
    insertUnit.run(etcSub4.id, 3, 'Unit 3: Self-Development and Interpersonal Skills', 'Emotional intelligence, empathy, interpersonal communication, teamwork and collaborative problem solving, leadership dynamics, assertiveness, conflict resolution, negotiation skills, time management, stress management in professional engineering environments.');
    insertUnit.run(etcSub4.id, 4, 'Unit 4: Communication and Technical Presentation', 'Public speaking, audience analysis, structuring technical presentations, visual aids and slide design (PPT/multimedia), delivery techniques, body language, eye contact, voice modulation, managing Q&A sessions, overcoming stage fright. Group discussions (GD) dynamics, roles, and assessment.');
    insertUnit.run(etcSub4.id, 5, 'Unit 5: Ethics, Business Communication & Cross-Cultural Aspects', 'Business correspondence: professional emails, memos, letters, circulars, meeting notices, agenda, minutes of meetings (MoM). Job application documents: Resume vs Curriculum Vitae (CV), cover letter, interview skills (technical and HR). Ethical issues in technical communication, intellectual property rights, plagiarism, confidentiality, cross-cultural communication in global engineering environments. Textbooks: David F. Beer & David McMurrey; Meenakshi Raman & Sangeeta Sharma; Andrea J. Rutherfoord.');
  }

  const cnSub4 = db.prepare("SELECT id FROM subjects WHERE code = '105406'").get();
  if (cnSub4) {
    insertUnit.run(cnSub4.id, 1, 'Unit 1: Introduction to Computer Networks & Physical Layer', 'Data communication components, network topologies, network types (LAN, MAN, WAN), switching techniques: packet switching, circuit switching, message switching. Layered architecture: OSI 7-layer model, TCP/IP 4-layer model, comparison. Transmission media (twisted pair, coaxial, optical fiber, wireless), Shannon channel capacity, Nyquist bit rate, modulation and multiplexing (FDM, TDM, WDM).');
    insertUnit.run(cnSub4.id, 2, 'Unit 2: Data Link Layer & Medium Access Control (MAC)', 'Data link layer design issues, framing methods, error detection and correction (parity, checksum, CRC, Hamming codes). Flow and error control protocols: Stop-and-Wait, Go-Back-N ARQ, Selective Repeat ARQ, piggybacking, HDLC, PPP. Multiple Access protocols: ALOHA (pure and slotted), CSMA, CSMA/CD (Ethernet IEEE 802.3), CSMA/CA (Wi-Fi IEEE 802.11). MAC addressing, bridges, switches, collision and broadcast domains.');
    insertUnit.run(cnSub4.id, 3, 'Unit 3: Network Layer & IP Addressing', 'Network layer services, virtual circuits and datagram subnets. Routing algorithms: Shortest Path (Dijkstra), Distance Vector Routing (Bellman-Ford, count-to-infinity problem), Link State Routing (OSPF), hierarchical routing, BGP. Congestion control algorithms (leaky bucket, token bucket). IPv4 addressing, classful vs CIDR classless addressing, subnetting, supernetting, IPv4 header format, NAT, ARP, RARP, ICMP, DHCP. Introduction to IPv6 and migration.');
    insertUnit.run(cnSub4.id, 4, 'Unit 4: Transport Layer Protocols', 'Transport layer services, port numbers and socket addressing, multiplexing and demultiplexing. Connectionless transport: UDP protocol, UDP header, applications. Connection-oriented transport: TCP protocol, TCP segment structure, 3-way handshake connection establishment and graceful termination, flow control (sliding window), error control. TCP congestion control: slow start, congestion avoidance, fast retransmit, fast recovery (AIMD).');
    insertUnit.run(cnSub4.id, 5, 'Unit 5: Application Layer Protocols & Network Security Basics', 'Principles of network applications, client-server and P2P architectures. Domain Name System (DNS), Email architecture and protocols (SMTP, POP3, IMAP), World Wide Web (HTTP/1.1, HTTP/2, HTTPS), File Transfer Protocol (FTP), SSH, Telnet. Network security fundamentals: symmetric and asymmetric cryptography, digital signatures, SSL/TLS handshake, firewalls, IPsec basics. Textbooks: Tanenbaum & Wetherall; Kurose & Ross; Forouzan; Stallings.');
  }

  const coaLabSub = db.prepare("SELECT id FROM subjects WHERE code = '105401P'").get();
  if (coaLabSub) {
    insertUnit.run(coaLabSub.id, 1, 'Practical Experiments: COA Simulation & Assembly Programming', 'List of practical experiments: 1. Logic gates simulation. 2. 4-bit Ripple Carry Adder/Subtractor. 3. 4-bit ALU simulation. 4. Booth\'s Multiplication Algorithm. 5. Restoring & Non-restoring division. 6. Cache mapping simulator. 7. Microprogrammed Control Unit simulation. 8. 8086 Assembly Language Programming: Data movement and arithmetic. 9. 8086 Array search & sorting. 10. 4-stage pipeline hazard simulation.');
  }

  const daaLabSub = db.prepare("SELECT id FROM subjects WHERE code = '105403P'").get();
  if (daaLabSub) {
    insertUnit.run(daaLabSub.id, 1, 'Practical Experiments: Algorithm Implementation & Time Complexity Analysis', 'List of practical experiments (C/C++/Python): 1. Merge Sort vs Quick Sort execution time analysis. 2. Strassen\'s Matrix Multiplication. 3. Fractional Knapsack (Greedy). 4. Prim\'s & Kruskal\'s MST. 5. Dijkstra\'s Shortest Path. 6. 0/1 Knapsack (Dynamic Programming). 7. Longest Common Subsequence (LCS). 8. Floyd-Warshall All-Pairs Shortest Path. 9. N-Queens (Backtracking). 10. KMP & Rabin-Karp String Matching.');
  }

  const dbmsLabSub = db.prepare("SELECT id FROM subjects WHERE code = '105404P'").get();
  if (dbmsLabSub) {
    insertUnit.run(dbmsLabSub.id, 1, 'Practical Experiments: SQL, PL/SQL & Relational Database Design', 'List of practical experiments (PostgreSQL/MySQL/Oracle): 1. DDL commands with constraints. 2. DML queries with clauses. 3. Nested & Correlated subqueries. 4. JOIN operations (INNER, OUTER, SELF). 5. Views and Indexes. 6. PL/SQL conditional blocks. 7. PL/SQL Procedures & Functions. 8. Database Triggers (BEFORE/AFTER). 9. Implicit/Explicit Cursors. 10. Mini-Project: ER modeling, normalization & implementation.');
  }

  const cnLabSub = db.prepare("SELECT id FROM subjects WHERE code = '105406P'").get();
  if (cnLabSub) {
    insertUnit.run(cnLabSub.id, 1, 'Practical Experiments: Packet Sniffing, Network Simulation & Socket Programming', 'List of practical experiments: 1. Network hardware & commands (ping, traceroute, netstat, arp). 2. Wireshark packet capture (ARP, ICMP, DNS, TCP, HTTP). 3. CRC error detection algorithm. 4. Stop-and-Wait & Sliding Window protocol simulation. 5. Cisco Packet Tracer LAN setup & IP configuration. 6. DHCP, DNS, HTTP server configuration. 7. RIP & OSPF routing configuration. 8. TCP Socket programming (Echo server). 9. UDP chat application. 10. Leaky Bucket congestion simulation.');
  }

  const nptelSub = db.prepare("SELECT id FROM subjects WHERE code = '105407'").get();
  if (nptelSub) {
    insertUnit.run(nptelSub.id, 1, 'Course Framework, Registration & Evaluation Guidelines', 'BEU & AICTE credit transfer guidelines. Selection of approved 12-week NPTEL courses (e.g. Cloud Computing, Blockchain, Deep Learning, IoT, Soft Skills). Submission of weekly assignments (IA: 30 marks) and final NPTEL proctored examination / End Semester Examination (70 marks).');
  }

  // Units for Sem 5 Subjects (100508, 105501 - 105505, Labs, Seminar & Entrepreneurship)
  const psdSub = db.prepare("SELECT id FROM subjects WHERE code = '100508'").get();
  if (psdSub) {
    insertUnit.run(psdSub.id, 1, 'Unit 1: Communication & Presentation Skills', 'Fundamentals of effective communication, barriers to communication, public speaking techniques, structuring technical and executive presentations, body language, non-verbal cues, audience analysis, voice modulation, visual aids and multimedia presentation design.');
    insertUnit.run(psdSub.id, 2, 'Unit 2: Interpersonal Dynamics & Leadership Skills', 'Emotional intelligence (EQ) and self-awareness, empathy in professional relationships, group dynamics and team collaboration, leadership styles and attributes, assertiveness vs aggressiveness, negotiation strategies, and conflict management.');
    insertUnit.run(psdSub.id, 3, 'Unit 3: Time Management & Stress Resilience', 'Time management principles, Eisenhower matrix, Pareto principle (80/20 rule), prioritization and goal setting (SMART goals), dealing with procrastination, stress identification and resilience, work-life balance, mindfulness and cognitive coping mechanisms.');
    insertUnit.run(psdSub.id, 4, 'Unit 4: Professional Ethics & Corporate Etiquette', 'Workplace ethics and integrity, accountability, diversity and inclusion, corporate culture and professional etiquette, business dress code, professional email writing, telephonic and virtual meeting etiquette, cross-cultural communication.');
    insertUnit.run(psdSub.id, 5, 'Unit 5: Employability Skills & Career Preparation', 'Curriculum Vitae (CV) vs Resume writing, tailoring resumes for applicant tracking systems (ATS), writing cover letters, Group Discussion (GD) strategies and evaluation parameters, personal interview preparation: technical, behavioral, and HR questions (STAR method), mock interview analysis. Textbooks: Meenakshi Raman & Sangeeta Sharma; Stephen R. Covey; Dale Carnegie.');
  }

  const aiSub5 = db.prepare("SELECT id FROM subjects WHERE code = '105501'").get();
  if (aiSub5) {
    insertUnit.run(aiSub5.id, 1, 'Unit 1: Introduction to AI & Intelligent Agents', 'Definitions of AI, Turing Test, cognitive modeling, foundations and history of AI. Intelligent Agents: PEAS framework (Performance measure, Environment, Actuators, Sensors), environment types, agent architectures: simple reflex, model-based, goal-based, utility-based, and learning agents.');
    insertUnit.run(aiSub5.id, 2, 'Unit 2: Problem Solving & Search Strategies', 'Problem formulation, state space representations. Uninformed search algorithms: Breadth-First Search (BFS), Depth-First Search (DFS), Uniform Cost Search (UCS), Depth-Limited Search (DLS), Iterative Deepening Search (IDDFS). Informed (heuristic) search: Greedy Best-First Search, A* search, admissibility and consistency of heuristics, memory-bounded heuristic search, local search algorithms: Hill Climbing, Simulated Annealing, Genetic Algorithms.');
    insertUnit.run(aiSub5.id, 3, 'Unit 3: Adversarial Search & Game Playing', 'Game theory formulation, two-player zero-sum games, Minimax algorithm, evaluation functions, Alpha-Beta pruning, move ordering, games with chance (expectiminimax), partially observable games, case studies in game playing (Chess, Checkers).');
    insertUnit.run(aiSub5.id, 4, 'Unit 4: Knowledge Representation & Logic', 'Knowledge-based agents, propositional logic, syntax, semantics, truth tables, inference, resolution. First-Order Logic (FOL): syntax, semantics, quantifiers, unification, forward and backward chaining, resolution refutation in FOL. Ontological engineering, semantic networks, frames, conceptual dependency.');
    insertUnit.run(aiSub5.id, 5, 'Unit 5: Uncertain Knowledge & Probabilistic Reasoning', 'Handling uncertain knowledge, probability theory fundamentals, axioms of probability, Bayes\' Rule and conditional independence. Bayesian Networks: representation, syntax, semantics, exact inference by enumeration, variable elimination, approximate inference (Monte Carlo sampling), Markov Decision Processes (MDP).');
    insertUnit.run(aiSub5.id, 6, 'Unit 6: Machine Learning & Modern AI', 'Forms of learning: supervised, unsupervised, reinforcement learning. Decision tree induction, K-Means clustering, Nearest Neighbor learning. Perceptron, Multi-Layer Perceptron (MLP), backpropagation, deep learning overview, applications of AI in computer vision and natural language processing. Textbooks: Stuart Russell & Peter Norvig (AIMA); Elaine Rich, Kevin Knight & S.B. Nair; Nils J. Nilsson.');
  }

  const dbmsSub5 = db.prepare("SELECT id FROM subjects WHERE code = '105502'").get();
  if (dbmsSub5) {
    insertUnit.run(dbmsSub5.id, 1, 'Unit 1: Introduction to DBMS & System Architecture', 'Database system concepts, file systems vs DBMS, advantages of DBMS, data independence (logical and physical), Three-schema architecture (external, conceptual, internal), DBMS component modules, database users and DBA roles, database languages: DDL, DML, DCL, TCL.');
    insertUnit.run(dbmsSub5.id, 2, 'Unit 2: Data Modeling: ER & Relational Data Model', 'Entity-Relationship (ER) model: entities, attributes, relationships, key constraints, cardinality ratios, weak entities, ER diagrams. Enhanced ER (EER): specialization, generalization, aggregation. Relational data model concepts, relational integrity constraints (Entity, Referential, Key, Domain), mapping ER/EER schemas to relational tables.');
    insertUnit.run(dbmsSub5.id, 3, 'Unit 3: Relational Algebra & Structured Query Language (SQL)', 'Relational algebra operations: selection, projection, Cartesian product, union, intersection, set difference, joins (natural, equi, theta, outer), division. Relational calculus: TRC and DRC. SQL: schema definition, table creation, integrity constraints, basic queries, nested subqueries, aggregate functions, GROUP BY, HAVING, set operations, joins, views, assertions, triggers, transactions.');
    insertUnit.run(dbmsSub5.id, 4, 'Unit 4: Relational Database Design & Normalization', 'Informal design guidelines, anomalies (insertion, deletion, update). Functional dependencies, Armstrong\'s axioms, attribute closure, minimal cover. Normal forms: 1NF, 2NF, 3NF, Boyce-Codd Normal Form (BCNF), multi-valued dependencies and 4NF, join dependencies and 5NF. Lossless join decomposition and dependency preservation.');
    insertUnit.run(dbmsSub5.id, 5, 'Unit 5: Transaction Processing & Concurrency Control', 'Transaction concepts, ACID properties, transaction states, schedules: serial, non-serial, serializability (conflict and view serializability), testing for serializability, recoverability. Concurrency control protocols: Lock-based protocols (shared/exclusive, 2PL, Strict 2PL), Timestamp ordering protocol, Validation-based protocols. Deadlock handling: prevention, detection, wait-for graphs, recovery.');
    insertUnit.run(dbmsSub5.id, 6, 'Unit 6: Storage, Indexing & Database Recovery', 'Storage hierarchy, file organization (heap, sorted, hashed), RAID technology. Indexing: primary, clustering, secondary indices, dense vs sparse indices, multi-level indices, B-Trees and B+ Trees indexing, static and dynamic hashing. Database recovery: failure classification, log-based recovery (deferred/immediate update), checkpoints, shadow paging, ARIES algorithm. Overview of NoSQL databases. Textbooks: Silberschatz, Korth, Sudarshan; Elmasri & Navathe; Ramakrishnan & Gehrke.');
  }

  const flatSub5 = db.prepare("SELECT id FROM subjects WHERE code = '105503'").get();
  if (flatSub5) {
    insertUnit.run(flatSub5.id, 1, 'Unit 1: Fundamentals of Automata & Finite State Machines', 'Alphabet, languages, strings, operations on languages. Deterministic Finite Automata (DFA), Non-deterministic Finite Automata (NFA), NFA with epsilon transitions, equivalence of NFA and DFA, minimization of DFA using Myhill-Nerode theorem and table filling method. Moore and Mealy machines, state equivalence and machine conversion.');
    insertUnit.run(flatSub5.id, 2, 'Unit 2: Regular Expressions, Languages & Properties', 'Regular expressions, operators, algebraic laws. Conversion of regular expressions to finite automata (Thomson\'s construction) and FA to regular expressions (Arden\'s theorem, state elimination). Pumping Lemma for regular languages and applications to non-regularity. Closure properties (union, intersection, complement, concatenation, star) and decision properties of regular languages.');
    insertUnit.run(flatSub5.id, 3, 'Unit 3: Context-Free Grammars (CFG) & Languages (CFL)', 'Context-free grammars, derivations (leftmost, rightmost), parse trees, ambiguity in grammars, inherent ambiguity. Simplification of CFGs: elimination of useless symbols, null productions, and unit productions. Normal forms: Chomsky Normal Form (CNF) and Greibach Normal Form (GNF). Pumping Lemma for context-free languages, closure properties of CFLs.');
    insertUnit.run(flatSub5.id, 4, 'Unit 4: Pushdown Automata (PDA)', 'Definition and model of PDA, instantaneous descriptions (ID), acceptance by empty stack and acceptance by final state, equivalence of acceptance mechanisms. Equivalence of PDA and Context-Free Grammars (conversion of CFG to PDA and PDA to CFG). Deterministic Pushdown Automata (DPDA) and deterministic CFLs, two-stack PDA.');
    insertUnit.run(flatSub5.id, 5, 'Unit 5: Turing Machines & Computability', 'Turing Machine (TM) model, definition, instantaneous descriptions, design of Turing machines, techniques for TM construction: storage in state, multiple tracks, multi-tape TM, nondeterministic TM, equivalence of TM variants. Church-Turing thesis, Universal Turing Machine.');
    insertUnit.run(flatSub5.id, 6, 'Unit 6: Undecidability & Chomsky Hierarchy', 'Decidable and undecidable problems, recursive and recursively enumerable languages, Halting problem of Turing Machine, Post\'s Correspondence Problem (PCP), Rice\'s theorem, reducibility. Chomsky hierarchy of languages: Type-0 (Unrestricted), Type-1 (Context-Sensitive), Type-2 (Context-Free), Type-3 (Regular). Textbooks: Hopcroft, Motwani & Ullman; Michael Sipser; Peter Linz; Mishra & Chandrasekaran.');
  }

  const seSub5 = db.prepare("SELECT id FROM subjects WHERE code = '105504'").get();
  if (seSub5) {
    insertUnit.run(seSub5.id, 1, 'Unit 1: Introduction to Software Engineering & Process Models', 'Software characteristics, software crisis, software engineering definition, layered technology. Software Process Models: Waterfall model, Prototyping model, Evolutionary models, Incremental model, Spiral model, RAD model. Agile Software Development: Agile principles, Scrum, Extreme Programming (XP), Kanban, comparison of process models.');
    insertUnit.run(seSub5.id, 2, 'Unit 2: Software Requirements Engineering', 'Requirements engineering process: Inception, Elicitation, Elaboration, Negotiation, Specification, Validation. Software Requirements Specification (SRS), IEEE 830 standard for SRS. Functional vs Non-functional requirements, User requirements, System requirements. Requirements modeling: Use case diagrams, Data Flow Diagrams (DFD), Entity Relationship Diagrams, state transition diagrams.');
    insertUnit.run(seSub5.id, 3, 'Unit 3: Software Design Engineering & Architecture', 'Design concepts: Abstraction, Modularity, Information Hiding, Cohesion and Coupling (types and evaluation). Software Architecture: Architectural styles (Data-centered, Data-flow, Call-and-return, Layered). Object-Oriented Design using UML: Class diagrams, Sequence diagrams, Collaboration diagrams, Activity diagrams, Component and Deployment diagrams.');
    insertUnit.run(seSub5.id, 4, 'Unit 4: Software Project Management & Cost Estimation', 'Software metrics: Size-oriented metrics (LOC), Function-oriented metrics (Function Points - FP). Cost estimation models: Empirical estimation, COCOMO model (Basic, Intermediate, Detailed), COCOMO-II. Project scheduling: Work Breakdown Structure (WBS), Gantt charts, PERT/CPM networks. Risk management: Risk identification, Risk projection (RMMM plan).');
    insertUnit.run(seSub5.id, 5, 'Unit 5: Software Testing Strategies & Techniques', 'Software testing fundamentals: Verification vs Validation, error, fault, bug, failure. Test case design. White-box testing: Basis path testing, Cyclomatic complexity, control structure testing (Condition, Data flow, Loop testing). Black-box testing: Equivalence partitioning, Boundary Value Analysis (BVA), Cause-Effect graphing. Testing levels: Unit testing, Integration testing (Top-down, Bottom-up, Sandwich), System testing, Alpha and Beta testing, Regression testing, Mutation testing, Debugging techniques.');
    insertUnit.run(seSub5.id, 6, 'Unit 6: Software Maintenance, Quality Assurance & SCM', 'Software maintenance: Need, categories (Corrective, Adaptive, Perfective, Preventive), maintenance cost, Software reengineering, Reverse engineering. Software Quality: SQA activities, Software reliability metrics (MTTF, MTBF), SEI Capability Maturity Model (CMM/CMMI levels), ISO 9000/9001 standards. Software Configuration Management (SCM): SCM process, version control, change control, SCM tools. Textbooks: Roger S. Pressman; Ian Sommerville; Rajib Mall.');
  }

  const seminarSub = db.prepare("SELECT id FROM subjects WHERE code = '105505'").get();
  if (seminarSub) {
    insertUnit.run(seminarSub.id, 1, 'Technical Seminar Presentation & Report Writing', 'Guidelines: 1. Selection of an advanced topic in CSE from reputed journals (IEEE, ACM, Springer, Elsevier). 2. Literature survey and critical analysis. 3. Technical presentation slides design. 4. Oral presentation before department committee. 5. Q&A session. 6. Submission of formal seminar report.');
  }

  const se2Sub = db.prepare("SELECT id FROM subjects WHERE code = '100510P'").get();
  if (se2Sub) {
    insertUnit.run(se2Sub.id, 1, 'Entrepreneurship Project / 6-Week Industry Internship', 'Course Guidelines: 1. Completion of 6-week industrial training / internship in registered industry/startup, or execution of an innovative entrepreneurship project between 4th and 5th semester. 2. Feasibility study & Business Model Canvas (BMC). 3. Prototype design & execution. 4. Mentor monitoring. 5. Comprehensive report submission with industry certificate. 6. Final viva-voce examination.');
  }

  const nptel2Sub = db.prepare("SELECT id FROM subjects WHERE code = '100511P'").get();
  if (nptel2Sub) {
    insertUnit.run(nptel2Sub.id, 1, 'NPTEL MOOC Certification Course - II Guidelines', 'Credit transfer guidelines as per BEU & AICTE framework: 1. Registration in approved advanced NPTEL/SWAYAM online courses. 2. Regular submission of weekly assignments and quizzes (IA: 20 marks). 3. Proctored certification examination (ESE: 30 marks). 4. Credit transfer processing upon submission of official NPTEL e-certificate and grade card.');
  }

  const dbmsLab5 = db.prepare("SELECT id FROM subjects WHERE code = '105502P'").get();
  if (dbmsLab5) {
    insertUnit.run(dbmsLab5.id, 1, 'Practical Experiments: SQL, PL/SQL & Relational Database Design', 'List of practical experiments (PostgreSQL/MySQL/Oracle): 1. Schema & table definition with constraints (PK, FK, Unique, Check). 2. DML operations with WHERE, GROUP BY, HAVING, ORDER BY. 3. Nested & Correlated subqueries. 4. Relational JOINs (INNER, OUTER, SELF). 5. Views and Indexes. 6. PL/SQL conditional blocks. 7. Stored Procedures and Functions. 8. Database Triggers. 9. Cursors. 10. Mini-Project: ER modeling, normalization & implementation.');
  }

  // Units for Sem 6 Subjects
  const cn6Sub = db.prepare("SELECT id FROM subjects WHERE code = '100602'").get();
  if (cn6Sub) {
    insertUnit.run(cn6Sub.id, 1, 'Unit 1: Introduction to Data Communications & Physical Layer', 'Data communication components, topologies, transmission modes, switching: circuit, packet, message. OSI vs TCP/IP layered architecture. Transmission media: guided and unguided. Shannon capacity, Nyquist bit rate, modulation and multiplexing (FDM, TDM, WDM).');
    insertUnit.run(cn6Sub.id, 2, 'Unit 2: Data Link Layer & MAC Sublayer', 'Framing, error detection & correction: CRC, checksum, Hamming codes. Flow control: Stop-and-Wait, Go-Back-N, Selective Repeat ARQ. MAC protocols: ALOHA, CSMA, CSMA/CD (Ethernet IEEE 802.3), CSMA/CA (Wi-Fi 802.11). MAC addressing, bridges, switches.');
    insertUnit.run(cn6Sub.id, 3, 'Unit 3: Network Layer & IP Addressing', 'Virtual circuits & datagram networks. Routing algorithms: Dijkstra\'s shortest path, Distance Vector (Bellman-Ford), Link State (OSPF), BGP. IPv4 addressing, classful vs CIDR subnetting, NAT, ARP, RARP, ICMP, DHCP. IPv6 fundamentals and migration.');
    insertUnit.run(cn6Sub.id, 4, 'Unit 4: Transport Layer Protocols', 'Transport layer services, port numbers, sockets. UDP protocol and segment format. TCP: 3-way handshake connection management, flow control (sliding window), error control, congestion control algorithms (AIMD, slow start, fast retransmit/recovery).');
    insertUnit.run(cn6Sub.id, 5, 'Unit 5: Application Layer Protocols & Network Security', 'Client-server architecture, DNS resolution, HTTP/1.1 vs HTTP/2, HTTPS, email protocols (SMTP, POP3, IMAP), FTP, SSH. Network security: cryptography (symmetric & asymmetric), digital signatures, SSL/TLS handshake, firewalls, IPsec basics. Textbooks: Tanenbaum; Kurose & Ross; Forouzan.');
  }

  const cdSub = db.prepare("SELECT id FROM subjects WHERE code = '105601'").get();
  if (cdSub) {
    insertUnit.run(cdSub.id, 1, 'Unit 1: Introduction to Compilers & Lexical Analysis', 'Phases and passes of a compiler, compiler construction tools. Role of lexical analyzer, input buffering, specification and recognition of tokens. Regular expressions to Finite Automata, Thompson\'s construction, DFA minimization, LEX/FLEX lexical analyzer generator.');
    insertUnit.run(cdSub.id, 2, 'Unit 2: Syntax Analysis & Parsing Techniques', 'Role of parser, Context-Free Grammars, ambiguity. Top-down parsing: recursive descent, LL(1) grammars, FIRST and FOLLOW computation. Bottom-up parsing: shift-reduce, operator precedence, LR parsers: LR(0), SLR(1), Canonical LR(1), LALR(1) parsing tables, YACC/BISON parser generator.');
    insertUnit.run(cdSub.id, 3, 'Unit 3: Syntax-Directed Translation & Semantic Analysis', 'Syntax-Directed Definitions (SDD), S-attributed and L-attributed definitions, Syntax-Directed Translation (SDT) schemes, translation of expressions and control structures. Type systems, type expressions, type checking, type equivalence, overloading.');
    insertUnit.run(cdSub.id, 4, 'Unit 4: Intermediate Code Generation & Run-Time Environments', 'Intermediate languages: graphical representations, three-address code, quadruples, triples, indirect triples. Translation of assignments, boolean expressions, control flow. Run-time environments: storage organization, stack allocation, activation records, parameter passing mechanisms, symbol table management.');
    insertUnit.run(cdSub.id, 5, 'Unit 5: Code Optimization & Target Code Generation', 'Principal sources of optimization, basic blocks, flow graphs, DAG representation of basic blocks. Local vs Global optimization: common subexpression elimination, dead code elimination, copy propagation, loop optimization. Issues in design of target code generator, register allocation and assignment, peephole optimization. Textbooks: Aho, Lam, Sethi, Ullman (Dragon Book); Santanu Chattopadhyay.');
  }

  const mlSub6 = db.prepare("SELECT id FROM subjects WHERE code = '105602'").get();
  if (mlSub6) {
    insertUnit.run(mlSub6.id, 1, 'Unit 1: Introduction & Mathematical Foundations', 'Definition of learning, machine learning workflow, linear algebra and probability review. Types of learning: supervised, unsupervised, semi-supervised, reinforcement learning. Inductive bias, PAC learning, Occam\'s razor, training/validation/test splits, overfitting vs underfitting, bias-variance tradeoff.');
    insertUnit.run(mlSub6.id, 2, 'Unit 2: Linear Models & Regression Techniques', 'Simple and multiple linear regression, cost function, Ordinary Least Squares (OLS), Gradient Descent (Batch, Mini-batch, Stochastic). Polynomial regression, regularization techniques: Ridge (L2), Lasso (L1), Elastic Net. Logistic regression for binary and multiclass classification, sigmoid function, cross-entropy loss.');
    insertUnit.run(mlSub6.id, 3, 'Unit 3: Supervised Classification Algorithms', 'Decision trees: ID3, C4.5, CART, entropy, information gain, Gini impurity, tree pruning. Naive Bayes classifier, conditional probability, maximum likelihood estimation. Support Vector Machines (SVM): optimal hyperplanes, hard vs soft margin, kernel trick (linear, polynomial, RBF kernels). K-Nearest Neighbors (KNN).');
    insertUnit.run(mlSub6.id, 4, 'Unit 4: Ensemble Learning & Neural Networks', 'Ensemble methods: Bootstrap Aggregating (Bagging), Random Forests, out-of-bag error. Boosting algorithms: AdaBoost, Gradient Boosted Decision Trees (GBDT), XGBoost. Artificial Neural Networks: biological neuron, Perceptron model, Multi-Layer Perceptron (MLP), activation functions (ReLU, Sigmoid, Tanh), Backpropagation algorithm.');
    insertUnit.run(mlSub6.id, 5, 'Unit 5: Unsupervised Learning & Dimensionality Reduction', 'Clustering algorithms: K-Means clustering, Elbow method, Hierarchical clustering (agglomerative, divisive, dendrograms), DBSCAN. Dimensionality reduction: curse of dimensionality, Principal Component Analysis (PCA), Linear Discriminant Analysis (LDA), t-SNE overview.');
    insertUnit.run(mlSub6.id, 6, 'Unit 6: Model Evaluation Metrics & Modern Deep Learning', 'Performance metrics: confusion matrix, accuracy, precision, recall, F1-score, specificity, ROC curve, AUC-ROC. Cross-validation: K-fold, stratified K-fold. Introduction to deep learning architectures: Convolutional Neural Networks (CNN) for image tasks, Recurrent Neural Networks (RNN) for sequence data. Textbooks: Tom M. Mitchell; Stuart Russell & Peter Norvig; Christopher M. Bishop.');
  }

  const pe1Sub = db.prepare("SELECT id FROM subjects WHERE code = '1056XX (PE-I)'").get();
  if (pe1Sub) {
    insertUnit.run(pe1Sub.id, 1, 'Unit 1: Elective Foundation & Core Principles', 'Fundamental mathematical formulations, representations, system models, problem formulation and introductory theoretical paradigms of chosen elective track.');
    insertUnit.run(pe1Sub.id, 2, 'Unit 2: Analytical Techniques & Algorithms', 'Specialized algorithms, transformations, discrete structures, state representations, complexity characteristics, and algorithmic solutions.');
    insertUnit.run(pe1Sub.id, 3, 'Unit 3: Advanced Methods & Transformations', 'Advanced data models, spectral transformations, connectivity structures, traversal methods, or feature extraction techniques depending on selected elective.');
    insertUnit.run(pe1Sub.id, 4, 'Unit 4: Optimization, Design & Implementations', 'Algorithmic optimizations, architectural patterns, design patterns, computational trade-offs, and practical software frameworks.');
    insertUnit.run(pe1Sub.id, 5, 'Unit 5: Engineering Applications & Case Studies', 'Industrial implementations, case studies, benchmarking, integration with modern computing systems, and research trends.');
  }

  const pe2Sub = db.prepare("SELECT id FROM subjects WHERE code = '1056XX (PE-II)'").get();
  if (pe2Sub) {
    insertUnit.run(pe2Sub.id, 1, 'Unit 1: Architectural Foundations & System Models', 'Distributed architecture, system abstractions, cloud models (IaaS, PaaS, SaaS) or information coding primitives, virtualization mechanisms.');
    insertUnit.run(pe2Sub.id, 2, 'Unit 2: Core Protocols, Processing & Algorithms', 'Communication protocols, distributed consensus, channel capacity, compression algorithms, rendering pipelines, or advanced algorithmic techniques.');
    insertUnit.run(pe2Sub.id, 3, 'Unit 3: Storage, Virtualization & Resource Management', 'Distributed storage, data centers, resource scheduling, load balancing, virtualization hypervisors, error-correcting codes, and security mechanisms.');
    insertUnit.run(pe2Sub.id, 4, 'Unit 4: Scalability, Fault Tolerance & Performance', 'High availability, fault tolerance, replication, consistency models, performance benchmarking, QoS parameters, and distributed coordination.');
    insertUnit.run(pe2Sub.id, 5, 'Unit 5: Industry Frameworks & Contemporary Deployments', 'Industrial cloud platforms (AWS, GCP, Azure), containerization (Docker, Kubernetes), serverless computing, and real-world deployment case studies.');
  }

  const cdLabSub = db.prepare("SELECT id FROM subjects WHERE code = '105601P'").get();
  if (cdLabSub) {
    insertUnit.run(cdLabSub.id, 1, 'Practical Experiments: Lexical Analysis, Parsing & Intermediate Code', 'List of practical experiments: 1. Lexical Analyzer in C/C++. 2. Lexical Analyzer using LEX/FLEX. 3. Recursive Descent Parser. 4. LL(1) Parsing Table generator. 5. Shift-Reduce parser. 6. YACC/BISON calculator. 7. Syntax Tree and DAG construction. 8. TAC generator. 9. Basic block optimization pass. 10. Front-end compiler project.');
  }

  const cnLab6 = db.prepare("SELECT id FROM subjects WHERE code = '100602P'").get();
  if (cnLab6) {
    insertUnit.run(cnLab6.id, 1, 'Practical Experiments: Packet Sniffing, Socket Programming & Network Simulation', 'List of practical experiments: 1. Cable crimping & CLI network tools. 2. Wireshark packet capture. 3. CRC error detection. 4. Sliding Window simulation. 5. Cisco Packet Tracer LAN/DHCP/DNS. 6. RIP & OSPF routing. 7. TCP socket programming. 8. UDP socket programming. 9. Congestion control simulation. 10. Multi-client chat server.');
  }

  const pyLabSub = db.prepare("SELECT id FROM subjects WHERE code = '105620P'").get();
  if (pyLabSub) {
    insertUnit.run(pyLabSub.id, 1, 'Practical Experiments: Python Fundamentals, Data Science & ML Libraries', 'List of practical experiments: 1. Python syntax & control flow. 2. Data structures. 3. OOP in Python. 4. File & exception handling. 5. NumPy arrays & linear algebra. 6. Pandas DataFrames. 7. Matplotlib & Seaborn plots. 8. Scikit-learn Linear/Logistic Regression. 9. Decision Trees & Random Forests. 10. End-to-end ML pipeline.');
  }

  const nptel6 = db.prepare("SELECT id FROM subjects WHERE code = '100604P'").get();
  if (nptel6) {
    insertUnit.run(nptel6.id, 1, 'NPTEL MOOC Certification Course - 2 Guidelines', 'Course Guidelines: 1. Registration in approved NPTEL/SWAYAM online courses. 2. Weekly assignment submissions (IA: 20 marks). 3. End-term proctored exam (ESE: 30 marks). 4. Credit transfer processing upon submission of official NPTEL certificate.');
  }

  // Units for Sem 7 Subjects
  const bioSub = db.prepare("SELECT id FROM subjects WHERE code = '100708'").get();
  if (bioSub) {
    insertUnit.run(bioSub.id, 1, 'Unit 1: Introduction to Biology & Macromolecules', 'Biological perspective in engineering, classification of life (five-kingdom and three-domain), cellular architecture: prokaryotes vs eukaryotes, cell organelles. Biomolecules: Carbohydrates, lipids, proteins, nucleic acids. Hierarchical structure of proteins (primary, secondary, tertiary, quaternary).');
    insertUnit.run(bioSub.id, 2, 'Unit 2: Genetics & Molecular Information Transfer', 'Mendel\'s laws of inheritance, gene concept, DNA structure (Watson-Crick model), DNA replication, Central Dogma of molecular biology. Transcription, RNA processing, genetic code, Translation (protein synthesis), mutations and genetic disorders.');
    insertUnit.run(bioSub.id, 3, 'Unit 3: Enzymes & Bioenergetics', 'Enzyme classification, mechanism of enzyme action, active site, lock-and-key and induced-fit models. Enzyme kinetics (Michaelis-Menten equation), factors affecting enzyme activity, enzyme inhibition. Bioenergetics: cellular respiration, glycolysis, TCA cycle, oxidative phosphorylation, ATP generation.');
    insertUnit.run(bioSub.id, 4, 'Unit 4: Microbiology, Immunology & Biosystems', 'Microbial diversity: bacteria, viruses, fungi. Growth kinetics of microorganisms. Immune system: innate vs adaptive immunity, antigens, antibodies, antigen-antibody interactions, vaccines. Biological membranes, transport mechanisms, bio-sensors, and neural transmission.');
    insertUnit.run(bioSub.id, 5, 'Unit 5: Engineering Applications of Biology', 'Bio-inspired engineering and biomimicry (sonar, lotus effect, artificial organs). Bioinformatics: sequence alignment (BLAST), computational biology tools. Recombinant DNA technology, CRISPR-Cas9 gene editing, bio-materials, tissue engineering, and bio-nanotechnology. Textbooks: Arthur T. Johnson, Biology for Engineers; Campbell Biology.');
  }

  const oe1Sub = db.prepare("SELECT id FROM subjects WHERE code = '100702'").get();
  if (oe1Sub) {
    insertUnit.run(oe1Sub.id, 1, 'Unit 1: Foundations & Organizational Frameworks', 'Concepts, principles, organizational design, legal frameworks, regulatory compliance, and interdisciplinary engineering interfaces.');
    insertUnit.run(oe1Sub.id, 2, 'Unit 2: Methodologies, Planning & Analysis', 'System planning, resource optimization, operational workflows, risk assessment methodologies, and strategic forecasting.');
    insertUnit.run(oe1Sub.id, 3, 'Unit 3: Implementation Strategies & Quantitative Models', 'Process optimization, quantitative modeling, technology deployment, human capital metrics, and operational performance measurement.');
    insertUnit.run(oe1Sub.id, 4, 'Unit 4: Evaluation, Quality & Sustainability', 'Standards compliance, total quality management, environmental impact, cost-benefit analysis, sustainability practices, and governance.');
    insertUnit.run(oe1Sub.id, 5, 'Unit 5: Case Studies, Ethics & Future Horizons', 'Contemporary industrial case studies, ethical and legal dimensions, digital transformation, and global management paradigms.');
  }

  const oe2Sub = db.prepare("SELECT id FROM subjects WHERE code = '100703'").get();
  if (oe2Sub) {
    insertUnit.run(oe2Sub.id, 1, 'Unit 1: Architectural Foundations & Physical Principles', 'Physical principles, hardware interfaces, sensors and actuators, architectural models, economic and technological fundamentals.');
    insertUnit.run(oe2Sub.id, 2, 'Unit 2: Networking Protocols & Optimization Methods', 'Communication protocols, wireless standards, linear programming, optimization formulations, network routing, and data interchange.');
    insertUnit.run(oe2Sub.id, 3, 'Unit 3: Computational Processing & System Integration', 'Data aggregation, embedded processing, simulation modeling, financial mathematics, energy conversion systems, and edge devices.');
    insertUnit.run(oe2Sub.id, 4, 'Unit 4: Security, Scalability & System Analytics', 'System security, vulnerability evaluation, cost analysis, scalability paradigms, lifecycle costing, and diagnostic analytics.');
    insertUnit.run(oe2Sub.id, 5, 'Unit 5: Real-World Applications & Emerging Trends', 'Smart campus systems, energy grid management, economic decision making, smart cities, and industrial deployments.');
  }

  const pe3Sub = db.prepare("SELECT id FROM subjects WHERE code = '105701'").get();
  if (pe3Sub) {
    insertUnit.run(pe3Sub.id, 1, 'Unit 1: Core Mathematical Models & Foundations', 'Number theory / linguistic foundations / mobile wireless architectures / big data distributed models, core theoretical frameworks.');
    insertUnit.run(pe3Sub.id, 2, 'Unit 2: Classical & Modern Algorithmic Techniques', 'Symmetric/asymmetric algorithms, syntactic parsing, cellular protocols (4G/5G), MapReduce programming, distributed computing models.');
    insertUnit.run(pe3Sub.id, 3, 'Unit 3: Advanced Architectures & Frameworks', 'Key exchange, digital signatures, deep learning NLP (Transformers), mobile ad-hoc networks, Hadoop & Apache Spark architecture.');
    insertUnit.run(pe3Sub.id, 4, 'Unit 4: Optimization, Security & Distributed Processing', 'Cryptographic attacks, language modeling, mobile security & routing, streaming data pipelines (Kafka), distributed NoSQL databases.');
    insertUnit.run(pe3Sub.id, 5, 'Unit 5: Real-World Engineering Applications & Deployment', 'Zero-knowledge proofs, LLMs & chat applications, IoT edge mobility, real-time analytics dashboards, and production case studies.');
  }

  const inductSub = db.prepare("SELECT id FROM subjects WHERE code = '100701'").get();
  if (inductSub) {
    insertUnit.run(inductSub.id, 1, 'Universal Human Values, Professional Ethics & Life Skills', 'Induction Program Modules: 1. Universal Human Values and Self-Exploration. 2. Creative and Performing Arts. 3. Physical Activities, Sports, and Yoga. 4. Literary activities and communication development. 5. Proficiency modules in engineering tools. 6. Mentoring, societal visits, social work, and campus familiarization.');
  }

  const proj1Sub = db.prepare("SELECT id FROM subjects WHERE code = '105702P'").get();
  if (proj1Sub) {
    insertUnit.run(proj1Sub.id, 1, 'Major Project Phase-I: Formulation, Design & Prototype', 'Project Guidelines: 1. Problem identification in CSE. 2. IEEE/ACM literature survey. 3. SRS and system architecture. 4. Technology stack and DB modeling. 5. Prototype development. 6. Periodic progress reviews. 7. Phase-I synopsis and report submission. 8. Demonstration and viva-voce.');
  }

  const se3Sub = db.prepare("SELECT id FROM subjects WHERE code = '100710P'").get();
  if (se3Sub) {
    insertUnit.run(se3Sub.id, 1, '8-Week Industry Internship / Startup Incubation Training', 'Course Guidelines: 1. Completion of 8-week intensive industrial internship or startup incubation between 6th and 7th semester. 2. Hands-on development and process study. 3. Bi-weekly progress logbook. 4. Comprehensive report submission. 5. Department presentation and viva-voce.');
  }

  const peLab2 = db.prepare("SELECT id FROM subjects WHERE code = '105703P'").get();
  if (peLab2) {
    insertUnit.run(peLab2.id, 1, 'Practical Experiments: Track-Specific Engineering Implementations', 'List of practical experiments aligned with Program Elective-III: 1. Encryption/decryption (AES, RSA). 2. Digital signatures. 3. NLP text processing (NLTK/Spacy). 4. Sentiment classification. 5. Hadoop MapReduce. 6. Apache Spark transformations. 7. Mobile app or IoT sensor integration. 8. Elective lab project.');
  }

  // Units for Sem 8 Subjects
  const oe3Sub = db.prepare("SELECT id FROM subjects WHERE code = '100801'").get();
  if (oe3Sub) {
    insertUnit.run(oe3Sub.id, 1, 'Unit 1: Principles, Standards & Management Frameworks', 'Core concepts of quality, project planning, disaster phases, or blockchain distributed ledger foundations.');
    insertUnit.run(oe3Sub.id, 2, 'Unit 2: Tools, Methodologies & Quantitative Controls', 'Six Sigma tools, CPM/PERT scheduling, risk hazard assessment, consensus algorithms (PoW, PoS), and smart contracts.');
    insertUnit.run(oe3Sub.id, 3, 'Unit 3: Implementation, Governance & Life Cycle Models', 'TQM implementation, resource leveling, emergency management systems, decentralized applications (DApps), and regulatory policies.');
    insertUnit.run(oe3Sub.id, 4, 'Unit 4: Quality Audits, Risk Mitigation & Security', 'ISO 9000 audits, earned value management (EVM), disaster recovery plans, cryptographic security in blockchain.');
    insertUnit.run(oe3Sub.id, 5, 'Unit 5: Case Studies, Ethics & Emerging Horizons', 'Benchmarking, industry project failures and success stories, climate resilience, DeFi innovations, and corporate governance.');
  }

  const oe4Sub = db.prepare("SELECT id FROM subjects WHERE code = '100802'").get();
  if (oe4Sub) {
    insertUnit.run(oe4Sub.id, 1, 'Unit 1: Legal & Strategic Foundations', 'Introduction to IPR (Patents, Copyrights, Trademarks), startup entrepreneurship ecosystems, value analysis concepts, smart city architectures.');
    insertUnit.run(oe4Sub.id, 2, 'Unit 2: Processes, Registration & Feasibility Analysis', 'Patent filing procedures, business plan preparation, FAST diagramming in value engineering, IoT urban sensing infrastructure.');
    insertUnit.run(oe4Sub.id, 3, 'Unit 3: Valuation, Financing & System Design', 'Commercialization of IP, venture capital & angel funding, cost-worth analysis, smart mobility, water and energy grid design.');
    insertUnit.run(oe4Sub.id, 4, 'Unit 4: Infringement, Governance & Sustainability', 'Patent litigation, startup exit strategies, creative problem solving, urban data privacy, sustainability and environmental resilience.');
    insertUnit.run(oe4Sub.id, 5, 'Unit 5: Global Perspectives & Contemporary Trends', 'WIPO & international treaties, government startup schemes (Startup India, Bihar Startup Policy), smart governance case studies.');
  }

  const pe4Sub = db.prepare("SELECT id FROM subjects WHERE code = '105801'").get();
  if (pe4Sub) {
    insertUnit.run(pe4Sub.id, 1, 'Unit 1: Advanced Theoretical Foundations', 'Deep neural networks (CNN, RNN, LSTM) / Cloud virtualization models / Digital evidence preservation / Sensor node architectures.');
    insertUnit.run(pe4Sub.id, 2, 'Unit 2: Architectural Patterns & Protocols', 'Transfer learning, CI/CD pipelines, container orchestration (Kubernetes), file system forensics, WSN routing protocols.');
    insertUnit.run(pe4Sub.id, 3, 'Unit 3: Implementation & Analysis Frameworks', 'PyTorch/TensorFlow implementations, Terraform IaC, memory forensics & network packet analysis, energy-efficient MAC protocols.');
    insertUnit.run(pe4Sub.id, 4, 'Unit 4: Optimization, Security & Scaling', 'Hyperparameter tuning, regularization, DevSecOps practices, anti-forensics counter-measures, WSN coverage and localization.');
    insertUnit.run(pe4Sub.id, 5, 'Unit 5: Production Case Studies & Emerging Frontiers', 'Generative AI (GANs, Diffusion models), serverless multi-cloud deployments, mobile forensics, IoT-WSN industrial applications.');
  }

  const pe5Sub = db.prepare("SELECT id FROM subjects WHERE code = '105802'").get();
  if (pe5Sub) {
    insertUnit.run(pe5Sub.id, 1, 'Unit 1: Foundational Paradigms & Mathematics', 'Qubits, quantum gates, superposition / Markov Decision Processes / Image formation & filtering / Parallel computing hardware.');
    insertUnit.run(pe5Sub.id, 2, 'Unit 2: Core Algorithmic Frameworks', 'Deutsch-Jozsa, Shor\'s & Grover\'s algorithms / Q-Learning, SARSA, Policy Gradients / Edge detection, feature matching (SIFT, ORB) / MPI & OpenMP.');
    insertUnit.run(pe5Sub.id, 3, 'Unit 3: Advanced Architectures & Models', 'Quantum circuits, error correction / Deep Q-Networks (DQN), Actor-Critic / Object detection (YOLO, Faster R-CNN) / GPU programming with CUDA.');
    insertUnit.run(pe5Sub.id, 4, 'Unit 4: Optimization & Computational Scaling', 'Noisy Intermediate-Scale Quantum (NISQ) systems / Model-based RL, reward engineering / Image segmentation, optical flow / Parallel algorithms for sorting & graphs.');
    insertUnit.run(pe5Sub.id, 5, 'Unit 5: Cutting-Edge Engineering Deployments', 'IBM Qiskit quantum algorithms / AlphaGo & autonomous robotics / Vision Transformers (ViT), 3D reconstruction / Supercomputing benchmarks.');
  }

  const proj2Sub = db.prepare("SELECT id FROM subjects WHERE code = '105803P'").get();
  if (proj2Sub) {
    insertUnit.run(proj2Sub.id, 1, 'Major Project Phase-II: Implementation, Testing & Dissertation', 'Project Guidelines: 1. Full-scale system implementation based on Phase-I architecture design. 2. Comprehensive testing and benchmarking. 3. Deployment on cloud/server with live demonstration. 4. Drafting and submission of a quality research paper. 5. Final dissertation thesis. 6. Final viva-voce before university external examination board.');
  }

  // Add default units for any other subjects without units
  const allOtherSubjects = db.prepare('SELECT id, name FROM subjects WHERE id NOT IN (SELECT DISTINCT subject_id FROM units)').all();
  for (const s of allOtherSubjects) {
    for (let u = 1; u <= 4; u++) {
      insertUnit.run(s.id, u, `Unit ${u}: Core Concepts & Applications`, `Detailed coverage of unit ${u} syllabus topics for ${s.name}.`);
    }
  }

  // 5. Seed Resource Types
  const insertResType = db.prepare('INSERT INTO resource_types (name, icon) VALUES (?, ?)');
  insertResType.run('Handwritten Notes', 'FileText');
  insertResType.run('Lecture Slides / PPT', 'Presentation');
  insertResType.run('Question Bank / PYQ', 'HelpCircle');
  insertResType.run('Lab Manual', 'Terminal');
  insertResType.run('Formula Sheet / Cheatsheet', 'BookOpen');
  insertResType.run('Reference Textbook Summary', 'Bookmark');

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // 6. Seed Platform Settings
  const insertSetting = db.prepare(`
    INSERT INTO platform_settings (key, value, description)
    VALUES (?, ?, ?)
  `);

  insertSetting.run('college_name', 'Government Engineering College, West Champaran', 'Official College Institution Name');
  insertSetting.run('branch_name', 'Computer Science & Engineering', 'Engineering Branch');
  insertSetting.run('portal_name', 'GECWC Academics', 'Web Portal Title');
  insertSetting.run('tagline', 'One Place for All CSE Academic Notes', 'Portal Tagline');
  insertSetting.run('max_upload_size_mb', '25', 'Maximum allowed single file upload size in Megabytes');
  insertSetting.run('allowed_file_types', '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.png', 'Comma-separated allowed file extensions');
  insertSetting.run('enable_rate_limiting', 'true', 'Enable student upload rate limiting (max 10 notes per day)');
  insertSetting.run('notice_banner', 'Welcome to GECWC Academics. Semester 1 to 8 CSE study material & question banks are updated for 2026-27.', 'Notice displayed at top of portal');

  console.log('[DB] Seeding completed successfully.');
}

module.exports = {
  db,
  initDatabase
};
