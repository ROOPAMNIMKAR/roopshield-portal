/**
 * store/doubtStore.js — backed by the REST API.
 */
import { create } from 'zustand';
import { doubtsApi } from '../services/api';

const useDoubtStore = create((set, get) => ({
  doubts: [],

  async loadDoubts() {
    try {
      const doubts = await doubtsApi.getAll();
      set({ doubts });
    } catch (err) {
      console.error('Failed to load doubts:', err.message);
    }
  },

  async submitDoubt({ internId, internName, subject, message, question }) {
    const doubt = await doubtsApi.add({ question: question || message || subject });
    set((state) => ({ doubts: [doubt, ...state.doubts] }));
    return doubt;
  },

  async replyDoubt(id, { reply, repliedBy }) {
    const updated = await doubtsApi.answer(id, reply);
    set((state) => ({ doubts: state.doubts.map((d) => (d.id === id ? updated : d)) }));
  },

  async resolveDoubt(id) {
    // Mark as answered with a resolved note if not already answered
    const doubt = get().doubts.find((d) => d.id === id);
    if (doubt && !doubt.answer) {
      await doubtsApi.answer(id, 'Resolved.');
    }
    set((state) => ({
      doubts: state.doubts.map((d) => (d.id === id ? { ...d, status: 'Answered' } : d)),
    }));
  },

  async deleteDoubt(id) {
    await doubtsApi.delete(id);
    set((state) => ({ doubts: state.doubts.filter((d) => d.id !== id) }));
  },
}));

export default useDoubtStore;
