'use client';

/**
 * MEDIMESH INDIA 2.0 — Account Settings Page (/account/settings)
 *
 * Implements Section 22 & Section 27 of Phase 06 Specification:
 * - PreferencesForm for location, accessibility, and platform communications.
 * - PrivacyCard displaying the factual platform privacy disclosure.
 * - Profile identity review.
 * - Demo account switching & sign-out options.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/user/auth';
import { defaultUserService } from '@/features/user/services';
import type { UserPreference } from '@/features/user/domain';
import { PreferencesForm, PrivacyCard } from '@/features/user/components';
import {
  SettingsIcon,
  RefreshIcon,
  LogOutIcon,
} from '@/components/global/icons';
import { Button } from '@/design-system/primitives/button';

export default function AccountSettingsPage() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!user?.id) return;

    defaultUserService
      .getPreferences(user.id)
      .then((prefs) => {
        if (isMounted) {
          setPreferences(prefs);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleSavePreferences = async (updated: UserPreference) => {
    if (!user?.id) return;
    const res = await defaultUserService.updatePreferences(user.id, updated);
    setPreferences(res);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="p-8 text-center bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] max-w-lg mx-auto my-8">
        <SettingsIcon size={40} className="mx-auto text-[var(--color-primary)] mb-3" />
        <h2 className="font-heading text-xl font-bold text-[var(--color-on-surface)]">
          Sign In to Access Settings
        </h2>
        <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] mt-1 mb-6">
          Account preferences and personalization settings are linked to your MEDIMESH account.
        </p>
        <Link href="/facilities">
          <Button variant="primary" size="md">
            Return to Discovery
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
          Account Settings &amp; Preferences
        </h1>
        <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] mt-1">
          Manage your discovery preferences, accessibility options, and review the non-clinical platform privacy boundary.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center font-bold text-lg shrink-0">
            {user.displayName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-heading text-base md:text-lg font-bold text-[var(--color-on-surface)]">
                {user.displayName}
              </h2>
              <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] text-[10px] font-bold">
                Synthetic Demo Account
              </span>
            </div>
            <p className="text-xs text-[var(--color-outline)]">
              Identifier: {user.authIdentifier} · Language: {user.preferredLanguage.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--color-border-subtle)]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            leftIcon={<LogOutIcon size={14} />}
            className="text-[var(--color-error)] hover:bg-[var(--color-surface-container-low)]"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Preferences Form */}
      {isLoading || !preferences ? (
        <div className="py-12 text-center text-xs text-[var(--color-outline)] flex items-center justify-center gap-2">
          <RefreshIcon size={16} className="animate-spin text-[var(--color-primary)]" />
          <span>Loading preferences...</span>
        </div>
      ) : (
        <PreferencesForm
          initialPreferences={preferences}
          onSave={handleSavePreferences}
        />
      )}

      {/* Platform Privacy Card */}
      <div>
        <h2 className="font-heading text-base font-bold text-[var(--color-on-surface)] mb-3">
          Platform Privacy Disclosure
        </h2>
        <PrivacyCard />
      </div>
    </div>
  );
}
