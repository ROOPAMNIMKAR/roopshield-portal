// Feature: roopshield-internship-portal, Property 7: Performance rating upsert correctness

/**
 * Property 7: Performance rating upsert correctness
 *
 * For any internId and ISO week string, saving a performance rating SHALL
 * result in exactly one rating record for that (internId, week) pair in
 * localStorage — never zero and never more than one, regardless of how many
 * times the rate action is called.
 *
 * Validates: Requirements 10.4, 10.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { readStorage } from '../services/storage';
import useRatingStore from './ratingStore';

const RATINGS_KEY = 'roopshield_ratings';

// Arbitrary for an ISO week string like "2025-W01" through "2025-W52"
const isoWeekArb = fc
  .integer({ min: 1, max: 52 })
  .map((w) => `2025-W${String(w).padStart(2, '0')}`);

const ratingValueArb = fc.integer({ min: 1, max: 5 });

describe('Property 7: Performance rating upsert correctness', () => {
  beforeEach(() => {
    localStorage.clear();
    useRatingStore.setState({ ratings: [] });
  });

  it('results in exactly one rating per (internId, week) pair after N saveRating calls', () => {
    fc.assert(
      fc.property(
        fc.uuid(),           // internId
        isoWeekArb,          // week
        fc.integer({ min: 1, max: 10 }), // N calls
        fc.array(ratingValueArb, { minLength: 10, maxLength: 10 }), // rating values pool
        (internId, week, n, ratingValues) => {
          localStorage.clear();
          useRatingStore.setState({ ratings: [] });

          // Call saveRating N times for the same (internId, week)
          for (let i = 0; i < n; i++) {
            useRatingStore.getState().saveRating({
              internId,
              rating: ratingValues[i % ratingValues.length],
              feedback: `Feedback iteration ${i}`,
              week,
              createdBy: 'Admin',
            });
          }

          // Assert exactly one rating for (internId, week)
          const ratings = readStorage(RATINGS_KEY, []);
          const matching = ratings.filter(
            (r) => r.internId === internId && r.week === week
          );

          expect(matching.length).toBe(1);

          // The last rating value written should be the one that persists
          const lastRating = ratingValues[(n - 1) % ratingValues.length];
          expect(matching[0].rating).toBe(lastRating);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('preserves ratings for other (internId, week) pairs when upserting', () => {
    fc.assert(
      fc.property(
        fc.uuid(),  // internId A
        fc.uuid(),  // internId B
        isoWeekArb, // shared week
        fc.integer({ min: 1, max: 5 }), // N calls for A
        (internIdA, internIdB, week, n) => {
          fc.pre(internIdA !== internIdB);

          localStorage.clear();
          useRatingStore.setState({ ratings: [] });

          // Save rating for intern B once
          useRatingStore.getState().saveRating({
            internId: internIdB,
            rating: 3,
            feedback: 'Intern B feedback',
            week,
            createdBy: 'Admin',
          });

          // Save rating for intern A N times
          for (let i = 0; i < n; i++) {
            useRatingStore.getState().saveRating({
              internId: internIdA,
              rating: (i % 5) + 1,
              feedback: `Intern A feedback ${i}`,
              week,
              createdBy: 'Admin',
            });
          }

          const ratings = readStorage(RATINGS_KEY, []);

          // Exactly one rating for intern A
          const forA = ratings.filter((r) => r.internId === internIdA && r.week === week);
          expect(forA.length).toBe(1);

          // Exactly one rating for intern B (preserved)
          const forB = ratings.filter((r) => r.internId === internIdB && r.week === week);
          expect(forB.length).toBe(1);
          expect(forB[0].rating).toBe(3);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('preserves ratings across different weeks for the same intern', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 1, max: 26 }),  // week A
        fc.integer({ min: 27, max: 52 }), // week B (different half of year)
        fc.integer({ min: 1, max: 5 }),
        (internId, weekNumA, weekNumB, n) => {
          localStorage.clear();
          useRatingStore.setState({ ratings: [] });

          const weekA = `2025-W${String(weekNumA).padStart(2, '0')}`;
          const weekB = `2025-W${String(weekNumB).padStart(2, '0')}`;

          // Save N ratings for week A
          for (let i = 0; i < n; i++) {
            useRatingStore.getState().saveRating({
              internId,
              rating: (i % 5) + 1,
              feedback: `Week A feedback ${i}`,
              week: weekA,
              createdBy: 'Admin',
            });
          }

          // Save one rating for week B
          useRatingStore.getState().saveRating({
            internId,
            rating: 5,
            feedback: 'Week B feedback',
            week: weekB,
            createdBy: 'Admin',
          });

          const ratings = readStorage(RATINGS_KEY, []);

          // Exactly one for week A
          const forWeekA = ratings.filter(
            (r) => r.internId === internId && r.week === weekA
          );
          expect(forWeekA.length).toBe(1);

          // Exactly one for week B
          const forWeekB = ratings.filter(
            (r) => r.internId === internId && r.week === weekB
          );
          expect(forWeekB.length).toBe(1);
          expect(forWeekB[0].rating).toBe(5);
        }
      ),
      { numRuns: 100 }
    );
  });
});
