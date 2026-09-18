'use client';

/**
 * MEDIMESH INDIA 2.0 — Platform Notification List
 *
 * Implements Section 23 of Phase 06 Specification:
 * - Informational platform notifications only (saved item updates, correction review updates, account security, system notices).
 * - STRICTLY PROHIBITED: medical alerts, diagnosis alerts, clinical recommendations.
 * - Supports user-scoped unread count, individual mark-read, and mark-all-read.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { PlatformNotification } from '../domain/index.ts';
import {
  NotificationsIcon,
  CheckIcon,
  InfoIcon,
  ShieldIcon,
  BookmarkIcon,
} from '@/components/global/icons';

export interface NotificationListProps {
  notifications: PlatformNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)]">
        <NotificationsIcon size={32} className="mx-auto text-[var(--color-outline)] mb-2" />
        <h3 className="font-heading text-base font-bold text-[var(--color-on-surface)]">
          No platform notifications yet.
        </h3>
        <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 max-w-sm mx-auto">
          Informational updates regarding saved public healthcare items and correction submissions will appear here.
        </p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const getCategoryBadge = (type: PlatformNotification['type']) => {
    switch (type) {
      case 'SAVED_INFORMATION':
        return {
          label: 'Saved Information',
          bg: 'bg-[var(--color-surface-container-high)] text-[var(--color-primary)]',
          icon: BookmarkIcon,
        };
      case 'CORRECTION_UPDATE':
        return {
          label: 'Correction Update',
          bg: 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]',
          icon: CheckIcon,
        };
      case 'ACCOUNT_SECURITY':
        return {
          label: 'Account & Preferences',
          bg: 'bg-[var(--color-surface-container)] text-[var(--color-on-surface)]',
          icon: ShieldIcon,
        };
      case 'SYSTEM':
      default:
        return {
          label: 'Platform Notice',
          bg: 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)]',
          icon: InfoIcon,
        };
    }
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Header with Unread Count & Mark All Read */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
            Notifications ({notifications.length})
          </span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[10px] font-bold">
              {unreadCount} Unread
            </span>
          )}
        </div>

        {unreadCount > 0 && onMarkAllAsRead && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <CheckIcon size={14} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notification Items */}
      <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] divide-y divide-[var(--color-border-subtle)] overflow-hidden shadow-[var(--shadow-xs)]">
        {notifications.map((n) => {
          const badge = getCategoryBadge(n.type);
          const IconComponent = badge.icon;
          const isUnread = !n.readAt;

          return (
            <div
              key={n.id}
              className={cn(
                'p-4 flex items-start justify-between gap-3 transition-colors',
                isUnread
                  ? 'bg-[var(--color-surface-container-low)]/40'
                  : 'hover:bg-[var(--color-surface-container-low)]/20'
              )}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    badge.bg
                  )}
                >
                  <IconComponent size={16} />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold', badge.bg)}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-[var(--color-outline)]">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] inline-block" />
                    )}
                  </div>

                  <h4 className="font-heading text-sm font-bold text-[var(--color-on-surface)] leading-snug">
                    {n.title}
                  </h4>

                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>

              {isUnread && onMarkAsRead && (
                <button
                  type="button"
                  onClick={() => onMarkAsRead(n.id)}
                  aria-label="Mark notification as read"
                  className="px-2.5 py-1 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] transition-colors shrink-0 cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
