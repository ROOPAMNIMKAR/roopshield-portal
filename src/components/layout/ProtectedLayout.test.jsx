/**
 * components/layout/ProtectedLayout.test.jsx
 *
 * Unit tests for the ProtectedLayout route guard.
 *
 * Tests verify:
 *   - Redirect to /login when sessionStorage has no session (Requirement 2.7)
 *   - Redirect to /login when session role mismatches requiredRole (Requirement 2.5)
 *   - Redirect to /login when session role mismatches route prefix (Requirement 2.5)
 *   - Renders <Outlet /> when session is valid and role matches
 *   - Accepts explicit requiredRole prop
 */

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedLayout from './ProtectedLayout';
import useAuthStore from '../../store/authStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'roopshield_session';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Write a session object to sessionStorage. */
function setSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Reset Zustand auth store between tests. */
function resetStore() {
  useAuthStore.setState({ currentUser: null });
}

/**
 * Render ProtectedLayout inside a MemoryRouter at a given path.
 *
 * The route structure mirrors real usage:
 *   <Route element={<ProtectedLayout requiredRole={...} />}>
 *     <Route path="..." element={<Protected />} />
 *   </Route>
 *
 * A /login route is included so Navigate redirects can be verified.
 */
function renderGuard({ initialPath = '/admin/dashboard', requiredRole = undefined } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        <Route element={<ProtectedLayout requiredRole={requiredRole} />}>
          <Route path="/admin/dashboard" element={<div data-testid="admin-page">Admin Dashboard</div>} />
          <Route path="/admin/interns" element={<div data-testid="admin-interns">Admin Interns</div>} />
          <Route path="/intern/dashboard" element={<div data-testid="intern-page">Intern Dashboard</div>} />
          <Route path="/intern/profile" element={<div data-testid="intern-profile">Intern Profile</div>} />
          <Route path="/protected" element={<div data-testid="protected-page">Protected Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProtectedLayout', () => {
  beforeEach(() => {
    resetStore();
  });

  // ── Requirement 2.7: Unauthenticated access redirects to /login ────────────

  describe('when no session exists in sessionStorage (Requirement 2.7)', () => {
    it('redirects to /login when sessionStorage is empty', () => {
      // sessionStorage is cleared by setup.js beforeEach
      renderGuard({ initialPath: '/admin/dashboard' });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument();
    });

    it('redirects to /login for intern routes when no session exists', () => {
      renderGuard({ initialPath: '/intern/dashboard' });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('intern-page')).not.toBeInTheDocument();
    });

    it('redirects to /login when sessionStorage contains malformed JSON', () => {
      sessionStorage.setItem(SESSION_KEY, 'not-valid-json{{{');

      renderGuard({ initialPath: '/admin/dashboard' });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('redirects to /login when session object is missing required id field', () => {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: 'Ghost', role: 'admin' }));

      renderGuard({ initialPath: '/admin/dashboard' });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('redirects to /login when session object is missing required role field', () => {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: 'user-001', name: 'Ghost' }));

      renderGuard({ initialPath: '/admin/dashboard' });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  // ── Requirement 2.5: Role mismatch redirects to /login ────────────────────

  describe('when session role mismatches the required role (Requirement 2.5)', () => {
    it('redirects intern to /login when accessing an admin route (via requiredRole prop)', () => {
      setSession({ id: 'intern-001', name: 'Rahul Verma', email: 'intern@roopshield.com', role: 'intern' });

      renderGuard({ initialPath: '/admin/dashboard', requiredRole: 'admin' });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument();
    });

    it('redirects admin to /login when accessing an intern route (via requiredRole prop)', () => {
      setSession({ id: 'admin-001', name: 'Priya Sharma', email: 'admin@roopshield.com', role: 'admin' });

      renderGuard({ initialPath: '/intern/dashboard', requiredRole: 'intern' });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('intern-page')).not.toBeInTheDocument();
    });

    it('redirects intern to /login when accessing /admin/* route (via path prefix inference)', () => {
      setSession({ id: 'intern-001', name: 'Rahul Verma', email: 'intern@roopshield.com', role: 'intern' });

      // No requiredRole prop — role inferred from /admin/* prefix
      renderGuard({ initialPath: '/admin/dashboard' });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument();
    });

    it('redirects admin to /login when accessing /intern/* route (via path prefix inference)', () => {
      setSession({ id: 'admin-001', name: 'Priya Sharma', email: 'admin@roopshield.com', role: 'admin' });

      // No requiredRole prop — role inferred from /intern/* prefix
      renderGuard({ initialPath: '/intern/dashboard' });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('intern-page')).not.toBeInTheDocument();
    });
  });

  // ── Valid session: renders Outlet ──────────────────────────────────────────

  describe('when session is valid and role matches', () => {
    it('renders child route for admin with matching requiredRole prop', () => {
      setSession({ id: 'admin-001', name: 'Priya Sharma', email: 'admin@roopshield.com', role: 'admin' });

      renderGuard({ initialPath: '/admin/dashboard', requiredRole: 'admin' });

      expect(screen.getByTestId('admin-page')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('renders child route for intern with matching requiredRole prop', () => {
      setSession({ id: 'intern-001', name: 'Rahul Verma', email: 'intern@roopshield.com', role: 'intern' });

      renderGuard({ initialPath: '/intern/dashboard', requiredRole: 'intern' });

      expect(screen.getByTestId('intern-page')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('renders child route for admin via /admin/* path prefix inference (no requiredRole prop)', () => {
      setSession({ id: 'admin-001', name: 'Priya Sharma', email: 'admin@roopshield.com', role: 'admin' });

      renderGuard({ initialPath: '/admin/dashboard' });

      expect(screen.getByTestId('admin-page')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('renders child route for intern via /intern/* path prefix inference (no requiredRole prop)', () => {
      setSession({ id: 'intern-001', name: 'Rahul Verma', email: 'intern@roopshield.com', role: 'intern' });

      renderGuard({ initialPath: '/intern/dashboard' });

      expect(screen.getByTestId('intern-page')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('renders child route when no requiredRole and path has no role prefix', () => {
      setSession({ id: 'admin-001', name: 'Priya Sharma', email: 'admin@roopshield.com', role: 'admin' });

      // /protected has no /admin or /intern prefix — no role check applied
      renderGuard({ initialPath: '/protected' });

      expect(screen.getByTestId('protected-page')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('renders admin interns page for admin with matching role', () => {
      setSession({ id: 'admin-001', name: 'Priya Sharma', email: 'admin@roopshield.com', role: 'admin' });

      renderGuard({ initialPath: '/admin/interns', requiredRole: 'admin' });

      expect(screen.getByTestId('admin-interns')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });
  });

  // ── Zustand store hydration ────────────────────────────────────────────────

  describe('Zustand store hydration on mount', () => {
    it('hydrates the Zustand store from sessionStorage when currentUser is null', () => {
      const session = { id: 'admin-001', name: 'Priya Sharma', email: 'admin@roopshield.com', role: 'admin' };
      setSession(session);
      // Store is already reset (currentUser = null) by beforeEach

      renderGuard({ initialPath: '/admin/dashboard', requiredRole: 'admin' });

      // Component should render the protected page (session is valid)
      expect(screen.getByTestId('admin-page')).toBeInTheDocument();
    });
  });
});
