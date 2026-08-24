import { AlertButton, useAlertStore } from '@/shared/store/useAlertStore';

export type { AlertButton };

/**
 * Drop-in replacement for RN's `Alert.alert(title, message?, buttons?)`.
 * Forwards only the arguments actually passed (not `undefined` placeholders
 * for omitted ones) so tests spying on the store action can assert exact
 * call signatures, matching how `Alert.alert` itself would've been called.
 */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  const store = useAlertStore.getState();
  if (arguments.length >= 3) {
    store.showAlert(title, message, buttons);
  } else if (arguments.length === 2) {
    store.showAlert(title, message);
  } else {
    store.showAlert(title);
  }
}
