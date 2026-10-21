import { paymentErrorMessage } from '../paymentErrorMessage';

describe('paymentErrorMessage', () => {
  it('a 502 while the API restarts: service unavailable, not the axios text', () => {
    const error = {
      isAxiosError: true,
      message: 'Request failed with status code 502',
      response: { status: 502, data: '<html>Bad Gateway</html>' },
    };
    expect(paymentErrorMessage(error)).toBe(
      'الخدمة غير متاحة مؤقتاً، يرجى المحاولة مرة أخرى بعد قليل.',
    );
  });

  it("the server's own message is shown", () => {
    const error = {
      isAxiosError: true,
      response: { status: 400, data: { message: 'الباقة غير موجودة أو غير نشطة' } },
    };
    expect(paymentErrorMessage(error)).toBe('الباقة غير موجودة أو غير نشطة');
  });

  it('no connection: the network message', () => {
    expect(
      paymentErrorMessage({ isAxiosError: true, message: 'Network Error' }),
    ).toBe('يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
  });

  it("the checkout's own Error keeps its text", () => {
    expect(
      paymentErrorMessage(new Error('لم يتم استلام رابط الدفع من بوابة الدفع.')),
    ).toBe('لم يتم استلام رابط الدفع من بوابة الدفع.');
  });

  it('anything else: the generic payment message', () => {
    expect(paymentErrorMessage(undefined)).toBe('حدث خطأ أثناء معالجة الدفع.');
  });
});
