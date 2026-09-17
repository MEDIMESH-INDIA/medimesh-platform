'use client';

import { useEffect } from 'react';

/**
 * MEDIMESH INDIA — Route-Level Error Boundary
 *
 * Catches runtime errors inside the application layout shell.
 * Renders within the root layout so navigation, fonts, and styling persist.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structural logging — never expose PII or medical data in production
    console.error('MEDIMESH Application Error:', error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center min-h-[50vh] p-4">
      <div className="max-w-md w-full text-center bg-[var(--color-surface-container-lowest)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 shadow-sm">
        <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-error-container)] text-[var(--color-on-error-container)] flex items-center justify-center mx-auto mb-4 font-bold text-lg">
          !
        </div>

        <h1 className="font-heading text-xl font-semibold text-[var(--color-on-surface)] mb-2">
          Unable to display this view
        </h1>

        <p className="font-body text-sm text-[var(--color-on-surface-variant)] mb-6 leading-relaxed">
          An unexpected issue occurred while rendering this section. Healthcare data remains secure and unaffected.
        </p>

        {error.digest && (
          <p className="font-body text-xs text-[var(--color-outline)] mb-4 font-mono">
            Error reference: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center px-4 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-container)] transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
