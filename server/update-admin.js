const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

db.prepare("UPDATE users SET name = 'Shubh Kumar Jha' WHERE role = 'admin'").run();
db.prepare("UPDATE admin_activity_logs SET user_name = 'Shubh Kumar Jha' WHERE role = 'admin'").run();

const admin = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
console.log('✅ Admin successfully updated in database:');
console.log('Name:', admin.name);
console.log('Email:', admin.email);
console.log('Role:', admin.role);
