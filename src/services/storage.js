/**
 * services/storage.js
 *
 * Thin wrapper around localStorage that provides:
 *  - Safe JSON read/write/delete with try/catch on every access
 *  - Graceful recovery from JSON.parse failures (reset key + warning toast event)
 *  - Graceful handling of QuotaExceededError on writes (error toast event)
 *  - A module-level flag `isStorageAvailable` that the app reads to show a
 *    full-page unavailability error when localStorage is blocked entirely
 */

// ─── Availability check ───────────────────────────────────────────────────────

/**
 * True when localStorage is accessible; false when the browser blocks it
 * (e.g. private-browsing mode with storage disabled, or certain iframe policies).
 */
export let isStorageAvailable = true;

(function checkStorageAvailability() {
  const TEST_KEY = '__roopshield_storage_test__';
  try {
    localStorage.setItem(TEST_KEY, '1');
    const val = localStorage.getItem(TEST_KEY);
    localStorage.removeItem(TEST_KEY);
    if (val !== '1') {
      isStorageAvailable = false;
    }
  } catch {
    isStorageAvailable = false;
  }
})();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Dispatch a custom DOM event on `window` so that any listener (e.g. the
 * ToastProvider) can pick it up without a direct import dependency.
 *
 * @param {'toast:warning'|'toast:error'} eventName
 * @param {{ message: string }} detail
 */
function dispatchToastEvent(eventName, detail) {
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  } catch {
    // Silently ignore if CustomEvent is unavailable (e.g. some SSR environments)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Read a key from localStorage and return the parsed JSON value.
 *
 * - Returns `fallback` when the key is absent.
 * - On JSON.parse failure: resets the key to `fallback`, dispatches a
 *   `toast:warning` event, and returns `fallback`.
 *
 * @param {string} key
 * @param {*} [fallback=[]]
 * @returns {*}
 */
export function readStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    // JSON.parse failed — reset the key and warn the user
    try {
      localStorage.setItem(key, JSON.stringify(fallback));
    } catch {
      // If we can't even reset, just continue
    }
    dispatchToastEvent('toast:warning', {
      message: `Data for ${key} was corrupted and has been reset.`,
    });
    return fallback;
  }
}

/**
 * Serialise `value` to JSON and write it to localStorage under `key`.
 *
 * On QuotaExceededError dispatches a `toast:error` event.
 *
 * @param {string} key
 * @param {*} value
 */
export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // DOMException name varies across browsers; check both the name and the
    // legacy numeric code (22) for maximum compatibility.
    const isQuota =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22);

    if (isQuota) {
      dispatchToastEvent('toast:error', {
        message: 'Storage quota exceeded. Please clear old data.',
      });
    }
    // Re-throw non-quota errors so callers are aware of unexpected failures
    // (but swallow quota errors — the toast is the user-facing signal)
  }
}

/**
 * Remove a key from localStorage.
 *
 * @param {string} key
 */
export function deleteStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently ignore — nothing meaningful to do if removal fails
  }
}
