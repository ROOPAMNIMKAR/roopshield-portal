/**
 * routes/credentials.js
 * Admin-only: view all users with credentials, update any user's password.
 *
 * Because passwords are hashed we store a plain-text copy in a separate
 * field (plain_password) so admin can view/share them.
 * This is intentional for an internal company portal where admin needs
 * to distribute credentials to interns.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/credentials — all users with plain passwords ───────────────────
router.get('/', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const users = db.get('users').value().map((u) => ({
    id: u.id,
    regNumber: u.reg_number,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    phone: u.phone,
    status: u.status,
    college: u.college,
    skills: u.skills || null,
    plainPassword: u.plain_password || null, // stored when created/reset
    createdAt: u.created_at,
  }));
  return res.json(users);
});

// ─── PATCH /api/credentials/:id/password — set new password ──────────────────
router.patch('/:id/password', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const user = db.get('users').find({ id: req.params.id }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const hash = bcrypt.hashSync(newPassword, 10);
  db.get('users').find({ id: req.params.id }).assign({
    password_hash: hash,
    plain_password: newPassword,
  }).write();

  return res.json({
    id: req.params.id,
    name: user.name,
    email: user.email,
    plainPassword: newPassword,
    message: 'Password updated successfully.',
  });
});

// ─── POST /api/credentials/:id/generate-password — auto-generate ─────────────
router.post('/:id/generate-password', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const user = db.get('users').find({ id: req.params.id }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const firstName = (user.name || 'User').split(' ')[0];
  const digits = Math.floor(1000 + Math.random() * 9000);
  const newPassword = `${firstName}@${digits}`;
  const hash = bcrypt.hashSync(newPassword, 10);

  db.get('users').find({ id: req.params.id }).assign({
    password_hash: hash,
    plain_password: newPassword,
  }).write();

  return res.json({
    id: req.params.id,
    name: user.name,
    email: user.email,
    plainPassword: newPassword,
    message: 'New password generated.',
  });
});

module.exports = router;
