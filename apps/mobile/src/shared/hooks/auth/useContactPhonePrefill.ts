import { useEffect, useRef } from 'react';

import { contactPhoneService } from '@/shared/api/contactPhone.service';
import { localPhone } from '@/shared/hooks/verification/usePhoneVerification';

/**
 * Starts a new ad's phone field on the active persona's contact number (its
 * own, or the account's) instead of an empty or made-up one. Only fills an
 * empty field, once, so an edited ad or a typed number is never overwritten.
 */
export function useContactPhonePrefill(
  current: string,
  setPhone: (phone: string) => void,
) {
  const done = useRef(false);

  useEffect(() => {
    if (done.current || current) return;
    done.current = true;
    contactPhoneService
      .get()
      .then((s) => {
        const phone = localPhone(s.effectivePhone);
        if (phone) setPhone(phone);
      })
      .catch(() => undefined);
  }, [current, setPhone]);
}
