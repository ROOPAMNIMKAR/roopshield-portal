/**
 * storage.test.js
 *
 * Unit tests for services/storage.js
 *
 * The jsdom localStorage mock is set up in src/test/setup.js and cleared
 * before each test via beforeEach(() => localStorage.clear()).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Listen for a custom window event and return a promise that resolves with
 * the event's detail object when the event fires, or rejects after a timeout.
 */
function waitForEvent(eventName, timeoutMs = 200) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Event "${eventName}" not fired`)), timeoutMs);
    window.addEventListener(
      eventName,
      (e) => {
        clearTimeout(timer);
        resolve(e.detail);
      },
      { once: true }
    );
  });
}

// ─── Import helpers ───────────────────────────────────────────────────────────
// We import the module fresh in each describe block where we need to control
// the localStorage mock state at module-init time.

// ─── readStorage ─────────────────────────────────────────────────────────────

describe('readStorage', () => {
  let readStorage;

  beforeEach(async () => {
    localStorage.clear();
    // Re-import to get a fresh module reference (Vitest caches modules, so we
    // use a cache-busting query param trick via dynamic import with resetModules)
    vi.resetModules();
    ({ readStorage } = await import('./storage.js'));
  });

  it('returns the fallback for a missing key', () => {
    expect(readStorage('nonexistent')).toEqual([]);
  });

  it('returns a custom fallback for a missing key', () => {
    expect(readStorage('nonexistent', null)).toBeNull();
  });

  it('returns the parsed value for an existing key', () => {
    const data = [{ id: '1', name: 'Rahul' }];
    localStorage.setItem('roopshield_users', JSON.stringify(data));
    expect(readStorage('roopshield_users')).toEqual(data);
  });

  it('returns a parsed object (not just arrays)', () => {
    const obj = { theme: 'dark' };
    localStorage.setItem('roopshield_theme', JSON.stringify(obj));
    expect(readStorage('roopshield_theme', null)).toEqual(obj);
  });

  it('handles JSON parse error: resets the key to fallback', () => {
    localStorage.setItem('bad_key', 'not-valid-json{{{');
    readStorage('bad_key', []);
    // After recovery the key should hold the JSON-serialised fallback
    expect(localStorage.getItem('bad_key')).toBe(JSON.stringify([]));
  });

  it('handles JSON parse error: returns the fallback value', () => {
    localStorage.setItem('bad_key', 'not-valid-json{{{');
    const result = readStorage('bad_key', []);
    expect(result).toEqual([]);
  });

  it('handles JSON parse error: dispatches a toast:warning event', async () => {
    localStorage.setItem('bad_key', '}{invalid');
    const eventPromise = waitForEvent('toast:warning');
    readStorage('bad_key', []);
    const detail = await eventPromise;
    expect(detail.message).toBe('Data for bad_key was corrupted and has been reset.');
  });
});

// ─── writeStorage ─────────────────────────────────────────────────────────────

describe('writeStorage', () => {
  let writeStorage, readStorage;

  beforeEach(async () => {
    localStorage.clear();
    vi.resetModules();
    ({ writeStorage, readStorage } = await import('./storage.js'));
  });

  it('saves a value that can be read back', () => {
    const data = [{ id: '42', title: 'Task A' }];
    writeStorage('roopshield_tasks', data);
    expect(readStorage('roopshield_tasks')).toEqual(data);
  });

  it('overwrites an existing key', () => {
    writeStorage('key', [1, 2, 3]);
    writeStorage('key', [4, 5, 6]);
    expect(readStorage('key')).toEqual([4, 5, 6]);
  });

  it('handles QuotaExceededError: dispatches a toast:error event', async () => {
    // Simulate a QuotaExceededError by making setItem throw
    const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
    const originalSetItem = localStorage.setItem.bind(localStorage);
    let callCount = 0;
    vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
      callCount += 1;
      // Allow the availability-check write (happens at module init) and any
      // writes that happen before our test write; throw only on the first
      // explicit test write.
      if (key === 'quota_test_key') {
        throw quotaError;
      }
      return originalSetItem(key, value);
    });

    const eventPromise = waitForEvent('toast:error');
    writeStorage('quota_test_key', { big: 'data' });
    const detail = await eventPromise;
    expect(detail.message).toBe('Storage quota exceeded. Please clear old data.');

    vi.restoreAllMocks();
  });
});

// ─── deleteStorage ────────────────────────────────────────────────────────────

describe('deleteStorage', () => {
  let deleteStorage, readStorage, writeStorage;

  beforeEach(async () => {
    localStorage.clear();
    vi.resetModules();
    ({ deleteStorage, readStorage, writeStorage } = await import('./storage.js'));
  });

  it('removes an existing key', () => {
    writeStorage('to_delete', [1, 2, 3]);
    deleteStorage('to_delete');
    expect(localStorage.getItem('to_delete')).toBeNull();
  });

  it('readStorage returns fallback after deletion', () => {
    writeStorage('to_delete', [1, 2, 3]);
    deleteStorage('to_delete');
    expect(readStorage('to_delete')).toEqual([]);
  });

  it('does not throw when deleting a non-existent key', () => {
    expect(() => deleteStorage('ghost_key')).not.toThrow();
  });
});

// ─── isStorageAvailable ───────────────────────────────────────────────────────

describe('isStorageAvailable', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is true when localStorage works normally', async () => {
    vi.resetModules();
    const { isStorageAvailable } = await import('./storage.js');
    expect(isStorageAvailable).toBe(true);
  });

  it('is false when localStorage.setItem throws on init', async () => {
    vi.resetModules();
    // Make setItem throw before the module initialises.
    // The jsdom localStorage in setup.js is a plain object (not a Storage
    // prototype instance), so we spy on the object directly rather than on
    // Storage.prototype.
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    const { isStorageAvailable } = await import('./storage.js');
    expect(isStorageAvailable).toBe(false);
    vi.restoreAllMocks();
  });
});
