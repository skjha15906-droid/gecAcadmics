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
  const adminHash = bcrypt.hashSync('admin123', salt);
  const modHash = bcrypt.hashSync('mod123', salt);
  const studentHash = bcrypt.hashSync('student123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, roll_number, semester, role, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('Shubh Kumar Jha', 'admin@gecwc.ac.in', adminHash, 'ADM-CSE-001', null, 'admin', 'active');
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

  // Sem 3
  insertSubject.run(3, 'CS301', 'Data Structures & Algorithms', 'Stacks, queues, linked lists, trees, graphs, sorting, and algorithmic complexities.');
  insertSubject.run(3, 'CS302', 'Object Oriented Programming using C++/Java', 'Encapsulation, inheritance, polymorphism, templates, and exception handling.');
  insertSubject.run(3, 'CS303', 'Computer Organization & Architecture', 'ALU, instruction set, pipelining, cache memory hierarchy, and I/O interface.');
  insertSubject.run(3, 'CS304', 'Discrete Mathematics', 'Set theory, predicate logic, relations, graph theory, and combinatorics.');
  insertSubject.run(3, 'EC305', 'Digital Electronics', 'Boolean algebra, logic gates, combinational circuits, flip-flops, counters, and registers.');

  // Sem 4
  insertSubject.run(4, 'CS401', 'Design & Analysis of Algorithms', 'Divide and conquer, greedy methods, dynamic programming, backtracking, and NP-completeness.');
  insertSubject.run(4, 'CS402', 'Operating Systems', 'Process synchronization, CPU scheduling, deadlocks, memory management, and file systems.');
  insertSubject.run(4, 'CS403', 'Database Management Systems', 'Relational data model, SQL, normalization, transaction ACID properties, and indexing.');
  insertSubject.run(4, 'CS404', 'Formal Language & Automata Theory', 'Regular languages, DFA/NFA, context-free grammars, pushdown automata, and Turing machines.');

  // Sem 5
  insertSubject.run(5, 'CS501', 'Computer Networks', 'OSI model, TCP/IP protocol suite, subnetting, routing algorithms, and transport protocols.');
  insertSubject.run(5, 'CS502', 'Compiler Design', 'Lexical analysis, top-down and bottom-up parsing, intermediate code, and code optimization.');
  insertSubject.run(5, 'CS503', 'Software Engineering', 'Software life cycle models, requirements elicitation, design patterns, testing, and agile.');

  // Sem 6
  insertSubject.run(6, 'CS601', 'Machine Learning', 'Supervised learning, regression, classification, clustering, neural networks, and model metrics.');
  insertSubject.run(6, 'CS602', 'Cloud Computing', 'Virtualization, AWS/GCP architecture, serverless infrastructure, and cloud security.');
  insertSubject.run(6, 'CS603', 'Web Technologies', 'Modern full-stack architecture, REST APIs, reactive state, and secure web storage.');

  // Sem 7
  insertSubject.run(7, 'CS701', 'Artificial Intelligence', 'Heuristic search algorithms, knowledge representation, inference engines, and expert systems.');
  insertSubject.run(7, 'CS702', 'Cryptography & Network Security', 'Symmetric ciphers, RSA, elliptic curve, digital certificates, firewalls, and hash digests.');

  // Sem 8
  insertSubject.run(8, 'CS801', 'Internet of Things (IoT)', 'Sensors, microcontrollers, MQTT/CoAP protocols, edge computing, and real-world deployment.');
  insertSubject.run(8, 'CS802', 'Big Data Analytics', 'Hadoop ecosystem, HDFS, MapReduce, Apache Spark, and distributed streaming.');

  // 4. Seed Units for key subjects
  const insertUnit = db.prepare(`
    INSERT INTO units (subject_id, unit_number, title, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  // Units for CS301 (Data Structures)
  const dsSub = db.prepare("SELECT id FROM subjects WHERE code = 'CS301'").get();
  if (dsSub) {
    insertUnit.run(dsSub.id, 1, 'Unit 1: Introduction, Arrays & Stacks', 'Linear data structures, stack operations, applications of stack, Polish notations.');
    insertUnit.run(dsSub.id, 2, 'Unit 2: Queues & Linked Lists', 'Circular queues, priority queues, singly and doubly linked lists, polynomial arithmetic.');
    insertUnit.run(dsSub.id, 3, 'Unit 3: Trees & Binary Search Trees', 'Tree terminology, traversal algorithms, BST operations, AVL trees, and B-trees.');
    insertUnit.run(dsSub.id, 4, 'Unit 4: Graphs & Shortest Paths', 'Graph representations, BFS, DFS, Dijkstra algorithm, Prim and Kruskal MST.');
    insertUnit.run(dsSub.id, 5, 'Unit 5: Searching, Sorting & Hashing', 'QuickSort, MergeSort, HeapSort, hash functions, collision resolution mechanisms.');
  }

  // Units for CS402 (Operating Systems)
  const osSub = db.prepare("SELECT id FROM subjects WHERE code = 'CS402'").get();
  if (osSub) {
    insertUnit.run(osSub.id, 1, 'Unit 1: OS Structures & Process Concept', 'System calls, kernel architecture, process states, PCB, and context switching.');
    insertUnit.run(osSub.id, 2, 'Unit 2: CPU Scheduling & Threads', 'FCFS, SJF, Round Robin, priority scheduling, and multithreading models.');
    insertUnit.run(osSub.id, 3, 'Unit 3: Process Synchronization & Deadlocks', 'Critical section, Peterson solution, semaphores, monitors, deadlock prevention and avoidance.');
    insertUnit.run(osSub.id, 4, 'Unit 4: Memory Management & Virtual Memory', 'Paging, segmentation, page fault handling, FIFO, LRU, Optimal page replacement.');
    insertUnit.run(osSub.id, 5, 'Unit 5: Storage & File System Implementation', 'Disk scheduling (SSTF, SCAN, LOOK), directory structures, and allocation methods.');
  }

  // Units for CS403 (DBMS)
  const dbmsSub = db.prepare("SELECT id FROM subjects WHERE code = 'CS403'").get();
  if (dbmsSub) {
    insertUnit.run(dbmsSub.id, 1, 'Unit 1: Database Architecture & ER Model', 'Three-schema architecture, entity-relationship diagrams, cardinalities, relational model.');
    insertUnit.run(dbmsSub.id, 2, 'Unit 2: Relational Algebra & SQL', 'Select, project, joins, aggregate queries, nested subqueries, and views.');
    insertUnit.run(dbmsSub.id, 3, 'Unit 3: Relational Database Design & Normalization', 'Functional dependencies, 1NF, 2NF, 3NF, BCNF, lossless join decomposition.');
    insertUnit.run(dbmsSub.id, 4, 'Unit 4: Transaction Processing & Concurrency', 'ACID properties, serializability, two-phase locking (2PL), deadlock handling.');
    insertUnit.run(dbmsSub.id, 5, 'Unit 5: Storage Organization & Indexing', 'B-trees, B+ trees, hash indexes, and query processing cost estimation.');
  }

  // Units for CS501 (Computer Networks)
  const cnSub = db.prepare("SELECT id FROM subjects WHERE code = 'CS501'").get();
  if (cnSub) {
    insertUnit.run(cnSub.id, 1, 'Unit 1: Overview & Physical Layer', 'Network topologies, transmission media, circuit vs packet switching, Shannon capacity.');
    insertUnit.run(cnSub.id, 2, 'Unit 2: Data Link Layer & MAC', 'Framing, CRC error detection, sliding window protocols (Go-Back-N, SR), CSMA/CD.');
    insertUnit.run(cnSub.id, 3, 'Unit 3: Network Layer & Addressing', 'IPv4, IPv6, CIDR subnetting, Distance Vector routing, Link State routing (OSPF).');
    insertUnit.run(cnSub.id, 4, 'Unit 4: Transport Layer', 'TCP connection establishment, flow control, congestion control algorithms, UDP sockets.');
    insertUnit.run(cnSub.id, 5, 'Unit 5: Application Layer Protocols', 'DNS resolution, HTTP/1.1 vs HTTP/2, SMTP, POP3, and socket programming basics.');
  }

  // Units for CS601 (Machine Learning)
  const mlSub = db.prepare("SELECT id FROM subjects WHERE code = 'CS601'").get();
  if (mlSub) {
    insertUnit.run(mlSub.id, 1, 'Unit 1: Supervised Learning & Regression', 'Linear regression, cost functions, gradient descent, polynomial regression, overfitting.');
    insertUnit.run(mlSub.id, 2, 'Unit 2: Classification Algorithms', 'Logistic regression, Decision Trees, Random Forests, Support Vector Machines (SVM).');
    insertUnit.run(mlSub.id, 3, 'Unit 3: Unsupervised Learning & Clustering', 'K-Means clustering, hierarchical clustering, Principal Component Analysis (PCA).');
    insertUnit.run(mlSub.id, 4, 'Unit 4: Neural Networks & Evaluation Metrics', 'Perceptron, backpropagation, precision, recall, F1-score, ROC-AUC curve.');
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

  // Create sample files in uploads directory
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const sampleFiles = [
    {
      fileName: 'ds_unit1_stacks_notes.pdf',
      content: '%PDF-1.4\n% GECWC Academics: Data Structures - Unit 1: Stacks, Queues and Recursion\nAuthor: Dr. A. K. Verma\nDepartment of Computer Science & Engineering, GEC West Champaran\nTopics: Array implementation of stack, push/pop operations, infix to postfix conversion, balanced parenthesis verification.'
    },
    {
      fileName: 'ds_unit2_linked_lists_handwritten.pdf',
      content: '%PDF-1.4\n% GECWC Academics: Unit 2 Linked Lists Complete Handwritten Guide\nAuthor: Priya Sharma (CSE 3rd Sem)\nVerified by: Faculty of CSE, GECWC\nCovers Singly Linked List, Doubly Linked List, Circular Linked List insertion, deletion and reverse pointers.'
    },
    {
      fileName: 'os_unit3_deadlocks_concurrency.pdf',
      content: '%PDF-1.4\n% GECWC Academics: Operating Systems - Unit 3 Process Synchronization & Deadlocks\nAuthor: Aman Kumar (CSE 5th Sem)\nDetailed explanations of Banker\'s Algorithm, Peterson Solution, Mutex Locks and Semaphores.'
    },
    {
      fileName: 'dbms_unit2_sql_relational_algebra.pdf',
      content: '%PDF-1.4\n% GECWC Academics: DBMS Unit 2 SQL & Relational Algebra Cheat Sheet\nAuthor: Dr. A. K. Verma\nContains comprehensive SQL queries, Joins (Inner, Left, Right, Full), Group By, Having, and Tuple Relational Calculus.'
    },
    {
      fileName: 'cn_unit3_ip_addressing_subnetting.pdf',
      content: '%PDF-1.4\n% GECWC Academics: Computer Networks - Unit 3 IP Addressing and VLSM Subnetting\nAuthor: Aman Kumar\nStep-by-step numerical problems solved for FLSM and VLSM, routing table lookups and CIDR prefix calculations.'
    },
    {
      fileName: 'ml_unit1_gradient_descent_slides.pptx',
      content: 'PK\x03\x04 PPTX Mock Binary - Machine Learning Unit 1 Gradient Descent and Cost Functions Lecture Presentation - GECWC CSE Dept.'
    }
  ];

  sampleFiles.forEach(f => {
    const fullPath = path.join(uploadsDir, f.fileName);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, f.content, 'utf8');
    }
  });

  // 6. Seed Notes
  const insertNote = db.prepare(`
    INSERT INTO notes (
      title, semester_id, subject_id, unit_id, topic, description,
      resource_type, file_url, file_name, file_type, file_size,
      uploaded_by, uploader_name, status, rejection_reason, rejection_details,
      reviewed_by, reviewed_at, views_count, downloads_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const u1 = db.prepare("SELECT id, subject_id FROM units WHERE title LIKE 'Unit 1: Introduction, Arrays & Stacks'").get();
  const u2 = db.prepare("SELECT id, subject_id FROM units WHERE title LIKE 'Unit 2: Queues & Linked Lists'").get();
  const uOs3 = db.prepare("SELECT id, subject_id FROM units WHERE title LIKE 'Unit 3: Process Synchronization & Deadlocks'").get();
  const uDb2 = db.prepare("SELECT id, subject_id FROM units WHERE title LIKE 'Unit 2: Relational Algebra & SQL'").get();
  const uCn3 = db.prepare("SELECT id, subject_id FROM units WHERE title LIKE 'Unit 3: Network Layer & Addressing'").get();
  const uMl1 = db.prepare("SELECT id, subject_id FROM units WHERE title LIKE 'Unit 1: Supervised Learning & Regression'").get();

  // Approved Notes
  if (u1) {
    insertNote.run(
      'Stack Data Structure & Polish Notation Notes',
      3, u1.subject_id, u1.id,
      'Stacks and Expression Evaluation',
      'Comprehensive lecture notes covering array & linked representations of stack, prefix/postfix conversions, and recursion evaluation.',
      'Handwritten Notes',
      '/uploads/ds_unit1_stacks_notes.pdf',
      'ds_unit1_stacks_notes.pdf',
      'PDF',
      2457600, // 2.4 MB
      4, 'Priya Sharma', // uploaded by Priya
      'approved', null, null,
      1, '2026-09-15 10:30:00',
      342, 128, '2026-09-14 14:00:00'
    );
  }

  if (u2) {
    insertNote.run(
      'Complete Linked Lists Implementation Guide & Diagrams',
      3, u2.subject_id, u2.id,
      'Singly, Doubly & Circular Linked Lists',
      'Neatly drawn memory diagrams, step-by-step pointer manipulation algorithms, and corner-case error avoidance for CSE Semester 3.',
      'Handwritten Notes',
      '/uploads/ds_unit2_linked_lists_handwritten.pdf',
      'ds_unit2_linked_lists_handwritten.pdf',
      'PDF',
      3840000,
      4, 'Priya Sharma',
      'approved', null, null,
      2, '2026-09-18 11:20:00',
      512, 289, '2026-09-17 09:15:00'
    );
  }

  if (uOs3) {
    insertNote.run(
      'Operating Systems Deadlock Handling & Banker Algorithm',
      4, uOs3.subject_id, uOs3.id,
      'Deadlocks, Semaphores & Mutex',
      'Detailed exam-oriented guide with solved numericals on Banker\'s algorithm, resource allocation graphs, and critical section solutions.',
      'Handwritten Notes',
      '/uploads/os_unit3_deadlocks_concurrency.pdf',
      'os_unit3_deadlocks_concurrency.pdf',
      'PDF',
      1980000,
      3, 'Aman Kumar',
      'approved', null, null,
      1, '2026-09-20 16:45:00',
      620, 310, '2026-09-19 12:30:00'
    );
  }

  if (uDb2) {
    insertNote.run(
      'SQL Queries & Relational Algebra Quick Revision Cheatsheet',
      4, uDb2.subject_id, uDb2.id,
      'Relational Algebra, Joins & Nested Queries',
      'Handcrafted reference sheet covering projection, selection, cartesian product, Theta join, Natural join, and advanced SQL aggregate functions.',
      'Formula Sheet / Cheatsheet',
      '/uploads/dbms_unit2_sql_relational_algebra.pdf',
      'dbms_unit2_sql_relational_algebra.pdf',
      'PDF',
      1420000,
      1, 'Dr. A. K. Verma',
      'approved', null, null,
      1, '2026-09-22 09:00:00',
      840, 475, '2026-09-21 17:00:00'
    );
  }

  if (uCn3) {
    insertNote.run(
      'Subnetting, VLSM & IPv4 Routing Numerical Solver Sheet',
      5, uCn3.subject_id, uCn3.id,
      'IP Addressing & Subnet Calculation',
      'Standard AKU/BEU syllabus questions solved with step-by-step address breakdown, broadcast masks, and usable host calculations.',
      'Question Bank / PYQ',
      '/uploads/cn_unit3_ip_addressing_subnetting.pdf',
      'cn_unit3_ip_addressing_subnetting.pdf',
      'PDF',
      2150000,
      3, 'Aman Kumar',
      'approved', null, null,
      2, '2026-09-25 15:10:00',
      418, 192, '2026-09-24 18:40:00'
    );
  }

  // Pending Submissions for demonstration and moderator approval
  if (uMl1) {
    insertNote.run(
      'Gradient Descent Optimization & Cost Function Slides',
      6, uMl1.subject_id, uMl1.id,
      'Gradient Descent & Learning Rate Convergence',
      'Class presentation slides discussing Batch vs Stochastic Gradient Descent with mathematical loss curves.',
      'Lecture Slides / PPT',
      '/uploads/ml_unit1_gradient_descent_slides.pptx',
      'ml_unit1_gradient_descent_slides.pptx',
      'PPTX',
      5240000,
      5, 'Rahul Verma', // 7th sem student submitting
      'pending', null, null,
      null, null,
      0, 0, '2026-10-01 10:15:00'
    );
  }

  if (u1) {
    insertNote.run(
      'C++ STL Stack and Queue Competitive Programming Template',
      3, u1.subject_id, u1.id,
      'STL Containers & Monotonic Stacks',
      'C++ STL implementations with standard competitive programming templates and LeetCode/CodeChef practice questions.',
      'Handwritten Notes',
      '/uploads/ds_unit1_stacks_notes.pdf',
      'ds_unit1_stacks_notes.pdf',
      'PDF',
      1200000,
      4, 'Priya Sharma',
      'pending', null, null,
      null, null,
      0, 0, '2026-10-02 08:30:00'
    );
  }

  // Rejected Note for demonstration
  if (uOs3) {
    insertNote.run(
      'Random Chapter 4 Screenshots',
      4, uOs3.subject_id, uOs3.id,
      'Deadlock Photos',
      'Mobile camera photos of page 45-48, blurry resolution.',
      'Handwritten Notes',
      '/uploads/os_unit3_deadlocks_concurrency.pdf',
      'os_unit3_deadlocks_concurrency.pdf',
      'PDF',
      980000,
      3, 'Aman Kumar',
      'rejected', 'Poor/invalid file', 'The uploaded document contains blurry camera photos with unreadable text. Please scan using a proper scanner app and re-submit in PDF format.',
      2, '2026-09-28 14:15:00',
      0, 0, '2026-09-27 11:00:00'
    );
  }

  // 7. Seed Reports
  const insertReport = db.prepare(`
    INSERT INTO reports (note_id, reported_by, reporter_name, reason, details, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertReport.run(
    1,
    3, 'Aman Kumar',
    'Incorrect information',
    'Page 4 mentions Postfix precedence of unary minus as higher than parenthesis, which should be clarified as per standard AKU textbook.',
    'pending'
  );

  // 8. Seed Admin Activity Logs
  const insertLog = db.prepare(`
    INSERT INTO admin_activity_logs (user_id, user_name, role, action, target_type, target_id, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertLog.run(1, 'Shubh Kumar Jha', 'admin', 'APPROVE_NOTE', 'note', '1', 'Approved note: Stack Data Structure & Polish Notation Notes');
  insertLog.run(1, 'Shubh Kumar Jha', 'admin', 'APPROVE_NOTE', 'note', '2', 'Approved note: Complete Linked Lists Implementation Guide & Diagrams');
  insertLog.run(1, 'Shubh Kumar Jha', 'admin', 'APPROVE_NOTE', 'note', '3', 'Approved note: Operating Systems Deadlock Handling & Banker Algorithm');
  insertLog.run(1, 'Shubh Kumar Jha', 'admin', 'REJECT_NOTE', 'note', '8', 'Rejected note ID 8 due to Poor/invalid file: Camera photos unreadable');

  // 9. Seed Platform Settings
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
