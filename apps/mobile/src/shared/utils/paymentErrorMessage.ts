import { getApiErrorMessage } from './getApiErrorMessage';

const PAYMENT_FAILED_MESSAGE = 'حدث خطأ أثناء معالجة الدفع.';

/**
 * What a failed checkout tells the user. A failed API call goes through
 * getApiErrorMessage (server message, network, or service unavailable); an
 * Error the checkout threw itself (e.g. no payment link came back) already
 * carries Arabic text for the user. Never axios' English
 * "Request failed with status code …".
 */
export function paymentErrorMessage(error: unknown): string {
  const apiError = error as { isAxiosError?: boolean; response?: unknown };
  if (apiError?.isAxiosError || apiError?.response) {
    return getApiErrorMessage(error, PAYMENT_FAILED_MESSAGE);
  }
  if (error instanceof Error && error.message) return error.message;
  return PAYMENT_FAILED_MESSAGE;
}
