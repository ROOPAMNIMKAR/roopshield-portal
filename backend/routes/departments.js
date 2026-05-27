const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const depts = db.get('departments').map('name').value().sort();
  return res.json(depts);
});

router.post('/', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Department name is required.' });
  const exists = db.get('departments').find({ name: name.trim() }).value();
  if (exists) return res.status(409).json({ error: 'Department already exists.' });
  db.get('departments').push({ name: name.trim(), is_default: false }).write();
  return res.status(201).json({ name: name.trim() });
});

router.delete('/:name', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const dept = db.get('departments').find({ name: req.params.name }).value();
  if (!dept) return res.status(404).json({ error: 'Department not found.' });
  if (dept.is_default) return res.status(400).json({ error: 'Cannot delete a default department.' });
  db.get('departments').remove({ name: req.params.name }).write();
  return res.json({ message: 'Deleted.' });
});

module.exports = router;
