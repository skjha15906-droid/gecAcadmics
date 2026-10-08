const { db } = require('./db');

console.log('--- Applying Official BEU CSE Semesters VI, VII, and VIII Syllabus from Official Scheme Images ---');

// Semester 6 Courses (Total 23 Credits)
const sem6Courses = [
  {
    code: '100602',
    name: 'Computer Networks',
    description: 'OSI & TCP/IP models, physical transmission, data link protocols (ARQ, CSMA/CD, Ethernet), IPv4/IPv6 subnetting, routing protocols (OSPF, BGP), TCP/UDP transport, DNS, HTTP, SSL/TLS security (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Introduction to Data Communications & Physical Layer',
        description: 'Data communication components, topologies, transmission modes, switching: circuit, packet, message. OSI vs TCP/IP layered architecture. Transmission media: guided and unguided. Shannon capacity, Nyquist bit rate, modulation and multiplexing (FDM, TDM, WDM).'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Data Link Layer & MAC Sublayer',
        description: 'Framing, error detection & correction: CRC, checksum, Hamming codes. Flow control: Stop-and-Wait, Go-Back-N, Selective Repeat ARQ. MAC protocols: ALOHA, CSMA, CSMA/CD (Ethernet IEEE 802.3), CSMA/CA (Wi-Fi 802.11). MAC addressing, bridges, switches.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Network Layer & IP Addressing',
        description: 'Virtual circuits & datagram networks. Routing algorithms: Dijkstra\'s shortest path, Distance Vector (Bellman-Ford), Link State (OSPF), BGP. IPv4 addressing, classful vs CIDR subnetting, NAT, ARP, RARP, ICMP, DHCP. IPv6 fundamentals and migration.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Transport Layer Protocols',
        description: 'Transport layer services, port numbers, sockets. UDP protocol and segment format. TCP: 3-way handshake connection management, flow control (sliding window), error control, congestion control algorithms (AIMD, slow start, fast retransmit/recovery).'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Application Layer Protocols & Network Security',
        description: 'Client-server architecture, DNS resolution, HTTP/1.1 vs HTTP/2, HTTPS, email protocols (SMTP, POP3, IMAP), FTP, SSH. Network security: cryptography (symmetric & asymmetric), digital signatures, SSL/TLS handshake, firewalls, IPsec basics. Textbooks: Tanenbaum; Kurose & Ross; Forouzan.'
      }
    ]
  },
  {
    code: '105601',
    name: 'Compiler Design',
    description: 'Lexical analysis (LEX), syntax analysis (LL, LR, LALR, YACC), syntax-directed translation, type systems, intermediate code generation, code optimization & machine code generation (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Introduction to Compilers & Lexical Analysis',
        description: 'Phases and passes of a compiler, compiler construction tools. Role of lexical analyzer, input buffering, specification and recognition of tokens. Regular expressions to Finite Automata, Thompson\'s construction, DFA minimization, LEX/FLEX lexical analyzer generator.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Syntax Analysis & Parsing Techniques',
        description: 'Role of parser, Context-Free Grammars, ambiguity. Top-down parsing: recursive descent, LL(1) grammars, FIRST and FOLLOW computation. Bottom-up parsing: shift-reduce, operator precedence, LR parsers: LR(0), SLR(1), Canonical LR(1), LALR(1) parsing tables, YACC/BISON parser generator.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Syntax-Directed Translation & Semantic Analysis',
        description: 'Syntax-Directed Definitions (SDD), S-attributed and L-attributed definitions, Syntax-Directed Translation (SDT) schemes, translation of expressions and control structures. Type systems, type expressions, type checking, type equivalence, overloading.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Intermediate Code Generation & Run-Time Environments',
        description: 'Intermediate languages: graphical representations, three-address code, quadruples, triples, indirect triples. Translation of assignments, boolean expressions, control flow. Run-time environments: storage organization, stack allocation, activation records, parameter passing mechanisms, symbol table management.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Code Optimization & Target Code Generation',
        description: 'Principal sources of optimization, basic blocks, flow graphs, DAG representation of basic blocks. Local vs Global optimization: common subexpression elimination, dead code elimination, copy propagation, loop optimization. Issues in design of target code generator, register allocation and assignment, peephole optimization. Textbooks: Aho, Lam, Sethi, Ullman (Dragon Book); Santanu Chattopadhyay.'
      }
    ]
  },
  {
    code: '105602',
    name: 'Machine Learning',
    description: 'Statistical learning, linear regression, logistic classification, decision trees, SVM, ensemble methods (Random Forest, XGBoost), clustering (K-Means), PCA & neural networks (Credits: 4 | ESE: 70, IA: 30 | L:3, T:1, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Introduction & Mathematical Foundations',
        description: 'Definition of learning, machine learning workflow, linear algebra and probability review. Types of learning: supervised, unsupervised, semi-supervised, reinforcement learning. Inductive bias, PAC learning, Occam\'s razor, training/validation/test splits, overfitting vs underfitting, bias-variance tradeoff.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Linear Models & Regression Techniques',
        description: 'Simple and multiple linear regression, cost function, Ordinary Least Squares (OLS), Gradient Descent (Batch, Mini-batch, Stochastic). Polynomial regression, regularization techniques: Ridge (L2), Lasso (L1), Elastic Net. Logistic regression for binary and multiclass classification, sigmoid function, cross-entropy loss.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Supervised Classification Algorithms',
        description: 'Decision trees: ID3, C4.5, CART, entropy, information gain, Gini impurity, tree pruning. Naive Bayes classifier, conditional probability, maximum likelihood estimation. Support Vector Machines (SVM): optimal hyperplanes, hard vs soft margin, kernel trick (linear, polynomial, RBF kernels). K-Nearest Neighbors (KNN).'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Ensemble Learning & Neural Networks',
        description: 'Ensemble methods: Bootstrap Aggregating (Bagging), Random Forests, out-of-bag error. Boosting algorithms: AdaBoost, Gradient Boosted Decision Trees (GBDT), XGBoost. Artificial Neural Networks: biological neuron, Perceptron model, Multi-Layer Perceptron (MLP), activation functions (ReLU, Sigmoid, Tanh), Backpropagation algorithm.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Unsupervised Learning & Dimensionality Reduction',
        description: 'Clustering algorithms: K-Means clustering, Elbow method, Hierarchical clustering (agglomerative, divisive, dendrograms), DBSCAN. Dimensionality reduction: curse of dimensionality, Principal Component Analysis (PCA), Linear Discriminant Analysis (LDA), t-SNE overview.'
      },
      {
        unit_number: 6,
        title: 'Unit 6: Model Evaluation Metrics & Modern Deep Learning',
        description: 'Performance metrics: confusion matrix, accuracy, precision, recall, F1-score, specificity, ROC curve, AUC-ROC. Cross-validation: K-fold, stratified K-fold. Introduction to deep learning architectures: Convolutional Neural Networks (CNN) for image tasks, Recurrent Neural Networks (RNN) for sequence data. Textbooks: Tom M. Mitchell; Stuart Russell & Peter Norvig; Christopher M. Bishop.'
      }
    ]
  },
  {
    code: '1056XX (PE-I)',
    name: 'Program Elective-I',
    description: 'Specialized CSE Elective Basket: Graph Theory / Digital Image Processing / Introduction to Java Programming / Signals and Systems (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Elective Foundation & Core Principles',
        description: 'Fundamental mathematical formulations, representations, system models, problem formulation and introductory theoretical paradigms of chosen elective track.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Analytical Techniques & Algorithms',
        description: 'Specialized algorithms, transformations, discrete structures, state representations, complexity characteristics, and algorithmic solutions.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Advanced Methods & Transformations',
        description: 'Advanced data models, spectral transformations, connectivity structures, traversal methods, or feature extraction techniques depending on selected elective.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Optimization, Design & Implementations',
        description: 'Algorithmic optimizations, architectural patterns, design patterns, computational trade-offs, and practical software frameworks.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Engineering Applications & Case Studies',
        description: 'Industrial implementations, case studies, benchmarking, integration with modern computing systems, and research trends.'
      }
    ]
  },
  {
    code: '1056XX (PE-II)',
    name: 'Program Elective-II',
    description: 'Specialized CSE Elective Basket: Cloud Computing / Information Theory & Coding / Advanced Algorithms / Computer Graphics (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Architectural Foundations & System Models',
        description: 'Distributed architecture, system abstractions, cloud models (IaaS, PaaS, SaaS) or information coding primitives, virtualization mechanisms.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Core Protocols, Processing & Algorithms',
        description: 'Communication protocols, distributed consensus, channel capacity, compression algorithms, rendering pipelines, or advanced algorithmic techniques.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Storage, Virtualization & Resource Management',
        description: 'Distributed storage, data centers, resource scheduling, load balancing, virtualization hypervisors, error-correcting codes, and security mechanisms.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Scalability, Fault Tolerance & Performance',
        description: 'High availability, fault tolerance, replication, consistency models, performance benchmarking, QoS parameters, and distributed coordination.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Industry Frameworks & Contemporary Deployments',
        description: 'Industrial cloud platforms (AWS, GCP, Azure), containerization (Docker, Kubernetes), serverless computing, and real-world deployment case studies.'
      }
    ]
  },
  {
    code: '105601P',
    name: 'Compiler Design Lab',
    description: 'Hands-on compiler construction with LEX/FLEX, YACC/BISON, LL/LR parsing tables, and intermediate code generation (Credits: 2 | ESE: 30, IA: 20 | L:0, T:0, P:4)',
    units: [
      {
        unit_number: 1,
        title: 'Practical Experiments: Lexical Analysis, Parsing & Intermediate Code',
        description: 'List of practical experiments: 1. Implementation of Lexical Analyzer in C/C++ to identify tokens. 2. Implementation of Lexical Analyzer using LEX/FLEX tool. 3. Implementation of Recursive Descent Parser for arithmetic expressions. 4. Implementation of LL(1) Parsing Table generator and predictive parser. 5. Implementation of Shift-Reduce parser. 6. Implementation of Calculator and syntax validator using YACC/BISON. 7. Construction of Syntax Tree and DAG for expressions. 8. Implementation of Three-Address Code (TAC) generator. 9. Implementation of basic block code optimization pass. 10. Mini-Project: Complete mini-compiler front-end with symbol table integration.'
      }
    ]
  },
  {
    code: '100602P',
    name: 'Computer Networks Lab',
    description: 'Hands-on network experiments with packet sniffers (Wireshark), socket programming in C/Python, and Cisco Packet Tracer network simulation (Credits: 2 | ESE: 30, IA: 20 | L:0, T:0, P:4)',
    units: [
      {
        unit_number: 1,
        title: 'Practical Experiments: Packet Sniffing, Socket Programming & Network Simulation',
        description: 'List of practical experiments: 1. Network cable crimping (straight/cross) and network CLI utilities (ping, tracert, arp, netstat). 2. Wireshark packet capture & protocol header inspection (ARP, ICMP, DNS, TCP, HTTP). 3. Implementation of CRC error detection and Bit/Byte stuffing algorithms. 4. Simulation of Sliding Window protocols (Go-Back-N, Selective Repeat). 5. Cisco Packet Tracer: LAN design, subnetting, DHCP and DNS server setup. 6. Cisco Packet Tracer: Router configuration with RIP and OSPF. 7. TCP iterative and concurrent client-server socket programming in C/Python. 8. UDP client-server socket programming. 9. Implementation of Leaky Bucket / Token Bucket congestion control. 10. Mini-Project: Multi-client chat server using sockets.'
      }
    ]
  },
  {
    code: '105620P',
    name: 'Python Programming Lab',
    description: 'Hands-on Python programming covering core syntax, data structures, OOP, file handling, NumPy, Pandas, and Scikit-learn (Credits: 1 | ESE: 30, IA: 20 | L:0, T:0, P:2)',
    units: [
      {
        unit_number: 1,
        title: 'Practical Experiments: Python Fundamentals, Data Science & ML Libraries',
        description: 'List of practical experiments: 1. Python syntax, control structures, functions, lambda expressions. 2. Built-in data structures: Lists, Tuples, Sets, Dictionaries and comprehension. 3. Object-Oriented Programming in Python: Classes, inheritance, polymorphism, encapsulation. 4. File handling, exception handling, and custom modules. 5. Numerical computing with NumPy: Array operations, indexing, linear algebra. 6. Data manipulation with Pandas: Series, DataFrames, data cleaning, filtering. 7. Data visualization with Matplotlib and Seaborn: Plots, histograms, heatmaps. 8. Supervised ML modeling with Scikit-learn: Linear/Logistic Regression. 9. Classification modeling with Decision Trees and Random Forests on real datasets. 10. Mini-Project: End-to-end data analysis and machine learning pipeline.'
      }
    ]
  },
  {
    code: '100604P',
    name: 'NPTEL Courses-2',
    description: 'Approved 8-Week / 12-Week NPTEL / SWAYAM advanced certification course in CSE domains with assignment and proctored exam assessment (Credits: 2 | ESE: 30, IA: 20 | L:0, T:0, P:4)',
    units: [
      {
        unit_number: 1,
        title: 'NPTEL MOOC Certification Course - 2 Guidelines',
        description: 'Course Guidelines: 1. Registration in approved advanced NPTEL/SWAYAM online courses. 2. Weekly assignment submissions (Internal Assessment: 20 marks). 3. End-term proctored examination (End Semester Exam: 30 marks). 4. Credit transfer processing upon submission of official NPTEL certificate and grade card.'
      }
    ]
  }
];

