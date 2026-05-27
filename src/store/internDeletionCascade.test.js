// Feature: roopshield-internship-portal, Property 6: Intern deletion cascades completely

/**
 * Property 6: Intern deletion cascades completely
 *
 * For any intern record deleted from localStorage, all attendance records,
 * task assignments, and performance ratings referencing that intern's id
 * SHALL also be absent from localStorage after the deletion completes.
 *
 * Validates: Requirements 17.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { readStorage, writeStorage } from '../services/storage';
import useInternStore from './internStore';

const USERS_KEY = 'roopshield_users';
const ATTENDANCE_KEY = 'roopshield_attendance';
const TASKS_KEY = 'roopshield_tasks';
const RATINGS_KEY = 'roopshield_ratings';

// Arbitrary for a simple intern record
const internArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  email: fc.emailAddress(),
  role: fc.constant('intern'),
  department: fc.constantFrom('Engineering', 'Design', 'Marketing', 'Operations', 'Finance'),
  status: fc.constantFrom('Active', 'Inactive', 'Completed'),
});

// Arbitrary for an attendance record tied to a given internId
const attendanceRecordArb = (internId) =>
  fc.record({
    id: fc.uuid(),
    internId: fc.constant(internId),
    internName: fc.string({ minLength: 1, maxLength: 30 }),
    date: fc.date({ min: new Date('2025-01-01'), max: new Date('2025-12-31') }).map(
      (d) => d.toISOString().slice(0, 10)
    ),
    status: fc.constantFrom('Present', 'Absent', 'Late', 'Half-Day', 'Leave'),
    markedBy: fc.string({ minLength: 1, maxLength: 20 }),
    markedAt: fc.date().map((d) => d.toISOString()),
  });

// Arbitrary for a task assigned (at least) to a given internId
const taskArb = (internId) =>
  fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 40 }),
    assignedTo: fc
      .array(fc.uuid(), { minLength: 0, maxLength: 3 })
      .map((others) => [internId, ...others]),
    status: fc.constantFrom('To Do', 'In Progress', 'Under Review', 'Completed'),
    priority: fc.constantFrom('Low', 'Medium', 'High', 'Critical'),
    dueDate: fc.constant('2025-12-31'),
    createdBy: fc.constant('Admin'),
    createdAt: fc.date().map((d) => d.toISOString()),
    workLogs: fc.constant([]),
    statusHistory: fc.constant([]),
  });

// Arbitrary for a rating tied to a given internId
const ratingArb = (internId) =>
  fc.record({
    id: fc.uuid(),
    internId: fc.constant(internId),
    rating: fc.integer({ min: 1, max: 5 }),
    feedback: fc.string({ maxLength: 100 }),
    week: fc.string({ minLength: 1, maxLength: 10 }),
    createdBy: fc.constant('Admin'),
    createdAt: fc.date().map((d) => d.toISOString()),
  });

describe('Property 6: Intern deletion cascades completely', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset Zustand store state
    useInternStore.setState({ interns: [] });
  });

  it('deletes all related attendance, task, and rating records for the deleted intern', () => {
    fc.assert(
      fc.property(
        internArb,
        fc.array(attendanceRecordArb(fc.constant('')), { minLength: 0, maxLength: 5 }),
        fc.array(fc.uuid(), { minLength: 0, maxLength: 3 }),
        (intern, _unused, _unused2) => {
          // We'll generate the related records inline using the intern's actual id
          return true; // placeholder — real logic below
        }
      ),
      { numRuns: 1 } // placeholder
    );

    // Real property test using synchronous generation
    fc.assert(
      fc.property(
        internArb,
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 0, max: 4 }),
        fc.integer({ min: 0, max: 4 }),
        (intern, numAttendance, numTasks, numRatings) => {
          localStorage.clear();
          useInternStore.setState({ interns: [] });

          const internId = intern.id;

          // Seed the intern into users
          const otherUser = {
            id: 'other-user-id-fixed',
            name: 'Other User',
            email: 'other@test.com',
            role: 'intern',
            department: 'Engineering',
            status: 'Active',
          };
          writeStorage(USERS_KEY, [intern, otherUser]);

          // Create attendance records for the intern
          const attendanceForIntern = Array.from({ length: numAttendance }, (_, i) => ({
            id: `att-${internId}-${i}`,
            internId,
            internName: intern.name,
            date: `2025-01-${String(i + 1).padStart(2, '0')}`,
            status: 'Present',
            markedBy: 'Admin',
            markedAt: new Date().toISOString(),
          }));
          // Also add an unrelated attendance record
          const unrelatedAttendance = {
            id: 'att-other-fixed',
            internId: 'other-user-id-fixed',
            internName: 'Other User',
            date: '2025-06-01',
            status: 'Present',
            markedBy: 'Admin',
            markedAt: new Date().toISOString(),
          };
          writeStorage(ATTENDANCE_KEY, [...attendanceForIntern, unrelatedAttendance]);

          // Create tasks assigned to the intern (some exclusively, some shared)
          const tasksForIntern = Array.from({ length: numTasks }, (_, i) => ({
            id: `task-${internId}-${i}`,
            title: `Task ${i}`,
            assignedTo: [internId], // exclusively assigned
            status: 'To Do',
            priority: 'Medium',
            dueDate: '2025-12-31',
            createdBy: 'Admin',
            createdAt: new Date().toISOString(),
            workLogs: [],
            statusHistory: [],
          }));
          // A task shared with another intern
          const sharedTask = {
            id: `task-shared-fixed`,
            title: 'Shared Task',
            assignedTo: [internId, 'other-user-id-fixed'],
            status: 'To Do',
            priority: 'Low',
            dueDate: '2025-12-31',
            createdBy: 'Admin',
            createdAt: new Date().toISOString(),
            workLogs: [],
            statusHistory: [],
          };
          // An unrelated task
          const unrelatedTask = {
            id: 'task-other-fixed',
            title: 'Unrelated Task',
            assignedTo: ['other-user-id-fixed'],
            status: 'To Do',
            priority: 'Low',
            dueDate: '2025-12-31',
            createdBy: 'Admin',
            createdAt: new Date().toISOString(),
            workLogs: [],
            statusHistory: [],
          };
          writeStorage(TASKS_KEY, [...tasksForIntern, sharedTask, unrelatedTask]);

          // Create ratings for the intern
          const ratingsForIntern = Array.from({ length: numRatings }, (_, i) => ({
            id: `rating-${internId}-${i}`,
            internId,
            rating: 4,
            feedback: 'Good',
            week: `2025-W${String(i + 1).padStart(2, '0')}`,
            createdBy: 'Admin',
            createdAt: new Date().toISOString(),
          }));
          // Unrelated rating
          const unrelatedRating = {
            id: 'rating-other-fixed',
            internId: 'other-user-id-fixed',
            rating: 3,
            feedback: 'OK',
            week: '2025-W10',
            createdBy: 'Admin',
            createdAt: new Date().toISOString(),
          };
          writeStorage(RATINGS_KEY, [...ratingsForIntern, unrelatedRating]);

          // Perform the deletion
          useInternStore.getState().deleteIntern(internId);

          // Assert: intern is removed from users
          const usersAfter = readStorage(USERS_KEY, []);
          const internStillExists = usersAfter.some((u) => u.id === internId);
          expect(internStillExists).toBe(false);

          // Assert: no attendance records for the deleted intern
          const attendanceAfter = readStorage(ATTENDANCE_KEY, []);
          const attendanceForDeletedIntern = attendanceAfter.filter(
            (r) => r.internId === internId
          );
          expect(attendanceForDeletedIntern).toHaveLength(0);

          // Assert: unrelated attendance record is preserved
          const unrelatedAttendanceAfter = attendanceAfter.find(
            (r) => r.id === 'att-other-fixed'
          );
          expect(unrelatedAttendanceAfter).toBeDefined();

          // Assert: no tasks exclusively assigned to the deleted intern remain
          const tasksAfter = readStorage(TASKS_KEY, []);
          const exclusiveTasksForDeletedIntern = tasksAfter.filter(
            (t) => t.assignedTo.includes(internId)
          );
          expect(exclusiveTasksForDeletedIntern).toHaveLength(0);

          // Assert: shared task still exists but intern removed from assignedTo
          const sharedTaskAfter = tasksAfter.find((t) => t.id === 'task-shared-fixed');
          expect(sharedTaskAfter).toBeDefined();
          expect(sharedTaskAfter.assignedTo).not.toContain(internId);
          expect(sharedTaskAfter.assignedTo).toContain('other-user-id-fixed');

          // Assert: unrelated task is preserved
          const unrelatedTaskAfter = tasksAfter.find((t) => t.id === 'task-other-fixed');
          expect(unrelatedTaskAfter).toBeDefined();

          // Assert: no ratings for the deleted intern
          const ratingsAfter = readStorage(RATINGS_KEY, []);
          const ratingsForDeletedIntern = ratingsAfter.filter(
            (r) => r.internId === internId
          );
          expect(ratingsForDeletedIntern).toHaveLength(0);

          // Assert: unrelated rating is preserved
          const unrelatedRatingAfter = ratingsAfter.find(
            (r) => r.id === 'rating-other-fixed'
          );
          expect(unrelatedRatingAfter).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
