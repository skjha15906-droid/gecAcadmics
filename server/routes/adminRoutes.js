const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { db } = require('../db');
const { requireAuth, requireRole, logActivity } = require('../middleware/auth');
const { sendAdminReplyToStudent } = require('../utils/emailService');

// All admin routes require admin role
router.use(requireAuth);
router.use(requireRole(['admin']));

// GET /api/admin/dashboard - Overview statistics
router.get('/dashboard', (req, res) => {
  const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
  const totalNotes = db.prepare('SELECT COUNT(*) as count FROM notes').get().count;
  const pendingNotes = db.prepare("SELECT COUNT(*) as count FROM notes WHERE status = 'pending'").get().count;
  const approvedNotes = db.prepare("SELECT COUNT(*) as count FROM notes WHERE status = 'approved'").get().count;
  const rejectedNotes = db.prepare("SELECT COUNT(*) as count FROM notes WHERE status = 'rejected'").get().count;
  const reportedNotes = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'").get().count;
  const unreadMessages = db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'").get().count;

  const totals = db.prepare('SELECT SUM(views_count) as total_views, SUM(downloads_count) as total_downloads FROM notes').get();

  // Pending queue for immediate action
  const pendingQueue = db.prepare(`
    SELECT
      n.id, n.title, n.uploader_name, n.created_at, n.resource_type, n.file_type, n.file_size,
      sem.name as semester_name, sub.name as subject_name, sub.code as subject_code,
      u.title as unit_title, u.unit_number
    FROM notes n
    JOIN semesters sem ON sem.id = n.semester_id
    JOIN subjects sub ON sub.id = n.subject_id
    JOIN units u ON u.id = n.unit_id
    WHERE n.status = 'pending'
    ORDER BY n.created_at ASC
    LIMIT 10
  `).all();

  // Recent activity logs
  const recentLogs = db.prepare(`
    SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 8
  `).all();

  // Recent contact messages / student inquiries
  const recentMessages = db.prepare(`
    SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 10
  `).all();

  res.json({
    metrics: {
      totalStudents,
      totalNotes,
      pendingNotes,
      approvedNotes,
      rejectedNotes,
      reportedNotes,
      unreadMessages,
      totalViews: totals.total_views || 0,
      totalDownloads: totals.total_downloads || 0
    },
    pendingQueue,
    recentLogs,
    recentMessages
  });
});

// GET /api/admin/submissions - Manage pending, approved, rejected submissions
router.get('/submissions', (req, res) => {
  const { status = 'pending', search, semester_id } = req.query;

  let query = `
    SELECT
      n.*,
      usr.email as uploader_email, usr.roll_number as uploader_roll,
      sem.sem_number, sem.name as semester_name,
      sub.code as subject_code, sub.name as subject_name,
      u.unit_number, u.title as unit_title,
      rev.name as reviewer_name
    FROM notes n
    JOIN users usr ON usr.id = n.uploaded_by
    JOIN semesters sem ON sem.id = n.semester_id
    JOIN subjects sub ON sub.id = n.subject_id
    JOIN units u ON u.id = n.unit_id
    LEFT JOIN users rev ON rev.id = n.reviewed_by
    WHERE 1=1
  `;
  const params = [];

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query += ' AND n.status = ?';
    params.push(status);
  }

  if (semester_id) {
    query += ' AND n.semester_id = ?';
    params.push(semester_id);
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query += ` AND (n.title LIKE ? OR n.uploader_name LIKE ? OR sub.name LIKE ? OR usr.roll_number LIKE ?)`;
    params.push(term, term, term, term);
  }

  query += ' ORDER BY n.created_at DESC';

  const submissions = db.prepare(query).all(...params);
  res.json({ submissions });
});

