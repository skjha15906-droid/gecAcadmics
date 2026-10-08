const { db } = require('./db');

console.log('--- Applying Official BEU CSE Semester-IV Syllabus (Session 2024-28 onwards) ---');

const sem4 = db.prepare('SELECT id FROM semesters WHERE sem_number = 4').get();
if (!sem4) {
  console.error('Semester 4 not found in database!');
  process.exit(1);
}
const sem4Id = sem4.id;

// Official Semester 4 Courses from BEU ADDA Scheme
const officialSem4Courses = [
  {
    code: '105401',
    name: 'Computer Organization and Architecture',
    description: 'Functional blocks, Von Neumann architecture, CPU organization, addressing modes, arithmetic algorithms (Booth\'s, division), memory hierarchy, cache mapping, virtual memory, pipelining and I/O organization (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Functional Blocks of a Computer & Data Representation',
        description: 'Von Neumann vs Harvard architecture, functional units, bus structures, register transfer language, bus and memory transfers, arithmetic logic shift unit (ALSU), data representation: fixed-point, signed numbers, IEEE 754 floating-point standard, instruction codes, computer registers, instruction cycle, timing and control.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Central Processing Unit & Control Unit Design',
        description: 'General register organization, stack organization, instruction formats (three-address, two-address, one-address, zero-address), addressing modes, RISC vs CISC architectures. Control unit organization: Hardwired control vs Microprogrammed control unit design, control memory, address sequencing, microinstruction format, microprogram sequencer.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Computer Arithmetic & ALU Design',
        description: 'Addition and subtraction with signed-magnitude data, Booth\'s multiplication algorithm for signed-2\'s complement numbers, array multiplier, division algorithms: restoring and non-restoring division, floating-point arithmetic operations, decimal arithmetic operations, BCD adder.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Memory System Design & Hierarchy',
        description: 'Memory hierarchy, main memory (SRAM and DRAM chips), ROM, auxiliary memory (magnetic disks, SSD), associative memory, cache memory: cache organization, mapping functions (direct, associative, set-associative), cache replacement policies (LRU, FIFO), write policies (write-through, write-back), cache coherence, virtual memory: address translation, paging, TLB, segmentation.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Input-Output Organization & Pipelining',
        description: 'Peripheral devices, I/O interface, asynchronous data transfer (strobe control, handshaking), modes of transfer: programmed I/O, interrupt-initiated I/O, Direct Memory Access (DMA) controller and transfer cycle. Priority interrupt and daisy chaining. Pipelining: arithmetic and instruction pipeline, pipeline hazards (data, structural, control), branch prediction, vector processing, superscalar processors. Textbooks: M. Morris Mano, William Stallings, Carl Hamacher, Hennessy & Patterson.'
      }
    ]
  },
  {
    code: '105402',
    name: 'Formal Language and Automata Theory',
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
    code: '105403',
    name: 'Design and Analysis of Algorithms',
    description: 'Asymptotic analysis, divide & conquer, greedy paradigm, dynamic programming, backtracking, branch & bound, string matching, NP-completeness and approximation algorithms (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Introduction, Complexity Analysis & Recurrences',
        description: 'Algorithm definition, specifications, space and time complexity, asymptotic notations: Big-O, Omega, Theta, Little-o, Little-omega. Recurrence relations and solutions: substitution method, recursion-tree method, Master theorem and Master theorem extensions. Amortized analysis: aggregate method, accounting method, potential method.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Divide-and-Conquer & Sorting Lower Bounds',
        description: 'Divide-and-conquer strategy, Binary Search, Merge Sort, Quick Sort (randomized quicksort, worst-case and average-case analysis), Strassen\'s matrix multiplication, Selection in linear time (Quickselect, Median-of-Medians). Comparison sort lower bounds (decision tree model), non-comparison linear sorts: Counting Sort, Radix Sort, Bucket Sort.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Greedy Algorithms & Dynamic Programming',
        description: 'Greedy strategy: Fractional Knapsack, Huffman coding, Activity selection problem, Minimum Spanning Trees (Kruskal\'s and Prim\'s algorithms), Single-source shortest path (Dijkstra\'s algorithm). Dynamic Programming: Principle of Optimality, Matrix Chain Multiplication, Longest Common Subsequence (LCS), 0/1 Knapsack, All-pairs shortest paths (Floyd-Warshall), Bellman-Ford algorithm, Travelling Salesperson Problem (TSP).'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Backtracking & Branch and Bound',
        description: 'Backtracking approach: state space tree search, N-Queens problem, Sum-of-subsets problem, Graph Coloring (m-colorability), Hamiltonian cycles. Branch-and-Bound approach: FIFO and LC branch-and-bound, 0/1 Knapsack problem using branch-and-bound, Travelling Salesperson Problem (TSP) using branch-and-bound.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: String Matching & Advanced Graph Algorithms',
        description: 'String matching: Naive string matching, Rabin-Karp algorithm, Knuth-Morris-Pratt (KMP) algorithm, Boyer-Moore algorithm. Graph algorithms: Biconnected components, Strongly Connected Components (Kosaraju\'s and Tarjan\'s algorithms), Topological sorting, Maximum Network Flow (Ford-Fulkerson algorithm, Max-Flow Min-Cut theorem).'
      },
      {
        unit_number: 6,
        title: 'Unit 6: Tractability & NP-Completeness',
        description: 'Tractable and intractable problems, polynomial-time verification, complexity classes P, NP, NP-Hard, and NP-Complete. Polynomial-time reductions, Cook\'s theorem, NP-completeness proofs for SAT, 3-SAT, Clique, Vertex Cover, Set Cover, Hamiltonian Cycle, and TSP. Introduction to approximation algorithms: Vertex Cover, Metric TSP. Textbooks: Cormen, Leiserson, Rivest, Stein (CLRS); Horowitz & Sahni; Kleinberg & Tardos.'
      }
    ]
  },
  {
    code: '105404',
    name: 'Database Management System',
    description: 'DBMS architecture, ER modeling, relational algebra, SQL, normalization (1NF-BCNF), ACID transactions, concurrency control protocols, indexing (B/B+ Trees), storage & recovery (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Introduction to DBMS & System Architecture',
        description: 'Database system concepts, file systems vs DBMS, characteristics and advantages of database approach, data models, schemas and instances. Three-schema architecture and data independence (logical and physical). DBMS component modules, database users, database administrator (DBA) roles, database languages: DDL, DML, DCL, TCL.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Data Modeling: ER & Relational Data Model',
        description: 'Entity-Relationship (ER) model: entities, attributes, relationships, key constraints, cardinality ratios, participation constraints, weak entities, ER diagrams. Enhanced ER (EER): specialization, generalization, aggregation. Relational model: relational concepts, integrity constraints (Entity, Referential, Key, Domain), mapping ER and EER schemas to relational tables.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Relational Algebra & Structured Query Language (SQL)',
        description: 'Relational algebra: selection, projection, union, set difference, Cartesian product, joins (natural, equi, theta, outer join), division. Relational calculus: TRC and DRC. SQL: schema definition, table creation, constraints, basic queries, complex nested queries, aggregate functions, GROUP BY, HAVING, set operations, joins, views, assertions, triggers, and transactions.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Relational Database Design & Normalization',
        description: 'Informal design guidelines, data redundancy, anomalies (insertion, deletion, update). Functional dependencies, inference rules (Armstrong\'s axioms), attribute closure, minimal cover. Normalization: 1NF, 2NF, 3NF, Boyce-Codd Normal Form (BCNF), multi-valued dependencies and 4NF, join dependencies and 5NF. Lossless join decomposition and dependency preservation.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Transaction Processing & Concurrency Control',
        description: 'Transaction concepts, ACID properties, transaction states, schedules: serial, non-serial, serializable schedules (conflict and view serializability), testing for serializability, recoverability. Concurrency control: Lock-based protocols (shared, exclusive locks), Two-Phase Locking (2PL), Strict 2PL, Timestamp ordering protocol, Validation-based protocols. Deadlock handling: prevention, detection, wait-for graphs, recovery.'
      },
      {
        unit_number: 6,
        title: 'Unit 6: Storage, Indexing & Database Recovery',
        description: 'Storage hierarchy, file organization (heap, sorted, hashed), RAID levels. Indexing: primary, clustering, secondary indices, dense vs sparse indices, multi-level indices, B-Trees and B+ Trees indexing, static and dynamic hashing. Recovery: failure classification, storage structures, log-based recovery (deferred/immediate update), checkpoints, shadow paging, ARIES algorithm. Overview of NoSQL databases. Textbooks: Silberschatz, Korth, Sudarshan; Elmasri & Navathe; Ramakrishnan & Gehrke.'
      }
    ]
  },
  {
    code: '105405',
    name: 'Effective Technical Communication',
    description: 'Technical document design, technical reports, grammar and editing, interpersonal skills, presentation delivery, professional ethics, corporate communication and job interviews (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Information Design and Development',
        description: 'Different kinds of technical documents, information development life cycle, organizational structures of technical documents, factors affecting information and document design, strategies for technical organization, information design checklist, characteristics of effective technical communication, audience analysis.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Technical Writing, Grammar and Editing',
        description: 'Technical writing process, forms of discourse, writing abstracts, summaries, executive summaries, technical proposals, research papers, project reports, instruction manuals and lab reports. Technical grammar: active vs passive voice, conciseness, precision, sentence variety, avoiding ambiguity and jargon. Editing, proofreading, and style manuals.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Self-Development and Interpersonal Skills',
        description: 'Emotional intelligence, empathy, interpersonal communication, teamwork and collaborative problem solving, leadership dynamics, assertiveness, conflict resolution, negotiation skills, time management, stress management in professional engineering environments.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Communication and Technical Presentation',
        description: 'Public speaking, audience analysis, structuring technical presentations, visual aids and slide design (PPT/multimedia), delivery techniques, body language, eye contact, voice modulation, managing Q&A sessions, overcoming stage fright. Group discussions (GD) dynamics, roles, and assessment.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Ethics, Business Communication & Cross-Cultural Aspects',
        description: 'Business correspondence: professional emails, memos, letters, circulars, meeting notices, agenda, minutes of meetings (MoM). Job application documents: Resume vs Curriculum Vitae (CV), cover letter, interview skills (technical and HR). Ethical issues in technical communication, intellectual property rights, plagiarism, confidentiality, cross-cultural communication in global engineering environments. Textbooks: David F. Beer & David McMurrey; Meenakshi Raman & Sangeeta Sharma; Andrea J. Rutherfoord.'
      }
    ]
  },
  {
    code: '105406',
    name: 'Computer Networks',
    description: 'OSI & TCP/IP models, physical transmission, data link protocols (ARQ, CSMA/CD, Ethernet), IPv4/IPv6 subnetting, routing protocols (OSPF, BGP), TCP/UDP transport, DNS, HTTP, SSL/TLS security (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Introduction to Computer Networks & Physical Layer',
        description: 'Data communication components, network topologies, network types (LAN, MAN, WAN), switching techniques: packet switching, circuit switching, message switching. Layered architecture: OSI 7-layer model, TCP/IP 4-layer model, comparison. Transmission media (twisted pair, coaxial, optical fiber, wireless), Shannon channel capacity, Nyquist bit rate, modulation and multiplexing (FDM, TDM, WDM).'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Data Link Layer & Medium Access Control (MAC)',
        description: 'Data link layer design issues, framing methods, error detection and correction (parity, checksum, CRC, Hamming codes). Flow and error control protocols: Stop-and-Wait, Go-Back-N ARQ, Selective Repeat ARQ, piggybacking, HDLC, PPP. Multiple Access protocols: ALOHA (pure and slotted), CSMA, CSMA/CD (Ethernet IEEE 802.3), CSMA/CA (Wi-Fi IEEE 802.11). MAC addressing, bridges, switches, collision and broadcast domains.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Network Layer & IP Addressing',
        description: 'Network layer services, virtual circuits and datagram subnets. Routing algorithms: Shortest Path (Dijkstra), Distance Vector Routing (Bellman-Ford, count-to-infinity problem), Link State Routing (OSPF), hierarchical routing, BGP. Congestion control algorithms (leaky bucket, token bucket). IPv4 addressing, classful vs CIDR classless addressing, subnetting, supernetting, IPv4 header format, NAT, ARP, RARP, ICMP, DHCP. Introduction to IPv6 and migration.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Transport Layer Protocols',
        description: 'Transport layer services, port numbers and socket addressing, multiplexing and demultiplexing. Connectionless transport: UDP protocol, UDP header, applications. Connection-oriented transport: TCP protocol, TCP segment structure, 3-way handshake connection establishment and graceful termination, flow control (sliding window), error control. TCP congestion control: slow start, congestion avoidance, fast retransmit, fast recovery (AIMD).'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Application Layer Protocols & Network Security Basics',
        description: 'Principles of network applications, client-server and P2P architectures. Domain Name System (DNS), Email architecture and protocols (SMTP, POP3, IMAP), World Wide Web (HTTP/1.1, HTTP/2, HTTPS), File Transfer Protocol (FTP), SSH, Telnet. Network security fundamentals: symmetric and asymmetric cryptography, digital signatures, SSL/TLS handshake, firewalls, IPsec basics. Textbooks: Tanenbaum & Wetherall; Kurose & Ross; Forouzan; Stallings.'
      }
    ]
  },
  {
    code: '105401P',
    name: 'Computer Organization and Architecture Lab',
    description: 'Practical experiments in logic simulation, arithmetic circuits, Booth\'s algorithm, 8086 assembly programming, and pipeline hazard detection (Credits: 1 | ESE: 30, IA: 20 | L:0, T:0, P:2)',
    units: [
      {
        unit_number: 1,
        title: 'Practical Experiments: COA Simulation & Assembly Programming',
        description: 'List of practical experiments: 1. Simulation of basic and universal logic gates using digital simulator / Logisim. 2. Design and simulation of 4-bit Ripple Carry Adder and Subtractor. 3. Simulation of 4-bit Arithmetic Logic Unit (ALU). 4. Implementation of Booth\'s Multiplication Algorithm for signed binary numbers. 5. Implementation of Restoring and Non-Restoring Division Algorithms. 6. Simulation of memory hierarchy and cache mapping (direct, associative, set-associative). 7. Design and simulation of Instruction Cycle and Microprogrammed Control Unit. 8. 8086 Assembly Language Programming: Data transfer, arithmetic and logical operations. 9. 8086 Assembly Programs for array search, bubble sorting, and block data transfer. 10. Simulation of 4-stage instruction pipeline execution and hazard detection.'
      }
    ]
  },
  {
    code: '105403P',
    name: 'Design and Analysis of Algorithms Lab',
    description: 'Hands-on implementation of sorting algorithms, divide & conquer, greedy strategies, dynamic programming, backtracking, and string matching (Credits: 1 | ESE: 30, IA: 20 | L:0, T:0, P:2)',
    units: [
      {
        unit_number: 1,
        title: 'Practical Experiments: Algorithm Implementation & Time Complexity Analysis',
        description: 'List of practical experiments (C / C++ / Python): 1. Implementation and execution time comparison of Merge Sort and Quick Sort across random/sorted inputs. 2. Implementation of Strassen\'s Matrix Multiplication algorithm vs standard matrix multiplication. 3. Implementation of Fractional Knapsack Problem using Greedy strategy. 4. Implementation of Prim\'s and Kruskal\'s algorithms for Minimum Spanning Trees (MST). 5. Implementation of Dijkstra\'s algorithm for single-source shortest paths. 6. Implementation of 0/1 Knapsack Problem using Dynamic Programming. 7. Implementation of Longest Common Subsequence (LCS) using Dynamic Programming. 8. Implementation of Floyd-Warshall Algorithm for all-pairs shortest paths. 9. Implementation of N-Queens problem using Backtracking. 10. Implementation of KMP and Rabin-Karp String Matching algorithms.'
      }
    ]
  },
  {
    code: '105404P',
    name: 'Database Management System Lab',
    description: 'Hands-on practice in SQL DDL/DML, complex joins, nested queries, views, PL/SQL procedures, functions, triggers, and cursors (Credits: 1 | ESE: 30, IA: 20 | L:0, T:0, P:2)',
    units: [
      {
        unit_number: 1,
        title: 'Practical Experiments: SQL, PL/SQL & Relational Database Design',
        description: 'List of practical experiments (PostgreSQL / MySQL / Oracle): 1. Database and table creation with primary key, foreign key, unique, check, and not null constraints using DDL. 2. Data manipulation (INSERT, UPDATE, DELETE) and query execution with WHERE, ORDER BY, GROUP BY, HAVING, LIKE. 3. Implementation of nested subqueries, correlated queries, and scalar subqueries. 4. Implementation of INNER, LEFT, RIGHT, FULL OUTER, and NATURAL JOIN operations. 5. Creation and management of Views, Sequences, and Indexes. 6. Writing PL/SQL blocks with conditional statements, loops, and exception handling. 7. Creation of PL/SQL Stored Procedures and Functions with IN/OUT parameters. 8. Creation of Database Triggers (BEFORE/AFTER triggers for audit logging and constraint checking). 9. Database Cursors (Implicit and Explicit cursors, Cursor FOR loops). 10. Mini-Project: Conceptual schema design (ER model), relational mapping, normalization to 3NF/BCNF, and application integration.'
      }
    ]
  },
  {
    code: '105406P',
    name: 'Computer Networks Lab',
    description: 'Hands-on experiments with network tools, Wireshark packet capture, error detection CRC, Cisco Packet Tracer topology setup, routing, and socket programming (Credits: 1 | ESE: 30, IA: 20 | L:0, T:0, P:2)',
    units: [
      {
        unit_number: 1,
        title: 'Practical Experiments: Packet Sniffing, Network Simulation & Socket Programming',
        description: 'List of practical experiments: 1. Study of network hardware components (RJ45, CAT6 cables, crimping tool, switches, routers) and network commands (ping, traceroute, netstat, arp, ipconfig/ifconfig, nslookup). 2. Packet capture and protocol analysis of ARP, ICMP, DNS, TCP, and HTTP using Wireshark. 3. Implementation of bit stuffing, character stuffing, and CRC error detection algorithms. 4. Simulation of Stop-and-Wait and Sliding Window protocols (Go-Back-N, Selective Repeat). 5. Network topology creation and configuration using Cisco Packet Tracer (LAN setup, static IP configuration, switch and router setup). 6. Configuration of DHCP, DNS, and HTTP servers in Cisco Packet Tracer. 7. Configuration of RIP and OSPF routing protocols on routers in Cisco Packet Tracer. 8. Implementation of iterative and concurrent TCP Echo Server and Client using Socket Programming in C/Python/Java. 9. Implementation of UDP Client-Server chat application using Sockets. 10. Simulation of Congestion Control algorithms (Leaky Bucket, Token Bucket).'
      }
    ]
  },
  {
    code: '105407',
    name: 'NPTEL-I (Open Course)',
    description: '12-Week approved NPTEL / SWAYAM MOOC certification course in emerging CSE / Interdisciplinary domains (Credits: 3 | ESE: 70, IA: 30 | 12 Weeks)',
    units: [
      {
        unit_number: 1,
        title: 'Course Framework, Registration & Evaluation Guidelines',
        description: 'BEU and AICTE guidelines for NPTEL/SWAYAM credit transfer. Selection of approved 12-week NPTEL courses (e.g., Cloud Computing, Blockchain Architecture and Applications, Deep Learning, Internet of Things, Social Networks, Soft Skills). Submission of weekly assignments (internal assessment: 30 marks) and final NPTEL proctored examination / End Semester Examination (70 marks).'
      }
    ]
  }
];

