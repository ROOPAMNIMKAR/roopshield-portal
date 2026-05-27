const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const mapAnn = (r) => ({
  id: r.id, title: r.title, body: r.body,
  importance: r.importance, visibleTo: r.visible_to,
  createdBy: r.created_by, createdAt: r.created_at,
});

router.get('/', requireAuth, (req, res) => {
  return res.json(db.get('announcements').value().map(mapAnn));
});

router.post('/', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { title, body, importance, visibleTo } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required.' });
  const ann = {
    id: uuidv4(), title, body,
    importance: importance || 'Info', visible_to: visibleTo || 'All',
    created_by: req.user.name, created_at: new Date().toISOString(),
  };
  db.get('announcements').push(ann).write();
  return res.status(201).json(mapAnn(ann));
});

router.delete('/:id', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  db.get('announcements').remove({ id: req.params.id }).write();
  return res.json({ message: 'Deleted.' });
});

module.exports = router;
