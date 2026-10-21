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
      'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
    );
  });

  it('treats a missing response as a network error even without the "Network Error" message (e.g. a timeout)', () => {
    const error = { code: 'ECONNABORTED', message: 'timeout of 30000ms exceeded' };
    expect(getApiErrorMessage(error, 'رمز التحقق غير صحيح')).toBe(
      'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
    );
  });

  // A deploy restarts the API; the proxy answers 502 with an HTML page
  it.each([502, 503, 504])(
    'a %d from the proxy says the service is briefly unavailable',
    (status) => {
      const error = {
        message: `Request failed with status code ${status}`,
        response: { status, data: '<html>Bad Gateway</html>' },
      };
      expect(getApiErrorMessage(error, 'حدث خطأ أثناء معالجة الدفع.')).toBe(
        'الخدمة غير متاحة مؤقتاً، يرجى المحاولة مرة أخرى بعد قليل.',
      );
    },
  );

  it("Nest's English default 500 is replaced, a 500 with our own message is kept", () => {
    expect(
      getApiErrorMessage(
        { response: { status: 500, data: { message: 'Internal server error' } } },
        'fallback',
      ),
    ).toBe('الخدمة غير متاحة مؤقتاً، يرجى المحاولة مرة أخرى بعد قليل.');
    expect(
      getApiErrorMessage(
        { response: { status: 500, data: { message: 'حدث خطأ أثناء الاتصال ببوابة الدفع Tap' } } },
        'fallback',
      ),
    ).toBe('حدث خطأ أثناء الاتصال ببوابة الدفع Tap');
  });

  it('handles a nullish/malformed error without throwing', () => {
    expect(getApiErrorMessage(null, 'fallback')).toBe(
      'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
    );
    expect(getApiErrorMessage(undefined, 'fallback')).toBe(
      'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
    );
  });
});
