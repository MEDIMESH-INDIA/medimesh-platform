'use client';

/**
 * MEDIMESH INDIA 2.0 — Account Overview Page (/account)
 *
 * Implements Section 24 of Phase 06 Specification:
 * - Dynamic current user greeting: "Welcome back, {currentUser.displayName}" (never hardcoded).
 * - Stat metric cards: saved items, comparisons, recent searches, unread notifications.
 * - Quick jump cards to all account sections.
 * - Development-only demo switcher for frictionless pairing and multi-tenant testing.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/user/auth';
import { defaultUserService, type AccountOverviewSummary } from '@/features/user/services';
import {
  PersonIcon,
  BookmarkIcon,
  ScaleIcon,
  SearchIcon,
  NotificationsIcon,
  SettingsIcon,
  ArrowForwardIcon,
  ShieldIcon,
  FlagIcon,
} from '@/components/global/icons';
import { Button } from '@/design-system/primitives/button';

export default function AccountOverviewPage() {
  const { user, isAuthenticated, switchUser } = useAuth();
  const [overview, setOverview] = useState<AccountOverviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!user?.id) {
      return;
    }
    defaultUserService
      .getAccountOverview(user.id)
      .then((data) => {
        if (isMounted) {
          setOverview(data);
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

  if (!isAuthenticated || !user) {
    return (
      <div className="p-8 text-center bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] max-w-lg mx-auto my-8">
        <PersonIcon size={40} className="mx-auto text-[var(--color-primary)] mb-3" />
        <h2 className="font-heading text-xl font-bold text-[var(--color-on-surface)]">
          Account Sign In Required
        </h2>
        <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] mt-1.5 mb-6">
          Sign in to access your personal discovery saves, facility comparisons, and preferences.
        </p>
        <Link href="/search">
          <Button variant="primary" size="md" className="font-semibold">
            Browse Public Healthcare Discovery
          </Button>
        </Link>
      </div>
    );
  }

  const displayName = user.displayName;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[var(--shadow-xs)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center font-bold text-lg md:text-xl shadow-xs shrink-0">
            {displayName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-wider">
                Personal Healthcare Discovery Account
              </span>
              <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] text-[10px] font-semibold">
                Synthetic Demo
              </span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] mt-1 max-w-2xl">
              Access your saved healthcare facilities, side-by-side comparisons, and discovery preferences.
            </p>
          </div>
        </div>

        {/* Development Demo Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-[var(--color-border-subtle)] shrink-0">
          <div className="text-xs text-[var(--color-outline)] hidden lg:block mr-1">
            Demo Identity:
          </div>
          <button
            type="button"
            onClick={() => switchUser('user-demo-001')}
            className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold border transition-colors cursor-pointer ${
              user.id === 'user-demo-001'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
                : 'bg-[var(--color-surface)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)]'
            }`}
          >
            Demo User 001
          </button>
          <button
            type="button"
            onClick={() => switchUser('user-demo-002')}
            className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold border transition-colors cursor-pointer ${
              user.id === 'user-demo-002'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
                : 'bg-[var(--color-surface)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)]'
            }`}
          >
            Demo User 002
          </button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Saved Items */}
        <Link
          href="/account/saved"
          className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 md:p-5 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)] transition-all flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
              Saved Items
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container)] text-[var(--color-primary)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)] transition-colors">
              <BookmarkIcon size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-[var(--color-on-surface)]">
              {isLoading ? '...' : overview?.savedItemsCount ?? 0}
            </div>
            <span className="text-[11px] text-[var(--color-outline)]">Across 10 discovery categories</span>
          </div>
        </Link>

        {/* Comparisons */}
        <Link
          href="/account/comparisons"
          className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 md:p-5 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)] transition-all flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
              Comparisons
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container)] text-[var(--color-primary)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)] transition-colors">
              <ScaleIcon size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-[var(--color-on-surface)]">
              {isLoading ? '...' : overview?.comparisonsCount ?? 0}
            </div>
            <span className="text-[11px] text-[var(--color-outline)]">Side-by-side facility pairs</span>
          </div>
        </Link>

        {/* Recent Searches */}
        <Link
          href="/account/searches"
          className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 md:p-5 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)] transition-all flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
              Searches
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container)] text-[var(--color-primary)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)] transition-colors">
              <SearchIcon size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-[var(--color-on-surface)]">
              {isLoading ? '...' : overview?.recentSearchesCount ?? 0}
            </div>
            <span className="text-[11px] text-[var(--color-outline)]">Recent discovery queries</span>
          </div>
        </Link>

        {/* Notifications */}
        <Link
          href="/account/notifications"
          className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 md:p-5 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)] transition-all flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
              Notifications
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container)] text-[var(--color-primary)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)] transition-colors">
              <NotificationsIcon size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-[var(--color-on-surface)] flex items-center gap-2">
              <span>{isLoading ? '...' : overview?.unreadNotificationsCount ?? 0}</span>
              {(overview?.unreadNotificationsCount ?? 0) > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold">
                  New
                </span>
              )}
            </div>
            <span className="text-[11px] text-[var(--color-outline)]">Platform informational notices</span>
          </div>
        </Link>
      </div>

      {/* Quick Jump Links & Platform Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="font-heading text-lg font-bold text-[var(--color-on-surface)]">
            Account Discovery Sections
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/account/saved"
              className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-container-low)] transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <BookmarkIcon size={20} className="text-[var(--color-primary)]" />
                <div>
                  <h3 className="font-heading text-sm font-bold text-[var(--color-on-surface)]">
                    Saved Healthcare Items
                  </h3>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">
                    View saved facilities, doctors, schemes, and tariffs.
                  </p>
                </div>
              </div>
              <ArrowForwardIcon size={16} className="text-[var(--color-outline)]" />
            </Link>

            <Link
              href="/account/comparisons"
              className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-container-low)] transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <ScaleIcon size={20} className="text-[var(--color-primary)]" />
                <div>
                  <h3 className="font-heading text-sm font-bold text-[var(--color-on-surface)]">
                    Facility Comparisons
                  </h3>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">
                    Review side-by-side facility capabilities.
                  </p>
                </div>
              </div>
              <ArrowForwardIcon size={16} className="text-[var(--color-outline)]" />
            </Link>

            <Link
              href="/account/searches"
              className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-container-low)] transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <SearchIcon size={20} className="text-[var(--color-primary)]" />
                <div>
                  <h3 className="font-heading text-sm font-bold text-[var(--color-on-surface)]">
                    Recent Searches
                  </h3>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">
                    Revisit past discovery searches and locations.
                  </p>
                </div>
              </div>
              <ArrowForwardIcon size={16} className="text-[var(--color-outline)]" />
            </Link>

            <Link
              href="/account/activity"
              className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-container-low)] transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FlagIcon size={20} className="text-[var(--color-primary)]" />
                <div>
                  <h3 className="font-heading text-sm font-bold text-[var(--color-on-surface)]">
                    Information Issues &amp; Corrections
                  </h3>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">
                    Track reported updates and provide clarification evidence.
                  </p>
                </div>
              </div>
              <ArrowForwardIcon size={16} className="text-[var(--color-outline)]" />
            </Link>

            <Link
              href="/account/settings"
              className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-container-low)] transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <SettingsIcon size={20} className="text-[var(--color-primary)]" />
                <div>
                  <h3 className="font-heading text-sm font-bold text-[var(--color-on-surface)]">
                    Account Settings
                  </h3>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">
                    Manage preferences and accessibility settings.
                  </p>
                </div>
              </div>
              <ArrowForwardIcon size={16} className="text-[var(--color-outline)]" />
            </Link>
          </div>
        </div>

        {/* Privacy Notice Card */}
        <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[var(--color-primary)]">
              <ShieldIcon size={18} />
              <span className="font-heading text-xs font-bold uppercase tracking-wider">
                Privacy Boundary
              </span>
            </div>
            <h3 className="font-heading text-sm font-bold text-[var(--color-on-surface)]">
              Discovery Personalization Only
            </h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Your MEDIMESH account stores your discovery preferences, saved public healthcare information, saved facility comparisons, and recent searches. It does NOT store patient medical records, clinical history, prescriptions, diagnoses, or symptoms.
            </p>
          </div>

          <Link
            href="/account/settings"
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
          >
            <span>Read full platform privacy disclosure</span>
            <ArrowForwardIcon size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
