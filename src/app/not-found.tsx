import Link from 'next/link';

/**
 * MEDIMESH INDIA — 404 Not Found
 *
 * Displayed when a route does not exist.
 * Maintains MEDIMESH brand and provides navigation back to discovery.
 */
export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="container-page text-center max-w-md">
        <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-[var(--color-surface-container)] flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-[var(--color-on-surface-variant)]">?</span>
        </div>

        <h1 className="font-heading text-2xl font-bold text-[var(--color-on-surface)] mb-2">
          Page not found
        </h1>

        <p className="text-sm text-[var(--color-on-surface-variant)] mb-6 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Try searching for healthcare facilities from the homepage.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-container)] transition-colors"
        >
          Return to MEDIMESH
        </Link>
      </div>
    </main>
  );
}
