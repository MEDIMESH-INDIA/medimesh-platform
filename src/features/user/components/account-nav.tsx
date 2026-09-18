'use client';

/**
 * MEDIMESH INDIA 2.0 — Account Navigation Bar
 *
 * Tabbed navigation header shared across account views:
 * Overview, Saved Information, Saved Comparisons, Recent Searches, Notifications, and Settings.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  PersonIcon,
  BookmarkIcon,
  ScaleIcon,
  SearchIcon,
  NotificationsIcon,
  SettingsIcon,
  ShieldIcon,
} from '@/components/global/icons';

const NAV_ITEMS = [
  { label: 'Overview', href: '/account', icon: PersonIcon },
  { label: 'Saved Items', href: '/account/saved', icon: BookmarkIcon },
  { label: 'Comparisons', href: '/account/comparisons', icon: ScaleIcon },
  { label: 'Recent Searches', href: '/account/searches', icon: SearchIcon },
  { label: 'Notifications', href: '/account/notifications', icon: NotificationsIcon },
  { label: 'Correction Activity', href: '/account/activity', icon: ShieldIcon },
  { label: 'Settings', href: '/account/settings', icon: SettingsIcon },
];

export function AccountNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account Sub-Navigation"
      className={cn(
        'w-full border-b border-[var(--color-border-default)] bg-[var(--color-surface-container-lowest,#ffffff)] overflow-x-auto scrollbar-none',
        className
      )}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex items-center gap-1 sm:gap-2 min-w-max">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/account'
              ? pathname === '/account'
              : pathname.startsWith(item.href);

          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 py-3 px-3.5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer select-none',
                isActive
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-surface-container-low,#f2f3ff)]/50'
                  : 'border-transparent text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]'
              )}
            >
              <IconComponent size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
