import type { AxiosResponse } from 'axios';

import apiClient from '@/shared/api/api';
import { showAlert } from '@/shared/utils/alert';

/**
 * Thrown when the user answers "no" to reactivating early: the sign-in
 * stops quietly and they stay on the login screen.
 */
export class ReactivationDeclinedError extends Error {
  constructor() {
    super('reactivation declined');
    this.name = 'ReactivationDeclinedError';
  }
}

export function isReactivationDeclined(error: unknown): boolean {
  return error instanceof ReactivationDeclinedError;
}

function askToReactivate(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    showAlert('الحساب معطل مؤقتاً', message, [
      { text: 'لا', style: 'cancel', onPress: () => resolve(false) },
      { text: 'نعم، إعادة التفعيل', onPress: () => resolve(true) },
    ]);
  });
}

/**
 * Wraps a sign-in call (password, Google, Apple). When the account was
 * deactivated for a period that hasn't ended, the API answers 409
 * ACCOUNT_SCHEDULED_DEACTIVATION with the days left and a ticket; this asks
 * the user, and on "yes" finishes the sign-in through POST /auth/reactivate,
 * returning that login response in place of the original one.
 */
export async function withReactivationPrompt<T>(
  signIn: Promise<AxiosResponse<T>>,
): Promise<AxiosResponse<T>> {
  try {
    return await signIn;
  } catch (error: any) {
    const data = error?.response?.data;
    if (
      error?.response?.status !== 409 ||
      data?.code !== 'ACCOUNT_SCHEDULED_DEACTIVATION' ||
      !data?.reactivationTicket
    ) {
      throw error;
    }
    if (!(await askToReactivate(data.message))) {
      throw new ReactivationDeclinedError();
    }
    return apiClient.post<T>('/auth/reactivate', {
      ticket: data.reactivationTicket,
    });
  }
}
