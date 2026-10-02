const { db } = require('./db');

console.log('--- Applying 100% Exact BEU Official Semester-II Syllabus from PDF (CSE) ---');

const sem2 = db.prepare('SELECT id FROM semesters WHERE sem_number = 2').get();
if (!sem2) {
  console.error('Semester 2 not found!');
  process.exit(1);
}
const sem2Id = sem2.id;

// Official Semester 2 Theory Courses from BEU PDF (Session 2024 onwards - B.Tech CSE)
const sem2Theory = [
  {
    code: '100215',
    name: 'Engineering Chemistry',
    description: 'Atomic and molecular structure, spectroscopy, electrochemistry and fuels, water chemistry, polymers and plastics, and organic reactions.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: Atomic and Molecular Structure',
        description: 'Electromagnetic radiations, Dual nature of electron and Heisenberg uncertainty Principle. Photoelectric effect, Planck\'s theory. Principles for combination of atomic orbitals to form MO diagram. Bent\'s rule, VSEPR theory, coordination numbers and geometries. Isomerism in transition metal compounds. Metal Carbonyls: Synthesis and Structure.'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: Spectroscopy',
        description: 'Principle of rotational and vibrational spectroscopy, selection rules for diatomic molecules, elementary idea of electronic spectroscopy, UV-VIS spectroscopy with rules and applications. Basic Principle of NMR spectroscopy with applications.'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: Electrochemistry and Fuels',
        description: 'Nernst equation, EMF and electrochemical cells, corrosion introduction, mechanism, types (water line, stress, pitting), Lead acid storage cell, Leclanche cell. Calorific value of fuels, proximate and ultimate analysis of coals, fuel cells, Bio fuels.'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Water Chemistry',
        description: 'Hardness of water, estimation by EDTA and Alkalinity method. Removal of hardness: soda lime process, zeolite process, Ion exchange process. Boiler problems: sludge and scale formation, priming and foaming, Boiler corrosion, Caustic embrittlement.'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: Polymer and Plastics',
        description: 'Polymerization techniques (free radical, ionic, coordination). Phenol-formaldehyde resins, elastomers, synthetic rubbers (Buna-S, Buna-N, neoprene). Inorganic polymers, Silicones, adhesives, epoxy resins. Thermoplastic vs thermosetting plastics. Polyethylene, PVC, Polystyrene.'
      },
      {
        unit_number: 6,
        title: 'Unit- 6.0: Organic Reactions and Synthesis of A Drug Molecule',
        description: 'Reaction intermediates and mechanisms: Substitution, addition, elimination, oxidation-reduction. Diels Alder cyclization and epoxide ring opening reactions, synthesis of commonly used drug molecules like aspirin.'
      }
    ]
  },
  {
    code: '100202',
    name: 'Engineering Mathematics-II',
    description: 'Complex analysis, ordinary differential equations, sequence and series, Laplace transform, and Fourier series.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: Complex Analysis – I',
        description: 'Functions of complex variable, limit, Continuity, Differentiability, Analytic function, Cauchy-Riemann Equations in Cartesian and polar form, harmonic function and harmonic conjugate.'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: Complex Analysis – II',
        description: 'Line Integral, contour integrals, Cauchy theorem, Cauchy’s Integral formula (without proof), Taylor\'s series, zero of analytic functions, singularities, Laurent’s series, residue, Cauchy residue theorem and applications.'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: Ordinary Differential Equations',
        description: 'Linear differential equations of nth Order with constant coefficients, solution of Homogeneous and Non-Homogeneous Equations, Equations with variable coefficients, Cauchy-Euler Equations, Method of Variation of Parameters.'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Sequence and Series',
        description: 'Introduction to Sequence and Series, Nature of series, Tests of convergence: Comparison test, D’Alembert ratio test, Cauchy’s Root test, Raabe’s test, Logarithmic test, Cauchy’s condensation test.'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: Laplace Transform',
        description: 'Laplace Transform, Existence theorem, properties, Laplace Transform of Periodic functions, Inverse Laplace Transform, convolution theorem. Application of Laplace Transform to solve ODEs.'
      },
      {
        unit_number: 6,
        title: 'Unit- 6.0: Fourier Series',
        description: 'Fourier Series, Fourier Series for odd and even functions, Half range sine and cosine series, Parseval’s theorem.'
      }
    ]
  },
  {
    code: '100216',
    name: 'Communicative English',
    description: 'Vocabulary building, basic writing skills, common errors, principles of appropriate writing, formal writing practices, and literary comprehension.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: Vocabulary Building',
        description: 'Nature of Word Formation; Root Word and Morpheme; Prefix and Suffix; Foreign Expressions in English; Synonym and Antonym; Homophone and Homograph; Abbreviation and Acronym.'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: Basic Writing Skills',
        description: 'Parts of Speech: Types of Words; Sentence Structures and Kinds; Phrase and Clause; Punctuation Marks; Capitalization; Tenses (Present, Past, Future); Active and Passive Voice; Question formation using Auxiliaries, Modals, Wh-Words.'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: Common Errors in English',
        description: 'Articles; Prepositions; Modifiers; Subject-Verb Agreement; Noun-Pronoun agreement; Redundancies; Cliches; Spelling Errors.'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Principles of Appropriate Writing',
        description: 'Defining: Describing, Classifying and Exemplifying; Introduction, Body, and Conclusion; References, Quotations and Illustrations; Paragraph organization; 7Cs of Professional Writing (Clear, Concise, Concrete, Correct, Coherent, Complete, Courteous).'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: Practices of Formal Writing',
        description: 'Formal Letters: Cover-Letter and Applications; Resume Writing; Report Writing; Minutes of Meeting; Memorandum; Notices; Essay Writing (Personal and Impersonal); Email Writing Etiquettes; Article Writing; Writing for Social Media.'
      },
      {
        unit_number: 6,
        title: 'Unit- 6.0: Comprehension of Written English',
        description: 'Of Studies (Essay) by Sir Francis Bacon; The Sun Rising (Poem) by John Donne; The Last Leaf (Story) by O Henry; Unseen/Untaught Passages.'
      }
    ]
  },
  {
    code: '100218',
    name: 'Python Programming',
    description: 'Python fundamentals, control flow & functions, strings, lists, dictionaries, tuples & sets, and file handling.',
    units: [
      {
        unit_number: 1,
        title: 'Module 1: Input and Output',
        description: 'Identifiers, Keywords, Statements and Expressions, Variables, Operators, Precedence and Associativity, Data Types, Indentation, Comments, Reading Input, Print Output, Type Conversions, type() Function and Is Operator, Dynamic and Strongly Typed Language.'
      },
      {
        unit_number: 2,
        title: 'Module 2: Control Flow statements, Function and Loops',
        description: 'Control Flow Statements: if, if-else, if-elif-else, Nested if; Built-In Functions, Commonly Used Modules, Function Definition and Calling, return Statement, void Functions, Scope and Lifetime of Variables, Default Parameters, while Loop, for Loop, continue, break.'
      },
      {
        unit_number: 3,
        title: 'Module 3: Strings',
        description: 'Creating and Storing Strings, Basic String Operations, Accessing Characters by Index, String Slicing and Joining, String Methods, Formatting Strings.'
      },
      {
        unit_number: 4,
        title: 'Module 4: Lists',
        description: 'Creating Lists, Basic List Operations, Indexing and Slicing in Lists, Built-In Functions Used on Lists, List Methods, The del Statement.'
      },
      {
        unit_number: 5,
        title: 'Module 5: Dictionaries, Tuples and Sets',
        description: 'Creating Dictionary, Accessing & Modifying key-value Pairs, Dictionary Methods; Tuples: Creating, Operations, Indexing/Slicing, Tuple Methods, zip() Function; Sets: Set Operations, Set Methods, Traversing, Frozen set.'
      },
      {
        unit_number: 6,
        title: 'Module 6: Files',
        description: 'Types of Files, Creating and Reading Text Data, File Methods to Read and Write Data, Reading and Writing Binary Files, The Pickle Module, Reading and Writing CSV Files, Python os and os.path Modules.'
      }
    ]
  },
  {
    code: '100219',
    name: 'Introduction to Web Design',
    description: 'Internet basics, HTML elements and forms, CSS styling and layouts, JavaScript scripting, control, and advanced event handling.',
    units: [
      {
        unit_number: 1,
        title: 'Unit- 1.0: Fundamentals of Internet and Web Technologies',
        description: 'Web Basics & Overview: Introduction to Internet, World Wide Web, History, Website, Homepage, Domain Name, Web Browsers and Web Servers, Client-Server Architecture, 3-Tier Architecture, Web hosting, URL, MIME, HTTP protocol, Web Programmer’s Toolbox.'
      },
      {
        unit_number: 2,
        title: 'Unit- 2.0: Introduction to HTML: Elements and Structure',
        description: 'Fundamentals of HTML elements, Document body, Tags, headings, paragraphs, hyperlinks, lists, tables, color coding, images, Div and Span Tags, character entities, URL Encoding, frames, framesets.'
      },
      {
        unit_number: 3,
        title: 'Unit- 3.0: HTML Forms and Multimedia Integration',
        description: 'HTML form, Form Elements, Form Attributes, HTML canvas, embedding audio and video in a webpage, HTML vs XHTML.'
      },
      {
        unit_number: 4,
        title: 'Unit- 4.0: Introduction to CSS: Styling and Layouts',
        description: 'Need for CSS, syntax and structure, External, Internal, Inline Styles, CSS Selectors, Colors, Backgrounds, Borders, Margins, Padding, Box Model, Text, Font, Tables, Buttons, CSS Display, Float & Clear, Overflow.'
      },
      {
        unit_number: 5,
        title: 'Unit- 5.0: JavaScript Basics: Scripting and Control',
        description: 'Introduction to Client-side Scripting, Need of JavaScript, Data types, variables, Operators, Operator Precedence, Type conversion; Conditionals (if-else, switch); Loops (for, while, do/while, break, continue).'
      },
      {
        unit_number: 6,
        title: 'Unit- 6.0: Advanced JavaScript: Objects and Events',
        description: 'Objects in JavaScript (array, number, string, Boolean); event handling (onclick, onsubmit); error handling; JavaScript scope; responsive modal forms; form validation.'
      }
    ]
  }
];

