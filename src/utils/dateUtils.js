/**
 * Returns the ISO 8601 week string for a given date, e.g. "2025-W28".
 *
 * @param {Date|string} date
 * @returns {string} ISO week string in the format "YYYY-Www"
 */
export function toISOWeek(date) {
  const d = new Date(date);
  // Set to nearest Thursday: current date + 4 - current day number (Mon=1, Sun=7)
  const dayOfWeek = d.getUTCDay() || 7; // treat Sunday (0) as 7
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  const year = d.getUTCFullYear();
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Formats a date as "YYYY-MM-DD".
 *
 * @param {Date|string} date
 * @returns {string} Date string in "YYYY-MM-DD" format
 */
export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns true if the given due date is in the past (before today's date)
 * and the task is therefore overdue.
 *
 * @param {Date|string} dueDate
 * @returns {boolean}
 */
export function isOverdue(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

/**
 * Returns the absolute number of whole days between two dates.
 *
 * @param {Date|string} a
 * @param {Date|string} b
 * @returns {number} Number of whole days between a and b (always non-negative)
 */
export function daysBetween(a, b) {
  const dateA = new Date(a);
  const dateB = new Date(b);
  dateA.setHours(0, 0, 0, 0);
  dateB.setHours(0, 0, 0, 0);
  const diffMs = Math.abs(dateB - dateA);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
