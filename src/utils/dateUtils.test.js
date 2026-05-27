import { describe, it, expect, vi, afterEach } from 'vitest';
import { toISOWeek, formatDate, isOverdue, daysBetween } from './dateUtils.js';

describe('toISOWeek', () => {
  it('returns correct ISO week for a known Monday', () => {
    // 2025-07-07 is a Monday in week 28 of 2025
    expect(toISOWeek('2025-07-07')).toBe('2025-W28');
  });

  it('returns correct ISO week for a known Sunday', () => {
    // 2025-07-13 is a Sunday, still in week 28
    expect(toISOWeek('2025-07-13')).toBe('2025-W28');
  });

  it('returns correct ISO week for the first week of the year', () => {
    // 2025-01-01 is a Wednesday in week 1 of 2025
    expect(toISOWeek('2025-01-01')).toBe('2025-W01');
  });

  it('handles a Date object as input', () => {
    const date = new Date('2025-07-07');
    expect(toISOWeek(date)).toBe('2025-W28');
  });
});

describe('formatDate', () => {
  it('formats a date string as YYYY-MM-DD', () => {
    expect(formatDate('2025-07-14')).toBe('2025-07-14');
  });

  it('formats a Date object as YYYY-MM-DD', () => {
    // Use a fixed date to avoid timezone issues
    const date = new Date(2025, 6, 14); // July 14, 2025 (month is 0-indexed)
    expect(formatDate(date)).toBe('2025-07-14');
  });

  it('pads single-digit month and day with leading zeros', () => {
    const date = new Date(2025, 0, 5); // January 5, 2025
    expect(formatDate(date)).toBe('2025-01-05');
  });
});

describe('isOverdue', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for a date in the past', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-07-14'));
    expect(isOverdue('2025-07-13')).toBe(true);
  });

  it('returns false for today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-07-14'));
    expect(isOverdue('2025-07-14')).toBe(false);
  });

  it('returns false for a future date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-07-14'));
    expect(isOverdue('2025-07-15')).toBe(false);
  });
});

describe('daysBetween', () => {
  it('returns 0 for the same date', () => {
    expect(daysBetween('2025-07-14', '2025-07-14')).toBe(0);
  });

  it('returns 1 for consecutive days', () => {
    expect(daysBetween('2025-07-14', '2025-07-15')).toBe(1);
  });

  it('returns the correct number of days for a longer range', () => {
    expect(daysBetween('2025-01-01', '2025-07-14')).toBe(194);
  });

  it('is symmetric (order of arguments does not matter)', () => {
    expect(daysBetween('2025-07-14', '2025-01-01')).toBe(
      daysBetween('2025-01-01', '2025-07-14')
    );
  });

  it('handles Date objects as input', () => {
    const a = new Date(2025, 6, 14);
    const b = new Date(2025, 6, 21);
    expect(daysBetween(a, b)).toBe(7);
  });
});
