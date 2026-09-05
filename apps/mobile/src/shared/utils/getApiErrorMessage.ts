const NETWORK_ERROR_MESSAGE =
  'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';

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
  const message = error.response?.data?.message;
  if (message) {
    return Array.isArray(message) ? message.join('\n') : message;
  }
  return fallbackMessage;
}
