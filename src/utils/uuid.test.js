import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { generateId } from './uuid.js';

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns unique values on successive calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('uses crypto.randomUUID when available', () => {
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
    const spy = vi.spyOn(crypto, 'randomUUID').mockReturnValue(mockUUID);
    expect(generateId()).toBe(mockUUID);
    spy.mockRestore();
  });

  it('falls back to timestamp-based ID when crypto.randomUUID is unavailable', () => {
    const original = crypto.randomUUID;
    // Temporarily remove randomUUID
    delete crypto.randomUUID;
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    // Restore
    crypto.randomUUID = original;
  });
});

// Feature: roopshield-internship-portal, Property 13: Unique ID generation
// Validates: Requirements 17.3
describe('generateId property-based tests', () => {
  it('Property 13: all N generated IDs are distinct', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 50 }),
        (n) => {
          const ids = Array.from({ length: n }, () => generateId());
          const uniqueIds = new Set(ids);
          return uniqueIds.size === n;
        }
      )
    );
  });
});
