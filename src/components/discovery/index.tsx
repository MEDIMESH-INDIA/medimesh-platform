'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/forms/search-input';
import {
  TuneIcon,
  ChevronDownIcon,
  InfoIcon,
  CloseIcon,
} from '@/components/global/icons';

export interface SearchSuggestionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function SearchSuggestion({
  icon,
  className,
  children,
  ...props
}: SearchSuggestionProps) {
  return (
    <button
      type="button"
      className={cn(
        'shrink-0 bg-[var(--color-surface-container-low,#f2f3ff)] hover:bg-[var(--color-surface-container,#eaedff)] text-[var(--color-on-surface-variant,#3e4947)] font-body text-xs md:text-sm px-3 py-1.5 rounded-[var(--radius-md)] transition-colors flex items-center gap-1.5 cursor-pointer select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        className
      )}
      {...props}
    >
      {icon && <span className="text-[var(--color-primary)] shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export interface SearchSuggestionGroupProps {
  label?: string;
  className?: string;
  children: React.ReactNode;
}

export function SearchSuggestionGroup({
  label = 'Common Queries:',
  className,
  children,
}: SearchSuggestionGroupProps) {
  return (
    <div className={cn('flex items-center flex-wrap gap-2 text-left', className)}>
      {label && (
        <span className="font-label-sm text-xs text-[var(--color-outline)] uppercase tracking-wider select-none shrink-0">
          {label}
        </span>
      )}
      <div className="flex items-center flex-wrap gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {children}
      </div>
    </div>
  );
}

export interface SearchInterpretationProps {
  query: string;
  specialty?: string;
  location?: string;
  facilityType?: string;
  onLocationChange?: () => void;
  onEditSearch?: () => void;
  className?: string;
}

export function SearchInterpretation({
  query,
  specialty,
  location,
  facilityType,
  onLocationChange,
  onEditSearch,
  className,
}: SearchInterpretationProps) {
  return (
    <section
      className={cn(
        'bg-[var(--color-surface-container-low,#f2f3ff)] rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-xs)] flex flex-col gap-2.5',
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-start md:items-center gap-2 flex-wrap text-xs md:text-sm font-body">
          <div className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-label-sm text-xs font-semibold flex items-center gap-1 shrink-0">
            <TuneIcon size={12} />
            <span>Query Interpreted</span>
          </div>
          <span className="text-[var(--color-on-surface)]">
            MEDIMESH discovered {query ? `for "${query}": ` : ''}
            {specialty && (
              <span className="font-semibold text-[var(--color-primary)]">
                Specialty: {specialty}{' '}
              </span>
            )}
            {facilityType && (
              <span className="text-[var(--color-on-surface)] font-medium">
                · {facilityType}{' '}
              </span>
            )}
            {location && (
              <span className="text-[var(--color-on-surface-variant)]">
                · Location: <strong className="text-[var(--color-on-surface)] font-semibold">{location}</strong>
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto text-xs font-label-md">
          {onLocationChange && (
            <button
              type="button"
              onClick={onLocationChange}
              className="text-[var(--color-primary)] font-semibold hover:underline cursor-pointer"
            >
              Change location
            </button>
          )}
          {onLocationChange && onEditSearch && <span className="text-[var(--color-outline-variant)]">·</span>}
          {onEditSearch && (
            <button
              type="button"
              onClick={onEditSearch}
              className="text-[var(--color-primary)] font-semibold hover:underline cursor-pointer"
            >
              Edit query
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[var(--color-on-surface-variant)] font-body">
        <InfoIcon size={14} className="text-[var(--color-outline)] shrink-0" />
        <span className="leading-snug">
          Transparency notice: Query interpretation discovers matching facilities and directories. MEDIMESH does not provide medical diagnosis, clinical triaging, or physician referral.
        </span>
      </div>
    </section>
  );
}

export interface SearchFilterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  count?: number;
  hasDropdown?: boolean;
  onClear?: (e: React.MouseEvent) => void;
}

export function SearchFilterButton({
  label,
  icon,
  active = false,
  count,
  hasDropdown = false,
  onClear,
  className,
  onClick,
  ...props
}: SearchFilterButtonProps) {
  if (active && onClear) {
    return (
      <div
        className={cn(
          'shrink-0 inline-flex items-center rounded-[var(--radius-md)] font-label-md text-xs md:text-sm font-semibold transition-all select-none shadow-sm',
          'bg-[var(--color-primary)] text-[var(--color-on-primary)]',
          className
        )}
      >
        <button
          type="button"
          onClick={onClick}
          className="px-3 py-1.5 flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] rounded-l-[var(--radius-md)] cursor-pointer"
          {...props}
        >
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{label}</span>
          {count !== undefined && count > 0 && (
            <span className="px-1.5 py-0.2 rounded-full font-numeric-data text-[10px] font-bold bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
              {count}
            </span>
          )}
          {hasDropdown && <ChevronDownIcon size={14} className="opacity-70" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear(e);
          }}
          aria-label={`Clear ${label} filter`}
          className="p-1.5 hover:bg-black/20 rounded-r-[var(--radius-md)] pr-2 cursor-pointer inline-flex items-center justify-center focus-visible:outline-none"
        >
          <CloseIcon size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 px-3 py-1.5 rounded-[var(--radius-md)] font-label-md text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all select-none cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        active
          ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm'
          : 'bg-[var(--color-surface-container-low,#f2f3ff)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]',
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            'px-1.5 py-0.2 rounded-full font-numeric-data text-[10px] font-bold',
            active
              ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]'
              : 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]'
          )}
        >
          {count}
        </span>
      )}
      {hasDropdown && <ChevronDownIcon size={14} className="opacity-70" />}
    </button>
  );
}

export interface GlobalSearchProps {
  onSearch?: (query: string) => void;
  suggestions?: string[];
  onSelectSuggestion?: (s: string) => void;
  className?: string;
}

export function GlobalSearch({
  onSearch,
  suggestions = [
    'Cardiologist near me',
    'Hospitals with MRI',
    'Orthopedic in Pune',
    'PM-JAY Empaneled',
    'ICU Casualty',
  ],
  onSelectSuggestion,
  className,
}: GlobalSearchProps) {
  const [query, setQuery] = React.useState('');

  const handleSearch = (val: string) => {
    onSearch?.(val);
  };

  return (
    <div className={cn('flex flex-col gap-3 w-full max-w-2xl mx-auto', className)}>
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        onSubmitSearch={handleSearch}
        placeholder="Search by symptom, specialty, procedure, or hospital name..."
      />

      {suggestions.length > 0 && (
        <SearchSuggestionGroup>
          {suggestions.map((s) => (
            <SearchSuggestion
              key={s}
              onClick={() => {
                setQuery(s);
                onSelectSuggestion?.(s);
              }}
            >
              {s}
            </SearchSuggestion>
          ))}
        </SearchSuggestionGroup>
      )}
    </div>
  );
}