// Semester 7 Courses (Total 27 Credits)
const sem7Courses = [
  {
    code: '100708',
    name: 'Biology for Engineers',
    description: 'Cell biology, biomolecules, genetics, information transfer (DNA, RNA, proteins), enzymes, metabolism, bio-mechanics, biosensors & engineering applications (Credits: 3 | ESE: 70, IA: 30 | L:2, T:1, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Introduction to Biology & Macromolecules',
        description: 'Biological perspective in engineering, classification of life (five-kingdom and three-domain), cellular architecture: prokaryotes vs eukaryotes, cell organelles. Biomolecules: Carbohydrates, lipids, proteins, nucleic acids. Hierarchical structure of proteins (primary, secondary, tertiary, quaternary).'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Genetics & Molecular Information Transfer',
        description: 'Mendel\'s laws of inheritance, gene concept, DNA structure (Watson-Crick model), DNA replication, Central Dogma of molecular biology. Transcription, RNA processing, genetic code, Translation (protein synthesis), mutations and genetic disorders.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Enzymes & Bioenergetics',
        description: 'Enzyme classification, mechanism of enzyme action, active site, lock-and-key and induced-fit models. Enzyme kinetics (Michaelis-Menten equation), factors affecting enzyme activity, enzyme inhibition. Bioenergetics: cellular respiration, glycolysis, TCA cycle, oxidative phosphorylation, ATP generation.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Microbiology, Immunology & Biosystems',
        description: 'Microbial diversity: bacteria, viruses, fungi. Growth kinetics of microorganisms. Immune system: innate vs adaptive immunity, antigens, antibodies, antigen-antibody interactions, vaccines. Biological membranes, transport mechanisms, bio-sensors, and neural transmission.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Engineering Applications of Biology',
        description: 'Bio-inspired engineering and biomimicry (sonar, lotus effect, artificial organs). Bioinformatics: sequence alignment (BLAST), computational biology tools. Recombinant DNA technology, CRISPR-Cas9 gene editing, bio-materials, tissue engineering, and bio-nanotechnology. Textbooks: Arthur T. Johnson, Biology for Engineers; Campbell Biology.'
      }
    ]
  },
  {
    code: '100702',
    name: 'Open Elective- I',
    description: 'Interdisciplinary Elective: Human Resource Management / Industrial Engineering / Environmental Pollution & Control / Cyber Law (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Foundations & Organizational Frameworks',
        description: 'Concepts, principles, organizational design, legal frameworks, regulatory compliance, and interdisciplinary engineering interfaces.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Methodologies, Planning & Analysis',
        description: 'System planning, resource optimization, operational workflows, risk assessment methodologies, and strategic forecasting.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Implementation Strategies & Quantitative Models',
        description: 'Process optimization, quantitative modeling, technology deployment, human capital metrics, and operational performance measurement.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Evaluation, Quality & Sustainability',
        description: 'Standards compliance, total quality management, environmental impact, cost-benefit analysis, sustainability practices, and governance.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Case Studies, Ethics & Future Horizons',
        description: 'Contemporary industrial case studies, ethical and legal dimensions, digital transformation, and global management paradigms.'
      }
    ]
  },
  {
    code: '100703',
    name: 'Open Elective- II',
    description: 'Interdisciplinary Elective: Internet of Things / Renewable Energy Systems / Operations Research / Engineering Economics (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Architectural Foundations & Physical Principles',
        description: 'Physical principles, hardware interfaces, sensors and actuators, architectural models, economic and technological fundamentals.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Networking Protocols & Optimization Methods',
        description: 'Communication protocols, wireless standards, linear programming, optimization formulations, network routing, and data interchange.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Computational Processing & System Integration',
        description: 'Data aggregation, embedded processing, simulation modeling, financial mathematics, energy conversion systems, and edge devices.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Security, Scalability & System Analytics',
        description: 'System security, vulnerability evaluation, cost analysis, scalability paradigms, lifecycle costing, and diagnostic analytics.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Real-World Applications & Emerging Trends',
        description: 'Smart campus systems, energy grid management, economic decision making, smart cities, and industrial deployments.'
      }
    ]
  },
  {
    code: '105701',
    name: 'Program Elective- III',
    description: 'Specialized CSE Elective: Cryptography & Network Security / Natural Language Processing / Mobile Computing / Big Data Analytics (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Core Mathematical Models & Foundations',
        description: 'Number theory / linguistic foundations / mobile wireless architectures / big data distributed models, core theoretical frameworks.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Classical & Modern Algorithmic Techniques',
        description: 'Symmetric/asymmetric algorithms, syntactic parsing, cellular protocols (4G/5G), MapReduce programming, distributed computing models.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Advanced Architectures & Frameworks',
        description: 'Key exchange, digital signatures, deep learning NLP (Transformers), mobile ad-hoc networks, Hadoop & Apache Spark architecture.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Optimization, Security & Distributed Processing',
        description: 'Cryptographic attacks, language modeling, mobile security & routing, streaming data pipelines (Kafka), distributed NoSQL databases.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Real-World Engineering Applications & Deployment',
        description: 'Zero-knowledge proofs, LLMs & chat applications, IoT edge mobility, real-time analytics dashboards, and production case studies.'
      }
    ]
  },
  {
    code: '100701',
    name: 'Induction Program',
    description: 'Mandatory Non-Credit Student Induction & Value Orientation: Universal human values, creative arts, physical activities, mentoring & ethics (Credits: 0 | Mandatory Non-Credit | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Universal Human Values, Professional Ethics & Life Skills',
        description: 'Induction Program Modules: 1. Universal Human Values and Self-Exploration. 2. Creative and Performing Arts. 3. Physical Activities, Sports, and Yoga. 4. Literary activities and communication development. 5. Proficiency modules in engineering tools. 6. Mentoring, societal visits, social work, and campus familiarization.'
      }
    ]
  },
  {
    code: '105702P',
    name: 'Project- I',
    description: 'Capstone Major Project Phase-I: Problem formulation, literature survey, requirements analysis, architectural design, prototype implementation & synopsis viva (Credits: 6 | ESE: 60, IA: 40 | L:0, T:0, P:12)',
    units: [
      {
        unit_number: 1,
        title: 'Major Project Phase-I: Formulation, Design & Prototype',
        description: 'Project Guidelines: 1. Identification of real-world research or industry problem in CSE. 2. Extensive literature survey of IEEE/ACM journals. 3. Software Requirements Specification (SRS) and system architecture design. 4. Methodology definition, technology stack selection, and database modeling. 5. Prototype implementation and proof-of-concept development. 6. Periodic progress reviews before project review committee. 7. Submission of Phase-I synopsis and comprehensive project report. 8. End-semester demonstration and viva-voce.'
      }
    ]
  },
  {
    code: '100710P',
    name: 'Summer Entrepreneurship- III',
    description: '8-Week intensive industry internship / entrepreneurship incubation between 6th and 7th sem, practical development, report submission & viva (Credits: 8 | ESE: 60, IA: 40 | PROJ)',
    units: [
      {
        unit_number: 1,
        title: '8-Week Industry Internship / Startup Incubation Training',
        description: 'Course Guidelines: 1. Completion of 8-week intensive industrial internship in registered tech firm, or incubation of an innovative tech startup between 6th and 7th semester. 2. Hands-on industry software development, process engineering, or venture execution. 3. Bi-weekly progress logbook endorsed by industry mentor. 4. Preparation of comprehensive training report with verified completion certificate. 5. Departmental presentation, prototype demonstration, and comprehensive viva-voce.'
      }
    ]
  },
  {
    code: '105703P',
    name: 'Professional Elective Lab- II',
    description: 'Hands-on practical experiments supporting Program Elective-III track (Network Security / NLP / Big Data / IoT) (Credits: 1 | ESE: 30, IA: 20 | L:0, T:0, P:2)',
    units: [
      {
        unit_number: 1,
        title: 'Practical Experiments: Track-Specific Engineering Implementations',
        description: 'List of practical experiments aligned with Program Elective-III: 1. Practical implementation of encryption/decryption (AES, RSA, ECC). 2. Hash generation and digital signature verification. 3. NLP text preprocessing, tokenization, stemming, lemmatization with NLTK/Spacy. 4. Sentiment analysis and text classification using Scikit-learn/PyTorch. 5. Big Data MapReduce programs on Hadoop cluster. 6. Data transformation and analytics queries using Apache Spark. 7. Mobile app development with Android/Flutter or IoT sensor data streaming with MQTT. 8. End-to-end elective lab project execution and demonstration.'
      }
    ]
  }
];

