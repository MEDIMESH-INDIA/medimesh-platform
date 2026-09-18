'use client';

/**
 * MEDIMESH INDIA 2.0 — Recent Searches Page (/account/searches)
 *
 * Implements Section 20 & 21 of Phase 06 Specification:
 * - Displays recent discovery queries (newest-first).
 * - Individual removal and full history clear.
 * - Non-diagnostic: purely search text and location context.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/user/auth';
import { defaultUserService } from '@/features/user/services';
import type { RecentSearch } from '@/features/user/domain';
import { RecentSearchesList } from '@/features/user/components';
import { SearchIcon, RefreshIcon } from '@/components/global/icons';
import { Button } from '@/design-system/primitives/button';
import { useToast } from '@/design-system/primitives/toast';

export default function AccountSearchesPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [searches, setSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!user?.id) return;

    defaultUserService
      .listRecentSearches(user.id)
      .then((data) => {
        if (isMounted) {
          setSearches(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          showToast('Failed to load search history', 'info');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, showToast]);

  const handleRemove = async (searchId: string) => {
    if (!user?.id) return;
    try {
      await defaultUserService.removeRecentSearch(user.id, searchId);
      setSearches((prev) => prev.filter((s) => s.id !== searchId));
      showToast('Search removed from history', 'info');
    } catch {
      showToast('Failed to remove search', 'info');
    }
  };

  const handleClearAll = async () => {
    if (!user?.id) return;
    try {
      await defaultUserService.clearRecentSearches(user.id);
      setSearches([]);
      showToast('Search history cleared', 'info');
    } catch {
      showToast('Failed to clear search history', 'info');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="p-8 text-center bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] max-w-lg mx-auto my-8">
        <SearchIcon size={40} className="mx-auto text-[var(--color-primary)] mb-3" />
        <h2 className="font-heading text-xl font-bold text-[var(--color-on-surface)]">
          Sign In to Access Search History
        </h2>
        <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] mt-1 mb-6">
          Recent discovery searches are stored securely on your MEDIMESH account.
        </p>
        <Link href="/search">
          <Button variant="primary" size="md">
            Start Discovery Search
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
            Recent Searches
          </h1>
          <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] mt-1">
            Search history is stored for discovery convenience only and is never used to infer medical conditions.
          </p>
        </div>

        <Link href="/search">
          <Button variant="outline" size="sm" leftIcon={<SearchIcon size={14} />}>
            New Search
          </Button>
        </Link>
      </div>

      {/* Searches List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[var(--color-outline)] flex items-center justify-center gap-2">
          <RefreshIcon size={16} className="animate-spin text-[var(--color-primary)]" />
          <span>Loading search history...</span>
        </div>
      ) : (
        <RecentSearchesList
          searches={searches}
          onRemove={handleRemove}
          onClearAll={searches.length > 0 ? handleClearAll : undefined}
        />
      )}
    </div>
  );
}
