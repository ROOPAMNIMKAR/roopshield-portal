/**
 * useNotifications — count tasks due today or tomorrow for the current user.
 *
 * Reads tasks from localStorage and counts those assigned to the current
 * user that are due today or tomorrow and not yet completed.
 *
 * @param {string|null} userId  The current user's id (from authStore)
 * @returns {{ count: number, tasks: object[] }}
 */
import { useMemo } from 'react';
import { readStorage } from '../services/storage';

export function useNotifications(userId) {
  const result = useMemo(() => {
    if (!userId) return { count: 0, tasks: [] };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const tasks = readStorage('roopshield_tasks', []);
    const dueSoon = tasks.filter((t) => {
      if (t.status === 'Completed') return false;
      if (!t.assignedTo?.includes(userId)) return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due >= today && due < dayAfterTomorrow;
    });

    return { count: dueSoon.length, tasks: dueSoon };
  }, [userId]);

  return result;
}

export default useNotifications;
