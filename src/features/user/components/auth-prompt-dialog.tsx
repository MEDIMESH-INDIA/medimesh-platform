'use client';

/**
 * MEDIMESH INDIA 2.0 — Logged-Out Save Authentication Prompt
 *
 * Implements Section 15 of Phase 06 Specification:
 * - Presented when an unauthenticated user selects "Save" on a public discovery item.
 * - Non-manipulative, calm language: "Sign in to save this information to your MEDIMESH account."
 * - Offers single-click synthetic demo sign-in ("Continue as Demo User 001") for seamless evaluation.
 * - Allows dismissing without blocking public browsing.
 */

import React from 'react';
import { Dialog, DialogFooter } from '@/design-system/primitives/dialog';
import { Button } from '@/design-system/primitives/button';
import { useAuth } from '../auth/auth-context';
import { BookmarkIcon, ShieldIcon } from '@/components/global/icons';

export interface AuthPromptDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export function AuthPromptDialog({
  isOpen,
  onClose,
  onSuccess,
  title = 'Save to MEDIMESH',
  description = 'Sign in to save this information to your MEDIMESH account.',
}: AuthPromptDialogProps) {
  const { isPromptOpen, closeAuthPrompt, signIn } = useAuth();

  const open = isOpen !== undefined ? isOpen : isPromptOpen;
  const handleClose = onClose || closeAuthPrompt;

  const handleDemoSignIn = async () => {
    await signIn('user-demo-001');
    handleClose();
    onSuccess?.();
  };

  return (
    <Dialog
      isOpen={open}
      onClose={handleClose}
      title={title}
      description={description}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
            <BookmarkIcon size={20} />
          </div>
          <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
            Create a personal discovery baseline to retain saved facilities, specialty programs, tariffs, and side-by-side comparisons.
          </p>
        </div>

        <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] flex items-start gap-2.5">
          <ShieldIcon size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
            Your account personalizes discovery and preferences. It does not store medical records, clinical charts, diagnoses, or prescriptions.
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2 -mx-4 -mb-4 md:-mx-6 md:-mb-6">
          <Button
            variant="outline"
            size="md"
            onClick={handleClose}
            className="w-full sm:w-auto flex-1 order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleDemoSignIn}
            className="w-full sm:w-auto flex-1 order-1 sm:order-2 font-semibold"
          >
            Continue as Demo User 001
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