// POST /api/admin/submissions/:id/approve
router.post('/submissions/:id/approve', (req, res) => {
  const noteId = req.params.id;
  const note = db.prepare('SELECT id, title, uploaded_by, uploader_name FROM notes WHERE id = ?').get(noteId);

  if (!note) {
    return res.status(404).json({ error: 'Submission not found.' });
  }

  const update = db.prepare(`
    UPDATE notes
    SET status = 'approved',
        reviewed_by = ?,
        reviewed_at = CURRENT_TIMESTAMP,
        rejection_reason = NULL,
        rejection_details = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  update.run(req.user.id, noteId);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'APPROVE_NOTE',
    'note',
    noteId,
    `Approved academic note: "${note.title}" submitted by ${note.uploader_name}`
  );

  res.json({ success: true, message: `Note "${note.title}" has been approved and published.` });
});

// POST /api/admin/submissions/:id/reject
router.post('/submissions/:id/reject', (req, res) => {
  const noteId = req.params.id;
  const { reason, details } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Please select a rejection reason.' });
  }

  const note = db.prepare('SELECT id, title, uploaded_by, uploader_name FROM notes WHERE id = ?').get(noteId);
  if (!note) {
    return res.status(404).json({ error: 'Submission not found.' });
  }

  const update = db.prepare(`
    UPDATE notes
    SET status = 'rejected',
        reviewed_by = ?,
        reviewed_at = CURRENT_TIMESTAMP,
        rejection_reason = ?,
        rejection_details = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  update.run(req.user.id, reason, details ? details.trim() : null, noteId);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'REJECT_NOTE',
    'note',
    noteId,
    `Rejected note: "${note.title}". Reason: ${reason}`
  );

  res.json({ success: true, message: `Note has been marked as rejected with reason: ${reason}` });
});

// DELETE /api/admin/submissions/:id - Permanent note deletion
router.delete('/submissions/:id', (req, res) => {
  const noteId = req.params.id;
  const note = db.prepare('SELECT id, title, file_name FROM notes WHERE id = ?').get(noteId);

  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  // Delete physical file if exists
  const filePath = path.join(__dirname, '..', '..', 'uploads', note.file_name);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.warn('Could not unlink file:', filePath);
    }
  }

  // Delete from database (cascade deletes reports)
  db.prepare('DELETE FROM notes WHERE id = ?').run(noteId);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'DELETE_NOTE',
    'note',
    noteId,
    `Permanently deleted note: "${note.title}"`
  );

  res.json({ success: true, message: `Note "${note.title}" deleted successfully.` });
});

// Content Management: Semesters
router.get('/semesters', (req, res) => {
  const semesters = db.prepare(`
    SELECT
      s.*,
      (SELECT COUNT(*) FROM subjects WHERE semester_id = s.id) as subjects_count,
      (SELECT COUNT(*) FROM notes WHERE semester_id = s.id) as notes_count
    FROM semesters s
    ORDER BY s.sem_number ASC
  `).all();
  res.json({ semesters });
});

