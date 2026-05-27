/**
 * store/announcementStore.js — backed by the REST API.
 */
import { create } from 'zustand';
import { announcementsApi } from '../services/api';

const useAnnouncementStore = create((set, get) => ({
  announcements: [],

  async loadAnnouncements() {
    try {
      const announcements = await announcementsApi.getAll();
      set({ announcements });
    } catch (err) {
      console.error('Failed to load announcements:', err.message);
    }
  },

  async addAnnouncement(data) {
    const ann = await announcementsApi.add(data);
    set((state) => ({ announcements: [ann, ...state.announcements] }));
    return ann;
  },

  async deleteAnnouncement(id) {
    await announcementsApi.delete(id);
    set((state) => ({ announcements: state.announcements.filter((a) => a.id !== id) }));
  },

  getVisibleAnnouncements(department) {
    const { announcements } = get();
    return announcements.filter(
      (a) => a.visibleTo === 'All' || a.visibleTo === department
    );
  },
}));

export default useAnnouncementStore;
