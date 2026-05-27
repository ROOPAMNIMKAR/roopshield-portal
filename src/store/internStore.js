/**
 * store/internStore.js
 *
 * Zustand store for intern profile management — backed by the REST API.
 */

import { create } from 'zustand';
import { internsApi } from '../services/api';

const useInternStore = create((set) => ({
  interns: [],
  lastCredentials: null, // stores { userId, email, password, regNumber } after adding

  async loadInterns() {
    try {
      const interns = await internsApi.getAll();
      set({ interns });
    } catch (err) {
      console.error('Failed to load interns:', err.message);
    }
  },

  async addIntern(data) {
    const result = await internsApi.add(data);
    // result = { intern, credentials }
    set((state) => ({
      interns: [result.intern, ...state.interns],
      lastCredentials: result.credentials,
    }));
    return result;
  },

  async updateIntern(id, data) {
    const updated = await internsApi.update(id, data);
    set((state) => ({
      interns: state.interns.map((i) => (i.id === id ? updated : i)),
    }));
    return updated;
  },

  async deleteIntern(id) {
    await internsApi.delete(id);
    set((state) => ({
      interns: state.interns.filter((i) => i.id !== id),
    }));
  },

  async bulkUpdateStatus(ids, status) {
    await internsApi.bulkStatus(ids, status);
    set((state) => ({
      interns: state.interns.map((i) =>
        ids.includes(i.id) ? { ...i, status } : i
      ),
    }));
  },

  clearLastCredentials() {
    set({ lastCredentials: null });
  },
}));

export default useInternStore;