router.post('/semesters', requireRole(['admin']), (req, res) => {
  const { sem_number, name, description } = req.body;
  if (!sem_number || !name) {
    return res.status(400).json({ error: 'Semester number and name are required.' });
  }

  const existing = db.prepare('SELECT id FROM semesters WHERE sem_number = ?').get(sem_number);
  if (existing) {
    return res.status(400).json({ error: `Semester ${sem_number} already exists.` });
  }

  const insert = db.prepare('INSERT INTO semesters (sem_number, name, description, is_active) VALUES (?, ?, ?, 1)');
  const result = insert.run(sem_number, name, description || null);

  logActivity(req.user.id, req.user.name, req.user.role, 'CREATE_SEMESTER', 'semester', result.lastInsertRowid, `Created ${name}`);
  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

router.put('/semesters/:id', requireRole(['admin']), (req, res) => {
  const { name, description, is_active } = req.body;
  db.prepare('UPDATE semesters SET name = ?, description = ?, is_active = ? WHERE id = ?')
    .run(name, description || null, is_active ? 1 : 0, req.params.id);

  logActivity(req.user.id, req.user.name, req.user.role, 'EDIT_SEMESTER', 'semester', req.params.id, `Updated semester ID ${req.params.id}`);
  res.json({ success: true });
});

router.delete('/semesters/:id', requireRole(['admin']), (req, res) => {
  const subjectCount = db.prepare('SELECT COUNT(*) as count FROM subjects WHERE semester_id = ?').get(req.params.id).count;
  if (subjectCount > 0) {
    return res.status(400).json({
      error: `Cannot delete semester: it contains ${subjectCount} active subject(s). Please reassign or delete subjects first.`
    });
  }

  db.prepare('DELETE FROM semesters WHERE id = ?').run(req.params.id);
  logActivity(req.user.id, req.user.name, req.user.role, 'DELETE_SEMESTER', 'semester', req.params.id, `Deleted semester ID ${req.params.id}`);
  res.json({ success: true });
});

// Content Management: Subjects
router.get('/subjects', (req, res) => {
  const subjects = db.prepare(`
    SELECT
      sub.*,
      sem.sem_number, sem.name as semester_name,
      (SELECT COUNT(*) FROM units WHERE subject_id = sub.id) as units_count,
      (SELECT COUNT(*) FROM notes WHERE subject_id = sub.id) as notes_count
    FROM subjects sub
    JOIN semesters sem ON sem.id = sub.semester_id
    ORDER BY sem.sem_number ASC, sub.code ASC
  `).all();
  res.json({ subjects });
});

router.post('/subjects', requireRole(['admin', 'moderator']), (req, res) => {
  const { semester_id, code, name, description } = req.body;
  if (!semester_id || !code || !name) {
    return res.status(400).json({ error: 'Semester, subject code, and subject name are required.' });
  }

  const insert = db.prepare('INSERT INTO subjects (semester_id, code, name, description, is_active) VALUES (?, ?, ?, ?, 1)');
  const result = insert.run(semester_id, code.trim().toUpperCase(), name.trim(), description || null);

  logActivity(req.user.id, req.user.name, req.user.role, 'CREATE_SUBJECT', 'subject', result.lastInsertRowid, `Created subject ${code}: ${name}`);
  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

router.put('/subjects/:id', requireRole(['admin', 'moderator']), (req, res) => {
  const { semester_id, code, name, description, is_active } = req.body;
  db.prepare('UPDATE subjects SET semester_id = ?, code = ?, name = ?, description = ?, is_active = ? WHERE id = ?')
    .run(semester_id, code.trim().toUpperCase(), name.trim(), description || null, is_active ? 1 : 0, req.params.id);

  logActivity(req.user.id, req.user.name, req.user.role, 'EDIT_SUBJECT', 'subject', req.params.id, `Updated subject ${code}: ${name}`);
  res.json({ success: true });
});

router.delete('/subjects/:id', requireRole(['admin']), (req, res) => {
  const noteCount = db.prepare('SELECT COUNT(*) as count FROM notes WHERE subject_id = ?').get(req.params.id).count;
  if (noteCount > 0) {
    return res.status(400).json({
      error: `Cannot delete subject: it contains ${noteCount} note(s). Please remove or reassign notes first.`
    });
  }

  db.prepare('DELETE FROM units WHERE subject_id = ?').run(req.params.id);
  db.prepare('DELETE FROM subjects WHERE id = ?').run(req.params.id);

  logActivity(req.user.id, req.user.name, req.user.role, 'DELETE_SUBJECT', 'subject', req.params.id, `Deleted subject ID ${req.params.id}`);
  res.json({ success: true });
});

// Content Management: Units
router.get('/units', (req, res) => {
  const units = db.prepare(`
    SELECT
      u.*,
      sub.code as subject_code, sub.name as subject_name,
      sem.sem_number, sem.name as semester_name,
      (SELECT COUNT(*) FROM notes WHERE unit_id = u.id) as notes_count
    FROM units u
    JOIN subjects sub ON sub.id = u.subject_id
    JOIN semesters sem ON sem.id = sub.semester_id
    ORDER BY sem.sem_number ASC, sub.code ASC, u.unit_number ASC
  `).all();
  res.json({ units });
});

router.post('/units', requireRole(['admin', 'moderator']), (req, res) => {
  const { subject_id, unit_number, title, description } = req.body;
  if (!subject_id || !unit_number || !title) {
    return res.status(400).json({ error: 'Subject, unit number, and title are required.' });
  }

  const insert = db.prepare('INSERT INTO units (subject_id, unit_number, title, description, is_active) VALUES (?, ?, ?, ?, 1)');
  const result = insert.run(subject_id, unit_number, title.trim(), description || null);

  logActivity(req.user.id, req.user.name, req.user.role, 'CREATE_UNIT', 'unit', result.lastInsertRowid, `Created Unit ${unit_number}: ${title}`);
  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

router.put('/units/:id', requireRole(['admin', 'moderator']), (req, res) => {
  const { subject_id, unit_number, title, description, is_active } = req.body;
  db.prepare('UPDATE units SET subject_id = ?, unit_number = ?, title = ?, description = ?, is_active = ? WHERE id = ?')
    .run(subject_id, unit_number, title.trim(), description || null, is_active ? 1 : 0, req.params.id);

  logActivity(req.user.id, req.user.name, req.user.role, 'EDIT_UNIT', 'unit', req.params.id, `Updated unit ID ${req.params.id}`);
  res.json({ success: true });
});

router.delete('/units/:id', requireRole(['admin']), (req, res) => {
  const noteCount = db.prepare('SELECT COUNT(*) as count FROM notes WHERE unit_id = ?').get(req.params.id).count;
  if (noteCount > 0) {
    return res.status(400).json({
      error: `Cannot delete unit: it contains ${noteCount} note(s). Please remove or reassign notes first.`
    });
  }

  db.prepare('DELETE FROM units WHERE id = ?').run(req.params.id);
  logActivity(req.user.id, req.user.name, req.user.role, 'DELETE_UNIT', 'unit', req.params.id, `Deleted unit ID ${req.params.id}`);
  res.json({ success: true });
});

// User Management
router.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT
      u.id, u.name, u.email, u.roll_number, u.semester, u.role, u.status, u.created_at,
      COUNT(n.id) as total_uploads,
      SUM(CASE WHEN n.status = 'approved' THEN 1 ELSE 0 END) as approved_uploads,
      SUM(CASE WHEN n.status = 'rejected' THEN 1 ELSE 0 END) as rejected_uploads
    FROM users u
    LEFT JOIN notes n ON n.uploaded_by = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();
  res.json({ users });
});

router.patch('/users/:id/status', requireRole(['admin']), (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Status must be active or suspended.' });
  }

  const targetUser = db.prepare('SELECT id, name, role FROM users WHERE id = ?').get(req.params.id);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (targetUser.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot change your own account status.' });
  }

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    status === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
    'user',
    targetUser.id,
    `${status === 'suspended' ? 'Suspended' : 'Activated'} user account: ${targetUser.name}`
  );

  res.json({ success: true, message: `User status changed to ${status}.` });
});

router.patch('/users/:id/role', requireRole(['admin']), (req, res) => {
  const { role } = req.body;
  if (!['student', 'moderator', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  const targetUser = db.prepare('SELECT id, name FROM users WHERE id = ?').get(req.params.id);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);

  logActivity(req.user.id, req.user.name, req.user.role, 'CHANGE_USER_ROLE', 'user', targetUser.id, `Changed role of ${targetUser.name} to ${role}`);
  res.json({ success: true, message: `User role updated to ${role}.` });
});

router.delete('/users/:id', requireRole(['admin']), (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  const targetUser = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(targetId);

  if (!targetUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (targetUser.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own Administrator account.' });
  }

  // 1. Remove all reports filed by this user
  db.prepare('DELETE FROM reports WHERE reported_by = ?').run(targetId);

  // 2. Remove all reports on notes uploaded by this user and unlink files
  const userNotes = db.prepare('SELECT id, file_url FROM notes WHERE uploaded_by = ?').all(targetId);
  for (const n of userNotes) {
    db.prepare('DELETE FROM reports WHERE note_id = ?').run(n.id);
    if (n.file_url) {
      const filePath = path.join(__dirname, '..', n.file_url.replace('/api/', ''));
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Failed to delete physical file:', e);
      }
    }
  }

  // 3. Delete notes uploaded by this user
  db.prepare('DELETE FROM notes WHERE uploaded_by = ?').run(targetId);

  // 4. Update any reviewed notes or resolved reports to admin id so FKs don't break
  db.prepare('UPDATE notes SET reviewed_by = ? WHERE reviewed_by = ?').run(req.user.id, targetId);
  db.prepare('UPDATE reports SET resolved_by = ? WHERE resolved_by = ?').run(req.user.id, targetId);
  db.prepare('UPDATE admin_activity_logs SET user_id = ? WHERE user_id = ?').run(req.user.id, targetId);

  // 5. Delete user from users table
  db.prepare('DELETE FROM users WHERE id = ?').run(targetId);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'DELETE_USER',
    'user',
    targetId,
    `Permanently removed student/user: ${targetUser.name} (${targetUser.email})`
  );

  res.json({ success: true, message: `Student account "${targetUser.name}" has been permanently removed.` });
});

// Reports Management
router.get('/reports', (req, res) => {
  const reports = db.prepare(`
    SELECT
      r.*,
      n.title as note_title, n.status as note_status, n.file_url, n.file_name,
      sem.name as semester_name, sub.name as subject_name,
      usr.email as reporter_email,
      res.name as resolver_name
    FROM reports r
    JOIN notes n ON n.id = r.note_id
    JOIN semesters sem ON sem.id = n.semester_id
    JOIN subjects sub ON sub.id = n.subject_id
    JOIN users usr ON usr.id = r.reported_by
    LEFT JOIN users res ON res.id = r.resolved_by
    ORDER BY r.created_at DESC
  `).all();
  res.json({ reports });
});

router.post('/reports/:id/resolve', (req, res) => {
  const { action, resolution_notes } = req.body; // 'resolved' (keep content) or 'dismissed'

  db.prepare(`
    UPDATE reports
    SET status = ?, resolved_by = ?, resolution_notes = ?, resolved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(action === 'dismissed' ? 'dismissed' : 'resolved', req.user.id, resolution_notes || null, req.params.id);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'RESOLVE_REPORT',
    'report',
    req.params.id,
    `Marked report ID ${req.params.id} as ${action}. Notes: ${resolution_notes || 'None'}`
  );

  res.json({ success: true, message: 'Report updated.' });
});

router.delete('/reports/:id/remove-note', (req, res) => {
  const report = db.prepare('SELECT note_id FROM reports WHERE id = ?').get(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  const note = db.prepare('SELECT id, title, file_name FROM notes WHERE id = ?').get(report.note_id);
  if (note) {
    const filePath = path.join(__dirname, '..', '..', 'uploads', note.file_name);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
    db.prepare('DELETE FROM notes WHERE id = ?').run(note.id);
  }

  db.prepare(`
    UPDATE reports
    SET status = 'resolved', resolved_by = ?, resolution_notes = 'Content removed by moderator/admin', resolved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(req.user.id, req.params.id);

  logActivity(req.user.id, req.user.name, req.user.role, 'REMOVE_REPORTED_NOTE', 'note', note ? note.id : '', `Removed note in response to report ID ${req.params.id}`);
  res.json({ success: true, message: 'Content removed and report marked as resolved.' });
});

// Analytics
router.get('/analytics', (req, res) => {
  // Notes by semester
  const notesBySemester = db.prepare(`
    SELECT sem.sem_number, sem.name, COUNT(n.id) as count
    FROM semesters sem
    LEFT JOIN notes n ON n.semester_id = sem.id AND n.status = 'approved'
    GROUP BY sem.id
    ORDER BY sem.sem_number ASC
  `).all();

  // Notes by subject (top 8)
  const notesBySubject = db.prepare(`
    SELECT sub.code, sub.name, COUNT(n.id) as count
    FROM subjects sub
    LEFT JOIN notes n ON n.subject_id = sub.id AND n.status = 'approved'
    GROUP BY sub.id
    ORDER BY count DESC
    LIMIT 8
  `).all();

  // Top contributors
  const topContributors = db.prepare(`
    SELECT u.id, u.name, u.email, u.roll_number, COUNT(n.id) as approved_notes, SUM(n.downloads_count) as total_downloads
    FROM users u
    JOIN notes n ON n.uploaded_by = u.id
    WHERE n.status = 'approved'
    GROUP BY u.id
    ORDER BY approved_notes DESC, total_downloads DESC
    LIMIT 5
  `).all();

  // Most viewed and downloaded
  const topViewed = db.prepare(`
    SELECT id, title, uploader_name, views_count, downloads_count
    FROM notes
    WHERE status = 'approved'
    ORDER BY views_count DESC
    LIMIT 5
  `).all();

  res.json({
    notesBySemester,
    notesBySubject,
    topContributors,
    topViewed
  });
});

// Activity logs
router.get('/activity-logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 50').all();
  res.json({ logs });
});

// Settings
router.get('/settings', (req, res) => {
  const settingsRows = db.prepare('SELECT * FROM platform_settings').all();
  const settings = {};
  settingsRows.forEach(r => { settings[r.key] = r.value; });
  res.json({ settings, settingsList: settingsRows });
});

router.put('/settings', requireRole(['admin']), (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings payload.' });
  }

  const update = db.prepare('INSERT OR REPLACE INTO platform_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
  for (const [key, value] of Object.entries(settings)) {
    update.run(key, String(value));
  }

  logActivity(req.user.id, req.user.name, req.user.role, 'UPDATE_SETTINGS', 'settings', 'global', 'Updated academic platform settings');
  res.json({ success: true, message: 'Settings saved successfully.' });
});

// GET /api/admin/contact-messages - List all messages submitted via Contact Us form
router.get('/contact-messages', (req, res) => {
  const { status, search } = req.query;
  let sql = 'SELECT * FROM contact_messages';
  const conditions = [];
  const params = [];

  if (status && status !== 'all') {
    conditions.push('status = ?');
    params.push(status);
  }

  if (search && search.trim()) {
    conditions.push('(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY created_at DESC';

  const messages = db.prepare(sql).all(...params);
  const unreadCount = db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'").get().count;

  res.json({
    messages,
    unreadCount,
    totalCount: messages.length
  });
});

// PATCH /api/admin/contact-messages/:id/status - Toggle or update read/unread status
router.patch('/contact-messages/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const current = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
  if (!current) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  const newStatus = status || (current.status === 'read' ? 'unread' : 'read');
  db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(newStatus, id);

  res.json({ success: true, message: `Message marked as ${newStatus}`, status: newStatus });
});

// POST /api/admin/contact-messages/:id/reply - Send and store in-portal reply to student inquiry
router.post('/contact-messages/:id/reply', (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage || !replyMessage.trim()) {
    return res.status(400).json({ error: 'Reply message cannot be empty.' });
  }

  const msg = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
  if (!msg) {
    return res.status(404).json({ error: 'Inquiry not found.' });
  }

  const cleanReply = replyMessage.trim();
  const repliedBy = req.user.name;

  db.prepare(`
    UPDATE contact_messages
    SET admin_reply = ?,
        replied_at = CURRENT_TIMESTAMP,
        replied_by = ?,
        status = 'replied'
    WHERE id = ?
  `).run(cleanReply, repliedBy, id);

  logActivity(req.user.id, req.user.name, req.user.role, 'REPLY_INQUIRY', 'contact_messages', id, `Sent in-portal response to ${msg.name} (${msg.email})`);

  // Attempt to deliver reply to student's email inbox if SMTP is configured
  sendAdminReplyToStudent({
    studentEmail: msg.email,
    studentName: msg.name,
    originalSubject: msg.subject,
    originalMessage: msg.message,
    replyMessage: cleanReply,
    adminName: repliedBy
  }).catch((err) => {
    console.error('Background student reply email notification error:', err.message);
  });

  res.json({
    success: true,
    message: 'Reply sent and recorded successfully!',
    admin_reply: cleanReply,
    replied_by: repliedBy,
    status: 'replied'
  });
});

// DELETE /api/admin/contact-messages/:id - Delete a contact message
router.delete('/contact-messages/:id', (req, res) => {
  const { id } = req.params;
  const msg = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
  logActivity(req.user.id, req.user.name, req.user.role, 'DELETE_CONTACT_MESSAGE', 'contact_messages', id, `Deleted inquiry from ${msg.name} (${msg.email})`);

  res.json({ success: true, message: 'Message deleted successfully.' });
});

module.exports = router;

