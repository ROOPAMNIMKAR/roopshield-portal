// Feature: roopshield-internship-portal, Property 4: Task work log hours validation

/**
 * Property 4: Task work log hours validation
 *
 * For any work log submission, the system SHALL reject the entry and leave
 * workLogs unchanged if and only if hoursWorked is not a positive number
 * (i.e., <= 0 or non-numeric).
 *
 * Validates: Requirements 9.3, 9.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { readStorage, writeStorage } from '../services/storage';
import useTaskStore from './taskStore';

const TASKS_KEY = 'roopshield_tasks';

/**
 * Seed a task with an empty workLogs array into localStorage.
 */
function seedTask(taskId) {
  const task = {
    id: taskId,
    title: 'Test Task',
    assignedTo: ['intern-1'],
    priority: 'Medium',
    dueDate: '2025-12-31',
    status: 'In Progress',
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
    workLogs: [],
    statusHistory: [
      { status: 'To Do', changedBy: 'Admin', changedAt: new Date().toISOString() },
    ],
  };
  writeStorage(TASKS_KEY, [task]);
  useTaskStore.setState({ tasks: [task] });
  return task;
}

describe('Property 4: Task work log hours validation', () => {
  beforeEach(() => {
    localStorage.clear();
    useTaskStore.setState({ tasks: [] });
  });

  it('rejects non-positive numeric hoursWorked and leaves workLogs unchanged', () => {
    // Generate non-positive numbers: 0, negative floats, negative integers
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.oneof(
          fc.constant(0),
          fc.double({ min: -1000, max: Math.fround(-0.001), noNaN: true }),
          fc.integer({ min: -1000, max: -1 })
        ),
        (taskId, hoursWorked) => {
          localStorage.clear();
          useTaskStore.setState({ tasks: [] });
          seedTask(taskId);

          const result = useTaskStore.getState().addWorkLog(taskId, {
            hoursWorked,
            date: '2025-01-01',
            notes: '',
            loggedBy: 'Test',
          });

          expect(result).toBe(false);

          const tasks = readStorage(TASKS_KEY, []);
          const task = tasks.find((t) => t.id === taskId);
          expect(task.workLogs).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects NaN hoursWorked and leaves workLogs unchanged', () => {
    const taskId = 'task-nan-test';
    seedTask(taskId);

    const result = useTaskStore.getState().addWorkLog(taskId, {
      hoursWorked: NaN,
      date: '2025-01-01',
      notes: '',
      loggedBy: 'Test',
    });

    expect(result).toBe(false);
    const tasks = readStorage(TASKS_KEY, []);
    const task = tasks.find((t) => t.id === taskId);
    expect(task.workLogs).toHaveLength(0);
  });

  it('rejects string hoursWorked and leaves workLogs unchanged', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 0, maxLength: 20 }),
        (taskId, hoursStr) => {
          localStorage.clear();
          useTaskStore.setState({ tasks: [] });
          seedTask(taskId);

          const result = useTaskStore.getState().addWorkLog(taskId, {
            hoursWorked: hoursStr,
            date: '2025-01-01',
            notes: '',
            loggedBy: 'Test',
          });

          expect(result).toBe(false);

          const tasks = readStorage(TASKS_KEY, []);
          const task = tasks.find((t) => t.id === taskId);
          expect(task.workLogs).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accepts positive numeric hoursWorked and appends to workLogs', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.double({ min: Math.fround(0.001), max: 24, noNaN: true }),
        (taskId, hoursWorked) => {
          localStorage.clear();
          useTaskStore.setState({ tasks: [] });
          seedTask(taskId);

          const result = useTaskStore.getState().addWorkLog(taskId, {
            hoursWorked,
            date: '2025-01-01',
            notes: 'Some work done',
            loggedBy: 'Test',
          });

          expect(result).toBe(true);

          const tasks = readStorage(TASKS_KEY, []);
          const task = tasks.find((t) => t.id === taskId);
          expect(task.workLogs).toHaveLength(1);
          expect(task.workLogs[0].hoursWorked).toBe(hoursWorked);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects iff hoursWorked is not a positive number — combined property', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.oneof(
          // Valid: positive numbers
          fc.double({ min: Math.fround(0.001), max: 100, noNaN: true }),
          fc.integer({ min: 1, max: 100 }),
          // Invalid: zero, negative, NaN
          fc.constant(0),
          fc.double({ min: -100, max: Math.fround(-0.001), noNaN: true }),
          fc.integer({ min: -100, max: -1 }),
          fc.constant(NaN),
          // Invalid: strings
          fc.string({ minLength: 0, maxLength: 10 })
        ),
        (taskId, hoursWorked) => {
          localStorage.clear();
          useTaskStore.setState({ tasks: [] });
          seedTask(taskId);

          const isValid =
            typeof hoursWorked === 'number' &&
            !isNaN(hoursWorked) &&
            hoursWorked > 0;

          const result = useTaskStore.getState().addWorkLog(taskId, {
            hoursWorked,
            date: '2025-01-01',
            notes: '',
            loggedBy: 'Test',
          });

          const tasks = readStorage(TASKS_KEY, []);
          const task = tasks.find((t) => t.id === taskId);

          if (isValid) {
            expect(result).toBe(true);
            expect(task.workLogs).toHaveLength(1);
          } else {
            expect(result).toBe(false);
            expect(task.workLogs).toHaveLength(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
