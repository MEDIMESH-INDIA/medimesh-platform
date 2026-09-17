import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Test utilities directly
import { cn, formatDistance, formatRelativeTime, isStale } from '../src/lib/utils/index.ts';
import { colors, breakpoints, radius, spacing } from '../src/design-system/tokens.ts';
import { SAFETY_DISCLAIMERS } from '../src/types/index.ts';
import type { VerificationState, LocationMode } from '../src/types/index.ts';

describe('MEDIMESH Foundation Tests', () => {
  describe('Design Tokens', () => {
    it('should define canonical primary colors from DESIGN.md', () => {
      assert.equal(colors.primary, '#005c55');
      assert.equal(colors['primary-container'], '#0f766e');
      assert.equal(colors.surface, '#faf8ff');
      assert.equal(colors['on-surface'], '#131b2e');
      assert.equal(colors.secondary, '#0051d5');
      assert.equal(colors.tertiary, '#7d4200');
      assert.equal(colors.error, '#ba1a1a');
    });

    it('should define locked responsive breakpoints', () => {
      assert.equal(breakpoints.mobile, '640px');
      assert.equal(breakpoints.tablet, '1024px');
      assert.equal(breakpoints.maxContent, '1280px');
    });

    it('should define restrained radius scale per DESIGN.md (max 8px for cards)', () => {
      assert.equal(radius.sm, '0.125rem');
      assert.equal(radius.DEFAULT, '0.25rem');
      assert.equal(radius.md, '0.375rem');
      assert.equal(radius.lg, '0.5rem'); // 8px card radius
      assert.equal(radius.xl, '0.75rem');
    });

    it('should define responsive margin and gutter spacing per DESIGN.md', () => {
      assert.equal(spacing.margin, '2rem');
      assert.equal(spacing['margin-mobile'], '1rem');
      assert.equal(spacing.gutter, '1.5rem');
      assert.equal(spacing['gutter-mobile'], '0.75rem');
    });
  });

  describe('Utility Functions', () => {
    it('cn should join truthy class names and ignore falsy values', () => {
      assert.equal(cn('px-4', undefined, 'py-2', false, null, 'text-teal'), 'px-4 py-2 text-teal');
    });

    it('formatDistance should always include approximate indicator', () => {
      const distance = formatDistance(3.2);
      assert.equal(distance, '~3.2 km approx');
      assert.ok(distance.includes('approx'), 'Distance must explicitly state approx');
      assert.ok(distance.startsWith('~'), 'Distance must begin with tilde prefix');

      assert.equal(formatDistance(0.5), '~0.5 km approx');
      assert.equal(formatDistance(10), '~10.0 km approx');
    });

    it('formatRelativeTime should return human-readable relative time strings', () => {
      const now = new Date().toISOString();
      assert.equal(formatRelativeTime(now), 'Updated today');
    });

    it('isStale should flag timestamps older than threshold', () => {
      const recent = new Date().toISOString();
      assert.equal(isStale(recent, 48), false);

      const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
      assert.equal(isStale(threeDaysAgo, 48), true);
    });
  });

  describe('Safety & Trust Architecture', () => {
    it('should contain immutable safety disclaimers', () => {
      assert.ok(SAFETY_DISCLAIMERS.primaryDisclosure.length > 0);
      assert.ok(SAFETY_DISCLAIMERS.emergencyRedirect.includes('112') || SAFETY_DISCLAIMERS.emergencyRedirect.includes('emergency'));
      assert.ok(SAFETY_DISCLAIMERS.searchTransparency.includes('does not provide medical diagnosis'));
      assert.ok(SAFETY_DISCLAIMERS.nonRanking.includes('does not rank'));
    });

    it('should support the 5 locked verification states', () => {
      const validStates: VerificationState[] = [
        'PUBLIC_SOURCE',
        'FACILITY_REPORTED',
        'MEDIMESH_VERIFIED',
        'PENDING_VERIFICATION',
        'NOT_CONFIRMED',
      ];
      assert.equal(validStates.length, 5);
    });

    it('should support explicit location modes distinguishing manual vs approximate vs device', () => {
      const modes: LocationMode[] = ['SELECTED', 'APPROXIMATE', 'ACTUAL', 'NONE'];
      assert.equal(modes.length, 4);
    });
  });
});
