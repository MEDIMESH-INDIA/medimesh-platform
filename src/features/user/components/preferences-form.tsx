'use client';

/**
 * MEDIMESH INDIA 2.0 — Platform Preferences Form
 *
 * Implements Section 6 & Section 22 of Phase 06 Specification:
 * - Location semantics: SELECTED, APPROXIMATE, ACTUAL (coarse city/state only, NO pinCode, NO GPS coordinates).
 * - Language: preferredLanguage (English default).
 * - Accessibility: preferences the app honors (reduced motion, larger text, high contrast).
 * - Platform communication: emailUpdates, serviceAnnouncements.
 */

import React, { useState } from 'react';
import type { UserPreference, LocationPreferenceMode } from '../domain/index.ts';
import { Button } from '@/design-system/primitives/button';
import { useToast } from '@/design-system/primitives/toast';
import {
  LocationIcon,
  CheckIcon,
} from '@/components/global/icons';

export interface PreferencesFormProps {
  initialPreferences: UserPreference;
  onSave?: (updated: UserPreference) => Promise<void>;
  className?: string;
}

export function PreferencesForm({
  initialPreferences,
  onSave,
  className,
}: PreferencesFormProps) {
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<UserPreference>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  const handleLocationModeChange = (mode: LocationPreferenceMode) => {
    setPrefs((prev) => ({ ...prev, locationMode: mode }));
  };

  const handleAccessibilityToggle = (key: 'reduceMotion' | 'largerText' | 'highContrast') => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Apply immediate class toggle on html element for client demonstration
      if (typeof document !== 'undefined') {
        if (key === 'reduceMotion') {
          document.documentElement.classList.toggle('prefers-reduced-motion', next.reduceMotion);
        } else if (key === 'largerText') {
          document.documentElement.classList.toggle('larger-text', next.largerText);
        } else if (key === 'highContrast') {
          document.documentElement.classList.toggle('high-contrast', next.highContrast);
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(prefs);
      }
      showToast('Discovery preferences saved to your account', 'success');
    } catch {
      showToast('Failed to save preferences. Please try again.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-6">
        {/* 1. Location Preferences */}
        <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 flex flex-col gap-4 shadow-[var(--shadow-xs)]">
          <div className="flex items-center gap-2">
            <LocationIcon size={20} className="text-[var(--color-primary)]" />
            <div>
              <h3 className="font-heading text-base font-bold text-[var(--color-on-surface)]">
                Location Preference
              </h3>
              <p className="text-xs text-[var(--color-on-surface-variant)]">
                Coarse reference location used for proximity sorting during public discovery.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {(['SELECTED', 'APPROXIMATE', 'ACTUAL'] as LocationPreferenceMode[]).map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => handleLocationModeChange(mode)}
                className={`p-3 rounded-[var(--radius-md)] border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  prefs.locationMode === mode
                    ? 'border-[var(--color-primary)] bg-[var(--color-surface-container-low)] text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]'
                    : 'border-[var(--color-border-default)] hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">{mode}</span>
                  {prefs.locationMode === mode && <CheckIcon size={14} />}
                </div>
                <span className="text-[11px] text-[var(--color-on-surface-variant)] leading-tight">
                  {mode === 'SELECTED' && 'Manually selected city/state'}
                  {mode === 'APPROXIMATE' && 'Approximate coarse region'}
                  {mode === 'ACTUAL' && 'Device coarse city (No GPS)'}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1 pt-3 border-t border-[var(--color-border-subtle)]">
            <div>
              <label htmlFor="pref-city" className="block text-xs font-semibold text-[var(--color-on-surface)] mb-1">
                Preferred City
              </label>
              <input
                id="pref-city"
                type="text"
                value={prefs.locationCity || ''}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    locationCity: e.target.value,
                    locationDisplayName: e.target.value
                      ? `${e.target.value}, ${p.locationState || ''}`
                      : p.locationDisplayName,
                  }))
                }
                placeholder="e.g. Bengaluru"
                className="w-full px-3 py-2 text-xs md:text-sm rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-on-surface)] focus:outline-[var(--color-primary)]"
              />
            </div>

            <div>
              <label htmlFor="pref-state" className="block text-xs font-semibold text-[var(--color-on-surface)] mb-1">
                Preferred State
              </label>
              <input
                id="pref-state"
                type="text"
                value={prefs.locationState || ''}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    locationState: e.target.value,
                    locationDisplayName: p.locationCity
                      ? `${p.locationCity}, ${e.target.value}`
                      : p.locationDisplayName,
                  }))
                }
                placeholder="e.g. Karnataka"
                className="w-full px-3 py-2 text-xs md:text-sm rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-on-surface)] focus:outline-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>

        {/* 2. Accessibility Preferences */}
        <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 flex flex-col gap-4 shadow-[var(--shadow-xs)]">
          <div>
            <h3 className="font-heading text-base font-bold text-[var(--color-on-surface)]">
              Accessibility Settings
            </h3>
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              Preferences honored directly across the platform interface.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-container-low)] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[var(--color-on-surface)] block">
                  Reduced Motion
                </span>
                <span className="text-[11px] text-[var(--color-on-surface-variant)]">
                  Minimizes transitions and animated effects.
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.reduceMotion}
                onChange={() => handleAccessibilityToggle('reduceMotion')}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-container-low)] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[var(--color-on-surface)] block">
                  Larger Text Scaling
                </span>
                <span className="text-[11px] text-[var(--color-on-surface-variant)]">
                  Increases base body typography size for enhanced readability.
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.largerText}
                onChange={() => handleAccessibilityToggle('largerText')}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-container-low)] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[var(--color-on-surface)] block">
                  High Contrast Mode
                </span>
                <span className="text-[11px] text-[var(--color-on-surface-variant)]">
                  Maximizes text border contrast for daylight legibility.
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.highContrast}
                onChange={() => handleAccessibilityToggle('highContrast')}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
            </label>
          </div>
        </div>

        {/* 3. Platform Communication Toggles */}
        <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 flex flex-col gap-4 shadow-[var(--shadow-xs)]">
          <div>
            <h3 className="font-heading text-base font-bold text-[var(--color-on-surface)]">
              Platform Communications
            </h3>
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              Platform-level notifications only. Zero promotional medical marketing or doctor outreach.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-container-low)] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[var(--color-on-surface)] block">
                  Saved Information Updates
                </span>
                <span className="text-[11px] text-[var(--color-on-surface-variant)]">
                  Receive informational notifications when saved directory records are updated.
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.emailUpdates}
                onChange={() => setPrefs((p) => ({ ...p, emailUpdates: !p.emailUpdates }))}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-container-low)] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[var(--color-on-surface)] block">
                  Platform &amp; Service Announcements
                </span>
                <span className="text-[11px] text-[var(--color-on-surface-variant)]">
                  Important platform notices regarding scheduled maintenance or directory releases.
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.serviceAnnouncements}
                onChange={() => setPrefs((p) => ({ ...p, serviceAnnouncements: !p.serviceAnnouncements }))}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            className="px-6 font-semibold"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </form>
  );
}
