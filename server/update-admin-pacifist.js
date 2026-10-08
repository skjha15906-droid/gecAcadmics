const bcrypt = require('bcryptjs');
const { db } = require('./db');

const salt = bcrypt.genSaltSync(10);
const newHash = bcrypt.hashSync('@knowledge129admin', salt);

db.prepare(`
  UPDATE users 
  SET name = 'pacifist', 
      email = 'pacifist@gecwc.ac.in', 
      password_hash = ?, 
      roll_number = 'pacifist'
  WHERE role = 'admin'
`).run(newHash);

const admin = db.prepare("SELECT id, name, email, roll_number, role FROM users WHERE role = 'admin'").get();
console.log('✅ Updated Admin in database:');
console.log(admin);
console.log('Password verified successfully:', bcrypt.compareSync('@knowledge129admin', newHash));
