/**
 * store/departmentStore.js — backed by the REST API.
 */
import { create } from 'zustand';
import { departmentsApi } from '../services/api';

export const DEFAULT_DEPARTMENTS = [
  'Engineering', 'Design', 'Marketing', 'Operations', 'Finance',
  'Cybersecurity', 'Web Development', 'Mobile App Development',
  'Full-Stack Development', 'Cybersecurity Analysis', 'Software Testing', 'HR',
];

const useDepartmentStore = create((set, get) => ({
  departments: [],

  async loadDepartments() {
    try {
      const departments = await departmentsApi.getAll();
      set({ departments });
    } catch {
      // Fallback to defaults if API unavailable
      set({ departments: DEFAULT_DEPARTMENTS });
    }
  },

  async addDepartment(name) {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const { departments } = get();
    if (departments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) return false;
    try {
      await departmentsApi.add(trimmed);
      set({ departments: [...departments, trimmed] });
      return true;
    } catch {
      return false;
    }
  },

  async deleteDepartment(name) {
    try {
      await departmentsApi.delete(name);
      set((state) => ({ departments: state.departments.filter((d) => d !== name) }));
    } catch (err) {
      console.error('Failed to delete department:', err.message);
    }
  },
}));

export default useDepartmentStore;
