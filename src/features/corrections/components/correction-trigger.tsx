'use client';

/**
 * MEDIMESH INDIA 2.0 — Public Correction Action Trigger
 *
 * Phase 07: Corrections + Trust
 *
 * Entry point for reporting an inaccuracy on any public healthcare detail view.
 * Handles authenticated-only interception:
 * - If authenticated: opens CorrectionModal.
 * - If unauthenticated: invokes AuthPromptDialog with clear boundary language,
 *   and seamlessly transitions into CorrectionModal upon sign-in.
 */

import React, { useState } from 'react';
import { Button, type ButtonVariant, type ButtonSize } from '@/design-system/primitives/button';
import { FlagIcon } from '@/components/global/icons';
import { useAuth, AuthPromptDialog } from '@/features/user';
import type { CorrectionTargetEntityType } from '../domain/types.ts';
import { CorrectionModal } from './correction-modal.tsx';

export interface CorrectionTriggerProps {
  targetEntityType: CorrectionTargetEntityType;
  targetEntityId: string;
  targetTitle: string;
  initialField?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export function CorrectionTrigger({
  targetEntityType,
  targetEntityId,
  targetTitle,
  initialField,
  variant = 'outline',
  size = 'sm',
  label = 'Notice an inaccuracy? Report an information issue',
  className,
  showIcon = true,
}: CorrectionTriggerProps) {
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

  const handleTriggerClick = () => {
    if (isAuthenticated) {
      setIsModalOpen(true);
    } else {
      setIsAuthPromptOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthPromptOpen(false);
    // Smoothly open correction modal immediately after sign in
    setTimeout(() => {
      setIsModalOpen(true);
    }, 150);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleTriggerClick}
        className={className}
        aria-label={`Report an information issue for ${targetTitle}`}
      >
        {showIcon && <FlagIcon size={14} className="text-[var(--color-outline)] shrink-0" />}
        <span>{label}</span>
      </Button>

      {/* Auth Interception Dialog */}
      <AuthPromptDialog
        isOpen={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        onSuccess={handleAuthSuccess}
        title="Sign in to report an information issue"
        description="Sign-in identifies you as the submitter; the information issue is reviewed separately before any published information is changed."
      />

      {/* Main Correction Modal */}
      <CorrectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetEntityType={targetEntityType}
        targetEntityId={targetEntityId}
        targetTitle={targetTitle}
        initialField={initialField}
      />
    </>
  );
}
