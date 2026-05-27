// Feature: roopshield-internship-portal, Property 3: Attendance record upsert correctness

/**
 * Property 3: Attendance record upsert correctness
 *
 * For any intern and date, marking attendance SHALL result in exactly one
 * attendance record for that (internId, date) pair in localStorage —
 * never zero and never more than one, regardless of how many times the
 * mark-attendance action is called.
 *
 * Validates: Requirements 6.4, 6.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { readStorage } from '../services/storage';
import useAttendanceStore from './attendanceStore';

const ATTENDANCE_KEY = 'roopshield_attendance';

const statusArb = fc.constantFrom('Present', 'Absent', 'Late', 'Half-Day', 'Leave');

describe('Property 3: Attendance record upsert correctness', () => {
  beforeEach(() => {
    localStorage.clear();
    useAttendanceStore.setState({ records: [] });
  });

  it('results in exactly one record per (internId, date) pair after N mark-attendance calls', () => {
    fc.assert(
      fc.property(
        fc.uuid(),                                          // internId
        fc.date({ min: new Date('2025-01-01'), max: new Date('2025-12-31') })
          .map((d) => d.toISOString().slice(0, 10)),       // date string
        fc.integer({ min: 1, max: 10 }),                   // N calls
        fc.array(statusArb, { minLength: 10, maxLength: 10 }), // statuses pool
        (internId, date, n, statuses) => {
          localStorage.clear();
          useAttendanceStore.setState({ records: [] });

          // Call markAttendance N times for the same (internId, date)
          for (let i = 0; i < n; i++) {
            const record = {
              id: `att-${internId}-${i}`,
              internId,
              internName: 'Test Intern',
              date,
              status: statuses[i % statuses.length],
              notes: '',
              markedBy: 'Admin',
              markedAt: new Date().toISOString(),
            };
            useAttendanceStore.getState().markAttendance([record]);
          }

          // Assert exactly one record for (internId, date)
          const records = readStorage(ATTENDANCE_KEY, []);
          const matching = records.filter(
            (r) => r.internId === internId && r.date === date
          );

          expect(matching.length).toBe(1);

          // The last status written should be the one that persists
          const lastStatus = statuses[(n - 1) % statuses.length];
          expect(matching[0].status).toBe(lastStatus);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('preserves records for other (internId, date) pairs when upserting', () => {
    fc.assert(
      fc.property(
        fc.uuid(),  // internId A
        fc.uuid(),  // internId B (different)
        fc.integer({ min: 1, max: 5 }),
        (internIdA, internIdB, n) => {
          // Ensure the two IDs are different
          fc.pre(internIdA !== internIdB);

          localStorage.clear();
          useAttendanceStore.setState({ records: [] });

          const date = '2025-06-15';

          // Mark attendance for intern A multiple times
          for (let i = 0; i < n; i++) {
            useAttendanceStore.getState().markAttendance([
              {
                id: `att-a-${i}`,
                internId: internIdA,
                internName: 'Intern A',
                date,
                status: 'Present',
                markedBy: 'Admin',
                markedAt: new Date().toISOString(),
              },
            ]);
          }

          // Mark attendance for intern B once
          useAttendanceStore.getState().markAttendance([
            {
              id: 'att-b-0',
              internId: internIdB,
              internName: 'Intern B',
              date,
              status: 'Absent',
              markedBy: 'Admin',
              markedAt: new Date().toISOString(),
            },
          ]);

          const records = readStorage(ATTENDANCE_KEY, []);

          // Exactly one record for intern A
          const forA = records.filter((r) => r.internId === internIdA && r.date === date);
          expect(forA.length).toBe(1);

          // Exactly one record for intern B
          const forB = records.filter((r) => r.internId === internIdB && r.date === date);
          expect(forB.length).toBe(1);
          expect(forB[0].status).toBe('Absent');
        }
      ),
      { numRuns: 100 }
    );
  });
});
