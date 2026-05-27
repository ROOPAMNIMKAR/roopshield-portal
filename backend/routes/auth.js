/**
 * routes/auth.js — Authentication routes
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required.' });
  }

  const user = db.get('users')
    .find((u) => u.email === email.trim().toLowerCase() && u.role === role)
    .value();

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please try again.' });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials. Please try again.' });
  }

  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

  return res.json({ token, user: payload });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { password_hash, ...safe } = user;
  return res.json(safe);
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const user = db.get('users').find((u) => u.email === email.trim().toLowerCase()).value();

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  }

  // Remove old tokens for this user
  db.get('password_reset_tokens')
    .remove({ user_id: user.id })
    .write();

  const token = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  db.get('password_reset_tokens').push({
    id: uuidv4(),
    user_id: user.id,
    token,
    expires_at: expiresAt,
    used: false,
    created_at: new Date().toISOString(),
  }).write();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const transporter = createTransporter();
  transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'RoopShield Portal — Password Reset',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
        <h2 style="color:#0A2240;">Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#1D6FA4;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#666;font-size:12px;">If you didn't request this, ignore this email.<br/>Link: ${resetUrl}</p>
      </div>
    `,
  }).catch((err) => console.error('Email error:', err.message));

  return res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const record = db.get('password_reset_tokens')
    .find((r) => r.token === token && !r.used)
    .value();

  if (!record) return res.status(400).json({ error: 'Invalid or expired reset link.' });
  if (new Date(record.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.get('users').find({ id: record.user_id }).assign({ password_hash: hash }).write();
  db.get('password_reset_tokens').find({ id: record.id }).assign({ used: true }).write();

  return res.json({ message: 'Password reset successfully. You can now log in.' });
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });

  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.get('users').find({ id: req.user.id }).assign({ password_hash: hash }).write();

  return res.json({ message: 'Password changed successfully.' });
});

module.exports = router;
