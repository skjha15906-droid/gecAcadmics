const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, reloadDatabase } = require('./db');
const { restoreFromCloudOnBoot } = require('./cloudSync');

const authRoutes = require('./routes/authRoutes');
const academicRoutes = require('./routes/academicRoutes');
const noteRoutes = require('./routes/noteRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite database and sync from cloud if configured
initDatabase();
restoreFromCloudOnBoot(reloadDatabase);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', academicRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/uploads', noteRoutes); // for /api/uploads/check-duplicate and /api/uploads/my
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    portal: 'GECWC Academics',
    college: 'Government Engineering College, West Champaran',
    branch: 'CSE',
    version: '1.0.0'
  });
});

// Serve frontend if built
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.use((req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('GECWC Academics Backend API running. Please start the Vite frontend on port 5173 or run `npm run build` in the client directory.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🎓 GECWC Academics Server running on http://localhost:${PORT}`);
  console.log(`🏛️  Government Engineering College, West Champaran (CSE)`);
  console.log(`=======================================================`);
});
