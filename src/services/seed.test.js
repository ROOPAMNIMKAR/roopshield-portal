/**
 * seed.test.js
 *
 * Unit tests for services/seed.js — initSeed() function.
 *
 * Covers:
 *  - All five localStorage keys are written on first load (Req 1.1)
 *  - Correct admin and intern accounts are seeded (Req 1.2)
 *  - Five intern profiles are seeded (Req 1.3)
 *  - Eight tasks covering all four Kanban statuses (Req 1.4)
 *  - Fifteen attendance records (Req 1.5)
 *  - Three announcements with all importance levels (Req 1.6)
 *  - Idempotency: existing data is not overwritten (Req 1.7)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function freshSeed() {
  vi.resetModules();
  const { initSeed } = await import('./seed.js');
  return initSeed;
}

function readKey(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('initSeed — first load (empty localStorage)', () => {
  let initSeed;

  beforeEach(async () => {
    localStorage.clear();
    initSeed = await freshSeed();
    initSeed();
  });

  // Requirement 1.1 — all five keys are written
  it('writes roopshield_users to localStorage', () => {
    expect(readKey('roopshield_users')).not.toBeNull();
  });

  it('writes roopshield_tasks to localStorage', () => {
    expect(readKey('roopshield_tasks')).not.toBeNull();
  });

  it('writes roopshield_attendance to localStorage', () => {
    expect(readKey('roopshield_attendance')).not.toBeNull();
  });

  it('writes roopshield_announcements to localStorage', () => {
    expect(readKey('roopshield_announcements')).not.toBeNull();
  });

  it('writes roopshield_ratings to localStorage', () => {
    expect(readKey('roopshield_ratings')).not.toBeNull();
  });

  // Requirement 1.2 — admin and primary intern accounts
  it('seeds an admin account with correct credentials', () => {
    const users = readKey('roopshield_users');
    const admin = users.find((u) => u.role === 'admin');
    expect(admin).toBeDefined();
    expect(admin.email).toBe('admin@roopshield.com');
    expect(admin.password).toBe('admin123');
    expect(admin.name).toBe('Priya Sharma');
  });

  it('seeds the primary intern account with correct credentials', () => {
    const users = readKey('roopshield_users');
    const intern = users.find((u) => u.email === 'intern@roopshield.com');
    expect(intern).toBeDefined();
    expect(intern.password).toBe('intern123');
    expect(intern.role).toBe('intern');
    expect(intern.name).toBe('Rahul Verma');
  });

  // Requirement 1.3 — five intern profiles
  it('seeds exactly five intern profiles', () => {
    const users = readKey('roopshield_users');
    const interns = users.filter((u) => u.role === 'intern');
    expect(interns).toHaveLength(5);
  });

  it('seeds the five expected intern names', () => {
    const users = readKey('roopshield_users');
    const internNames = users.filter((u) => u.role === 'intern').map((u) => u.name);
    expect(internNames).toContain('Rahul Verma');
    expect(internNames).toContain('Sneha Patel');
    expect(internNames).toContain('Arjun Mehta');
    expect(internNames).toContain('Priyanka Nair');
    expect(internNames).toContain('Kiran Joshi');
  });

  it('seeds interns with the correct departments', () => {
    const users = readKey('roopshield_users');
    const byName = Object.fromEntries(
      users.filter((u) => u.role === 'intern').map((u) => [u.name, u])
    );
    expect(byName['Rahul Verma'].department).toBe('Engineering');
    expect(byName['Sneha Patel'].department).toBe('Design');
    expect(byName['Arjun Mehta'].department).toBe('Marketing');
    expect(byName['Priyanka Nair'].department).toBe('Operations');
    expect(byName['Kiran Joshi'].department).toBe('Finance');
  });

  it('seeds interns with the correct statuses', () => {
    const users = readKey('roopshield_users');
    const byName = Object.fromEntries(
      users.filter((u) => u.role === 'intern').map((u) => [u.name, u])
    );
    expect(byName['Rahul Verma'].status).toBe('Active');
    expect(byName['Sneha Patel'].status).toBe('Active');
    expect(byName['Arjun Mehta'].status).toBe('Active');
    expect(byName['Priyanka Nair'].status).toBe('Inactive');
    expect(byName['Kiran Joshi'].status).toBe('Completed');
  });

  // Requirement 1.4 — eight tasks covering all four Kanban columns
  it('seeds exactly eight tasks', () => {
    const tasks = readKey('roopshield_tasks');
    expect(tasks).toHaveLength(8);
  });

  it('seeds tasks covering all four Kanban statuses', () => {
    const tasks = readKey('roopshield_tasks');
    const statuses = new Set(tasks.map((t) => t.status));
    expect(statuses).toContain('To Do');
    expect(statuses).toContain('In Progress');
    expect(statuses).toContain('Under Review');
    expect(statuses).toContain('Completed');
  });

  it('every task has required fields', () => {
    const tasks = readKey('roopshield_tasks');
    tasks.forEach((task) => {
      expect(task.id).toBeTruthy();
      expect(task.title).toBeTruthy();
      expect(Array.isArray(task.assignedTo)).toBe(true);
      expect(task.priority).toBeTruthy();
      expect(task.dueDate).toBeTruthy();
      expect(task.status).toBeTruthy();
      expect(task.createdBy).toBeTruthy();
      expect(task.createdAt).toBeTruthy();
      expect(Array.isArray(task.workLogs)).toBe(true);
      expect(Array.isArray(task.statusHistory)).toBe(true);
      expect(task.statusHistory.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('every task statusHistory entry has required fields', () => {
    const tasks = readKey('roopshield_tasks');
    tasks.forEach((task) => {
      task.statusHistory.forEach((entry) => {
        expect(entry.status).toBeTruthy();
        expect(entry.changedBy).toBeTruthy();
        expect(entry.changedAt).toBeTruthy();
      });
    });
  });

  // Requirement 1.5 — fifteen attendance records
  it('seeds exactly fifteen attendance records', () => {
    const attendance = readKey('roopshield_attendance');
    expect(attendance).toHaveLength(15);
  });

  it('every attendance record has required fields', () => {
    const attendance = readKey('roopshield_attendance');
    attendance.forEach((record) => {
      expect(record.id).toBeTruthy();
      expect(record.internId).toBeTruthy();
      expect(record.internName).toBeTruthy();
      expect(record.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['Present', 'Absent', 'Late', 'Half-Day', 'Leave']).toContain(record.status);
      expect(record.markedBy).toBeTruthy();
      expect(record.markedAt).toBeTruthy();
    });
  });

  it('attendance records span dates within the last 14 days', () => {
    const attendance = readKey('roopshield_attendance');
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    twoWeeksAgo.setHours(0, 0, 0, 0);

    attendance.forEach((record) => {
      const d = new Date(record.date);
      expect(d.getTime()).toBeGreaterThanOrEqual(twoWeeksAgo.getTime());
      expect(d.getTime()).toBeLessThanOrEqual(today.getTime());
    });
  });

  // Requirement 1.6 — three announcements with all importance levels
  it('seeds exactly three announcements', () => {
    const announcements = readKey('roopshield_announcements');
    expect(announcements).toHaveLength(3);
  });

  it('seeds at least one announcement of each importance level', () => {
    const announcements = readKey('roopshield_announcements');
    const importanceLevels = new Set(announcements.map((a) => a.importance));
    expect(importanceLevels).toContain('Info');
    expect(importanceLevels).toContain('Warning');
    expect(importanceLevels).toContain('Important');
  });

  it('every announcement has required fields', () => {
    const announcements = readKey('roopshield_announcements');
    announcements.forEach((ann) => {
      expect(ann.id).toBeTruthy();
      expect(ann.title).toBeTruthy();
      expect(ann.body).toBeTruthy();
      expect(['Info', 'Warning', 'Important']).toContain(ann.importance);
      expect(ann.visibleTo).toBeTruthy();
      expect(ann.createdBy).toBeTruthy();
      expect(ann.createdAt).toBeTruthy();
    });
  });

  // Ratings — empty array initially
  it('seeds ratings as an empty array', () => {
    const ratings = readKey('roopshield_ratings');
    expect(Array.isArray(ratings)).toBe(true);
    expect(ratings).toHaveLength(0);
  });
});

// ─── Idempotency (Requirement 1.7) ────────────────────────────────────────────

describe('initSeed — idempotency when data already exists', () => {
  it('does not overwrite existing roopshield_users data', async () => {
    localStorage.clear();
    const existingUsers = [{ id: 'custom-001', email: 'custom@test.com', role: 'admin', name: 'Custom Admin' }];
    localStorage.setItem('roopshield_users', JSON.stringify(existingUsers));

    const initSeed = await freshSeed();
    initSeed();

    const users = readKey('roopshield_users');
    expect(users).toEqual(existingUsers);
  });

  it('does not write roopshield_tasks when users key already exists', async () => {
    localStorage.clear();
    localStorage.setItem('roopshield_users', JSON.stringify([{ id: 'u1' }]));
    // Ensure tasks key is absent before calling initSeed
    localStorage.removeItem('roopshield_tasks');

    const initSeed = await freshSeed();
    initSeed();

    // tasks should NOT have been written because the guard fired
    expect(readKey('roopshield_tasks')).toBeNull();
  });

  it('calling initSeed twice does not change the data written on first call', async () => {
    localStorage.clear();
    const initSeed = await freshSeed();
    initSeed();

    const usersAfterFirst = JSON.stringify(readKey('roopshield_users'));
    const tasksAfterFirst = JSON.stringify(readKey('roopshield_tasks'));

    // Second call — should be a no-op
    initSeed();

    expect(JSON.stringify(readKey('roopshield_users'))).toBe(usersAfterFirst);
    expect(JSON.stringify(readKey('roopshield_tasks'))).toBe(tasksAfterFirst);
  });
});
