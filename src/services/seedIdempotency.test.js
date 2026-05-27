/**
 * seedIdempotency.test.js
 *
 * Property-based test for seed idempotency.
 *
 * Feature: roopshield-internship-portal, Property 1: Seed data is idempotent
 *
 * **Validates: Requirements 1.7**
 *
 * When `roopshield_users` already exists in localStorage, calling `initSeed()`
 * must be a complete no-op: the users key must remain byte-for-byte identical
 * and no other roopshield keys (tasks, attendance, announcements, ratings)
 * must be written.
 */

// Feature: roopshield-internship-portal, Property 1: Seed data is idempotent

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Re-import seed.js fresh each time so module-level constants (like NOW) do
 * not bleed between runs.
 */
async function freshInitSeed() {
  vi.resetModules();
  const { initSeed } = await import('./seed.js');
  return initSeed;
}

const ROOPSHIELD_KEYS = [
  'roopshield_users',
  'roopshield_tasks',
  'roopshield_attendance',
  'roopshield_announcements',
  'roopshield_ratings',
];

// ─── Arbitrary: array of user-like objects with at least an `id` field ────────

const arbitraryUser = fc.record({
  id: fc.string({ minLength: 1, maxLength: 40 }),
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 60 }),
  role: fc.constantFrom('admin', 'intern'),
});

const arbitraryUserArray = fc.array(arbitraryUser, { minLength: 0, maxLength: 20 });

// ─── Property test ────────────────────────────────────────────────────────────

describe('Property 1: Seed data is idempotent — Validates: Requirements 1.7', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it(
    'when roopshield_users already exists, initSeed() leaves it unchanged and writes no other roopshield keys',
    async () => {
      await fc.assert(
        fc.asyncProperty(arbitraryUserArray, async (users) => {
          // ── Arrange ──────────────────────────────────────────────────────
          localStorage.clear();

          // Pre-populate localStorage with the generated user data
          localStorage.setItem('roopshield_users', JSON.stringify(users));

          // Capture the exact serialised value before calling initSeed
          const usersBeforeCall = localStorage.getItem('roopshield_users');

          // ── Act ───────────────────────────────────────────────────────────
          const initSeed = await freshInitSeed();
          initSeed();

          // ── Assert 1: roopshield_users is byte-for-byte unchanged ─────────
          const usersAfterCall = localStorage.getItem('roopshield_users');
          expect(usersAfterCall).toEqual(usersBeforeCall);

          // Deep-equality check as well
          expect(JSON.parse(usersAfterCall)).toEqual(users);

          // ── Assert 2: no other roopshield keys were written ───────────────
          const otherKeys = ROOPSHIELD_KEYS.filter((k) => k !== 'roopshield_users');
          for (const key of otherKeys) {
            expect(localStorage.getItem(key)).toBeNull();
          }
        }),
        { numRuns: 100 },
      );
    },
  );
});
