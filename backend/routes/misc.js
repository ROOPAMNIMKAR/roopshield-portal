/**
 * routes/misc.js — Doubts, Resources, Guides, Ratings
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─── Doubts ───────────────────────────────────────────────────────────────────

const mapDoubt = (r) => ({
  id: r.id, internId: r.intern_id, internName: r.intern_name,
  question: r.question, answer: r.answer, status: r.status,
  answeredBy: r.answered_by, createdAt: r.created_at, answeredAt: r.answered_at,
});

router.get('/doubts', requireAuth, (req, res) => {
  const all = req.user.role === 'intern'
    ? db.get('doubts').filter({ intern_id: req.user.id }).value()
    : db.get('doubts').value();
  return res.json(all.map(mapDoubt));
});

router.post('/doubts', requireAuth, requireRole('intern'), (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required.' });
  const doubt = {
    id: uuidv4(), intern_id: req.user.id, intern_name: req.user.name,
    question, answer: null, status: 'Open',
    answered_by: null, created_at: new Date().toISOString(), answered_at: null,
  };
  db.get('doubts').push(doubt).write();
  return res.status(201).json(mapDoubt(doubt));
});

router.patch('/doubts/:id/answer', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ error: 'Answer is required.' });
  db.get('doubts').find({ id: req.params.id }).assign({
    answer, status: 'Answered', answered_by: req.user.name,
    answered_at: new Date().toISOString(),
  }).write();
  const updated = db.get('doubts').find({ id: req.params.id }).value();
  return res.json(mapDoubt(updated));
});

router.delete('/doubts/:id', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  db.get('doubts').remove({ id: req.params.id }).write();
  return res.json({ message: 'Deleted.' });
});

// ─── Resources ────────────────────────────────────────────────────────────────

const mapResource = (r) => ({
  id: r.id, title: r.title, description: r.description,
  url: r.url, category: r.category, visibleTo: r.visible_to,
  createdBy: r.created_by, createdAt: r.created_at,
});

router.get('/resources', requireAuth, (req, res) => {
  return res.json(db.get('resources').value().map(mapResource));
});

router.post('/resources', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { title, description, url, category, visibleTo } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  const resource = {
    id: uuidv4(), title, description: description || '', url: url || '',
    category: category || '', visible_to: visibleTo || 'All',
    created_by: req.user.name, created_at: new Date().toISOString(),
  };
  db.get('resources').push(resource).write();
  return res.status(201).json(mapResource(resource));
});

router.delete('/resources/:id', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  db.get('resources').remove({ id: req.params.id }).write();
  return res.json({ message: 'Deleted.' });
});

// ─── Guides ───────────────────────────────────────────────────────────────────

const mapGuide = (r) => ({
  id: r.id, title: r.title, content: r.content,
  category: r.category, createdBy: r.created_by, createdAt: r.created_at,
});

router.get('/guides', requireAuth, (req, res) => {
  return res.json(db.get('guides').value().map(mapGuide));
});

router.post('/guides', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { title, content, category } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  const guide = {
    id: uuidv4(), title, content: content || '', category: category || '',
    created_by: req.user.name, created_at: new Date().toISOString(),
  };
  db.get('guides').push(guide).write();
  return res.status(201).json(mapGuide(guide));
});

router.delete('/guides/:id', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  db.get('guides').remove({ id: req.params.id }).write();
  return res.json({ message: 'Deleted.' });
});

// ─── Ratings ──────────────────────────────────────────────────────────────────

const mapRating = (r) => ({
  id: r.id, internId: r.intern_id, rating: r.rating,
  comment: r.comment, ratedBy: r.rated_by, ratedAt: r.rated_at,
});

router.get('/ratings', requireAuth, (req, res) => {
  const all = req.user.role === 'intern'
    ? db.get('ratings').filter({ intern_id: req.user.id }).value()
    : db.get('ratings').value();
  return res.json(all.map(mapRating));
});

router.post('/ratings', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { internId, rating, comment } = req.body;
  if (!internId || rating === undefined) return res.status(400).json({ error: 'internId and rating are required.' });

  const existing = db.get('ratings').find({ intern_id: internId, rated_by: req.user.name }).value();
  if (existing) {
    db.get('ratings').find({ id: existing.id }).assign({
      rating, comment: comment || '', rated_at: new Date().toISOString(),
    }).write();
    const updated = db.get('ratings').find({ id: existing.id }).value();
    return res.json(mapRating(updated));
  }

  const record = {
    id: uuidv4(), intern_id: internId, rating, comment: comment || '',
    rated_by: req.user.name, rated_at: new Date().toISOString(),
  };
  db.get('ratings').push(record).write();
  return res.status(201).json(mapRating(record));
});

module.exports = router;
