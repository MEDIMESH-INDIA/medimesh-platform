'use client';

/**
 * MEDIMESH INDIA 2.0 — Saved Comparisons Page (/account/comparisons)
 *
 * Implements Section 17, 18, 19 of Phase 06 Specification:
 * - Saved facility comparisons directory.
 * - Side-by-side presentation of strictly two facilities.
 * - Symmetrical pair normalization ([A, B] == [B, A]).
 * - Zero rankings, scores, winners, or suitability assessments.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/user/auth';
import { defaultUserService } from '@/features/user/services';
import type { SavedComparisonResolved } from '@/features/user/domain';
import { SavedComparisonCard } from '@/features/user/components';
import { ScaleIcon, SearchIcon, RefreshIcon } from '@/components/global/icons';
import { Button } from '@/design-system/primitives/button';
import { useToast } from '@/design-system/primitives/toast';

export default function AccountComparisonsPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [comparisons, setComparisons] = useState<SavedComparisonResolved[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!user?.id) return;

    defaultUserService
      .listComparisonsResolved(user.id)
      .then((data) => {
        if (isMounted) {
          setComparisons(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          showToast('Failed to load comparisons', 'info');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, showToast]);

  const handleRemove = async (comparisonId: string) => {
    if (!user?.id) return;
    try {
      await defaultUserService.removeComparison(user.id, comparisonId);
      setComparisons((prev) => prev.filter((c) => c.comparison.id !== comparisonId));
      showToast('Comparison removed from your account', 'info');
    } catch {
      showToast('Failed to remove comparison', 'info');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="p-8 text-center bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] max-w-lg mx-auto my-8">
        <ScaleIcon size={40} className="mx-auto text-[var(--color-primary)] mb-3" />
        <h2 className="font-heading text-xl font-bold text-[var(--color-on-surface)]">
          Sign In to Access Comparisons
        </h2>
        <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] mt-1 mb-6">
          Saved two-facility comparisons are linked to your MEDIMESH account.
        </p>
        <Link href="/search">
          <Button variant="primary" size="md">
            Compare Facilities
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
            Saved Facility Comparisons
          </h1>
          <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] mt-1">
            Side-by-side evaluation of documented capabilities between two healthcare facilities.
          </p>
        </div>

        <Link href="/search">
          <Button variant="outline" size="sm" leftIcon={<SearchIcon size={14} />}>
            New Comparison
          </Button>
        </Link>
      </div>

      {/* Comparisons List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[var(--color-outline)] flex items-center justify-center gap-2">
          <RefreshIcon size={16} className="animate-spin text-[var(--color-primary)]" />
          <span>Loading comparisons...</span>
        </div>
      ) : comparisons.length === 0 ? (
        <div className="p-10 text-center bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)]">
          <ScaleIcon size={36} className="mx-auto text-[var(--color-outline)] mb-2" />
          <h3 className="font-heading text-base font-bold text-[var(--color-on-surface)]">
            Your saved facility comparisons will appear here.
          </h3>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 mb-6 max-w-sm mx-auto">
            Select &ldquo;Compare&rdquo; on any two facilities during discovery to save their side-by-side attributes.
          </p>
          <Link href="/facilities">
            <Button variant="primary" size="sm">
              Discover Facilities to Compare
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {comparisons.map((c) => (
            <SavedComparisonCard
              key={c.comparison.id}
              comparison={c}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
