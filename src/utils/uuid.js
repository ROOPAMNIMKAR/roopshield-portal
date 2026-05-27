/**
 * Generates a unique ID using crypto.randomUUID() when available,
 * falling back to a timestamp-based unique string.
 *
 * @returns {string} A unique identifier string
 */
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Timestamp-based fallback: timestamp in ms + random hex suffix
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  const extraRandom = Math.random().toString(36).slice(2, 6);
  return `${timestamp}-${randomPart}-${extraRandom}`;
}
