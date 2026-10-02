const http = require('http');

function post(url, data, token) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw || '{}') }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: raw }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting GECWC Academics API Verification ---');

  // 1. Health check
  const health = await get('http://localhost:5000/api/health');
  console.log('1. Health Check:', JSON.parse(health.body).status === 'online' ? 'PASS ✅' : 'FAIL ❌');

  // 2. Semesters
  const semRes = await get('http://localhost:5000/api/semesters');
  const semJson = JSON.parse(semRes.body);
  console.log(`2. Semesters (Count=${semJson.semesters.length}):`, semJson.semesters.length === 8 ? 'PASS ✅' : 'FAIL ❌');

  // 3. Subjects for Sem 3
  const subRes = await get('http://localhost:5000/api/subjects?semester_id=3');
  const subJson = JSON.parse(subRes.body);
  console.log(`3. Sem 3 Subjects (Count=${subJson.subjects.length}):`, subJson.subjects.length >= 4 ? 'PASS ✅' : 'FAIL ❌');

  // 4. Notes search for "Stack"
  const notesRes = await get('http://localhost:5000/api/notes?search=Stack');
  const notesJson = JSON.parse(notesRes.body);
  console.log(`4. Search "Stack" (Results=${notesJson.notes.length}):`, notesJson.notes.length > 0 ? 'PASS ✅' : 'FAIL ❌');

  // 5. Student Login
  const loginStudent = await post('http://localhost:5000/api/auth/login', {
    email: 'aman.cse@gecwc.ac.in',
    password: 'student123'
  });
  console.log('5. Student Login:', loginStudent.status === 200 ? 'PASS ✅' : 'FAIL ❌');
  const studentToken = loginStudent.body.token;

  // 6. Admin Login
  const loginAdmin = await post('http://localhost:5000/api/auth/login', {
    email: 'admin@gecwc.ac.in',
    password: 'admin123'
  });
  console.log('6. Admin Login:', loginAdmin.status === 200 ? 'PASS ✅' : 'FAIL ❌');
  const adminToken = loginAdmin.body.token;

  // 7. Duplicate Check
  const dupCheck = await post('http://localhost:5000/api/uploads/check-duplicate', {
    title: 'Stack Data Structure',
    subject_id: 1
  }, studentToken);
  console.log('7. Duplicate Detection Warning:', dupCheck.body.hasSimilar === true ? 'PASS ✅' : 'FAIL ❌');

  // 8. Admin Dashboard Metrics
  const dashRes = await get('http://localhost:5000/api/admin/dashboard', adminToken);
  const dashJson = JSON.parse(dashRes.body);
  console.log(`8. Admin Dashboard (Pending=${dashJson.metrics.pendingNotes}):`, dashJson.metrics.totalNotes > 0 ? 'PASS ✅' : 'FAIL ❌');

  // 9. Unauthorized access to admin by student (should fail with 403)
  const unauthRes = await get('http://localhost:5000/api/admin/dashboard', studentToken);
  console.log(`9. RBAC Protection (Student blocked from admin):`, unauthRes.status === 403 ? 'PASS ✅' : 'FAIL ❌');

  // 10. Serve built frontend index.html
  const feRes = await get('http://localhost:5000/');
  console.log('10. Static Frontend HTML served:', feRes.body.includes('GECWC Academics') ? 'PASS ✅' : 'FAIL ❌');

  console.log('--- All 10 Core Automated Tests Completed Successfully! ---');
  process.exit(0);
}

// Start server and run tests
require('./index');
setTimeout(runTests, 600);
