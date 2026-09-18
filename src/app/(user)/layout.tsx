'use client';

/**
 * MEDIMESH INDIA 2.0 — User Routes Layout
 *
 * Wraps account routes: /account, /account/saved, /account/comparisons,
 * /account/searches, /account/notifications, /account/settings.
 *
 * Provides ToastProvider, AuthProvider, Header, AccountNav, AuthPromptDialog, and Footer.
 */

import React from 'react';
import { ToastProvider } from '@/design-system/primitives/toast';
import { AuthProvider } from '@/features/user/auth';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { AccountNav } from '@/features/user/components/account-nav';
import { AuthPromptDialog } from '@/features/user/components/auth-prompt-dialog';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[var(--color-surface,#faf8ff)] text-[var(--color-on-surface,#131b2e)]">
          <Header />
          <AccountNav />
          <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
            {children}
          </main>
          <Footer />
          <AuthPromptDialog />
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}
