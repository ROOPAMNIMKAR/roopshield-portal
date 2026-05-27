# RoopShield Internship Portal — Complete Feature Reference

> **Tech Stack:** React 18 · Tailwind CSS · Zustand · React Router v6 · Vite · localStorage

---

## Quick Start

```
Run dev server:   node node_modules/vite/bin/vite.js
Open browser:     http://localhost:5173  (or 5174 if port is busy)

Reset all data:   Open browser console → localStorage.clear(); location.reload();
```

---

## Login Credentials

| Name | Email | Password | Role |
|------|-------|----------|------|
| Priya Sharma | admin@roopshield.com | Admin@2025 | **Admin** |
| Rahul Verma | rahul.verma@roopshield.com | Rahul@123 | Intern |
| Sneha Patel | sneha.patel@roopshield.com | Sneha@456 | Intern |
| Arjun Mehta | arjun.mehta@roopshield.com | Arjun@789 | Intern |
| Priyanka Nair | priyanka.nair@roopshield.com | Priya@321 | Intern |
| Kiran Joshi | kiran.joshi@roopshield.com | Kiran@654 | Intern |
| Vikram Singh | vikram.singh@roopshield.com | Vikram@111 | Intern |
| Ananya Roy | ananya.roy@roopshield.com | Ananya@222 | Intern |
| Rohan Gupta | rohan.gupta@roopshield.com | Rohan@333 | Intern |
| Meera Iyer | meera.iyer@roopshield.com | Meera@444 | Intern |
| Dev Sharma | dev.sharma@roopshield.com | Dev@5555 | Intern |

---

## localStorage Keys

| Key | Contents |
|-----|----------|
| `roopshield_users` | All user accounts (admin + interns) |
| `roopshield_attendance` | All attendance records |
| `roopshield_tasks` | All tasks with work logs and status history |
| `roopshield_announcements` | All announcements |
| `roopshield_ratings` | Performance ratings |
| `roopshield_doubts` | Intern questions and admin replies |
| `roopshield_resources` | Video guides posted by admin |
| `roopshield_guides` | Step-by-step task guides |
| `roopshield_theme` | Dark/light mode preference |

---

---

# ADMIN FEATURES

Login as: `admin@roopshield.com` / `Admin@2025`

---

## 1. Dashboard `/admin/dashboard`

- **4 stat cards** — Total Interns, Present Today, Tasks Assigned, Completed Tasks (live from localStorage)
- **Recent Attendance table** — 5 most recent records (intern name, date, status badge)
- **Task Status chart** — CSS bar chart showing distribution across To Do / In Progress / Under Review / Completed
- **Recent Activity Feed** — 5 most recent actions (intern added, task assigned, attendance marked) with actor + timestamp

---

## 2. Intern Management `/admin/interns`

- **3-column responsive card grid** — avatar, name, department, email, phone, duration, mentor, status badge
- **Add Intern** button → modal form with full validation
  - Required: Full Name, Email (format validated), Phone, Department, Start Date, End Date, Status
  - Optional: Internship Type, Mentor, College, Stipend, Photo URL
  - End Date must be after Start Date (validated)
- **Edit Intern** — pre-populated form, updates localStorage
- **Delete Intern** — ConfirmDialog → cascade deletes attendance, task assignments, ratings
- **Click card** → Intern Profile Modal (all details + attendance % + task counts by status)
- **Real-time search** (debounced 300ms) — filters by name, department, or status
- **Bulk selection** via checkboxes → bulk status change (Active / Inactive / Completed)
- **Empty state** — "No interns found matching your search."

---

## 3. Attendance Module `/admin/attendance`

### Tab 1 — Mark Attendance
- Date picker (defaults to today)
- Table of all active interns
- Status selector per intern: Present / Absent / Late / Half-Day / Leave (default: Present)
- Optional notes field per intern
- Submit saves all records; warns if overwriting existing record for that date

### Tab 2 — View Records
- Filter by: intern name, date range (start/end), status
- Results table with status badge, notes, marked-by
- **Export CSV** button → downloads `attendance_records_[date].csv`

