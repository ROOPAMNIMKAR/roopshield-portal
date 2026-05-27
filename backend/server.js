/**
 * server.js — RoopShield Internship Portal Backend
 * Express + SQLite API server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Auto-seed database on first run
const db = require('./db');
const existing = db.get('users').find({ role: 'admin' }).value();
if (!existing) {
  console.log('No admin found — running auto-seed...');
  try {
    require('./seed-auto');
  } catch (e) {
    console.error('Auto-seed failed:', e.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins — works for localhost dev and any Render/Netlify deployment
    callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/interns',       require('./routes/interns'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/hr',            require('./routes/hr'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/departments',   require('./routes/departments'));
app.use('/api/credentials',   require('./routes/credentials'));
app.use('/api',               require('./routes/misc'));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ RoopShield API running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
