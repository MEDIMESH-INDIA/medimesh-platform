/**
 * Admin layout — MEDIMESH internal administration pages.
 * Wraps: data review queue, claim review, publication workflow.
 * Authentication and role enforcement in a later phase.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
