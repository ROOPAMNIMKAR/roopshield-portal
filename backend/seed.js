/**
 * seed.js — Seeds the JSON database with demo data.
 * Run: node seed.js
 * Idempotent: skips if admin user already exists.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const existing = db.get('users').find({ role: 'admin' }).value();
if (existing) {
  console.log('Database already seeded. Skipping.');
  process.exit(0);
}

console.log('Seeding database...');

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

const NOW = new Date().toISOString();
const HASH = (pw) => bcrypt.hashSync(pw, 10);

// ─── Users ────────────────────────────────────────────────────────────────────

const users = [
  { id: 'admin-001', reg_number: null, name: 'Priya Sharma', email: 'admin@roopshield.com', password_hash: HASH('Admin@2025'), role: 'admin', department: null, phone: null, start_date: null, end_date: null, internship_type: null, mentor: null, college: null, stipend: null, photo_url: null, status: 'Active', created_at: NOW },
  { id: 'hr-001', reg_number: null, name: 'Neha Kapoor', email: 'hr@roopshield.com', password_hash: HASH('HR@2025'), role: 'hr', department: 'HR', phone: null, start_date: null, end_date: null, internship_type: null, mentor: null, college: null, stipend: null, photo_url: null, status: 'Active', created_at: NOW },
  { id: 'intern-001', reg_number: 'RS-2025-001', name: 'Rahul Verma', email: 'rahul.verma@roopshield.com', password_hash: HASH('Rahul@123'), role: 'intern', department: 'Engineering', phone: '9876543210', start_date: '2025-01-15', end_date: '2025-07-15', internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'IIT Delhi', stipend: 15000, photo_url: null, status: 'Active', created_at: NOW },
  { id: 'intern-002', reg_number: 'RS-2025-002', name: 'Sneha Patel', email: 'sneha.patel@roopshield.com', password_hash: HASH('Sneha@456'), role: 'intern', department: 'Design', phone: '9123456780', start_date: '2025-02-01', end_date: '2025-08-01', internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'NID Ahmedabad', stipend: 12000, photo_url: null, status: 'Active', created_at: NOW },
  { id: 'intern-003', reg_number: 'RS-2025-003', name: 'Arjun Mehta', email: 'arjun.mehta@roopshield.com', password_hash: HASH('Arjun@789'), role: 'intern', department: 'Marketing', phone: '9988776655', start_date: '2025-01-20', end_date: '2025-07-20', internship_type: 'Part-time', mentor: 'Priya Sharma', college: 'XLRI Jamshedpur', stipend: 10000, photo_url: null, status: 'Active', created_at: NOW },
  { id: 'intern-004', reg_number: 'RS-2025-004', name: 'Priyanka Nair', email: 'priyanka.nair@roopshield.com', password_hash: HASH('Priya@321'), role: 'intern', department: 'Operations', phone: '9871234560', start_date: '2024-10-01', end_date: '2025-04-01', internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'BITS Pilani', stipend: 13000, photo_url: null, status: 'Inactive', created_at: NOW },
  { id: 'intern-005', reg_number: 'RS-2025-005', name: 'Kiran Joshi', email: 'kiran.joshi@roopshield.com', password_hash: HASH('Kiran@654'), role: 'intern', department: 'Finance', phone: '9765432100', start_date: '2024-07-01', end_date: '2025-01-01', internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'IIM Bangalore', stipend: 18000, photo_url: null, status: 'Completed', created_at: NOW },
];

db.set('users', users).write();

// ─── Announcements ────────────────────────────────────────────────────────────

db.set('announcements', [
  { id: 'ann-001', title: 'Welcome to RoopShield Internship Portal', body: 'We are excited to launch the new Internship Management Portal. All interns can now track their attendance, tasks, and performance ratings in one place.', importance: 'Info', visible_to: 'All', created_by: 'Priya Sharma', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'ann-002', title: 'Mandatory Safety Training — 18 July 2025', body: 'All interns are required to attend the mandatory workplace safety training session on 18 July 2025 at 10:00 AM in Conference Room B.', importance: 'Important', visible_to: 'All', created_by: 'Priya Sharma', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'ann-003', title: 'Deadline Reminder: July Deliverables', body: 'This is a reminder that all July deliverables are due by end of day on 25 July 2025. Please ensure your tasks are moved to "Under Review" before the deadline.', importance: 'Warning', visible_to: 'All', created_by: 'Priya Sharma', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
]).write();

// ─── Attendance ───────────────────────────────────────────────────────────────

const attInterns = [
  { id: 'intern-001', name: 'Rahul Verma' },
  { id: 'intern-002', name: 'Sneha Patel' },
  { id: 'intern-003', name: 'Arjun Mehta' },
];
const attStatuses = ['Present', 'Present', 'Present', 'Late', 'Absent'];
const dayGroups = [[14,13,12,11,10],[9,8,7,6,5],[4,3,2,1,0]];
const attendance = [];
let attCounter = 1;

attInterns.forEach((intern, gi) => {
  dayGroups[gi].forEach((offset, di) => {
    attendance.push({
      id: `att-${String(attCounter++).padStart(3,'0')}`,
      intern_id: intern.id, intern_name: intern.name,
      date: daysAgo(offset), status: attStatuses[di],
      notes: '', marked_by: 'Priya Sharma',
      marked_at: new Date(Date.now() - offset * 86400000).toISOString(),
    });
  });
});

db.set('attendance', attendance).write();

console.log('');
console.log('✅ Database seeded successfully!');
console.log('');
console.log('Demo credentials:');
console.log('  Admin:  admin@roopshield.com  / Admin@2025');
console.log('  HR:     hr@roopshield.com     / HR@2025');
console.log('  Intern: rahul.verma@roopshield.com / Rahul@123');
