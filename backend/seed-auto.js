/**
 * seed-auto.js
 * Auto-runs on server startup if database is empty.
 * Seeds admin, HR, demo interns, AND all 12 real RoopShield interns.
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const NOW = new Date().toISOString();
const HASH = (pw) => bcrypt.hashSync(pw, 10);

function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}
function daysFromNow(n) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ─── Users ────────────────────────────────────────────────────────────────────

const users = [
  // Admin
  { id: 'admin-001', reg_number: null, name: 'Priya Sharma', email: 'admin@roopshield.com', password_hash: HASH('Admin@2025'), plain_password: 'Admin@2025', role: 'admin', department: null, phone: null, start_date: null, end_date: null, internship_type: null, mentor: null, college: null, stipend: null, photo_url: null, status: 'Active', created_at: NOW },
  // HR
  { id: 'hr-001', reg_number: null, name: 'Neha Kapoor', email: 'hr@roopshield.com', password_hash: HASH('HR@2025'), plain_password: 'HR@2025', role: 'hr', department: 'HR', phone: null, start_date: null, end_date: null, internship_type: null, mentor: null, college: null, stipend: null, photo_url: null, status: 'Active', created_at: NOW },

  // ── 12 Real RoopShield Interns ────────────────────────────────────────────
  { id: uuidv4(), reg_number: 'RS-2026-001', name: 'Swayam Jitendra Bhope', email: 'swayambhope9@gmail.com', password_hash: HASH('Swayam@3985'), plain_password: 'Swayam@3985', role: 'intern', department: 'Web Development', phone: '7972132582', start_date: daysFromNow(0), end_date: daysFromNow(90), internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'JD College of Engineering and Management', stipend: null, photo_url: null, status: 'Active', education: '2 year B.Tech CSE', skills: 'C++, HTML', city: 'Nagpur', role_title: 'Web Development Intern', created_at: NOW },
  { id: uuidv4(), reg_number: 'RS-2026-002', name: 'Riddhi Tekade', email: 'riddhitekade25@gmail.com', password_hash: HASH('Riddhi@8537'), plain_password: 'Riddhi@8537', role: 'intern', department: 'Web Development', phone: '9890070233', start_date: daysFromNow(0), end_date: daysFromNow(90), internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'St. Vincent Pallotti College of Engineering and Technology', stipend: null, photo_url: null, status: 'Active', education: '1st Year', skills: 'Frontend', city: 'Nagpur', role_title: 'Web Development Intern', created_at: NOW },
  { id: uuidv4(), reg_number: 'RS-2026-003', name: 'Nandini Gokhale', email: 'gokhalenandini9@gmail.com', password_hash: HASH('Nandini@1501'), plain_password: 'Nandini@1501', role: 'intern', department: 'Web Development', phone: '9158446276', start_date: daysFromNow(0), end_date: daysFromNow(90), internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'St. Vincent Pallotti College of Engineering and Technology', stipend: null, photo_url: null, status: 'Active', education: 'B.Voc SD 1st Year', skills: 'Power BI, Excel, MySQL Basics', city: 'Nagpur', role_title: 'Web Development Intern', created_at: NOW },
  { id: uuidv4(), reg_number: 'RS-2026-004', name: 'Shujal Sunil Gajbhiye', email: 'gajbhiyeshujal233@gmail.com', password_hash: HASH('Shujal@8220'), plain_password: 'Shujal@8220', role: 'intern', department: 'Web Development', phone: '9765883785', start_date: daysFromNow(0), end_date: daysFromNow(90), internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'JD College of Engineering Nagpur', stipend: null, photo_url: null, status: 'Active', education: 'B.Tech CSE 3rd Year', skills: 'Python Basics, Problem Solving, GDScript', city: 'Nagpur', role_title: 'Web Development Intern', created_at: NOW },
  { id: uuidv4(), reg_number: 'RS-2026-005', name: 'Pritam Baramu', email: 'pritambaramu@gmail.com', password_hash: HASH('Pritam@6440'), plain_password: 'Pritam@6440', role: 'intern', department: 'Marketing', phone: '9975739845', start_date: daysFromNow(0), end_date: daysFromNow(90), internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'JD College of Engineering and Management', stipend: null, photo_url: null, status: 'Active', education: '3rd Year Pursuing', skills: 'C, Python, CSS, JS', city: 'Nagpur', role_title: 'Content Editor Intern', created_at: NOW },
  { id: uuidv4(), reg_number: 'RS-2026-006', name: 'Shreyash Khushal Dhote', email: 'shreyashdhote362@gmail.com', password_hash: HASH('Shreyash@9449'), plain_password: 'Shreyash@9449', role: 'intern', department: 'Web Development', phone: '8468871201', start_date: daysFromNow(0), end_date: daysFromNow(90), internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'JD College of Engineering and Management Nagpur', stipend: null, photo_url: null, status: 'Active', education: 'B.Tech', skills: 'Frontend Development', city: 'Nagpur', role_title: 'Web Development Intern', created_at: NOW },
  { id: uuidv4(), reg_number: 'RS-2026-007', name: 'Rohini Rajesh Gokhale', email: 'rohinigokhale15@gmail.com', password_hash: HASH('Rohini@1989'), plain_password: 'Rohini@1989', role: 'intern', department: 'Web Development', phone: '7775963545', start_date: daysFromNow(0), end_date: daysFromNow(90), internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'St. Vincent Pallotti College of Engineering and Technology', stipend: null, photo_url: null, status: 'Active', education: '1st Year', skills: 'HTML, CSS', city: 'Nagpur', role_title: 'Web Development Intern', created_at: NOW },
  { id: uuidv4(), reg_number: 'RS-2026-008', name: 'Pooja Nanhe', email: 'poojananhe3@gmail.com', password_hash: HASH('Pooja@8998'), plain_password: 'Pooja@8998', role: 'intern', department: 'Cybersecurity', phone: '9545692409', start_date: daysFromNow(0), end_date: daysFromNow(90), internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'St. Vincent Pallotti College of Engineering and Technology', stipend: null, photo_url: null, status: 'Active', education: '12th Passed', skills: 'Cybersecurity Fundamentals', city: 'Nagpur', role_title: 'Cybersecurity Intern', created_at: NOW },
  { id: uuidv4(), reg_number: 'RS-2026-009', name: 'Shreyash Tijare', email: 'tijareshreyash47@gmail.com', password_hash: HASH('Shreyash@8746'), plain_password: 'Shreyash@8746', role: 'intern', department: 'Cybersecurity', phone: '8468925836', start_date: daysFromNow(0), end_date: daysFromNow(90), internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'St. Vincent Pallotti College of Engineering and Technology', stipend: null, photo_url: null, status: 'Active', education: 'B.Voc', skills: 'Cisco', city: 'Nagpur', role_title: 'Cybersecurity Intern', created_at: NOW },
  { id: uuidv4(), reg_number: 'RS-2026-010', name: 'Hardik Kakade', email: 'yograjkakadey@gmail.com', password_hash: HASH('Hardik@6782'), plain_password: 'Hardik@6782', role: 'intern', department: 'Cybersecurity', phone: '9325538353', start_date: daysFromNow(0), end_date: daysFromNow(90), internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'St. Vincent Pallotti College', stipend: null, photo_url: null, status: 'Active', education: '1st Year', skills: 'Web and Ethical Hacking', city: 'Nagpur', role_title: 'Cybersecurity Intern', created_at: NOW },
  { id: uuidv4(), reg_number: 'RS-2026-011', name: 'Naineet Hedaoo', email: 'naineethedaoo@gmail.com', password_hash: HASH('Naineet@9389'), plain_password: 'Naineet@9389', role: 'intern', department: 'Web Development', phone: '9359306027', start_date: daysFromNow(0), end_date: daysFromNow(90), internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'SVPCET', stipend: null, photo_url: null, status: 'Active', education: 'B.Tech', skills: 'HTML, CSS', city: 'Nagpur', role_title: 'Web Development Intern', created_at: NOW },
  { id: uuidv4(), reg_number: 'RS-2026-012', name: 'Rushikesh Kawadkar', email: 'rushikeshkawadkar9@gmail.com', password_hash: HASH('Rushikesh@5286'), plain_password: 'Rushikesh@5286', role: 'intern', department: 'Web Development', phone: '9699137038', start_date: daysFromNow(0), end_date: daysFromNow(90), internship_type: 'Full-time', mentor: 'Priya Sharma', college: 'JD College of Engineering and Management Nagpur', stipend: null, photo_url: null, status: 'Active', education: 'B.Tech CSE', skills: 'HTML, CSS, JS, Python', city: 'Nagpur', role_title: 'Web Development Intern', created_at: NOW },
];

db.set('users', users).write();

// ─── Announcements ────────────────────────────────────────────────────────────
db.set('announcements', [
  { id: 'ann-001', title: 'Welcome to RoopShield Internship Portal', body: 'We are excited to launch the new Internship Management Portal. All interns can now track their attendance, tasks, and performance ratings in one place. Please log in and complete your profile.', importance: 'Info', visible_to: 'All', created_by: 'Priya Sharma', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'ann-002', title: 'Internship Guidelines', body: 'Please ensure you mark your attendance daily and update your task status regularly. Any doubts or queries can be raised through the Doubts section. We are here to help you grow!', importance: 'Important', visible_to: 'All', created_by: 'Priya Sharma', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
]).write();

// ─── Attendance (last 5 days for first 3 interns) ─────────────────────────────
const attInterns = users.filter((u) => u.role === 'intern').slice(0, 3);
const attStatuses = ['Present', 'Present', 'Present', 'Late', 'Absent'];
const attendance = [];
let counter = 1;
attInterns.forEach((intern, gi) => {
  [4, 3, 2, 1, 0].forEach((offset, di) => {
    attendance.push({
      id: `att-${String(counter++).padStart(3, '0')}`,
      intern_id: intern.id, intern_name: intern.name,
      date: daysAgo(offset), status: attStatuses[di],
      notes: '', marked_by: 'Priya Sharma',
      marked_at: new Date(Date.now() - offset * 86400000).toISOString(),
    });
  });
});
db.set('attendance', attendance).write();

console.log('✅ Auto-seed complete! Admin, HR, and 12 interns created.');
