/**
 * store/ratingStore.js — backed by the REST API.
 */
import { create } from 'zustand';
import { ratingsApi } from '../services/api';

const useRatingStore = create((set, get) => ({
  ratings: [],

  async loadRatings() {
    try {
      const ratings = await ratingsApi.getAll();
      set({ ratings });
    } catch (err) {
      console.error('Failed to load ratings:', err.message);
    }
  },

  async saveRating(data) {
    const rating = await ratingsApi.add(data);
    set((state) => {
      const existing = state.ratings.findIndex((r) => r.id === rating.id);
      if (existing !== -1) {
        return { ratings: state.ratings.map((r) => (r.id === rating.id ? rating : r)) };
      }
      return { ratings: [...state.ratings, rating] };
    });
    return rating;
  },

  getRatingsForIntern(internId) {
    return get().ratings.filter((r) => r.internId === internId);
  },
}));

export default useRatingStore;