### Tab 3 — Reports
- Per-intern summary table: Total, Present, Absent, Late, Half-Day, Leave, Attendance %
- Color-coded: ≥80% green / 60–79% amber / <60% red
- Monthly calendar view for selected intern (color-coded by status)
- Previous/next month navigation

---

## 4. Task Management `/admin/tasks`

- **Kanban board** — 4 columns: To Do / In Progress / Under Review / Completed
- Each column shows task count
- **Task cards** show: title, priority badge, intern avatars, due date (red if overdue), category, progress bar (logged/estimated hours)
- **Filter bar** — filter by intern, priority, category, due date range (real-time)
- **Assign Task** button → modal form
  - Required: Title, Assigned To (multi-select active interns), Priority, Due Date
  - Optional: Description, Category, Estimated Hours, Resource Links, Instructions
- **Task Detail Modal** on card click — all fields + full status history + all work logs
- **Delete task** from detail modal

---

## 5. Work Process `/admin/progress`

- **3 overview cards** — Overall Completion Rate, On-Time Delivery Rate, Average Task Duration
- **Per-intern progress table** — Assigned, Completed, In Progress, Overdue, Score (0–100)
- **Rate Intern** button → 1–5 star rating + feedback textarea → saves to localStorage
  - Upserts per (internId, week) — warns if overwriting existing week's rating
- **Past ratings accordion** — collapsible per intern, grouped by ISO week, shows stars + feedback + admin name
- **12-week contribution graph** — GitHub-style heatmap of work log activity per day

---

## 6. Announcements `/admin/announcements`

- Announcement cards with colored left border: blue (Info) / amber (Warning) / red (Important)
- **Post Announcement** button → modal form
  - Required: Title, Body
  - Required: Importance (Info / Warning / Important)
  - Visible To: All or specific department
- **Delete** with ConfirmDialog
- Sorted by newest first

---

## 7. Video Guides `/admin/resources`

- Post video resources (YouTube links embed as players automatically)
- Any URL works as a clickable resource card
- Fields: Title, URL, Description, Category, Visible To (All or department)
- Categories: General / Technical / Soft Skills / HR & Policy / Tools & Software / Other
- Delete with ConfirmDialog
- Interns see resources visible to their department

---

## 8. Task Guides `/admin/guides`

- Create step-by-step how-to guides for interns
- Fields: Title, Summary, Category, Visible To, Tags (comma-separated)
- **Steps** — add unlimited steps, each with optional heading + content
- Edit and delete guides
- Category filter bar
- Interns read guides in their Resources hub

---

## 9. Doubts & Questions `/admin/doubts`

- See all intern questions sorted by newest first
- Filter by status: All / Open / Replied / Resolved
- Open/Replied count badges in header
- **Reply** button → modal with intern's question + reply textarea
- **Edit Reply** — update existing reply
- **Mark Resolved** — closes the question
- Replied questions show reply with timestamp

---

## 10. Reports `/admin/reports`

Four report sections, each with Download CSV + Print button:

| Section | Columns |
|---------|---------|
| Attendance Summary | Intern, Total, Present, Absent, Late, Half-Day, Leave, Attendance % |
| Task Completion | Status, Count, Distribution bar |
| Intern Performance | Name, Dept, Tasks, Completed, Overdue, Score, Attendance, Rating |
| Department-wise Summary | Department, Total Interns, Active, Tasks Assigned, Completed |

- CSV filenames: `attendance_summary_[date].csv`, `task_completion_[date].csv`, etc.
- Print button triggers `window.print()` with print-optimized CSS

---

## 11. Credentials Manager `/admin/credentials`

- **Table of all intern logins** — name, department, email, password (masked)
- **Show/hide password** per row (eye icon)
- **Copy email** — copies to clipboard
- **Copy password** — copies to clipboard
- **Copy all credentials** — copies name + email + password as text block
- **Add Intern Login** button → form with name, email, department, password
  - Generate random strong password button
  - Validates: required fields, email format, duplicate email check, min 6 chars password
- **Reset Password** — set new password for any intern (with generate option)
- **Delete** intern login with confirmation
- Search by name, email, or department

