const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Multer storage configuration
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png'];
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file format. Allowed formats: ${allowedExtensions.join(', ')}`));
    }
  }
});

// GET /api/notes - Public approved notes with search, filter, and sort
router.get('/', (req, res) => {
  const {
    semester_id,
    subject_id,
    unit_id,
    resource_type,
    search,
    sort,
    page = 1,
    limit = 12
  } = req.query;

  let query = `
    SELECT
      n.id,
      n.title,
      n.semester_id,
      n.subject_id,
      n.unit_id,
      n.topic,
      n.description,
      n.resource_type,
      n.file_url,
      n.file_name,
      n.file_type,
      n.file_size,
      n.uploaded_by,
      n.uploader_name,
      n.views_count,
      n.downloads_count,
      n.created_at,
      sem.sem_number,
      sem.name as semester_name,
      sub.code as subject_code,
      sub.name as subject_name,
      u.unit_number,
      u.title as unit_title
    FROM notes n
    JOIN semesters sem ON sem.id = n.semester_id
    JOIN subjects sub ON sub.id = n.subject_id
    JOIN units u ON u.id = n.unit_id
    WHERE n.status = 'approved'
  `;
  const params = [];

  if (semester_id) {
    query += ' AND n.semester_id = ?';
    params.push(semester_id);
  }

  if (subject_id) {
    query += ' AND n.subject_id = ?';
    params.push(subject_id);
  }

  if (unit_id) {
    query += ' AND n.unit_id = ?';
    params.push(unit_id);
  }

  if (resource_type) {
    query += ' AND n.resource_type = ?';
    params.push(resource_type);
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query += ` AND (
      n.title LIKE ? OR
      sub.name LIKE ? OR
      sub.code LIKE ? OR
      u.title LIKE ? OR
      n.topic LIKE ? OR
      n.description LIKE ?
    )`;
    params.push(term, term, term, term, term, term);
  }

  // Sorting
  if (sort === 'views') {
    query += ' ORDER BY n.views_count DESC, n.created_at DESC';
  } else if (sort === 'downloads') {
    query += ' ORDER BY n.downloads_count DESC, n.created_at DESC';
  } else {
    // Default latest
    query += ' ORDER BY n.created_at DESC';
  }

  // Count total matching
  const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
  const countResult = db.prepare(countQuery).get(...params);
  const total = countResult ? countResult.total : 0;

  // Pagination
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit, 10), offset);

  const notes = db.prepare(query).all(...params);

  res.json({
    notes,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10))
    }
  });
});

// GET /api/notes/featured - Highlights for Home page
router.get('/featured', (req, res) => {
  const baseSelect = `
    SELECT
      n.id, n.title, n.semester_id, n.subject_id, n.unit_id, n.topic,
      n.description, n.resource_type, n.file_url, n.file_name, n.file_type,
      n.file_size, n.uploader_name, n.views_count, n.downloads_count, n.created_at,
      sem.sem_number, sem.name as semester_name,
      sub.code as subject_code, sub.name as subject_name,
      u.unit_number, u.title as unit_title
    FROM notes n
    JOIN semesters sem ON sem.id = n.semester_id
    JOIN subjects sub ON sub.id = n.subject_id
    JOIN units u ON u.id = n.unit_id
    WHERE n.status = 'approved'
  `;

  const recent = db.prepare(`${baseSelect} ORDER BY n.created_at DESC LIMIT 6`).all();
  const mostViewed = db.prepare(`${baseSelect} ORDER BY n.views_count DESC LIMIT 6`).all();
  const mostDownloaded = db.prepare(`${baseSelect} ORDER BY n.downloads_count DESC LIMIT 6`).all();

  // Quick subjects overview
  const quickSubjects = db.prepare(`
    SELECT
      s.id, s.code, s.name, sem.sem_number,
      (SELECT COUNT(*) FROM notes WHERE subject_id = s.id AND status = 'approved') as notes_count
    FROM subjects s
    JOIN semesters sem ON sem.id = s.semester_id
    WHERE s.is_active = 1
    ORDER BY notes_count DESC, sem.sem_number ASC
    LIMIT 8
  `).all();

  res.json({
    recentNotes: recent,
    mostViewedNotes: mostViewed,
    mostDownloadedNotes: mostDownloaded,
    quickSubjects
  });
});

// GET /api/notes/:id - Single note details (increments view count)
router.get('/:id', (req, res) => {
  const noteId = req.params.id;

  const note = db.prepare(`
    SELECT
      n.*,
      sem.sem_number, sem.name as semester_name,
      sub.code as subject_code, sub.name as subject_name,
      u.unit_number, u.title as unit_title
    FROM notes n
    JOIN semesters sem ON sem.id = n.semester_id
    JOIN subjects sub ON sub.id = n.subject_id
    JOIN units u ON u.id = n.unit_id
    WHERE n.id = ?
  `).get(noteId);

  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  // Only approved notes can be viewed publicly (unless owner or moderator/admin)
  if (note.status !== 'approved') {
    // If not approved, check if requester is owner or mod/admin
    // We let optionalAuth handle or return 403
    return res.status(403).json({ error: 'This note is currently pending review or has not been approved.' });
  }

  // Increment view count
  db.prepare('UPDATE notes SET views_count = views_count + 1 WHERE id = ?').run(noteId);
  note.views_count += 1;

  res.json({ note });
});

// GET /api/notes/:id/download - Stream/download file & increment download count
router.get('/:id/download', (req, res) => {
  const noteId = req.params.id;

  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  // Increment download count
  db.prepare('UPDATE notes SET downloads_count = downloads_count + 1 WHERE id = ?').run(noteId);

  // Serve file
  const filePath = path.join(uploadsDir, note.file_name);
  if (fs.existsSync(filePath)) {
    res.download(filePath, note.title.replace(/[^a-zA-Z0-9_-]/g, '_') + path.extname(note.file_name));
  } else {
    // If physical file doesn't exist on disk, return synthetic representation
    res.setHeader('Content-Disposition', `attachment; filename="${note.file_name}"`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(`GECWC ACADEMICS - CSE ACADEMIC NOTES REPOSITORY\n==============================================\nTitle: ${note.title}\nSubject: ${note.subject_id}\nTopic: ${note.topic}\nUploaded by: ${note.uploader_name}\n\n[Digital document verified by Department of Computer Science & Engineering, GEC West Champaran]`);
  }
});

// POST /api/notes/:id/report - Report a note
router.post('/:id/report', requireAuth, (req, res) => {
  const noteId = req.params.id;
  const { reason, details } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Please select a reason for reporting.' });
  }

  const validReasons = [
    'Wrong subject/unit',
    'Duplicate',
    'Incorrect information',
    'Unrelated content',
    'Inappropriate content',
    'Copyright concern',
    'Spam',
    'Other'
  ];

  if (!validReasons.includes(reason)) {
    return res.status(400).json({ error: 'Invalid report reason.' });
  }

  const note = db.prepare('SELECT id, title FROM notes WHERE id = ?').get(noteId);
  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  const insert = db.prepare(`
    INSERT INTO reports (note_id, reported_by, reporter_name, reason, details, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `);

  insert.run(note.id, req.user.id, req.user.name, reason, details ? details.trim() : null);

  res.json({
    message: 'Report submitted successfully. The academic moderation team will review this resource.'
  });
});

// POST /api/uploads/check-duplicate - Pre-check duplicates before submitting
router.post('/check-duplicate', requireAuth, (req, res) => {
  const { title, subject_id, unit_id, file_name } = req.body;

  if (!title && !file_name) {
    return res.json({ hasSimilar: false });
  }

  let similarNotes = [];

  if (title) {
    const cleanTitle = title.trim();
    // 1. If subject_id is provided, check within that subject
    if (subject_id) {
      similarNotes = db.prepare(`
        SELECT id, title, topic, resource_type, uploader_name, created_at
        FROM notes
        WHERE subject_id = ? AND (LOWER(title) LIKE LOWER(?) OR LOWER(?) LIKE '%' || LOWER(title) || '%')
        LIMIT 3
      `).all(subject_id, `%${cleanTitle}%`, cleanTitle);
    }
    // 2. If no matches in subject or no subject_id provided, check across notes
    if (similarNotes.length === 0) {
      similarNotes = db.prepare(`
        SELECT id, title, topic, resource_type, uploader_name, created_at
        FROM notes
        WHERE (LOWER(title) LIKE LOWER(?) OR LOWER(?) LIKE '%' || LOWER(title) || '%')
        LIMIT 3
      `).all(`%${cleanTitle}%`, cleanTitle);
    }
  }

  if (similarNotes.length > 0) {
    return res.json({
      hasSimilar: true,
      warning: 'A similar resource may already exist. Please check before submitting.',
      matches: similarNotes
    });
  }

  res.json({ hasSimilar: false });
});

// POST /api/uploads - Student uploads note (Pending Review)
router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  try {
    const { title, semester_id, subject_id, unit_id, topic, description, resource_type } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Please select a document file to upload.' });
    }

    if (!title || !semester_id || !subject_id || !unit_id) {
      // Remove uploaded file if validation fails
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Title, semester, subject, and unit are required.' });
    }

    // Rate limiting: Maximum 10 uploads per student per 24 hours
    const recentUploadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notes
      WHERE uploaded_by = ? AND created_at > datetime('now', '-24 hours')
    `).get(req.user.id).count;

    if (recentUploadCount >= 10 && req.user.role === 'student') {
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(429).json({
        error: 'Upload rate limit exceeded. You can submit up to 10 academic resources per day.'
      });
    }

    // Verify semester, subject, and unit exist
    const sem = db.prepare('SELECT id FROM semesters WHERE id = ? AND is_active = 1').get(semester_id);
    const sub = db.prepare('SELECT id FROM subjects WHERE id = ? AND semester_id = ? AND is_active = 1').get(subject_id, semester_id);
    const unit = db.prepare('SELECT id FROM units WHERE id = ? AND subject_id = ? AND is_active = 1').get(unit_id, subject_id);

    if (!sem || !sub || !unit) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Selected semester, subject, or unit is invalid or inactive.' });
    }

    const ext = path.extname(req.file.originalname).toUpperCase().replace('.', '');
    const fileUrl = `/uploads/${req.file.filename}`;

    const insert = db.prepare(`
      INSERT INTO notes (
        title, semester_id, subject_id, unit_id, topic, description,
        resource_type, file_url, file_name, file_type, file_size,
        uploaded_by, uploader_name, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    const result = insert.run(
      title.trim(),
      semester_id,
      subject_id,
      unit_id,
      topic ? topic.trim() : null,
      description ? description.trim() : null,
      resource_type || 'Handwritten Notes',
      fileUrl,
      req.file.filename,
      ext || 'PDF',
      req.file.size,
      req.user.id,
      req.user.name
    );

    res.status(201).json({
      success: true,
      message: 'Your note has been submitted successfully and is waiting for academic moderation.',
      noteId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ error: err.message || 'Error occurred while saving your note.' });
  }
});

// GET /api/uploads/my - Current user's submissions
router.get('/my/submissions', requireAuth, (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT
      n.*,
      sem.sem_number, sem.name as semester_name,
      sub.code as subject_code, sub.name as subject_name,
      u.unit_number, u.title as unit_title
    FROM notes n
    JOIN semesters sem ON sem.id = n.semester_id
    JOIN subjects sub ON sub.id = n.subject_id
    JOIN units u ON u.id = n.unit_id
    WHERE n.uploaded_by = ?
  `;
  const params = [req.user.id];

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query += ' AND n.status = ?';
    params.push(status);
  }

  query += ' ORDER BY n.created_at DESC';

  const submissions = db.prepare(query).all(...params);
  res.json({ submissions });
});

module.exports = router;
