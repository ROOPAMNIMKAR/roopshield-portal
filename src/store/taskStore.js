/**
 * store/taskStore.js — backed by the REST API.
 */
import { create } from 'zustand';
import { tasksApi } from '../services/api';

const useTaskStore = create((set, get) => ({
  tasks: [],

  async loadTasks() {
    try {
      const tasks = await tasksApi.getAll();
      set({ tasks });
    } catch (err) {
      console.error('Failed to load tasks:', err.message);
    }
  },

  async addTask(data) {
    const task = await tasksApi.add(data);
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  async updateTaskStatus(taskId, newStatus, actorName) {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updated = await tasksApi.update(taskId, { ...task, status: newStatus });
    set((state) => ({ tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)) }));
  },

  async updateTask(taskId, data) {
    const updated = await tasksApi.update(taskId, data);
    set((state) => ({ tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)) }));
    return updated;
  },

  async addWorkLog(taskId, log) {
    const hours = log.hoursWorked ?? log.hours;
    if (!hours || hours <= 0) {
      window.dispatchEvent(new CustomEvent('toast:error', {
        detail: { message: 'Hours Worked must be a number greater than 0' },
      }));
      return false;
    }
    await tasksApi.addWorkLog(taskId, { hours, note: log.notes || log.note || '' });
    // Reload task to get updated work logs
    const tasks = await tasksApi.getAll();
    set({ tasks });
    return true;
  },

  async deleteTask(taskId) {
    await tasksApi.delete(taskId);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) }));
  },
}));

export default useTaskStore;
