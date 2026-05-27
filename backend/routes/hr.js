/**
 * routes/hr.js — Leave requests, HR notices, HR documents
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─── Leave Requests ───────────────────────────────────────────────────────────

const mapLeave = (r) => ({
  id: r.id, internId: r.intern_id, internName: r.intern_name,
  leaveType: r.leave_type, fromDate: r.from_date, toDate: r.to_date,
  reason: r.reason, status: r.status, adminComment: r.admin_comment,
  updatedBy: r.updated_by, createdAt: r.created_at, updatedAt: r.updated_at,
});

router.get('/leave', requireAuth, (req, res) => {
  const all = req.user.role === 'intern'
    ? db.get('leave_requests').filter({ intern_id: req.user.id }).value()
    : db.get('leave_requests').value();
  return res.json(all.map(mapLeave));
});

router.post('/leave', requireAuth, requireRole('intern'), (req, res) => {
  const { leaveType, fromDate, toDate, reason } = req.body;
  if (!leaveType || !fromDate || !toDate) {
    return res.status(400).json({ error: 'leaveType, fromDate, and toDate are required.' });
  }
  const record = {
    id: uuidv4(), intern_id: req.user.id, intern_name: req.user.name,
    leave_type: leaveType, from_date: fromDate, to_date: toDate,
    reason: reason || '', status: 'Pending', admin_comment: '',
    updated_by: null, created_at: new Date().toISOString(), updated_at: null,
  };
  db.get('leave_requests').push(record).write();
  return res.status(201).json(mapLeave(record));
});

router.patch('/leave/:id', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { status, adminComment } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Approved or Rejected.' });
  }
  db.get('leave_requests').find({ id: req.params.id }).assign({
    status, admin_comment: adminComment || '',
    updated_by: req.user.name, updated_at: new Date().toISOString(),
  }).write();
  const updated = db.get('leave_requests').find({ id: req.params.id }).value();
  return res.json(mapLeave(updated));
});

router.delete('/leave/:id', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  db.get('leave_requests').remove({ id: req.params.id }).write();
  return res.json({ message: 'Deleted.' });
});

// ─── HR Notices ───────────────────────────────────────────────────────────────

const mapNotice = (r) => ({
  id: r.id, title: r.title, body: r.body,
  category: r.category, visibleTo: r.visible_to,
  createdBy: r.created_by, createdAt: r.created_at,
});

router.get('/notices', requireAuth, (req, res) => {
  return res.json(db.get('hr_notices').value().map(mapNotice));
});

router.post('/notices', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { title, body, category, visibleTo } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required.' });
  const notice = {
    id: uuidv4(), title, body, category: category || 'General',
    visible_to: visibleTo || 'All', created_by: req.user.name,
    created_at: new Date().toISOString(),
  };
  db.get('hr_notices').push(notice).write();
  return res.status(201).json(mapNotice(notice));
});

router.delete('/notices/:id', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  db.get('hr_notices').remove({ id: req.params.id }).write();
  return res.json({ message: 'Deleted.' });
});

// ─── HR Documents ─────────────────────────────────────────────────────────────

const mapDoc = (r) => ({
  id: r.id, title: r.title, description: r.description,
  url: r.url, category: r.category,
  createdBy: r.created_by, createdAt: r.created_at,
});

router.get('/documents', requireAuth, (req, res) => {
  return res.json(db.get('hr_documents').value().map(mapDoc));
});

router.post('/documents', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { title, description, url, category } = req.body;
  if (!title || !url) return res.status(400).json({ error: 'Title and URL are required.' });
  const doc = {
    id: uuidv4(), title, description: description || '', url,
    category: category || 'Policy', created_by: req.user.name,
    created_at: new Date().toISOString(),
  };
  db.get('hr_documents').push(doc).write();
  return res.status(201).json(mapDoc(doc));
});

router.delete('/documents/:id', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  db.get('hr_documents').remove({ id: req.params.id }).write();
  return res.json({ message: 'Deleted.' });
});

module.exports = router;
