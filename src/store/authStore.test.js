/**
 * store/authStore.test.js
 *
 * Unit tests for the authStore: login, logout, restoreSession.
 *
 * The jsdom environment provides localStorage and sessionStorage mocks
 * (cleared before each test by src/test/setup.js).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import useAuthStore from './authStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const USERS_KEY = 'roopshield_users';
const SESSION_KEY = 'roopshield_session';

/** Seed localStorage with a minimal set of users for testing. */
function seedUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Reset Zustand store state between tests. */
function resetStore() {
  useAuthStore.setState({ currentUser: null });
}

const ADMIN_USER = {
  id: 'admin-001',
  name: 'Priya Sharma',
  email: 'admin@roopshield.com',
  password: 'admin123',
  role: 'admin',
};

const INTERN_USER = {
  id: 'intern-001',
  name: 'Rahul Verma',
  email: 'intern@roopshield.com',
  password: 'intern123',
  role: 'intern',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('authStore', () => {
  beforeEach(() => {
    resetStore();
  });

  // ── login ──────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('returns success and sets currentUser when credentials match exactly', () => {
      seedUsers([ADMIN_USER]);

      const result = useAuthStore.getState().login('admin@roopshield.com', 'admin123', 'admin');

      expect(result.success).toBe(true);
      expect(result.user).toMatchObject({
        id: 'admin-001',
        name: 'Priya Sharma',
        email: 'admin@roopshield.com',
        role: 'admin',
      });
      expect(useAuthStore.getState().currentUser).toMatchObject({
        id: 'admin-001',
        role: 'admin',
      });
    });

    it('persists session to sessionStorage on successful login', () => {
      seedUsers([ADMIN_USER]);

      useAuthStore.getState().login('admin@roopshield.com', 'admin123', 'admin');

      const raw = sessionStorage.getItem(SESSION_KEY);
      expect(raw).not.toBeNull();
      const session = JSON.parse(raw);
      expect(session).toMatchObject({
        id: 'admin-001',
        email: 'admin@roopshield.com',
        role: 'admin',
      });
    });

    it('does NOT store the password in sessionStorage', () => {
      seedUsers([ADMIN_USER]);

      useAuthStore.getState().login('admin@roopshield.com', 'admin123', 'admin');

      const raw = sessionStorage.getItem(SESSION_KEY);
      const session = JSON.parse(raw);
      expect(session.password).toBeUndefined();
    });

    it('returns failure when email does not match', () => {
      seedUsers([ADMIN_USER]);

      const result = useAuthStore.getState().login('wrong@roopshield.com', 'admin123', 'admin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials. Please try again.');
      expect(useAuthStore.getState().currentUser).toBeNull();
    });

    it('returns failure when password does not match', () => {
      seedUsers([ADMIN_USER]);

      const result = useAuthStore.getState().login('admin@roopshield.com', 'wrongpass', 'admin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials. Please try again.');
    });

    it('returns failure when role does not match (Requirement 2.3 — no partial match)', () => {
      seedUsers([ADMIN_USER]);

      // Correct email + password but wrong role
      const result = useAuthStore.getState().login('admin@roopshield.com', 'admin123', 'intern');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials. Please try again.');
      expect(useAuthStore.getState().currentUser).toBeNull();
    });

    it('returns failure when user list is empty', () => {
      seedUsers([]);

      const result = useAuthStore.getState().login('admin@roopshield.com', 'admin123', 'admin');

      expect(result.success).toBe(false);
    });

    it('returns failure when localStorage has no users key', () => {
      // localStorage is empty (cleared by setup.js beforeEach)
      const result = useAuthStore.getState().login('admin@roopshield.com', 'admin123', 'admin');

      expect(result.success).toBe(false);
    });

    it('works correctly for intern role', () => {
      seedUsers([ADMIN_USER, INTERN_USER]);

      const result = useAuthStore.getState().login('intern@roopshield.com', 'intern123', 'intern');

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('intern');
      expect(useAuthStore.getState().currentUser?.role).toBe('intern');
    });

    it('does not mutate sessionStorage on failed login', () => {
      seedUsers([ADMIN_USER]);

      useAuthStore.getState().login('bad@email.com', 'badpass', 'admin');

      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('clears currentUser from store', () => {
      seedUsers([ADMIN_USER]);
      useAuthStore.getState().login('admin@roopshield.com', 'admin123', 'admin');
      expect(useAuthStore.getState().currentUser).not.toBeNull();

      useAuthStore.getState().logout();

      expect(useAuthStore.getState().currentUser).toBeNull();
    });

    it('removes session from sessionStorage (Requirement 2.6)', () => {
      seedUsers([ADMIN_USER]);
      useAuthStore.getState().login('admin@roopshield.com', 'admin123', 'admin');
      expect(sessionStorage.getItem(SESSION_KEY)).not.toBeNull();

      useAuthStore.getState().logout();

      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('is safe to call when already logged out', () => {
      // Should not throw
      expect(() => useAuthStore.getState().logout()).not.toThrow();
      expect(useAuthStore.getState().currentUser).toBeNull();
    });
  });

  // ── restoreSession ─────────────────────────────────────────────────────────

  describe('restoreSession()', () => {
    it('restores currentUser from a valid sessionStorage entry', () => {
      const session = { id: 'admin-001', name: 'Priya Sharma', email: 'admin@roopshield.com', role: 'admin' };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

      useAuthStore.getState().restoreSession();

      expect(useAuthStore.getState().currentUser).toMatchObject(session);
    });

    it('does nothing when sessionStorage has no session key', () => {
      // sessionStorage is empty
      useAuthStore.getState().restoreSession();

      expect(useAuthStore.getState().currentUser).toBeNull();
    });

    it('does nothing when sessionStorage value is malformed JSON', () => {
      sessionStorage.setItem(SESSION_KEY, 'not-valid-json{{{');

      useAuthStore.getState().restoreSession();

      expect(useAuthStore.getState().currentUser).toBeNull();
    });

    it('does nothing when session object is missing required fields', () => {
      // Missing `id` — should not be treated as a valid session
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: 'Ghost', role: 'admin' }));

      useAuthStore.getState().restoreSession();

      expect(useAuthStore.getState().currentUser).toBeNull();
    });

    it('restores intern session correctly', () => {
      const session = { id: 'intern-001', name: 'Rahul Verma', email: 'intern@roopshield.com', role: 'intern' };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

      useAuthStore.getState().restoreSession();

      expect(useAuthStore.getState().currentUser?.role).toBe('intern');
    });
  });

  // ── full flow ──────────────────────────────────────────────────────────────

  describe('full login → restoreSession → logout flow', () => {
    it('session survives a simulated page reload (restoreSession after login)', () => {
      seedUsers([ADMIN_USER]);

      // Login
      useAuthStore.getState().login('admin@roopshield.com', 'admin123', 'admin');

      // Simulate page reload: reset in-memory store but keep sessionStorage
      resetStore();
      expect(useAuthStore.getState().currentUser).toBeNull();

      // Restore
      useAuthStore.getState().restoreSession();
      expect(useAuthStore.getState().currentUser?.id).toBe('admin-001');
    });

    it('session is gone after logout even if restoreSession is called again', () => {
      seedUsers([ADMIN_USER]);

      useAuthStore.getState().login('admin@roopshield.com', 'admin123', 'admin');
      useAuthStore.getState().logout();

      // Attempt to restore — should find nothing
      useAuthStore.getState().restoreSession();
      expect(useAuthStore.getState().currentUser).toBeNull();
    });
  });
});
