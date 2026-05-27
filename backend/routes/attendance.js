/**
 * routes/attendance.js
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function mapRecord(r) {
  return {
    id: r.id, internId: r.intern_id, internName: r.intern_name,
    date: r.date, status: r.status, notes: r.notes,
    markedBy: r.marked_by, markedAt: r.marked_at,
  };
}

router.get('/', requireAuth, (req, res) => {
  let records;
  if (req.user.role === 'intern') {
    records = db.get('attendance').filter({ intern_id: req.user.id }).value();
  } else {
    records = db.get('attendance').value();
  }
  return res.json(records.map(mapRecord));
});

router.post('/', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { internId, internName, date, status, notes } = req.body;
  if (!internId || !date || !status) {
    return res.status(400).json({ error: 'internId, date, and status are required.' });
  }

  const existing = db.get('attendance').find({ intern_id: internId, date }).value();
  const now = new Date().toISOString();

  if (existing) {
    db.get('attendance').find({ intern_id: internId, date })
      .assign({ status, notes: notes || '', marked_by: req.user.name, marked_at: now })
      .write();
    const updated = db.get('attendance').find({ intern_id: internId, date }).value();
    return res.json(mapRecord(updated));
  }

  const record = {
    id: uuidv4(), intern_id: internId, intern_name: internName || '',
    date, status, notes: notes || '', marked_by: req.user.name, marked_at: now,
  };
  db.get('attendance').push(record).write();
  return res.status(201).json(mapRecord(record));
});

router.delete('/:id', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  db.get('attendance').remove({ id: req.params.id }).write();
  return res.json({ message: 'Deleted.' });
});

module.exports = router;
