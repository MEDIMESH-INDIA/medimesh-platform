'use client';

/**
 * MEDIMESH INDIA 2.0 — Correction Modal Dialog
 *
 * Phase 07: Corrections + Trust
 *
 * Dialog wrapper presenting the CorrectionForm to authenticated users.
 */

import React from 'react';
import { Dialog } from '@/design-system/primitives/dialog';
import { CorrectionForm, type CorrectionFormProps } from './correction-form.tsx';

export interface CorrectionModalProps extends CorrectionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CorrectionModal({
  isOpen,
  onClose,
  targetEntityType,
  targetEntityId,
  targetTitle,
  initialField,
  onSuccess,
}: CorrectionModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Report an Information Issue"
      description="Notice a factual discrepancy? Submit documented corrections for verification."
      size="lg"
    >
      <CorrectionForm
        targetEntityType={targetEntityType}
        targetEntityId={targetEntityId}
        targetTitle={targetTitle}
        initialField={initialField}
        onSuccess={() => {
          onSuccess?.();
          onClose();
        }}
        onCancel={onClose}
      />
    </Dialog>
  );
}
