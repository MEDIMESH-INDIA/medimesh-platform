'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { TariffItem, Facility, ServiceCapability } from '@/features/data-architecture/domain';
import { InfoIcon } from '@/components/global/icons';

export interface TariffRowData {
  tariff: TariffItem;
  facility?: Facility;
  service?: ServiceCapability;
}

export interface TariffTableProps {
  tariffs: TariffRowData[];
  className?: string;
}

export function TariffTable({ tariffs, className }: TariffTableProps) {
  const now = new Date();

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Informational Policy Banner */}
      <div className="rounded-[var(--radius-lg)] p-4 bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] flex items-start gap-3 text-xs text-[var(--color-on-surface-variant)]">
        <InfoIcon size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-[var(--color-on-surface)]">
            Non-Commercial Informational Schedule
          </span>
          <span>
            Tariff disclosures are compiled from public hospital rate schedules and statutory filings.
            They are presented without promotional ranking, &quot;best price&quot; sorting, or commercial comparisons.
            Actual billing depends on patient clinical presentation, consumables, room category, and physician evaluations.
          </span>
        </div>
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-container-lowest,#ffffff)] shadow-[var(--shadow-sm)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--color-surface-container-low)] border-b border-[var(--color-border-default)] font-semibold text-[var(--color-on-surface)]">
              <th className="p-3.5">Service / Procedure</th>
              <th className="p-3.5">Facility</th>
              <th className="p-3.5">City</th>
              <th className="p-3.5">Reported Rate</th>
              <th className="p-3.5">Unit / Details</th>
              <th className="p-3.5">Effective Window</th>
              <th className="p-3.5">Validity Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {tariffs.map(({ tariff, facility, service }) => {
              const isExpired =
                tariff.isArchived ||
                tariff.workflowStatus === 'ARCHIVED' ||
                (tariff.effectiveTo && new Date(tariff.effectiveTo) < now);

              const isUnconfirmed = !tariff.effectiveFrom && !tariff.effectiveTo;

              return (
                <tr
                  key={tariff.id}
                  className={cn(
                    'hover:bg-[var(--color-surface-container-low)]/50 transition-colors',
                    isExpired && 'opacity-60 bg-[var(--color-surface-container-low)]/30'
                  )}
                >
                  <td className="p-3.5 font-medium text-[var(--color-on-surface)]">
                    <span className="font-semibold block">{service?.name || tariff.notes || tariff.id}</span>
                    {tariff.notes && service && (
                      <span className="text-[11px] text-[var(--color-outline)]">{tariff.notes}</span>
                    )}
                  </td>

                  <td className="p-3.5">
                    {facility ? (
                      <Link
                        href={`/facilities/${facility.slug}`}
                        className="font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)] hover:underline"
                      >
                        {facility.name}
                      </Link>
                    ) : (
                      <span className="text-[var(--color-outline)]">Demo Facility</span>
                    )}
                  </td>

                  <td className="p-3.5 text-[var(--color-on-surface-variant)]">
                    {facility?.location.city || '—'}
                  </td>

                  <td className="p-3.5 font-bold text-[var(--color-on-surface)]">
                    {tariff.currency} {tariff.amount.toLocaleString('en-IN')}
                  </td>

                  <td className="p-3.5 text-[var(--color-on-surface-variant)]">
                    {tariff.unit}
                  </td>

                  <td className="p-3.5 text-[var(--color-on-surface-variant)]">
                    {isUnconfirmed ? (
                      <span className="text-[var(--color-tertiary)] font-medium">
                        Effective period not confirmed
                      </span>
                    ) : (
                      <span>
                        {tariff.effectiveFrom?.slice(0, 10) || 'Unknown'} &mdash;{' '}
                        {tariff.effectiveTo?.slice(0, 10) || 'Active'}
                      </span>
                    )}
                  </td>

                  <td className="p-3.5">
                    {isExpired ? (
                      <span className="px-2 py-0.5 rounded bg-[var(--color-surface-container-high)] text-[var(--color-outline)] font-semibold text-[10px]">
                        Historical / Expired Tariff
                      </span>
                    ) : isUnconfirmed ? (
                      <span className="px-2 py-0.5 rounded bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] font-semibold text-[10px]">
                        Unconfirmed Window
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-semibold text-[10px]">
                        Published Rate
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
