/**
 * User routes layout — authenticated user pages.
 * Wraps: My MEDIMESH, saved items, notifications, settings, corrections.
 * Authentication will be enforced in a later phase.
 */
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