// Official Semester 2 Practical Labs from BEU PDF
const sem2Labs = [
  {
    code: '100215P',
    name: 'Engineering Chemistry Lab',
    description: 'Hardness of water (EDTA/Alkalinity), ion exchange, pH determination, surface tension & viscosity, salt analysis, adsorption, drug synthesis (aspirin), thin layer chromatography.'
  },
  {
    code: '100216P',
    name: 'Communicative English Lab',
    description: 'Language lab software: listening & reading comprehension, pronunciation & phonetics (IPAS), self-introduction, MS Word & PPT typing, oral presentation, interview, JAM, debate, GD.'
  },
  {
    code: '100218P',
    name: 'Python Programming Lab',
    description: 'Python experiments: arithmetic, string manipulation, conditionals, prime numbers, recursion, fibonacci, lists, tuples, sets, dictionaries, file handling, round robin, binary search.'
  },
  {
    code: '100219P',
    name: 'Introduction to Web Design Lab',
    description: 'Web design experiments: college department page, hyperlinks, audio/video embedding, forms, framesets, CSS styling & product catalog, JavaScript calculator & form validation.'
  },
  {
    code: '100220P',
    name: 'Sports/Yoga/NCC/NSS',
    description: 'Innovation & project management, problem-solving techniques, creative thinking, interdisciplinary projects, physical fitness and wellness activities.'
  }
];

