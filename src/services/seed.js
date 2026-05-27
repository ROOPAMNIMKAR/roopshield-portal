/**
 * services/seed.js
 *
 * Initialises LocalStorage_DB with demo data on first application load.
 * The function is idempotent: if `roopshield_users` already exists the
 * entire function is a no-op, preserving any data the user has created.
 *
 * Satisfies Requirements 1.1 – 1.7.
 */

import { readStorage, writeStorage } from './storage';
import { formatDate } from '../utils/dateUtils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Return a "YYYY-MM-DD" string for a date that is `offsetDays` before today.
 * Negative values move into the future (not used here, but kept for clarity).
 *
 * @param {number} offsetDays  Positive = days in the past
 * @returns {string}
 */
function daysAgo(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return formatDate(d);
}

/**
 * Return a "YYYY-MM-DD" string for a date that is `offsetDays` after today.
 *
 * @param {number} offsetDays  Positive = days in the future
 * @returns {string}
 */
function daysFromNow(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDate(d);
}

// ─── Seed datasets ────────────────────────────────────────────────────────────

const NOW = new Date().toISOString();

// ── Users ─────────────────────────────────────────────────────────────────────

const SEED_USERS = [
  // Admin account
  {
    id: 'admin-001',
    email: 'admin@roopshield.com',
    password: 'Admin@2025',
    role: 'admin',
    name: 'Priya Sharma',
  },

  // HR account
  {
    id: 'hr-001',
    email: 'hr@roopshield.com',
    password: 'HR@2025',
    role: 'hr',
    name: 'Neha Kapoor',
  },

  // ── Intern accounts — each has a unique password and registration number ──
  {
    id: 'intern-001',
    regNumber: 'RS-2025-001',
    email: 'rahul.verma@roopshield.com',
    password: 'Rahul@123',
    role: 'intern',
    name: 'Rahul Verma',
    department: 'Engineering',
    phone: '9876543210',
    startDate: '2025-01-15',
    endDate: '2025-07-15',
    internshipType: 'Full-time',
    mentor: 'Priya Sharma',
    college: 'IIT Delhi',
    stipend: 15000,
    status: 'Active',
    createdAt: NOW,
  },
  {
    id: 'intern-002',
    regNumber: 'RS-2025-002',
    email: 'sneha.patel@roopshield.com',
    password: 'Sneha@456',
    role: 'intern',
    name: 'Sneha Patel',
    department: 'Design',
    phone: '9123456780',
    startDate: '2025-02-01',
    endDate: '2025-08-01',
    internshipType: 'Full-time',
    mentor: 'Priya Sharma',
    college: 'NID Ahmedabad',
    stipend: 12000,
    status: 'Active',
    createdAt: NOW,
  },
  {
    id: 'intern-003',
    regNumber: 'RS-2025-003',
    email: 'arjun.mehta@roopshield.com',
    password: 'Arjun@789',
    role: 'intern',
    name: 'Arjun Mehta',
    department: 'Marketing',
    phone: '9988776655',
    startDate: '2025-01-20',
    endDate: '2025-07-20',
    internshipType: 'Part-time',
    mentor: 'Priya Sharma',
    college: 'XLRI Jamshedpur',
    stipend: 10000,
    status: 'Active',
    createdAt: NOW,
  },
  {
    id: 'intern-004',
    regNumber: 'RS-2025-004',
    email: 'priyanka.nair@roopshield.com',
    password: 'Priya@321',
    role: 'intern',
    name: 'Priyanka Nair',
    department: 'Operations',
    phone: '9871234560',
    startDate: '2024-10-01',
    endDate: '2025-04-01',
    internshipType: 'Full-time',
    mentor: 'Priya Sharma',
    college: 'BITS Pilani',
    stipend: 13000,
    status: 'Inactive',
    createdAt: NOW,
  },
  {
    id: 'intern-005',
    regNumber: 'RS-2025-005',
    email: 'kiran.joshi@roopshield.com',
    password: 'Kiran@654',
    role: 'intern',
    name: 'Kiran Joshi',
    department: 'Finance',
    phone: '9765432100',
    startDate: '2024-07-01',
    endDate: '2025-01-01',
    internshipType: 'Full-time',
    mentor: 'Priya Sharma',
    college: 'IIM Bangalore',
    stipend: 18000,
    status: 'Completed',
    createdAt: NOW,
  },
  // ── 5 additional interns ──────────────────────────────────────────────────
  {
    id: 'intern-006',
    regNumber: 'RS-2025-006',
    email: 'vikram.singh@roopshield.com',
    password: 'Vikram@111',
    role: 'intern',
    name: 'Vikram Singh',
    department: 'Engineering',
    phone: '9812345670',
    startDate: '2025-03-01',
    endDate: '2025-09-01',
    internshipType: 'Full-time',
    mentor: 'Priya Sharma',
    college: 'NIT Trichy',
    stipend: 14000,
    status: 'Active',
    createdAt: NOW,
  },
  {
    id: 'intern-007',
    regNumber: 'RS-2025-007',
    email: 'ananya.roy@roopshield.com',
    password: 'Ananya@222',
    role: 'intern',
    name: 'Ananya Roy',
    department: 'Design',
    phone: '9823456781',
    startDate: '2025-03-15',
    endDate: '2025-09-15',
    internshipType: 'Remote',
    mentor: 'Priya Sharma',
    college: 'Srishti Institute',
    stipend: 11000,
    status: 'Active',
    createdAt: NOW,
  },
  {
    id: 'intern-008',
    regNumber: 'RS-2025-008',
    email: 'rohan.gupta@roopshield.com',
    password: 'Rohan@333',
    role: 'intern',
    name: 'Rohan Gupta',
    department: 'Finance',
    phone: '9834567892',
    startDate: '2025-02-15',
    endDate: '2025-08-15',
    internshipType: 'Full-time',
    mentor: 'Priya Sharma',
    college: 'SRCC Delhi',
    stipend: 16000,
    status: 'Active',
    createdAt: NOW,
  },
  {
    id: 'intern-009',
    regNumber: 'RS-2025-009',
    email: 'meera.iyer@roopshield.com',
    password: 'Meera@444',
    role: 'intern',
    name: 'Meera Iyer',
    department: 'Operations',
    phone: '9845678903',
    startDate: '2025-01-10',
    endDate: '2025-07-10',
    internshipType: 'Hybrid',
    mentor: 'Priya Sharma',
    college: 'Symbiosis Pune',
    stipend: 12500,
    status: 'Active',
    createdAt: NOW,
  },
  {
    id: 'intern-010',
    regNumber: 'RS-2025-010',
    email: 'dev.sharma@roopshield.com',
    password: 'Dev@5555',
    role: 'intern',
    name: 'Dev Sharma',
    department: 'Marketing',
    phone: '9856789014',
    startDate: '2025-04-01',
    endDate: '2025-10-01',
    internshipType: 'Part-time',
    mentor: 'Priya Sharma',
    college: 'Amity University',
    stipend: 9000,
    status: 'Active',
    createdAt: NOW,
  },
];

