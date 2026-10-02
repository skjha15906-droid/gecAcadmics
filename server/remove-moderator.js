const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

db.prepare("UPDATE notes SET reviewed_by = 1 WHERE reviewed_by = 2").run();
db.prepare("UPDATE reports SET resolved_by = 1 WHERE resolved_by = 2").run();
db.prepare("UPDATE admin_activity_logs SET user_id = 1, user_name = 'Shubh Kumar Jha', role = 'admin' WHERE user_id = 2").run();
db.prepare("DELETE FROM users WHERE role = 'moderator' OR id = 2").run();

const remainingUsers = db.prepare("SELECT id, name, role, email FROM users").all();
console.log('✅ Moderator removed successfully. Remaining users:');
console.log(remainingUsers);
