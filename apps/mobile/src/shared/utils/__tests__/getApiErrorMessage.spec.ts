import { getApiErrorMessage } from '../getApiErrorMessage';

describe('getApiErrorMessage', () => {
  it('returns the backend message when a response came back', () => {
    const error = { response: { data: { message: 'رمز التحقق غير صحيح' } } };
    expect(getApiErrorMessage(error, 'fallback')).toBe('رمز التحقق غير صحيح');
  });

  it('joins an array of backend messages with newlines', () => {
    const error = { response: { data: { message: ['خطأ 1', 'خطأ 2'] } } };
    expect(getApiErrorMessage(error, 'fallback')).toBe('خطأ 1\nخطأ 2');
  });

  it('falls back to the caller-provided message when a response has no message', () => {
    const error = { response: { data: {} } };
    expect(getApiErrorMessage(error, 'fallback message')).toBe('fallback message');
  });

  // The exact bug this exists to prevent: a dropped connection must never
  // be reported using a caller's domain-specific fallback (e.g. "invalid
  // verification code") -- it has nothing to do with what the user typed.
  it('returns the network-error message when there is no response at all', () => {
    const error = { message: 'Network Error', request: {} };
    expect(getApiErrorMessage(error, 'رمز التحقق غير صحيح')).toBe(
      'فشل الاتصال بالخادم. يرجى التأكد من تشغيل الـ API والاتصال بالشبكة.',
    );
  });

  it('treats a missing response as a network error even without the "Network Error" message (e.g. a timeout)', () => {
    const error = { code: 'ECONNABORTED', message: 'timeout of 30000ms exceeded' };
    expect(getApiErrorMessage(error, 'رمز التحقق غير صحيح')).toBe(
      'فشل الاتصال بالخادم. يرجى التأكد من تشغيل الـ API والاتصال بالشبكة.',
    );
  });

  it('handles a nullish/malformed error without throwing', () => {
    expect(getApiErrorMessage(null, 'fallback')).toBe(
      'فشل الاتصال بالخادم. يرجى التأكد من تشغيل الـ API والاتصال بالشبكة.',
    );
    expect(getApiErrorMessage(undefined, 'fallback')).toBe(
      'فشل الاتصال بالخادم. يرجى التأكد من تشغيل الـ API والاتصال بالشبكة.',
    );
  });
});