const transaction = db.transaction(() => {
  // 1. Delete existing units for Sem 4 subjects
  const existingSem4Subs = db.prepare('SELECT id FROM subjects WHERE semester_id = ?').all(sem4Id);
  const deleteUnitStmt = db.prepare('DELETE FROM units WHERE subject_id = ?');
  for (const sub of existingSem4Subs) {
    deleteUnitStmt.run(sub.id);
  }

  // 2. Delete existing Sem 4 subjects
  db.prepare('DELETE FROM subjects WHERE semester_id = ?').run(sem4Id);

  // 3. Insert official Sem 4 subjects & units
  const insertSub = db.prepare(`
    INSERT INTO subjects (semester_id, code, name, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  const insertUnit = db.prepare(`
    INSERT INTO units (subject_id, unit_number, title, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const course of officialSem4Courses) {
    const res = insertSub.run(sem4Id, course.code, course.name, course.description);
    const newSubjectId = res.lastInsertRowid;
    console.log(`[+] Added Subject: [${course.code}] ${course.name} (ID: ${newSubjectId})`);

    for (const unit of course.units) {
      insertUnit.run(newSubjectId, unit.unit_number, unit.title, unit.description);
    }
    console.log(`    -> Added ${course.units.length} unit(s) for ${course.code}`);
  }
});

transaction();
console.log('--- Successfully applied BEU Semester-IV syllabus to database! ---');
