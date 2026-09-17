/**
 * MEDIMESH INDIA — Loading State
 *
 * Displayed during route transitions. Uses the design system's
 * surface colors and subtle animation.
 */
export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        {/* Pulse indicator */}
        <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-high)] animate-pulse" />
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Loading…
        </p>
      </div>
    </div>
  );
}
