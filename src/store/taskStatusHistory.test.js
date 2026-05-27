// Feature: roopshield-internship-portal, Property 5: Task status history append-only invariant

/**
 * Property 5: Task status history append-only invariant
 *
 * For any task and any sequence of status updates, the statusHistory array
 * SHALL be strictly append-only: its length SHALL increase by exactly one
 * with each status change, and no existing entry SHALL be modified or removed.
 *
 * Validates: Requirements 8.3, 9.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { readStorage, writeStorage } from '../services/storage';
import useTaskStore from './taskStore';

const TASKS_KEY = 'roopshield_tasks';

const statusArb = fc.constantFrom('To Do', 'In Progress', 'Under Review', 'Completed');

/**
 * Create a minimal task and write it directly to localStorage.
 */
function seedTask(taskId, initialStatus = 'To Do') {
  const task = {
    id: taskId,
    title: 'Test Task',
    assignedTo: ['intern-1'],
    priority: 'Medium',
    dueDate: '2025-12-31',
    status: initialStatus,
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
    workLogs: [],
    statusHistory: [
      {
        status: initialStatus,
        changedBy: 'Admin',
        changedAt: new Date().toISOString(),
      },
    ],
  };
  const tasks = readStorage(TASKS_KEY, []);
  writeStorage(TASKS_KEY, [...tasks, task]);
  useTaskStore.setState({ tasks: [...tasks, task] });
  return task;
}

describe('Property 5: Task status history append-only invariant', () => {
  beforeEach(() => {
    localStorage.clear();
    useTaskStore.setState({ tasks: [] });
  });

  it('statusHistory length equals initialLength + numberOfUpdates after N status changes', () => {
    fc.assert(
      fc.property(
        fc.uuid(),                                                    // taskId
        fc.array(statusArb, { minLength: 1, maxLength: 10 }),        // sequence of status updates
        fc.string({ minLength: 1, maxLength: 20 }),                  // actorName
        (taskId, statusUpdates, actorName) => {
          localStorage.clear();
          useTaskStore.setState({ tasks: [] });

          // Seed the task with initial status 'To Do'
          const task = seedTask(taskId, 'To Do');
          const initialLength = task.statusHistory.length; // should be 1

          // Apply each status update
          for (const newStatus of statusUpdates) {
            useTaskStore.getState().updateTaskStatus(taskId, newStatus, actorName);
          }

          // Read back from localStorage
          const tasks = readStorage(TASKS_KEY, []);
          const updatedTask = tasks.find((t) => t.id === taskId);

          expect(updatedTask).toBeDefined();

          // Length must equal initialLength + number of updates
          expect(updatedTask.statusHistory.length).toBe(
            initialLength + statusUpdates.length
          );

          // The first entry (index 0) must be unchanged
          expect(updatedTask.statusHistory[0].status).toBe(task.statusHistory[0].status);
          expect(updatedTask.statusHistory[0].changedBy).toBe(task.statusHistory[0].changedBy);

          // Each subsequent entry must match the corresponding status update
          for (let i = 0; i < statusUpdates.length; i++) {
            const entry = updatedTask.statusHistory[initialLength + i];
            expect(entry.status).toBe(statusUpdates[i]);
            expect(entry.changedBy).toBe(actorName);
            expect(typeof entry.changedAt).toBe('string');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('no existing statusHistory entry is modified after subsequent updates', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(statusArb, { minLength: 2, maxLength: 8 }),
        (taskId, statusUpdates) => {
          localStorage.clear();
          useTaskStore.setState({ tasks: [] });

          seedTask(taskId, 'To Do');

          // Snapshot of history after each update
          const snapshots = [];

          for (const newStatus of statusUpdates) {
            useTaskStore.getState().updateTaskStatus(taskId, newStatus, 'Intern');

            const tasks = readStorage(TASKS_KEY, []);
            const t = tasks.find((x) => x.id === taskId);
            // Deep-copy the current history
            snapshots.push(JSON.parse(JSON.stringify(t.statusHistory)));
          }

          // Verify: for each snapshot, all entries that existed in the previous
          // snapshot are identical (append-only invariant)
          for (let i = 1; i < snapshots.length; i++) {
            const prev = snapshots[i - 1];
            const curr = snapshots[i];

            // Current must be longer by exactly 1
            expect(curr.length).toBe(prev.length + 1);

            // All previous entries must be unchanged
            for (let j = 0; j < prev.length; j++) {
              expect(curr[j]).toEqual(prev[j]);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
