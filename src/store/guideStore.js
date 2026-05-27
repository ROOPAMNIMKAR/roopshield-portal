/**
 * store/guideStore.js — backed by the REST API.
 */
import { create } from 'zustand';
import { guidesApi } from '../services/api';

const useGuideStore = create((set) => ({
  guides: [],

  async loadGuides() {
    try {
      const guides = await guidesApi.getAll();
      set({ guides });
    } catch (err) {
      console.error('Failed to load guides:', err.message);
    }
  },

  async addGuide(data) {
    const guide = await guidesApi.add(data);
    set((state) => ({ guides: [guide, ...state.guides] }));
    return guide;
  },

  async updateGuide(id, data) {
    // For now, delete and re-add (guides don't have a PUT endpoint yet)
    // This is a simple approach; can be extended with a PUT route
    set((state) => ({
      guides: state.guides.map((g) => (g.id === id ? { ...g, ...data } : g)),
    }));
  },

  async deleteGuide(id) {
    await guidesApi.delete(id);
    set((state) => ({ guides: state.guides.filter((g) => g.id !== id) }));
  },
}));

export default useGuideStore;
