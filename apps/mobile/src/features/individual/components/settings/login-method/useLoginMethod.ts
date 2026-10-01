import { useEffect, useRef, useState } from 'react';

import {
  type LoginMethod,
  type LoginMethodResponse,
  settingsService,
} from '@/shared/api/settings.service';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import {
  NO_EMAIL_MESSAGE,
  PHONE_NOT_VERIFIED_MESSAGE,
  SAVED_MESSAGE,
  WARNING_MS,
} from './constants';

/**
 * The sheet's state: load the current method when it opens, pick one (an
 * unverified phone or a missing email only explains why), and save.
 */
export function useLoginMethod({
  dismiss,
  onSaved,
}: {
  dismiss: () => void;
  onSaved: (message: string) => void;
}) {
  const [data, setData] = useState<LoginMethodResponse | null>(null);
  const [selected, setSelected] = useState<LoginMethod>('BOTH');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showWarning = (message: string) => {
    setWarning(message);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    warningTimer.current = setTimeout(() => setWarning(null), WARNING_MS);
  };

  useEffect(
    () => () => {
      if (warningTimer.current) clearTimeout(warningTimer.current);
    },
    [],
  );

  // Fresh state every time the sheet opens
  const load = async () => {
    setData(null);
    setLoadError(null);
    setWarning(null);
    try {
      const current = await settingsService.getLoginMethod();
      setData(current);
      setSelected(current.loginMethod);
    } catch (e) {
      setLoadError(getApiErrorMessage(e, 'تعذر تحميل طريقة تسجيل الدخول'));
    }
  };

  const choose = (method: LoginMethod) => {
    if (method === 'PHONE' && !data?.phoneVerified) {
      showWarning(PHONE_NOT_VERIFIED_MESSAGE);
      return;
    }
    if (method === 'EMAIL' && !data?.email) {
      showWarning(NO_EMAIL_MESSAGE);
      return;
    }
    setSelected(method);
  };

  const save = async () => {
    if (!data || isSaving) return;
    if (selected === data.loginMethod) {
      dismiss();
      return;
    }
    setIsSaving(true);
    try {
      const result = await settingsService.setLoginMethod(selected);
      dismiss();
      onSaved(result.message ?? SAVED_MESSAGE);
    } catch (e) {
      showWarning(getApiErrorMessage(e, 'تعذر حفظ طريقة تسجيل الدخول'));
    } finally {
      setIsSaving(false);
    }
  };

  return { data, selected, loadError, isSaving, warning, load, choose, save };
}