// Clean up old Sem 2 subjects
const oldSem2Subjects = db.prepare('SELECT id, code, name FROM subjects WHERE semester_id = ?').all(sem2Id);
for (const oldSub of oldSem2Subjects) {
  console.log(`Cleaning old Sem 2 subject ${oldSub.code} (${oldSub.name})...`);
  db.prepare('DELETE FROM units WHERE subject_id = ?').run(oldSub.id);
  db.prepare('DELETE FROM subjects WHERE id = ?').run(oldSub.id);
}

// 1. Insert Semester 2 Theory Courses
for (const sub of sem2Theory) {
  const res = db.prepare(`
    INSERT INTO subjects (semester_id, code, name, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `).run(sem2Id, sub.code, sub.name, sub.description);
  const subId = res.lastInsertRowid;

  const insUnit = db.prepare(`
    INSERT INTO units (subject_id, unit_number, title, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const u of sub.units) {
    insUnit.run(subId, u.unit_number, u.title, u.description);
  }
  console.log(`✓ [${sub.code}] ${sub.name}: ${sub.units.length} units added`);
}

// 2. Insert Semester 2 Practical Labs
for (const lab of sem2Labs) {
  const res = db.prepare(`
    INSERT INTO subjects (semester_id, code, name, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `).run(sem2Id, lab.code, lab.name, lab.description);
  const labId = res.lastInsertRowid;

  const insUnit = db.prepare(`
    INSERT INTO units (subject_id, unit_number, title, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  insUnit.run(labId, 1, 'Lab Experiments & Practical Exercises', lab.description);
  insUnit.run(labId, 2, 'Lab Manual & Viva Questions', 'Complete lab manual records, code implementations, observations, and viva voce question bank.');
  console.log(`✓ [${lab.code}] ${lab.name} (Lab added)`);
}

console.log('\n--- VERIFICATION OF SEMESTER 2 SUBJECTS ---');
const allSem2 = db.prepare(`
  SELECT s.id, s.code, s.name, (SELECT COUNT(*) FROM units WHERE subject_id = s.id) as units_count
  FROM subjects s WHERE s.semester_id = ? ORDER BY s.code ASC
`).all(sem2Id);
console.table(allSem2);

console.log('✅ SEMESTER 2 SYLLABUS APPLIED SUCCESSFULLY!');
