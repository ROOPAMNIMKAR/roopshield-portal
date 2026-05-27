/**
 * db.js — JSON file database using lowdb v1
 * All data is stored in db.json in the backend folder.
 * No native compilation required.
 */

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

// ─── Default schema ───────────────────────────────────────────────────────────
db.defaults({
  users: [],
  password_reset_tokens: [],
  tasks: [],
  task_assignments: [],
  task_status_history: [],
  task_work_logs: [],
  attendance: [],
  announcements: [],
  ratings: [],
  doubts: [],
  resources: [],
  guides: [],
  leave_requests: [],
  hr_notices: [],
  hr_documents: [],
  departments: [],
}).write();

// ─── Seed default departments if empty ───────────────────────────────────────
const defaultDepts = [
  'Engineering', 'Design', 'Marketing', 'Operations', 'Finance',
  'Cybersecurity', 'Web Development', 'Mobile App Development',
  'Full-Stack Development', 'Cybersecurity Analysis', 'Software Testing', 'HR',
];

if (db.get('departments').value().length === 0) {
  db.set('departments', defaultDepts.map((name) => ({ name, is_default: true }))).write();
}

module.exports = db;
