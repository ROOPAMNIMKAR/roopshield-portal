/**
 * store/authStore.js
 *
 * Zustand store for authentication — now backed by the REST API.
 * JWT token is stored in sessionStorage alongside the user profile.
 */

import { create } from 'zustand';
import { authApi } from '../services/api';

const SESSION_KEY = 'roopshield_session';

const useAuthStore = create((set) => ({
  // ─── State ────────────────────────────────────────────────────────────────

  /** @type {null | { id, name, email, role, token }} */
  currentUser: null,

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Authenticate via the backend API.
   * On success: saves session (including JWT token) to sessionStorage.
   */
  async login(email, password, role) {
    try {
      const data = await authApi.login(email, password, role);

      const sessionData = {
        ...data.user,
        token: data.token,
      };

      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      } catch {
        // sessionStorage unavailable — still allow in-memory session
      }

      set({ currentUser: sessionData });
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid credentials. Please try again.' };
    }
  },

  /**
   * Log the current user out.
   */
  logout() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Silently ignore
    }
    set({ currentUser: null });
  },

  /**
   * Restore a previously saved session on app mount.
   */
  restoreSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const session = JSON.parse(raw);
      if (session && session.id && session.role && session.token) {
        set({ currentUser: session });
      }
    } catch {
      // JSON.parse failed — do nothing
    }
  },
}));

export default useAuthStore;
