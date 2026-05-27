/**
 * useGlobalSearch — search intern names and task titles simultaneously.
 *
 * Reads directly from localStorage so it works before stores are loaded.
 * Returns filtered results as the query changes.
 *
 * @param {string} query  Search string (case-insensitive)
 * @returns {{ internResults: object[], taskResults: object[] }}
 */
import { useMemo } from 'react';
import { readStorage } from '../services/storage';

export function useGlobalSearch(query) {
  const results = useMemo(() => {
    if (!query || query.trim().length === 0) {
      return { internResults: [], taskResults: [] };
    }

    const q = query.trim().toLowerCase();

    const users = readStorage('roopshield_users', []);
    const internResults = users
      .filter((u) => u.role === 'intern' && u.name?.toLowerCase().includes(q))
      .slice(0, 5);

    const tasks = readStorage('roopshield_tasks', []);
    const taskResults = tasks
      .filter((t) => t.title?.toLowerCase().includes(q))
      .slice(0, 5);

    return { internResults, taskResults };
  }, [query]);

  return results;
}

export default useGlobalSearch;
