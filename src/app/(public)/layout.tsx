import { ToastProvider } from '@/design-system/primitives/toast';
import { AuthProvider } from '@/features/user/auth';
import { AuthPromptDialog } from '@/features/user/components';

/**
 * Public routes layout — healthcare discovery pages accessible without authentication.
 * Wraps: homepage, search, hospital profiles, specialties, schemes, etc.
 *
 * Lightweight non-blocking AuthProvider enables the logged-out Save flow modal
 * without delaying or gating public discovery browsing.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
        <AuthPromptDialog />
      </AuthProvider>
    </ToastProvider>
  );
}
