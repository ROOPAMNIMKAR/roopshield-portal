// Feature: roopshield-internship-portal, Property 9: localStorage JSON round-trip fidelity

/**
 * Property 9: localStorage JSON round-trip fidelity
 *
 * For each data model (User, AttendanceRecord, Task, Announcement, PerformanceRating),
 * generate random instances, write them to localStorage via writeStorage, read them
 * back via readStorage, and assert deep equality with the original.
 *
 * Validates: Requirements 17.1, 17.2
 */

import { describe, it, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { readStorage, writeStorage } from '../services/storage';

const TEST_KEY = 'roopshield_test_roundtrip';

// ---------------------------------------------------------------------------
// Arbitraries for each data model
// ---------------------------------------------------------------------------

/** Non-empty printable string (avoids surrogate-pair edge cases in JSON) */
const printableString = fc.string({ minLength: 1, maxLength: 64 });

/** Optional string — either undefined (omitted) or a non-empty string */
const optionalString = fc.option(printableString, { nil: undefined });

// --- User ---
const userArb = fc.record({
  id: printableString,
  name: printableString,
  email: fc.emailAddress(),
  password: printableString,
  role: fc.constantFrom('admin', 'intern'),
  department: optionalString,
  phone: optionalString,
  startDate: optionalString,
  endDate: optionalString,
  status: fc.option(fc.constantFrom('Active', 'Inactive', 'Completed'), { nil: undefined }),
});

// --- AttendanceRecord ---
const attendanceRecordArb = fc.record({
  id: printableString,
  internId: printableString,
  internName: printableString,
  date: fc
    .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    .map((d) => d.toISOString().slice(0, 10)),
  status: fc.constantFrom('Present', 'Absent', 'Late', 'Half-Day', 'Leave'),
  notes: optionalString,
  markedBy: printableString,
  markedAt: fc
    .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    .map((d) => d.toISOString()),
});

// --- Task ---
const taskArb = fc.record({
  id: printableString,
  title: printableString,
  assignedTo: fc.array(printableString, { minLength: 1, maxLength: 5 }),
  priority: fc.constantFrom('Low', 'Medium', 'High', 'Critical'),
  dueDate: fc
    .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    .map((d) => d.toISOString().slice(0, 10)),
  status: fc.constantFrom('To Do', 'In Progress', 'Under Review', 'Completed'),
  createdBy: printableString,
  createdAt: fc
    .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    .map((d) => d.toISOString()),
  workLogs: fc.constant([]),
  statusHistory: fc.constant([]),
});

// --- Announcement ---
const announcementArb = fc.record({
  id: printableString,
  title: printableString,
  body: printableString,
  importance: fc.constantFrom('Info', 'Warning', 'Important'),
  visibleTo: printableString,
  createdBy: printableString,
  createdAt: fc
    .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    .map((d) => d.toISOString()),
});

// --- PerformanceRating ---
const performanceRatingArb = fc.record({
  id: printableString,
  internId: printableString,
  rating: fc.integer({ min: 1, max: 5 }),
  feedback: optionalString,
  week: printableString,
  createdBy: printableString,
  createdAt: fc
    .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    .map((d) => d.toISOString()),
});

// ---------------------------------------------------------------------------
// Helper: strip undefined fields so JSON round-trip comparison is fair.
// JSON.stringify drops undefined values; we mirror that in the expected object.
// ---------------------------------------------------------------------------
function stripUndefined(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// Property tests
// ---------------------------------------------------------------------------

describe('Property 9: localStorage JSON round-trip fidelity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.removeItem(TEST_KEY);
  });

  it('User objects survive a JSON round-trip through localStorage', () => {
    // Validates: Requirements 17.1, 17.2
    fc.assert(
      fc.property(userArb, (user) => {
        const expected = [stripUndefined(user)];

        writeStorage(TEST_KEY, [user]);
        const actual = readStorage(TEST_KEY, []);

        expect(actual).toEqual(expected);
      }),
      { numRuns: 100 },
    );
  });

  it('AttendanceRecord objects survive a JSON round-trip through localStorage', () => {
    // Validates: Requirements 17.1, 17.2
    fc.assert(
      fc.property(attendanceRecordArb, (record) => {
        const expected = [stripUndefined(record)];

        writeStorage(TEST_KEY, [record]);
        const actual = readStorage(TEST_KEY, []);

        expect(actual).toEqual(expected);
      }),
      { numRuns: 100 },
    );
  });

  it('Task objects survive a JSON round-trip through localStorage', () => {
    // Validates: Requirements 17.1, 17.2
    fc.assert(
      fc.property(taskArb, (task) => {
        const expected = [stripUndefined(task)];

        writeStorage(TEST_KEY, [task]);
        const actual = readStorage(TEST_KEY, []);

        expect(actual).toEqual(expected);
      }),
      { numRuns: 100 },
    );
  });

  it('Announcement objects survive a JSON round-trip through localStorage', () => {
    // Validates: Requirements 17.1, 17.2
    fc.assert(
      fc.property(announcementArb, (announcement) => {
        const expected = [stripUndefined(announcement)];

        writeStorage(TEST_KEY, [announcement]);
        const actual = readStorage(TEST_KEY, []);

        expect(actual).toEqual(expected);
      }),
      { numRuns: 100 },
    );
  });

  it('PerformanceRating objects survive a JSON round-trip through localStorage', () => {
    // Validates: Requirements 17.1, 17.2
    fc.assert(
      fc.property(performanceRatingArb, (rating) => {
        const expected = [stripUndefined(rating)];

        writeStorage(TEST_KEY, [rating]);
        const actual = readStorage(TEST_KEY, []);

        expect(actual).toEqual(expected);
      }),
      { numRuns: 100 },
    );
  });
});