// Semester 8 Courses (Total 18 Credits)
const sem8Courses = [
  {
    code: '100801',
    name: 'Open Elective- III',
    description: 'Interdisciplinary Elective: Total Quality Management / Project Management / Disaster Management / Blockchain & FinTech (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Principles, Standards & Management Frameworks',
        description: 'Core concepts of quality, project planning, disaster phases, or blockchain distributed ledger foundations.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Tools, Methodologies & Quantitative Controls',
        description: 'Six Sigma tools, CPM/PERT scheduling, risk hazard assessment, consensus algorithms (PoW, PoS), and smart contracts.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Implementation, Governance & Life Cycle Models',
        description: 'TQM implementation, resource leveling, emergency management systems, decentralized applications (DApps), and regulatory policies.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Quality Audits, Risk Mitigation & Security',
        description: 'ISO 9000 audits, earned value management (EVM), disaster recovery plans, cryptographic security in blockchain.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Case Studies, Ethics & Emerging Horizons',
        description: 'Benchmarking, industry project failures and success stories, climate resilience, DeFi innovations, and corporate governance.'
      }
    ]
  },
  {
    code: '100802',
    name: 'Open Elective- IV',
    description: 'Interdisciplinary Elective: Intellectual Property Rights / Entrepreneurship Development / Value Engineering / Smart Cities (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Legal & Strategic Foundations',
        description: 'Introduction to IPR (Patents, Copyrights, Trademarks), startup entrepreneurship ecosystems, value analysis concepts, smart city architectures.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Processes, Registration & Feasibility Analysis',
        description: 'Patent filing procedures, business plan preparation, FAST diagramming in value engineering, IoT urban sensing infrastructure.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Valuation, Financing & System Design',
        description: 'Commercialization of IP, venture capital & angel funding, cost-worth analysis, smart mobility, water and energy grid design.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Infringement, Governance & Sustainability',
        description: 'Patent litigation, startup exit strategies, creative problem solving, urban data privacy, sustainability and environmental resilience.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Global Perspectives & Contemporary Trends',
        description: 'WIPO & international treaties, government startup schemes (Startup India, Bihar Startup Policy), smart governance case studies.'
      }
    ]
  },
  {
    code: '105801',
    name: 'Program Elective- IV',
    description: 'Specialized CSE Elective: Deep Learning / Cloud Computing & DevOps / Cyber Forensics / Wireless Sensor Networks (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Advanced Theoretical Foundations',
        description: 'Deep neural networks (CNN, RNN, LSTM) / Cloud virtualization models / Digital evidence preservation / Sensor node architectures.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Architectural Patterns & Protocols',
        description: 'Transfer learning, CI/CD pipelines, container orchestration (Kubernetes), file system forensics, WSN routing protocols.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Implementation & Analysis Frameworks',
        description: 'PyTorch/TensorFlow implementations, Terraform IaC, memory forensics & network packet analysis, energy-efficient MAC protocols.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Optimization, Security & Scaling',
        description: 'Hyperparameter tuning, regularization, DevSecOps practices, anti-forensics counter-measures, WSN coverage and localization.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Production Case Studies & Emerging Frontiers',
        description: 'Generative AI (GANs, Diffusion models), serverless multi-cloud deployments, mobile forensics, IoT-WSN industrial applications.'
      }
    ]
  },
  {
    code: '105802',
    name: 'Program Elective- V',
    description: 'Specialized CSE Elective: Quantum Computing / Reinforcement Learning / Computer Vision / High-Performance Computing (Credits: 3 | ESE: 70, IA: 30 | L:3, T:0, P:0)',
    units: [
      {
        unit_number: 1,
        title: 'Unit 1: Foundational Paradigms & Mathematics',
        description: 'Qubits, quantum gates, superposition / Markov Decision Processes / Image formation & filtering / Parallel computing hardware.'
      },
      {
        unit_number: 2,
        title: 'Unit 2: Core Algorithmic Frameworks',
        description: 'Deutsch-Jozsa, Shor\'s & Grover\'s algorithms / Q-Learning, SARSA, Policy Gradients / Edge detection, feature matching (SIFT, ORB) / MPI & OpenMP.'
      },
      {
        unit_number: 3,
        title: 'Unit 3: Advanced Architectures & Models',
        description: 'Quantum circuits, error correction / Deep Q-Networks (DQN), Actor-Critic / Object detection (YOLO, Faster R-CNN) / GPU programming with CUDA.'
      },
      {
        unit_number: 4,
        title: 'Unit 4: Optimization & Computational Scaling',
        description: 'Noisy Intermediate-Scale Quantum (NISQ) systems / Model-based RL, reward engineering / Image segmentation, optical flow / Parallel algorithms for sorting & graphs.'
      },
      {
        unit_number: 5,
        title: 'Unit 5: Cutting-Edge Engineering Deployments',
        description: 'IBM Qiskit quantum algorithms / AlphaGo & autonomous robotics / Vision Transformers (ViT), 3D reconstruction / Supercomputing benchmarks.'
      }
    ]
  },
  {
    code: '105803P',
    name: 'Project- II',
    description: 'Capstone Major Project Phase-II: Full software/hardware system implementation, empirical testing, research publication draft, dissertation thesis & final viva-voce (Credits: 6 | ESE: 60, IA: 40 | L:0, T:0, P:12)',
    units: [
      {
        unit_number: 1,
        title: 'Major Project Phase-II: Implementation, Testing & Dissertation',
        description: 'Project Guidelines: 1. Full-scale system implementation based on Phase-I architecture design. 2. Comprehensive testing (Unit, Integration, Performance, Security testing) and benchmarking. 3. Deployment on cloud/server with live demonstration. 4. Drafting and submission of a quality research paper to UGC-CARE / Scopus / IEEE conference. 5. Preparation of final dissertation thesis following university formatting guidelines. 6. Project presentation and viva-voce before university external examination board.'
      }
    ]
  }
];

