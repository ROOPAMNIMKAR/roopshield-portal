/**
 * routes/interns.js — Intern management
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function generateRegNumber() {
  const year = new Date().getFullYear();
  const interns = db.get('users').filter({ role: 'intern' }).value();
  const thisYear = interns
    .filter((u) => u.reg_number && u.reg_number.startsWith(`RS-${year}-`))
    .map((u) => parseInt(u.reg_number.split('-')[2], 10))
    .filter((n) => !isNaN(n));
  const max = thisYear.length > 0 ? Math.max(...thisYear) : 0;
  return `RS-${year}-${String(max + 1).padStart(3, '0')}`;
}

function generatePassword(name) {
  const firstName = (name || 'Intern').split(' ')[0];
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${firstName}@${digits}`;
}

function mapIntern(u) {
  const { password_hash, ...rest } = u;
  return {
    id: rest.id,
    regNumber: rest.reg_number,
    name: rest.name,
    email: rest.email,
    role: rest.role,
    department: rest.department,
    phone: rest.phone,
    startDate: rest.start_date,
    endDate: rest.end_date,
    internshipType: rest.internship_type,
    mentor: rest.mentor,
    college: rest.college,
    stipend: rest.stipend,
    photoUrl: rest.photo_url,
    status: rest.status,
    createdAt: rest.created_at,
  };
}

// GET /api/interns
router.get('/', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const interns = db.get('users').filter({ role: 'intern' }).value();
  return res.json(interns.map(mapIntern));
});

// POST /api/interns
router.post('/', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { name, email, phone, department, startDate, endDate, internshipType, mentor, college, stipend, photoUrl, status } = req.body;

  if (!name || !email || !phone || !department || !startDate || !endDate) {
    return res.status(400).json({ error: 'Name, email, phone, department, start date, and end date are required.' });
  }

  const emailLower = email.trim().toLowerCase();
  const existing = db.get('users').find((u) => u.email === emailLower).value();
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

  const regNumber = generateRegNumber();
  const plainPassword = generatePassword(name);
  const passwordHash = bcrypt.hashSync(plainPassword, 10);
  const id = uuidv4();

  const intern = {
    id,
    reg_number: regNumber,
    name: name.trim(),
    email: emailLower,
    password_hash: passwordHash,
    plain_password: plainPassword,
    role: 'intern',
    department,
    phone: phone.trim(),
    start_date: startDate,
    end_date: endDate,
    internship_type: internshipType || null,
    mentor: mentor || null,
    college: college || null,
    stipend: stipend ? Number(stipend) : null,
    photo_url: photoUrl || null,
    status: status || 'Active',
    created_at: new Date().toISOString(),
  };

  db.get('users').push(intern).write();

  return res.status(201).json({
    intern: mapIntern(intern),
    credentials: {
      email: intern.email,
      password: plainPassword,
      regNumber,
    },
  });
});

// PUT /api/interns/:id
router.put('/:id', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const intern = db.get('users').find({ id: req.params.id, role: 'intern' }).value();
  if (!intern) return res.status(404).json({ error: 'Intern not found.' });

  const { name, email, phone, department, startDate, endDate, internshipType, mentor, college, stipend, photoUrl, status } = req.body;

  if (email && email.trim().toLowerCase() !== intern.email) {
    const dup = db.get('users').find((u) => u.email === email.trim().toLowerCase() && u.id !== req.params.id).value();
    if (dup) return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const updates = {};
  if (name) updates.name = name.trim();
  if (email) updates.email = email.trim().toLowerCase();
  if (phone) updates.phone = phone.trim();
  if (department) updates.department = department;
  if (startDate) updates.start_date = startDate;
  if (endDate) updates.end_date = endDate;
  if (internshipType !== undefined) updates.internship_type = internshipType || null;
  if (mentor !== undefined) updates.mentor = mentor || null;
  if (college !== undefined) updates.college = college || null;
  if (stipend !== undefined) updates.stipend = stipend ? Number(stipend) : null;
  if (photoUrl !== undefined) updates.photo_url = photoUrl || null;
  if (status) updates.status = status;

  db.get('users').find({ id: req.params.id }).assign(updates).write();
  const updated = db.get('users').find({ id: req.params.id }).value();
  return res.json(mapIntern(updated));
});

// DELETE /api/interns/:id
router.delete('/:id', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const intern = db.get('users').find({ id: req.params.id, role: 'intern' }).value();
  if (!intern) return res.status(404).json({ error: 'Intern not found.' });

  db.get('users').remove({ id: req.params.id }).write();
  db.get('attendance').remove({ intern_id: req.params.id }).write();
  db.get('task_assignments').remove({ intern_id: req.params.id }).write();
  db.get('ratings').remove({ intern_id: req.params.id }).write();
  db.get('doubts').remove({ intern_id: req.params.id }).write();
  db.get('leave_requests').remove({ intern_id: req.params.id }).write();

  return res.json({ message: 'Intern deleted successfully.' });
});

// PATCH /api/interns/bulk-status
router.patch('/bulk-status', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array is required.' });
  if (!['Active', 'Inactive', 'Completed'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  ids.forEach((id) => {
    db.get('users').find({ id, role: 'intern' }).assign({ status }).write();
  });

  return res.json({ message: `Updated ${ids.length} intern(s) to ${status}.` });
});

// POST /api/interns/:id/reset-password
router.post('/:id/reset-password', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const intern = db.get('users').find({ id: req.params.id, role: 'intern' }).value();
  if (!intern) return res.status(404).json({ error: 'Intern not found.' });

  const newPassword = generatePassword(intern.name);
  const hash = bcrypt.hashSync(newPassword, 10);
  db.get('users').find({ id: req.params.id }).assign({ password_hash: hash, plain_password: newPassword }).write();

  return res.json({
    message: 'Password reset successfully.',
    credentials: { email: intern.email, password: newPassword },
  });
});

module.exports = router;
