/**
 * store/authRoleCredential.test.js
 *
 * Property 2: Authentication role-credential match
 *
 * Generate random (email, password, role) triples against a fixed user set;
 * assert login() succeeds iff all three fields match exactly.
 *
 * **Validates: Requirements 2.3, 2.4**
 *
 * Feature: roopshield-internship-portal, Property 2: Authentication role-credential match
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import useAuthStore from './authStore';

// ─── Fixed user set ────────────────────────────────────────────────────────────

const USERS_KEY = 'roopshield_users';

const FIXED_USERS = [
  {
    id: 'admin-001',
    name: 'Priya Sharma',
    email: 'admin@roopshield.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'intern-001',
    name: 'Rahul Verma',
    email: 'intern@roopshield.com',
    password: 'intern123',
    role: 'intern',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Seed localStorage with the fixed user set. */
function seedFixedUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(FIXED_USERS));
}

/** Reset Zustand store state and clear all storage. */
function resetAll() {
  useAuthStore.setState({ currentUser: null });
  localStorage.clear();
  sessionStorage.clear();
}

/**
 * Determine whether a given (email, password, role) triple should succeed
 * against the fixed user set — the ground-truth oracle.
 */
function shouldSucceed(email, password, role) {
  return FIXED_USERS.some(
    (u) => u.email === email && u.password === password && u.role === role
  );
}

// ─── Property test ────────────────────────────────────────────────────────────

describe('Property 2: Authentication role-credential match', () => {
  beforeEach(() => {
    resetAll();
    seedFixedUsers();
  });

  it(
    'login() succeeds iff email, password, AND role all match exactly (100 runs)',
    () => {
      fc.assert(
        fc.property(
          // Generate arbitrary strings for email and password
          fc.string(),
          fc.string(),
          // Role is always one of the two valid values
          fc.constantFrom('admin', 'intern'),
          (email, password, role) => {
            // Reset between each generated triple so state doesn't bleed
            resetAll();
            seedFixedUsers();

            const result = useAuthStore.getState().login(email, password, role);
            const expected = shouldSucceed(email, password, role);

            if (expected) {
              // All three fields matched — login must succeed
              expect(result.success).toBe(true);
              expect(result.user).toBeDefined();
              expect(result.user.email).toBe(email);
              expect(result.user.role).toBe(role);
              // currentUser must be set in the store (Requirement 2.4)
              expect(useAuthStore.getState().currentUser).not.toBeNull();
              expect(useAuthStore.getState().currentUser.email).toBe(email);
            } else {
              // At least one field did not match — login must fail
              expect(result.success).toBe(false);
              expect(result.error).toBe('Invalid credentials. Please try again.');
              // Store must remain untouched (Requirement 2.3)
              expect(useAuthStore.getState().currentUser).toBeNull();
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it(
    'login() fails for partial matches: correct email+password but wrong role',
    () => {
      fc.assert(
        fc.property(
          // Pick a real user from the fixed set
          fc.constantFrom(...FIXED_USERS),
          // Pick a role that is NOT the user's actual role
          fc.constantFrom('admin', 'intern'),
          (user, wrongRole) => {
            fc.pre(wrongRole !== user.role);

            resetAll();
            seedFixedUsers();

            const result = useAuthStore.getState().login(
              user.email,
              user.password,
              wrongRole
            );

            expect(result.success).toBe(false);
            expect(useAuthStore.getState().currentUser).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it(
    'login() fails for partial matches: correct email+role but wrong password',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...FIXED_USERS),
          fc.string(),
          (user, wrongPassword) => {
            fc.pre(wrongPassword !== user.password);

            resetAll();
            seedFixedUsers();

            const result = useAuthStore.getState().login(
              user.email,
              wrongPassword,
              user.role
            );

            expect(result.success).toBe(false);
            expect(useAuthStore.getState().currentUser).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it(
    'login() fails for partial matches: correct password+role but wrong email',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...FIXED_USERS),
          fc.string(),
          (user, wrongEmail) => {
            fc.pre(wrongEmail !== user.email);

            resetAll();
            seedFixedUsers();

            const result = useAuthStore.getState().login(
              wrongEmail,
              user.password,
              user.role
            );

            expect(result.success).toBe(false);
            expect(useAuthStore.getState().currentUser).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
