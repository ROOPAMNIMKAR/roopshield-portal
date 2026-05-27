// Feature: roopshield-internship-portal, Property 11: Announcement visibility filter correctness

/**
 * Property 11: Announcement visibility filter correctness
 *
 * For any intern with a given department, the set of announcements displayed
 * to that intern SHALL be exactly the subset of all announcements where
 * visibleTo is "All" or equals the intern's department — no more, no less.
 *
 * Validates: Requirements 11.6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { writeStorage } from '../services/storage';
import useAnnouncementStore from './announcementStore';

const ANNOUNCEMENTS_KEY = 'roopshield_announcements';

const departmentArb = fc.constantFrom(
  'Engineering',
  'Design',
  'Marketing',
  'Operations',
  'Finance'
);

const importanceArb = fc.constantFrom('Info', 'Warning', 'Important');

// visibleTo can be 'All' or one of the departments
const visibleToArb = fc.oneof(
  fc.constant('All'),
  departmentArb
);

const announcementArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  body: fc.string({ minLength: 1, maxLength: 200 }),
  importance: importanceArb,
  visibleTo: visibleToArb,
  createdBy: fc.constant('Admin'),
  createdAt: fc.date().map((d) => d.toISOString()),
});

describe('Property 11: Announcement visibility filter correctness', () => {
  beforeEach(() => {
    localStorage.clear();
    useAnnouncementStore.setState({ announcements: [] });
  });

  it('getVisibleAnnouncements returns exactly those where visibleTo === "All" or visibleTo === department', () => {
    fc.assert(
      fc.property(
        fc.array(announcementArb, { minLength: 0, maxLength: 20 }),
        departmentArb,
        (announcements, department) => {
          localStorage.clear();

          // Write announcements directly to localStorage and sync store state
          writeStorage(ANNOUNCEMENTS_KEY, announcements);
          useAnnouncementStore.setState({ announcements });

          // Call the store's filter function
          const visible = useAnnouncementStore.getState().getVisibleAnnouncements(department);

          // Compute the expected set manually
          const expected = announcements.filter(
            (a) => a.visibleTo === 'All' || a.visibleTo === department
          );

          // Assert same length
          expect(visible.length).toBe(expected.length);

          // Assert every returned announcement is in the expected set
          for (const ann of visible) {
            const isExpected =
              ann.visibleTo === 'All' || ann.visibleTo === department;
            expect(isExpected).toBe(true);
          }

          // Assert every expected announcement is in the returned set
          for (const ann of expected) {
            const found = visible.some((v) => v.id === ann.id);
            expect(found).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('excludes announcements for other departments', () => {
    fc.assert(
      fc.property(
        fc.array(announcementArb, { minLength: 1, maxLength: 15 }),
        departmentArb,
        (announcements, department) => {
          localStorage.clear();
          writeStorage(ANNOUNCEMENTS_KEY, announcements);
          useAnnouncementStore.setState({ announcements });

          const visible = useAnnouncementStore.getState().getVisibleAnnouncements(department);

          // No announcement for a different department should appear
          for (const ann of visible) {
            const shouldBeVisible =
              ann.visibleTo === 'All' || ann.visibleTo === department;
            expect(shouldBeVisible).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('includes all "All" announcements regardless of department', () => {
    fc.assert(
      fc.property(
        fc.array(announcementArb, { minLength: 1, maxLength: 15 }),
        departmentArb,
        (announcements, department) => {
          localStorage.clear();
          writeStorage(ANNOUNCEMENTS_KEY, announcements);
          useAnnouncementStore.setState({ announcements });

          const visible = useAnnouncementStore.getState().getVisibleAnnouncements(department);
          const visibleIds = new Set(visible.map((a) => a.id));

          // Every "All" announcement must be in the visible set
          const allAnnouncements = announcements.filter((a) => a.visibleTo === 'All');
          for (const ann of allAnnouncements) {
            expect(visibleIds.has(ann.id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns empty array when no announcements match', () => {
    // Seed only announcements for a specific department that is NOT the queried one
    const announcements = [
      {
        id: 'ann-1',
        title: 'Engineering Only',
        body: 'For engineers',
        importance: 'Info',
        visibleTo: 'Engineering',
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
      },
    ];

    writeStorage(ANNOUNCEMENTS_KEY, announcements);
    useAnnouncementStore.setState({ announcements });

    const visible = useAnnouncementStore.getState().getVisibleAnnouncements('Finance');
    expect(visible).toHaveLength(0);
  });

  it('returns all announcements when all are visibleTo "All"', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 30 }),
            body: fc.string({ minLength: 1, maxLength: 100 }),
            importance: importanceArb,
            visibleTo: fc.constant('All'),
            createdBy: fc.constant('Admin'),
            createdAt: fc.date().map((d) => d.toISOString()),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        departmentArb,
        (announcements, department) => {
          localStorage.clear();
          writeStorage(ANNOUNCEMENTS_KEY, announcements);
          useAnnouncementStore.setState({ announcements });

          const visible = useAnnouncementStore.getState().getVisibleAnnouncements(department);
          expect(visible.length).toBe(announcements.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
