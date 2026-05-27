/**
 * store/resourceStore.js — backed by the REST API.
 */
import { create } from 'zustand';
import { resourcesApi } from '../services/api';

const useResourceStore = create((set) => ({
  resources: [],

  async loadResources() {
    try {
      const resources = await resourcesApi.getAll();
      set({ resources });
    } catch (err) {
      console.error('Failed to load resources:', err.message);
    }
  },

  async addResource(data) {
    const resource = await resourcesApi.add(data);
    set((state) => ({ resources: [resource, ...state.resources] }));
    return resource;
  },

  async deleteResource(id) {
    await resourcesApi.delete(id);
    set((state) => ({ resources: state.resources.filter((r) => r.id !== id) }));
  },
}));

export default useResourceStore;
