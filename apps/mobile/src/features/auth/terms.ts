import { create } from 'zustand';

import { showAlert } from '@/shared/utils/alert';

/**
 * «أوافق على شروط الاستخدام وسياسة الخصوصية» on the sign-in and sign-up
 * screens (App Store Guideline 1.2: the terms are agreed to before
 * registering or logging in). One tick for every form and tab of a visit;
 * it starts unticked each time the app opens.
 */
interface TermsAgreementState {
  accepted: boolean;
  setAccepted: (accepted: boolean) => void;
}

export const useTermsAgreement = create<TermsAgreementState>((set) => ({
  accepted: false,
  setAccepted: (accepted) => set({ accepted }),
}));

/**
 * Whether sign-in or sign-up may go on: true once the terms are ticked,
 * otherwise says why and returns false.
 */
export function requireTermsAccepted(): boolean {
  if (useTermsAgreement.getState().accepted) return true;
  showAlert(
    'الموافقة على الشروط',
    'يجب الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة',
  );
  return false;
}
