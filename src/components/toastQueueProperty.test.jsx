// Feature: roopshield-internship-portal, Property 8: Toast queue capacity invariant

import React, { useEffect } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { ToastProvider } from './ToastProvider';
import { useToast } from '../hooks/useToast';

/**
 * Validates: Requirements 16.5
 *
 * Property 8: Toast queue capacity invariant
 * For any array of > 3 toast messages:
 *   1. The active toast count never exceeds 3.
 *   2. The oldest toasts are evicted — only the last (most recent) 3 messages remain.
 */

// ─── Helper component ────────────────────────────────────────────────────────

/**
 * Renders inside ToastProvider and fires showToast for every message in the
 * `messages` array on mount. Exposes the live toast list via data-testid
 * attributes so the test can inspect it synchronously after rendering.
 */
function ToastBatcher({ messages }) {
  const { showToast, toasts } = useToast();

  useEffect(() => {
    // Fire all toasts synchronously inside a single act() call (handled by the
    // test wrapper). Each call to showToast updates the queue according to the
    // MAX_TOASTS = 3 cap defined in ToastProvider.
    messages.forEach((msg) => showToast(msg, 'success'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  return (
    <div>
      <span data-testid="count">{toasts.length}</span>
      {toasts.map((t, i) => (
        <span key={t.id} data-testid={`toast-msg-${i}`}>
          {t.message}
        </span>
      ))}
    </div>
  );
}

// ─── Property-based test ─────────────────────────────────────────────────────

describe('Property 8: Toast queue capacity invariant', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it(
    'active toast count never exceeds 3 and oldest messages are evicted',
    () => {
      fc.assert(
        fc.property(
          // Generate arrays of > 3 non-empty strings (4–20 items)
          fc.array(fc.string({ minLength: 1 }), { minLength: 4, maxLength: 20 }),
          (messages) => {
            // Ensure all messages are unique so we can identify them by content
            // (fast-check may generate duplicates; deduplicate while keeping order)
            const unique = [...new Set(messages)];
            // If deduplication collapsed the array below 4, pad with indexed strings
            while (unique.length < 4) {
              unique.push(`pad-${unique.length}`);
            }

            let container;

            act(() => {
              const result = render(
                <ToastProvider>
                  <ToastBatcher messages={unique} />
                </ToastProvider>
              );
              container = result.container;
            });

            // ── Assertion 1: count ≤ 3 ──────────────────────────────────────
            const countEl = container.querySelector('[data-testid="count"]');
            const activeCount = parseInt(countEl.textContent, 10);
            expect(activeCount).toBeLessThanOrEqual(3);

            // ── Assertion 2: oldest messages are evicted ────────────────────
            // The last 3 messages in `unique` should be present; earlier ones gone.
            const expectedPresent = unique.slice(-3);
            const expectedAbsent = unique.slice(0, unique.length - 3);

            // Collect rendered toast messages
            const renderedMessages = Array.from(
              container.querySelectorAll('[data-testid^="toast-msg-"]')
            ).map((el) => el.textContent);

            expectedPresent.forEach((msg) => {
              expect(renderedMessages).toContain(msg);
            });

            expectedAbsent.forEach((msg) => {
              expect(renderedMessages).not.toContain(msg);
            });

            // Clean up between runs
            act(() => {
              // Advance timers to clear all auto-dismiss timeouts
              vi.runAllTimers();
            });
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
