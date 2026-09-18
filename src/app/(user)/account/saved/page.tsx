'use client';

/**
 * MEDIMESH INDIA 2.0 — Saved Information Page (/account/saved)
 *
 * Implements Section 16 of Phase 06 Specification:
 * - Category filter tabs across all 10 supported discovery types:
 *   Facilities, Doctors, Specialties, Services, Schemes, Tariffs, Ambulances, Pharmacies, Home Healthcare.
 * - Renders SavedItemCard with live resolved public metadata.
 * - Sourced provenance, verification states, and tariff temporal status preserved.
 * - Clean empty states with discovery CTAs.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/user/auth';
import { defaultUserService } from '@/features/user/services';
import type { SavedItemResolved, SavedEntityType } from '@/features/user/domain';
import { SavedItemCard } from '@/features/user/components';
import { BookmarkIcon, SearchIcon, RefreshIcon } from '@/components/global/icons';
import { Button } from '@/design-system/primitives/button';
import { useToast } from '@/design-system/primitives/toast';

const CATEGORY_TABS: Array<{ label: string; type?: SavedEntityType }> = [
  { label: 'All Items' },
  { label: 'Facilities', type: 'FACILITY' },
  { label: 'Doctors', type: 'DOCTOR' },
  { label: 'Specialties', type: 'SPECIALTY' },
  { label: 'Services', type: 'SERVICE' },
  { label: 'Schemes', type: 'SCHEME' },
  { label: 'Tariffs', type: 'TARIFF' },
  { label: 'Ambulances', type: 'AMBULANCE' },
  { label: 'Pharmacies', type: 'PHARMACY' },
  { label: 'Home Healthcare', type: 'HOME_HEALTHCARE' },
];

export default function AccountSavedPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<SavedEntityType | undefined>(undefined);
  const [savedItems, setSavedItems] = useState<SavedItemResolved[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!user?.id) return;

    defaultUserService
      .listSavedItemsResolved(user.id, selectedType)
      .then((items) => {
        if (isMounted) {
          setSavedItems(items);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          showToast('Failed to load saved items', 'info');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, selectedType, showToast]);

  const handleUnsave = async (entityType: SavedEntityType, entityId: string) => {
    if (!user?.id) return;
    try {
      await defaultUserService.unsaveItem(user.id, entityType, entityId);
      setSavedItems((prev) =>
        prev.filter((i) => !(i.savedItem.entityType === entityType && i.savedItem.entityId === entityId))
      );
      showToast('Removed from saved items', 'info');
    } catch {
      showToast('Failed to remove item', 'info');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="p-8 text-center bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] max-w-lg mx-auto my-8">
        <BookmarkIcon size={40} className="mx-auto text-[var(--color-primary)] mb-3" />
        <h2 className="font-heading text-xl font-bold text-[var(--color-on-surface)]">
          Sign In to Access Saved Information
        </h2>
        <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] mt-1 mb-6">
          Saved public healthcare records are linked to your MEDIMESH account.
        </p>
        <Link href="/facilities">
          <Button variant="primary" size="md">
            Explore Healthcare Facilities
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
            Saved Healthcare Information
          </h1>
          <p className="text-xs md:text-sm text-[var(--color-on-surface-variant)] mt-1">
            Personal bookmark directory of verified public healthcare records across India.
          </p>
        </div>

        <Link href="/facilities">
          <Button variant="outline" size="sm" leftIcon={<SearchIcon size={14} />}>
            Discover Facilities
          </Button>
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 border-b border-[var(--color-border-default)]">
        {CATEGORY_TABS.map((tab) => {
          const isSelected = selectedType === tab.type;
          return (
            <button
              type="button"
              key={tab.label}
              onClick={() => setSelectedType(tab.type)}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                  : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[var(--color-outline)] flex items-center justify-center gap-2">
          <RefreshIcon size={16} className="animate-spin text-[var(--color-primary)]" />
          <span>Loading saved records...</span>
        </div>
      ) : savedItems.length === 0 ? (
        <div className="p-10 text-center bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)]">
          <BookmarkIcon size={36} className="mx-auto text-[var(--color-outline)] mb-2" />
          <h3 className="font-heading text-base font-bold text-[var(--color-on-surface)]">
            No saved healthcare information yet.
          </h3>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 mb-6 max-w-sm mx-auto">
            Bookmark hospitals, clinical specialties, public health schemes, and tariffs while browsing.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/facilities">
              <Button variant="primary" size="sm">
                Browse Facilities
              </Button>
            </Link>
            <Link href="/schemes">
              <Button variant="outline" size="sm">
                View Health Schemes
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item) => (
            <SavedItemCard
              key={`${item.savedItem.entityType}-${item.savedItem.entityId}`}
              item={item}
              onUnsave={handleUnsave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
