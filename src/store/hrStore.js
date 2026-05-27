/**
 * store/hrStore.js — HR Management store backed by the REST API.
 */
import { create } from 'zustand';
import { hrApi } from '../services/api';

const useHRStore = create((set) => ({
  leaveRequests: [],
  notices: [],
  documents: [],

  async loadAll() {
    try {
      const [leaveRequests, notices, documents] = await Promise.all([
        hrApi.getLeave(),
        hrApi.getNotices(),
        hrApi.getDocuments(),
      ]);
      set({ leaveRequests, notices, documents });
    } catch (err) {
      console.error('Failed to load HR data:', err.message);
    }
  },

  // ── Leave Requests ────────────────────────────────────────────────────────

  async submitLeaveRequest(data) {
    const req = await hrApi.submitLeave(data);
    set((state) => ({ leaveRequests: [req, ...state.leaveRequests] }));
    return req;
  },

  async updateLeaveStatus(id, { status, adminComment }) {
    const updated = await hrApi.updateLeave(id, { status, adminComment });
    set((state) => ({
      leaveRequests: state.leaveRequests.map((r) => (r.id === id ? updated : r)),
    }));
  },

  async deleteLeaveRequest(id) {
    await hrApi.deleteLeave(id);
    set((state) => ({
      leaveRequests: state.leaveRequests.filter((r) => r.id !== id),
    }));
  },

  // ── HR Notices ────────────────────────────────────────────────────────────

  async addNotice(data) {
    const notice = await hrApi.addNotice(data);
    set((state) => ({ notices: [notice, ...state.notices] }));
    return notice;
  },

  async deleteNotice(id) {
    await hrApi.deleteNotice(id);
    set((state) => ({ notices: state.notices.filter((n) => n.id !== id) }));
  },

  // ── HR Documents ──────────────────────────────────────────────────────────

  async addDocument(data) {
    const doc = await hrApi.addDocument(data);
    set((state) => ({ documents: [doc, ...state.documents] }));
    return doc;
  },

  async deleteDocument(id) {
    await hrApi.deleteDocument(id);
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }));
  },
}));

export default useHRStore;