// ── Tasks ─────────────────────────────────────────────────────────────────────

const SEED_TASKS = [
  // To Do (2 tasks)
  {
    id: 'task-001',
    title: 'Design onboarding UI mockups',
    description: 'Create high-fidelity Figma mockups for the new intern onboarding flow.',
    assignedTo: ['intern-002'],
    priority: 'High',
    category: 'Design',
    dueDate: daysFromNow(7),
    estimatedHours: 16,
    status: 'To Do',
    createdBy: 'Priya Sharma',
    createdAt: NOW,
    workLogs: [],
    statusHistory: [
      { status: 'To Do', changedBy: 'Priya Sharma', changedAt: NOW },
    ],
  },
  {
    id: 'task-002',
    title: 'Prepare Q3 marketing campaign brief',
    description: 'Draft the campaign brief for the Q3 product launch targeting college students.',
    assignedTo: ['intern-003'],
    priority: 'Medium',
    category: 'Marketing',
    dueDate: daysFromNow(10),
    estimatedHours: 8,
    status: 'To Do',
    createdBy: 'Priya Sharma',
    createdAt: NOW,
    workLogs: [],
    statusHistory: [
      { status: 'To Do', changedBy: 'Priya Sharma', changedAt: NOW },
    ],
  },

  // In Progress (2 tasks)
  {
    id: 'task-003',
    title: 'Implement REST API integration for dashboard',
    description: 'Connect the admin dashboard widgets to the new analytics REST endpoints.',
    assignedTo: ['intern-001'],
    priority: 'Critical',
    category: 'Engineering',
    dueDate: daysFromNow(3),
    estimatedHours: 24,
    status: 'In Progress',
    createdBy: 'Priya Sharma',
    createdAt: daysAgo(5),
    workLogs: [],
    statusHistory: [
      { status: 'To Do', changedBy: 'Priya Sharma', changedAt: daysAgo(5) + 'T09:00:00.000Z' },
      { status: 'In Progress', changedBy: 'Rahul Verma', changedAt: daysAgo(3) + 'T10:30:00.000Z' },
    ],
  },
  {
    id: 'task-004',
    title: 'Vendor invoice reconciliation — June',
    description: 'Reconcile all vendor invoices for June against the purchase orders in the ERP.',
    assignedTo: ['intern-005'],
    priority: 'High',
    category: 'Finance',
    dueDate: daysFromNow(2),
    estimatedHours: 12,
    status: 'In Progress',
    createdBy: 'Priya Sharma',
    createdAt: daysAgo(4),
    workLogs: [],
    statusHistory: [
      { status: 'To Do', changedBy: 'Priya Sharma', changedAt: daysAgo(4) + 'T08:00:00.000Z' },
      { status: 'In Progress', changedBy: 'Kiran Joshi', changedAt: daysAgo(2) + 'T09:15:00.000Z' },
    ],
  },

  // Under Review (2 tasks)
  {
    id: 'task-005',
    title: 'Write SOP for intern onboarding process',
    description: 'Document the step-by-step standard operating procedure for onboarding new interns.',
    assignedTo: ['intern-004'],
    priority: 'Medium',
    category: 'Operations',
    dueDate: daysAgo(1),
    estimatedHours: 6,
    status: 'Under Review',
    createdBy: 'Priya Sharma',
    createdAt: daysAgo(10),
    workLogs: [],
    statusHistory: [
      { status: 'To Do', changedBy: 'Priya Sharma', changedAt: daysAgo(10) + 'T08:00:00.000Z' },
      { status: 'In Progress', changedBy: 'Priyanka Nair', changedAt: daysAgo(7) + 'T09:00:00.000Z' },
      { status: 'Under Review', changedBy: 'Priyanka Nair', changedAt: daysAgo(2) + 'T16:00:00.000Z' },
    ],
  },
  {
    id: 'task-006',
    title: 'Social media content calendar — July',
    description: 'Plan and schedule 30 days of social media posts across LinkedIn, Instagram, and Twitter.',
    assignedTo: ['intern-003'],
    priority: 'Low',
    category: 'Marketing',
    dueDate: daysAgo(2),
    estimatedHours: 10,
    status: 'Under Review',
    createdBy: 'Priya Sharma',
    createdAt: daysAgo(12),
    workLogs: [],
    statusHistory: [
      { status: 'To Do', changedBy: 'Priya Sharma', changedAt: daysAgo(12) + 'T08:00:00.000Z' },
      { status: 'In Progress', changedBy: 'Arjun Mehta', changedAt: daysAgo(9) + 'T10:00:00.000Z' },
      { status: 'Under Review', changedBy: 'Arjun Mehta', changedAt: daysAgo(3) + 'T15:30:00.000Z' },
    ],
  },

  // Completed (2 tasks)
  {
    id: 'task-007',
    title: 'Set up CI/CD pipeline for staging environment',
    description: 'Configure GitHub Actions workflow to auto-deploy the staging branch on every push.',
    assignedTo: ['intern-001'],
    priority: 'High',
    category: 'Engineering',
    dueDate: daysAgo(5),
    estimatedHours: 8,
    status: 'Completed',
    createdBy: 'Priya Sharma',
    createdAt: daysAgo(14),
    workLogs: [],
    statusHistory: [
      { status: 'To Do', changedBy: 'Priya Sharma', changedAt: daysAgo(14) + 'T08:00:00.000Z' },
      { status: 'In Progress', changedBy: 'Rahul Verma', changedAt: daysAgo(12) + 'T09:00:00.000Z' },
      { status: 'Under Review', changedBy: 'Rahul Verma', changedAt: daysAgo(8) + 'T17:00:00.000Z' },
      { status: 'Completed', changedBy: 'Priya Sharma', changedAt: daysAgo(5) + 'T11:00:00.000Z' },
    ],
  },
  {
    id: 'task-008',
    title: 'Brand identity refresh — logo variants',
    description: 'Produce three alternative logo variants for the RoopShield rebrand proposal.',
    assignedTo: ['intern-002'],
    priority: 'Medium',
    category: 'Design',
    dueDate: daysAgo(3),
    estimatedHours: 20,
    status: 'Completed',
    createdBy: 'Priya Sharma',
    createdAt: daysAgo(18),
    workLogs: [],
    statusHistory: [
      { status: 'To Do', changedBy: 'Priya Sharma', changedAt: daysAgo(18) + 'T08:00:00.000Z' },
      { status: 'In Progress', changedBy: 'Sneha Patel', changedAt: daysAgo(15) + 'T10:00:00.000Z' },
      { status: 'Under Review', changedBy: 'Sneha Patel', changedAt: daysAgo(6) + 'T16:00:00.000Z' },
      { status: 'Completed', changedBy: 'Priya Sharma', changedAt: daysAgo(3) + 'T14:00:00.000Z' },
    ],
  },
];

