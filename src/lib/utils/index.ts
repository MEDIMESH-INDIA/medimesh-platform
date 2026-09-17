/**
 * MEDIMESH INDIA — Utility Functions
 *
 * Small, focused utility functions used across the application.
 */

/**
 * Conditionally join CSS class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a distance value with the "approx" qualifier.
 * MEDIMESH never implies precise distances.
 */
export function formatDistance(km: number): string {
  return `~${km.toFixed(1)} km approx`;
}

/**
 * Format a relative time string from an ISO date.
 * Returns human-readable strings like "Updated today", "Updated 4 days ago".
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays < 7) return `Updated ${diffDays} days ago`;
  if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)} weeks ago`;
  return `Updated ${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Check if a freshness timestamp is considered stale.
 * Data older than the threshold (in hours) is considered stale.
 */
export function isStale(isoDate: string, thresholdHours = 48): boolean {
  const date = new Date(isoDate);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffHours > thresholdHours;
}