---

---

# INTERN FEATURES

Login with any intern credential from the table above.

---

## 1. Dashboard `/intern/dashboard`

- **Welcome banner** — intern name + current date
- **4 stat cards** — Attendance %, Tasks Assigned, Tasks Completed, Tasks Pending
- **Today's attendance status** — shows current day's record or "Not marked yet"
- **5 most recent tasks** — with status badge + quick status-update dropdown
- **3 most recent announcements** — visible to intern's department, color-coded by importance
- **Latest performance rating** — star display + feedback text + week + admin name

---

## 2. My Profile `/intern/profile`

**Read-only fields:** Full Name, Email, Department, Status, Start/End Date, Mentor, College, Stipend, Internship Type

**Editable fields:** Phone (required), Emergency Contact, Address, LinkedIn URL

- **Profile completion progress bar** — % of optional fields filled (Phone, Emergency Contact, Address, LinkedIn URL, Photo URL)
- Save updates to localStorage → success toast

---

## 3. My Attendance `/intern/attendance`

- **Self-mark today's attendance** — status selector: Present / Late / Half-Day / Leave
  - Optional notes field
  - Shows existing record if already marked (can update)
  - Warning if not yet marked for today
- **7 summary stat cards** — Total, Present, Absent, Late, Half-Day, Leave, Attendance %
- **Monthly calendar grid** — color-coded: green Present / red Absent / amber Late / blue Half-Day / grey Leave / white Unmarked
- **Previous/next month navigation**

---

## 4. My Tasks `/intern/tasks`

- List of all tasks assigned to the logged-in intern
- Filter by status and priority
- Each task card shows: title, category, priority badge, status badge, due date (red if overdue), progress bar
- **Quick status update** dropdown per task (appends to statusHistory)
- **Add Work Log** button → modal form
  - Required: Date, Hours Worked (must be > 0, validated)
  - Optional: Notes
  - Validates and rejects ≤ 0 or non-numeric hours

---

## 5. Resources Hub `/intern/resources`

Three tabs in one page:

### Tab 1 — Task Guides
- Step-by-step guides posted by admin
- Click any guide card → full guide viewer modal
- Shows: title, category badge, summary, step count

### Tab 2 — Video Guides
- YouTube links embed as inline video players
- Other URLs shown as clickable resource cards
- Shows: title, description, category, posted by

### Tab 3 — Announcements
- All announcements visible to intern's department
- Color-coded left border: blue Info / amber Warning / red Important
- Sorted newest first

---

## 6. Ask Admin `/intern/doubts`

- **Submit a question** form — Subject (required) + Message (required)
- **My Questions list** — all submitted questions with status badge
  - Open (amber) — waiting for reply
  - Replied (blue) — admin has replied
  - Resolved (green) — marked resolved by admin
- Admin replies shown in blue box with timestamp
- Questions sorted newest first

---

---

# SHARED FEATURES (Both Roles)

## Authentication
- Login with email + password + role toggle (Admin | Intern)
- Session stored in sessionStorage (persists across page refreshes, cleared on logout)
- Role-based route protection — admin routes inaccessible to interns and vice versa
- Redirect to `/login` if unauthenticated

## Navigation
- **Desktop (≥768px):** Collapsible sidebar with role-appropriate links
- **Mobile (<768px):** Bottom tab bar with icons + labels
- **TopBar:** Logo, user name + avatar, dark mode toggle, notifications bell (tasks due today/tomorrow), global search, logout

## Global Search (TopBar)
- Searches intern names and task titles simultaneously
- Results shown in dropdown
- Click result navigates to relevant page

## Notifications Bell (TopBar)
- Badge count of tasks due today or tomorrow assigned to current user

## Dark Mode
- Toggle in TopBar
- Preference saved to `roopshield_theme` in localStorage
- Applied before first render (no flash)

## Toast Notifications
- Top-right corner, stacked
- Types: success (green) / error (red) / warning (amber)
- Auto-dismiss after 3 seconds
- Manual dismiss via close button
- Max 3 simultaneous toasts (oldest evicted on 4th)

