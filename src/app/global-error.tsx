'use client';

/**
 * MEDIMESH INDIA — Global Error Boundary
 *
 * Catches unhandled errors in the application and provides
 * a safe recovery mechanism. Maintains brand consistency.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#faf8ff] text-[#131b2e] font-sans antialiased">
        <div className="text-center max-w-md px-4">
          <div className="w-14 h-14 rounded-lg bg-[#ffdad6] flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-[#93000a]">!</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            Something went wrong
          </h1>

          <p className="text-sm text-[#3e4947] mb-6 leading-relaxed">
            An unexpected error occurred. This does not affect any healthcare
            data. Please try again or return to the homepage.
          </p>

          {error.digest && (
            <p className="text-xs text-[#6e7977] mb-4">
              Reference: {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005c55] text-white text-sm font-semibold rounded-md hover:bg-[#0f766e] transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
