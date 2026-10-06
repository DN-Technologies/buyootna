import { useState } from 'react';

export type DeleteStep = 'confirm' | 'reason';
export type DeleteReason = 'SOLD' | 'OTHER';

// Step + reason state of the delete sheet: 'confirm' (step 1) then
// 'reason' (step 2, SOLD or a free-text OTHER reason)
export function useDeleteReason() {
  const [step, setStep] = useState<DeleteStep>('confirm');
  const [selectedReason, setSelectedReason] = useState<DeleteReason | null>(
    null,
  );
  const [customReason, setCustomReason] = useState('');

  const isSubmitActive =
    selectedReason === 'SOLD' ||
    (selectedReason === 'OTHER' && customReason.trim().length > 0);

  // What onConfirm receives: 'SOLD', or the typed reason
  const finalReason = selectedReason === 'SOLD' ? 'SOLD' : customReason;

  const reset = () => {
    setStep('confirm');
    setSelectedReason(null);
    setCustomReason('');
  };

  return {
    step,
    setStep,
    selectedReason,
    setSelectedReason,
    customReason,
    setCustomReason,
    isSubmitActive,
    finalReason,
    reset,
  };
}
