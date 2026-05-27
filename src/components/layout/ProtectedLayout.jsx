/**
 * components/layout/ProtectedLayout.jsx
 *
 * Route guard for authenticated, role-restricted routes.
 *
 * Behaviour:
 *   1. On mount, if the Zustand store has no currentUser, call restoreSession()
 *      to hydrate state from sessionStorage.
 *   2. Read the raw session from sessionStorage (roopshield_session).
 *      If absent → redirect to /login (Requirement 2.7).
 *   3. If a requiredRole prop is provided, compare it against the session role.
 *      Mismatch → redirect to /login (Requirement 2.5).
 *      Route-prefix-based role inference is also applied when requiredRole is
 *      omitted: /admin/* requires role "admin", /intern/* requires role "intern".
 *   4. If session is valid and role matches → render <Outlet />.
 *
 * Usage:
 *   <Route element={<ProtectedLayout requiredRole="admin" />}>
 *     <Route path="/admin/dashboard" element={<AdminDashboard />} />
 *   </Route>
 *
 * Satisfies Requirements 2.5, 2.7
 */

import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const SESSION_KEY = 'roopshield_session';

/**
 * Infer the required role from the current pathname when no explicit
 * requiredRole prop is provided.
 *
 * @param {string} pathname
 * @returns {'admin' | 'intern' | 'hr' | null}
 */
function inferRoleFromPath(pathname) {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/intern')) return 'intern';
  if (pathname.startsWith('/hr')) return 'hr';
  return null;
}

/**
 * Read and parse the session from sessionStorage.
 *
 * @returns {{ id: string, name: string, email: string, role: string } | null}
 */
function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && session.id && session.role) return session;
    return null;
  } catch {
    return null;
  }
}

/**
 * ProtectedLayout
 *
 * @param {{ requiredRole?: 'admin' | 'intern' }} props
 */
function ProtectedLayout({ requiredRole }) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const location = useLocation();

  // Hydrate Zustand store from sessionStorage on first render if needed.
  useEffect(() => {
    if (!currentUser) {
      restoreSession();
    }
  }, [currentUser, restoreSession]);

  // --- Guard 1: session must exist in sessionStorage ---
  const session = readSession();
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // --- Guard 2: role must match the required role ---
  const effectiveRole = requiredRole ?? inferRoleFromPath(location.pathname);
  if (effectiveRole && session.role !== effectiveRole) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Session is valid and role matches — render child routes.
  return <Outlet />;
}

export default ProtectedLayout;