// ── Attendance ────────────────────────────────────────────────────────────────
// 15 records spread across the two calendar weeks prior to today.
// We pick 3 interns × 5 days each to reach exactly 15 records.

const ATTENDANCE_STATUSES = ['Present', 'Present', 'Present', 'Late', 'Absent'];

function buildAttendanceRecords() {
  const records = [];
  let counter = 1;

  // Interns to include in seed attendance (active ones + completed one for history)
  const attendees = [
    { id: 'intern-001', name: 'Rahul Verma' },
    { id: 'intern-002', name: 'Sneha Patel' },
    { id: 'intern-003', name: 'Arjun Mehta' },
  ];

  // Days: 5 days from week-2 ago + 5 days from last week, but we only need 5 per intern
  // Use offsets 14, 13, 12, 11, 10 for intern-001
  //             9,  8,  7,  6,  5 for intern-002
  //             4,  3,  2,  1,  0 (today) for intern-003 — skip today, use 4..1 + yesterday
  const dayOffsetGroups = [
    [14, 13, 12, 11, 10],
    [9, 8, 7, 6, 5],
    [4, 3, 2, 1, 0],
  ];

  attendees.forEach((intern, groupIdx) => {
    dayOffsetGroups[groupIdx].forEach((offset, dayIdx) => {
      records.push({
        id: `attendance-${String(counter).padStart(3, '0')}`,
        internId: intern.id,
        internName: intern.name,
        date: daysAgo(offset),
        status: ATTENDANCE_STATUSES[dayIdx],
        notes: '',
        markedBy: 'Priya Sharma',
        markedAt: new Date(Date.now() - offset * 86400000).toISOString(),
      });
      counter++;
    });
  });

  return records;
}

