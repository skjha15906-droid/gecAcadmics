const jwt = require('jsonwebtoken');
const { db } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'gecwc-academics-super-secret-key-2026';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      semester: user.semester,
      roll_number: user.roll_number
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Verify user exists and is active
    const user = db.prepare('SELECT id, name, email, role, status, semester, roll_number FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended by the college administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.prepare('SELECT id, name, email, role, status, semester, roll_number FROM users WHERE id = ?').get(decoded.id);
      if (user && user.status !== 'suspended') {
        req.user = user;
      }
    } catch (e) {
      // Ignore optional auth error
    }
  }
  next();
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access Denied: Action restricted to ${allowedRoles.join(' or ')}.`
      });
    }
    next();
  };
}

function logActivity(userId, userName, role, action, targetType, targetId, details) {
  try {
    const stmt = db.prepare(`
      INSERT INTO admin_activity_logs (user_id, user_name, role, action, target_type, target_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, userName, role, action, targetType, String(targetId || ''), details);
  } catch (err) {
    console.error('[ActivityLog Error]', err);
  }
}

module.exports = {
  JWT_SECRET,
  generateToken,
  requireAuth,
  optionalAuth,
  requireRole,
  logActivity
};
