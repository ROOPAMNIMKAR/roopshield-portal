/**
 * routes/tasks.js
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function buildTask(t) {
  const assignedTo = db.get('task_assignments').filter({ task_id: t.id }).map('intern_id').value();
  const workLogs = db.get('task_work_logs').filter({ task_id: t.id }).value().map((w) => ({
    id: w.id, taskId: w.task_id, internId: w.intern_id,
    hours: w.hours, note: w.note, loggedAt: w.logged_at,
  }));
  const statusHistory = db.get('task_status_history').filter({ task_id: t.id }).value().map((h) => ({
    status: h.status, changedBy: h.changed_by, changedAt: h.changed_at,
  }));
  return {
    id: t.id, title: t.title, description: t.description,
    assignedTo, priority: t.priority, category: t.category,
    dueDate: t.due_date, estimatedHours: t.estimated_hours,
    status: t.status, createdBy: t.created_by, createdAt: t.created_at,
    workLogs, statusHistory,
  };
}

router.get('/', requireAuth, (req, res) => {
  let tasks;
  if (req.user.role === 'intern') {
    const myTaskIds = db.get('task_assignments').filter({ intern_id: req.user.id }).map('task_id').value();
    tasks = db.get('tasks').filter((t) => myTaskIds.includes(t.id)).value();
  } else {
    tasks = db.get('tasks').value();
  }
  return res.json(tasks.map(buildTask));
});

router.post('/', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  const { title, description, assignedTo, priority, category, dueDate, estimatedHours, status } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });

  const id = uuidv4();
  const now = new Date().toISOString();
  const task = {
    id, title, description: description || '',
    priority: priority || 'Medium', category: category || '',
    due_date: dueDate || null, estimated_hours: estimatedHours || null,
    status: status || 'To Do', created_by: req.user.name, created_at: now,
  };
  db.get('tasks').push(task).write();

  if (Array.isArray(assignedTo)) {
    assignedTo.forEach((internId) => {
      db.get('task_assignments').push({ task_id: id, intern_id: internId }).write();
    });
  }

  db.get('task_status_history').push({
    id: uuidv4(), task_id: id, status: status || 'To Do',
    changed_by: req.user.name, changed_at: now,
  }).write();

  return res.status(201).json(buildTask(task));
});

router.put('/:id', requireAuth, (req, res) => {
  const task = db.get('tasks').find({ id: req.params.id }).value();
  if (!task) return res.status(404).json({ error: 'Task not found.' });

  const { title, description, assignedTo, priority, category, dueDate, estimatedHours, status } = req.body;
  const now = new Date().toISOString();

  if (status && status !== task.status) {
    db.get('task_status_history').push({
      id: uuidv4(), task_id: req.params.id, status,
      changed_by: req.user.name, changed_at: now,
    }).write();
  }

  const updates = {};
  if (title) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (priority) updates.priority = priority;
  if (category !== undefined) updates.category = category;
  if (dueDate !== undefined) updates.due_date = dueDate;
  if (estimatedHours !== undefined) updates.estimated_hours = estimatedHours;
  if (status) updates.status = status;

  db.get('tasks').find({ id: req.params.id }).assign(updates).write();

  if (Array.isArray(assignedTo)) {
    db.get('task_assignments').remove({ task_id: req.params.id }).write();
    assignedTo.forEach((internId) => {
      db.get('task_assignments').push({ task_id: req.params.id, intern_id: internId }).write();
    });
  }

  const updated = db.get('tasks').find({ id: req.params.id }).value();
  return res.json(buildTask(updated));
});

router.delete('/:id', requireAuth, requireRole('admin', 'hr'), (req, res) => {
  db.get('tasks').remove({ id: req.params.id }).write();
  db.get('task_assignments').remove({ task_id: req.params.id }).write();
  db.get('task_status_history').remove({ task_id: req.params.id }).write();
  db.get('task_work_logs').remove({ task_id: req.params.id }).write();
  return res.json({ message: 'Deleted.' });
});

router.post('/:id/work-log', requireAuth, (req, res) => {
  const { hours, note } = req.body;
  if (!hours || hours <= 0) return res.status(400).json({ error: 'Hours must be positive.' });

  const log = {
    id: uuidv4(), task_id: req.params.id, intern_id: req.user.id,
    hours, note: note || '', logged_at: new Date().toISOString(),
  };
  db.get('task_work_logs').push(log).write();
  return res.status(201).json({ id: log.id, taskId: log.task_id, internId: log.intern_id, hours, note });
});

module.exports = router;
