const NETWORK_ERROR_MESSAGE =
  'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
export const SERVER_UNAVAILABLE_MESSAGE =
  'الخدمة غير متاحة مؤقتاً، يرجى المحاولة مرة أخرى بعد قليل.';
// Nest's answer to an unhandled error; English, and says nothing useful
const NEST_DEFAULT_500 = 'Internal server error';

/**
 * Extracts a user-facing message from a failed API call, distinguishing a
 * genuine network failure (request never reached the server -- offline,
 * airplane mode, timeout) from a real backend error response. Without this,
 * a dropped connection falls through to whatever generic fallback message
 * the caller passes (e.g. "invalid verification code"), which misleads the
 * user into thinking their input was wrong rather than their network.
 */
export function getApiErrorMessage(error: any, fallbackMessage: string): string {
  if (error?.message === 'Network Error' || !error?.response) {
    return NETWORK_ERROR_MESSAGE;
  }
  const status: number | undefined = error.response?.status;
  const message = error.response?.data?.message;
  if (message && message !== NEST_DEFAULT_500) {
    return Array.isArray(message) ? message.join('\n') : message;
  }
  // The server failed or couldn't be reached behind the proxy (502/503/504
  // while the API restarts on a deploy): not the user's doing, and the
  // caller's fallback (e.g. "payment failed") would mislead
  if (status !== undefined && status >= 500) {
    return SERVER_UNAVAILABLE_MESSAGE;
  }
  return fallbackMessage;
}
