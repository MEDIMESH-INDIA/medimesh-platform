import { ToastProvider } from '@/design-system/primitives/toast';

/**
 * Public routes layout — healthcare discovery pages accessible without authentication.
 * Wraps: homepage, search, hospital profiles, specialties, schemes, etc.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
