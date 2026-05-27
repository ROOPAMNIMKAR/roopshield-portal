/**
 * utils/regNumber.js
 *
 * Registration number utilities for interns.
 *
 * Format: RS-YYYY-NNN
 *   RS   = RoopShield prefix
 *   YYYY = year the intern was added
 *   NNN  = 3-digit sequential number (001, 002, …)
 *
 * Examples: RS-2025-001, RS-2025-012, RS-2026-001
 */

/**
 * Generate the next registration number based on existing interns.
 *
 * @param {object[]} existingInterns  Array of intern records (may have regNumber field)
 * @param {string}   [year]           4-digit year string, defaults to current year
 * @returns {string}  e.g. "RS-2025-007"
 */
export function generateRegNumber(existingInterns = [], year = null) {
  const y = year ?? String(new Date().getFullYear());

  // Find the highest sequence number used this year
  let maxSeq = 0;
  for (const intern of existingInterns) {
    if (!intern.regNumber) continue;
    // Match RS-YYYY-NNN
    const match = intern.regNumber.match(/^RS-(\d{4})-(\d+)$/);
    if (match && match[1] === y) {
      const seq = parseInt(match[2], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  }

  const nextSeq = maxSeq + 1;
  return `RS-${y}-${String(nextSeq).padStart(3, '0')}`;
}

/**
 * Parse a registration number into its parts.
 *
 * @param {string} regNumber  e.g. "RS-2025-007"
 * @returns {{ prefix: string, year: string, sequence: number } | null}
 */
export function parseRegNumber(regNumber) {
  if (!regNumber) return null;
  const match = regNumber.match(/^([A-Z]+)-(\d{4})-(\d+)$/);
  if (!match) return null;
  return {
    prefix:   match[1],
    year:     match[2],
    sequence: parseInt(match[3], 10),
  };
}
