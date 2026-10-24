import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow = '';

/**
 * Acquire a body scroll lock.
 * Tracks nested locks and only applies 'overflow: hidden' once.
 */
export function lockScroll() {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    const current = document.body.style.overflow;
    originalOverflow = current === 'hidden' ? '' : current;
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

/**
 * Release a body scroll lock.
 * Decrements lock count and restores the original overflow when count reaches 0.
 */
export function unlockScroll() {
  if (typeof document === 'undefined') return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow || '';
  }
}

/**
 * Force resets any active scroll locks and restores default overflow.
 * Useful for route navigation, unmounting root shells, or error recovery.
 */
export function resetScrollLock() {
  if (typeof document === 'undefined') return;
  lockCount = 0;
  document.body.style.overflow = '';
}

/**
 * React hook to lock scroll when `enabled` is true, and automatically
 * release lock when `enabled` becomes false or when the component unmounts.
 */
export function useScrollLock(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [enabled]);
}
