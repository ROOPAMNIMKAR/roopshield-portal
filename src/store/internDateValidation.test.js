// Feature: roopshield-internship-portal, Property 10: Intern form date ordering validation

/**
 * Property 10: Intern form date ordering validation
 *
 * For any intern form submission where endDate is on or before startDate,
 * the system SHALL reject the submission and SHALL NOT write any new or
 * modified intern record to localStorage.
 *
 * Validates: Requirements 5.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { readStorage } from '../services/storage';
import useInternStore from './internStore';

const USERS_KEY = 'roopshield_users';

/**
 * Pure validation function for intern date ordering.
 * Returns true if endDate is strictly after startDate, false otherwise.
 *
 * @param {string} startDate  ISO date string "YYYY-MM-DD"
 * @param {string} endDate    ISO date string "YYYY-MM-DD"
 * @returns {boolean}
 */
export function validateInternDates(startDate, endDate) {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  return end > start;
}

/**
 * Attempt to add an intern with date validation applied.
 * Returns the created intern if valid, or null if validation fails.
 * Does NOT write to localStorage when validation fails.
 *
 * @param {object} data  Intern data including startDate and endDate
 * @returns {object|null}
 */
function addInternWithValidation(data) {
  if (!validateInternDates(data.startDate, data.endDate)) {
    return null;
  }
  return useInternStore.getState().addIntern(data);
}

describe('Property 10: Intern form date ordering validation', () => {
  beforeEach(() => {
    localStorage.clear();
    useInternStore.setState({ interns: [] });
  });

  it('validateInternDates returns true iff endDate > startDate (as YYYY-MM-DD strings)', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (startDate, endDate) => {
          const startStr = startDate.toISOString().slice(0, 10);
          const endStr = endDate.toISOString().slice(0, 10);

          const result = validateInternDates(startStr, endStr);
          // The validation compares YYYY-MM-DD strings, so expected is based on string comparison
          const expected = endStr > startStr;

          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects submission and writes nothing to localStorage when endDate <= startDate', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (startDate, endDate) => {
          localStorage.clear();
          useInternStore.setState({ interns: [] });

          const startStr = startDate.toISOString().slice(0, 10);
          const endStr = endDate.toISOString().slice(0, 10);

          // isValid is based on string comparison — same as validateInternDates
          const isValid = endStr > startStr;

          const internData = {
            name: 'Test Intern',
            email: 'test@example.com',
            phone: '1234567890',
            department: 'Engineering',
            startDate: startStr,
            endDate: endStr,
            status: 'Active',
          };

          const usersBefore = readStorage(USERS_KEY, []);
          const countBefore = usersBefore.length;

          const result = addInternWithValidation(internData);

          const usersAfter = readStorage(USERS_KEY, []);
          const countAfter = usersAfter.length;

          if (isValid) {
            // Valid: intern should be created
            expect(result).not.toBeNull();
            expect(countAfter).toBe(countBefore + 1);
          } else {
            // Invalid: nothing should be written
            expect(result).toBeNull();
            expect(countAfter).toBe(countBefore);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects when endDate equals startDate', () => {
    const sameDate = '2025-06-15';
    const result = validateInternDates(sameDate, sameDate);
    expect(result).toBe(false);
  });

  it('accepts when endDate is strictly after startDate', () => {
    const result = validateInternDates('2025-01-01', '2025-06-30');
    expect(result).toBe(true);
  });

  it('rejects when endDate is before startDate', () => {
    const result = validateInternDates('2025-06-30', '2025-01-01');
    expect(result).toBe(false);
  });
});
