const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/semesters
router.get('/semesters', (req, res) => {
  const semesters = db.prepare(`
    SELECT
      s.id,
      s.sem_number,
      s.name,
      s.description,
      s.is_active,
      (SELECT COUNT(*) FROM subjects WHERE semester_id = s.id AND is_active = 1) as subjects_count,
      (SELECT COUNT(*) FROM notes WHERE semester_id = s.id AND status = 'approved') as notes_count
    FROM semesters s
    WHERE s.is_active = 1
    ORDER BY s.sem_number ASC
  `).all();

  res.json({ semesters });
});

// GET /api/subjects?semester_id=X
router.get('/subjects', (req, res) => {
  const { semester_id } = req.query;

  let query = `
    SELECT
      sub.id,
      sub.semester_id,
      sub.code,
      sub.name,
      sub.description,
      sub.is_active,
      sem.name as semester_name,
      sem.sem_number,
      (SELECT COUNT(*) FROM units WHERE subject_id = sub.id AND is_active = 1) as units_count,
      (SELECT COUNT(*) FROM notes WHERE subject_id = sub.id AND status = 'approved') as notes_count
    FROM subjects sub
    JOIN semesters sem ON sem.id = sub.semester_id
    WHERE sub.is_active = 1
  `;
  const params = [];

  if (semester_id) {
    query += ' AND sub.semester_id = ?';
    params.push(semester_id);
  }

  query += ' ORDER BY sem.sem_number ASC, sub.code ASC';

  const subjects = db.prepare(query).all(...params);
  res.json({ subjects });
});

// GET /api/units?subject_id=X
router.get('/units', (req, res) => {
  const { subject_id } = req.query;

  if (!subject_id) {
    return res.status(400).json({ error: 'subject_id parameter is required.' });
  }

  const units = db.prepare(`
    SELECT
      u.id,
      u.subject_id,
      u.unit_number,
      u.title,
      u.description,
      u.is_active,
      (SELECT COUNT(*) FROM notes WHERE unit_id = u.id AND status = 'approved') as notes_count
    FROM units u
    WHERE u.subject_id = ? AND u.is_active = 1
    ORDER BY u.unit_number ASC
  `).all(subject_id);

  const subject = db.prepare(`
    SELECT s.id, s.code, s.name, sem.sem_number, sem.name as semester_name
    FROM subjects s
    JOIN semesters sem ON sem.id = s.semester_id
    WHERE s.id = ?
  `).get(subject_id);

  res.json({ subject, units });
});

// GET /api/resource-types
router.get('/resource-types', (req, res) => {
  const types = db.prepare('SELECT * FROM resource_types WHERE is_active = 1 ORDER BY id ASC').all();
  res.json({ resource_types: types });
});

const { sendContactNotification } = require('../utils/emailService');

// POST /api/contact - Send message to administrator
router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required fields.' });
  }

  const cleanEmail = email.trim();
  const cleanName = name.trim();
  const cleanSubject = (subject && subject.trim()) || 'General GECWC Portal Query';
  const cleanMessage = message.trim();

  const insert = db.prepare(`
    INSERT INTO contact_messages (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `);
  const result = insert.run(cleanName, cleanEmail, cleanSubject, cleanMessage);

  // Trigger optional background email forwarder to Shubh's private mailbox
  sendContactNotification({
    name: cleanName,
    email: cleanEmail,
    subject: cleanSubject,
    message: cleanMessage
  }).catch((err) => {
    console.error('Email notification background error:', err.message);
  });

  res.status(201).json({
    success: true,
    message: 'Message delivered successfully! Lead Administrator Shubh Kumar Jha has received your query.',
    id: result.lastInsertRowid
  });
});

// GET /api/inquiries/check - Allow students to track their inquiry status and view admin replies
router.get('/inquiries/check', (req, res) => {
  const { email, ticketId } = req.query;

  if (!email && !ticketId) {
    return res.status(400).json({ error: 'Please provide your email address or ticket ID to track your inquiry.' });
  }

  let inquiries = [];

  if (ticketId && ticketId.trim()) {
    const id = parseInt(ticketId.trim(), 10);
    if (!isNaN(id)) {
      const item = db.prepare(`
        SELECT id, name, email, subject, message, status, admin_reply, replied_at, replied_by, created_at
        FROM contact_messages
        WHERE id = ?
      `).get(id);
      if (item) inquiries.push(item);
    }
  } else if (email && email.trim()) {
    inquiries = db.prepare(`
      SELECT id, name, email, subject, message, status, admin_reply, replied_at, replied_by, created_at
      FROM contact_messages
      WHERE LOWER(email) = LOWER(?)
      ORDER BY created_at DESC
    `).all(email.trim());
  }

  res.json({
    inquiries,
    total: inquiries.length
  });
});

module.exports = router;


