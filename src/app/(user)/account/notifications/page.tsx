'use client';

/**
 * MEDIMESH INDIA 2.0 — Notifications Page (/account/notifications)
 *
 * Implements Section 23 of Phase 06 Specification:
 * - Informational platform notifications only (saved item updates, correction workflow updates, account security, system notices).
 * - Mark as read, mark all as read.
 * - Filter by All or Unread.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/user/auth';
import { defaultUserService } from '@/features/user/services';
import type { PlatformNotification } from '@/features/user/domain';
import { NotificationList } from '@/features/user/components';
import { NotificationsIcon, RefreshIcon } from '@/components/global/icons';
import { Button } from '@/design-system/primitives/button';
import { useToast } from '@/design-system/primitives/toast';

export default function AccountNotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!user?.id) return;

    defaultUserService
      .listNotifications(user.id, unreadOnly)
      .then((data) => {
        if (isMounted) {
          setNotifications(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          showToast('Failed to load notifications', 'info');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, unreadOnly, showToast]);

  const handleMarkAsRead = async (id: string) => {
    if (!user?.id) return;
    try {
      await defaultUserService.markNotificationAsRead(user.id, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      showToast('Notification marked as read', 'info');
    } catch {
      showToast('Failed to update notification', 'info');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await defaultUserService.markAllNotificationsAsRead(user.id);
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: now })));
      showToast('All notifications marked as read', 'success');
    } catch {
      showToast('Failed to update notifications', 'info');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="p-8 text-center bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] max-w-lg mx-auto my-8">
        <NotificationsIcon size={40} className="mx-auto text-[var(--color-primary)] mb-3" />
        <h2 className="font-heading text-xl font-bold text-[var(--color-on-surface)]">
          Sign In to Access Notifications
        </h2>
        <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] mt-1 mb-6">
          Platform notifications for your saved healthcare items are linked to your account.
        </p>
        <Link href="/facilities">
          <Button variant="primary" size="md">
            Browse Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
            Platform Notifications
          </h1>
          <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] mt-1">
            Informational updates regarding your saved healthcare information and correction submissions.
          </p>
        </div>

        {/* Filter Toggle: All vs Unread */}
        <div className="flex items-center gap-2 bg-[var(--color-surface-container-low)] p-1 rounded-[var(--radius-md)] border border-[var(--color-border-default)] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setUnreadOnly(false)}
            className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
              !unreadOnly
                ? 'bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            All Notices
          </button>
          <button
            type="button"
            onClick={() => setUnreadOnly(true)}
            className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
              unreadOnly
                ? 'bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            Unread Only
          </button>
        </div>
      </div>

      {/* Notifications Content */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[var(--color-outline)] flex items-center justify-center gap-2">
          <RefreshIcon size={16} className="animate-spin text-[var(--color-primary)]" />
          <span>Loading notifications...</span>
        </div>
      ) : (
        <NotificationList
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={notifications.some((n) => !n.readAt) ? handleMarkAllAsRead : undefined}
        />
      )}
    </div>
  );
}