## Data Persistence
- All data stored in browser localStorage
- JSON parse errors handled gracefully (reset + warning toast)
- Storage quota errors show error toast
- Full-page error if localStorage is completely unavailable

---

# FILE STRUCTURE

```
src/
├── App.jsx                          ← Root: providers + all routes
├── main.jsx
├── index.css
│
├── components/
│   ├── ThemeProvider.jsx
│   ├── ToastProvider.jsx
│   ├── InternForm.jsx               ← Add/Edit intern form
│   ├── TaskForm.jsx                 ← Add/Edit task form
│   ├── common/
│   │   ├── Avatar.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── CSVDownloadButton.jsx
│   │   ├── Modal.jsx
│   │   ├── PriorityBadge.jsx
│   │   ├── StarRating.jsx
│   │   ├── StatusBadge.jsx
│   │   └── index.js
│   ├── charts/
│   │   ├── AttendanceCalendar.jsx
│   │   ├── ContributionGraph.jsx
│   │   ├── KanbanBoard.jsx
│   │   └── KanbanColumn.jsx
│   └── layout/
│       ├── AdminLayout.jsx
│       ├── BottomTabBar.jsx
│       ├── InternLayout.jsx
│       ├── ProtectedLayout.jsx
│       ├── Sidebar.jsx
│       └── TopBar.jsx
│
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── AnnouncementModule.jsx
│   │   ├── AttendanceModule.jsx
│   │   ├── CredentialsManager.jsx   ← Manage intern logins/passwords
│   │   ├── DoubtsModule.jsx         ← View & reply to intern questions
│   │   ├── GuidesModule.jsx         ← Create step-by-step task guides
│   │   ├── InternManager.jsx
│   │   ├── ProgressModule.jsx
│   │   ├── ReportModule.jsx
│   │   ├── ResourcesModule.jsx      ← Post video guides
│   │   └── TaskModule.jsx
│   └── intern/
│       ├── InternAttendance.jsx     ← Self-mark attendance + calendar
│       ├── InternDashboard.jsx
│       ├── InternDoubts.jsx         ← Ask admin questions
│       ├── InternProfile.jsx
│       ├── InternResources.jsx      ← Guides + Videos + Announcements hub
│       └── InternTasks.jsx
│
├── store/
│   ├── announcementStore.js
│   ├── attendanceStore.js
│   ├── authStore.js
│   ├── doubtStore.js                ← Doubts/questions
│   ├── guideStore.js                ← Task guides
│   ├── internStore.js
│   ├── ratingStore.js
│   ├── resourceStore.js             ← Video resources
│   ├── taskStore.js
│   └── themeStore.js
│
├── services/
│   ├── seed.js                      ← Initial data (10 interns, 8 tasks, etc.)
│   └── storage.js                   ← localStorage wrapper
│
├── hooks/
│   ├── useDebounce.js
│   ├── useGlobalSearch.js
│   ├── useNotifications.js
│   └── useToast.js
│
└── utils/
    ├── csvExport.js
    ├── dateUtils.js
    └── uuid.js
```

---

# ADMIN ROUTES SUMMARY

| Route | Page |
|-------|------|
| `/admin/dashboard` | Dashboard |
| `/admin/interns` | Intern Management |
| `/admin/attendance` | Attendance Module |
| `/admin/tasks` | Task Management (Kanban) |
| `/admin/progress` | Work Process & Progress |
| `/admin/announcements` | Announcements |
| `/admin/resources` | Video Guides |
| `/admin/guides` | Task Guides |
| `/admin/credentials` | Credentials Manager |
| `/admin/doubts` | Intern Doubts & Questions |
| `/admin/reports` | Reports |

# INTERN ROUTES SUMMARY

| Route | Page |
|-------|------|
| `/intern/dashboard` | My Dashboard |
| `/intern/profile` | My Profile |
| `/intern/attendance` | My Attendance |
| `/intern/tasks` | My Tasks |
| `/intern/resources` | Resources Hub (Guides + Videos + Announcements) |
| `/intern/doubts` | Ask Admin |
