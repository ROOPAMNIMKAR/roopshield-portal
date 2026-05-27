/**
 * add-interns.js
 * Adds the 12 real interns directly to the database with auto-generated passwords.
 * Run: node add-interns.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

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

// Generate password: FirstName@RandomDigits
function generatePassword(name) {
  const firstName = (name || 'Intern').split(' ')[0];
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${firstName}@${digits}`;
}

// ─── Intern data parsed from your input ──────────────────────────────────────

const interns = [
  {
    name: 'Swayam Jitendra Bhope',
    email: 'swayambhope9@gmail.com',
    phone: '7972132582',
    city: 'Nagpur',
    education: '2 year B.Tech CSE Engineering',
    college: 'JD College of Engineering and Management',
    department: 'Web Development',
    role_title: 'Web Development Intern',
    skills: 'C++, HTML',
    applied_date: '5/20/2026',
  },
  {
    name: 'Riddhi Tekade',
    email: 'riddhitekade25@gmail.com',
    phone: '9890070233',
    city: 'Nagpur',
    education: '1st Year',
    college: 'St. Vincent Pallotti College of Engineering and Technology, Nagpur',
    department: 'Web Development',
    role_title: 'Web Development Intern',
    skills: 'Frontend',
    applied_date: '5/22/2026',
  },
  {
    name: 'Nandini Gokhale',
    email: 'gokhalenandini9@gmail.com',
    phone: '9158446276',
    city: 'Nagpur',
    education: 'B.Voc SD 1st Year',
    college: 'St. Vincent Pallotti College of Engineering and Technology',
    department: 'Web Development',
    role_title: 'Web Development Intern',
    skills: 'Power BI, Excel, MySQL Basics',
    applied_date: '5/22/2026',
  },
  {
    name: 'Shujal Sunil Gajbhiye',
    email: 'gajbhiyeshujal233@gmail.com',
    phone: '9765883785',
    city: 'Nagpur',
    education: 'B.Tech CSE 3rd Year',
    college: 'JD College of Engineering Nagpur',
    department: 'Web Development',
    role_title: 'Web Development Intern',
    skills: 'Python Basics, Problem Solving, Game Development Basics, GDScript, Quick Learner, Creativity',
    applied_date: '5/22/2026',
  },
  {
    name: 'Pritam Baramu',
    email: 'pritambaramu@gmail.com',
    phone: '9975739845',
    city: 'Nagpur',
    education: '3rd Year Pursuing',
    college: 'JD College of Engineering and Management',
    department: 'Marketing',
    role_title: 'Content Editor Intern',
    skills: 'C, Python, CSS, JS',
    applied_date: '5/22/2026',
  },
  {
    name: 'Shreyash Khushal Dhote',
    email: 'shreyashdhote362@gmail.com',
    phone: '8468871201',
    city: 'Nagpur',
    education: 'B.Tech',
    college: 'JD College of Engineering and Management Nagpur',
    department: 'Web Development',
    role_title: 'Web Development Intern',
    skills: 'Frontend Development',
    applied_date: '5/25/2026',
  },
  {
    name: 'Rohini Rajesh Gokhale',
    email: 'rohinigokhale15@gmail.com',
    phone: '7775963545',
    city: 'Nagpur',
    education: '1st Year',
    college: 'St. Vincent Pallotti College of Engineering and Technology',
    department: 'Web Development',
    role_title: 'Web Development Intern',
    skills: 'HTML, CSS',
    applied_date: '3/26/2026',
  },
  {
    name: 'Pooja Nanhe',
    email: 'poojananhe3@gmail.com',
    phone: '9545692409',
    city: 'Nagpur',
    education: '12th Passed',
    college: 'St. Vincent Pallotti College of Engineering and Technology',
    department: 'Cybersecurity',
    role_title: 'Cybersecurity Intern',
    skills: 'Fundamentals, Interview, Cybersecurity',
    applied_date: '3/27/2026',
  },
  {
    name: 'Shreyash Tijare',
    email: 'tijareshreyash47@gmail.com',
    phone: '8468925836',
    city: 'Nagpur',
    education: 'B.Voc',
    college: 'St. Vincent Pallotti College of Engineering and Technology',
    department: 'Cybersecurity',
    role_title: 'Cybersecurity Intern',
    skills: 'Cisco',
    applied_date: '3/28/2026',
  },
  {
    name: 'Hardik Kakade',
    email: 'yograjkakadey@gmail.com',
    phone: '9325538353',
    city: 'Nagpur',
    education: '1st Year',
    college: 'St. Vincent Pallotti College',
    department: 'Cybersecurity',
    role_title: 'Cybersecurity Intern',
    skills: 'Web and Ethical Hacking',
    applied_date: '4/3/2026',
  },
  {
    name: 'Naineet Hedaoo',
    email: 'naineethedaoo@gmail.com',
    phone: '9359306027',
    city: 'Nagpur',
    education: 'B.Tech',
    college: 'SVPCET',
    department: 'Web Development',
    role_title: 'Web Development Intern',
    skills: 'HTML, CSS',
    applied_date: '5/8/2026',
  },
  {
    name: 'Rushikesh Kawadkar',
    email: 'rushikeshkawadkar9@gmail.com',
    phone: '9699137038',
    city: 'Nagpur',
    education: 'B.Tech Computer Science and Engineering',
    college: 'JD College of Engineering and Management Nagpur',
    department: 'Web Development',
    role_title: 'Web Development Intern',
    skills: 'HTML, CSS, JS, Python',
    applied_date: '5/17/2026',
  },
];

// ─── Add each intern ──────────────────────────────────────────────────────────

console.log('\n📋 Adding interns to RoopShield Portal...\n');
console.log('─'.repeat(80));

const results = [];

for (const intern of interns) {
  // Check if email already exists
  const existing = db.get('users').find((u) => u.email === intern.email.toLowerCase()).value();
  if (existing) {
    console.log(`⚠️  SKIP  ${intern.name} — email already exists (${intern.email})`);
    continue;
  }

  const regNumber = generateRegNumber();
  const plainPassword = generatePassword(intern.name);
  const passwordHash = bcrypt.hashSync(plainPassword, 10);
  const id = uuidv4();
  const startDate = new Date().toISOString().split('T')[0]; // today
  const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +90 days

  const record = {
    id,
    reg_number: regNumber,
    name: intern.name,
    email: intern.email.toLowerCase(),
    password_hash: passwordHash,
    plain_password: plainPassword,
    role: 'intern',
    department: intern.department,
    phone: intern.phone,
    start_date: startDate,
    end_date: endDate,
    internship_type: 'Full-time',
    mentor: 'Priya Sharma',
    college: intern.college,
    stipend: null,
    photo_url: null,
    status: 'Active',
    created_at: new Date().toISOString(),
    // Extra info stored as notes
    education: intern.education,
    skills: intern.skills,
    city: intern.city,
    role_title: intern.role_title,
  };

  db.get('users').push(record).write();

  results.push({
    name: intern.name,
    regNumber,
    email: intern.email,
    password: plainPassword,
    department: intern.department,
  });

  console.log(`✅ ADDED  ${intern.name}`);
  console.log(`         Reg No  : ${regNumber}`);
  console.log(`         Email   : ${intern.email}`);
  console.log(`         Password: ${plainPassword}`);
  console.log(`         Dept    : ${intern.department}`);
  console.log('');
}

console.log('─'.repeat(80));
console.log(`\n✅ Done! Added ${results.length} intern(s).\n`);

// ─── Print credentials table ──────────────────────────────────────────────────

if (results.length > 0) {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                     INTERN LOGIN CREDENTIALS                                ║');
  console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
  results.forEach((r) => {
    console.log(`║  ${r.name.padEnd(28)} ${r.regNumber.padEnd(14)} ${r.password.padEnd(16)} ║`);
  });
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n  Columns: Name | Reg Number | Password');
  console.log('  Email = their personal email address\n');
}