const SEED_ATTENDANCE = buildAttendanceRecords();

// ── Announcements ─────────────────────────────────────────────────────────────

const SEED_ANNOUNCEMENTS = [
  {
    id: 'announcement-001',
    title: 'Welcome to RoopShield Internship Portal',
    body: 'We are excited to launch the new Internship Management Portal. All interns can now track their attendance, tasks, and performance ratings in one place. Please log in and complete your profile at the earliest.',
    importance: 'Info',
    visibleTo: 'All',
    createdBy: 'Priya Sharma',
    createdAt: daysAgo(10) + 'T09:00:00.000Z',
  },
  {
    id: 'announcement-002',
    title: 'Mandatory Safety Training — 18 July 2025',
    body: 'All interns are required to attend the mandatory workplace safety training session on 18 July 2025 at 10:00 AM in Conference Room B. Attendance is compulsory. Please confirm your participation by replying to this announcement.',
    importance: 'Important',
    visibleTo: 'All',
    createdBy: 'Priya Sharma',
    createdAt: daysAgo(5) + 'T11:00:00.000Z',
  },
  {
    id: 'announcement-003',
    title: 'Deadline Reminder: July Deliverables',
    body: 'This is a reminder that all July deliverables are due by end of day on 25 July 2025. Please ensure your tasks are moved to "Under Review" before the deadline. Late submissions may affect your performance rating.',
    importance: 'Warning',
    visibleTo: 'All',
    createdBy: 'Priya Sharma',
    createdAt: daysAgo(2) + 'T08:30:00.000Z',
  },
];

// ── Ratings ───────────────────────────────────────────────────────────────────

const SEED_RATINGS = [];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialise LocalStorage_DB with seed data.
 *
 * Idempotent: if `roopshield_users` already exists the function returns
 * immediately without touching any localStorage key.
 *
 * Requirement 1.7 — skip when data already present.
 */
export function initSeed() {
  // Idempotency guard — Requirement 1.7
  const existingUsers = readStorage('roopshield_users', null);
  if (existingUsers !== null && existingUsers !== undefined) {
    // readStorage returns [] (the default fallback) when the key is absent,
    // but we passed null as the fallback so a non-null result means the key
    // genuinely exists in localStorage.
    return;
  }

  // Write all seed collections — Requirements 1.1 – 1.6
  writeStorage('roopshield_users', SEED_USERS);
  writeStorage('roopshield_tasks', SEED_TASKS);
  writeStorage('roopshield_attendance', SEED_ATTENDANCE);
  writeStorage('roopshield_announcements', SEED_ANNOUNCEMENTS);
  writeStorage('roopshield_ratings', SEED_RATINGS);
  writeStorage('roopshield_doubts', []);
  writeStorage('roopshield_resources', []);
  writeStorage('roopshield_guides', []);
  writeStorage('roopshield_leave_requests', []);
  writeStorage('roopshield_hr_notices', []);
  writeStorage('roopshield_hr_documents', []);
}
