/**
 * store/attendanceStore.js — backed by the REST API.
 */
import { create } from 'zustand';
import { attendanceApi } from '../services/api';

const useAttendanceStore = create((set, get) => ({
  records: [],

  async loadAttendance() {
    try {
      const records = await attendanceApi.getAll();
      set({ records });
    } catch (err) {
      console.error('Failed to load attendance:', err.message);
    }
  },

  async markAttendance(newRecords) {
    const results = [];
    for (const record of newRecords) {
      try {
        const saved = await attendanceApi.mark(record);
        results.push(saved);
      } catch (err) {
        console.error('Failed to mark attendance:', err.message);
      }
    }
    // Reload to get fresh state
    const records = await attendanceApi.getAll();
    set({ records });
    return results;
  },

  async deleteAttendance(id) {
    await attendanceApi.delete(id);
    set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
  },

  getFilteredRecords(filters = {}) {
    const { records } = get();
    return records.filter((r) => {
      if (filters.internId && r.internId !== filters.internId) return false;
      if (filters.dateStart && r.date < filters.dateStart) return false;
      if (filters.dateEnd && r.date > filters.dateEnd) return false;
      if (filters.status && r.status !== filters.status) return false;
      return true;
    });
  },

  getReportSummary() {
    const { records } = get();
    const byIntern = new Map();
    for (const r of records) {
      if (!byIntern.has(r.internId)) {
        byIntern.set(r.internId, { internId: r.internId, internName: r.internName, rows: [] });
      }
      byIntern.get(r.internId).rows.push(r);
    }
    return Array.from(byIntern.values()).map(({ internId, internName, rows }) => {
      const total = rows.length;
      const present = rows.filter((r) => r.status === 'Present').length;
      const absent = rows.filter((r) => r.status === 'Absent').length;
      const late = rows.filter((r) => r.status === 'Late').length;
      const halfDay = rows.filter((r) => r.status === 'Half-Day').length;
      const leave = rows.filter((r) => r.status === 'Leave').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      return { internId, internName, total, present, absent, late, halfDay, leave, percentage };
    });
  },
}));

export default useAttendanceStore;