const transaction = db.transaction(() => {
  // Helper to update a semester
  const updateSemester = (semNumber, courses) => {
    const sem = db.prepare('SELECT id FROM semesters WHERE sem_number = ?').get(semNumber);
    if (!sem) {
      console.error(`Semester ${semNumber} not found!`);
      return;
    }
    const semId = sem.id;

    // 1. Delete existing units
    const existingSubs = db.prepare('SELECT id FROM subjects WHERE semester_id = ?').all(semId);
    const deleteUnitStmt = db.prepare('DELETE FROM units WHERE subject_id = ?');
    for (const sub of existingSubs) {
      deleteUnitStmt.run(sub.id);
    }

    // 2. Delete existing subjects
    db.prepare('DELETE FROM subjects WHERE semester_id = ?').run(semId);

    // 3. Insert new subjects and units
    const insertSub = db.prepare(`
      INSERT INTO subjects (semester_id, code, name, description, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);

    const insertUnit = db.prepare(`
      INSERT INTO units (subject_id, unit_number, title, description, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);

    console.log(`\n=== Migrating Semester ${semNumber} ===`);
    for (const course of courses) {
      const res = insertSub.run(semId, course.code, course.name, course.description);
      const newSubjectId = res.lastInsertRowid;
      console.log(`[+] Added Subject: [${course.code}] ${course.name} (ID: ${newSubjectId})`);

      for (const unit of course.units) {
        insertUnit.run(newSubjectId, unit.unit_number, unit.title, unit.description);
      }
      console.log(`    -> Added ${course.units.length} unit(s) for ${course.code}`);
    }
  };

  updateSemester(6, sem6Courses);
  updateSemester(7, sem7Courses);
  updateSemester(8, sem8Courses);
});

transaction();
console.log('\n--- Successfully applied BEU Semesters VI, VII, and VIII syllabus to database! ---');
