const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { generateToken, requireAuth } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email address and password.' });
  }

  const identifier = email.trim();
  const user = db.prepare(`
    SELECT * FROM users 
    WHERE LOWER(email) = LOWER(?) 
       OR LOWER(name) = LOWER(?) 
       OR LOWER(roll_number) = LOWER(?)
  `).get(identifier, identifier, identifier);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username/email address or password.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended by the administrator.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email address or password.' });
  }

  const token = generateToken(user);

  res.json({
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      semester: user.semester,
      roll_number: user.roll_number,
      status: user.status
    }
  });
});

// POST /api/auth/register (Student only)
router.post('/register', (req, res) => {
  const { name, email, password, roll_number, semester } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please provide a valid institutional email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const semNum = semester ? parseInt(semester, 10) : null;
  if (semNum && (semNum < 1 || semNum > 8)) {
    return res.status(400).json({ error: 'Semester must be between 1 and 8.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const insert = db.prepare(`
    INSERT INTO users (name, email, password_hash, roll_number, semester, role, status)
    VALUES (?, ?, ?, ?, ?, 'student', 'active')
  `);

  const result = insert.run(name.trim(), cleanEmail, passwordHash, roll_number ? roll_number.trim() : null, semNum);

  const newUser = {
    id: result.lastInsertRowid,
    name: name.trim(),
    email: cleanEmail,
    role: 'student',
    semester: semNum,
    roll_number: roll_number ? roll_number.trim() : null,
    status: 'active'
  };

  const token = generateToken(newUser);

  res.status(201).json({
    message: 'Student account registered successfully.',
    token,
    user: newUser
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = req.user;

  // Compute student stats
  const uploadStats = db.prepare(`
    SELECT
      COUNT(*) as total_uploads,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_uploads,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_uploads,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_uploads
    FROM notes
    WHERE uploaded_by = ?
  `).get(user.id);

  res.json({
    user,
    stats: {
      total_uploads: uploadStats.total_uploads || 0,
      approved_uploads: uploadStats.approved_uploads || 0,
      pending_uploads: uploadStats.pending_uploads || 0,
      rejected_uploads: uploadStats.rejected_uploads || 0
    }
  });
});

module.exports = router;
